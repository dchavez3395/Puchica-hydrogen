import {CartForm, Money, useAnalytics} from '@shopify/hydrogen';
import {useEffect, useId, useRef, useState} from 'react';
import {useFetcher} from 'react-router';
import {CHECKOUT_URL_REWRITER} from '~/lib/checkout';
import {useT} from '~/lib/t';
import {OfferCallout} from '~/components/OfferCallout';

/**
 * @param {CartSummaryProps}
 */
export function CartSummary({cart, layout, hasCheckoutableItems = true}) {
  const t = useT();
  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';
  const summaryId = useId();
  const discountsHeadingId = useId();
  const discountCodeInputId = useId();
  const giftCardHeadingId = useId();
  const giftCardInputId = useId();

  return (
    <div aria-labelledby={summaryId} className={className}>
      <h4 id={summaryId}>{t('cart_summary_title')}</h4>
      <dl role="group" className="cart-subtotal">
        <dt>{t('cart_summary_subtotal')}</dt>
        <dd>
          {cart?.cost?.subtotalAmount?.amount ? (
            <Money data={cart?.cost?.subtotalAmount} />
          ) : (
            '-'
          )}
        </dd>
      </dl>
      {hasCheckoutableItems ? <OfferCallout style={{margin: '0 0 12px'}} /> : null}
      <CartCheckoutActions
        checkoutUrl={CHECKOUT_URL_REWRITER(cart?.checkoutUrl)}
        disabled={!hasCheckoutableItems}
        cart={cart}
      />
      <CartDiscounts
        discountCodes={cart?.discountCodes}
        discountsHeadingId={discountsHeadingId}
        discountCodeInputId={discountCodeInputId}
      />
      <CartGiftCard
        giftCardCodes={cart?.appliedGiftCards}
        giftCardHeadingId={giftCardHeadingId}
        giftCardInputId={giftCardInputId}
      />
    </div>
  );
}

/**
 * @param {{checkoutUrl?: string; disabled?: boolean; cart?: CartApiQueryFragment}}
 */
function CartCheckoutActions({checkoutUrl, disabled = false, cart}) {
  const t = useT();
  const {publish, shop, prevCart} = useAnalytics();
  if (!checkoutUrl) return null;

  return (
    <div className="cart-summary-checkout">
      <a
        href={checkoutUrl}
        target="_self"
        aria-disabled={disabled || undefined}
        className={disabled ? 'is-disabled' : undefined}
        onClick={(e) => {
          if (disabled) {
            e.preventDefault();
            return;
          }
          publish('checkout_started', {
            cart,
            prevCart,
            shop,
            url: window.location.href || '',
          });
        }}
      >
        {disabled
          ? t('cart_summary_empty_btn')
          : (
            <>
              {t('cart_summary_checkout_btn')} <span aria-hidden>&rarr;</span>
            </>
          )}
      </a>
    </div>
  );
}

/**
 * Surfaces the first non-fatal error from the cart action
 * (`/cart` action returns `{errors, warnings, cart}` from Hydrogen's
 * Cart helpers; the UI historically ignored `errors` entirely so
 * things like "promo code not valid" disappeared). Renders nothing
 * if there's nothing to show.
 */
function CartActionErrors({errors, fallback}) {
  const message = Array.isArray(errors)
    ? errors
        .map((error) =>
          typeof error === 'string' ? error : error?.message,
        )
        .filter(Boolean)[0]
    : null;
  if (!message && !fallback) return null;
  return (
    <p className="pk-cart-error" role="alert">
      {message || fallback}
    </p>
  );
}

/**
 * @param {{
 *   discountCodes?: CartApiQueryFragment['discountCodes'];
 *   discountsHeadingId: string;
 *   discountCodeInputId: string;
 * }}
 */
function CartDiscounts({
  discountCodes,
  discountsHeadingId,
  discountCodeInputId,
}) {
  const t = useT();
  const codes =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <section
      className="cart-summary-adjustment"
      aria-label={t('cart_summary_discounts_aria')}
    >
      {/* Have existing discount, display it with a remove option */}
      <dl hidden={!codes.length}>
        <div>
          <dt id={discountsHeadingId}>{t('cart_summary_discounts_h')}</dt>
          <UpdateDiscountForm discountCodes={[]}>
            <div
              className="cart-discount"
              role="group"
              aria-labelledby={discountsHeadingId}
            >
              <code>{codes?.join(', ')}</code>
              &nbsp;
              <button type="submit" aria-label={t('cart_summary_remove_discount')}>
                {t('cart_summary_remove')}
              </button>
            </div>
          </UpdateDiscountForm>
        </div>
      </dl>

      {/* Keep optional entry compact so subtotal and checkout remain primary. */}
      <details className="cart-summary-disclosure">
        <summary>{t('cart_summary_promo_label')}</summary>
        <UpdateDiscountForm discountCodes={codes}>
          {(fetcher) => {
            const hasInapplicableCode =
              fetcher.state === 'idle' &&
              fetcher.data?.cart?.discountCodes?.some(
                (discount) => !discount.applicable,
              );
            return (
              <>
                <div className="cart-summary-field">
                  <label htmlFor={discountCodeInputId}>
                    {t('cart_summary_promo_label')}
                  </label>
                  <div className="cart-summary-field__row">
                    <input
                      id={discountCodeInputId}
                      type="text"
                      name="discountCode"
                      placeholder={t('cart_summary_promo_placeholder')}
                    />
                    <button
                      type="submit"
                      aria-label={t('cart_summary_promo_apply_aria')}
                    >
                      {t('cart_summary_promo_apply')}
                    </button>
                  </div>
                </div>
                <CartActionErrors
                  errors={fetcher.data?.errors}
                  fallback={
                    hasInapplicableCode ? t('cart_summary_promo_invalid') : null
                  }
                />
              </>
            );
          }}
        </UpdateDiscountForm>
      </details>
    </section>
  );
}

