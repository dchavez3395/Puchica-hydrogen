import {redirect} from 'react-router';
import {CHECKOUT_URL_REWRITER, buildCheckoutRewriteOptions} from '~/lib/checkout';
import {
  assertLaunchReadyLines,
  parseCartPermalinkLines,
} from '~/lib/cart-safety';

/**
 * Automatically creates a new cart based on the URL and redirects straight to checkout.
 * Expected URL structure:
 * ```js
 * /cart/<variant_id>:<quantity>
 *
 * ```
 *
 * More than one `<variant_id>:<quantity>` separated by a comma, can be supplied in the URL, for
 * carts with more than one product variant.
 *
 * @example
 * Example path creating a cart with two product variants, different quantities, and a discount code in the querystring:
 * ```js
 * /cart/41007289663544:1,41007289696312:2?discount=HYDROBOARD
 *
 * ```
 * @param {Route.LoaderArgs}
 */
export async function loader({request, context, params}) {
  const {cart, storefront} = context;
  const {lines} = params;
  if (!lines) return redirect('/cart');
  const parsedLines = parseCartPermalinkLines(lines);
  if (!parsedLines) {
    throw new Response('Invalid cart link.', {status: 400});
  }
  const linesMap = await assertLaunchReadyLines(storefront, parsedLines);

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  const discount = searchParams.get('discount');
  const discountArray = discount ? [discount] : [];

  // create a cart
  const result = await cart.create({
    lines: linesMap,
    discountCodes: discountArray,
  });

  const cartResult = result.cart;

  if (result.errors?.length || !cartResult) {
    throw new Response('Link may be expired. Try checking the URL.', {
      status: 410,
    });
  }

  // Update cart id in cookie
  const headers = cart.setCartId(cartResult.id);

  // redirect to checkout
  if (cartResult.checkoutUrl) {
    const checkoutUrl = CHECKOUT_URL_REWRITER(
      cartResult.checkoutUrl,
      buildCheckoutRewriteOptions(cartResult, storefront, context.env),
    );
    if (!checkoutUrl) {
      throw new Response('Checkout temporarily unavailable.', {status: 503});
    }
    return redirect(checkoutUrl, {headers});
  } else {
    throw new Error('No checkout URL found');
  }
}

export default function Component() {
  return null;
}

/** @typedef {import('./+types/cart.$lines').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
