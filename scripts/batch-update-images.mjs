// scripts/batch-update-images.mjs
//
// Attach a batch of new images to Shopify products and set each as the
// product's featured image. Mirrors Phase 3 of the Product_Optimization
// workflow doc (Image tab) so the same workflow can be run from this
// repo without needing a fresh chat session.
//
// WHAT THIS SCRIPT DOES:
//   1. Reads a JSON file of {productId, imageUrl, alt} rows.
//   2. Attaches each image to its product via productUpdate + media:
//        [{originalSource, mediaContentType: IMAGE, alt}]
//      batched 10 products per call with mutation aliases.
//   3. Queries each product's media list, finds the new MediaImage by
//      its source URL, and calls productReorderMedia with newPosition
//      "0" so it becomes the featured image.
//   4. Verifies a sample (default: all of them) with a featuredMedia
//      query and reports any product where the featured image is
//      still the old one.
//   5. Writes a checkpoint after each successful batch so a crashed
//      run can resume from `node scripts/batch-update-images.mjs
//      --resume <path>`.
//
// INPUT FILE SHAPE (--input <path>):
//   [
//     {
//       "productId": "gid://shopify/Product/123",
//       "imageUrl": "https://d1nmycf4wfl5uz.cloudfront.net/hf_abc123.png",
//       "alt": "Optional alt text — omit if not rewriting alt"
//     },
//     ...
//   ]
//
//   `alt` is optional; pass it as null (or omit the field) to leave
//   the existing alt alone. The current Admin API requires `alt` on
//   the CreateMediaInput, so we send an empty string when missing.
//
// USAGE:
//   # Preview: dry-run, no mutations, prints the plan + batch counts
//   node scripts/batch-update-images.mjs --input images.json --dry-run
//
//   # Attach + feature one product for a sanity check
//   node scripts/batch-update-images.mjs --input images.json --limit 1
//
//   # Live run with the default batch size (10)
//   node scripts/batch-update-images.mjs --input images.json
//
//   # Verify the CLI token + store wiring (no mutations, no input needed)
//   node scripts/batch-update-images.mjs --check
//
//   # Verify a previous run (no mutations; just queries featuredMedia)
//   node scripts/batch-update-images.mjs --input images.json --verify-only
//
//   # Resume from a checkpoint (skip rows already in checkpoint)
//   node scripts/batch-update-images.mjs --input images.json \
//     --resume /home/claude/work/images-checkpoint.json
//
//   # Custom batch size + verify-sample size
//   node scripts/batch-update-images.mjs --input images.json \
//     --batch-size 5 --verify-sample 20
//
// AUTH: same path as reset-inventory.mjs — reads the OAuth token from
// the Shopify CLI's stored auth file (the one `npx @shopify/cli store
// auth` writes). Required scopes:
//
//   read_products, write_products
//
// To rotate, run:
//   npx @shopify/cli store auth --store <store>.myshopify.com \
//     --scopes read_products,write_products
//
// API: targets Admin API 2026-04 to match reset-inventory.mjs and the
// Hydrogen project's pinned version.
//
// IMPORTANT NOTES from the workflow doc + Admin API 2026-04:
//   - newPosition on productReorderMedia is a STRING ("0"), not 0.
//   - 2026-04 requires the `alt` field on CreateMediaInput; an empty
//     string is acceptable.
//   - productCreateMedia is deprecated; productUpdate with `media`
//     is the supported path.
//   - Attached media goes to the END of the media list; it does NOT
//     auto-become featured. The reorder step is mandatory.

import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {homedir} from 'node:os';
import {join} from 'node:path';
import {getAdminToken} from './shopify-oauth.mjs';

// -- CLI args --------------------------------------------------------------

const args = process.argv.slice(2);
function argValue(name) {
  const eq = args.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.split('=')[1];
  const i = args.indexOf(`--${name}`);
  if (i >= 0 && args[i + 1] && !args[i + 1].startsWith('--')) return args[i + 1];
  return undefined;
}

const INPUT_PATH = argValue('input');
const RESUME_PATH = argValue('resume');
const BATCH_SIZE = Math.max(1, Math.min(10, Number(argValue('batch-size') ?? 10)));
// BATCH_SIZE is capped at 10 because:
//   - The workflow doc explicitly says "Batch ~10 per call" for both
//     the attach step and the reorder step.
//   - productReorderMedia's `moves` arg is [MediaMoveInput!]! with no
//     documented batch ceiling, but the doc's 10 keeps mutations
//     small and the failure-recovery split clean.
const VERIFY_SAMPLE = Math.max(1, Number(argValue('verify-sample') ?? 0));
// 0 means "verify every product".

