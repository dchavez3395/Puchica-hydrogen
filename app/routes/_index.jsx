import {Await, useLoaderData} from 'react-router';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {Suspense, useEffect, useRef, useState} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import {error as logError} from '~/lib/logger';
import {useT} from '~/lib/t';
import {diversifyByVendor} from '~/lib/diversify';
import {IconGift, IconHeart, IconSparkles, IconStar, IconHome, IconLeaf, IconLightbulb, IconPawPrint} from '~/components/Icons';
import StarGlyph from '~/components/StarGlyph';
import {puchicaMeta, organizationJsonLd, websiteJsonLd, JsonLdScript} from '~/lib/seo';
import {CollectionShowcase} from '~/components/CollectionShowcase';
import {TrendingTicker} from '~/components/TrendingTicker';
import {ParallaxBanner} from '~/components/ParallaxBanner';
import {ShippingMap} from '~/components/ShippingMap';
import {getWorld} from '~/lib/shippingDestinations';
import {ScrollReveal} from '~/components/ScrollReveal';
import {TiltCard} from '~/components/TiltCard';
import {MagneticButton} from '~/components/MagneticButton';
import {HeroParallax} from '~/components/HeroParallax';
import {useAside} from '~/components/Aside';
import {AddToCartButton} from '~/components/AddToCartButton';

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
export const meta = ({params}) => {
  return puchicaMeta({
    title: 'Puchica – The good stuff. All in one place.',
    description:
      'Puchica: 6,000+ products across home, beauty, tech, pet, and more. Curated in Toronto. Free shipping across Canada, 30-day returns.',
    pathname: '/',
    langKey: params?.locale,
  });
};

/** @param {Route.LoaderArgs} args */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData() {
  // World TopoJSON for the shipping map. Server-side fetch + parse so
  // country paths are in the SSR HTML on first paint. Cached in module
  // scope so the CDN is only hit once per server process.
  const world = await getWorld().catch((e) => {
    logError('world TopoJSON failed', e);
    return null;
  });
  return {world};
}

function loadDeferredData({context}) {
  const {country, language} = context.storefront.i18n;
  // Pull the product node list from either `collection.products` or a
  // top-level `products` connection (different queries use different
  // shapes), then spread same-vendor products so adjacent items are
  // from different vendors. See app/lib/diversify.js for the algorithm.
  const norm = () => (res) => {
    const nodes =
      res?.collection?.products?.nodes ?? res?.products?.nodes ?? [];
    return diversifyByVendor(nodes);
  };

  // Trending curated collection → hero deck + discover swiper
  const trending = context.storefront
    .query(TRENDING_QUERY, {variables: {country, language}})
    .then(norm('trending'))
    .catch((e) => { logError('trending query failed', e); return []; });

  // Home & Kitchen collection → rack (no phone cases!)
  const rackProducts = context.storefront
    .query(RACK_QUERY, {variables: {country, language}})
    .then(norm('rack'))
    .catch((e) => { logError('rackProducts query failed', e); return []; });

  // Curated best-sellers collection (tagged) → featured banner
  const bestPicks = context.storefront
    .query(BEST_PICKS_QUERY, {variables: {country, language}})
    .then(norm('best'))
    .catch((e) => { logError('bestPicks query failed', e); return []; });

  const catWorld = context.storefront
    .query(CAT_WORLD_QUERY, {variables: {country, language}})
    .then((res) => {
      if (!res) return null;
      // Re-rank each category's product list so the cover image
      // (the first product) doesn't always come from the same
      // dominant vendor.
      const out = {};
      for (const [k, col] of Object.entries(res)) {
        if (col?.products?.nodes?.length) {
          out[k] = {
            ...col,
            products: {
              ...col.products,
              nodes: diversifyByVendor(col.products.nodes),
            },
          };
        } else {
          out[k] = col;
        }
      }
      return out;
    })
    .catch((e) => { logError('catWorld query failed', e); return null; });

  // Collection showcase - 6 rotating categories
  const showcaseCollections = context.storefront
    .query(SHOWCASE_QUERY, {variables: {country, language}})
    .then((res) => {
      if (!res) return [];
      return Object.values(res).filter(Boolean);
    })
    .catch((e) => { logError('showcase query failed', e); return []; });

  // Outdoor & Garden → new arrivals (completely different category)
  const newArrivals = context.storefront
    .query(NEW_ARRIVALS_QUERY, {variables: {country, language}})
    .then(norm('arrivals'))
    .catch((e) => { logError('newArrivals query failed', e); return []; });

  // Beauty & Personal Care → fresh finds (different again)
  const freshFinds = context.storefront
    .query(FRESH_FINDS_QUERY, {variables: {country, language}})
    .then(norm('fresh'))
    .catch((e) => { logError('freshFinds query failed', e); return []; });

  const discoverProducts = context.storefront
    .query(DISCOVER_QUERY, {variables: {country, language}})
    .then(norm('electronics-accessories'))
    .catch((e) => { logError('discoverProducts query failed', e); return []; });

  const matchProducts = context.storefront
    .query(MATCH_QUERY, {variables: {country, language}})
    .then(norm('health-wellness'))
    .catch((e) => { logError('matchProducts query failed', e); return []; });

  return {trending, rackProducts, bestPicks, catWorld, newArrivals, freshFinds, showcaseCollections, discoverProducts, matchProducts};
}

