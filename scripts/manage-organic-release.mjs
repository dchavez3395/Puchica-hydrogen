/**
 * Fail-closed control plane for Puchica's first organic catalog release.
 *
 * Default: read-only preflight.
 * Apply:   --apply --confirm-organic-only
 * Rollback: --rollback
 *
 * Apply quarantines every non-cohort ACTIVE product before releasing the
 * exact cohort below. Rollback returns the seven newly released products to
 * DRAFT and removes their discovery tags; it intentionally does not reactivate
 * the rejected legacy catalog.
 */
import process from 'node:process';

import {
  APPROVED_VARIANT_SKUS_BY_MARKET,
  MARKET_ROUTE_EVIDENCE_TAGS,
  REQUIRED_CATALOG_EVIDENCE_TAGS,
} from '../app/lib/launch-catalog.js';
import {adminGraphQL} from './shopify-oauth.mjs';

const args = new Set(process.argv.slice(2));
const APPLY = args.has('--apply');
const ROLLBACK = args.has('--rollback');
const CONFIRMED = args.has('--confirm-organic-only');

if (APPLY && ROLLBACK) {
  throw new Error('Choose either --apply or --rollback, not both.');
}
if (APPLY && !CONFIRMED) {
  throw new Error(
    'Apply is fail-closed. Re-run with --apply --confirm-organic-only.',
  );
}

const RELEASE_TAG = 'puchica-organic-launch-2026-08-10';
const RELEASE_DISCOVERY_TAGS = [
  RELEASE_TAG,
  'puchica-catalog-approved-v1',
  MARKET_ROUTE_EVIDENCE_TAGS.CA,
  MARKET_ROUTE_EVIDENCE_TAGS.US,
];

const REQUIRED_PUBLICATION_FIELDS = [
  {field: 'publishedOnlineStore', title: 'Online Store'},
  {field: 'publishedHydrogen', title: 'Puchica Storefront'},
];

