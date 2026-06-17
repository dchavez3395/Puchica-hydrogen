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
 * Response shape (from app/routes/cart.jsx action): the cart object
 * returned by Hydrogen's `cart.addLines()` is SLIM — it carries
 * `id, totalQuantity, checkoutUrl` but not `lines`. The full cart
 * (with `lines`) is only available via the loader. So the check has
 * to work against the slim shape, with `lines` being a bonus
 * signal when it happens to be present.
 *
 * Signals we use, in order of trust:
 *   1. `errors` non-empty  → the mutation surfaced a CartUserError
 *                            (out of stock, invalid variant, etc.) → reject.
 *   2. `cart.lines` present with our merchandiseId at qty ≥ 1 → accept.
 *                            This is the qty-0 ghost-line guard.
 *   3. `cart.lines` present with our merchandiseId at qty 0 → reject.
 *                            Ghost line was created.
 *   4. `cart.lines` present, our merch NOT in it at all → reject.
 *                            We asked for X, the cart doesn't have X.
 *   5. `cart.lines` absent (slim response) and `cart.totalQuantity`
 *      is a positive number → accept. The mutation succeeded; we
 *      just don't have the line breakdown in this response.
 *   6. `cart.lines` absent and `cart.totalQuantity` is 0 → reject.
 *                            No cart content means the add didn't land.
 *
 * If `attemptedMerchandiseIds` is empty (caller didn't pass any),
 * we can't apply signals 2/3/4 and fall back to "any successful
 * cart response is an accept". This matches the previous behavior
 * for that pass-through case.
 *
 * @param {unknown} data
 * @param {string[]} attemptedMerchandiseIds
 * @returns {{ok: boolean}}
 */
function checkAddAccepted(data, attemptedMerchandiseIds) {
  const cart = data?.cart;
  const errors = data?.errors;
  // Any surfaced error is a real rejection.
  if (Array.isArray(errors) && errors.length > 0) {
    return {ok: false};
  }
  // No cart at all means we didn't get a usable response.
  if (!cart || typeof cart !== 'object') {
    return {ok: false};
  }
  const attempted = new Set(attemptedMerchandiseIds.filter(Boolean));
  // Pass-through: callers that don't track merchandiseIds (e.g. a
  // future use) shouldn't false-positive the error path. The
  // errors check above is the only signal we can use.
  if (attempted.size === 0) {
    return {ok: true};
  }
  const nodes = cart?.lines?.nodes;
  if (Array.isArray(nodes)) {
    // Full-cart response. Find our line and check its quantity.
    for (const line of nodes) {
      const merchId = line?.merchandise?.id;
      if (merchId && attempted.has(merchId)) {
        const q = line?.quantity;
        if (typeof q === 'number' && q >= 1) return {ok: true};
        // Found at qty 0 (or quantity missing) → ghost line, reject.
        return {ok: false};
      }
    }
    // Full cart returned but our merch isn't in it. The add did
    // not create a line — treat as a rejection.
    return {ok: false};
  }
  // Slim cart response (the common case from cartLinesAdd). Trust
  // totalQuantity: a successful add grows the cart from 0 to 1 (or
  // N to N+1), and a failed add leaves it unchanged. A 0 here means
  // the add did not land.
  const totalQty = cart?.totalQuantity;
  if (typeof totalQty === 'number' && totalQty > 0) {
    return {ok: true};
  }
  return {ok: false};
}

/** @typedef {import('react-router').FetcherWithComponents} FetcherWithComponents */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLineInput} OptimisticCartLineInput */
