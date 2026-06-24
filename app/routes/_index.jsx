import {Await, useLoaderData, useFetcher, Link} from 'react-router';
import {Suspense, useEffect, useRef, useState} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import {error as logError} from '~/lib/logger';
import {IconTruck, IconReturn, IconShield, IconSparkles, IconGift, IconHeart, IconStar, IconHome, IconLeaf, IconLightbulb, IconPawPrint} from '~/components/Icons';
import StarGlyph from '~/components/StarGlyph';
import {ScrollPillNav} from '~/components/ScrollPillNav';
import {puchicaMeta, organizationJsonLd, websiteJsonLd, JsonLdScript} from '~/lib/seo';
import {CollectionShowcase} from '~/components/CollectionShowcase';
import {StatsCounter} from '~/components/StatsCounter';

/* Shared hook for arrow-nav on horizontal scroll tracks */
function useScrollNav(trackRef) {
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => {
      setCanLeft(el.scrollLeft > 2);
      setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
    };
    el.addEventListener('scroll', update, {passive: true});
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', update); ro.disconnect(); };
  }, []);
  const scrollBy = (amt) => trackRef.current?.scrollBy({left: amt, behavior: 'smooth'});
  return {canLeft, canRight, scrollBy};
}

/** @type {Route.MetaFunction} */
export const meta = () => {
  return puchicaMeta({
    title: 'Puchica – The good stuff. All in one place.',
    description:
      '6,000+ handpicked products across home, beauty, tech, pet, and more. Free shipping over $50, easy 30-day returns. Ships from Canada.',
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
  const norm = () => (res) => res?.collection?.products?.nodes ?? res?.products?.nodes ?? [];

  // Trending curated collection → hero deck + discover swiper
  const trending = context.storefront
    .query(TRENDING_QUERY)
    .then(norm('trending'))
    .catch((e) => { logError('trending query failed', e); return []; });

  // Home & Kitchen collection → rack (no phone cases!)
  const rackProducts = context.storefront
    .query(RACK_QUERY)
    .then(norm('rack'))
    .catch((e) => { logError('rackProducts query failed', e); return []; });

  // Curated best-sellers collection (tagged) → featured banner
  const bestPicks = context.storefront
    .query(BEST_PICKS_QUERY)
    .then(norm('best'))
    .catch((e) => { logError('bestPicks query failed', e); return []; });

  const catWorld = context.storefront
    .query(CAT_WORLD_QUERY)
    .catch((e) => { logError('catWorld query failed', e); return null; });

  // Collection showcase - 6 rotating categories
  const showcaseCollections = context.storefront
    .query(SHOWCASE_QUERY)
    .then((res) => {
      if (!res) return [];
      return Object.values(res).filter(Boolean);
    })
    .catch((e) => { logError('showcase query failed', e); return []; });

  // Outdoor & Garden → new arrivals (completely different category)
  const newArrivals = context.storefront
    .query(NEW_ARRIVALS_QUERY)
    .then(norm('arrivals'))
    .catch((e) => { logError('newArrivals query failed', e); return []; });

  // Beauty & Personal Care → fresh finds (different again)
  const freshFinds = context.storefront
    .query(FRESH_FINDS_QUERY)
    .then(norm('fresh'))
    .catch((e) => { logError('freshFinds query failed', e); return []; });

  return {trending, rackProducts, bestPicks, catWorld, newArrivals, freshFinds, showcaseCollections };
}

export default function Index() {
  const data = useLoaderData();
  return (
    <div className="pk-home">
      <JsonLdScript data={organizationJsonLd({})} />
      <JsonLdScript data={websiteJsonLd({})} />

      {/* Dark hero section */}
      <div id="hero-anchor" className="pk-dark-lead">
        <Suspense fallback={<div style={{minHeight: '100dvh', background: '#0E0C08'}} />}>
          <Await resolve={data.trending}>
            {(products) => <Hero products={products ?? []} />}
          </Await>
        </Suspense>
        <Marquee />
      </div>

      <ScrollPillNav />

      {/* Discover swiper — same trending collection */}
      <Suspense fallback={null}>
        <Await resolve={data.trending}>
          {(products) => <DiscoverSwiper products={products ?? []} />}
        </Await>
      </Suspense>

      {/* Product rack — Home & Kitchen (completely different category) */}
      <Suspense fallback={<div style={{height: 480, background: '#F4F0E6'}} />}>
        <Await resolve={data.rackProducts}>
          {(products) => <ProductRack products={products ?? []} />}
        </Await>
      </Suspense>

      {/* Gift finder */}
      <GiftFinder />

      {/* New arrivals — Outdoor & Garden (different category) */}
      <Suspense fallback={null}>
        <Await resolve={data.newArrivals}>
          {(products) => <NewArrivals products={products ?? []} />}
        </Await>
      </Suspense>

      {/* Category bento */}
      <Suspense fallback={null}>
        <Await resolve={data.catWorld}>
          {(res) => <CategoryBento res={res} />}
        </Await>
      </Suspense>

      {/* Collection showcase - alternating layout */}
      <Suspense fallback={null}>
        <Await resolve={data.showcaseCollections}>
          {(collections) => <CollectionShowcase collections={collections ?? []} />}
        </Await>
      </Suspense>

      {/* Shop by mood — uses catWorld images */}
      <Suspense fallback={null}>
        <Await resolve={data.catWorld}>
          {(res) => <ShopByMood catRes={res} />}
        </Await>
      </Suspense>

      {/* Social proof */}
      <SocialProof />

      {/* Fresh finds — Beauty & Personal Care (different category) */}
      <Suspense fallback={null}>
        <Await resolve={data.freshFinds}>
          {(products) => <FreshFinds products={products ?? []} />}
        </Await>
      </Suspense>

      {/* Best sellers — curated best-sellers collection */}
      <Suspense fallback={null}>
        <Await resolve={data.bestPicks}>
          {(products) => <FeaturedBanner products={products ?? []} />}
        </Await>
      </Suspense>

      {/* Catalog statement */}
      <CatalogStatement />

      <ValueProps />
      <NewsletterBand />
      <StatsCounter stats={[
        {value: 6155, label: 'Products', suffix: '+'},
        {value: 19, label: 'Collections'},
        {value: 15, label: 'Categories'},
        {value: 100, label: 'Canadian', suffix: '%'},
      ]} />

    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   HERO
───────────────────────────────────────────────────────────────── */
function Hero({products}) {
  const deckItems = products.slice(0, 4);
  const line1 = ['Everything'];
  const line2 = ['worth', 'buying.'];

  return (
    <section className="pk-hero2" aria-label="Welcome to Puchica">
      <div className="pk-hero2__glow pk-hero2__glow--a" aria-hidden="true" />
      <div className="pk-hero2__glow pk-hero2__glow--b" aria-hidden="true" />
      <div className="pk-hero2__inner">
        <div className="pk-hero2__copy">
          <span className="pk-hero2__eyebrow"><StarGlyph /> Ships from Canada · Free over $50</span>
          <h1 className="pk-hero2__title">
            <span className="pk-hero2__title-row">
              {line1.map((w, i) => (
                <span key={w} className="pk-hero2__word" style={{animationDelay: `${i * 90}ms`}}>
                  {w}{i < line1.length - 1 ? ' ' : ''}
                </span>
              ))}
            </span>
            <span className="pk-hero2__title-row pk-hero2__title-row--em">
              {line2.map((w, i) => (
                <span key={w} className="pk-hero2__word" style={{animationDelay: `${(line1.length + i) * 90}ms`}}>
                  {w}{i < line2.length - 1 ? ' ' : ''}
                </span>
              ))}
            </span>
          </h1>
          <p className="pk-hero2__sub">
            6,000+ handpicked products across home, beauty, tech, pet, and more.
            Real finds from real people who give a damn.
          </p>
          <div className="pk-hero2__ctas">
            <Link to="/collections" className="pk-btn pk-btn--spark pk-btn--lg">Shop now →</Link>
            <Link to="/collections/all" className="pk-btn pk-btn--ghost pk-btn--lg">Browse all</Link>
          </div>
          <ul className="pk-hero2__stats" aria-label="Store highlights">
            <li><strong>6,000+</strong><span>Products</span></li>
            <li><strong>Free</strong><span>Shipping $50+</span></li>
            <li><strong>30 days</strong><span>Easy returns</span></li>
          </ul>
        </div>
        {deckItems.length > 0 && (
          <div className="pk-hero2__visual" aria-hidden="true">
            <div className="pk-deck">
              {deckItems.map((p, i) => (
                <Link key={p.id} to={`/products/${p.handle}`} className="pk-deck__card" data-idx={String(i)} tabIndex={-1}>
                  {p.featuredImage && (
                    <div className="pk-deck__img">
                      <Image data={p.featuredImage} aspectRatio="4/5" sizes="200px" loading={i === 0 ? 'eager' : 'lazy'} />
                    </div>
                  )}
                  <div className="pk-deck__info">
                    <p className="pk-deck__name">{p.title}</p>
                    <div className="pk-deck__price"><Money data={p.priceRange.minVariantPrice} /></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MARQUEE — accessible with pause/play
───────────────────────────────────────────────────────────────── */
const MARQUEE_ITEMS = [
  '6,000+ products', 'New drops weekly', 'Free shipping $50+',
  '30-day easy returns', 'Ships from Canada', 'Handpicked, never random',
  'Real value. Real finds.', 'Secure checkout',
];

function Marquee() {
  const [paused, setPaused] = useState(false);
  // The track is decorative (duplicated items are not real content), but
  // the pause control sits inside the same wrapper so it stays in the
  // tab order and is announced. SR users get the same offer info via
  // the sticky announcement bar (Header.AnnouncementBar) above the page
  // header, so the visual marquee text doesn't need to be exposed.
  return (
    <div className="pk-marquee">
      <div className="pk-marquee__track-wrap" aria-hidden="true">
        <div className={`pk-marquee__track${paused ? ' is-paused' : ''}`}>
          {['a', 'b'].flatMap((copy) =>
            MARQUEE_ITEMS.map((t) => (
              <span className="pk-marquee__item" key={`${copy}-${t}`}>
                <span className="pk-marquee__dot"><StarGlyph size={10} style={{marginRight: 0}} /></span>{t}
              </span>
            )),
          )}
        </div>
      </div>
      {/* Pause control sits OUTSIDE the scrolling row and is exposed to AT. */}
      <button
        type="button"
        className={`pk-marquee__pause${paused ? ' is-paused' : ''}`}
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? 'Resume scrolling banner' : 'Pause scrolling banner'}
        aria-pressed={paused}
        tabIndex={0}
      >
        <span className="pk-marquee__pause-icon" aria-hidden="true">{paused ? '▶' : '⏸'}</span>
        <span className="pk-marquee__pause-label">{paused ? 'Resume' : 'Pause'}</span>
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   DISCOVER SWIPER
───────────────────────────────────────────────────────────────── */
function DiscoverSwiper({products}) {
  const items = products.slice(0, 8);
  const trackRef = useRef(null);
  const sectionRef = useRef(null);
  const [active, setActive] = useState(0);
  // Auto-advance state. Reduced-motion is read once on mount and respected
  // as "always paused" — there's no motion the user can opt back into.
  const [autoPaused, setAutoPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const reducedMotion = useRef(false);

  // Track the user's pause/manual-nav intent separately from the timer.
  // autoPaused = true means the user explicitly hit the pause button.
  // Hover and document-hidden are checked inside the tick (not as React
  // state) so the interval doesn't rebuild on every mouse move.
  const userPaused = autoPaused || focused || reducedMotion.current;
  // activeRef lets the interval read the latest `active` without including
  // it in deps — including it would reset the 5s timer on every tick.
  const activeRef = useRef(0);
  useEffect(() => { activeRef.current = active; }, [active]);

  const scrollTo = (i) => {
    const n = Math.max(0, Math.min(i, items.length - 1));
    setActive(n);
    trackRef.current?.children[n]?.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'center'});
  };

  // Read prefers-reduced-motion once on mount.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion.current = mq.matches;
    const onChange = (e) => { reducedMotion.current = e.matches; };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  // 5s auto-advance. Re-subscribes only when the user toggles pause or the
  // item count changes — never on every active change. Hover and tab-hidden
  // are checked inside the tick.
  useEffect(() => {
    if (items.length < 2) return;
    if (userPaused) return;
    const id = setInterval(() => {
      if (document.hidden) return;
      if (sectionRef.current && sectionRef.current.matches(':hover')) return;
      const curr = activeRef.current;
      const next = (curr + 1) % items.length;
      setActive(next);
      trackRef.current?.children[next]?.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'center'});
    }, 5000);
    return () => clearInterval(id);
  }, [userPaused, items.length]);

  if (!items.length) return null;
  return (
    <section // eslint-disable-line jsx-a11y/no-noninteractive-element-interactions
      ref={sectionRef}
      id="section-discover"
      className="pk-swiper"
      aria-label="Discover products carousel"
      aria-roledescription="carousel"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); scrollTo(active - 1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); scrollTo(active + 1); }
      }}
    >
      <div className="pk-swiper__head pk-inner">
        <div>
          <p className="pk-swiper__eye"><StarGlyph /> Trending now</p>
          <h2 className="pk-swiper__title">This week&apos;s top picks</h2>
        </div>
        <div className="pk-swiper__navrow" role="group" aria-label="Carousel navigation">
          <button className="pk-swiper__arr" onClick={() => scrollTo(active - 1)} disabled={active === 0} aria-label="Previous product">←</button>
          <span className="pk-swiper__count" aria-live="polite" aria-atomic="true">{active + 1} / {items.length}</span>
          <button className="pk-swiper__arr" onClick={() => scrollTo(active + 1)} disabled={active === items.length - 1} aria-label="Next product">→</button>
        </div>
      </div>
      <div
        className="pk-swiper__track"
        ref={trackRef}
        id="pk-swiper-track"
        aria-live={userPaused ? 'polite' : 'off'}
      >
        {items.map((p, i) => (
          <Link
            key={p.id}
            to={`/products/${p.handle}`}
            className={`pk-swiper__card${i === active ? ' is-active' : ''}`}
            aria-current={i === active ? 'true' : undefined}
            aria-label={`${p.title} — product ${i + 1} of ${items.length}`}
            onClick={(e) => { if (i !== active) { e.preventDefault(); scrollTo(i); } }}
          >
            {p.featuredImage && (
              <div className="pk-swiper__img">
                <Image data={p.featuredImage} aspectRatio="3/4" sizes="(max-width: 600px) 80vw, 320px" loading={i < 3 ? 'eager' : 'lazy'} />
              </div>
            )}
            <div className="pk-swiper__info">
              <p className="pk-swiper__name">{p.title}</p>
              <div className="pk-swiper__price"><Money data={p.priceRange.minVariantPrice} /></div>
            </div>
          </Link>
        ))}
      </div>
      <div className="pk-swiper__dots" aria-label="Jump to product">
        {items.map((p, i) => (
          <button
            key={p.id}
            className={`pk-swiper__dot${i === active ? ' is-active' : ''}`}
            aria-label={`Product ${i + 1}: ${p.title}`}
            aria-current={i === active ? 'true' : undefined}
            onClick={() => scrollTo(i)}
          />
        ))}
      </div>
      <div className="pk-swiper__ctrl">
        <button
          type="button"
          className={`pk-swiper__ctrl-btn${autoPaused ? ' is-paused' : ''}`}
          onClick={() => setAutoPaused((p) => !p)}
          aria-label={autoPaused ? 'Resume auto-advancing carousel' : 'Pause auto-advancing carousel'}
          aria-pressed={autoPaused}
          aria-controls="pk-swiper-track"
        >
          <span className="pk-swiper__ctrl-icon" aria-hidden="true">{autoPaused ? '▶' : '⏸'}</span>
          <span className="pk-swiper__ctrl-label">{autoPaused ? 'Resume auto-play' : 'Pause auto-play'}</span>
        </button>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   PRODUCT RACK
───────────────────────────────────────────────────────────────── */
function ProductRack({products}) {
  const trackRef = useRef(null);
  const {canLeft, canRight, scrollBy} = useScrollNav(trackRef);
  if (!products?.length) return null;
  return (
    <section id="section-rack" className="pk-rack" aria-label="Premium picks">
      <div className="pk-inner pk-rack__head">
        <div>
          <p className="pk-rack__eye"><StarGlyph /> Home &amp; Kitchen</p>
          <h2 className="pk-rack__title">Upgrade your space.</h2>
        </div>
        <div className="pk-rack__nav" role="group" aria-label="Scroll products">
          <button className="pk-rack__arr" onClick={() => scrollBy(-260)} disabled={!canLeft} aria-label="Scroll left">←</button>
          <button className="pk-rack__arr" onClick={() => scrollBy(260)} disabled={!canRight} aria-label="Scroll right">→</button>
        </div>
      </div>
      <div className="pk-rack__track" ref={trackRef} role="list">
        {products.slice(0, 12).map((p) => (
          <Link key={p.id} to={`/products/${p.handle}`} className="pk-rack__card" role="listitem">
            {p.featuredImage && <div className="pk-rack__img"><Image data={p.featuredImage} aspectRatio="4/5" sizes="240px" /></div>}
            <div className="pk-rack__body">
              <p className="pk-rack__name">{p.title}</p>
              <div className="pk-rack__price"><Money data={p.priceRange.minVariantPrice} /></div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   GIFT FINDER — price bracket cards
───────────────────────────────────────────────────────────────── */
const PRICE_BRACKETS = [
  {range: 'under-25',  label: 'Under $25',  sub: 'Little treats, big smiles', icon: IconGift},
  {range: '25-50',     label: '$25 – $50',  sub: 'Sweet-spot gifts',          icon: IconHeart},
  {range: '50-100',    label: '$50 – $100', sub: 'Premium picks',             icon: IconSparkles},
  {range: '100-plus',  label: '$100+',      sub: 'Go all out',                icon: IconStar},
];

function GiftFinder() {
  return (
    <section className="pk-gift" aria-label="Find a gift by budget">
      <div className="pk-gift__inner">
        <div className="pk-gift__head">
          <span className="pk-gift__eye"><StarGlyph /> Gift ideas</span>
          <h2 className="pk-gift__title">Find the perfect gift.</h2>
          <p className="pk-gift__sub">6,000+ options across every budget. Something for everyone on your list.</p>
        </div>
        <div className="pk-gift__grid">
          {PRICE_BRACKETS.map(({range, label, sub, icon: Icon}) => (
            <Link key={range} to={`/collections/all?price=${range}`} className="pk-gift__card" aria-label={`Shop gifts ${label}`}>
              <span className="pk-gift__icon" aria-hidden="true"><Icon size={28} /></span>
              <strong className="pk-gift__label">{label}</strong>
              <span className="pk-gift__card-sub">{sub}</span>
              <span className="pk-gift__arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   NEW ARRIVALS — dark horizontal strip
───────────────────────────────────────────────────────────────── */
function NewArrivals({products}) {
  const trackRef = useRef(null);
  const {canLeft, canRight, scrollBy} = useScrollNav(trackRef);
  if (!products?.length) return null;
  return (
    <section id="section-new-arrivals" className="pk-arrivals" aria-label="New arrivals">
      <div className="pk-arrivals__head pk-inner">
        <div>
          <p className="pk-arrivals__eye"><StarGlyph /> Outdoor &amp; Garden</p>
          <h2 className="pk-arrivals__title">Get outside.</h2>
        </div>
        <div className="pk-arrivals__head-right">
          <Link to="/collections/new-arrivals" className="pk-arrivals__link">See all new →</Link>
          <div className="pk-rack__nav" role="group" aria-label="Scroll arrivals">
            <button className="pk-rack__arr pk-rack__arr--dark" onClick={() => scrollBy(-220)} disabled={!canLeft} aria-label="Scroll left">←</button>
            <button className="pk-rack__arr pk-rack__arr--dark" onClick={() => scrollBy(220)} disabled={!canRight} aria-label="Scroll right">→</button>
          </div>
        </div>
      </div>
      <div className="pk-arrivals__track" ref={trackRef} role="list">
        {products.map((p) => (
          <Link key={p.id} to={`/products/${p.handle}`} className="pk-arrivals__card" role="listitem" aria-label={p.title}>
            {p.featuredImage && (
              <div className="pk-arrivals__card-img">
                <Image data={p.featuredImage} aspectRatio="3/4" sizes="200px" loading="lazy" />
              </div>
            )}
            <div className="pk-arrivals__card-body">
              <span className="pk-arrivals__card-badge" aria-label="New product">New</span>
              <p className="pk-arrivals__card-name">{p.title}</p>
              <div className="pk-arrivals__card-price"><Money data={p.priceRange.minVariantPrice} /></div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   CATEGORY BENTO
───────────────────────────────────────────────────────────────── */
const CAT_META = {
  'home-essentials':      {tagline: 'Your space, elevated.',        icon: IconHome},
  'beauty-personal-care': {tagline: 'Feel it from the inside out.', icon: IconSparkles},
  'tech-gadgets':         {tagline: 'Smarter, every single day.',   icon: IconLightbulb},
  'outdoor-garden':       {tagline: 'Get out there.',               icon: IconLeaf},
  'pet-finds':            {tagline: 'They deserve the best too.',   icon: IconPawPrint},
};
const CAT_ORDER = ['home', 'beauty', 'tech', 'outdoor', 'pet'];

function CategoryBento({res}) {
  const cats = CAT_ORDER.map((k) => res?.[k]).filter(Boolean).slice(0, 5);
  if (!cats.length) return null;
  return (
    <section id="section-categories" className="pk-bento" aria-label="Shop by category">
      <div className="pk-bento__head pk-inner">
        <p className="pk-bento__eye"><StarGlyph /> Shop by category</p>
        <h2 className="pk-bento__title">Find your thing.</h2>
      </div>
      <div className="pk-bento__grid pk-inner">
        {cats.map((col, i) => {
          const meta = CAT_META[col.handle] ?? {tagline: 'Curated with care.', icon: IconStar};
          const Icon = meta.icon;
          const img = col.products?.nodes?.[0]?.featuredImage;
          return (
            <Link key={col.id} to={`/collections/${col.handle}`}
              className={`pk-bento__cell pk-bento__cell--${i}`}
              aria-label={`Shop ${col.title}`}
            >
              {img && (
                <Image data={img} sizes="(min-width: 1200px) 500px, 50vw" loading={i === 0 ? 'eager' : 'lazy'}
                  className="pk-bento__cell-img"
                  style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', aspectRatio: 'unset'}}
                />
              )}
              <div className="pk-bento__cell-overlay" />
              <div className="pk-bento__cell-body">
                <p className="pk-bento__cell-eye"><span className="pk-bento__cell-icon" aria-hidden="true"><Icon size={18} /></span> {col.title}</p>
                <h3 className="pk-bento__cell-name">{meta.tagline}</h3>
                <span className="pk-bento__cell-cta">Shop now →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SHOP BY MOOD — 3-col editorial with real category images
───────────────────────────────────────────────────────────────── */
const MOODS = [
  {
    handle: 'home-essentials', catKey: 'home',
    label: 'Home & Living',
    title: 'Your home deserves better.',
    sub: 'Storage, decor, kitchen tools — everything to make the space you live in feel intentional.',
    cta: 'Upgrade your space →',
    icon: IconHome,
  },
  {
    handle: 'beauty-personal-care', catKey: 'beauty',
    label: 'Beauty & Self-Care',
    title: 'Take care of yourself.',
    sub: 'Skincare, wellness, and personal-care products that actually work — picked by people who use them.',
    cta: 'Treat yourself →',
    icon: IconSparkles,
  },
  {
    handle: 'tech-gadgets', catKey: 'tech',
    label: 'Tech & Gadgets',
    title: 'Work smarter, play harder.',
    sub: 'Accessories, tools, and gadgets that genuinely improve your day. No gimmicks.',
    cta: 'Power up →',
    icon: IconLightbulb,
  },
];

function ShopByMood({catRes}) {
  return (
    <section className="pk-mood" aria-label="Shop by lifestyle">
      <div className="pk-mood__head pk-inner">
        <p className="pk-mood__eye"><StarGlyph /> Made for your life</p>
        <h2 className="pk-mood__title">Shop the way you live.</h2>
      </div>
      <div className="pk-mood__grid">
        {MOODS.map((m) => {
          const Icon = m.icon;
          const col = catRes?.[m.catKey];
          const img = col?.products?.nodes?.[0]?.featuredImage;
          return (
            <Link key={m.handle} to={`/collections/${m.handle}`} className="pk-mood__card" aria-label={`${m.label} — ${m.title}`}>
              <div className="pk-mood__card-img">
                {img
                  ? <Image data={img} aspectRatio="4/3" sizes="480px" loading="lazy" />
                  : <span className="pk-mood__card-icon" aria-hidden="true"><Icon size={48} /></span>
                }
              </div>
              <div className="pk-mood__card-body">
                <p className="pk-mood__card-label">{m.label}</p>
                <h3 className="pk-mood__card-title">{m.title}</h3>
                <p className="pk-mood__card-sub">{m.sub}</p>
                <span className="pk-mood__card-cta" aria-hidden="true">{m.cta}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SOCIAL PROOF — customer testimonials
───────────────────────────────────────────────────────────────── */
const REVIEWS = [
  {stars: 5, quote: 'Ordered three times in the past month. Quality is consistently great and shipping is fast.', name: 'Maria K.', loc: 'Toronto, ON'},
  {stars: 5, quote: 'Found exactly what I was looking for — and way more. This is my new go-to for home stuff.', name: 'David T.', loc: 'Vancouver, BC'},
  {stars: 5, quote: 'The curation is genuinely good. Everything feels like it was picked by someone who has taste.', name: 'Sarah L.', loc: 'Calgary, AB'},
];

function SocialProof() {
  return (
    <section className="pk-proof" aria-label="Customer reviews">
      <div className="pk-proof__inner">
        <div className="pk-proof__head">
          <span className="pk-proof__eye"><StarGlyph /> What people are saying</span>
          <h2 className="pk-proof__title">Real shoppers. Real opinions.</h2>
        </div>
        <div className="pk-proof__grid">
          {REVIEWS.map(({stars, quote, name, loc}) => (
            <article key={name} className="pk-proof__card">
              <div className="pk-proof__stars" aria-label={`${stars} out of 5 stars`} style={{display: 'inline-flex', gap: '2px', alignItems: 'center', fontSize: '18px', color: 'var(--pk-lime)'}}>
                {Array.from({length: stars}, (_, i) => (
                  <StarGlyph key={i} variant="five" size={18} style={{margin: 0}} />
                ))}
              </div>
              <blockquote className="pk-proof__quote">&ldquo;{quote}&rdquo;</blockquote>
              <footer className="pk-proof__footer">
                <strong className="pk-proof__name">{name}</strong>
                <span className="pk-proof__loc">{loc}</span>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   FRESH FINDS — recently updated (different set from trending)
───────────────────────────────────────────────────────────────── */
function FreshFinds({products}) {
  const trackRef = useRef(null);
  const {canLeft, canRight, scrollBy} = useScrollNav(trackRef);
  if (!products?.length) return null;
  return (
    <section className="pk-rack pk-rack--fresh" aria-label="Fresh finds">
      <div className="pk-inner pk-rack__head">
        <div>
          <p className="pk-rack__eye"><StarGlyph /> Beauty &amp; Self-Care</p>
          <h2 className="pk-rack__title">Take care of yourself.</h2>
        </div>
        <div className="pk-rack__nav" role="group" aria-label="Scroll fresh finds">
          <button className="pk-rack__arr" onClick={() => scrollBy(-260)} disabled={!canLeft} aria-label="Scroll left">←</button>
          <button className="pk-rack__arr" onClick={() => scrollBy(260)} disabled={!canRight} aria-label="Scroll right">→</button>
        </div>
      </div>
      <div className="pk-rack__track" ref={trackRef} role="list">
        {products.slice(0, 12).map((p) => (
          <Link key={p.id} to={`/products/${p.handle}`} className="pk-rack__card" role="listitem">
            {p.featuredImage && <div className="pk-rack__img"><Image data={p.featuredImage} aspectRatio="4/5" sizes="240px" loading="lazy" /></div>}
            <div className="pk-rack__body">
              <p className="pk-rack__name">{p.title}</p>
              <div className="pk-rack__price"><Money data={p.priceRange.minVariantPrice} /></div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   FEATURED BANNER — best sellers (3 cards)
───────────────────────────────────────────────────────────────── */
function FeaturedBanner({products}) {
  if (!products?.length) return null;
  return (
    <section id="section-best-sellers" className="pk-feat-banner" aria-label="Best sellers">
      <div className="pk-feat-banner__inner">
        <div className="pk-feat-banner__copy">
          <p className="pk-feat-banner__label"><StarGlyph variant="five" size={12} style={{marginRight: '0.5em'}} /> Best Sellers</p>
          <h2 className="pk-feat-banner__title">The ones people can&apos;t stop buying.</h2>
          <p className="pk-feat-banner__sub">
            Tried, ordered again, and gifted to everyone they know. These are the products
            that earn their place on the list every single week.
          </p>
          <Link to="/collections/best-sellers" className="pk-btn pk-btn--spark pk-btn--lg">
            See all best sellers →
          </Link>
        </div>
        <div className="pk-feat-banner__grid">
          {products.slice(0, 3).map((p) => (
            <Link key={p.id} to={`/products/${p.handle}`} className="pk-feat-banner__card" aria-label={p.title}>
              {p.featuredImage && <Image data={p.featuredImage} aspectRatio="3/4" sizes="200px" />}
              <div className="pk-feat-banner__card-info">
                <p className="pk-feat-banner__card-name">{p.title}</p>
                <div className="pk-feat-banner__card-price"><Money data={p.priceRange.minVariantPrice} /></div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   CATALOG STATEMENT — big lime typographic CTA
───────────────────────────────────────────────────────────────── */
function CatalogStatement() {
  return (
    <section className="pk-catalog-cta" aria-label="Explore the full catalog">
      <p className="pk-catalog-cta__number" aria-label="Over 6,000 products">
        6<span className="pk-catalog-cta__sup">+</span>k
      </p>
      <p className="pk-catalog-cta__body">
        products. One store. Every category. We&apos;re adding more every week
        — there&apos;s always something new to find.
      </p>
      <div className="pk-catalog-cta__ctas">
        <Link to="/collections/all" className="pk-btn pk-btn--lg pk-btn--ink">Browse everything →</Link>
        <Link to="/search" className="pk-btn pk-btn--lg pk-btn--outline">Search the catalog</Link>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   VALUE PROPS
───────────────────────────────────────────────────────────────── */
function ValueProps() {
  const items = [
    {Icon: IconTruck,    title: 'Free shipping',   sub: 'On orders over $50'},
    {Icon: IconReturn,   title: '30-day returns',  sub: 'No questions, no hassle'},
    {Icon: IconShield,   title: 'Secure checkout', sub: 'Encrypted & PCI-compliant'},
    {Icon: IconSparkles, title: 'Handpicked only', sub: 'Curated, never random'},
  ];
  return (
    <section className="pk-values" aria-label="Why Puchica">
      {items.map(({Icon, title, sub}) => (
        <div key={title} className="pk-values__item">
          <span className="pk-values__icon" aria-hidden="true"><Icon size={22} /></span>
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
   NEWSLETTER
───────────────────────────────────────────────────────────────── */
function NewsletterBand() {
  const fetcher = useFetcher();
  const formRef = useRef(null);
  const [done, setDone] = useState(false);
  const submitting = fetcher.state !== 'idle';

  useEffect(() => {
    if (fetcher.data?.ok) { setDone(true); formRef.current?.reset(); }
  }, [fetcher.data]);

  return (
    <section className="pk-news" aria-label="Newsletter signup">
      <div className="pk-news__glow" aria-hidden="true" />
      <div className="pk-news__inner">
        <span className="pk-pill pk-pill--glass">Join the club</span>
        <h2 className="pk-news__title">Get the good stuff first.</h2>
        <p className="pk-news__sub">
          New arrivals, exclusive deals, and picks you won&apos;t find anywhere else
          — straight to your inbox. No spam, unsubscribe anytime.
        </p>
        {done ? (
          <p className="pk-news__done" role="status">You&apos;re in! Check your inbox.</p>
        ) : (
          <fetcher.Form ref={formRef} method="post" action="/newsletter" className="pk-news__form">
            <label htmlFor="nl-email" className="sr-only">Email address</label>
            <input id="nl-email" type="email" name="email" placeholder="your@email.com"
              required className="pk-news__input" autoComplete="email" />
            <button type="submit" className="pk-btn pk-btn--spark" disabled={submitting}>
              {submitting ? 'Joining…' : 'Subscribe'}
            </button>
          </fetcher.Form>
        )}
        {fetcher.data?.error && !done && <p className="pk-news__error" role="alert">{fetcher.data.error}</p>}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   GRAPHQL QUERIES
───────────────────────────────────────────────────────────────── */
/* ── Home & Kitchen → rack ("Worth every penny" section) ── */
const RACK_QUERY = `#graphql
  fragment RackProduct on Product {
    id title handle
    priceRange { minVariantPrice { amount currencyCode } }
    featuredImage { id url altText width height }
  }
  query RackProducts {
    collection(handle: "home-essentials") {
      products(first: 12, sortKey: BEST_SELLING) {
        nodes { ...RackProduct }
      }
    }
  }
`;

/* ── Trending curated collection → hero + swiper ── */
const TRENDING_QUERY = `#graphql
  fragment TrendingProduct on Product {
    id title handle
    priceRange { minVariantPrice { amount currencyCode } }
    featuredImage { id url altText width height }
  }
  query Trending {
    collection(handle: "trending-finds") {
      products(first: 8, sortKey: BEST_SELLING) {
        nodes { ...TrendingProduct }
      }
    }
  }
`;

/* ── Curated best-sellers collection (tagged bulk1) → featured banner ── */
const BEST_PICKS_QUERY = `#graphql
  fragment BestPick on Product {
    id title handle
    priceRange { minVariantPrice { amount currencyCode } }
    featuredImage { id url altText width height }
  }
  query BestPicks {
    collection(handle: "best-sellers") {
      products(first: 3, sortKey: BEST_SELLING) {
        nodes { ...BestPick }
      }
    }
  }
`;

/* ── Outdoor & Garden → new arrivals (newest in category) ── */
const NEW_ARRIVALS_QUERY = `#graphql
  fragment NewArrival on Product {
    id title handle
    priceRange { minVariantPrice { amount currencyCode } }
    featuredImage { id url altText width height }
  }
  query NewArrivals {
    collection(handle: "outdoor-garden") {
      products(first: 8, sortKey: CREATED, reverse: true) {
        nodes { ...NewArrival }
      }
    }
  }
`;

/* ── Beauty & Personal Care → fresh finds ── */
const FRESH_FINDS_QUERY = `#graphql
  fragment FreshFind on Product {
    id title handle
    priceRange { minVariantPrice { amount currencyCode } }
    featuredImage { id url altText width height }
  }
  query FreshFinds {
    collection(handle: "beauty-personal-care") {
      products(first: 12, sortKey: BEST_SELLING) {
        nodes { ...FreshFind }
      }
    }
  }
`;

const SHOWCASE_QUERY = `#graphql
  fragment ShowCol on Collection {
    id title handle description
    image { id url altText width height }
    products(first: 1, sortKey: BEST_SELLING) {
      nodes { id featuredImage { id url altText width height } }
    }
  }
  query Showcase {
    a: collection(handle: "phone-case")             { ...ShowCol }
    b: collection(handle: "apparel-accessories")    { ...ShowCol }
    c: collection(handle: "health-wellness")        { ...ShowCol }
    d: collection(handle: "sports-outdoors")        { ...ShowCol }
    e: collection(handle: "automotive")             { ...ShowCol }
    f: collection(handle: "toys-games")             { ...ShowCol }
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
