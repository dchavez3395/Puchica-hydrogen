import {data} from 'react-router';

/**
 * A deliberate hold while Klaviyo owns consent, subscription, and delivery.
 * The previous route created passworded Shopify customer accounts from a
 * newsletter field, which did not create the promised lifecycle program.
 */
export async function action({request}) {
  if (request.method !== 'POST') {
    return data({ok: false, error: 'Method not allowed'}, {status: 405});
  }

  return data(
    {
      ok: false,
      error: 'Email updates are not available yet. Please check back soon.',
    },
    {status: 503},
  );
}
