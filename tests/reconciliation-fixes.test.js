import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DICTIONARIES} from '../app/lib/dictionaries.js';
import {
  captureCartSubmission,
  isFeedbackForCurrentSelection,
} from '../app/lib/cart-feedback.js';
import {getVariantUrl} from '../app/lib/variants.js';

test('cart removal refreshes the drawer and route data', async () => {
  const source = await readFile(
    new URL('../app/components/CartLineItem.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /CartLineRemoveSubmitButton/);
  assert.match(source, /puchica:cart-updated/);
  assert.match(source, /revalidator\.revalidate\(\)/);
});

test('add-to-cart feedback resets when the selected variant changes', async () => {
  const source = await readFile(
    new URL('../app/components/AddToCartButton.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /const attemptedIdsKey = attemptedMerchandiseIds\.join/);
  assert.match(
    source,
    /useEffect\(\(\) => \{\s*setShowAdded\(false\);\s*setShowError\(false\);\s*\}, \[attemptedIdsKey\]\)/,
  );

  const started = captureCartSubmission({
    isSubmitting: true,
    wasSubmitting: false,
    attemptedIdsKey: 'coffee',
    submittedIdsKey: '',
  });
  assert.deepEqual(started, {
    wasSubmitting: true,
    submittedIdsKey: 'coffee',
  });

  const switchedWhileSubmitting = captureCartSubmission({
    isSubmitting: true,
    wasSubmitting: started.wasSubmitting,
    attemptedIdsKey: 'black',
    submittedIdsKey: started.submittedIdsKey,
  });
  assert.equal(switchedWhileSubmitting.submittedIdsKey, 'coffee');
  assert.equal(isFeedbackForCurrentSelection('coffee', 'black'), false);
  assert.equal(isFeedbackForCurrentSelection('black', 'black'), true);
});

test('direct cart visits publish the native Hydrogen cart-view event', async () => {
  const source = await readFile(
    new URL('../app/routes/cart.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /<Analytics\.CartView\s*\/>/);
});

test('launch check treats view_cart as cart engagement, not checkout start', async () => {
  const source = await readFile(
    new URL('../scripts/check-launch-readiness.mjs', import.meta.url),
    'utf8',
  );

  assert.doesNotMatch(
    source,
    /GA4 still treats a cart view as a checkout start/,
  );
  assert.match(
    source,
    /forbidding the storefront bridge[\s\S]*custom_checkout_started/,
  );
});

test('disabled packing-cubes campaign is not required to emit ProductView', async () => {
  const source = await readFile(
    new URL('../scripts/check-launch-readiness.mjs', import.meta.url),
    'utf8',
  );

  assert.doesNotMatch(source, /packing-cube campaign route/);
  assert.match(source, /product route does not publish a product view/);
});

test('missing checkout URLs remain recoverable in every locale', async () => {
  const source = await readFile(
    new URL('../app/components/CartSummary.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /if \(disabled\) return null/);
  assert.match(source, /window\.location\.reload\(\)/);
  for (const locale of ['en', 'fr', 'es', 'pt-br']) {
    assert.ok(DICTIONARIES[locale].cart_checkout_retry);
  }
});

test('Portuguese Storefront language codes self-canonicalize to pt-br URLs', async () => {
  const source = await readFile(
    new URL('../app/routes/products.$handle.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /\.toLowerCase\(\)\s*\.replace\(\/_\/g, '-'/);
  assert.match(source, /\['fr', 'es', 'pt-br'\]\.includes\(langCode\)/);
});

test('variant links preserve every live storefront locale', () => {
  for (const locale of ['fr', 'es', 'pt-br']) {
    const url = getVariantUrl({
      handle: 'white-semi-circular-travel-jewelry-case',
      pathname: `/${locale}/products/current-product`,
      searchParams: new URLSearchParams('utm_source=organic'),
      selectedOptions: [{name: 'Color', value: 'White'}],
    });
    assert.equal(
      url,
      `/${locale}/products/white-semi-circular-travel-jewelry-case?` +
        'utm_source=organic&Color=White',
    );
  }

  assert.equal(
    getVariantUrl({
      handle: '3-piece-packing-cube-set',
      pathname: '/products/current-product',
      searchParams: new URLSearchParams(),
    }),
    '/products/3-piece-packing-cube-set',
  );
});

test('localized product structured data stays on the localized URL', async () => {
  const productSource = await readFile(
    new URL('../app/routes/products.$handle.jsx', import.meta.url),
    'utf8',
  );
  const seoSource = await readFile(
    new URL('../app/lib/seo.js', import.meta.url),
    'utf8',
  );

  assert.match(
    productSource,
    /canonical\(`\/products\/\$\{product\.handle\}`,[\s\S]*?langKey\)/,
  );
  assert.match(productSource, /breadcrumbJsonLd\([\s\S]*?langKey/);
  assert.match(seoSource, /item: canonical\(item\.url, langKey\)/);
});

test('cart fallback links preserve the active storefront language', async () => {
  const source = await readFile(
    new URL('../app/components/Header.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /LocalizedLink as Link/);
  assert.match(source, /<Link\s+to="\/cart"/);
  assert.doesNotMatch(source, /href="\/cart"/);
});
