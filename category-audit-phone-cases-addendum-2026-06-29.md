# Category Audit — Addendum: 682 Misplaced Phone Cases (2026-06-29)

The main `category_audit.py` report shows 4 "bloated" collections
(Phone Case, Home & Kitchen, Electronics & Accessories, Apparel &
Accessories). Drilling in, the bloat is mostly **phone cases that
leaked out of the phone-case collection** into the other three.

## Numbers

| Collection | Total | Real products | Misplaced phone cases | Misplaced % |
| --- | ---: | ---: | ---: | ---: |
| Home & Kitchen (`home-essentials`) | 1,302 | 867 | **435** | 33% |
| Apparel & Accessories (`apparel-accessories`) | 528 | 408 | **120** | 23% |
| Electronics & Accessories (`tech-gadgets`) | 694 | 597 | **97** | 14% |
| Home Decor (`home-decor`) | 58 | 28 | **30** | 52% |
| **Total misplaced phone cases** | | | **682** | |

After excluding misplaced phone cases, those 4 collections shrink to:
- Home & Kitchen: 1,302 → 867 (real)
- Apparel: 528 → 408
- Electronics: 694 → 597
- Home Decor: 58 → 28

Phone Case is already correctly bounded (2,038 in, 2,038 phone cases,
0 non-phone-case).

## Root cause

The phone cases are tagged `PhoneCase2` (auto-include for `phone-case`
collection) AND also get auto-tags like `non-zodiac`, `forhim`,
`accessories` from the design template. The smart-collection rules for
Home & Kitchen / Apparel / Electronics / Home Decor likely match on
those auxiliary tags, which is why the phone cases leak in.

## The CSV

`misplaced-phone-cases.csv` lists all 682 with:
- `id` (Shopify numeric ID)
- `handle` (URL slug)
- `title`
- `productType` (currently 'Phone Case' or 'Electronics & Accessories')
- `tags_phone_case_2` (boolean)
- `wrong_collections` (semicolon-separated list)
- `correct_collection` ('phone-case(Phone Case)')

## How to fix

Two paths, both require Shopify admin access (smart collections
can't be edited via Admin API — they have to be re-created or
modified in admin):

### Option A: tighten the smart-collection rules
For each of `home-essentials`, `apparel-accessories`, `tech-gadgets`,
`home-decor`:
- Add a `NOT tag = 'PhoneCase2'` exclusion
- This prevents future leaks and immediately drops the existing
  652 misplaced phone cases from the collection

This is the **right long-term fix**. 1-2 hours of admin work in
Shopify admin → "Smart collections" → edit each rule.

### Option B: bulk-remove via script
Use the Admin API to add/remove the 682 products from each wrong
collection. Cleaner in some ways, but:
- Smart collections auto-re-include based on rules, so manual
  removal from a smart collection doesn't stick unless the rules
  are also fixed.
- Manual collections can be edited cleanly. If any of these are
  manual (not smart), Option B works for them.

**Recommendation: Option A.** Fix the rules once, future-proof.

## What's already clean

- All 15 productTypes have matching collections (none orphaned)
- 0 untyped products
- 0 placeholder-typed products (e.g. the old 'Puchica' leak is gone)
- 0 sparse or empty collections
- `phone-case` collection is clean (0 non-phone-case products)
- 0 products in non-matching collections (per the audit's title-matching
  heuristic, which is conservative)

## Real category questions for Daniel

The audit doesn't surface these but you might want to consider:

1. **Should "Apparel & Accessories" exist as a separate collection?**
   It overlaps with "Phone Case" (a phone case IS an accessory). With
   408 real products after excluding phone cases, Apparel is
   borderline sparse.
2. **Should "Home Decor" be merged into "Home & Kitchen"?** Only 28
   real products after exclusions. Sub-category filter inside Home &
   Kitchen may serve customers better than a separate top-level
   collection.
3. **Are there 4-5 brand-new collections you'd want to add?** E.g.
   "Bestsellers by category", "New Arrivals by category", "Gifts
   under $25 by recipient". The current nav is a flat list of
   15 productTypes, which is workable but not engaging.
4. **Should we sub-divide Phone Case by brand?** 2,038 in one
   collection is a lot. Smart filters (iPhone, Samsung, Google Pixel,
   Other) inside the collection would help.

These are editorial/strategy calls, not code. My role: ship the
data so you can decide.