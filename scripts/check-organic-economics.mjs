import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

import {
  APPROVED_CATALOG_OFFERS,
  ARCHIVED_CATALOG_OFFERS,
  isMarketSuspended,
  isOfferSellable,
} from '../app/lib/launch-catalog.js';

// dotenv is a convenience for local runs; the module must still load without
// node_modules so its unit tests run anywhere. The live checks need the env
// either way and fail with a clear message when it is missing.
try {
  const dotenv = await import('dotenv');
  dotenv.config();
} catch {
  // No dotenv available - rely on the ambient environment.
}

/**
 * The cohort the cost/route baseline is audited against: every offer whose
 * evidence the baseline file documents, live or archived. Cost and route
 * readings are evidence about a supplier variant, not a function of whether
 * the product is currently sellable - auditing against the live list alone
 * would declare the whole baseline file "unexpected" the moment the catalogue
 * empties, and the fix for that would be deleting the evidence.
 */
export const BASELINE_AUDIT_COHORT = Object.freeze([
  ...APPROVED_CATALOG_OFFERS,
  ...ARCHIVED_CATALOG_OFFERS.filter(
    (archived) =>
      !APPROVED_CATALOG_OFFERS.some(
        (live) => live.handle === archived.handle && live.sku === archived.sku,
      ),
  ),
]);

const scriptPath = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(scriptPath), '..');
const EVIDENCE_DIR = path.join(rootDir, 'docs', 'recovery-evidence');
const BASELINE_PREFIX = 'exact-offer-cost-route-baseline-';
const BASELINE_PATH = resolveBaselinePath();

/**
 * Resolve the newest exact cost/route baseline on disk.
 *
 * The filename carries the observation date, and `auditBaseline` fails closed
 * once that date is more than seven days old. Hard-coding one filename here
 * meant every refresh needed a matching source edit, and forgetting it left
 * the gate silently reading stale evidence while a fresh file sat unused.
 * Sorting by the date in the name keeps the newest file authoritative without
 * that manual step, and an unparseable or missing file still throws rather
 * than defaulting to something permissive.
 */
export function resolveBaselinePath(dir = EVIDENCE_DIR) {
  const candidates = fs
    .readdirSync(dir)
    .filter(
      (name) => name.startsWith(BASELINE_PREFIX) && name.endsWith('.json'),
    )
    .sort();
  if (!candidates.length) {
    throw new Error(
      `No exact cost/route baseline found in ${dir} (expected ${BASELINE_PREFIX}YYYY-MM-DD.json).`,
    );
  }
  return path.join(dir, candidates[candidates.length - 1]);
}
const STOREFRONT_API_VERSION = '2026-04';
const MAX_EVIDENCE_AGE_DAYS = 7;
// A commercially suspended market has no cohort to price - checking it would
// demand routes for offers the storefront refuses to sell there.
const MARKETS = ['CA', 'US'].filter((market) => !isMarketSuspended(market));

const STOREFRONT_QUERY = `#graphql
  query OrganicEconomics($country: CountryCode!) @inContext(country: $country) {
    products(first: 50, query: "tag:puchica-catalog-approved-v1") {
      nodes {
        handle
        variants(first: 50) {
          nodes {
            id
            sku
            availableForSale
            price { amount currencyCode }
          }
        }
      }
      pageInfo { hasNextPage }
    }
  }
`;

if (path.resolve(process.argv[1] || '') === scriptPath) {
  const result = await checkOrganicEconomics();
  printResult(result);
  process.exitCode = result.failures.length ? 1 : 0;
}

