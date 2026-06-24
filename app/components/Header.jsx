import {Suspense, useEffect, useState} from 'react';
import {Await, Link, NavLink, useAsyncValue} from 'react-router';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {STORE_LOGO_URL} from '~/lib/brand';
import {LocaleSwitcher} from '~/components/LocaleSwitcher';
import {useT} from '~/lib/t';
import StarGlyph from '~/components/StarGlyph';
import {MegaMenu} from '~/components/MegaMenu';
import {IconSearch} from '~/components/Icons';

// Puchica logo. The HeaderGraphQL query prefers
// `shop.brand.logo.image.url` if set under Settings > Brand, otherwise
// it falls back to STORE_LOGO_URL from app/lib/brand.js.

const ANNOUNCEMENT_KEY = 'pk-ann-dismissed-v3';

/**
 * @param {HeaderProps}
 */
export function Header({header, isLoggedIn, cart, publicStoreDomain, megaMenu}) {
  const {shop, menu} = header;
  // Close any open drawer when the user clicks the logo to go home.
  // The route-change effect in Aside.Provider also handles this, but
  // closing here means there's no flicker where the new page shows
  // behind the still-open drawer for one frame.
  const {close} = useAside();
  return (
    <>
      <AnnouncementBar />
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
          <HeaderMenu
            menu={menu}
            megaMenu={megaMenu}
            viewport="desktop"
            primaryDomainUrl={header.shop.primaryDomain.url}
            publicStoreDomain={publicStoreDomain}
          />
          <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
        </div>
      </header>
    </>
  );
}

/**
 * Single-line announcement bar above the header. Dismissible, with the
 * dismissed state stored in localStorage so it stays away for the visitor.
 */
