import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {useT} from '~/lib/t';

/**
 * StoreHero — big-retail style.
 *
 * Think Amazon/Walmart/Superstore: clean banner with a headline,
 * search prompt, and a dense row of category shortcuts. No emoji,
 * no gradients, no designer vibes. Just "this is a store, here's
 * where to start shopping."
 */

const HERO_CATEGORIES = [
  {label: 'All products', to: '/collections/all'},
  {label: 'New Arrivals', to: '/collections/new-arrivals'},
  {label: 'Home & Kitchen', to: '/collections/home-kitchen'},
  {label: 'Phone Cases', to: '/collections/phone-case'},
  {label: 'Electronics', to: '/collections/electronics-accessories'},
  {label: 'Apparel', to: '/collections/apparel-accessories'},
  {label: 'Health & Wellness', to: '/collections/health-wellness'},
  {label: 'Pet Supplies', to: '/collections/pet-supplies'},
  {label: 'Beauty', to: '/collections/beauty-personal-care'},
  {label: 'Sports & Outdoors', to: '/collections/sports-outdoors'},
  {label: 'Toys & Games', to: '/collections/toys-games'},
  {label: 'Automotive', to: '/collections/automotive'},
  {label: 'Gifts Under $25', to: '/collections/gifts-under-25'},
  {label: 'Best Sellers', to: '/collections/best-sellers'},
];

const QUICK_LINKS = [
  {label: 'Best Sellers', to: '/collections/best-sellers'},
  {label: 'Trending Now', to: '/collections/trending-finds'},
  {label: 'For You', to: '/collections/for-you'},
  {label: 'Shop All', to: '/collections/all'},
];

export function StoreHero() {
  const t = useT();

  return (
    <section className="pk-store-hero" aria-label="Puchica store">
      <div className="pk-store-hero__inner">
        <div className="pk-store-hero__banner">
          <h1 className="pk-store-hero__heading">
            {t('store_hero_heading')}
          </h1>
          <p className="pk-store-hero__sub">
            {t('store_hero_body')}
          </p>
          <div className="pk-store-hero__quick-links">
            {QUICK_LINKS.map((q) => (
              <Link
                key={q.label}
                to={q.to}
                prefetch="intent"
                className="pk-store-hero__quick"
              >
                {q.label}
              </Link>
            ))}
          </div>
        </div>

        <nav className="pk-store-hero__cats" aria-label="Shop by department">
          {HERO_CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              to={cat.to}
              prefetch="intent"
              className={
                'pk-store-hero__cat' +
                (cat.badge ? ' pk-store-hero__cat--sale' : '')
              }
            >
              {cat.badge && (
                <span className="pk-store-hero__cat-badge">{cat.badge}</span>
              )}
              <span className="pk-store-hero__cat-label">{cat.label}</span>
              <span className="pk-store-hero__cat-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