/**
 * @param {{
 *   discountCodes?: string[];
 *   children: React.ReactNode;
 * }}
 */
function UpdateDiscountForm({discountCodes, children}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {(fetcher) =>
        typeof children === 'function' ? children(fetcher) : children
      }
    </CartForm>
  );
}

/**
 * @param {{
 *   giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
 *   giftCardHeadingId: string;
 *   giftCardInputId: string;
 * }}
 */
function CartGiftCard({giftCardCodes, giftCardHeadingId, giftCardInputId}) {
  const t = useT();
  const giftCardCodeInput = useRef(null);
  const removeButtonRefs = useRef(new Map());
  const previousCardIdsRef = useRef([]);
  const giftCardAddFetcher = useFetcher({key: 'gift-card-add'});
  const [removedCardIndex, setRemovedCardIndex] = useState(null);

  useEffect(() => {
    if (giftCardAddFetcher.data) {
      if (giftCardCodeInput.current !== null) {
        giftCardCodeInput.current.value = '';
      }
    }
  }, [giftCardAddFetcher.data]);

  useEffect(() => {
    const currentCardIds = giftCardCodes?.map((card) => card.id) || [];

    if (removedCardIndex !== null && giftCardCodes) {
      const focusTargetIndex = Math.min(
        removedCardIndex,
        giftCardCodes.length - 1,
      );
      const focusTargetCard = giftCardCodes[focusTargetIndex];
      const focusButton = focusTargetCard
        ? removeButtonRefs.current.get(focusTargetCard.id)
        : null;

      if (focusButton) {
        focusButton.focus();
      } else if (giftCardCodeInput.current) {
        giftCardCodeInput.current.focus();
      }

      setRemovedCardIndex(null);
    }

    previousCardIdsRef.current = currentCardIds;
  }, [giftCardCodes, removedCardIndex]);

  const handleRemoveClick = (cardId) => {
    const index = previousCardIdsRef.current.indexOf(cardId);
    if (index !== -1) {
      setRemovedCardIndex(index);
    }
  };

  return (
    <section
      className="cart-summary-adjustment"
      aria-label={t('cart_summary_gift_aria')}
    >
      {giftCardCodes && giftCardCodes.length > 0 && (
        <dl>
          <dt id={giftCardHeadingId}>{t('cart_summary_gift_h')}</dt>
          {giftCardCodes.map((giftCard) => (
            <dd key={giftCard.id} className="cart-discount">
              <RemoveGiftCardForm
                giftCardId={giftCard.id}
                lastCharacters={giftCard.lastCharacters}
                onRemoveClick={() => handleRemoveClick(giftCard.id)}
                buttonRef={(el) => {
                  if (el) {
                    removeButtonRefs.current.set(giftCard.id, el);
                  } else {
                    removeButtonRefs.current.delete(giftCard.id);
                  }
                }}
              >
                <code>***{giftCard.lastCharacters}</code>
                &nbsp;
                <Money data={giftCard.amountUsed} />
              </RemoveGiftCardForm>
            </dd>
          ))}
        </dl>
      )}

      <details className="cart-summary-disclosure">
        <summary>{t('cart_summary_gift_label')}</summary>
        <AddGiftCardForm fetcherKey="gift-card-add">
          <div className="cart-summary-field">
            <label htmlFor={giftCardInputId}>
              {t('cart_summary_gift_label')}
            </label>
            <div className="cart-summary-field__row">
              <input
                id={giftCardInputId}
                type="text"
                name="giftCardCode"
                placeholder={t('cart_summary_gift_placeholder')}
                ref={giftCardCodeInput}
              />
              <button
                type="submit"
                disabled={giftCardAddFetcher.state !== 'idle'}
                aria-label={t('cart_summary_gift_apply_aria')}
              >
                {t('cart_summary_gift_apply')}
              </button>
            </div>
          </div>
        </AddGiftCardForm>
      </details>
    </section>
  );
}

/**
 * @param {{
 *   fetcherKey?: string;
 *   children: React.ReactNode;
 * }}
 */
function AddGiftCardForm({fetcherKey, children}) {
  return (
    <CartForm
      fetcherKey={fetcherKey}
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesAdd}
    >
      {children}
    </CartForm>
  );
}

/**
 * @param {{
 *   giftCardId: string;
 *   lastCharacters: string;
 *   children: React.ReactNode;
 *   onRemoveClick?: () => void;
 *   buttonRef?: (el: HTMLButtonElement | null) => void;
 * }}
 */
function RemoveGiftCardForm({
  giftCardId,
  lastCharacters,
  children,
  onRemoveClick,
  buttonRef,
}) {
  const t = useT();
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesRemove}
      inputs={{
        giftCardCodes: [giftCardId],
      }}
    >
      {children}
      &nbsp;
      <button
        type="submit"
        aria-label={t('cart_summary_remove_gift_aria', {last: lastCharacters})}
        onClick={onRemoveClick}
        ref={buttonRef}
      >
        {t('cart_summary_remove')}
      </button>
    </CartForm>
  );
}

/**
 * @typedef {{
 *   cart: OptimisticCart<CartApiQueryFragment | null>;
 *   layout: CartLayout;
 *   hasCheckoutableItems?: boolean;
 * }} CartSummaryProps
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('~/components/CartMain').CartLayout} CartLayout */
/** @typedef {import('@shopify/hydrogen').OptimisticCart} OptimisticCart */
