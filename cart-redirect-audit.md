# Cart Redirect Audit (2026-06-29)

## Scope
Verify all routes that produce or expose `Cart.checkoutUrl` route
the URL through `CHECKOUT_URL_REWRITER` so the `@inContext` bug from
2026-06-28 stays fixed.

## Findings

### Call sites of `CHECKOUT_URL_REWRITER`

| Location | Line | What it rewrites |
| --- | --- | --- |
| `app/components/CartSummary.jsx` | 43 | `cart?.checkoutUrl` passed as prop to `CartCheckoutActions` for the "Continue to Checkout" button. |
| `app/routes/cart.jsx` | 103 | Inside the cart action, after addLines/updateLines/etc. — the response's `checkoutUrl` is rewritten before being returned to the client. |
| `app/routes/cart.$lines.jsx` | 63 | After `cart.create({lines, discountCodes})` — the freshly-created cart's `checkoutUrl` is rewritten before the 302 redirect. |
| `app/lib/checkout.js` | (definition) | The rewriter itself; module-level singleton. |

All four call sites are **good**. None leak the un-rewritten URL.

### Catchall for legacy permalinks: `app/routes/cart.$.jsx`

Catchall that catches `/cart/c/{token}` and 301-redirects to the
rewritten checkout URL. Token regex `[A-Za-z0-9_-]{4,256}` is strict;
URL is reconstructed on the storefront's primary host before going
through the rewriter (so the rewriter's `BAD_STOREFRONT_HOSTS` check
fires regardless of which Hydrogen host the request hit).

This route is the second line of defense. Even if a cached page or
an email automation leaks the un-rewritten URL, the catchall
catches it at the worker.

### `CHECKOUT_URL_REWRITER` integrity

`app/lib/checkout.js`:

- Reads `PUBLIC_CHECKOUT_DOMAIN` (default `puchica-2.myshopify.com`)
  and `PUBLIC_CHECKOUT_LOCALE` (default `en-ca`) from env at module
  load. Vite dev → `import.meta.env`, Oxygen → `process.env`.
- `BAD_STOREFRONT_HOSTS` set: `puchica.ca`, `www.puchica.ca`.
- For URLs on those hosts, extracts token via `^/cart/c/([^/]+)/?$`
  and rebuilds as `https://${CHECKOUT_DOMAIN}/checkouts/cn/${token}/${locale}`,
  preserving the query string.
- For URLs already on a non-bad host → returns input unchanged.
- For URLs on a bad host with an unrecognized path → logs a
  `warn(...)` (drift detection) and returns input unchanged.

No issues. The rewriter is conservative and observable.

## Conclusion

**Cart checkout URL handling is correct.** All 4 call sites use the
rewriter. The catchall covers any URL that leaks through. The rewriter
itself is robust and self-observing.

## Future follow-ups

- When `CHECKOUT_URL_REWRITER` is set to identity (per the
  `lib/checkout.js` docstring), `cart.$.jsx` can be removed.
  Trigger: Shopify admin Markets/Domains config is corrected so
  the Storefront API returns a working URL directly.
- When multi-locale ships, `CHECKOUT_LOCALE` should be derived from
  the cart's `@inContext` per-request rather than env. Currently
  fixed at `en-ca` because Puchica is single-locale.

## Not in scope

- The cart drawer/Aside component. The drawer uses the same
  `CartSummary` and `cart.jsx` action path, so it transitively uses
  the rewriter. No separate audit needed.
- The `/api/*` routes — none handle cart checkouts.
- The `tools/` Python scripts — none touch checkout URLs.