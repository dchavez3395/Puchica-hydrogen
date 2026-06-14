import {Link, useFetcher} from 'react-router';
import {
  IconInstagram,
  IconFacebook,
  IconX,
  IconTiktok,
} from '~/components/Icons';

const STORE_LOGO_URL =
  'https://cdn.shopify.com/s/files/1/0842/2644/1466/files/Puchica_logo.png?v=1781275908';

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
            <a href="https://instagram.com" aria-label="Instagram"><IconInstagram size={18} /></a>
            <a href="https://facebook.com" aria-label="Facebook"><IconFacebook size={18} /></a>
            <a href="https://twitter.com" aria-label="X"><IconX size={18} /></a>
            <a href="https://tiktok.com" aria-label="TikTok"><IconTiktok size={18} /></a>
          </div>
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
        <nav className="pk-footer__legal">
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
