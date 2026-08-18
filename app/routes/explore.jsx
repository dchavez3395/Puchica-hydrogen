import {redirect} from 'react-router';
import {localizePath} from '~/lib/i18n';
import {STOREFRONT_CONTAINMENT_ACTIVE} from '~/lib/launch-catalog';

/**
 * `/explore` belonged to the retired department catalog. Keep old links useful
 * without exposing empty filters or unrelated category promises.
 *
 * @param {Route.LoaderArgs}
 */
export async function loader({params}) {
  const destination = STOREFRONT_CONTAINMENT_ACTIVE
    ? '/'
    : '/collections/all';
  return redirect(localizePath(destination, params?.locale || 'en'), 301);
}

export default function ExploreRedirect() {
  return null;
}

/** @typedef {import('./+types/explore').Route} Route */
