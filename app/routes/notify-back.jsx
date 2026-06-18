/**
 * Back-in-stock notification endpoint.
 *
 * Accepts either `application/json` or form posts with `email`,
 * `variantId`, and `productHandle`. Returns `{ok: true}` on success.
 *
 * This is a placeholder. The real notification wiring — Klaviyo,
 * Shopify customer events, or a Hydrogen custom endpoint — is a
 * separate decision that needs a real email service before this
 * can be called done. For now, this unblocks the "notify me when
 * back" form on the PDP so shoppers get an honest success message
 * instead of a non-functional UI.
 *
 * Intentional gaps:
 *   - No email validation beyond `String.includes('@')`
 *   - No persistence — the request is logged and forgotten
 *   - No rate limiting
 *   - No deduplication
 *
 * @type {Route.ActionFunction}
 */
export async function action({request}) {
  let email = '';
  let variantId = '';
  let productHandle = '';

  const contentType = request.headers.get('content-type') || '';
  try {
    if (contentType.includes('application/json')) {
      const body = await request.json();
      email = String(body?.email || '');
      variantId = String(body?.variantId || '');
      productHandle = String(body?.productHandle || '');
    } else {
      const form = await request.formData();
      email = String(form.get('email') || '');
      variantId = String(form.get('variantId') || '');
      productHandle = String(form.get('productHandle') || '');
    }
  } catch {
    return Response.json(
      {ok: false, error: 'Invalid request body.'},
      {status: 400},
    );
  }

  if (!email || !email.includes('@')) {
    return Response.json(
      {ok: false, error: 'Please enter a valid email address.'},
      {status: 400},
    );
  }

  // The real implementation would hand this to Klaviyo / Shopify
  // customer events / a custom Hydrogen endpoint. Until then, log
  // through the dev-only logger so the merchant can see the request
  // landed during development.
  const {log} = await import('~/lib/logger');
  log('notify-back request (stub)', {email, variantId, productHandle});

  return Response.json({ok: true});
}

// No loader — a GET should not hit this route.
export async function loader() {
  return new Response('Not Found', {status: 404});
}
