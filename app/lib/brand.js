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
 */
export const BRAND_DESCRIPTION =
  'Curated picks across home, kitchen, beauty, tech, pet, and more. Free shipping across Canada, easy 30-day returns, secure checkout.';

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
  'https://www.facebook.com/share/1HXPSqGprD/',
  'https://tiktok.com/@puchica_canada',
];
