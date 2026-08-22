import {useRouteLoaderData} from 'react-router';
import {CurrencyMoney} from '~/components/CurrencyMoney';
import {freeShippingProgress} from '~/lib/free-shipping';
import {useT} from '~/lib/t';

/**
 * Tell the shopper how close the cart is to free shipping.
 *
 * The store has offered free shipping over CA$50 since launch and has never
 * said so anywhere in the shopping flow — the cart only ever said "shipping
 * options shown at checkout". This is the missing half of a rate that already
 * exists, not a new offer.
 *
 * Renders nothing at all when the market has no verified threshold, when the
 * subtotal is unreadable, or when the currency does not match the market's
 * own. Silence is always the safe output: an unshown promise costs a little
 * attach rate, a wrong one costs a chargeback.
 *
 * @param {{cost?: {subtotalAmount?: MoneyV2 | null} | null} | null} cart
 */
export function FreeShippingProgress({cart}) {
  const t = useT();
  const rootData = useRouteLoaderData('root');
  const market = rootData?.selectedLocale?.country;
  const subtotalAmount = cart?.cost?.subtotalAmount;

  const progress = freeShippingProgress(subtotalAmount?.amount, market);
  if (!progress) return null;

  // An empty cart should not be nagged about a threshold it has not started.
  if (Number(subtotalAmount?.amount) <= 0) return null;

  const currencyCode = subtotalAmount?.currencyCode;
  if (!currencyCode) return null;

  if (progress.qualified) {
    return (
      <p className="pk-freeship pk-freeship--qualified" role="status">
        <span className="pk-freeship__check" aria-hidden="true">
          ✓
        </span>
        {t('cart_freeship_qualified')}
      </p>
    );
  }

  const remaining = {
    amount: String(progress.remaining),
    currencyCode,
  };

  return (
    <div className="pk-freeship" role="status">
      <p className="pk-freeship__text">
        {t('cart_freeship_away', {
          amount: <CurrencyMoney key="amount" data={remaining} />,
        })}
      </p>
      <div
        className="pk-freeship__track"
        role="progressbar"
        aria-valuenow={progress.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t('cart_freeship_aria')}
      >
        <div
          className="pk-freeship__fill"
          style={{width: `${progress.percent}%`}}
        />
      </div>
    </div>
  );
}

/** @typedef {import('@shopify/hydrogen/storefront-api-types').MoneyV2} MoneyV2 */
