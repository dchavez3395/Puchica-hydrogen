import {useFetcher} from 'react-router';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {
  IconInstagram,
  IconFacebook,
  IconTiktok,
  IconShield,
} from '~/components/Icons';
import {SOCIAL_PROFILES, STORE_LOGO_URL} from '~/lib/brand';
import {useT} from '~/lib/t';

// Footer loader prefers `shop.brand.logo.image.url` from the Storefront
// API when set under Settings > Brand, otherwise falls back to
// STORE_LOGO_URL from app/lib/brand.js.

// The social URLs come from `SOCIAL_PROFILES` in app/lib/brand.js so the
// Footer and the Organization JSON-LD schema stay in sync — if you add
// a profile there, also add a matching entry below with its icon + label.
// Labels are derived from a t() key (passed in at render time) so the
// social handle shows the platform name in the visitor's language.
const SOCIAL = [
  {
    Icon: IconInstagram,
    labelKey: 'social_instagram',
    urlKey: 'https://instagram.com/puchica.canada',
    handle: 'puchica.canada',
  },
  {
    Icon: IconFacebook,
    labelKey: 'social_facebook',
    urlKey: 'https://www.facebook.com/share/1HXPSqGprD/',
    handle: 'Puchica',
  },
  {
    Icon: IconTiktok,
    labelKey: 'social_tiktok',
    urlKey: 'https://tiktok.com/@puchica_canada',
    handle: '@puchica_canada',
  },
].filter((s) => SOCIAL_PROFILES.includes(s.urlKey));

// Payment marks as styled text "chips" — no third-party brand assets, no
// real integration here. Real checkout is still handled by Shopify (PCI).
const PAYMENTS = [
  {label: 'Visa'},
  {label: 'Mastercard'},
  {label: 'Amex'},
  {label: 'PayPal'},
  {label: 'Apple Pay'},
  {label: 'Shop Pay'},
];

/**
 * @param {FooterProps}
 */
export function Footer({header}) {
  const t = useT();
  const logo = header?.shop?.brand?.logo?.image?.url || STORE_LOGO_URL;
  const year = new Date().getFullYear();
  return (
    <footer className="pk-footer">
      <div className="pk-footer__inner">
        <div className="pk-footer__brand">
          <Link to="/" className="pk-footer__logo">
            <img
              src={logo}
              alt="Puchica"
              width={120}
              height={32}
              loading="lazy"
              decoding="async"
            />
          </Link>
          <p className="pk-footer__tagline">{t('footer_tagline')}</p>
          <div className="pk-footer__social" aria-label={t('footer_social_aria')}>
            {SOCIAL.map(({Icon, labelKey, urlKey, handle}) => (
              <a key={labelKey} href={urlKey} aria-label={`${t(labelKey)} (${handle})`} target="_blank" rel="noopener noreferrer">
                <Icon size={18} />
              </a>
            ))}
          </div>

          <div className="pk-footer__pay" aria-label={t('footer_payments_aria')}>
            <span className="pk-footer__pay-label">{t('footer_accepted_payments')}</span>
            <ul className="pk-footer__pay-list" aria-label={t('footer_payments_list_aria')}>
              {PAYMENTS.map((p) => (
                <li key={p.label} className="pk-footer__pay-mark">
                  {p.label}
                </li>
              ))}
            </ul>
          </div>

          <address className="pk-footer__address">
            {t('footer_address')}
            <br />
            <a href="mailto:hello@puchica.ca">{t('footer_email')}</a>
          </address>

          <span className="pk-footer__secure">
            <span aria-hidden><IconShield size={14} /></span>
            {t('footer_secure')}
          </span>

          {/* Folded in from the old standalone StatsCounter section.
              Static, no count-up animation, so it sits cleanly in the
              footer without the IntersectionObserver. Numbers are
              editorial, not audited metrics. */}
          <div className="pk-footer__stats" aria-label={t('footer_stats_aria')}>
            <div className="pk-footer__stat">
              <span className="pk-footer__stat-value">6,000+</span>
              <span className="pk-footer__stat-label">{t('footer_stat_products')}</span>
            </div>
            <div className="pk-footer__stat">
              <span className="pk-footer__stat-value">19</span>
              <span className="pk-footer__stat-label">{t('footer_stat_collections')}</span>
            </div>
            <div className="pk-footer__stat">
              <span className="pk-footer__stat-value">Canada</span>
              <span className="pk-footer__stat-label">{t('footer_stat_shipping')}</span>
            </div>
            <div className="pk-footer__stat">
              <span className="pk-footer__stat-value">30</span>
              <span className="pk-footer__stat-label">{t('footer_stat_returns')}</span>
            </div>
          </div>
        </div>

        <div className="pk-footer__col">
          <h4>{t('footer_shop')}</h4>
          <Link to="/collections/all">{t('nav_all_products')}</Link>
          <Link to="/collections/best-sellers">{t('nav_best_sellers')}</Link>
          <Link to="/collections/trending-finds">{t('nav_trending')}</Link>
          <Link to="/collections/gifts-under-25">{t('nav_gifts')}</Link>
        </div>

        <div className="pk-footer__col">
          <h4>{t('footer_care')}</h4>
          <Link to="/pages/contact">{t('footer_contact')}</Link>
          <Link to="/search">{t('footer_search')}</Link>
          <Link to="/policies">{t('footer_policies')}</Link>
          <Link to="/policies/shipping-policy">{t('footer_shipping_policy')}</Link>
          <Link to="/policies/refund-policy">{t('footer_refund_policy')}</Link>
          <Link to="/policies/terms-of-service">{t('footer_terms')}</Link>
        </div>

        <Newsletter />
      </div>

      <div className="pk-footer__bar">
        <span>{t('footer_copyright', {year})} {t('footer_rights')}</span>
        <nav className="pk-footer__legal" aria-label={t('footer_legal_aria')}>
          <Link to="/policies/privacy-policy">{t('footer_privacy')}</Link>
          <Link to="/policies">{t('footer_policies')}</Link>
        </nav>
      </div>
    </footer>
  );
}

function Newsletter() {
  const t = useT();
  const fetcher = useFetcher();
  const ok = fetcher.data?.ok;
  const error = fetcher.data?.error;
  const submitting = fetcher.state !== 'idle';

  return (
    <div className="pk-footer__col pk-footer__newsletter">
      <h4>{t('footer_newsletter_title')}</h4>
      {ok ? (
        <p className="pk-footer__ok">{t('footer_newsletter_ok')}</p>
      ) : (
        <>
          <p>{t('footer_newsletter_copy')}</p>
          <fetcher.Form method="post" action="/newsletter" className="pk-footer__form">
            <input
              type="email"
              name="email"
              required
              placeholder={t('footer_email_placeholder')}
              aria-label={t('footer_newsletter_email_aria')}
              autoComplete="email"
              inputMode="email"
            />
            <button type="submit" disabled={submitting} aria-label={t('footer_newsletter_subscribe_aria')}>
              {submitting ? t('footer_newsletter_submitting') : t('footer_newsletter_cta')}
            </button>
          </fetcher.Form>
          {error ? <p className="pk-footer__err">{error}</p> : null}
        </>
      )}
    </div>
  );
}

/**
 * @typedef {Object} FooterProps
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {string} publicStoreDomain
 */

/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
