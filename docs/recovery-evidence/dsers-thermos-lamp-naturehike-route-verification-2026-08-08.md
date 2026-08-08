# DSers thermos, lamp, and Naturehike route verification — 2026-08-08

## Scope and method

Read-only inspection of three existing AliExpress-mapped DSers products. For each product, the DSers product card and Shipping Info drawer were inspected for the supplier item, selected supplier SKU, displayed item-cost range, DSers stock, and Canada/United States shipping methods.

No mapping, option, supplier, catalog field, address, order, or payment was changed.

## Result summary

| Product | Selected supplier SKU | Canada | United States | Verdict |
|---|---|---|---|---|
| 500 mL temperature-display thermos | **No supplier SKU selected** | No Shipping | No Shipping | **Fail** |
| USB desk lamp | `Big Recharge 3color` | Two tracked routes; free or US$0.64; 9–16 days | Same | **Route pass; product/price conditional** |
| Naturehike toiletry bag | `BK-L` | US$1.99; 7–12 days; tracked | No Shipping | **Canada route only for BK-L; current offer still fails fidelity** |

All working routes ship from China.

## 1. Temperature-display thermos — hard fail

- Shopify product ID: `9351895548154`
- DSers product ID: `2085218798941634560`
- Supplier item: `Smart Creative Temperature Display Water Bottle 304 Stainless Steel Insulated Cold Proof Straight Cup Business Gifts`
- Selected supplier SKU: **none**; DSers displayed an empty SKU selection
- DSers card cost: `$26.75` / `CA$37.32`
- DSers card stock: `32,460`
- Current Canadian price shown in DSers: `CA$127.33`
- Canada: `No Shipping`
- United States: `No Shipping`
- DSers note: shipping method and ability may vary according to SKU selection

### Consequence

This record is product-level mapped but does not have a usable selected supplier variant in the Shipping Info drawer. There is no exact capacity, colour, lid, display, or material option to reconcile to Shopify's single `Default Title` variant. The cost shown is not defensible as an exact mapped-variant cost because no supplier SKU is selected. Reject the current product/source until a specific 500 mL supplier variant is mapped and both routes are rechecked.

## 2. USB desk lamp — route pass, commercial hold

- Shopify product ID: `9351895810298`
- DSers product ID: `2085218769107484672`
- Supplier item: `Table Lamp Usb Plug In Study Foldable Childrens Bedside Reading Light For Students Desk For Studying Dimmable Night Lamps Office`
- Selected supplier SKU: `Big Recharge 3color`
- DSers card cost range: `$13.13–22.67` / `CA$18.32–31.63`
- DSers card stock: `24,973`
- Current Canadian price shown in DSers: `CA$138.22`
- Canada and United States route 1: AliExpress standard shipping; CN; free; 9–16 days; tracking available
- Canada and United States route 2: Cainiao Standard - SG Air; CN; US$0.64; 9–13 days; tracking available

### Consequence

The selected supplier option supports the words `Recharge` and `3color`, but Shopify exposes only `Default Title`; customers cannot see which supplier configuration is being sold. The DSers card provides a product cost range, not an exact `Big Recharge 3color` cost, so exact landed margin is still unresolved. The working routes pass, but approval remains blocked until:

1. `Big Recharge 3color` is translated into a clear customer-facing variant or a documented single-option offer.
2. Rechargeability, controls, connector, cable, battery and included parts are reconciled to supplier evidence.
3. The exact supplier-option cost is captured.
4. The CA$138.22 selling price is replaced with a competitive evidence-based price.
5. The one-image gallery and electrical/battery evidence are repaired.

## 3. Naturehike toiletry bag — Canada route only, current listing still fails

- Shopify product ID: `9341750968570`
- DSers product ID: `2083032587397234688`
- Supplier item: `Naturehike Camping Hiking Toiletry Bag Travel Cosmetic Bag Beach Pool Surfing Portable Large Capacity Carry Waterproof Bag`
- Selected supplier SKU: `BK-L`
- DSers card cost range: `$12.31–16.57` / `CA$17.17–23.12`
- DSers aggregate stock: `132`
- Current Canadian price range shown in DSers: `CA$40.23–73.45`
- Canada: AliExpress Selection Standard; CN; US$1.99; 7–12 days; tracking available
- United States: `No Shipping`

### Consequence

The selected `BK-L` option has a usable Canadian route but no current US route. This directly contradicts the existing Shopify tag `us-route-verified`; that tag must not be treated as current evidence.

Only the selected `BK-L` drawer was route-checked. Shopify sells six coded options (`BK-L`, `Grey-L`, `BK-S`, `BN-S`, `BN-L`, `Grey-S`), so the other five remain route-unverified. DSers' stock `132` is product-level aggregate stock, not proof of adequate stock for every Shopify option.

The current offer still fails independently because the Shopify copy describes an 8/15 L roll-top dry bag while its media show a small zip toiletry case. Unsupported `waterproof`, IPX6, submersion, YKK and MOLLE claims cannot be retained. Treat this as a Canada-only route pass for `BK-L`, not approval of the product listing.

## Hard blockers to feed into selection

- **Thermos:** no selected supplier SKU and no route to either launch country.
- **Lamp:** route works, but exact option cost is not exposed, Shopify hides the mapped option, and current price/product evidence are unacceptable.
- **Naturehike:** BK-L Canada route works; US route does not. Five other Shopify options remain route-unverified, and the current copy/media describe a materially different product.
