import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

import {DICTIONARIES} from '../app/lib/dictionaries.js';
import {OPERATIONAL_HOLD_HANDLES} from '../app/lib/launch-catalog.js';

const scriptPath = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(scriptPath);
const rootDir = path.resolve(scriptDir, '..');
const REQUIRED_CURRENT_HOLDS = [
  '24-piece-drawer-organizer-tray-set',
  'toocki-five-clip-cable-organizer',
  'pocket-luggage-scale-50kg',
];
const APPROVED_QUOTE_DECISIONS = new Set([
  'GO_SAMPLE',
  'GO_TEST_ORDER',
  'GO_PAID_TEST',
]);
const LIMITED_TEST_DECISION = 'GO_LIMITED_TEST';
const REQUIRED_LIMITED_TEST_PAUSE_CONDITIONS = new Set([
  'SUPPLIER_COST_OR_ROUTE_CHANGES',
  'ORDER_NOT_PROCESSED_WITHIN_3_DAYS',
  'TRACKING_NOT_ISSUED_WITHIN_48_HOURS_OF_FULFILLMENT',
  'PRODUCT_MISMATCH_DEFECT_OR_CUSTOMER_COMPLAINT',
  'MISSING_OR_DUPLICATE_PURCHASE_EVENT',
  'BLENDED_CAC_REACHES_BREAK_EVEN',
]);

if (path.resolve(process.argv[1] || '') === scriptPath) {
  const {failures, warnings} = runLaunchChecks();
  printResults(failures, warnings);
  process.exitCode = failures.length ? 1 : 0;
}

