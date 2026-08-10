/**
 * Create the eight supplier-verified catalog candidates as contained Shopify
 * drafts. The script is idempotent by handle and is a dry run unless --apply
 * is supplied.
 *
 * These records intentionally do not receive the storefront approval tag and
 * are not published to any sales channel. DSers mapping, exact media, market
 * prices, and checkout QA remain separate release gates.
 */
import {adminGraphQL} from './shopify-oauth.mjs';

const APPLY = process.argv.includes('--apply');
const BUILD_TAG = 'puchica-draft-build-2026-08-09';

const products = [
  {
    handle: 'white-luggage-id-tag',
    title: 'White Luggage ID Tag',
    productType: 'Travel Accessories',
    price: '14.99',
    sku: 'PU-TRV-TAG-WHT-1',
    optionName: 'Color',
    optionValue: 'White',
    cost: '5.93',
    markets: ['CA', 'US'],
    descriptionHtml:
      '<p>Keep contact details with your bag using a simple white luggage tag. The single-tag format is easy to add to a suitcase, weekender, or carry-on.</p><p>One white luggage tag is included. Personal details and luggage shown in product photography are not included. Shipping options and final delivery estimates appear at checkout.</p>',
  },
  {
    handle: 'ten-hole-white-cable-clips',
    title: 'Ten-Hole White Cable Organizer Clips',
    productType: 'Cable Management',
    price: '14.99',
    sku: 'PU-ORG-CLIP-WHT-10',
    optionName: 'Style',
    optionValue: '10 Holes - White',
    cost: '6.96',
    markets: ['CA', 'US'],
    descriptionHtml:
      '<p>Guide frequently used charging and accessory cables through one compact ten-hole organizer. The white finish keeps the setup visually quiet on a desk, nightstand, or charging area.</p><p>Clean and dry the placement surface before use. Surface compatibility and adhesive performance vary; avoid delicate finishes and test an inconspicuous area first. Cables and electronics are not included.</p>',
  },
  {
    handle: 'six-piece-metal-tube-squeezer-set',
    title: 'Six-Piece Metal Tube Squeezer Set',
    productType: 'Home Organization',
    price: '24.99',
    sku: 'PU-HOME-SQUEEZE-MET-6',
    optionName: 'Set',
    optionValue: '6 Pieces',
    cost: '11.69',
    markets: ['CA', 'US'],
    descriptionHtml:
      '<p>Roll flexible household tubes from the sealed end toward the opening with this six-piece key-style metal squeezer set. Keep one where you use toothpaste, cream, cosmetic, or craft tubes.</p><p>For compatible flexible tubes only. Do not use on rigid, pressurized, medication-dosing, or industrial containers. Contents shown in product photography are not included.</p>',
  },
  {
    handle: 'semi-circular-travel-jewelry-case',
    title: 'Semi-Circular Travel Jewelry Case',
    productType: 'Travel Accessories',
    price: '22.99',
    sku: 'PU-TRV-JEWEL-SEM-1',
    optionName: 'Style',
    optionValue: 'Single Case',
    cost: '9.34',
    markets: ['CA', 'US'],
    descriptionHtml:
      '<p>Keep small rings, earrings, and necklaces together in a compact semi-circular travel case. The structured PU exterior is sized for short trips and everyday bag organization.</p><p>One empty case is included. Jewelry and accessories shown in product photography are not included. Final colour and exact matching media must be selected before this draft is released.</p>',
  },
  {
    handle: 'large-blue-handled-clothes-storage-bag',
    title: 'Large Blue Handled Clothes Storage Bag',
    productType: 'Storage & Organization',
    price: '29.99',
    sku: 'PU-HOME-CLOTH-BLU-L',
    optionName: 'Size and Color',
    optionValue: 'Large Blue',
    cost: '12.44',
    markets: ['CA'],
    descriptionHtml:
      '<p>Group folded clothing, linens, or other soft household items in a large blue zippered storage bag with handles. The foldable format is useful for closets, shelves, and seasonal organization.</p><p>Do not overload or use the handles to lift excessive weight. Contents shown in product photography are not included. This candidate is limited to Canada because the verified supplier option did not provide a United States delivery route.</p>',
  },
  {
    handle: 'black-hanging-travel-toiletry-organizer',
    title: 'Black Hanging Travel Toiletry Organizer',
    productType: 'Travel Accessories',
    price: '39.99',
    sku: 'PU-TRV-TOIL-BLK-1',
    optionName: 'Color',
    optionValue: 'Black',
    cost: '17.00',
    markets: ['CA', 'US'],
    descriptionHtml:
      '<p>Keep travel-size toiletries together in one black hanging organizer. Open it at your destination to see frequently used items without emptying the entire bag.</p><p>One empty organizer is included. Toiletries and accessories shown in product photography are not included. Avoid unsupported waterproof or brand claims; exact matching media is required before release.</p>',
  },
  {
    handle: 'gray-travel-shoe-bag',
    title: 'Gray Travel Shoe Bag',
    productType: 'Travel Accessories',
    price: '24.99',
    sku: 'PU-TRV-SHOE-GRY-1',
    optionName: 'Color',
    optionValue: 'Gray',
    cost: '10.17',
    markets: ['CA', 'US'],
    descriptionHtml:
      '<p>Separate one pair of shoes from clothing and other packed items with a compact gray travel shoe bag. The zippered pouch folds down when it is not in use.</p><p>One empty shoe bag is included. Shoes and other contents shown in product photography are not included. Fit depends on shoe style and size; measurements must be added from exact supplier documentation before release.</p>',
  },
  {
    handle: 'white-small-wheeled-under-sink-bin',
    title: 'White Small Wheeled Under-Sink Organizer Bin',
    productType: 'Storage & Organization',
    price: '29.99',
    sku: 'PU-HOME-BIN-WHT-S',
    optionName: 'Size and Color',
    optionValue: 'White Small',
    cost: '14.84',
    markets: ['CA', 'US'],
    descriptionHtml:
      '<p>Bring order to a compatible cabinet or under-sink area with a small white organizer bin on wheels. The open top keeps frequently used household items visible and easy to pull forward.</p><p>Measure the available height, width, and depth before ordering, and confirm plumbing, hinges, and cabinet hardware will not block movement. Do not overload. Contents shown in product photography are not included.</p>',
  },
];

