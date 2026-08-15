const META_EVENT_ALLOWED_HOSTS = new Set(['puchica.ca', 'www.puchica.ca']);

/**
 * Meta browser events may only claim the public Puchica storefront as their
 * source. `PUBLIC_STORE_DOMAIN` is intentionally not used here because
 * Oxygen sets it to the internal *.myshopify.com Storefront API domain.
 */
export function isAllowedMetaEventSourceUrl(sourceUrl) {
  if (!sourceUrl) return true;

  try {
    const url = new URL(sourceUrl);
    return (
      (url.protocol === 'https:' || url.protocol === 'http:') &&
      META_EVENT_ALLOWED_HOSTS.has(url.hostname.toLowerCase())
    );
  } catch {
    return false;
  }
}

