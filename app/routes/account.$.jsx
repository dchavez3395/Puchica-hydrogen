import {redirect} from 'react-router';
import {localizePath} from '~/lib/i18n';

// fallback wild card for all unauthenticated routes in account section
/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context, params}) {
  await context.customerAccount.handleAuthStatus();

  return redirect(localizePath('/account', params?.locale));
}

/** @typedef {import('./+types/account.$').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
