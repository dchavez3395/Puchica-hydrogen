import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {useT} from '~/lib/t';
import {STORE_LOGO_URL} from '~/lib/brand';

/**
 * Hero — big editorial statement on the left, a color-stripe "awning"
 * brand panel on the right with the Puchica logo on a hanging market
 * sign. No hero image and no carousel: the awning carries brand color
 * and identity on its own, so the hero never shows an empty well.
 */
export function HeroSplit() {
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
          <dl
            className="pk-hero-split__stats"
            aria-label={t('hero_store_stats_aria')}
          >
            <div>
              <dt>6,000+</dt>
              <dd>{t('hero_store_stat_products')}</dd>
            </div>
            <div>
              <dt>8</dt>
              <dd>{t('hero_store_stat_departments')}</dd>
            </div>
            <div>
              <dt>$0</dt>
              <dd>{t('hero_store_stat_shipping')}</dd>
            </div>
          </dl>
        </div>

        <div className="pk-hero-awning" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <div className="pk-hero-awning__sign">
            <img className="pk-hero-awning__logo" src={STORE_LOGO_URL} alt="" />
          </div>
        </div>
      </div>
    </section>
  );
}
