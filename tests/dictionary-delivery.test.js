import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

import {
  getProductCopyHtml,
  getRequestDictionary,
} from '../app/lib/dictionaries.server.js';
import {presentLaunchProductCopy} from '../app/lib/product-presentation.js';

test('server selects one complete request dictionary with English fallback', () => {
  const french = getRequestDictionary('FR');
  assert.equal(french.locale_market_ca, 'Canada');
  assert.ok(french.product_add_to_cart);
  assert.ok(french.pdp_meta_description_fallback);
});

test('client translation helper does not bundle all locale dictionaries', () => {
  const helper = readFileSync('app/lib/t.js', 'utf8');
  const productRoute = readFileSync('app/routes/products.$handle.jsx', 'utf8');
  const rootRoute = readFileSync('app/root.jsx', 'utf8');

  assert.doesNotMatch(helper, /lib\/dictionaries/);
  // The product route may import the .server module (loader-only, stripped
  // from the client bundle) but never the dictionaries themselves.
  assert.doesNotMatch(productRoute, /lib\/dictionaries(?!\.server)/);
  assert.match(productRoute, /getProductCopyHtml\(/);
  assert.match(rootRoute, /lib\/dictionaries\.server/);
  assert.match(rootRoute, /dictionary: getRequestDictionary/);
});

test('the request dictionary omits product description HTML; the product route adds its own', () => {
  // product_copy_*_html was ~70 KB per locale on every page (2026-09-18
  // Lighthouse: a 148 KB inline payload). Only one PDP needs one of them.
  for (const language of ['EN', 'FR', 'ES', 'PT_BR']) {
    const dictionary = getRequestDictionary(language);
    const htmlKeys = Object.keys(dictionary).filter(
      (k) => k.startsWith('product_copy_') && k.endsWith('_html'),
    );
    assert.deepEqual(htmlKeys, [], `${language} still ships ${htmlKeys.length} html keys`);
    // Localized card titles must survive the slimming.
    assert.ok(dictionary.product_copy_wovenglobe25_title);
    const copy = getProductCopyHtml(language, 'woven-bamboo-globe-pendant-25cm');
    assert.deepEqual(Object.keys(copy), ['product_copy_wovenglobe25_html']);
    assert.match(copy.product_copy_wovenglobe25_html, /<h2>/);
  }
  assert.deepEqual(getProductCopyHtml('EN', 'not-a-launch-handle'), {});
  const titleOnly = presentLaunchProductCopy(
    'woven-bamboo-globe-pendant-25cm',
    getRequestDictionary('FR'),
  );
  assert.ok(titleOnly?.title, 'card title must resolve without the html key');
  assert.equal(titleOnly.descriptionHtml, '');
});

test('focused launch homepage is translated in every supported language', () => {
  for (const language of ['EN', 'FR', 'ES', 'PT_BR']) {
    const dictionary = getRequestDictionary(language);
    for (const key of [
      'launch_home_eyebrow',
      'launch_home_title',
      'launch_home_hero_body_focused',
      'launch_home_shop_edit',
      'launch_home_assurance_shipping',
      'launch_home_section_title_focused',
      'launch_home_view_product',
    ]) {
      assert.ok(dictionary[key]?.trim(), `${language} is missing ${key}`);
    }
  }

  const landing = readFileSync('app/components/SmallSpaceLanding.jsx', 'utf8');
  assert.match(landing, /const heroDisplayTitle = heroFeature/);
  assert.match(landing, /<strong>\{heroDisplayTitle\}<\/strong>/);
  assert.doesNotMatch(landing, /<strong>\{heroFeature\.title\}<\/strong>/);
});

test('returning-cart reminder stays localized', () => {
  for (const language of ['EN', 'FR', 'ES', 'PT_BR']) {
    const dictionary = getRequestDictionary(language);
    for (const key of [
      'cart_recovery_one',
      'cart_recovery_many',
      'cart_recovery_cta',
      'cart_recovery_dismiss',
      'atc_add_failed',
    ]) {
      assert.ok(dictionary[key]?.trim(), `${language} is missing ${key}`);
    }
  }

  const banner = readFileSync('app/components/CartRecoveryBanner.jsx', 'utf8');
  assert.match(banner, /presentProductTitle/);
  assert.match(banner, /try\s*\{[\s\S]*sessionStorage\.getItem/);
  assert.match(banner, /LocalizedLink as Link/);
  assert.doesNotMatch(banner, /Welcome back|Complete your order|Dismiss cart reminder/);
});

test('product names stay localized through purchase-adjacent surfaces', () => {
  for (const path of [
    'app/components/CartLineItem.jsx',
    'app/components/SearchResultsPredictive.jsx',
  ]) {
    assert.match(readFileSync(path, 'utf8'), /presentProductTitle/);
  }

  const productRoute = readFileSync('app/routes/products.$handle.jsx', 'utf8');
  assert.match(productRoute, /productTitle=\{displayTitle\}/);
  assert.match(productRoute, /pk-mob-cart__title">\{productTitle\}/);
});
