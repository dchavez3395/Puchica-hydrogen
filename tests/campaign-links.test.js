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

test('the reopened United States market still yields no Stage 1 links', () => {
  // The US stopped being a suspended MARKET on 2026-09-01: the de minimis
  // evidence was rescoped to the cn-direct route into it. Paid links must
  // still refuse to build, but for the reason that is actually true now -
  // every Stage 1 creative was shot for black-travel-tech-case, which is
  // archived and approved in neither market. Asserting the exact refusal is
  // the point of the test: a link that builds, or that is refused for a stale
  // reason, is ad spend pointed at a 404.
  // Suspended again 2026-09-08: the watch-roll cohort that reopened the US on
  // 2026-09-01 was retired on the Amazon undercut test, so the market has
  // nothing to sell. The ROUTE facts are unchanged and still asserted below.
  assert.equal(isMarketSuspended('US'), true, 'US suspended: nothing to sell');

  const result = buildCampaignLinks({market: 'US'});
  assert.equal(result.links.length, 0, 'no approved US creative exists yet');
  for (const creative of STAGE_1_CREATIVES) {
    assert.ok(
      result.failures.includes(
        `${creative.content}: ${creative.handle} is not an approved US offer.`,
      ),
      `${creative.content} must be refused as unapproved, not as suspended`,
    );
  }
  // Both refusals are now true at once and both must be stated. The market is
  // suspended AND the creative's handle is unapproved; if the suspension were
  // lifted tomorrow the links must still refuse, so the unapproved reason
  // asserted above is the one that has to survive on its own.
  assert.ok(
    result.failures.some((f) => /US is commercially suspended/.test(f)),
    'a suspended market must say so',
  );
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
  // This held when every product post was refused (CA suspended, handles
  // deleted) and it holds now that all three build against the live US
  // cohort. The one canonical campaign value is what the test protects, and
  // it has to survive both states - which is why the failure loop below is
  // written to pass vacuously rather than to require failures.
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