export function runLaunchChecks() {
  const env = readEnv(path.join(rootDir, '.env'));
  const failures = [];
  const warnings = [];

  requireConfigured(
    'PUBLIC_FACEBOOK_PIXEL_ID',
    'Meta storefront events cannot fire',
    env,
    failures,
  );
  requireConfigured(
    'PUBLIC_GA4_MEASUREMENT_ID',
    'GA4 storefront events cannot fire',
    env,
    failures,
  );
  requireFormat(
    'PUBLIC_FACEBOOK_PIXEL_ID',
    /^\d{5,20}$/,
    'a numeric Meta Pixel ID',
    env,
    failures,
  );
  requireFormat(
    'PUBLIC_GA4_MEASUREMENT_ID',
    /^G-[A-Z0-9]+$/,
    'a GA4 ID such as G-XXXXXXXXXX',
    env,
    failures,
  );

  const threshold = configuredValue(
    'PUBLIC_FREE_SHIPPING_THRESHOLD',
    env,
  ) || '75';
  if (threshold !== '75') {
    warnings.push(
      `PUBLIC_FREE_SHIPPING_THRESHOLD is ${threshold}; verify it matches Shopify checkout rates.`,
    );
  }

  for (const handle of REQUIRED_CURRENT_HOLDS) {
    if (!OPERATIONAL_HOLD_HANDLES.has(handle)) {
      failures.push(`Operational hold is missing for ${handle}.`);
    }
  }

  for (const sourcePath of [
    ['app', 'routes', 'campaigns.home-finds.jsx'],
    ['app', 'routes', '[feed.xml].tsx'],
    ['app', 'routes', 'sitemap.$type.$page[.xml].jsx'],
  ]) {
    const source = readSource(...sourcePath);
    if (!source.includes('filterLaunchProducts')) {
      failures.push(
        `${sourcePath.join('/')} does not apply filterLaunchProducts.`,
      );
    }
  }

  const metaPixelSource = readSource('app', 'components', 'MetaPixel.jsx');
  const ga4Source = readSource('app', 'components', 'GoogleAnalytics4.jsx');
  const cartSummarySource = readSource('app', 'components', 'CartSummary.jsx');
  const rootSource = readSource('app', 'root.jsx');
  const productRouteSource = readSource('app', 'routes', 'products.$handle.jsx');
  const campaignRouteSource = readSource(
    'app',
    'routes',
    'campaigns.packing-cubes.jsx',
  );
  const serverSource = readSource('app', 'entry.server.jsx');

  for (const [name, source] of [['Meta Pixel', metaPixelSource]]) {
    if (source.includes("subscribe('cart_viewed'")) {
      failures.push(`${name} still treats a cart view as a checkout start.`);
    }
    if (!source.includes("subscribe('custom_checkout_started'")) {
      failures.push(`${name} does not subscribe to the checkout-click event.`);
    }
    for (const event of [
      'page_viewed',
      'product_viewed',
      'product_added_to_cart',
    ]) {
      if (!source.includes(`subscribe('${event}'`)) {
        failures.push(`${name} does not subscribe to ${event}.`);
      }
    }
    if (!source.includes('analyticsItemId(p)')) {
      failures.push(
        `${name} does not use the selected Shopify variant as the product-view item ID.`,
      );
    }
    if (!source.includes('cartAnalyticsItems(cart)')) {
      failures.push(`${name} does not emit variant-level checkout items.`);
    }
  }

  if (ga4Source.includes("subscribe('cart_viewed'")) {
    failures.push('GA4 still treats a cart view as a checkout start.');
  }
  for (const event of ['product_viewed', 'product_added_to_cart']) {
    if (!ga4Source.includes(`subscribe('${event}'`)) {
      failures.push(`GA4 does not subscribe to ${event}.`);
    }
  }
  for (const checkoutOwnedEvent of ['page_viewed', 'custom_checkout_started']) {
    if (ga4Source.includes(`subscribe('${checkoutOwnedEvent}'`)) {
      failures.push(
        `GA4 storefront bridge duplicates checkout-owned ${checkoutOwnedEvent}.`,
      );
    }
  }
  if (!ga4Source.includes('send_page_view: false')) {
    failures.push('GA4 storefront bridge does not suppress automatic page views.');
  }
  if (!ga4Source.includes('analyticsItemId(p)')) {
    failures.push(
      'GA4 does not use the selected Shopify variant as the product-view item ID.',
    );
  }

  if (!cartSummarySource.includes("publish('custom_checkout_started'")) {
    failures.push('The checkout link does not publish custom_checkout_started.');
  }

  for (const integration of [
    '<MetaPixel pixelId={data.metaPixelId}',
    '<GoogleAnalytics4 measurementId={data.ga4MeasurementId}',
  ]) {
    if (!rootSource.includes(integration)) {
      failures.push(`The root analytics provider is missing ${integration}.`);
    }
  }

  for (const [routeName, source] of [
    ['product route', productRouteSource],
    ['packing-cube campaign route', campaignRouteSource],
  ]) {
    if (!source.includes('<Analytics.ProductView')) {
      failures.push(`${routeName} does not publish a product view.`);
    }
    if (!source.includes('variantId: selectedVariant?.id')) {
      failures.push(`${routeName} product views are missing the selected variant ID.`);
    }
  }

  for (const domain of [
    'connect.facebook.net',
    'www.facebook.com',
    'www.googletagmanager.com',
    'www.google-analytics.com',
  ]) {
    if (!serverSource.includes(domain)) {
      failures.push(`Analytics CSP allowlist is missing ${domain}.`);
    }
  }

  const englishCopy = Object.values(DICTIONARIES.en).join('\n').toLowerCase();
  const unsupportedClaims = [
    'ships within 24 hours',
    'pre-paid return label',
    'prepaid return label',
    'returns are always free',
    'orders ship within 1â€“2 business days',
    'delivery is typically 3â€“7 business days',
    'free shipping across canada',
    'free shipping on everything',
    'no questions, no hassle',
  ];

  for (const claim of unsupportedClaims) {
    if (englishCopy.includes(claim)) {
      failures.push(`Unsupported English storefront claim remains: "${claim}".`);
    }
  }

  const launchPlan = path.join(
    rootDir,
    'docs',
    'us-organization-launch-control-2026-08-01.md',
  );
  if (!fs.existsSync(launchPlan)) {
    failures.push('The U.S. organization launch control is missing.');
  }

  const candidatePath = path.join(
    rootDir,
    'docs',
    'us-organization-candidate-control-2026-08-01.csv',
  );
  const quotePath = path.join(
    rootDir,
    'docs',
    'dsers-two-zip-quote-evidence-2026-08-01.csv',
  );
  const limitedTestPath = path.join(
    rootDir,
    'docs',
    'us-packing-cubes-limited-test-evidence-2026-08-01.json',
  );

  if (!fs.existsSync(candidatePath)) {
    failures.push('The U.S. candidate operational evidence CSV is missing.');
  }
  if (!fs.existsSync(quotePath)) {
    failures.push('The two-ZIP quote evidence CSV is missing.');
  }

  let limitedTestEvidence = null;
  if (fs.existsSync(limitedTestPath)) {
    try {
      limitedTestEvidence = JSON.parse(fs.readFileSync(limitedTestPath, 'utf8'));
    } catch (error) {
      failures.push(`Limited-test evidence JSON is invalid: ${error.message}`);
    }
  }

  if (fs.existsSync(candidatePath) && fs.existsSync(quotePath)) {
    const candidates = parseCsv(fs.readFileSync(candidatePath, 'utf8'));
    const quotes = parseCsv(fs.readFileSync(quotePath, 'utf8'));
    failures.push(
      ...evaluateOperationalEvidence(candidates, quotes, limitedTestEvidence),
    );
  }

  if (
    limitedTestEvidence &&
    normalize(limitedTestEvidence.decision) === LIMITED_TEST_DECISION &&
    !failures.some((failure) => failure.includes('GO_LIMITED_TEST'))
  ) {
    warnings.push(
      'GO_LIMITED_TEST validates a control-file readiness tier only: tracking, delivery, sample/quality and Purchase proof may still be absent. The current action gate is paid HOLD until the no-spend review is completed and the user explicitly authorizes the exact spend cap; scaling remains blocked.',
    );
  }

  return {failures, warnings};
}

