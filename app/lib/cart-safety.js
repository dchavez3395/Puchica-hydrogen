import {isApprovedVariantSku, isLaunchReadyProduct} from './launch-catalog.js';
import {
  cartBuyerCountryNeedsSync,
  cartBuyerCountrySyncFailed,
  resolveCartBuyerCountry,
} from './cart-market.js';

const MAX_CART_LINES = 20;
const MAX_LINE_QUANTITY = 99;
const VARIANT_GID_PREFIX = 'gid://shopify/ProductVariant/';
const CART_GID_PREFIX = 'gid://shopify/Cart/';

/**
 * A cart cookie can outlive the Storefront API cart it points to. Shopify then
 * returns an error-shaped result without a cart id. Treat that as recoverable
 * stale state so the next approved add can create a fresh cart.
 */
export function isUsableCart(cart) {
  return typeof cart?.id === 'string' && cart.id.startsWith(CART_GID_PREFIX);
}

/**
 * Shopify can occasionally return an apparently valid, empty cart for an
 * expired cart cookie and then reject the next cartLinesAdd mutation. Recover
 * only when the shopper had no real cart contents to preserve and the add
 * response proves that no requested merchandise landed. A genuine non-empty
 * cart is never replaced by this fallback.
 */
export function shouldRecreateEmptyCartAfterFailedAdd(
  existingCart,
  mutationResult,
  requestedLines,
) {
  const existingNodes = existingCart?.lines?.nodes;
  const existingIsEmpty =
    existingCart?.totalQuantity === 0 ||
    (Array.isArray(existingNodes) &&
      existingNodes.every((line) => Number(line?.quantity || 0) <= 0));

  if (!existingIsEmpty) return false;

  const requestedIds = new Set(
    (Array.isArray(requestedLines) ? requestedLines : [])
      .map((line) => line?.merchandiseId)
      .filter(Boolean),
  );
  if (requestedIds.size === 0) return false;

  const resultCart = mutationResult?.cart;
  const resultNodes = resultCart?.lines?.nodes;
  if (Array.isArray(resultNodes)) {
    const requestedLineLanded = resultNodes.some(
      (line) =>
        requestedIds.has(line?.merchandise?.id) &&
        Number(line?.quantity || 0) > 0,
    );
    return !requestedLineLanded;
  }

  if (Number(resultCart?.totalQuantity || 0) > 0) return false;

  return (
    !isUsableCart(resultCart) ||
    (Array.isArray(mutationResult?.errors) &&
      mutationResult.errors.length > 0) ||
    resultCart?.totalQuantity === 0
  );
}

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

export async function assertLaunchReadyLines(
  storefront,
  lines,
  market = storefront.i18n?.country,
) {
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
        !isApprovedVariantSku(variant.sku, market) ||
        !isLaunchReadyProduct(variant.product, market),
    )
  ) {
    throw new Response('This item is not currently available for purchase.', {
      status: 409,
    });
  }

  return normalized;
}

/**
 * Identify existing cart lines that are not approved in the active market.
 * This closes the stale-cart gap that add-only validation cannot cover when a
 * shopper changes markets after adding a market-specific SKU.
 */
export async function rejectedCartLineIds(
  storefront,
  cart,
  market = storefront.i18n?.country,
) {
  const lines = Array.isArray(cart?.lines?.nodes) ? cart.lines.nodes : [];
  const inspectable = lines.filter(
    (line) => typeof line?.id === 'string' && line?.merchandise?.id,
  );
  if (inspectable.length === 0) return [];

  const {nodes} = await storefront.query(CART_VARIANTS_QUERY, {
    variables: {
      ids: inspectable.map((line) => line.merchandise.id),
    },
    cache: storefront.CacheNone(),
  });
  const byId = new Map(
    (Array.isArray(nodes) ? nodes : [])
      .filter((variant) => variant?.id)
      .map((variant) => [variant.id, variant]),
  );

  return inspectable
    .filter((line) => {
      const variant = byId.get(line.merchandise.id);
      return (
        variant?.__typename !== 'ProductVariant' ||
        !variant.availableForSale ||
        !isApprovedVariantSku(variant.sku, market) ||
        !isLaunchReadyProduct(variant.product, market)
      );
    })
    .map((line) => line.id);
}

/**
 * Synchronize an existing cart to the active market and purge every line that
 * is not approved there before the cart or checkout URL is exposed.
 */
export async function getMarketSafeCart(cartApi, storefront, requestedCountry) {
  if (!cartApi.getCartId()) return null;

  const country =
    requestedCountry || (await resolveCartBuyerCountry(storefront));
  let current = await cartApi.get({numCartLines: 100});
  if (!current) return null;

  if (cartBuyerCountryNeedsSync(current, country)) {
    const syncResult = await cartApi.updateBuyerIdentity({
      countryCode: country,
    });
    current = syncResult?.errors?.length
      ? syncResult?.cart
      : await cartApi.get({numCartLines: 100});
    if (cartBuyerCountrySyncFailed({...syncResult, cart: current}, country)) {
      throw new Response('Cart market could not be verified.', {status: 409});
    }
  }

  const rejectedIds = await rejectedCartLineIds(storefront, current, country);
  if (rejectedIds.length > 0) {
    const removal = await cartApi.removeLines(rejectedIds);
    if (removal?.errors?.length) {
      throw new Response('Cart could not be made safe for this market.', {
        status: 409,
      });
    }
    current = await cartApi.get({numCartLines: 100});
  }

  return current;
}

const CART_VARIANTS_QUERY = `#graphql
  query CartLaunchVariants($ids: [ID!]!) {
    nodes(ids: $ids) {
      __typename
      ... on ProductVariant {
        id
        sku
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
