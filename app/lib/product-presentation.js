/**
 * Remove variant merchandising prefixes from customer-facing product titles.
 * Shopify titles remain untouched in product data, SEO, analytics, and checkout.
 */
const LAUNCH_COPY_PREFIX = {
  '3-piece-packing-cube-set': 'product_copy_packing',
  'white-semi-circular-travel-jewelry-case': 'product_copy_jewelry',
  'black-hanging-travel-toiletry-organizer': 'product_copy_toiletry',
};

function translated(source, key) {
  const value = typeof source === 'function' ? source(key) : source?.[key];
  return typeof value === 'string' && value !== key ? value : '';
}

export function presentLaunchProductCopy(handle, source) {
  const prefix = LAUNCH_COPY_PREFIX[handle];
  if (!prefix) return null;
  const title = translated(source, `${prefix}_title`);
  const summary = translated(source, `${prefix}_summary`);
  const descriptionHtml = translated(source, `${prefix}_html`);
  return title && summary && descriptionHtml
    ? {title, summary, descriptionHtml}
    : null;
}

export function presentProductTitle(title, variant, handle, source) {
  const localized = presentLaunchProductCopy(handle, source)?.title;
  if (localized) return localized;
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
  const productType = String(product?.productType || '').trim();
  const haystack = `${productType} ${product?.title || ''}`;

  if (LAUNCH_COPY_PREFIX[product?.handle] || /travel/i.test(productType)) {
    return t('product_department_travel');
  }

  if (/cable|cord|charger|electronic/i.test(haystack)) {
    return t('megamenu_intent_cable_title');
  }

  if (/travel|packing|luggage|bag|pouch/i.test(haystack)) {
    return t('megamenu_intent_travel_title');
  }

  return t('megamenu_intent_home_title');
}
