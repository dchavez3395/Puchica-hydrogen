/**
 * Keep supplier option values intact for DSers matching, while presenting a
 * clean, readable label to customers. This must never be used to construct a
 * variant URL or mutate Shopify data.
 *
 * @param {string | null | undefined} value
 */
export function formatProductOptionLabel(value) {
  if (!value) return '';

  const cleaned = String(value).trim().replace(/_/g, ' ').replace(/\s+/g, ' ');
  const normalized = cleaned.toLowerCase();

  if (/multi/.test(normalized) && /colou?r/.test(normalized)) {
    return 'Multi-colour';
  }

  // Keep the exact supplier value in URLs and DSers mapping while presenting
  // the warm-brown shade promised by the approved product title.
  if (normalized === 'coffee color' || normalized === 'coffee colour') {
    return 'Coffee Brown';
  }

  // Supplier option values such as "Excavator-Green" are understandable but
  // visually noisy. A separator makes the product/model relationship clear
  // without changing the mapped source value.
  const withSeparators = cleaned.replace(/(?<=[a-zA-Z])-(?=[a-zA-Z])/g, ' — ');

  // Keep short all-caps technical sizes (for example XXL) as supplied.
  if (
    withSeparators.length <= 4 &&
    withSeparators === withSeparators.toUpperCase()
  ) {
    return withSeparators;
  }

  return withSeparators
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}
