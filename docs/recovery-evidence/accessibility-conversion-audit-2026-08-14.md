# Puchica accessibility and conversion-path audit

Date: 2026-08-14

Scope: public Canadian storefront, read-only live inspection, source and test review, and verified production deployment

Routes: home, all-products collection, packing-cube PDP, cart, About, FAQ, Shipping, Contact, and Policies

## Verified live baseline

- Each audited route returned one `main` landmark and one H1.
- Each audited route emitted a non-empty title, meta description, canonical URL, viewport declaration, and `en-CA` page language.
- The nine routes contained no images missing an `alt` attribute.
- The nine routes contained no unnamed buttons or unnamed links in the rendered DOM.
- No duplicate IDs were found outside the cart route.
- No horizontal overflow was detected at the desktop viewport.
- At a 320 CSS-pixel viewport, each route retained one `main`, one H1, and a page scroll width equal to its client width after the homepage reflow fix.

## Defects found, fixed, and verified

1. The cart page and the always-mounted cart drawer both used `id="cart-lines"`. The cart component now assigns `cart-lines-page` and `cart-lines-aside` so each line-item list has an unambiguous label.
2. The empty cart exposed an H1 followed by an H3 in the live accessibility tree. The page layout now renders the empty-state title as H2; the drawer retains H3 under its dialog title.
3. At 320 CSS pixels, the homepage campaign grid expanded its single mobile track to about 505 pixels. Copy, the secondary CTA, assurances, and the feature card were visibly clipped while page overflow was suppressed. The mobile grid now uses `minmax(0, 1fr)`, its grid items may shrink, and the assurance list wraps.
4. The market and language menu opened from the keyboard but ignored Escape. It now focuses its first available menu item when opened, closes on Escape, and restores focus to the trigger.

All four defects have regression coverage in `tests/accessibility-contract.test.js`. The focused accessibility suite passed 9/9, the full suite passed 80/80, and the production health suite passed 35/35.

The exact tested branch was deployed to the Oxygen Production environment with metadata description `cart-accessibility-semantics`. Shopify reported a successful, routable deployment at `https://01m00gt99ay4s9jvasj27pdqzy-f9aa94aa3bf86abb6754.myshopify.dev`.

Post-deployment inspection of `https://puchica.ca/cart` confirmed:

- `cart-lines-aside` and `cart-lines-page` are both present, with zero duplicate IDs in the document.
- The exposed empty-cart sequence is H1 `Cart`, then H2 `Nothing in your cart yet.`
- The closed drawer remains inert and is omitted from the accessibility tree.
- One `main` landmark remains exposed.

The homepage reflow correction was separately previewed and then deployed to Oxygen Production with metadata description `homepage-320px-reflow`. Shopify reported a successful, routable deployment at `https://01m00hj6jawzmz5s42pxwjdj9j-f9aa94aa3bf86abb6754.myshopify.dev`. Production was then rechecked at 320 CSS pixels across all nine routes. The homepage hero copy, both calls-to-action, all three assurances, and the featured-product card were visible within the viewport.

The locale-menu keyboard correction was deployed to Oxygen Production with metadata description `locale-menu-keyboard-escape`. Shopify reported a successful, routable deployment at `https://01m00jg2nk7yakzgnpfbvxwsv5-f9aa94aa3bf86abb6754.myshopify.dev`.

## Keyboard verification

- Forward Tab and reverse Shift+Tab traversed 24 focusable stops in a logical document order and returned to the document boundary without trapping.
- No focus entered an inert or `aria-hidden` drawer.
- Every focusable stop exposed a solid 3px focus indicator.
- Enter on the skip link moved focus to `#main-content` and updated the URL fragment.
- Enter and Space opened the search drawer; Escape closed it and restored focus to the search trigger.
- Enter opened the market and language menu and focused its first available menu item; Escape closed it and restored focus to the market trigger.
- No selection, cart, checkout, order, payment, supplier, or Shopify Admin state was changed during verification.

## Deliberately open checks

- Core Web Vitals were not measured because the required Chrome performance tracer is unavailable. No performance score or metric is inferred.

## Product-optimization workflow decision

The supplied Product Optimization workflow is a batch image, copy, price, status, tag, and compare-at-price mutation playbook. It was reviewed but not executed. Its image phase consumes generation credits and its backend and sale phases alter live product data. With zero completed checkouts in the last 30 days and only two attributed social sessions in the current baseline, those mutations would not address the present bottleneck: qualified distribution. The useful rule retained from the workflow is to verify the visible result rather than treating a successful mutation as proof.

## Repeatable checks

- `npm run accessibility-check`
- `npm test`
- `npm run production-health`
- `npm run launch-check`

The updated accessibility workbook is stored outside Git in the task output directory so it can be used as the ongoing review record. All four task-list items are marked Complete, and the related development checks for keyboard operation, keyboard traps, focus order, and focus visibility are recorded as complete.

## Narrow-width and motion addendum

A later 320 CSS-pixel collection pass found that all product names remained in
the DOM but eight were visually clipped by a two-line card-title clamp. The
mobile rule now removes that clamp below 700 CSS pixels so identifying product
text wraps in full. The focused source contract also verifies that
`prefers-reduced-motion: reduce` neutralizes global animation and transition
duration/iteration and disables the continuous stock-urgency dot animation.

Commit `5b918a9e11e6fd47023f4db277ed73b3530b1e2e` was deployed to Oxygen
Production, and the final cart-boundary correction followed in commit
`898ccfb46d32000346c57d0ae50fbdcf2ee13c10`. Production asset `4222171` was
rechecked at 320 CSS pixels across the all-products collection:

- no page-level horizontal overflow;
- nine of nine product titles fully visible;
- each title's client height equalled its scroll height;
- computed title overflow was visible and no line clamp remained.

The full source suite passed 102/102 and the post-deployment live health suite
passed 36/36. Physical 200% text zoom, WCAG 1.4.12 text-spacing overrides,
OS-level reduced-motion behavior, and named assistive-technology sessions remain
explicit owner checks in the launch workbook.
