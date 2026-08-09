import test from 'node:test';
import assert from 'node:assert/strict';

import {placeTrailingRouterChunksInsideBody} from '../app/lib/html-stream.js';

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
