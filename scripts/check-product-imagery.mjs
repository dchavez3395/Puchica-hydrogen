#!/usr/bin/env node
/**
 * The gate the storefront did not have.
 *
 * Every claim check in this repo reads JavaScript. tests/product-copy.test.js
 * bans "handmade", "artisan" and origin claims; tests/trust-copy.test.js bans
 * no-surprise-fee promises; tests/launch-catalog.test.js bans unverified
 * testing and testimonial language. All of them read .js files, and none of
 * them can see a word rendered into a JPEG.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS EXISTS. Audit of 2026-09-03, twenty supplier images across the two
 * live products. Ten carried marketing text baked into the pixels, and it was
 * not decorative:
 *
 *   "PATENT pending"                    a legal claim about IP we do not hold
 *   "100% Damage Protection"            an absolute performance claim
 *   "Handcrafted | FULL GRAIN LEATHER"  a word product-copy.test.js bans, and
 *                                       a material claim the 4-slot's own
 *                                       description explicitly contradicts -
 *                                       that copy says the supplier spec is
 *                                       leatherette, four images said cow
 *                                       leather
 *   "What Makes Us Better?" charts      unverified comparisons against
 *                                       unnamed competitors
 *   "The Mirage ... Quattro Collection" another company's brand and product
 *                                       range, on our product page
 *   three quoted "testimonials"         no customer said any of them
 *
 * Ten were removed. The point of this file is that the next twenty do not get
 * a free pass because nobody happened to look.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS CAN AND CANNOT DO.
 *
 * It CANNOT read pixels. There is no OCR here and adding one would be a false
 * comfort - supplier composites use display faces over photographs and OCR
 * fails on exactly the ornamental type these images use.
 *
 * What it does instead is make alt text mandatory and then hold that text to
 * the same standard as product copy. That is a real guard rather than a
 * cosmetic one, because alt text is the only machine-readable description of
 * an image that exists, and writing it forces someone to look at the image.
 * An image whose honest description would trip these patterns is an image that
 * should not be on the page.
 *
 * So: this gate catches a described claim. A human review catches a drawn one,
 * and IMAGERY_REVIEW_REQUIRED below says so out loud rather than letting a
 * green check imply a coverage this cannot give.
 */

import process from 'node:process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  APPROVED_PRODUCT_HANDLES_BY_MARKET,
  CATALOG_APPROVAL_TAG,
} from '../app/lib/launch-catalog.js';

const scriptPath = fileURLToPath(import.meta.url);
const STOREFRONT_API_VERSION = '2026-04';

/**
 * Mirrors the bans in tests/product-copy.test.js, tests/trust-copy.test.js and
 * the launch-copy assertions in tests/launch-catalog.test.js. Kept here rather
 * than imported because those live in test files; if they are ever lifted into
 * app/lib, import from there and delete this copy.
 */
export const IMAGE_CLAIM_BANS = Object.freeze([
  Object.freeze({
    label: 'handmade or artisan claim',
    pattern:
      /handmade|hand-?crafted|hand-?woven|artisan|made in guatemala|fait main|artesanal|hecho a mano/i,
  }),
  Object.freeze({
    label: 'material claim not in the product specification',
    pattern: /full[- ]?grain|genuine leather|cow leather|real leather/i,
  }),
  Object.freeze({
    label: 'absolute or unverified performance claim',
    pattern:
      /\b100%\s|guaranteed|lifetime warranty|damage protection|indestructible|waterproof/i,
  }),
  Object.freeze({
    label: 'intellectual-property claim',
    pattern: /patent|trademarked|proprietary/i,
  }),
  Object.freeze({
    label: 'free-shipping promise',
    pattern: /free shipping|livraison gratuite|env[íi]o gratis|frete gr[áa]tis/i,
  }),
  Object.freeze({
    label: 'testimonial or review language',
    pattern: /customers say|reviewers|testimonial|best[- ]selling|#1\b/i,
  }),
  Object.freeze({
    label: 'competitor comparison',
    pattern: /what makes us better|vs\.? others|other a\b|other b\b/i,
  }),
]);

/**
 * Brand names that must not appear in our imagery descriptions. The first
 * three are competitors in this category; the rest are watch brands whose
 * products appear in supplier photography we inherited.
 */
export const FOREIGN_BRANDS = Object.freeze([
  'mirage',
  'quattro collection',
  'barton',
  'wolf',
  'rolex',
  'earnshaw',
  'bulova',
  'patek',
]);

