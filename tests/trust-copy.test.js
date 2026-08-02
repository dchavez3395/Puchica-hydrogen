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

test('Meta Pixel environment documentation matches runtime configuration', async () => {
  const [component, root, envExample] = await Promise.all([
    readFile(new URL('../app/components/MetaPixel.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/root.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../.env.example', import.meta.url), 'utf8'),
  ]);

  for (const source of [component, root, envExample]) {
    assert.match(source, /PUBLIC_FACEBOOK_PIXEL_ID/);
    assert.doesNotMatch(source, /PUBLIC_META_PIXEL_ID/);
  }
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
