import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {useT} from '~/lib/t';

/**
 * ParallaxBanner — full-width brand banner with fixed background attachment
 * for a parallax depth effect. Mobile fallback uses transform-based parallax.
 */
export function ParallaxBanner() {
  const t = useT();
  return (
    <section className="pk-parallax" aria-label={t('parallax_aria')} data-desktop-only>
      <div className="pk-parallax__bg" aria-hidden="true" />
      <div className="pk-parallax__overlay" aria-hidden="true" />
      <div className="pk-parallax__content pk-inner">
        <span className="pk-parallax__eyebrow">Puchica</span>
        <h2 className="pk-parallax__title">{t('parallax_title')}</h2>
        <p className="pk-parallax__sub">{t('parallax_sub')}</p>
        <Link
          to="/explore"
          className="pk-btn pk-btn--ember pk-btn--lg pk-parallax__cta"
        >
          {t('parallax_cta')}
        </Link>
      </div>
    </section>
  );
}