const existing = await fetchProductsByHandles(products.map(({handle}) => handle));
const existingByHandle = new Map(existing.map((product) => [product.handle, product]));
const pending = products.filter(({handle}) => !existingByHandle.has(handle));

console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY RUN'}`);
console.log(`Existing candidate drafts: ${existing.length}`);
for (const product of existing) {
  console.log(`  KEEP ${product.handle} (${product.status}) ${product.id}`);
}
console.log(`Drafts to create: ${pending.length}`);
for (const product of pending) {
  console.log(`  CREATE ${product.handle} at CA$${product.price}`);
}

if (!APPLY) {
  console.log('No changes made. Re-run with --apply to create missing drafts.');
  process.exit(0);
}

const created = [];
for (const definition of pending) {
  const product = await createDraft(definition);
  created.push(product);
  console.log(`CREATED ${product.handle} ${product.id}`);
}

const verified = await fetchProductsByHandles(products.map(({handle}) => handle));
const unsafe = verified.filter(
  (product) =>
    product.status !== 'DRAFT' ||
    product.resourcePublicationsCount?.count !== 0 ||
    product.tags.includes('puchica-catalog-approved-v1'),
);

console.log(
  JSON.stringify(
    {
      created: created.map(({id, handle}) => ({id, handle})),
      verified: verified.map((product) => ({
        id: product.id,
        handle: product.handle,
        status: product.status,
        publications: product.resourcePublicationsCount?.count ?? null,
        variant: product.variants.nodes[0] ?? null,
      })),
      unsafe,
    },
    null,
    2,
  ),
);

if (verified.length !== products.length || unsafe.length) {
  throw new Error('Draft verification failed closed; inspect the JSON output.');
}

async function createDraft(definition) {
  const mutation = `#graphql
    mutation CreateCandidateDraft($product: ProductCreateInput!) {
      productCreate(product: $product) {
        product {
          id handle status tags
          resourcePublicationsCount { count }
          variants(first: 5) { nodes { id title sku price } }
        }
        userErrors { field message }
      }
    }
  `;
  const tags = [
    BUILD_TAG,
    'puchica-candidate-v1',
    ...definition.markets.map((market) => `candidate-market-${market.toLowerCase()}`),
  ];
  const response = await adminGraphQL(mutation, {
    product: {
      title: definition.title,
      handle: definition.handle,
      status: 'DRAFT',
      vendor: 'Puchica',
      productType: definition.productType,
      descriptionHtml: definition.descriptionHtml,
      tags,
      seo: {
        title: definition.title,
        description: stripHtml(definition.descriptionHtml).slice(0, 155),
      },
      productOptions: [
        {
          name: definition.optionName,
          position: 1,
          values: [{name: definition.optionValue}],
        },
      ],
    },
  });
  failOnErrors(response, 'productCreate');
  const product = response.data.productCreate.product;
  const variant = product.variants.nodes[0];
  if (!variant) throw new Error(`No default variant for ${definition.handle}`);

  const update = `#graphql
    mutation UpdateCandidateVariant(
      $productId: ID!
      $variants: [ProductVariantsBulkInput!]!
    ) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants { id title sku price }
        userErrors { field message }
      }
    }
  `;
  const updateResponse = await adminGraphQL(update, {
    productId: product.id,
    variants: [
      {
        id: variant.id,
        price: definition.price,
        inventoryPolicy: 'DENY',
        inventoryItem: {
          sku: definition.sku,
          cost: definition.cost,
          tracked: false,
          requiresShipping: true,
          countryCodeOfOrigin: 'CN',
        },
      },
    ],
  });
  failOnErrors(updateResponse, 'productVariantsBulkUpdate');
  return product;
}

async function fetchProductsByHandles(handles) {
  const query = `#graphql
    query CandidateDrafts($query: String!) {
      products(first: 100, query: $query) {
        nodes {
          id handle status tags
          resourcePublicationsCount { count }
          variants(first: 5) { nodes { id title sku price } }
        }
      }
    }
  `;
  const search = handles.map((handle) => `handle:${handle}`).join(' OR ');
  const response = await adminGraphQL(query, {query: search});
  failOnErrors(response, 'candidate query');
  const wanted = new Set(handles);
  return response.data.products.nodes.filter((product) => wanted.has(product.handle));
}

function failOnErrors(response, operation) {
  if (response.errors?.length) {
    throw new Error(`${operation} GraphQL errors: ${JSON.stringify(response.errors)}`);
  }
  const payload = response.data?.[operation];
  if (payload?.userErrors?.length) {
    throw new Error(`${operation} user errors: ${JSON.stringify(payload.userErrors)}`);
  }
}

function stripHtml(value) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
