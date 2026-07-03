import {useT} from '~/lib/t';

/**
 * Eyebrow + h2 + body + email input + submit. Posts to the existing
 * `/newsletter` route. The 10%-off promise in the caption is
 * rendered as `{newsletter_promise}` so it lives in the dictionary.
 */
export function NewsletterFooter() {
  const t = useT();
  return (
    <section
      className="pk-section pk-section--newsletter"
      aria-label={t('newsletter_aria')}
    >
      <div className="pk-section__inner pk-newsletter">
        <div className="pk-newsletter__copy">
          <span className="pk-eyebrow">{t('newsletter_eyebrow')}</span>
          <h2 className="pk-section__h">{t('newsletter_heading')}</h2>
          <p className="pk-newsletter__body">{t('newsletter_body')}</p>
        </div>
        <form className="pk-newsletter__form" action="/newsletter" method="post">
          <label htmlFor="pk-newsletter-email" className="sr-only">
            {t('newsletter_placeholder')}
          </label>
          <input
            id="pk-newsletter-email"
            type="email"
            name="email"
            required
            placeholder={t('newsletter_placeholder')}
            className="pk-newsletter__input"
            autoComplete="email"
          />
          <button
            type="submit"
            className="pk-btn pk-btn--ink pk-btn--lg pk-newsletter__submit"
          >
            {t('newsletter_submit')}
          </button>
          <p className="pk-newsletter__promise">{t('newsletter_promise')}</p>
        </form>
      </div>
    </section>
  );
}