export function evaluateOperationalEvidence(
  candidates,
  quotes,
  limitedTestEvidence = null,
) {
  const failures = [];
  const paidCandidates = candidates.filter(
    (candidate) => normalize(candidate.final_decision) === 'GO_PAID_TEST',
  );

  if (!paidCandidates.length) {
    if (
      limitedTestEvidence &&
      normalize(limitedTestEvidence.decision) === LIMITED_TEST_DECISION
    ) {
      return validateLimitedTestEvidence(limitedTestEvidence);
    }
    return [
      'Operational evidence has neither a valid GO_LIMITED_TEST control nor a candidate with final_decision=GO_PAID_TEST; paid traffic must remain off.',
    ];
  }

  const passingCandidates = paidCandidates.filter((candidate) => {
    const candidateFailures = validatePaidCandidate(candidate, quotes);
    if (candidateFailures.length) {
      failures.push(
        ...candidateFailures.map(
          (failure) => `${candidate.product || 'Unnamed candidate'}: ${failure}`,
        ),
      );
      return false;
    }
    return true;
  });

  if (!passingCandidates.length) {
    failures.push('No GO_PAID_TEST candidate has complete operational evidence.');
  }

  return failures;
}

export function validateLimitedTestEvidence(evidence, now = new Date()) {
  const failures = [];
  const requiredFields = [
    'product',
    'shopify_variant_id',
    'exact_option',
    'supplier',
    'supplier_product_url_or_id',
    'mapped_supplier_sku',
    'quote_scope',
    'observed_at_utc',
    'quote_currency',
    'item_cost',
    'supplier_shipping',
    'other_landed_charges',
    'landed_supply_cost',
    'shipping_service',
    'estimated_delivery_days',
    'us_checkout_price',
    'gate_currency',
    'payment_percent_rate',
    'payment_fixed_fee',
    'return_refund_reserve',
    'pre_ad_contribution',
    'pre_ad_contribution_margin',
    'break_even_cac',
    'target_cac',
    'max_daily_ad_spend',
    'max_total_ad_spend',
    'allowed_market',
    'allowed_channel',
    'campaign_objective',
    'optimization_event',
  ];
  const missing = requiredFields.filter((field) => !hasValue(evidence[field]));
  if (missing.length) {
    failures.push(`GO_LIMITED_TEST missing evidence: ${missing.join(', ')}`);
  }

  if (normalize(evidence.quote_scope) !== 'US_COUNTRY_LEVEL') {
    failures.push('GO_LIMITED_TEST quote_scope must be US_COUNTRY_LEVEL.');
  }
  if (
    normalize(evidence.allowed_market) !== 'US' ||
    normalize(evidence.allowed_channel) !== 'META' ||
    normalize(evidence.campaign_objective) !== 'SALES' ||
    normalize(evidence.optimization_event) !== 'PURCHASE'
  ) {
    failures.push(
      'GO_LIMITED_TEST must be restricted to US / Meta / Sales / Purchase.',
    );
  }
  if (!isYes(evidence.first_order_manual_monitoring)) {
    failures.push('GO_LIMITED_TEST requires manual first-order monitoring.');
  }
  if (!isYes(evidence.recheck_before_activation)) {
    failures.push('GO_LIMITED_TEST requires a fresh pre-activation recheck.');
  }
  if (!isYes(evidence.activation_requires_explicit_budget_approval)) {
    failures.push('GO_LIMITED_TEST requires explicit budget approval.');
  }
  if (isYes(evidence.scale_allowed)) {
    failures.push('GO_LIMITED_TEST cannot allow scaling.');
  }

  const itemCost = number(evidence.item_cost);
  const shipping = number(evidence.supplier_shipping);
  const otherLanded = number(evidence.other_landed_charges);
  const landed = number(evidence.landed_supply_cost);
  const price = number(evidence.us_checkout_price);
  const paymentPercent = number(evidence.payment_percent_rate);
  const paymentFixed = number(evidence.payment_fixed_fee);
  const reserve = number(evidence.return_refund_reserve);
  const contribution = number(evidence.pre_ad_contribution);
  const margin = number(evidence.pre_ad_contribution_margin);
  const breakEven = number(evidence.break_even_cac);
  const target = number(evidence.target_cac);
  const dailyCap = number(evidence.max_daily_ad_spend);
  const totalCap = number(evidence.max_total_ad_spend);

  if (!approximatelyEqual(landed, itemCost + shipping + otherLanded)) {
    failures.push('GO_LIMITED_TEST landed_supply_cost does not reconcile.');
  }
  const expectedContribution =
    price - landed - (price * paymentPercent + paymentFixed) - reserve;
  if (!approximatelyEqual(contribution, expectedContribution)) {
    failures.push('GO_LIMITED_TEST pre_ad_contribution does not reconcile.');
  }
  if (!approximatelyEqual(margin, contribution / price, 0.001)) {
    failures.push('GO_LIMITED_TEST contribution margin does not reconcile.');
  }
  if (margin < 0.3) {
    failures.push('GO_LIMITED_TEST contribution margin is below 30%.');
  }
  if (!approximatelyEqual(breakEven, contribution)) {
    failures.push('GO_LIMITED_TEST break_even_cac must equal contribution.');
  }
  if (target <= 0 || target > breakEven * 0.7 + 0.02) {
    failures.push('GO_LIMITED_TEST target_cac exceeds 70% of break-even CAC.');
  }
  if (dailyCap <= 0 || dailyCap > target + 0.02) {
    failures.push('GO_LIMITED_TEST daily spend cap exceeds target CAC.');
  }
  if (totalCap <= 0 || totalCap > 100) {
    failures.push('GO_LIMITED_TEST total spend cap must be between $0 and $100.');
  }

  const observedAt = new Date(evidence.observed_at_utc);
  const ageMs = now.getTime() - observedAt.getTime();
  if (!Number.isFinite(observedAt.getTime()) || ageMs < 0 || ageMs > 7 * 864e5) {
    failures.push('GO_LIMITED_TEST evidence must be no more than seven days old.');
  }

  const sources = Array.isArray(evidence.evidence_sources)
    ? evidence.evidence_sources
    : [];
  if (sources.length < 2) {
    failures.push('GO_LIMITED_TEST requires at least two evidence sources.');
  }
  const pauseConditions = new Set(
    Array.isArray(evidence.pause_conditions)
      ? evidence.pause_conditions.map(normalize)
      : [],
  );
  const missingPauses = [...REQUIRED_LIMITED_TEST_PAUSE_CONDITIONS].filter(
    (condition) => !pauseConditions.has(condition),
  );
  if (missingPauses.length) {
    failures.push(
      `GO_LIMITED_TEST missing pause conditions: ${missingPauses.join(', ')}`,
    );
  }

  return failures;
}

