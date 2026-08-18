import {redirect} from 'react-router';
import {localizePath} from '~/lib/i18n';
import {STOREFRONT_CONTAINMENT_ACTIVE} from '~/lib/launch-catalog';

/** @param {Route.LoaderArgs} args */
export async function loader({params}) {
  const destination = STOREFRONT_CONTAINMENT_ACTIVE
    ? '/'
    : '/collections/all';
  return redirect(localizePath(destination, params?.locale || 'en'), 301);
}

export default function BlogArticleRedirect() {
  return null;
}

/** @typedef {import('./+types/blogs.$blogHandle.$articleHandle').Route} Route */
