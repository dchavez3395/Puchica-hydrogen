import test from 'node:test';
import assert from 'node:assert/strict';

import {launchMetaCopy} from '../app/lib/launch-meta.js';
import {utilityMetaCopy} from '../app/lib/utility-meta.js';
import {
  APPROVED_CATALOG_OFFERS,
  ARCHIVED_CATALOG_OFFERS,
  SUSPENDED_COMMERCE_MARKETS,
} from '../app/lib/launch-catalog.js';

const MARKETS = ['CA', 'US'];
const LOCALES = ['en', 'fr', 'es', 'pt-br'];

test('launch pages publish localized metadata in every supported language', () => {
  for (const locale of LOCALES) {
    for (const country of MARKETS) {
      const meta = launchMetaCopy(locale, country);
      assert.match(meta.home.title, /Puchica/);
      assert.match(meta.shop.title, /Puchica/);
      assert.ok(meta.home.description.length > 60);
      assert.ok(meta.shop.description.length > 50);
    }
  }
});

test('utility pages publish localized metadata in every supported language', () => {
  for (const locale of LOCALES) {
    const meta = utilityMetaCopy(locale);
    for (const page of ['cart', 'notFound', 'contact', 'shipping', 'faq']) {
      assert.match(meta[page].title, /Puchica/);
      assert.ok(meta[page].description.length > 50);
    }
    for (const title of Object.values(meta.account)) {
      assert.match(title, /Puchica/);
    }
    assert.match(meta.search.title, /Puchica/);
    assert.match(meta.search.termTitle, /\{term\}/);
    assert.match(meta.search.termDescription, /\{term\}/);
  }
});

test('launch metadata falls back to English', () => {
  assert.deepEqual(launchMetaCopy('unknown', 'CA'), launchMetaCopy('en', 'CA'));
});

/**
 * 2026-09-08. This assertion used to require CA and US descriptions to DIFFER.
 * That was correct while the US was open and Canada was not. The retirement
 * emptied the catalogue and suspended both markets, and at that point a rule
 * demanding market-distinct copy is a licence to keep advertising a cohort
 * that no longer exists - which is exactly what shipped: /collections/all was
 * titled "Shop Watch Roll Travel Cases" while serving nothing.
 *
 * The rule is inverted deliberately, and the guard is what makes inverting it
 * safe. Reopen a market and the first assertion fails, which forces whoever
 * reopens it to write real market copy instead of inheriting the holding text.
 */
test('an open market and a suspended one must not share launch copy', () => {
  // The rule is symmetric and has outlived three reversals of which market is
  // which: whichever market is OPEN must not serve the 'shopping is paused'
  // description, because a shared link would preview as closed over a
  // storefront that is selling. On 2026-09-13 the pair swapped again, CA open
  // and US shut, which is why the assertions below name neither country - they
  // read the market table and derive the rest.
  const open = ['CA', 'US'].filter(
    (m) => !Object.prototype.hasOwnProperty.call(SUSPENDED_COMMERCE_MARKETS, m),
  );
  const shut = ['CA', 'US'].filter((m) =>
    Object.prototype.hasOwnProperty.call(SUSPENDED_COMMERCE_MARKETS, m),
  );
  assert.deepEqual(open, ['CA'], 'CA is the open market as of 2026-09-13');
  assert.deepEqual(shut, ['US'], 'US is the suspended market as of 2026-09-13');
  assert.ok(
    APPROVED_CATALOG_OFFERS.length > 0,
    'an open market with nothing approved means the catalogue and the market table disagree',
  );

  for (const locale of LOCALES) {
    const ca = launchMetaCopy(locale, 'CA');
    const us = launchMetaCopy(locale, 'US');
    assert.notDeepEqual(
      ca.home,
      us.home,
      `${locale}: one market is open and one is paused, so home copy must differ`,
    );
    assert.notDeepEqual(
      ca.shop,
      us.shop,
      `${locale}: one market is open and one is paused, so shop copy must differ`,
    );
    // Titles are shared by design and must stay true in both. A title that
    // named availability would be wrong in one market or the other.
    assert.equal(ca.home.title, us.home.title, locale);
    assert.equal(ca.shop.title, us.shop.title, locale);
    // The open market must not be describing itself as closed. Resolved from
    // the market table rather than written down, so this keeps testing the
    // right country the next time the pair swaps.
    const openCopy = open[0] === 'CA' ? ca : us;
    assert.doesNotMatch(
      openCopy.home.description,
      /paus|pausad|en pause/i,
      locale,
    );
    assert.doesNotMatch(
      openCopy.shop.description,
      /restock|réapprovision|reabastec/i,
      locale,
    );
  }
});

/**
 * The copy must not name a RETIRED PRODUCT while there is nothing to sell.
 * That is the defect this test exists for: on 2026-09-08 /collections/all was
 * titled "Shop Watch Roll Travel Cases" and the home description sold "PU
 * leather watch roll travel cases in three, four and six slots", weeks after
 * the cohort was retired and both markets were suspended.
 *
 * Tokens come from the archived handles rather than a hand-written denylist,
 * so retiring a future cohort tightens this by itself. The frequency split is
 * the load-bearing part: a token in three or more archived handles is a
 * CATEGORY word - "travel", "organizer", "packing" - and stays legal, because
 * naming the category is a positioning choice. A token in one or two handles
 * identifies a PRODUCT - "watch", "leather", "toiletry", "jewelry" - and is
 * a claim about stock that does not exist.
 *
 * Two limits, stated rather than implied. It is English-only, since the
 * handles are English, so the same mistake made only in the French copy would
 * pass. And the split is a heuristic: a category the store only ever sold one
 * of would read as a product word and be banned.
 */
test('English launch metadata names no retired product', () => {
  // Dedupe by handle first. ARCHIVED_CATALOG_OFFERS carries one entry per
  // offer, not per product, so counting offers puts "watch" at 8 and every
  // token above the category threshold - which silently disables this test.
  const handles = new Set(ARCHIVED_CATALOG_OFFERS.map((offer) => offer.handle));
  const frequency = new Map();
  for (const handle of handles) {
    const tokens = new Set(
      String(handle)
        .split('-')
        .filter((token) => token.length >= 5),
    );
    for (const token of tokens) {
      frequency.set(token, (frequency.get(token) ?? 0) + 1);
    }
  }
  assert.ok(frequency.size > 0, 'no archived handles to derive tokens from');

  const productWords = [...frequency]
    .filter(([, count]) => count < 3)
    .map(([token]) => token);
  assert.ok(
    productWords.includes('watch') && !productWords.includes('travel'),
    'the category split moved: re-read it before trusting this test',
  );

  const meta = launchMetaCopy('en', 'US');
  const surfaces = [
    ['home.title', meta.home.title],
    ['home.description', meta.home.description],
    ['shop.title', meta.shop.title],
    ['shop.description', meta.shop.description],
  ];

  for (const [where, text] of surfaces) {
    for (const token of productWords) {
      assert.doesNotMatch(
        text,
        new RegExp(`\\b${token}`, 'i'),
        `${where} still names a retired product ("${token}")`,
      );
    }
  }
});
