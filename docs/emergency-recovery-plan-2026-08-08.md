# Puchica emergency recovery plan — 2026-08-08

## Executive decision

Puchica is not ready for paid traffic. The present catalog has zero products
with complete destination, fulfillment, margin, content, and evidence approval.
The immediate objective is not to make the current catalog look more convincing;
it is to stop unsupported claims, contain unapproved products, restore a credible
brand surface, and establish a small launch assortment that can pass every gate.

The canonical acceptance criteria are in
`docs/puchica-operating-quality-gates.md`.

## Non-negotiable holds

- No ad spend or ad reactivation.
- No production deployment without a desktop/mobile preview and explicit review.
- No product is called trending, bestselling, popular, verified, reviewed, or
  frequently reordered without current evidence.
- No synthetic compare-at pricing, invented scarcity, or unsupported shipping
  promise.
- No product is launch-approved from Shopify Active status, a collection tag,
  a DSers mapping, or attractive media alone.
- No generated product image may change the actual item, included quantity,
  dimensions, colour, controls, attachments, or capabilities.

## Recovery sequence

### 1. Contain the storefront

Replace the current product-heavy homepage with a truthful temporary brand page.
Keep About, Contact, FAQ, shipping information, and policies reachable. Remove
unapproved catalog links and claims from the header, footer, discovery surfaces,
feeds, sitemap, and campaign routes wherever the storefront can fail closed.

Exit criteria:

- a visitor cannot mistake the unapproved catalog for a launch assortment;
- no unsupported commercial claim remains in the changed surface;
- desktop and mobile layouts pass visual, keyboard, reflow, and focus checks.

### 2. Repair storefront foundations

Resolve the known hydration, semantic-heading, analytics, navigation, and lint
regressions. Preserve the existing safe cart, checkout, market, and security
helpers unless a test proves a defect.

Exit criteria:

- build and automated tests pass;
- no runtime hydration error in the reviewed routes;
- one visible semantic H1 per route at every breakpoint;
- keyboard, focus, status-message, and 320 CSS px reflow checks pass;
- analytics records the intended consent-aware funnel events without duplication.

### 3. Quarantine and normalize catalog data

Remove unsupported launch/readiness tags and synthetic merchandising claims.
Create a per-variant, per-destination approval record with explicit `pass`,
`fail`, or `not checked` states. `Not checked` always fails closed.

Required product evidence:

- exact supplier and mapped variant;
- inventory behavior and source warehouse;
- product cost, shipping cost, payment-fee assumption, refund/defect reserve,
  and conservative contribution margin;
- destination-specific delivery estimate, tracking, duty/tax responsibility,
  and checkout route;
- accurate title, option names, dimensions, material, included quantity, care,
  warnings, and claims;
- source and usage rights for each image, with product-fidelity review;
- origin country, weight, and HS code where required for cross-border handling.

### 4. Select the launch assortment

Evaluate the existing mapped catalog first and select three to five products
that form one credible customer-facing collection. Do not impose a niche before
the mapping, route, economics, competitive-price, fidelity, and risk evidence is
scored. Prefer simple, demonstrable products with low safety, warranty,
counterfeit, and support risk. Source replacement products only if the current
catalog cannot produce a passing cohort. A single supplier is convenient but
not mandatory; every supplier route must independently pass the same destination
and margin controls.

Exit criteria for each sellable variant:

- Canada and/or United States route explicitly approved;
- conservative contribution margin at least 30 percent after the actual active
  discount and modeled transaction costs;
- credible delivery window and checkout total;
- all content and media accurately match the mapped variant;
- storefront product page passes commerce and WCAG review.

### 5. Preview, validate, then decide launch scope

Run one end-to-end checkout without placing a physical order, using each enabled
market's real postal/ZIP context. A physical test order is valuable but is not a
prerequisite for initial validation; unresolved fulfillment uncertainty must be
reflected in the gate, not hidden from internal records.

Prepare a launch review containing:

- approved products and variants;
- landed-cost and competitive-price matrix;
- delivery and returns evidence;
- desktop/mobile screenshots;
- accessibility and analytics results;
- remaining risks and rollback steps.

Only after explicit approval may production deployment occur. Advertising stays
off until the production storefront and funnel are rechecked after deployment.

## Advertising entry gate

Paid acquisition begins with creative and tracking validation, not a broad
catalog campaign. The first controlled test requires:

- at least three approved products in one coherent customer problem space;
- a primary offer that remains profitable under the test budget and discount;
- working view-content, add-to-cart, checkout-start, and purchase measurement;
- truthful creative that matches the landing-page variant and price;
- a written daily budget cap, stop-loss rule, and decision window approved by
  the owner.

## Status vocabulary

- **Approved**: evidence exists and every applicable gate passed.
- **Quarantined**: failed, conflicting, or incomplete evidence; not discoverable.
- **Not checked**: no conclusion; treated the same as quarantined externally.
- **Preview ready**: code and content passed local QA but are not deployed.
- **Launch ready**: production and commerce checks passed; this does not by itself
  authorize ad spend.
