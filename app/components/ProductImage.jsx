import {useEffect, useRef, useState, useCallback} from 'react';
import {Image} from '@shopify/hydrogen';
import useEmblaCarousel from 'embla-carousel-react';
import {IconChevronLeft, IconChevronRight, IconCube, IconZoomIn} from '~/components/Icons';
import {HeroParallax} from './HeroParallax';
import {ProductHero3D} from './ProductHero3D';
import {useT} from '~/lib/t';

/**
 * Hero gallery for the PDP — rebuilt for the 2026-06-29 reboot.
 *
 * Three display modes:
 *   - 'image' (default): standard photo gallery + hover magnifier
 *   - '3d'   : swaps the hero for the WebGL viewer
 *   - 'zoom' : magnifier lens (desktop, hover-capable pointer only)
 *
 * Visual treatment:
 *   - The hero photo is wrapped in <HeroParallax> so it drifts at
 *     0.4× scroll speed on desktop. Disabled when the user opts
 *     into reduced motion (the HeroParallax component handles this).
 *   - Thumbnails live in a horizontal Embla strip BELOW the hero
 *     on every viewport — the previous vertical left-rail thumbs
 *     have been removed in favor of this single row. Embla gives
 *     drag-to-scroll on touch and a clean horizontal row on
 *     desktop.
 *   - The active thumbnail gets an ember outline; other thumbnails
 *     show a subtle ring on hover.
 *   - The hero container has a faint product-accent gradient (driven
 *     by the `accentColor` CSS variable) so the page picks up the
 *     merchant's brand vibe without us hardcoding colors.
 *
 * The 3D toggle pill renders only when:
 *   - `modelAvailable` is true AND
 *   - Either `modelUrl` is present OR the merchant has configured a
 *     metafield that we want to feature. Without a model URL the
 *     toggle surfaces a textured-card viewer — a deliberate fallback
 *     so the affordance stays meaningful.
 *
 * Aspect-ratio behavior is preserved from the previous version:
 *   - Portrait source       → honored
 *   - Landscape source      → capped at 1:1
 *   - Square (supplier)     → forced 4:5 to crop white border padding
 *
 * @param {{
 *   images: ProductVariantFragment['image'][];
 *   initialIndex?: number;
 *   productTitle?: string;
 *   modelUrl?: string | null;
 *   modelAvailable?: boolean; // pass false to force-hide the 3D toggle
 *   accentColor?: string | null; // hex like '#CC4300' for hero accent
 * }}
 */
