# Frozen-catalog checkout economics gate — 2026-08-09

## Binding result

**HOLD the public launch and all ads.** The live Canada and U.S. checkouts calculate shipping correctly and the four tested carts clear a 30% pre-ad contribution floor, including a hypothetical 15% merchandise discount. The release still fails closed for two reasons: **no tax line appeared for either destination**, and the current-session DSers fulfillment check could not be refreshed because the connected session was not signed in. These are configuration/evidence blockers, not a finding that the products lose money.

No order was submitted. No payment data was entered. No account was created, and no address was saved.

## Address-specific checkout observations

Public, non-personal government destinations were used only to calculate checkout:

- Canada: Winnipeg City Hall, 510 Main Street, Winnipeg, Manitoba R3B 1B9.
- United States: Seattle City Hall, 600 4th Avenue, Seattle, Washington 98104.
- Contact identity: `Checkout Audit`; email used: `checkout-audit@invalid.example`.

| Destination / cart | Merchandise | Shipping shown | Tax shown | Total before payment | Checkout result |
|---|---:|---:|---:|---:|---|
| Canada — packing cubes | CA$39.99 | Standard Shipping CA$5.00 | **No tax line** | CA$44.99 | Method populated; no ETA shown |
| Canada — cable organizer | CA$24.99 | Standard Shipping CA$5.00 | **No tax line** | CA$29.99 | Method populated; no ETA shown |
| Canada — both | CA$64.98 | Free Shipping Over $50 | **No tax line** | CA$64.98 | Threshold worked; no ETA shown |
| U.S. — cable organizer | US$19.00 | Standard Shipping US$8.00 | **No tax line** | US$27.00 | Method populated; no ETA shown |

The absence of a tax line records what Shopify presented; it is **not** a legal conclusion that no tax is due. Shopify tax settings and the owner's registration/collection obligations require verification before launch.

## Discounts and customer disclosures

- The live checkout showed a promo-code field but **no automatic discount**.
- Shopify Admin showed one code, `FIRST15` (“First order — 15% off”), as **Expired**, used 0 times. There is no current active first-order offer in the evidence reviewed.
- The store shipping policy states that eligible Canada/U.S. orders may be fulfilled by third parties outside the destination country and may split; Shopify-collected shipping and taxes appear before payment; duties, import charges, brokerage, or other destination charges not collected at checkout are the customer's responsibility; tracking exists only when the selected service provides it.
- The checkout itself displayed no delivery estimate for the configured Standard Shipping methods.

## Cost and calculation basis

Conservative transaction assumptions follow the established recovery methodology:

- payment fee = 3.5% of the full checkout charge + 0.30 in the sale currency;
- refund/exception reserve = 5% of the full checkout charge;
- 30% of the full checkout charge is protected as the minimum pre-ad contribution;
- customer-paid checkout shipping is included in collected revenue;
- supplier landed cost already includes the exact supplier item and tracked supplier shipping, so shipping is not deducted twice;
- tax remittance, currency-conversion leakage, duties, fixed monthly overhead, and paid acquisition are excluded.

Exact supplier evidence is dated August 8–9 and must be refreshed before accepting orders:

| Product | Exact frozen option | Supplier evidence | Landed cost used |
|---|---|---|---:|
| Packing cubes | `14:1052#S3007 Black;5:200004186#3PCS L M S Set` | US$13.32 item + US$1.99 tracked CA shipping, CN, 8–13 days | **CA$21.62** |
| Cable organizer — Canada | `14:193#Double Layers` | US$4.14 item + US$1.99 tracked shipping, CN, 6–11 days | **CA$8.66** |
| Cable organizer — U.S. | `14:193#Double Layers` | Same exact item and tracked U.S. route | **US$6.13** |

The current DSers session could not revalidate mapping, variant-specific stock, or route freshness. The exact costs above are therefore usable for a conservative economics screen, not as present-tense fulfillment approval.

## Contribution gate

`CAC room after 30% floor` is the most that could be spent on acquisition while still preserving a 30% contribution. A positive number is not, by itself, authorization to advertise.

| Cart / scenario | Collected | Supplier landed | Fee | 5% reserve | Pre-ad contribution | Margin | CAC room after 30% floor |
|---|---:|---:|---:|---:|---:|---:|---:|
| CA packing — current | CA$44.99 | CA$21.62 | CA$1.87 | CA$2.25 | CA$19.25 | 42.8% | CA$5.75 |
| CA packing — 15% merchandise stress | CA$38.99 | CA$21.62 | CA$1.66 | CA$1.95 | CA$13.76 | 35.3% | CA$2.06 |
| CA cable — current | CA$29.99 | CA$8.66 | CA$1.35 | CA$1.50 | CA$18.48 | 61.6% | CA$9.48 |
| CA cable — 15% merchandise stress | CA$26.24 | CA$8.66 | CA$1.22 | CA$1.31 | CA$15.05 | 57.4% | CA$7.18 |
| CA both — current | CA$64.98 | CA$30.28 | CA$2.57 | CA$3.25 | CA$28.88 | 44.4% | CA$9.38 |
| CA both — 15% merchandise stress | CA$55.23 | CA$30.28 | CA$2.23 | CA$2.76 | CA$19.96 | 36.1% | CA$3.39 |
| U.S. cable — current | US$27.00 | US$6.13 | US$1.25 | US$1.35 | US$18.28 | 67.7% | US$10.18 |
| U.S. cable — 15% merchandise stress | US$24.15 | US$6.13 | US$1.15 | US$1.21 | US$15.67 | 64.9% | US$8.42 |

The 15% stress applies only to merchandise. Canada carts below CA$50 retain the observed CA$5 shipping charge; the discounted two-product cart remains above CA$50 and retains free shipping. The U.S. cable cart retains the observed US$8 charge.

## Hard decisions

| Cart | Organic economics | Paid-ad economics | Launch decision now |
|---|---|---|---|
| Canada packing alone | **PASS** at the evidenced cost, but only CA$2.06 room remains above the 30% floor under 15% stress | **NOT AD-SAFE** conservatively; too little stress-case CAC room | **HOLD** pending tax and current DSers revalidation |
| Canada cable alone | **PASS** | **Margin-qualified**, with CA$7.18 stress-case CAC room | **HOLD** pending tax and current DSers revalidation |
| Canada bundle | **PASS** | **Not yet ad-approved**; CA$3.39 stress-case CAC room is thin for a two-item order | **HOLD** pending tax and both routes revalidation |
| U.S. cable alone | **PASS** | **Margin-qualified**, with US$8.42 stress-case CAC room | **HOLD** pending tax and current DSers revalidation |

## Release sequence

1. Verify why Shopify collected no tax line for the Manitoba and Washington destinations; document the intended tax treatment before launch.
2. Restore the signed-in DSers session and revalidate only the two frozen exact options: mapping, option stock, ordinary cost, CA/U.S. tracked route, ship-from and ETA.
3. Confirm the refreshed landed costs do not exceed the 30% stress ceilings: CA$23.68 for packing alone, CA$15.84 for cable alone, CA$33.67 total for the Canadian bundle, and US$14.55 for U.S. cable alone.
4. Run one production analytics smoke test. Only after all three gates pass should organic launch be enabled. Ads remain paused until a separate CAC budget, creative test and stop rules are approved.

## Bottom line

The current prices and observed shipping rules are **not the economic problem**. The cable organizer has strong unit economics; packing cubes and the bundle still clear the floor, but become thin under a 15% promotion. The immediate launch blockers are tax presentation and fresh fulfillment evidence. Do not activate `FIRST15`, accept orders, or spend on ads until those two blockers are closed.
