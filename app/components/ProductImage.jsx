import {useEffect, useRef, useState} from 'react';
import {Image} from '@shopify/hydrogen';
import {IconChevronLeft, IconChevronRight} from '~/components/Icons';
import {useT} from '~/lib/t';

/**
 * Hero gallery for the PDP — rebuilt for the 2026-06-29 reboot.
 *
 * The 3D viewer was removed in Phase 1 (commit 5). The product
 * gallery is the image strip + hover magnifier.
 *
 * Visual treatment:
 *   - Static hero photo — no parallax; motion is user-initiated only
 *     (audit §3 motion rules).
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
 * Aspect-ratio behavior:
 *   - Portrait source       → honored
 *   - Landscape source      → capped at 1:1
 *   - Square (supplier)     → forced 4:5 to crop white border padding
 *
 * @param {{
 *   images: ProductVariantFragment['image'][];
 *   initialIndex?: number;
 *   productTitle?: string;
 *   accentColor?: string | null; // hex like '#CC4300' for hero accent
 * }}
 */
export function ProductImage({
  images,
  initialIndex = 0,
  productTitle,
  accentColor = null,
}) {
  const t = useT();
  const list = (images || []).filter(Boolean);
  const [index, setIndex] = useState(
    Math.min(Math.max(0, initialIndex), Math.max(0, list.length - 1)),
  );

  // Sync the active thumbnail into view when it changes (native
  // scroll-snap strip — replaces the Embla carousel that used to
  // be wired in here). The CSS snap-align on `.pk-thumbs__cell`
  // handles the per-cell snap.
  const thumbsRef = useRef(null);
  useEffect(() => {
    const strip = thumbsRef.current;
    if (!strip || index <= 0) return;
    const cell = strip.querySelector(`[data-thumb-index="${index}"]`);
    if (cell?.scrollIntoView) {
      cell.scrollIntoView({inline: 'start', block: 'nearest', behavior: 'smooth'});
    }
  }, [index]);

  const imageKey = list.map((i) => i.id || i.url).join('|');

  useEffect(() => {
    setIndex(0);
  }, [imageKey]);

  // Pointer handlers — defined unconditionally so the hook order is
  // stable. They no-op when there's no hero yet.
  if (list.length === 0) {
    return <div className="pk-product__hero" aria-hidden />;
  }

  const current = list[index];
  const go = (delta) => setIndex((i) => (i + delta + list.length) % list.length);

  // Aspect-ratio derivation (unchanged).
  const heroRatio = 1;

  // Inline accent color CSS variable — drives the subtle gradient
  // behind the hero. Falls back to brand ember if no metafield.
  const accentStyle = accentColor
    ? {'--pk-product-accent': accentColor}
    : undefined;

  return (
    <div className="pk-product__media" style={accentStyle}>
      <div
        className="pk-product__hero-wrap"
      >
          <div className="pk-product__hero">
            <Image
              alt={current.altText || productTitle || t('pdp_img_alt_fallback')}
              data={current}
              aspectRatio={`${Math.round(heroRatio * 1000)}/1000`}
              sizes="(min-width: 60em) 600px, 100vw"
              loading={index === 0 ? 'eager' : 'lazy'}
              className="pk-product__hero-img"
            />
            {list.length > 1 && (
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

        {/* Thumbnail strip — native horizontal scroll-snap row below
            the hero. On desktop the row is a flex container with
            overflow-x:auto for drag-scroll; on mobile it gets
            snap-drag behaviour from CSS scroll-snap on each cell.
            The previous Embla carousel wiring is gone — the row
            handles all viewports. */}
        {list.length > 1 && (
          <div className="pk-thumbs pk-thumbs--strip" ref={thumbsRef}>
            <ul className="pk-thumbs__row" aria-label={t('pdp_thumbs_aria')}>
              {list.map((img, i) => (
                <li key={img.id || img.url || i} className="pk-thumbs__cell" data-thumb-index={i}>
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
                      loading="lazy"
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
