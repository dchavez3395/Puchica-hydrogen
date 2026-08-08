import test from 'node:test';
import assert from 'node:assert/strict';

import {
  evaluateOperationalEvidence,
  parseCsv,
  validateLimitedTestEvidence,
} from '../scripts/check-launch-readiness.mjs';

test('CSV parser preserves quoted commas', () => {
  assert.deepEqual(parseCsv('name,notes\nCube,"zipper, seams"\n'), [
    {name: 'Cube', notes: 'zipper, seams'},
  ]);
});

test('launch evidence fails closed without a GO_PAID_TEST candidate', () => {
  assert.deepEqual(
    evaluateOperationalEvidence(
      [{product: 'Cube', final_decision: ''}],
      [],
    ),
    [
      'Operational evidence has neither a valid GO_LIMITED_TEST control nor a candidate with final_decision=GO_PAID_TEST; paid traffic must remain off.',
    ],
  );
});

test('complete GO_LIMITED_TEST evidence can pass without a US sample address', () => {
  const limitedEvidence = completeLimitedEvidence();

  assert.deepEqual(
    evaluateOperationalEvidence(
      [{product: 'Cube', final_decision: ''}],
      [],
      limitedEvidence,
      new Date('2026-08-01T21:00:00Z'),
    ),
    [],
  );
});

test('GO_LIMITED_TEST fails if risk caps or stop controls are weakened', () => {
  const limitedEvidence = completeLimitedEvidence();
  limitedEvidence.max_total_ad_spend = 101;
  limitedEvidence.scale_allowed = true;
  limitedEvidence.pause_conditions = [];

  const failures = validateLimitedTestEvidence(
    limitedEvidence,
    new Date('2026-08-01T21:00:00Z'),
  );

  assert.equal(failures.some((failure) => failure.includes('cannot allow scaling')), true);
  assert.equal(failures.some((failure) => failure.includes('between $0 and $100')), true);
  assert.equal(failures.some((failure) => failure.includes('missing pause conditions')), true);
});

test('GO_LIMITED_TEST evidence expires after seven days', () => {
  const failures = validateLimitedTestEvidence(
    completeLimitedEvidence(),
    new Date('2026-08-09T21:00:00Z'),
  );

  assert.equal(
    failures.includes('GO_LIMITED_TEST evidence must be no more than seven days old.'),
    true,
  );
});

test('GO_PAID_TEST requires complete candidate and two-ZIP evidence', () => {
  const failures = evaluateOperationalEvidence(
    [
      {
        product: 'Cube',
        shopify_variant_id: '123',
        final_decision: 'GO_PAID_TEST',
        pre_ad_contribution_margin: '0.35',
      },
    ],
    [],
  );

  assert.equal(failures.some((failure) => failure.includes('missing candidate evidence')), true);
  assert.equal(failures.some((failure) => failure.includes('missing two-ZIP quote for 10001')), true);
  assert.equal(failures.some((failure) => failure.includes('missing two-ZIP quote for 90001')), true);
  assert.equal(failures.includes('No GO_PAID_TEST candidate has complete operational evidence.'), true);
});

test('complete candidate and two-ZIP evidence can pass', () => {
  const candidate = {
    product: 'Verified Cube',
    shopify_variant_id: '123',
    mapped_supplier_sku: 'supplier-123',
    supplier: 'Verified supplier',
    supplier_product_url_or_id: 'supplier-product-123',
    ship_from: 'China',
    landed_supply_cost: '12.00',
    shipping_service: 'Tracked standard',
    tracking_available: 'YES',
    delivery_min_days: '8',
    delivery_max_days: '13',
    supplier_stock: '100',
    shopify_inventory: '100',
    us_checkout_price: '53.00',
    gate_currency: 'USD',
    payment_percent_rate: '0.029',
    payment_fixed_fee: '0.30',
    return_refund_reserve: '2.00',
    pre_ad_contribution: '25.00',
    pre_ad_contribution_margin: '0.47',
    initial_decision: 'GO_TEST_ORDER',
    sample_order_date: '2026-08-01',
    sample_cost: '14.00',
    sample_delivery_date: '2026-08-12',
    actual_landed_charge: '14.00',
    quality_result: 'PASS',
    final_decision: 'GO_PAID_TEST',
  };
  const quote = {
    shopify_variant_id: '123',
    quote_timestamp_utc: '2026-08-01T12:00:00Z',
    evidence_path: 'evidence.png',
    quote_usable: 'YES',
    quote_currency: 'USD',
    gate_currency: 'USD',
    fx_to_gate_currency: '1',
    item_cost: '10.00',
    supplier_shipping: '2.00',
    landed_supply_cost: '12.00',
    shipping_service: 'Tracked standard',
    tracking_available: 'YES',
    dispatch_days: '2',
    delivery_min_days: '8',
    delivery_max_days: '13',
    supplier_stock: '100',
    shopify_inventory: '100',
    us_checkout_merchandise_price: '53.00',
    payment_percent_rate: '0.029',
    payment_fixed_fee: '0.30',
    return_refund_reserve: '2.00',
    pre_ad_contribution: '25.00',
    pre_ad_contribution_margin: '0.47',
    economics_pass: 'YES',
    decision: 'GO_SAMPLE',
  };

  assert.deepEqual(
    evaluateOperationalEvidence(
      [candidate],
      [
        {...quote, destination_zip: '10001'},
        {...quote, destination_zip: '90001'},
      ],
    ),
    [],
  );
});

function completeLimitedEvidence() {
  return {
    decision: 'GO_LIMITED_TEST',
    product: 'Red 5-Piece Compression Packing Cube Set',
    shopify_variant_id: '49961853026554',
    exact_option: '5PCS Set Red',
    mapped_supplier_sku: '14:100018786#5PCS Set Red',
    supplier: 'AliExpress via DSers',
    supplier_product_url_or_id: 'https://example.com/product',
    quote_scope: 'US_COUNTRY_LEVEL',
    observed_at_utc: '2026-08-01T20:30:00Z',
    quote_currency: 'USD',
    gate_currency: 'USD',
    item_cost: 20.39,
    supplier_shipping: 1.99,
    other_landed_charges: 0,
    landed_supply_cost: 22.38,
    shipping_service: 'AliExpress Selection Standard',
    estimated_delivery_days: 6,
    us_checkout_price: 52,
    payment_percent_rate: 0.029,
    payment_fixed_fee: 0.3,
    return_refund_reserve: 2.6,
    pre_ad_contribution: 25.212,
    pre_ad_contribution_margin: 0.4848461538,
    break_even_cac: 25.212,
    target_cac: 17.6484,
    max_daily_ad_spend: 17.6484,
    max_total_ad_spend: 100,
    allowed_market: 'US',
    allowed_channel: 'META',
    campaign_objective: 'SALES',
    optimization_event: 'PURCHASE',
    first_order_manual_monitoring: true,
    recheck_before_activation: true,
    activation_requires_explicit_budget_approval: true,
    scale_allowed: false,
    evidence_sources: ['https://example.com/dsers', 'https://example.com/aliexpress'],
    pause_conditions: [
      'SUPPLIER_COST_OR_ROUTE_CHANGES',
      'ORDER_NOT_PROCESSED_WITHIN_3_DAYS',
      'TRACKING_NOT_ISSUED_WITHIN_48_HOURS_OF_FULFILLMENT',
      'PRODUCT_MISMATCH_DEFECT_OR_CUSTOMER_COMPLAINT',
      'MISSING_OR_DUPLICATE_PURCHASE_EVENT',
      'BLENDED_CAC_REACHES_BREAK_EVEN',
    ],
  };
}