export async function checkOrganicEconomics({now = new Date()} = {}) {
  const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
  const failures = [
    ...auditBaselineFilename(path.basename(BASELINE_PATH), baseline),
    ...auditBaseline(baseline, now),
  ];
  const marketProducts = Object.fromEntries(
    await Promise.all(
      MARKETS.map(async (market) => [
        market,
        await fetchMarketProducts(market),
      ]),
    ),
  );
  const rows = [];

  for (const offer of baseline.offers) {
    // The baseline documents archived evidence as well as live offers, so an
    // entry here is not by itself a claim that the storefront serves it. Only
    // a live, sellable offer may be asserted against the storefront - opening
    // a market must not start demanding products that were deleted from
    // Shopify on 2026-08-28.
    const live = APPROVED_CATALOG_OFFERS.find(
      (candidate) =>
        candidate.handle === offer.handle && candidate.sku === offer.sku,
    );
    for (const [market, route] of Object.entries(offer.routes)) {
      if (!live || !isOfferSellable(live, market)) continue;
      const product = marketProducts[market]?.find(
        ({handle}) => handle === offer.handle,
      );
      const variant = product?.variants?.nodes?.find(
        ({sku}) => sku === offer.sku,
      );
      if (!variant) {
        failures.push(
          `${market} storefront is missing ${offer.handle} / ${offer.sku}.`,
        );
        continue;
      }
      if (!variant.availableForSale) {
        failures.push(
          `${market} storefront variant is unavailable: ${offer.handle} / ${offer.sku}.`,
        );
      }
      const expectedCurrency = market === 'CA' ? 'CAD' : 'USD';
      if (variant.price?.currencyCode !== expectedCurrency) {
        failures.push(
          `${market} storefront currency mismatch for ${offer.handle} / ${offer.sku}: ${variant.price?.currencyCode || '(missing)'}.`,
        );
      }
      rows.push(
        computeEconomicsRow({
          offer,
          route,
          market,
          variant,
          baseline,
        }),
      );
    }
  }

  return {
    evidenceDate: baseline.evidenceDate,
    rows: rows.sort(
      (a, b) =>
        a.market.localeCompare(b.market) ||
        b.preAdContribution - a.preAdContribution,
    ),
    failures,
  };
}

/**
 * The newest filename wins, and the seven-day expiry is measured from the
 * `evidenceDate` inside the file. If those two disagree, a file named for
 * today can carry last month's observations and still pass the age check.
 * Requiring them to match makes that impossible to do by accident.
 */
export function auditBaselineFilename(filename, baseline) {
  const match = /^exact-offer-cost-route-baseline-(\d{4}-\d{2}-\d{2})\.json$/.exec(
    filename,
  );
  if (!match) {
    return [
      `Exact cost/route baseline filename ${filename} does not carry an ISO observation date.`,
    ];
  }
  if (match[1] !== baseline?.evidenceDate) {
    return [
      `Exact cost/route baseline ${filename} declares evidenceDate ${baseline?.evidenceDate}; the filename and the observation date must match.`,
    ];
  }
  return [];
}

export function auditBaseline(baseline, now = new Date()) {
  const failures = [];
  const observed = new Date(`${baseline?.evidenceDate}T23:59:59Z`);
  const ageDays = (now.getTime() - observed.getTime()) / 86400000;
  if (!Number.isFinite(ageDays) || ageDays > MAX_EVIDENCE_AGE_DAYS) {
    failures.push(
      'Exact DSers cost/route evidence is missing, invalid, or older than seven days.',
    );
  }

  const baselineKeyList = (baseline?.offers || []).map(
    ({handle, sku}) => `${handle}\n${sku}`,
  );
  const baselineKeys = new Set(baselineKeyList);
  if (baselineKeys.size !== baselineKeyList.length) {
    failures.push('Exact DSers baseline contains a duplicate offer/SKU row.');
  }
  const catalogKeys = new Set(
    BASELINE_AUDIT_COHORT.map(({handle, sku}) => `${handle}\n${sku}`),
  );
  for (const key of catalogKeys) {
    if (!baselineKeys.has(key))
      failures.push(`Missing cost baseline for ${key.replace('\n', ' / ')}.`);
  }
  for (const key of baselineKeys) {
    if (!catalogKeys.has(key))
      failures.push(
        `Unexpected cost baseline for ${key.replace('\n', ' / ')}.`,
      );
  }

  for (const approved of BASELINE_AUDIT_COHORT) {
    const evidence = baseline.offers.find(
      ({handle, sku}) => handle === approved.handle && sku === approved.sku,
    );
    for (const market of approved.markets) {
      // Skip both a closed market and a suspended fulfilment route: neither
      // can be sold, so demanding current route evidence for it would fail the
      // gate on offers nobody can buy.
      if (!isOfferSellable(approved, market)) continue;
      const route = evidence?.routes?.[market];
      if (!route?.tracked || !(Number(route.shippingUsd) >= 0)) {
        failures.push(
          `Missing tracked ${market} route for ${approved.handle} / ${approved.sku}.`,
        );
      }
    }
    for (const market of Object.keys(evidence?.routes || {})) {
      if (!approved.markets.includes(market)) {
        failures.push(
          `Unexpected ${market} route for ${approved.handle} / ${approved.sku}.`,
        );
      }
    }
  }

  return failures;
}

