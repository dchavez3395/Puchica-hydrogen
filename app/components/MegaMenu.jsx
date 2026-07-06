/**
 * MegaMenu -- Shop dropdown panel for the desktop header.
 *
 * Audit §4 layout: a full-width paper panel with the category link
 * columns on the left, one featured Best Sellers tile on the right,
 * and a quick-links footer (New arrivals / Sale / World Cup / Gifts /
 * All products). Sale is the only colored link — ember, same as the
 * top nav — so the color keeps meaning "money".
 *
 * Data comes from MEGA_MENU_QUERY (all storefront-published
 * collections); this component picks categories out of the list by
 * handle so admin renames/additions only touch CATEGORY_HANDLES.
 *
 * On mobile (< 960px) the component is hidden via CSS; the mobile
 * drawer takes over.
 */
import {Suspense, useEffect, useId, useRef, useState} from 'react';
import {Await} from 'react-router';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {Image} from '@shopify/hydrogen';
import {useT} from '~/lib/t';

// Ordered category handles (largest departments first). These must be
// published to the Puchica Storefront channel in Shopify admin.
const CATEGORY_HANDLES = [
  'phone-case',
  'home-kitchen',
  'electronics-accessories',
  'apparel-accessories',
  'health-wellness',
  'sports-outdoors',
  'pet-supplies',
  'beauty-personal-care',
  'automotive',
  'tools-home-improvement',
  'toys-games',
  'home-decor',
  'office-school',
  'baby-nursery',
  'outdoor-garden',
];

const FEATURED_CATEGORIES = ['best-sellers', 'trending-finds', 'gifts-under-25'];

// Map handles to the GraphQL alias keys used in MEGA_MENU_QUERY.
const ALIAS_MAP = {
  'phone-case': 'phoneCase',
  'home-kitchen': 'homeKitchen',
  'electronics-accessories': 'electronicsAccessories',
  'apparel-accessories': 'apparelAccessories',
  'health-wellness': 'healthWellness',
  'sports-outdoors': 'sportsOutdoors',
  'pet-finds': 'petFinds',
  'automotive': 'automotive',
  'tools-home-improvement': 'toolsHomeImprovement',
  'beauty-personal-care': 'beautyPersonalCare',
  'toys-games': 'toysGames',
  'home-decor': 'homeDecor',
  'office-school-supplies': 'officeSchoolSupplies',
  'baby-nursery': 'babyNursery',
  'outdoor-garden': 'outdoorGarden',
  'best-sellers': 'bestSellers',
  'trending-finds': 'trendingFinds',
  'gifts-under-25': 'giftsUnder25',
};

// Curated copy for each category. Tone: short, no filler, sentence case.
// "tagline" is the single-eyebrow line that appears under the category name.
const TAGLINES = {
  'phone-case': 'Cases, grips, protection.',
  'home-kitchen': 'Kitchen, storage, decor.',
  'electronics-accessories': 'Cables, chargers, mounts.',
  'apparel-accessories': 'Bags, hats, wearables.',
  'health-wellness': 'Skin, scent, grooming.',
  'sports-outdoors': 'Gear, fitness, fan shop.',
  'pet-finds': 'Toys, beds, things for them.',
  'automotive': 'Interior, tools, gadgets.',
  'tools-home-improvement': 'Fix, build, organize.',
  'beauty-personal-care': 'Makeup, nails, self-care.',
  'toys-games': 'Play, learn, collect.',
  'home-decor': 'Wall, light, accents.',
  'office-school-supplies': 'Desk, paper, must-haves.',
  'baby-nursery': 'Feeding, decor, comfort.',
  'outdoor-garden': 'Garden, patio, outdoor.',
  'best-sellers': 'Top picks everyone loves.',
  'trending-finds': 'What is hot right now.',
  'gifts-under-25': 'Great gifts, small budget.',
};

