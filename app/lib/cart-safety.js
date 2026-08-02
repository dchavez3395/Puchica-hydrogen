import {LAUNCH_READY_TAG, OPERATIONAL_HOLD_HANDLES} from './launch-catalog.js';

const MAX_CART_LINES = 20;
const MAX_LINE_QUANTITY = 99;
const VARIANT_GID_PREFIX = 'gid://shopify/ProductVariant/';

export function safeInternalRedirect(value) {
  if (typeof value !== 'string' || !value.startsWith('/')) return null;
  if (value.startsWith('//') || /[\\\r\n]/.test(value)) return null;
  try {
    const parsed = new URL(value, 'https://puchica.invalid');
    return parsed.origin === 'https://puchica.invalid'
      ? `${parsed.pathname}${parsed.search}${parsed.hash}`
      : null;
  } catch {
    return null;
  }
}

export function parseCartPermalinkLines(value) {
  if (typeof value !== 'string' || !value) return null;
  const segments = value.split(',');
  if (segments.length > MAX_CART_LINES) return null;

  const lines = segments.map((segment) => {
    const match = segment.match(/^(\d+):(\d+)$/);
    if (!match) return null;
    const quantity = Number(match[2]);
    if (quantity < 1 || quantity > MAX_LINE_QUANTITY) return null;
    return {
      merchandiseId: `${VARIANT_GID_PREFIX}${match[1]}`,
      quantity,
    };
  });

  return lines.every(Boolean) ? lines : null;
}

export function normalizeCartLines(lines) {
  if (
    !Array.isArray(lines) ||
    lines.length < 1 ||
    lines.length > MAX_CART_LINES
  ) {
    return null;
  }
  const normalized = lines.map((line) => {
    const quantity = Number(line?.quantity);
    if (
      typeof line?.merchandiseId !== 'string' ||
      !line.merchandiseId.startsWith(VARIANT_GID_PREFIX) ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_LINE_QUANTITY
    ) {
      return null;
    }
    return {...line, quantity};
  });
  return normalized.every(Boolean) ? normalized : null;
}

export async function assertLaunchReadyLines(storefront, lines) {
  const normalized = normalizeCartLines(lines);
  if (!normalized) {
    throw new Response('Invalid cart item.', {status: 400});
  }

  const {nodes} = await storefront.query(CART_VARIANTS_QUERY, {
    variables: {ids: normalized.map(({merchandiseId}) => merchandiseId)},
    cache: storefront.CacheNone(),
  });

  if (
    !Array.isArray(nodes) ||
    nodes.length !== normalized.length ||
    nodes.some(
      (variant) =>
        variant?.__typename !== 'ProductVariant' ||
        !variant.availableForSale ||
        !variant.product?.availableForSale ||
        !variant.product?.tags?.includes(LAUNCH_READY_TAG) ||
        OPERATIONAL_HOLD_HANDLES.has(variant.product?.handle),
    )
  ) {
    throw new Response('This item is not currently available for purchase.', {
      status: 409,
    });
  }

  return normalized;
}

const CART_VARIANTS_QUERY = `#graphql
  query CartLaunchVariants($ids: [ID!]!) {
    nodes(ids: $ids) {
      __typename
      ... on ProductVariant {
        id
        availableForSale
        product {
          handle
          tags
          availableForSale
        }
      }
    }
  }
`;
