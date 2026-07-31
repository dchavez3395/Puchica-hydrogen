import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import {adminGraphQL} from './shopify-oauth.mjs';

dotenv.config({path: 'D:/puchica-store/.env'});

const root = path.resolve('outputs/sales-readiness');
const products = JSON.parse(
  fs.readFileSync(path.join(root, 'shopify-products.json'), 'utf8'),
);
const apply = process.argv.includes('--apply');

const PRODUCT_UPDATE = `#graphql
mutation UpdateProduct($product: ProductUpdateInput!) {
  productUpdate(product: $product) {
    product { id title handle productType vendor tags seo { title description } }
    userErrors { field message }
  }
}`;
const FILE_UPDATE = `#graphql
mutation UpdateFiles($files: [FileUpdateInput!]!) {
  fileUpdate(files: $files) {
    files { id alt fileStatus }
    userErrors { field message code }
  }
}`;

const configs = {
  '24-Piece Drawer Organizer Tray Set': {
    title: '24-Piece Drawer Organizer Tray Set',
    productType: 'Storage & Organization',
    keep: [3, 4, 5, 11],
    seo: 'Organize drawers with 24 modular PP trays in three sizes. The exact 6-small, 14-medium, 4-large set ships to U.S. addresses only.',
    alts: {
      3: 'Black organizer trays separating hand tools inside a toolbox drawer',
      4: 'Tool drawer before and after using black organizer trays',
      5: 'Mechanic using black organizer trays in a workshop tool drawer',
      11: 'Exact 24-piece black drawer tray set with 4 large, 14 medium, and 6 small trays',
    },
  },
  'Travel Cable Organizer Pouch': {
    title: 'Gray Travel Cable Organizer Pouch',
    productType: 'Travel Accessories',
    keep: [8],
    removeTags: ['canada-route-quoted', 'cross-border-review'],
    seo: 'Pack chargers and small tech accessories in one slim gray roll-up organizer pouch. Available for U.S. shipping only.',
    alts: {8: 'Gray roll-up cable organizer pouch shown closed and open with tech accessories'},
  },
  'Pocket Luggage Scale': {
    title: '50 kg Pocket Luggage Scale',
    productType: 'Travel Accessories',
    keep: [1, 2, 3, 4, 5, 6, 7, 8],
    seo: 'Check bags up to 50 kg or 110 lb with a compact digital luggage scale. Battery not included. Ships to U.S. addresses only.',
    alts: {
      1: 'Silver digital luggage scale with green LCD and fabric lifting strap',
      2: 'Silver pocket luggage scale folded for compact storage',
      3: 'Luggage scale dimensions and LCD unit display guide',
      4: 'Hand using a digital luggage scale to weigh a travel bag',
      5: 'Pocket luggage scale stored in a suitcase zipper compartment',
      6: 'Digital luggage scale shown for travel, shopping, and package weighing',
      7: 'Silver digital luggage scale with fabric strap on white background',
      8: 'Silver digital luggage scale with metal hook on white background',
    },
  },
  'Double-Layer Cable Organizer Case': {
    title: 'Black Double-Layer Cable Organizer Case',
    productType: 'Travel Accessories',
    keep: [9],
    seo: 'Store cables and small electronics in a black double-layer zip case measuring about 19 × 11 × 5.5 cm. U.S. shipping only.',
    replacements: [
      ['Review the product images and dimensions before ordering to confirm that your accessories will fit.', 'Approximate exterior size is 19 × 11 × 5.5 cm (7.5 × 4.3 × 2.2 in). Compare these dimensions with your accessories before ordering.'],
      ['<li>Material: nylon</li>', '<li>Approximate size: 19 × 11 × 5.5 cm (7.5 × 4.3 × 2.2 in)</li><li>Material: nylon</li>'],
    ],
    alts: {9: 'Black double-layer cable organizer case shown closed and open, 19 by 11 by 5.5 cm'},
  },
  'Wheeled Under-Sink Organizer Bin': {
    title: 'White Small Wheeled Under-Sink Organizer Bin',
    productType: 'Storage & Organization',
    keep: [1, 2, 3, 4, 5, 8],
    seo: 'Pull cleaning and household supplies forward with a small white wheeled organizer bin. Measure before ordering. U.S. shipping only.',
    replacements: [
      ['<li>Material: plastic</li>', '<li>Approximate overall size: 28 × 13 × 13.6 cm (11 × 5.1 × 5.4 in)</li><li>Material: plastic</li>'],
    ],
    alts: {
      1: 'Two white wheeled organizer bins holding cleaning supplies inside a cabinet',
      2: 'White organizer bins arranging pantry and household supplies on shelves',
      3: 'Multiple white wheeled bins organizing food and household items in a cabinet',
      4: 'White wheeled organizer bin pulled forward while holding paper goods',
      5: 'Two white organizer bins holding bottles on a shelf',
      8: 'White small wheeled organizer bin with measurement diagram',
    },
  },
  '8-Piece Travel Packing Organizer Set': {
    title: 'Gray 8-Piece Travel Packing Organizer Set',
    productType: 'Travel Accessories',
    keep: [6, 11, 15],
    seo: 'Separate clothing, shoes, and accessories with an eight-piece gray suitcase organizer set. Ships to U.S. addresses only.',
    replacements: [['Review the product images and stated dimensions before ordering.', 'Review the exact eight-piece configuration shown in the product images before ordering.']],
    alts: {
      6: 'Eight-piece packing organizer set with a diagram of each bag and its dimensions',
      11: 'Gray eight-piece packing organizer set arranged together on white',
      15: 'Gray packing cubes and accessory pouches stacked as an eight-piece set',
    },
  },
  'Five-Slot Cable Organizer Strip': {
    title: 'White Five-Slot Cable Organizer Strip',
    productType: 'Cable Management',
    keep: [3, 4, 5, 6, 9, 13],
    seo: 'Hold five compatible cables in place with a white adhesive desk organizer strip. Check slot size before ordering. U.S. shipping only.',
    replacements: [
      ['Check the product images and slot dimensions before ordering to confirm cable fit.', 'The organizer is approximately 8.5 × 4 cm, with slots about 0.7 cm wide. Compare these measurements with your cables before ordering.'],
      ['<li>Use: cable positioning and desk organization</li>', '<li>Approximate size: 8.5 × 4 cm; slots approximately 0.7 cm wide</li><li>Use: cable positioning and desk organization</li>'],
    ],
    alts: {
      3: 'White cable organizer strip holding five charging cables at a desk edge',
      4: 'White five-slot cable organizer measurement diagram',
      5: 'Adhesive backing and suitable wood, tile, metal, and marble surfaces',
      6: 'White cable organizer strips used on desks, walls, and inside a car',
      9: 'White five-slot cable organizer strip with adhesive backing',
      13: 'White five-slot cable organizer strip shown from top and side',
    },
  },
  'Stainless Steel Tube Squeezer': {
    title: 'Silver Stainless Steel Tube Squeezer',
    productType: 'Bathroom Accessories',
    keep: [1, 2, 3, 4, 5, 6],
    seo: 'Roll compatible toothpaste and cosmetic tubes with a reusable silver stainless steel squeezer, about 8 × 3.5 cm. U.S. shipping only.',
    replacements: [['<li>Material: stainless steel</li>', '<li>Approximate size: 8 × 3.5 cm (3.1 × 1.4 in)</li><li>Material: stainless steel</li>']],
    alts: {
      1: 'Two silver stainless steel tube squeezers beside a partially rolled tube',
      2: 'Silver tube squeezer rolling the end of a pink cosmetic tube',
      3: 'Silver tube squeezer used on a white cream tube',
      4: 'Two reusable stainless steel tube squeezers on a tabletop',
      5: 'Tube squeezer measurement diagram showing 8 by 3.5 cm',
      6: 'Front and back views of a silver stainless steel tube squeezer',
    },
  },
  'Silicone Cable Organizer Clip': {
    title: 'White 5-Clip Toocki Cable Organizer',
    productType: 'Cable Management',
    vendor: 'Toocki',
    keep: [7],
    seo: 'Keep five compatible cables within reach using a white adhesive Toocki silicone organizer. Available for U.S. shipping only.',
    alts: {7: 'White Toocki silicone cable organizer with five cable clips'},
  },
  '5-Piece Compression Packing Cube Set': {
    title: 'Red 5-Piece Compression Packing Cube Set',
    productType: 'Travel Accessories',
    keep: [3, 4, 5, 6, 10, 16, 17],
    seo: 'Organize a suitcase with a red five-piece compression packing cube set. Compress gradually and avoid overfilling. U.S. shipping only.',
    replacements: [['Review the product images and dimensions before ordering.', 'Review the exact red five-piece configuration shown in the product images before ordering.']],
    alts: {
      3: 'Five-piece packing cube size diagram with compressed and expanded views',
      4: 'Packing cubes shown before and after using the compression zipper',
      5: 'Close-up of packing cube mesh, stitching, and water-resistant fabric',
      6: 'Traveler arranging compression packing cubes inside an open suitcase',
      10: 'Red compression packing cube set stacked on white',
      16: 'Red five-piece packing organizer set with cubes and shoe bag',
      17: 'Red compression packing cube shown expanded',
    },
  },
};

