import {useEffect, useState} from 'react';
import {useLoaderData, useSearchParams} from 'react-router';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {CacheNone, getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {puchicaMeta} from '~/lib/seo';
import {ProductItem} from '~/components/ProductItem';
import {useT} from '~/lib/t';
import {diversifyByVendor} from '~/lib/diversify';
import {filterLaunchProducts} from '~/lib/launch-catalog';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({params}) => {
  return puchicaMeta({
    title: 'Shop Organizers – Puchica',
    description:
      'Shop Puchica’s focused collection of home, cable, and travel organizers. Compare available options and sort by price or newest.',
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
  const paginationVariables = getPaginationVariables(request, {pageBy: 24});
  const url = new URL(request.url);
  const sortValue = url.searchParams.get('sort') || DEFAULT_SORT;
  const {sortKey, reverse} =
    SORT_KEY_MAP[sortValue] || SORT_KEY_MAP[DEFAULT_SORT];

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
      cache: CacheNone(),
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
  const launchProducts = filterLaunchProducts(rawProducts?.nodes);
  const products = {
    ...rawProducts,
    nodes:
      launchProducts.length > 2
        ? diversifyByVendor(launchProducts)
        : launchProducts,
  };
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
  const catalogView = searchParams.get('view');
  const viewCopy = {
    'new-arrivals': {
      eyebrow: t('new_arrivals_eyebrow'),
      title: t('new_arrivals_heading'),
      sub: t('all_sub'),
    },
    'best-sellers': {
      eyebrow: t('best_sellers_eyebrow'),
      title: t('nav_best_sellers'),
      sub: t('megamenu_tagline_best_sellers'),
    },
  }[catalogView];
  const nodes = products?.nodes ?? [];
  const count = nodes.length;
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

  const setDensity = (nextDensity) => {
    setDensityState(nextDensity);
    try {
      localStorage.setItem('pk:grid-density', String(nextDensity));
    } catch {
      // The preference remains valid for this visit even if it cannot persist.
    }
  };

  return (
    <div className="pk-collection pk-collection--bold">
      <header className="pk-col-hero pk-col-hero--bold">
        <div className="pk-collection__inner">
          <nav className="pk-breadcrumbs" aria-label={t('breadcrumb_aria')}>
            <Link to="/">{t('breadcrumb_home')}</Link>
            <span className="pk-breadcrumbs__sep">/</span>
            <span className="pk-breadcrumbs__current">
              {viewCopy?.title || t('all_breadcrumb')}
            </span>
          </nav>

          <span className="pk-col-hero__eyebrow">
            {viewCopy?.eyebrow || t('all_eyebrow')}
          </span>
          <h1 className="pk-col-hero__title">
            {viewCopy?.title || t('all_title')}
          </h1>
          <p className="pk-col-hero__sub">{viewCopy?.sub || t('all_sub')}</p>
        </div>
      </header>

      {count === 0 ? (
        <div className="pk-empty pk-empty--bold">
          <div className="pk-empty__card">
            <p className="pk-empty__title">{t('all_empty_title')}</p>
            <p className="pk-empty__body">{t('all_empty_body')}</p>
          </div>
        </div>
      ) : (
        <div className="pk-col-main">
          <div className="pk-toolbar pk-toolbar--catalog">
            <span className="pk-toolbar__count">
              {t('col_showing')}:{' '}
              <strong>{viewCopy?.title || t('all_breadcrumb')}</strong>
            </span>
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
                  className={
                    'pk-toolbar__density-btn' +
                    (density === 3 ? ' is-active' : '')
                  }
                  aria-pressed={density === 3}
                  aria-label={t('col_density_3_aria')}
                  onClick={() => setDensity(3)}
                >
                  <DensityIcon cols={3} />
                </button>
                <button
                  type="button"
                  className={
                    'pk-toolbar__density-btn' +
                    (density === 4 ? ' is-active' : '')
                  }
                  aria-pressed={density === 4}
                  aria-label={t('col_density_4_aria')}
                  onClick={() => setDensity(4)}
                >
                  <DensityIcon cols={4} />
                </button>
              </div>
            </div>
          </div>
          <PaginatedResourceSection
            connection={products}
            showSummary={false}
            resourcesClassName={
              'pk-prod-grid' + (density === 3 ? ' pk-prod-grid--3' : '')
            }
          >
            {({node: product, index}) => (
              <ProductItem
                key={product.id}
                product={product}
                loading={index < 2 ? 'eager' : 'lazy'}
                index={index}
              />
            )}
          </PaginatedResourceSection>
        </div>
      )}
    </div>
  );
}

function DensityIcon({cols}) {
  const width = 16;
  const gap = 2;
  const cell = (width - gap * (cols - 1)) / cols;
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      {Array.from({length: cols}, (_, index) => (
        <rect
          key={index}
          x={index * (cell + gap)}
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

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 { amount currencyCode }
  fragment CollectionItem on Product {
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
    priceRange {
      minVariantPrice { ...MoneyCollectionItem }
      maxVariantPrice { ...MoneyCollectionItem }
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
        price { ...MoneyCollectionItem }
        compareAtPrice { ...MoneyCollectionItem }
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
    products(first: $first, last: $last, before: $startCursor, after: $endCursor, sortKey: $sortKey, reverse: $reverse, query: "tag:puchica-launch-ready") {
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

/** @typedef {import('./+types/collections.all').Route} Route */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
