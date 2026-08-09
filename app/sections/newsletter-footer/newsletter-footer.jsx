import {useT} from '~/lib/t';

/**
 * Eyebrow + h2 + body + email input + submit. Posts to the existing
 * `/newsletter` route. Copy lives in the localized dictionary.
 *
 * Keys are prefixed `home_newsletter_` to avoid collision with the
 * existing global `newsletter_*` keys used by the footer newsletter form.
 */
export function NewsletterFooter() {
  const t = useT();
  return (
    <section
      className="pk-section pk-section--newsletter"
      aria-label={t('home_newsletter_aria')}
    >
      <div className="pk-section__inner pk-newsletter">
        <div className="pk-newsletter__copy">
          <span className="pk-eyebrow">{t('home_newsletter_eyebrow')}</span>
          <h2 className="pk-section__h">{t('home_newsletter_heading')}</h2>
          <p className="pk-newsletter__body">{t('home_newsletter_body')}</p>
        </div>
        <form className="pk-newsletter__form" action="/newsletter" method="post">
          <label htmlFor="pk-newsletter-email" className="sr-only">
            {t('home_newsletter_placeholder')}
          </label>
          <input
            id="pk-newsletter-email"
            type="email"
            name="email"
            required
            placeholder={t('home_newsletter_placeholder')}
            className="pk-newsletter__input"
            autoComplete="email"
          />
          <button
            type="submit"
            className="pk-btn pk-btn--ink pk-btn--lg pk-newsletter__submit"
          >
            {t('home_newsletter_submit')}
          </button>
          <p className="pk-newsletter__promise">{t('home_newsletter_promise')}</p>
        </form>
      </div>
    </section>
  );
}
