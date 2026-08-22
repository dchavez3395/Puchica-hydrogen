/**
 * Remove variant merchandising prefixes from customer-facing product titles.
 * Shopify titles remain untouched in product data, SEO, analytics, and checkout.
 */
// Every approved handle must appear here. A handle that is missing falls
// through to the raw Shopify title, which is English in every locale — that is
// how `travel-cable-organizer-case` and the Carry-On Kit shipped untranslated
// on the grid, in the cart, and in search. `tests/product-copy.test.js` walks
// APPROVED_CATALOG_OFFERS and fails if any handle cannot resolve copy.
const LAUNCH_COPY_PREFIX = {
  '3-piece-packing-cube-set': 'product_copy_packing',
  'white-semi-circular-travel-jewelry-case': 'product_copy_jewelry',
  'black-hanging-travel-toiletry-organizer': 'product_copy_toiletry',
  'black-travel-tech-case': 'product_copy_tech',
  'travel-cable-organizer-case': 'product_copy_cable',
  'the-carry-on-kit-toiletry-organizer-packing-cubes-cable-case':
    'product_copy_kit',
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

/** Display the only department admitted by the exact launch-product gate. */
export function presentProductDepartment(_product, t) {
  return t('product_department_travel');
}
