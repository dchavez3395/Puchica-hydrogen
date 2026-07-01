import {LocalizedLink as Link} from '~/components/LocalizedLink';

/**
 * ParallaxBanner — full-width brand banner with fixed background attachment
 * for a parallax depth effect. Mobile fallback uses transform-based parallax.
 */
export function ParallaxBanner() {
  return (
    <section className="pk-parallax" aria-label="Brand banner" data-desktop-only>
      <div className="pk-parallax__bg" aria-hidden="true" />
      <div className="pk-parallax__overlay" aria-hidden="true" />
      <div className="pk-parallax__content pk-inner">
        <span className="pk-parallax__eyebrow">Puchica</span>
        <h2 className="pk-parallax__title">
          What's your thing?<br /> We have it.
        </h2>
        <p className="pk-parallax__sub">
          Dozens of collections. One Canadian store.
        </p>
        <Link
          to="/explore"
          className="pk-btn pk-btn--ember pk-btn--lg pk-parallax__cta"
        >
          Browse by category →
        </Link>
      </div>
    </section>
  );
}