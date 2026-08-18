/**
 * Server-side Meta Conversions API (CAPI) relay.
 *
 * Browser-side `fbq('track', eventName, payload, {eventID})` calls post a
 * deduplicated copy of every event to this endpoint. The endpoint forwards
 * the event to Meta's CAPI with the visitor's IP, user-agent, and the
 * Meta `_fbp`/`_fbc` cookies for proper attribution and Event Match Quality.
 *
 * Deduplication: Meta dedupes browser + server events that share the same
 * `event_id`. We require the browser to send `event_id` so we can pass it
 * straight through.
 *
 * Failure mode: any error here MUST NOT propagate to the user. We return
 * 204 in most cases and log. The browser pixel still fires regardless.
 *
 * Setup:
 *   1. In Meta Events Manager → your Pixel → Settings → Generate Access
 *      Token. Copy it.
 *   2. Set Oxygen env var `META_CAPI_ACCESS_TOKEN=<token>` (server-only,
 *      no PUBLIC_ prefix). NEVER expose to the browser.
 *   3. Optional: set `META_CAPI_TEST_EVENT_CODE` to a code from the Test
 *      Events tab to verify before going live.
 *
 * @param {Route.ActionArgs}
 */

import {
  isAllowedMetaEventSourceUrl,
  isAllowedMetaRequestOrigin,
} from '../lib/meta-capi.js';

const META_CAPI_URL = 'https://graph.facebook.com/v20.0';

// Events we relay. Anything else returns 204 without relaying.
const ALLOWED_EVENTS = new Set([
  'PageView',
  'ViewContent',
  'AddToCart',
  'InitiateCheckout',
  'Purchase',
  'Search',
  'AddToWishlist',
  'CompleteRegistration',
  'Contact',
  'Lead',
]);

// Cap payload size at 16 KB to prevent abuse — a real Meta event is < 2 KB.
const MAX_BODY_BYTES = 16 * 1024;

/** Pull Meta cookies (`_fbp`, `_fbc`) from the Cookie header. */
function parseMetaCookies(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const out = {};
  for (const part of cookieHeader.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    const k = part.slice(0, eq).trim();
    const v = part.slice(eq + 1).trim();
    if (k === '_fbp' || k === '_fbc') {
      try {
        out[k] = decodeURIComponent(v);
      } catch {
        // A malformed optional attribution cookie must not crash the relay.
      }
    }
  }
  return out;
}

/** @param {Route.ActionArgs} */
export async function action({request, context}) {
  const env = context?.env || {};
  const token = env.META_CAPI_ACCESS_TOKEN;
  const pixelId =
    env.PUBLIC_FACEBOOK_PIXEL_ID || env.META_CAPI_PIXEL_ID || null;

  // No-op if CAPI not configured. Don't error — the browser pixel still works.
  if (!token || !pixelId) {
    return new Response(null, {status: 204});
  }

  if (request.method !== 'POST') {
    return new Response(null, {status: 405, headers: {Allow: 'POST'}});
  }

  if (!isAllowedMetaRequestOrigin(request)) {
    return new Response(null, {status: 403});
  }

  // Cap request size — guard against flooding.
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength && contentLength > MAX_BODY_BYTES) {
    return new Response(null, {status: 413});
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(null, {status: 400});
  }

  // Validate shape. Reject anything that doesn't look like a Meta event.
  const eventName = String(body?.event_name || '').trim();
  const eventId = String(body?.event_id || '').trim();
  const eventSourceUrl = String(body?.event_source_url || '').trim();
  if (!eventName || !ALLOWED_EVENTS.has(eventName) || !eventId) {
    return new Response(null, {status: 204});
  }
  // event_id must be UUID-ish or hex-ish — Meta requires it to be unique
  // and not contain PII. Cap at 64 chars to avoid abuse.
  if (eventId.length > 64 || !/^[A-Za-z0-9_\-:.]+$/.test(eventId)) {
    return new Response(null, {status: 400});
  }
  // event_source_url must be our own domain
  if (!isAllowedMetaEventSourceUrl(eventSourceUrl)) {
    return new Response(null, {status: 400});
  }

  const payload = body?.payload && typeof body.payload === 'object' ? body.payload : {};

  // Build Meta CAPI event
  const cookies = parseMetaCookies(request);
  const clientIp =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '';
  const clientUa = request.headers.get('user-agent') || '';

  const userData = {
    client_ip_address: clientIp || undefined,
    client_user_agent: clientUa || undefined,
    // Meta's click/browser identifiers are identifiers, not PII fields. Send
    // their documented cookie values verbatim; hashing them prevents Meta from
    // matching the event back to the browser session.
    fbp: cookies._fbp || undefined,
    fbc: cookies._fbc || undefined,
  };

  // Strip undefined fields to keep payload small
  for (const k of Object.keys(userData)) {
    if (userData[k] === undefined) delete userData[k];
  }

  const customData = {
    content_type: payload.content_type,
    content_ids: Array.isArray(payload.content_ids)
      ? payload.content_ids.slice(0, 20)
      : undefined,
    content_name: payload.content_name
      ? String(payload.content_name).slice(0, 200)
      : undefined,
    content_category: payload.content_category,
    value: typeof payload.value === 'number' ? payload.value : undefined,
    currency: payload.currency
      ? String(payload.currency).slice(0, 8)
      : undefined,
    num_items:
      typeof payload.num_items === 'number' ? payload.num_items : undefined,
    contents: Array.isArray(payload.contents)
      ? payload.contents.slice(0, 20)
      : undefined,
  };
  for (const k of Object.keys(customData)) {
    if (customData[k] === undefined) delete customData[k];
  }

  const capiEvent = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    event_source_url: eventSourceUrl || undefined,
    action_source: 'website',
    user_data: userData,
    // Meta requires commerce fields under custom_data, not at event root.
    custom_data: Object.keys(customData).length ? customData : undefined,
  };
  for (const k of Object.keys(capiEvent)) {
    if (capiEvent[k] === undefined) delete capiEvent[k];
  }

  const capiBody = {
    data: [capiEvent],
    access_token: token,
  };
  if (env.META_CAPI_TEST_EVENT_CODE) {
    capiBody.test_event_code = env.META_CAPI_TEST_EVENT_CODE;
  }

  // Forward to Meta CAPI. Wrap in a timeout so a hung Meta doesn't block our worker.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  let metaResponse;
  try {
    metaResponse = await fetch(`${META_CAPI_URL}/${pixelId}/events`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(capiBody),
      signal: controller.signal,
    });
  } catch (e) {
    // Network error / timeout — log and return 204 to the browser.
    if (context?.env?.DEBUG_META) {
      console.warn('[meta-capi] forward failed', e?.message);
    }
    return new Response(null, {status: 204});
  } finally {
    clearTimeout(timer);
  }

  if (!metaResponse.ok) {
    if (context?.env?.DEBUG_META) {
      const txt = await metaResponse.text().catch(() => '');
      console.warn('[meta-capi] non-ok response', metaResponse.status, txt.slice(0, 500));
    }
    // Meta accepted the request even on 4xx dedup-mismatch, so don't retry.
    return new Response(null, {status: 204});
  }

  return new Response(null, {status: 204});
}

/** GET is a no-op so accidental pings don't 500. */
export async function loader() {
  return new Response(null, {status: 204});
}
