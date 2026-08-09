import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const readSource = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('product title is one semantic H1 at every breakpoint', async () => {
  const [product, styles] = await Promise.all([
    readSource('app/routes/products.$handle.jsx'),
    readSource('app/styles/app.css'),
  ]);

  assert.equal(
    product.match(/<h1 className="pk-product__title">/g)?.length,
    1,
  );
  assert.match(product, /className="pk-product__heading"/);
  assert.doesNotMatch(product, /pk-product__(?:mobile|desktop)-heading/);
  assert.match(
    styles,
    /grid-template-areas:\s*'media heading'\s*'media info';/,
  );
  assert.match(
    styles,
    /@media \(max-width:\s*860px\)[\s\S]*?grid-template-areas:\s*'heading'\s*'media'\s*'info';/,
  );
});

test('closed drawers are excluded and opening focus skips the backdrop', async () => {
  const aside = await readSource('app/components/Aside.jsx');

  assert.match(aside, /aria-hidden=\{expanded \? undefined : 'true'\}/);
  assert.match(aside, /inert=\{expanded \? undefined : ''\}/);
  assert.match(aside, /className="close-outside"[\s\S]*?tabIndex=\{-1\}/);
  assert.match(
    aside,
    /button:not\(\[disabled\]\):not\(\[tabindex="-1"\]\)/,
  );
  assert.match(aside, /role="dialog"/);
  assert.match(aside, /aria-labelledby=\{id\}/);
});

test('predictive search loading changes are announced without stealing focus', async () => {
  const layout = await readSource('app/components/PageLayout.jsx');

  assert.match(
    layout,
    /className="pk-search__loading"[\s\S]*?role="status"[\s\S]*?aria-live="polite"/,
  );
});

test('skip link targets the keyboard-focusable main landmark', async () => {
  const layout = await readSource('app/components/PageLayout.jsx');

  assert.match(layout, /href="#main-content"/);
  assert.match(layout, /<main id="main-content" tabIndex=\{-1\}>/);
});
