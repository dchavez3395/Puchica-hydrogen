import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('one polite live region per page, fed by add-to-cart status', () => {
  // 2026-09-18 accessibility sheet: /collections/all carried ~18-22
  // role="status" regions because every product card's AddToCartButton
  // rendered its own. PageLayout now owns a single region.
  const layout = readFileSync('app/components/PageLayout.jsx', 'utf8');
  const atc = readFileSync('app/components/AddToCartButton.jsx', 'utf8');
  const announcer = readFileSync('app/components/LiveAnnouncer.jsx', 'utf8');
  assert.match(layout, /<LiveAnnouncer>/);
  assert.match(announcer, /role="status" aria-live="polite"/);
  assert.doesNotMatch(atc, /role="status"/);
  assert.match(atc, /useAnnouncer\(\)/);
  assert.match(atc, /announce\(statusText\)/);
  // Live text must not live inside the (disabled) button itself.
  assert.doesNotMatch(atc, /<button[\s\S]*aria-live/);
});
