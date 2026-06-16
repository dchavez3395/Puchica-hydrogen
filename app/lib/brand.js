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
  'https://cdn.shopify.com/s/files/1/0842/2644/1466/files/Puchica_logo.png?v=1781275908';
