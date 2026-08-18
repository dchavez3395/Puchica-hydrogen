import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';

const routes = [
  'app/routes/blogs._index.jsx',
  'app/routes/blogs.$blogHandle._index.jsx',
  'app/routes/blogs.$blogHandle.$articleHandle.jsx',
  'app/routes/campaigns.home-finds.jsx',
  'app/routes/campaigns.packing-cubes.jsx',
];

test('legacy editorial and campaign routes permanently consolidate', () => {
  for (const route of routes) {
    const source = readFileSync(route, 'utf8');
    assert.match(source, /localizePath\([\s\S]*params\?\.locale \|\| 'en'/);
    assert.match(source, /, 301\)/);
    assert.doesNotMatch(source, /context\.storefront\.query/);
  }
});

test('newsletter endpoint cannot create customer accounts', () => {
  const source = readFileSync('app/routes/newsletter.jsx', 'utf8');
  assert.doesNotMatch(source, /customerCreate|acceptsMarketing|cryptoRandomPassword/);
  assert.match(source, /status: 410/);
  assert.match(source, /Cache-Control': 'no-store/);
});
