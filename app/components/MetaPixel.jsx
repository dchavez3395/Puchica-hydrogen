import {useEffect} from 'react';
import {useAnalytics} from '@shopify/hydrogen';

/**
 * MetaPixel — Facebook/Meta Pixel for the headless Hydrogen storefront.
 *
 * WHY THIS EXISTS: the Facebook & Instagram sales channel only installs a pixel
 * on Shopify-hosted pages (i.e. checkout). The custom Hydrogen storefront
 * (home, product, cart, browse) had NO pixel at all — verified 2026-07-01, zero
 * `fbevents.js` / `facebook.com/tr` requests. That means Meta had no top-of-
 * funnel signal to optimize ads on. This wires the storefront events into the
 * same pixel so ads can finally optimize toward add-to-cart and retarget.
 *
 * SETUP: add your Meta Pixel ID as the env var `PUBLIC_FACEBOOK_PIXEL_ID`
 * (Oxygen env vars + local .env). Get the ID from Meta Events Manager (it's the
 * same pixel the FB & Instagram channel uses for checkout). Until that env var
 * is set, this component renders null and does nothing — safe no-op.
 *
 * FUNNEL NOTE: Purchase fires on the Shopify checkout domain, not here — that's
 * covered by the FB & Instagram channel's checkout pixel. This component covers
 * PageView / ViewContent / AddToCart / InitiateCheckout (the storefront side).
 *
 * @param {{pixelId?: string | null}} props
 */
export function MetaPixel({pixelId}) {
  const {subscribe, register, canTrack} = useAnalytics();
  // register() tells Hydrogen's analytics to wait for this integration's
  // subscriptions before flushing buffered events; ready() releases it.
  // Guarded so a Hydrogen API mismatch can never crash the root layout.
  const {ready} = typeof register === 'function'
    ? register('Meta Pixel')
    : {ready: () => {}};

  useEffect(() => {
    if (!pixelId || typeof window === 'undefined') {
      // Nothing to do — still call ready() so we don't block other analytics.
      ready();
      return;
    }

    loadFbq(pixelId);

    const allowed = () => {
      try {
        return typeof canTrack === 'function' ? canTrack() : true;
      } catch {
        return true;
      }
    };
    const track = (event, payload) => {
      if (!window.fbq || !allowed()) return;
      try {
        window.fbq('track', event, payload);
      } catch {
        /* never let analytics break the page */
      }
    };

    subscribe('page_viewed', () => track('PageView'));

    subscribe('product_viewed', (data) => {
      const p = data?.products?.[0];
      track('ViewContent', {
        content_type: 'product',
        content_ids: p?.id ? [p.id] : undefined,
        content_name: p?.title,
        value: Number(p?.price) || undefined,
        currency: data?.shop?.currency || p?.currency,
      });
    });

    subscribe('product_added_to_cart', (data) => {
      const line = data?.currentLine || data?.cart?.lines?.nodes?.[0];
      const merch = line?.merchandise;
      track('AddToCart', {
        content_type: 'product',
        content_ids: merch?.product?.id ? [merch.product.id] : undefined,
        content_name: merch?.product?.title,
        value: Number(merch?.price?.amount) || undefined,
        currency: merch?.price?.currencyCode,
      });
    });

    subscribe('cart_viewed', (data) => {
      track('InitiateCheckout', {
        value: Number(data?.cart?.cost?.totalAmount?.amount) || undefined,
        currency: data?.cart?.cost?.totalAmount?.currencyCode,
        num_items: data?.cart?.totalQuantity || undefined,
      });
    });

    ready();
  }, [pixelId, subscribe, register, canTrack, ready]);

  return null;
}

/** Standard Meta Pixel base loader (idempotent). */
function loadFbq(pixelId) {
  if (window.fbq) return;
  const n = (window.fbq = function () {
    n.callMethod
      ? n.callMethod.apply(n, arguments)
      : n.queue.push(arguments);
  });
  if (!window._fbq) window._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = '2.0';
  n.queue = [];
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(s);
  window.fbq('init', pixelId);
}
