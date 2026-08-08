# DSers shortlist route verification — 2026-08-08

## Scope and result

Read-only deep check of six existing products already proven mapped to AliExpress in DSers. For every product, this audit records the exact supplier listing, selected supplier SKU, DSers cost and stock, and current Canada shipping result. A United States route was also captured where DSers exposed one.

No mapping, supplier, setting, address, order or payment was changed.

| Product | Selected supplier SKU | Canada result | US result | Route verdict |
|---|---|---|---|---|
| Wireless milk frother | `black` | US$1.99, 8–13 days, tracked | US$1.99, 8–13 days, tracked | **Route pass** |
| Mini 2-in-1 styler | `Pink-US` | US$1.99, 9–15 days, tracked | US$1.99, 9–15 days, tracked | **Route pass; US plug** |
| Cordless straightener brush | `03` | Free, 11–22 days, tracked | Free, 11–22 days, tracked | **Conditional; option name is opaque** |
| Boykeep pet camera | `White-220V-240V EU Plug` | US$1.99, 9–14 days, tracked | US$1.99, 9–14 days, tracked | **Fail: EU plug selected** |
| Brushless drill | `80N.m Two-speed-EU` | Free, 9–15 days, tracked | US$1.99, 9–14 days, tracked | **Fail: EU plug selected** |
| Essager wireless charger | `Wireless Charger` | No Shipping | No Shipping | **Fail: no route for selected SKU** |

All routes above ship from China. `Tracked` means DSers displayed tracking as available.

## Exact evidence

### Wireless milk frother — route pass

- DSers product ID: `2085218934304604160`
- Supplier item: `Electric Milk Frother Handheld USB Rechargeable 3 Speed Foam Maker for Coffee Latte Hot Chocolate Portable Mixer Whisk`
- Selected supplier SKU: `black`
- DSers cost: `$7.85–8.81` / `CA$10.95–12.29`
- DSers stock: `19,978`
- Canada: AliExpress Selection Standard; CN; US$1.99; 8–13 days; tracking available
- United States: AliExpress Selection Standard; CN; US$1.99; 8–13 days; tracking available
- Verdict: shipping-route pass. Product truth, claims, image fidelity and full margin still require their separate gates.

### Mini 2-in-1 hair straightener/curling iron — route pass, compatibility visible

- DSers product ID: `2085218941523001344`
- Supplier item: `A mini hair iron pink corrugated plate electric curling iron curl modelling tools`
- Selected supplier SKU: `Pink-US`
- DSers cost: `$5.61–6.31` / `CA$7.83–8.80`
- DSers stock: `75,660`
- Canada: AliExpress Selection Standard; CN; US$1.99; 9–15 days; tracking available
- United States: AliExpress Selection Standard; CN; US$1.99; 9–15 days; tracking available
- Verdict: shipping-route pass. The selected option explicitly says US, which is materially better aligned with Canada/US than the EU-plug mappings. Exact voltage, included parts, images and copy must still be reconciled.

### Cordless hair straightener brush — conditional

- DSers product ID: `2085218918345342976`
- Supplier item: `Electric LCD Usb Ceramic Heating Straight Hair Comb Wireless Portable Negative Ion Styling Tool Rechargeable Straightening Brush`
- Selected supplier SKU: `03`
- DSers cost: `$15.98` / `CA$22.29`
- DSers stock: `49,988`
- Canada: ChuKouYi Standard Shipping; CN; free; 11–22 days; tracking available
- United States: ChuKouYi Standard Shipping; CN; free; 11–22 days; tracking available
- Verdict: route works, but `03` is not a customer-readable option. Do not approve until `03` is matched to the exact colour/configuration shown and sold in Shopify.

### Boykeep 2K pet camera — fail pending supplier-option correction

- DSers product ID: `2085218885243568128`
- Supplier item: `Pet Dog Camera with Phone App, 5G/2.4GHz WiFi Indoor Security Baby Camera, 360° Pan & Tilt, 2-Way Audio, Night Vision`
- Selected supplier SKU: `White-220V-240V EU Plug`
- DSers cost: `$22.85–26.05` / `CA$31.88–36.34`
- DSers stock: `4,655`
- Canada: Choice Special Cargo Standard PRE; CN; US$1.99; 9–14 days; tracking available
- United States: Choice Special Cargo Standard PRE; CN; US$1.99; 9–14 days; tracking available
- Verdict: **fail** for Canada/US launch. DSers can ship the product, but the mapped SKU is a 220–240V EU-plug option. Route availability does not make that configuration compatible.

### Brushless drill — fail pending supplier-option correction

- DSers product ID: `2085219052449824768`
- Supplier item: `Brushless Electric Drill Tapping Cordless Impact Drill Metal Ratchet Chuck Electric Hand Drill Household Electric Screwdriver`
- Selected supplier SKU: `80N.m Two-speed-EU`
- DSers cost: `$46.31–48.32` / `CA$64.60–67.41`
- DSers stock: `319`
- Canada: AliExpress Selection Standard; CN; free; 9–15 days; tracking available
- United States: AliExpress Selection Standard; CN; US$1.99; 9–14 days; tracking available
- Verdict: **fail** for Canada/US launch because the mapped SKU is explicitly EU. Confirm a Canadian-compatible supplier option before reconsidering.

### Essager magnetic wireless charger — fail for selected SKU

- DSers product ID: `2085218824753315840`
- Supplier item: `Car Magnetic Wireless Charger Adjustable Mobile Phone Holder for iPhone 15 14 13 12 Pro Max Fast Charging Easy Paste Mount Stand`
- Selected supplier SKU: `Wireless Charger`
- DSers cost: `$12.44–15.32` / `CA$17.35–21.37`
- DSers stock: `9,999`
- Canada: `No Shipping`
- United States: `No Shipping`
- DSers note: shipping method and ability may vary according to SKU selection.
- Verdict: **fail** for the selected mapped SKU in both launch markets. A different supplier option or supplier is required and must be reverified.

## Immediate commercial implication

The mapping work was real: all six are mapped. The deep inspection shows why mapping cannot be the final approval gate:

- Two selected mappings use EU electrical configurations despite being shippable to Canada/US.
- One selected mapping has no Canada or US shipping route.
- Three have usable routes, although one uses an opaque supplier option that still requires exact product reconciliation.

The strongest route-level candidates from this group are the milk frother and the Pink-US mini styler. The cordless brush remains conditional. None is approved for publication until product fidelity, copy/claims, complete landed-cost margin and Shopify variant data pass the other gates.
