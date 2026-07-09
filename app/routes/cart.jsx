import {useLoaderData, data} from 'react-router';
import {CartForm} from '@shopify/hydrogen';
import {CartMain} from '~/components/CartMain';
import {FreeShippingBar} from '~/components/FreeShippingBar';
import {puchicaMeta} from '~/lib/seo';
import {CHECKOUT_URL_REWRITER} from '~/lib/checkout';
import {useT} from '~/lib/t';

/**
 * @type {Route.MetaFunction}
 *
 * Cart is private to the shopper, never useful in search results.
 * noindex,follow lets Google still follow the links inside the cart
 * (e.g. product links) but tells it not to surface the cart page itself.
 */
export const meta = () => {
  return puchicaMeta({
    title: 'Cart – Puchica',
    description:
      'Your Puchica shopping cart. Free shipping across Canada, easy 30-day returns, secure checkout.',
    noindex: true,
    pathname: '/cart',
  });
};

/**
 * @type {HeadersFunction}
 */
export const headers = ({actionHeaders}) => actionHeaders;

/**
 * @param {Route.ActionArgs}
 */
export async function action({request, context}) {
  const {cart} = context;

  const formData = await request.formData();

  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = formDiscountCode ? [formDiscountCode] : [];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesAdd: {
      const formGiftCardCode = inputs.giftCardCode;

      const giftCardCodes = formGiftCardCode ? [formGiftCardCode] : [];

      result = await cart.addGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesRemove: {
      const appliedGiftCardIds = inputs.giftCardCodes;
      result = await cart.removeGiftCardCodes(appliedGiftCardIds);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors, warnings} = result;

  // The Storefront API returns a `/cart/c/{token}` checkoutUrl shaped for
  // the storefront host, which 404s against Hydrogen. Pass the result
  // through the rewriter so the "Continue to Checkout" button in
  // CartSummary gets a URL that actually serves the Shopify-hosted
  // checkout. This is the second of the two callers mentioned in
  // app/lib/checkout.js (the other is CartSummary, which also rewrites
  // the same field for the drawer view).
  if (cartResult && cartResult.checkoutUrl) {
    cartResult.checkoutUrl = CHECKOUT_URL_REWRITER(cartResult.checkoutUrl);
  }

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return data(
    {
      cart: cartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  const {cart} = context;
  return await cart.get();
}

export default function Cart() {
  const t = useT();
  /** @type {LoaderReturnData} */
  const cart = useLoaderData();

  // Derive subtotal + checkoutable state so the page-level free
  // shipping progress bar and trust signals can render alongside
  // <CartMain> without duplicating its internal logic.
  const visibleLines = (cart?.lines?.nodes ?? []).filter(
    (line) =>
      !('parentRelationship' in line && line.parentRelationship?.parent),
  );
  const hasCheckoutableItems = visibleLines.some(
    (line) => typeof line?.quantity === 'number' && line.quantity >= 1,
  );
  const subtotalAmount = cart?.cost?.subtotalAmount;

  return (
    <div className="cart pk-cart-page">
      <div className="pk-cart-page__inner">
        <header className="pk-cart-page__head">
          <span className="pk-cart-page__eyebrow">{t('cart_page_eyebrow')}</span>
          <h1 className="pk-cart-page__title">{t('cart_page_h')}</h1>
        </header>

        {hasCheckoutableItems && (
          <FreeShippingBar
            subtotalAmount={subtotalAmount}
            cartHasItems={hasCheckoutableItems}
          />
        )}

        <CartMain layout="page" cart={cart} />

        {hasCheckoutableItems && (
          <ul className="pk-cart-trust" aria-label={t('cart_trust_aria')}>
            <li className="pk-cart-trust__item">
              <span className="pk-cart-trust__icon" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-7l-2-3H5a2 2 0 0 0-2 2z" />
                </svg>
              </span>
              <span>{t('cart_trust_returns')}</span>
            </li>
            <li className="pk-cart-trust__item">
              <span className="pk-cart-trust__icon" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9h13l-3-3M21 15H8l3 3" />
                </svg>
              </span>
              <span>{t('cart_trust_shipping')}</span>
            </li>
            <li className="pk-cart-trust__item">
              <span className="pk-cart-trust__icon" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2 3 6v6c0 5 3.5 8 9 10 5.5-2 9-5 9-10V6z" />
                </svg>
              </span>
              <span>{t('cart_trust_secure')}</span>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}

/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
/** @typedef {import('./+types/cart').Route} Route */
/** @typedef {import('@shopify/hydrogen').CartQueryDataReturn} CartQueryDataReturn */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
/** @typedef {ReturnType<typeof useActionData<typeof action>>} ActionReturnData */
