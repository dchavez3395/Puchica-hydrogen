import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildCampaignLinks,
  buildUtm,
  DEFAULT_CAMPAIGN,
  STAGE_1_CREATIVES,
  STORE_ORIGIN,
  validateDestination,
} from '../scripts/build-campaign-links.mjs';
import {
  OPERATIONAL_HOLD_HANDLES,
  RETIRED_CATALOG_HANDLES,
} from '../app/lib/launch-catalog.js';

test('every Stage 1 creative points at a sellable Canadian offer', () => {
  const result = buildCampaignLinks();
  assert.deepEqual(result.failures, []);
  assert.equal(result.links.length, STAGE_1_CREATIVES.length);
});

test('a retired handle never gets a link', () => {
  const retired = [...RETIRED_CATALOG_HANDLES][0];
  assert.ok(retired, 'expected at least one retired handle to exist');

  const problems = validateDestination(retired);
  assert.ok(problems.some((p) => /retired/.test(p)));

  const result = buildCampaignLinks({
    creatives: [{content: 'x', handle: retired, angle: 'n/a'}],
  });
  assert.equal(result.links.length, 0, 'a retired product must not be linked');
  assert.ok(result.failures.length > 0);
});

test('a held handle never gets a link', () => {
  const held = [...OPERATIONAL_HOLD_HANDLES][0];
  assert.ok(held, 'expected at least one held handle to exist');

  const result = buildCampaignLinks({
    creatives: [{content: 'x', handle: held, angle: 'n/a'}],
  });
  assert.equal(result.links.length, 0);
  assert.ok(result.failures.some((f) => /hold/.test(f)));
});

test('an unknown handle never gets a link', () => {
  const result = buildCampaignLinks({
    creatives: [{content: 'x', handle: 'not-a-real-product', angle: 'n/a'}],
  });
  assert.equal(result.links.length, 0);
  assert.ok(result.failures.some((f) => /not an approved/.test(f)));
});

test('the suspended United States market yields no links', () => {
  const result = buildCampaignLinks({market: 'US'});
  assert.equal(result.links.length, 0, 'US is commercially suspended');
  assert.ok(result.failures.some((f) => /suspended/.test(f)));
});

test('links carry the full five-part UTM scheme', () => {
  const {links} = buildCampaignLinks();
  for (const link of links) {
    const url = new URL(link.url);
    assert.equal(url.origin, STORE_ORIGIN);
    assert.equal(url.searchParams.get('utm_source'), 'meta');
    assert.equal(url.searchParams.get('utm_medium'), 'paid_social');
    assert.equal(url.searchParams.get('utm_campaign'), DEFAULT_CAMPAIGN);
    assert.equal(url.searchParams.get('utm_content'), link.content);
    assert.ok(url.searchParams.get('utm_term'));
  }
});

test('every creative is separately attributable', () => {
  const {links} = buildCampaignLinks();
  const contents = links.map((link) => link.content);
  assert.equal(
    new Set(contents).size,
    contents.length,
    'duplicate utm_content would make two creatives indistinguishable',
  );
});

test('the campaign name flows into every link', () => {
  const {links} = buildCampaignLinks({campaign: 'custom-name'});
  for (const link of links) {
    assert.equal(
      new URL(link.url).searchParams.get('utm_campaign'),
      'custom-name',
    );
  }
});

test('buildUtm is stable and complete', () => {
  const utm = buildUtm({campaign: 'c', content: 'v'});
  assert.deepEqual(Object.keys(utm).sort(), [
    'utm_campaign',
    'utm_content',
    'utm_medium',
    'utm_source',
    'utm_term',
  ]);
});

test('the creative count stays small enough to read', () => {
  assert.ok(
    STAGE_1_CREATIVES.length <= 3,
    'more than three variants cannot reach a readable sample at ~87 sessions',
  );
});