const cohort = [
  {
    id: 'gid://shopify/Product/9365959672058',
    title: 'Charcoal 3-Piece Packing Cube Set — Small, Medium & Large',
    handle: '3-piece-packing-cube-set',
    productType: 'Travel Accessories',
    initialStatus: 'ACTIVE',
    allowExtraVariants: true,
    markets: ['CA'],
    variants: [
      {
        sku: '14:1052#S3007 Black;5:200004186#3PCS L M S Set',
        price: '39.99',
      },
    ],
    seoDescription:
      'A charcoal three-piece packing cube set for separating clothing inside suitcases, weekenders, and carry-ons.',
    merchandisingTags: ['travel-organization', 'puchica-launch-featured'],
  },
  {
    id: 'gid://shopify/Product/9365959246074',
    title: 'Black Double-Layer Travel Cable Organizer Case',
    handle: 'travel-cable-organizer-case',
    productType: 'Travel Accessories',
    initialStatus: 'ACTIVE',
    allowExtraVariants: true,
    markets: ['CA', 'US'],
    variants: [{sku: '14:193#Double Layers', price: '24.99'}],
    seoDescription:
      'A black double-layer zippered travel case for keeping charging cables, adapters, memory cards, and small accessories together.',
    merchandisingTags: ['travel-organization', 'puchica-launch-featured'],
  },
  {
    id: 'gid://shopify/Product/9367756112122',
    title: 'White Luggage ID Tag',
    handle: 'white-luggage-id-tag',
    productType: 'Travel Accessories',
    initialStatus: 'DRAFT',
    markets: ['CA', 'US'],
    variants: [{sku: '14:29#white;5:361386#1pcs', price: '14.99'}],
    seoDescription:
      'A simple white luggage identification tag for a suitcase, carry-on, weekender, or travel bag.',
    merchandisingTags: ['travel-organization'],
  },
  {
    id: 'gid://shopify/Product/9367758274810',
    title: 'Ten-Hole White Cable Organizer Clips',
    handle: 'ten-hole-white-cable-organizer-clips',
    productType: 'Cable Management',
    initialStatus: 'DRAFT',
    markets: ['CA', 'US'],
    variants: [{sku: '14:771#10 Holes-White', price: '14.99'}],
    seoDescription:
      'A compact ten-hole white cable organizer for routing charging and accessory cables on compatible surfaces.',
    merchandisingTags: ['cable-management'],
  },
  {
    id: 'gid://shopify/Product/9367759814906',
    title: 'White Semi-Circular Travel Jewelry Case',
    handle: 'white-semi-circular-travel-jewelry-case',
    productType: 'Travel Accessories',
    initialStatus: 'DRAFT',
    markets: ['CA', 'US'],
    variants: [{sku: '14:29', price: '22.99'}],
    seoDescription:
      'A compact white semi-circular travel case for keeping small rings, earrings, and necklaces together.',
    merchandisingTags: ['travel-organization'],
  },
  {
    id: 'gid://shopify/Product/9367762567418',
    title: 'Large Blue Handled Clothes Storage Bag',
    handle: 'large-blue-handled-clothes-storage-bag',
    productType: 'Storage & Organization',
    initialStatus: 'DRAFT',
    markets: ['CA'],
    variants: [{sku: '14:350852#Large Blue', price: '29.99'}],
    seoDescription:
      'A large blue handled zippered storage bag for folded clothing, blankets, bedding, and other soft household items.',
    merchandisingTags: ['home-organization'],
  },
  {
    id: 'gid://shopify/Product/9367768596730',
    title: 'Black Hanging Travel Toiletry Organizer',
    handle: 'black-hanging-travel-toiletry-organizer',
    productType: 'Travel Accessories',
    initialStatus: 'DRAFT',
    markets: ['CA', 'US'],
    variants: [{sku: '14:771#Black', price: '39.99'}],
    seoDescription:
      'A compact black hanging travel organizer for keeping travel-size toiletries visible and separated.',
    merchandisingTags: ['travel-organization'],
  },
  {
    id: 'gid://shopify/Product/9367775707386',
    title: 'Black Knitted Luggage Wheel Covers — Set of 4',
    handle: 'black-knitted-luggage-wheel-covers-set-of-4',
    productType: 'Travel Accessories',
    initialStatus: 'DRAFT',
    markets: ['CA', 'US'],
    variants: [{sku: '14:193', price: '14.99'}],
    seoDescription:
      'A set of four black stretch-knit covers for compatible small suitcase wheels during storage or indoor handling.',
    merchandisingTags: ['travel-organization'],
  },
  {
    id: 'gid://shopify/Product/9367864770810',
    title: 'Soft Luggage Handle Wrap — Black & Coffee Brown',
    handle: 'soft-luggage-handle-wrap-black-coffee-brown',
    productType: 'Travel Accessories',
    initialStatus: 'DRAFT',
    markets: ['CA', 'US'],
    variants: [
      {sku: '14:350686#coffee color', price: '14.99'},
      {sku: '14:193#Black', price: '14.99'},
    ],
    seoDescription:
      'Soft wrap-around luggage handle covers in black and coffee brown for compatible suitcase and travel-bag handles.',
    merchandisingTags: ['travel-organization'],
  },
];

const cohortIds = new Set(cohort.map(({id}) => id));
const managedDraftIds = new Set(
  cohort
    .filter(({initialStatus}) => initialStatus === 'DRAFT')
    .map(({id}) => id),
);

const publications = await fetchRequiredPublications();
const snapshot = await fetchSnapshot(publications);
const preflight = auditSnapshot(snapshot, {afterRelease: false});

printPreflight(publications, snapshot, preflight);

if (preflight.failures.length) {
  for (const failure of preflight.failures) console.error(`FAIL: ${failure}`);
  throw new Error('Organic release preflight failed closed; no changes made.');
}

if (!APPLY && !ROLLBACK) {
  console.log('\nDRY RUN ONLY — no Shopify state changed.');
  console.log(
    'Release command: node scripts/manage-organic-release.mjs --apply --confirm-organic-only',
  );
  process.exit(0);
}

if (ROLLBACK) {
  await rollbackManagedDrafts(snapshot, publications);
  const rolledBack = await fetchSnapshot(publications);
  const failures = [];
  for (const product of rolledBack.products.filter(({id}) =>
    managedDraftIds.has(id),
  )) {
    if (product.status !== 'DRAFT')
      failures.push(`${product.title} is not DRAFT.`);
    for (const publication of publications) {
      if (product[publication.field]) {
        failures.push(
          `${product.title} remains published to ${publication.title}.`,
        );
      }
    }
    if (product.tags.includes('puchica-catalog-approved-v1')) {
      failures.push(`${product.title} retains the catalog approval tag.`);
    }
  }
  if (failures.length)
    throw new Error(`Rollback failed: ${failures.join(' ')}`);
  console.log(
    '\nROLLBACK PASS — seven managed products are contained as drafts.',
  );
  process.exit(0);
}

