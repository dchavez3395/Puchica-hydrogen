import {DICTIONARIES} from './dictionaries.js';
import {LANGUAGE_KEYS} from './i18n.js';
import {LAUNCH_COPY_PREFIX} from './product-presentation.js';

const MERGED_DICTIONARIES = Object.freeze(
  Object.fromEntries(
    Object.entries(DICTIONARIES).map(([key, dictionary]) => [
      key,
      Object.freeze({...DICTIONARIES.en, ...dictionary}),
    ]),
  ),
);

// product_copy_*_html is ~70 KB per locale (every product's full description,
// retired travel gear included) and only one product page ever reads one of
// them, yet the root loader serialised the lot into every HTML response
// (Lighthouse 2026-09-18: a 148 KB inline payload on a 202 KB page). The
// request dictionary now ships without those keys; the product route adds
// back its own via getProductCopyHtml().
const isProductHtmlKey = (key) =>
  key.startsWith('product_copy_') && key.endsWith('_html');

const REQUEST_DICTIONARIES = Object.freeze(
  Object.fromEntries(
    Object.entries(MERGED_DICTIONARIES).map(([key, dictionary]) => [
      key,
      Object.freeze(
        Object.fromEntries(
          Object.entries(dictionary).filter(([k]) => !isProductHtmlKey(k)),
        ),
      ),
    ]),
  ),
);

export function getRequestDictionary(language = 'EN') {
  const key = LANGUAGE_KEYS[language] || 'en';
  return REQUEST_DICTIONARIES[key] || REQUEST_DICTIONARIES.en;
}

/**
 * The product_copy_<prefix>_html entry for one handle in one language, keyed
 * exactly as the dictionary keys it so the route can merge it over the request
 * dictionary. Empty object when the handle has no launch copy.
 */
export function getProductCopyHtml(language = 'EN', handle) {
  const key = LANGUAGE_KEYS[language] || 'en';
  const full = MERGED_DICTIONARIES[key] || MERGED_DICTIONARIES.en;
  const prefix = LAUNCH_COPY_PREFIX[handle];
  const htmlKey = prefix ? `${prefix}_html` : null;
  return htmlKey && typeof full[htmlKey] === 'string'
    ? {[htmlKey]: full[htmlKey]}
    : {};
}
