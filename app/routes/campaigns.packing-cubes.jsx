import {redirect} from 'react-router';
import {localizePath} from '~/lib/i18n';
import {STOREFRONT_CONTAINMENT_ACTIVE} from '~/lib/launch-catalog';

/**
 * The old campaign advertised a broken five-piece supplier mapping. Keep the
 * URL useful, but never recreate or sell that mismatched offer.
 *
 * @param {Route.LoaderArgs}
 */
export async function loader({params}) {
  const destination = STOREFRONT_CONTAINMENT_ACTIVE
    ? '/'
    : '/collections/all';
  return redirect(localizePath(destination, params?.locale || 'en'), 301);
}

export default function PackingCubesCampaignRedirect() {
  return null;
}

/** @typedef {import('./+types/campaigns.packing-cubes').Route} Route */
