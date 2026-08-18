import {redirect} from 'react-router';
import {STOREFRONT_CONTAINMENT_ACTIVE} from '~/lib/launch-catalog';
import {safeInternalRedirect} from '~/lib/cart-safety';
import {localizePath} from '~/lib/i18n';

/**
 * Automatically applies a discount found on the url
 * If a cart exists it's updated with the discount, otherwise a cart is created with the discount already applied
 *
 * @example
 * Example path applying a discount and optional redirecting (defaults to the home page)
 * ```js
 * /discount/FREESHIPPING?redirect=/products
 *
 * ```
 * @param {Route.LoaderArgs}
 */
export async function loader({request, context, params}) {
  // Discount URLs can create a cart even when no cart exists. Keep this route
  // inert during containment so an old campaign link cannot reopen commerce.
  if (STOREFRONT_CONTAINMENT_ACTIVE) {
    return redirect('/', {
      headers: {'Cache-Control': 'no-store, max-age=0'},
    });
  }

  const {cart} = context;
  const {code} = params;

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const requestedRedirect =
    searchParams.get('redirect') || searchParams.get('return_to');
  const redirectParam = safeInternalRedirect(requestedRedirect) || '/';

  searchParams.delete('redirect');
  searchParams.delete('return_to');

  const redirectTarget = new URL(redirectParam, 'https://puchica.invalid');
  redirectTarget.pathname = localizePath(
    redirectTarget.pathname,
    params?.locale || 'en',
  );
  for (const [key, value] of searchParams) {
    redirectTarget.searchParams.append(key, value);
  }
  const redirectUrl = `${redirectTarget.pathname}${redirectTarget.search}${redirectTarget.hash}`;

  if (!code) {
    return redirect(redirectUrl);
  }

  const result = await cart.updateDiscountCodes([code]);
  const headers = cart.setCartId(result.cart.id);

  // Using set-cookie on a 303 redirect will not work if the domain origin have port number (:3000)
  // If there is no cart id and a new cart id is created in the progress, it will not be set in the cookie
  // on localhost:3000
  return redirect(redirectUrl, {
    status: 303,
    headers,
  });
}

/** @typedef {import('./+types/discount.$code').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
