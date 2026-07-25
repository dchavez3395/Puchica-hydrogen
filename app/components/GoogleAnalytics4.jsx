import {useEffect} from 'react';
import {useAnalytics} from '@shopify/hydrogen';
import {isBotClient} from '~/lib/bot-detection';

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
 * EVENTS: page_view, view_item, add_to_cart, begin_checkout
 * Purchase fires on the Shopify checkout domain via Shopify's native
 * GA4 integration — not here.
 *
 * @param {{measurementId?: string | null}} props
 */
export function GoogleAnalytics4({measurementId}) {
  const {subscribe, register, canTrack} = useAnalytics();
  const {ready} = typeof register === 'function'
    ? register('Google Analytics 4')
    : {ready: () => {}};

  useEffect(() => {
    if (!measurementId || typeof window === 'undefined') {
      ready();
      return;
    }

    // Block analytics for bots — prevents inflated metrics
    if (isBotClient()) {
      ready();
      return;
    }

    loadGtag(measurementId);

    const allowed = () => {
      try {
        return typeof canTrack === 'function' ? canTrack() : true;
      } catch {
        return true;
      }
    };

    const track = (event, params = {}) => {
      if (!window.gtag || !allowed()) return;
      try {
        window.gtag('event', event, params);
      } catch {
        /* never let analytics break the page */
      }
    };

    subscribe('page_viewed', () => {
      track('page_view', {
        page_location: window.location.href,
        page_title: document.title,
      });
    });

    subscribe('product_viewed', (data) => {
      const p = data?.products?.[0];
      if (!p) return;
      track('view_item', {
        currency: data?.shop?.currency || p?.currency || 'CAD',
        value: Number(p?.price) || 0,
        items: [{
          item_id: p?.id,
          item_name: p?.title,
          price: Number(p?.price) || 0,
          quantity: 1,
        }],
      });
    });

    subscribe('product_added_to_cart', (data) => {
      const line = data?.currentLine || data?.cart?.lines?.nodes?.[0];
      const merch = line?.merchandise;
      if (!merch) return;
      track('add_to_cart', {
        currency: merch?.price?.currencyCode || 'CAD',
        value: Number(merch?.price?.amount) || 0,
        items: [{
          item_id: merch?.product?.id,
          item_name: merch?.product?.title,
          price: Number(merch?.price?.amount) || 0,
          quantity: line?.quantity || 1,
        }],
      });
    });

    subscribe('cart_viewed', (data) => {
      track('begin_checkout', {
        currency: data?.cart?.cost?.totalAmount?.currencyCode || 'CAD',
        value: Number(data?.cart?.cost?.totalAmount?.amount) || 0,
        num_items: data?.cart?.totalQuantity || 0,
      });
    });

    ready();
  }, [measurementId, subscribe, register, canTrack, ready]);

  return null;
}

/**
 * Standard gtag.js loader (idempotent).
 */
function loadGtag(measurementId) {
  if (window.gtag) return;

  // Load the gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false, // We handle page_view manually via subscribe
  });
}