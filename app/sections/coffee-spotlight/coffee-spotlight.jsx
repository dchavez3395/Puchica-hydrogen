import {useT} from '~/lib/t';

/**
 * "Highland Coffee" spotlight — a full-width jade-green band celebrating
 * Central American coffee culture (Guatemala's Antigua, Atitlán, and
 * Huehuetenango growing regions). Adds a bold color block break and
 * cultural depth between product rails.
 *
 * Pure presentational — no GraphQL. Copy from i18n (home_coffee_* keys).
 */
export function CoffeeSpotlight() {
  const t = useT();
  return (
    <section
      className="pk-section pk-section--coffee-spotlight"
      aria-label={t('home_coffee_aria')}
    >
      <div className="pk-section__inner pk-coffee-spotlight">
        <div className="pk-coffee-spotlight__content">
          <span className="pk-eyebrow pk-eyebrow--on-dark">
            {t('home_coffee_eyebrow')}
          </span>
          <h2 className="pk-coffee-spotlight__heading">
            {t('home_coffee_heading')}
          </h2>
          <p className="pk-coffee-spotlight__body">
            {t('home_coffee_body')}
          </p>
          <div className="pk-coffee-spotlight__stats">
            <div className="pk-coffee-spotlight__stat">
              <span className="pk-coffee-spotlight__stat-value">1,500m+</span>
              <span className="pk-coffee-spotlight__stat-label">
                {t('home_coffee_stat_elevation')}
              </span>
            </div>
            <div className="pk-coffee-spotlight__stat">
              <span className="pk-coffee-spotlight__stat-value">7</span>
              <span className="pk-coffee-spotlight__stat-label">
                {t('home_coffee_stat_regions')}
              </span>
            </div>
            <div className="pk-coffee-spotlight__stat">
              <span className="pk-coffee-spotlight__stat-value">3</span>
              <span className="pk-coffee-spotlight__stat-label">
                {t('home_coffee_stat_generations')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}