# Puchica pre-ad release gate — 2026-08-01

## Decision

The storefront implementation is ready for controlled release preparation,
but production deployment and paid activation remain on hold.

No deployment, commit, push, order, subscription, ad publication, or spend was
performed during this review.

## Deployment gate

Production is linked to the Oxygen `production` environment on the `main`
branch at `https://puchica.ca`. The current local branch is `main-updates`, and
the release candidate exists inside a large dirty working tree.

Do not deploy with `--force`. The release must first be curated into a clean,
traceable commit and sent to Oxygen Preview.

Expected commands after release curation:

```text
npx shopify hydrogen deploy --preview
npx shopify hydrogen deploy --env production
```

The second command is only used if merging the clean release to `main` does not
already trigger the connected automatic deployment.

Before staging, explicitly resolve the deletion of
`tests/analytics-e2e.test.js`. Never use `git add .`; the workspace also holds
screenshots, generated drafts, evidence, caches, and temporary files that do
not belong in the production source release.

## Measurement gate

Production contains the configured Meta Pixel and GA4 IDs, and the storefront
implementation maps the expected pre-checkout events:

- `page_viewed` to Meta `PageView` and GA4 `page_view`;
- `product_viewed` to Meta `ViewContent` and GA4 `view_item`;
- `product_added_to_cart` to Meta `AddToCart` and GA4 `add_to_cart`; and
- `custom_checkout_started` to Meta `InitiateCheckout` and GA4
  `begin_checkout`.

No order is required to verify those events. Authenticated access is required
to inspect Shopify Customer Events, Meta Test Events, and GA4 DebugView or Tag
Assistant. Verify consent rejection/acceptance, CA and US values/currencies,
one event per action, catalog ID matching, and no checkout-start duplication.

Shopify-hosted checkout owns `Purchase`. The first genuine order may be used as
the proof point only if scaling remains paused until the event is confirmed as
present, accurate, and non-duplicated.

## Dependency gate

Do not run `npm audit fix`. The current automated remediation proposes an
unsupported Hydrogen downgrade and framework change.

The applicable React Router manifest-discovery risk is mitigated locally with
`routeDiscovery: {mode: 'initial'}`. The storefront has a small route set, so
embedding the complete manifest is a reasonable tradeoff while Hydrogen
remains pinned to React Router 7.16.x.

Keep the current dependency versions until Shopify publishes a stable Hydrogen
release supporting a patched React Router version. React Router 8 is not a
supported shortcut for this stack.

## Creative gate

The first two photorealistic generated drafts are moodboards only:

- `packing-cubes-what-arrives-v1.png` includes a suitcase and requires an
  inclusion disclaimer;
- `packing-cubes-what-arrives-v2.png` removes the suitcase but changes the four
  graduated cube sizes into two matched pairs and weakens the visible
  compression track.

Neither generated product rendering is approved for publishing.

The first ad-safe draft uses the supplier image unchanged:

- `work/ad-creative-drafts/packing-cubes-what-arrives-exact-9x16.jpg`
- 1080 × 1920
- hook: `What actually arrives`
- headline: `The complete 5-piece red set.`
- inclusion line: `4 packing cubes + 1 shoe bag`
- CTA: `See the set`

This source-first treatment is the baseline against which CreateUGC or future
generated video frames must be compared.

## Next approval point

Owner intervention is required for:

1. approval to curate and commit the release candidate;
2. authenticated access to Shopify Admin, Meta Events Manager, and GA4 for the
   zero-spend event proof;
3. approval of the exact creative set;
4. approval of the spending cap before any paid activation.
