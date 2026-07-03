import {useT} from '~/lib/t';

/**
 * 3 customer-quote cards. Phase 3 will pull from Judge.me; for
 * Phase 1 we ship 3 hard-coded quotes so the visual rhythm of
 * the homepage is in place. The verified badge uses the existing
 * `t('reviews_verified')` key.
 */
const QUOTE_KEYS = [
  {textKey: 'reviews_quote_1_text', authorKey: 'reviews_quote_1_author'},
  {textKey: 'reviews_quote_2_text', authorKey: 'reviews_quote_2_author'},
  {textKey: 'reviews_quote_3_text', authorKey: 'reviews_quote_3_author'},
];

const STARS = [0, 1, 2, 3, 4];

function StarRow() {
  return (
    <div className="pk-reviews__stars" aria-label="5 out of 5 stars">
      {STARS.map((i) => (
        <span key={i} className="pk-reviews__star" aria-hidden="true">
          ★
        </span>
      ))}
    </div>
  );
}

export function Reviews() {
  const t = useT();
  return (
    <section
      className="pk-section pk-section--reviews"
      aria-label={t('reviews_aria')}
    >
      <div className="pk-section__inner">
        <div className="pk-section__head pk-section__head--center">
          <span className="pk-eyebrow">{t('reviews_eyebrow')}</span>
          <h2 className="pk-section__h">{t('reviews_heading')}</h2>
        </div>
        <ul className="pk-reviews">
          {QUOTE_KEYS.map((q) => (
            <li className="pk-reviews__card" key={q.textKey}>
              <StarRow />
              <blockquote className="pk-reviews__quote">
                <p>“{t(q.textKey)}”</p>
              </blockquote>
              <footer className="pk-reviews__author">
                <span className="pk-reviews__name">{t(q.authorKey)}</span>
                <span className="pk-reviews__verified">
                  {t('reviews_verified')}
                </span>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
