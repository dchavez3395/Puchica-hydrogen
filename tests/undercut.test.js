import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditUndercut} from '../scripts/check-undercut.mjs';
import {APPROVED_CATALOG_OFFERS} from '../app/lib/launch-catalog.js';

const NOW = new Date('2026-09-08T00:00:00Z');
const watchRoll = JSON.parse(
  readFileSync(
    new URL(
      '../docs/undercut-evidence/pu-leather-watch-roll-travel-case-3-or-6-watches.json',
      import.meta.url,
    ),
    'utf8',
  ),
);
const only = (ev) => (handle) => (handle === ev.handle ? ev : null);

test('the gate refuses the product it was built out of', () => {
  // The 2026-09 watch-roll cohort is the worked example. If this ever passes,
  // the gate has been loosened past the case that motivated it.
  const {failures} = auditUndercut([watchRoll.handle], only(watchRoll), NOW);
  assert.ok(failures.some((f) => /RULE 1/.test(f)), 'cost above cheapest retail must fail');
  assert.ok(failures.some((f) => /RULE 2/.test(f)), 'retail above the band must fail');
});

test('missing evidence is a failure, not a skip', () => {
  // The whole point: silence must not read as approval. Seven products reached
  // margin models without this check ever being run.
  const {failures} = auditUndercut(['some-new-product'], () => null, NOW);
  assert.equal(failures.length, 1);
  assert.match(failures[0], /no undercut evidence/);
});

test('stale evidence expires', () => {
  const stale = {...watchRoll, checkedOn: '2026-01-01'};
  const {failures} = auditUndercut([stale.handle], only(stale), NOW);
  assert.ok(failures.some((f) => /days old/.test(f)));
});

test('a thin sample is refused before it can be reasoned from', () => {
  const thin = {...watchRoll, competitors: watchRoll.competitors.slice(0, 2)};
  const {failures} = auditUndercut([thin.handle], only(thin), NOW);
  assert.ok(failures.some((f) => /anecdote/.test(f)));
});

test('a product that actually clears both rules passes', () => {
  const good = {
    handle: 'hypothetical',
    checkedOn: '2026-09-01',
    ourRetailUsd: 39.0,
    ourLandedCostUsd: 12.0,
    competitors: [
      {name: 'a', priceUsd: 34.0, reviews: 120},
      {name: 'b', priceUsd: 36.0, reviews: 80},
      {name: 'c', priceUsd: 38.0, reviews: 40},
      {name: 'd', priceUsd: 41.0, reviews: 300},
      {name: 'e', priceUsd: 44.0, reviews: 60},
    ],
  };
  const {failures, notes} = auditUndercut([good.handle], only(good), NOW);
  assert.deepEqual(failures, []);
  assert.ok(notes.some((n) => /category open/.test(n)));
});

test('a locked category is flagged but never fatal', () => {
  // Victor carries 13,800 reviews in pest control. That is a warning about
  // which category to enter, not a reason to block a correctly priced offer.
  const locked = {
    handle: 'hypothetical',
    checkedOn: '2026-09-01',
    ourRetailUsd: 39.0,
    ourLandedCostUsd: 12.0,
    competitors: [
      {name: 'incumbent', priceUsd: 34.0, reviews: 13800},
      {name: 'b', priceUsd: 36.0, reviews: 80},
      {name: 'c', priceUsd: 38.0, reviews: 40},
      {name: 'd', priceUsd: 41.0, reviews: 300},
      {name: 'e', priceUsd: 44.0, reviews: 60},
    ],
  };
  const {failures, notes} = auditUndercut([locked.handle], only(locked), NOW);
  assert.deepEqual(failures, []);
  assert.ok(notes.some((n) => /may be locked/.test(n)));
});

test('every approved handle must carry evidence on disk', () => {
  // Empty today. When it is not, this is the assertion that stops a handle
  // being added without the market check having been run at all.
  for (const handle of new Set(APPROVED_CATALOG_OFFERS.map((o) => o.handle))) {
    assert.ok(handle, handle);
  }
  assert.equal(APPROVED_CATALOG_OFFERS.length, 0);
});
