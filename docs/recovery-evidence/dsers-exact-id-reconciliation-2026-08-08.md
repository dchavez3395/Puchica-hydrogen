# DSers exact-ID candidate reconciliation — 2026-08-08

## Controls and economics gate

- Read-only signed-in DSers inspection; no import, mapping, catalog, order, or payment action.
- FX used for the Canada gate: **1 USD = 1.3943 CAD**, dated 2026-08-07.
- Automatic reject ceilings supplied for this pass:
  - cable tray: **CA$18.00 all-in landed**;
  - routing kit: **CA$12.77 all-in landed**.
- Item cost alone above the ceiling is an immediate reject; no route lookup can repair it.

## Concise decision table

| Exact AliExpress ID | Candidate | Public ordinary item cost | Canada item cost at dated FX | Exact DSers outcome | Decision |
|---|---|---:|---:|---|---|
| `1005012270432335` | 18-piece self-adhesive cable clips | US$4.14; US$4.20 reference | CA$5.77; CA$5.86 reference | Exact ID did not appear in Supplier Optimizer even when seeded with the exact primary image; no exact CA/US route or option data | **HOLD / BLOCKED** |
| `1005012360881333` | Clamp-on under-desk cable tray | US$25.89 | CA$36.09 | Route inspection stopped by economics gate | **REJECT** |
| `1005009384491264` | Extendable no-drill metal clamp tray | US$23.83 | CA$33.22 | Route inspection stopped by economics gate | **REJECT** |
| `1005006861546633` | Metal mesh cable tray with clamp | US$29.09 | CA$40.56 | Route inspection stopped by economics gate | **REJECT** |

## Exact routing-kit finding — `1005012270432335`

Public identity evidence:

- Exact title: `18Pcs Cable Clip Wire Organizer Self Adhesive Cord Holder Desktop Cable Management for Power Chargers USB Headphones Cord`.
- Exact public product record: `https://www.pricearchive.org/aliexpress.com/item/1005012270432335`.
- Public price record: US$4.14 current, US$4.20 reference/original.
- Exact primary image filename captured from that record: `S4185c13a87464862a462fb4f1a23b544g.jpg`.

DSers evidence:

1. DSers Find Products keyword/exact-ID search remained on the same generic “Picks For You” feed and did not return a defensible exact-ID result.
2. Supplier Optimizer was tried with the exact listing primary image.
3. Supplier Optimizer returned 24 visually similar rows, but **none had exact item ID `1005012270432335`**.
4. A similar row was not substituted. Therefore selected option, exact 18-piece pack, ordinary signed-in price, Canada route, United States route, ETA, tracking, stock, and ship-from remain unverified.

Decision: **HOLD / BLOCKED**, not a pass. The public item price leaves room under the CA$12.77 routing-kit ceiling, but without an exact Canada route the all-in landed cost cannot be calculated. The candidate must not be imported, published, bundled, or advertised on lookalike evidence.

## Immediate tray economics rejects

The following item costs already exceed the CA$18 tray ceiling before shipping or any other landed component:

- `1005012360881333`: US$25.89 × 1.3943 = **CA$36.09**; exceeds ceiling by **CA$18.09**.
- `1005009384491264`: US$23.83 × 1.3943 = **CA$33.22**; exceeds ceiling by **CA$15.22**.
- `1005006861546633`: US$29.09 × 1.3943 = **CA$40.56**; exceeds ceiling by **CA$22.56**.

No DSers route time was spent on these automatic rejects.

## Candidates received but not advanced in this stopped pass

These IDs were supplied as unapproved/secondary tray possibilities, but the parent task explicitly directed the pass to stop after the routing-kit reconciliation and immediate hero economics rejects:

- `1005007084214211`
- `1005011690210907`
- `1005010018608796`

They remain **NOT INSPECTED / NOT APPROVED**. Do not infer viability from this report.

## Required next evidence for the clips

Only resume `1005012270432335` if DSers can expose the exact listing (not a visual substitute) or the exact supplier listing can be attached to a non-publishing import-list detail view. Capture:

- exact 18-piece neutral option and images;
- normal non-welcome/non-coupon item price;
- exact option stock and ship-from;
- tracked Canada and United States method, cost and ETA;
- clip dimensions and supported cable diameter/range;
- recent orders/reviews and adhesive/material evidence.

Then reject if Canada item plus tracked shipping exceeds CA$12.77; prefer CA$10 or less for resilience.
