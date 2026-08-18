const META_EVENT_ALLOWED_HOSTS = new Set([
  'puchica.ca',
  'www.puchica.ca',
  'puchica.shop',
  'www.puchica.shop',
]);

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

/**
 * The browser relay is a same-origin endpoint, not a public event-ingestion
 * API. Requiring the browser's Origin to match the actual request origin keeps
 * third parties from submitting fabricated storefront events with a copied
 * `event_source_url`.
 */
export function isAllowedMetaRequestOrigin(request) {
  try {
    const requestUrl = new URL(request.url);
    const origin = new URL(request.headers.get('origin') || '');
    const sameOrigin = origin.origin === requestUrl.origin;
    const isPublicStorefront = META_EVENT_ALLOWED_HOSTS.has(
      requestUrl.hostname.toLowerCase(),
    );
    const isLocalDevelopment = ['localhost', '127.0.0.1'].includes(
      requestUrl.hostname.toLowerCase(),
    );
    return sameOrigin && (isPublicStorefront || isLocalDevelopment);
  } catch {
    return false;
  }
}

