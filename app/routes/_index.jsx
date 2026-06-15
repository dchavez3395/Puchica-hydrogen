import {Await, useLoaderData, useFetcher, Link} from 'react-router';
import {Suspense, useEffect, useRef, useState} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {MockShopNotice} from '~/components/MockShopNotice';
import {
  categoryIcon,
  IconTruck,
  IconReturn,
  IconShield,
  IconSparkles,
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

  const trending = context.storefront
    .query(TRENDING_QUERY)
    .catch((error) => {
      console.error(error);
      return null;
    });

  return {bestPicks, trending};
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  return (
    <div className="pk-home">
      {data.isShopLinked ? null : <MockShopNotice />}
      <Hero categories={data.categories} bestPicks={data.bestPicks} />
      <Marquee />
      <ShopByCategory categories={data.categories} />
      <PromoSplit categories={data.categories} />
      <BestPicks products={data.bestPicks} />
      <TrendingRail products={data.trending} />
      <ValueProps />
      <Testimonials />
      <NewsletterBand />
    </div>
  );
}

/* -------------------------------------------------- Hero -------------------------------------------------- */

function Hero({bestPicks}) {
  return (
    <section className="pk-hero pk-hero--bold">
      <div className="pk-hero__glow pk-hero__glow--a" aria-hidden />
      <div className="pk-hero__glow pk-hero__glow--b" aria-hidden />

      <div className="pk-hero__copy">
        <span className="pk-pill pk-pill--glass">
          <IconSparkles size={14} /> New season drop
        </span>
        <h1 className="pk-hero__title pk-hero__title--bold">
          Fresh finds.
          <br />
          <span className="pk-grad-text">Just for you.</span>
        </h1>
        <p className="pk-hero__sub">
          Explore the latest products handpicked for style, quality, and
          everyday living — shipped fast and backed by easy 30-day returns.
        </p>
        <div className="pk-hero__cta-row">
          <Link to="/collections" className="pk-btn pk-btn--primary pk-btn--lg">
            Shop New Arrivals <span aria-hidden>→</span>
          </Link>
          <Link to="/collections/all" className="pk-btn pk-btn--ghost pk-btn--lg">
            Browse everything
          </Link>
        </div>
        <ul className="pk-hero__stats" aria-label="Store highlights">
          <li>
            <strong>10k+</strong>
            <span>Happy customers</span>
          </li>
          <li>
            <strong>4.8★</strong>
            <span>Average rating</span>
          </li>
          <li>
            <strong>Free</strong>
            <span>Shipping over $50</span>
          </li>
        </ul>
      </div>

      <Suspense fallback={<div className="pk-hero__card pk-hero__card--skel" />}>
        <Await resolve={bestPicks}>
          {(response) => {
            const p = response?.products?.nodes?.[0];
            if (!p) return <div className="pk-hero__card pk-hero__card--skel" />;
            return (
              <Link
                to={`/products/${p.handle}`}
                className="pk-hero__card pk-spotlight"
              >
                <span className="pk-pill pk-spotlight__pill">★ New Arrival</span>
                <div className="pk-spotlight__media">
                  {p.featuredImage && (
                    <Image data={p.featuredImage} aspectRatio="1/1" sizes="360px" />
                  )}
                </div>
                <div className="pk-spotlight__body">
                  <h3 className="pk-spotlight__title">{p.title}</h3>
                  <div className="pk-spotlight__row">
                    <div className="pk-spotlight__price">
                      <Money data={p.priceRange.minVariantPrice} />
                    </div>
                    <span className="pk-spotlight__cta" aria-hidden>
                      Shop now →
                    </span>
                  </div>
                </div>
              </Link>
            );
          }}
        </Await>
      </Suspense>
    </section>
  );
}

/* -------------------------------------------------- Marquee -------------------------------------------------- */

