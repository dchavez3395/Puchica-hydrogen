# DSers pet-hair detail tool seed audit — 2026-08-08

## Decision

**HOLD — product slot not supplier-approved.**

Exact seed AliExpress `1005006897352698` returned `No Data` in signed-in DSers exact-ID search. A primary-image Supplier Optimizer attempt also returned no rows. The exact public index confirms the intended product identity and a low item price, but it cannot establish a current DSers option, stock, or Canada/United States route.

The allowed controlled fallback found three exact, relevant silicone/hollow-rubber detail brushes. Candidate `1005008596551859` is the only retained lead because it combines acceptable displayed supplier scores, Sale `104`, and CA/US route economics inside the two-item offer ceiling. It remains **HOLD**, not PASS: exact neutral option, option stock, material grade, surface limitations, ship-from, and route tracking are not exposed.

No product was imported, mapped, ordered, or otherwise changed.

## Exact seed evidence

| Field | Verified result | Evidence quality |
|---|---|---|
| AliExpress item ID | `1005006897352698` | Exact ID |
| Exact indexed title | Self-Cleaning Silicone Pet Hair Remover — Reusable Lint Roller with Ergonomic Grip for Furniture, Clothing & Car Interiors | Exact-ID Pricearchive index |
| Public indexed price | US$2.23 / C$3.24, updated 2026-06-25 | Public historical index; cheapest-version price, not DSers option cost |
| DSers exact-ID result | `No Data` | Signed-in DSers Find Products |
| DSers Sale / ratings | Not exposed | Exact seed absent from DSers results |
| Exact options / option stock | Not exposed | Exact seed absent from DSers results |
| Material / surfaces / inclusions | Title says silicone, reusable, ergonomic grip, and furniture/clothing/car-interior use; grade, dimensions, delicate-surface limitations and exact contents are unverified | Public title only |
| Canada route / ETA / tracking / ship-from | Unverified | No DSers seed row |
| United States route / ETA / tracking / ship-from | Unverified | No DSers seed row |
| Seed decision | **REJECT for this sourcing pass** | Identity is relevant, but supplier/route gate cannot be completed |

Exact seed source: <https://uk.pricearchive.org/aliexpress.com/item/1005006897352698>

## Controlled fallback: top three relevant visual suppliers by DSers Sale

The visual comparison used a relevant hollow-rubber/silicone pet-hair brush image from the signed-in DSers result set. Grooming/bathing gloves and unrelated substitutions were excluded. The table retains only the three highest-Sale exact suppliers whose titles explicitly cover furniture, carpet, clothing, sofa, or car-seat pet-hair removal.

Planning conversion: **US$1 = CA$1.3943**, dated 2026-08-07. CAD route equivalents are maximum displayed item cost plus displayed shipping; they exclude taxes/duties, fees and reserves.

| Rank | Exact supplier ID / title | DSers Sale; scores | Displayed item cost | Canada route | United States route | Option, stock, contents and surfaces | Decision |
|---|---|---|---|---|---|---|---|
| 1 | `1005011987978554` — “1PC Hollow Rubber Pet Hair Remover Brush Dog Cat Fur Removal for Sofa Carpet Car Seat Clothes Silicone Cleaning Tool” | `305`; reliability 4.4, response 4.6, delivery 4.6, rating 5.0 | US$3.00–3.06 | Selection Standard, US$2.16, 8 days; **CA$7.19–7.28 equivalent** | Selection Standard, US$1.99, 7 days; **CA$6.96–7.04 equivalent** | Title supports one silicone/hollow-rubber tool and the intended surfaces. Exact option, neutral colour, dimensions, stock, silicone grade, removal/care guidance, ship-from and tracking flag are not exposed. | **REJECT** — high Sale cannot offset supplier reliability 4.4 and missing exact gate fields. |
| 2 | `1005012026027016` — “Silicone Hollow Rubber Dog Hair Brush Remover Cars Furniture Carpet Clothes Cleaner Brush for Dogs Pet Supplies Dog Hair Remover” | `132`; reliability 4.6, response 4.7, delivery 4.7, rating 4.3 | US$2.90–3.00 | Selection Standard, US$2.16, 8 days; **CA$7.06–7.19 equivalent** | Selection Standard, US$1.99, 6 days; **CA$6.82–6.96 equivalent** | Title supports silicone/hollow rubber and intended surfaces. Exact count, option, colour, dimensions, stock, grade, surface/care limits, ship-from and tracking flag are not exposed. | **REJECT** — product rating 4.3 is below a launch-quality screen, with the exact gate unresolved. |
| 3 | `1005008596551859` — “1PC Silicone Hollow Rubber Pet Dog Cat Hair Remover Cars Furniture Carpet Clothe Sofa Cleaner Brush Cat Massage Clean Hair Brush” | `104`; reliability 4.7, response 4.7, delivery 4.8, rating 4.8 | US$2.06–4.49 | Selection Standard, US$1.99, 8 days; **CA$5.65–9.04 equivalent** | Selection Standard, US$1.99, 7 days; **CA$5.65–9.04 equivalent** | Title supports one silicone/hollow-rubber tool and intended surfaces. Exact neutral option, dimensions, option stock, material grade, pet-contact versus surface-use instructions, delicate-fabric/leather/trim limits, ship-from and tracking flag are not exposed. | **HOLD — retained lead.** Best combined quality/economics, but not import-ready or cohort-approved. |

DSers labels the method `AliExpress Selection Standard`, but Supplier Optimizer did **not** expose a tracking field. The routes therefore must not be described as tracked until an exact option-level shipping view confirms it.

## Economics and gate outcome

The prior two-item Pet Hair Rescue Duo gate requires **combined all-in landed cost no higher than CA$12**. Candidate `1005008596551859` consumes **CA$5.65–9.04** of that ceiling before any additional landed components, leaving **CA$2.96–6.35** for the full-size roller and all remaining costs. The high option is therefore unlikely to work; only a proved neutral option near the low end could remain viable.

- Exact seed in DSers: **FAIL**
- Relevant alternatives capped at three: **PASS**
- Supplier score screen: **one conditional PASS** (`1005008596551859`)
- Exact neutral option and option stock: **FAIL / not exposed**
- Exact materials, dimensions, inclusions and surface limitations: **FAIL / incomplete**
- Canada and U.S. method/cost/ETA: **PASS at comparison level**
- Tracking and ship-from: **FAIL / not exposed**
- Two-item landed-cost headroom: **HOLD**; low option could fit, high option probably cannot

## Required evidence to convert HOLD to PASS

For exact ID `1005008596551859`, obtain one option-level record showing: neutral colour and exact dimensions; one-piece contents; live option stock; ordinary repeatable option cost; silicone/rubber material specification; instructions and exclusions for upholstery, carpet, clothing, leather and painted/plastic car trim; China/other ship-from; and explicit tracked CA and U.S. routes with cost and ETA. Do not import or build copy until that same option leaves enough of the CA$12 combined ceiling for the approved roller.