await quarantineLegacyProducts(snapshot, publications);
await releaseCohort(snapshot, publications);

const released = await fetchSnapshot(publications);
const postflight = auditSnapshot(released, {afterRelease: true});
if (postflight.failures.length) {
  for (const failure of postflight.failures) console.error(`FAIL: ${failure}`);
  throw new Error(
    'Post-release verification failed. Run --rollback immediately and inspect the errors.',
  );
}

console.log('\nORGANIC RELEASE PASS');
console.log('Nine product pages / ten exact Canadian SKUs are active.');
console.log(
  'Eight exact U.S. SKUs are active; packing cubes and storage bag are blocked there.',
);
console.log('Paid ads remain unauthorized.');

async function fetchRequiredPublications() {
  const query = `#graphql
    query OnlineStorePublication {
      publications(first: 20) {
        nodes { id name catalog { title } }
      }
    }
  `;
  const response = await adminGraphQL(query);
  failGraphQL(response, 'required publications query');
  const publications = response.data.publications.nodes;
  const required = REQUIRED_PUBLICATION_FIELDS.map((definition) => {
    const publication = publications.find(
      ({catalog, name}) =>
        (catalog?.title || name || '').toLowerCase() ===
        definition.title.toLowerCase(),
    );
    return publication ? {...definition, ...publication} : definition;
  });
  const missing = required.filter(({id}) => !id);
  if (missing.length) {
    throw new Error(
      `Required publication(s) not found: ${missing
        .map(({title}) => title)
        .join(', ')}. Found: ${publications
        .map(({catalog, name}) => catalog?.title || name || '(untitled)')
        .join(', ')}`,
    );
  }
  return required;
}

async function fetchSnapshot(publications) {
  const onlineStore = publications.find(
    ({field}) => field === 'publishedOnlineStore',
  );
  const hydrogen = publications.find(
    ({field}) => field === 'publishedHydrogen',
  );
  const query = `#graphql
    query OrganicReleaseCatalog(
      $onlineStorePublicationId: ID!
      $hydrogenPublicationId: ID!
    ) {
      products(first: 100) {
        nodes {
          id title handle status tags productType vendor
          publishedOnlineStore: publishedOnPublication(
            publicationId: $onlineStorePublicationId
          )
          publishedHydrogen: publishedOnPublication(
            publicationId: $hydrogenPublicationId
          )
          variants(first: 50) {
            nodes { id title sku price inventoryQuantity }
          }
        }
        pageInfo { hasNextPage }
      }
    }
  `;
  const response = await adminGraphQL(query, {
    onlineStorePublicationId: onlineStore.id,
    hydrogenPublicationId: hydrogen.id,
  });
  failGraphQL(response, 'catalog snapshot query');
  if (response.data.products.pageInfo.hasNextPage) {
    throw new Error(
      'Catalog exceeds 100 products; pagination must be added before release.',
    );
  }
  return {products: response.data.products.nodes};
}

