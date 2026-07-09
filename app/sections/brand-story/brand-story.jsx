import {useT} from '~/lib/t';

/**
 * "Puchica's roots" — a full-width brand-story band that gives the
 * page Central American soul. Dark espresso-ink background with a
 * warm volcanic gradient texture (stand-in for a real duotone
 * coffee/volcano/textile Antigravity image to be added later).
 *
 * Sits between New Arrivals and Sports in the homepage rhythm,
 * breaking up the cream/paper sections with a bold dark moment.
 *
 * Pure presentational — no GraphQL, no settings. Copy comes from
 * the i18n dictionary (home_roots_* keys).
 */
export function BrandStory() {
  const t = useT();
  return (
    <section
      className="pk-section pk-section--brand-story"
      aria-label={t('home_roots_aria')}
    >
      <div className="pk-section__inner pk-brand-story">
        <div className="pk-brand-story__content">
          <span className="pk-eyebrow pk-eyebrow--on-dark">
            {t('home_roots_eyebrow')}
          </span>
          <h2 className="pk-brand-story__heading">
            {t('home_roots_heading')}
          </h2>
          <p className="pk-brand-story__body">
            {t('home_roots_body')}
          </p>
          <p className="pk-brand-story__signature">
            {t('home_roots_signature')}
          </p>
        </div>
      </div>
    </section>
  );
}