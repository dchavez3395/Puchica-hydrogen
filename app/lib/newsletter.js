import {isAllowedMetaRequestOrigin} from './meta-capi.js';

/**
 * Newsletter signup relay (logic; the route in app/routes/api.newsletter.jsx
 * only calls handleNewsletterSignup).
 *
 * WHY THIS EXISTS: puchica.ca is a Hydrogen storefront and deliberately loads
 * no Klaviyo onsite script (third-party JS on every page would undo the
 * 2026-09-18 Core Web Vitals work, and Klaviyo's popups are not ours to make
 * accessible). The footer form in NewsletterForm.jsx posts to the route; this
 * forwards the email to Klaviyo's Client Subscriptions API, which needs only
 * the public site key. The list is double opt-in, so Klaviyo sends the
 * confirmation and the live "Welcome Series (Email)" flow takes over once the
 * subscriber confirms (CASL express consent, recorded by Klaviyo).
 *
 * Nothing is stored here and no secret is involved: the company id is the
 * public key that would be visible in any onsite script, and the list id is
 * not sensitive. Both can be overridden by Oxygen env vars.
 */
export const KLAVIYO_CLIENT_URL = 'https://a.klaviyo.com/client/subscriptions/';
export const KLAVIYO_REVISION = '2025-07-15';
const DEFAULT_COMPANY_ID = 'Y8dKHZ';
const DEFAULT_LIST_ID = 'Ug4tyG';
const MAX_BODY_BYTES = 4 * 1024;

// Pragmatic email shape check — Klaviyo validates for real; this only keeps
// obvious junk from leaving the edge.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** @param {FormData} form */
export function readSignup(form) {
  const email = String(form.get('email') || '')
    .trim()
    .toLowerCase();
  const honeypot = String(form.get('website') || '').trim();
  const locale = String(form.get('locale') || 'en')
    .toLowerCase()
    .slice(0, 8);
  return {email, honeypot, locale};
}

/** Build the Klaviyo client-subscriptions payload for one email. */
export function buildSubscriptionPayload({email, locale, listId}) {
  return {
    data: {
      type: 'subscription',
      attributes: {
        custom_source: 'puchica.ca footer',
        profile: {
          data: {
            type: 'profile',
            attributes: {
              email,
              properties: {signup_locale: locale, signup_source: 'footer'},
              subscriptions: {
                email: {marketing: {consent: 'SUBSCRIBED'}},
              },
            },
          },
        },
      },
      relationships: {list: {data: {type: 'list', id: listId}}},
    },
  };
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

/**
 * @param {Request} request
 * @param {Record<string, string | undefined>} env
 * @param {typeof fetch} [fetchImpl]
 */
export async function handleNewsletterSignup(request, env = {}, fetchImpl) {
  const doFetch = fetchImpl || globalThis.fetch;
  if (request.method !== 'POST') {
    return new Response(null, {status: 405, headers: {Allow: 'POST'}});
  }
  if (!isAllowedMetaRequestOrigin(request)) {
    return json({ok: false, reason: 'origin'}, 403);
  }
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength && contentLength > MAX_BODY_BYTES) {
    return json({ok: false, reason: 'size'}, 413);
  }

  const {email, honeypot, locale} = readSignup(await request.formData());

  // Bots fill the hidden field; humans cannot see it. Pretend it worked so a
  // scraper learns nothing, and send nothing to Klaviyo.
  if (honeypot) return json({ok: true});
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return json({ok: false, reason: 'invalid'}, 422);
  }

  const companyId = env.PUBLIC_KLAVIYO_COMPANY_ID || DEFAULT_COMPANY_ID;
  const listId = env.KLAVIYO_NEWSLETTER_LIST_ID || DEFAULT_LIST_ID;

  try {
    const res = await doFetch(
      `${KLAVIYO_CLIENT_URL}?company_id=${encodeURIComponent(companyId)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          revision: KLAVIYO_REVISION,
        },
        body: JSON.stringify(buildSubscriptionPayload({email, locale, listId})),
      },
    );
    // Klaviyo answers 202 Accepted; anything else is a relay failure the
    // visitor should be told about rather than silently swallowed.
    if (res.status === 202) return json({ok: true});
    return json({ok: false, reason: 'upstream'}, 502);
  } catch {
    return json({ok: false, reason: 'network'}, 502);
  }
}