export function computeEconomicsRow({offer, route, market, variant, baseline}) {
  const currency = market === 'CA' ? 'CAD' : 'USD';
  const merchandisePrice = Number(variant.price.amount);
  const checkoutShipping = Number(baseline.singleItemCheckoutShipping[market]);
  const collectedTotal = merchandisePrice + checkoutShipping;
  const supplyCostUsd = Number(offer.itemCostUsd) + Number(route.shippingUsd);
  const landedCost =
    market === 'CA'
      ? supplyCostUsd * Number(baseline.planningFxCadPerUsd)
      : supplyCostUsd;
  const paymentFee =
    collectedTotal * Number(baseline.paymentPercentRate) +
    Number(baseline.paymentFixedFee);
  const exceptionReserve =
    collectedTotal * Number(baseline.exceptionReserveRate);
  const preAdContribution =
    collectedTotal - landedCost - paymentFee - exceptionReserve;
  const preAdMargin = preAdContribution / collectedTotal;

  return {
    market,
    handle: offer.handle,
    sku: offer.sku,
    variantId: variant.id,
    currency,
    merchandisePrice,
    checkoutShipping,
    collectedTotal,
    landedCost,
    paymentFee,
    exceptionReserve,
    preAdContribution,
    preAdMargin,
    organicTier:
      preAdMargin >= 0.55
        ? 'PRIORITY'
        : preAdMargin >= 0.45
          ? 'SUPPORT'
          : 'STRICT',
    paidAdsDecision: 'HOLD',
    eta: route.eta,
  };
}

async function fetchMarketProducts(market) {
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
      body: JSON.stringify({
        query: STOREFRONT_QUERY,
        variables: {country: market},
      }),
      signal: AbortSignal.timeout(15000),
    },
  );
  if (!response.ok) {
    throw new Error(
      `Storefront ${market} query failed with HTTP ${response.status}.`,
    );
  }
  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(
      `Storefront ${market} query failed: ${JSON.stringify(payload.errors)}.`,
    );
  }
  if (payload.data?.products?.pageInfo?.hasNextPage) {
    throw new Error(
      'Approved Storefront catalog exceeds 50 products; add pagination before relying on this check.',
    );
  }
  return payload.data?.products?.nodes || [];
}

function printResult(result) {
  console.log('Puchica exact-offer organic economics');
  console.log('======================================');
  console.log('Read-only: live Storefront prices + dated DSers evidence.');
  console.log(`DSers evidence date: ${result.evidenceDate}`);
  console.log(
    'Paid ads: HOLD for every row until fulfillment and analytics gates pass.',
  );
  console.table(
    result.rows.map((row) => ({
      market: row.market,
      offer: row.handle,
      sku: row.sku,
      price: `${row.currency} ${row.merchandisePrice.toFixed(2)}`,
      collected: row.collectedTotal.toFixed(2),
      landed: row.landedCost.toFixed(2),
      contribution: row.preAdContribution.toFixed(2),
      margin: `${(row.preAdMargin * 100).toFixed(1)}%`,
      tier: row.organicTier,
      eta: row.eta,
    })),
  );
  for (const failure of result.failures) console.error(`FAIL: ${failure}`);
}
