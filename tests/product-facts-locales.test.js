import test from 'node:test';
import assert from 'node:assert/strict';
import {DICTIONARIES} from '../app/lib/dictionaries.js';
import {APPROVED_CATALOG_OFFERS} from '../app/lib/launch-catalog.js';
import {presentLaunchProductCopy} from '../app/lib/product-presentation.js';
import {extractProductFacts} from '../app/lib/product-facts.js';

const handles = [...new Set(APPROVED_CATALOG_OFFERS.map((o) => o.handle))];

test('every approved product shows at least three facts in every locale', () => {
  // 2026-09-19 copy audit: six Spanish PDPs had two facts because the fitting
  // picker knew "casquilho" (pt) but not "casquillo" (es), and sconces had
  // three everywhere because their "backplate and arm" line was never picked.
  const thin = [];
  for (const handle of handles) {
    for (const [locale, dictionary] of Object.entries(DICTIONARIES)) {
      const copy = presentLaunchProductCopy(handle, dictionary);
      assert.ok(copy?.descriptionHtml, `${locale} ${handle} has no description`);
      const facts = extractProductFacts(copy.descriptionHtml);
      if (facts.length < 3) thin.push(`${locale} ${handle}: ${facts.map((f) => f.label).join(', ')}`);
    }
  }
  assert.deepEqual(thin, []);
});

test('sconces pick their mounting line as the second fact in every locale', () => {
  for (const handle of handles.filter((h) => /sconce/.test(h))) {
    for (const [locale, dictionary] of Object.entries(DICTIONARIES)) {
      const facts = extractProductFacts(presentLaunchProductCopy(handle, dictionary).descriptionHtml);
      assert.equal(facts.length, 4, `${locale} ${handle}: ${facts.map((f) => f.label).join(', ')}`);
      assert.match(facts[1].label, /backplate|platine|placa|\bmount\b|mounting|montaje|montagem|fixation|fixação/i, `${locale} ${handle}: ${facts[1].label}`);
    }
  }
});
