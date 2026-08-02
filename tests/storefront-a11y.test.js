import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Analytics, useAnalytics} from '@shopify/hydrogen';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('cart line-item labels remain unique across drawer and page layouts', async () => {
  const source = await read('../app/components/CartMain.jsx');

  assert.match(source, /const lineItemsLabelId = `cart-lines-\$\{layout\}`/);
  assert.match(source, /id=\{lineItemsLabelId\}/);
  assert.match(source, /aria-labelledby=\{lineItemsLabelId\}/);
  assert.doesNotMatch(source, /id=["']cart-lines["']/);
});

test('drawer and results-page search inputs use persistent labels', async () => {
  const [layout, searchRoute] = await Promise.all([
    read('../app/components/PageLayout.jsx'),
    read('../app/routes/search.jsx'),
  ]);

  for (const source of [layout, searchRoute]) {
    assert.match(source, /<label className="sr-only" htmlFor=\{inputId\}>/);
    assert.match(source, /id=\{inputId\}/);
  }
});

test('campaign eyebrow has a high-contrast treatment on the dark offer', async () => {
  const css = await read('../app/styles/app.css');

  assert.match(
    css,
    /\.pk-pack-offer \.pk-pack-eyebrow \{ color: #86dec3; \}/,
  );
});

test('root error boundary preserves metadata and page landmarks', async () => {
  const root = await read('../app/root.jsx');

  assert.match(root, /Page not found – Puchica/);
  assert.match(root, /name: 'robots', content: 'noindex, nofollow'/);
  assert.match(root, /<Analytics\.Provider/);
  assert.match(root, /<PageLayout \{\.\.\.rootData\}>\{errorContent\}<\/PageLayout>/);
  assert.match(root, /return <main id="main-content">\{errorContent\}<\/main>/);
});

test('Hydrogen analytics consumer renders inside Analytics.Provider', () => {
  function AnalyticsConsumer() {
    const analytics = useAnalytics();
    return createElement('span', null, analytics ? 'analytics-ready' : 'missing');
  }

  const html = renderToStaticMarkup(
    createElement(
      Analytics.Provider,
      {cart: null, consent: null, shop: null},
      createElement(AnalyticsConsumer),
    ),
  );
  assert.match(html, /analytics-ready/);
});
