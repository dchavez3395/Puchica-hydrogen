// scripts/apply-curated-tag.mjs
//
// Apply the `featured-image-curated` tag to the products discovered
// by `scripts/find-curated-products.mjs`. Once tagged, the homepage
// GraphQL queries in app/routes/_index.jsx filter to those products
// via `query: "tag:featured-image-curated"`.
//
// WHY A TAG AND NOT A METAFIELD:
//   - Free, queryable via `tag:foo` in Storefront API GraphQL
//   - Trivially batch-applied (10 per productUpdate mutation)
//   - Reversible: removing the tag restores prior behavior
//
// WHAT THIS SCRIPT DOES:
//   1. Read puchica-curated-products.json (the output of
//      find-curated-products.mjs).
//   2. For each product, fetch current tags and check if the curated
//      tag is already present. Idempotent: re-running skips done rows.
//   3. For products that need tagging, batch 10 per productUpdate
//      mutation (matching the pattern in batch-update-images.mjs).
//      We add the tag to the existing tags list — we don't replace.
//   4. Write a checkpoint after each batch so a crashed run resumes
//      from the right place.
//
// USAGE:
//   node scripts/apply-curated-tag.mjs                       # live run
//   node scripts/apply-curated-tag.mjs --dry-run            # plan only
//   node scripts/apply-curated-tag.mjs --remove             # remove the tag
//                                                          (used for rollback)
//   node scripts/apply-curated-tag.mjs --input alt.json     # custom input
//
// AUTH: same path as batch-update-images.mjs — read SHOPIFY_CLIENT_ID
// and SHOPIFY_CLIENT_SECRET from .env, exchange for an Admin API
// access token via scripts/shopify-oauth.mjs. Required scope:
// write_products (already present per .env.audit.md).
//
// API: Admin API 2026-04.

import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {getAdminToken} from './shopify-oauth.mjs';

const TAG = 'featured-image-curated';

// -- CLI args --------------------------------------------------------------

const args = process.argv.slice(2);
function argValue(name) {
  const eq = args.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.split('=')[1];
  const i = args.indexOf(`--${name}`);
  if (i >= 0 && args[i + 1] && !args[i + 1].startsWith('--')) return args[i + 1];
  return undefined;
}

const INPUT_PATH = argValue('input') ?? 'puchica-curated-products.json';
const RESUME_PATH = argValue('resume') ?? 'apply-curated-tag-checkpoint.json';
const BATCH_SIZE = 10;
const dryRun = args.includes('--dry-run');
const removeMode = args.includes('--remove');

const STORE = process.env.PUBLIC_STORE_DOMAIN ?? 'ug91ve-sz.myshopify.com';
const API_VERSION = '2026-04';
const endpoint = `https://${STORE}/admin/api/${API_VERSION}/graphql.json`;

if (!existsSync(INPUT_PATH)) {
  console.error(`Missing input: ${INPUT_PATH}`);
  console.error('Run scripts/find-curated-products.mjs first to generate it.');
  process.exit(2);
}

// -- Auth ------------------------------------------------------------------

const TOKEN = await getAdminToken();

// -- Throttling ------------------------------------------------------------

