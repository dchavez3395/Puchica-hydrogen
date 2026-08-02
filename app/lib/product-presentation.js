/**
 * Remove variant merchandising prefixes from customer-facing product titles.
 * Shopify titles remain untouched in product data, SEO, analytics, and checkout.
 */
export function presentProductTitle(title, variant) {
  const cleanTitle = String(title || '').trim();
  const optionValues = (variant?.selectedOptions || []).map(({value}) => value);
  const candidates = [variant?.title, optionValues.join(' '), ...optionValues]
    .map((value) => String(value || '').trim())
    .filter((value) => value && !/^default title$/i.test(value))
    .sort((a, b) => b.length - a.length);

  for (const candidate of candidates) {
    if (cleanTitle.toLowerCase().startsWith(`${candidate.toLowerCase()} `)) {
      return cleanTitle.slice(candidate.length).trim() || cleanTitle;
    }
  }

  const withoutMerchandisingPrefix = cleanTitle.replace(
    /^(?:white|silver|grey|gray|black|red|blue|green|beige|navy)(?:\s+(?:small|medium|large))?\s+/i,
    '',
  );
  return withoutMerchandisingPrefix || cleanTitle;
}

/**
 * Translate inconsistent supplier product types into Puchica's three shopping
 * needs. This is display-only and does not alter Shopify taxonomy.
 */
export function presentProductDepartment(product, t) {
  const haystack = `${product?.productType || ''} ${product?.title || ''}`;

  if (/cable|cord|charger|electronic/i.test(haystack)) {
    return t('megamenu_intent_cable_title');
  }

  if (/travel|packing|luggage|bag|pouch/i.test(haystack)) {
    return t('megamenu_intent_travel_title');
  }

  return t('megamenu_intent_home_title');
}
