import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DICTIONARIES} from '../app/lib/dictionaries.js';

const EXPECTED_COPY = {
  en: {
    markets: /Canada.*United States/,
    response: /two business days/i,
    returnHold: /Do not mail/i,
    returnResponsibility: /Return-shipping responsibility/i,
  },
  fr: {
    markets: /Canada.*États-Unis/,
    response: /deux jours ouvrables/i,
    returnHold: /N’expédiez rien/i,
    returnResponsibility: /responsabilité des frais/i,
  },
  es: {
    markets: /Canadá.*Estados Unidos/,
    response: /dos días hábiles/i,
    returnHold: /No envíes nada/i,
    returnResponsibility: /responsabilidad del envío/i,
  },
  'pt-br': {
    markets: /Canadá.*Estados Unidos/,
    response: /dois dias úteis/i,
    returnHold: /Não envie nada/i,
    returnResponsibility: /responsabilidade pelo frete/i,
  },
};

test('customer-facing support, market, and return guardrails exist in every locale', () => {
  for (const [locale, patterns] of Object.entries(EXPECTED_COPY)) {
    const dictionary = DICTIONARIES[locale];
    assert.ok(dictionary, `missing ${locale} dictionary`);
    assert.match(dictionary.faq_orders_2_a, patterns.markets);
    assert.match(dictionary.contact_cta_body, patterns.response);
    assert.match(dictionary.faq_returns_2_a, patterns.returnHold);
    assert.match(
      dictionary.faq_returns_2_a,
      patterns.returnResponsibility,
    );
  }
});

test('storefront copy avoids unsupported no-surprise-fee promises', () => {
  const copy = JSON.stringify(DICTIONARIES);
  assert.doesNotMatch(
    copy,
    /no surprise fees|frais surprises|sin sorpresas|sem surpresas/i,
  );
});

test('Meta and GA4 use separate explicit ownership guards', async () => {
  const [metaComponent, ga4Component, root, envExample] = await Promise.all([
    readFile(new URL('../app/components/MetaPixel.jsx', import.meta.url), 'utf8'),
    readFile(
      new URL('../app/components/GoogleAnalytics4.jsx', import.meta.url),
      'utf8',
    ),
    readFile(new URL('../app/root.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../.env.example', import.meta.url), 'utf8'),
  ]);

  for (const source of [metaComponent, root, envExample]) {
    assert.match(source, /PUBLIC_FACEBOOK_PIXEL_ID/);
    assert.doesNotMatch(source, /PUBLIC_META_PIXEL_ID/);
  }

  assert.match(root, /PUBLIC_CUSTOM_META_ENABLED === 'true'/);
  assert.match(root, /PUBLIC_GA4_STOREFRONT_EVENTS_ENABLED === 'true'/);
  assert.match(envExample, /PUBLIC_CUSTOM_META_ENABLED="false"/);
  assert.match(
    envExample,
    /PUBLIC_GA4_STOREFRONT_EVENTS_ENABLED="false"/,
  );
  assert.match(ga4Component, /send_page_view: false/);
  assert.match(ga4Component, /subscribe\('product_viewed'/);
  assert.match(ga4Component, /subscribe\('product_added_to_cart'/);
  assert.doesNotMatch(ga4Component, /subscribe\('page_viewed'/);
  assert.doesNotMatch(ga4Component, /subscribe\('custom_checkout_started'/);
});

test('Meta CAPI sends documented request identifiers without hashing them', async () => {
  const source = await readFile(
    new URL('../app/routes/api.meta-event.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /client_ip_address: clientIp/);
  assert.match(source, /client_user_agent: clientUa/);
  assert.match(source, /fbp: cookies\._fbp \|\| undefined/);
  assert.match(source, /fbc: cookies\._fbc \|\| undefined/);
  assert.doesNotMatch(source, /client_ip:/);
  assert.doesNotMatch(source, /sha256Hex\(cookies\._fb[pc]\)/);
});

test('refund policy route presents the fail-safe summary before Admin policy HTML', async () => {
  const source = await readFile(
    new URL('../app/routes/policies.$handle.jsx', import.meta.url),
    'utf8',
  );
  const summary = source.indexOf('refund_summary_title');
  const adminBody = source.indexOf('dangerouslySetInnerHTML');

  assert.ok(summary >= 0, 'refund summary is missing');
  assert.ok(adminBody > summary, 'Admin policy body must follow the summary');
  assert.match(source, /isRefundPolicy/);
});

test('terms policy corrects CAD-only wording before Admin policy HTML', async () => {
  const source = await readFile(
    new URL('../app/routes/policies.$handle.jsx', import.meta.url),
    'utf8',
  );
  const summary = source.indexOf('terms_currency_summary_title');
  const adminBody = source.indexOf('dangerouslySetInnerHTML');

  assert.ok(summary >= 0, 'terms currency summary is missing');
  assert.ok(adminBody > summary, 'Admin policy body must follow the summary');
  assert.match(source, /isTermsPolicy/);

  for (const [locale, dictionary] of Object.entries(DICTIONARIES)) {
    assert.match(
      dictionary.terms_currency_summary_body,
      /CAD.*USD/,
      `${locale} terms summary must name both market currencies`,
    );
  }
});

test('the review widget renders before the first review exists', async () => {
  const route = await readFile(
    new URL('../app/routes/products.$handle.jsx', import.meta.url),
    'utf8',
  );

  // Gating the widget on review count is a closed loop: no reviews means no
  // widget, no widget means no write-a-review form, so a first review can
  // never be collected. Judge.me ships its own empty state and form.
  assert.match(route, /\{reviews\?\.externalId \? \(\s*<JudgemeReviews/);
  assert.doesNotMatch(route, /\{reviews\?\.count > 0 \? \(\s*<JudgemeReviews/);

  // Stars and aggregateRating must stay gated on count. Empty stars and an
  // aggregateRating with reviewCount 0 are both misrepresentations, and the
  // latter is a structured-data violation.
  assert.match(route, /reviews && reviews\.count > 0 \? \(\s*<ReviewStars/);
  assert.match(route, /aggregateRating:\s*\n\s*reviews\?\.count > 0/);
});
