# Mobile and WCAG primary-funnel evidence — 2026-08-10

## Decision

**HOLD — the no-spend mobile/WCAG pre-ad gate is not closed yet.**

The core mobile and tablet commerce path passed the bounded live checks below.
One wrong-market 404 accessibility/reflow defect was found and corrected in the
working tree. Production verification of that correction, a complete automated
accessibility scan, and a physical-device/keyboard sign-off are still required
before this gate can be marked `PASS`.

This hold does not remove the current `GO_ORGANIC_LIMITED` authorization. It
continues to block paid advertising.

## Tested production state

- Storefront: `https://puchica.ca`
- Production commit at start: `ed18496fe5db8f242f1936b780eb02a0873ee39a`
- Oxygen asset: `4183219`
- Browser surface: Codex in-app Chromium viewport control
- Viewports: 390 × 844, 320 × 800, and 768 × 1024 CSS pixels
- Markets: Canada/CAD/en-CA and United States/USD/en-US
- No order, supplier payment, catalog mutation, DSers mutation, ad spend, or
  external publishing occurred.

## Passing observations

### Responsive layout

- U.S. home, collection, and handle-wrap PDP had no document-level horizontal
  overflow at 390 px or 768 px.
- U.S. collection reflowed at 320 px without document-level horizontal
  overflow and exposed the exact seven approved U.S. product routes.
- Canadian collection exposed the exact nine approved Canadian product routes.
- Images sampled on the collection and PDP loaded successfully after normal
  lazy-loading settled.
- Every sampled page had one visible H1 and the expected `en-US` or `en-CA`
  language value.

### Product, market, cart, and checkout containment

- Handle-wrap PDP exposed exactly `Coffee Brown` and `Black` option buttons.
- At 390 px, `Black` selected the correct URL state and enabled Add to Cart.
- The exact Black handle wrap added as an $11.00 USD line; the cart exposed a
  valid `checkout.puchica.ca` handoff. The test line was removed afterward.
- The pre-existing cable-organizer cart line was preserved.
- Switching to Canada changed the handle-wrap price to CA$14.99 CAD and the
  existing cable-organizer cart line to CA$24.99 CAD.
- The Canada-only packing-cube PDP loaded at CA$39.99 CAD with enabled Add to
  Cart in Canada, then returned the controlled 404 with no Add to Cart in the
  United States.

### Accessibility behavior sampled

- Homepage exposed a `Skip to main content` link, one main landmark, one H1,
  and no unnamed visible buttons.
- The skip link had a visible 3 px outline and focus halo when focused.
- Closed cart, search, and menu drawers were `inert` and `aria-hidden`.
- The open mobile menu used `role="dialog"` and `aria-modal="true"`, moved
  focus to its close button, closed on Escape, and returned focus to the menu
  trigger.
- Sampled interactive controls met the WCAG 2.2 24 CSS px target-size minimum,
  apart from ordinary inline breadcrumb links, which fall under the inline
  target exception. Primary option and Add to Cart controls were larger.

## Evidenced defect and correction

The controlled U.S. 404 for the Canada-only packing-cube route had:

1. no semantic `<main>` landmark;
2. a 396.4 px error panel inside a 390 px viewport because a `width: 100%`
   content-box panel also added horizontal padding; and
3. stale copy saying Puchica was “preparing the new catalog.”

The correction:

- changes the root error container to a focusable `<main id="main-content">`;
- applies `box-sizing: border-box` to the error panel; and
- replaces the stale text in English, French, Spanish, and Portuguese with
  truthful moved-page/wrong-market guidance.

A source contract was added to prevent regression. In a clean detached worktree
with a lockfile-pinned optional-dependency install:

- the full Node test suite passed 65/65;
- lint passed with zero errors and 31 pre-existing utility-script warnings;
- `npm run launch-check` passed; and
- the production Hydrogen client and SSR build completed successfully.

## Remaining closure work

1. Deploy the exact tested commit and recheck the U.S. packing-cube 404 at
   390 px: one main landmark, no overflow, current copy, no Add to Cart.
2. Run and retain an automated accessibility report against home, collection,
   handle-wrap PDP, cart, and controlled 404.
3. Complete keyboard-only order/focus-trap verification in a browser surface
   that can send sequential Tab input reliably.
4. Obtain a short physical-phone sign-off at approximately 390 px and a tablet
   sign-off; the current viewport checks are browser emulation, not physical
   device evidence.

Only after these items produce explicit passing evidence may this artifact be
superseded by a dated `PASS` report.