export default function Index() {
  const data = useLoaderData();
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div className="pk-home">
      <JsonLdScript data={organizationJsonLd({})} />
      <JsonLdScript data={websiteJsonLd({})} />

      {/* Dark hero section */}
      <div id="hero-anchor" className="pk-dark-lead">
        <Suspense fallback={<div style={{minHeight: '100dvh', background: '#0E0C08'}} />}>
          <Await resolve={data.trending}>
            {(products) => (
              <Hero
                products={products ?? []}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
              />
            )}
          </Await>
        </Suspense>
        <Marquee isPlaying={isPlaying} />
      </div>

      {/* Discover swiper — Tech & Gadgets collection */}
      <Suspense fallback={null}>
        <Await resolve={data.discoverProducts}>
          {(products) => (
            <ScrollReveal variant="up">
              <DiscoverSwiper products={products ?? []} />
            </ScrollReveal>
          )}
        </Await>
      </Suspense>

      {/* Product rack — Home & Kitchen (completely different category) */}
      <Suspense fallback={<div style={{height: 480, background: '#F4F0E6'}} />}>
        <Await resolve={data.rackProducts}>
          {(products) => (
            <ScrollReveal variant="up">
              <ProductRack products={products ?? []} />
            </ScrollReveal>
          )}
        </Await>
      </Suspense>

      {/* Gift finder */}
      <GiftFinder />

      {/* Product Matchmaker (Tinder Swipe Finder) — Health & Wellness collection */}
      <Suspense fallback={null}>
        <Await resolve={data.matchProducts}>
          {(products) => (
            <ScrollReveal variant="up">
              <ProductMatchmaker products={products ?? []} />
            </ScrollReveal>
          )}
        </Await>
      </Suspense>

      {/* New arrivals — Outdoor & Garden (different category) */}
      <Suspense fallback={null}>
        <Await resolve={data.newArrivals}>
          {(products) => (
            <ScrollReveal variant="up">
              <NewArrivals products={products ?? []} />
            </ScrollReveal>
          )}
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

      {/* Fresh finds — Beauty & Personal Care (different category) */}
      <Suspense fallback={null}>
        <Await resolve={data.freshFinds}>
          {(products) => (
            <ScrollReveal variant="up">
              <FreshFinds products={products ?? []} />
            </ScrollReveal>
          )}
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
      <ParallaxBanner />


      {/* Shipping reach map */}
      <ShippingMap world={data.world} />

      <Suspense fallback={null}>
        <Await resolve={data.trending}>
          {(products) => <TrendingTicker products={products ?? []} />}
        </Await>
      </Suspense>

    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   HERO
───────────────────────────────────────────────────────────────── */
function Hero({products, isPlaying, setIsPlaying}) {
  const t = useT();
  const carouselProducts = (products ?? []).slice(0, 5).filter((p) => p.featuredImage);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (!isPlaying || carouselProducts.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % carouselProducts.length);
    }, 6000); // Shift slides every 6s for comfortable visual reading
    return () => clearInterval(interval);
  }, [isPlaying, carouselProducts.length]);

  const featuredProduct = carouselProducts[activeIdx];
  const heroWords = t('hero_title').split(' ');
  const line1 = heroWords.slice(0, 1);
  const line2 = heroWords.slice(1);

  return (
    <section className="pk-hero2 pk-hero2--lifestyle" aria-label={t('swiper_slides_aria')}>
      <div className="pk-hero2__bg">
        {carouselProducts.map((p, idx) => (
          <div
            key={p.id}
            className={`pk-hero2__bg-slide${idx === activeIdx ? ' is-active' : ''}`}
            aria-hidden="true"
          >
            <Image
              data={p.featuredImage}
              sizes="100vw"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
        <div className="pk-hero2__bg-overlay" />
      </div>
      <div className="pk-hero2__glow pk-hero2__glow--a" aria-hidden="true" />
      <div className="pk-hero2__glow pk-hero2__glow--b" aria-hidden="true" />
      <HeroParallax strength={0.15} direction="up">
        <div className="pk-hero2__inner">
          <div className="pk-hero2__copy">
          <span className="pk-hero2__eyebrow"><StarGlyph /> {t('hero_eyebrow')}</span>
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
          <p className="pk-hero2__sub">{t('hero_sub')}</p>
          <div className="pk-hero2__ctas">
            <MagneticButton as={Link} to="/collections" className="pk-btn pk-btn--ember pk-btn--lg">{t('hero_cta_shop')}</MagneticButton>
            <Link to="/collections/all" className="pk-btn pk-btn--ghost pk-btn--lg">{t('hero_cta_browse')}</Link>
          </div>
          <ul className="pk-hero2__stats" aria-label={t('swiper_stats_aria')}>
            <li><strong>6,000+</strong><span>{t('hero_stat_products')}</span></li>
            <li><strong>Free</strong><span>{t('hero_stat_shipping')}</span></li>
            <li><strong>30 days</strong><span>{t('hero_stat_returns')}</span></li>
          </ul>
          </div>
        </div>
      </HeroParallax>

      {featuredProduct && (
        <Link
          to={`/products/${featuredProduct.handle}`}
          className="pk-hero2__featured-link"
          aria-label={t('hero_featured_label').replace('{title}', featuredProduct.title)}
        >
          Featured: {featuredProduct.title}
        </Link>
      )}

      <button
        type="button"
        className="pk-hero2__play-pause"
        onClick={() => setIsPlaying(!isPlaying)}
        aria-label={isPlaying ? t('hero_pause_label') : t('hero_play_label')}
      >
        {isPlaying ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z"/>
          </svg>
        )}
      </button>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MARQUEE — accessible with pause/play
───────────────────────────────────────────────────────────────── */
function Marquee({isPlaying}) {
  const t = useT();
  const MARQUEE_ITEMS = [
    t('ticker_products'), t('ticker_new_drops'), t('ticker_free_shipping'),
    t('ticker_returns'), t('ticker_ships'), t('ticker_handpicked'),
    t('ticker_real_value'), t('ticker_secure'),
  ];
  // The track is decorative (duplicated items are not real content).
  // The scroll state is synchronized with the main Hero play/pause controller.
  return (
    <div className="pk-marquee">
      <div className="pk-marquee__track-wrap" aria-hidden="true">
        <div className={`pk-marquee__track${!isPlaying ? ' is-paused' : ''}`}>
          {['a', 'b'].flatMap((copy) =>
            MARQUEE_ITEMS.map((t) => (
              <span className="pk-marquee__item" key={`${copy}-${t}`}>
                <span className="pk-marquee__dot"><StarGlyph size={10} style={{marginRight: 0}} /></span>{t}
              </span>
            )),
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   PRODUCT MATCHMAKER (TINDER SWIPE FINDER)
───────────────────────────────────────────────────────────────── */
function ProductMatchmaker({products}) {
  const t = useT();
  const swipeProducts = (products ?? []).filter(
    (p) => p.featuredImage && p.variants?.nodes?.[0],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState({x: 0, y: 0});
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [likedCount, setLikedCount] = useState(0);
  const {open} = useAside();

  const dragStartRef = useRef({x: 0, y: 0});
  const activeProduct = swipeProducts[currentIndex];
  const nextProduct = swipeProducts[currentIndex + 1];
  const nextProduct2 = swipeProducts[currentIndex + 2];

  const handleStart = (e, isTouch = false) => {
    if (!isTouch) {
      e.preventDefault();
    }
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    dragStartRef.current = {x: clientX, y: clientY};
  };

  const handleMove = (e, isTouch = false) => {
    if (!isDragging) return;
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;
    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;
    setDragOffset({x: deltaX, y: deltaY});
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = 120;
    if (dragOffset.x > threshold) {
      swipe('right');
    } else if (dragOffset.x < -threshold) {
      swipe('left');
    } else if (dragOffset.y < -threshold) {
      swipe('up');
    } else {
      setDragOffset({x: 0, y: 0});
    }
  };

  const swipe = (dir) => {
    setSwipeDirection(dir);
    if (dir === 'right') {
      setLikedCount((prev) => prev + 1);
    } else if (dir === 'up' && activeProduct) {
      triggerAddToCart(activeProduct.id);
      open('cart');
    }

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setSwipeDirection(null);
      setDragOffset({x: 0, y: 0});
    }, 300);
  };

  const triggerAddToCart = (productId) => {
    const container = document.getElementById(`atc-wrap-${productId}`);
    if (container) {
      const btn = container.querySelector('button[type="submit"]');
      if (btn) {
        btn.click();
      }
    }
  };

  const resetDeck = () => {
    setCurrentIndex(0);
    setLikedCount(0);
  };

  const getStampOpacity = (type) => {
    if (swipeDirection) {
      return swipeDirection === type ? 1 : 0;
    }
    const maxVal = 100;
    if (type === 'like' && dragOffset.x > 20) {
      return Math.min(dragOffset.x / maxVal, 1);
    }
    if (type === 'nope' && dragOffset.x < -20) {
      return Math.min(-dragOffset.x / maxVal, 1);
    }
    if (type === 'super' && dragOffset.y < -20 && Math.abs(dragOffset.y) > Math.abs(dragOffset.x)) {
      return Math.min(-dragOffset.y / maxVal, 1);
    }
    return 0;
  };

  if (!swipeProducts.length) return null;

  const isCompleted = currentIndex >= swipeProducts.length;

  return (
    <section className="pk-matchmaker" aria-label={t('match_section_aria')}>
      <div className="pk-matchmaker__inner">
        <div className="pk-matchmaker__head">
          <span className="pk-matchmaker__eye"><StarGlyph /> {t('match_eyebrow')}</span>
          <h2 className="pk-matchmaker__title">{t('match_title')}</h2>
          <p className="pk-matchmaker__sub" dangerouslySetInnerHTML={{__html: t('match_sub')}} />
        </div>

        {isCompleted ? (
          <div className="pk-matchmaker__empty">
            <span className="pk-matchmaker__empty-heart" aria-hidden="true">💖</span>
            <h3>{t('match_empty_title')}</h3>
            <p>{t('match_empty_body').replace('{count}', likedCount)}</p>
            <div className="pk-matchmaker__empty-actions">
              <button onClick={resetDeck} className="pk-btn pk-btn--ember">{t('match_reset')}</button>
              <Link to="/collections/all" className="pk-btn pk-btn--ghost">{t('match_browse')}</Link>
            </div>
          </div>
        ) : (
          <div className="pk-matchmaker__find-wrap">
            <div className="pk-matchmaker__stack" role="region" aria-label={t('match_deck_aria')}>
              {nextProduct2 && (
                <div className="pk-matchmaker__card pk-matchmaker__card--under2" aria-hidden="true">
                  <div className="pk-matchmaker__img-wrap">
                    <Image data={nextProduct2.featuredImage} sizes="360px" />
                  </div>
                  <div className="pk-matchmaker__card-info">
                    <p className="pk-matchmaker__card-name">{nextProduct2.title}</p>
                    <div className="pk-matchmaker__card-price">
                      <Money data={nextProduct2.priceRange.minVariantPrice} />
                    </div>
                  </div>
                </div>
              )}

              {nextProduct && (
                <div className="pk-matchmaker__card pk-matchmaker__card--under" aria-hidden="true">
                  <div className="pk-matchmaker__img-wrap">
                    <Image data={nextProduct.featuredImage} sizes="360px" />
                  </div>
                  <div className="pk-matchmaker__card-info">
                    <p className="pk-matchmaker__card-name">{nextProduct.title}</p>
                    <div className="pk-matchmaker__card-price">
                      <Money data={nextProduct.priceRange.minVariantPrice} />
                    </div>
                  </div>
                </div>
              )}

              {activeProduct && (
                <div
                  className={`pk-matchmaker__card pk-matchmaker__card--top${isDragging ? ' is-dragging' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${t('match_deck_aria')}: ${activeProduct.title}. Use arrow keys to swipe, Enter to open.`}
                  onMouseDown={(e) => handleStart(e, false)}
                  onMouseMove={(e) => handleMove(e, false)}
                  onMouseUp={handleEnd}
                  onMouseLeave={handleEnd}
                  onTouchStart={(e) => handleStart(e, true)}
                  onTouchMove={(e) => handleMove(e, true)}
                  onTouchEnd={handleEnd}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') swipe('left');
                    else if (e.key === 'ArrowRight') swipe('right');
                    else if (e.key === 'ArrowUp') swipe('super');
                  }}
                  style={{
                    transform: swipeDirection
                      ? (swipeDirection === 'right'
                        ? 'translate3d(500px, 0, 0) rotate(30deg)'
                        : swipeDirection === 'left'
                          ? 'translate3d(-500px, 0, 0) rotate(-30deg)'
                          : 'translate3d(0, -500px, 0) rotate(0deg)')
                      : `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${dragOffset.x * 0.08}deg)`,
                    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)',
                  }}
                >
                  <div className="pk-matchmaker__img-wrap">
                    <Image data={activeProduct.featuredImage} sizes="360px" loading="eager" />
                    
                    <span
                      className="pk-matchmaker__stamp pk-matchmaker__stamp--like"
                      style={{ opacity: getStampOpacity('like') }}
                    >
                      {t('match_stamp_like')}
                    </span>
                    <span
                      className="pk-matchmaker__stamp pk-matchmaker__stamp--nope"
                      style={{ opacity: getStampOpacity('nope') }}
                    >
                      {t('match_stamp_nope')}
                    </span>
                    <span
                      className="pk-matchmaker__stamp pk-matchmaker__stamp--super"
                      style={{ opacity: getStampOpacity('super') }}
                    >
                      {t('match_stamp_super')}
                    </span>
                  </div>

                  <div className="pk-matchmaker__card-info">
                    <p className="pk-matchmaker__card-name">{activeProduct.title}</p>
                    <div className="pk-matchmaker__card-price">
                      <Money data={activeProduct.priceRange.minVariantPrice} />
                    </div>
                  </div>

                  <div id={`atc-wrap-${activeProduct.id}`} style={{ display: 'none' }}>
                    <AddToCartButton
                      lines={[{ merchandiseId: activeProduct.variants.nodes[0].id, quantity: 1 }]}
                      onClick={(e) => {
                        e.stopPropagation();
                        open('cart');
                      }}
                    >
                      Add to Cart
                    </AddToCartButton>
                  </div>
                </div>
              )}
            </div>

            {activeProduct && (
              <div className="pk-matchmaker__actions">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    swipe('left');
                  }} 
                  className="pk-matchmaker__btn pk-matchmaker__btn--nope"
                  aria-label={t('match_pass_aria')}
                >
                  ❌
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    swipe('up');
                  }} 
                  className="pk-matchmaker__btn pk-matchmaker__btn--super"
                  aria-label={t('match_super_aria')}
                >
                  ⚡
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    swipe('right');
                  }} 
                  className="pk-matchmaker__btn pk-matchmaker__btn--like"
                  aria-label={t('match_like_aria')}
                >
                  💚
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function scrollContainerToChild(container, childIndex) {
  if (!container) return;
  const child = container.children[childIndex];
  if (!child) return;

  const containerWidth = container.clientWidth;
  const childWidth = child.clientWidth;
  const scrollLeft = child.offsetLeft - (containerWidth / 2) + (childWidth / 2);

  container.scrollTo({
    left: scrollLeft,
    behavior: 'smooth',
  });
}

/* ─────────────────────────────────────────────────────────────────
   DISCOVER SWIPER
───────────────────────────────────────────────────────────────── */
function DiscoverSwiper({products}) {
  const t = useT();
  const items = products.slice(0, 5);
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
    scrollContainerToChild(trackRef.current, n);
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
      // Only auto-scroll the carousel track when the section is in viewport
      // Otherwise this yanks the user back to the carousel if they've scrolled past it
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (inView) {
          scrollContainerToChild(trackRef.current, next);
        }
      }
    }, 5000);
    return () => clearInterval(id);
  }, [userPaused, items.length]);

  if (!items.length) return null;
  return (
    <section // eslint-disable-line jsx-a11y/no-noninteractive-element-interactions
      ref={sectionRef}
      id="section-discover"
      className="pk-swiper"
      aria-label={t('swiper_carousel_aria')}
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
          <p className="pk-swiper__eye"><StarGlyph /> {t('swiper_eyebrow')}</p>
          <h2 className="pk-swiper__title">{t('swiper_title')}</h2>
        </div>
        <div className="pk-swiper__navrow" role="group" aria-label={t('swiper_carousel_nav_aria')}>
          <button className="pk-swiper__arr" onClick={() => scrollTo(active - 1)} disabled={active === 0} aria-label={t('swiper_prev_aria')}>←</button>
          <span className="pk-swiper__count" aria-live="polite" aria-atomic="true">{active + 1} / {items.length}</span>
          <button className="pk-swiper__arr" onClick={() => scrollTo(active + 1)} disabled={active === items.length - 1} aria-label={t('swiper_next_aria')}>→</button>
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
      <div className="pk-swiper__dots" aria-label={t('swiper_dots_aria')}>
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
          aria-label={autoPaused ? t('swiper_resume_label') : t('swiper_pause_label')}
          aria-pressed={autoPaused}
          aria-controls="pk-swiper-track"
        >
          <span className="pk-swiper__ctrl-icon" aria-hidden="true">{autoPaused ? '▶' : '⏸'}</span>
          <span className="pk-swiper__ctrl-label">{autoPaused ? t('swiper_resume_label') : t('swiper_pause_label')}</span>
        </button>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   PRODUCT RACK
───────────────────────────────────────────────────────────────── */
function ProductRack({products}) {
  const t = useT();
  const trackRef = useRef(null);
  const {canLeft, canRight, scrollBy} = useScrollNav(trackRef);
  if (!products?.length) return null;
  return (
    <section id="section-rack" className="pk-rack" aria-label={t('rack_section_aria')}>
      <div className="pk-inner pk-rack__head">
        <div>
          <p className="pk-rack__eye"><StarGlyph /> {t('rack_eyebrow')}</p>
          <h2 className="pk-rack__title">{t('rack_title')}</h2>
        </div>
        <div className="pk-rack__nav" role="group" aria-label={t('rack_scroll_aria')}>
          <button className="pk-rack__arr" onClick={() => scrollBy(-260)} disabled={!canLeft} aria-label={t('rack_scroll_left_aria')}>←</button>
          <button className="pk-rack__arr" onClick={() => scrollBy(260)} disabled={!canRight} aria-label={t('rack_scroll_right_aria')}>→</button>
        </div>
      </div>
      <div className="pk-rack__track" ref={trackRef} role="list">
        {products.slice(0, 6).map((p) => (
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
function GiftFinder() {
  const t = useT();
  // Price cards route to the live `best-sellers` collection with the
  // `?price=…` param so the price filter actually narrows the
  // products list. The simpler `/collections/all` view goes through
  // `QueryRoot.products`, which doesn't accept a `ProductFilter` —
  // only `Collection.products` does. So we need a real collection
  // here for the filter to be honored.
  //
  // The `best-sellers` collection is the largest curated set in the
  // catalog and is the closest thing to "the whole catalog" that
  // supports price filtering on the current API. Gift cards under
  // $25 map to the dedicated `gifts-under-25` collection which is
  // hand-curated for that bracket.
  const PRICE_BRACKETS = [
    {range: 'under-25', label: t('gift_under25_label'), sub: t('gift_under25_sub'), icon: IconGift,    base: 'gifts-under-25'},
    {range: '25-50',    label: t('gift_25_50_label'),   sub: t('gift_25_50_sub'),   icon: IconHeart,   base: 'best-sellers'},
    {range: '50-100',   label: t('gift_50_100_label'),  sub: t('gift_50_100_sub'),  icon: IconSparkles,base: 'best-sellers'},
    {range: '100-plus', label: t('gift_100_label'),     sub: t('gift_100_sub'),     icon: IconStar,    base: 'best-sellers'},
  ];
  return (
    <ScrollReveal variant="up">
      <section className="pk-gift" aria-label={t('gift_section_aria')}>
        <div className="pk-gift__inner">
          <div className="pk-gift__head">
            <span className="pk-gift__eye"><StarGlyph /> {t('gift_eyebrow')}</span>
            <h2 className="pk-gift__title">{t('gift_title')}</h2>
            <p className="pk-gift__sub">{t('gift_sub')}</p>
          </div>
          <div className="pk-gift__grid">
            {PRICE_BRACKETS.map(({range, label, sub, icon: Icon, base}, i) => (
              <ScrollReveal key={range} delay={i * 60} variant="up">
                <TiltCard className="pk-gift__card-wrap" maxTilt={6}>
                  <Link to={`/collections/${base}?price=${range}`} className="pk-gift__card" aria-label={`Shop gifts ${label}`}>
                    <span className="pk-gift__icon" aria-hidden="true"><Icon size={28} /></span>
                    <strong className="pk-gift__label">{label}</strong>
                    <span className="pk-gift__card-sub">{sub}</span>
                    <span className="pk-gift__arrow" aria-hidden="true">→</span>
                  </Link>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}

/* ─────────────────────────────────────────────────────────────────
   NEW ARRIVALS — dark horizontal strip
───────────────────────────────────────────────────────────────── */
function NewArrivals({products}) {
  const t = useT();
  const trackRef = useRef(null);
  const {canLeft, canRight, scrollBy} = useScrollNav(trackRef);
  if (!products?.length) return null;
  return (
    <section id="section-new-arrivals" className="pk-arrivals" aria-label={t('arrivals_section_aria')}>
      <div className="pk-arrivals__head pk-inner">
        <div>
          <p className="pk-arrivals__eye"><StarGlyph /> {t('arrivals_eyebrow')}</p>
          <h2 className="pk-arrivals__title">{t('arrivals_title')}</h2>
        </div>
        <div className="pk-arrivals__head-right">
          <Link to="/collections/new-arrivals" className="pk-arrivals__link">
            {t('arrivals_see_all')}
            <span className="pk-arrivals__link-arrow" aria-hidden="true">→</span>
          </Link>
          <div className="pk-rack__nav" role="group" aria-label={t('arrivals_scroll_aria')}>
            <button className="pk-rack__arr pk-rack__arr--dark" onClick={() => scrollBy(-220)} disabled={!canLeft} aria-label={t('rack_scroll_left_aria')}>←</button>
            <button className="pk-rack__arr pk-rack__arr--dark" onClick={() => scrollBy(220)} disabled={!canRight} aria-label={t('rack_scroll_right_aria')}>→</button>
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
              <span className="pk-arrivals__card-badge" aria-label={t('arrivals_badge_aria')}>{t('arrivals_badge')}</span>
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
const CAT_ORDER = ['home', 'beauty', 'tech', 'outdoor', 'pet'];

function CategoryBento({res}) {
  const t = useT();
  const CAT_META = {
    'home-kitchen':          {tagline: t('cat_home_tagline'),    icon: IconHome},
    'beauty-personal-care':  {tagline: t('cat_beauty_tagline'),  icon: IconSparkles},
    'electronics-accessories': {tagline: t('cat_tech_tagline'),  icon: IconLightbulb},
    'outdoor-garden':        {tagline: t('cat_outdoor_tagline'), icon: IconLeaf},
    'pet-supplies':          {tagline: t('cat_pet_tagline'),     icon: IconPawPrint},
  };
  const cats = CAT_ORDER.map((k) => res?.[k]).filter(Boolean).slice(0, 5);

  if (!cats.length) return null;
  // The bento uses explicit grid placement that's built for 5
  // cards. When fewer categories return data, fall back to a
  // simpler uniform grid so the section doesn't look like a
  // half-built construction site.
  const gridClass = `pk-bento__grid pk-bento__grid--n${cats.length} pk-inner`;

  return (
    <section id="section-categories" className="pk-bento" aria-label={t('cat_section_aria')}>
      <div className="pk-bento__head pk-inner">
        <p className="pk-bento__eye"><StarGlyph /> {t('cat_eyebrow')}</p>
        <h2 className="pk-bento__title">{t('cat_title')}</h2>
      </div>
      <div className={gridClass}>
        {cats.map((col, i) => {
          const meta = CAT_META[col.handle] ?? {tagline: t('cat_fallback_tagline'), icon: IconStar};
          const Icon = meta.icon;
          const img = col.products?.nodes?.[0]?.featuredImage;
          return (
            <ScrollReveal
              key={col.id}
              delay={i * 60}
              variant="up"
              className={`pk-bento__cell--${i}`}
              style={{ display: 'flex' }}
            >
              <TiltCard className="pk-bento__cell-wrap" maxTilt={6} style={{ width: '100%' }}>
                <Link to={`/collections/${col.handle}`}
                  className="pk-bento__cell"
                  style={{ height: '100%' }}
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
                    <span className="pk-bento__cell-cta">{t('cat_shop_now')}</span>
                  </div>
                </Link>
              </TiltCard>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SHOP BY MOOD — 3-col editorial with real category images
───────────────────────────────────────────────────────────────── */
function ShopByMood({catRes}) {
  const t = useT();
  const MOODS = [
    {
      handle: 'home-kitchen', catKey: 'home',
      label: t('mood_home_label'),
      title: t('mood_home_title'),
      sub: t('mood_home_sub'),
      cta: t('mood_home_cta'),
      icon: IconHome,
    },
    {
      handle: 'beauty-personal-care', catKey: 'beauty',
      label: t('mood_beauty_label'),
      title: t('mood_beauty_title'),
      sub: t('mood_beauty_sub'),
      cta: t('mood_beauty_cta'),
      icon: IconSparkles,
    },
    {
      handle: 'electronics-accessories', catKey: 'tech',
      label: t('mood_tech_label'),
      title: t('mood_tech_title'),
      sub: t('mood_tech_sub'),
      cta: t('mood_tech_cta'),
      icon: IconLightbulb,
    },
  ];
  return (
    <ScrollReveal variant="up">
      <section className="pk-mood" aria-label={t('mood_section_aria')}>
        <div className="pk-mood__head pk-inner">
          <p className="pk-mood__eye"><StarGlyph /> {t('mood_eyebrow')}</p>
          <h2 className="pk-mood__title">{t('mood_title')}</h2>
        </div>
        <div className="pk-mood__grid">
          {MOODS.map((m, i) => {
            const Icon = m.icon;
            const col = catRes?.[m.catKey];
            const img = col?.products?.nodes?.[0]?.featuredImage;
            return (
              <ScrollReveal key={m.handle} delay={i * 60} variant="up">
                <TiltCard className="pk-mood__card-wrap" maxTilt={6}>
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
                </TiltCard>
              </ScrollReveal>
            );
          })}
        </div>
      </section>
    </ScrollReveal>
  );
}

/* ─────────────────────────────────────────────────────────────────
   FRESH FINDS — recently updated (different set from trending)
───────────────────────────────────────────────────────────────── */
function FreshFinds({products}) {
  const t = useT();
  const trackRef = useRef(null);
  const {canLeft, canRight, scrollBy} = useScrollNav(trackRef);
  if (!products?.length) return null;
  return (
    <section className="pk-rack pk-rack--fresh" aria-label={t('fresh_section_aria')}>
      <div className="pk-inner pk-rack__head">
        <div>
          <p className="pk-rack__eye"><StarGlyph /> {t('mood_beauty_label')}</p>
          <h2 className="pk-rack__title">{t('mood_beauty_title')}</h2>
        </div>
        <div className="pk-rack__nav" role="group" aria-label={t('fresh_scroll_aria')}>
          <button className="pk-rack__arr" onClick={() => scrollBy(-260)} disabled={!canLeft} aria-label={t('rack_scroll_left_aria')}>←</button>
          <button className="pk-rack__arr" onClick={() => scrollBy(260)} disabled={!canRight} aria-label={t('rack_scroll_right_aria')}>→</button>
        </div>
      </div>
      <div className="pk-rack__track" ref={trackRef} role="list">
        {products.slice(0, 6).map((p) => (
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
  const t = useT();
  if (!products?.length) return null;
  return (
    <section id="section-best-sellers" className="pk-feat-banner" aria-label={t('banner_section_aria')}>
      <div className="pk-feat-banner__inner">
        <div className="pk-feat-banner__head">
          <div>
            <p className="pk-feat-banner__label"><StarGlyph variant="five" size={12} style={{marginRight: '0.5em'}} /> {t('banner_eyebrow')}</p>
            <h2 className="pk-feat-banner__title">{t('banner_title')}</h2>
          </div>
          <Link to="/collections/best-sellers" className="pk-feat-banner__cta">
            {t('banner_cta')} →
          </Link>
        </div>
        <div className="pk-feat-banner__grid">
          {products.slice(0, 4).map((p) => (
            <Link key={p.id} to={`/products/${p.handle}`} className="pk-feat-banner__card" aria-label={p.title}>
              {p.featuredImage && <Image data={p.featuredImage} aspectRatio="4/5" sizes="280px" loading="lazy" />}
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
  const t = useT();
  const countRef = useRef(null);
  const [count, setCount] = useState(0);

  // Count up from 0 → 6,000 (internal value) the first time the
  // section scrolls into view. Display format follows the value:
  //   0 → 999       : full digit, no comma yet (e.g. 0, 100, 500)
  //   1,000 → 9,999 : abbreviated to "1k", "2k", … "6k" so the
  //                   number reads as a short typographic flourish
  //                   instead of a four-digit counter.
  // The "+" superscript + "k" suffix in the JSX only renders when
  // we display the abbreviated form (see displayK below).
  useEffect(() => {
    const el = countRef.current;
    if (!el) return;

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduced) {
      setCount(6000);
      return;
    }

    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            started = true;
            const duration = 1800;
            const start = performance.now();
            const tick = (now) => {
              const progress = Math.min((now - start) / duration, 1);
              // Ease out cubic — hundreds tick fast, last stretch
              // into 6,000 settles.
              const eased = 1 - Math.pow(1 - progress, 3);
              setCount(Math.round(eased * 6000));
              if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            observer.unobserve(entry.target);
          }
        }
      },
      {threshold: 0.4},
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 0 → 999 prints the raw number. 1,000+ collapses to "<n>k".
  const displayK = count >= 1000;

  return (
    <section className="pk-catalog-cta" aria-label={t('catalog_section_aria')}>
      <p
        ref={countRef}
        className="pk-catalog-cta__number"
        aria-label={t('catalog_count_aria')}
      >
        {displayK ? `${Math.floor(count / 1000)}k` : count}
        {displayK ? <span className="pk-catalog-cta__sup">+</span> : null}
      </p>
      <p className="pk-catalog-cta__body">{t('catalog_body')}</p>
      <div className="pk-catalog-cta__ctas">
        <Link to="/collections/all" className="pk-btn pk-btn--lg pk-btn--ink">{t('catalog_cta_browse')}</Link>
        {/* The "Search the catalog" CTA used to link to /search with no
            query string, which rendered the search route as an empty
            page with just the input. Rather than pre-fill a query
            (the search route's empty-state isn't designed to dump the
            full catalog), the header already exposes a search
            affordance, so the secondary CTA was removed. The
            "catalog_cta_search" translation key is preserved for any
            later use. */}
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
      products(first: 6, sortKey: MANUAL) {
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
    variants(first: 1) {
      nodes {
        id
        availableForSale
      }
    }
  }
  query Trending($country: CountryCode!, $language: LanguageCode!) @inContext(country: $country, language: $language) {
    collection(handle: "trending-finds") {
      products(first: 5, sortKey: BEST_SELLING) {
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
      products(first: 4, sortKey: BEST_SELLING) {
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
      products(first: 6, sortKey: MANUAL) {
        nodes { ...FreshFind }
      }
    }
  }
`;

/* ── Tech & Gadgets → discover swiper ── */
const DISCOVER_QUERY = `#graphql
  fragment DiscoverProduct on Product {
    id title handle
    priceRange { minVariantPrice { amount currencyCode } }
    featuredImage { id url altText width height }
    variants(first: 1) {
      nodes { id availableForSale }
    }
  }
  query DiscoverProducts($country: CountryCode!, $language: LanguageCode!) @inContext(country: $country, language: $language) {
    collection(handle: "electronics-accessories") {
      products(first: 6, sortKey: MANUAL) {
        nodes { ...DiscoverProduct }
      }
    }
  }
`;

/* ── Health & Wellness → matchmaker swipe cards ── */
const MATCH_QUERY = `#graphql
  fragment MatchProduct on Product {
    id title handle
    priceRange { minVariantPrice { amount currencyCode } }
    featuredImage { id url altText width height }
    variants(first: 1) {
      nodes { id availableForSale }
    }
  }
  query MatchProducts($country: CountryCode!, $language: LanguageCode!) @inContext(country: $country, language: $language) {
    collection(handle: "health-wellness") {
      products(first: 8, sortKey: BEST_SELLING) {
        nodes { ...MatchProduct }
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
    products(first: 4, sortKey: MANUAL) {
      nodes { ...CatProduct }
    }
  }
  query CatWorld($country: CountryCode!, $language: LanguageCode!) @inContext(country: $country, language: $language) {
    home:    collection(handle: "home-kitchen")          { ...CatCol }
    beauty:  collection(handle: "beauty-personal-care")  { ...CatCol }
    tech:    collection(handle: "electronics-accessories") { ...CatCol }
    outdoor: collection(handle: "outdoor-garden")        { ...CatCol }
    pet:     collection(handle: "pet-supplies")          { ...CatCol }
  }
`;

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
