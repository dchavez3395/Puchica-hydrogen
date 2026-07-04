import {Image} from '@shopify/hydrogen';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {useT} from '~/lib/t';

/**
 * 5/7 desktop, stacked mobile. Display heading + 1-line sub + primary
 * CTA + secondary CTA + trust line. No carousel, no autoplay, no
 * parallax — the audit calls these out as the source of poor LCP
 * on social-referral mobile traffic.
 *
 * The hero image is now sourced from real product data (a best-seller
 * `featuredImage`) rather than a hard-coded CDN URL — the previous
 * hard-coded URL was a 404 in this store, so the section was rendering
 * a broken image. If no image is supplied, the cream media well still
 * shows up so layout stays stable; we just skip the <Image>.
 *
 * @param {{
 *   image?: { url: string; altText?: string; width?: number; height?: number } | null;
 *   link?: string;
 * }}
 */
export function HeroSplit({image = null, link = '/collections/best-sellers'}) {
  const t = useT();

  return (
    <section
      className="pk-section pk-section--hero-split"
      aria-label={t('hero_split_aria')}
    >
      <div className="pk-section__inner pk-hero-split">
        <div className="pk-hero-split__copy">
          <span className="pk-eyebrow">{t('hero_split_eyebrow')}</span>
          <h1 className="pk-hero-split__heading">{t('hero_split_heading')}</h1>
          <p className="pk-hero-split__body">{t('hero_split_body')}</p>
          <div className="pk-hero-split__ctas">
            <Link
              to="/collections/best-sellers"
              prefetch="viewport"
              className="pk-btn pk-btn--ink pk-btn--lg"
            >
              {t('hero_split_cta_primary')}
            </Link>
            <Link
              to="/collections"
              prefetch="viewport"
              className="pk-btn pk-btn--outline pk-btn--lg"
            >
              {t('hero_split_cta_secondary')}
            </Link>
          </div>
          <p className="pk-hero-split__trust">{t('hero_split_trust')}</p>
        </div>
        <div className="pk-hero-split__media">
          {image ? (
            <Link
              to={link}
              prefetch="intent"
              aria-label={image.altText || t('hero_split_cta_primary')}
            >
              <Image
                className="pk-hero-split__img"
                data={image}
                alt={image.altText || ''}
                aspectRatio="1/1"
                sizes="(min-width: 900px) 60vw, 100vw"
                loading="eager"
                {...{fetchpriority: 'high'}}
              />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
