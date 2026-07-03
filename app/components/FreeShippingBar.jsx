import {useT} from '~/lib/t';

/**
 * Read the free-shipping threshold from Vite's env at build time. The
 * value is a plain number in the store's currency units (not cents),
 * and falls back to 75 if missing or invalid. The `PUBLIC_` prefix
 * keeps it consistent with the rest of the storefront's env vars
 * (PUBLIC_STORE_DOMAIN, PUBLIC_FACEBOOK_PIXEL_ID, …) and is what
 * Vite inlines for client-side code.
 */
function readThreshold() {
  const raw = import.meta.env?.PUBLIC_FREE_SHIPPING_THRESHOLD;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 75;
}

/**
 * Format a number in a given currency code using the same locale the
 * cart subtotal uses (`Money` from Hydrogen). `Intl.NumberFormat`
 * rounds half-to-even which can disagree with Shopify — for the
 * free-shipping remainder the rounding error is at most a cent and
 * is acceptable.
 */
function formatPrice(amount, currencyCode) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode || 'CAD',
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currencyCode || ''} ${amount.toFixed(2)}`;
  }
}

/**
 * Free-shipping progress bar shown at the top of the cart drawer.
 *
 * Behavior:
 *  - cart empty:  renders nothing (the rest of the cart already
 *    communicates the empty state with a clearer message)
 *  - subtotal < threshold: shows "Add ${remainder} for free shipping"
 *    with a fill bar at `pct`% of the threshold
 *  - subtotal >= threshold: shows "You've earned free shipping" with
 *    a full bar and a success state
 *
 * Accessibility:
 *  - The container is `role="status"` with `aria-live="polite"` so
 *    screen readers announce when the threshold is crossed as the
 *    user adds items.
 *  - The bar itself is `role="progressbar"` with aria-valuenow /
 *    aria-valuemin / aria-valuemax.
 *
 * @param {{
 *   subtotalAmount?: { amount: string; currencyCode: string } | null;
 *   threshold?: number;
 *   cartHasItems?: boolean;
 * }} props
 */
export function FreeShippingBar({
  subtotalAmount,
  threshold = readThreshold(),
  cartHasItems = true,
}) {
  const t = useT();

  if (!cartHasItems) return null;

  const subtotal = Number(subtotalAmount?.amount || 0);
  const currencyCode = subtotalAmount?.currencyCode || 'CAD';
  const reached = subtotal >= threshold;
  const pct = Math.min(100, Math.round((subtotal / threshold) * 100));
  const remaining = Math.max(0, threshold - subtotal);

  return (
    <div
      className={
        'pk-freeship' + (reached ? ' pk-freeship--reached' : '')
      }
      role="status"
      aria-live="polite"
    >
      <div className="pk-freeship__copy">
        {reached ? (
          <span className="pk-freeship__label">
            {t('cart_freeship_progress_done')}
          </span>
        ) : (
          <span className="pk-freeship__label">
            {t('cart_freeship_progress_remaining', {
              amount: formatPrice(remaining, currencyCode),
            })}
          </span>
        )}
        <span className="pk-freeship__threshold">
          {t('cart_freeship_threshold_label', {
            threshold: formatPrice(threshold, currencyCode),
          })}
        </span>
      </div>
      <div
        className="pk-freeship__track"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={
          reached
            ? t('cart_freeship_progress_done')
            : t('cart_freeship_progress_remaining', {
                amount: formatPrice(remaining, currencyCode),
              })
        }
      >
        <span
          className="pk-freeship__fill"
          style={{width: `${pct}%`}}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
