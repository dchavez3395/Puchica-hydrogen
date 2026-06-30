import {Image} from '@shopify/hydrogen';

/**
 * Editorial hero used on inner pages (category, all-products, about,
 * search). One component, three visual variants — the inner structure
 * is identical so the type rhythm matches across the site.
 *
 * Variants:
 *   - default      → full-bleed image with bottom dark scrim
 *   - 'paper'      → cream / paper background, no image, ember accent
 *   - 'ink'        → dark ink background, no image, lime accent
 *
 * The previous hero treatment (two blurred radial glows in opposite
 * corners, a 2.5% diagonal line pattern, italic display title) was
 * reading as AI slop — every DTC store in 2024 had it. This version
 * leans editorial: tight upright display type anchored to the
 * bottom-left, image at full bleed when available, scrim to keep
 * type legible on busy covers.
 *
 * @param {{
 *   variant?: 'default' | 'paper' | 'ink';
 *   // Standard Shopify image shape (e.g. `collection.image` or `product.featuredImage`).
 *   image?: { id?: string; url?: string; altText?: string | null; width?: number; height?: number } | null;
 *   // Storefront API `file_reference` metafield shape, e.g.
 *   // `custom.hero_image` on a Collection — { id, image: { url, altText, width, height } }.
 *   // When present, takes precedence over `image`.
 *   heroImage?: { id?: string; image?: { url?: string; altText?: string | null; width?: number; height?: number } | null } | null;
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

  // Prefer the explicit hero_image metafield; otherwise fall back to the
  // passed-in image (which on collections is collection.image — usually
  // the product cover shot, often not big enough to full-bleed).
  // The metafield shape is:
  //   { id, reference: { image: { url, altText, width, height } } }
  const heroMetafieldImage = heroImage?.reference?.image;
  const resolvedImage = heroMetafieldImage?.url
    ? heroMetafieldImage
    : image?.url
    ? image
    : null;

  return (
    <header className={`pk-hero ${variantClass}`}>
      {resolvedImage ? (
        <Image
          data={resolvedImage}
          alt={imageAlt || resolvedImage.altText || (typeof title === 'string' ? title : '')}
          className="pk-hero__img"
          loading="eager"
          sizes="100vw"
        />
      ) : null}
      {resolvedImage ? <div className="pk-hero__scrim" aria-hidden /> : null}
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
