import {useEffect, useRef} from 'react';
import {useAnalytics} from '@shopify/hydrogen';
import {isBotClient} from '~/lib/bot-detection';
import {analyticsItemId, cartAnalyticsItems} from '~/lib/analytics-items';

/**
 * GoogleAnalytics4 — GA4 tracking for the headless Hydrogen storefront.
 *
 * WHY: Shopify's native GA4 integration only fires on Shopify-hosted
 * checkout. The custom Hydrogen storefront (home, PDP, collection, cart)
 * had no GA4 events. This wires storefront-side events into GA4.
 *
 * SETUP: add your GA4 Measurement ID as PUBLIC_GA4_MEASUREMENT_ID in
 * Oxygen env vars + local .env. Until set, this component is a no-op.
 *
 * EVENT OWNERSHIP:
 *   - This component owns: page_view, view_item, view_item_list, view_cart,
 *     add_to_cart, remove_from_cart, search (all storefront-side).
 *   - Shopify's native Google channel owns: begin_checkout, add_payment_info,
 *     purchase (all checkout-side) — we deliberately do NOT fire these here
 *     so the funnel isn't double-counted.
 *
 * @param {{measurementId?: string | null}} props
 * @returns {null}
 */
export function GoogleAnalytics4({measurementId}) {
  const {subscribe, register, canTrack} = useAnalytics();
  const registration = useRef(null);
  const installed = useRef(false);
  if (!registration.current) {
    registration.current =
      typeof register === 'function'
        ? register('Google Analytics 4')
        : {ready: () => {}};
  }
  const {ready} = registration.current;

  useEffect(() => {
    if (installed.current) return;
    installed.current = true;

    if (!measurementId || typeof window === 'undefined') {
      ready();
      return;
    }

    // Block analytics for bots — prevents inflated metrics
    if (isBotClient()) {
      ready();
      return;
    }

    // Eagerly load gtag.js script so it appears in the network panel.
    // {send_page_view: false} suppresses the auto-config page_view so we
    // can emit it ourselves with page_location/page_title from Hydrogen.
    try {
      loadGtag(measurementId);
    } catch {
      /* never let analytics break the page */
    }

    const allowed = () => {
      try {
        return typeof canTrack === 'function' ? canTrack() : false;
      } catch {
        return false;
      }
    };

    const track = (event, params = {}) => {
      if (!allowed()) return;
      try {
        const gtag = loadGtag(measurementId);
        if (typeof gtag !== 'function') return;
        gtag('event', event, params);
      } catch {
        /* never let analytics break the page */
      }
    };

    // --- Page view ----------------------------------------------------------
    subscribe('page_viewed', (data) => {
      const url =
        data?.url ||
        (typeof window !== 'undefined' ? window.location?.href : undefined);
      const title = data?.page?.title;
      const params = {};
      if (url) params.page_location = url;
      if (title) params.page_title = title;
      track('page_view', params);
    });

    // --- View item (PDP) ----------------------------------------------------
    subscribe('product_viewed', (data) => {
      const p = data?.products?.[0];
      if (!p) return;
      const currency = data?.shop?.currency || p?.currency;
      const value = Number(p?.price);
      if (!currency || !Number.isFinite(value)) return;
      track('view_item', {
        currency,
        value,
        items: [
          {
            item_id: analyticsItemId(p),
            item_name: p?.title,
            price: value,
            quantity: 1,
          },
        ],
      });
    });

    // --- View item list (collection / landing page) -------------------------
    // Hydrogen emits collection_viewed with `{collection: {id, title, products}}`.
    subscribe('collection_viewed', (data) => {
      const collection = data?.collection || data?.page?.collection;
      const products = Array.isArray(data?.collection?.products)
        ? data.collection.products
        : Array.isArray(collection?.products)
        ? collection.products
        : [];
      if (!collection || products.length === 0) return;

      const currency =
        data?.shop?.currency ||
        products
          .map((p) => p?.priceRange?.minVariantPrice?.currencyCode)
          .find(Boolean);
      if (!currency) return;

      const items = products
        .map((p) => {
          const price = Number(
            p?.priceRange?.minVariantPrice?.amount ?? p?.price,
          );
          if (!Number.isFinite(price) || !p) return null;
          return {
            item_id: analyticsItemId(p),
            item_name: p?.title,
            price,
            index: undefined,
          };
        })
        .filter(Boolean);

      // GA4 view_item_list recommends capping at 10 items per report.
      if (items.length === 0) return;
      const trimmed = items.slice(0, 10);

      track('view_item_list', {
        item_list_id: collection.id,
        item_list_name: collection.title || collection.handle,
        currency,
        items: trimmed,
      });
    });

    // --- View cart (cart page) ---------------------------------------------
    subscribe('cart_viewed', (data) => {
      const cart = data?.cart;
      if (!cart) return;
      const items = cartAnalyticsItems(cart);
      if (items.length === 0) return;
      const total = Number(cart?.cost?.totalAmount?.amount);
      const currency = cart?.cost?.totalAmount?.currencyCode;
      if (!currency || !Number.isFinite(total)) return;
      track('view_cart', {
        currency,
        value: total,
        items,
      });
    });

    // --- Add to cart -------------------------------------------------------
    subscribe('product_added_to_cart', (data) => {
      const line = data?.currentLine || data?.cart?.lines?.nodes?.[0];
      const merch = line?.merchandise;
      if (!merch) return;
      const currency = merch?.price?.currencyCode;
      const unitPrice = Number(merch?.price?.amount);
      const previousQuantity = Number(data?.prevLine?.quantity) || 0;
      const currentQuantity = Number(line?.quantity) || 1;
      const quantity = Math.max(1, currentQuantity - previousQuantity);
      if (!currency || !Number.isFinite(unitPrice)) return;
      track('add_to_cart', {
        currency,
        value: unitPrice * quantity,
        items: [
          {
            item_id: merch?.id,
            item_name: merch?.product?.title,
            item_variant: merch?.title,
            price: unitPrice,
            quantity,
          },
        ],
      });
    });

    // --- Remove from cart --------------------------------------------------
    // Hydrogen emits {cart, prevCart} on every cart mutation; we only fire
    // remove_from_cart when the specific line quantity decreased.
    subscribe('product_removed_from_cart', (data) => {
      const cart = data?.cart;
      const line = data?.currentLine;
      if (!cart || !line) return;
      const merch = line?.merchandise;
      if (!merch) return;
      const currency = merch?.price?.currencyCode;
      const unitPrice = Number(merch?.price?.amount);
      const prevQty = Number(data?.prevLine?.quantity) || 0;
      const newQty = Number(line?.quantity) || 0;
      const quantity = Math.max(1, prevQty - newQty);
      if (!currency || !Number.isFinite(unitPrice) || quantity <= 0) return;
      track('remove_from_cart', {
        currency,
        value: unitPrice * quantity,
        items: [
          {
            item_id: merch?.id,
            item_name: merch?.product?.title,
            item_variant: merch?.title,
            price: unitPrice,
            quantity,
          },
        ],
      });
    });

    // --- Search (search results page) --------------------------------------
    subscribe('search_viewed', (data) => {
      // Hydrogen's <Analytics.SearchView data={...}> receives whatever the
      // publisher passes in `data`. Our search.jsx publishes
      // {searchTerm, searchResults: {total, items}}.
      const term = data?.searchTerm || data?.search?.query || '';
      const results = data?.searchResults;
      const total = Number(results?.total ?? results?.length ?? 0);
      track('search', {
        search_term: String(term).slice(0, 200),
        ...(Number.isFinite(total) && total >= 0
          ? {results_count: total}
          : {}),
      });
    });

    ready();
  }, [measurementId, subscribe, canTrack, ready]);

  return null;
}

/**
 * Standard gtag.js loader (idempotent).
 */
function loadGtag(measurementId) {
  const existingGtag = Reflect.get(window, 'gtag');
  if (typeof existingGtag === 'function') return existingGtag;

  // Load the gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize
  const dataLayer = Reflect.get(window, 'dataLayer') || [];
  Reflect.set(window, 'dataLayer', dataLayer);
  function gtag() {
    dataLayer.push(arguments);
  }
  Reflect.set(window, 'gtag', gtag);
  Reflect.apply(gtag, null, ['js', new Date()]);
  Reflect.apply(gtag, null, ['config', measurementId, {send_page_view: false}]);
  return gtag;
}
