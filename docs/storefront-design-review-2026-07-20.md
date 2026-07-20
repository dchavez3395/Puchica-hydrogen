# Puchica Storefront Design Review

Date: 2026-07-20

## Executive Direction

Puchica should not feel like a lifestyle brand, landing page, or experimental visual concept. It should feel like a trustworthy Canadian general store with broad product coverage, fast product discovery, visible pricing, and clear departments.

The current homepage is improving technically, but the design still under-communicates inventory depth. It has too much empty visual space, too few products above the fold, and too much emphasis on a single hero message. For a broad ecommerce store, the homepage should behave more like a store entrance: search, departments, deals, new arrivals, best sellers, trust, and product density.

## Research Anchors

- Baymard notes that first-time users infer the store's catalog breadth from homepage content and navigation. If they do not see the type of product they want, some assume the store does not carry it.
- Baymard's current ecommerce navigation research emphasizes homepage/category navigation and product-finding as major ecommerce UX failure points, even for large retailers.
- Nielsen Norman Group recommends clear category labels that make sense on their own and in relation to each other, with visible product categories rather than hiding everything under a generic Shop link.
- Baymard's search UX benchmark notes that roughly half of ecommerce shoppers prefer search while the other half prefer navigation. Puchica needs to serve both immediately.

## Current Diagnosis

### What Works

- The header is cleaner than the earlier beige/terracotta version.
- The site now avoids dead homepage categories like Phone Case.
- Product rails exist for Best Sellers, New Arrivals, Sports & Outdoors, and other store content.
- The UI has working Shopify primitives: search route, localized links, cart, account, collection routes, and Hydrogen product cards.
- The current color direction is more trustworthy than the previous dark hero or beige header.

### What Still Feels Wrong

- The homepage opens with too much hero space and not enough merchandise.
- The current hero is clean but plain; it still reads like a placeholder above the real store.
- Product breadth is not proven quickly enough.
- Category cards are visually thin and repetitive.
- The first viewport does not feel commercially dense enough for a store with many departments.
- The brand personality is unclear: neither premium marketplace nor warm local store.
- The typography is heavy in some places and too generic in others.
- The homepage sections feel stacked rather than merchandised.
- Some copy is clever or soft when it should be utility-focused.

## Main Design Problem

Puchica currently uses a "hero-first website" pattern. A broad store needs a "shopping-first storefront" pattern.

The homepage should not ask users to admire a brand statement before they shop. It should show:

- What kind of store this is
- What departments are available
- What products are popular right now
- What deals or new arrivals are worth clicking
- Why checkout is safe
- What happens after purchase

## Recommended Store Concept

### Positioning

Puchica is a curated Canadian everyday-goods store.

It should feel:

- Professional
- Dense but organized
- Useful
- Trustworthy
- Broad
- Canadian
- Slightly playful through the logo and small accents, not through oversized slogans

It should not feel:

- Fashion editorial
- Minimal boutique
- AI-generated landing page
- Empty luxury brand
- Meme-ish
- Terracotta heritage theme
- Dark SaaS hero

## New Homepage Architecture

### 1. Retail Header

Desktop header should have three clear zones:

- Left: logo
- Center: large persistent search bar
- Right: account, cart, language

Navigation should sit below or beside search depending on breakpoint:

- Departments
- New Arrivals
- Deals
- Best Sellers
- Gifts

The search field should be visually important on desktop, not only an icon. Search is a primary ecommerce behavior.

### 2. Compact Commerce Strip

Immediately under the nav:

- "Ships across Canada"
- "30-day returns"
- "Secure checkout"
- "Deals updated weekly"

This should be compact, not a hero.

### 3. Above-Fold Store Grid

Replace the traditional hero with a merchandising grid:

- Large feature tile: "Deals worth checking"
- Medium tile: "New arrivals"
- Medium tile: "Best sellers"
- Small department tiles: Home & Kitchen, Electronics, Beauty, Pet Supplies, Sports & Outdoors, Health & Wellness
- Small promo tile: Gifts Under $25

This gives users multiple obvious shopping paths and immediately communicates breadth.

Recommended layout:

- Desktop: 12-column CSS grid, 360-460px tall
- Tablet: 2-column grid
- Mobile: horizontal scroll feature cards followed by category chips

### 4. Department Index

Use real active departments only.

Each department card should include:

- Department title
- Short utility descriptor
- Product count if reliable
- One thumbnail or icon-like image
- "Shop" affordance

Do not show empty departments. Do not show categories that are unpublished or effectively dead.

### 5. Product Rails

Homepage should show more products sooner.

Recommended order:

1. Best Sellers
2. New Arrivals
3. Deals / Sale
4. Home & Kitchen
5. Pet Supplies
6. Electronics & Accessories
7. Sports & Outdoors

Each rail should include:

