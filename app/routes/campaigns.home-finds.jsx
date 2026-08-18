import {redirect} from 'react-router';
import {localizePath} from '~/lib/i18n';
import {STOREFRONT_CONTAINMENT_ACTIVE} from '~/lib/launch-catalog';

/**
 * This historical campaign duplicates the current homepage and creates a
 * second indexable version of the same offer. Consolidate it permanently.
 *
 * @param {Route.LoaderArgs}
 */
export async function loader({params}) {
  if (STOREFRONT_CONTAINMENT_ACTIVE) {
    return redirect(localizePath('/', params?.locale || 'en'), 301);
  }
  return redirect(
    localizePath('/collections/all', params?.locale || 'en'),
    301,
  );
}

export default function HomeFindsCampaignRedirect() {
  return null;
}

/** @typedef {import('./+types/campaigns.home-finds').Route} Route */
