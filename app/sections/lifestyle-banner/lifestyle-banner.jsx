import {Image} from '@shopify/hydrogen';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {useT} from '~/lib/t';

/**
 * 7/5 image+copy split (image left by default). No animation,
 * no parallax. The image is now sourced from real product data
 * (a best-seller's `featuredImage`) instead of a hard-coded CDN
 * URL — the old URL was a 404 in this store, so the section was
 * rendering a broken image. Pass `image` and `link` from the
 * route loader; if `image` is missing, the section still renders
 * copy + CTA but skips the <Image>.
 *
 * @param {{
 *   image?: { url: string; altText?: string; width?: number; height?: number } | null;
 *   link?: string;
 * }}
 */
export function LifestyleBanner({
  image = null,
  link = '/collections/home-kitchen',
}) {
  const t = useT();

  return (
    <section
      className="pk-section pk-section--lifestyle"
      aria-label={t('lifestyle_banner_aria')}
    >
      <div className="pk-section__inner pk-lifestyle">
        <div className="pk-lifestyle__media">
          {image ? (
            <Link to={link} prefetch="intent" aria-label={image.altText || ''}>
              <Image
                className="pk-lifestyle__img"
                data={image}
                alt={image.altText || ''}
                aspectRatio="5/4"
                sizes="(min-width: 900px) 60vw, 100vw"
                loading="lazy"
              />
            </Link>
          ) : null}
        </div>
        <div className="pk-lifestyle__copy">
          <span className="pk-eyebrow">{t('lifestyle_banner_eyebrow')}</span>
          <h2 className="pk-section__h">{t('lifestyle_banner_heading')}</h2>
          <p className="pk-lifestyle__body">{t('lifestyle_banner_body')}</p>
          <Link
            to={link}
            prefetch="intent"
            className="pk-btn pk-btn--ink pk-btn--lg"
          >
            {t('lifestyle_banner_cta')}
          </Link>
        </div>
      </div>
    </section>
  );
}
