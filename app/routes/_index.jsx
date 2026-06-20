import {Await, useLoaderData, useFetcher, Link} from 'react-router';
import {Suspense, useEffect, useRef, useState} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import {error as logError} from '~/lib/logger';
import {IconTruck, IconReturn, IconShield, IconSparkles} from '~/components/Icons';
import {puchicaMeta, organizationJsonLd, websiteJsonLd, JsonLdScript} from '~/lib/seo';

/** @type {Route.MetaFunction} */
export const meta = () => {
  return puchicaMeta({
    title: 'Puchica – Shop Smart. Shop Puchica.',
    description:
      'Curated picks across home, kitchen, beauty, tech, pet, and more. Free shipping over $50, easy 30-day returns, secure checkout. Ships from Canada.',
    pathname: '/',
  });
};

/** @param {Route.LoaderArgs} args */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData() {
  return {};
}

function loadDeferredData({context}) {
  const bestPicks = context.storefront
    .query(BEST_PICKS_QUERY)
    .catch((e) => { logError('bestPicks query failed', e); return null; });

  const trending = context.storefront
    .query(TRENDING_QUERY)
    .catch((e) => { logError('trending query failed', e); return null; });

  const catWorld = context.storefront
    .query(CAT_WORLD_QUERY)
    .catch((e) => { logError('catWorld query failed', e); return null; });

  return {bestPicks, trending, catWorld};
}