function validatePaidCandidate(candidate, quotes) {
  const failures = [];
  const requiredFields = [
    'shopify_variant_id',
    'mapped_supplier_sku',
    'supplier',
    'supplier_product_url_or_id',
    'ship_from',
    'landed_supply_cost',
    'shipping_service',
    'tracking_available',
    'delivery_min_days',
    'delivery_max_days',
    'supplier_stock',
    'shopify_inventory',
    'us_checkout_price',
    'gate_currency',
    'payment_percent_rate',
    'payment_fixed_fee',
    'return_refund_reserve',
    'pre_ad_contribution',
    'pre_ad_contribution_margin',
    'sample_order_date',
    'sample_cost',
    'sample_delivery_date',
    'actual_landed_charge',
    'quality_result',
  ];
  const missing = requiredFields.filter((field) => !hasValue(candidate[field]));
  if (missing.length) {
    failures.push(`missing candidate evidence: ${missing.join(', ')}`);
  }

  if (number(candidate.pre_ad_contribution_margin) < 0.3) {
    failures.push('pre_ad_contribution_margin is below 30%.');
  }
  if (
    number(candidate.supplier_stock) < 25 ||
    number(candidate.shopify_inventory) < 25
  ) {
    failures.push('supplier and Shopify inventory must each be at least 25.');
  }
  if (!isYes(candidate.tracking_available)) {
    failures.push('candidate tracking_available is not affirmative.');
  }
  if (/^NO_GO/.test(normalize(candidate.initial_decision))) {
    failures.push('initial_decision is still NO_GO and contradicts GO_PAID_TEST.');
  }

  const candidateQuotes = quotes.filter(
    (quote) =>
      String(quote.shopify_variant_id || '') ===
      String(candidate.shopify_variant_id || ''),
  );
  const quotesByZip = new Map(
    candidateQuotes.map((quote) => [String(quote.destination_zip), quote]),
  );
  for (const zip of ['10001', '90001']) {
    const quote = quotesByZip.get(zip);
    if (!quote) {
      failures.push(`missing two-ZIP quote for ${zip}.`);
      continue;
    }
    failures.push(...validateQuote(quote, zip));
  }

  return failures;
}

