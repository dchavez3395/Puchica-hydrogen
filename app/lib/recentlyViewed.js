/**
 * Recently-viewed products, persisted in localStorage (audit Phase 3:
 * "Recently viewed (localStorage) on PDP + search"). The PDP records a
 * slim snapshot on view; the search sheet's zero-query state reads it
 * so a returning shopper can jump back to what they were considering.
 *
 * Snapshot shape (kept deliberately small — this is display data, not
 * a cache of the product):
 *   { handle, title, image: {url, altText, width, height} | null,
 *     price: {amount, currencyCode} | null, at: epoch-ms }
 */

// v3 retires every snapshot written before the versioned catalog approval
// gate. Client-side snapshots cannot prove current approval and must never
// reopen a quarantined PDP through the search drawer or recommendation rail.
const KEY = 'pk:recently-viewed:v3';
const MAX = 8;

export function recordRecentlyViewed(product) {
  if (typeof window === 'undefined' || !product?.handle) return;
  try {
    const entry = {
      handle: product.handle,
      title: product.title || product.handle,
      image: product.image
        ? {
            url: product.image.url,
            altText: product.image.altText || null,
            width: product.image.width || null,
            height: product.image.height || null,
          }
        : null,
      price: product.price
        ? {
            amount: product.price.amount,
            currencyCode: product.price.currencyCode,
          }
        : null,
      at: Date.now(),
    };
    const list = getRecentlyViewed().filter((p) => p.handle !== entry.handle);
    list.unshift(entry);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    // localStorage blocked or full — recently-viewed is a nicety, not
    // a feature the page should ever break over.
  }
}

export function getRecentlyViewed() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((p) => p && p.handle) : [];
  } catch {
    return [];
  }
}
