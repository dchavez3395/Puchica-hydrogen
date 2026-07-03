import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {useT} from '~/lib/t';

/**
 * 7/5 image+copy split (image left by default). No animation,
 * no parallax. The image and CTA target are hard-coded for
 * Phase 1; Phase 2 will source them from settings.
 */
const LIFESTYLE_IMAGE_URL =
  'https://cdn.shopify.com/s/files/1/0934/0664/1891/files/lifestyle-banner.jpg';

export function LifestyleBanner() {
  const t = useT();

  return (
    <section
      className="pk-section pk-section--lifestyle"
      aria-label={t('lifestyle_banner_aria')}
    >
      <div className="pk-section__inner pk-lifestyle">
        <div className="pk-lifestyle__media">
          <img
            src={LIFESTYLE_IMAGE_URL}
            alt=""
            className="pk-lifestyle__img"
            loading="lazy"
          />
        </div>
        <div className="pk-lifestyle__copy">
          <span className="pk-eyebrow">{t('lifestyle_banner_eyebrow')}</span>
          <h2 className="pk-section__h">{t('lifestyle_banner_heading')}</h2>
          <p className="pk-lifestyle__body">{t('lifestyle_banner_body')}</p>
          <Link
            to="/collections/home-kitchen"
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