const backup = products.map((product) => ({
  id: product.id,
  title: product.title,
  handle: product.handle,
  media: product.media.nodes.map((media, index) => ({
    index: index + 1,
    id: media.id,
    alt: media.alt,
    url: media.preview?.image?.url || null,
  })),
}));
fs.writeFileSync(
  path.join(root, 'product-media-recovery-manifest.json'),
  JSON.stringify(backup, null, 2),
);

const plan = [];
for (const product of products) {
  const config = configs[product.title];
  if (!config) throw new Error(`Missing config for ${product.title}`);

  let descriptionHtml = product.descriptionHtml
    .replaceAll('Ã—', '×')
    .replaceAll('â€™', '’');
  for (const [from, to] of config.replacements || []) {
    if (!descriptionHtml.includes(from)) {
      throw new Error(`Description text not found for ${product.title}: ${from}`);
    }
    descriptionHtml = descriptionHtml.replace(from, to);
  }

  const tags = (product.tags || []).filter(
    (tag) => !(config.removeTags || []).includes(tag),
  );
  const productInput = {
    id: product.id,
    title: config.title,
    productType: config.productType,
    descriptionHtml,
    tags,
    seo: {title: config.title, description: config.seo},
  };
  if (config.vendor) productInput.vendor = config.vendor;

  const keep = new Set(config.keep);
  const fileUpdates = product.media.nodes.map((media, offset) => {
    const index = offset + 1;
    if (keep.has(index)) {
      const alt = config.alts[index];
      if (!alt) throw new Error(`Missing alt for ${product.title} image ${index}`);
      return {id: media.id, alt};
    }
    return {id: media.id, referencesToRemove: [product.id]};
  });

  plan.push({product: product.title, productInput, fileUpdates});
}

fs.writeFileSync(
  path.join(root, 'product-readiness-plan.json'),
  JSON.stringify(plan, null, 2),
);
console.log(`Prepared ${plan.length} products; apply=${apply}`);
console.log(`Media kept: ${plan.reduce((n, item) => n + item.fileUpdates.filter((f) => f.alt).length, 0)}`);
console.log(`Media removed from galleries: ${plan.reduce((n, item) => n + item.fileUpdates.filter((f) => f.referencesToRemove).length, 0)}`);

if (!apply) process.exit(0);

for (const item of plan) {
  const updated = await adminGraphQL(PRODUCT_UPDATE, {product: item.productInput});
  const productErrors = updated.productUpdate?.userErrors || [];
  if (productErrors.length) throw new Error(`${item.product}: ${JSON.stringify(productErrors)}`);

  // File updates accept batches and remove only the product reference. The files
  // remain recoverable through product-media-recovery-manifest.json.
  const files = await adminGraphQL(FILE_UPDATE, {files: item.fileUpdates});
  const fileErrors = files.fileUpdate?.userErrors || [];
  if (fileErrors.length) throw new Error(`${item.product}: ${JSON.stringify(fileErrors)}`);
  console.log(`Updated ${item.product}`);
}