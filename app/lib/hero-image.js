/**
 * Home hero image candidates.
 *
 * The hero box is a portrait window on phones (100vw wide, ~78vh tall) and a
 * 1024px-capped square on desktop. Hydrogen's <Image> only makes square
 * crops, so phones downloaded a 1000x1000 file and object-fit threw a third
 * of it away (Lighthouse 2026-09-19: the 106 KB WebP was the LCP resource).
 * Shopify's CDN crops to any width/height and negotiates WebP by Accept
 * header, so a 3:4 crop sized to the phone window is ~40% smaller and sharper.
 *
 * The same candidates feed the <picture> in HomeLanding and the preload
 * <link> the home route's meta() emits, so the browser fetches exactly one.
 */
// Capped at 640: on a 412px phone that is 1.55x, plenty for a photo behind a
// gradient shade, and 20 KB lighter than the 824 crop a DPR-3 screen would pick.
export const HERO_PORTRAIT_WIDTHS = [412, 640];
export const HERO_SQUARE_WIDTHS = [600, 800, 1024];
export const HERO_MOBILE_MEDIA = '(max-width: 767px)';
export const HERO_DESKTOP_MEDIA = '(min-width: 768px)';
export const HERO_SIZES = '(min-width: 1024px) 1024px, 100vw';

/** Shopify CDN crop URL for a base image URL (keeps the ?v= cache key). */
export function heroCropUrl(baseUrl, width, height) {
  if (!baseUrl) return '';
  const url = new URL(baseUrl);
  url.searchParams.set('width', String(width));
  url.searchParams.set('height', String(height));
  url.searchParams.set('crop', 'center');
  return url.toString();
}

/** 3:4 candidates for the phone window. */
export function heroPortraitSrcSet(baseUrl) {
  return HERO_PORTRAIT_WIDTHS.map(
    (w) => `${heroCropUrl(baseUrl, w, Math.round((w * 4) / 3))} ${w}w`,
  ).join(', ');
}

/** Square candidates for tablet and desktop (source is 1024px). */
export function heroSquareSrcSet(baseUrl) {
  return HERO_SQUARE_WIDTHS.map(
    (w) => `${heroCropUrl(baseUrl, w, w)} ${w}w`,
  ).join(', ');
}

/**
 * Preload descriptors for React Router's meta(): one per media range so the
 * browser preloads only the candidate it will render.
 */
export function heroPreloadLinks(baseUrl) {
  if (!baseUrl) return [];
  return [
    {
      tagName: 'link',
      rel: 'preload',
      as: 'image',
      media: HERO_MOBILE_MEDIA,
      imageSrcSet: heroPortraitSrcSet(baseUrl),
      imageSizes: '100vw',
      fetchpriority: 'high',
    },
    {
      tagName: 'link',
      rel: 'preload',
      as: 'image',
      media: HERO_DESKTOP_MEDIA,
      imageSrcSet: heroSquareSrcSet(baseUrl),
      imageSizes: HERO_SIZES,
      fetchpriority: 'high',
    },
  ];
}
