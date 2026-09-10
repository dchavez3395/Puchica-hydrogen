import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {auditUndercut, bindingBasis} from '../scripts/check-undercut.mjs';
import {
  APPROVED_CATALOG_OFFERS,
  US_DUTY_INCIDENCE,
  US_DUTY_INCIDENCE_STATES,
} from '../app/lib/launch-catalog.js';

const NOW = new Date('2026-09-08T00:00:00Z');
const read = (name) =>
  JSON.parse(
    readFileSync(
      new URL(`../docs/undercut-evidence/${name}.json`, import.meta.url),
      'utf8',
    ),
  );
const watchRoll = read('pu-leather-watch-roll-travel-case-3-or-6-watches');
const grinder = read('portable-electric-burr-coffee-grinder');
const only = (ev) => (handle) => (handle === ev.handle ? ev : null);

test('the gate refuses the product it was built out of', () => {
  // The retired watch-roll cohort. If this ever passes, the gate has been
  // loosened past the case that motivated it.
  const {failures} = auditUndercut([watchRoll.handle], only(watchRoll), NOW);
  assert.ok(failures.some((f) => /RULE 2/.test(f)), 'above the band must fail');
});

test('and it refuses the same product priced INTO the band, for the other reason', () => {
  // This is the scissor stated as a test. At $49 it clears the contribution
  // floor and busts the band. Dropped to $32, inside the band, the
  // contribution collapses. There is no price that satisfies both, and each
  // rule catches one end - which is why removing either one would let the
  // whole failure mode back through.
  const repriced = {...watchRoll, ourRetailUsd: 32.0};
  const {failures} = auditUndercut([repriced.handle], only(repriced), NOW);
  assert.ok(failures.some((f) => /RULE 1/.test(f)), 'no margin at market price must fail');
  assert.ok(!failures.some((f) => /RULE 2/.test(f)), '$32 is inside the band');
});

test('an unsourced duty rate fails closed', () => {
  // How the 0.38 rate got inherited on the watch rolls and went unchallenged
  // for weeks. The fixture is synthetic on purpose: this used to assert
  // against the grinder file, which meant sourcing that product's rate broke
  // the test. A rule about missing data must not depend on some real file
  // staying incomplete.
  const unsourced = {...grinder};
  delete unsourced.dutyRate;
  const {failures} = auditUndercut([unsourced.handle], only(unsourced), NOW);
  assert.equal(failures.length, 1);
  assert.match(failures[0], /no dutyRate recorded/);
});

test('the grinder now carries a sourced rate and clears both rules', () => {
  // HTS 8509.40.00: 4.2% column 1 general + 12.5% Section 301 (9903.05.31) =
  // 16.7%. NOT the 55.1% watch-roll stack - 8509.40 carries no List 1-3 layer.
  assert.equal(grinder.dutyRate, 0.167);
  const {failures} = auditUndercut([grinder.handle], only(grinder), NOW);
  assert.deepEqual(failures, []);
});

test('the grinder fails if the duty lands on us, which is the open question', () => {
  // $22.22/unit prepaid, $14.92 if the supplier prepays on wholesale, $11.18
  // if CBP values on what the customer paid and it bills through to us. That
  // last one is under the floor, so the incidence reading matters here exactly
  // as much as it did on the watch rolls.
  const billed = auditUndercut([grinder.handle], only(grinder), NOW, {basis: 'retail'});
  assert.ok(billed.failures.some((f) => /RULE 1/.test(f)));
  const wholesale = auditUndercut([grinder.handle], only(grinder), NOW, {basis: 'wholesale'});
  assert.deepEqual(wholesale.failures, []);
});

test('missing evidence is a failure, not a skip', () => {
  // Silence must not read as approval. Eight products reached a margin model
  // without this check ever being run.
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
  // Two listings is an anecdote: the Walmart-only read on 2026-09-08 put the
  // 4-slot band at $60-66 when Amazon showed $22-50.
  const thin = {...watchRoll, competitors: watchRoll.competitors.slice(0, 2)};
  const {failures} = auditUndercut([thin.handle], only(thin), NOW);
  assert.ok(failures.some((f) => /anecdote/.test(f)));
});

