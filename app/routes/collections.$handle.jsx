import {redirect, useLoaderData, Link, useSearchParams} from 'react-router';
import {getPaginationVariables, Analytics, Image} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {puchicaMeta} from '~/lib/seo';
import {useT} from '~/lib/t';
import {ProductItem} from '~/components/ProductItem';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  const collection = data?.collection;
  const t = collection?.seo?.title || collection?.title || 'Collection';
  const d =
    collection?.seo?.description ||
    collection?.description ||
    `Shop ${t} at Puchica — curated picks with free shipping over $50 and easy 30-day returns.`;
  const image = collection?.image?.url;
  const pathname = `/collections/${collection?.handle || ''}`;
  return puchicaMeta({
    title: `${t} – Puchica`,
    description: d,
    image,
    type: 'website',
    pathname,
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
 * Map from the URL `?sort=…` value to a Storefront API `ProductCollectionSortKeys`
 * enum. We default to `MANUAL` (matches Shopify's "Featured" pick when the
 * merchant has ordered the collection) and only fall back to `RELEVANCE`
 * for the "all products" / non-curated catalog if the merchant ever
 * switches that page to use this query.
 */
const SORT_KEY_MAP = {
  featured: {sortKey: 'MANUAL', reverse: false},
  'best-selling': {sortKey: 'BEST_SELLING', reverse: false},
  newest: {sortKey: 'CREATED', reverse: true},
  'price-asc': {sortKey: 'PRICE', reverse: false},
  'price-desc': {sortKey: 'PRICE', reverse: true},
};
const DEFAULT_SORT = 'featured';

/**
 * Map from URL `?price=…` to a Storefront API `PriceRangeFilter` shape.
 * The bounds are USD/CAD cents. The actual numbers don't have to be
 * perfect — they're a coarse filter for UX, not a guarantee.
 */
const PRICE_RANGE_MAP = {
  'under-25': {price: {max: 25}},
  '25-50': {price: {min: 25, max: 50}},
  '50-100': {price: {min: 50, max: 100}},
  '100-plus': {price: {min: 100}},
};

/**
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context, params, request}) {
  const isNewArrivals = params.handle === 'new-arrivals';
  const handle = isNewArrivals ? 'outdoor-garden' : params.handle;
  const {storefront} = context;
  const {country, language} = storefront.i18n;
  const paginationVariables = getPaginationVariables(request, {pageBy: 12});
  const url = new URL(request.url);

  if (!params.handle) throw redirect('/collections');

  // Read sort + filter state from the URL. Treat unknown values as
  // "no filter" so a shopper doesn't lose state on click.
  const sortValue = url.searchParams.get('sort') || DEFAULT_SORT;
  const {sortKey, reverse} = SORT_KEY_MAP[sortValue] || SORT_KEY_MAP[DEFAULT_SORT];
  const productType = url.searchParams.get('productType') || null;
  const priceValue = url.searchParams.get('price') || null;
  const priceRange = PRICE_RANGE_MAP[priceValue] || null;

  // Build a `ProductFilter` for any active filter. The Storefront API
  // accepts both at once; combining them is an AND.
  const filters = [];
  if (productType) filters.push({productType});
  if (priceRange) filters.push(priceRange);

  const variables = {
    handle,
    country,
    language,
    sortKey,
    reverse,
    filters: filters.length > 0 ? filters : undefined,
    ...paginationVariables,
  };

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {variables}),
  ]);

  if (!collection) {
    throw new Response(`Collection ${params.handle} not found`, {status: 404});
  }

  if (isNewArrivals) {
    collection.title = 'New Arrivals';
    collection.handle = 'new-arrivals';
    collection.description = 'Explore our latest handpicked items, fresh from the source.';
  } else {
    redirectIfHandleIsLocalized(request, {handle, data: collection});
  }
  return {collection};
}

function loadDeferredData() {
  return {};
}

export default function Collection() {
  /** @type {LoaderReturnData} */
  const {collection} = useLoaderData();
  const t = useT();
  const [searchParams, setSearchParams] = useSearchParams();
  const sortValue = searchParams.get('sort') || 'featured';
  const activeProductType = searchParams.get('productType') || null;
  const activePrice = searchParams.get('price') || null;
  const nodes = collection.products?.nodes ?? [];
  const count = nodes.length;
  const hasActiveFilter = Boolean(activeProductType || activePrice);
  // Storefront API 2025-04 doesn't expose a real `totalCount` on
  // ProductConnection. We infer an "X of Y+" framing from pageInfo so the
  // count chip is honest about the catalog being larger than the page.
  const hasNextPage = Boolean(collection.products?.pageInfo?.hasNextPage);
  const hasPrevPage = Boolean(collection.products?.pageInfo?.hasPreviousPage);
  const pageBy = 12;
  const impliedTotal =
    hasNextPage || hasPrevPage
      ? Math.max(count + (hasNextPage ? pageBy : 0), pageBy * 2)
      : count;

  return (
    <div className="pk-collection">
      <nav className="pk-breadcrumbs" aria-label={t('breadcrumb_aria')}>
        <Link to="/">{t('breadcrumb_home')}</Link>
        <span className="pk-breadcrumbs__sep">/</span>
        <Link to="/collections">{t('breadcrumb_collections')}</Link>
        <span className="pk-breadcrumbs__sep">/</span>
        <span className="pk-breadcrumbs__current">{collection.title}</span>
      </nav>

      <header className="pk-col-hero">
        {collection.image && (
          <Image
            data={collection.image}
            className="pk-col-hero__bg"
            loading="eager"
            sizes="100vw"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.18,
              zIndex: 0,
            }}
          />
        )}
        <div className="pk-col-hero__glow" aria-hidden />
        <span className="pk-col-hero__eyebrow">{t('col_eyebrow')}</span>
        <h1 className="pk-col-hero__title">{collection.title}</h1>
        {collection.description ? (
          <p className="pk-col-hero__sub">{collection.description}</p>
        ) : null}
        <span className="pk-col-hero__count">
          {formatCount(count, impliedTotal, hasNextPage, t)}
        </span>
      </header>

      {count === 0 ? (
        <div className="pk-empty">
          <p className="pk-empty__title">{t('col_empty_title')}</p>
          <p className="pk-empty__body">
            {hasActiveFilter ? (
              <>
                {t('col_empty_filtered')}{' '}
                <button
                  type="button"
                  className="pk-empty__reset"
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.delete('productType');
                    next.delete('price');
                    setSearchParams(next, {replace: true});
                  }}
                >
                  {t('col_clear_filters')}
                </button>
              </>
            ) : (
              t('col_empty_restocking')
            )}
          </p>
        </div>
      ) : (
        <div className="pk-col-body">
          <FilterSidebar
            nodes={nodes}
            activeProductType={activeProductType}
            activePrice={activePrice}
            t={t}
          />
          <div className="pk-col-main">
            <div className="pk-toolbar">
              <span className="pk-toolbar__count">
                {hasNextPage ? (
                  <>
                    {t('col_showing')} <strong>{count}</strong> {t('col_showing_more')}
                  </>
                ) : (
                  <>
                    {t('col_showing')} <strong>{count}</strong>{' '}
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
            {hasActiveFilter ? (
              <div className="pk-toolbar__active">
                {activeProductType ? (
                  <span className="pk-toolbar__chip">
                    {t('col_filter_cat_label')} {activeProductType}
                  </span>
                ) : null}
                {activePrice ? (
                  <span className="pk-toolbar__chip">
                    {t('col_filter_price_label')} {priceLabel(activePrice, t)}
                  </span>
                ) : null}
                <button
                  type="button"
                  className="pk-toolbar__clear"
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.delete('productType');
                    next.delete('price');
                    setSearchParams(next, {replace: true});
                  }}
                >
                  {t('col_clear_filters')}
                </button>
              </div>
            ) : null}
            <PaginatedResourceSection
              connection={collection.products}
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

      <Analytics.CollectionView
        data={{
          collection: {id: collection.id, handle: collection.handle},
        }}
      />
    </div>
  );
}

