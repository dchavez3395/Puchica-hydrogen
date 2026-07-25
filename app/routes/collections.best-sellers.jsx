import {redirect} from 'react-router';

/**
 * The Shopify "best-sellers" collection is not the source of truth for the
 * current launch catalog. Route this durable public URL to the approved
 * catalog, ordered by Shopify's best-selling signal instead.
 *
 * @param {Route.LoaderArgs}
 */
export async function loader() {
  return redirect('/collections/all?sort=best-selling&view=best-sellers');
}

export default function BestSellersRedirect() {
  return null;
}

/** @typedef {import('./+types/collections.best-sellers').Route} Route */