function auditSnapshot(snapshot, {afterRelease}) {
  const failures = [];
  const byId = new Map(
    snapshot.products.map((product) => [product.id, product]),
  );

  if (cohort.length !== 9)
    failures.push('Release must contain exactly nine product pages.');
  const caSkus = cohort.flatMap(({markets, variants}) =>
    markets.includes('CA') ? variants.map(({sku}) => sku) : [],
  );
  const usSkus = cohort.flatMap(({markets, variants}) =>
    markets.includes('US') ? variants.map(({sku}) => sku) : [],
  );
  if (caSkus.length !== 10)
    failures.push('Canada cohort must contain ten exact SKUs.');
  if (usSkus.length !== 8)
    failures.push('U.S. cohort must contain eight exact SKUs.');
  compareSets(
    'Canada source-code allowlist',
    caSkus,
    APPROVED_VARIANT_SKUS_BY_MARKET.CA,
    failures,
  );
  compareSets(
    'U.S. source-code allowlist',
    usSkus,
    APPROVED_VARIANT_SKUS_BY_MARKET.US,
    failures,
  );

  for (const definition of cohort) {
    const product = byId.get(definition.id);
    if (!product) {
      failures.push(
        `Missing Shopify product ${definition.id} (${definition.title}).`,
      );
      continue;
    }
    if (product.title !== definition.title) {
      failures.push(
        `${definition.id} title is ${JSON.stringify(product.title)}.`,
      );
    }
    if (product.status === 'ARCHIVED') {
      failures.push(`${definition.title} is archived.`);
    }
    if (
      !afterRelease &&
      ![definition.initialStatus, 'ACTIVE'].includes(product.status)
    ) {
      failures.push(
        `${definition.title} has unexpected status ${product.status}.`,
      );
    }
    if (afterRelease && product.status !== 'ACTIVE') {
      failures.push(`${definition.title} is not ACTIVE after release.`);
    }
    if (afterRelease && product.handle !== definition.handle) {
      failures.push(
        `${definition.title} has unexpected handle ${product.handle}.`,
      );
    }
    if (
      !definition.allowExtraVariants &&
      product.variants.nodes.length !== definition.variants.length
    ) {
      failures.push(
        `${definition.title} has ${product.variants.nodes.length} variants; expected ${definition.variants.length}.`,
      );
    }
    for (const expected of definition.variants) {
      const variant = product.variants.nodes.find(
        ({sku}) => sku === expected.sku,
      );
      if (!variant) {
        failures.push(
          `${definition.title} is missing exact SKU ${expected.sku}.`,
        );
        continue;
      }
      if (variant.price !== expected.price) {
        failures.push(
          `${definition.title} ${expected.sku} price is ${variant.price}; expected ${expected.price}.`,
        );
      }
      if (!(variant.inventoryQuantity > 0)) {
        failures.push(
          `${definition.title} ${expected.sku} has no positive inventory signal.`,
        );
      }
    }
    if (afterRelease) {
      const requiredTags = tagsFor(definition);
      for (const tag of requiredTags) {
        if (!product.tags.includes(tag))
          failures.push(`${definition.title} is missing tag ${tag}.`);
      }
      for (const publication of REQUIRED_PUBLICATION_FIELDS) {
        if (!product[publication.field]) {
          failures.push(
            `${definition.title} is not published to ${publication.title}.`,
          );
        }
      }
    }
  }

  if (afterRelease) {
    const unexpectedActive = snapshot.products.filter(
      ({id, status}) => status === 'ACTIVE' && !cohortIds.has(id),
    );
    for (const product of unexpectedActive) {
      failures.push(
        `Legacy/non-cohort product remains ACTIVE: ${product.title}.`,
      );
    }
  }

  return {
    failures,
    legacyActive: snapshot.products.filter(
      ({id, status}) => status === 'ACTIVE' && !cohortIds.has(id),
    ),
  };
}

function printPreflight(publications, snapshot, preflight) {
  const byId = new Map(
    snapshot.products.map((product) => [product.id, product]),
  );
  console.log('Puchica organic release control plane');
  console.log('====================================');
  console.log(`Mode: ${ROLLBACK ? 'ROLLBACK' : APPLY ? 'APPLY' : 'DRY RUN'}`);
  for (const publication of publications) {
    console.log(`Publication: ${publication.title} (${publication.id})`);
  }
  console.log('Cohort: 9 product pages / 10 CA SKUs / 8 U.S. SKUs');
  for (const definition of cohort) {
    const product = byId.get(definition.id);
    console.log(
      `${product?.status || 'MISSING'} | ${definition.markets.join('+')} | ${definition.title}`,
    );
  }
  console.log(
    `Legacy ACTIVE products to quarantine: ${preflight.legacyActive.length}`,
  );
  for (const product of preflight.legacyActive)
    console.log(`  QUARANTINE ${product.title}`);
  console.log('Paid ads: BLOCKED');
}

async function quarantineLegacyProducts(snapshot, publications) {
  const legacy = snapshot.products.filter(
    ({id, status}) => status === 'ACTIVE' && !cohortIds.has(id),
  );
  for (const product of legacy) {
    for (const publication of publications) {
      if (product[publication.field]) {
        await unpublish(product.id, publication.id);
      }
    }
    await updateProduct({id: product.id, status: 'DRAFT'});
    await removeTags(product.id, RELEASE_DISCOVERY_TAGS);
    console.log(`QUARANTINED ${product.title}`);
  }
}

