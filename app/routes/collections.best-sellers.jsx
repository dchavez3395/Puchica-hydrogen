import {redirect} from 'react-router';
import {STOREFRONT_CONTAINMENT_ACTIVE} from '~/lib/launch-catalog';

/**
 * The Shopify "best-sellers" collection is not the source of truth for the
 * current launch catalog. A bestseller label also requires real, current sales
 * evidence, which the store does not yet have. Preserve the durable URL but do
 * not manufacture a ranking claim.
 *
 * @param {Route.LoaderArgs}
 */
export async function loader() {
  return redirect(STOREFRONT_CONTAINMENT_ACTIVE ? '/' : '/collections/all');
}

export default function BestSellersRedirect() {
  return null;
}

/** @typedef {import('./+types/collections.best-sellers').Route} Route */
