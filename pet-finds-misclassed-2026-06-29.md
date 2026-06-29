"""
MISCATEGORIZED PRODUCTS FOUND 2026-06-29
========================================

Daniel flagged: "I noticed once that there are some 'Intimate Massagers'
that are categorized as pet-supplies and they are actually being shown
as the main image for that category."

Verified via Admin API. 3 confirmed misclassifications in the
"Pet Supplies" (handle: pet-finds) collection:

ID            Handle                                                   Title
-----------   --------------------------------------------------------   ----------------------------------------------------------------
9270028402938 trilux-kinky-finger-rabbit-vibrator-with-anal-beads      Trilux Finger Rabbit Intimate Massager
9270024503546 terri-app-controlled-kinky-finger-tapping-rabbit-vibrator Terri APP-Controlled Finger Tapping Rabbit Intimate Massager
9269997011194 osuga-osurging-thruster-waterproof-rechargeable-curved-rabbit Osuga Osurging Thruster Waterproof / Rechargeable Curved Rabbit

All 3:
- productType = "Pet Supplies" (wrong)
- tags include 'intimate', 'intimate_massage', 'massage_collection:Intimate'
- images are adult product photos
- Currently appearing in the pet-finds collection and likely as
  the featured image for the Pet Supplies category page

(Fourth match in the initial filter — the 2600ft Electronic Dog
Training Collar — is a false positive: its "shock-vibration" tag
triggered the keyword search but it's a legitimate pet product.)

RECOMMENDED FIX (NOT YET APPLIED):
  1. Change productType for these 3 to "Intimate Wellness" (or
     similar) — this is the cleanest fix and aligns the data with
     reality.
  2. Add a new Shopify collection called "Intimate Wellness" so
     these products have a real home, and the pet-finds collection
     filter no longer surfaces them.
  3. Manually remove them from the pet-finds collection (or use
     the "exclude" rule in the auto-collection conditions if
     pet-finds is tag-rule-based).

The third product (Osuga) is a 3rd-party dropship with explicit
ad-spend, so even creating a separate "Intimate Wellness"
collection needs to be tested against the same Shopify Markets
config the rest of the catalog uses (en-ca locale, etc.).

Before applying, Daniel should:
  - Confirm the desired productType name (intimate vs sensual vs adult)
  - Confirm whether to create a new collection or just unlist these
    (or whether to keep them in pet-finds but the pet-finds featured
    image is auto-rotated so the worst-case is hidden behind the
    fold)
"""
