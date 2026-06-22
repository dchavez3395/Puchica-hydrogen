// scripts/reset-inventory.mjs
//
// One-off script: ensure every variant in the store has inventory
// tracking enabled, and (optionally) reset on-hand quantities to a
// target number at the store's primary location. Default qty is 1 —
// set just high enough to prove the cart works, not so high that a
// stray run ships a real inventory number into the world.
//
// ORDER OF OPERATIONS (important — running in the wrong order is a
// no-op):
//
//   1. node scripts/reset-inventory.mjs --track-only --dry-run
//      Preview which inventoryItems need `tracked: true` flipped on.
//   2. node scripts/reset-inventory.mjs --track-only
//      Enable tracking on every untracked inventoryItem.
//   3. node scripts/reset-inventory.mjs --dry-run
//      Preview which variants will have their qty set.
//   4. node scripts/reset-inventory.mjs
//      Set every variant's qty to the target (default 1).
//
// Why two steps: inventorySetQuantities will not change a value on
// an inventoryItem with tracked: false (and the Storefront API
// continues to report availableForSale: false for it regardless of
// the on-hand number). Until tracking is on, the qty pass is a
// no-op for every variant in this store.
//
// PERFORMANCE:
//   - Track pass: ~7700 inventoryItemUpdate mutations in parallel
//     (concurrency 12, cost-based rate limit aware).
//   - Qty pass:   ~7700 inventorySetQuantities entries batched into
//     ~155 mutations of 50 items each (one batched call per page).
//   - End-to-end for a 7-8k-variant catalog: <2 min on a healthy
//     connection.
//
// AUTH: reads the OAuth token from the Shopify CLI's stored auth
// file (the same place `npx @shopify/cli store execute` reads
// from). To rotate, run:
//   npx @shopify/cli store auth --store ug91ve-sz.myshopify.com \
//     --scopes read_products,write_products,read_inventory,write_inventory,read_publications,read_markets,read_orders,read_locations
//
// API: targets Admin API 2026-04 to match the rest of the project.
//
// USAGE:
//   node scripts/reset-inventory.mjs                # default qty 1
//   node scripts/reset-inventory.mjs --qty 25       # custom qty
//   node scripts/reset-inventory.mjs --dry-run      # preview only
//   node scripts/reset-inventory.mjs --track-only   # enable tracking, skip qty reset
//   node scripts/reset-inventory.mjs --check        # print shop info and exit
//   node scripts/reset-inventory.mjs --concurrency N  # default 12
//   node scripts/reset-inventory.mjs --batch-size N   # default 50

import {readFileSync, existsSync} from 'node:fs';
import {homedir} from 'node:os';
import {join} from 'node:path';
import {getAdminToken} from './shopify-oauth.mjs';

// Resolve the store from --store / STORE env, defaulting to the
// Puchica dev store. Must match the store the CLI was authed against.
const args = process.argv.slice(2);
function argValue(name) {
  const eq = args.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.split('=')[1];
  const i = args.indexOf(`--${name}`);
  if (i >= 0) return args[i + 1];
  return undefined;
}
const STORE =
  argValue('store') ?? process.env.PUBLIC_STORE_DOMAIN ?? 'ug91ve-sz.myshopify.com';

const dryRun = args.includes('--dry-run');
const checkOnly = args.includes('--check');
const trackOnly = args.includes('--track-only');
const CONCURRENCY = Math.max(1, Number(argValue('concurrency') ?? 12));
const BATCH_SIZE = Math.max(1, Math.min(250, Number(argValue('batch-size') ?? 50)));
const QTY = Number(argValue('qty') ?? 1);
if (!Number.isFinite(QTY) || QTY < 0) {
  console.error(`Invalid qty: ${QTY}`);
  process.exit(1);
}

const API_VERSION = '2026-04';
const endpoint = `https://${STORE}/admin/api/${API_VERSION}/graphql.json`;

