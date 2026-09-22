import test from 'node:test';
import assert from 'node:assert/strict';

import {readFile} from 'node:fs/promises';

import {
  dropModulePreloadLinks,
  placeTrailingRouterChunksInsideBody,
} from '../app/lib/html-stream.js';

test('deferred router chunks are moved before the document closes', () => {
  const input =
    '<!doctype html><html><head></head><body><main>Shop</main>' +
    '<script type="module">hydrate()</script></body></html>' +
    '<script>enqueue()</script><div hidden>stream</div>';

  const output = placeTrailingRouterChunksInsideBody(input);

  assert.equal(
    output,
    '<!doctype html><html><head></head><body><main>Shop</main>' +
      '<script type="module">hydrate()</script>' +
      '<script>enqueue()</script><div hidden>stream</div></body></html>',
  );
  assert.equal(output.endsWith('</body></html>'), true);
});

test('complete documents and fragments are left unchanged', () => {
  const complete = '<html><body>Shop</body></html>';
  const fragment = '<main>Shop</main>';

  assert.equal(placeTrailingRouterChunksInsideBody(complete), complete);
  assert.equal(placeTrailingRouterChunksInsideBody(fragment), fragment);
});

test('module preload hints are dropped, image preloads and scripts are not', () => {
  // 2026-09-22: the six modulepreload links cost ~0.9 s of mobile LCP by
  // competing with the hero image (work/lighthouse/hero-variants.mjs).
  const html = [
    '<link rel="preload" as="image" media="(max-width: 767px)" imageSrcSet="a.jpg 412w" fetchpriority="high"/>',
    '<link rel="modulepreload" href="/assets/entry.client-abc.js" nonce="n"/>',
    '<link rel="modulepreload" href="/assets/chunk-def.js"/>',
    '<link rel="preconnect" href="https://cdn.shopify.com"/>',
    '<script type="module" src="/assets/entry.client-abc.js"></script>',
  ].join('');
  const out = dropModulePreloadLinks(html);
  assert.doesNotMatch(out, /modulepreload/);
  assert.match(out, /rel="preload" as="image"/);
  assert.match(out, /rel="preconnect"/);
  assert.match(out, /<script type="module" src="\/assets\/entry\.client-abc\.js">/);
});

test('the server entry applies both stream transforms', async () => {
  const entry = await readFile(new URL('../app/entry.server.jsx', import.meta.url), 'utf8');
  assert.match(entry, /dropModulePreloadLinks\(\s*placeTrailingRouterChunksInsideBody\(/);
});
