import {redirect} from 'react-router';
import {localizePath} from '~/lib/i18n';
import {STOREFRONT_CONTAINMENT_ACTIVE} from '~/lib/launch-catalog';

/**
 * The former collection directory described a broad catalog that is no longer
 * part of Puchica's operating model. Preserve the durable URL while sending
 * shoppers and search engines to the only current collection.
 *
 * @param {Route.LoaderArgs}
 */
export async function loader({params}) {
  const destination = STOREFRONT_CONTAINMENT_ACTIVE
    ? '/'
    : '/collections/all';
  return redirect(localizePath(destination, params?.locale || 'en'), 301);
}

export default function CollectionsIndexRedirect() {
  return null;
}

/** @typedef {import('./+types/collections._index').Route} Route */
