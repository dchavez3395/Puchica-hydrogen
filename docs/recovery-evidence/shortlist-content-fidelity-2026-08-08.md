# Shortlist content-fidelity audit — 2026-08-08

Status: **read-only audit; no Shopify or DSers mutations**

## Scope and evidence limits

This audit compares the six requested products against:

- `shopify-admin-catalog-2026-08-08.json` for current title, description, SEO, option, SKU, media, and variant records;
- the Shopify CDN media referenced by that export, visually inspected at original resolution;
- `dsers-mapping-verification-2026-08-08.csv` for DSers product-level mapping, supplier-price range, and order-count evidence; and
- `candidate-variant-inventory-2026-08-08.csv` for cross-checks on Shopify IDs, SKU, media count, weight, and inventory state.

The DSers evidence says all six are **mapped to AliExpress at product level**. It does **not** contain the exact supplier title, supplier SKU/option, included-parts selection, or variant-level mapping. The supplier-formatted Shopify SKUs contain an AliExpress-looking listing ID, but that is only a reference carried in Shopify; it is not proof of the currently selected DSers option.

Five of the six DSers cards show a supplier price range while Shopify exposes only one `Default Title` variant. That does not prove a wrong mapping, but it means the customer-facing option cannot yet be reconciled to a specific supplier option.

## Executive result

None of the six is content-fidelity ready.

| Classification | Products | Meaning |
|---|---|---|
| Direct critical mismatch | Mini 2-in-1 straightener; Essager charger; cordless straightener brush | Shopify copy directly conflicts with the current product image or with another Shopify claim. |
| Critical evidence gap | Brushless drill kit; Boykeep camera | The core product looks plausible, but central included-parts, app, compatibility, safety, or service claims cannot be tied to the exact mapped supplier option. |
| Repairable copy-gap hold | Wireless milk frother | Core image/title identity is coherent; the page could become viable after exact-option confirmation and aggressive removal of unsupported specifications. |

This result does not discard any product. It identifies the minimum truth work required before a product can receive `copy-verified` or `imagery-verified`.

## Product findings

### 1. Boykeep 2K pet camera — critical evidence gap

What aligns:

- The sole image shows a Boykeep-branded pan/tilt indoor camera and labels it “Ultra HD 3MP” and “5G WiFi Camera.”
- The written 2304 × 1296 resolution is approximately 3MP, so “3MP” and “2K-class” are not themselves a decisive contradiction.
- DSers evidence identifies this Shopify product as product-level mapped.

What blocks fidelity:

- The exact app, app publisher, privacy/data handling, 2.4/5 GHz support, motion tracking, two-way audio, multi-user behavior, microSD limit, included power adapter, and “no subscription required” claim are not tied to the exact mapped supplier option.
- “5G WiFi” is ambiguous customer language and must be rewritten as 5 GHz Wi‑Fi only if the exact hardware proves dual-band Wi‑Fi; it must not imply cellular 5G.
- Shopify SEO says “Trusted by 5000+ AE buyers,” while the captured DSers card records 4,655 orders. A marketplace order count is not a Puchica customer endorsement and should be removed regardless.
- One 480 × 480 image is not enough to prove ports, included adapter, controls, storage slot, app identity, or package contents.

Disposition: **keep quarantined**. Obtain the exact supplier-option title, app/manual, package list, Wi‑Fi bands, storage behavior, subscription terms, electrical label, and a complete original gallery. Then rewrite from evidence.

### 2. Essager magnetic car charger — direct critical mismatch

What aligns:

- The sole image clearly shows an Essager-branded circular magnetic charger marked 15W.
- Title and SEO call it an “Easy Paste” mount, and the image shows an articulated adhesive/dashboard base.
- DSers evidence identifies the Shopify product as product-level mapped.

Critical contradiction:

- The body calls it a “Universal Vent Mount,” says it fits 99% of vents, and describes a vent mount staying steady on rough roads. The image does not show a vent clip; it shows a dashboard adhesive-base design. The title/SEO and body describe different mounting systems.

Other unsupported details include Qi certification, N52 grade, 16-magnet array, charging through 5 mm cases, LED behavior, broad phone compatibility, and included cable/adapter status.

