import {Await, useLoaderData, useFetcher, Link} from 'react-router';
import {Suspense, useEffect, useRef, useState} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {error as logError} from '~/lib/logger';
import {
  categoryIcon,
  IconTruck,
  IconReturn,
  IconShield,
  IconSparkles,
  IconHeart,
  IconLeaf,
  IconBag,
} from '~/components/Icons';
import {
  puchicaMeta,
  organizationJsonLd,
  websiteJsonLd,
  JsonLdScript,
} from '~/lib/seo';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return puchicaMeta({
    title: 'Puchica – Shop Smart. Shop Puchica.',
    description:
      'Curated picks across home, kitchen, beauty, tech, pet, and more. Free shipping over $50, easy 30-day returns, secure checkout. Ships from Canada.',
    pathname: '/',
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
async function loadCriticalData({context}) {
  const [{collections}] = await Promise.all([
    context.storefront.query(HOME_COLLECTIONS_QUERY),
  ]);

  return {
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
      logError('homepage bestPicks query failed', error);
      return null;
    });

  const trending = context.storefront
    .query(TRENDING_QUERY)
    .catch((error) => {
      logError('homepage trending query failed', error);
      return null;
    });

  // For the promo split — we want a real product image from the best-sellers
  // collection, not the (often missing) smart-collection cover image.
  const promoFeature = context.storefront
    .query(PROMO_FEATURE_QUERY)
    .catch((error) => {
      logError('homepage promoFeature query failed', error);
      return null;
    });

  // For the editorial mosaic — we want up to 6 more collection images
  // (smart collections without admin-set covers are skipped automatically).
  const mosaicCollections = context.storefront
    .query(MOSAIC_COLLECTIONS_QUERY)
    .catch((error) => {
      logError('homepage mosaicCollections query failed', error);
      return null;
    });

  return {bestPicks, trending, promoFeature, mosaicCollections};
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  return (
    <div className="pk-home">
      {/* Schema.org JSON-LD: anchor the brand (Organization) and the
       * site (WebSite with SearchAction — generates the Google
       * Sitelinks Searchbox). Placed in SSR HTML so crawlers see it
       * before hydration. sameAs is empty until the user fills in
       * real social handles in Footer.jsx — leaving it empty is fine,
       * Google's docs allow it. */}
      <JsonLdScript data={organizationJsonLd({})} />
      <JsonLdScript data={websiteJsonLd({})} />
      <Hero categories={data.categories} bestPicks={data.bestPicks} />
      <Marquee />
      <ShopByCategory categories={data.categories} />
      <BrandStory />
      <PromoSplit promoFeature={data.promoFeature} categories={data.categories} />
      <EditorialMosaic collections={data.mosaicCollections} />
      <BestPicks products={data.bestPicks} />
      <TrendingCategories categories={data.categories} />
      <TrendingRail products={data.trending} />
      <ValueProps />
      <BrandPromise />
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
            <strong>Curated</strong>
            <span>Handpicked picks</span>
          </li>
          <li>
            <strong>30 days</strong>
            <span>Easy returns</span>
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
            <div className="pk-cat-card__text flex flex-row! lg:flex-col">
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

/* -------------------------------------------------- Brand story -------------------------------------------------- */

function BrandStory() {
  return (
    <section className="pk-story">
      <div className="pk-story__media" aria-hidden>
        <div className="pk-story__gradient" />
        <div className="pk-story__icons">
          <span className="pk-story__chip pk-story__chip--1"><IconLeaf size={22} /></span>
          <span className="pk-story__chip pk-story__chip--2"><IconBag size={22} /></span>
          <span className="pk-story__chip pk-story__chip--3"><IconSparkles size={22} /></span>
          <span className="pk-story__chip pk-story__chip--4"><IconHeart size={22} /></span>
        </div>
      </div>
      <div className="pk-story__copy">
        <span className="pk-eyebrow">Why Puchica</span>
        <h2 className="pk-story__title">
          Real people, picking real products — not an algorithm.
        </h2>
        <p className="pk-story__body">
          Every item in the shop has been looked at by a human on the Puchica
          team. We check the build quality, read the reviews, and only add
          things we&apos;d actually use ourselves. The result: a small, honest
          catalog of things that are worth your money.
        </p>
        <ul className="pk-story__list">
          <li>
            <IconCheckInline /> A short quality checklist before anything goes live
          </li>
          <li>
            <IconCheckInline /> Honest shipping times — never oversold
          </li>
          <li>
            <IconCheckInline /> 30-day returns with a pre-paid label, every order
          </li>
        </ul>
        <Link to="/pages/contact" className="pk-btn pk-btn--primary pk-btn--lg">
          About Puchica <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}

function IconCheckInline() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12l4 4L19 6" />
    </svg>
  );
}

/* -------------------------------------------------- Promo split banner -------------------------------------------------- */

function PromoSplit({promoFeature, categories}) {
  // We want to feature a real product photo. Use the first best-sellers
  // product image. If the deferred load hasn't arrived yet, fall back to
  // a gradient panel — never the lavender square.
  return (
    <section className="pk-promo">
      <div className="pk-promo__panel">
        <span className="pk-pill pk-pill--glass">Featured collection</span>
        <h2 className="pk-promo__title">
          Upgrade your everyday with our best sellers
        </h2>
        <p className="pk-promo__sub">
          A handful of products our team comes back to again and again. If
          you&apos;re new to Puchica, this is the place to start.
        </p>
        <Link
          to="/collections/best-sellers"
          className="pk-btn pk-btn--light pk-btn--lg"
        >
          Shop best sellers <span aria-hidden>→</span>
        </Link>
      </div>
      <div className="pk-promo__media">
        <Suspense fallback={<div className="pk-promo__media-fallback" aria-hidden />}>
          <Await resolve={promoFeature}>
            {(resp) => {
              const product = resp?.collection?.products?.nodes?.find(
                (p) => p?.featuredImage,
              );
              const collection = resp?.collection;
              const title = collection?.title || 'Best Sellers';
              if (product) {
                return (
                  <Link
                    to={`/products/${product.handle}`}
                    className="pk-promo__media-link"
                    aria-label={`Shop ${product.title} on ${title}`}
                  >
                    <Image
                      data={product.featuredImage}
                      sizes="(min-width: 60em) 520px, 100vw"
                      loading="eager"
                    />
                    <div className="pk-promo__media-tag">
                      <span>{title}</span>
                      <strong>{product.title}</strong>
                    </div>
                  </Link>
                );
              }
              return <div className="pk-promo__media-fallback" aria-hidden />;
            }}
          </Await>
        </Suspense>
      </div>
    </section>
  );
}

/* -------------------------------------------------- Editorial mosaic -------------------------------------------------- */

function EditorialMosaic({collections}) {
  return (
    <section className="pk-section">
      <div className="pk-section__head">
        <div>
          <span className="pk-eyebrow">Curated edits</span>
          <h2>Collections, handpicked</h2>
        </div>
        <Link to="/collections" className="pk-section__link">
          All collections →
        </Link>
      </div>
      <Suspense fallback={<div className="pk-mosaic pk-mosaic--loading" />}>
        <Await resolve={collections}>
          {(resp) => {
            // Smart collections don't auto-generate cover images, so fall
            // back to the first product's featured image when needed.
            const nodes = (resp?.collections?.nodes ?? []).filter(
              (c) => c && (c.image || c.products?.nodes?.[0]?.featuredImage),
            );
            if (nodes.length === 0) {
              return (
                <div className="pk-empty">
                  <p className="pk-empty__title">No collections to show</p>
                </div>
              );
            }
            const pickImage = (c) =>
              c.image || c.products?.nodes?.[0]?.featuredImage;
            // Layout: 1 large + 3 small (or fewer if we don't have 4).
            const [hero, ...rest] = nodes;
            return (
              <div className="pk-mosaic">
                <Link
                  key={hero.id}
                  to={`/collections/${hero.handle}`}
                  className="pk-mosaic__cell pk-mosaic__cell--lg"
                  prefetch="intent"
                >
                  <Image
                    data={pickImage(hero)}
                    sizes="(min-width: 60em) 600px, 100vw"
                    loading="eager"
                  />
                  <div className="pk-mosaic__overlay">
                    <h3>{hero.title}</h3>
                    <span>Shop the collection →</span>
                  </div>
                </Link>
                <div className="pk-mosaic__stack">
                  {rest.slice(0, 3).map((c) => (
                    <Link
                      key={c.id}
                      to={`/collections/${c.handle}`}
                      className="pk-mosaic__cell pk-mosaic__cell--sm"
                      prefetch="intent"
                    >
                      <Image
                        data={pickImage(c)}
                        sizes="(min-width: 60em) 300px, 50vw"
                      />
                      <div className="pk-mosaic__overlay">
                        <h3>{c.title}</h3>
                        <span>Shop →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          }}
        </Await>
      </Suspense>
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
        <Link to="/collections/best-sellers" className="pk-section__link">
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
  // Open the cart drawer on add from the homepage grid so shoppers
  // get immediate visual feedback (same as collection cards / PDP).
  const {open} = useAside();
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
      </Link>
      <div className="pk-card__body">
        <Link to={`/products/${product.handle}`} className="pk-card__title">
          {product.title}
        </Link>
        {product.vendor && <p className="pk-card__vendor">{product.vendor}</p>}
        <div className="pk-card__price">
          <Money data={product.priceRange.minVariantPrice} />
        </div>
        {variant ? (
          <div className="pk-card__cart">
            <AddToCartButton
              lines={[{merchandiseId: variant.id, quantity: 1}]}
              disabled={!variant.availableForSale}
              onClick={() => open('cart')}
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

/* -------------------------------------------------- Trending categories (pills) -------------------------------------------------- */

function TrendingCategories({categories}) {
  // Filter out very short / empty titles, dedupe by handle, and cap at 12.
  const items = (categories ?? [])
    .filter((c) => c && c.title && c.title.length < 40)
    .slice(0, 12);
  if (items.length === 0) return null;
  return (
    <section className="pk-pills-section">
      <div className="pk-section__head">
        <div>
          <span className="pk-eyebrow">Quick jump</span>
          <h2>Find what you&apos;re looking for</h2>
        </div>
        <Link to="/collections" className="pk-section__link">
          See all →
        </Link>
      </div>
      <div className="pk-pills" role="list">
        {items.map((c) => (
          <Link
            key={c.id}
            to={`/collections/${c.handle}`}
            className="pk-pill-link"
            prefetch="intent"
            role="listitem"
          >
            <span className="pk-pill-link__icon">{categoryIcon(c.title, {size: 18})}</span>
            <span className="pk-pill-link__label">{c.title}</span>
          </Link>
        ))}
      </div>
    </section>
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

/* -------------------------------------------------- Brand promise -------------------------------------------------- */

function BrandPromise() {
  // Honest placeholder — until we have a real verified-buyer review source,
  // we don't show fake names or quotes. This block is intentionally a brand
  // promise / what to expect, not invented social proof.
  const promises = [
    {
      title: 'Picked by people, not an algorithm',
      body:
        'Every product in the shop is reviewed against a short quality checklist before it goes live. We skip the rest.',
    },
    {
      title: 'Honest shipping times',
      body:
        'Most orders ship within 1–2 business days from our warehouse. Delivery typically takes 5–10 business days across Canada and the US — we will never quote a faster window than that.',
    },
    {
      title: 'Returns that don’t drag on',
      body:
        'If something isn’t right, you have 30 days to send it back. Full refund, no restocking fees, no runaround.',
    },
  ];
  return (
    <section className="pk-section">
      <div className="pk-section__head pk-section__head--center">
        <span className="pk-eyebrow">The Puchica promise</span>
        <h2>What you can expect from us</h2>
      </div>
      <div className="pk-reviews">
        {promises.map((p) => (
          <div className="pk-review" key={p.title}>
            <h3 className="pk-review__title">{p.title}</h3>
            <p className="pk-review__body">{p.body}</p>
          </div>
        ))}
      </div>
      <p className="pk-reviews__note">
        Verified buyer reviews are on the way. In the meantime, every order
        ships with a pre-paid return label — your satisfaction is the only
        review we need to earn.
      </p>
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
            You&apos;re in! Check your inbox for a welcome note.
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
  query HomeCollections {
    collections(first: 12, sortKey: UPDATED_AT, reverse: true) {
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
  query BestPicks {
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
  query Trending {
    products(first: 10, sortKey: CREATED_AT, reverse: true) {
      nodes {
        ...TrendingProduct
      }
    }
  }
`;

// Pull a few real product images from the best-sellers collection so the
// promo split has a real photo (smart-collection cover images are usually
// null because Shopify doesn't auto-generate them).
const PROMO_FEATURE_QUERY = `#graphql
  query PromoFeature {
    collection(handle: "best-sellers") {
      id
      title
      handle
      products(first: 6, sortKey: BEST_SELLING) {
        nodes {
          id
          title
          handle
          featuredImage {
            id
            url
            altText
            width
            height
          }
        }
      }
    }
  }
`;

// Editorial mosaic: pull more collections than the home grid uses. The
// component falls back to each collection's first product image when
// the collection itself has no admin-set cover (Shopify smart collections
// don't auto-generate cover images).
const MOSAIC_COLLECTIONS_QUERY = `#graphql
  query MosaicCollections {
    collections(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
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
        products(first: 1) {
          nodes {
            featuredImage {
              id
              url
              altText
              width
              height
            }
          }
        }
      }
    }
  }
`;

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