>>>>>>> 724944a (fix: update inflated stats (6,000+→3,700+, 19→25 collections) and broken home-essentials→home-kitchen links)
export function MegaMenu({deferred, onClose}) {
  const id = useId();
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);
  const t = useT();

  // Open on hover, with a small delay so quick mouse-passes don't trigger flicker.
  const handleEnter = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
  };
  // Close after a short grace period so the user can travel from trigger to panel.
  const handleLeave = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  // Close on click outside or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (
        panelRef.current?.contains(e.target) ||
        triggerRef.current?.contains(e.target)
      ) {
        return;
      }
      setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Notify parent when the menu state changes (e.g. to add a body class
  // for scroll-locking or so the header can adjust its own state).
  useEffect(() => {
    onClose?.(open);
  }, [open, onClose]);

  const close = () => setOpen(false);

  return (
    <div
      className={'pk-mega' + (open ? ' is-open' : '')}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      role="none"
    >
      <button
        ref={triggerRef}
        type="button"
        className="pk-nav__link pk-mega__trigger"
        aria-expanded={open ? 'true' : 'false'}
        aria-controls={id}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        onFocus={handleEnter}
      >
        {t('megamenu_trigger')}
        <svg
          className="pk-mega__chev"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div
        ref={panelRef}
        id={id}
        className="pk-mega__panel"
        role="region"
        aria-label={t('megamenu_panel_aria')}
        aria-hidden={open ? 'false' : 'true'}
      >
        <div className="pk-mega__inner">
          <Suspense fallback={<MegaMenuSkeleton />}>
            <Await resolve={deferred} errorElement={<MegaMenuError />}>
              {(data) => <MegaMenuPanel data={data} onNavigate={close} />}
            </Await>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function MegaMenuPanel({data, onNavigate}) {
  const t = useT();
  const nodes = data?.collections?.nodes;
  if (!nodes?.length) return <MegaMenuError />;

  const byHandle = new Map(nodes.map((c) => [c.handle, c]));
  const categories = CATEGORY_HANDLES.map((h) => byHandle.get(h)).filter(
    Boolean,
  );
  const featured = byHandle.get('best-sellers');
  const featuredImage =
    featured?.image || featured?.products?.nodes?.[0]?.featuredImage;

  const quickLinks = [
    {id: 'q-new', title: t('nav_new_arrivals'), url: '/collections/new-arrivals'},
    {id: 'q-sale', title: t('nav_sale'), url: '/collections/sale', sale: true},
    {id: 'q-wc', title: t('world_cup_heading'), url: '/collections/world-cup'},
    {id: 'q-gifts', title: t('nav_gifts'), url: '/collections/gifts-under-25'},
    {id: 'q-all', title: t('nav_all_products'), url: '/collections/all'},
  ];

  return (
    <>
      <div className="pk-mega__grid">
        <nav
          className="pk-mega__cats"
          aria-label={t('shop_by_category_aria')}
        >
          <p className="pk-mega__label">{t('shop_by_category_heading')}</p>
          <ul className="pk-mega__list">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/collections/${c.handle}`}
                  prefetch="intent"
                  className="pk-mega__cat"
                  onClick={onNavigate}
                >
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {featured ? (
          <Link
            to="/collections/best-sellers"
            prefetch="intent"
            className="pk-mega__feature"
            onClick={onNavigate}
          >
            <div className="pk-mega__feature-img">
              {featuredImage ? (
                <Image
                  data={featuredImage}
                  aspectRatio="1/1"
                  sizes="280px"
                  loading="lazy"
                />
              ) : null}
            </div>
            <p className="pk-mega__feature-eye">{t('best_sellers_eyebrow')}</p>
            <h3 className="pk-mega__feature-title">{featured.title}</h3>
            <span className="pk-mega__feature-cta">
              {t('megamenu_tile_cta')} <span aria-hidden="true">→</span>
            </span>
          </Link>
        ) : null}
      </div>
      <div className="pk-mega__quick">
        {quickLinks.map((q) => (
          <Link
            key={q.id}
            to={q.url}
            prefetch="intent"
            className={
              'pk-mega__quick-link' + (q.sale ? ' pk-mega__quick-link--sale' : '')
            }
            onClick={onNavigate}
          >
            {q.title}
          </Link>
        ))}
      </div>
    </>
  );
}

function MegaMenuSkeleton() {
  return (
    <div className="pk-mega__grid" aria-hidden>
      <div className="pk-mega__cats">
        <ul className="pk-mega__list">
          {CATEGORY_HANDLES.map((handle) => (
            <li key={handle}>
              <span className="pk-mega__cat pk-mega__cat--skel">&nbsp;</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="pk-mega__feature">
        <div className="pk-mega__feature-img" />
      </div>
    </div>
  );
}

function MegaMenuError() {
  const t = useT();
  return (
    <div className="pk-mega__error" role="alert">
      <p>{t('megamenu_error_body')}</p>
      <Link to="/collections/all" className="pk-mega__error-link">
        {t('megamenu_error_cta')}
      </Link>
    </div>
  );
}