function validateQuote(quote, zip) {
  const failures = [];
  const requiredFields = [
    'quote_timestamp_utc',
    'evidence_path',
    'quote_currency',
    'gate_currency',
    'fx_to_gate_currency',
    'item_cost',
    'supplier_shipping',
    'landed_supply_cost',
    'shipping_service',
    'dispatch_days',
    'delivery_min_days',
    'delivery_max_days',
    'supplier_stock',
    'shopify_inventory',
    'us_checkout_merchandise_price',
    'payment_percent_rate',
    'payment_fixed_fee',
    'return_refund_reserve',
    'pre_ad_contribution',
    'pre_ad_contribution_margin',
    'decision',
  ];
  const missing = requiredFields.filter((field) => !hasValue(quote[field]));
  if (missing.length) {
    failures.push(`${zip} quote missing: ${missing.join(', ')}`);
  }
  if (!isYes(quote.quote_usable)) failures.push(`${zip} quote is not usable.`);
  if (!isYes(quote.tracking_available)) {
    failures.push(`${zip} quote does not confirm tracking.`);
  }
  if (!isYes(quote.economics_pass)) {
    failures.push(`${zip} quote has not passed economics.`);
  }
  if (number(quote.pre_ad_contribution_margin) < 0.3) {
    failures.push(`${zip} quote margin is below 30%.`);
  }
  if (!APPROVED_QUOTE_DECISIONS.has(normalize(quote.decision))) {
    failures.push(`${zip} quote decision is not approved.`);
  }
  return failures;
}

export function parseCsv(source) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quoted) {
      if (character === '"' && source[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }

  if (field || row.length) {
    row.push(field.replace(/\r$/, ''));
    rows.push(row);
  }

  const [headers = [], ...records] = rows;
  return records
    .filter((record) => record.some((value) => value !== ''))
    .map((record) =>
      Object.fromEntries(headers.map((header, index) => [header, record[index] || ''])),
    );
}

function configuredValue(name, env) {
  return process.env[name] || env[name] || '';
}

function requireConfigured(name, consequence, env, failures) {
  if (!configuredValue(name, env)) {
    failures.push(`${name} is missing: ${consequence}.`);
  }
}

function requireFormat(name, pattern, expectation, env, failures) {
  const value = configuredValue(name, env);
  if (value && !pattern.test(value)) {
    failures.push(`${name} must be ${expectation}.`);
  }
}

function readSource(...segments) {
  return fs.readFileSync(path.join(rootDir, ...segments), 'utf8');
}

function readEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};

  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .reduce((result, line) => {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match) return result;
      result[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
      return result;
    }, {});
}

function hasValue(value) {
  return String(value ?? '').trim() !== '';
}

function normalize(value) {
  return String(value || '').trim().toUpperCase();
}

function isYes(value) {
  return ['YES', 'TRUE', 'PASS'].includes(normalize(value));
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}

function approximatelyEqual(left, right, tolerance = 0.02) {
  return Number.isFinite(left) && Number.isFinite(right) && Math.abs(left - right) <= tolerance;
}

function printResults(failures, warnings) {
  console.log('Puchica U.S. organization launch readiness');
  console.log('===========================================');

  if (!failures.length) {
    console.log(
      'PASS: repository control-file and storefront-code checks are structurally complete.',
    );
    console.log(
      'NOTE: this does not prove supplier tracking, delivery, product quality, production events, Purchase attribution, or authorization to spend.',
    );
  }
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  for (const warning of warnings) console.warn(`WARN: ${warning}`);

  console.log(`\n${failures.length} failure(s), ${warnings.length} warning(s)`);
}
