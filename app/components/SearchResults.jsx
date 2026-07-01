import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {PaginatedResourceSection} from './PaginatedResourceSection';
import {urlWithTrackingParams} from '~/lib/search';
import {ProductItem} from '~/components/ProductItem';
import {useT} from '~/lib/t';

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
  const t = useT();
  if (!articles?.nodes.length) {
    return null;
  }

  return (
    <section className="pk-search-section" aria-label={t('search_articles_aria')}>
      <h2 className="pk-search-section__title">{t('search_articles')}</h2>
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
  const t = useT();
  if (!pages?.nodes.length) {
    return null;
  }

  return (
    <section className="pk-search-section" aria-label={t('search_pages_aria')}>
      <h2 className="pk-search-section__title">{t('search_pages')}</h2>
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
  const t = useT();
  if (!products?.nodes.length) {
    return null;
  }

  return (
    <section className="pk-search-section" aria-label={t('search_products_aria')}>
      <h2 className="pk-search-section__title">{t('search_products')}</h2>
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
  const t = useT();
  return (
    <p className="pk-search-empty">
      {t('search_empty')}
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
