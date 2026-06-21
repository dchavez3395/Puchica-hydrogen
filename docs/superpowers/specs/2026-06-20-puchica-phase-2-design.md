---
title: Puchica Phase 2 — content expansion + homepage v5
date: 2026-06-20
status: draft — awaiting user review
---

# Puchica Phase 2 — content expansion + homepage v5

## Purpose

The Puchica storefront shipped Phase 1 with a working v4 visual redesign
(warm black + acid lime + cream palette) but is functionally thin: the
homepage is the only meaningfully populated page, the navigation has 3
links, eight editorial surfaces are missing entirely, and the data layer
returns the same handful of products on every section. Visitors land on
a polished front page and have nowhere to go.

The user's feedback, captured in the most recent session before token
exhaustion, was explicit on every point:

- **"we kinda just keep showing the same products everywhere … theres
  no variety or anything."** — every homepage product section uses
  `BEST_SELLING` or a duplicate of `TRENDING_QUERY`. Two adjacent
  carousels can render the same eight products in a row.
- **"this block's cards are the ones that look all funky maybe there
  shouldnt be 4 like that."** — the rotating 4-card product deck in the
  hero (`pk-deck`) is decorative, not functional, and looks chaotic in
  the screenshot.
- **"emojis in some places, and thats an immediate no. thats a huge
  dead giveaway that its ai slop and it just looks bad. lets just
  icons or svgs."** — `ShopByMood` and `CategoryBento` both use emoji
  for category cues.
- **"the homepage hero looks so bland and empty with space, theres
  text thats hidden in the black background."** — the v4 hero has a
  large left column with no content below the CTAs/stats, and the
  current type sits at the top with dead air underneath.
- **"we need more nav pages and sections etc we just need to add so
  much more to the site still, like i said, look at the copy, look at
  the inner heroes, add images and sections where needed etc just
  add so so so much more to it we have so much to show."** — eight
  named landing pages are missing: Best Sellers, New Arrivals, Gifts,
  About, Journal, Contact (with FAQ), Brands, Lookbook.

This spec covers the Phase 2 build: a coherent homepage v5, the eight
new landing pages, the data layer that makes the product variety
real, the nav restructure that surfaces the new pages, and the
emoji / icon / palette cleanup that harmonizes the new content with
the v4 visual system.

## What stays out of scope

These are deliberate exclusions, not oversights:

- **PDP (`/products/$handle`) inner page changes.** PDP is already
  solid. User's "look at the copy, look at the inner heroes" feedback
  refers to the new landing pages this spec creates, not PDP.
- **Account area, cart drawer, search results inner page.** Not on
  the user's list.
- **Performance work.** LCP / CLS already pass on the v4 layout; new
  sections use the same Hydrogen `<Image>` and Suspense patterns.
- **Product metafield schema for the lookbook.** The lookbook renders
  a graceful empty state if no products carry the
  `lookbook.look` metafield, so the page ships without merchant work.
- **Recently-viewed rail.** Client-only, localStorage-driven. Real
  risk, low reward in v5; deferred to a later phase.

## Information architecture

### Top-level nav (editorial override + Shopify menu merge)

`app/components/Header.jsx` gains a hardcoded `PK_PRIMARY_NAV` array
that is rendered alongside whatever the Shopify `header.menu` provides.
On overlap, the hardcoded entry wins (so changing the Shopify menu in
admin cannot break the editorial structure).

| Position | Label | Route |
|---|---|---|
| 1 | Home | `/` |
| 2 | Shop | `/collections` (with mega-dropdown — see below) |
| 3 | Best Sellers | `/pages/best-sellers` |
| 4 | New | `/pages/new-arrivals` |
| 5 | Gifts | `/pages/gifts` |
| 6 | Journal | `/blogs/journal` |
| 7 | About | `/pages/about` |

The Shopify menu continues to provide any custom items the merchant
adds (e.g. seasonal). Items in the Shopify menu that conflict with
the hardcoded list are dropped.

### "Shop" mega-dropdown

Triggered on hover on desktop, click/tap on mobile. The Shop link
itself always navigates to `/collections` when clicked (so the nav
works with JS off and on touch). The dropdown is a child panel that
opens on hover/focus, never blocks the underlying link.

