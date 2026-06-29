import {Link} from 'react-router';

/**
 * ParallaxBanner — full-width brand banner with fixed background attachment
 * for a parallax depth effect. Mobile fallback uses transform-based parallax.
 */
export function ParallaxBanner() {
  return (
    <section className="pk-parallax" aria-label="Brand banner">
      <div className="pk-parallax__bg" aria-hidden="true" />
      <div className="pk-parallax__overlay" aria-hidden="true" />
      <div className="pk-parallax__content pk-inner">
        <span className="pk-parallax__eyebrow">Puchica</span>
        <h2 className="pk-parallax__title">
          Most of it under $100.<br />All of it picked by humans.
        </h2>
        <p className="pk-parallax__sub">
          6,000+ products. 19 collections. One Canadian store.
        </p>
        <Link
          to="/explore"
          className="pk-btn pk-btn--spark pk-btn--lg pk-parallax__cta"
        >
          Browse by category →
        </Link>
      </div>
    </section>
  );
}