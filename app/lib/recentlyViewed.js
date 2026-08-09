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

import {isApprovedVariantSku} from './launch-catalog.js';

// v4 retires snapshots that were written before recently-viewed entries became
// exact-SKU and market aware. A stale localStorage card must not advertise a
// Canada-only or held product after the shopper switches markets.
const KEY = 'pk:recently-viewed:v4';
const MAX = 8;

export function recordRecentlyViewed(product) {
  if (typeof window === 'undefined' || !product?.handle) return;
  try {
    const entry = {
      handle: product.handle,
      title: product.title || product.handle,
      sku: product.sku || null,
      market: String(product.market || 'CA').toUpperCase(),
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
    const list = getRecentlyViewed(entry.market).filter(
      (p) => p.handle !== entry.handle,
    );
    list.unshift(entry);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    // localStorage blocked or full — recently-viewed is a nicety, not
    // a feature the page should ever break over.
  }
}

export function getRecentlyViewed(market = 'CA') {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return filterRecentlyViewedForMarket(raw, market);
  } catch {
    return [];
  }
}

export function filterRecentlyViewedForMarket(entries, market = 'CA') {
  if (!Array.isArray(entries)) return [];
  const country = String(market || 'CA').toUpperCase();
  return entries.filter(
    (entry) =>
      entry?.handle &&
      entry.market === country &&
      isApprovedVariantSku(entry.sku, country),
  );
}
