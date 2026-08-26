/**
 * Judge.me reviews integration.
 *
 * The store runs headless, so the standard Judge.me theme-app-extension
 * widgets don't auto-inject. We instead:
 *  - fetch the per-product rating badge server-side (for SSR stars + the
 *    JSON-LD aggregateRating that powers Google rich results), and
 *  - render Judge.me's official client widget for the full review list +
 *    "write a review" form (see app/components/JudgemeReviews.jsx).
 *
 * The PUBLIC token is read-only and safe to ship to the browser — it's the
 * same token embedded in every Judge.me storefront. The private/admin token
 * is NOT used here.
 */
export const JUDGEME_SHOP_DOMAIN = 'ug91ve-sz.myshopify.com';
export const JUDGEME_PUBLIC_TOKEN = 'qaw9yDt_xMH67WiazTpAqBRW6cY';

/**
 * Read a product's aggregate rating out of Judge.me's own product metafield.
 *
 * WHY THIS REPLACED A FETCH
 *
 * This used to call judge.me's preview_badge endpoint from the server on every
 * product render, behind a 1.6s AbortController. Two things were wrong with
 * that. It added a blocking cross-origin round trip to the critical path of
 * every PDP, and it had started returning 404, so the review widget silently
 * never rendered — the storefront showed no social proof at all and nothing
 * surfaced an error, because the helper swallowed failures by design.
 *
 * Judge.me already writes `judgeme.review_widget_data` onto each product, so
 * the same numbers ride the Storefront query the page is making anyway. Zero
 * extra latency, no external dependency in the render path, and it cannot 404.
 *
 * Requires the metafield definition to grant storefront PUBLIC_READ; the app
 * writes the values but does not define them, so the definition is created
 * once in the Shopify admin (see docs). Absent that, `value` arrives null and
 * this returns null, which renders exactly like a product with no reviews.
 *
 * @param {string | null | undefined} value Raw JSON string from the metafield
 * @returns {{rating: number, count: number, externalId: number|null} | null}
 */
export function parseJudgemeReviewData(value) {
  if (!value) return null;
  let data;
  try {
    data = JSON.parse(value);
  } catch {
    // Judge.me owns this payload's shape; malformed JSON must not take the
    // product page down with it.
    return null;
  }
  // Arrays pass `typeof === 'object'`, so an unexpected `[]` would otherwise
  // sail through and render as a real "0 reviews" result rather than as the
  // absence of data it actually is.
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;

  const count = Number(data.number_of_reviews);
  const rating = Number(data.average_rating);
  const externalId = data.product_external_id ?? null;

  return {
    rating: Number.isFinite(rating) ? rating : 0,
    count: Number.isFinite(count) ? count : 0,
    externalId: externalId === null ? null : Number(externalId) || null,
  };
}
