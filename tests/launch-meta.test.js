import test from 'node:test';
import assert from 'node:assert/strict';

import {launchMetaCopy} from '../app/lib/launch-meta.js';
import {utilityMetaCopy} from '../app/lib/utility-meta.js';

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

test('utility pages publish localized metadata in every supported language', () => {
  for (const locale of ['en', 'fr', 'es', 'pt-br']) {
    const meta = utilityMetaCopy(locale);
    for (const page of ['cart', 'notFound', 'contact', 'shipping', 'faq']) {
      assert.match(meta[page].title, /Puchica/);
      assert.ok(meta[page].description.length > 50);
    }
    for (const title of Object.values(meta.account)) {
      assert.match(title, /Puchica/);
    }
    assert.match(meta.search.title, /Puchica/);
    assert.match(meta.search.termTitle, /\{term\}/);
    assert.match(meta.search.termDescription, /\{term\}/);
  }
});

test('launch metadata falls back to English and keeps market copy distinct', () => {
  assert.deepEqual(launchMetaCopy('unknown', 'CA'), launchMetaCopy('en', 'CA'));
  assert.notEqual(
    launchMetaCopy('fr', 'CA').home.description,
    launchMetaCopy('fr', 'US').home.description,
  );
});
