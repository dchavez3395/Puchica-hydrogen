import {redirect} from 'react-router';

/**
 * The Shopify "best-sellers" collection is not the source of truth for the
 * current launch catalog. Route this durable public URL to the evidence-ranked Launch Picks collection.
 *
 * @param {Route.LoaderArgs}
 */
export async function loader() {
  return redirect('/collections/launch-picks');
}

export default function BestSellersRedirect() {
  return null;
}

/** @typedef {import('./+types/collections.best-sellers').Route} Route */
