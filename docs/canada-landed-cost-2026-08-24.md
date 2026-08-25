# Canadian landed cost and the acquisition gate — 2026-08-24

Two gaps closed in one pass. Both were invisible because the storefront gates
were built to catch untruthful products, and neither of these is a truthfulness
problem.

## Gap 1: CBSA was never modelled

`scripts/us-duty-impact.mjs` exists because the end of United States de minimis
made that market unprofitable, and it is why `SUSPENDED_COMMERCE_MARKETS` closes
the US. There was no Canadian equivalent anywhere in the repository. Every
margin figure in every audit — including `check-organic-economics.mjs`, the gate
that decides organic tiers — silently assumes CBSA assesses nothing.

That assumption is defensible today. It had simply never been written down,
tested, or costed, which means nobody could tell whether it was a decision or an
oversight. It was an oversight.

### The policy

| Item | Value | Applies to |
| --- | --- | --- |
| Duty de minimis | CAD$20 | Non-US/MX origin |
| Tax de minimis | CAD$40 | Non-US/MX origin |
| Blended sales tax | 8.76% | Population-weighted, derived in code |
| Modelled duty, textile travel goods (HS 4202.92) | 11% | Packing cubes, toiletry organizer, kit |
| Modelled duty, small accessories | 0% | Jewelry case, cable case, tech case |
| Carrier handling | CA$9.95 Canada Post / CA$12–20 courier | Billed to the customer |

The CUSMA increase to CAD$40 duty / CAD$150 tax applies **only** to courier
shipments from the United States and Mexico. A Chinese-origin parcel keeps the
CAD$20 / CAD$40 pair regardless of carrier.

Canada applies no Section 301 equivalent to Chinese travel goods. Its surtaxes
on Chinese imports cover electric vehicles, steel and aluminium. This is the
structural reason Canada remains viable while the United States does not, and it
is not a matter of luck or enforcement laxity.

### What the model says

Run `npm run canada-duty-impact`. Four scenarios, mean contribution per order:

| Scenario | Mean | Offers at a loss |
| --- | ---: | ---: |
| A. CBSA never assesses (what every gate assumes today) | CA$18.94 | 0 of 6 |
| B. Assessed at the modelled 15% rate | CA$16.66 | 0 of 6 |
| C. Assessed on declared supplier value, every parcel | CA$3.73 | 2 of 6 |
| D. Assessed on retail transaction value, every parcel | −CA$0.24 | 3 of 6 |

Scenario A is not wrong today — low-declared Cainiao parcels usually do clear.
B is the planning case. C and D are what a tightening looks like, and neither is
survivable as currently priced.

The difference from the United States is one of **shape**, not comfort. There,
every offer turns negative and the market had to close. Here the damage is
concentrated in the offers that declare above the CAD$40 tax threshold — the
packing cubes and the Carry-On Kit — while the cheaper accessories declare under
it and are untouched. That is a pricing and packaging problem, which can be
fixed, rather than a market-wide one.

### The exposure that does not show in a mean

A parcel that clears costs nothing. A parcel that is assessed can cost the
**entire order** — up to CA$58.67 — because a customer asked for an unexpected
payment on the doorstep refunds rather than pays. The handling fee is not our
cost; the refund is.

What a customer is asked for when a parcel is assessed:

| Offer | Declared (supplier) | Customer owes | At retail value |
| --- | ---: | ---: | ---: |
| Charcoal 3-Piece Packing Cube Set | CA$20.22 | CA$12.17 | CA$14.35 |
| The Carry-On Kit | CA$43.34 | CA$18.93 | CA$24.25 |
| Black Hanging Toiletry Organizer | CA$14.67 | CA$0.00 | CA$13.03 |
| Jewelry case, cable case, tech case | under threshold | CA$0.00 | CA$0.00 |

**Action:** disclose the possibility of import fees at checkout. A disclosed
CA$9.95 fee is an inconvenience; an undisclosed one is a chargeback. This is a
copy change, and it is cheap.

**Caveat:** duty rates here are modelled from HS headings, not ruled. Confirm
the exact classification with CBSA or a customs broker before pricing against
them.

## Gap 2: no gate asked whether an offer can pay for its own customer

Every catalog gate in `app/lib/launch-catalog.js` asks whether a product is
truthful, mapped, costed and routed. None compares the contribution it produces
to the cost of acquiring the buyer. An offer could carry every evidence tag,
pass the storefront release gate, deploy cleanly, and lose money on every
ad-driven sale.

