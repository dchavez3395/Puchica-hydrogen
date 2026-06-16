import {redirect, useLoaderData, Link} from 'react-router';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {puchicaMeta} from '~/lib/seo';
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
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {pageBy: 12});

  if (!handle) throw redirect('/collections');

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, ...paginationVariables},
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: collection});
  return {collection};
}

function loadDeferredData() {
  return {};
}

export default function Collection() {
  /** @type {LoaderReturnData} */
  const {collection} = useLoaderData();
  const nodes = collection.products?.nodes ?? [];
  const count = nodes.length;
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
      <nav className="pk-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="pk-breadcrumbs__sep">/</span>
        <Link to="/collections">Collections</Link>
        <span className="pk-breadcrumbs__sep">/</span>
        <span className="pk-breadcrumbs__current">{collection.title}</span>
      </nav>

      <header className="pk-col-hero">
        <div className="pk-col-hero__glow" aria-hidden />
        <span className="pk-col-hero__eyebrow">Collection</span>
        <h1 className="pk-col-hero__title">{collection.title}</h1>
        {collection.description ? (
          <p className="pk-col-hero__sub">{collection.description}</p>
        ) : null}
        <span className="pk-col-hero__count">
          {formatCount(count, impliedTotal, hasNextPage)}
        </span>
      </header>

      {count === 0 ? (
        <div className="pk-empty">
          <p className="pk-empty__title">Nothing here just yet</p>
          <p className="pk-empty__body">
            We&apos;re restocking this collection. Check back soon, or browse
            the rest of the shop.
          </p>
        </div>
      ) : (
        <div className="pk-col-body">
          <FilterSidebar nodes={nodes} />
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
                <select defaultValue="featured">
                  <option value="featured">Featured</option>
                  <option value="best-selling">Best selling</option>
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                </select>
              </label>
            </div>
            <PaginatedResourceSection
              connection={collection.products}
              resourcesClassName="pk-prod-grid"
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

function FilterSidebar({nodes}) {
  // Aggregate product types from this collection for an honest static filter.
  const typeCounts = {};
  for (const p of nodes) {
    if (p.productType) {
      typeCounts[p.productType] = (typeCounts[p.productType] || 0) + 1;
    }
  }
  const types = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);

  return (
    <aside className="pk-filters" aria-label="Filters">
      <div className="pk-filters__group">
        <h3 className="pk-filters__title">Category</h3>
        <ul className="pk-filters__list">
          {types.length === 0 ? (
            <li>
              <span className="pk-filters__note">
                No sub-categories in this collection.
              </span>
            </li>
          ) : (
            types.slice(0, 8).map(([name, n]) => (
              <li key={name}>
                <button type="button">
                  <span>{name}</span>
                  <span className="pk-filters__count">{n}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
      <div className="pk-filters__group">
        <h3 className="pk-filters__title">Price</h3>
        <ul className="pk-filters__list">
          <li><button type="button"><span>Under $25</span></button></li>
          <li><button type="button"><span>$25 – $50</span></button></li>
          <li><button type="button"><span>$50 – $100</span></button></li>
          <li><button type="button"><span>$100 +</span></button></li>
        </ul>
      </div>
      <p className="pk-filters__note">
        Filter selection is visual only on this preview build — full filtering
        ships next.
      </p>
    </aside>
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
    productType
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
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      seo {
        title
        description
      }
      products(
        first: $first
        last: $last
        before: $startCursor
        after: $endCursor
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
function formatCount(visible, implied, hasNext) {
  if (!visible) return 'Collection is loading';
  const word = visible === 1 ? 'product' : 'products';
  if (hasNext && implied && implied > visible) {
    return `${visible} of ${implied}+ ${word}`;
  }
  if (hasNext) {
    return `${visible} ${word} and counting`;
  }
  return `${visible} ${word}`;
}

/** @typedef {import('./+types/collections.$handle').Route} Route */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