- 4 products desktop minimum, preferably 5-6 if container allows
- Price visible
- Sale badge when compare-at price exists
- Department label
- Rating/review only if real
- Quick add if variant logic is safe

### 6. Trust Block

Trust should appear before reviews and again near footer.

Use practical claims:

- Secure Shopify checkout
- 30-day returns
- Ships across Canada
- Real support
- Prices in CAD

Avoid claims that sound large if the Storefront API does not actually expose the catalog count.

### 7. Reviews

Reviews should be either real and source-backed or framed clearly as shopper feedback. Fake-looking reviews damage trust.

If real reviews are unavailable, replace the review section with:

- "Why shoppers choose Puchica"
- Service promises
- Order support details
- Return and shipping clarity

## Visual Direction

### Palette

Keep the purple logo as the brand anchor.

Recommended palette:

- Ink: #101828
- White: #FFFFFF
- Surface: #F6F8FB
- Border: #D9E0EA
- Brand Purple: #5B4DFF
- Brand Purple Dark: #493AD8
- Deal Accent: #C0265A
- Success/Shipping Accent: #157F5B
- Warning/Price Accent: #B54708

Use purple for brand/action accents, not as the entire UI.

Avoid:

- Beige/cream/terracotta
- Huge dark navy hero blocks
- Neon lime text
- Overly rounded cards
- Gradient blob backgrounds

### Typography

Use a retail hierarchy:

- Header/nav: compact, high legibility
- Homepage feature title: 32-48px desktop, 28-36px mobile
- Section titles: 22-30px
- Product names: 13-15px
- Prices: 14-16px bold

Do not use huge hero-scale type for every section. A store should be scannable.

### Spacing

Professional ecommerce spacing should be compact and consistent:

- Section vertical padding: 40-64px desktop, 28-40px mobile
- Product grid gaps: 14-20px
- Card radius: 6-8px
- Header height: controlled and predictable

The page should show product cards within the first screen or very shortly after it.

## Component-Level Recommendations

### Product Cards

Product cards need to look more retail:

- Consistent image aspect ratio
- Clean image background
- Price near title
- Sale badge prominent but controlled
- Vendor/category muted
- Hover state subtle
- Optional quick add button
- Avoid overly large whitespace inside cards

### Category Cards

Current category cards are too plain.

Recommended card pattern:

- Left: title and descriptor
- Right/top: small product image or category icon
- Bottom: item count or "Shop now"
- Clear border and subtle hover

### Header

The header should become a store tool, not just navigation:

- Desktop search visible by default
- "Departments" dropdown is prominent
- Cart/account icons remain
- Announcement bar should not wrap awkwardly on mobile

### Mobile

Mobile should prioritize:

1. Search
2. Deals / New Arrivals / Best Sellers
3. Departments
4. Product rails

Mobile should not show giant hero copy, stats tables, or repeated badges.

## Data / Shopify Issues Blocking Design Quality

The storefront appears to expose far fewer products through the Storefront API than expected. If the live/published storefront only has dozens of products available, the UI cannot honestly look like a 6,000-product store.

Before final design implementation, confirm:

- Which collections are published to the Hydrogen storefront sales channel
- Which products are active
- Which products have images
- Which products have available variants
- Which collections have nonzero storefront-visible products
- Whether "New Arrivals" truly exposes the full live catalog or only a subset

The design should dynamically hide sections with zero products.

## Proposed Redesign Phases

### Phase 1: Design System Reset

- Replace old palette tokens
- Remove beige/terracotta remnants
- Normalize card radius, borders, shadows, spacing
- Define product card, category card, promo tile, rail, and trust components

### Phase 2: Homepage Rebuild

- Replace hero with merchandising grid
- Add persistent search-first store entry
- Add department module using only active collections
- Add denser product rails
- Remove or rewrite sections that feel like brand filler

### Phase 3: Collection Pages

- Improve collection heading, filters, sort, and product grid density
- Add breadcrumbs
- Add subcategory links where appropriate
- Ensure empty states are professional and helpful

### Phase 4: Product Pages

- Audit product image quality and layout
- Make price, shipping, returns, and add-to-cart more convincing
- Add trust, delivery, and return messaging near purchase area

### Phase 5: Figma + QA

- Create desktop and mobile homepage frames
- Define tokens and reusable components
- Capture screenshots from local Hydrogen
- Compare implementation against Figma
- Run mobile/desktop overflow checks
- Run build/lint before deploy

## Immediate Next Design Target

The next implementation should not be another hero tweak.

Build a new homepage top section called `StorefrontMerchGrid`:

- A full-width surface after the header
- Compact headline: "Shop Puchica"
- Search bar integrated into the grid/header area
- Feature tiles for Deals, New Arrivals, Best Sellers, Gifts
- Department tiles with active collections only
- First product rail visible immediately below

This will make Puchica feel like a real store because the homepage will show inventory paths instead of asking a single hero sentence to carry the whole brand.

