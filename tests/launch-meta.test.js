import test from 'node:test';
import assert from 'node:assert/strict';

import {launchMetaCopy} from '../app/lib/launch-meta.js';

test('launch pages publish localized metadata in every supported language', () => {
  for (const locale of ['en', 'fr', 'es', 'pt-br']) {
    for (const country of ['CA', 'US']) {
      const meta = launchMetaCopy(locale, country);
      assert.match(meta.home.title, /Puchica/);
      assert.match(meta.shop.title, /Puchica/);
      assert.ok(meta.home.description.length > 60);
      assert.ok(meta.shop.description.length > 50);
    }
  }
});

test('launch metadata falls back to English and keeps market copy distinct', () => {
  assert.deepEqual(launchMetaCopy('unknown', 'CA'), launchMetaCopy('en', 'CA'));
  assert.notEqual(
    launchMetaCopy('fr', 'CA').home.description,
    launchMetaCopy('fr', 'US').home.description,
  );
});
