import {useRouteLoaderData} from 'react-router';
import {DICTIONARIES} from '~/lib/dictionaries';
import {LANGUAGE_KEYS} from '~/lib/i18n';

/**
 * Returns a translate function `t(key)` for the current request's language.
 * Reads the language from the root loader (which exposes `selectedLocale`),
 * falls back to English for any missing key or unknown language.
 *
 * Usage in a component:
 *   const t = useT();
 *   <button>{t('add_to_cart')}</button>
 */
export function useT() {
  const root = useRouteLoaderData('root');
  const langCode = root?.selectedLocale?.language || 'EN';
  const key = LANGUAGE_KEYS[langCode] || 'en';
  const dict = DICTIONARIES[key] || DICTIONARIES.en;
  return (k) => dict[k] ?? DICTIONARIES.en[k] ?? k;
}
