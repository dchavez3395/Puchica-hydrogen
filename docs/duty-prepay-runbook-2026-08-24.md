# Prepaying import duties — runbook

**Not yet active.** `DUTY_POSTURE` in `app/lib/duty-posture.js` is
`customer-pays`, which matches how the store is configured today. This document
is what to do when the catalog moves above the de minimis thresholds.

**I have not changed the Shopify setting.** Switching who pays duty changes what
real customers are charged at checkout, so it is yours to make deliberately.

## When this becomes necessary

Canada's de minimis for goods from China is **CAD$20 duty / CAD$40 tax**.

| Catalog | Declared value | Assessed? |
| --- | ---: | --- |
| Current (CA$20–40 retail) | CA$8–20 | No — under both thresholds |
| Target (CA$90–150 retail) | CA$27–45 | **Yes — crosses both** |

At CA$129 retail declaring CA$42, an unprepaid parcel bills the customer roughly
**CA$18–24 on the doorstep**: duty, tax, and the carrier's ~CA$9.95 disbursement
fee. First-time customers refuse those parcels.

Prepaying costs about **CA$8.70** on the same order. It is both cheaper than the
refunds and the honest thing to sell — and the economics in
`npm run sourcing-spec` already assume it.

## The switch, in order

The two halves must move together. Storefront copy promising prepaid duties
while Shopify collects nothing is a promise you break at the customer's door;
Shopify collecting duty while the page says the customer is responsible gets the
parcel refused twice over.

1. **Shopify first.** Settings → Markets → Canada → **Duties and import taxes**
   → collect at checkout. Confirm the calculated duty appears on a real test
   checkout before touching the code.
2. **Then the code.** Set `DUTY_POSTURE = 'prepaid'` in
   `app/lib/duty-posture.js`. Copy in all four locales switches with it — the
   prepaid strings already exist and are covered by tests.
3. **Verify.** `npm test && npm run launch-check`, then a live checkout in
   Canada. The shipping information page should read "included in the price";
   the checkout should show the duty line.
4. **Update the shipping policy.** `docs/shipping-policy.md` still carries the
   customer-pays language and bracketed placeholders. Rewrite before publishing.

## Rolling back

Reverse the order: code to `customer-pays` and deploy first, then turn off
Shopify collection. That way the page never promises something checkout has
already stopped doing.

## What the tests guarantee

`tests/duty-posture.test.js` asserts both postures have copy in all four
locales, that the two say materially different things, that prepaid copy never
tells a customer they owe something, and that customer-pays copy never promises
prepayment. Those four together make the drift that would embarrass you at a
customer's door impossible to ship.

## Still needs a person

- The Shopify Markets setting itself.
- Confirming your supplier declares the value you expect. A supplier who
  declares retail rather than wholesale changes the duty base and the model with
  it — worth one test order to establish before scaling.
- HS classification per product. The 11% textile and 0% accessory rates in the
  model are from headings, not rulings. A customs broker settles this cheaply
  and it is worth doing once at this price point.
