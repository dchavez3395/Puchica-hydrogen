import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const css = await readFile(
  new URL('../app/styles/app.css', import.meta.url),
  'utf8',
);

/**
 * The `.pk-product__hero` block that owns the frame's shape.
 *
 * There are several: a base one, a late override that wins on desktop, and a
 * `max-width: 860px` block that lifts both caps on small screens. Only one
 * declares `aspect-ratio`, and that is the one under test. Taking the last
 * block in the file instead picks up the mobile override and tests nothing —
 * which is exactly what this helper got wrong the first time.
 */
function heroBlock() {
  const blocks = [];
  for (let i = css.indexOf('.pk-product__hero {'); i > -1; ) {
    blocks.push(css.slice(i, css.indexOf('}', i)));
    i = css.indexOf('.pk-product__hero {', i + 1);
  }
  const shaped = blocks.filter((b) => /aspect-ratio/.test(b));
  assert.equal(
    shaped.length,
    1,
    'exactly one .pk-product__hero block may set aspect-ratio',
  );
  return shaped[0];
}

test('the product hero frame is square, so a square image cannot letterbox', () => {
  const block = heroBlock();

  // The frame used to be 1.08/1. Paired with a max-height clamp it collapsed
  // into a short wide letterbox on any laptop-height window: measured live at
  // 1272x563, the frame rendered 586x360 and the 1:1 image drew at 360x360,
  // leaving 226px — 38% of the frame — as empty padding. Every product image
  // in this catalog is square, so the frame is square.
  assert.match(block, /aspect-ratio:\s*1\s*\/\s*1\b/);
  assert.doesNotMatch(block, /aspect-ratio:\s*1\.08/);
});

test('the hero frame caps width and height together', () => {
  const block = heroBlock();

  // A max-height without a matching max-width is exactly what turned the
  // frame into a letterbox: the height clamped, the width did not, and the
  // aspect-ratio lost. Whatever the cap is, both axes must carry it.
  const maxH = block.match(/max-height:\s*([^;!]+)/);
  const maxW = block.match(/max-width:\s*([^;!]+)/);
  assert.ok(maxH, 'the hero frame must cap its height');
  assert.ok(maxW, 'the hero frame must cap its width');
  assert.equal(
    maxW[1].trim(),
    maxH[1].trim(),
    'max-width and max-height must match or the frame stops being square',
  );
});

test('the logo derives its height from the file', () => {
  // The logo had no CSS rule at all, so the width/height attributes were the
  // only thing sizing it — and the header passed a 3.75:1 box (120x32) for a
  // 3.333:1 file (1200x360), stretching it 12.5% horizontally under the
  // default `object-fit: fill`. Deriving height from the file means neither a
  // typo nor a merchant logo of another ratio can distort it again.
  const start = css.indexOf('.pk-logo__img');
  assert.ok(start > -1, 'the logo must have a CSS rule of its own');
  const block = css.slice(start, css.indexOf('}', start));
  assert.match(block, /height:\s*auto/);
  assert.match(block, /object-fit:\s*contain/);
});

test('both logo tags declare the true 1200x360 aspect ratio', async () => {
  // The attributes stay in the markup so the space is reserved before the
  // file loads; they just have to agree with the file. 120x36 is 3.333:1.
  for (const file of ['Header.jsx', 'Footer.jsx']) {
    const source = await readFile(
      new URL(`../app/components/${file}`, import.meta.url),
      'utf8',
    );
    assert.match(
      source,
      /width=\{120\}\s*\n\s*height=\{36\}/,
      `${file} must size the logo at the file's real 10:3 ratio`,
    );
    assert.doesNotMatch(source, /height=\{32\}/, `${file} still has the 12.5% stretch`);
  }
});

test('breadcrumb links are boxes, so they can meet the target minimum', () => {
  // Measured live at 390px: the "Home" crumb rendered 34x20 — WCAG 2.2 SC
  // 2.5.8 wants 24x24, and a bare inline link's hit area is only its line
  // box. This was the last real finding from the browser checks' first
  // honest run, and the only one of nineteen that turned out to be the site.
  const start = css.indexOf('.pk-breadcrumbs a {');
  assert.ok(start > -1, 'the breadcrumb link rule must exist');
  const block = css.slice(start, css.indexOf('}', start));
  assert.match(block, /display:\s*inline-flex/);
  const min = block.match(/min-height:\s*(\d+)px/);
  assert.ok(min, 'breadcrumb links must set a minimum height');
  assert.ok(
    Number(min[1]) >= 24,
    `min-height ${min?.[1]}px is below the 24px minimum target size`,
  );
});
