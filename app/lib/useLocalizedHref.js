import {useRouteLoaderData} from 'react-router';
import {LANGUAGE_KEYS, localizePath} from '~/lib/i18n';

/**
 * The active language as a URL key ('en' | 'fr' | 'es' | 'pt-br'), read from
 * the root loader's `selectedLocale` (set in app/root.jsx). Falls back to 'en'.
 */
export function useLocaleKey() {
  const root = useRouteLoaderData('root');
  const code = root?.selectedLocale?.language || 'EN';
  return LANGUAGE_KEYS[code] || 'en';
}

/**
 * Returns a function that rewrites an internal `to`/`href` so navigation stays
 * inside the active language. No-op for English, external URLs, hashes, and
 * non-string (object) `to` values.
 *
 *   const href = useLocalizedHref();
 *   <a href={href('/products/x')} />   // '/fr/products/x' when browsing in FR
 *
 * Prefer the <LocalizedLink> / <LocalizedNavLink> wrappers for react-router
 * links; use this hook directly for raw <a href> or programmatic navigate().
 */
export function useLocalizedHref() {
  const langKey = useLocaleKey();
  return (to) => {
    if (typeof to !== 'string') return to; // object `to` (rare) — caller localizes
    if (!to.startsWith('/')) return to; // external, mailto:, #hash, relative
    return localizePath(to, langKey);
  };
}