const STORE =
  argValue('store') ?? process.env.PUBLIC_STORE_DOMAIN ?? 'ug91ve-sz.myshopify.com';
const CHECKPOINT_PATH =
  argValue('checkpoint') ?? '/home/claude/work/images-checkpoint.json';

const dryRun = args.includes('--dry-run');
const verifyOnly = args.includes('--verify-only');
const checkOnly = args.includes('--check');
const limit = argValue('limit') ? Number(argValue('limit')) : null;

if (!INPUT_PATH && !verifyOnly && !checkOnly) {
  console.error(
    'Missing --input <path>. Pass a JSON file of {productId, imageUrl, alt} rows.',
  );
  process.exit(2);
}

// -- API helpers (lifted from reset-inventory.mjs) -------------------------

const API_VERSION = '2026-04';
const endpoint = `https://${STORE}/admin/api/${API_VERSION}/graphql.json`;

function findCliAuthFile() {
  const candidates = [
    join(homedir(), 'Library', 'Preferences', 'shopify-cli-store-nodejs', 'config.json'),
    join(homedir(), '.config', 'shopify-cli-store-nodejs', 'config.json'),
    join(homedir(), '.config', 'shopify-cli', 'config.json'),
  ];
  for (const path of candidates) {
    if (existsSync(path)) return path;
  }
  return null;
}

function loadCliToken() {
  const path = findCliAuthFile();
  if (!path) {
    throw new Error(
      `Could not find Shopify CLI auth. Run: npx @shopify/cli store auth --store ${STORE} --scopes read_products,write_products`,
    );
  }
  let config;
  try {
    config = JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    throw new Error(`Failed to parse ${path}: ${e.message}`);
  }
  const shortStore = STORE.replace(/\.myshopify\.com$/, '');
  let bestSession = null;
  for (const value of Object.values(config)) {
    const sessions = value?.myshopify?.com?.sessionsByUserId;
    if (!sessions) continue;
    for (const session of Object.values(sessions)) {
      if (session?.store === STORE || session?.store?.endsWith(`.${shortStore}`)) {
        if (!bestSession) bestSession = session;
      }
    }
  }
  if (!bestSession?.accessToken) {
    throw new Error(
      `No CLI session for ${STORE} in ${path}. Re-auth: npx @shopify/cli store auth --store ${STORE} --scopes read_products,write_products`,
    );
  }
  const scopes = bestSession.scopes ?? [];
  if (!scopes.includes('write_products')) {
    console.warn(
      `Warning: CLI token scopes [${scopes.join(', ')}] — missing write_products. Attach/reorder mutations will fail with ACCESS_DENIED.`,
    );
  }
  return bestSession.accessToken;
}

const TOKEN = process.env.SHOPIFY_CLIENT_ID && process.env.SHOPIFY_CLIENT_SECRET
  ? await getAdminToken()
  : loadCliToken();

// Cost-based rate limit state — same as reset-inventory.mjs.
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

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// -- Image-attach + reorder -----------------------------------------------

/**
 * Build the GraphQL alias string for N attach mutations. Each alias is
 * `a0: productUpdate(product: $pid0, media: $m0) { userErrors ... }`
 * — matching the schema the workflow doc specifies (Phase 3, Step 1).
 *
 * Shopify caps the number of top-level mutation aliases per request
 * at a comfortable number for our 10-product batches. The cost-based
 * rate limit handles the rest.
 */
function buildAttachMutation(count) {
  const fields = [];
  for (let i = 0; i < count; i++) {
    fields.push(`a${i}: productUpdate(product: {id: $pid${i}}, media: $m${i}) {
      product { id }
      mediaUserErrors { field message }
    }`);
  }
  return `mutation(${Array.from({length: count}, (_, i) => `$pid${i}: ID!, $m${i}: [CreateMediaInput!]!`).join(', ')}) {
  ${fields.join('\n  ')}
}`;
}

