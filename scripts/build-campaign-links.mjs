#!/usr/bin/env node
/**
 * Campaign destination URLs, validated against the live catalog gate.
 *
 * Two failures this prevents, both of which have already happened on this
 * store in one form or another:
 *
 *   1. Paying to send traffic to a product that is retired, on operational
 *      hold, or out of market. The storefront fails closed and the visitor
 *      gets a redirect or a page with no purchase control - money spent to
 *      show someone a dead end.
 *
 *   2. Attribution that cannot be separated afterwards. 14,549 sessions across
 *      90 days are effectively unreadable because paid, organic, owner testing
 *      and bot traffic all landed in the same undifferentiated bucket. A test
 *      whose sessions cannot be isolated repeats that mistake at higher cost.
 *
 * Every URL this emits is checked against APPROVED_PRODUCT_HANDLES_BY_MARKET,
 * the retired set, the hold set, and market suspension - the same gate the
 * storefront itself applies. If a destination cannot be sold, this refuses to
 * produce a link for it.
 *
 * Usage:
 *   node scripts/build-campaign-links.mjs
 *   node scripts/build-campaign-links.mjs --campaign stage1-funnel-smoke
 */

import process from 'node:process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  APPROVED_PRODUCT_HANDLES_BY_MARKET,
  isMarketSuspended,
  OPERATIONAL_HOLD_HANDLES,
  RETIRED_CATALOG_HANDLES,
} from '../app/lib/launch-catalog.js';

const scriptPath = fileURLToPath(import.meta.url);

export const STORE_ORIGIN = 'https://puchica.ca';
export const DEFAULT_CAMPAIGN = 'stage1-funnel-smoke';

/**
 * Stage 1 creative set.
 *
 * The hero is the Black Travel Tech Case on three grounds: it carries the
 * highest contribution in the catalog (CA$23.09), its declared supplier value
 * of CA$13.20 sits under both the CAD$20 duty and CAD$40 tax thresholds so it
 * has no CBSA assessment exposure at all, and it is a single mapped SKU that
 * DSers can fulfil without manual intervention. It is the offer where a
 * genuine order would be least likely to go wrong.
 *
 * `content` is the creative variant. Keep the count low: three variants across
 * roughly 87 expected sessions is already thin, and more would guarantee that
 * no single variant reaches a readable sample.
 */
export const STAGE_1_CREATIVES = Object.freeze([
  Object.freeze({
    content: 'a-problem-loose-cables',
    handle: 'black-travel-tech-case',
    angle:
      'The bag-dump shot: loose chargers, cables and a power bank tangled in a tote, then the same items seated in the case.',
  }),
  Object.freeze({
    content: 'b-demo-what-fits',
    handle: 'black-travel-tech-case',
    angle:
      'Straight capability demo, no narrative. One continuous take loading the case item by item, naming each one.',
  }),
  Object.freeze({
    content: 'c-pair-free-shipping',
    handle: 'black-travel-tech-case',
    angle:
      'Tech case plus cable case as a carry-on pair, which is also how an order clears the CA$50 free-shipping threshold honestly.',
  }),
]);

/**
 * Canonical UTM scheme. Fixed rather than free-form so that every link in the
 * test is machine-separable in Shopify and GA4 without hand-matching strings.
 */
export function buildUtm({campaign, content, term = 'broad-ca-25-55'}) {
  return {
    utm_source: 'meta',
    utm_medium: 'paid_social',
    utm_campaign: campaign,
    utm_content: content,
    utm_term: term,
  };
}

export function validateDestination(handle, market = 'CA') {
  const problems = [];
  if (isMarketSuspended(market)) {
    problems.push(`${market} is commercially suspended.`);
  }
  if (RETIRED_CATALOG_HANDLES.has(handle)) {
    problems.push(`${handle} is retired and cannot be advertised.`);
  }
  if (OPERATIONAL_HOLD_HANDLES.has(handle)) {
    problems.push(`${handle} is on operational hold and cannot be advertised.`);
  }
  const approved = APPROVED_PRODUCT_HANDLES_BY_MARKET[market] || [];
  if (!approved.includes(handle)) {
    problems.push(`${handle} is not an approved ${market} offer.`);
  }
  return problems;
}

export function buildCampaignLinks({
  campaign = DEFAULT_CAMPAIGN,
  creatives = STAGE_1_CREATIVES,
  market = 'CA',
  origin = STORE_ORIGIN,
} = {}) {
  const links = [];
  const failures = [];

  for (const creative of creatives) {
    const problems = validateDestination(creative.handle, market);
    if (problems.length) {
      failures.push(...problems.map((p) => `${creative.content}: ${p}`));
      continue;
    }
    const url = new URL(`/products/${creative.handle}`, origin);
    for (const [key, value] of Object.entries(
      buildUtm({campaign, content: creative.content}),
    )) {
      url.searchParams.set(key, value);
    }
    links.push({
      content: creative.content,
      handle: creative.handle,
      angle: creative.angle,
      url: url.toString(),
    });
  }

  return {campaign, market, links, failures};
}

if (path.resolve(process.argv[1] || '') === scriptPath) {
  const index = process.argv.indexOf('--campaign');
  const campaign = index >= 0 ? process.argv[index + 1] : DEFAULT_CAMPAIGN;
  const result = buildCampaignLinks({campaign});

  console.log('Puchica Stage 1 campaign links');
  console.log('='.repeat(74));
  console.log(`Campaign : ${result.campaign}`);
  console.log(`Market   : ${result.market}`);
  console.log(
    `Validated against the same gate the storefront applies. A destination that cannot be sold gets no link.\n`,
  );

  for (const link of result.links) {
    console.log(`  ${link.content}`);
    console.log(`    angle : ${link.angle}`);
    console.log(`    url   : ${link.url}\n`);
  }

  console.log('Reporting filters');
  console.log('-'.repeat(74));
  console.log(`  Shopify  : Sessions by UTM campaign = ${result.campaign}`);
  console.log(`  GA4      : sessionCampaignName = ${result.campaign}`);
  console.log(
    `  Per-creative: utm_content in [${result.links.map((l) => l.content).join(', ')}]`,
  );

  for (const failure of result.failures) console.error(`\nFAIL: ${failure}`);
  process.exitCode = result.failures.length ? 1 : 0;
}
