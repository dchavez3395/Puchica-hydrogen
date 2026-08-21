import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getLocaleFromRequest,
  marketDisplayLabel,
  resolveStorefrontLocale,
} from '../app/lib/i18n.js';

test('North American market follows supported buyer geography', () => {
  const request = new Request('https://puchica.ca/', {
    headers: {'oxygen-buyer-country': 'US'},
  });

  assert.deepEqual(getLocaleFromRequest(request), {
    language: 'EN',
    country: 'US',
  });
});

test('explicit market cookie overrides geography while legacy locale cookies are ignored', () => {
  const request = new Request('https://puchica.ca/', {
    headers: {
      cookie: 'pk_market=CA; pk_locale=fr',
      'oxygen-buyer-country': 'US',
    },
  });

  assert.deepEqual(getLocaleFromRequest(request), {
    language: 'EN',
    country: 'CA',
  });
});

test('former translated URLs resolve Storefront data in English', () => {
  const request = new Request('https://puchica.ca/fr/products/example', {
    headers: {cookie: 'pk_locale=fr'},
  });

  assert.deepEqual(getLocaleFromRequest(request), {
    language: 'EN',
    country: 'CA',
  });
});

test('unsupported geography falls back to the Canadian home market', () => {
  const request = new Request('https://puchica.ca/', {
    headers: {'oxygen-buyer-country': 'MX'},
  });

  assert.deepEqual(getLocaleFromRequest(request), {
    language: 'EN',
    country: 'CA',
  });
});

test('Storefront fallback replaces a requested CA label with resolved US offer context', () => {
  const locale = resolveStorefrontLocale(
    {language: 'EN', country: 'CA'},
    {
      country: {isoCode: 'US', currency: {isoCode: 'USD'}},
      availableCountries: [
        {isoCode: 'US', currency: {isoCode: 'USD'}},
      ],
    },
  );

  assert.equal(locale.requestedCountry, 'CA');
  assert.equal(locale.country, 'US');
  assert.equal(locale.currency, 'USD');
  assert.equal(locale.marketFallback, true);
  assert.equal(marketDisplayLabel(locale), 'US · USD · EN');
});

test('currency labels come from Storefront API data, never the country configuration', () => {
  assert.equal(
    marketDisplayLabel({country: 'CA', currency: 'USD', language: 'EN'}),
    'CA · USD · EN',
  );
  assert.equal(
    marketDisplayLabel({country: 'CA', currency: 'CAD', language: 'FR'}),
    'CA · CAD · FR',
  );
});

test('available market currencies are retained from Shopify localization', () => {
  const locale = resolveStorefrontLocale(
    {language: 'EN', country: 'CA'},
    {
      country: {isoCode: 'CA', currency: {isoCode: 'CAD'}},
      availableCountries: [
        {isoCode: 'CA', currency: {isoCode: 'CAD'}},
        {isoCode: 'US', currency: {isoCode: 'USD'}},
        {isoCode: 'GB', currency: {isoCode: 'GBP'}},
      ],
    },
  );

  assert.deepEqual(locale.availableMarkets, [
    {country: 'CA', currency: 'CAD'},
    {country: 'US', currency: 'USD'},
  ]);
});