export default function Index() {
  const data = useLoaderData();
  return (
    <div className="pk-home">
      <JsonLdScript data={organizationJsonLd({})} />
      <JsonLdScript data={websiteJsonLd({})} />

      {/* 1 — Full-viewport dark hero */}
      <MegaHero trending={data.trending} />

      {/* 2 — Scrolling marquee */}
      <Marquee />

      {/* 3 — Transition: dark → lavender */}
      <WaveDivider above="#160F3A" below="#F0ECFF" />

      {/* 4 — Tinder-style product swiper */}
      <Suspense fallback={<div style={{height: 640, background: '#F0ECFF'}} />}>
        <Await resolve={data.trending}>
          {(res) => <SwipeShop products={res?.products?.nodes ?? []} />}
        </Await>
      </Suspense>

      {/* 5 — Transition: lavender → white */}
      <WaveDivider above="#F0ECFF" below="#ffffff" />

      {/* 6 — Full-bleed category sections */}
      <Suspense fallback={null}>
        <Await resolve={data.catWorld}>
          {(res) => <CategoryWorlds res={res} />}
        </Await>
      </Suspense>

      {/* 7 — Best-sellers dark band */}
      <Suspense fallback={null}>
        <Await resolve={data.bestPicks}>
          {(res) => <FeaturedBanner products={res?.products?.nodes ?? []} />}
        </Await>
      </Suspense>

      {/* 8 — Trust signals */}
      <ValueProps />

      {/* 9 — Newsletter */}
      <NewsletterBand />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   WAVE DIVIDER
───────────────────────────────────────────────────────────────── */
function WaveDivider({above, below}) {
  return (
    <div className="pk-wave-divider" style={{background: below}}>
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden>
        <path
          d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,0 L0,0 Z"
          fill={above}
        />
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MEGA HERO
───────────────────────────────────────────────────────────────── */
function MegaHero({trending}) {
  return (
    <section className="pk-mega-hero">
      <div className="pk-mega-hero__glow pk-mega-hero__glow--a" aria-hidden />
      <div className="pk-mega-hero__glow pk-mega-hero__glow--b" aria-hidden />

      <div className="pk-mega-hero__copy">
        <span className="pk-mega-hero__eyebrow">✦ New arrivals every week</span>
        <h1 className="pk-mega-hero__title">
          Everything you need,
          <br />
          <em>picked for you.</em>
        </h1>
        <p className="pk-mega-hero__sub">
          Puchica is a curated shop for everyday life — home, beauty, tech,
          pet and more. Handpicked by real people who care about quality.
          Ships from Canada.
        </p>
        <div className="pk-mega-hero__ctas">
          <Link to="/collections" className="pk-btn pk-btn--spark pk-btn--lg">
            Shop Now <span aria-hidden>→</span>
          </Link>
          <Link to="/collections/all" className="pk-btn pk-btn--ghost pk-btn--lg">
            Browse All
          </Link>
        </div>
        <ul className="pk-mega-hero__stats" aria-label="Store highlights">
          <li>
            <strong>500+</strong>
            <span>Products</span>
          </li>
          <li>
            <strong>Free</strong>
            <span>Shipping $50+</span>
          </li>
          <li>
            <strong>30 days</strong>
            <span>Easy returns</span>
          </li>
        </ul>
      </div>

      <div className="pk-mega-hero__visual" aria-hidden>
        <Suspense fallback={<div className="pk-float-grid" />}>
          <Await resolve={trending}>
            {(res) => {
              const items = res?.products?.nodes?.slice(0, 4) ?? [];
              if (!items.length) return null;
              return (
                <div className="pk-float-grid">
                  {items.map((p) => (
                    <Link key={p.id} to={`/products/${p.handle}`} className="pk-float-card">
                      <div className="pk-float-card__media">
                        {p.featuredImage && (
                          <Image data={p.featuredImage} aspectRatio="4/5" sizes="180px" />
                        )}
                      </div>
                      <div className="pk-float-card__body">
                        <p className="pk-float-card__title">{p.title}</p>
                        <p className="pk-float-card__price">
                          <Money data={p.priceRange.minVariantPrice} />
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              );
            }}
          </Await>
        </Suspense>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MARQUEE
───────────────────────────────────────────────────────────────── */
function Marquee() {
  const items = [
    'Free shipping over $50',
    'New arrivals weekly',
    '30-day easy returns',
    'Secure checkout',
    'Handpicked quality',
    'Ships from Canada',
    'Shop smart. Shop Puchica.',
  ];
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

/* ─────────────────────────────────────────────────────────────────
   SWIPE SHOP — Tinder-style product browser
───────────────────────────────────────────────────────────────── */
function SwipeShop({products}) {
  const [idx, setIdx] = useState(0);
  const [exiting, setExiting] = useState(null); // 'left' | 'right'

  if (!products?.length) return null;

  const total = products.length;
  const cur = products[idx % total];
  const b1 = products[(idx + 1) % total];
  const b2 = products[(idx + 2) % total];

  const advance = (dir) => {
    setExiting(dir);
    setTimeout(() => {
      setIdx((i) => (i + 1) % total);
      setExiting(null);
    }, 370);
  };

  return (
    <section className="pk-swipe-shop">
      <div className="pk-swipe-shop__head">
        <span className="pk-eyebrow">Just for You</span>
        <h2>Find Your Next Favourite Thing</h2>
        <p>Browse handpicked products one at a time</p>
      </div>

      <div className="pk-swipe-stage" role="region" aria-label="Product browser">
        {/* Back cards for depth */}
        <div className="pk-swipe-card pk-swipe-card--back2">
          {b2?.featuredImage && (
            <div className="pk-swipe-card__media">
              <Image data={b2.featuredImage} aspectRatio="3/4" sizes="340px" />
            </div>
          )}
        </div>
        <div className="pk-swipe-card pk-swipe-card--back1">
          {b1?.featuredImage && (
            <div className="pk-swipe-card__media">
              <Image data={b1.featuredImage} aspectRatio="3/4" sizes="340px" />
            </div>
          )}
        </div>

        {/* Front (active) card */}
        <Link
          to={`/products/${cur.handle}`}
          className={`pk-swipe-card pk-swipe-card--front${
            exiting ? ` pk-swipe-card--exit-${exiting}` : ''
          }`}
        >
          {cur.featuredImage && (
            <div className="pk-swipe-card__media">
              <Image data={cur.featuredImage} aspectRatio="3/4" sizes="340px" />
            </div>
          )}
          <div className="pk-swipe-card__info">
            <p className="pk-swipe-card__name">{cur.title}</p>
            <p className="pk-swipe-card__price">
              <Money data={cur.priceRange.minVariantPrice} />
            </p>
          </div>
        </Link>
      </div>

      <div className="pk-swipe-controls">
        <button
          type="button"
          className="pk-swipe-btn pk-swipe-btn--pass"
          onClick={() => advance('left')}
          aria-label="Skip this product"
        >
          ✕
        </button>
        <span className="pk-swipe-counter">
          {(idx % total) + 1} / {total}
        </span>
        <button
          type="button"
          className="pk-swipe-btn pk-swipe-btn--like"
          onClick={() => advance('right')}
          aria-label="Next product"
        >
          ♥
        </button>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   CATEGORY WORLDS — full-bleed alternating sections
───────────────────────────────────────────────────────────────── */
// Keyed by collection handle — matches your actual Shopify collections
const CAT_META = {
  'home-essentials': {
    bg: '#FFF5E0', accent: '#FFE090',
    tagline: 'Make your space a place you love.',
    emoji: '🏠',
  },
  'beauty-personal-care': {
    bg: '#FFF0F5', accent: '#FFD0E5',
    tagline: 'Feel good from the inside out.',
    emoji: '✨',
  },
  'tech-gadgets': {
    bg: '#EEF2FF', accent: '#C8D4FF',
    tagline: 'Smarter tools for everyday life.',
    emoji: '💡',
  },
  'outdoor-garden': {
    bg: '#EDFFF6', accent: '#B0F0D0',
    tagline: 'Get outside. Live better.',
    emoji: '🌿',
  },
  'pet-finds': {
    bg: '#EFFFEF', accent: '#B8F0B8',
    tagline: 'Because they deserve the best too.',
    emoji: '🐾',
  },
};

function catMeta(handle = '') {
  return CAT_META[handle] ?? {bg: '#F0ECFF', accent: '#D6CEF8', tagline: 'Curated with care, just for you.', emoji: '⭐'};
}

// Ordered list of the 5 real category collections, keyed by query alias
const CAT_ORDER = ['home', 'beauty', 'tech', 'outdoor', 'pet'];

function CategoryWorlds({res}) {
  const withProducts = CAT_ORDER
    .map((key) => res?.[key])
    .filter((c) => c && (c.products?.nodes?.length ?? 0) > 0)
    .slice(0, 4);

  if (!withProducts.length) return null;

  return (
    <>
      {withProducts.map((col, i) => {
        const meta = catMeta(col.handle);
        const flip = i % 2 === 1;
        return (
          <section
            key={col.id}
            className={`pk-cat-world${flip ? ' pk-cat-world--flip' : ''}`}
            style={{background: meta.bg}}
          >
            <div className="pk-cat-world__copy">
              <p className="pk-cat-world__eyebrow">
                {meta.emoji} {col.title}
              </p>
              <h2 className="pk-cat-world__title">{meta.tagline}</h2>
              <p className="pk-cat-world__body">
                {col.description ||
                  `Explore our handpicked ${col.title.toLowerCase()} essentials — chosen for quality, value, and everyday use.`}
              </p>
              <Link
                to={`/collections/${col.handle}`}
                className="pk-btn pk-btn--primary"
                style={{alignSelf: 'flex-start', marginTop: 4}}
              >
                Shop {col.title} →
              </Link>
            </div>
            <div
              className="pk-cat-world__products"
              style={{background: meta.accent}}
            >
              {col.products.nodes.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.handle}`}
                  className="pk-cat-world__card"
                >
                  {p.featuredImage && (
                    <Image data={p.featuredImage} aspectRatio="1/1" sizes="180px" />
                  )}
                  <div className="pk-cat-world__card-info">
                    <p className="pk-cat-world__card-name">{p.title}</p>
                    <p className="pk-cat-world__card-price">
                      <Money data={p.priceRange.minVariantPrice} />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   FEATURED BANNER — dark best-sellers showcase
───────────────────────────────────────────────────────────────── */
function FeaturedBanner({products}) {
  if (!products?.length) return null;
  return (
    <section className="pk-feat-banner">
      <div className="pk-feat-banner__copy">
        <p className="pk-feat-banner__label">★ Best Sellers</p>
        <h2 className="pk-feat-banner__title">
          Our most-loved products, all in one place.
        </h2>
        <p className="pk-feat-banner__sub">
          These are the products our customers keep coming back for — tried,
          tested, and genuinely worth it.
        </p>
        <Link
          to="/collections/best-sellers"
          className="pk-btn pk-btn--spark pk-btn--lg"
        >
          View All Best Sellers →
        </Link>
      </div>
      <div className="pk-feat-banner__grid">
        {products.slice(0, 4).map((p) => (
          <Link key={p.id} to={`/products/${p.handle}`} className="pk-feat-banner__card">
            {p.featuredImage && (
              <Image data={p.featuredImage} aspectRatio="1/1" sizes="200px" />
            )}
            <div className="pk-feat-banner__card-info">
              <p className="pk-feat-banner__card-name">{p.title}</p>
              <p className="pk-feat-banner__card-price">
                <Money data={p.priceRange.minVariantPrice} />
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   VALUE PROPS
───────────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────────
   NEWSLETTER BAND
───────────────────────────────────────────────────────────────── */
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
        <h2 className="pk-news__title">Get the good stuff first.</h2>
        <p className="pk-news__sub">
          New arrivals, exclusive deals, and picks you won&apos;t find anywhere
          else — delivered straight to your inbox. No spam, ever.
        </p>
        {done ? (
          <p className="pk-news__done">🎉 You&apos;re in! Check your inbox.</p>
        ) : (
          <fetcher.Form
            ref={formRef}
            method="post"
            action="/newsletter"
            className="pk-news__form"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              name="email"
              placeholder="your@email.com"
              required
              className="pk-news__input"
              autoComplete="email"
            />
            <button
              type="submit"
              className="pk-btn pk-btn--spark"
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

/* ─────────────────────────────────────────────────────────────────
   QUERIES
───────────────────────────────────────────────────────────────── */
const BEST_PICKS_QUERY = `#graphql
  fragment BestPick on Product {
    id title handle vendor
    priceRange { minVariantPrice { amount currencyCode } }
    featuredImage { id url altText width height }
    variants(first: 1) { nodes { id availableForSale } }
  }
  query BestPicks {
    products(first: 4, sortKey: BEST_SELLING) {
      nodes { ...BestPick }
    }
  }
`;

const TRENDING_QUERY = `#graphql
  fragment TrendingProduct on Product {
    id title handle
    priceRange { minVariantPrice { amount currencyCode } }
    featuredImage { id url altText width height }
  }
  query Trending {
    products(first: 10, sortKey: BEST_SELLING) {
      nodes { ...TrendingProduct }
    }
  }
`;

const CAT_WORLD_QUERY = `#graphql
  fragment CatProduct on Product {
    id title handle
    priceRange { minVariantPrice { amount currencyCode } }
    featuredImage { id url altText width height }
  }
  fragment CatCol on Collection {
    id title handle description
    products(first: 4, sortKey: BEST_SELLING) {
      nodes { ...CatProduct }
    }
  }
  query CatWorld {
    home:    collection(handle: "home-essentials")      { ...CatCol }
    beauty:  collection(handle: "beauty-personal-care") { ...CatCol }
    tech:    collection(handle: "tech-gadgets")         { ...CatCol }
    outdoor: collection(handle: "outdoor-garden")       { ...CatCol }
    pet:     collection(handle: "pet-finds")            { ...CatCol }
  }
`;

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
