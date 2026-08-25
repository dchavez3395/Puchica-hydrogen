#!/usr/bin/env node
/**
 * Will this traffic test produce a number you can trust?
 *
 * Two independent ways to waste an ad budget:
 *
 *   1. Spend it while measurement is broken, and learn nothing.
 *   2. Spend an amount too small to answer the question you asked, and learn
 *      nothing while believing you learned something.
 *
 * The second is the more dangerous, because it produces a number. A CA$200
 * test on this store buys roughly 87 sessions. If the true conversion rate is
 * a healthy 1.5%, the single most likely outcome is one order - and there is
 * still a 27% chance of seeing zero. Reading "zero orders" as "the offer does
 * not convert" would be a conclusion the data cannot support.
 *
 * So this script does two jobs. It audits measurement integrity, and it runs
 * the power analysis BEFORE the money is committed, so the budget is chosen
 * against a question it can actually answer.
 *
 * Usage:
 *   node scripts/check-measurement-readiness.mjs
 *   node scripts/check-measurement-readiness.mjs --budget 800
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(scriptPath), '..');

/**
 * Canada is a Tier-1 Meta market. CPM is the benchmark read on 2026-08-24
 * (US$14.03) at the repo's 1.40 planning FX. Click-to-session loss covers
 * bounces before the analytics beacon fires.
 */
export const MEDIA_ASSUMPTIONS = Object.freeze({
  cpmCad: 14.03 * 1.4,
  clickToSessionRate: 0.85,
  ctrRange: Object.freeze([0.008, 0.01, 0.015]),
  cvrRange: Object.freeze([0.01, 0.015, 0.02]),
  /** Add-to-cart rate for a functioning ecommerce funnel. */
  healthyAtcRate: 0.08,
});

/**
 * Sessions a budget buys, and what can be concluded from them.
 *
 * `probabilityOfZeroOrders` is the whole point: it is the chance of observing
 * zero orders even when the offer converts at `cvr`. When that number is high,
 * a zero-order result is uninformative and the test cannot answer a purchase
 * question at this budget.
 */
export function projectTest({
  budgetCad,
  ctr,
  cvr,
  cpmCad = MEDIA_ASSUMPTIONS.cpmCad,
  clickToSessionRate = MEDIA_ASSUMPTIONS.clickToSessionRate,
}) {
  const impressions = (budgetCad / cpmCad) * 1000;
  const clicks = impressions * ctr;
  const sessions = clicks * clickToSessionRate;
  const expectedOrders = sessions * cvr;
  const expectedAtc = sessions * MEDIA_ASSUMPTIONS.healthyAtcRate;

  return {
    budgetCad,
    ctr,
    cvr,
    impressions,
    clicks,
    cpc: clicks > 0 ? budgetCad / clicks : Infinity,
    sessions,
    expectedOrders,
    expectedAtc,
    probabilityOfZeroOrders: (1 - cvr) ** sessions,
    probabilityOfZeroAtc: (1 - MEDIA_ASSUMPTIONS.healthyAtcRate) ** sessions,
  };
}

/**
 * Budget required to measure a CPA to a given relative precision.
 *
 * Normal approximation: n conversions for +/-`precision` at 95% confidence is
 * (1.96 / precision)^2. This is what a *measured* CPA actually costs, as
 * opposed to a benchmark borrowed from someone else's account.
 */
export function budgetToMeasureCpa({
  cvr,
  ctr = 0.01,
  precision = 0.3,
  cpmCad = MEDIA_ASSUMPTIONS.cpmCad,
  clickToSessionRate = MEDIA_ASSUMPTIONS.clickToSessionRate,
}) {
  const conversionsNeeded = (1.96 / precision) ** 2;
  const sessions = conversionsNeeded / cvr;
  const clicks = sessions / clickToSessionRate;
  const impressions = clicks / ctr;
  return {
    conversionsNeeded,
    sessions,
    budgetCad: (impressions * cpmCad) / 1000,
  };
}

