# Five-product margin thresholds — resumed supplier routes

**Evidence date:** 2026-08-08

**Market and currency:** Canada, CAD

**Scope:** Boykeep camera, Essager charger, mini 2-in-1 hair tool, cordless straightener brush, and milk frother

**Action status:** calculator only; no catalog, price, supplier, ad, or account mutations were made.

## Decision summary

These are the maximum **all-in landed costs**, not supplier item-price targets. A DSers route must fit under the relevant ceiling after ordinary item cost, tracked shipping, Puchica-paid duties/brokerage where applicable, automation/order charges, handling, and packaging are included.

| Product | Current price | Competitive target band | Max landed at current price, no discount | Max landed at current price, 15% off | Conservative route ceiling | Absolute competitive route ceiling | Read |
|---|---:|---:|---:|---:|---:|---:|---|
| Boykeep 2K pet camera | $98.79 | $40–60 | $60.46 | $51.34 | **$20.61** | **$31.07** | Current-price math is misleading because the market does not support $98.79. |
| Essager 15W car charger | $66.69 | $25–40 | $40.71 | $34.56 | **$12.77** | **$20.61** | Requires a much cheaper exact route and a lower retail price. |
| Mini 2-in-1 hair tool | $55.35 | $15–30 | $33.74 | $28.63 | **$7.54** | **$15.38** | Weak unless sourcing is exceptionally cheap and compliance evidence is clean. |
| Cordless straightener brush | $63.00 | $35–50 | $38.45 | $32.63 | **$18.00** | **$25.84** | Most recoverable of the four non-drill products, but only with safety and warranty proof. |
| Rechargeable milk frother | $68.97 | $18–30 | $42.12 | $35.75 | **$9.11** | **$15.38** | Reject or re-source unless the landed route is dramatically cheaper. |

### How to use the two route ceilings

- **Conservative route ceiling** is the maximum landed cost at the **bottom of the competitive target band after a 15% customer discount**. Meeting it preserves the most pricing flexibility.
- **Absolute competitive route ceiling** is the maximum landed cost at the **top of the competitive band after a 15% discount**. A route above this number fails even the least-conservative competitive scenario in this model.
- A cost between those two numbers may work only at the middle/top of the target band; it is not resilient at the low end.
- The ceilings are not purchase approvals. Exact variant mapping, inventory, ordinary repeatable pricing, tracked delivery, safety/compliance, returns and warranty must still pass.

## Established assumptions and formula

This calculator uses the same conservative assumptions documented in `supplier-economics-2026-08-08.md`:

- Payment processing: **3.5% of collected merchandise revenue + CAD 0.30**.
- Refund/defect reserve: **5% of collected merchandise revenue**.
- Required contribution margin: **30% of collected merchandise revenue**.
- Customer-paid shipping or duties add **zero** to the base model until checkout evidence proves the amount retained by Puchica and the responsibility split.
- Conditional welcome prices, coupons, coins, flash sales, subscription discounts and new-buyer pricing are not accepted as repeatable supplier cost.

For any advertised merchandise price `P`:

```text
revenue without discount = P
revenue with 15% discount = P × 0.85

maximum landed cost
  = revenue
    - (revenue × 3.5% + 0.30 payment fee)
    - (revenue × 5% refund/defect reserve)
    - (revenue × 30% required contribution margin)

maximum landed cost = revenue × 61.5% - 0.30
```

All results are rounded to the nearest cent only after calculating the threshold.

## Full threshold table

| Product | Target price | Max landed, no discount | Max landed, 15% discount |
|---|---:|---:|---:|
| Boykeep | $40 low | $24.30 | **$20.61** |
| Boykeep | $60 high | $36.60 | **$31.07** |
| Essager | $25 low | $15.08 | **$12.77** |
| Essager | $40 high | $24.30 | **$20.61** |
| Mini 2-in-1 | $15 low | $8.93 | **$7.54** |
| Mini 2-in-1 | $30 high | $18.15 | **$15.38** |
| Cordless brush | $35 low | $21.23 | **$18.00** |
| Cordless brush | $50 high | $30.45 | **$25.84** |
| Milk frother | $18 low | $10.77 | **$9.11** |
| Milk frother | $30 high | $18.15 | **$15.38** |

The [CSV calculator output](./five-product-margin-thresholds-2026-08-08.csv) also includes thresholds at the products' current prices. Those current-price ceilings are shown for diagnostic comparison only. They must not be used to approve a supplier route when the current price itself falls outside a defensible competitive position.

## Product gates

### Boykeep camera

- **Pass for pricing review:** exact all-in landed cost at or below CAD 31.07.
- **Preferred:** at or below CAD 20.61.
- **Still required:** exact Walmart/DSers option equivalence, plug/power-supply contents, ordinary inventory, tracking, delivery quote, camera/privacy claims, returns and warranty.
- **Fail:** cost above CAD 31.07, or a route that only works by retaining the unsupported CAD 98.79 sticker price.

### Essager charger

- **Pass for pricing review:** exact all-in landed cost at or below CAD 20.61.
- **Preferred:** at or below CAD 12.77.
- **Still required:** exact Essager model and mount bundle, ordinary cost rather than welcome pricing, Qi/MagSafe wording substantiation, electrical documentation, tracked delivery and warranty.
- **Fail:** cost above CAD 20.61 or reliance on premium Qi2/CryoBoost comparators to justify a generic 15W product.

### Mini 2-in-1 hair tool

- **Pass for pricing review:** exact all-in landed cost at or below CAD 15.38.
- **Preferred:** at or below CAD 7.54.
- **Still required:** exact battery, runtime, heat-range and charger evidence; electrical/battery transport documentation; burn/fire risk controls; returns and warranty.
- **Fail:** cost above CAD 15.38 or a branded-price strategy without brand-level proof and support.

### Cordless straightener brush

- **Pass for pricing review:** exact all-in landed cost at or below CAD 25.84.
- **Preferred:** at or below CAD 18.00.
- **Still required:** exact 4000mAh/LCD/five-heat configuration, charger, safety evidence, ordinary route cost, tracked delivery, returns and warranty.
- **Fail:** cost above CAD 25.84 or missing electrical/battery evidence.

### Milk frother

- **Pass for pricing review:** exact all-in landed cost at or below CAD 15.38.
- **Preferred:** at or below CAD 9.11.
- **Still required:** exact 1200mAh/three-speed/stand bundle, food-contact material evidence, charging documentation, ordinary route cost, tracked delivery, returns and warranty.
- **Fail:** cost above CAD 15.38. The current CAD 68.97 price cannot be used to rescue an uneconomic supplier route.

## Immediate DSers capture sequence

For each of the five exact mapped variants, record one ordinary repeatable route using the same fields:

1. Supplier URL and item ID.
2. Exact selected option name and image.
3. Ordinary item price, excluding welcome/coin/coupon pricing.
4. Canada tracked shipping charge and normal delivery range for the agreed test postal code.
5. Stock available for that exact option.
6. Source warehouse and carrier/method.
7. Any DSers/order/handling cost not already included.
8. Documentary support for electrical, battery, wireless or food-contact claims relevant to that product.

Sum the landed-cost fields and compare the result with the **absolute competitive route ceiling** first. If it exceeds that number, stop reviewing that route. If it passes, compare it with the conservative ceiling and document how much promotional flexibility remains.

## Evidence basis

- Competitive ranges: `competitive-price-benchmark-2026-08-08.md` and `.csv`.
- Fee, reserve, landed-cost and margin definitions: `supplier-economics-2026-08-08.md` and `.csv`.
- Current catalog prices and identifiers: current recovery catalog evidence captured 2026-08-08.
