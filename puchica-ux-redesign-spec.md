# Puchica UX Redesign — Full Specification

---

## 4. Figma Design System

### Color Palette

```
--bg:          #FAF9F6   Warm off-white (main background)
--surface:     #FFFFFF   Pure white (cards, modals)
--text:        #1A1A1A   Near-black (primary text)
--accent:      #C8A96E   Warm gold (CTAs, badges, highlights)
--border:      #E8E5DF   Warm light gray (borders, dividers)
--hover-bg:    #F2F0EB   Slightly darker bg (hover states)
--muted:       #8A8A8A   Medium gray (secondary text, labels)
--error:       #D94F4F   Red (error states)
--sale:        #C8A96E   Uses accent — consistency over chaos
```

**Why warm off-white (#FAF9F6)?** Pure white is clinical. A warm tint signals premium and comfort — it makes photography pop without competing with product images. Aritzia, Everlane, COS all use warm off-whites.

**Why only one accent color?** Brands with multiple accent colors look chaotic. Pick one and use it consistently: gold CTAs, gold badges, gold stars, gold hover states. It trains the eye to recognize the brand.

---

### Typography Scale

```
Display:   72px / 800 weight / -0.03em tracking / 1.05 line-height
H1:        48px / 700 weight / -0.02em tracking / 1.1 line-height
H2:        32px / 700 weight / -0.02em tracking / 1.2 line-height
H3:        22px / 600 weight / -0.01em tracking / 1.3 line-height
Body LG:   17px / 400 weight / 0 tracking / 1.7 line-height
Body:      15px / 400 weight / 0 tracking / 1.5 line-height
Small:     13px / 500 weight / 0.02em tracking / 1.5 line-height
Label:     11px / 600 weight / 0.12em tracking / uppercase
```

**Font: Inter** — Clean, professional, excellent legibility at all sizes. Avoid display fonts that are hard to read. Inter is what Uniqlo, Aritzia, and COS use for body copy.

**Rule: Never go below 11px for labels, 13px for body.** Anything smaller is inaccessible.

---

### Spacing System (8pt Grid)

```
4px   — icon padding, tight gaps
8px   — inline element spacing
12px  — compact padding
16px  — standard padding, card gaps
24px  — section inner padding, grid gaps
32px  — card padding, section dividers
48px  — section vertical padding
64px  — section vertical padding (large)
80px  — section vertical padding (hero)
96px  — section vertical padding (brand story)
```

---

### Border Radius

```
0px   — Buttons, inputs (sharp = premium)
2px   — Small tags, badges
4px   — Cards, panels
8px   — Images, modals, large containers
12px  — Not used — inconsistent feel
```

**Rule: Keep it small.** High-end brands use minimal radius. Roundness feels casual/friendly — fine for beauty, wrong for general home goods.

---

### Elevation

```
No drop shadows on cards.
Use borders instead: 1px solid var(--border).
On hover: 1px solid var(--text).
This is what COS and Aritzia do.
Shadows feel "app-like" not premium commerce.
```

Exception: Modals and drawers can use `box-shadow: 0 8px 32px rgba(0,0,0,0.12)` for clear elevation from the page.

---

### Container Widths

```
Max content width:    1280px
Max image width:      1440px
Horizontal padding:    24px (mobile) / 32px (tablet) / 48px (desktop)
```

---

### Responsive Breakpoints

```
Mobile:   375px  — 1 column product grid
Tablet:   768px  — 2 column product grid
Desktop:  1024px — 3 column product grid
Wide:     1280px — 4 column product grid
```

---

### Button Variants

**Primary Button**
```
Background: var(--text)
Text: var(--surface) — 13px / 600 weight / uppercase / 0.06em tracking
Padding: 14px 28px
Border-radius: 0
Hover: background: #333
Active: background: #000
```

**Secondary Button**
```
Background: transparent
Text: var(--text) — 13px / 600 weight / uppercase / 0.06em tracking
Border: 1.5px solid var(--text)
Padding: 13px 27px (1px smaller to account for border)
Hover: background: var(--text); color: var(--surface)
```

**Ghost Button**
```
Text only: 13px / 600 weight / uppercase / 0.06em tracking
Border-bottom: 1px solid currentColor
Padding: 0 (just the text)
Hover: color: var(--accent)
```

**Quick Add Button**
```
Full width of card
Background: var(--text)
Text: white — 12px / 600 weight / uppercase / 0.06em tracking
Height: 36px
Bottom of image, hidden by default (opacity: 0)
On card hover: slides up + fades in (opacity: 1, translateY: 0)
```

---

### Input Styles

```
Height: 48px
Border: 1.5px solid var(--border)
Border-radius: 0
Font: 15px / 400 weight
Padding: 0 16px
Background: var(--surface)
Focus: border-color: var(--text) — no box-shadow
Error: border-color: var(--error)
```

---

### Product Card

```
Container: 1px solid var(--border), border-radius: 4px, overflow: hidden
Image: aspect-ratio: 1, object-fit: cover, no border-radius (bleeds to edge)
Info padding: 16px
Collection label: 11px / 600 / uppercase / 0.08em / var(--muted) / margin-bottom: 6px
Product name: 14px / 600 / var(--text) / line-height: 1.3 / margin-bottom: 8px
Price: 15px / 700 / var(--text)
Stars: inline-flex / gap: 4px / font-size: 12px / color: var(--muted)
  → use SVG star, color: var(--accent)
Badge: position: absolute / top: 12px / left: 12px
  → 10px / 700 / uppercase / 0.06em / background: var(--accent) / color: white
  → padding: 4px 8px / border-radius: 2px
Quick add: see button variants above
```

**Product card hover:**
- Image scales to 1.04 over 400ms ease
- Border changes from `var(--border)` to `var(--text)`
- Quick add button fades + slides up from bottom

---

### Collection Card

```
Aspect ratio: 3:4 (portrait — allows face crop in lifestyle images)
Image: object-fit: cover, no border-radius
Overlay: linear-gradient(to top, rgba(26,26,26,0.7) 0%, transparent 50%)
  → positioned at bottom of card, full width
Collection name: 22px / 700 / white / letter-spacing: -0.01em
Product count: 12px / 400 / rgba(255,255,255,0.7)
On hover: image scales to 1.03
```

---

### Navigation

**Header (desktop):**
```
Height: 64px
Logo: 22px / 800 weight / letter-spacing: -0.02em
Nav links: 14px / 500 / no underline by default
  → underline on hover (1px solid currentColor, scaleX animation)
Right actions: search, account, cart (icon buttons)
```

**Mega Menu (on "Shop" hover):**
```
Position: absolute / top: 100% / left: 0 / right: 0
Background: var(--surface)
Border: 1px solid var(--border) + box-shadow: 0 8px 32px rgba(0,0,0,0.08)
Grid: 4 columns / 32px gap / padding: 32px
Column headings: 11px / 600 / uppercase / 0.1em / var(--muted) / margin-bottom: 12px
Links: 14px / 400 / var(--text) / margin-bottom: 8px
  → hover: color: var(--accent)
Trigger: show on nav-item hover (not click)
```

**Cart icon:**
```
Always show count badge when items > 0
Badge: 16px circle / position: absolute top-right
  → background: var(--accent) / color: white / font-size: 10px / 700
  → centered with flex
```

**Sticky header:**
```
On scroll > 8px: add box-shadow: 0 1px 8px rgba(0,0,0,0.06)
Background stays white (no transparency)
Logo, nav, actions stay visible
```

---

### Footer

```
Background: var(--bg) (warm off-white, not pure white)
Border-top: 1px solid var(--border)
Brand column: 2fr (logo, description, social icons)
Link columns: 1fr each
Social icons: 36px square / 1px border / border-radius: 2px
  → hover: background: var(--text), color: white
Payment icons: small gray badges
```

---

### Icons

**Use Lucide icons (open source, consistent 1.5px stroke weight):**
- Search, User, Shopping Bag, Menu, Chevron Down, Chevron Left/Right
- Plus, Minus, X (close), Check, Star, Truck, Shield, RotateCcw
- Instagram, Facebook, Twitter/X, TikTok

**Size standards:**
- 16px: inline with text
- 20px: header actions, form elements
- 24px: empty states, instructional
- 32px: error/alert icons

---

### Hover States

```
Cards: border-color change + image scale (400ms ease)
Links: color change to var(--accent) + underline
Buttons: background color shift (200ms)
Icon buttons: background: var(--hover-bg) (200ms)
```

### Focus States

```
Always visible focus ring for accessibility.
2px solid var(--accent) offset: 2px.
Never remove focus states — accessibility requirement.
```

---

### Loading States

```
Product grid: show skeleton cards (8px wide, full height, bg: var(--hover-bg))
Animated shimmer: linear-gradient sweep, 1.5s infinite
Image: bg: var(--hover-bg) with no image loaded yet
Text: bg: var(--hover-bg) rectangles at correct widths
```

---

### Empty States

```
Centered layout
Icon: 48px, var(--muted)
Heading: 22px / 600
Body: 15px / var(--muted) / max-width: 320px / centered
CTA button below
```

---

## 5. Product Card Redesign

See HTML prototype for live implementation. Key specs:

**Image:**
- Aspect ratio: 1:1 (square)
- `object-fit: cover` — no white letterboxing
- No border-radius on image itself (bleeds to card edge)
- Hover: scale 1.04 over 400ms ease

**Quick Add:**
- Hidden by default (`opacity: 0, translateY: 8px`)
- On card hover: `opacity: 1, translateY: 0` over 200ms
- Full width of card
- Height: 36px
- On click: text changes to "✓ Added" + gold background for 1.5s

**Badges:**
- Position: top-left, 12px inset
- "Best Seller" / "New" / "Sale" / "Trending"
- 10px / 700 / uppercase / 0.06em tracking
- Gold background, white text
- Border-radius: 2px

**Pricing:**
- Current price: 15px / 700
- Original price (if on sale): 13px / 400 / strikethrough / var(--muted)
- Use gold (var(--accent)) for sale price only when discount is active

**Color swatches:**
- Show on card if product has color variants
- 12px circles, border: 1px solid var(--border)
- Selected: border-color: var(--text)
- Max 5 visible, "+N" for overflow

**Stars:**
- Use SVG star, fill: var(--accent)
- 12px size, gap: 2px
- Count in parentheses: "(214)" — 12px / var(--muted)
- Only show if product has reviews

---

## 6. Product Page Redesign

See separate PDP spec below.

---

## 7. Collection Page Redesign

**Problems with current:**
- "12+ products" is wrong (should be real count or removed)
- "Load next 12" = 312 page loads for full catalog
- Filters exist but are limited
- Collection descriptions are placeholder text
- No active filter indication (customer doesn't know what's filtered)

**New collection page spec:**

**Header:**
```
Collection name: H1 — 32px / 700 / letter-spacing: -0.02em
Description: 17px / 400 / var(--muted) / max 2 lines / line-height: 1.6
Edit in Shopify admin per collection
```

**Toolbar (above grid):**
```
Left: Result count — "248 products" (not "12+")
Center: Sort dropdown — "Featured / Best selling / Newest / Price: low-high / Price: high-low"
Right: Grid toggle (2 / 3 / 4 columns) + Filter button (mobile)
```

**Filters (sidebar on desktop, drawer on mobile):**
```
Collapsible sections: Category, Price, Color, Rating, Availability
Active filters shown as removable chips above the grid
"Clear all" when any filter active
Price range: min/max inputs, not slider (slider is inaccurate)
Color: circular swatches, not squares
```

**Grid:**
```
Desktop: 4 columns
Tablet: 3 columns
Mobile: 2 columns
Gap: 24px (desktop) / 16px (mobile)
```

**Pagination:**
```
"Load next 48" — not 12
Or: infinite scroll with "Load more" button at bottom
Never auto-load without user action (annoying)
```

**No results state:**
```
"Nothing matches these filters"
Show 4-6 suggested alternatives
"Clear filters" CTA
```

---

## 8. Navigation Redesign

See HTML prototype for sticky header + mega menu implementation.

**Desktop:**
- Logo left, nav center-left, actions right
- "Shop" triggers mega menu on hover (not click — faster UX)
- Mega menu: 4-column grid showing categories + collections + price ranges
- Search: click icon → search overlay with large input, trending searches, recent

**Search overlay:**
```
Full-width overlay, bg: var(--surface)
Large input: 24px font, 64px height
Autocomplete: product images + names inline with results
Trending searches: shown when input is empty
Recent searches: stored in localStorage, shown below trending
```

**Cart drawer:**
```
Slide in from right
Width: 420px
Product images: 72px square
Quantity stepper inline
Remove button (X icon)
Subtotal + "Checkout" CTA pinned to bottom
"Continue shopping" link at top
```

**Mobile:**
```
Hamburger menu → full-screen overlay
Categories as accordion (expandable)
Search at top of overlay
Social links + newsletter at bottom
```

---

## 9. Visual Direction

**The design should feel:**

Minimal — No decorative elements that don't serve a function. Every section needs a job.

Premium — Warm off-white backgrounds, warm gold accents, generous whitespace, Inter typography, no drop shadows on cards, sharp corners.

Modern — Large product photography, confident typography hierarchy, generous whitespace.

Confident — Don't apologize for being a dropshipping store. Own the curation story. "We're not another dropshipping store."

Product-first — Products are always the visual focus. No decorative content blocks competing with product images.

Large photography — Product images should fill cards. Lifestyle images should be editorial quality. No small thumbnails dominating layouts.

Lots of whitespace — 80px vertical section padding on desktop. Cards shouldn't feel cramped.

Consistent spacing — 8pt grid. Every margin and padding is a multiple of 8.

Few colors — Background, text, accent, surface, border, muted. That's the palette. No gradients on large surfaces.

High quality typography — Inter at precise weights. Tight tracking on headlines. Generous line-height on body.

---

## 10. Shopify Implementation Notes

### Section Mapping

**Sections (reusable across pages):**
```
 AnnouncementBar — theme setting: text, link, background color
 Header — logo, nav links, mega menu blocks, sticky behavior
 Footer — columns, social links, payment icons, newsletter
 ProductCard — used in all product grids (collection, related, featured)
 ProductGrid — column count, gap, pagination style
 NewsletterForm — heading, subheading, discount code, success message
 ReviewCard — used in reviews section
 StatBar — 3-column stats
```

**Homepage-only sections:**
```
Hero — headline, subheadline, CTA buttons, background image
 FeaturedCollections — 6 collection cards (image, name, link)
 BestSellers — product tag + product selector (max 4)
 CategorySpotlight — collection + product selector
 NewArrivals — product selector (max 8)
 SocialProof — stats + review cards
 BrandStory — text + optional image
```

**Blocks (within sections):**
```
ProductCardBlock — product reference + display options (show/hide price, stars, badge)
 CollectionCardBlock — collection reference + image override
 ReviewBlock — review text + author + rating + product link
 NavLinkBlock — link + optional submenu
 FooterColumnBlock — heading + link list
```

### Merchant-Customizable Settings Per Section

**Hero:**
- Headline text
- Subheadline text
- CTA 1 text + link
- CTA 2 text + link
- Background image (optional: solid color fallback)
- Optional: hide/show trust signals below CTAs

**Featured Collections:**
- Section title
- Number of collections (3 or 6)
- Per collection: collection + optional image override + optional title override

**Product Grid (collection pages):**
- Results per page: 12 / 24 / 48 / 96
- Columns desktop: 3 / 4
- Columns tablet: 2 / 3
- Show/hide: collection label, price, stars, badges, quick add
- Default sort order
- Active filter display: chips / sidebar

**Product Card:**
- Show/hide: badge, collection name, price, stars, review count, color swatches, quick add button
- Card aspect ratio: 1:1 / 3:4 / 4:5

### What Should Be Snippets/Components

```
product-card.html — the card markup
product-card.css — card styles
product-grid.html — grid + pagination markup
product-grid.css — grid layout
quick-add.js — quick add button logic
swatch-picker.js — color/size selector logic
filter-drawer.html — mobile filter drawer
filter-drawer.js — filter state management
search-overlay.html — search overlay markup
search-overlay.js — autocomplete logic
cart-drawer.html — cart drawer markup
cart-drawer.js — cart state (use Shopify Cart API)
announcement-bar.js — dismiss + link handling
```

### Settings That Should NOT Be Merchant-Editable

- Typography scale (hardcoded in CSS)
- Color variable names (hardcoded — merchants change values, not variable names)
- Spacing values (enforced via CSS custom properties)
- Border radius (enforced via CSS custom properties)
- Animation durations (hardcoded in CSS)

---

## Prioritized Implementation Roadmap

### Phase 1 — Highest Impact (Start Here)

**1. Fix the collection page count + pagination**
- Change "12+" to real product count
- Change "Load next 12" to "Load next 48"
- Impact: UX improvement, SEO improvement
- Effort: Low (Shopify settings only)

**2. Build mega menu + sticky header**
- Mega menu: 4-column grid with categories, collections, price ranges
- Sticky on scroll with shadow
- Impact: Massive navigation improvement, keeps users in the store
- Effort: Medium (requires Hydrogen/Theme dev)

**3. Replace hero image with curated product/lifestyle**
- The Giant Squishy Pillow should NOT be the hero
- Impact: First impression matters enormously
- Effort: Low (Shopify admin — just change the image)

**4. Add product reviews to collection page cards**
- Show star rating + review count on product cards
- Impact: Social proof at browse stage = higher CTR
- Effort: Low-Medium (needs judge.me or Stamped.io integration)

**5. Fix category images in homepage "Shop by category"**
- Every category card should show a product that belongs in that category
- Impact: Brand coherence, trust
- Effort: Low (Shopify admin — upload correct images)

### Phase 2

**6. Rewrite all collection descriptions**
- Short, editorial, Canadian voice
- "Home & Kitchen — thoughtful tools and small luxuries for better everyday living."
- Impact: SEO, brand voice, trust
- Effort: Low (Shopify admin per collection)

**7. Implement quick-add on collection pages**
- Hover product card → "Quick Add" button slides up
- One click → adds to cart without PDP
- Impact: Faster purchase flow, higher AOV
- Effort: Medium

**8. Add filters to all collection pages**
- Desktop: sidebar
- Mobile: slide-up drawer
- Price, category, color, rating, availability
- Impact: Product discovery dramatically improved
- Effort: Medium

**9. Build category spotlight section (rotating)**
- One category, deep editorial treatment
- "Kitchen Edition — 24 picks for better cooking"
- Impact: Editorial feel = premium signal
- Effort: Medium

**10. Newsletter: 10% off first order**
- Already in current site — just make sure the discount auto-applies
- Impact: Email capture rate
- Effort: Low

### Phase 3

**11. Redesign product descriptions**
- Human-written, Canadian context, no "premium-grade build" filler
- Real specifications, not placeholders
- Impact: Conversion rate on PDP
- Effort: High (requires content audit)

**12. Build search overlay with autocomplete**
- Show product images + names as user types
- Trending searches when empty
- Recent searches from localStorage
- Impact: Findability, session depth
- Effort: Medium

**13. Sticky "Add to Cart" bar on mobile PDP**
- After scrolling past hero images, sticky bar at bottom
- Product name + price + "Add to Cart" button
- Impact: Mobile conversion rate
- Effort: Low-Medium

**14. "Related products" algorithm improvement**
- Same category, similar price, bought-together logic
- Not random stuffed animals
- Impact: AOV, session duration
- Effort: Medium

**15. UGC section — customer photos**
- "Customer photos" section on homepage or collection pages
- Curated from Instagram hashtag or judge.me reviews with photos
- Impact: Trust, social proof, differentiation
- Effort: Medium

---

## Impact Estimates

| Change | Discovery | UX | Conversion | Performance | Maintainability |
|---|---|---|---|---|---|
| Real product count | + | + | + | — | — |
| Mega menu + sticky | +++ | +++ | ++ | — | Neutral |
| Hero image fix | + | + | ++ | — | — |
| Stars on cards | ++ | + | ++ | — | — |
| Category image fix | + | ++ | + | — | — |
| Collection descriptions | + | ++ | + | ++ (SEO) | — |
| Quick-add hover | — | +++ | +++ | — | — |
| Filters | +++ | +++ | ++ | — | — |
| Category spotlight | ++ | ++ | ++ | — | — |
| Search overlay | ++ | +++ | ++ | — | — |
| Sticky mobile ATC | — | ++ | +++ | — | — |
| Description rewrite | — | + | +++ | — | — |
| Related products | — | + | ++ | — | — |

---

## What to Cut

These existing sections should be removed entirely:

**"Shop by category" on current homepage** — The new Featured Collections grid replaces this with editorial-quality cards instead of 8 tiny squares with mismatched images.

**The Lifestyle Section** — "A kitchen that invites you in" showing a Giant Teddy Bear. The new Category Spotlight replaces this with a real editorial moment.

**Phone cases from New Arrivals** — If they're going to be in the catalog at all, they should never be the first thing a new customer sees. Remove from New Arrivals entirely until the catalog is cleaner.

**"CURATED IN TORONTO" as eyebrow text** — This is your strongest brand signal and it's wasted in 10px uppercase. Either make it a real headline treatment or remove it entirely. Currently it's neither.
