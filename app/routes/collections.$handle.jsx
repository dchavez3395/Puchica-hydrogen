import {redirect} from 'react-router';
import {localizePath} from '~/lib/i18n';
import {STOREFRONT_CONTAINMENT_ACTIVE} from '~/lib/launch-catalog';

/**
 * Historical Shopify collection URLs can still receive external traffic, but
 * their titles, ranking claims, and departments describe the retired catalog.
 * Consolidate them into the current travel edit rather than showing empty or
 * misleading collection pages.
 *
 * @param {Route.LoaderArgs}
 */
export async function loader({params}) {
  const destination = STOREFRONT_CONTAINMENT_ACTIVE
    ? '/'
    : '/collections/all';
  return redirect(localizePath(destination, params?.locale || 'en'), 301);
}

export default function LegacyCollectionRedirect() {
  return null;
}

/** @typedef {import('./+types/collections.$handle').Route} Route */