/**
 * Measurement integrity. Each finding is something that would make the numbers
 * from a paid test wrong rather than merely imprecise.
 */
export function auditMeasurement({env = readEnvExample()} = {}) {
  const failures = [];
  const warnings = [];

  const customMeta = env.PUBLIC_CUSTOM_META_ENABLED === 'true';
  const ga4Storefront = env.PUBLIC_GA4_STOREFRONT_EVENTS_ENABLED === 'true';

  // The custom Meta bridge publishes browser events with no shared event ID,
  // so Shopify's server-side Purchase and the bridge's browser Purchase cannot
  // be deduplicated. Meta then counts one sale twice, CPA reads at half its
  // true value, and the test says scale when the truth is stop. This is the
  // single most expensive way for this store to be wrong.
  if (customMeta) {
    failures.push(
      'PUBLIC_CUSTOM_META_ENABLED is true. The custom bridge has no shared event IDs, so Shopify server events and browser events cannot be deduplicated - Purchase double-counts and reported CPA reads at roughly half its true value.',
    );
  }

  // check-launch-readiness.mjs hard-requires both IDs, but the documented
  // architecture leaves the custom bridge off and lets Shopify's own
  // integrations own the events. Following the gate literally means enabling
  // the very bridge the architecture disables.
  const requiresPixelId = readSource('scripts', 'check-launch-readiness.mjs')
    .includes("'PUBLIC_FACEBOOK_PIXEL_ID'");
  if (requiresPixelId && !customMeta) {
    warnings.push(
      'paid-launch-check requires PUBLIC_FACEBOOK_PIXEL_ID and PUBLIC_GA4_MEASUREMENT_ID, but .env.example documents both as optional and used only when the custom bridge is enabled. Resolve this before a paid test: satisfying the gate by enabling the bridge would introduce the deduplication fault above.',
    );
  }

  if (!customMeta && !ga4Storefront) {
    warnings.push(
      'Both storefront analytics bridges are disabled, so all event data comes from Shopify native integrations. Confirm in Shopify admin that the Facebook & Instagram and Google channels are connected and receiving events before spending - this script cannot verify a third-party channel.',
    );
  }

  return {failures, warnings, customMeta, ga4Storefront};
}

/**
 * Historic traffic on this store is contaminated: 14,549 sessions across 90
 * days produced two orders, both owner tests, and the cart events line up with
 * QA dates. A paid test that cannot be separated from that noise repeats the
 * mistake, so these controls are prerequisites rather than good practice.
 */
export const TRAFFIC_HYGIENE_CONTROLS = Object.freeze([
  'Every ad destination URL carries a unique utm_source/utm_medium/utm_campaign so paid sessions are separable from direct and organic.',
  'The operator excludes their own traffic - Shopify admin IP exclusion, and do not open the live store from the ad account device during the test.',
  'A named reporting window is fixed in advance, with no mid-flight budget or creative edits inside it.',
  'Bot filtering is confirmed on, and any single-day desktop spike with zero engagement is quarantined before analysis rather than after.',
]);

if (path.resolve(process.argv[1] || '') === scriptPath) {
  const index = process.argv.indexOf('--budget');
  const budget = index >= 0 ? Number(process.argv[index + 1]) : 200;
  const result = report(budget);
  process.exitCode = result.failures.length ? 1 : 0;
}

