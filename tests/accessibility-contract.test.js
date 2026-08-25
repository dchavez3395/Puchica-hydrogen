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

test('product-card titles remain fully visible at narrow and zoomed widths', async () => {
  const styles = await readSource('app/styles/app.css');
  const contractStart = styles.indexOf('Product-card text-resize contract');

  assert.ok(contractStart >= 0);
  const resizeStyles = styles.slice(contractStart);
  assert.match(resizeStyles, /@media \(max-width:\s*700px\)/);
  assert.match(
    resizeStyles,
    /\.pk-card__title\s*\{[\s\S]*?-webkit-line-clamp:\s*unset;[\s\S]*?overflow:\s*visible;/,
  );
  assert.match(resizeStyles, /min-height:\s*0;/);
});

test('reduced-motion preference neutralizes continuous storefront motion', async () => {
  const styles = await readSource('app/styles/app.css');

  assert.match(
    styles,
    /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?animation-duration:\s*0\.01ms !important;[\s\S]*?animation-iteration-count:\s*1 !important;[\s\S]*?transition-duration:\s*0\.01ms !important;/,
  );
  assert.match(
    styles,
    /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.pk-stock-urgency__dot\s*\{\s*animation:\s*none;/,
  );
});

test('market and language menu supports Escape and restores trigger focus', async () => {
  const localeSwitcher = await readSource('app/components/LocaleSwitcher.jsx');

  assert.match(localeSwitcher, /aria-haspopup="menu"/);
  assert.match(localeSwitcher, /role="menu"[\s\S]*?aria-label=\{t\('locale_change_aria'\)\}/);
  assert.match(localeSwitcher, /e\.key === 'Escape'/);
  assert.match(localeSwitcher, /setOpen\(false\)/);
  assert.match(localeSwitcher, /requestAnimationFrame\(\(\) => trigger\?\.focus\(\)\)/);
  assert.match(
    localeSwitcher,
    /\[role="menu"\] \[role="menuitemradio"\]:not\(\[disabled\]\)/,
  );
  // The menu roles promise the ARIA menu keyboard model, so arrow-key
  // navigation must exist (2026-08-25 WCAG audit, 2.1.1 finding).
  assert.match(localeSwitcher, /'ArrowDown', 'ArrowUp', 'Home', 'End'/);
  // Escape must be claimed via preventDefault in the capture phase so an
  // enclosing drawer (Aside) leaves the drawer open when only the menu
  // should close.
  assert.match(localeSwitcher, /addEventListener\('keydown', onKeyDown, true\)/);
  const aside = await readSource('app/components/Aside.jsx');
  assert.match(aside, /event\.key === 'Escape' && !event\.defaultPrevented/);
});

test('the focus ring stays above 3:1 on the dark footer', async () => {
  const styles = await readSource('app/styles/app.css');

  // The shared indicator colour, and the override the footer re-points it to.
  const light = styles.match(/--pk-a11y-focus:\s*(#[0-9a-fA-F]{6})/)?.[1];
  const footerBlock = styles.match(
    /\.pk-footer\s*\{[^}]*--pk-a11y-focus:\s*(#[0-9a-fA-F]{6})[^}]*\}/,
  );

  assert.equal(light, '#1F5FA8');
  assert.ok(
    footerBlock,
    '.pk-footer must re-point --pk-a11y-focus; the shared blue is 2.76:1 on #101828',
  );

  const FOOTER_BG = '#101828';
  assert.ok(
    contrastRatio(light, FOOTER_BG) < 3,
    'guard assumes the shared ring fails on the footer; if it now passes, drop the override',
  );
  assert.ok(
    contrastRatio(footerBlock[1], FOOTER_BG) >= 3,
    `footer focus ring ${footerBlock[1]} is ${contrastRatio(
      footerBlock[1],
      FOOTER_BG,
    ).toFixed(2)}:1 on ${FOOTER_BG}; SC 1.4.11 requires 3:1`,
  );
});

test('the focus halo tracks the ring token rather than a hardcoded blue', async () => {
  const styles = await readSource('app/styles/app.css');

  assert.match(
    styles,
    /box-shadow:\s*0 0 0 6px\s*color-mix\(in srgb, var\(--pk-a11y-focus\) 18%, transparent\)/,
  );
});

/** WCAG 2.x relative luminance and contrast ratio for two opaque hex colours. */
function contrastRatio(a, b) {
  const luminance = (hex) => {
    const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const [r, g, bl] = channels.map((c) =>
      c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
    );
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
