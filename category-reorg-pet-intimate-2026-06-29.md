# Category Reorganization — Pet & Wellness Findings (2026-06-29)

## What you asked

> Why are intimate massagers showing up in the pet category?

## What I found

Two smart collections with TYPE-based rules are catching intimate products:

| Collection | Rule | Total | Intimate misplacements |
|---|---|---:|---:|
| `health-wellness` | TYPE = `Health & Wellness` | 475 | **76** |
| `pet-finds` | TYPE = `Pet Supplies` | 195 | **3** (Osuga, Terri, Trilux) |
| **Total** | | | **79** |

The 79 intimate products are miscategorized because their `productType` is set to `Health & Wellness` or `Pet Supplies` — those values are what the smart collections filter on.

## The 3 in pet-finds (your specific question)

These three have `productType = 'Pet Supplies'` AND are tagged `intimate` AND have explicit intimate-massager titles:

1. `osuga-osurging-thruster-waterproof-rechargeable-curved-rabbit`
2. `terri-app-controlled-kinky-finger-tapping-rabbit-vibrator`
3. `trilux-kinky-finger-rabbit-vibrator-with-anal-beads`

Probably an import-script or supplier-feed glitch that typed them wrong.

## The 76 in health-wellness

These are Lelo, Satisfyer, and other brand-name vibrators / wands / kegel sets that someone typed as `Health & Wellness`. They show up under "Health & Wellness" collection when they should have their own category.

## Subcategories inside "intimate"

Of the 90 total intimate-tagged products:

| Subcategory | Count |
|---|---:|
| Intimate Massagers (vibrators, wands, kegel) | 69 |
| Lubricants & Care | 3 |
| Condoms | 2 |
| Other (rings, balls, kits) | 16 |

## What we need to do (the reorganization)

**Step 1: Pick the canonical productType**

Three options. I'd recommend Option C.

| Option | Structure | Pros | Cons |
|---|---|---|---|
| A. One bucket | `Intimate Massagers` (90 products) | Simple | No sub-nav, doesn't match how customers shop |
| B. Two buckets | `Intimate Massagers` + `Intimate Care` (lubricants/condoms) | Cleaner | "Other" 16 products need a home |
| C. Four buckets | `Intimate Massagers`, `Intimate Care`, `Intimate Apparel`, `Bondage & Fetish` | Matches customer mental model | Requires more catalog work; few products in 2 of 4 |

**Step 2: Recategorize 79 products**

For each of the 79 misplacements, change `productType` from its current value to one of the new buckets.

**Step 3: Create new smart collections**

For each new productType, create a smart collection with rule `TYPE = '<new type>'`.

**Step 4: Add anti-leak guards to existing collections**

Add `NOT tag = 'intimate'` exclusion to:
- `health-wellness` smart collection rule
- `pet-finds` smart collection rule

This future-proofs against the same leak happening again.

**Step 5: Update storefront nav**

Add the new collection(s) to the storefront menu so customers can find them.

## Recommended plan (Option C, scoped to existing data)

1. Create 4 new productTypes: `Intimate Massagers`, `Intimate Care`, `Intimate Apparel`, `Bondage & Fetish`
2. Create 4 matching smart collections
3. Recategorize the 79 misplaced products based on title/tag matching
4. Add `NOT tag = 'intimate'` to `health-wellness` and `pet-finds` rules
5. Update storefront nav to surface the new collections

## What I can do right now (read-only audit, no destructive changes)

The scripts `find_intimate_in_pet.py`, `intimate_product_type_distribution.py`, `intimate_subcategory_distribution.py`, and `health_wellness_audit.py` are all in `scripts/`. They reproduce this audit in <5 minutes if you want to re-verify.

## What I need from you

1. **Approve the bucket structure** (Option A / B / C / something else)
2. **Approve the recategorization list** before I run any mutations
3. **Decide whether to apply the anti-leak guards** to existing collections (yes — this prevents future regressions)

Once you green-light the bucket structure, I'll generate a full recategorization CSV (product ID → new productType) and the new collection rules, then wait for your approval before applying anything via the Admin API.