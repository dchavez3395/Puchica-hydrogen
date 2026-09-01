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
  isMarketSuspended,
  OPERATIONAL_HOLD_HANDLES,
  RETIRED_CATALOG_HANDLES,
} from '../app/lib/launch-catalog.js';

test('no Stage 1 creative can be linked while Canada is suspended', () => {
  // This test used to assert every creative produced a link. Canada was
  // suspended on 2026-09-01 because the approved handles were deleted from
  // Shopify, so the honest assertion is the inverse: paid links must refuse
  // to build at all. Spending on a link to a product that does not exist is
  // the exact failure the destination gate is here to prevent.
  assert.equal(isMarketSuspended('CA'), true, 'CA is suspended while empty');

  const result = buildCampaignLinks();
  assert.equal(result.links.length, 0, 'a suspended market yields no ad links');
  assert.ok(STAGE_1_CREATIVES.length > 0, 'the creative set is not empty');

  for (const creative of STAGE_1_CREATIVES) {
    assert.ok(
      result.failures.includes(
        `${creative.content}: CA is commercially suspended.`,
      ),
      `${creative.content} must be refused for suspension`,
    );
    // The creative-to-handle mapping itself is still sound - nothing here is
    // retired or held. When CA reopens, only the approval list has to change.
    assert.equal(RETIRED_CATALOG_HANDLES.has(creative.handle), false);
    assert.equal(OPERATIONAL_HOLD_HANDLES.has(creative.handle), false);
  }
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

test('organic relaunch links all carry the one canonical campaign', async () => {
  const {buildOrganicLinks, ORGANIC_CAMPAIGN} = await import(
    '../scripts/build-campaign-links.mjs'
  );
  const result = buildOrganicLinks();
  // Product posts are refused while CA is suspended; the posts that point at
  // the home page still build. Whatever survives must carry the one canonical
  // campaign - that single value is what this test exists to protect, and it
  // has to hold in both states.
  assert.ok(result.links.length > 0, 'home-page posts still build');
  for (const failure of result.failures) {
    assert.match(
      failure,
      /commercially suspended|is not an approved/,
      `only suspension may drop a post, got: ${failure}`,
    );
  }
  for (const link of result.links) {
    const url = new URL(link.url);
    assert.equal(url.searchParams.get('utm_campaign'), ORGANIC_CAMPAIGN);
    assert.equal(url.searchParams.get('utm_medium'), 'organic_social');
    assert.ok(['instagram', 'tiktok'].includes(url.searchParams.get('utm_source')));
  }
});

test('organic calendar only points at gate-approved products or home', async () => {
  const {buildOrganicLinks, ORGANIC_CALENDAR} = await import(
    '../scripts/build-campaign-links.mjs'
  );
  // A retired handle in the calendar must be refused, not linked - the same
  // guarantee the paid mode gives. The luggage-tag video died this way.
  const poisoned = [...ORGANIC_CALENDAR, {day: 8, platform: 'tiktok', content: 'dead', handle: 'white-luggage-id-tag'}];
  const result = buildOrganicLinks({calendar: poisoned});
  assert.ok(result.failures.some((f) => /retired/.test(f)));
  assert.ok(!result.links.some((l) => l.handle === 'white-luggage-id-tag'));
});

test('organic content tokens are unique so per-post attribution works', async () => {
  const {ORGANIC_CALENDAR} = await import('../scripts/build-campaign-links.mjs');
  const tokens = ORGANIC_CALENDAR.map((p) => p.content);
  assert.equal(new Set(tokens).size, tokens.length);
});

test('the tiktok bio redirect and the organic calendar share one campaign', async () => {
  const {ORGANIC_CAMPAIGN} = await import('../scripts/build-campaign-links.mjs');
  // Imported from the plain lib module, not the route: the route pulls in
  // react-router, which used to make this assertion skip itself in any
  // environment that could not load it.
  const {TIKTOK_ATTRIBUTION} = await import('../app/lib/social-bio-links.js');
  assert.equal(TIKTOK_ATTRIBUTION.utm_campaign, ORGANIC_CAMPAIGN);
});
