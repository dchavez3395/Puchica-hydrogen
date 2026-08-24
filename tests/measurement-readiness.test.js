import test from 'node:test';
import assert from 'node:assert/strict';

import {
  auditMeasurement,
  budgetToMeasureCpa,
  MEDIA_ASSUMPTIONS,
  projectTest,
  TRAFFIC_HYGIENE_CONTROLS,
} from '../scripts/check-measurement-readiness.mjs';

test('a bigger budget buys proportionally more sessions', () => {
  const small = projectTest({budgetCad: 200, ctr: 0.01, cvr: 0.015});
  const large = projectTest({budgetCad: 800, ctr: 0.01, cvr: 0.015});
  assert.ok(Math.abs(large.sessions / small.sessions - 4) < 1e-9);
});

test('CA$200 cannot answer a purchase question', () => {
  const projection = projectTest({budgetCad: 200, ctr: 0.01, cvr: 0.015});
  assert.ok(
    projection.sessions < 100,
    `expected under 100 sessions, got ${projection.sessions}`,
  );
  assert.ok(
    projection.probabilityOfZeroOrders > 0.2,
    'a zero-order result at this budget must remain plausible under a healthy CVR',
  );
  assert.ok(
    projection.expectedOrders < 2,
    'fewer than two expected orders cannot support a CPA estimate',
  );
});

test('CA$200 can answer a funnel-health question', () => {
  const projection = projectTest({budgetCad: 200, ctr: 0.01, cvr: 0.015});
  assert.ok(
    projection.probabilityOfZeroAtc < 0.05,
    'zero add-to-carts must be a genuine signal, not ordinary luck',
  );
  assert.ok(projection.expectedAtc > 5);
});

test('the zero-order probability falls as the budget grows', () => {
  const small = projectTest({budgetCad: 200, ctr: 0.01, cvr: 0.015});
  const large = projectTest({budgetCad: 800, ctr: 0.01, cvr: 0.015});
  assert.ok(large.probabilityOfZeroOrders < small.probabilityOfZeroOrders);
  assert.ok(
    large.probabilityOfZeroOrders < 0.05,
    'CA$800 should make a zero-order result meaningful',
  );
});

test('a higher conversion rate always makes zero orders less likely', () => {
  const low = projectTest({budgetCad: 200, ctr: 0.01, cvr: 0.01});
  const high = projectTest({budgetCad: 200, ctr: 0.01, cvr: 0.02});
  assert.ok(high.probabilityOfZeroOrders < low.probabilityOfZeroOrders);
});

test('cost per click falls as click-through rate rises', () => {
  const poor = projectTest({budgetCad: 200, ctr: 0.008, cvr: 0.015});
  const good = projectTest({budgetCad: 200, ctr: 0.015, cvr: 0.015});
  assert.ok(good.cpc < poor.cpc);
  assert.ok(poor.cpc > 2 && poor.cpc < 3, `unexpected CPC ${poor.cpc}`);
});

test('measuring a CPA costs an order of magnitude more than a smoke test', () => {
  const need = budgetToMeasureCpa({cvr: 0.015});
  assert.ok(
    need.conversionsNeeded > 40 && need.conversionsNeeded < 45,
    `expected ~43 conversions, got ${need.conversionsNeeded}`,
  );
  assert.ok(
    need.budgetCad > 4000,
    `a measured CPA should cost thousands, got ${need.budgetCad}`,
  );
});

test('tighter precision demands a larger budget', () => {
  const loose = budgetToMeasureCpa({cvr: 0.015, precision: 0.5});
  const tight = budgetToMeasureCpa({cvr: 0.015, precision: 0.2});
  assert.ok(tight.budgetCad > loose.budgetCad);
});

test('the custom Meta bridge is a blocking measurement fault', () => {
  const enabled = auditMeasurement({
    env: {PUBLIC_CUSTOM_META_ENABLED: 'true'},
  });
  assert.equal(enabled.failures.length, 1);
  assert.match(enabled.failures[0], /deduplicat/i);

  const disabled = auditMeasurement({
    env: {PUBLIC_CUSTOM_META_ENABLED: 'false'},
  });
  assert.deepEqual(disabled.failures, []);
});

test('the repo default configuration has no blocking fault', () => {
  const audit = auditMeasurement();
  assert.deepEqual(
    audit.failures,
    [],
    'the checked-in configuration must be safe to test with',
  );
  assert.ok(
    audit.warnings.length > 0,
    'the pixel-ID contradiction must still be surfaced',
  );
});

test('traffic hygiene controls cover attribution and self-traffic', () => {
  assert.ok(TRAFFIC_HYGIENE_CONTROLS.length >= 4);
  const joined = TRAFFIC_HYGIENE_CONTROLS.join(' ').toLowerCase();
  assert.match(joined, /utm/);
  assert.match(joined, /own traffic|exclud/);
  assert.match(joined, /bot/);
});

test('media assumptions stay within plausible bounds', () => {
  assert.ok(MEDIA_ASSUMPTIONS.cpmCad > 10 && MEDIA_ASSUMPTIONS.cpmCad < 40);
  assert.ok(
    MEDIA_ASSUMPTIONS.clickToSessionRate > 0.5 &&
      MEDIA_ASSUMPTIONS.clickToSessionRate <= 1,
  );
});