Five category tiles (Home, Beauty, Tech, Outdoor, Pet) using the
existing `CategoryBento` data shape, plus a "Browse all collections"
link to `/collections`. Tile data comes from a new `MEGA_MENU_QUERY`
that mirrors `CAT_WORLD_QUERY` but is fetched eagerly (not deferred)
in the root loader so the dropdown never shows an empty state.

If the Storefront query errors, the dropdown renders the five
category labels with no images (fallback), so the user always sees
a complete nav.

### Footer

`app/components/Footer.jsx` gains a fourth column "Discover" linking
to `/pages/best-sellers`, `/pages/new-arrivals`, `/pages/gifts`,
`/pages/about`, and `/blogs/journal`. Existing three columns
(Shop / Customer Care / Newsletter) stay intact.

## Homepage v4 → v5

### What dies (v4 → v5 transition)

- **`pk-deck` (the 4 rotating product cards in the hero).** The deck
  is decorative; user feedback was direct that it looks funky.
- **`pk-feat-banner` (the "Best Sellers" dark band on the
  homepage).** The new `/pages/best-sellers` does this job better
  with a fuller grid; the homepage version is redundant.
- **All emoji in JSX.** Specifically: `ShopByMood` (🏠 ✨ 💡),
  `CategoryBento` (🏠 ✨ 💡 🌿 🐾), and any other I find in the
  emoji sweep at the end. Replaced with Lucide icons.
- **Decorative ✦ characters in copy.** The U+2726 BLACK FOUR POINTED
  STAR is in the unicode emoji/misc-symbols range and fails the
  emoji sweep. The eyebrow `★` characters used in the marquee,
  nav, and section eyebrows all need to be replaced with a small
  inline `<StarGlyph>` SVG component, or with simple text labels
  ("NEW", "FEATURED") rendered in the same display weight.
- **Already-dead v3 code** (`MegaHero`, `SwipeShop`, `WaveDivider`,
  `CategoryWorlds`) — confirmed already removed from JSX in v4.
  Their CSS gets cleaned up opportunistically during the
  color harmonization pass.

### What gets built

#### A. New hero (`pk-hero3`)

Full-bleed dark. Two columns, tighter than v4.

- **Left column:**
- **Left column:**
  - Eyebrow (lime pill): "NEW DROPS WEEKLY · SHIPS FROM CANADA"
    (uppercase, no decorative symbol — see "What dies" for the ✦
    cleanup)
  - H1, two lines, single weight (no per-word animation): "Everything
    worth buying. / Picked by people who give a damn."
  - Sub: 2-3 lines of brand copy (I write — see "Copy" section)
  - Two CTAs: lime `Shop now →` (primary) and ghost `Browse all`
  - **NEW:** A small "as featured in" row below the CTAs, showing the
    social handles from `SOCIAL_PROFILES` (Instagram, Facebook, TikTok)
    as small text + icon chips. Addresses the "dead space below the
    CTAs" complaint by giving the eye somewhere to land.
