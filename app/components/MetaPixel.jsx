import {useEffect, useRef} from 'react';
import {useAnalytics} from '@shopify/hydrogen';
import {isBotClient} from '~/lib/bot-detection';
import {analyticsItemId, cartAnalyticsItems} from '~/lib/analytics-items';

/**
 * MetaPixel — Facebook/Meta Pixel for the headless Hydrogen storefront.
 *
 * This integration sends consent-gated storefront events from Hydrogen. Use the
 * same Pixel ID as the Facebook & Instagram sales channel so storefront and
 * Shopify-hosted checkout events can be verified as one funnel.
 *
 * SETUP: add your Meta Pixel ID as the env var `PUBLIC_FACEBOOK_PIXEL_ID`
 * (Oxygen env vars + local .env). Get the ID from Meta Events Manager (it's the
 * same pixel the FB & Instagram channel uses for checkout). Until that env var
 * is set, this component renders null and does nothing — safe no-op.
 *
 * FUNNEL NOTE: this component covers PageView, ViewContent, AddToCart, and
 * InitiateCheckout. Purchase is expected from the Shopify-hosted checkout
 * integration, but must be verified in Meta Events Manager before ad spend.
 *
 * @param {{pixelId?: string | null}} props
 * @returns {null}
 */
export function MetaPixel({pixelId}) {
  const {subscribe, register, canTrack} = useAnalytics();
  // register() tells Hydrogen's analytics to wait for this integration's
  // subscriptions before flushing buffered events; ready() releases it.
  // Guarded so a Hydrogen API mismatch can never crash the root layout.
  const registration = useRef(null);
  const installed = useRef(false);
  if (!registration.current) {
    registration.current =
      typeof register === 'function'
        ? register('Meta Pixel')
        : {ready: () => {}};
  }
  const {ready} = registration.current;

  useEffect(() => {
    if (installed.current) return;
    installed.current = true;

    if (!pixelId || typeof window === 'undefined') {
      // Nothing to do — still call ready() so we don't block other analytics.
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
    const track = (event, payload = {}) => {
      if (!allowed()) return;
      try {
        const fbq = loadFbq(pixelId);
        if (typeof fbq !== 'function') return;
        fbq('track', event, payload);
      } catch {
        /* never let analytics break the page */
      }
    };

    subscribe('page_viewed', () => track('PageView'));

    subscribe('product_viewed', (data) => {
      const p = data?.products?.[0];
      const itemId = analyticsItemId(p);
      track('ViewContent', {
        content_type: 'product',
        content_ids: itemId ? [itemId] : undefined,
        content_name: p?.title,
        value: Number(p?.price) || undefined,
        currency: data?.shop?.currency || p?.currency,
      });
    });

    subscribe('product_added_to_cart', (data) => {
      const line = data?.currentLine || data?.cart?.lines?.nodes?.[0];
      const merch = line?.merchandise;
      const previousQuantity = Number(data?.prevLine?.quantity) || 0;
      const currentQuantity = Number(line?.quantity) || 1;
      const quantity = Math.max(1, currentQuantity - previousQuantity);
      const unitPrice = Number(merch?.price?.amount);
      track('AddToCart', {
        content_type: 'product',
        content_ids: merch?.id ? [merch.id] : undefined,
        content_name: merch?.product?.title,
        value: Number.isFinite(unitPrice) ? unitPrice * quantity : undefined,
        currency: merch?.price?.currencyCode,
        num_items: quantity,
      });
    });

    subscribe('custom_checkout_started', (data) => {
      const cart = readField(data, 'cart');
      const totalAmount = readField(readField(cart, 'cost'), 'totalAmount');
      const items = cartAnalyticsItems(cart);
      track('InitiateCheckout', {
        content_type: 'product',
        content_ids: items.length
          ? items.map((item) => item.item_id)
          : undefined,
        value: Number(readField(totalAmount, 'amount')) || undefined,
        currency: readField(totalAmount, 'currencyCode'),
        num_items: readField(cart, 'totalQuantity') || undefined,
      });
    });

    ready();
  }, [pixelId, subscribe, canTrack, ready]);

  return null;
}

/** Standard Meta Pixel base loader (idempotent). */
function loadFbq(pixelId) {
  const existingFbq = Reflect.get(window, 'fbq');
  if (typeof existingFbq === 'function') return existingFbq;
  function n() {
    const callMethod = Reflect.get(n, 'callMethod');
    const queue = Reflect.get(n, 'queue');
    if (typeof callMethod === 'function') {
      Reflect.apply(callMethod, n, arguments);
    } else {
      queue.push(arguments);
    }
  }
  Reflect.set(window, 'fbq', n);
  if (!Reflect.get(window, '_fbq')) Reflect.set(window, '_fbq', n);
  Reflect.set(n, 'push', n);
  Reflect.set(n, 'loaded', true);
  Reflect.set(n, 'version', '2.0');
  Reflect.set(n, 'queue', []);
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(s);
  Reflect.apply(n, null, ['init', pixelId]);
  return n;
}

function readField(value, key) {
  if (!value || typeof value !== 'object') return undefined;
  return Reflect.get(value, key);
}
