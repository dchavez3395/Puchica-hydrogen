/**
 * Remove variant merchandising prefixes from customer-facing product titles.
 * Shopify titles remain untouched in product data, SEO, analytics, and checkout.
 */
// Every approved handle must appear here. A handle that is missing falls
// through to the raw Shopify title, which is English in every locale — that is
// how `travel-cable-organizer-case` and the Carry-On Kit shipped untranslated
// on the grid, in the cart, and in search. `tests/product-copy.test.js` walks
// APPROVED_CATALOG_OFFERS and fails if any handle cannot resolve copy.
/**
 * Exported for tests/navigation-scope.test.js, which derives per-locale banned
 * words from each archived product's own localized title. Without the mapping
 * that check can only ban English words, and the live /fr/collections/all hero
 * read "LA SÉLECTION MONTRES" while an English-only guard was green.
 */
export const LAUNCH_COPY_PREFIX = {
  '3-piece-packing-cube-set': 'product_copy_packing',
  'white-semi-circular-travel-jewelry-case': 'product_copy_jewelry',
  'black-hanging-travel-toiletry-organizer': 'product_copy_toiletry',
  'black-travel-tech-case': 'product_copy_tech',
  'travel-cable-organizer-case': 'product_copy_cable',
  'the-carry-on-kit-toiletry-organizer-packing-cubes-cable-case':
    'product_copy_kit',
  'compression-packing-cube-set-5-piece': 'product_copy_compression',
  'pu-leather-watch-roll-travel-case-3-or-6-watches':
    'product_copy_watchroll36',
  'pu-leather-watch-roll-travel-case-4-watches': 'product_copy_watchroll4',
  'hand-woven-bamboo-pendant-light': 'product_copy_bamboopendant30',
  'woven-bamboo-dome-pendant': 'product_copy_bamboodome',
  'woven-bamboo-lantern-pendant-26cm': 'product_copy_bamboolantern',
  'woven-bamboo-column-pendant-37cm': 'product_copy_bamboocolumn',
  'woven-bamboo-mini-pendant-18cm': 'product_copy_bamboomini',
  'plug-in-bamboo-sconce-swing-arm': 'product_copy_bamboosconce',
  'woven-bamboo-wave-chandelier-35cm': 'product_copy_bamboowave',
  'woven-bamboo-drum-chandelier-30cm': 'product_copy_bamboodrum',
  'woven-bamboo-wide-brim-chandelier-30cm': 'product_copy_bamboobrim',
  'slatted-bamboo-lantern-pendant-20cm': 'product_copy_slattedlantern20',
  'woven-rattan-petal-pendant-30cm': 'product_copy_rattanpetal30',
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
