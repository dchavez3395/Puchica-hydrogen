import {useEffect, useId, useRef} from 'react';
import {useFetcher, useRouteLoaderData} from 'react-router';
import {useT} from '~/lib/t';

/**
 * Footer newsletter signup. First-party on purpose: no Klaviyo onsite script,
 * a visible label, a live status region, and focus moved to the outcome so a
 * screen-reader user hears it. Posts to /api/newsletter, which relays to
 * Klaviyo's double-opt-in list; the confirmation email is Klaviyo's.
 * No discount is offered — the store is still being set up (Daniel, 18 Sep).
 */
export function NewsletterForm() {
  const t = useT();
  const fetcher = useFetcher({key: 'newsletter'});
  const root = useRouteLoaderData('root');
  const locale = String(root?.selectedLocale?.language || 'en').toLowerCase();
  const id = useId();
  const statusRef = useRef(null);

  const busy = fetcher.state !== 'idle';
  const result = fetcher.data;
  const done = result?.ok === true;
  const failed = result && result.ok === false;

  // Move focus to the outcome once the request settles, so the result is
  // announced and the keyboard user is not left on a button that changed.
  useEffect(() => {
    if ((done || failed) && statusRef.current) statusRef.current.focus();
  }, [done, failed]);

  const message = done
    ? t('newsletter_success')
    : failed
      ? result.reason === 'invalid'
        ? t('newsletter_invalid')
        : t('newsletter_error')
      : '';

  return (
    <div className="wr-news">
      <h2 className="wr-news__title">{t('newsletter_title')}</h2>
      <p className="wr-news__body">{t('newsletter_body')}</p>
      {done ? null : (
        <fetcher.Form
          method="post"
          action="/api/newsletter"
          className="wr-news__form"
          aria-describedby={`${id}-consent`}
        >
          <input type="hidden" name="locale" value={locale} />
          {/* Honeypot: hidden from people and assistive tech, filled by bots. */}
          <div className="wr-news__hp" aria-hidden="true">
            <label htmlFor={`${id}-website`}>Website</label>
            <input
              id={`${id}-website`}
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          <label className="wr-news__label" htmlFor={`${id}-email`}>
            {t('newsletter_label')}
          </label>
          <div className="wr-news__row">
            <input
              id={`${id}-email`}
              className="wr-news__input"
              type="email"
              name="email"
              required
              autoComplete="email"
              inputMode="email"
              spellCheck={false}
              aria-invalid={failed && result.reason === 'invalid' ? true : undefined}
              aria-describedby={failed ? `${id}-status` : undefined}
            />
            <button
              type="submit"
              className="wr-news__btn"
              disabled={busy}
              aria-busy={busy || undefined}
            >
              {busy ? t('newsletter_sending') : t('newsletter_button')}
            </button>
          </div>
          <p id={`${id}-consent`} className="wr-news__consent">
            {t('newsletter_consent')}
          </p>
        </fetcher.Form>
      )}
      <p
        id={`${id}-status`}
        ref={statusRef}
        className={`wr-news__status${done ? ' is-ok' : ''}${failed ? ' is-err' : ''}`}
        role="status"
        aria-live="polite"
        tabIndex={-1}
      >
        {message}
      </p>
    </div>
  );
}
