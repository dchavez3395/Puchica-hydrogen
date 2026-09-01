import test from 'node:test';
import assert from 'node:assert/strict';

import {evaluateOrderSignal} from '../scripts/check-first-order-signal.mjs';
import {
  APPROVED_CATALOG_OFFERS,
  ARCHIVED_CATALOG_OFFERS,
} from '../app/lib/launch-catalog.js';

const money = (amount, currencyCode = 'CAD') => ({
  presentmentMoney: {amount: String(amount), currencyCode},
});

function order(overrides = {}) {
  return {
    id: 'gid://shopify/Order/1',
    name: '#2001',
    createdAt: '2026-08-14T20:00:00Z',
    test: false,
    cancelledAt: null,
    displayFinancialStatus: 'PAID',
    displayFulfillmentStatus: 'UNFULFILLED',
    currencyCode: 'USD',
    presentmentCurrencyCode: 'USD',
    currentTotalPriceSet: money(44.99, 'USD'),
    shippingAddress: {countryCodeV2: 'US'},
    lineItems: {
      nodes: [
        {
          sku: '14:771#Black',
          title: 'Black Hanging Travel Toiletry Organizer',
          variantTitle: 'Black',
          quantity: 1,
          currentQuantity: 1,
          unfulfilledQuantity: 1,
          product: {handle: 'black-hanging-travel-toiletry-organizer'},
          variant: {id: 'gid://shopify/ProductVariant/50041043681530'},
        },
      ],
    },
    ...overrides,
  };
}

test('Shopify test orders are excluded from genuine demand', () => {
  const result = evaluateOrderSignal([order({test: true, name: '#1002'})]);

  assert.equal(result.status, 'WAITING');
  assert.deepEqual(result.ignored, [
    {name: '#1002', reason: 'Shopify test order'},
  ]);
});

test('an approved genuine order produces an action-required signal', () => {
  // The cohort is injected because the live catalogue is empty: this test is
  // about what happens when a line IS approved, and that logic has to stay
  // provably working while there is nothing to approve.
  const result = evaluateOrderSignal([order()], {offers: ARCHIVED_CATALOG_OFFERS});

  assert.equal(result.status, 'ACTION_REQUIRED');
  assert.equal(result.orders[0].lines[0].approvedForMarket, true);
  assert.deepEqual(result.failures, []);
});

test('an empty catalogue blocks every order line', () => {
  // Nothing is approved for sale, so nothing may be routed to a supplier. If
  // an order arrives anyway it must stop here and be escalated by hand, not
  // fulfilled against evidence that no longer describes a live product.
  assert.deepEqual(APPROVED_CATALOG_OFFERS, []);

  const result = evaluateOrderSignal([order()]);
  assert.equal(result.status, 'BLOCKED');
  assert.match(result.failures[0], /Unapproved order line/);
});

test('an unapproved SKU blocks supplier processing', () => {
  const badLine = {
    ...order().lineItems.nodes[0],
    sku: 'NOT-APPROVED',
  };
  const result = evaluateOrderSignal([order({lineItems: {nodes: [badLine]}})]);

  assert.equal(result.status, 'BLOCKED');
  assert.match(result.failures[0], /Unapproved order line/);
});

test('multiple simultaneous genuine orders fail the early-order control', () => {
  const result = evaluateOrderSignal([
    order(),
    order({id: 'gid://shopify/Order/2', name: '#2002'}),
  ]);

  assert.equal(result.status, 'BLOCKED');
  assert.equal(
    result.failures.some((failure) =>
      failure.includes('one active customer order'),
    ),
    true,
  );
});