function FilterSidebar({nodes, activeProductType, activePrice, t}) {
  // Aggregate product types from this collection for an honest static filter.
  const typeCounts = {};
  for (const p of nodes) {
    if (p.productType) {
      typeCounts[p.productType] = (typeCounts[p.productType] || 0) + 1;
    }
  }
  const types = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);

  // Each filter link toggles its own param while preserving the other
  // params (sort, page cursor) so a shopper doesn't lose state on click.
  function withParam(key, value) {
    const next = new URLSearchParams();
    // Mirror current search params from the URL.
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.forEach((v, k) => next.set(k, v));
    }
    if (value === null) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    return `?${next.toString()}`;
  }

  const priceOptions = [
    ['under-25', t('col_price_under25')],
    ['25-50', t('col_price_25_50')],
    ['50-100', t('col_price_50_100')],
    ['100-plus', t('col_price_100_plus')],
  ];

  return (
    <aside className="pk-filters" aria-label={t('col_filters_aria')}>
      <div className="pk-filters__group">
        <h3 className="pk-filters__title">{t('col_filter_cat_heading')}</h3>
        <ul className="pk-filters__list">
          {types.length === 0 ? (
            <li>
              <span className="pk-filters__note">
                {t('col_filter_no_types')}
              </span>
            </li>
          ) : (
            types.slice(0, 8).map(([name, n]) => (
              <li key={name}>
                <Link
                  to={withParam(
                    'productType',
                    activeProductType === name ? null : name,
                  )}
                  className={
                    'pk-filters__btn' +
                    (activeProductType === name ? ' is-active' : '')
                  }
                  prefetch="intent"
                  aria-pressed={activeProductType === name}
                >
                  <span>{name}</span>
                  <span className="pk-filters__count">{n}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
      <div className="pk-filters__group">
        <h3 className="pk-filters__title">{t('col_filter_price_heading')}</h3>
        <ul className="pk-filters__list">
          {priceOptions.map(([value, label]) => (
            <li key={value}>
              <Link
                to={withParam('price', activePrice === value ? null : value)}
                className={
                  'pk-filters__btn' +
                  (activePrice === value ? ' is-active' : '')
                }
                prefetch="intent"
                aria-pressed={activePrice === value}
              >
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function priceLabel(value, t) {
  switch (value) {
    case 'under-25':
      return t('col_price_under25');
    case '25-50':
      return t('col_price_25_50');
    case '50-100':
      return t('col_price_50_100');
    case '100-plus':
      return t('col_price_100_plus');
    default:
      return value;
  }
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
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
      minVariantPrice { ...MoneyProductItem }
      maxVariantPrice { ...MoneyProductItem }
    }
    variants(first: 1) {
      nodes {
        id
        availableForSale
      }
    }
  }
`;

const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $country: CountryCode!
    $language: LanguageCode!
    $handle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $filters: [ProductFilter!]) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image { id url altText width height }
      seo {
        title
        description
      }
      products(
        first: $first
        last: $last
        before: $startCursor
        after: $endCursor
        sortKey: $sortKey
        reverse: $reverse
        filters: $filters
      ) {
        nodes { ...ProductItem }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
`;

/**
 * Human-friendly collection-size label.
 *  - 0 products            → "Collection is loading"
 *  - 1 product             → "1 product"
 *  - 12 of 24+ products    → "12 of 24+ products"  (when hasNextPage)
 *  - 12 of 12 products     → "12 products"          (last page)
 *  - fallback              → "Always growing"
 */
function formatCount(visible, implied, hasNext, t) {
  if (!visible) return t('col_count_loading');
  const word = visible === 1 ? t('col_product_singular') : t('col_product_plural');
  if (hasNext && implied && implied > visible) {
    return `${visible} ${t('col_count_of')} ${implied}+ ${word}`;
  }
  if (hasNext) {
    return `${visible} ${word} ${t('col_count_and_counting')}`;
  }
  return `${visible} ${word}`;
}

/** @typedef {import('./+types/collections.$handle').Route} Route */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
