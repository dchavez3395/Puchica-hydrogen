import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {useT} from '~/lib/t';
import {useAside} from '~/components/Aside';

/**
 * 5/7 desktop, stacked mobile. Display heading + 1-line sub + primary
 * CTA + secondary CTA + trust line. No carousel, no autoplay, no
 * parallax — the audit calls these out as the source of poor LCP
 * on social-referral mobile traffic.
 *
 * The hero image is a hard-coded CDN URL; Phase 2 will source it
 * from a Shopify metaobject.
 */
const HERO_IMAGE_URL =
  'https://cdn.shopify.com/s/files/1/0934/0664/1891/files/hero-lifestyle.jpg';

export function HeroSplit() {
  const t = useT();
  const {open} = useAside();

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
            <button
              type="button"
              className="pk-btn pk-btn--ink pk-btn--lg"
              onClick={() => open('cart')}
            >
              {t('hero_split_cta_primary')}
            </button>
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
          <img
            src={HERO_IMAGE_URL}
            alt=""
            className="pk-hero-split__img"
            loading="eager"
            // React itself emits the lowercase `fetchpriority` attribute
            {...{fetchpriority: 'high'}}
          />
        </div>
      </div>
    </section>
  );
}