function Marquee() {
  const items = [
    'Free shipping over $50',
    'New arrivals weekly',
    '30-day easy returns',
    'Secure checkout',
    'Handpicked quality',
    'Shop smart. Shop Puchica.',
  ];
  // Two copies for a seamless loop; keyed by copy + text (no array index).
  const copies = ['a', 'b'];
  return (
    <div className="pk-marquee" aria-hidden>
      <div className="pk-marquee__track">
        {copies.map((copy) =>
          items.map((t) => (
            <span className="pk-marquee__item" key={`${copy}-${t}`}>
              <span className="pk-marquee__dot">✦</span>
              {t}
            </span>
          )),
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------- Shop by Category -------------------------------------------------- */

function ShopByCategory({categories}) {
  return (
    <section className="pk-section">
      <div className="pk-section__head">
        <div>
          <span className="pk-eyebrow">Browse</span>
          <h2>Shop by Category</h2>
        </div>
        <Link to="/collections" className="pk-section__link">
          View all categories →
        </Link>
      </div>
      <div className="pk-cat-grid">
        {(categories ?? []).slice(0, 4).map((c) => (
          <Link
            key={c.id}
            to={`/collections/${c.handle}`}
            className="pk-cat-card pk-cat-card--bold"
          >
            <span className="pk-cat-card__icon">{categoryIcon(c.title)}</span>
            <div className="pk-cat-card__text">
              <h3>{c.title}</h3>
              <span className="pk-cat-card__cta">Shop now →</span>
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

/* -------------------------------------------------- Promo split banner -------------------------------------------------- */

function PromoSplit({categories}) {
  const list = categories ?? [];
  const feature =
    list.find((c, i) => i >= 4 && c.image) ||
    list.find((c) => c.image) ||
    list[0];
  if (!feature) return null;
  return (
    <section className="pk-promo">
      <div className="pk-promo__panel">
        <span className="pk-pill pk-pill--glass">Featured collection</span>
        <h2 className="pk-promo__title">
          Upgrade your everyday with {feature.title}
        </h2>
        <p className="pk-promo__sub">
          Thoughtfully curated pieces that blend function and style — the
          essentials your space has been missing.
        </p>
        <Link
          to={`/collections/${feature.handle}`}
          className="pk-btn pk-btn--light pk-btn--lg"
        >
          Shop {feature.title} <span aria-hidden>→</span>
        </Link>
      </div>
      <div className="pk-promo__media">
        {feature.image ? (
          <Image data={feature.image} sizes="(min-width: 60em) 520px, 100vw" />
        ) : (
          <div className="pk-promo__media-fallback" />
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------- Best Picks -------------------------------------------------- */

function BestPicks({products}) {
  return (
    <section className="pk-section">
      <div className="pk-section__head">
        <div>
          <span className="pk-eyebrow">Most loved</span>
          <h2>Best Picks</h2>
        </div>
        <Link to="/collections/all" className="pk-section__link">
          View all →
        </Link>
      </div>
      <Suspense fallback={<div className="pk-prod-grid pk-prod-grid--loading" />}>
        <Await resolve={products}>
          {(response) => (
            <div className="pk-prod-grid">
              {(response?.products?.nodes ?? []).map((p, i) => (
                <ProductCard key={p.id} product={p} featured={i === 0} />
              ))}
            </div>
          )}
        </Await>
      </Suspense>
    </section>
  );
}

function ProductCard({product, featured}) {
  const variant = product.variants?.nodes?.[0];
  return (
    <div className="pk-card">
      <Link to={`/products/${product.handle}`} className="pk-card__media">
        {featured && <span className="pk-card__badge">Bestseller</span>}
        {product.featuredImage && (
          <Image
            data={product.featuredImage}
            aspectRatio="1/1"
            sizes="(min-width: 45em) 25vw, 50vw"
          />
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

/* -------------------------------------------------- Trending rail -------------------------------------------------- */

function TrendingRail({products}) {
  return (
    <section className="pk-section">
      <div className="pk-section__head">
        <div>
          <span className="pk-eyebrow">Hot right now</span>
          <h2>Just Dropped</h2>
        </div>
        <Link to="/collections/all" className="pk-section__link">
          See more →
        </Link>
      </div>
      <Suspense fallback={<div className="pk-rail pk-rail--loading" />}>
        <Await resolve={products}>
          {(response) => {
            const nodes = response?.products?.nodes ?? [];
            if (!nodes.length) return null;
            return (
              <div className="pk-rail">
                {nodes.map((p) => (
                  <Link
                    key={p.id}
                    to={`/products/${p.handle}`}
                    className="pk-rail__card"
                  >
                    <div className="pk-rail__media">
                      {p.featuredImage && (
                        <Image
                          data={p.featuredImage}
                          aspectRatio="1/1"
                          sizes="220px"
                        />
                      )}
                    </div>
                    <p className="pk-rail__title">{p.title}</p>
                    <div className="pk-rail__price">
                      <Money data={p.priceRange.minVariantPrice} />
                    </div>
                  </Link>
                ))}
              </div>
            );
          }}
        </Await>
      </Suspense>
    </section>
  );
}

/* -------------------------------------------------- Value props -------------------------------------------------- */

function ValueProps() {
  const items = [
    {Icon: IconTruck, title: 'Free shipping', sub: 'On all orders over $50'},
    {Icon: IconReturn, title: 'Easy 30-day returns', sub: 'No-hassle refunds'},
    {Icon: IconShield, title: 'Secure payments', sub: 'Encrypted checkout'},
    {Icon: IconSparkles, title: 'Handpicked quality', sub: 'Curated, never random'},
  ];
  return (
    <section className="pk-values">
      {items.map(({Icon, title, sub}) => (
        <div key={title} className="pk-values__item">
          <span className="pk-values__icon">
            <Icon size={22} />
          </span>
          <div>
            <p className="pk-values__title">{title}</p>
            <p className="pk-values__sub">{sub}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

/* -------------------------------------------------- Testimonials -------------------------------------------------- */

function Testimonials() {
  const reviews = [
    {
      quote:
        'Genuinely impressed by the quality for the price. Shipping was quick and everything arrived perfectly packaged.',
      name: 'Sofia R.',
      role: 'Verified buyer',
    },
    {
      quote:
        'Puchica has become my go-to for little upgrades around the house. The curation is on point every single time.',
      name: 'Marcus L.',
      role: 'Verified buyer',
    },
    {
      quote:
        'Easy returns made me comfortable trying something new — but I ended up keeping all of it. Highly recommend.',
      name: 'Aisha K.',
      role: 'Verified buyer',
    },
  ];
  return (
    <section className="pk-section">
      <div className="pk-section__head pk-section__head--center">
        <span className="pk-eyebrow">Loved by shoppers</span>
        <h2>What customers are saying</h2>
      </div>
      <div className="pk-reviews">
        {reviews.map((r) => (
          <figure className="pk-review" key={r.name}>
            <div className="pk-review__stars" aria-label="Rated 5 of 5">
              ★★★★★
            </div>
            <blockquote className="pk-review__quote">“{r.quote}”</blockquote>
            <figcaption className="pk-review__by">
              <span className="pk-review__avatar" aria-hidden>
                {r.name.charAt(0)}
              </span>
              <span>
                <strong>{r.name}</strong>
                <em>{r.role}</em>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------- Newsletter band -------------------------------------------------- */

function NewsletterBand() {
  const fetcher = useFetcher();
  const formRef = useRef(null);
  const [done, setDone] = useState(false);
  const submitting = fetcher.state !== 'idle';

  useEffect(() => {
    if (fetcher.data?.ok) {
      setDone(true);
      formRef.current?.reset();
    }
  }, [fetcher.data]);

  return (
    <section className="pk-news">
      <div className="pk-news__glow" aria-hidden />
      <div className="pk-news__inner">
        <span className="pk-pill pk-pill--glass">Join the club</span>
        <h2 className="pk-news__title">
          Get first dibs on new drops &amp; exclusive deals
        </h2>
        <p className="pk-news__sub">
          Subscribe for fresh arrivals and members-only offers, straight to your
          inbox. No spam — unsubscribe anytime.
        </p>

        {done ? (
          <p className="pk-news__success">
            🎉 You’re in! Check your inbox for a welcome note.
          </p>
        ) : (
          <fetcher.Form
            ref={formRef}
            method="post"
            action="/newsletter"
            className="pk-news__form"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              aria-label="Email address"
              className="pk-news__input"
            />
            <button
              type="submit"
              className="pk-btn pk-btn--light pk-btn--lg"
              disabled={submitting}
            >
              {submitting ? 'Joining…' : 'Subscribe'}
            </button>
          </fetcher.Form>
        )}
        {fetcher.data?.error && !done && (
          <p className="pk-news__error">{fetcher.data.error}</p>
        )}
      </div>
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
    collections(first: 6, sortKey: UPDATED_AT, reverse: true) {
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

const TRENDING_QUERY = `#graphql
  fragment TrendingProduct on Product {
    id
    title
    handle
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
  }
  query Trending($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 10, sortKey: CREATED_AT, reverse: true) {
      nodes {
        ...TrendingProduct
      }
    }
  }
`;

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
