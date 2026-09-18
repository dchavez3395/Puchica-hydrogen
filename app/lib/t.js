import {useRouteLoaderData} from 'react-router';

/**
 * Interpolate `{key}` placeholders in `template` with values from `params`.
 * Values can be strings (substituted in place) or anything else (kept as
 * a React child by the caller — see ContactPage's use of `t('foo', {x: <a/>})`).
 * Unknown placeholders are left as-is so missing-key bugs are visible.
 */
function interpolate(template, params) {
  if (!params) return template;
  // Split on {key} so non-string values flow through as React children.
  const parts = template.split(/(\{[^}]+\})/g);
  const out = parts.map((part) => {
    const m = part.match(/^\{([^}]+)\}$/);
    if (!m) return part;
    const value = params[m[1]];
    return value === undefined ? part : value;
  });
  // When every value is plain text, return one string. An array reaches
  // React attributes as its comma-joined form, so aria-label={t('View image
  // {n} of {total}', ...)} read "View image ,1, of ,2," to a screen reader
  // on every gallery thumbnail and product card (found 2026-09-18 by the
  // keyboard walk-through). Only a JSX value needs the array form.
  return out.every((v) => typeof v === 'string' || typeof v === 'number')
    ? out.join('')
    : out;
}

/**
 * Returns a translate function `t(key, params?)` for the current request's
 * language. Reads the language from the root loader (which exposes
 * `selectedLocale`), falls back to English for any missing key or unknown
 * language.
 *
 * Usage in a component:
 *   const t = useT();
 *   <button>{t('add_to_cart')}</button>
 *   <p>{t('foo_bar', {name: 'Daniel'})}</p>
 *   <p>{t('foo_baz', {link: <a href="…">here</a>})}</p>
 *
 * The params form returns an array of strings + values, which React
 * renders as a fragment of children. Non-string values are kept as
 * nodes (so callers can interpolate JSX with a real `<a>` instead of
 * a stringified placeholder).
 */
export function useT() {
  const root = useRouteLoaderData('root');
  const dict = root?.dictionary || {};
  return (k, params) => {
    const raw = dict[k] ?? k;
    return interpolate(raw, params);
  };
}
