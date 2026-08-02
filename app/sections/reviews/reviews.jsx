import {useT} from '~/lib/t';

/**
 * Product-standard cards. Customer review UI must only be rendered from a
 * verified review provider; these static cards describe Puchica's selection
 * criteria and deliberately avoid ratings, buyer labels, and testimonials.
 */
const STANDARD_KEYS = [
  {textKey: 'home_reviews_quote_1_text', authorKey: 'home_reviews_quote_1_author'},
  {textKey: 'home_reviews_quote_2_text', authorKey: 'home_reviews_quote_2_author'},
  {textKey: 'home_reviews_quote_3_text', authorKey: 'home_reviews_quote_3_author'},
];

export function Reviews() {
  const t = useT();
  return (
    <section
      className="pk-section pk-section--reviews"
      aria-label={t('home_reviews_aria')}
    >
      <div className="pk-section__inner">
        <div className="pk-section__head pk-section__head--center">
          <span className="pk-eyebrow">{t('home_reviews_eyebrow')}</span>
          <h2 className="pk-section__h">{t('home_reviews_heading')}</h2>
        </div>
        <ul className="pk-reviews">
          {STANDARD_KEYS.map((q) => (
            <li className="pk-reviews__card" key={q.textKey}>
              <p className="pk-reviews__quote">{t(q.textKey)}</p>
              <footer className="pk-reviews__author">
                <span className="pk-reviews__name">{t(q.authorKey)}</span>
                <span className="pk-reviews__verified">
                  {t('home_reviews_verified')}
                </span>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
