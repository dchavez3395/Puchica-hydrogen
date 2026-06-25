import {useLoaderData, Link, useSearchParams} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {puchicaMeta} from '~/lib/seo';
import {ProductItem} from '~/components/ProductItem';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return puchicaMeta({
    title: 'All Products – Puchica',
    description:
      'Browse the full Puchica catalog — curated picks across home, beauty, tech, pet, and more. Free shipping over $50, easy 30-day returns.',
    type: 'website',
    pathname: '/collections/all',
  });
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

/**
 * Map from URL `?sort=…` to Storefront API `ProductSortKeys` (the
 * top-level `products` connection uses `ProductSortKeys`, not the
 * collection-scoped `ProductCollectionSortKeys`).
 */
const SORT_KEY_MAP = {
  featured: {sortKey: 'RELEVANCE', reverse: false},
  'best-selling': {sortKey: 'BEST_SELLING', reverse: false},
  newest: {sortKey: 'CREATED_AT', reverse: true},
  'price-asc': {sortKey: 'PRICE', reverse: false},
  'price-desc': {sortKey: 'PRICE', reverse: true},
};
const DEFAULT_SORT = 'featured';

/**
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context, request}) {
  const {country, language} = context.storefront.i18n;
  const paginationVariables = getPaginationVariables(request, {pageBy: 12});
  const url = new URL(request.url);
  const sortValue = url.searchParams.get('sort') || DEFAULT_SORT;
  const {sortKey, reverse} = SORT_KEY_MAP[sortValue] || SORT_KEY_MAP[DEFAULT_SORT];

  const [{products}] = await Promise.all([
    context.storefront.query(CATALOG_QUERY, {
      variables: {country, language, sortKey, reverse, ...paginationVariables},
    }),
  ]);
  return {products};
}

function loadDeferredData() {
  return {};
}

export default function Collection() {
  /** @type {LoaderReturnData} */
  const {products} = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const sortValue = searchParams.get('sort') || 'featured';
  const nodes = products?.nodes ?? [];
  const count = nodes.length;
  // We don't have a real totalCount on ProductConnection in the current
  // Storefront API, so derive a "200+ products" framing from the page
  // count and the page size. The "12 of many" phrasing sets the right
  // expectation that the catalog is larger than the current view.
  const pageBy = 12;
  // When hasNextPage is true we know there's at least one more page of 12.
  // So we can show "12 of 24+" honestly. With 18 pages at pageBy=12, we'd
  // show "12 of 216+". Use Math.ceil with a min of 24 to keep the wording
  // friendly when the user is on page 1.
  const hasNextPage = Boolean(products?.pageInfo?.hasNextPage);
  const hasPrevPage = Boolean(products?.pageInfo?.hasPreviousPage);
  const impliedTotal =
    hasNextPage || hasPrevPage
      ? Math.max(count + (hasNextPage ? pageBy : 0), pageBy * 2)
      : count;

  return (
    <div className="pk-collection">
      <nav className="pk-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="pk-breadcrumbs__sep">/</span>
        <span className="pk-breadcrumbs__current">All Products</span>
      </nav>

      <header className="pk-col-hero pk-col-hero--soft">
        <span className="pk-col-hero__eyebrow">The full shop</span>
        <h1 className="pk-col-hero__title">All products</h1>
        <p className="pk-col-hero__sub">
          The complete Puchica catalog — every curated pick in one place.
          Filter by category from the sidebar, or use the search bar up top.
        </p>
        <span className="pk-col-hero__count">
          {formatCatalogCount(count, impliedTotal, hasNextPage)}
        </span>
      </header>

      {count === 0 ? (
        <div className="pk-empty">
          <p className="pk-empty__title">No products to show</p>
          <p className="pk-empty__body">
            The catalog is loading. If this persists, try refreshing.
          </p>
        </div>
      ) : (
        <div className="pk-col-body" style={{gridTemplateColumns: '1fr'}}>
          <div className="pk-col-main">
            <div className="pk-toolbar">
              <span className="pk-toolbar__count">
                {hasNextPage ? (
                  <>
                    Showing <strong>{count}</strong> so far — load more
                    below
                  </>
                ) : (
                  <>
                    Showing <strong>{count}</strong>{' '}
                    {count === 1 ? 'product' : 'products'}
                  </>
                )}
              </span>
              <label className="pk-toolbar__sort">
                Sort by
                <select
                  value={sortValue}
                  onChange={(e) => {
                    const next = new URLSearchParams(searchParams);
                    if (e.target.value === 'featured') {
                      next.delete('sort');
                    } else {
                      next.set('sort', e.target.value);
                    }
                    setSearchParams(next, {replace: true});
                  }}
                >
                  <option value="featured">Featured</option>
                  <option value="best-selling">Best selling</option>
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                </select>
              </label>
            </div>
            <PaginatedResourceSection
              connection={products}
              resourcesClassName="pk-prod-grid"
            >
              {({node: product, index}) => (
                <ProductItem
                  key={product.id}
                  product={product}
                  loading={index < 8 ? 'eager' : undefined}
                  index={index}
                />
              )}
            </PaginatedResourceSection>
          </div>
        </div>
      )}
    </div>
  );
}

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 { amount currencyCode }
  fragment CollectionItem on Product {
    id
    handle
    title
    productType
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice { ...MoneyCollectionItem }
      maxVariantPrice { ...MoneyCollectionItem }
    }
    variants(first: 1) {
      nodes {
        id
        availableForSale
      }
    }
  }
`;

const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode!
    $language: LanguageCode!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $sortKey: ProductSortKeys
    $reverse: Boolean) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor, sortKey: $sortKey, reverse: $reverse) {
      nodes { ...CollectionItem }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
`;

/**
 * Build a human-friendly catalog size label.
 *  - 0 products            → "Catalog is loading"
 *  - 1 product             → "1 product"
 *  - 12 of 24+ products    → "12 of 24+ products"  (when hasNextPage)
 *  - 12 of 12 products     → "12 products"          (last page)
 *  - fallback              → "Always growing"
 */
function formatCatalogCount(visible, implied, hasNext) {
  if (!visible) return 'Catalog is loading';
  const word = visible === 1 ? 'product' : 'products';
  if (hasNext && implied && implied > visible) {
    return `${visible} of ${implied}+ ${word}`;
  }
  if (hasNext) {
    return `${visible} ${word} and counting`;
  }
  return `${visible} ${word}`;
}

/** @typedef {import('./+types/collections.all').Route} Route */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
