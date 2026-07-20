import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {IconReturn, IconShield, IconSparkles, IconTruck} from '~/components/Icons';

const items = [
  {
    icon: IconTruck,
    title: 'Shipping is clear before you pay',
    body: 'Free Canada shipping over $75, with final delivery options shown at checkout.',
    link: '/pages/shipping',
    cta: 'Shipping details',
  },
  {
    icon: IconReturn,
    title: '30-day returns',
    body: 'Not the right fit? Start with the refund policy and contact support if anything arrives wrong.',
    link: '/policies/refund-policy',
    cta: 'Refund policy',
  },
  {
    icon: IconShield,
    title: 'Secure Shopify checkout',
    body: 'Encrypted payments, familiar checkout, and order confirmation right away.',
    link: '/pages/faq',
    cta: 'Read the FAQ',
  },
  {
    icon: IconSparkles,
    title: 'Useful finds, cleaned up',
    body: 'We are tightening the catalog around active products, useful departments, and easier browsing.',
    link: '/collections/all',
    cta: 'Browse the store',
  },
];

export function StoreConfidence() {
  return (
    <section className="pk-section pk-section--store-confidence" aria-label="Why shop Puchica">
      <div className="pk-section__inner">
        <div className="pk-confidence">
          <div className="pk-confidence__copy">
            <span className="pk-eyebrow">Why shop here</span>
            <h2>Built to feel like a real store, not a mystery checkout.</h2>
            <p>
              Puchica is a broad everyday store, so trust matters. Start with active
              departments, see clear policies, and check out through Shopify when you
              find the right thing.
            </p>
          </div>
          <div className="pk-confidence__grid">
            {items.map(({icon: Icon, title, body, link, cta}) => (
              <Link key={title} to={link} className="pk-confidence__card" prefetch="intent">
                <span className="pk-confidence__icon" aria-hidden="true">
                  <Icon size={20} />
                </span>
                <span className="pk-confidence__text">
                  <strong>{title}</strong>
                  <span>{body}</span>
                  <em>{cta}</em>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