/**
 * Alt text has to be long enough to be a description rather than a label.
 * "watch case" passes every ban above and tells a screen-reader user nothing.
 */
export const MIN_ALT_LENGTH = 40;

/**
 * This gate cannot see text drawn into an image. Any change to product media
 * needs a human to open each new file. Recorded here so that a green run is
 * never mistaken for full coverage.
 */
export const IMAGERY_REVIEW_REQUIRED = Object.freeze({
  lastFullReview: '2026-09-03',
  reviewed: 20,
  removed: 10,
  note:
    'Open every new image and read it. This script checks descriptions, not pixels.',
});

export function auditAltText(products) {
  const failures = [];

  for (const product of products) {
    const images = product?.images?.nodes || [];
    if (!images.length) {
      failures.push(`${product.handle}: has no images at all.`);
      continue;
    }

    images.forEach((image, index) => {
      const where = `${product.handle} image ${index + 1}`;
      const alt = typeof image?.altText === 'string' ? image.altText.trim() : '';

      if (!alt) {
        failures.push(
          `${where}: no alt text. Every image needs one - it is the only ` +
            `machine-readable description of the image, and writing it is ` +
            `what forces someone to look at the file.`,
        );
        return;
      }

      if (alt.length < MIN_ALT_LENGTH) {
        failures.push(
          `${where}: alt text is ${alt.length} characters, under the ` +
            `${MIN_ALT_LENGTH}-character minimum. Describe what is in the ` +
            `frame, do not label it.`,
        );
      }

      for (const {label, pattern} of IMAGE_CLAIM_BANS) {
        if (pattern.test(alt)) {
          failures.push(`${where}: alt text carries a ${label} - "${alt}"`);
        }
      }

      for (const brand of FOREIGN_BRANDS) {
        if (alt.toLowerCase().includes(brand)) {
          failures.push(
            `${where}: alt text names the third-party brand "${brand}".`,
          );
        }
      }
    });
  }

  return failures;
}

const STOREFRONT_QUERY = `#graphql
  query ProductImagery($country: CountryCode!) @inContext(country: $country) {
    products(first: 50, query: "tag:${CATALOG_APPROVAL_TAG}") {
      nodes {
        handle
        images(first: 50) { nodes { url altText } }
      }
    }
  }
`;

async function fetchProducts(market) {
  const domain = process.env.PUBLIC_STORE_DOMAIN;
  const token = process.env.PUBLIC_STOREFRONT_API_TOKEN;
  if (!domain || !token) {
    throw new Error(
      'Missing PUBLIC_STORE_DOMAIN or PUBLIC_STOREFRONT_API_TOKEN.',
    );
  }
  const response = await fetch(
    `https://${domain}/api/${STOREFRONT_API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({query: STOREFRONT_QUERY, variables: {country: market}}),
      signal: AbortSignal.timeout(15000),
    },
  );
  if (!response.ok) {
    throw new Error(`Storefront query failed with HTTP ${response.status}.`);
  }
  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(`Storefront query errors: ${JSON.stringify(payload.errors)}`);
  }
  return payload.data?.products?.nodes || [];
}

if (path.resolve(process.argv[1] || '') === scriptPath) {
  const market =
    Object.keys(APPROVED_PRODUCT_HANDLES_BY_MARKET).find(
      (key) => APPROVED_PRODUCT_HANDLES_BY_MARKET[key].length > 0,
    ) || 'US';

  const products = await fetchProducts(market);
  const failures = auditAltText(products);

  console.log('Puchica product imagery audit');
  console.log('='.repeat(74));
  console.log(`Market      : ${market}`);
  console.log(`Products    : ${products.length}`);
  console.log(
    `Images      : ${products.reduce((n, p) => n + (p.images?.nodes?.length || 0), 0)}`,
  );
  console.log(`Last human review: ${IMAGERY_REVIEW_REQUIRED.lastFullReview} ` +
    `(${IMAGERY_REVIEW_REQUIRED.reviewed} reviewed, ` +
    `${IMAGERY_REVIEW_REQUIRED.removed} removed)`);
  console.log('');

  for (const failure of failures) console.error(`FAIL: ${failure}`);
  if (!failures.length) {
    console.log('No described claim violations.');
    console.log('');
    console.log(IMAGERY_REVIEW_REQUIRED.note);
  }
  process.exitCode = failures.length ? 1 : 0;
}
