import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

import {APPROVED_CATALOG_OFFERS} from '../app/lib/launch-catalog.js';
import {adminGraphQL} from './shopify-oauth.mjs';

const scriptPath = fileURLToPath(import.meta.url);

const ORDER_SIGNAL_QUERY = `#graphql
  query FirstOrderSignal($query: String!) {
    orders(first: 25, sortKey: CREATED_AT, reverse: true, query: $query) {
      nodes {
        id
        name
        createdAt
        test
        cancelledAt
        displayFinancialStatus
        displayFulfillmentStatus
        currencyCode
        presentmentCurrencyCode
        currentTotalPriceSet {
          presentmentMoney { amount currencyCode }
        }
        totalRefundedSet {
          presentmentMoney { amount currencyCode }
        }
        shippingAddress { countryCodeV2 }
        lineItems(first: 50) {
          nodes {
            sku
            title
            variantTitle
            quantity
            currentQuantity
            unfulfilledQuantity
            product { handle }
            variant { id }
          }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const INACTIVE_FINANCIAL_STATUSES = new Set(['EXPIRED', 'REFUNDED', 'VOIDED']);

if (path.resolve(process.argv[1] || '') === scriptPath) {
  const result = await checkFirstOrderSignal();
  printResult(result);
  process.exitCode =
    result.status === 'BLOCKED'
      ? 1
      : result.status === 'ACTION_REQUIRED'
        ? 2
        : 0;
}

export async function checkFirstOrderSignal({
  now = new Date(),
  since = process.env.PUCHICA_ORDER_SIGNAL_SINCE,
} = {}) {
  const start = since || new Date(now.getTime() - 7 * 86400000).toISOString();
  const response = await adminGraphQL(ORDER_SIGNAL_QUERY, {
    query: `created_at:>=${start}`,
  });

  if (response.errors?.length) {
    throw new Error(
      `Order signal query failed: ${JSON.stringify(response.errors)}`,
    );
  }

  const connection = response.data?.orders;
  if (!connection)
    throw new Error('Order signal query returned no orders connection.');
  if (connection.pageInfo?.hasNextPage) {
    throw new Error(
      'More than 25 recent orders exist; add pagination before relying on this monitor.',
    );
  }

  return evaluateOrderSignal(connection.nodes || [], {since: start});
}

export function evaluateOrderSignal(orders = [], {since = null} = {}) {
  const ignored = [];
  const actionable = [];

  for (const order of orders) {
    const ignoreReason = ignoredOrderReason(order);
    if (ignoreReason) {
      ignored.push({name: order.name, reason: ignoreReason});
      continue;
    }
    actionable.push(auditOrder(order));
  }

  if (!actionable.length) {
    return {
      status: 'WAITING',
      since,
      message: 'No genuine actionable customer order detected.',
      ignored,
      orders: [],
    };
  }

  const failures = actionable.flatMap((order) => order.failures);
  if (actionable.length > 1) {
    failures.push(
      `Early-order control permits one active customer order at a time; ${actionable.length} need review.`,
    );
  }

  return {
    status: failures.length ? 'BLOCKED' : 'ACTION_REQUIRED',
    since,
    message: failures.length
      ? 'A genuine order exists, but its supplier workflow must remain paused.'
      : 'A genuine order exists and requires the controlled DSers pre-payment check.',
    ignored,
    orders: actionable,
    failures,
  };
}

function ignoredOrderReason(order) {
  if (order?.test) return 'Shopify test order';
  if (order?.cancelledAt) return 'cancelled order';
  if (INACTIVE_FINANCIAL_STATUSES.has(order?.displayFinancialStatus)) {
    return `${String(order.displayFinancialStatus).toLowerCase()} order`;
  }

  const currentTotal = moneyAmount(order?.currentTotalPriceSet);
  if (!(currentTotal > 0)) return 'zero-current-total order';
  return null;
}

function auditOrder(order) {
  const market = String(
    order?.shippingAddress?.countryCodeV2 || '',
  ).toUpperCase();
  const failures = [];
  const lines = (order?.lineItems?.nodes || [])
    .filter((line) => Number(line?.currentQuantity) > 0)
    .map((line) => auditLine(line, market, failures));

  if (!['CA', 'US'].includes(market)) {
    failures.push(
      `Order ${order.name} has unsupported or missing destination market ${market || '(missing)'}.`,
    );
  }
  if (!lines.length)
    failures.push(`Order ${order.name} has no active physical line item.`);

  return {
    id: order.id,
    name: order.name,
    createdAt: order.createdAt,
    financialStatus: order.displayFinancialStatus,
    fulfillmentStatus: order.displayFulfillmentStatus,
    market,
    total: moneyAmount(order.currentTotalPriceSet),
    currency:
      order.currentTotalPriceSet?.presentmentMoney?.currencyCode ||
      order.presentmentCurrencyCode ||
      order.currencyCode,
    lines,
    failures,
  };
}

function auditLine(line, market, failures) {
  const sku = String(line?.sku || '');
  const handle = String(line?.product?.handle || '');
  const offer = APPROVED_CATALOG_OFFERS.find(
    (candidate) => candidate.sku === sku && candidate.handle === handle,
  );

  if (!offer) {
    failures.push(
      `Unapproved order line: ${handle || '(missing handle)'} / ${sku || '(missing SKU)'}.`,
    );
  } else if (!offer.markets.includes(market)) {
    failures.push(
      `${handle} / ${sku} is not approved for market ${market || '(missing)'}.`,
    );
  }

  return {
    handle,
    sku,
    variantId: line?.variant?.id || null,
    title: line?.title || '',
    variantTitle: line?.variantTitle || '',
    quantity: Number(line?.currentQuantity) || 0,
    unfulfilledQuantity: Number(line?.unfulfilledQuantity) || 0,
    approvedForMarket: Boolean(offer?.markets.includes(market)),
  };
}

function moneyAmount(moneySet) {
  const amount = Number(moneySet?.presentmentMoney?.amount);
  return Number.isFinite(amount) ? amount : 0;
}

function printResult(result) {
  console.log('Puchica first-order signal');
  console.log('==========================');
  console.log(
    'Read-only: no order, payment, fulfillment, or supplier mutation.',
  );
  console.log(`Status: ${result.status}`);
  console.log(`Since: ${result.since}`);
  console.log(result.message);
  console.log(`Ignored historical/test orders: ${result.ignored.length}`);

  for (const order of result.orders) {
    console.log(
      `${order.name} | ${order.financialStatus} / ${order.fulfillmentStatus} | ${order.market} | ${order.currency} ${order.total.toFixed(2)}`,
    );
    for (const line of order.lines) {
      console.log(
        `  ${line.quantity} x ${line.handle} | ${line.sku} | approved=${line.approvedForMarket ? 'YES' : 'NO'}`,
      );
    }
  }

  for (const failure of result.failures || [])
    console.error(`FAIL: ${failure}`);
}