async function releaseCohort(snapshot, publications) {
  const byId = new Map(
    snapshot.products.map((product) => [product.id, product]),
  );
  for (const definition of cohort) {
    const product = byId.get(definition.id);
    await addTags(definition.id, tagsFor(definition));
    await updateProduct({
      id: definition.id,
      handle: definition.handle,
      status: 'ACTIVE',
      vendor: 'Puchica',
      productType: definition.productType,
      seo: {title: definition.title, description: definition.seoDescription},
    });
    for (const publication of publications) {
      if (!product[publication.field]) {
        await publish(definition.id, publication.id);
      }
    }
    console.log(`RELEASED ${definition.title}`);
  }
}

async function rollbackManagedDrafts(snapshot, publications) {
  const byId = new Map(
    snapshot.products.map((product) => [product.id, product]),
  );
  for (const definition of cohort.filter(({id}) => managedDraftIds.has(id))) {
    const product = byId.get(definition.id);
    for (const publication of publications) {
      if (product?.[publication.field]) {
        await unpublish(definition.id, publication.id);
      }
    }
    await updateProduct({id: definition.id, status: 'DRAFT'});
    await removeTags(definition.id, RELEASE_DISCOVERY_TAGS);
    console.log(`ROLLED BACK ${definition.title}`);
  }
}

function tagsFor(definition) {
  return [
    ...REQUIRED_CATALOG_EVIDENCE_TAGS,
    ...definition.markets.map((market) => MARKET_ROUTE_EVIDENCE_TAGS[market]),
    RELEASE_TAG,
    ...definition.merchandisingTags,
  ];
}

async function addTags(id, tags) {
  const mutation = `#graphql
    mutation AddReleaseTags($id: ID!, $tags: [String!]!) {
      tagsAdd(id: $id, tags: $tags) {
        node { id }
        userErrors { field message }
      }
    }
  `;
  await mutate(mutation, {id, tags}, 'tagsAdd');
}

async function removeTags(id, tags) {
  const mutation = `#graphql
    mutation RemoveReleaseTags($id: ID!, $tags: [String!]!) {
      tagsRemove(id: $id, tags: $tags) {
        node { id }
        userErrors { field message }
      }
    }
  `;
  await mutate(mutation, {id, tags}, 'tagsRemove');
}

async function updateProduct(product) {
  const mutation = `#graphql
    mutation UpdateReleaseProduct($product: ProductUpdateInput!) {
      productUpdate(product: $product) {
        product { id handle status tags productType }
        userErrors { field message }
      }
    }
  `;
  await mutate(mutation, {product}, 'productUpdate');
}

async function publish(id, publicationId) {
  const mutation = `#graphql
    mutation PublishReleaseProduct($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) {
        publishable { availablePublicationsCount { count } }
        userErrors { field message }
      }
    }
  `;
  await mutate(mutation, {id, input: [{publicationId}]}, 'publishablePublish');
}

async function unpublish(id, publicationId) {
  const mutation = `#graphql
    mutation UnpublishReleaseProduct($id: ID!, $input: [PublicationInput!]!) {
      publishableUnpublish(id: $id, input: $input) {
        publishable { availablePublicationsCount { count } }
        userErrors { field message }
      }
    }
  `;
  await mutate(
    mutation,
    {id, input: [{publicationId}]},
    'publishableUnpublish',
  );
}

async function mutate(mutation, variables, operation) {
  const response = await adminGraphQL(mutation, variables);
  failGraphQL(response, operation);
  const payload = response.data?.[operation];
  if (!payload) throw new Error(`${operation} response payload is missing.`);
  if (payload.userErrors?.length) {
    throw new Error(
      `${operation} user errors: ${JSON.stringify(payload.userErrors)}`,
    );
  }
}

function failGraphQL(response, operation) {
  if (response.errors?.length) {
    throw new Error(
      `${operation} GraphQL errors: ${JSON.stringify(response.errors)}`,
    );
  }
}

function compareSets(label, expected, actual, failures) {
  const left = [...new Set(expected)].sort();
  const right = [...new Set(actual)].sort();
  if (JSON.stringify(left) !== JSON.stringify(right)) {
    failures.push(
      `${label} mismatch. Cohort=${JSON.stringify(left)} code=${JSON.stringify(right)}.`,
    );
  }
}