// Read the OAuth access token from the Shopify CLI's stored auth
// file. On macOS the file lives at:
//   ~/Library/Preferences/shopify-cli-store-nodejs/config.json
// but we use the same search path the CLI itself uses, falling back
// to the legacy `~/.config/shopify-cli/config.json` if present.
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
      `Could not find Shopify CLI auth. Run: npx @shopify/cli store auth --store ${STORE} --scopes read_products,write_products,read_inventory,write_inventory,read_publications,read_markets,read_orders,read_locations`,
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
      `No CLI session found for ${STORE} in ${path}. Re-auth: npx @shopify/cli store auth --store ${STORE} --scopes read_products,write_products,read_inventory,write_inventory,read_publications,read_markets,read_orders,read_locations`,
    );
  }
  const scopes = bestSession.scopes ?? [];
  const hasWrite =
    scopes.includes('write_products') && scopes.includes('write_inventory');
  const hasReadLocations = scopes.includes('read_locations');
  if (!hasWrite) {
    console.warn(
      `Warning: CLI token has scopes [${scopes.join(', ')}] — no write_products / write_inventory. Mutations will fail with ACCESS_DENIED. Re-auth with write scopes.`,
    );
  }
  if (!hasReadLocations) {
    console.warn(
      `Warning: CLI token is missing read_locations scope. The --check mode (and a few read queries) will fail until you re-auth with read_locations added.`,
    );
  }
  if (bestSession.expiresAt) {
    const exp = new Date(bestSession.expiresAt);
    if (exp < new Date()) {
      throw new Error(
        `CLI session expired at ${bestSession.expiresAt}. Re-auth: npx @shopify/cli store auth --store ${STORE} ...`,
      );
    }
  }
  return bestSession.accessToken;
}

const TOKEN = process.env.SHOPIFY_CLIENT_ID && process.env.SHOPIFY_CLIENT_SECRET
  ? await getAdminToken()
  : loadCliToken();

/**
 * Cost-based rate limit state. The Shopify Admin API uses a
 * point-bucket model: each request costs N points (returned in
 * `extensions.cost.actualQueryCost`), the bucket starts at
 * `maximumAvailable` and refills at `restoreRate` points/sec.
 * When the bucket is depleted, requests come back throttled.
 *
 * We track the most recently seen bucket state and pause all
 * concurrent callers when it gets low. This is the difference
 * between a 30-second qty pass and a 30-minute one: without
 * bucket awareness, each throttled response triggers a retry,
 * and with 12 concurrent track-pass calls the bucket can be
 * drained faster than it refills.
 */
const rateLimit = {
  currentlyAvailable: 2000,
  restoreRate: 100,
  maximumAvailable: 2000,
};

/**
 * Before issuing a request, wait until the bucket has room.
 * Returns when there's enough `queryCost` available; does NOT
 * subtract from the bucket — the server is the source of truth
 * and we'll get the new level in the response. We just need to
 * not issue requests when we know the bucket is empty.
 */
async function waitForBucket(queryCost) {
  while (rateLimit.currentlyAvailable < queryCost) {
    const deficit = queryCost - rateLimit.currentlyAvailable;
    const ms = Math.max(50, Math.ceil((deficit / rateLimit.restoreRate) * 1000));
    await sleep(ms);
  }
}

/**
 * Update bucket state from a response. We trust the server's
 * reported `currentlyAvailable` because it's authoritative —
 * computing deltas from `actualQueryCost` would be wrong (the
 * server may have charged differently than we expected, and
 * the response itself costs points to read).
 */
function updateBucketFromResponse(json) {
  const t = json?.extensions?.cost?.throttleStatus;
  if (t) {
    rateLimit.currentlyAvailable = t.currentlyAvailable ?? rateLimit.currentlyAvailable;
    rateLimit.restoreRate = t.restoreRate ?? rateLimit.restoreRate;
    rateLimit.maximumAvailable = t.maximumAvailable ?? rateLimit.maximumAvailable;
  }
}

