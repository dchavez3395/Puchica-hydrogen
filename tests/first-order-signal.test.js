import test from 'node:test';
import assert from 'node:assert/strict';

import {evaluateOrderSignal} from '../scripts/check-first-order-signal.mjs';

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
    currencyCode: 'CAD',
    presentmentCurrencyCode: 'CAD',
    currentTotalPriceSet: money(29.99),
    shippingAddress: {countryCodeV2: 'CA'},
    lineItems: {
      nodes: [
        {
          sku: '14:193#Double Layers',
          title: 'Black Double-Layer Travel Cable Organizer Case',
          variantTitle: 'Double Layers',
          quantity: 1,
          currentQuantity: 1,
          unfulfilledQuantity: 1,
          product: {handle: 'travel-cable-organizer-case'},
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
  const result = evaluateOrderSignal([order()]);

  assert.equal(result.status, 'ACTION_REQUIRED');
  assert.equal(result.orders[0].lines[0].approvedForMarket, true);
  assert.deepEqual(result.failures, []);
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
