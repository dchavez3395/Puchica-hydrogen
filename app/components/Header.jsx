import {useEffect} from 'react';
import {LocalizedNavLink as NavLink} from '~/components/LocalizedLink';
import {useAside} from '~/components/Aside';
import {STORE_LOGO_URL} from '~/lib/brand';
import {LocaleSwitcher} from '~/components/LocaleSwitcher';
import {useT} from '~/lib/t';

// Puchica logo. The HeaderGraphQL query prefers
// `shop.brand.logo.image.url` if set under Settings > Brand, otherwise
// it falls back to STORE_LOGO_URL from app/lib/brand.js.

/**
 * @param {HeaderProps}
 */
export function Header({header}) {
  const {shop} = header;
  // Close any open drawer when the user clicks the logo to go home.
  // The route-change effect in Aside.Provider also handles this, but
  // closing here means there's no flicker where the new page shows
  // behind the still-open drawer for one frame.
  const {close} = useAside();
  return (
    <>
      <header className="pk-header" id="pk-header">
        <div className="pk-header__inner">
          <HeaderMenuMobileToggle />
          <NavLink
            prefetch="intent"
            to="/"
            className="pk-logo"
            end
            onClick={close}
          >
            <img
              className="pk-logo__img"
              src={shop.brand?.logo?.image?.url || STORE_LOGO_URL}
              alt={shop.name}
              width={120}
              height={32}
              // Header logo is the LCP element on every page — paint
              // it before everything else. The intrinsic dimensions
              // are accurate for the SVG aspect, which keeps CLS at 0.
              // ESLint react/no-unknown-property wants the camelCase form;
              // React itself emits the lowercase `fetchpriority` attribute
              // (so the actual HTML attribute name stays lowercase).
              {...{fetchpriority: 'high'}}
              decoding="async"
            />
          </NavLink>
          <HeaderMenu viewport="desktop" />
          <HeaderCtas />
        </div>
      </header>
    </>
  );
}

export function HeaderMenu({viewport}) {
  const className = viewport === 'desktop' ? 'pk-nav' : 'pk-nav pk-nav--mobile';
  const {close} = useAside();
  const t = useT();

  // Containment navigation deliberately omits every catalog discovery surface
  // until products pass the shared commercial launch gate.
  const containmentNav = [
    {id: 'hold-about', title: t('nav_about'), url: '/pages/about'},
    {id: 'hold-contact', title: t('footer_contact'), url: '/pages/contact'},
    {id: 'hold-policies', title: t('footer_policies'), url: '/policies'},
  ];

  if (viewport === 'desktop') {
    return (
      <nav className={className} role="navigation">
        {containmentNav.map((item) => (
          <NavLink
            key={item.id}
            className="pk-nav__link"
            to={item.url}
            onClick={close}
            prefetch="intent"
          >
            {item.title}
          </NavLink>
        ))}
      </nav>
    );
  }

  return (
    <nav className={className} role="navigation">
      <span className="pk-nav__section-label">{t('nav_explore')}</span>
      {containmentNav.map((item) => (
        <NavLink
          key={item.id}
          className="pk-nav__link"
          to={item.url}
          onClick={close}
          prefetch="intent"
        >
          {item.title}
        </NavLink>
      ))}
    </nav>
  );
}

/**
 * Sticky-header shrink-on-scroll behavior, wired as a single delegated
 * effect on the header root to avoid per-component listeners.
 */
function useHeaderShrink() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const header = document.getElementById('pk-header');
    if (!header) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        header.classList.toggle('is-scrolled', window.scrollY > 12);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, {passive: true});
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}

/**
 */
function HeaderCtas() {
  useHeaderShrink();
  return (
    <div className="pk-header__ctas">
      <LocaleSwitcher />
    </div>
  );
}

function HeaderMenuMobileToggle() {
  const {open, type} = useAside();
  const t = useT();
  const isOpen = type === 'mobile';
  return (
    <button
      className={'pk-icon-btn pk-header__burger' + (isOpen ? ' is-active' : '')}
      aria-label={isOpen ? t('header_menu_close') : t('header_menu_open')}
      aria-expanded={isOpen ? 'true' : 'false'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        open(isOpen ? 'closed' : 'mobile');
      }}
    >
      <IconMenu />
    </button>
  );
}

/* ---------- Lucide-style menu icon ---------- */
function IconMenu() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

/** @typedef {'desktop' | 'mobile'} Viewport */
/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {Promise<MegaMenuQuery|null>} [megaMenu]
 * @property {string} publicStoreDomain
 */

/** @typedef {import('@shopify/hydrogen').CartViewPayload} CartViewPayload */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('storefrontapi.generated').MegaMenuQuery} MegaMenuQuery */
