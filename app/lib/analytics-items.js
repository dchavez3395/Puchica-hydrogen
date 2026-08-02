/**
 * Use the sellable Shopify variant as the canonical commerce-event item ID.
 * Falling back to product ID keeps events usable when a view payload lacks a
 * selected variant, while normal product pages remain variant-consistent.
 *
 * @param {{variantId?: string | null, id?: string | null} | null | undefined} item
 */
export function analyticsItemId(item) {
  return item?.variantId || item?.id || undefined;
}

/**
 * Normalize Hydrogen cart lines into GA4/Meta-friendly variant item records.
 *
 * @param {any} cart
 */
export function cartAnalyticsItems(cart) {
  const nodes = Array.isArray(cart?.lines?.nodes) ? cart.lines.nodes : [];

  return nodes
    .map((line) => {
      const merchandise = line?.merchandise;
      const itemId = merchandise?.id;
      const price = Number(merchandise?.price?.amount);
      const quantity = Math.max(1, Number(line?.quantity) || 1);

      if (!itemId) return null;
      return {
        item_id: itemId,
        item_name: merchandise?.product?.title,
        item_variant: merchandise?.title,
        price: Number.isFinite(price) ? price : undefined,
        quantity,
      };
    })
    .filter(Boolean);
}
