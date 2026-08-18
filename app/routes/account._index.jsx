import {redirect} from 'react-router';
import {localizePath} from '~/lib/i18n';

export async function loader({params}) {
  return redirect(localizePath('/account/orders', params?.locale));
}

/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