const rateLimit = {
  currentlyAvailable: 2000,
  restoreRate: 100,
  maximumAvailable: 2000,
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForBucket(queryCost) {
  while (rateLimit.currentlyAvailable < queryCost) {
    const deficit = queryCost - rateLimit.currentlyAvailable;
    const ms = Math.max(50, Math.ceil((deficit / rateLimit.restoreRate) * 1000));
    await sleep(ms);
  }
}

function updateBucketFromResponse(json) {
  const t = json?.extensions?.cost?.throttleStatus;
  if (t) {
    rateLimit.currentlyAvailable = t.currentlyAvailable ?? rateLimit.currentlyAvailable;
    rateLimit.restoreRate = t.restoreRate ?? rateLimit.restoreRate;
    rateLimit.maximumAvailable = t.maximumAvailable ?? rateLimit.maximumAvailable;
  }
}

async function admin(query, variables, {retries = 4, queryCost = 10} = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    await waitForBucket(queryCost);
    let res;
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': TOKEN,
        },
        body: JSON.stringify({query, variables}),
      });
    } catch (e) {
      lastErr = e;
      if (attempt < retries) {
        await sleep(500 * Math.pow(2, attempt));
        continue;
      }
      throw e;
    }
    const json = await res.json();
    updateBucketFromResponse(json);
    const errs = Array.isArray(json.errors) ? json.errors : [];
    if (errs.length) {
      const throttled =
        errs.some((e) => /throttl/i.test(e?.message ?? '')) || res.status === 429;
      if (throttled && attempt < retries) {
        await waitForBucket(queryCost);
        continue;
      }
      lastErr = new Error(JSON.stringify(errs, null, 2));
      break;
    }
    return json.data;
  }
  throw lastErr ?? new Error('admin: exhausted retries');
}

// -- Read current tags for one product -------------------------------------

async function fetchCurrentTags(productId) {
  const data = await admin(
    `query($id: ID!) { product(id: $id) { tags } }`,
    {id: productId},
    {queryCost: 1},
  );
  return data?.product?.tags ?? [];
}

// -- Build update mutation (batched) ---------------------------------------

