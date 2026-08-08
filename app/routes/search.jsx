import {useLoaderData} from 'react-router';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {SearchForm} from '~/components/SearchForm';
import {SearchResults} from '~/components/SearchResults';
import {getEmptyPredictiveSearchResult} from '~/lib/search';
import {puchicaMeta} from '~/lib/seo';
import {diversifyByVendor} from '~/lib/diversify';
import {useT} from '~/lib/t';
import {
  filterLaunchProducts,
  LAUNCH_READY_TAG,
} from '~/lib/launch-catalog';

/**
 * @type {Route.MetaFunction}
 *
 * Search result pages are thin, ephemeral, and query-specific. They
 * would dilute the site's index if Google indexed every
 * `/search?q=wheelbarrow` page that got crawled, so we noindex them.
 */
export const meta = ({data, params}) => {
  const term = (data?.term || '').trim();
  return puchicaMeta({
    title: term ? `Search: ${term} – Puchica` : 'Search – Puchica',
    description: term
      ? `Search results for "${term}" across the Puchica catalog.`
      : 'Search practical organizers for small spaces, cables, packing, luggage, and everyday carry.',
    noindex: true,
    pathname: '/search',
    langKey: params?.locale,
  });
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({request, context}) {
  const url = new URL(request.url);
  const isPredictive = url.searchParams.has('predictive');
  const searchPromise = isPredictive
    ? predictiveSearch({request, context})
    : regularSearch({request, context});

  return await searchPromise.catch((error) => {
    console.error(error);
    return {
      type: isPredictive ? 'predictive' : 'regular',
      term: '',
      result: null,
      error: 'Search is temporarily unavailable. Please try again.',
    };
  });
}

/**
 * Trending search terms shown as chips in the zero-state (before
 * the shopper has typed a query). These are hardcoded per the design
 * spec — they're the most common category-level searches on the store.
 */
const TRENDING_SEARCHES = [
  'Under sink organizer',
  'Cable organizer',
  'Packing cubes',
  'Drawer organizer',
  'Bathroom organizer',
];

/**
 * Renders the /search route
 */
export default function SearchPage() {
  const t = useT();
  /** @type {LoaderReturnData} */
  const {type, term, result, error} = useLoaderData();
  if (type === 'predictive') return null;

  const hasResults = term && result?.total;

  return (
    <div className="pk-search-page">
      <header className="pk-search-page__head">
        <h1 className="pk-search-page__title">
          {term ? (
            <>{t('search_results_h', {term: `“${term}”`})}</>
          ) : (
            t('search_results_h_fallback')
          )}
        </h1>
        <SearchForm className="pk-search-page__form">
          {({inputRef}) => (
            <div className="pk-search__form pk-search__form--page">
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
                className="pk-search__input pk-search__input--page"
                defaultValue={term}
                name="q"
                placeholder={t('search_input_placeholder')}
                aria-label={t('search_aria_submit')}
                ref={inputRef}
                type="search"
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
              />
              <button
                type="submit"
                className="pk-search__submit pk-search__submit--page"
              >
                {t('search_submit')}
              </button>
            </div>
          )}
        </SearchForm>
      </header>
      {error && <p className="pk-search-page__error">{error}</p>}
      {!hasResults ? (
        <div className="pk-search-zero">
          <div className="pk-search-zero__label">
            {t('search_trending_label')}
          </div>
          <div className="pk-search-zero__chips">
            {TRENDING_SEARCHES.map((term) => (
              <Link
                key={term}
                to={`/search?q=${encodeURIComponent(term)}`}
                className="pk-search-zero__chip"
                prefetch="intent"
              >
                {term}
              </Link>
            ))}
          </div>
          <div className="pk-search-zero__hint">{t('search_zero_hint')}</div>
        </div>
      ) : (
        <SearchResults result={result} term={term}>
          {({articles, pages, products, term}) => (
            <>
              <SearchResults.Products products={products} term={term} />
              <SearchResults.Pages pages={pages} term={term} />
              <SearchResults.Articles articles={articles} term={term} />
            </>
          )}
        </SearchResults>
      )}
      <Analytics.SearchView data={{searchTerm: term, searchResults: result}} />
    </div>
  );
}

/**
 * Regular search query and fragments
 * (adjust as needed)
 */
// Shaped to match the shared <ProductItem> card so search results render
// identically to collection grids.
const SEARCH_PRODUCT_FRAGMENT = `#graphql
  fragment SearchProduct on Product {
    __typename
    id
    handle
    title
    availableForSale
    productType
    tags
    trackingParameters
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    options(first: 1) {
      name
      values
      optionValues {
        name
        swatch { color }
      }
    }
    variants(first: 100) {
      nodes {
        id
        availableForSale
        title
        requiresShipping
        image {
          id
          altText
          url
          width
          height
        }
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
        product {
          id
          handle
          title
          vendor
        }
      }
    }
  }
`;

const SEARCH_PAGE_FRAGMENT = `#graphql
  fragment SearchPage on Page {
     __typename
     handle
    id
    title
    trackingParameters
  }
`;

const SEARCH_ARTICLE_FRAGMENT = `#graphql
  fragment SearchArticle on Article {
    __typename
    handle
    id
    title
    trackingParameters
  }
`;

const PAGE_INFO_FRAGMENT = `#graphql
  fragment PageInfoFragment on PageInfo {
    hasNextPage
    hasPreviousPage
    startCursor
    endCursor
  }
`;

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/search
export const SEARCH_QUERY = `#graphql
  query RegularSearch(
    $country: CountryCode!
    $language: LanguageCode!
    $endCursor: String
    $first: Int
    $last: Int
    $productTerm: String!
    $term: String!
    $startCursor: String) @inContext(country: $country, language: $language) {
    articles: search(
      query: $term,
      types: [ARTICLE],
      first: $first,
    ) {
      nodes {
        ...on Article {
          ...SearchArticle
        }
      }
    }
    pages: search(
      query: $term,
      types: [PAGE],
      first: $first,
    ) {
      nodes {
        ...on Page {
          ...SearchPage
        }
      }
    }
    products: search(
      after: $endCursor,
      before: $startCursor,
      first: $first,
      last: $last,
      query: $productTerm,
      sortKey: RELEVANCE,
      types: [PRODUCT],
      unavailableProducts: HIDE,
    ) {
      nodes {
        ...on Product {
          ...SearchProduct
        }
      }
      pageInfo {
        ...PageInfoFragment
      }
    }
  }
  ${SEARCH_PRODUCT_FRAGMENT}
  ${SEARCH_PAGE_FRAGMENT}
  ${SEARCH_ARTICLE_FRAGMENT}
  ${PAGE_INFO_FRAGMENT}
`;

/**
 * Regular search fetcher
 * @param {Pick<
 *   Route.LoaderArgs,
 *   'request' | 'context'
 * >}
 * @return {Promise<RegularSearchReturn>}
 */
async function regularSearch({request, context}) {
  const {storefront} = context;
  const {country, language} = storefront.i18n;
  const url = new URL(request.url);
  const variables = getPaginationVariables(request, {pageBy: 8});
  const term = String(url.searchParams.get('q') || '');
  const productTerm = `${term} tag:${LAUNCH_READY_TAG}`.trim();

  // Search articles, pages, and products for the `q` term
  const {errors, ...items} = await storefront.query(SEARCH_QUERY, {
    variables: {...variables, country, language, term, productTerm},
  });

  if (!items) {
    throw new Error('No search data returned from Shopify API');
  }

  // The merchant's catalogue is dominated by phone-case SKUs whose
  // titles all share a vendor prefix. When Shopify's RELEVANCE
  // sort returns these in source order the first page is mostly
  // the same vendor. Interleave the visible products by vendor
  // so adjacent results are from different vendors.
  const launchProducts = filterLaunchProducts(items.products?.nodes);
  if (launchProducts.length > 2) {
    items.products = {
      ...items.products,
      nodes: diversifyByVendor(launchProducts),
      pageInfo: {
        ...items.products.pageInfo,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
  } else {
    items.products = {
      ...items.products,
      nodes: launchProducts,
      pageInfo: {
        ...items.products?.pageInfo,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
  }

  const total = Object.values(items).reduce(
    (acc, {nodes}) => acc + nodes.length,
    0,
  );

  const error = errors
    ? errors.map(({message}) => message).join(', ')
    : undefined;

  return {type: 'regular', term, error, result: {total, items}};
}

/**
 * Predictive search query and fragments
 * (adjust as needed)
 */
const PREDICTIVE_SEARCH_ARTICLE_FRAGMENT = `#graphql
  fragment PredictiveArticle on Article {
    __typename
    id
    title
    handle
    blog {
      handle
    }
    image {
      url
      altText
      width
      height
    }
    trackingParameters
  }
`;

const PREDICTIVE_SEARCH_COLLECTION_FRAGMENT = `#graphql
  fragment PredictiveCollection on Collection {
    __typename
    id
    title
    handle
    image {
      url
      altText
      width
      height
    }
    trackingParameters
  }
`;

const PREDICTIVE_SEARCH_PAGE_FRAGMENT = `#graphql
  fragment PredictivePage on Page {
    __typename
    id
    title
    handle
    trackingParameters
  }
`;

const PREDICTIVE_SEARCH_PRODUCT_FRAGMENT = `#graphql
  fragment PredictiveProduct on Product {
    __typename
    id
    title
    handle
    tags
    availableForSale
    trackingParameters
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      id
      image {
        url
        altText
        width
        height
      }
      price {
        amount
        currencyCode
      }
    }
  }
`;

const PREDICTIVE_SEARCH_QUERY_FRAGMENT = `#graphql
  fragment PredictiveQuery on SearchQuerySuggestion {
    __typename
    text
    styledText
    trackingParameters
  }
`;

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/predictiveSearch
const PREDICTIVE_SEARCH_QUERY = `#graphql
  query PredictiveSearch(
    $country: CountryCode!
    $language: LanguageCode!
    $limit: Int!
    $limitScope: PredictiveSearchLimitScope!
    $term: String!
    $types: [PredictiveSearchType!]) @inContext(country: $country, language: $language) {
    predictiveSearch(
      limit: $limit,
      limitScope: $limitScope,
      query: $term,
      types: $types,
    ) {
      articles {
        ...PredictiveArticle
      }
      collections {
        ...PredictiveCollection
      }
      pages {
        ...PredictivePage
      }
      products {
        ...PredictiveProduct
      }
      queries {
        ...PredictiveQuery
      }
    }
  }
  ${PREDICTIVE_SEARCH_ARTICLE_FRAGMENT}
  ${PREDICTIVE_SEARCH_COLLECTION_FRAGMENT}
  ${PREDICTIVE_SEARCH_PAGE_FRAGMENT}
  ${PREDICTIVE_SEARCH_PRODUCT_FRAGMENT}
  ${PREDICTIVE_SEARCH_QUERY_FRAGMENT}
`;

/**
 * Predictive search fetcher
 * @param {Pick<
 *   Route.ActionArgs,
 *   'request' | 'context'
 * >}
 * @return {Promise<PredictiveSearchReturn>}
 */
async function predictiveSearch({request, context}) {
  const {storefront} = context;
  const {country, language} = storefront.i18n;
  const url = new URL(request.url);
  const term = String(url.searchParams.get('q') || '').trim();
  const limit = Number(url.searchParams.get('limit') || 10);
  const type = 'predictive';

  if (!term) return {type, term, result: getEmptyPredictiveSearchResult()};

  // Predictively search articles, collections, pages, products, and queries (suggestions)
  const {predictiveSearch: items, errors} = await storefront.query(
    PREDICTIVE_SEARCH_QUERY,
    {
      variables: {
        // customize search options as needed
        country,
        language,
        limit,
        limitScope: 'EACH',
        term,
      },
    },
  );

  if (errors) {
    throw new Error(
      `Shopify API errors: ${errors.map(({message}) => message).join(', ')}`,
    );
  }

  if (!items) {
    throw new Error('No predictive search data returned from Shopify API');
  }

  items.products = filterLaunchProducts(items.products);
  // A collection suggestion cannot be proven safe without checking whether it
  // contains an approved product. Hide those suggestions until predictive
  // search can apply the same product evidence gate.
  items.collections = [];

  const total = Object.values(items).reduce(
    (acc, item) => acc + item.length,
    0,
  );

  return {type, term, result: {items, total}};
}

/** @typedef {import('./+types/search').Route} Route */
/** @typedef {import('~/lib/search').RegularSearchReturn} RegularSearchReturn */
/** @typedef {import('~/lib/search').PredictiveSearchReturn} PredictiveSearchReturn */
/** @typedef {import('storefrontapi.generated').RegularSearchQuery} RegularSearchQuery */
/** @typedef {import('storefrontapi.generated').PredictiveSearchQuery} PredictiveSearchQuery */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