function report(budgetCad) {
  const audit = auditMeasurement();

  console.log('Puchica measurement readiness');
  console.log('='.repeat(74));
  console.log(`Planned budget : CA$${budgetCad.toFixed(2)}`);
  console.log(
    `Media model    : CA$${MEDIA_ASSUMPTIONS.cpmCad.toFixed(2)} CPM, ${(MEDIA_ASSUMPTIONS.clickToSessionRate * 100).toFixed(0)}% click-to-session`,
  );

  console.log('\nWhat this budget buys');
  console.log('-'.repeat(74));
  const rows = [];
  for (const ctr of MEDIA_ASSUMPTIONS.ctrRange) {
    for (const cvr of MEDIA_ASSUMPTIONS.cvrRange) {
      const p = projectTest({budgetCad, ctr, cvr});
      rows.push({
        CTR: `${(ctr * 100).toFixed(1)}%`,
        CVR: `${(cvr * 100).toFixed(1)}%`,
        sessions: Math.round(p.sessions),
        CPC: `CA$${p.cpc.toFixed(2)}`,
        'exp. orders': p.expectedOrders.toFixed(1),
        'P(zero orders)': `${(p.probabilityOfZeroOrders * 100).toFixed(0)}%`,
        'exp. ATC': p.expectedAtc.toFixed(1),
        'P(zero ATC)': `${(p.probabilityOfZeroAtc * 100).toFixed(1)}%`,
      });
    }
  }
  console.table(rows);

  const midCtr = 0.01;
  const midCvr = 0.015;
  const mid = projectTest({budgetCad, ctr: midCtr, cvr: midCvr});
  const purchaseAnswerable = mid.probabilityOfZeroOrders < 0.05;
  const atcAnswerable = mid.probabilityOfZeroAtc < 0.05;

  console.log('What this budget can and cannot answer');
  console.log('-'.repeat(74));
  console.log(
    `  Purchase CPA : ${purchaseAnswerable ? 'ANSWERABLE' : 'NOT ANSWERABLE'} - at 1.0% CTR / 1.5% CVR there is a ${(mid.probabilityOfZeroOrders * 100).toFixed(0)}% chance of zero orders even if the offer converts normally.`,
  );
  console.log(
    `  Funnel health : ${atcAnswerable ? 'ANSWERABLE' : 'NOT ANSWERABLE'} - expected ${mid.expectedAtc.toFixed(1)} add-to-carts, only a ${(mid.probabilityOfZeroAtc * 100).toFixed(1)}% chance of zero if the funnel works.`,
  );

  if (!purchaseAnswerable) {
    console.log('\n  To measure a CPA to +/-30% instead:');
    for (const cvr of MEDIA_ASSUMPTIONS.cvrRange) {
      const need = budgetToMeasureCpa({cvr});
      console.log(
        `    at ${(cvr * 100).toFixed(1)}% CVR: ${Math.round(need.sessions).toLocaleString()} sessions, about CA$${Math.round(need.budgetCad).toLocaleString()}`,
      );
    }
    console.log(
      '  Spend the small budget on funnel health. Do not read a CPA out of it.',
    );
  }

  console.log('\nTraffic hygiene - confirm each before spending');
  console.log('-'.repeat(74));
  for (const control of TRAFFIC_HYGIENE_CONTROLS) {
    console.log(`  [ ] ${control}`);
  }

  console.log('');
  for (const failure of audit.failures) console.error(`FAIL: ${failure}`);
  for (const warning of audit.warnings) console.warn(`WARN: ${warning}`);
  if (!audit.failures.length) {
    console.log(
      'No blocking measurement fault found in configuration. The warnings above still need a human answer.',
    );
  }

  return audit;
}

function readEnvExample() {
  const candidates = ['.env', '.env.example'];
  for (const name of candidates) {
    const candidate = path.join(rootDir, name);
    if (!fs.existsSync(candidate)) continue;
    return Object.fromEntries(
      fs
        .readFileSync(candidate, 'utf8')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#') && line.includes('='))
        .map((line) => {
          const at = line.indexOf('=');
          return [
            line.slice(0, at).trim(),
            line
              .slice(at + 1)
              .trim()
              .replace(/^["']|["']$/g, ''),
          ];
        }),
    );
  }
  return {};
}

function readSource(...segments) {
  const candidate = path.join(rootDir, ...segments);
  return fs.existsSync(candidate) ? fs.readFileSync(candidate, 'utf8') : '';
}