function buildTagMutation(count) {
  const fields = [];
  for (let i = 0; i < count; i++) {
    fields.push(`a${i}: productUpdate(input: $input${i}) {
      product { id tags }
      userErrors { field message }
    }`);
  }
  return `mutation(${Array.from({length: count}, (_, i) => `$input${i}: ProductInput!`).join(', ')}) {
  ${fields.join('\n  ')}
}`;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// -- Checkpoint ------------------------------------------------------------

function loadCheckpoint() {
  if (!existsSync(RESUME_PATH)) return {completed: []};
  try {
    const data = JSON.parse(readFileSync(RESUME_PATH, 'utf8'));
    return {completed: Array.isArray(data.completed) ? data.completed : []};
  } catch (e) {
    console.warn(`Failed to parse checkpoint at ${RESUME_PATH} (${e.message}) — starting fresh.`);
    return {completed: []};
  }
}

function saveCheckpoint(state) {
  try {
    writeFileSync(RESUME_PATH, JSON.stringify(state, null, 2));
  } catch (e) {
    console.warn(`Failed to write checkpoint to ${RESUME_PATH}: ${e.message}`);
  }
}

// -- Main ------------------------------------------------------------------

async function main() {
  console.log(`Store:    ${STORE}`);
  console.log(`API:      ${API_VERSION}`);
  console.log(`Input:    ${INPUT_PATH}`);
  console.log(`Tag:      ${TAG}`);
  console.log(`Mode:     ${removeMode ? 'REMOVE' : dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Batch:    ${BATCH_SIZE}`);
  console.log('');

  const input = JSON.parse(readFileSync(INPUT_PATH, 'utf8'));
  if (!Array.isArray(input)) {
    console.error('Input file is not an array of products.');
    process.exit(2);
  }
  console.log(`Input products: ${input.length}`);

  const checkpoint = loadCheckpoint();
  const completedSet = new Set(checkpoint.completed);
  const pending = input.filter((p) => !completedSet.has(p.id));
  console.log(`Already done:   ${input.length - pending.length} (from checkpoint)`);
  console.log(`To process:     ${pending.length}`);
  console.log('');

  if (dryRun) {
    // Just show the first 10 tag-update operations the script would do.
    const sample = pending.slice(0, 10);
    for (const row of sample) {
      const current = await fetchCurrentTags(row.id);
      const hasTag = current.includes(TAG);
      const action = hasTag
        ? 'SKIP (already tagged)'
        : removeMode ? 'REMOVE' : 'ADD';
      console.log(`  ${action}  ${row.handle}  current=[${current.join(', ')}]`);
    }
    if (pending.length > 10) {
      console.log(`  …and ${pending.length - 10} more`);
    }
    console.log('');
    console.log('Dry run — no mutations performed.');
    return;
  }

  if (pending.length === 0) {
    console.log('Nothing to do.');
    return;
  }

  // For each pending product, fetch current tags, compute the new tag
  // list, then batch the productUpdate calls. We do the fetch-current-
  // tags pass FIRST so we have a deterministic list of rows that need
  // an update, then we send the mutations in 10-product batches.
  const updates = [];
  console.log('Phase 1: fetching current tags...');
  for (let i = 0; i < pending.length; i++) {
    const row = pending[i];
    try {
      const current = await fetchCurrentTags(row.id);
      const hasTag = current.includes(TAG);
      if (removeMode) {
        if (!hasTag) {
          // already not tagged, nothing to do — but checkpoint it so we
          // don't refetch next run.
          completedSet.add(row.id);
          continue;
        }
        const next = current.filter((t) => t !== TAG);
        updates.push({id: row.id, handle: row.handle, tags: next});
      } else {
        if (hasTag) {
          // already tagged, nothing to do
          completedSet.add(row.id);
          continue;
        }
        const next = [...current, TAG];
        updates.push({id: row.id, handle: row.handle, tags: next});
      }
    } catch (e) {
      console.error(`  failed to read tags for ${row.handle}: ${e.message}`);
    }
    if ((i + 1) % 50 === 0) {
      process.stdout.write(`\r  ${i + 1}/${pending.length} products scanned, ${updates.length} need update`);
    }
  }
  process.stdout.write(`\r  ${pending.length}/${pending.length} products scanned, ${updates.length} need update\n`);
  console.log('');

  if (updates.length === 0) {
    console.log('All products are already in the desired state.');
    return;
  }

  console.log('Phase 2: applying tag updates in batches...');
  const batches = chunk(updates, BATCH_SIZE);
  const t0 = Date.now();
  let applied = 0;
  const failures = [];

  for (let bi = 0; bi < batches.length; bi++) {
    const batch = batches[bi];
    // Build the mutation to match THIS batch's actual size. The last
    // batch may have < BATCH_SIZE products; sending the full-size
    // mutation with null variables for the missing slots fails with
    // INVALID_VARIABLE.
    const mutation = buildTagMutation(batch.length);
    const variables = {};
    batch.forEach((row, i) => {
      variables[`input${i}`] = {id: row.id, tags: row.tags};
    });

    let data;
    try {
      data = await admin(mutation, variables, {queryCost: 10 * batch.length});
    } catch (e) {
      // Whole batch failed — checkpoint nothing, surface the error.
      console.error(`  batch ${bi + 1} failed entirely: ${e.message}`);
      for (const row of batch) {
        failures.push({productId: row.id, error: e.message});
      }
      continue;
    }

    for (let i = 0; i < batch.length; i++) {
      const row = batch[i];
      const result = data?.[`a${i}`];
      const userErrors = result?.userErrors ?? [];
      if (userErrors.length > 0) {
        failures.push({productId: row.id, error: userErrors.map((e) => e.message).join('; ')});
      } else {
        applied++;
        completedSet.add(row.id);
      }
    }

    saveCheckpoint({completed: [...completedSet]});

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    process.stdout.write(
      `\r  batch ${bi + 1}/${batches.length} applied=${applied} failed=${failures.length} (${elapsed}s)`,
    );
  }
  process.stdout.write('\n\n');

  console.log('Summary:');
  console.log(`  Applied:  ${applied}`);
  console.log(`  Failed:   ${failures.length}`);
  if (failures.length > 0) {
    console.log('Failures:');
    for (const f of failures.slice(0, 20)) {
      console.log(`  - ${f.productId}: ${f.error}`);
    }
    if (failures.length > 20) console.log(`  …and ${failures.length - 20} more`);
  }
  console.log('');
  console.log(`Checkpoint: ${RESUME_PATH}  (${completedSet.size} done)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
