import {Await} from 'react-router';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {Suspense, useId} from 'react';
import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header';
import {CartMain} from '~/components/CartMain';
import {NewsletterPopup} from '~/components/NewsletterPopup';
import {IconSearch} from '~/components/Icons';
import {useT} from '~/lib/t';
import {LocaleSwitcher} from '~/components/LocaleSwitcher';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';

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
  return (
    <Aside.Provider>
      <a href="#main-content" className="pk-skip-link">Skip to main content</a>
      <CartAside cart={cart} />
      <SearchAside />
      <MobileMenuAside header={header} megaMenu={megaMenu} publicStoreDomain={publicStoreDomain} />
      {header && (
        <Header
          header={header}
          cart={cart}
          isLoggedIn={isLoggedIn}
          publicStoreDomain={publicStoreDomain}
          megaMenu={megaMenu}
        />
      )}
      <main id="main-content" tabIndex={-1}>{children}</main>
      <Footer
        footer={footer}
        header={header}
        publicStoreDomain={publicStoreDomain}
      />
      <NewsletterPopup />
    </Aside.Provider>
  );
}

/**
 * @param {{cart: PageLayoutProps['cart']}}
 */
function CartAside({cart}) {
  const t = useT();
  return (
    <Aside type="cart" heading={t('aside_heading_cart')}>
      <Suspense fallback={<p>{t('cart_loading')}</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
          }}
        </Await>
      </Suspense>
    </Aside>
  );
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
                  <div className="pk-search__loading">
                    <span className="pk-search__spinner" aria-hidden />
                    {t('search_loading_for').replace('{term}', term.current)}
                  </div>
                );
              }

              if (!total) {
                return <SearchResultsPredictive.Empty term={term} closeSearch={closeSearch} />;
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
            <p className="pk-mmenu__label">{t('mobile_account')}</p>
            <Link to="/account" className="pk-mmenu__row" onClick={() => {}}>
              <span>{t('mobile_signin')}</span>
              <span aria-hidden>→</span>
            </Link>
            <Link to="/cart" className="pk-mmenu__row">
              <span>{t('mobile_view_cart')}</span>
              <span aria-hidden>→</span>
            </Link>
            <div className="pk-mmenu__locale">
              <span className="pk-mmenu__locale-label">{t('mobile_language')}</span>
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
          <p className="pk-mmenu__foot">
            {t('mobile_announce_foot')}
          </p>
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
