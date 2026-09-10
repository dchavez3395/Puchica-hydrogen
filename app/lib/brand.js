/**
 * Brand-level constants for the Puchica storefront.
 *
 * These are the "static facts about the brand" — they don't change at
 * runtime and are not fetched from Shopify. Anything that varies per
 * page (canonical, OG image, etc.) belongs in app/lib/seo.js.
 */

/**
 * Public-facing Puchica logo URL. Update this after uploading a new
 * logo to Shopify (Settings > Files). The Header and Footer components
 * prefer `shop.brand.logo.image.url` from the Storefront API when set
 * under Settings > Brand, otherwise they fall back to this URL.
 */
export const STORE_LOGO_URL =
  'https://cdn.shopify.com/s/files/1/0842/2644/1466/files/puchica-logo.svg?v=1781383015';

/**
 * One-line brand description used in the Organization JSON-LD
 * (`description` field) and anywhere else we need a static "what is
 * Puchica" line. Google's knowledge panel uses this; keeping it
 * consistent across surfaces avoids conflicting signals.
 *
 * 2026-09-10: this said "a focused edit of practical travel organizers" for
 * weeks after that cohort was retired, which meant the ONE sentence Google
 * builds its entity for the business from described a category the store no
 * longer sells, while every page title said lighting. Conflicting signals is
 * exactly what the note above warns against, so keep this in step with
 * `launch-meta.js` whenever the category changes.
 *
 * Two claims are deliberately absent and must stay absent. The store does not
 * say the goods are handmade, artisan or made to order — they are bought from
 * suppliers and shipped direct, and `tests/product-copy.test.js` fails the
 * build over that wording. And it does not describe itself by size or origin
 * of manufacture. What is true is the assortment and who it ships to.
 */
export const BRAND_DESCRIPTION =
  'An independent shop selling woven bamboo pendant and wall lighting, shipped direct to customers in the United States.';

/**
 * Verified social profile URLs. The Organization JSON-LD's `sameAs`
 * field reads this list — Google uses it to cross-link the brand
 * entity across the web and surface those profiles in the knowledge
 * panel. The Footer renders the same set. Update both at once by
 * editing this array.
 *
 * If you add a profile, the corresponding Footer entry should also
 * import from this list to stay in sync.
 */
export const SOCIAL_PROFILES = [
  'https://instagram.com/puchica.canada',
  'https://www.facebook.com/people/Puchica/61590729031671/',
  'https://tiktok.com/@puchica_canada',
];
