import {useEffect, useRef} from 'react';
import {useAnalytics} from '@shopify/hydrogen';
import {isBotClient} from '~/lib/bot-detection';
import {analyticsItemId} from '~/lib/analytics-items';

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
 * EVENTS: view_item and add_to_cart only. Shopify's native Google integration
 * owns checkout-side page_view, begin_checkout, and purchase events.
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
            price: unitPrice,
            quantity,
          },
        ],
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