`scripts/check-acquisition-gate.mjs` closes that. Run `npm run acquisition-gate`.

| Offer | Price | Contribution | Break-even CPA | Max viable CPA | Short by | Verdict |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Black Travel Tech Case | CA$34.99 | CA$23.09 | CA$23.09 | CA$16.16 | CA$25.84 | FAIL |
| White Jewelry Case | CA$22.99 | CA$16.52 | CA$16.52 | CA$11.56 | CA$30.44 | FAIL |
| 3-Piece Packing Cube Set | CA$39.99 | CA$15.76 | CA$15.76 | CA$11.03 | CA$30.97 | FAIL |
| The Carry-On Kit | CA$69.00 | CA$15.27 | CA$15.27 | CA$10.69 | CA$31.31 | FAIL |
| Black Toiletry Organizer | CA$27.99 | CA$15.21 | CA$15.21 | CA$10.65 | CA$31.35 | FAIL |
| Black Cable Organizer Case | CA$19.99 | CA$14.11 | CA$14.11 | CA$9.88 | CA$32.12 | FAIL |

No Canadian offer can fund a CA$42 CPA. The largest gap is CA$32.12. **Closing
it needs a higher AOV or a cheaper channel, not a better ad.**

### How the gate behaves

- **Advisory by default.** Paid acquisition is off, so the report prints and
  exits 0. It does not block organic work.
- **Blocking under `--paid`** (or `PUCHICA_PAID_ACQUISITION=1`). Any offer that
  cannot fund its own acquisition fails the build.
- **Wired into `npm run paid-launch-check`** in paid mode, so paid launch
  readiness cannot be declared while an unfundable offer is approved. This is
  the specific thing that could not happen before.
- **Evidence failures block in either mode.** A gate that cannot read its inputs
  is broken, not lenient.
- **Benchmark expires after 90 days**, mirroring the seven-day freshness rule on
  DSers cost evidence.

### The target CPA is a benchmark, not a measurement

`targetCpaCad: 42` comes from a published median (US$29.99 for the Lifestyle &
Boutique band, the cheapest ecommerce category, at the repo's 1.40 planning FX).
Puchica has never observed its own CPA: 14,549 sessions across 90 days produced
two orders, both owner tests.

**Replace this number with a measured cost per purchase as soon as a paid
traffic test produces one.** Until then every verdict in the table above is a
model, including the ones that say FAIL. The gate is honest about this in its
own output and in `acquisition-benchmark-2026-08-24.json`.

## Side effect: the Carry-On Kit price drift

The gate independently caught something the fulfilment runbook did not. The kit
is live at **CA$69** but `bundle-fulfilment-runbook-2026-08-21.md` — the newest
document in the repo — costs it at **CA$89** and computes ≈CA$42 contribution,
calling it "roughly 1.6× the best single product… the reason this SKU exists."

At CA$69 it contributes CA$15.27 after assessment risk. That is **less than the
Black Travel Tech Case earns at CA$34.99**, while still requiring three separate
supplier orders and a three-part manual fulfilment. It is now the least
automatable and least profitable offer in the catalogue simultaneously.

`checkPriceDrift()` surfaces this as a warning on every gate run and as a
warning in `paid-launch-check`. It is deliberately not a hard failure — the
correct price is a business decision, not a code decision — but it can no longer
go unnoticed.

**Decision needed:** restore CA$89, or retire the kit. There is no reading under
which CA$69 is correct.

## Files

| Path | Role |
| --- | --- |
| `scripts/lib/acquisition-economics.mjs` | Pure model: CBSA assessment, contribution, CAC break-even, price drift |
| `scripts/canada-duty-impact.mjs` | Four-scenario CBSA report; the Canadian counterpart to `us-duty-impact.mjs` |
| `scripts/check-acquisition-gate.mjs` | The gate; advisory by default, blocking under `--paid` |
| `docs/recovery-evidence/acquisition-benchmark-2026-08-24.json` | Target CPA, profit share, assessment probability, duty categories, sources |
| `tests/acquisition-economics.test.js` | 22 tests covering thresholds, tax base, verdicts, drift, staleness |

No network access and no credentials are required to run any of it, which is why
it works in CI where `check-organic-economics.mjs` cannot.
