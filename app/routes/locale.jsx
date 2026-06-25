import {redirect} from 'react-router';
import {LOCALE_COOKIE, LANGUAGES} from '~/lib/i18n';

/**
 * Resource route — sets the locale cookie server-side and redirects back.
 * The LocaleSwitcher navigates here; the server sets Set-Cookie and returns
 * the user to wherever they came from. This avoids the unreliable pattern of
 * setting document.cookie in JS then calling window.location.reload().
 */
export async function action({request}) {
  const formData = await request.formData();
  const lang = formData.get('lang');
  const returnTo = formData.get('return') || '/';

  const headers = new Headers();

  if (lang && LANGUAGES[lang]) {
    headers.set(
      'Set-Cookie',
      `${LOCALE_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`,
    );
  }

  return redirect(returnTo, {headers});
}