function AnnouncementBar() {
  // SSR-safe: render the bar always, but only hide it client-side after we
  // read the localStorage flag (and on subsequent renders).
  const [hidden, setHidden] = useState(false);
  const t = useT();

  useEffect(() => {
    try {
      if (window.localStorage.getItem(ANNOUNCEMENT_KEY) === '1') {
        setHidden(true);
      }
    } catch {
      /* localStorage blocked, ignore */
    }
  }, []);

  return (
    <div className="pk-ann" data-hidden={hidden ? 'true' : 'false'} role="region" aria-label="Site announcement">
      <div className="pk-ann__inner">
        <span>
          {t('announce_offer')}
          <StarGlyph size={10} style={{margin: '0 0.4em'}} />
          {t('announce_freeship')}
          <StarGlyph size={10} style={{margin: '0 0.4em'}} />
          <Link to="/collections" prefetch="intent" style={{marginLeft: 6}}>
            {t('announce_cta')}
          </Link>
        </span>
      </div>
      <button
        type="button"
        className="pk-ann__close"
        aria-label="Dismiss announcement"
        onClick={() => {
          setHidden(true);
          try {
            window.localStorage.setItem(ANNOUNCEMENT_KEY, '1');
          } catch {
            /* ignore */
          }
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
  );
}

export function HeaderMenu({menu, megaMenu, primaryDomainUrl, viewport, publicStoreDomain}) {
  const className =
    viewport === 'desktop' ? 'pk-nav' : 'pk-nav pk-nav--mobile';
  const {close} = useAside();

  const shopifyItems = (menu || FALLBACK_HEADER_MENU).items;

  // Build a set of the paths already covered by the Shopify menu so we
  // don't render duplicate links when the admin menu already includes them.
  const shopifyPaths = new Set(
    shopifyItems
      .filter((i) => i.url)
      .map((i) => {
        try {
          return new URL(i.url, 'https://x').pathname;
        } catch {
          return i.url;
        }
      }),
  );

  const extras = EXTRA_NAV.filter((e) => !shopifyPaths.has(e.url.split('?')[0]));

  // Filter shopify items so we don't render a top-level "Shop" link if the
  // admin menu already has one -- the MegaMenu IS the Shop entry on desktop.
  // On mobile, we still show the Shopify "Shop" link (MegaMenu renders null
  // there, so we add a dedicated fallback link).
  const filteredItems = viewport === 'desktop'
    ? shopifyItems.filter((i) => {
        if (!i.url) return false;
        const path = (() => {
          try { return new URL(i.url, 'https://x').pathname; }
          catch { return i.url; }
        })();
        return path !== '/collections/all';
      })
    : shopifyItems.filter((i) => !!i.url);

  return (
    <nav className={className} role="navigation">
      {viewport === 'desktop' && (
        <MegaMenu deferred={megaMenu} onClose={close} />
      )}
      <NavLink
        className="pk-nav__link"
        to="/explore"
        onClick={close}
        prefetch="intent"
      >
        Explore
      </NavLink>
      {viewport === 'mobile' && (
        <NavLink
          className="pk-nav__link"
          to="/collections/all"
          onClick={close}
          prefetch="intent"
        >
          Shop
        </NavLink>
      )}
      {filteredItems.map((item) => {
        if (!item.url) return null;
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            className="pk-nav__link"
            end
            key={item.id}
            onClick={close}
            prefetch="intent"
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
      {extras.map((e) => (
        <NavLink
          key={e.id}
          className="pk-nav__link"
          to={e.url}
          onClick={close}
          prefetch="intent"
        >
          {e.title}
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
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>}
 */
function HeaderCtas({isLoggedIn, cart}) {
  useHeaderShrink();
  return (
    <div className="pk-header__ctas">
      <LocaleSwitcher />
      <SearchToggle />
      <NavLink prefetch="intent" to="/account" className="pk-icon-btn" aria-label="Account">
        <Suspense fallback={<IconUser />}>
          <Await resolve={isLoggedIn} errorElement={<IconUser />}>
            {() => <IconUser />}
          </Await>
        </Suspense>
      </NavLink>
      <CartToggle cart={cart} />
    </div>
  );
}

function HeaderMenuMobileToggle() {
  const {open, type} = useAside();
  const isOpen = type === 'mobile';
  return (
    <button
      className={
        'pk-icon-btn pk-header__burger' + (isOpen ? ' is-active' : '')
      }
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen ? 'true' : 'false'}
      onClick={() => open(isOpen ? 'closed' : 'mobile')}
    >
      <IconMenu />
    </button>
  );
}

function SearchToggle() {
  const {open, type} = useAside();
  const isOpen = type === 'search';
  return (
    <button
      className={'pk-icon-btn' + (isOpen ? ' is-active' : '')}
      aria-label={isOpen ? 'Close search' : 'Open search'}
      aria-expanded={isOpen ? 'true' : 'false'}
      onClick={() => open(isOpen ? 'closed' : 'search')}
    >
      <IconSearch />
    </button>
  );
}

/**
 * @param {{count: number | null}}
 */
function CartBadge({count}) {
  const {open, type} = useAside();
  const isOpen = type === 'cart';
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      className={'pk-icon-btn pk-cart-btn' + (isOpen ? ' is-active' : '')}
      aria-label={isOpen ? 'Close cart' : 'Open cart'}
      aria-expanded={isOpen ? 'true' : 'false'}
      onClick={(e) => {
        e.preventDefault();
        open(isOpen ? 'closed' : 'cart');
        if (!isOpen) {
          publish('cart_viewed', {
            cart,
            prevCart,
            shop,
            url: window.location.href || '',
          });
        }
      }}
    >
      <IconCart />
      {count !== null && count > 0 && <span className="pk-cart-badge">{count}</span>}
    </a>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
function CartToggle({cart}) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

/* ---------- Lucide-style icons (24px, 2px stroke) ---------- */
function IconUser() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconCart() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}
function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {id: '1', resourceId: null, tags: [], title: 'Shop All', type: 'HTTP', url: '/collections/all', items: []},
    {id: '2', resourceId: null, tags: [], title: 'Best Sellers', type: 'HTTP', url: '/collections/best-sellers', items: []},
    {id: '3', resourceId: null, tags: [], title: 'New Arrivals', type: 'HTTP', url: '/collections/new-arrivals', items: []},
    {id: '4', resourceId: null, tags: [], title: 'Gift Guide', type: 'HTTP', url: '/collections/all?price=25-50', items: []},
    {id: '5', resourceId: null, tags: [], title: 'About', type: 'HTTP', url: '/pages/about', items: []},
    {id: '6', resourceId: null, tags: [], title: 'Contact', type: 'HTTP', url: '/pages/contact', items: []},
  ],
};

// Extra nav items always injected alongside whatever the Shopify admin menu provides.
// De-duplicated against the Shopify menu by URL so they don't appear twice.
const EXTRA_NAV = [
  {id: 'ex-new', title: 'New Arrivals', url: '/collections/new-arrivals'},
  {id: 'ex-gifts', title: 'Gift Guide', url: '/collections/all?price=25-50'},
  {id: 'ex-about', title: 'About', url: '/pages/about'},
];

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
