import {CartForm} from '@shopify/hydrogen';
import {useEffect, useState} from 'react';

/**
 * @param {{
 *   analytics?: unknown;
 *   children: React.ReactNode;
 *   disabled?: boolean;
 *   lines: Array<OptimisticCartLineInput>;
 *   onClick?: () => void;
 *   addedLabel?: string | null;
 * }}
 */
export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  // Label shown briefly after a successful add. Defaults to "Added ✓".
  // Set to null to disable the success state.
  addedLabel = 'Added ✓',
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher) => (
        <AddToCartSubmitButton
          analytics={analytics}
          disabled={disabled}
          onClick={onClick}
          addedLabel={addedLabel}
          fetcher={fetcher}
          // The merchandiseIds we just tried to add. Used by the
          // post-add check to confirm the server actually accepted
          // THIS add, not just any successful state of the cart.
          attemptedMerchandiseIds={lines.map((l) => l.merchandiseId)}
        >
          {children}
        </AddToCartSubmitButton>
      )}
    </CartForm>
  );
}

/**
 * The submit button + a tiny state machine that surfaces "adding…"
 * while the fetcher is in flight and "Added ✓" for ~1.4s after it
 * resolves. Extracted to its own component so the hooks (useState /
 * useEffect) are called at the top level — cleaner than declaring
 * them inside a render-prop callback.
 */
function AddToCartSubmitButton({
  analytics,
  children,
  disabled,
  onClick,
  addedLabel,
  fetcher,
  attemptedMerchandiseIds,
}) {
  const [showAdded, setShowAdded] = useState(false);
  const [showError, setShowError] = useState(false);
  const isSubmitting = fetcher.state !== 'idle';
  const isDisabled = disabled ?? isSubmitting;

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return;
    const result = checkAddAccepted(fetcher.data, attemptedMerchandiseIds);
    if (result.ok) {
      setShowAdded(true);
      setShowError(false);
      const t = setTimeout(() => setShowAdded(false), 1400);
      return () => clearTimeout(t);
    }
    // Keep the error visible longer — the user actually needs to read it.
    setShowError(true);
    setShowAdded(false);
    const t = setTimeout(() => setShowError(false), 3200);
    return () => clearTimeout(t);
  }, [fetcher.state, fetcher.data, attemptedMerchandiseIds]);

  const label = showError
    ? 'Out of stock'
    : showAdded
    ? addedLabel
    : isSubmitting
    ? 'Adding…'
    : children;

  return (
    <>
      <input name="analytics" type="hidden" value={JSON.stringify(analytics)} />
      <button
        type="submit"
        onClick={onClick}
        disabled={isDisabled}
        className={
          'pk-atc' +
          (isSubmitting ? ' pk-atc--loading' : '') +
          (showAdded ? ' pk-atc--added' : '') +
          (showError ? ' pk-atc--error' : '')
        }
        aria-live="polite"
      >
        {label}
      </button>
    </>
  );
}

/**
 * Did the cart action accept the merchandise we tried to add?
 *
 * The Storefront API may silently return a line at quantity 0 when
 * a variant isn't actually available in the buyer's region (regional
 * availability, inventory policy, etc.) — no userErrors, no warning,
 * just a 200 with a ghost line. The product page's optimistic
 * availableForSale check is the primary signal that the variant is
 * sellable, but it can lie (it runs in a different context than the
 * cart mutation does), so this is the safety net.
 *
 * IMPORTANT: we only look at the *just-added* line — never at the
 * cart as a whole. A cart can legitimately contain qty-0 ghost
 * lines from previous failed adds, and `data.warnings` on a
 * successful new add can mention those legacy lines, neither of
 * which means THIS add failed.
 *
 * @param {unknown} data
 * @param {string[]} attemptedMerchandiseIds
 * @returns {{ok: boolean}}
 */
function checkAddAccepted(data, attemptedMerchandiseIds) {
  const cart = data?.cart;
  const nodes = cart?.lines?.nodes;
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return {ok: false};
  }
  const attempted = new Set(attemptedMerchandiseIds.filter(Boolean));
  // Pass-through: callers that don't track merchandiseIds (e.g. a
  // future use) shouldn't false-positive the error path.
  if (attempted.size === 0) return {ok: true};
  for (const line of nodes) {
    const merchId = line?.merchandise?.id;
    if (merchId && attempted.has(merchId)) {
      const q = line?.quantity;
      if (typeof q === 'number' && q >= 1) return {ok: true};
    }
  }
  return {ok: false};
}

/** @typedef {import('react-router').FetcherWithComponents} FetcherWithComponents */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLineInput} OptimisticCartLineInput */