Disposition: **keep quarantined**. Verify the exact DSers mount option and package contents first. Rewrite the title/body around that one mount type and add installation, compatibility, cable, and package images.

### 3. Mini 2-in-1 straightener/curling iron — direct critical mismatch

Critical contradiction:

- The title and body repeatedly describe a cordless tool with a 2000mAh battery and USB-C charging.
- The sole image clearly shows multiple mini straighteners with attached power cords.
- The image shows several colors while Shopify offers only one `Default Title` option, so the color the customer would receive is also unclear.

The image supports “mini straightener,” but it does not prove curling performance, a battery, USB-C, three stated temperature levels, auto shut-off, tourmaline plates, the stated dimensions/weight, or the promised pouch/cable/manual.

Disposition: **do not repair by copy alone until the exact mapped option is inspected**. If the supplier option is corded, remove every cordless/battery/USB-C assertion and expose the plug/color option. If the supplier option is cordless, replace the current image set with exact-option media.

### 4. Cordless straightener brush — direct critical mismatch

What aligns:

- The sole image supports a cordless-looking heated brush with a visible LCD.

Critical contradictions:

- The image’s display reads 230°C while the body states a maximum of 200°C.
- SEO says a 60-minute runtime; the body says 40–50 minutes.

The 4000mAh battery, USB-C, PTC heating, five settings, negative ions, anti-scald behavior, dual voltage, heat-up time, carry-on suitability, and one-pass/performance claims are not backed by exact supplier-option evidence. Heated lithium-battery products also require safety, electrical, transport, warranty, and returns evidence beyond a product image.

Disposition: **keep quarantined**. Confirm the exact electrical label, charging interface, temperatures, battery, runtime, warnings, and included parts; then replace claims and add a truthful gallery.

### 5. Brushless drill kit — critical evidence gap

What aligns:

- Three images show a visually consistent red/black cordless drill.
- The images plausibly support a brushless-looking drill body, clutch ring, keyless chuck, and work light.

What blocks fidelity:

- The title/body sell a kit with two batteries, 30+ accessories, a charger, and a hard case, but none of the three images shows those items.
- The exact DSers kit option and charger plug are not captured.
- SEO says 42 Nm while the body says 45 Nm.
- 21V convention, 25+3 modes, 1500mAh batteries, one-hour charging, wood/metal/masonry suitability, 2× runtime, 10× motor life, quiet operation, and the one-year/full warranty promises are not proven.
- The storefront has zero shipping weight for a purported drill kit, reinforcing that the offer has not been operationally reconciled.

Disposition: **keep quarantined**. The exact mapped option must show the full laid-out package, battery labels, charger/plug, manual/specification table, and certifications. Copy must then use one torque value and a literal included-parts list.

### 6. Wireless milk frother — repairable copy-gap hold

What aligns:

- The image explicitly shows USB charging and three speed settings.
- The image and title agree on the core identity: a rechargeable handheld milk frother.
- DSers evidence identifies the product as product-level mapped.

What remains unproven:

- The image shows black and white units, but Shopify exposes no color option and the exact mapped color is not captured.
- USB-C, 1200mAh, 3W, 1000/1500/2000 RPM, 30-day battery duration, 304 stainless steel, a detachable dishwasher-safe head, exact dimensions/weight, and the included stand/cable/manual are not proven.
- “Barista-grade,” dense microfoam, plant-milk performance, recipe use, guarantee, free-shipping, and no-questions-asked return language exceed the evidence.

Disposition: **best repair candidate of the six**, but still held. Confirm the exact option/color, charging port, materials, speeds, battery label, and package contents. Keep only claims visible in the product/manual and add original controls, charging, whisk-head, in-use, and package images.

## Required next evidence

For each product retained in the shortlist, capture one variant-level DSers record containing:

1. Shopify variant ID and exact mapped supplier option/SKU;
2. supplier listing title and stable listing URL;
3. selected color/model/plug/kit;
4. complete included-parts list;
5. supplier specification table/manual and safety warnings;
6. original image gallery for the exact option;
7. current stock, ordinary cost, and Canada/US shipping route; and
8. any app, certification, subscription, warranty, or compatibility evidence needed by the proposed copy.

Only after those fields reconcile should the product receive `copy-verified` or `imagery-verified`.
