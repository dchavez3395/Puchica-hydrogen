import {useLoaderData, Link, useSearchParams} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {puchicaMeta} from '~/lib/seo';
import {ScrollReveal} from '~/components/ScrollReveal';
import {TiltCard} from '~/components/TiltCard';
import {useT} from '~/lib/t';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return puchicaMeta({
    title: 'Explore – Puchica',
    description: 'Filter the Puchica catalog by category. Home, beauty, tech, pet, outdoor — pick what you want, see what we have.',
    pathname: '/explore',
  });
};

/**
 * All active category handles that exist in this Shopify store.
 */
const PRODUCT_CATEGORIES = [
  'home-essentials',
  'beauty-personal-care',
  'tech-gadgets',
  'pet-finds',
  'outdoor-garden',
];

const ALL_COLLECTION_HANDLES = [
  ...PRODUCT_CATEGORIES,
  'best-sellers',
  'trending-finds',
  'gifts-under-25',
];

/**
 * Map handles to clean GraphQL aliases.
 */
function handleToAlias(handle) {
  return handle.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

/**
 * Map handles to translated user-facing names.
 * @param {string} handle
 * @param {(key: string) => string} t
 */
function handleToLabel(handle, t) {
  const CATEGORY_MAP = {
    'home-essentials':     t('explore_cat_home'),
    'beauty-personal-care': t('explore_cat_beauty'),
    'tech-gadgets':        t('explore_cat_tech'),
    'pet-finds':           t('explore_cat_pet'),
    'outdoor-garden':      t('explore_cat_outdoor'),
  };
  return CATEGORY_MAP[handle] || handle
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
 * Query all active collections via Storefront API using GraphQL aliases.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context}) {
  const {country, language} = context.storefront.i18n;
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
    query ExplorePage($country: CountryCode!, $language: LanguageCode!) @inContext(country: $country, language: $language) {
${aliasLines}
    }
  `;

  const data = await context.storefront.query(query, {variables: {country, language}});
  return {collections: data};
}

function loadDeferredData() {
  return {};
}

export default function ExplorePage() {
  /** @type {LoaderReturnData} */
  const {collections} = useLoaderData();
  const t = useT();
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

  // Flatten all products from visible collections and de-duplicate by ID
  const productMap = new Map();
  visibleCollections.forEach((c) => {
    (c.products?.nodes ?? []).forEach((p) => {
      if (!productMap.has(p.id)) {
        productMap.set(p.id, {
          ...p,
          _collectionHandle: c.handle,
          _collectionTitle: c.title,
        });
      }
    });
  });

  const allProducts = Array.from(productMap.values());
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
      <nav className="pk-breadcrumbs" aria-label={t('breadcrumb_aria')}>
        <Link to="/">{t('explore_home')}</Link>
        <span className="pk-breadcrumbs__sep">/</span>
        <span className="pk-breadcrumbs__current">{t('explore_breadcrumb')}</span>
      </nav>

      <header className="pk-explore__header">
        <div className="pk-explore__glow" aria-hidden />
        <span className="pk-explore__eyebrow">{t('explore_eyebrow')}</span>
        <h1 className="pk-explore__title">{t('explore_title')}</h1>
        <p className="pk-explore__count">
          {t('explore_showing')} <strong>{productCount}</strong>{' '}
          {productCount === 1 ? t('explore_product_singular') : t('explore_product_plural')}{' '}
          {t('explore_across')} <strong>{collectionCount}</strong>{' '}
          {collectionCount === 1 ? t('explore_count_active_cat_singular') : t('explore_count_active_cat_plural')}
        </p>
      </header>

      <div className="pk-explore__body">
        <aside className="pk-explore__filter" aria-label={t('explore_cat_filter_aria')}>
          <div className="pk-explore__filter-card">
            <div className="pk-explore__filter-head">
              <span className="pk-explore__filter-title">{t('explore_filter_title')}</span>
              {selectedCats.length > 0 && (
                <button
                  type="button"
                  className="pk-explore__filter-clear"
                  onClick={clearFilters}
                >
                  {t('explore_filter_clear')}
                </button>
              )}
            </div>
            <div className="pk-explore__chips">
              {PRODUCT_CATEGORIES.map((handle) => {
                const isFiltered = selectedCats.includes(handle);
                return (
                  <button
                    key={handle}
                    type="button"
                    className={`pk-explore__chip${isFiltered ? ' is-active' : ''}`}
                    onClick={() => toggleCategory(handle)}
                    aria-pressed={isFiltered}
                  >
                    <span className="pk-explore__chip-bullet" style={{
                      backgroundColor: isFiltered ? 'var(--pk-lime, #D0FF50)' : 'var(--pk-border, #E5E0F0)'
                    }} />
                    {handleToLabel(handle, t)}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="pk-explore__main">
          {productCount === 0 ? (
            <div className="pk-explore__empty">
              <span className="pk-explore__empty-icon">🔍</span>
              <h2 className="pk-explore__empty-title">{t('explore_empty_title')}</h2>
              <p className="pk-explore__empty-body">{t('explore_empty_body')}</p>
              <button
                type="button"
                className="pk-btn pk-btn--primary"
                style={{marginTop: 20}}
                onClick={clearFilters}
              >
                {t('explore_empty_reset')}
              </button>
            </div>
          ) : (
            <div className="pk-explore__grid">
              {allProducts.map((product, index) => (
                <ScrollReveal
                  key={product.id}
                  delay={Math.min(index * 40, 300)}
                  variant="up"
                >
                  <TiltCard className="pk-explore__card" maxTilt={6}>
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
                        <span className="pk-explore__card-badge">{t('explore_view_details')}</span>
                      </div>
                      <div className="pk-explore__card-body">
                        <span className="pk-explore__card-collection">
                          {product._collectionTitle}
                        </span>
                        <h3 className="pk-explore__card-title">{product.title}</h3>
                        <div className="pk-explore__card-foot">
                          <span className="pk-explore__card-price">
                            {formatPrice(product.priceRange?.minVariantPrice)}
                          </span>
                        </div>
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