export function ProductImage({
  images,
  initialIndex = 0,
  productTitle,
  modelUrl = null,
  modelAvailable = true,
  accentColor = null,
}) {
  const t = useT();
  const list = (images || []).filter(Boolean);
  const [index, setIndex] = useState(
    Math.min(Math.max(0, initialIndex), Math.max(0, list.length - 1)),
  );
  const [mode, setMode] = useState('image'); // 'image' | '3d'
  const [zoom, setZoom] = useState(null); // {x, y} pointer pos, or null
  const heroRef = useRef(null);

  // Sync the Embla filmstrip (mobile) with the active index.
  const [emblaRef, emblaApi] = useEmblaCarousel({
    containScroll: 'trimSnaps',
    dragFree: false,
    align: 'start',
  });
  useEffect(() => {
    if (!emblaApi) return;
    if (index > 0) emblaApi.scrollTo(index);
  }, [emblaApi, index]);

  const imageKey = list.map((i) => i.id || i.url).join('|');

  useEffect(() => {
    setIndex(0);
    setZoom(null);
  }, [imageKey, mode]);

  // Pointer handlers — defined unconditionally so the hook order is
  // stable. They no-op when there's no hero yet.
  const onHeroPointerMove = useCallback((e) => {
    if (mode !== 'image' || e.pointerType !== 'mouse') return;
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y))});
  }, [mode]);
  const onHeroPointerLeave = useCallback(() => setZoom(null), []);

  if (list.length === 0) {
    return <div className="pk-product__hero" aria-hidden />;
  }

  const current = list[index];
  const go = (delta) => setIndex((i) => (i + delta + list.length) % list.length);

  // Aspect-ratio derivation (unchanged).
  const nW = current.width;
  const nH = current.height;
  let heroRatio;
  if (nW && nH) {
    const sourceRatio = nW / nH;
    if (sourceRatio < 0.95) heroRatio = sourceRatio;
    else if (sourceRatio > 1.05) heroRatio = 1;
    else heroRatio = 4 / 5;
  } else {
    heroRatio = 1;
  }
  const heroStyle = {aspectRatio: heroRatio.toFixed(4)};

  // Inline accent color CSS variable — drives the subtle gradient
  // behind the hero. Falls back to brand ember if no metafield.
  const accentStyle = accentColor
    ? {'--pk-product-accent': accentColor}
    : undefined;

  // 3D viewer is temporarily disabled — the WebGL bundle (three.js
  // + drei + fiber) crashes the route when the toggle is clicked,
  // throwing an unhandled error that the route ErrorBoundary
  // renders as a 404-style page. The product gallery already
  // shows all images via the horizontal thumbnail strip + hover
  // magnifier, so the affordance can wait until the bundle is
  // stabilized. Re-enable by setting this to `modelAvailable`.
  const has3D = false;
  // Pass the accent color down so the 3D scene can tint its rim light.
  const hero3DAccent = accentColor;

  return (
    <div className="pk-product__media" style={accentStyle}>
      <div
        className="pk-product__hero-wrap"
      >
        {/* Parallax wrap on the hero. HeroParallax no-ops cleanly on
            touch / reduced motion. */}
        <HeroParallax strength={0.4} className="pk-product__hero-parallax">
          <div
            ref={heroRef}
            className={
              'pk-product__hero' +
              (mode === '3d' ? ' pk-product__hero--3d' : '') +
              (zoom ? ' is-zooming' : '')
            }
            style={mode === '3d' ? undefined : heroStyle}
            onPointerMove={onHeroPointerMove}
            onPointerLeave={onHeroPointerLeave}
          >
            {mode === '3d' ? (
              <ProductHero3D
                imageUrl={current.url}
                imageAlt={current.altText || productTitle}
                modelUrl={modelUrl}
                accentColor={hero3DAccent}
              />
            ) : (
              <>
                <Image
                  alt={current.altText || productTitle || t('pdp_img_alt_fallback')}
                  data={current}
                  aspectRatio={`${Math.round(heroRatio * 1000)}/1000`}
                  crop="top"
                  sizes="(min-width: 60em) 600px, 100vw"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  className="pk-product__hero-img"
                />
                {zoom && (
                  <div
                    className="pk-product__hero-lens"
                    aria-hidden
                    style={{
                      left: `${zoom.x}%`,
                      top: `${zoom.y}%`,
                      backgroundImage: `url(${current.url})`,
                      backgroundPosition: `${zoom.x}% ${zoom.y}%`,
                    }}
                  />
                )}
              </>
            )}

            {has3D && mode === 'image' && (
              <button
                type="button"
                className="pk-product__hero-3d-toggle"
                onClick={() => setMode('3d')}
                aria-label={t('pdp_3d_open_aria')}
              >
                <IconCube size={14} />
                <span>{t('pdp_3d_open')}</span>
              </button>
            )}
            {has3D && mode === '3d' && (
              <button
                type="button"
                className="pk-product__hero-3d-toggle pk-product__hero-3d-toggle--active"
                onClick={() => setMode('image')}
                aria-label={t('pdp_3d_close_aria')}
              >
                <span>{t('pdp_3d_close')}</span>
              </button>
            )}

            {mode === 'image' && list.length > 0 && (
              <span className="pk-product__hero-zoom-hint" aria-hidden>
                <IconZoomIn size={14} />
                {t('pdp_zoom_hint')}
              </span>
            )}

            {mode === 'image' && list.length > 1 && (
              <>
                <button
                  type="button"
                  className="pk-product__hero-nav pk-product__hero-nav--prev"
                  aria-label={t('pdp_prev_aria')}
                  onClick={() => go(-1)}
                >
                  <IconChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className="pk-product__hero-nav pk-product__hero-nav--next"
                  aria-label={t('pdp_next_aria')}
                  onClick={() => go(1)}
                >
                  <IconChevronRight size={18} />
                </button>
              </>
            )}
          </div>
        </HeroParallax>

        {/* Thumbnail strip — Embla horizontal carousel below the hero.
            On desktop the row is a flex container with overflow-x:auto
            for drag-scroll; on mobile it gets snap-drag behaviour from
            Embla. The previous left-rail vertical thumbs rail is gone —
            the row below the hero handles all viewports. */}
        {list.length > 1 && mode === 'image' && (
          <div className="pk-thumbs pk-thumbs--strip" ref={emblaRef}>
            <ul className="pk-thumbs__row" aria-label={t('pdp_thumbs_aria')}>
              {list.map((img, i) => (
                <li key={img.id || img.url || i} className="pk-thumbs__cell">
                  <button
                    type="button"
                    className={
                      'pk-thumbs__item' +
                      (i === index ? ' is-current' : '')
                    }
                    aria-current={i === index ? 'true' : 'false'}
                    aria-label={t('pdp_thumb_aria', {n: i + 1, total: list.length})}
                    onClick={() => setIndex(i)}
                  >
                    <Image
                      alt={img.altText || productTitle || t('pdp_img_alt_fallback')}
                      data={img}
                      aspectRatio="1/1"
                      sizes="(max-width: 700px) 90px, 80px"
                      loading={i < 4 ? 'eager' : 'lazy'}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/** @typedef {import('storefrontapi.generated').ProductVariantFragment} ProductVariantFragment */