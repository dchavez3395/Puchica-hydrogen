# Intimate Product Misclassification — Audit Summary (2026-06-29)

## What Daniel flagged
> "I noticed once that there are some 'Intimate Massagers' that are
> categorized as pet-supplies and they are actually being shown as the
> main image for that category."

## Scope of the problem
The audit confirmed Daniel's observation. The catalog has **203
products with intimate-related tags** (tags like `intimate`,
`intimate_massage`, `intimate_collection`, `massage_collection:intimate`,
`adult`, `adult_wedge`, etc.).

Of those 203:
- **3** are in `pet-finds` (Pet Supplies) — the bug Daniel noticed
- **3** are in `home-essentials` (Home & Kitchen) — Switch vibrators
- **1** is in `sports-outdoors` (Sports & Outdoors) — Anello vibrating ring
- **2** are in `beauty-personal-care` (Beauty & Grooming) — Liberator sensual furniture
- **Most (~160)** are in `health-wellness` (Health & Wellness) — Lelo, Magic Wand, Liberator, etc.
- **Some** are in `tech-gadgets` (Electronics & Accessories) — Kegel trainers

## The 3 confirmed pet-finds misclassifications (Daniel's exact concern)

| ID | Title | Current Type | Image |
| --- | --- | --- | --- |
| 9270028402938 | Trilux Finger Rabbit Intimate Massager | Pet Supplies | adult product photo |
| 9270024503546 | Terri APP-Controlled Finger Tapping Rabbit Intimate Massager | Pet Supplies | adult product photo |
| 9269997011194 | Osuga Osurging Thruster Waterproof / Rechargeable Curved Rabbit | Pet Supplies | adult product photo |

These are the ones currently showing as featured images for the
Pet Supplies category. They are adult products, not pet products.

## Recommended fix (NOT YET APPLIED)

Three decisions Daniel needs to make before any code change:

### 1. Visibility intent
- **A. Public — keep them, fix the categorization.** Recategorize
  the 203 to "Intimate Wellness" (or similar), create a real
  collection, and remove them from health-wellness / pet-finds /
  home-essentials. This treats them as a legitimate product line.
- **B. Hidden — drop them entirely.** Unpublish / archive the 203
  products. No public visibility. Use this if Puchica doesn't want
  the brand association.
- **C. Selective — keep the high-end legitimate ones (Lelo,
  Magic Wand), drop the miscategorized ones (pet-finds, home-essentials
  Switch vibrators).** Mixed approach.

### 2. Category name
- "Intimate Wellness" (current default in the script)
- "Adult Wellness"
- "Personal Care" (broader, doesn't trigger ad-policy flags)
- "Sensual Wellness"

### 3. Collection name
- "Intimate Wellness" (matches category)
- "Adult Toys & Wellness"
- "Personal Wellness"

## Tools ready to apply

`scripts/intimate_recategorize.py` is built and ready. To apply
the default fix (recategorize all 203 to "Intimate Wellness"):

```
$env:SHOPIFY_ADMIN_CLIENT_SECRET = "..."
python scripts/intimate_recategorize.py --apply
```

That updates `productType` on all 203 products. It does NOT
auto-remove them from the bad collections — that requires manual
Shopify admin work because removing from a smart collection
requires updating its filter rules, not just unchecking boxes.

## Why I haven't auto-applied
This is editorial work and brand positioning. I don't want to
move 203 products without an explicit "go" from Daniel on:
- Visibility intent (A / B / C above)
- Category name
- Collection name

Plus there's a real risk: changing `productType` on 200+ products
could affect:
- Existing SEO titles/descriptions that reference the type
- URL structure (some `productType` is in URL slugs?)
- Collection auto-rules (changes might break existing filters)
- Analytics / reporting that groups by productType

**Recommend:** Daniel pulls the report, makes the A/B/C call,
then I run --apply and a follow-up smoke test.

## What I'd do with another hour
- Build a one-time fix that updates each collection's filter rule
  to exclude the `intimate` tag (so they auto-drop from pet-finds,
  health-wellness, etc. without manual admin work)
- Verify the fix with a re-run of the audit (should go from 169
  bad placements to 0)
- Write a recurring `catalog_intimate_watch.py` that alerts if
  any new intimate-tagged product gets auto-included in a
  non-intimate collection