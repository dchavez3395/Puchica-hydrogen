import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

import {SOCIAL_PROFILES} from '../app/lib/brand.js';

test('brand schema publishes stable canonical social profiles', () => {
  assert.equal(SOCIAL_PROFILES.length, 3);
  assert.equal(new Set(SOCIAL_PROFILES).size, SOCIAL_PROFILES.length);
  assert.ok(SOCIAL_PROFILES.every((url) => URL.canParse(url)));
  assert.ok(SOCIAL_PROFILES.some((url) => url.includes('instagram.com/')));
  assert.ok(SOCIAL_PROFILES.some((url) => url.includes('facebook.com/people/')));
  assert.ok(SOCIAL_PROFILES.some((url) => url.includes('tiktok.com/')));
  assert.ok(SOCIAL_PROFILES.every((url) => !url.includes('/share/')));
});

test('footer derives links from the schema profile source', () => {
  const footer = readFileSync('app/components/Footer.jsx', 'utf8');
  assert.match(footer, /SOCIAL_PROFILES\.find/);
  assert.doesNotMatch(footer, /https:\/\/(?:www\.)?(?:instagram|facebook|tiktok)\.com/);
});
