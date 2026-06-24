import {useLoaderData, Link, useSearchParams} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {puchicaMeta} from '~/lib/seo';
import {ScrollReveal} from '~/components/ScrollReveal';
import {TiltCard} from '~/components/TiltCard';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return puchicaMeta({
    title: 'Explore – Puchica',
    description: 'Browse our full catalog',
    pathname: '/explore',
  });
};

/**
 * All 15 product category handles (matching MegaMenu PRODUCT_CATEGORIES).
 * The explore page uses these as filter toggle chips.
 */
const PRODUCT_CATEGORIES = [
  'phone-case',
  'home-essentials',
  'electronics-accessories',
  'apparel-accessories',
  'health-wellness',
  'sports-outdoors',
  'pet-finds',
  'automotive',
  'tools-home-improvement',
  'beauty-personal-care',
  'toys-games',
  'home-decor',
  'office-school-supplies',
  'baby-nursery',
  'outdoor-garden',
];

/**
 * All 19 collection handles (15 product categories + 3 featured + 1 extra).
 * Used for the Storefront API query aliases.
 */
const ALL_COLLECTION_HANDLES = [
  ...PRODUCT_CATEGORIES,
  'best-sellers',
  'trending-finds',
  'gifts-under-25',
];

/**
 * Map from collection handle to GraphQL alias key (camelCase).
 */
function handleToAlias(handle) {
  return handle.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * Friendly display names for each category, derived from handle.
 * "phone-case" → "Phone Case", "home-essentials" → "Home Essentials"
 */
function handleToLabel(handle) {
  return handle
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

/**
 * Query all 19 collections via Storefront API using GraphQL aliases.
 * For each collection, fetch first 24 products with id, title, handle,
 * priceRange, and featuredImage.
 *
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context}) {
  // Build alias lines: `phoneCase: collection(handle: "phone-case") { ...ExploreCollection }`
  const aliasLines = ALL_COLLECTION_HANDLES.map(
    (handle) =>
      `  ${handleToAlias(handle)}: collection(handle: "${handle}") { ...ExploreCollection }`,
  ).join('\n');

  const query = `#graphql
    fragment ExploreProduct on Product {
      id
      title
      handle
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      featuredImage {
        id
        url
        altText
        width
        height
      }
    }
    fragment ExploreCollection on Collection {
      id
      handle
      title
      products(first: 24) {
        nodes { ...ExploreProduct }
      }
    }
    query ExplorePage {
${aliasLines}
    }
  `;

  const data = await context.storefront.query(query);
  return {collections: data};
}

function loadDeferredData() {
  return {};
}

export default function ExplorePage() {
  /** @type {LoaderReturnData} */
  const {collections} = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read ?cats= query param to pre-select categories
  const catsParam = searchParams.get('cats') || '';
  const selectedCats = catsParam
    ? catsParam.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  // Build the list of all collection objects from the aliased query response
  const allCollections = ALL_COLLECTION_HANDLES.map((handle) => {
    const alias = handleToAlias(handle);
    return collections?.[alias];
  }).filter(Boolean);

  // Determine which collections to show based on filter
  const activeCats = selectedCats.length > 0 ? selectedCats : PRODUCT_CATEGORIES;
  const visibleCollections = allCollections.filter((c) =>
    activeCats.includes(c.handle),
  );

  // Flatten all products from visible collections
  const allProducts = visibleCollections.flatMap((c) =>
    (c.products?.nodes ?? []).map((p) => ({
      ...p,
      _collectionHandle: c.handle,
      _collectionTitle: c.title,
    })),
  );

  const productCount = allProducts.length;
  const collectionCount = visibleCollections.length;

  // Toggle a category on/off
  function toggleCategory(handle) {
    const next = selectedCats.includes(handle)
      ? selectedCats.filter((h) => h !== handle)
      : [...selectedCats, handle];
    const params = new URLSearchParams(searchParams);
    if (next.length > 0) {
      params.set('cats', next.join(','));
    } else {
      params.delete('cats');
    }
    setSearchParams(params, {preventScrollReset: true});
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams);
    params.delete('cats');
    setSearchParams(params, {preventScrollReset: true});
  }

  return (
    <div className="pk-explore">
      <nav className="pk-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="pk-breadcrumbs__sep">/</span>
        <span className="pk-breadcrumbs__current">Explore</span>
      </nav>

      <header className="pk-explore__header">
        <h1 className="pk-explore__title">Explore the full catalog</h1>
        <p className="pk-explore__count">
          Showing {productCount} {productCount === 1 ? 'product' : 'products'}{' '}
          across {collectionCount} {collectionCount === 1 ? 'collection' : 'collections'}
        </p>
      </header>

      <div className="pk-explore__body">
        <aside className="pk-explore__filter" aria-label="Category filters">
          <div className="pk-explore__filter-head">
            <span className="pk-explore__filter-title">Categories</span>
            {selectedCats.length > 0 && (
              <button
                type="button"
                className="pk-explore__filter-clear"
                onClick={clearFilters}
              >
                Clear all
              </button>
            )}
          </div>
          <div className="pk-explore__chips">
            {PRODUCT_CATEGORIES.map((handle) => {
              const isActive = selectedCats.length === 0 || selectedCats.includes(handle);
              return (
                <button
                  key={handle}
                  type="button"
                  className={`pk-explore__chip${isActive ? ' is-active' : ''}`}
                  onClick={() => toggleCategory(handle)}
                  aria-pressed={isActive}
                >
                  {handleToLabel(handle)}
                </button>
              );
            })}
          </div>
        </aside>

        <div className="pk-explore__main">
          {productCount === 0 ? (
            <div className="pk-explore__empty">
              <p className="pk-explore__empty-title">No products found</p>
              <p className="pk-explore__empty-body">
                Try selecting different categories to see more products.
              </p>
            </div>
          ) : (
            <div className="pk-explore__grid">
              {allProducts.map((product, index) => (
                <ScrollReveal
                  key={product.id}
                  delay={Math.min(index * 50, 400)}
                  variant="up"
                >
                  <TiltCard className="pk-explore__card">
                    <Link
                      to={`/products/${product.handle}`}
                      prefetch="intent"
                      className="pk-explore__card-link"
                    >
                      <div className="pk-explore__card-media">
                        {product.featuredImage ? (
                          <Image
                            data={product.featuredImage}
                            aspectRatio="1/1"
                            sizes="(min-width: 900px) 33vw, (min-width: 600px) 50vw, 100vw"
                            loading={index < 6 ? 'eager' : 'lazy'}
                            alt={product.featuredImage.altText || product.title}
                          />
                        ) : (
                          <div className="pk-explore__card-placeholder" aria-hidden />
                        )}
                      </div>
                      <div className="pk-explore__card-body">
                        <span className="pk-explore__card-collection">
                          {product._collectionTitle}
                        </span>
                        <h3 className="pk-explore__card-title">{product.title}</h3>
                        <span className="pk-explore__card-price">
                          {formatPrice(product.priceRange?.minVariantPrice)}
                        </span>
                      </div>
                    </Link>
                  </TiltCard>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Format a Storefront API price object into a display string.
 * @param {{amount: string, currencyCode: string} | null | undefined} price
 */
function formatPrice(price) {
  if (!price?.amount || !price?.currencyCode) return '';
  try {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: price.currencyCode,
    }).format(parseFloat(price.amount));
  } catch {
    return price.amount;
  }
}

/** @typedef {import('./+types/explore').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */