import {useEffect, useState} from 'react';
import {redirect, useLoaderData, useSearchParams} from 'react-router';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {getPaginationVariables, Analytics, Image} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {puchicaMeta} from '~/lib/seo';
import {useT} from '~/lib/t';
import {ProductItem} from '~/components/ProductItem';
import {diversifyByVendor} from '~/lib/diversify';
import {filterLaunchProducts} from '~/lib/launch-catalog';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data, params}) => {
  const collection = data?.collection;
  const t = collection?.seo?.title || collection?.title || 'Collection';
  const d =
    collection?.seo?.description ||
    collection?.description ||
    `Shop ${t} at Puchica — curated picks with shipping options confirmed at checkout.`;
  const image = collection?.image?.url;
  const pathname = `/collections/${collection?.handle || ''}`;
  return puchicaMeta({
    title: `${t} – Puchica`,
    description: d,
    image,
    type: 'website',
    pathname,
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
  const {handle} = params;
  const {storefront} = context;
  const {country, language} = storefront.i18n;
  const paginationVariables = getPaginationVariables(request, {pageBy: 100});
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

  redirectIfHandleIsLocalized(request, {handle, data: collection});

  // The merchant's catalogue is dominated by phone-case SKUs whose
  // titles all share a vendor prefix (`Almond Latte - Cute iPhone
  // 13 Case`, `Almond Latte - Cute AirPods Case`, …). When the
  // chosen sort returns these in alphabetical or merchant-defined
  // order, the first 12 products on a page are almost always the
  // same vendor — the page reads as one long list of the same
  // brand. Re-rank the page so adjacent products are from different
  // vendors. See app/lib/diversify.js.
  const launchProducts = filterLaunchProducts(collection.products?.nodes);
  if (launchProducts.length > 2) {
    collection.products = {
      ...collection.products,
      nodes: diversifyByVendor(launchProducts),
      pageInfo: {...collection.products.pageInfo, hasPreviousPage: false, hasNextPage: false},
    };
  } else {
    collection.products = {
      ...collection.products,
      nodes: launchProducts,
      pageInfo: {...collection.products?.pageInfo, hasPreviousPage: false, hasNextPage: false},
    };
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

  // Grid density: 4-up (default) or 3-up. Local preference, not URL
  // state — it changes presentation, not the result set, so it should
  // survive navigation without polluting shareable links.
  const [density, setDensityState] = useState(4);
  useEffect(() => {
    try {
      if (Number(localStorage.getItem('pk:grid-density')) === 3) {
        setDensityState(3);
      }
    } catch {
      // localStorage blocked — keep the default.
    }
  }, []);
  const setDensity = (n) => {
    setDensityState(n);
    try {
      localStorage.setItem('pk:grid-density', String(n));
    } catch {
      // Preference just won't persist.
    }
  };
  return (
    <div className="pk-collection pk-collection--bold">
      <header className="pk-col-hero pk-col-hero--bold">
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
              opacity: 0.14,
              zIndex: 0,
            }}
          />
        )}
        <div className="pk-collection__inner">
          <nav className="pk-breadcrumbs" aria-label={t('breadcrumb_aria')}>
            <Link to="/">{t('breadcrumb_home')}</Link>
            <span className="pk-breadcrumbs__sep">/</span>
            <Link to="/collections">{t('breadcrumb_collections')}</Link>
            <span className="pk-breadcrumbs__sep">/</span>
            <span className="pk-breadcrumbs__current">{collection.title}</span>
          </nav>

          <h1 className="pk-col-hero__title">{collection.title}</h1>
          {collection.description ? (
            <p className="pk-col-hero__sub">{collection.description}</p>
          ) : null}
        </div>
      </header>

      {count === 0 ? (
        <div className="pk-empty pk-empty--bold">
          <div className="pk-empty__card">
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
                <>
                  {t('col_empty_restocking')}{' '}
                  <Link className="pk-empty__reset" to="/collections/all">
                    {t('nav_all_products')} →
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      ) : (
        <div className="pk-col-main">
          <Toolbar
            nodes={nodes}
            sortValue={sortValue}
            activeProductType={activeProductType}
            activePrice={activePrice}
            density={density}
            setDensity={setDensity}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            t={t}
          />
          <PaginatedResourceSection
            connection={collection.products}
            resourcesClassName={
              'pk-prod-grid' + (density === 3 ? ' pk-prod-grid--3' : '')
            }
          >
            {({node: product, index}) => (
              <ProductItem
                key={product.id}
                product={product}
                loading={index < 8 ? 'eager' : undefined}
              />
            )}
          </PaginatedResourceSection>
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

/**
 * Toolbar — audit §4 collection spec: category + price chips on the
 * left, count + sort + density toggle on the right. Chips replace the
 * old sidebar: with a flat taxonomy a persistent sidebar wastes a
 * column, and the chip row translates directly to mobile (it becomes
 * a horizontal scroll strip).
 */
function Toolbar({
  nodes,
  sortValue,
  activeProductType,
  activePrice,
  density,
  setDensity,
  searchParams,
  setSearchParams,
  t,
}) {
  // Aggregate product types from the loaded page for honest chips.
  // Only useful on mixed collections (Sale, Best Sellers, New
  // Arrivals) — single-department collections have one type, and a
  // one-chip row is noise, so it's suppressed.
  const typeCounts = {};
  for (const p of nodes) {
    if (p.productType) {
      typeCounts[p.productType] = (typeCounts[p.productType] || 0) + 1;
    }
  }
  const types = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  const showTypeChips = types.length > 1 || activeProductType;

  const toggleParam = (key, value, active) => {
    const next = new URLSearchParams(searchParams);
    // Filter changes invalidate the cursor — drop pagination params.
    next.delete('cursor');
    next.delete('direction');
    if (active) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next, {replace: true, preventScrollReset: true});
  };

  const priceOptions = [
    ['under-25', t('col_price_under25')],
    ['25-50', t('col_price_25_50')],
    ['50-100', t('col_price_50_100')],
    ['100-plus', t('col_price_100_plus')],
  ];

  return (
    <div className="pk-toolbar">
      <div className="pk-toolbar__chips" aria-label={t('col_filters_aria')}>
        {showTypeChips
          ? types.slice(0, 5).map(([name, n]) => {
              const active = activeProductType === name;
              return (
                <button
                  key={name}
                  type="button"
                  className={'pk-chip' + (active ? ' is-active' : '')}
                  aria-pressed={active}
                  onClick={() => toggleParam('productType', name, active)}
                >
                  {name} <span className="pk-chip__count">{n}</span>
                </button>
              );
            })
          : null}
        {showTypeChips ? <span className="pk-toolbar__divider" aria-hidden /> : null}
        {priceOptions.map(([value, label]) => {
          const active = activePrice === value;
          return (
            <button
              key={value}
              type="button"
              className={'pk-chip' + (active ? ' is-active' : '')}
              aria-pressed={active}
              onClick={() => toggleParam('price', value, active)}
            >
              {label}
            </button>
          );
        })}
        {activeProductType || activePrice ? (
          <button
            type="button"
            className="pk-toolbar__clear"
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              next.delete('productType');
              next.delete('price');
              setSearchParams(next, {replace: true, preventScrollReset: true});
            }}
          >
            {t('col_clear_filters')}
          </button>
        ) : null}
      </div>

      <div className="pk-toolbar__controls">
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
        <div
          className="pk-toolbar__density"
          role="group"
          aria-label={t('col_density_aria')}
        >
          <button
            type="button"
            className={'pk-toolbar__density-btn' + (density === 3 ? ' is-active' : '')}
            aria-pressed={density === 3}
            aria-label={t('col_density_3_aria')}
            onClick={() => setDensity(3)}
          >
            <DensityIcon cols={3} />
          </button>
          <button
            type="button"
            className={'pk-toolbar__density-btn' + (density === 4 ? ' is-active' : '')}
            aria-pressed={density === 4}
            aria-label={t('col_density_4_aria')}
            onClick={() => setDensity(4)}
          >
            <DensityIcon cols={4} />
          </button>
        </div>
      </div>
    </div>
  );
}

function DensityIcon({cols}) {
  const w = 16;
  const gap = 2;
  const cell = (w - gap * (cols - 1)) / cols;
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      {Array.from({length: cols}, (_, i) => (
        <rect
          key={i}
          x={i * (cell + gap)}
          y="2"
          width={cell}
          height="12"
          rx="1"
          fill="currentColor"
        />
      ))}
    </svg>
  );
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
    availableForSale
    productType
    tags
    featuredImage {
      id
      altText
      url
      width
      height
    }
    # Second image powers hover-swap on the card.
    images(first: 2) {
      nodes {
        id
        altText
        url
        width
        height
      }
    }
    priceRange {
      minVariantPrice { ...MoneyProductItem }
      maxVariantPrice { ...MoneyProductItem }
    }
    # compareAtPriceRange drives the new ember "Sale" badge.
    compareAtPriceRange {
      minVariantPrice { ...MoneyProductItem }
    }
    # First option (typically "Color") powers the swatch row.
    options(first: 1) {
      name
      values
      optionValues {
        name
        swatch {
          color
          image {
            previewImage {
              url
              altText
            }
          }
        }
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
        price { ...MoneyProductItem }
        compareAtPrice { ...MoneyProductItem }
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

/** @typedef {import('./+types/collections.$handle').Route} Route */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