test('landed cost alone is not enough to run the model', () => {
  // Duty applies to different bases, so the item cost and the supplier
  // shipping cannot be pre-summed by whoever writes the evidence.
  const merged = {...watchRoll};
  delete merged.itemCostUsd;
  const {failures} = auditUndercut([merged.handle], only(merged), NOW);
  assert.ok(failures.some((f) => /cannot be split across duty bases/.test(f)));
});

const GOOD = {
  handle: 'hypothetical',
  checkedOn: '2026-09-01',
  ourRetailUsd: 49.99,
  itemCostUsd: 9.29,
  supplierShipUsd: 5.0,
  dutyRate: 0.25,
  competitors: [
    {name: 'a', priceUsd: 39.0, reviews: 120},
    {name: 'b', priceUsd: 44.0, reviews: 80},
    {name: 'c', priceUsd: 46.0, reviews: 40},
    {name: 'd', priceUsd: 52.0, reviews: 300},
    {name: 'e', priceUsd: 60.0, reviews: 60},
  ],
};

test('a product that actually clears both rules passes', () => {
  const {failures, notes} = auditUndercut([GOOD.handle], only(GOOD), NOW);
  assert.deepEqual(failures, []);
  assert.ok(notes.some((n) => /contributes \$/.test(n)));
  assert.ok(notes.some((n) => /category open/.test(n)));
});

test('the binding duty basis follows US_DUTY_INCIDENCE, like the sellable gate', () => {
  assert.equal(bindingBasis(US_DUTY_INCIDENCE_STATES.BILLED), 'retail');
  assert.equal(bindingBasis(US_DUTY_INCIDENCE_STATES.PREPAID), 'prepaid');
  assert.equal(bindingBasis(US_DUTY_INCIDENCE_STATES.UNVERIFIED), 'prepaid');
  assert.ok(Object.values(US_DUTY_INCIDENCE_STATES).includes(US_DUTY_INCIDENCE));

  // Same product, harsher basis: a 55.1% duty landing on us takes the
  // hypothetical below the floor. If the incidence ever reads 'billed', the
  // gate tightens on every candidate without anyone editing a threshold.
  const heavy = {...GOOD, dutyRate: 0.551};
  const prepaid = auditUndercut([heavy.handle], only(heavy), NOW, {basis: 'prepaid'});
  const billed = auditUndercut([heavy.handle], only(heavy), NOW, {basis: 'retail'});
  assert.deepEqual(prepaid.failures, []);
  assert.ok(billed.failures.some((f) => /RULE 1/.test(f)));
});

test('a locked category is flagged but never fatal', () => {
  // Victor carries 13,800 reviews in pest control. That is a warning about
  // which category to enter, not a reason to block a profitable offer.
  const locked = {
    ...GOOD,
    competitors: [{name: 'incumbent', priceUsd: 44.0, reviews: 13800}, ...GOOD.competitors.slice(1)],
  };
  const {failures, notes} = auditUndercut([locked.handle], only(locked), NOW);
  assert.deepEqual(failures, []);
  assert.ok(notes.some((n) => /category may be LOCKED/.test(n)));
});

test('every approved handle must carry evidence', () => {
  // No longer vacuous. Until 2026-09-09 this asserted an empty catalogue,
  // which meant the rule it names was never actually exercised. Now it walks
  // the real cohort and fails if any approved handle is missing a current
  // undercut evidence file - which is the thing eight dead products were
  // supposed to have taught us.
  assert.ok(APPROVED_CATALOG_OFFERS.length > 0);
  const handles = [
    ...new Set(APPROVED_CATALOG_OFFERS.map((offer) => offer.handle)),
  ];
  const dir = fileURLToPath(
    new URL('../docs/undercut-evidence/', import.meta.url),
  );
  const load = (handle) => {
    const p = path.join(dir, `${handle}.json`);
    return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
  };
  const {failures} = auditUndercut(handles, load, new Date('2026-09-09T12:00:00Z'));
  assert.deepEqual(failures, []);
});
