import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DICTIONARIES} from '../app/lib/dictionaries.js';
import {
  buildSubscriptionPayload,
  handleNewsletterSignup,
  readSignup,
} from '../app/lib/newsletter.js';

const ORIGIN = 'https://puchica.ca';

function post(fields, {origin = ORIGIN} = {}) {
  const form = new URLSearchParams(fields);
  return new Request(`${ORIGIN}/api/newsletter`, {
    method: 'POST',
    headers: {
      origin,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });
}

function withFetch(handler, fn) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({url: String(url), init});
    return handler(url, init);
  };
  return fn(calls, fetchImpl);
}
const action = ({request, context}, fetchImpl) =>
  handleNewsletterSignup(request, context?.env || {}, fetchImpl);

test('every locale carries the footer newsletter copy, with no discount promise', () => {
  const keys = [
    'newsletter_title',
    'newsletter_body',
    'newsletter_label',
    'newsletter_button',
    'newsletter_sending',
    'newsletter_consent',
    'newsletter_success',
    'newsletter_invalid',
    'newsletter_error',
  ];
  for (const [locale, dictionary] of Object.entries(DICTIONARIES)) {
    for (const key of keys) {
      assert.ok(dictionary[key], `${locale} is missing ${key}`);
    }
    // Store policy on 2026-09-18: no discounts while the store is set up.
    assert.doesNotMatch(
      dictionary.newsletter_body + dictionary.newsletter_consent,
      /\d+\s?%|discount|rabais|descuento|desconto/i,
    );
    // CASL: the consent line must name the sender and mention unsubscribe.
    assert.match(dictionary.newsletter_consent, /Puchica/);
  }
});

test('the signup form is first-party and accessible by construction', () => {
  const form = readFileSync('app/components/NewsletterForm.jsx', 'utf8');
  const footer = readFileSync('app/components/Footer.jsx', 'utf8');
  const root = readFileSync('app/root.jsx', 'utf8');
  const route = readFileSync('app/routes/api.newsletter.jsx', 'utf8');
  assert.match(route, /handleNewsletterSignup\(request/);
  assert.match(footer, /<NewsletterForm \/>/);
  assert.doesNotMatch(root, /klaviyo\.js|static\.klaviyo\.com/);
  assert.match(form, /<label className="wr-news__label" htmlFor=/);
  assert.match(form, /type="email"/);
  assert.match(form, /role="status"/);
  assert.match(form, /aria-live="polite"/);
  assert.match(form, /statusRef\.current\.focus\(\)/);
  assert.match(form, /name="website"[\s\S]*tabIndex=\{-1\}/);
  // The honeypot must be clipped in place, not parked off-screen: the
  // production reflow probe counts anything left of the viewport as overflow
  // (CI run 35425935794 failed 25 checks on left:-10000px).
  const css = readFileSync('app/styles/warm-room.css', 'utf8');
  const hp = css.match(/\.wr-news__hp \{([^}]*)\}/)?.[1] || '';
  assert.doesNotMatch(hp, /left:\s*-\d/);
  assert.match(hp, /clip(-path)?:/);
});

test('readSignup normalises the email and reads the honeypot', () => {
  const form = new FormData();
  form.set('email', '  Someone@Example.COM ');
  form.set('website', '');
  form.set('locale', 'FR');
  assert.deepEqual(readSignup(form), {
    email: 'someone@example.com',
    honeypot: '',
    locale: 'fr',
  });
});

test('the Klaviyo payload subscribes the email to the list with marketing consent', () => {
  const payload = buildSubscriptionPayload({
    email: 'a@b.ca',
    locale: 'en',
    listId: 'LIST1',
  });
  assert.equal(payload.data.type, 'subscription');
  assert.equal(payload.data.relationships.list.data.id, 'LIST1');
  const profile = payload.data.attributes.profile.data.attributes;
  assert.equal(profile.email, 'a@b.ca');
  assert.equal(profile.subscriptions.email.marketing.consent, 'SUBSCRIBED');
});

test('action: honeypot hits look successful but never reach Klaviyo', async () => {
  await withFetch(
    () => {
      throw new Error('must not be called');
    },
    async (calls, fetchImpl) => {
      const res = await action({
        request: post({email: 'bot@spam.example', website: 'http://x'}),
        context: {env: {}},
      }, fetchImpl);
      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), {ok: true});
      assert.equal(calls.length, 0);
    },
  );
});

test('action: an invalid email is refused without a relay', async () => {
  await withFetch(
    () => {
      throw new Error('must not be called');
    },
    async (calls, fetchImpl) => {
      const res = await action({
        request: post({email: 'not-an-email'}),
        context: {env: {}},
      }, fetchImpl);
      assert.equal(res.status, 422);
      assert.deepEqual(await res.json(), {ok: false, reason: 'invalid'});
      assert.equal(calls.length, 0);
    },
  );
});

test('action: a foreign origin is refused', async () => {
  const res = await action({
    request: post({email: 'a@b.ca'}, {origin: 'https://evil.example'}),
    context: {env: {}},
  });
  assert.equal(res.status, 403);
});

test('action: a valid email is relayed with the public key and list, 202 means ok', async () => {
  await withFetch(
    () => new Response(null, {status: 202}),
    async (calls, fetchImpl) => {
      const res = await action({
        request: post({email: 'a@b.ca', locale: 'fr'}),
        context: {env: {}},
      }, fetchImpl);
      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), {ok: true});
      assert.equal(calls.length, 1);
      assert.match(calls[0].url, /client\/subscriptions\/\?company_id=Y8dKHZ$/);
      assert.equal(calls[0].init.headers.revision, '2025-07-15');
      const body = JSON.parse(calls[0].init.body);
      assert.equal(body.data.relationships.list.data.id, 'Ug4tyG');
      assert.equal(
        body.data.attributes.profile.data.attributes.properties.signup_locale,
        'fr',
      );
    },
  );
});

test('action: an upstream failure is reported, not swallowed', async () => {
  await withFetch(
    () => new Response('nope', {status: 400}),
    async (_calls, fetchImpl) => {
      const res = await action({
        request: post({email: 'a@b.ca'}),
        context: {env: {}},
      }, fetchImpl);
      assert.equal(res.status, 502);
      assert.deepEqual(await res.json(), {ok: false, reason: 'upstream'});
    },
  );
});
