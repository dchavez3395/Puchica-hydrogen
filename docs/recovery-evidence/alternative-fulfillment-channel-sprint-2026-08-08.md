# Alternative fulfillment channel sprint — 2026-08-08

## Decision

**Approved candidates: 0 of 6.** This bounded pass did not find a compact-desk product that could be approved for Canada and the United States from publicly available evidence. Every exact candidate failed at least one mandatory gate: ordinary item cost, usable stock, exact supplier SKU/option, or tracked Canada and U.S. shipping cost/ETA.

This is a sourcing result, not a recommendation to subscribe to another automation platform. No account was created, no subscription was purchased, no supplier was contacted, and nothing was imported or changed.

## Mandatory gate

A candidate was only eligible to pass if its public listing exposed all of the following:

- exact product URL and item/SKU;
- unbranded, passive, low-risk product in the compact-desk cluster;
- ordinary item cost (not a welcome or coupon-only price);
- usable stock or inventory evidence;
- exact selected option where variants exist; and
- Canada **and** U.S. shipping cost, ETA, and tracking evidence.

`BLOCKED` means the item might be inspectable inside a paid/authenticated platform, but the required evidence is not public. `REJECT` means the visible evidence already violates a hard launch requirement.

## Exact-candidate results

| Category | Channel | Exact item | Public evidence | Canada route | U.S. route | Decision |
|---|---|---|---|---|---|---|
| Cable tray | MySellerHub | [Cable Management Tray Under Desk](https://mysellerhub.com/dropship/electrical-equipment/73921/cable-management-tray-under-desk/6049877/), path/item ID `6049877` | Ships from U.S.; listing says shipping “3 days”; public price renders as `999`, so ordinary cost is not defensible; no stock count or supplier SKU exposed | Not exposed | Only a generic U.S.-origin/“3 days” statement; no cost, carrier, or trackability | **BLOCKED** — price/SKU/stock and Canada route absent |
| Routing kit | CJdropshipping | [Multifunctional Clip Holder / Wire Organizer](https://cjdropshipping.com/product/multifunctional-clip-holder-thumb-hooks-wire-organizer-wall-hooks-hanger-strong-wall-storage-holder-for-kitchen-bathroom-p-1492368742473142272.html), SKU `CJJT141393601AZ` | Public cost `$0.30`; default Green `1PCS`; multiple 1/4/10/12-piece and random-colour options; inventory `0` | No shipping method, cost, ETA, or tracking exposed | No shipping method, cost, ETA, or tracking exposed | **REJECT** — zero inventory; route absent; option ambiguity |
| Vertical stand | TVCMALL | [Aluminum Alloy Vertical Laptop Stand](https://www.tvcmall.com/details/aluminum-alloy-vertical-laptop-stand-adjustable-desktop-holder-black-sku102101774c.html), item `102101774C` | `$7.65`; black; adjustable 1.4–7.3 cm; MOQ `20`; processing 1–3 days; stock count not exposed | Destination and estimated shipping cost show `--`; no ETA/tracking | Destination and estimated shipping cost show `--`; no ETA/tracking | **REJECT** — MOQ 20 is incompatible with one-order-at-a-time launch; routes unverified |
| Drawer organizers | Doba | [25-piece Clear Plastic Drawer Organizer Set](https://www.doba.com/product/cIQhvAgSEPbM/dropshipping-25-pcs-clear-plastic-drawer-organizer-set-4-sizes-desk-drawer-divider-organizers-and-storage-bins-for-makeup-jewelry-gadgets-for-kitchen-bedroom-bathroom-office.html), item `D01027HRTAY` | Supplier “Zeus LLC”; 1 pack; ships from U.S.; processing 3 business days; exact page requires sign-up to reveal price/inventory | Cost, ETA, carrier/tracking, and eligibility not exposed | Shipping cost, exact ETA, carrier/tracking not exposed | **BLOCKED** — ordinary cost, exact stock, and Canada route gated |
| Under-desk drawer | Doba | [Self-stick Pencil Tray / Under-desk Drawer](https://www.doba.com/product/HiVcFWjjfoqE/dropshipping-1pc-self-stick-pencil-tray-desk-table-storage-drawer-organizer-box-under-desk-stand-self-adhesive-under-drawer-stationery-storage.html), item `D0101H2BKJY` | Supplier “Novelty”; gray/white and S/M/L (6 variants); ships from China; processing 3 business days; price/inventory gated | Cost, ETA, carrier/tracking, and eligibility not exposed | Cost, ETA, carrier/tracking not exposed | **BLOCKED** — option can be identified, but economics/stock and both routes cannot be reconciled publicly |
| Desktop drawer organizer | Doba | [Wooden Desk Organizer with Drawer](https://www.doba.com/product/GEbHKWLSsJDm/dropshipping-1pc-wooden-desk-organizer-multi-functional-diy-pen-holder-pen-organizer-for-desk-desktop-stationary-easy-assembly-home-office-art-supplies-organizer-storage-with-drawer.html), item `D0101H2BND7` | Supplier “Novelty”; with/without-drawer variants; ships from China; processing 3 business days; available item count shown as 2,522; price gated | Listing exposes no Canada eligibility/cost/ETA/tracking | Page explicitly lists available ship-to as United States, but cost/ETA/tracking remain hidden | **REJECT** — no Canada route and ordinary price unavailable |

## Platform-level findings

### CJdropshipping

CJ exposes exact item/SKU, variants, cost, package data, and inventory on some public pages. However, the inspected compact-desk listings showed inventory `0` and no usable public shipping method/ETA. A second exact CJ cable-management candidate was excluded from the six-item table because it was magnetic (outside the product-risk brief), had inventory `0`, and showed no shipping method: [Magnetic Cable Clip, SKU `CJYD197888501AZ`](https://cjdropshipping.com/product/magnetic-cable-clip-under-desk-cable-management-adjustable-cord-holder-wire-organizer-and-cable-management-wire-keeper-p-1763402968205897728.html).

### AutoDS

AutoDS documents that its authenticated Marketplace can filter by ship-to/ship-from and show item cost, shipping time, supplier, product ID, shipping price, and policies. It also notes that some warehouse-origin verification occurs after import/edit. The Marketplace is account-gated and its product-finding hub may be a paid add-on, so no exact public SKU with Canada/U.S. route evidence was available in this no-subscription sprint. Source: [AutoDS Marketplace documentation](https://help.autods.com/en/articles/12699962-autods-marketplace-find-winning-products-and-reliable-suppliers).

### Zendrop

Zendrop documents that catalog product pages inside its app can show supplier, cost, shipping cost, processing/delivery time, ship-from, variant SKU, and inventory. Its public help pages do not expose exact catalog listings, and requesting a product quote would involve supplier contact, which was outside this task. Sources: [product details shown in Zendrop](https://support.zendrop.com/en/articles/14811273-what-product-details-are-shown-on-the-product-listing-page), [finding products](https://support.zendrop.com/en/articles/8536720-how-to-find-products-in-zendrops-catalog), and [requesting a product quote](https://support.zendrop.com/en/articles/10442294-request-a-product-quote).

### Doba and direct suppliers

Doba yielded exact generic products, but ordinary price, exact inventory, and route economics were gated; one candidate explicitly supported only the United States. TVCMALL exposed a useful exact item and ordinary cost but imposed MOQ 20 and did not expose destination routes. MySellerHub exposed a U.S.-origin tray but not a defensible ordinary price, stock, supplier SKU, or Canada route.

## Hard conclusion and next action

Switching automation platforms does **not** resolve the immediate approval gap by itself. The bottleneck is exact, market-specific landed-cost and routing evidence. The next defensible action is a short authenticated trial only if a platform offers a free tier/trial that reveals exact SKUs, ordinary cost, inventory, and Canada/U.S. quotes **before** import. Do not pay for AutoDS or Zendrop merely to continue browsing. If those data remain gated, move to a supplier that provides a Canada warehouse/API or request a written quotation later as a deliberately approved sourcing action.