- **Right column:** a 3-up image mosaic of real Shopify products
  (not rotated). Each tile is a `Link` to a product page with a small
  overlay label ("This week's top pick" / "Just dropped" / "Under
  $25"). One lime "View all" CTA below the mosaic.
- **Stats strip below the hero:** a thin horizontal bar of the four
  value props (free shipping, returns, ships from, secure). Reuses
  the existing `ValueProps` styles with a dark/cream split.

The dark→cream transition happens via the stats strip, not a wave
divider (v3 had a `WaveDivider` that was already removed in v4).

#### B. Variety section (replaces the two duplicate carousels)

`SpotlightGrid` is a single new component that renders three
horizontal product rails, each with a distinct data source. This
component replaces both `DiscoverSwiper` and `ProductRack` (which
both pulled from `TRENDING_QUERY` and showed overlapping products).

- **Rail 1: "Trending this week"** — `BEST_SELLING`, first 8.
  Different products from the hero mosaic by virtue of being a
  different query (first:8 vs first:4) and different sort depth.
- **Rail 2: "Newer than your last visit"** — `CREATED` reverse,
  first 8. Returns the 8 newest products on the storefront.
- **Rail 3: "Smart buys under $50"** — `PRICE` ascending, query
  string `variants.price:<5000`, first 8. Price filter guarantees
  zero overlap with the other two rails.

Each rail is a horizontally-scrolling card list with snap, fade-edge
mask, and a "See all" link. Visually consistent with the existing
`pk-rack` patterns so the CSS is shared.

#### C. Curated picks (replaces `FeaturedBanner`)

`CuratedPicks` queries a Shopify collection named `curated-picks` for
the first 4 products. Each product renders with a 2-3 sentence
"editor's note" blurb. The component handles three cases:

1. **`curated-picks` collection has products with a `curated.note`
   metafield** — use the metafield value as the blurb.
2. **`curated-picks` collection has products but no `curated.note`
   metafield** — use a fallback blurb keyed off the product's first
   tag (e.g. tag "kitchen" → "The one tool we keep reaching for.
   Genuinely the most-used thing in our kitchen for the past six
   months."). The fallback set has 8 entries (one per high-level
   tag) and a generic default.
3. **Collection is empty** — section does not render.

Case 1 is the merchant-overridable path; case 2 is the no-work
shipping default; case 3 is the safe degradation.

The fallback copy samples (full set written at implementation time):

- "The one tool we keep reaching for. Genuinely the most-used thing
  in our kitchen for the past six months."
- "Looks like a £200 product, costs a third of that. We tested it,
  it's sturdy, and the colour photographs beautifully."
- "A small thing that solves a real problem. The kind of gift people
  don't return."

If the merchant wants the notes to be author-overridable, the
metafield approach is in place; the spec does not require the
merchant to set them for the section to render.

#### D. Editorial story section (NEW)

Two-column block between `SpotlightGrid` and `NewArrivals`. Left
column: "Why Puchica" eyebrow, H2, 3-paragraph brand blurb (I write).
Right column: a single product image or a 2-tile mosaic pulled from
`curated-picks` (reuses the same query, just the first product's
image). Cross-links to `/pages/about`.

#### E. Press strip (NEW)

A thin horizontal row of three customer-perspective quotes rendered
in a small horizontal scroll. Not styled as "as seen in Forbes" — no
fake publication logos. Three quotes, paraphrased in Puchica voice:

- "Best thing I've ordered online this year. The packaging alone made
  me smile."
- "Finally, a curated shop that doesn't feel random. Every time I
  open the site I find something."
- "The 30-day return saved me from a bad decision. I sent it back
  with no hassle. I'm still a customer."

The strip is clearly labeled "What people are saying" with a small
talk-bubble icon.

#### F. Sections that stay (with tweaks)

- `NewArrivals` — keep as-is structurally. `pk-arrivals` already
  uses text "New" badge, not emoji. The section eyebrow `★ Just
  dropped` has a decorative star — that gets the `StarGlyph` SVG
  treatment (see "What dies").
- `CategoryBento` — replace emoji with `categoryIcon()` calls.
- `ShopByMood` — replace emoji with `categoryIcon()` calls. The
  `MOODS` array is already 3 entries, so the grid is naturally
  3-up; no card-removal needed.
- `CatalogStatement` — keep. The lime full-bleed CTA is the only
  place the page breaks the dark/cream rhythm and it earns it.
- `ValueProps` — keep, used as the dark→cream transition.
- `NewsletterBand` — keep.

### What gets added: a homepage order

1. `pk-hero3` (dark, full-bleed)
2. Marquee (unchanged)
3. `SpotlightGrid` (cream, 3 rails)
4. `EditorialStory` (cream, 2-col)
5. `NewArrivals` (dark)
6. `CategoryBento` (dark, with icons)
7. `ShopByMood` (cream, with icons)
8. `CuratedPicks` (dark)
9. `CatalogStatement` (lime)
10. `ValueProps` (cream)
11. `PressStrip` (cream, thin)
12. `NewsletterBand` (dark)

## The eight new pages

All new pages live in `app/routes/`. They use a shared `PageHero`
component for the page-top hero (defined in `app/components/PageHero.jsx`).

### `pages.best-sellers.jsx` → `/pages/best-sellers`

- PageHero: eyebrow "Best Sellers", H1 "The ones people can't stop
  buying.", sub: a single paragraph of Puchica voice (I write).
- Section: "Top 12 this month" — 4×3 grid using
  `PRODUCTS_BEST_SELLING` (first:12).
- Section: "By category" — 3 columns (Home, Beauty, Tech) each
  showing top 4 products from that collection. Data from
  `BEST_BY_CAT_QUERY`.
- Section: `PressStrip.Single` — a single-quote variant of the
  homepage's `PressStrip` (same component, single-child mode).
  Quote: "Tried, ordered again, gifted to everyone they know."
  attributed to "— what people tell us".
- CTA strip: "Browse the full best sellers collection →" linking to
  `/collections/best-sellers`.

### `pages.new-arrivals.jsx` → `/pages/new-arrivals`

- PageHero: cream background, "Just dropped" eyebrow, "New this week"
  H1, sub: Puchica copy.
- Section: 6×2 grid of "This week" using `PRODUCTS_NEW_THIS_WEEK`
  (first:12).
- Section: "New by category" — 5 mini-rails (Home, Beauty, Tech,
  Outdoor, Pet) each pulling CREATED reverse first:4 from the
  collection. New `NEW_BY_CAT_QUERY`.
- CTA: "Get notified when new stuff drops" → opens newsletter
  (scrolls to footer band).

### `pages.gifts.jsx` → `/pages/gifts`

- PageHero: cream, "Gifts that don't suck" H1, sub explaining the
  three price tiers.
- Section: 3 large tiles (Under $25 / Under $50 / Under $100). Each
  tile is a Link to `/collections/all?max-price={N}` with a feature
  image of a representative product (first match from the relevant
  `PRODUCTS_UNDER_*` query).
- Section: "Gift guides" — 3 small editorial cards ("For the person
  who has everything" / "Stocking stuffers" / "The practical
  one"). Each card links to a `/collections/all?max-price=...&tag=...`
  filter combo. (Tags are read off products' tags; if no matches,
  the card falls back to the price-only filter.)
- Copy on this page is opinionated and Puchica-voiced — no generic
  "find the perfect gift" lines.

### `pages.about.jsx` → `/pages/about`

- PageHero: cream, type-only, "Curated in Canada" H1. No image
  (matches the type-only hero mode of `PageHero`).
- Section: 3-column "What we believe" — three short paragraphs (I
  write). One per column: "Quality over quantity", "Real value, not
  random", "If we wouldn't use it, we don't sell it."
- Section: founder story block. 2 columns — placeholder portrait
  (a `<div>` with a labeled "Portrait — to be supplied" block, NOT
  a fake image) and 2 paragraphs of Puchica voice. When the merchant
  supplies a real photo, it drops in.
- Section: 4 value props (reuse `ValueProps` styles).
- Section: "Read the journal" — 3 most recent journal articles.
- CTA: "Browse the shop" → `/collections`.

### `blogs/journal` (existing route, seeded with content)

The route already exists. The work is to seed 2-3 real articles in
Shopify admin and add a small editorial wrapper at the blog index
(currently the default Shopify blog layout). Articles (titles
proposed, I write the bodies):

- "How we curate" — the philosophy, how products get into the shop,
  what we say no to.
- "Six small things that punch above their weight" — a gift-guide
  style piece under $50.

If the merchant has not yet published 2 articles by the time of
implementation, the blog index renders an "Editor is working on the
first issue" empty state with a "Browse the shop instead" CTA.

### `pages.contact.jsx` → `/pages/contact`

Replaces the existing contact page (which is currently a `ContactPage`
component without a dedicated route). Adds:

- PageHero: cream, "Get in touch" H1.
- Section: contact form (existing) + a side block with store hours
  (Mon-Fri 9-5 ET, "we answer most messages within a day"), email
  (hello@puchica.ca), and a Toronto address.
- Section: FAQ accordion (10 questions, I write). Questions cover:
  shipping, returns, sizing, gift wrap, payment, order changes,
  international shipping, damaged items, wholesale, press.
- Section: "Still curious?" — a 3-column block with three of the
  most-linked policies (Shipping, Returns, Terms).

### `pages.brands.jsx` → `/pages/brands`

- PageHero: cream, "Brands we carry" H1, sub explaining that every
  brand is a real person / real company, not a faceless SKU.
- Dynamic grid: query `BRANDS_QUERY` (first:250 products), group by
  `vendor` in JS, render each unique vendor as a tile. Tile content:
  vendor name, count of products ("12 picks"), a representative
  product image (the first product's featured image), and a link to
  `/search?q={vendor}`.
- Sort: alphabetical by vendor name.
- If the storefront has fewer than 3 unique vendors, the page renders
  an empty state with copy explaining that the brands directory
  builds as more brands are added.

### `pages.lookbook.jsx` → `/pages/lookbook`

- PageHero: cream, "Shop the look" H1, sub explaining the format
  (curated sets, click any item to buy).
- 4 look cards, each a `<Link>` to a filtered view
  (`/collections/all?tag=look-{slug}` or, if the metafield approach
  is in use, by metafield). Each look has a title and 3-4 product
  images arranged in a magazine-style grid.
- If no products carry the look tag/metafield, the page renders an
  empty state with a "We are building the first look — check back
  soon" message and a contact link.

## Data layer (variety)

### New GraphQL queries

All defined inline in the route file that uses them (no central
`queries.js` for now). Each uses the shared `PkProduct` fragment
defined in `app/lib/fragments.js`:

```graphql
fragment PkProduct on Product {
  id
  title
  handle
  vendor
  priceRange { minVariantPrice { amount currencyCode } }
  featuredImage { id url altText width height }
}
```

| Query | Variables | Used by |
|---|---|---|
| `PRODUCTS_BEST_SELLING` | `first: 12, sortKey: BEST_SELLING` | `/pages/best-sellers` |
| `PRODUCTS_NEW_THIS_WEEK` | `first: 12, sortKey: CREATED, reverse: true` | `/pages/new-arrivals` |
| `PRODUCTS_UNDER_25` | `first: 8, sortKey: PRICE, query: "variants.price:<2500"` | `/pages/gifts`, `pk-hero3` mosaic |
| `PRODUCTS_UNDER_50` | `first: 8, sortKey: PRICE, query: "variants.price:<5000"` | `SpotlightGrid` rail 3 |
| `PRODUCTS_PREMIUM` | `first: 6, sortKey: PRICE, reverse: true, query: "variants.price:>=10000"` | `/pages/gifts` (optional premium tile) |
| `CURATED_PICKS_QUERY` | collection(handle: "curated-picks") { products(first: 4) } | `CuratedPicks`, `EditorialStory` |
| `MEGA_MENU_QUERY` | mirrors `CAT_WORLD_QUERY` (5 collection queries, each `products(first: 1)` for the cover image) | Header mega-dropdown — fetched in the root loader alongside the existing `HeaderQuery`, not deferred |
| `BEST_BY_CAT_QUERY` | 3 collection queries (home, beauty, tech), each `products(first: 4, sortKey: BEST_SELLING)` | `/pages/best-sellers` "by category" |
| `NEW_BY_CAT_QUERY` | 5 collection queries, each `products(first: 4, sortKey: CREATED, reverse: true)` | `/pages/new-arrivals` "new by category" |
| `BRANDS_QUERY` | `products(first: 250) { nodes { vendor, featuredImage, handle } }` | `/pages/brands` |

### Existing query cleanup

`TRENDING_QUERY` on the homepage is removed (its three consumers —
`Hero`, `DiscoverSwiper`, `ProductRack` — collapse into the new
`SpotlightGrid` plus a fresh `PRODUCTS_UNDER_50` for variety).

`BEST_PICKS_QUERY` (first:4) on the homepage is removed (replaced by
`PRODUCTS_BEST_SELLING` at first:12 on the new best-sellers page,
and the homepage no longer renders the "Best Sellers" band).

`CAT_WORLD_QUERY` and `NEW_ARRIVALS_QUERY` stay, used by `CategoryBento`
and `NewArrivals` respectively.

## Icons & emoji remediation

### Replacement map

| Current | Replacement |
|---|---|
| 🏠 Home | `IconHome` (already exists in `app/components/Icons.jsx`) |
| ✨ Beauty | `IconSparkles` (already exists) |
| 💡 Tech | `IconLaptop` (already exists) |
| 🌿 Outdoor | `IconLeaf` (already exists) |
| 🐾 Pet | `IconPaw` (NEW — added to `app/components/Icons.jsx`) |
| ✦ decorative dot | inline SVG, used in eyebrow text |

### New icon

`IconPaw` is a simple 4-toe + pad path, drawn in the same Lucide
style (24×24, 2px stroke, currentColor). Defined in the same file
as the other icons.

### Emoji sweep

A final pass that runs `Grep` for the Unicode range of common
emoji (U+1F300–U+1FAFF and U+2600–U+27BF) across all `.jsx` files
in `app/`. Any hit gets replaced. The sweep is done manually and
verified by visiting the running dev server at
`http://localhost:3002/` and every new landing page.

## Color system cleanup

`app/routes/collections._index.jsx`'s `collectionTheme()` has
hardcoded hex values from the v3 palette. Refactor it to use v4
tokens so the all-collections page harmonizes with the new
homepage:

| Category | v3 (old) | v4 (new) |
|---|---|---|
| pet | `#DFF7E5 → #8DD7A6`, text `#1E7A45` | cream gradient, text `--pk-ink` |
| home | `#FFE9D6 → #FFB079`, text `#9A4A14` | warm cream gradient, text `--pk-ink` |
| beauty | `#FFE0EC → #FF8FB6`, text `#9B2A5C` | lime-pale gradient, text `--pk-ink` |
| tech | `#DDEAFD → #8BB1F1`, text `#1F4BAA` | ink gradient, text `--pk-cream` |
| outdoor | `#E0F4EC → #7DCAA9`, text `#0F6B4A` | cream-soft gradient, text `--pk-ink` |
| gifts | `#FFF1D6 → #FFBE66`, text `#8A5A0E` | lime gradient, text `--pk-ink` |
| new / trending | `#FFF0E8 → #CC4300`, text `#CC4300` | ink gradient, text `--pk-lime` |
| default | `#F2EBDA → #D4C5AD`, text `#CC4300` | cream-soft gradient, text `--pk-ink` |

CSS alias cleanup: any reference to `var(--pk-spark)` or
`var(--pk-violet)` outside of the v4 alias block in `app.css` gets
either renamed to the v4 token (`--pk-lime`, `--pk-lime-dark`) or
left alone if it's intentional (the alias map at the top of the
palette section already handles most cases). This is a quick
verification pass, not a rewrite.

## Copy (samples — I write the rest at implementation time)

The spec captures the tone. The implementation writes the rest in
the same voice.

### Hero sub (v5)

> 6,000+ handpicked products across home, beauty, tech, pet, and
> more. We pick what we'd use ourselves — no filler SKUs, no
> inflated prices, no padded reviews.

### `CuratedPicks` editor's note (one of three)

> The one tool we keep reaching for. Genuinely the most-used
> thing in our kitchen for the past six months.

### `pages.about` "What we believe" — column 1

> **Quality over quantity.** Six thousand products sounds like a
> lot. It's not, if you turn away ninety-five percent of what
> walks through the door. We carry the five percent.

### `pages.contact` FAQ — Q3 (sizing)

> **I can't tell what size to order.** Open the size guide on
> any product page (the link is under the buy button). If you're
> still stuck, email us at hello@puchica.ca with the product
> handle and we'll pull the measurements for you personally.

### `PressStrip` quote 1

> "Best thing I've ordered online this year. The packaging alone
> made me smile."

## Components added or changed

| File | Change |
|---|---|
| `app/components/Header.jsx` | Add `PK_PRIMARY_NAV` override + mega-dropdown rendering |
| `app/components/Footer.jsx` | Add "Discover" column |
| `app/components/PageHero.jsx` | NEW — reusable page-top hero |
| `app/components/Icons.jsx` | Add `IconPaw` |
| `app/components/PressStrip.jsx` | NEW — thin horizontal quotes row |
| `app/components/SpotlightGrid.jsx` | NEW — 3-rail product grid |
| `app/components/CuratedPicks.jsx` | NEW — editor's notes block |
| `app/components/EditorialStory.jsx` | NEW — 2-col type+image block |
| `app/routes/_index.jsx` | v4 → v5: hero rebuild, `SpotlightGrid`, `CuratedPicks`, `EditorialStory`, `PressStrip`. Remove `pk-deck` and `FeaturedBanner`. Already-gone: `MegaHero`, `SwipeShop`, `WaveDivider`, `CategoryWorlds`, `DiscoverSwiper`, `ProductRack` (removed in v4) |
| `app/routes/pages.best-sellers.jsx` | NEW |
| `app/routes/pages.new-arrivals.jsx` | NEW |
| `app/routes/pages.gifts.jsx` | NEW |
| `app/routes/pages.about.jsx` | NEW |
| `app/routes/pages.contact.jsx` | NEW (replaces existing `ContactPage` route shape) |
| `app/routes/pages.brands.jsx` | NEW |
| `app/routes/pages.lookbook.jsx` | NEW |
| `app/lib/fragments.js` | Add `PkProduct` shared fragment |
| `app/styles/app.css` | v4 palette block stays; add `pk-hero3`, `pk-spotlight`, `pk-curated`, `pk-editorial`, `pk-press` styles. Remove `pk-deck`, `pk-feat-banner` (verify not used elsewhere). Opportunistic cleanup of v3-era `pk-mega-hero`, `pk-swipe-shop`, `pk-cat-world` styles if they're still in the file. |

## Implementation order

1. **Foundation:** `PkProduct` fragment, `IconPaw`, `PageHero` component,
   `Header.jsx` nav override, `Footer.jsx` new column.
2. **Data layer:** all new GraphQL queries, scoped to the route that
   uses them.
3. **New pages, in priority order:** best-sellers → new-arrivals →
   gifts → about → contact → brands → lookbook → journal seed.
4. **Homepage v4 → v5:** hero rebuild, `SpotlightGrid`, `CuratedPicks`,
   `EditorialStory`, `PressStrip`. Remove the deck and the
   `FeaturedBanner`. Emoji sweep on all of it.
5. **Color harmonization:** `collectionTheme()` refactor to v4 tokens,
   CSS alias cleanup.
6. **Verification:** visit every new page on
   `http://localhost:3002/`, run the emoji sweep, smoke-test the
   mega-dropdown hover/click, verify the search-query brand links
   work.

## Error handling

- New page loaders wrap each Storefront query in `.catch()` and
  return `null`, mirroring the existing pattern in `_index.jsx`.
  Components handle `null` by not rendering.
- The brands directory handles < 3 vendors with the empty state
  copy.
- The lookbook handles no-tagged-products with the empty state
  copy.
- The curated-picks collection handles missing with section not
  rendering.
- The mega-dropdown handles a Storefront error by rendering the
  static category labels (no images) so the user always sees a
  complete nav.
- The gifts page's "Gift guides" cards handle no matching tags with
  a fall-back to the price-only filter, with a small note in the
  card subtitle ("filtered by price" instead of "filtered by
  curated guide").

## Testing

- **Smoke:** visit each new route and the homepage in the running
  dev server (http://localhost:3002). Confirm no console errors,
  no broken images, no 404s on linked routes.
- **Emoji sweep:** `Grep` across `app/` for the Unicode ranges
  U+1F300–U+1FAFF and U+2600–U+27BF in `.jsx` files. Expect zero
  hits.
- **Variety check:** render the homepage, scroll to `SpotlightGrid`,
  confirm the three rails show three distinct product sets. (Manual
  visual check — no automated test for product uniqueness.)
- **Nav:** hover and click the "Shop" mega-dropdown. Confirm all
  5 category tiles load. Click into each.
- **Responsive:** dev tools mobile (375px), tablet (768px), desktop
  (1280px). Every new page should not have horizontal scroll, no
  text overflow, and a sensible stacking order.
- **Color audit:** open DevTools, find any element using a hardcoded
  v3 hex (`#CC4300`, `#6D4CFF`, etc.) outside the alias block. Expect
  zero hits in new code; v3 code in untouched files is out of scope.

## Out-of-scope followups (deferred)

- Recently-viewed rail (client-only).
- Lookbook product tagging via metafield in admin (the page works
  without it; the metafield just makes the experience real once the
  merchant populates it).
- PDP (`/products/$handle`) inner-page polish.
- Editorial content beyond what this spec calls out (e.g. a true
  "Our process" page, a "Sustainability" page).
- Multi-market / i18n considerations on the new pages (the existing
  i18n spec at `docs/i18n-spec-2026-06-18.md` already covers the
  primitives; the new pages use the same `useT()` and `t()` calls).