/**
 * Run a GraphQL request. Returns the `data` object on success.
 *
 * Throttling strategy: respect the bucket (see `waitForBucket`).
 * On a throttled response (429 or "Throttled" in the error
 * message), wait for the bucket to refill to the request's
 * actual cost, then retry. No exponential backoff — the bucket
 * math is precise, so we wait exactly as long as we need to.
 *
 * Network errors (ECONNRESET, fetch failed) get up to 4
 * retries with 500ms, 1s, 2s, 4s backoff. These are usually
 * transient and short.
 */
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
        const delay = 500 * Math.pow(2, attempt);
        await sleep(delay);
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
      if (throttled) {
        // Wait for the bucket to refill, then retry.
        if (attempt < retries) {
          await waitForBucket(queryCost);
          continue;
        }
      }
      lastErr = new Error(JSON.stringify(errs, null, 2));
      break;
    }
    return json.data;
  }
  throw lastErr ?? new Error('admin: exhausted retries');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Map an array to async work, capped at `concurrency` in flight.
 * The simplest possible worker pool — the worker pulls the next
 * index off a queue, runs the task, and reports back. Used for
 * the track-only pass where we have ~7700 single-item mutations
 * and want a dozen or so in flight at once.
 */
async function mapAsync(items, limit, worker) {
  let next = 0;
  let done = 0;
  const total = items.length;
  const runners = Array.from({length: Math.min(limit, total)}, async () => {
    while (true) {
      const i = next++;
      if (i >= total) return;
      try {
        await worker(items[i], i);
      } catch {
        // The worker is responsible for catching its own errors
        // and counting them — we never want an unhandled throw
        // here to abort the whole run.
      }
      done++;
    }
  });
  await Promise.all(runners);
  return done;
}

async function getPrimaryLocationId() {
  const data = await admin(`#graphql
    query {
      locations(first: 1, query: "active:true AND name:'Shopify'") {
        nodes { id }
      }
    }
  `);
  const loc = data.locations.nodes[0];
  if (loc) return loc.id;
  const any = await admin(`#graphql
    query { locations(first: 1, query: "active:true") { nodes { id } } }
  `);
  if (!any.locations.nodes[0]) {
    throw new Error('No active location found in this store');
  }
  return any.locations.nodes[0].id;
}

async function getAllVariants() {
  const variants = [];
  let cursor = null;
  while (true) {
    const data = await admin(
      `#graphql
      query($cursor: String) {
        productVariants(first: 250, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          edges {
            node {
              id
              title
              inventoryQuantity
              product { title }
              inventoryItem { id tracked }
            }
          }
        }
      }
    `,
      {cursor},
      {queryCost: 250},
    );
    for (const {node} of data.productVariants.edges) {
      variants.push(node);
    }
    if (!data.productVariants.pageInfo.hasNextPage) break;
    cursor = data.productVariants.pageInfo.endCursor;
  }
  return variants;
}

async function setInventoryTracked(inventoryItemId) {
  const data = await admin(`#graphql
    mutation($id: ID!) {
      inventoryItemUpdate(id: $id, input: { tracked: true }) {
        inventoryItem { id tracked }
        userErrors { field message }
      }
    }
  `, {id: inventoryItemId});
  return data.inventoryItemUpdate;
}

/**
 * Set quantities for a batch of variants at one location in a single
 * mutation. The 2026-04 Admin API supports an array of
 * InventoryQuantityInput under `quantities` — this is the
 * single-call equivalent of N separate setInventoryQty calls.
 *
 * 2026-04 also requires `changeFromQuantity` on every input. This
 * is an idempotency check: Shopify rejects the call if the
 * inventoryItem's current on-hand doesn't match what we tell it.
 * We pass the value we read from the listing query, so the
 * mutation is idempotent for the window between list and update.
 * If the value has drifted (a sale came in mid-flight), the
 * mutation fails with a userError and the caller can decide
 * whether to retry with a fresh listing.
 *
 * @param {{id: string; inventoryItemId: string; inventoryQuantity: number}[]} variants
 * @param {string} locationId
 * @param {number} qty
 */
