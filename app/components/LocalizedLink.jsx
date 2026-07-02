import {forwardRef} from 'react';
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
 * so the existing `<Link to=...>` / `<NavLink to=...>` call sites need no other
 * change. Leave links that are already known-external as plain <a>.
 *
 * These use forwardRef so wrappers that need the DOM node (e.g. MagneticButton /
 * MagneticSurface, which attach cursor effects) can still get a ref — react-router's
 * Link/NavLink both forward refs to the underlying <a>.
 *
 * NavLink's function-style `className`/`style`/`children` props pass straight
 * through untouched.
 */
export const LocalizedLink = forwardRef(function LocalizedLink({to, ...props}, ref) {
  const localize = useLocalizedHref();
  return <Link ref={ref} to={localize(to)} {...props} />;
});

export const LocalizedNavLink = forwardRef(function LocalizedNavLink(
  {to, ...props},
  ref,
) {
  const localize = useLocalizedHref();
  return <NavLink ref={ref} to={localize(to)} {...props} />;
});
