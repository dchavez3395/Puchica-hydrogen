import {redirect} from 'react-router';
import {localizePath} from '~/lib/i18n';

/**
 * The old Explore page exposed broad, off-niche collections that are no
 * longer part of Puchica's launch catalog. Preserve old bookmarks and links
 * with a permanent redirect to the gated organizer catalog.
 *
 * @param {Route.LoaderArgs} args
 */
export async function loader({params}) {
  return redirect(localizePath('/collections/all', params.locale), 301);
}

export default function ExploreRedirect() {
  return null;
}

/** @typedef {import('./+types/explore').Route} Route */
