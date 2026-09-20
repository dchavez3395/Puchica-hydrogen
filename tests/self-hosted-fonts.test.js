import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';

const root = readFileSync('app/root.jsx', 'utf8');
const fonts = readFileSync('app/styles/fonts.css', 'utf8');

test('web fonts are self-hosted, not a render-blocking Google Fonts stylesheet', () => {
  // Lighthouse mobile 2026-09-18: the fonts.googleapis.com stylesheet blocked
  // first paint for ~0.9 s and the text LCP re-fired when Fraunces swapped in.
  assert.doesNotMatch(root, /fonts\.googleapis\.com\/css/);
  // Inlined (?raw) so url(/fonts/…) resolves against the document, not the
  // cdn.shopify.com stylesheet URL that font-src blocked (2026-09-20).
  assert.match(root, /fonts\.css\?raw/);
  assert.match(root, /dangerouslySetInnerHTML=\{\{__html: fontFaceCss\}\}/);
  assert.doesNotMatch(root, /fonts\.css\?url/);
  assert.match(root, /href: '\/fonts\/fraunces-normal-latin\.woff2'/);
  assert.match(root, /href: '\/fonts\/instrument-sans-normal-latin\.woff2'/);
});

test('every @font-face points at a file that exists and declares the variable weight range', () => {
  const files = [...fonts.matchAll(/url\(\/fonts\/([^)]+)\)/g)].map((m) => m[1]);
  assert.ok(files.length >= 8, 'expected 8 subset files');
  for (const f of files) assert.ok(existsSync(`public/fonts/${f}`), `missing public/fonts/${f}`);
  assert.equal((fonts.match(/font-weight: 400 700;/g) || []).length, files.length);
  assert.doesNotMatch(fonts, /font-display: (block|auto)/);
});

test('CSP lets the pixel frame and CDN-resolved fonts through', () => {
  const entry = readFileSync('app/entry.server.jsx', 'utf8');
  assert.match(entry, /frameSrc: \[[^\]]*'https:\/\/www\.facebook\.com'/);
  assert.match(entry, /fontSrc: \[[^\]]*'https:\/\/cdn\.shopify\.com'/);
});
