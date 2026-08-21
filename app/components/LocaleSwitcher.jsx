import {useEffect, useRef, useState} from 'react';
import {useFetcher, useRouteLoaderData} from 'react-router';
import {marketDisplayLabel} from '~/lib/i18n';
import {useT} from '~/lib/t';

const MARKET_ORDER = ['CA', 'US'];

/**
 * Market switcher. POSTs to /locale (server action), which persists the
 * selected market and returns to the current page. The launch storefront is
 * English-only until complete customer-facing translations are approved.
 */
export function LocaleSwitcher() {
  const t = useT();
  const root = useRouteLoaderData('root');
  const currentCountry = root?.selectedLocale?.country || 'CA';
  const availableMarkets = new Map(
    (root?.selectedLocale?.availableMarkets || []).map((market) => [
      market.country,
      market,
    ]),
  );

  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const fetcher = useFetcher();
  const isSwitching = fetcher.state !== 'idle';

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

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
        type="button"
        className="pk-icon-btn pk-locale__btn"
        aria-haspopup="true"
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
        <div className="pk-locale__menu" role="menu">
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
        </div>
      )}
    </div>
  );
}
