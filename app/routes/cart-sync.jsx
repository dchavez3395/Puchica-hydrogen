import {CHECKOUT_URL_REWRITER} from '~/lib/checkout';

/**
 * Plain JSON cart endpoint for browser-side drawer refreshes.
 *
 * React Router's route-data responses can be streamed/encoded depending on
 * how the request is made. The cart drawer needs a simple no-cache source of
 * truth after an add-to-cart mutation, so this endpoint intentionally returns
 * native JSON.
 *
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  const cart = await context.cart.get();
  if (cart?.checkoutUrl) {
    cart.checkoutUrl = CHECKOUT_URL_REWRITER(cart.checkoutUrl);
  }

  return Response.json(cart ?? null, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

/** @typedef {import('./+types/cart-sync').Route} Route */
