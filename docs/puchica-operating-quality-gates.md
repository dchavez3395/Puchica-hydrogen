# Puchica operating quality gates

These requirements apply to storefront, catalog, media, pricing, and launch work.
They supplement (and do not replace) the destination-specific supplier, margin,
and fulfillment gates in `docs/launch-readiness-checklist.md`.

The current paid-launch sequence, owners, advertising controls, and go/no-go
checklist live in `docs/ad-ready-launch-master-plan-2026-08-01.md`.

## Source authorities

- Product workflow: `C:\Users\dchav\Downloads\Copy of Copy of Product_Optimization_Workflow.docx`
  - SHA-256: `DF7CA0C69F1E287CEF235522A656F94C0C51778AB1A9E9A2BD3116E6FF58297E`
- Accessibility workbook: `C:\Users\dchav\Downloads\Copy of [TEMPLATE] Project Accessibility Sheets (1).xlsx`
  - SHA-256: `B2AFD47E4F79F6C0F42A9E7C13549BB9A3A9E7AEAA322CA193755024512E5AEB`

If either source hash changes, review the new version before relying on this
summary.

## Product and media change gate

1. Scope catalog work explicitly. Prefer the verified launch tag over broad
   `Active` status when the task is intended for the focused assortment.
2. In a live/manual run, confirm the store and brief, then offer a one-product
   test before a batch catalog mutation. Do not silently expand the scope.
3. Build lifestyle media from the clearest accurate product reference. The item
   must stay recognizable, sharp, and geometrically truthful in a natural place
   of use. Generated imagery may add context, but not invent included parts,
   quantities, dimensions, colors, or capabilities.
4. A human must approve product fidelity and the relevant storefront crops
   before generated media becomes featured. This requirement overrides any
   workflow language that discourages distortion warnings.
5. Attaching media is not completion. Reorder the approved media to position 0,
   query `featuredMedia`, and verify the visible storefront result.
6. Keep product titles under 60 characters, SEO titles under 70, and SEO
   descriptions under 160 when those fields are rewritten. Do not pad storefront
   copy to satisfy a word target; homepage copy stays short, concrete, and human.
7. Preserve existing non-seasonal tags, deduplicate additions, and never use
   accumulated seasonal tags as proof of launch readiness.
8. Apply safety copy for child, pet, water, or other risk-sensitive products and
   remove unsupported medical or performance claims.
9. Never infer pricing, status, sale, or tag mutations from a design request.
   These changes require an explicit brief and post-write verification.
10. Do not manufacture a compare-at price only to display a sale. A strikethrough
    price must be supportable as a genuine prior/reference price. The customer
    selling price, margin gate, and all variants must be verified independently.

## Commercial launch gate

Media optimization does not prove that a product should be sold. A product can
appear in a hero, campaign, or launch collection only when all existing release
controls pass, including:

- mapped and available supplier variant;
- destination-specific shipping cost and delivery estimate;
- conservative contribution margin of at least 30% at the lowest-margin
  sellable variant, including any active discount and payment fees;
- supported destination and checkout route;
- claim, policy, product-page, and sample/quality review where required;
- displayed price and option counts derived from sellable variants, not held or
  unavailable variants.

## Accessibility gate (WCAG 2.2 AA target)

The accessibility workbook is the review tracker. At minimum, every storefront
change must cover the applicable content, design, and development checks below.

### Perceivable

- Meaningful alt text for informative media; decorative media has empty alt.
- Semantic landmarks and a logical heading hierarchy with one page H1.
- DOM order remains meaningful when the layout linearizes across breakpoints.
- Do not rely on color, position, shape, or sensory language alone.
- Text and non-text UI contrast pass, including controls placed on photography.
- No essential text embedded in imagery.
- Text remains legible at 200% resize and with increased text spacing.
- At 400% zoom / 320 CSS px, content reflows without horizontal page scrolling.

### Operable

- All interactive behavior works with a keyboard and has no keyboard trap.
- Focus order follows reading order; focus is visible and not obscured.
- Repeated navigation has a working bypass/skip link.
- Links and controls have descriptive names and consistent identification.
- Pointer interactions do not require dragging or multipoint/path gestures.
- Interactive targets meet the 24 by 24 CSS px WCAG 2.2 minimum; Puchica's
  preferred shared-control target is 48 px where practical.
- Moving or auto-updating content longer than five seconds can be paused,
  stopped, or hidden, and reduced-motion preferences are respected.

### Understandable and robust

- Page and language metadata are correct; headings and labels describe purpose.
- Focus or input does not trigger an unexpected context change.
- Navigation and repeated controls remain consistent across the storefront.
- Inputs have programmatic labels, appropriate autocomplete, clear errors, and
  actionable correction guidance.
- Checkout and other financial/data actions provide review, confirmation, or a
  reversible correction path where applicable.
- Custom controls expose correct accessible name, role, value, state, and status
  messages to assistive technology.

## Required verification before handoff

- Desktop and mobile visual review, including photography crops and text-on-image
  contrast.
- Keyboard-only pass through changed interactions.
- Automated accessibility scan, plus manual checks for semantics and focus.
- 200% text resize, increased text spacing, mobile landscape, and 400%/320px
  reflow checks for materially changed layouts.
- Screen-reader spot check for changed product media, controls, errors, and live
  status where applicable.
- Commerce verification that visible prices, variants, inventory/availability,
  claims, shipping language, and featured media match the approved source data.
