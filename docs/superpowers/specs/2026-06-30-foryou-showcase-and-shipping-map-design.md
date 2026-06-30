# For You showcase + shipping-reach map — design

Date: 2026-06-30

## Background

A prior session generated ~300 AI lifestyle product images (internally called
"Higgsfield" images, actually produced via Gemini's `gemini-3-pro-image` /
"Nano Banana Pro" — see `tools/puchica_image_gen.py`). These were uploaded to
their matching products on the live store (`shop.puchica.ca`, 6,155 products
total) as a file named `hf_<YYYYMMDD>_<HHMMSS>_<uuid>.png|jpg`. A previous
bulk job set many of these as the product's featured (main) image, but the
job appears to have stopped partway through — some products still have the
`hf_` image uploaded but not set as the main image.

Two pieces of work:

- **Part A**: finish setting the AI image as the main image everywhere it's
  missing, and make these ~300 products more visible across the homepage.
- **Part B**: add a decorative, interactive world-map section showing the
  store's shipping reach.

## Part A — "For You" showcase

### Tagging (foundation)

Add the Shopify tag `for-you` to every product that has an `hf_*` image,
regardless of whether it's already featured. This is the single source of
truth used by every piece below — the Storefront API can filter on tags
(`query: "tag:'for-you'"` on the top-level `products` connection, or
`filters: [{tag: "for-you"}]` within a `Collection.products` query), but it
cannot filter on image filename.

Detection rule for "has a Higgsfield image": any URL in the product's image
list contains `/hf_`. This is read-only and derived directly from existing
Shopify data — no new tracking file needed.

### Completing the image fix

For every product where an `hf_` image exists but `featuredImage` does not
point to it: reorder so the `hf_` image is position 1 (Admin API
`productReorderImages` or equivalent, reordering `MediaImage` for the
`Product`). The full list comes from a paginated audit of
`products(sortKey: UPDATED_AT, reverse: true)` checking `featuredImage.url`
vs. each image in `images.edges` for the `/hf_` pattern, stopping once 5
consecutive pages (250 products) show zero `hf_` sightings.

Tagging and the image-position fix happen in the same pass, driven by the
same audit list (tag is applied to the full ~300; the reposition mutation
only runs for the subset that needs it).

### New homepage section: "For You"

- New GraphQL query (co-located in `app/routes/_index.jsx` next to the
  existing section queries):
  ```graphql
  query ForYou($country: CountryCode!, $language: LanguageCode!) @inContext(country: $country, language: $language) {
    products(first: 12, sortKey: BEST_SELLING, query: "tag:'for-you'") {
      nodes { id title handle priceRange { minVariantPrice { amount currencyCode } } featuredImage { id url altText width height } tags }
    }
  }
  ```
- New component `app/components/ForYouShowcase.jsx`: 1 large card + 4 small
  cards, magazine-grid layout (same family as `CategoryBento`'s explicit
  grid-placement approach, new `pk-foryou` class namespace, styled with the
  existing brand tokens — `--pk-ink`, `--pk-cream`, `--pk-lime`).
- Placed in `_index.jsx` immediately after the `Marquee`, before
  `DiscoverSwiper` — the first content section after the hero.
- Diversify by vendor (existing `diversifyByVendor` helper) before slicing
  to 5, same as other sections.
- If fewer than 5 tagged products exist (shouldn't happen once Part A's
  fix lands, but guards against future drift), render fewer cards rather
  than padding with unrelated products — this section is explicitly the
  curated showcase, so it does not fall back to the general catalog.

### Biasing existing sections

New helper in `app/lib/diversify.js`:

```js
export function prioritizeTag(items, tag) {
  const tagged = items.filter((p) => p.tags?.includes(tag));
  const rest = items.filter((p) => !p.tags?.includes(tag));
  return [...diversifyByVendor(tagged), ...diversifyByVendor(rest)];
}
```

