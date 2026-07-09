import {Image} from '@shopify/hydrogen';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {useT} from '~/lib/t';

/**
 * Lifestyle banner — redesigned as a bold dark editorial band.
 * Instead of a single logo square, it shows a category spotlight
 * with real product imagery (if available) layered over a warm
 * volcanic gradient. The image comes from the best-sellers data
 * passed by the route loader.
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
          ) : (
            <div className="pk-lifestyle__collage" aria-hidden="true">
              <div className="pk-lifestyle__collage-tile pk-lifestyle__collage-tile--1"></div>
              <div className="pk-lifestyle__collage-tile pk-lifestyle__collage-tile--2"></div>
              <div className="pk-lifestyle__collage-tile pk-lifestyle__collage-tile--3"></div>
              <div className="pk-lifestyle__collage-tile pk-lifestyle__collage-tile--4"></div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}