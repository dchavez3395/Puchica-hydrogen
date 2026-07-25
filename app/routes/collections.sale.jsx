import {redirect} from 'react-router';

/**
 * Do not present a one-product sale collection as a shopping destination.
 * A dedicated sale page returns only when the merchant has a meaningful set of
 * verified offers; until then, legacy Sale links lead to the active catalog.
 *
 * @param {Route.LoaderArgs}
 */
export async function loader() {
  return redirect('/collections/all');
}

export default function SaleRedirect() {
  return null;
}

/** @typedef {import('./+types/collections.sale').Route} Route */