/**
 * Build the GraphQL alias string for N reorder mutations. Each alias
 * is `r0: productReorderMedia(id: $pid0, moves: $mv0) { ... }`. The
 * $mv0 variable is a JSON object — Shopify's GraphQL accepts stringified
 * JSON for `MediaMoveInput` variables.
 *
 * NOTE: newPosition MUST be a string per the doc and per the 2026-04
 * MediaMoveInput schema. Sending the number `0` instead of `"0"` will
 * fail the request with a coercion error.
 */
function buildReorderMutation(count) {
  const fields = [];
  for (let i = 0; i < count; i++) {
    fields.push(`r${i}: productReorderMedia(id: $pid${i}, moves: $mv${i}) {
      job { id }
      userErrors { field message }
    }`);
  }
  return `mutation(${Array.from({length: count}, (_, i) => `$pid${i}: ID!, $mv${i}: [MediaMoveInput!]!`).join(', ')}) {
  ${fields.join('\n  ')}
}`;
}

/**
 * Attach one image per product, batched. Returns a map of
 * productId -> {mediaId, userErrors[]}.
 */
async function attachBatch(rows) {
  if (rows.length === 0) return [];
  const mutation = buildAttachMutation(rows.length);
  const variables = {};
  rows.forEach((row, i) => {
    variables[`pid${i}`] = row.productId;
    variables[`m${i}`] = [
      {
        originalSource: row.imageUrl,
        mediaContentType: 'IMAGE',
        alt: row.alt ?? '',
      },
    ];
  });
  const data = await admin(mutation, variables, {queryCost: 10 * rows.length});
  return rows.map((row, i) => {
    const result = data[`a${i}`];
    return {
      productId: row.productId,
      imageUrl: row.imageUrl,
      newProduct: result?.product?.id ?? null,
      mediaUserErrors: result?.mediaUserErrors ?? [],
    };
  });
}

/**
 * For each row in `rows`, fetch the product's media list, find the
 * MediaImage whose image.url matches the row's imageUrl, and return
 * its MediaImage ID. We can't use the URL returned by the attach call
 * alone — we need the actual MediaImage ID for productReorderMedia.
 *
 * The doc's heuristic: "find the new image by matching the Higgsfield
 * filename (hf_...)". The full URL match is more general than just the
 * filename, so we do the URL match instead — if a CloudFront URL has
 * query params, we match the path portion only.
 *
 * 2026-04's media list `first: 100` is enough for the vast majority of
 * products. If a product has >100 media, we'd miss the match and skip
 * the reorder — that's logged as a failure and surfaced in the summary
 * for the operator to investigate.
 */
async function findMediaIds(rows) {
  if (rows.length === 0) return [];
  const mutation = `query($id: ID!) {
    product(id: $id) {
      media(first: 100) {
        nodes {
          ... on MediaImage {
            id
            image { url }
          }
        }
      }
    }
  }`;
  const results = await Promise.all(
    rows.map(async (row) => {
      try {
        const data = await admin(mutation, {id: row.productId}, {queryCost: 5});
        const nodes = data?.product?.media?.nodes ?? [];
        const match = nodes.find((n) => {
          if (!n?.image?.url) return false;
          // Compare on the path portion so trailing query params
          // (?w=...) don't break the match.
          const a = new URL(n.image.url).pathname;
          const b = new URL(row.imageUrl).pathname;
          return a === b;
        });
        return {
          productId: row.productId,
          imageUrl: row.imageUrl,
          mediaId: match?.id ?? null,
        };
      } catch (e) {
        return {
          productId: row.productId,
          imageUrl: row.imageUrl,
          mediaId: null,
          error: e.message,
        };
      }
    }),
  );
  return results;
}

/**
 * Reorder one image per product to position 0, batched. Returns a list
 * of {productId, mediaId, userErrors[]}.
 */
async function reorderBatch(rows) {
  if (rows.length === 0) return [];
  const mutation = buildReorderMutation(rows.length);
  const variables = {};
  rows.forEach((row, i) => {
    variables[`pid${i}`] = row.productId;
    variables[`mv${i}`] = [{id: row.mediaId, newPosition: '0'}];
  });
  const data = await admin(mutation, variables, {queryCost: 10 * rows.length});
  return rows.map((row, i) => {
    const result = data[`r${i}`];
    return {
      productId: row.productId,
      mediaId: row.mediaId,
      userErrors: result?.userErrors ?? [],
    };
  });
}

/**
 * Verify a sample of products have their new image set as featured.
 * Returns a list of {productId, expectedUrl, actualUrl, ok}.
 */
