import {Await, useLoaderData, useFetcher} from 'react-router';
import {Suspense, useState, useEffect, useRef} from 'react';
import {error as logError} from '~/lib/logger';
import {puchicaMeta, organizationJsonLd, websiteJsonLd, JsonLdScript} from '~/lib/seo';
import {useT} from '~/lib/t';
import {
  HOME_BEST_SELLERS_QUERY,
  HOME_NEW_ARRIVALS_QUERY,
  HOME_CATEGORIES_QUERY,
  HOME_SALE_QUERY,
  HOME_FOR_YOU_QUERY,
  HOME_GIFTS_QUERY,
} from '~/lib/fragments';
import {
  IconGift,
  IconHeart,
  IconSparkles,
  IconStar,
  IconHome,
  IconLightbulb,
  IconLeaf,
  IconPawPrint,
  IconTruck,
  IconReturn,
  IconShield,
} from '~/components/Icons';
import StarGlyph from '~/components/StarGlyph';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {Image, Money} from '@shopify/hydrogen';
import {ProductRail} from '~/components/ProductRail';
import {BestSellersGrid} from '~/sections/best-sellers/best-sellers';
import {DepartmentGrid} from '~/sections/department-grid/department-grid';
import {NewsletterFooter} from '~/sections/newsletter-footer/newsletter-footer';
import {TrustBar} from '~/sections/trust-bar/trust-bar';

/* ProductRailSection wraps ProductRail in a <section> with variant class */
function ProductRailSection({products, eyebrow, heading, seeAllLabel, seeAllHref, scrollLeftAria, scrollRightAria, variant}) {
  const sectionClass = variant ? `pk-rail-section pk-rail-section--${variant}` : 'pk-rail-section';
  return (
    <section className={sectionClass}>
      <ProductRail
        products={products}
        eyebrow={eyebrow}
        heading={heading}
        seeAllLabel={seeAllLabel}
        seeAllHref={seeAllHref}
        scrollLeftAria={scrollLeftAria}
        scrollRightAria={scrollRightAria}
      />
    </section>
  );
}

/* Stubs for components not yet built — render nothing so the page loads */
function CollectionShowcase({collections}) { return null; }
function ParallaxBanner() { return null; }
function TrendingTicker({products}) { return null; }
function StatsCounter({stats}) { return null; }
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
export const meta = ({params}) => {
  return puchicaMeta({
    title: 'Puchica — 3,700+ Products Across Every Department',
    description:
      '3,700+ handpicked products across home, beauty, tech, pet, and more. Free shipping over $50, easy 30-day returns. Ships from Canada.',
    pathname: '/',
    langKey: params?.locale,
  });
};

/** @param {Route.LoaderArgs} args */
export async function loader(args) {
  return loadDeferredData(args);
}

function loadDeferredData({context}) {
  const {country, language} = context.storefront.i18n;

  const unwrapProducts = (alias) => (res) =>
    res?.[alias]?.products?.nodes ?? res?.[alias]?.nodes ?? [];

  const bestSellers = context.storefront
    .query(HOME_BEST_SELLERS_QUERY, {variables: {country, language}})
    .then(unwrapProducts('bestSellers'))
    .catch((e) => {
      logError('home best-sellers query failed', e);
      return [];
    });

  const newArrivals = context.storefront
    .query(HOME_NEW_ARRIVALS_QUERY, {variables: {country, language}})
    .then(unwrapProducts('newArrivals'))
    .catch((e) => {
      logError('home new-arrivals query failed', e);
      return [];
    });

  const categories = context.storefront
    .query(HOME_CATEGORIES_QUERY, {variables: {country, language}})
    .then((res) => res?.categories?.nodes ?? [])
    .catch((e) => {
      logError('home categories query failed', e);
      return [];
    });

  const onSale = context.storefront
    .query(HOME_SALE_QUERY, {variables: {country, language}})
    .then(unwrapProducts('onSale'))
    .catch((e) => {
      logError('home sale query failed', e);
      return [];
    });

  const forYou = context.storefront
    .query(HOME_FOR_YOU_QUERY, {variables: {country, language}})
    .then(unwrapProducts('forYou'))
    .catch((e) => {
      logError('home for-you query failed', e);
      return [];
    });

  const gifts = context.storefront
    .query(HOME_GIFTS_QUERY, {variables: {country, language}})
    .then(unwrapProducts('gifts'))
    .catch((e) => {
      logError('home gifts query failed', e);
      return [];
    });

  return {
    bestSellers,
    newArrivals,
    categories,
    onSale,
    forYou,
    gifts,
    /* Fields referenced by JSX that don't have queries yet — resolve to empty */
    trending: Promise.resolve([]),
    catWorld: Promise.resolve(null),
    showcaseCollections: Promise.resolve([]),
    bestPicks: Promise.resolve([]),
    freshFinds: Promise.resolve([]),
  };
}

