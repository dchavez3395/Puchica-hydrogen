import {useEffect, useRef, useState} from 'react';
import {useFetcher, useRouteLoaderData} from 'react-router';
import {
  LANGUAGE_KEYS,
  localizePath,
  marketDisplayLabel,
} from '~/lib/i18n';
import {useT} from '~/lib/t';

const LABELS = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  'pt-br': 'Português',
};
/* Each language name is written in its own language, so it needs a
   matching lang attribute on every page (WCAG 3.1.2). */
const LABEL_LANGS = {
  en: 'en',
  fr: 'fr',
  es: 'es',
  'pt-br': 'pt-BR',
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
  const availableMarkets = new Map(
    (root?.selectedLocale?.availableMarkets || []).map((market) => [
      market.country,
      market,
    ]),
  );

  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const buttonRef = useRef(null);
  const fetcher = useFetcher();
  const isSwitching = fetcher.state !== 'idle';

  useEffect(() => {
    if (!open) return;

    const trigger = buttonRef.current;
    const firstMenuItem = ref.current?.querySelector(
      '[role="menu"] [role="menuitemradio"]:not([disabled])',
    );
    firstMenuItem?.focus();

    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const menuItems = () =>
      Array.from(
        ref.current?.querySelectorAll(
          '[role="menu"] [role="menuitemradio"]:not([disabled])',
        ) || [],
      );
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        // Capture phase + preventDefault, so an enclosing drawer's own
        // Escape handler (Aside) can see defaultPrevented and stay open.
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        window.requestAnimationFrame(() => trigger?.focus());
        return;
      }
      const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
      if (!keys.includes(e.key)) return;
      const items = menuItems();
      if (!items.length) return;
      e.preventDefault();
      const current = items.indexOf(document.activeElement);
      let next = current;
      if (e.key === 'ArrowDown') next = (current + 1) % items.length;
      if (e.key === 'ArrowUp')
        next = (current - 1 + items.length) % items.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = items.length - 1;
      items[next]?.focus();
    };

    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKeyDown, true);
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
        ref={buttonRef}
        type="button"
        className="pk-icon-btn pk-locale__btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-busy={isSwitching}
        aria-label={t('locale_change_aria')}
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
            : marketDisplayLabel(root?.selectedLocale)}
        </span>
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {isSwitching ? t('locale_switching_status') : ''}
      </span>
      {open && (
        <div
          className="pk-locale__menu"
          role="menu"
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
                  role="menuitemradio"
                  aria-checked={country === currentCountry}
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
                role="menuitemradio"
                aria-checked={key === currentKey}
                className={
                  'pk-locale__item' + (key === currentKey ? ' is-active' : '')
                }
                onClick={() => choose(key)}
              >
                <span lang={LABEL_LANGS[key]}>{LABELS[key]}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
