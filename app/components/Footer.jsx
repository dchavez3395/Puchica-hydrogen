import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {
  IconInstagram,
  IconFacebook,
  IconTiktok,
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
    domain: 'instagram.com',
    handle: 'puchica.canada',
  },
  {
    Icon: IconFacebook,
    labelKey: 'social_facebook',
    domain: 'facebook.com',
    handle: 'Puchica',
  },
  {
    Icon: IconTiktok,
    labelKey: 'social_tiktok',
    domain: 'tiktok.com',
    handle: '@puchica_canada',
  },
]
  .map((profile) => ({
    ...profile,
    url: SOCIAL_PROFILES.find((url) => url.includes(profile.domain)),
  }))
  .filter((profile) => profile.url);

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
          <p className="pk-footer__tagline">Puchica · Canada</p>
          <div
            className="pk-footer__social"
            aria-label={t('footer_social_aria')}
          >
            {SOCIAL.map(({Icon, labelKey, url, handle}) => (
              <a
                key={labelKey}
                href={url}
                aria-label={`${t(labelKey)} (${handle})`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>

          <address className="pk-footer__address">
            {t('footer_address')}
            <br />
            <a href="mailto:hello@puchica.ca">{t('footer_email')}</a>
          </address>

        </div>

        <div className="pk-footer__col">
          <h2>Puchica</h2>
          <Link to="/pages/about">{t('footer_about')}</Link>
          <Link to="/pages/contact">{t('footer_contact')}</Link>
          <Link to="/pages/faq">{t('footer_faq')}</Link>
          <Link to="/pages/shipping">{t('footer_shipping_info')}</Link>
        </div>

        <div className="pk-footer__col">
          <h2>{t('footer_policies')}</h2>
          <Link to="/policies">{t('footer_policies')}</Link>
          <Link to="/policies/refund-policy">{t('footer_refund_policy')}</Link>
          <Link to="/policies/shipping-policy">
            {t('footer_shipping_policy')}
          </Link>
          <Link to="/policies/terms-of-service">{t('footer_terms')}</Link>
        </div>
      </div>

      <div className="pk-footer__bar">
        <span>
          {t('footer_copyright', {year})} {t('footer_rights')}
        </span>
        <nav className="pk-footer__legal" aria-label={t('footer_legal_aria')}>
          <Link to="/policies/privacy-policy">{t('footer_privacy')}</Link>
          <Link to="/policies">{t('footer_policies')}</Link>
        </nav>
      </div>
    </footer>
  );
}

/**
 * @typedef {Object} FooterProps
 * @property {HeaderQuery} header
 * @property {string} publicStoreDomain
 */

/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
