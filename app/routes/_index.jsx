import {Await, useLoaderData, Link} from 'react-router';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {MockShopNotice} from '~/components/MockShopNotice';
import {
  categoryIcon,
  IconTruck,
  IconReturn,
  IconShield,
  IconHeart,
} from '~/components/Icons';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Puchica – Shop Smart. Shop Puchica.'}];
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
async function loadCriticalData({context}) {
  const [{collections}] = await Promise.all([
    context.storefront.query(HOME_COLLECTIONS_QUERY),
  ]);

  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
    categories: collections.nodes,
  };
}

/**
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  const bestPicks = context.storefront
    .query(BEST_PICKS_QUERY)
    .catch((error) => {
      console.error(error);
      return null;
    });

  return {bestPicks};
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  return (
    <div className="pk-home">
      {data.isShopLinked ? null : <MockShopNotice />}
      <Hero categories={data.categories} bestPicks={data.bestPicks} />
      <ShopByCategory categories={data.categories} />
      <BestPicks products={data.bestPicks} />
      <TrustBar />
    </div>
  );
}

/* -------------------------------------------------- Hero -------------------------------------------------- */

function Hero({categories, bestPicks}) {
  return (
    <section className="pk-hero">
      <div className="pk-hero__copy">
        <span className="pk-pill">New Arrivals</span>
        <h1 className="pk-hero__title">
          Fresh finds.
          <br />
          Just for you.
        </h1>
        <p className="pk-hero__sub">
          Explore the latest products handpicked for style, quality, and
          everyday living.
        </p>
        <Link to="/collections" className="pk-btn pk-btn--primary">
          Shop New Arrivals <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="pk-hero__art" aria-hidden>
        <div className="pk-hero__blob" />
      </div>

      <Suspense fallback={<div className="pk-hero__card pk-hero__card--skel" />}>
        <Await resolve={bestPicks}>
          {(response) => {
            const p = response?.products?.nodes?.[0];
            if (!p) return <div className="pk-hero__card pk-hero__card--skel" />;
            return (
              <Link to={`/products/${p.handle}`} className="pk-hero__card pk-spotlight">
                <span className="pk-pill pk-spotlight__pill">New Arrival</span>
                <div className="pk-spotlight__media">
                  {p.featuredImage && (
                    <Image data={p.featuredImage} aspectRatio="1/1" sizes="320px" />
                  )}
                </div>
                <div className="pk-spotlight__body">
                  <h3 className="pk-spotlight__title">{p.title}</h3>
                  <div className="pk-spotlight__price">
                    <Money data={p.priceRange.minVariantPrice} />
                  </div>
                  <span className="pk-spotlight__cta">Shop now →</span>
                </div>
              </Link>
            );
          }}
        </Await>
      </Suspense>
    </section>
  );
}

/* -------------------------------------------------- Shop by Category -------------------------------------------------- */

function ShopByCategory({categories}) {
  return (
    <section className="pk-section">
      <div className="pk-section__head">
        <h2>Shop by Category</h2>
        <Link to="/collections" className="pk-section__link">
          View all categories →
        </Link>
      </div>
      <div className="pk-cat-grid">
        {(categories ?? []).slice(0, 4).map((c) => (
          <Link key={c.id} to={`/collections/${c.handle}`} className="pk-cat-card">
            <div className="pk-cat-card__text">
              <span className="pk-cat-card__icon">{categoryIcon(c.title)}</span>
              <h3>{c.title}</h3>
              <span className="pk-cat-card__cta">Shop {c.title}</span>
            </div>
            {c.image && (
              <div className="pk-cat-card__img">
                <Image data={c.image} sizes="200px" alt={c.image.altText || c.title} />
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------- Best Picks -------------------------------------------------- */

function BestPicks({products}) {
  return (
    <section className="pk-section">
      <div className="pk-section__head">
        <h2>Best Picks</h2>
        <Link to="/collections/all" className="pk-section__link">
          View all →
        </Link>
      </div>
      <Suspense fallback={<div className="pk-prod-grid pk-prod-grid--loading" />}>
        <Await resolve={products}>
          {(response) => (
            <div className="pk-prod-grid">
              {(response?.products?.nodes ?? []).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </Await>
      </Suspense>
    </section>
  );
}

function ProductCard({product}) {
  const variant = product.variants?.nodes?.[0];
  return (
    <div className="pk-card">
      <Link to={`/products/${product.handle}`} className="pk-card__media">
        {product.featuredImage && (
          <Image data={product.featuredImage} aspectRatio="1/1" sizes="(min-width: 45em) 25vw, 50vw" />
        )}
        <button className="pk-card__heart" aria-label="Save" type="button">
          <IconHeart size={16} />
        </button>
      </Link>
      <div className="pk-card__body">
        <Link to={`/products/${product.handle}`} className="pk-card__title">
          {product.title}
        </Link>
        {product.vendor && <p className="pk-card__vendor">{product.vendor}</p>}
        <div className="pk-card__price">
          <Money data={product.priceRange.minVariantPrice} />
        </div>
        <div className="pk-card__rating" aria-label="Rated 4.5 of 5">
          <span className="pk-stars">★★★★½</span>
          <span className="pk-card__reviews">(120)</span>
        </div>
        {variant ? (
          <div className="pk-card__cart">
            <AddToCartButton
              lines={[{merchandiseId: variant.id, quantity: 1}]}
              disabled={!variant.availableForSale}
            >
              Add to Cart
            </AddToCartButton>
          </div>
        ) : (
          <Link to={`/products/${product.handle}`} className="pk-card__viewbtn">
            View
          </Link>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------- Trust bar -------------------------------------------------- */

function TrustBar() {
  const items = [
    {Icon: IconTruck, title: 'Free Shipping', sub: 'On orders over $50'},
    {Icon: IconReturn, title: 'Easy Returns', sub: '30-day return policy'},
    {Icon: IconShield, title: 'Secure Payments', sub: 'Shop with confidence'},
  ];
  return (
    <section className="pk-trust">
      {items.map(({Icon, title, sub}) => (
        <div key={title} className="pk-trust__item">
          <span className="pk-trust__icon">
            <Icon size={22} />
          </span>
          <div>
            <p className="pk-trust__title">{title}</p>
            <p className="pk-trust__sub">{sub}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

/* -------------------------------------------------- queries -------------------------------------------------- */

const HOME_COLLECTIONS_QUERY = `#graphql
  fragment HomeCollection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }
  query HomeCollections($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...HomeCollection
      }
    }
  }
`;

const BEST_PICKS_QUERY = `#graphql
  fragment BestPick on Product {
    id
    title
    handle
    vendor
    priceRange {
      minVariantPrice {
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
    variants(first: 1) {
      nodes {
        id
        availableForSale
      }
    }
  }
  query BestPicks($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: BEST_SELLING) {
      nodes {
        ...BestPick
      }
    }
  }
`;

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
