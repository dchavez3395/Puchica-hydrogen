# Puchica operating quality gates

These requirements apply to storefront, catalog, media, pricing, and launch work.
They supplement (and do not replace) the destination-specific supplier, margin,
and fulfillment gates in `docs/launch-readiness-checklist.md`.

The current paid-launch sequence, owners, advertising controls, and go/no-go
checklist live in `docs/ad-ready-launch-master-plan-2026-08-01.md`.

## Source authorities

- Product workflow: `C:\Users\dchav\Downloads\Copy of Copy of Product_Optimization_Workflow.docx`
  - SHA-256: `DF7CA0C69F1E287CEF235522A656F94C0C51778AB1A9E9A2BD3116E6FF58297E`
- Accessibility workbook: `C:\Users\dchav\Downloads\Copy of [TEMPLATE] Project Accessibility Sheets (2).xlsx`
  - SHA-256: `DAEA7044D45C9020189DDC2EDBB0C1BE6DBF369029160C33DDAD90BFB0B4E09C`

If either source hash changes, review the new version before relying on this
summary.

## Decision hierarchy

When instructions or data disagree, use this order:

1. Customer safety, legal truthfulness, platform rules, and verified evidence.
2. The commercial launch and accessibility gates in this document.
3. The current approved task brief and product-specific source record.
4. Batch-workflow efficiency guidance in the source documents.

Efficiency never overrides product fidelity, accessibility, truthful pricing,
or visible-result verification. A successful mutation, build, or deployment is
not proof that the customer-facing result is correct.

## Emergency storefront containment gate

Until a product passes the commercial launch gate, it must fail closed:

- do not feature it on the homepage or in campaign routes;
- do not describe it as trending, popular, bestselling, verified, reviewed, or
  frequently reordered without current supporting evidence;
- do not publish it through product feeds or intentional discovery surfaces;
- do not use synthetic compare-at prices, countdowns, scarcity, or review copy;
- do not advertise it or include it in discount-led acquisition campaigns.

Store-wide shipping, duty, delivery, guarantee, and discount claims require a
documented rule that is true for every item and destination in scope. Otherwise,
use destination-neutral wording such as "shipping options shown at checkout."

Catalog approval must be recorded per sellable variant and destination. A
collection tag, Active status, image, or DSers connection is not approval.

## Shared execution protocol

1. Record scope, destination, store, evidence sources, and fields being changed.
2. For manual catalog mutations, complete and visibly verify one representative
   product before asking to batch the remainder.
3. Build deterministic batches offline, preserve stable identifiers, and keep a
   checkpoint/recovery log for long-running work.
4. Retry recoverable errors in a bounded way; quarantine isolated failures rather
   than weakening the gate for the whole batch.
5. Verify the rendered storefront and source-of-truth data after every write.
6. Report passed, failed, skipped, and quarantined records separately. Never
   convert "not checked" into "passed."
7. Require a preview and explicit approval before production deployment, catalog
   mutation, or advertising spend.

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
