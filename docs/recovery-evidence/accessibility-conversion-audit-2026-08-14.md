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
- No horizontal overflow was detected at the available desktop viewport.

## Defects found, fixed, and verified

1. The cart page and the always-mounted cart drawer both used `id="cart-lines"`. The cart component now assigns `cart-lines-page` and `cart-lines-aside` so each line-item list has an unambiguous label.
2. The empty cart exposed an H1 followed by an H3 in the live accessibility tree. The page layout now renders the empty-state title as H2; the drawer retains H3 under its dialog title.

Both defects have regression coverage in `tests/accessibility-contract.test.js`. The focused accessibility suite passed 7/7, the full suite passed 78/78, and the production health suite passed 35/35.

The exact tested branch was deployed to the Oxygen Production environment with metadata description `cart-accessibility-semantics`. Shopify reported a successful, routable deployment at `https://01m00gt99ay4s9jvasj27pdqzy-f9aa94aa3bf86abb6754.myshopify.dev`.

Post-deployment inspection of `https://puchica.ca/cart` confirmed:

- `cart-lines-aside` and `cart-lines-page` are both present, with zero duplicate IDs in the document.
- The exposed empty-cart sequence is H1 `Cart`, then H2 `Nothing in your cart yet.`
- The closed drawer remains inert and is omitted from the accessibility tree.
- One `main` landmark remains exposed.

## Deliberately open checks

- A true 320 CSS-pixel / 400% reflow test remains open because the Chrome DevTools performance connection is not configured. Desktop overflow is not a substitute for this check.
- A full Tab, Shift+Tab, Enter, Space, and Escape keyboard traversal remains open. Source checks confirm a focusable skip link, inert closed drawers, named controls, and global `:focus-visible` styling, but those checks do not replace behavioral keyboard testing.
- Core Web Vitals were not measured because the required Chrome performance tracer is unavailable. No performance score or metric is inferred.

## Product-optimization workflow decision

The supplied Product Optimization workflow is a batch image, copy, price, status, tag, and compare-at-price mutation playbook. It was reviewed but not executed. Its image phase consumes generation credits and its backend and sale phases alter live product data. With zero completed checkouts in the last 30 days and only two attributed social sessions in the current baseline, those mutations would not address the present bottleneck: qualified distribution. The useful rule retained from the workflow is to verify the visible result rather than treating a successful mutation as proof.

## Repeatable checks

- `npm run accessibility-check`
- `npm test`
- `npm run production-health`
- `npm run launch-check`

The updated accessibility workbook is stored outside Git in the task output directory so it can be used as the ongoing review record. The two deployed cart defects are marked Complete; the reflow and full keyboard-traversal checks remain open.
