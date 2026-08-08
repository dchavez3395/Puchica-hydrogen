# Recovery evidence registry

This directory contains dated, reproducible evidence used to approve or reject
Puchica launch candidates. It follows `docs/puchica-operating-quality-gates.md`.

## Rules

- Record exact product and variant identifiers; titles are not stable keys.
- Separate Canada and United States evidence.
- Record the observation date, source URL/system, selected option, destination,
  currency, and whether a price is a coupon/welcome/conditional price.
- Use `pass`, `fail`, or `not_checked`. Blank never means pass.
- Do not approve a product from a screenshot alone when the mapped variant is
  ambiguous.
- Keep product, shipping, margin, content, media, and accessibility decisions
  independently reviewable.
- A product becomes externally discoverable only when every required field is
  supported and the final approval record is signed off.

## Minimum candidate record

| Field group | Required fields |
| --- | --- |
| Identity | Shopify product ID, handle, variant ID, exact option values, supplier URL/ID |
| Product | included quantity, material, dimensions, weight, origin, HS code, safety class |
| Mapping | DSers mapping state, selected supplier variant, primary/secondary route evidence |
| Canada | product cost, shipping cost, delivery estimate, tracking, duty/tax handling, quote destination |
| United States | product cost, shipping cost, delivery estimate, tracking, duty/tax handling, two quote destinations |
| Economics | selling price, active discount, payment fee, refund/defect reserve, contribution dollars and percent |
| Content | title, options, description, claims, warnings, SEO, media fidelity and rights |
| Commerce | inventory behavior, checkout total, returns route, customer-support burden |
| Release | per-gate status, reviewer, date, evidence references, final decision |

## Conservative margin formula

`contribution = selling price - product cost - shipping - payment fees - duty/tax absorbed by Puchica - refund/defect reserve - other variable costs`

`contribution margin = contribution / selling price`

Customer-paid duties may be excluded from Puchica cost only when checkout and
policy behavior support that conclusion for the destination. Welcome deals,
coins, one-time coupons, and uncertain supplier discounts are excluded from the
repeatable cost basis.
