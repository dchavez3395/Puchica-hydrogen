/**
 * Back-in-stock notification endpoint.
 *
 * Kept unavailable until the Klaviyo flow persists a subscription and can
 * actually send it. The storefront intentionally renders no form pointing
 * here in the meantime.
 *
 * @type {Route.ActionFunction}
 */
export async function action({request}) {
  if (request.method !== 'POST') {
    return Response.json({ok: false, error: 'Method not allowed.'}, {status: 405});
  }

  return Response.json(
    {ok: false, error: 'Back-in-stock notifications are not available yet.'},
    {status: 503},
  );
}

export async function loader() {
  return new Response('Not Found', {status: 404});
}
