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

test('route errors keep a focusable main landmark and reflow inside the viewport', async () => {
  const [root, styles, dictionaries] = await Promise.all([
    readSource('app/root.jsx'),
    readSource('app/styles/app.css'),
    readSource('app/lib/dictionaries.js'),
  ]);

  assert.match(
    root,
    /<main[\s\S]*?id="main-content"[\s\S]*?tabIndex=\{-1\}[\s\S]*?className="route-error pk-route-error"/,
  );
  assert.match(
    styles,
    /\.pk-route-error__panel\s*\{[\s\S]*?box-sizing:\s*border-box;/,
  );
  assert.doesNotMatch(dictionaries, /prepare the new catalog/i);
});

test('cart page and drawer use unique line-list labels', async () => {
  const cartMain = await readSource('app/components/CartMain.jsx');

  assert.match(
    cartMain,
    /layout === 'aside' \? 'cart-lines-aside' : 'cart-lines-page'/,
  );
  assert.match(cartMain, /id=\{cartLinesLabelId\}/);
  assert.match(cartMain, /aria-labelledby=\{cartLinesLabelId\}/);
  assert.doesNotMatch(cartMain, /id="cart-lines"/);
});

test('empty cart follows the heading hierarchy in each layout', async () => {
  const cartMain = await readSource('app/components/CartMain.jsx');

  assert.match(
    cartMain,
    /<CartEmpty hidden=\{cartHasItems\} headingLevel=\{3\} \/>/,
  );
  assert.match(
    cartMain,
    /<CartEmpty hidden=\{cartHasItems\} headingLevel=\{2\} \/>/,
  );
  assert.match(cartMain, /const Heading = headingLevel === 2 \? 'h2' : 'h3';/);
  assert.match(
    cartMain,
    /<Heading className="pk-empty-cart__title">\s*\{t\('cart_empty_title'\)\}\s*<\/Heading>/,
  );
});

test('campaign hero resists min-content overflow at a 320px viewport', async () => {
  const styles = await readSource('app/styles/app.css');
  const contractStart = styles.indexOf('Campaign 320px reflow contract');
  const contractEnd = styles.indexOf(
    '/* Final authority: shared actions',
    contractStart,
  );

  assert.ok(contractStart >= 0);
  assert.ok(contractEnd > contractStart);

  const reflowStyles = styles.slice(contractStart, contractEnd);
  assert.match(reflowStyles, /grid-template-columns:\s*minmax\(0, 1fr\);/);
  assert.match(
    reflowStyles,
    /\.pk-campaign-hero__copy,[\s\S]*?\.pk-campaign-hero__visual\s*\{[\s\S]*?min-width:\s*0;/,
  );
  assert.match(
    reflowStyles,
    /\.pk-campaign-proof\s*\{[\s\S]*?flex-wrap:\s*wrap;[\s\S]*?overflow-x:\s*visible;/,
  );
});

test('market and language menu supports Escape and restores trigger focus', async () => {
  const localeSwitcher = await readSource('app/components/LocaleSwitcher.jsx');

  assert.match(localeSwitcher, /aria-haspopup="menu"/);
  assert.match(localeSwitcher, /role="menu"[\s\S]*?aria-label=\{t\('locale_change_aria'\)\}/);
  assert.match(localeSwitcher, /e\.key !== 'Escape'/);
  assert.match(localeSwitcher, /setOpen\(false\)/);
  assert.match(localeSwitcher, /requestAnimationFrame\(\(\) => trigger\?\.focus\(\)\)/);
  assert.match(
    localeSwitcher,
    /\[role="menu"\] \[role="menuitemradio"\]:not\(\[disabled\]\)/,
  );
});
