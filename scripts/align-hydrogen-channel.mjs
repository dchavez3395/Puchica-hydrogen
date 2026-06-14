#!/usr/bin/env node
/**
 * One-time: make the Hydrogen storefront ("Puchica Storefront" channel) match
 * the live Online Store — i.e. unpublish from the Hydrogen channel every product
 * that is NOT published to the Online Store.
 *
 * The AI/MCP connector blocks bulk unpublish, so run this locally instead.
 *
 * SETUP (one time):
 *   Shopify admin → Settings → Apps and sales channels → Develop apps →
 *   Create an app → "Puchica Bulk Tool" → Configure Admin API scopes:
 *     read_products, write_publications
 *   → Install app → copy the "Admin API access token" (starts with shpat_)
 *
 * RUN:
 *   cd puchica-storefront
 *   SHOPIFY_ADMIN_TOKEN=shpat_xxxxx node scripts/align-hydrogen-channel.mjs
 *
 *   Add DRY_RUN=1 to preview the count without changing anything:
 *   SHOPIFY_ADMIN_TOKEN=shpat_xxxxx DRY_RUN=1 node scripts/align-hydrogen-channel.mjs
 */

const SHOP = process.env.SHOPIFY_SHOP || 'ug91ve-sz.myshopify.com';
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const HYDROGEN_PUBLICATION_ID = 'gid://shopify/Publication/207659958522'; // "Puchica Storefront"
const API = `https://${SHOP}/admin/api/2025-04/graphql.json`;
const DRY_RUN = process.env.DRY_RUN === '1';
const BATCH = 40; // products unpublished per request (keeps under cost limit)

if (!TOKEN) {
  console.error('Missing SHOPIFY_ADMIN_TOKEN env var. See setup notes at top of file.');
  process.exit(1);
}

async function gql(query, variables) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': TOKEN,
      },
      body: JSON.stringify({query, variables}),
    });
    const json = await res.json();
    const throttled =
      json.errors &&
      json.errors.some((e) => e?.extensions?.code === 'THROTTLED');
    if (throttled) {
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      continue;
    }
    if (json.errors) {
      throw new Error(JSON.stringify(json.errors));
    }
    return json.data;
  }
  throw new Error('Throttled too many times');
}

async function collectIds() {
  const ids = [];
  let after = null;
  do {
    const data = await gql(
      `query($after: String) {
        products(first: 250, query: "published_status:unpublished", after: $after) {
          edges { node { id } }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      {after},
    );
    for (const e of data.products.edges) ids.push(e.node.id);
    after = data.products.pageInfo.hasNextPage
      ? data.products.pageInfo.endCursor
      : null;
    process.stdout.write(`\rCollected ${ids.length} product ids…`);
  } while (after);
  process.stdout.write('\n');
  return ids;
}

async function unpublishBatch(batch) {
  const fields = batch
    .map(
      (id, i) =>
        `p${i}: publishableUnpublish(id: "${id}", input: [{publicationId: $pub}]) { userErrors { message } }`,
    )
    .join('\n');
  const data = await gql(`mutation($pub: ID!) { ${fields} }`, {
    pub: HYDROGEN_PUBLICATION_ID,
  });
  let errors = 0;
  for (const key of Object.keys(data)) {
    const ue = data[key]?.userErrors || [];
    if (ue.length) {
      errors += ue.length;
      console.warn(`  ${key}:`, ue.map((e) => e.message).join('; '));
    }
  }
  return errors;
}

(async () => {
  console.log(`Store: ${SHOP}`);
  console.log(`Channel: Puchica Storefront (${HYDROGEN_PUBLICATION_ID})`);
  console.log('Finding products not on the Online Store…');
  const ids = await collectIds();
  console.log(`Found ${ids.length} products to unpublish from the Hydrogen channel.`);

  if (DRY_RUN) {
    console.log('DRY_RUN=1 — no changes made.');
    return;
  }

  let done = 0;
  let errs = 0;
  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH);
    errs += await unpublishBatch(batch);
    done += batch.length;
    process.stdout.write(`\rUnpublished ${done}/${ids.length}…`);
    await new Promise((r) => setTimeout(r, 300)); // gentle on the rate limit
  }
  process.stdout.write('\n');
  console.log(`Done. Unpublished ${done} products${errs ? `, ${errs} errors` : ''}.`);
  console.log('The Hydrogen storefront should now match the ~212 live-store products.');
})();
