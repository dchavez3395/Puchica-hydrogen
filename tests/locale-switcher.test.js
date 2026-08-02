import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('locale switcher uses compact visible copy with unique accessible popovers', async () => {
  const source = await readFile(
    new URL('../app/components/LocaleSwitcher.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /marketCompactLabel\(root\?\.selectedLocale\)/);
  assert.match(source, /currentSelection = marketDisplayLabel/);
  assert.match(source, /const selectorId = useId\(\)/);
  assert.match(source, /aria-controls=\{selectorId\}/);
  assert.match(source, /id=\{selectorId\}/);
  assert.doesNotMatch(source, /id="market-language-selector"/);
});