export default function Index() {
  const data = useLoaderData();
  const t = useT();

  return (
    <>
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
        {/* Phase 1.7: product marquee / Trending Now strip */}
        <Suspense fallback={null}>
          <Await resolve={data.trending}>
            {(products) => <ProductMarquee products={products ?? []} />}
          </Await>
        </Suspense>
      </div>

      <Suspense fallback={<DepartmentGridSkeleton />}>
        <Await resolve={data.categories}>
          {(nodes) => <DepartmentGrid collections={nodes ?? []} />}
        </Await>
      </Suspense>

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

      {/* On-sale, best-sellers, for-you, gifts rails */}
      <OnSaleRail data={data} t={t} />

      {/* Best sellers — curated best-sellers collection */}
      <Suspense fallback={null}>
        <Await resolve={data.bestPicks}>
          {(products) => <FeaturedBanner products={products ?? []} />}
        </Await>
      </Suspense>

      {/* Catalog statement */}
      <CatalogStatement />
      <ParallaxBanner />


      <ValueProps />
      <NewsletterBand />
      <Suspense fallback={null}>
        <Await resolve={data.trending}>
          {(products) => <TrendingTicker products={products ?? []} />}
        </Await>
      </Suspense>

      <StatsCounter stats={[
        {value: 3761, label: 'Products', suffix: '+'},
        {value: 25, label: 'Collections'},
        {value: 15, label: 'Categories'},
        {value: 100, label: 'Canadian', suffix: '%'},
      ]} />

    </>
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
              {' '}
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
            3,700+ handpicked products across home, beauty, tech, pet, and more.
            Real finds from real people who give a damn.
          </p>
          <div className="pk-hero2__ctas">
            <Link to="/collections/all" className="pk-btn pk-btn--ember pk-btn--lg">Shop now →</Link>
            <Link to="/collections/all" className="pk-btn pk-btn--ghost pk-btn--lg">Browse all</Link>
          </div>
          <ul className="pk-hero2__stats" aria-label="Store highlights">
            <li><strong>3,700+</strong><span>Products</span></li>
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
  '3,700+ products', 'New drops weekly', 'Free shipping $50+',
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

      <button
        type="button"
        className="pk-marquee__pause"
        aria-pressed={paused}
        onClick={() => setPaused((p) => !p)}
        style={{position: 'absolute', left: '-9999px'}}
      >
        {paused ? 'Play' : 'Pause'} marquee
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ON-SALE RAIL
───────────────────────────────────────────────────────────────── */
function OnSaleRail({data, t}) {
  return (
    <>
      <Suspense fallback={null}>
        <Await resolve={data.onSale}>
          {(products) => (
            <ProductRailSection
              products={products}
              eyebrow={t('home_rail_sale_eyebrow')}
              heading={t('home_rail_sale_heading')}
              seeAllLabel={t('home_rail_sale_see_all')}
              seeAllHref="/collections/sale"
              scrollLeftAria={t('home_rail_sale_scroll_left')}
              scrollRightAria={t('home_rail_sale_scroll_right')}
              variant="sale"
            />
          )}
        </Await>
      </Suspense>

      <Suspense fallback={<BestSellersGrid />}>
        <Await resolve={data.bestSellers}>
          {(products) => <BestSellersGrid products={products ?? []} />}
        </Await>
      </Suspense>

      <Suspense fallback={null}>
        <Await resolve={data.forYou}>
          {(products) => (
            <ProductRailSection
              products={products}
              eyebrow={t('home_rail_foryou_eyebrow')}
              heading={t('home_rail_foryou_heading')}
              seeAllLabel={t('home_rail_foryou_see_all')}
              seeAllHref="/collections/for-you"
              scrollLeftAria={t('home_rail_foryou_scroll_left')}
              scrollRightAria={t('home_rail_foryou_scroll_right')}
            />
          )}
        </Await>
      </Suspense>

      <Suspense fallback={null}>
        <Await resolve={data.gifts}>
          {(products) => (
            <ProductRailSection
              products={products}
              eyebrow={t('home_rail_gifts_eyebrow')}
              heading={t('home_rail_gifts_heading')}
              seeAllLabel={t('home_rail_gifts_see_all')}
              seeAllHref="/collections/gifts-under-25"
              scrollLeftAria={t('home_rail_gifts_scroll_left')}
              scrollRightAria={t('home_rail_gifts_scroll_right')}
            />
          )}
        </Await>
      </Suspense>

      <TrustBar />
      <NewsletterFooter />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   PRODUCT MARQUEE — auto-scrolling Trending Now product strip.
   Sits inside .pk-dark-lead right after the text marquee, so both
   read as one "Trending" zone over the dark hero lead.

   A11y:
   - Track is aria-hidden (cards are duplicated for the seamless loop,
     so the original product links are the canonical ones).
   - Pause button is keyboard-reachable, aria-pressed, focuses the strip.
   - Reduced-motion kills the animation entirely (no opt-back-in).
   - Hover, focus-within, and tab-hidden all pause without re-rendering.
───────────────────────────────────────────────────────────────── */
function ProductMarquee({products}) {
  const items = products.slice(0, 12);
  const trackRef = useRef(null);
  const sectionRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const reducedMotion = useRef(false);

  // Read prefers-reduced-motion once on mount.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion.current = mq.matches;
    const onChange = (e) => { reducedMotion.current = e.matches; };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  // Effective paused = user toggle OR focus OR reduced-motion. Hover
  // and document-hidden are read inside the CSS pause path via the
  // .is-paused class on the track, so React state doesn't rebuild the
  // animation on every mouse move.
  const effectivePaused = paused || focused || reducedMotion.current;
  // Mirror onto the track DOM (CSS owns the actual animation-play-state).
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.classList.toggle('is-paused', effectivePaused);
  }, [effectivePaused]);

  if (!items.length) return null;

  return (
    <section
      ref={sectionRef}
      className="pk-pmarq"
      aria-label="Trending now products"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <div className="pk-pmarq__head pk-inner">
        <div>
          <p className="pk-pmarq__eye"><StarGlyph /> Trending now</p>
          <h2 className="pk-pmarq__title">This week&apos;s handpicked finds.</h2>
        </div>
        <button
          type="button"
          className={`pk-pmarq__pause${paused ? ' is-paused' : ''}`}
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? 'Resume product marquee' : 'Pause product marquee'}
          aria-pressed={paused}
        >
          <span className="pk-pmarq__pause-icon" aria-hidden="true">{paused ? '▶' : '⏸'}</span>
          <span className="pk-pmarq__pause-label">{paused ? 'Resume' : 'Pause'}</span>
        </button>
      </div>

      <div className="pk-pmarq__track-wrap">
        <div className="pk-pmarq__track" ref={trackRef}>
          {/* Original set — canonical links for AT + tab order. */}
          {items.map((p) => (
            <Link
              key={p.id}
              to={`/products/${p.handle}`}
              className="pk-pmarq__card"
              aria-label={p.title}
            >
              {p.featuredImage && (
                <div className="pk-pmarq__card-img">
                  <Image data={p.featuredImage} aspectRatio="3/4" sizes="(max-width: 600px) 50vw, 220px" loading="lazy" />
                </div>
              )}
              <div className="pk-pmarq__card-body">
                <p className="pk-pmarq__card-name">{p.title}</p>
                <div className="pk-pmarq__card-price"><Money data={p.priceRange.minVariantPrice} /></div>
              </div>
            </Link>
          ))}
          {/* Duplicate set for seamless loop. Visually identical, hidden from AT. */}
          <div className="pk-pmarq__dupset" aria-hidden="true">
            {items.map((p) => (
              <Link
                key={`dup-${p.id}`}
                to={`/products/${p.handle}`}
                className="pk-pmarq__card"
                tabIndex={-1}
              >
                {p.featuredImage && (
                  <div className="pk-pmarq__card-img">
                    <Image data={p.featuredImage} aspectRatio="3/4" sizes="(max-width: 600px) 50vw, 220px" loading="lazy" />
                  </div>
                )}
                <div className="pk-pmarq__card-body">
                  <p className="pk-pmarq__card-name">{p.title}</p>
                  <div className="pk-pmarq__card-price"><Money data={p.priceRange.minVariantPrice} /></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
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

  return (
    <section
      className={
        'pk-section pk-section--rail' +
        (variant === 'sale' ? ' pk-section--rail-sale' : '')
      }
    >
      <div className="pk-section__inner">
        <ProductRail
          products={products}
          eyebrow={eyebrow}
          heading={heading}
          seeAllLabel={seeAllLabel}
          seeAllHref={seeAllHref}
          scrollLeftAria={scrollLeftAria}
          scrollRightAria={scrollRightAria}
          maxItems={12}
        />
      </div>
    </section>
  );
}

function DepartmentGridSkeleton() {
  return (
    <section className="pk-section pk-section--departments">
      <div className="pk-section__inner">
        <div className="pk-section__head">
          <span className="pk-eyebrow">Loading</span>
          <h2 className="pk-section__h">Shop by Department</h2>
        </div>
        <ul className="pk-dept-grid">
          {Array.from({length: 15}).map((_, i) => (
            <li key={`skel-${i}`} className="pk-dept-tile pk-dept-tile--skel" />
          ))}
        </ul>
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
          <p className="pk-gift__sub">3,700+ options across every budget. Something for everyone on your list.</p>
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
  'home-kitchen':         {tagline: 'Your space, elevated.',        icon: IconHome},
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
    handle: 'home-kitchen', catKey: 'home',
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
      <p className="pk-catalog-cta__number" aria-label="Curated catalog">
        2k<span className="pk-catalog-cta__sup">+</span>
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
  const t = useT();
  const fetcher = useFetcher();
  const formRef = useRef(null);
  const [done, setDone] = useState(false);
  const submitting = fetcher.state !== 'idle';

  useEffect(() => {
    if (fetcher.data?.ok) { setDone(true); formRef.current?.reset(); }
  }, [fetcher.data]);

  return (
    <section className="pk-news" aria-label={t('news_aria')}>
      <div className="pk-news__glow" aria-hidden="true" />
      <div className="pk-news__inner">
        <span className="pk-pill pk-pill--glass">{t('news_eyebrow')}</span>
        <h2 className="pk-news__title">{t('news_title')}</h2>
        <p className="pk-news__sub">{t('news_sub')}</p>
        {done ? (
          <p className="pk-news__done" role="status">{t('news_done')}</p>
        ) : (
          <fetcher.Form ref={formRef} method="post" action="/newsletter" className="pk-news__form">
            <label htmlFor="nl-email" className="sr-only">{t('news_email_label')}</label>
            <input id="nl-email" type="email" name="email" placeholder={t('news_email_placeholder')}
              required className="pk-news__input" autoComplete="email" />
            <button type="submit" className="pk-btn pk-btn--spark" disabled={submitting}>
              {submitting ? t('news_submitting') : t('news_cta')}
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
  query RackProducts($country: CountryCode!, $language: LanguageCode!) @inContext(country: $country, language: $language) {
    collection(handle: "home-kitchen") {
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
  query Trending($country: CountryCode!, $language: LanguageCode!) @inContext(country: $country, language: $language) {
    collection(handle: "trending-finds") {
      products(first: 16, sortKey: BEST_SELLING) {
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
  query BestPicks($country: CountryCode!, $language: LanguageCode!) @inContext(country: $country, language: $language) {
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
  query NewArrivals($country: CountryCode!, $language: LanguageCode!) @inContext(country: $country, language: $language) {
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
  query FreshFinds($country: CountryCode!, $language: LanguageCode!) @inContext(country: $country, language: $language) {
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
  query Showcase($country: CountryCode!, $language: LanguageCode!) @inContext(country: $country, language: $language) {
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
  query CatWorld($country: CountryCode!, $language: LanguageCode!) @inContext(country: $country, language: $language) {
    home:    collection(handle: "home-kitchen")         { ...CatCol }
    beauty:  collection(handle: "beauty-personal-care") { ...CatCol }
    tech:    collection(handle: "tech-gadgets")         { ...CatCol }
    outdoor: collection(handle: "outdoor-garden")       { ...CatCol }
    pet:     collection(handle: "pet-finds")            { ...CatCol }
  }
`;

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