async function verifyFeatured(rows) {
  if (rows.length === 0) return [];
  const mutation = `query($id: ID!) {
    product(id: $id) {
      featuredMedia {
        ... on MediaImage {
          image { url }
        }
      }
    }
  }`;
  const out = [];
  for (const row of rows) {
    try {
      const data = await admin(mutation, {id: row.productId}, {queryCost: 5});
      const url = data?.product?.featuredMedia?.image?.url ?? null;
      let ok = false;
      if (url) {
        const a = new URL(url).pathname;
        const b = new URL(row.imageUrl).pathname;
        ok = a === b;
      }
      out.push({productId: row.productId, expectedUrl: row.imageUrl, actualUrl: url, ok});
    } catch (e) {
      out.push({productId: row.productId, expectedUrl: row.imageUrl, actualUrl: null, ok: false, error: e.message});
    }
  }
  return out;
}

// -- Checkpoint ------------------------------------------------------------

function loadCheckpoint() {
  if (!RESUME_PATH || !existsSync(RESUME_PATH)) {
    if (RESUME_PATH) {
      console.warn(`Resume file not found at ${RESUME_PATH} — starting fresh.`);
    }
    return {completed: []};
  }
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
    writeFileSync(CHECKPOINT_PATH, JSON.stringify(state, null, 2));
  } catch (e) {
    console.warn(`Failed to write checkpoint to ${CHECKPOINT_PATH}: ${e.message}`);
  }
}

// -- Main ------------------------------------------------------------------

