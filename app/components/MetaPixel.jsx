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
 * SERVER-SIDE (CAPI) DEDUPLICATION: every `fbq('track', ...)` call below also
 * POSTs a copy of the event to `/api/meta-event`. The server endpoint forwards
 * to Meta's Conversions API with the same `event_id`, which Meta uses to dedupe
 * the browser and server events into one funnel entry per real user action.
 * This survives ad-blockers and iOS ITP for ~30% of visitors who would
 * otherwise be invisible to Meta's optimization.
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

    /**
     * Forward an event to Meta CAPI for dedupe-resilient server-side tracking.
     * Fire-and-forget: we never await or throw. The browser pixel still runs
     * regardless of the server outcome.
     */
    const forwardToCapi = (eventName, payload, eventId) => {
      if (typeof window === 'undefined') return;
      try {
        const body = JSON.stringify({
          event_name: eventName,
          event_id: eventId,
          event_source_url: window.location?.href || '',
          payload,
        });
        // Use sendBeacon where available — survives page navigations and
        // doesn't block the unload path. Fall back to fetch with keepalive.
        if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
          const blob = new Blob([body], {type: 'application/json'});
          const sent = navigator.sendBeacon('/api/meta-event', blob);
          if (sent) return;
        }
        if (typeof fetch === 'function') {
          fetch('/api/meta-event', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body,
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        /* never let CAPI relay break the page */
      }
    };

    const track = (event, payload = {}, opts = {}) => {
      if (!allowed()) return;
      const eventId = opts.eventID || cryptoEventId();
      try {
        const fbq = loadFbq(pixelId);
        if (typeof fbq !== 'function') return;
        fbq('track', event, payload, {eventID: eventId});
        // Mirror to CAPI so dedupe can match against the server event.
        forwardToCapi(event, payload, eventId);
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

/**
 * Generate a unique event ID. Meta requires:
 *   - unique per event
 *   - alphanumeric + a few separators
 *   - max 64 chars
 * We use `crypto.randomUUID()` where available, falling back to a manual
 * v4-style hex string.
 */
function cryptoEventId() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  // Fallback: 32 hex chars
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
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
