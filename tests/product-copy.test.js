import test from 'node:test';
import assert from 'node:assert/strict';

import {
  presentLaunchProductCopy,
  presentProductTitle,
} from '../app/lib/product-presentation.js';
import {
  APPROVED_CATALOG_OFFERS,
  ARCHIVED_CATALOG_OFFERS,
} from '../app/lib/launch-catalog.js';

// Copy coverage is audited against both cohorts. Translated copy is evidence
// that outlives a catalogue emptying, and a handle that comes back must not
// come back untranslated - so the archived offers keep being checked.
const COPY_COHORT = [...ARCHIVED_CATALOG_OFFERS, ...APPROVED_CATALOG_OFFERS];
import {DICTIONARIES} from '../app/lib/dictionaries.js';

const LOCALES = ['en', 'fr', 'es', 'pt-br'];
const TRANSLATED = LOCALES.filter((locale) => locale !== 'en');

/** The same lookup the components use: a dictionary read with an `en` fallback. */
const reader = (locale) => (key) => DICTIONARIES[locale][key] ?? key;

test('every approved offer resolves title, summary and description in every locale', () => {
  // A handle missing from LAUNCH_COPY_PREFIX is not a cosmetic gap. It falls
  // through to the raw Shopify title, which is English everywhere, and it does
  // so silently on the collection grid, in the cart, in search and in the
  // pairs-with rail. This is the test that would have caught the cable case.
  assert.ok(COPY_COHORT.length >= 6);
  for (const {handle} of COPY_COHORT) {
    for (const locale of LOCALES) {
      const copy = presentLaunchProductCopy(handle, reader(locale));
      assert.ok(copy, `${locale}: ${handle} has no copy`);
      assert.ok(copy.title.trim(), `${locale}: ${handle} title empty`);
      assert.ok(copy.summary.trim(), `${locale}: ${handle} summary empty`);
      assert.match(
        copy.descriptionHtml,
        /^<[a-z]/,
        `${locale}: ${handle} description is not HTML`,
      );
    }
  }
});

test('no localized title is left in English', () => {
  // The failure this catches is a new product shipped with the English string
  // pasted into all four blocks, which looks translated until a French speaker
  // reads it.
  for (const {handle} of COPY_COHORT) {
    const en = presentLaunchProductCopy(handle, reader('en'));
    for (const locale of TRANSLATED) {
      const other = presentLaunchProductCopy(handle, reader(locale));
      assert.notEqual(
        other.title,
        en.title,
        `${locale}: ${handle} title is still the English one`,
      );
      assert.notEqual(
        other.summary,
        en.summary,
        `${locale}: ${handle} summary is still the English one`,
      );
    }
  }
});

test('the localized title is what the storefront renders', () => {
  // presentProductTitle prefers the dictionary and only falls back to stripping
  // a colour prefix off the Shopify title. Before this fix the cable case took
  // the fallback and rendered "Double-Layer Travel Cable Organizer Case" on
  // /fr, /es and /pt-br.
  const shopifyTitle = 'Black Double-Layer Travel Cable Organizer Case';
  const rendered = presentProductTitle(
    shopifyTitle,
    null,
    'travel-cable-organizer-case',
    reader('fr'),
  );
  assert.equal(rendered, DICTIONARIES.fr.product_copy_cable_title);
  assert.doesNotMatch(rendered, /Double-Layer|Organizer Case/i);
});

test('an unmapped handle still degrades to the cleaned Shopify title', () => {
  // The fallback must keep working: it is what protects a product that is added
  // to Shopify before its copy lands.
  const rendered = presentProductTitle(
    'Black Something Not In The Catalogue',
    null,
    'not-a-real-handle',
    reader('fr'),
  );
  assert.equal(rendered, 'Something Not In The Catalogue');
});

test('the bundle copy does not hard-code a price', () => {
  // Prices live in Shopify, not in the repo, so a figure baked into a
  // translation cannot be checked by anything and goes stale on the next
  // repricing. The savings claim belongs to the price display.
  for (const locale of LOCALES) {
    const copy = presentLaunchProductCopy(
      'the-carry-on-kit-toiletry-organizer-packing-cubes-cable-case',
      reader(locale),
    );
    const text = `${copy.title} ${copy.summary} ${copy.descriptionHtml}`;
    assert.doesNotMatch(text, /\d+[.,]\d{2}/, `${locale}: bundle copy has a price`);
    assert.doesNotMatch(text, /CA\$|USD|\$\s?\d/, `${locale}: bundle copy has a currency`);
  }
});

test('no product copy claims free shipping', () => {
  // Free shipping is a market-specific threshold held in one constant. Copy is
  // market-agnostic, so a claim here would be wrong the moment a market without
  // that threshold opens.
  const claims = /free shipping|livraison gratuite|env[íi]o gratis|frete gr[áa]tis/i;
  for (const {handle} of COPY_COHORT) {
    for (const locale of LOCALES) {
      const copy = presentLaunchProductCopy(handle, reader(locale));
      const text = `${copy.title} ${copy.summary} ${copy.descriptionHtml}`;
      assert.doesNotMatch(text, claims, `${locale}: ${handle} claims free shipping`);
    }
  }
});

test('no product copy claims the goods are handmade or Guatemalan', () => {
  // These are dropshipped goods. The brand is Guatemalan-inspired; the products
  // are not, and saying so would be a false origin claim.
  const banned =
    /handmade|hand-woven|handwoven|artisan|made in guatemala|fait main|artesanal|hecho a mano|feito à mão/i;
  for (const {handle} of COPY_COHORT) {
    for (const locale of LOCALES) {
      const copy = presentLaunchProductCopy(handle, reader(locale));
      const text = `${copy.title} ${copy.summary} ${copy.descriptionHtml}`;
      assert.doesNotMatch(text, banned, `${locale}: ${handle} makes an origin claim`);
    }
  }
});
