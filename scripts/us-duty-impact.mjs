#!/usr/bin/env node
/**
 * What the end of US de minimis does to the US route, per offer.
 *
 * Costs and supplier shipping: the newest
 * docs/recovery-evidence/exact-offer-cost-route-baseline-YYYY-MM-DD.json
 * (resolved by `resolveBaselinePath` in check-organic-economics.mjs).
 * US retail: Shopify contextualPricing(country: US), read 2026-08-21.
 *
 * Duty context (see docs memory tariffs.md):
 *   - De minimis suspended for all countries; codified by CBP 24 Jun 2026,
 *     upheld by the CIT 13 Aug 2026, repealed by statute 1 Jul 2027.
 *   - Flat per-parcel specific duty ($80/$160/$200) ceased 28 Feb 2026.
 *   - IEEPA layers struck down by the Supreme Court 20 Feb 2026 - NOT modelled.
 *   - Remaining stack on Chinese origin: MFN + Section 301 (25% or 7.5%)
 *     + forced-labour 301 (12.5%, in litigation).
 *       polyester bags / travel accessories (4202.92.31) ~ 55%
 *       cases, cables, small accessories                ~ 38%
 *   - MPF on informal entry: $2.69.
 *   - Carrier disbursement billed to recipient when not prepaid:
 *     UPS ICOD $12, FedEx $15 or 2%.
 *
 * CBP values on TRANSACTION VALUE - the price paid by the purchaser. In a
 * dropship the purchaser is the end customer at retail, not the merchant at
 * wholesale. Both bases are modelled because which one CBP applies is the
 * single biggest swing factor and we cannot control it.
 */

const PAYMENT_RATE = 0.035; // international card rate
const PAYMENT_FIXED = 0.3;
const RESERVE_RATE = 0.05;
const MPF = 2.69;
const CARRIER_BILLBACK = 12.0; // UPS ICOD, billed to the customer
const FREE_SHIP_OVER = 50.0;
const COLLECTED_SHIPPING = 8.0;

// handle, US retail (USD), supplier item cost (USD), supplier ship to US (USD), duty rate
const OFFERS = [
  ['travel-cable-organizer-case', 15.0, 4.05, 1.99, 0.38],
  ['white-semi-circular-travel-jewelry-case', 18.0, 4.29, 1.99, 0.38],
  ['black-hanging-travel-toiletry-organizer', 21.0, 8.32, 2.16, 0.55],
  ['3-piece-packing-cube-set', 30.0, 12.45, 0.0, 0.55],
  ['the-carry-on-kit-toiletry-organizer-packing-cubes-cable-case', 52.0, 24.82, 4.15, 0.55],
];

/**
 * The live 2026-09-01 watch-roll cohort, kept as its own list so the archived
 * mean above stays comparable to what was reported when the market closed.
 *
 * These are the rows behind `worstCaseDutyContributionUsd` in
 * app/lib/launch-catalog.js: scenario D is the figure each offer carries, and
 * it is the only thing that lets a cn-direct offer cross the suspended US
 * route. Retail is the real USD price list read from Shopify
 * contextualPricing(country: US) on 2026-09-02 - $89 / $99 / $129, NOT the CAD
 * list, which runs to $149 and would flatter every line here. Duty rate 0.38
 * is leather cases under HTS 4202.
 *
 * WATCH THIS: $26.18 / $30.52 / $43.64 are Labor Day sale prices ending
 * 2026-09-07. If they revert toward the $55.70 compare-at, re-run this before
 * these keep selling - at 5-6% contribution there is no room to absorb it.
 */
const LIVE_OFFERS = [
  ['watch-roll 3 slot', 89.0, 26.18, 1.99, 0.38],
  ['watch-roll 4 slot', 99.0, 30.52, 1.99, 0.38],
  ['watch-roll 6 slot', 129.0, 43.64, 1.99, 0.38],
];

const COHORTS = [
  ['Archived 2026-08 cohort', OFFERS],
  ['Live 2026-09 watch-roll cohort', LIVE_OFFERS],
];

function contribution({retail, itemCost, supplierShip, dutyRate, basis, carrier}) {
  const collected = retail >= FREE_SHIP_OVER ? retail : retail + COLLECTED_SHIPPING;
  const landed = itemCost + supplierShip;
  const payment = collected * PAYMENT_RATE + PAYMENT_FIXED;
  const reserve = collected * RESERVE_RATE;

  let duty = 0;
  let fees = 0;
  if (basis === 'wholesale') {
    duty = landed * dutyRate;
    fees = MPF + carrier;
  } else if (basis === 'retail') {
    duty = retail * dutyRate;
    fees = MPF + carrier;
  }

  return collected - landed - payment - reserve - duty - fees;
}

const SCENARIOS = [
  ['A. Pre-2025 model (what the site assumes)', 'none', 0],
  ['B. Duty on declared supplier cost, DDP', 'wholesale', 0],
  ['C. Duty on declared supplier cost, customer billed', 'wholesale', CARRIER_BILLBACK],
  ['D. Duty on retail transaction value, customer billed', 'retail', CARRIER_BILLBACK],
];

const pad = (s, n) => String(s).padEnd(n);
const num = (v) => (v < 0 ? '-' : ' ') + '$' + Math.abs(v).toFixed(2).padStart(6);

for (const [cohortLabel, cohort] of COHORTS) {
  console.log('\n\n=== ' + cohortLabel + ' ===');
  for (const [label, basis, carrier] of SCENARIOS) {
    console.log('\n' + label);
    console.log('-'.repeat(76));
    let total = 0;
    for (const [handle, retail, itemCost, supplierShip, dutyRate] of cohort) {
      const c = contribution({retail, itemCost, supplierShip, dutyRate, basis, carrier});
      total += c;
      const flag = c < 0 ? '  LOSS' : '';
      console.log(
        `  ${pad(handle.slice(0, 44), 46)} ${pad('$' + retail.toFixed(2), 8)} ${num(c)}${flag}`,
      );
    }
    console.log(`  ${pad('', 46)} ${pad('mean', 8)} ${num(total / cohort.length)}`);
  }
}

console.log(`
Reading this:
  Scenario A is the model the storefront and the economics gate use today.
  Scenario B is the best realistic case: the AliExpress seller prepays duty and
    bundles it, the customer sees nothing, we absorb it silently in cost.
  Scenario C is B plus the courier billing the customer $12 on the doorstep.
  Scenario D is CBP valuing on what the customer actually paid, which is the
    legally correct basis for a dropship and the one we cannot control.
`);
