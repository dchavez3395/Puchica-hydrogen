import {useEffect, useState} from 'react';
import {Image} from '@shopify/hydrogen';

/**
 * Editorial hero used on inner pages (category, all-products, about,
 * search, contact). One component, three visual variants — the inner
 * structure is identical so the type rhythm matches across the site.
 *
 * Variants:
 *   - default      → full-bleed image with bottom dark scrim
 *   - 'paper'      → cream / paper background, no image, ember accent
 *   - 'ink'        → dark ink background, no image, lime accent
 *
 * Image source priority (default variant only):
 *   1. `heroImage` metafield (custom.hero_image) — the merchant upload
 *   2. `image` prop (e.g. collection.image)
 *   3. `slides` prop (array of product images) — cross-fades behind type
 *   4. dark ink background with no image
 *
 * The previous hero treatment (two blurred radial glows in opposite
 * corners, a 2.5% diagonal line pattern, italic display title) was
 * reading as AI slop — every DTC store in 2024 had it. This version
 * leans editorial: tight upright display type anchored to the
 * bottom-left, image at full bleed when available, scrim to keep
 * type legible on busy covers.
 *
 * The cross-fade carousel is a fallback for when the merchant hasn't
 * uploaded a hero image — the page still feels alive because we pull
 * 5–8 of the collection's bestsellers and rotate them behind the
 * title. Pauses on hover, respects prefers-reduced-motion.
 *
 * @param {{
 *   variant?: 'default' | 'paper' | 'ink';
 *   // Standard Shopify image shape (e.g. `collection.image` or `product.featuredImage`).
 *   image?: { id?: string; url?: string; altText?: string | null; width?: number; height?: number } | null;
 *   // Storefront API `file_reference` metafield shape, e.g.
 *   // `custom.hero_image` on a Collection — { id, reference: { image: { url, altText, width, height } } }.
 *   // When present, takes precedence over `image` and `slides`.
 *   heroImage?: { id?: string; reference?: { image?: { url?: string; altText?: string | null; width?: number; height?: number } | null } | null } | null;
 *   // Array of product images to cross-fade behind the title. Used when
 *   // no static image source is available — gives every collection a
 *   // rich hero without requiring a merchant upload.
 *   slides?: Array<{ id?: string; url: string; altText?: string | null; width?: number; height?: number }> | null;
 *   // How long each carousel slide stays up. Default 6s.
 *   slideIntervalMs?: number;
 *   imageAlt?: string;
 *   eyebrow?: React.ReactNode;
 *   title: React.ReactNode;
 *   sub?: React.ReactNode;
 *   count?: React.ReactNode;
 *   children?: React.ReactNode; // optional content (CTA, search form) below the type stack
 * }}
 */
export function PageHero({
  variant = 'default',
  image = null,
  heroImage = null,
  slides = null,
  slideIntervalMs = 6000,
  imageAlt = '',
  eyebrow,
  title,
  sub,
  count,
  children,
}) {
  const variantClass =
    variant === 'paper' ? 'pk-hero--paper' :
    variant === 'ink' ? 'pk-hero--ink' :
    '';

  // Image source resolution: metafield > static image > carousel slides
  // > nothing (dark fallback).
  const heroMetafieldImage = heroImage?.reference?.image;
  const hasStatic = Boolean(heroMetafieldImage?.url) || Boolean(image?.url);
  const cleanSlides = (slides || []).filter((s) => s && s.url).slice(0, 8);
  const useCarousel = !hasStatic && cleanSlides.length > 0;

  return (
    <header className={`pk-hero ${variantClass}`}>
      {hasStatic ? (
        <StaticImage
          image={heroMetafieldImage?.url ? heroMetafieldImage : image}
          imageAlt={imageAlt}
          title={title}
        />
      ) : useCarousel ? (
        <CarouselBackground
          slides={cleanSlides}
          intervalMs={slideIntervalMs}
          title={title}
        />
      ) : null}
      <div className="pk-hero__scrim" aria-hidden />
      <div className="pk-hero__inner">
        {eyebrow ? <span className="pk-hero__eyebrow">{eyebrow}</span> : null}
        <h1 className="pk-hero__title">{title}</h1>
        {sub ? <p className="pk-hero__sub">{sub}</p> : null}
        {count ? <span className="pk-hero__count">{count}</span> : null}
        {children}
      </div>
    </header>
  );
}

/**
 * Single static image background. The original behaviour.
 */
function StaticImage({image, imageAlt, title}) {
  return (
    <Image
      data={image}
      alt={imageAlt || image.altText || (typeof title === 'string' ? title : '')}
      className="pk-hero__img"
      loading="eager"
      sizes="100vw"
    />
  );
}

/**
 * Cross-fading product-image carousel. Mirrors the homepage
 * `pk-hero2__bg-slide` pattern: all slides sit absolutely positioned
 * with opacity 0, the active one gets `is-active` (opacity 1, z-index
 * 1). 1.2s ease-in-out on the opacity transition. Auto-advances every
 * `intervalMs` ms. Pauses on hover, on focus, and under
 * `prefers-reduced-motion: reduce`.
 */
function CarouselBackground({slides, intervalMs, title}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    // Don't auto-advance if the user has asked for reduced motion —
    // they get the first slide statically.
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const id = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [paused, slides.length, intervalMs]);

  const altFallback = typeof title === 'string' ? title : '';

  return (
    <div
      className="pk-hero__carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-hidden="true"
    >
      {slides.map((slide, idx) => (
        <div
          key={slide.id || slide.url}
          className={
            'pk-hero__carousel-slide' + (idx === activeIdx ? ' is-active' : '')
          }
        >
          <Image
            data={slide}
            alt={slide.altText || altFallback}
            className="pk-hero__img"
            loading={idx === 0 ? 'eager' : 'lazy'}
            sizes="100vw"
          />
        </div>
      ))}
    </div>
  );
}
