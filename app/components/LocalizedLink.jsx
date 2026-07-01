import {Link, NavLink} from 'react-router';
import {useLocalizedHref} from '~/lib/useLocalizedHref';

/**
 * Drop-in replacements for react-router's <Link> / <NavLink> that keep the
 * user inside the active language by prefixing the `to` path (no-op in English
 * and for external / hash links — see useLocalizedHref).
 *
 * Migration: in a component that renders internal links, swap
 *
 *   import {Link, NavLink} from 'react-router';
 * for
 *   import {LocalizedLink as Link, LocalizedNavLink as NavLink} from '~/components/LocalizedLink';
 *
 * so the ~101 existing `<Link to=...>` / `<NavLink to=...>` call sites need no
 * other change. Leave links that are already known-external as plain <a>.
 *
 * NavLink's function-style `className`/`style`/`children` props pass straight
 * through untouched.
 */
export function LocalizedLink({to, ...props}) {
  const localize = useLocalizedHref();
  return <Link to={localize(to)} {...props} />;
}

export function LocalizedNavLink({to, ...props}) {
  const localize = useLocalizedHref();
  return <NavLink to={localize(to)} {...props} />;
}