async function setInventoryQuantitiesBatch(variants, locationId, qty) {
  if (variants.length === 0) return {inventoryAdjustmentGroup: null, userErrors: []};
  // The 2026-04 Admin API requires the `@idempotent` directive on
  // the `inventorySetQuantities` FIELD (not on the mutation
  // operation), with a `key` argument. Without it, every call
  // returns a top-level GraphQL error and no rows are processed —
  // even when the underlying inputs are valid and even when every
  // row has a `changeFromQuantity`. The `changeFromQuantity` on
  // each input is still required (it protects against drift during
  // the list→update window), but it is not a substitute for the
  // directive. The key is a unique string per request — any
  // collision will cause Shopify to return the cached response
  // from the first request, so we generate a fresh UUID v4 per
  // call.
  const idempotencyKey = crypto.randomUUID();
  const data = await admin(`#graphql
    mutation($input: InventorySetQuantitiesInput!, $idempotencyKey: String!) {
      inventorySetQuantities(input: $input) @idempotent(key: $idempotencyKey) {
        inventoryAdjustmentGroup { createdAt reason }
        userErrors { field message }
      }
    }
  `, {
    input: {
      reason: 'correction',
      name: 'available',
      quantities: variants.map((v) => ({
        inventoryItemId: v.inventoryItemId,
        locationId,
        quantity: qty,
        changeFromQuantity: v.inventoryQuantity ?? 0,
      })),
    },
    idempotencyKey,
  });
  return data.inventorySetQuantities;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * Run a batched inventorySetQuantities call. If the batch fails
 * (typically because one row's changeFromQuantity didn't match
 * the on-hand value), split it in half and retry each half
 * recursively. This is a fast path for the common case (no
 * drift → one call) and a fallback for the rare drift case
 * (one bad row → split, retry, eventually identify the offender
 * at the single-item level).
 *
 * Top-level GraphQL errors (BAD_REQUEST, schema violations, etc.)
 * are NOT split — every row in the batch failed for the same
 * reason, so splitting can't help. They are reported as
 * persistent so the caller can surface the underlying message
 * and the user can fix the call (e.g. add a missing directive)
 * without burning the rate limit on 99 doomed retries.
 *
 * Returns {ok, splits, persistent}:
 *   ok         — count of variants successfully updated
 *   splits     — number of sub-batches we split into (0 = no
 *                split was needed)
 *   persistent — list of "id: error" strings for rows that
 *                failed even at the single-item level
 */
async function runBatchWithSplit(batch, locationId, qty) {
  if (batch.length === 0) return {ok: 0, splits: 0, persistent: []};
  if (batch.length === 1) {
    // Single-item retry: report the real error if it still fails.
    try {
      const result = await setInventoryQuantitiesBatch(batch, locationId, qty);
      const errs = result?.userErrors ?? [];
      if (errs.length) {
        return {ok: 0, splits: 0, persistent: [`${batch[0].id}: ${errs.map((e) => e.message).join('; ')}`]};
      }
      return {ok: 1, splits: 0, persistent: []};
    } catch (e) {
      return {ok: 0, splits: 0, persistent: [`${batch[0].id}: ${e.message}`]};
    }
  }
  let result;
  try {
    result = await setInventoryQuantitiesBatch(batch, locationId, qty);
  } catch {
    // Network/throw. We don't know whether it's a transient
    // network blip (worth retrying the whole batch once) or a
    // persistent client error. Try the whole batch once more,
    // and if that also throws, treat it as a top-level error
    // and don't recurse — every row in the batch hit the same
    // failure.
    try {
      result = await setInventoryQuantitiesBatch(batch, locationId, qty);
    } catch (e2) {
      return {
        ok: 0,
        splits: 0,
        persistent: batch.map((v) => `${v.id}: ${e2.message}`),
      };
    }
  }
  const errs = result?.userErrors ?? [];
  if (errs.length === 0) {
    return {ok: batch.length, splits: 0, persistent: []};
  }
  // Some rows had userErrors. Split in half and retry each side
  // — the bad rows are isolated to one half (statistically) and
  // the good half should succeed.
  const half = Math.ceil(batch.length / 2);
  const left = await runBatchWithSplit(batch.slice(0, half), locationId, qty);
  const right = await runBatchWithSplit(batch.slice(half), locationId, qty);
  return {
    ok: left.ok + right.ok,
    splits: left.splits + right.splits + 2,
    persistent: [...left.persistent, ...right.persistent],
  };
}

async function main() {
  console.log(`Store:      ${STORE}`);
  console.log(`API:        ${API_VERSION}`);
  console.log(`Mode:       ${checkOnly ? 'CHECK' : trackOnly ? 'TRACK-ONLY' : dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Target:     ${trackOnly ? 'tracked: true (no qty change)' : `qty ${QTY}`}`);
  if (!checkOnly) {
    console.log(`Concurrency: ${CONCURRENCY}`);
    console.log(`Batch size:  ${trackOnly ? 'N/A' : BATCH_SIZE}`);
  }
  console.log('');

  if (checkOnly) {
    const data = await admin(`#graphql
      query { shop { name myshopifyDomain plan { displayName } } locations(first: 5, query: "active:true") { nodes { id } } }
    `);
    if (!data?.shop) {
      throw new Error('Empty response from shop query (auth or scope issue)');
    }
    console.log('Shop:', data.shop.name, '·', data.shop.myshopifyDomain, '·', data.shop.plan.displayName);
    console.log('Locations:');
    for (const loc of data.locations.nodes) console.log(`  - ${loc.id}`);
    return;
  }

  const t0 = Date.now();
  const variants = await getAllVariants();
  console.log(`Found ${variants.length} variants (${((Date.now() - t0) / 1000).toFixed(1)}s).`);
  console.log('');

  // --track-only: enable tracking on every untracked inventoryItem
  // in parallel. inventoryItemUpdate is a single-item mutation in
  // the Admin API, so the only way to make this fast is to fire
  // many in flight. The 2026-04 throttleStatus gives us the
  // current bucket, and we back off if it drops too low.
  if (trackOnly) {
    const toEnable = variants.filter((v) => v.inventoryItem && !v.inventoryItem.tracked);
    const alreadyTracked = variants.length - toEnable.length;
    const noInvItem = variants.length - toEnable.length - alreadyTracked;
    console.log(`To enable: ${toEnable.length}  ·  Already tracked: ${alreadyTracked}  ·  No inventoryItem: ${noInvItem}`);
    if (toEnable.length === 0) {
      console.log('Nothing to do.');
      return;
    }
    if (dryRun) {
      for (const v of toEnable.slice(0, 10)) {
        console.log(`  TRACK ${v.product.title} – ${v.title}`);
      }
      if (toEnable.length > 10) console.log(`  ...and ${toEnable.length - 10} more`);
      return;
    }

    const tRun = Date.now();
    let enabled = 0;
    let failed = 0;
    const failures = [];
    const progressEvery = Math.max(100, Math.floor(toEnable.length / 20));
    let lastReport = 0;
    await mapAsync(toEnable, CONCURRENCY, async (v) => {
      try {
        const result = await setInventoryTracked(v.inventoryItem.id);
        const errs = result?.userErrors ?? [];
        if (errs.length) {
          failed++;
          const msg = errs.map((e) => e.message).join('; ');
          failures.push(`${v.product.title} – ${v.title}: ${msg}`);
          console.log(`  ERR ${v.product.title} – ${v.title}: ${msg}`);
        } else {
          enabled++;
        }
      } catch (e) {
        failed++;
        failures.push(`${v.product.title} – ${v.title}: ${e.message}`);
        console.log(`  THROW ${v.product.title} – ${v.title}: ${e.message}`);
      }
      if (enabled + failed - lastReport >= progressEvery) {
        lastReport = enabled + failed;
        const elapsed = (Date.now() - tRun) / 1000;
        const rate = (enabled + failed) / elapsed;
        const remaining = (toEnable.length - enabled - failed) / rate;
        process.stdout.write(
          `  ...${enabled + failed}/${toEnable.length} (${rate.toFixed(1)}/s, ~${remaining.toFixed(0)}s left)\n`,
        );
      }
    });

    const elapsed = ((Date.now() - tRun) / 1000).toFixed(1);
    console.log('');
    console.log(`Done in ${elapsed}s. enabled=${enabled} failed=${failed} alreadyTracked=${alreadyTracked}`);
    if (failures.length > 0) {
      console.log('');
      console.log('Failures (re-run with --track-only to retry transient ones):');
      for (const f of failures) console.log(`  - ${f}`);
    }
    return;
  }

  // Full pass: enable tracking where it's off, then set quantities.
  // The qty pass is batched — one inventorySetQuantities call can
  // take up to 250 entries, so 7733 items / 50 per batch = ~155
  // mutations. We sequence the batches (not parallelize them)
  // because each batch is already a network round-trip that does
  // the work of 50 single calls; parallel batches don't help much
  // and would just thrash the rate limit.
  const locationId = await getPrimaryLocationId();
  console.log(`Location: ${locationId}`);

  // Step 1: enable tracking for the untracked items (parallel).
  const needTrack = variants.filter((v) => v.inventoryItem && !v.inventoryItem.tracked);
  if (needTrack.length > 0) {
    console.log(`\nStep 1: enabling tracking on ${needTrack.length} untracked items...`);
    const t1 = Date.now();
    let enabled = 0;
    let failed = 0;
    const progressEvery = Math.max(100, Math.floor(needTrack.length / 10));
    let lastReport = 0;
    await mapAsync(needTrack, CONCURRENCY, async (v) => {
      try {
        const result = await setInventoryTracked(v.inventoryItem.id);
        const errs = result?.userErrors ?? [];
        if (errs.length) {
          failed++;
          console.log(`  ERR ${v.product.title} – ${v.title}: ${errs.map((e) => e.message).join('; ')}`);
        } else {
          enabled++;
        }
      } catch (e) {
        failed++;
        console.log(`  THROW ${v.product.title} – ${v.title}: ${e.message}`);
      }
      if (enabled + failed - lastReport >= progressEvery) {
        lastReport = enabled + failed;
        const elapsed = (Date.now() - t1) / 1000;
        const rate = (enabled + failed) / elapsed;
        process.stdout.write(
          `  ...${enabled + failed}/${needTrack.length} (${rate.toFixed(1)}/s)\n`,
        );
      }
    });
    console.log(`Tracking done in ${((Date.now() - t1) / 1000).toFixed(1)}s. enabled=${enabled} failed=${failed}`);
  } else {
    console.log('All variants already tracked.');
  }

  // Step 2: set quantities in batches.
  const needQty = variants.filter(
    (v) => v.inventoryItem && v.inventoryQuantity !== QTY,
  );
  if (needQty.length === 0) {
    console.log(`\nAll variants already at qty ${QTY}. Nothing to do.`);
    return;
  }
  console.log(`\nStep 2: setting qty=${QTY} for ${needQty.length} variants (batches of ${BATCH_SIZE})...`);
  if (dryRun) {
    const batches = chunk(needQty, BATCH_SIZE);
    console.log(`Would fire ${batches.length} batched inventorySetQuantities calls.`);
    return;
  }
  const t2 = Date.now();
  // We need the full variant object (id + inventoryItemId +
  // inventoryQuantity) so the batched mutation can include
  // changeFromQuantity — required in 2026-04 for idempotency.
  const batches = chunk(
    needQty.map((v) => ({
      id: v.id,
      inventoryItemId: v.inventoryItem.id,
      inventoryQuantity: v.inventoryQuantity,
    })),
    BATCH_SIZE,
  );
  let updated = 0;
  let failed = 0;
  const persistentFailures = [];
  let lastReport = 0;
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const {ok, splits, persistent} = await runBatchWithSplit(batch, locationId, QTY);
    updated += ok;
    failed += persistent.length;
    if (splits > 0) {
      console.log(`  SPLIT batch ${i + 1}/${batches.length} into ${splits + 1} sub-batches (idempotency mismatch on at least one row)`);
    }
    for (const f of persistent) {
      persistentFailures.push(f);
    }
    if (updated + failed - lastReport >= Math.max(500, Math.floor(needQty.length / 10))) {
      lastReport = updated + failed;
      const elapsed = (Date.now() - t2) / 1000;
      const rate = (updated + failed) / elapsed;
      const remaining = (needQty.length - updated - failed) / rate;
      process.stdout.write(
        `  ...${updated + failed}/${needQty.length} (${rate.toFixed(0)}/s, ~${remaining.toFixed(0)}s left)\n`,
      );
    }
  }
  const elapsed = ((Date.now() - t2) / 1000).toFixed(1);
  console.log(`\nQty done in ${elapsed}s. updated=${updated} failed=${failed}`);
  if (persistentFailures.length > 0) {
    console.log('');
    console.log('Persistent failures (likely inventory drift or invalid location):');
    for (const f of persistentFailures) console.log(`  - ${f}`);
  }
  console.log(`\nTotal: ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
