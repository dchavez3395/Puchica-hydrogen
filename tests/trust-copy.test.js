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
    assert.match(dictionary.faq_returns_2_a, patterns.returnResponsibility);
  }
});

test('storefront copy avoids unsupported no-surprise-fee promises', () => {
  const copy = JSON.stringify(DICTIONARIES);
  assert.doesNotMatch(
    copy,
    /no surprise fees|frais surprises|sin sorpresas|sem surpresas/i,
  );
  assert.doesNotMatch(
    copy,
    /confirmed at checkout|confirmado(?:s|as)? (?:en|no) (?:el )?(?:checkout|pago)|confirmé(?:e|es|s)? au paiement/i,
  );
  assert.doesNotMatch(
    copy,
    /free shipping|livraison gratuite|envío gratis|frete grátis|24[- ]hour shipping|envío en 24 horas|envio em 24 horas/i,
  );
  assert.doesNotMatch(
    copy,
    /trusted supplier|fournisseur fiable|proveedor de confianza|fornecedor de confiança/i,
  );

  const shippingPatterns = {
    en: /Shipping options and charges are shown at checkout; delivery estimates appear when available\./,
    fr: /Les options et les frais de livraison sont affichés au paiement; les estimations.*lorsqu’elles sont disponibles\./,
    es: /Las opciones y los cargos de envío se muestran al finalizar la compra; las estimaciones.*cuando están disponibles\./,
    'pt-br':
      /As opções e cobranças de envio são exibidas no checkout; as estimativas.*quando disponíveis\./,
  };
  for (const [locale, pattern] of Object.entries(shippingPatterns)) {
    assert.match(JSON.stringify(DICTIONARIES[locale]), pattern);
  }
});

test('static storefront copy cannot impersonate verified customer reviews', async () => {
  const [reviewSection] = await Promise.all([
    readFile(
      new URL('../app/sections/reviews/reviews.jsx', import.meta.url),
      'utf8',
    ),
  ]);
  const copy = JSON.stringify(DICTIONARIES);

  assert.doesNotMatch(copy, /12[\s,.]*000\s+(buyers|acheteurs|compradores)/i);
  assert.doesNotMatch(copy, /Maya R\.|James P\.|Sophie L\./i);
  assert.doesNotMatch(
    copy,
    /real buyers|de vrais acheteurs|compradores reales|compradores reais/i,
  );
  assert.doesNotMatch(reviewSection, /5 out of 5|verified badge/i);
  assert.match(reviewSection, /Product-standard cards/);
});

test('Meta and GA4 use separate explicit ownership guards', async () => {
  const [metaComponent, ga4Component, root, envExample, launchCheck] = await Promise.all([
    readFile(
      new URL('../app/components/MetaPixel.jsx', import.meta.url),
      'utf8',
    ),
    readFile(
      new URL('../app/components/GoogleAnalytics4.jsx', import.meta.url),
      'utf8',
    ),
    readFile(new URL('../app/root.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../.env.example', import.meta.url), 'utf8'),
    readFile(
      new URL('../scripts/check-launch-readiness.mjs', import.meta.url),
      'utf8',
    ),
  ]);

  for (const source of [metaComponent, root, envExample]) {
    assert.match(source, /PUBLIC_FACEBOOK_PIXEL_ID/);
    assert.doesNotMatch(source, /PUBLIC_META_PIXEL_ID/);
  }

  assert.match(root, /PUBLIC_CUSTOM_META_ENABLED === 'true'/);
  assert.match(root, /PUBLIC_GA4_STOREFRONT_EVENTS_ENABLED === 'true'/);
  assert.match(envExample, /PUBLIC_CUSTOM_META_ENABLED="false"/);
  assert.match(envExample, /PUBLIC_GA4_STOREFRONT_EVENTS_ENABLED="false"/);
  assert.match(
    launchCheck,
    /requireDisabled\(\s*'PUBLIC_CUSTOM_META_ENABLED'/,
  );
  assert.match(
    launchCheck,
    /requireEnabled\(\s*'PUBLIC_GA4_STOREFRONT_EVENTS_ENABLED'/,
  );
  assert.match(ga4Component, /send_page_view: false/);
  assert.match(ga4Component, /subscribe\('product_viewed'/);
  assert.match(ga4Component, /subscribe\('product_added_to_cart'/);
  assert.doesNotMatch(ga4Component, /subscribe\('page_viewed'/);
  assert.doesNotMatch(ga4Component, /subscribe\('custom_checkout_started'/);
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

test('policy route bypasses stale policy caching and blocks raw Liquid privacy templates', async () => {
  const source = await readFile(
    new URL('../app/routes/policies.$handle.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /context\.storefront\.CacheNone\(\)/);
  assert.match(source, /containsTemplateCode\(policy\.body\)/);
  assert.match(source, /PRIVACY_POLICY_FALLBACK/);
  assert.match(source, /hello@puchica\.ca/);
  assert.match(source, /isPrivacyFallback/);
  assert.match(
    source,
    /noindex: usesEnglishPrivacyFallback && requestedLang !== 'en'/,
  );
  assert.match(
    source,
    /effectiveLang = usesEnglishPrivacyFallback \? 'en' : requestedLang/,
  );
  assert.match(
    source,
    /raw privacy-policy template blocked; static fallback served/,
  );
  assert.doesNotMatch(source, /console\.error\([^\n]*policy\.body/);
});

test('primitive translations remain valid attribute strings', async () => {
  const source = await readFile(new URL('../app/lib/t.js', import.meta.url), 'utf8');

  assert.match(source, /resolved\.every/);
  assert.match(source, /resolved\.join\(''\)/);
});

test('collection add-to-cart waits for a confirmed cart mutation', async () => {
  const source = await readFile(
    new URL('../app/components/ProductItem.jsx', import.meta.url),
    'utf8',
  );

  assert.doesNotMatch(source, /open\('cart'\)/);
  assert.doesNotMatch(source, /useAside/);
});

test('generic CMS pages do not nest main landmarks', async () => {
  const source = await readFile(
    new URL('../app/routes/pages.$handle.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /<article dangerouslySetInnerHTML/);
  assert.doesNotMatch(source, /<main dangerouslySetInnerHTML/);
});
