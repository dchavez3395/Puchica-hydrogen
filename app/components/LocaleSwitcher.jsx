import {useEffect, useRef, useState} from 'react';
import {useFetcher, useRouteLoaderData} from 'react-router';
import {LANGUAGE_KEYS, localizePath} from '~/lib/i18n';

const LABELS = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  'pt-br': 'Português',
};
const ORDER = ['en', 'fr', 'es', 'pt-br'];

/**
 * Language switcher. POSTs to /locale (server action) which sets the
 * pk_locale cookie and redirects to the LOCALIZED path — so choosing a
 * language both remembers the preference (cookie, for future bare-URL visits)
 * and moves the user to the crawlable per-language URL (/fr, /es, /pt-br;
 * English is unprefixed). The URL is the source of truth for which language
 * renders — see getLocaleFromRequest in app/lib/i18n.js.
 */
export function LocaleSwitcher() {
  const root = useRouteLoaderData('root');
  const currentLang = root?.selectedLocale?.language || 'EN';
  const currentKey = LANGUAGE_KEYS[currentLang] || 'en';

  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const fetcher = useFetcher();

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
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

  return (
    <div className="pk-locale" ref={ref}>
      <button
        type="button"
        className="pk-icon-btn pk-locale__btn"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Change language"
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
        <span className="pk-locale__code">{currentKey === 'pt-br' ? 'PT' : currentKey.toUpperCase()}</span>
      </button>
      {open && (
        <ul className="pk-locale__menu" role="menu">
          {ORDER.map((key) => (
            <li key={key}>
              <button
                type="button"
                role="menuitem"
                className={
                  'pk-locale__item' + (key === currentKey ? ' is-active' : '')
                }
                onClick={() => choose(key)}
              >
                {LABELS[key]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
