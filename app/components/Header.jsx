import {Suspense, useEffect} from 'react';
import {Await, useAsyncValue} from 'react-router';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {LocalizedNavLink as NavLink} from '~/components/LocalizedLink';
import {useAside} from '~/components/Aside';
import {IconSearch} from '~/components/Icons';
import {LocaleSwitcher} from '~/components/LocaleSwitcher';
import {STORE_LOGO_URL} from '~/lib/brand';
import {useT} from '~/lib/t';

/** @param {HeaderProps} props */
export function Header({header, isLoggedIn, cart}) {
  const {shop} = header;
  const {close} = useAside();

  return (
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
            {...{fetchpriority: 'high'}}
            decoding="async"
          />
        </NavLink>
        <HeaderMenu viewport="desktop" />
        <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
      </div>
    </header>
  );
}

/** @param {{viewport: 'desktop' | 'mobile'}} props */
export function HeaderMenu({viewport}) {
  const className = viewport === 'desktop' ? 'pk-nav' : 'pk-nav pk-nav--mobile';
  const {close} = useAside();
  const t = useT();
  const desktopNav = [
    {id: 'shop', title: t('nav_shop'), url: '/collections/all'},
    {id: 'about', title: t('nav_about'), url: '/pages/about'},
  ];
  const mobileNav = [
    ...desktopNav,
    {
      id: 'packing-cubes',
      title: 'Packing cubes',
      url: '/products/3-piece-packing-cube-set',
    },
    {
      id: 'cable-case',
      title: 'Cable organizer',
      url: '/products/travel-cable-organizer-case',
    },
    {
      id: 'toiletry-bag',
      title: 'Toiletry organizer',
      url: '/products/travel-toiletry-organizer',
    },
    {id: 'contact', title: t('footer_contact'), url: '/pages/contact'},
  ];
  const items = viewport === 'desktop' ? desktopNav : mobileNav;

  return (
    <nav className={className} aria-label={t('nav_explore')}>
      {viewport === 'mobile' ? (
        <span className="pk-nav__section-label">{t('nav_explore')}</span>
      ) : null}
      {items.map((item) => (
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

/** @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>} props */
function HeaderCtas({isLoggedIn, cart}) {
  useHeaderShrink();
  const t = useT();

  return (
    <div className="pk-header__ctas">
      <LocaleSwitcher />
      <SearchToggle />
      <NavLink
        prefetch="intent"
        to="/account"
        className="pk-icon-btn pk-account-btn"
        aria-label={t('header_account_aria')}
      >
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
  const t = useT();
  const isOpen = type === 'mobile';

  return (
    <button
      className={'pk-icon-btn pk-header__burger' + (isOpen ? ' is-active' : '')}
      aria-label={isOpen ? t('header_menu_close') : t('header_menu_open')}
      aria-expanded={isOpen}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        open(isOpen ? 'closed' : 'mobile');
      }}
      type="button"
    >
      <IconMenu />
    </button>
  );
}

function SearchToggle() {
  const {open, type} = useAside();
  const t = useT();
  const isOpen = type === 'search';

  return (
    <button
      className={'pk-icon-btn' + (isOpen ? ' is-active' : '')}
      aria-label={isOpen ? t('header_search_close') : t('header_search_open')}
      aria-expanded={isOpen}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        open(isOpen ? 'closed' : 'search');
      }}
      type="button"
    >
      <IconSearch />
    </button>
  );
}

/** @param {{count: number | null}} props */
function CartBadge({count}) {
  const {open, type} = useAside();
  const t = useT();
  const isOpen = type === 'cart';
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      className={'pk-icon-btn pk-cart-btn' + (isOpen ? ' is-active' : '')}
      aria-label={isOpen ? t('header_cart_close') : t('header_cart_open')}
      aria-expanded={isOpen}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
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
      {count !== null && count > 0 ? (
        <span className="pk-cart-badge">{count}</span>
      ) : null}
    </a>
  );
}

/** @param {Pick<HeaderProps, 'cart'>} props */
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

function IconUser() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconCart() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

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
      aria-hidden="true"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 */

/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
