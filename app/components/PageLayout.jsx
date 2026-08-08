import {Await, useFetchers} from 'react-router';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {Suspense, useCallback, useEffect, useId, useState} from 'react';
import {Aside, useAside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header';
import {CartMain} from '~/components/CartMain';
import {IconSearch} from '~/components/Icons';
import {useT} from '~/lib/t';
import {LocaleSwitcher} from '~/components/LocaleSwitcher';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';
import {STOREFRONT_CONTAINMENT_ACTIVE} from '~/lib/launch-catalog';

/**
 * @param {PageLayoutProps}
 */
export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  megaMenu,
  publicStoreDomain,
}) {
  const t = useT();
  return (
    <Aside.Provider>
      <a href="#main-content" className="pk-skip-link">
        {t('skip_to_content')}
      </a>
      {!STOREFRONT_CONTAINMENT_ACTIVE && <CartAside cart={cart} />}
      {!STOREFRONT_CONTAINMENT_ACTIVE && <SearchAside />}
      <MobileMenuAside
        header={header}
        megaMenu={megaMenu}
        publicStoreDomain={publicStoreDomain}
      />
      {header && (
        <Header
          header={header}
          cart={cart}
          isLoggedIn={isLoggedIn}
          publicStoreDomain={publicStoreDomain}
          megaMenu={megaMenu}
        />
      )}
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer
        footer={footer}
        header={header}
        publicStoreDomain={publicStoreDomain}
      />
    </Aside.Provider>
  );
}

/**
 * @param {{cart: PageLayoutProps['cart']}}
 */
