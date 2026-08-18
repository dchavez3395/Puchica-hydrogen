import {redirect} from 'react-router';
import {localizePath} from '~/lib/i18n';
import {STOREFRONT_CONTAINMENT_ACTIVE} from '~/lib/launch-catalog';

/**
 * Puchica does not operate a current editorial program. The lone legacy blog
 * is not a trustworthy acquisition surface for the focused launch catalog.
 *
 * @param {Route.LoaderArgs}
 */
export async function loader({params}) {
  const destination = STOREFRONT_CONTAINMENT_ACTIVE
    ? '/'
    : '/collections/all';
  return redirect(localizePath(destination, params?.locale || 'en'), 301);
}

export default function BlogsRedirect() {
  return null;
}

/** @typedef {import('./+types/blogs._index').Route} Route */
