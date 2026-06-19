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
 * Fetch a product's aggregate rating from Judge.me (public widget endpoint).
 * Best-effort: returns null on any failure so the product page always renders.
 *
 * @param {string} handle Shopify product handle
 * @returns {Promise<{rating: number, count: number, externalId: number|null} | null>}
 */
export async function getJudgemeBadge(handle) {
  if (!handle) return null;
  const url =
    `https://judge.me/api/v1/widgets/preview_badge` +
    `?api_token=${JUDGEME_PUBLIC_TOKEN}` +
    `&shop_domain=${JUDGEME_SHOP_DOMAIN}` +
    `&handle=${encodeURIComponent(handle)}`;

  try {
    const res = await fetch(url, {headers: {accept: 'application/json'}});
    if (!res.ok) return null;
    const data = await res.json();
    const badge = String(data?.badge || '');
    const rating = parseFloat(
      (badge.match(/data-average-rating=['"]([\d.]+)['"]/) || [])[1] || '0',
    );
    const count = parseInt(
      (badge.match(/data-number-of-reviews=['"](\d+)['"]/) || [])[1] || '0',
      10,
    );
    const externalId = data?.product_external_id ?? null;
    return {rating: rating || 0, count: count || 0, externalId};
  } catch {
    return null;
  }
}
