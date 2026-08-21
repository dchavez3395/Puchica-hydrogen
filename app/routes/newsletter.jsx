import {data, redirect} from 'react-router';

/**
 * Retired newsletter endpoint.
 *
 * Puchica does not collect marketing consent until the consent-first Klaviyo
 * flow in docs/klaviyo-judgeme-activation.md is approved and activated. Keep
 * the old URL closed so stale forms, bookmarks, and bots cannot create Shopify
 * customer records.
 */
export async function action() {
  return data(
    {ok: false, error: 'Newsletter signup is not currently available.'},
    {status: 410, headers: {'Cache-Control': 'no-store'}},
  );
}

export async function loader() {
  return redirect('/', {
    status: 302,
    headers: {'Cache-Control': 'no-store, max-age=0'},
  });
}

export default function NewsletterRoute() {
  return null;
}
