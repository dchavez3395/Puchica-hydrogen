import {redirect} from 'react-router';
import {STOREFRONT_CONTAINMENT_ACTIVE} from '~/lib/launch-catalog';

/**
 * Redirect the legacy "/collections/new-arrivals" URL to the real
 * source of New Arrivals content (the launch-approved catalog,
 * sorted newest-first to match the homepage "New arrivals" strip).
 *
 * Both the homepage "See all new" link (`_index.jsx`) and the desktop
 * header's "New Arrivals" nav item (`Header.jsx EXTRA_NAV`) target this
 * path. Without this route, the $handle loader throws a 404 because no
 * `new-arrivals` collection exists in Shopify. The broad catalog route
 * applies the same launch-readiness gate used across the storefront.
 *
 * Keeping the URL (instead of editing every call-site) preserves
 * shareable links and avoids a second round of changes if the New
 * Arrivals section ever points to a different real collection.
 */

/**
 * @param {Route.LoaderArgs}
 */
export async function loader() {
  return redirect(
    STOREFRONT_CONTAINMENT_ACTIVE
      ? '/'
      : '/collections/all?sort=newest&view=new-arrivals',
  );
}

export default function NewArrivalsRedirect() {
  return null;
}

/** @typedef {import('./+types/collections.new-arrivals').Route} Route */
