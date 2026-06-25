import {Link} from 'react-router';
import {PaginatedResourceSection} from './PaginatedResourceSection';
import {urlWithTrackingParams} from '~/lib/search';
import {ProductItem} from '~/components/ProductItem';

/**
 * @param {Omit<SearchResultsProps, 'error' | 'type'>}
 */
export function SearchResults({term, result, children}) {
  if (!result?.total) {
    return null;
  }

  return children({...result.items, term});
}

SearchResults.Articles = SearchResultsArticles;
SearchResults.Pages = SearchResultsPages;
SearchResults.Products = SearchResultsProducts;
SearchResults.Empty = SearchResultsEmpty;

/**
 * @param {PartialSearchResult<'articles'>}
 */
function SearchResultsArticles({term, articles}) {
  if (!articles?.nodes.length) {
    return null;
  }

  return (
    <section className="pk-search-section" aria-label="Article results">
      <h2 className="pk-search-section__title">Articles</h2>
      <div className="pk-search-links">
        {articles?.nodes?.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.handle}`,
            trackingParams: article.trackingParameters,
            term,
          });

          return (
            <Link prefetch="intent" to={articleUrl} key={article.id}>
              {article.title}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/**
 * @param {PartialSearchResult<'pages'>}
 */
function SearchResultsPages({term, pages}) {
  if (!pages?.nodes.length) {
    return null;
  }

  return (
    <section className="pk-search-section" aria-label="Page results">
      <h2 className="pk-search-section__title">Pages</h2>
      <div className="pk-search-links">
        {pages?.nodes?.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term,
          });

          return (
            <Link prefetch="intent" to={pageUrl} key={page.id}>
              {page.title}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/**
 * @param {PartialSearchResult<'products'>}
 */
function SearchResultsProducts({products}) {
  if (!products?.nodes.length) {
    return null;
  }

  return (
    <section className="pk-search-section" aria-label="Product results">
      <h2 className="pk-search-section__title">Products</h2>
      <PaginatedResourceSection
        connection={products}
        resourcesClassName="pk-prod-grid"
      >
        {({node: product, index}) => (
          <ProductItem
            key={product.id}
            product={product}
            loading={index < 4 ? 'eager' : 'lazy'}
            index={index}
          />
        )}
      </PaginatedResourceSection>
    </section>
  );
}

function SearchResultsEmpty() {
  return (
    <p className="pk-search-empty">
      No results found. Try a different search term.
    </p>
  );
}

/** @typedef {RegularSearchReturn['result']['items']} SearchItems */
/**
 * @typedef {Pick<
 *   SearchItems,
 *   ItemType
 * > &
 *   Pick<RegularSearchReturn, 'term'>} PartialSearchResult
 * @template {keyof SearchItems} ItemType
 */
/**
 * @typedef {RegularSearchReturn & {
 *   children: (args: SearchItems & {term: string}) => React.ReactNode;
 * }} SearchResultsProps
 */

/** @typedef {import('~/lib/search').RegularSearchReturn} RegularSearchReturn */