Applied (after the existing `diversifyByVendor` call is replaced by this)
in the `loadDeferredData` normalizer for: Hero (`trending`), `rackProducts`,
`freshFinds`, `newArrivals`, `discoverProducts`, `matchProducts`. Each
section keeps pulling from its existing themed collection (no change to
collection handles or counts) — this only reorders so `for-you`-tagged
products lead within each collection's results, filling the section
entirely with tagged products when there are enough, falling back to the
rest of that collection's normal order otherwise. This satisfies "strict
filter where possible, soft fallback otherwise" without extra queries.

Each section's GraphQL fragment needs `tags` added (it's not currently
fetched). `catWorld` / `bestPicks` / `showcaseCollections` are left as-is —
they're collection covers / curated picks, not pulled from a single mixed
pool, so tag-biasing doesn't apply cleanly there.

### Smart collection

Create a Shopify smart (automated) collection, handle `for-you`, rule
`tag equals for-you`, used as the "See all" destination for the new
section's CTA link (`/collections/for-you`).

### i18n

Add keys to all four locale blocks in `app/lib/dictionaries.js`
(`en`, `fr`, `es`, `pt-br`), grouped under a new `── For You ──` comment
header, following the existing pattern (e.g. `arrivals_eyebrow` /
`arrivals_title`): `foryou_eyebrow`, `foryou_title`, `foryou_sub`,
`foryou_cta`, `foryou_section_aria`.

## Part B — Shipping-reach map

### Library

`react-simple-maps` (SVG + topojson world map, built-in `ZoomableGroup` for
pan/zoom, no API key, no tile cost). New dependency, added to
`package.json`.

### Data

New file `app/lib/shippingDestinations.js` — a hand-curated, hard-coded
array of `{city, country, lat, lng, tier}` where `tier` is `'major'` or
`'secondary'`. Major tier: a dozen-ish flagship cities across Canada/US,
plus a few in Mexico/South America and UK/EU (e.g. Toronto, NYC, LA,
Mexico City, São Paulo, London, Paris, Berlin). Secondary tier: a sparser
scatter of additional smaller cities in the same regions, rendered as
smaller/dimmer dots, to suggest broader organic reach beyond the flagship
list. Purely illustrative — not derived from real order data, no PII, no
backend query needed.

### Component

`app/components/ShippingMap.jsx`:
- SVG world map via `react-simple-maps`' `ComposableMap` + `Geographies`,
  styled in brand palette (cream/ink fills, lime accent dots).
- `ZoomableGroup` for pan/zoom (mouse drag + wheel/pinch).
- Markers: major-tier dots pulse via CSS animation (reuse the existing
  pulse-dot pattern already used in `TrendingTicker`/swiper dots if one
  exists, otherwise a small new keyframe); secondary-tier dots are static
  and dimmer.
- Hover (desktop) / tap (touch) on a dot shows a small tooltip with the
  city name — no live data, just the label.
- Section copy, added to `dictionaries.js` the same way as Part A
  (`shipmap_eyebrow`, `shipmap_title`, `shipmap_sub`, `shipmap_section_aria`):
  eyebrow "Where we ship", title "From here to everywhere.", sub "Toronto to
  Toronto, São Paulo to Berlin — Puchica ships across North & South America,
  the UK and the EU."

### Placement

`app/routes/_index.jsx`, right before `<CatalogStatement />` (near the
bottom of the page, after Best Sellers).

### Accessibility / perf notes

- `react-simple-maps` renders SVG, so it's keyboard-focusable per-marker
  needs explicit `tabIndex`/`aria-label` on each dot (not free by default —
  implementation must add these).
- Lazy-mount the map (no eager geography fetch) so it doesn't compete with
  hero/LCP — wrap in the existing `ScrollReveal` pattern used elsewhere on
  this page, which already defers offscreen sections.
- `prefers-reduced-motion` should disable the pulse animation, consistent
  with how `DiscoverSwiper`'s auto-advance already respects it.

## Out of scope

- Hero's `trending-finds` collection itself is not re-curated — only its
  ordering is biased via `prioritizeTag`, per Part A.
- No real shipping/order data is used anywhere in Part B.
- No changes to `/collections/*` route filtering UI beyond adding the one
  new smart collection.