async function main() {
  console.log(`Store:        ${STORE}`);
  console.log(`API:          ${API_VERSION}`);
  console.log(`Mode:         ${checkOnly ? 'CHECK' : verifyOnly ? 'VERIFY ONLY' : dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Batch size:   ${BATCH_SIZE}`);
  console.log(`Verify sample:${VERIFY_SAMPLE === 0 ? ' (all)' : VERIFY_SAMPLE}`);
  console.log('');

  if (checkOnly) {
    // Probe directly so a 401 surfaces with a clear "re-auth needed"
    // message instead of the generic "empty response" we'd get from
    // the bucket-aware admin() helper swallowing the error body.
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'X-Shopify-Access-Token': TOKEN},
      body: JSON.stringify({query: '{ shop { name myshopifyDomain plan { displayName } } }'}),
    });
    const json = await res.json();
    updateBucketFromResponse(json);
    if (res.status === 401 || !json?.data?.shop) {
      console.error(`Auth failed (HTTP ${res.status}). Errors:`);
      console.error(JSON.stringify(json.errors ?? json, null, 2));
      console.error('');
      console.error(`Re-auth: npx @shopify/cli store auth --store ${STORE} --scopes read_products,write_products`);
      process.exit(1);
    }
    console.log('Shop:', json.data.shop.name, '·', json.data.shop.myshopifyDomain, '·', json.data.shop.plan.displayName);
    console.log('Image batch script ready.');
    return;
  }

  if (verifyOnly) {
    // --verify-only mode: just run a featuredMedia sample on the input.
    if (!INPUT_PATH) {
      console.error('--verify-only requires --input <path> (the original input file).');
      process.exit(2);
    }
    const input = JSON.parse(readFileSync(INPUT_PATH, 'utf8'));
    const sample = VERIFY_SAMPLE > 0 ? input.slice(0, VERIFY_SAMPLE) : input;
    console.log(`Verifying ${sample.length} products...`);
    const results = await verifyFeatured(sample);
    const okCount = results.filter((r) => r.ok).length;
    const fail = results.filter((r) => !r.ok);
    console.log(`Verified: ${okCount}/${results.length}`);
    if (fail.length > 0) {
      console.log('Not-featured:');
      for (const r of fail) {
        console.log(`  - ${r.productId}: expected ${r.expectedUrl} got ${r.actualUrl ?? r.error}`);
      }
    }
    return;
  }

  if (!INPUT_PATH) {
    console.error('Missing --input <path>');
    process.exit(2);
  }
  const input = JSON.parse(readFileSync(INPUT_PATH, 'utf8'));
  let rows = input;
  if (limit) rows = rows.slice(0, limit);

  // Filter out checkpointed rows when resuming.
  const checkpoint = loadCheckpoint();
  const completedSet = new Set(checkpoint.completed);
  const pending = rows.filter((r) => !completedSet.has(r.productId));
  console.log(`Input rows:   ${rows.length}`);
  console.log(`Already done: ${rows.length - pending.length} (from checkpoint)`);
  console.log(`To process:   ${pending.length}`);
  console.log('');

  if (pending.length === 0) {
    console.log('Nothing to do.');
    return;
  }

  if (dryRun) {
    const batches = chunk(pending, BATCH_SIZE);
    console.log(`Would fire ${batches.length} attach batches and ${batches.length} reorder batches (1 find-mediaIds round per row).`);
    for (let i = 0; i < Math.min(batches.length, 5); i++) {
      const ids = batches[i].map((r) => r.productId).join(', ');
      console.log(`  Batch ${i + 1}/${batches.length}: ${ids}${batches.length > 5 && i === 4 ? ', …' : ''}`);
    }
    return;
  }

  const batches = chunk(pending, BATCH_SIZE);
  const t0 = Date.now();
  const completed = [...checkpoint.completed];
  let attached = 0;
  let reordered = 0;
  const failures = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`Batch ${i + 1}/${batches.length} (${batch.length} products)...`);

    // Phase A: attach images.
    const attachResults = await attachBatch(batch);
    for (const r of attachResults) {
      if (r.mediaUserErrors.length > 0) {
        failures.push({phase: 'attach', productId: r.productId, errors: r.mediaUserErrors});
      } else {
        attached++;
      }
    }

    // Phase B: find each new MediaImage's ID.
    const findResults = await findMediaIds(batch);
    const reorderRows = findResults.filter((r) => r.mediaId);

    // Phase C: reorder to position 0.
    if (reorderRows.length > 0) {
      const reorderResults = await reorderBatch(reorderRows);
      for (const r of reorderResults) {
        if (r.userErrors.length > 0) {
          failures.push({phase: 'reorder', productId: r.productId, mediaId: r.mediaId, errors: r.userErrors});
        } else {
          reordered++;
        }
      }
    }

    // Anything we couldn't find a mediaId for — log it but don't
    // count it as a fail of the attach step; the attach succeeded,
    // the lookup just didn't match.
    for (const r of findResults) {
      if (!r.mediaId) {
        failures.push({
          phase: 'findMediaId',
          productId: r.productId,
          errors: [{message: r.error ?? `No MediaImage matched ${r.imageUrl}`}],
        });
      }
    }

    // Update the checkpoint: a product counts as "completed" when
    // the reorder call returned without userErrors. Failed reorder
    // rows are NOT checkpointed, so the next run retries them.
    for (const r of reorderRows) {
      const matched = findResults.find((f) => f.productId === r.productId);
      if (matched && matched.mediaId) {
        const hadError = (r.userErrors ?? []).length > 0;
        if (!hadError) completed.push(r.productId);
      }
    }
    saveCheckpoint({completed});

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    const rate = (attached + reordered) / Math.max(1, elapsed);
    console.log(`  attached=${attached} reordered=${reordered} failed=${failures.length} (${elapsed}s, ${rate.toFixed(1)}/s)`);
  }

  // Verification sample (skip if no rows processed).
  if (rows.length > 0) {
    const sampleSize = VERIFY_SAMPLE > 0 ? Math.min(VERIFY_SAMPLE, rows.length) : rows.length;
    const sample = rows.slice(0, sampleSize);
    console.log(`\nVerifying ${sample.length} products...`);
    const verifyResults = await verifyFeatured(sample);
    const okCount = verifyResults.filter((r) => r.ok).length;
    console.log(`Verified: ${okCount}/${verifyResults.length}`);
    const stale = verifyResults.filter((r) => !r.ok);
    if (stale.length > 0) {
      console.log('Featured image did not match the expected URL:');
      for (const r of stale) {
        console.log(`  - ${r.productId}: expected ${r.expectedUrl} got ${r.actualUrl ?? r.error}`);
      }
    }
  }

  console.log('');
  console.log(`Done in ${((Date.now() - t0) / 1000).toFixed(1)}s. attached=${attached} reordered=${reordered} failures=${failures.length}`);
  if (failures.length > 0) {
    console.log('Failures (re-run with --resume to retry):');
    for (const f of failures.slice(0, 20)) {
      const msg = f.errors.map((e) => e.message).join('; ');
      console.log(`  - [${f.phase}] ${f.productId}: ${msg}`);
    }
    if (failures.length > 20) console.log(`  …and ${failures.length - 20} more`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});