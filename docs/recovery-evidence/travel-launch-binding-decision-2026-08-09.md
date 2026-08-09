# Puchica travel launch — binding decision (2026-08-09)

## Decision

Puchica will complete a **travel-organization soft launch** using the existing
DSers + Shopify stack. Product sourcing is closed for this launch. AutoDS is
not required. Paid advertising remains paused until the production checkout
and analytics checks below pass.

The launch catalog is intentionally asymmetric:

- **Canada:** three exact supplier variants.
- **United States:** the cable organizer only.

This is a supplier-route decision, not a design preference. The inspected
packing-cube and toiletry variants have a Canada route but no verified United
States route. The storefront now fails closed by market and supplier SKU, so a
product-level tag or a different color/size cannot accidentally broaden the
offer.

## Exact launch bindings

| Market | Customer listing | Exact supplier SKU | Supplier item + shipping | Supplier route | Shopify price | Shopify inventory observed | Decision |
|---|---|---|---:|---|---:|---:|---|
| CA | Charcoal 3-Piece Packing Cube Set — Small, Medium & Large | `14:1052#S3007 Black;5:200004186#3PCS L M S Set` | US$13.32 + US$1.99 | AliExpress Selection Standard; CN; 8–13 days; tracking available | CA$39.99 | 291 | Soft-launch approved in CA only |
| CA + US | Black Double-Layer Travel Cable Organizer Case | `14:193#Double Layers` | US$4.14 + US$1.99 | AliExpress Selection Standard; CN; 6–11 days; tracking available | CA$24.99 base price; Shopify converts for the US market | 65 | Soft-launch approved in CA and US |
| CA | Black Large Travel Toiletry Organizer | `14:100018754#BK-L` | US$16.57 + US$1.99, using the highest observed item cost | AliExpress Selection Standard; CN; 7–12 days; tracking available | CA$49.99 | 12 | Soft-launch approved in CA only; monitor stock closely |

The shipping times above are supplier estimates, not delivery guarantees. No
other variant, color, size, or supplier is approved. DSers mapping remains the
fulfillment link, while Hydrogen independently blocks every unapproved SKU.

## Conservative unit economics

Planning assumptions:

- dated planning FX rate: 1 USD = CA$1.4123;
- Shopify Basic standard-card fee: 2.8% + CA$0.30;
- 5% of selling price held as a refund/exception reserve;
- no customer-paid shipping revenue included in contribution;
- no discount included; the expired `FIRST15` promotion is not advertised;
- advertising cost, tax remittance, duties, and the monthly Shopify plan are
  excluded.

| Product | CA price | Supplier landed cost | Payment fee | 5% reserve | Pre-ad contribution | Contribution rate |
|---|---:|---:|---:|---:|---:|---:|
| Packing cubes | CA$39.99 | CA$21.62 | CA$1.42 | CA$2.00 | CA$14.95 | 37.4% |
| Cable organizer | CA$24.99 | CA$8.66 | CA$1.00 | CA$1.25 | CA$14.08 | 56.4% |
| Toiletry organizer | CA$49.99 | CA$26.21 | CA$1.70 | CA$2.50 | CA$19.58 | 39.2% |

The Canadian shipping profile currently charges CA$5.00 below CA$50 and free
shipping from CA$50. The US profile charges CA$9.99 equivalent. Because the
table excludes that customer shipping revenue, its contribution estimates are
conservative. A two-product order clears the Canadian free-shipping threshold.

Shopify publishes 2.8% + CA$0.30 for a Basic-plan Canadian standard online
card and 3.5% + CA$0.30 for Amex/international cards. Replacing 2.8% with 3.5%
does not make any of the three product-level cases negative, but the real
checkout still must be tested before ads.

Official fee source:
https://www.shopify.com/ca/pricing

## Product-truth and presentation controls

- The homepage hero image and feature card now use the same product.
- Product copy names only the exact approved configuration.
- Packing cubes are described as standard zippered organizers, not vacuum or
  mechanical compression products.
- The cable listing is Black / Double Layer and does not imply included
  electronics.
- The toiletry listing is Black / Large and does not claim IPX6, submersion,
  MOLLE construction, a roll-top closure, or dry-bag capacity.
- Product pages, collections, search, feeds, merchandising, navigation, and
  cart validation all use the same market + exact-SKU gate.
- In the US market, direct packing-cube or toiletry URLs fail closed.
- The expired discount promise was removed from newsletter and promotional
  copy.

## Duties and customer disclosure

Puchica's policy is Delivered at Place (DAP): a customer may be responsible for
duties, import taxes, brokerage, or carrier collection fees. The Shipping page
now discloses this. Shopify notes that DAP places import-cost responsibility on
the customer and that carriers can charge additional collection fees.

Official Shopify sources:

- https://help.shopify.com/en/manual/international/duties-and-import-taxes
- https://help.shopify.com/en/manual/markets/customizations/duties-and-taxes

Before scaling the US market, add or confirm the correct country of origin and
HS code for the cable organizer and review the destination checkout. Customs
classification must be based on the exact product; it should not be guessed.

## DSers operating model

DSers is suitable for this launch. Its official documentation states that
mapping connects a store option to the supplier SKU used for ordering. Basic
Mapping supports a default supplier plus a substitute; Advanced Mapping is for
country-specific SKU routing and larger multi-supplier rules. Puchica does not
need to buy another fulfillment subscription to launch this bounded catalog.

Official DSers sources:

- https://help.dsers.com/mapping-explained-how-dsers-knows-which-supplier-to-order-from/
- https://help.dsers.com/apply-multiple-suppliers-to-a-product/

## Remaining release sequence

1. Build and verify a fresh private Oxygen preview.
2. Confirm Canada homepage, collection, all three exact product pages, cart,
   policy links, and mobile navigation.
3. Confirm the US market shows only the cable organizer and that packing and
   toiletry URLs fail closed.
4. Run a Canadian checkout to the payment screen and confirm the CA$5 / free
   over CA$50 rules without placing an order.
5. Run a US cable-organizer checkout to the payment screen and confirm the
   displayed currency, CA$9.99-equivalent shipping, and duty disclosure without
   placing an order.
6. Review the private preview, then deploy the reviewed build to production.
7. Complete one production analytics smoke test. Only then prepare an organic
   launch. Paid ads require a separate budget, creative, CAC, and stop-rule
   approval.

No sample order is required for this release decision. No ad spend is
authorized by this document.
