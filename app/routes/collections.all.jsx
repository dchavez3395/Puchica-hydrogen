import {useLoaderData, useSearchParams} from 'react-router';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {puchicaMeta} from '~/lib/seo';
import {ProductItem} from '~/components/ProductItem';
import {useT} from '~/lib/t';
import {diversifyByVendor} from '~/lib/diversify';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({params}) => {
  return puchicaMeta({
    title: 'All Products – Puchica',
    description:
      'Every product in the Puchica catalog, in one place. Filter by category, sort by price or popularity, search by name. Free shipping over $50, 30-day returns.',
    type: 'website',
    pathname: '/collections/all',
    langKey: params?.locale,
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

  // Note: we deliberately do NOT apply a `?price=` filter here. The
  // top-level `QueryRoot.products` connection does not accept a
  // `ProductFilter` input list — only `Collection.products` does.
  // And while `QueryRoot.products.query` does accept Shopify search
  // syntax, the storefront API only honors exact-value matches for
  // `variants.price` (e.g. `variants.price:25`) — range operators
  // like `>=` and `<=` are silently ignored, and a query that fails
  // to match returns the full unfiltered result. Without a way to
  // express a range against this connection, we'd be displaying a
  // chip that claims a filter is active when the underlying
  // products list is actually unchanged. Better to surface the
  // truth — the catalog is unfiltered here — and let shoppers use
  // the dedicated `/collections/<handle>?price=…` routes (which go
  // through `Collection.products` with a real `ProductFilter`) to
  // get actual range filtering. The "Pick a budget" GiftFinder
  // cards on the homepage now point at those routes instead.
  const priceValue = url.searchParams.get('price') || null;
  void priceValue;

  const [{products: rawProducts}] = await Promise.all([
    context.storefront.query(CATALOG_QUERY, {
      variables: {
        country,
        language,
        sortKey,
        reverse,
        ...paginationVariables,
      },
    }),
  ]);
  // The merchant's catalogue is dominated by phone-case SKUs whose
  // titles all share a vendor prefix (`Almond Latte - Cute iPhone
  // 13 Case`, `Almond Latte - Cute AirPods Case`, …). When the
  // chosen sort returns these in alphabetical or relevance order,
  // the first 12 products on the page are almost always the same
  // vendor. Re-rank so adjacent products are from different vendors
  // (e.g. iPhone case, hair product, robot toy, in that order).
  // See app/lib/diversify.js.
  const products = rawProducts?.nodes?.length > 2
    ? {
        ...rawProducts,
        nodes: diversifyByVendor(rawProducts.nodes),
      }
    : rawProducts;
  return {products};
}

function loadDeferredData() {
  return {};
}

export default function Collection() {
  /** @type {LoaderReturnData} */
  const {products} = useLoaderData();
  const t = useT();
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
      <nav className="pk-breadcrumbs" aria-label={t('breadcrumb_aria')}>
        <Link to="/">{t('breadcrumb_home')}</Link>
        <span className="pk-breadcrumbs__sep">/</span>
        <span className="pk-breadcrumbs__current">{t('all_breadcrumb')}</span>
      </nav>

      <header className="pk-col-hero pk-col-hero--soft">
        <div className="pk-col-hero__glow" aria-hidden />
        <div className="pk-col-hero__glow pk-col-hero__glow--ember" aria-hidden />
        <span className="pk-col-hero__eyebrow">{t('all_eyebrow')}</span>
        <h1 className="pk-col-hero__title">{t('all_title')}</h1>
        <p className="pk-col-hero__sub">{t('all_sub')}</p>
        <span className="pk-col-hero__count">{t('col_brand_chip')}</span>
      </header>

      {count === 0 ? (
        <div className="pk-empty">
          <p className="pk-empty__title">{t('all_empty_title')}</p>
          <p className="pk-empty__body">{t('all_empty_body')}</p>
        </div>
      ) : (
        <div className="pk-col-body" style={{gridTemplateColumns: '1fr'}}>
          <div className="pk-col-main">
            <div className="pk-toolbar">
              <span className="pk-toolbar__count">
                {hasNextPage ? (
                  <>
                    {t('col_count_of')} <strong>{count}+</strong>{' '}
                    {count === 1 ? t('col_product_singular') : t('col_product_plural')}
                  </>
                ) : (
                  <>
                    <strong>{count}</strong>{' '}
                    {count === 1 ? t('col_product_singular') : t('col_product_plural')}
                  </>
                )}
              </span>
              <label className="pk-toolbar__sort">
                {t('col_sort_by')}
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
                  <option value="featured">{t('col_sort_featured')}</option>
                  <option value="best-selling">{t('col_sort_best')}</option>
                  <option value="newest">{t('col_sort_newest')}</option>
                  <option value="price-asc">{t('col_sort_price_asc')}</option>
                  <option value="price-desc">{t('col_sort_price_desc')}</option>
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
    tags
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
function formatCatalogCount(visible, implied, hasNext, t) {
  if (!visible) return t('all_count_loading');
  const word = visible === 1 ? t('col_product_singular') : t('col_product_plural');
  if (hasNext && implied && implied > visible) {
    return `${visible} ${t('col_count_of')} ${implied}+ ${word}`;
  }
  if (hasNext) {
    return `${visible} ${word} ${t('col_count_and_counting')}`;
  }
  return `${visible} ${word}`;
}

/** @typedef {import('./+types/collections.all').Route} Route */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
