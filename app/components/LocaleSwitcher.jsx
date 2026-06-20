import {useEffect, useRef, useState} from 'react';
import {useRouteLoaderData} from 'react-router';
import {LANGUAGE_KEYS, LOCALE_COOKIE} from '~/lib/i18n';

const LABELS = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  'pt-br': 'Português',
};
const ORDER = ['en', 'fr', 'es', 'pt-br'];

/**
 * Language switcher. Sets the `pk_locale` cookie and reloads so the server
 * re-renders the chosen language. Currency still follows the visitor's
 * country (geo) — this only changes content language.
 */
export function LocaleSwitcher() {
  const root = useRouteLoaderData('root');
  const currentLang = root?.selectedLocale?.language || 'EN';
  const currentKey = LANGUAGE_KEYS[currentLang] || 'en';

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close when clicking outside.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  function choose(key) {
    try {
      document.cookie = `${LOCALE_COOKIE}=${key}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      /* cookies blocked */
    }
    window.location.reload();
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
