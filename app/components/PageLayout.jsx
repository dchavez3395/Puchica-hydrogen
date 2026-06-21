import {Await, Link} from 'react-router';
import {Suspense, useId} from 'react';
import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header';
import {CartMain} from '~/components/CartMain';
import {NewsletterPopup} from '~/components/NewsletterPopup';
import StarGlyph from '~/components/StarGlyph';
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
  return (
    <Aside type="cart" heading="CART">
      <Suspense fallback={<p>Loading cart ...</p>}>
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
  return (
    <Aside type="search" heading="SEARCH">
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
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </span>
              <input
                className="pk-search__input"
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                placeholder="Search products, collections, articles…"
                ref={inputRef}
                type="search"
                list={queriesDatalistId}
                autoComplete="off"
              />
              <button
                type="submit"
                className="pk-search__submit"
                aria-label="Search"
              >
                Search
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
                    Searching for &ldquo;{term.current}&rdquo;…
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
                      View all results for &ldquo;{term.current}&rdquo; →
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
  return (
    header.menu &&
    header.shop.primaryDomain?.url && (
      <Aside type="mobile" heading="MENU">
        <div className="pk-mmenu">
          <HeaderMenu
            menu={header.menu}
            megaMenu={megaMenu}
            viewport="mobile"
            primaryDomainUrl={header.shop.primaryDomain.url}
            publicStoreDomain={publicStoreDomain}
          />
          <div className="pk-mmenu__group">
            <p className="pk-mmenu__label">Account</p>
            <Link to="/account" className="pk-mmenu__row" onClick={() => {}}>
              <span>Sign in / Create account</span>
              <span aria-hidden>→</span>
            </Link>
            <Link to="/cart" className="pk-mmenu__row">
              <span>View cart</span>
              <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="pk-mmenu__group">
            <p className="pk-mmenu__label">Customer Care</p>
            <Link to="/pages/contact" className="pk-mmenu__row">
              <span>Contact us</span>
              <span aria-hidden>→</span>
            </Link>
            <Link to="/policies" className="pk-mmenu__row">
              <span>All policies</span>
              <span aria-hidden>→</span>
            </Link>
          </div>
          <p className="pk-mmenu__foot">
            Free shipping on orders over $50
            <StarGlyph size={10} style={{margin: '0 0.4em'}} />
            30-day easy returns
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
