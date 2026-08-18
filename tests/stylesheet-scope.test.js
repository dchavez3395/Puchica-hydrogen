import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const css = await readFile('app/styles/app.css', 'utf8');
const volcanicBackground = await readFile('public/bg-volcanic-texture.png');

test('stylesheet retains every current storefront surface', () => {
  const currentSurfaces = [
    'pk-header',
    'pk-footer',
    'pk-campaign-hero',
    'pk-campaign-products',
    'pk-campaign-editorial-card',
    'pk-product__hero-band',
    'pk-product__media',
    'pk-product__info',
    'pk-product__purchase-facts',
    'pk-cart-page',
    'pk-cart-error',
    'pk-empty-cart',
    'pk-about-v3',
    'pk-contact',
    'pk-faq',
    'pk-shipping',
    'pk-policy',
    'pk-locale',
    'pk-search',
  ];

  for (const className of currentSurfaces) {
    assert.match(
      css,
      new RegExp(`\\.${className}(?![A-Za-z0-9_-])`),
      `missing current storefront stylesheet surface: ${className}`,
    );
  }
});

test('retired broad-catalog CSS cohorts stay removed', () => {
  for (const className of [
    'pk-hero--bold',
    'pk-cat-grid',
    'pk-pack-campaign',
    'pk-hero__blob',
    'pk-about-values',
  ]) {
    assert.doesNotMatch(
      css,
      new RegExp(`\\.${className}(?![A-Za-z0-9_-])`),
      `retired stylesheet cohort returned: ${className}`,
    );
  }
});

test('decorative background requests resolve to versioned assets', () => {
  assert.match(css, /url\(['"]?\/bg-volcanic-texture\.png/);
  assert.ok(volcanicBackground.byteLength > 0);
});
