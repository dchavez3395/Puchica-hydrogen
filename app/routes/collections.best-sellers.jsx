import {redirect} from 'react-router';

/**
 * Keep the durable legacy URL, but do not claim sales history the new launch
 * catalog has not earned. Route it to an explicitly curated Featured view.
 *
 * @param {Route.LoaderArgs}
 */
export async function loader() {
  return redirect('/collections/all?view=featured', 302);
}

export default function BestSellersRedirect() {
  return null;
}

/** @typedef {import('./+types/collections.best-sellers').Route} Route */
