/**
 * Build a product gallery without leaking unapproved supplier media.
 *
 * Single-variant products can safely use their full product gallery because
 * every image belongs to the only purchasable configuration. Multi-variant
 * products remain restricted to the selected variant image because supplier
 * galleries commonly mix colours, sizes, and bundle configurations.
 */
export function buildApprovedGallery(product, selectedVariant) {
  if (!selectedVariant?.image) return [];

  const variants = product?.variants?.nodes || [];
  if (variants.length !== 1) return [selectedVariant.image];

  const seen = new Set();
  return [selectedVariant.image, ...(product?.images?.nodes || [])].filter(
    (image) => {
      const key = image?.id || image?.url;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    },
  );
}
