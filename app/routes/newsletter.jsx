import {data, redirect} from 'react-router';
import {localizePath} from '~/lib/i18n';
import {STOREFRONT_CONTAINMENT_ACTIVE} from '~/lib/launch-catalog';

/**
 * Email collection is intentionally closed until Puchica has a maintained
 * mailing workflow, consent records, and an unsubscribe-capable sender. The
 * retired form used an account-creation mutation, which silently created
 * Shopify accounts
 * even though the visitor asked only for marketing email.
 *
 * @param {Route.ActionArgs}
 */
export async function action() {
  if (STOREFRONT_CONTAINMENT_ACTIVE) {
    return data(
      {ok: false, error: 'Newsletter signup is temporarily unavailable.'},
      {status: 503, headers: {'Cache-Control': 'no-store'}},
    );
  }

  return data(
    {ok: false, error: 'Newsletter signup is not currently offered.'},
    {status: 410, headers: {'Cache-Control': 'no-store'}},
  );
}

/** @param {Route.LoaderArgs} args */
export async function loader({params}) {
  if (STOREFRONT_CONTAINMENT_ACTIVE) {
    return redirect(localizePath('/', params?.locale || 'en'), 302);
  }
  return redirect(
    localizePath('/collections/all', params?.locale || 'en'),
    301,
  );
}

export default function NewsletterRedirect() {
  return null;
}

/** @typedef {import('./+types/newsletter').Route} Route */
