/**
 * Discovery cards must show the product, and the fallback must be legible.
 *
 * Measured on the live storefront 2026-09-13, after e57ff22 deployed:
 * /collections/all served 3 cards, 3 placeholders and 0 images. Every card in
 * the catalogue was a grey box with the word "Puchica" in it.
 *
 * The cause was not the fragment and not the payload. COLLECTION_ITEM_FRAGMENT
 * requests featuredImage and Shopify returns it. ProductItem preferred the
 * approved VARIANT's image, and a Shopify variant image is optional - an Admin
 * API read of all ten lighting products returned image: null on every single
 * variant, with a real featuredMedia URL on every product. The photography is
 * attached to the product, never to a variant.
 */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const card = await readFile(
  new URL('../app/components/ProductItem.jsx', import.meta.url),
  'utf8',
);
const css = await readFile(
  new URL('../app/styles/app.css', import.meta.url),
  'utf8',
);
const tokens = await readFile(
  new URL('../app/styles/tokens.css', import.meta.url),
  'utf8',
);

test('a card falls back to the product cover when the variant carries no image', () => {
  assert.match(
    card,
    /variant\?\.image\s*\?\?[\s\S]{0,160}product\.featuredImage/,
    'ProductItem must fall back to product.featuredImage; every variant in this catalogue has image: null',
  );
});

test('the fallback is gated on a single-variant product, not applied blindly', () => {
  // The guard is the whole reason the fallback is safe. On a multi-variant
  // product the cover can depict a colour this market cannot buy, which is the
  // concern the original variant-only rule existed to serve. Removing the gate
  // to "fix more cards" would reintroduce it.
  assert.match(card, /isSingleVariantProduct/);
  assert.match(
    card,
    /isSingleVariantProduct\s*=\s*\(product\.variants\?\.nodes\s*\?\?\s*\[\]\)\.length === 1/,
  );
});

/** Resolve a custom property through one level of var() indirection. */
function token(name) {
  const direct = tokens.match(new RegExp(`${name}:\\s*([^;]+);`));
  assert.ok(direct, `${name} is not defined in tokens.css`);
  const value = direct[1].trim();
  const indirect = value.match(/^var\((--[\w-]+)\)$/);
  return indirect ? token(indirect[1]) : value;
}

const rgb = (hex) => {
  const h = hex.replace('#', '').trim();
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
};

const luminance = (c) => {
  const s = c.map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
};

test('the placeholder text clears WCAG SC 1.4.3 against the card ground', () => {
  const block = css.slice(
    css.indexOf('.pk-card__placeholder-text {'),
    css.indexOf('}', css.indexOf('.pk-card__placeholder-text {')),
  );
  assert.ok(block, '.pk-card__placeholder-text block not found');

  const size = Number(block.match(/font-size:\s*([\d.]+)px/)[1]);
  const weight = Number(block.match(/font-weight:\s*(\d+)/)[1]);
  const opacity = Number(block.match(/opacity:\s*([\d.]+)/)[1]);

  const fg = rgb(token('--pk-ember'));
  const bg = rgb(token('--pk-paper'));
  const blended = fg.map((v, i) => v * opacity + bg[i] * (1 - opacity));
  const [L1, L2] = [luminance(blended), luminance(bg)];
  const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);

  // WCAG large text starts at 18.66px for bold / 24px otherwise. 18px/700 is
  // NOT large, so the 3:1 allowance does not apply. Asserting the threshold
  // rather than hard-coding 4.5 means a future font-size bump is scored
  // correctly instead of silently loosening the test.
  const isLarge = size >= 24 || (size >= 18.66 && weight >= 700);
  const required = isLarge ? 3 : 4.5;

  assert.ok(
    ratio >= required,
    `placeholder text is ${ratio.toFixed(2)}:1 at opacity ${opacity}, needs ${required}:1 (${size}px/${weight}). It measured 3.02:1 live and failed CI.`,
  );
});

test('the hero visual is capped to what the source assets can serve', () => {
  // Every product image in Shopify is 800x800 and they are supplier assets, so
  // there is nothing larger to serve. Uncapped, the hero column resolves to
  // 969px at 1920 and the browser upscales - CI #134's only failure, at a 0.83
  // ratio against the probe's 0.9 floor.
  const SOURCE_WIDTH = 800;
  const m = css.match(
    /@media \(min-width:\s*\d+px\)\s*\{\s*\.pk-campaign-hero\s*\{[^}]*minmax\(\s*\d+px\s*,\s*(\d+)px\s*\)/,
  );
  assert.ok(m, 'no wide-viewport cap on .pk-campaign-hero grid-template-columns');
  const cap = Number(m[1]);
  assert.ok(
    cap <= SOURCE_WIDTH,
    `hero visual column caps at ${cap}px but the source images are ${SOURCE_WIDTH}px wide, so anything above that upscales`,
  );
});
