import {Link, useFetcher} from 'react-router';
import {
  IconInstagram,
  IconFacebook,
  IconX,
  IconTiktok,
  IconShield,
} from '~/components/Icons';
import {STORE_LOGO_URL} from '~/lib/brand';

// Footer loader prefers `shop.brand.logo.image.url` from the Storefront
// API when set under Settings > Brand, otherwise falls back to
// STORE_LOGO_URL from app/lib/brand.js.

// Social handles — placeholders. The user can update these to real brand
// accounts without touching the rest of the layout. Until then the icons
// are visual only.
const SOCIAL = [
  {Icon: IconInstagram, label: 'Instagram', href: 'https://instagram.com/puchica', handle: 'puchica'},
  {Icon: IconFacebook,  label: 'Facebook',  href: 'https://facebook.com/puchica',  handle: 'puchica'},
  {Icon: IconX,         label: 'X',         href: 'https://x.com/puchica',         handle: '@puchica'},
  {Icon: IconTiktok,    label: 'TikTok',    href: 'https://tiktok.com/@puchica',   handle: '@puchica'},
];

// Payment marks as styled text "chips" — no third-party brand assets, no
// real integration here. Real checkout is still handled by Shopify (PCI).
const PAYMENTS = [
  {label: 'Visa', style: {fontStyle: 'italic'}},
  {label: 'Mastercard', style: {fontStyle: 'italic'}},
  {label: 'Amex'},
  {label: 'PayPal'},
  {label: 'Apple Pay'},
  {label: 'Shop Pay'},
];

/**
 * @param {FooterProps}
 */
export function Footer({header}) {
  const logo = header?.shop?.brand?.logo?.image?.url || STORE_LOGO_URL;
  const year = new Date().getFullYear();
  return (
    <footer className="pk-footer">
      <div className="pk-footer__inner">
        <div className="pk-footer__brand">
          <Link to="/" className="pk-footer__logo">
            <img src={logo} alt="Puchica" />
          </Link>
          <p className="pk-footer__tagline">
            Curated picks, fast shipping, and effortless style. Shop smart. Shop
            Puchica.
          </p>
          <div className="pk-footer__social" aria-label="Social links">
            {SOCIAL.map(({Icon, label, href, handle}) => (
              <a key={label} href={href} aria-label={`${label} (${handle})`} target="_blank" rel="noopener noreferrer">
                <Icon size={18} />
              </a>
            ))}
          </div>

          <div className="pk-footer__pay" aria-label="Accepted payment methods">
            <span className="pk-footer__pay-label">Accepted payments</span>
            {PAYMENTS.map((p) => (
              <span key={p.label} className="pk-footer__pay-mark" style={p.style}>
                {p.label}
              </span>
            ))}
          </div>

          <span className="pk-footer__secure">
            <span aria-hidden><IconShield size={14} /></span>
            Secure checkout by Shopify — encrypted, PCI-compliant
          </span>
        </div>

        <div className="pk-footer__col">
          <h4>Shop</h4>
          <Link to="/collections/all">All Products</Link>
          <Link to="/collections/best-sellers">Best Sellers</Link>
          <Link to="/collections/trending-finds">Trending Now</Link>
          <Link to="/collections/gifts-under-25">Gifts Under $25</Link>
        </div>

        <div className="pk-footer__col">
          <h4>Customer Care</h4>
          <Link to="/pages/contact">Contact Us</Link>
          <Link to="/policies/shipping-policy">Shipping &amp; Delivery</Link>
          <Link to="/policies/refund-policy">Returns &amp; Refunds</Link>
          <Link to="/search">Search</Link>
        </div>

        <Newsletter />
      </div>

      <div className="pk-footer__bar">
        <span>© {year} Puchica. All rights reserved.</span>
        <nav className="pk-footer__legal" aria-label="Legal">
          <Link to="/policies/privacy-policy">Privacy Policy</Link>
          <Link to="/policies/terms-of-service">Terms of Service</Link>
          <Link to="/policies">Policies</Link>
        </nav>
      </div>
    </footer>
  );
}

function Newsletter() {
  const fetcher = useFetcher();
  const ok = fetcher.data?.ok;
  const error = fetcher.data?.error;
  const submitting = fetcher.state !== 'idle';

  return (
    <div className="pk-footer__col pk-footer__newsletter">
      <h4>Join our newsletter</h4>
      {ok ? (
        <p className="pk-footer__ok">Thanks — you&apos;re on the list.</p>
      ) : (
        <>
          <p>Exclusive offers and new arrivals, straight to your inbox.</p>
          <fetcher.Form method="post" action="/newsletter" className="pk-footer__form">
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              aria-label="Email"
            />
            <button type="submit" disabled={submitting} aria-label="Subscribe">
              {submitting ? '…' : '→'}
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
