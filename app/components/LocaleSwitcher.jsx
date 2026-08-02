import {useEffect, useId, useRef, useState} from 'react';
import {useFetcher, useRouteLoaderData} from 'react-router';
import {
  LANGUAGE_KEYS,
  localizePath,
  marketCompactLabel,
  marketDisplayLabel,
} from '~/lib/i18n';
import {useT} from '~/lib/t';

const LABELS = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  'pt-br': 'Português',
};
const ORDER = ['en', 'fr', 'es', 'pt-br'];
const MARKET_ORDER = ['CA', 'US'];

/**
 * Market and language switcher. POSTs to /locale (server action), which
 * persists the selected market or language and returns to the current page.
 * Language choices also move the shopper to the crawlable localized URL
 * (/fr, /es, /pt-br;
 * English is unprefixed). The URL is the source of truth for which language
 * renders — see getLocaleFromRequest in app/lib/i18n.js.
 */
export function LocaleSwitcher() {
  const t = useT();
  const root = useRouteLoaderData('root');
  const currentLang = root?.selectedLocale?.language || 'EN';
  const currentCountry = root?.selectedLocale?.country || 'CA';
  const currentKey = LANGUAGE_KEYS[currentLang] || 'en';
  const currentSelection = marketDisplayLabel(root?.selectedLocale);
  const availableMarkets = new Map(
    (root?.selectedLocale?.availableMarkets || []).map((market) => [
      market.country,
      market,
    ]),
  );

  const [open, setOpen] = useState(false);
  const selectorId = useId();
  const ref = useRef(null);
  const triggerRef = useRef(null);
  const fetcher = useFetcher();
  const isSwitching = fetcher.state !== 'idle';

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function choose(key) {
    setOpen(false);
    // Re-prefix the current path for the chosen language (localizePath strips
    // any existing /fr|/es|/pt-br first, so switching FR -> ES works too).
    const target =
      localizePath(window.location.pathname, key) + window.location.search;
    fetcher.submit(
      {lang: key, return: target},
      {method: 'POST', action: '/locale'},
    );
  }

  function chooseMarket(country) {
    setOpen(false);
    fetcher.submit(
      {
        country,
        return: window.location.pathname + window.location.search,
      },
      {method: 'POST', action: '/locale'},
    );
  }

  return (
    <div className="pk-locale" ref={ref}>
      <button
        ref={triggerRef}
        type="button"
        className="pk-icon-btn pk-locale__btn"
        aria-haspopup="dialog"
        aria-controls={selectorId}
        aria-expanded={open}
        aria-busy={isSwitching}
        aria-label={`${t('locale_change_aria')}: ${currentSelection}`}
        disabled={isSwitching}
        onClick={() => setOpen((v) => !v)}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="pk-locale__code">
          {isSwitching
            ? t('locale_switching')
            : marketCompactLabel(root?.selectedLocale)}
        </span>
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {isSwitching ? t('locale_switching_status') : ''}
      </span>
      {open && (
        <div
          id={selectorId}
          className="pk-locale__menu"
          role="dialog"
          aria-label={t('locale_change_aria')}
        >
          <div className="pk-locale__group">
            <p className="pk-locale__label">{t('locale_market_label')}</p>
            {MARKET_ORDER.map((country) => {
              const market = availableMarkets.get(country);
              const isAvailable = Boolean(market);
              return (
                <button
                  key={country}
                  type="button"
                  aria-pressed={country === currentCountry}
                  aria-disabled={!isAvailable}
                  disabled={!isAvailable}
                  className={
                    'pk-locale__item' +
                    (country === currentCountry ? ' is-active' : '')
                  }
                  onClick={() => chooseMarket(country)}
                >
                  <span>{t(`locale_market_${country.toLowerCase()}`)}</span>
                  <small>
                    {market?.currency || t('locale_market_unavailable')}
                  </small>
                </button>
              );
            })}
          </div>
          <div className="pk-locale__group">
            <p className="pk-locale__label">{t('locale_language_label')}</p>
            {ORDER.map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={key === currentKey}
                className={
                  'pk-locale__item' + (key === currentKey ? ' is-active' : '')
                }
                onClick={() => choose(key)}
              >
                <span>{LABELS[key]}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
