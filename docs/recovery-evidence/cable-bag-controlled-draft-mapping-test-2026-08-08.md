# Cable bag controlled draft mapping test

**Date:** 2026-08-08
**Authorized scope:** push one pre-existing private DSers Import List record to Shopify as a contained draft, then inspect mapping read-only.
**External-state result:** **DRAFT CREATED; NOT PUBLISHED. MAPPING DETAIL REMAINS HOLD.**

## Created contained records

| System | Record |
|---|---|
| Original DSers Import List | `2082947114649846464` |
| New DSers My Products | `2086248367047835648` |
| Shopify product | `9365959246074` |
| Shopify handle | `data-cable-storage-bag-waterproof-portable-carry-case-storage-bag-travel-organizer-bag-for-cable-cord-usb-charger` |
| Shopify admin URL | `https://admin.shopify.com/store/puchica-2/products/9365959246074` |

Before pushing, Shopify search returned **No products found** and DSers My Products held 29 records with no matching title. The apparent import-list marker was stale/ambiguous, so no duplicate was reused. One repush to the current DSers store `ug91ve-sz` was then performed.

## Containment confirmed

- DSers push setting **Set product status as Draft** was checked.
- **Also publish to Online Store** was unchecked.
- Shopify lists the created product as **Draft**.
- The Shopify admin product page also reports status **Draft**.
- No approval tags were added.
- No order, publication, Online Store assignment, mapping mutation, supplier replacement, or other product change occurred.

Shopify created seven variants and reports **115 in stock for 7 variants**. DSers My Products reports aggregate stock **105**. This 10-unit cross-system discrepancy is itself a blocker until the exact mapped option table is accessible.

## Mapping inspection result

DSers created the My Products card successfully, but its read-only **Check details** action did not open a mapping/detail surface in the browser session. Per the stop instruction, no further retries or substitute workflow were attempted.

Therefore the controlled draft did **not** recover:

- exact AliExpress item URL/ID;
- per-option stock for `Double Layers 1`;
- authoritative option colour identity; or
- country-specific Advanced Mapping supplier assignments.

The prior Import List route evidence remains the only exact option-level evidence:

- DSers option label `Double Layers 1`;
- supplier SKU `14:193#Double Layers`;
- ordinary item cost US$4.14;
- exact option stock **not exposed**;
- Canada: AliExpress Selection Standard, CN, US$1.99, 6–11 days, tracking available;
- United States: AliExpress Selection Standard, CN, US$1.99, 6–11 days, tracking available.

## Hard decision

**HOLD.** The draft is safely contained and gives us stable Shopify/DSers record IDs, but it must not receive approval tags or be published. The missing exact supplier identity, unnamed colour, hidden per-option stock, and 105-versus-115 stock discrepancy prevent launch approval.

## Rollback path

No rollback was executed. If the controlled draft should be removed:

1. delete Shopify draft product `9365959246074`; and
2. delete the corresponding DSers My Products record `2086248367047835648`.

The original private Import List record `2082947114649846464` should be retained unless a separate cleanup decision explicitly removes it. Because the Shopify product is Draft and Online Store publication was disabled, rollback is not required for storefront containment.