function CartAside({cart}) {
  const t = useT();
  const {type} = useAside();
  const fetchers = useFetchers();
  const [latestActionCart, setLatestActionCart] = useState(null);
  const actionCart = [...fetchers]
    .reverse()
    .map((fetcher) => unwrapCartPayload(fetcher.data))
    .find((cart) => cart?.lines?.nodes);

  const refreshCart = useCallback(async () => {
    try {
      const response = await fetch('/cart-sync', {
        headers: {Accept: 'application/json'},
        cache: 'no-store',
      });
      if (!response.ok) return;
      const nextCart = await response.json();
      if (nextCart?.lines?.nodes) {
        setLatestActionCart(nextCart);
      }
    } catch {
      // The drawer can still render the root cart promise if this network
      // refresh fails, so keep the fallback quiet.
    }
  }, []);

  useEffect(() => {
    if (type !== 'cart') return;

    refreshCart();
    const refreshAfterCookie = setTimeout(refreshCart, 900);
    const refreshAfterRevalidation = setTimeout(refreshCart, 1800);

    return () => {
      clearTimeout(refreshAfterCookie);
      clearTimeout(refreshAfterRevalidation);
    };
  }, [type, refreshCart]);

  useEffect(() => {
    if (actionCart) setLatestActionCart(actionCart);
  }, [actionCart]);

  useEffect(() => {
    function handleCartUpdated(event) {
      const nextCart = event.detail?.cart;
      if (nextCart?.lines?.nodes) {
        setLatestActionCart(nextCart);
      } else {
        refreshCart();
      }
    }

    window.addEventListener('puchica:cart-updated', handleCartUpdated);
    return () => {
      window.removeEventListener('puchica:cart-updated', handleCartUpdated);
    };
  }, [refreshCart]);

  return (
    <Aside type="cart" heading={t('aside_heading_cart')}>
      <Suspense fallback={<p>{t('cart_loading')}</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return (
              <CartMain
                cart={latestActionCart ?? actionCart ?? cart}
                layout="aside"
              />
            );
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}

function unwrapCartPayload(payload) {
  if (!payload) return null;
  const data = payload.data ?? payload;
  const routeData = data['routes/cart']?.data ?? data['routes/cart'] ?? data;
  return routeData.cart ?? routeData;
}

function SearchAside() {
  const queriesDatalistId = useId();
  const t = useT();
  return (
    <Aside type="search" heading={t('aside_heading_search')}>
      <div className="pk-search">
        <SearchFormPredictive>
          {({fetchResults, goToSearch, inputRef}) => (
            <form
              className="pk-search__form"
              onSubmit={(e) => {
                e.preventDefault();
                goToSearch();
              }}
            >
              <span className="pk-search__icon" aria-hidden>
                <IconSearch size={18} />
              </span>
              <input
                className="pk-search__input"
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                placeholder={t('search_placeholder')}
                aria-label={t('search_aria_submit')}
                ref={inputRef}
                type="search"
                list={queriesDatalistId}
                autoComplete="off"
              />
              <button
                type="submit"
                className="pk-search__submit"
                aria-label={t('search_aria_submit')}
              >
                {t('search_submit_label')}
              </button>
            </form>
          )}
        </SearchFormPredictive>

        <div className="pk-search__body">
          <SearchResultsPredictive>
            {({items, total, term, state, closeSearch}) => {
              const {articles, collections, pages, products, queries} = items;

              if (state === 'loading' && term.current) {
                return (
                  <div
                    className="pk-search__loading"
                    role="status"
                    aria-live="polite"
                  >
                    <span className="pk-search__spinner" aria-hidden />
                    {t('search_loading_for').replace('{term}', term.current)}
                  </div>
                );
              }

              if (!total) {
                return (
                  <SearchResultsPredictive.Empty
                    term={term}
                    closeSearch={closeSearch}
                  />
                );
              }

              return (
                <>
                  <SearchResultsPredictive.Queries
                    queries={queries}
                    queriesDatalistId={queriesDatalistId}
                  />
                  <SearchResultsPredictive.Products
                    products={products}
                    closeSearch={closeSearch}
                    term={term}
                  />
                  <SearchResultsPredictive.Collections
                    collections={collections}
                    closeSearch={closeSearch}
                    term={term}
                  />
                  <SearchResultsPredictive.Pages
                    pages={pages}
                    closeSearch={closeSearch}
                    term={term}
                  />
                  <SearchResultsPredictive.Articles
                    articles={articles}
                    closeSearch={closeSearch}
                    term={term}
                  />
                  {term.current && total ? (
                    <Link
                      onClick={closeSearch}
                      to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                      className="pk-search__more"
                    >
                      {t('search_view_all').replace('{term}', term.current)}
                    </Link>
                  ) : null}
                </>
              );
            }}
          </SearchResultsPredictive>
        </div>
      </div>
    </Aside>
  );
}

/**
 * @param {{
 *   header: PageLayoutProps['header'];
 *   megaMenu: PageLayoutProps['megaMenu'];
 *   publicStoreDomain: PageLayoutProps['publicStoreDomain'];
 * }}
 */
function MobileMenuAside({header, megaMenu, publicStoreDomain}) {
  const t = useT();
  return (
    header.menu &&
    header.shop.primaryDomain?.url && (
      <Aside type="mobile" heading={t('aside_heading_menu')}>
        <div className="pk-mmenu">
          <HeaderMenu
            menu={header.menu}
            megaMenu={megaMenu}
            viewport="mobile"
            primaryDomainUrl={header.shop.primaryDomain.url}
            publicStoreDomain={publicStoreDomain}
          />
          <div className="pk-mmenu__group">
            <div className="pk-mmenu__locale">
              <span className="pk-mmenu__locale-label">
                {t('mobile_market_language')}
              </span>
              <LocaleSwitcher />
            </div>
          </div>
          <div className="pk-mmenu__group">
            <p className="pk-mmenu__label">{t('mobile_customer_care')}</p>
            <Link to="/pages/contact" className="pk-mmenu__row">
              <span>{t('mobile_contact_us')}</span>
              <span aria-hidden>→</span>
            </Link>
            <Link to="/policies" className="pk-mmenu__row">
              <span>{t('mobile_all_policies')}</span>
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </Aside>
    )
  );
}

/**
 * @typedef {Object} PageLayoutProps
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {Promise<boolean>} isLoggedIn
 * @property {Promise<MegaMenuQuery|null>} [megaMenu]
 * @property {string} publicStoreDomain
 * @property {React.ReactNode} [children]
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').MegaMenuQuery} MegaMenuQuery */
