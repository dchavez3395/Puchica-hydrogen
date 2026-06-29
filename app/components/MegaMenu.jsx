/**
 * MegaMenu -- Shop dropdown panel for the desktop header.
 *
 * Renders a hover-revealed (or click-revealed on touch) full-width panel with
 * 15 category tiles in a 3-column grid + a featured row for Best Sellers,
 * Trending Now, and Gifts Under $25. Data is fetched via Storefront API
 * MEGA_MENU_QUERY, deferred to avoid blocking the header render. Falls back
 * to a clean empty state if the query fails.
 *
 * On mobile (< 900px), the parent HeaderMenuMobileToggle handles the drawer;
 * this component returns null.
 */
import {Suspense, useEffect, useId, useRef, useState} from 'react';
import {Await, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import StarGlyph from './StarGlyph';
import {useT} from '~/lib/t';

// Map handles to dictionary keys for category taglines.
const TAGLINE_KEYS = {
  'phone-case': 'megamenu_tagline_phone_case',
  'home-essentials': 'megamenu_tagline_home_essentials',
  'electronics-accessories': 'megamenu_tagline_electronics_accessories',
  'apparel-accessories': 'megamenu_tagline_apparel_accessories',
  'health-wellness': 'megamenu_tagline_health_wellness',
  'sports-outdoors': 'megamenu_tagline_sports_outdoors',
  'pet-finds': 'megamenu_tagline_pet_finds',
  'automotive': 'megamenu_tagline_automotive',
  'tools-home-improvement': 'megamenu_tagline_tools_home_improvement',
  'beauty-personal-care': 'megamenu_tagline_beauty_personal_care',
  'toys-games': 'megamenu_tagline_toys_games',
  'home-decor': 'megamenu_tagline_home_decor',
  'office-school-supplies': 'megamenu_tagline_office_school_supplies',
  'baby-nursery': 'megamenu_tagline_baby_nursery',
  'outdoor-garden': 'megamenu_tagline_outdoor_garden',
  'best-sellers': 'megamenu_tagline_best_sellers',
  'trending-finds': 'megamenu_tagline_trending_finds',
  'gifts-under-25': 'megamenu_tagline_gifts_under_25',
};

// All 19 collection handles split into product categories and featured promos.
const PRODUCT_CATEGORIES = [
  'phone-case',
  'home-essentials',
  'electronics-accessories',
  'apparel-accessories',
  'health-wellness',
  'sports-outdoors',
  'pet-finds',
  'automotive',
  'tools-home-improvement',
  'beauty-personal-care',
  'toys-games',
  'home-decor',
  'office-school-supplies',
  'baby-nursery',
  'outdoor-garden',
];

const FEATURED_CATEGORIES = ['best-sellers', 'trending-finds', 'gifts-under-25'];

// Map handles to the GraphQL alias keys used in MEGA_MENU_QUERY.
const ALIAS_MAP = {
  'phone-case': 'phoneCase',
  'home-essentials': 'homeEssentials',
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

// Tagline lookup. Taglines live in dictionaries.js so they can be
// translated per locale (see `megamenu_tagline_*` keys).
function taglineFor(handle, t) {
  const key = TAGLINE_KEYS[handle];
  return key ? t(key) : '';
}

export function MegaMenu({deferred, onClose}) {
  const id = useId();
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);

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
        Shop
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
        aria-label="Shop by category"
        aria-hidden={open ? 'false' : 'true'}
      >
        <div className="pk-mega__inner">
          <Suspense fallback={<MegaMenuSkeleton />}>
            <Await resolve={deferred} errorElement={<MegaMenuError />}>
              {(data) => (
                <MegaMenuPanel
                  data={data}
                  onNavigate={() => setOpen(false)}
                />
              )}
            </Await>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function MegaMenuPanel({data, onNavigate}) {
  const t = useT();
  if (!data) return <MegaMenuSkeleton />;

  // Build product tile list from PRODUCT_CATEGORIES order.
  const productTiles = PRODUCT_CATEGORIES.map((handle) => {
    const alias = ALIAS_MAP[handle];
    return data[alias];
  }).filter(Boolean);

  // Build featured tile list from FEATURED_CATEGORIES order.
  const featuredTiles = FEATURED_CATEGORIES.map((handle) => {
    const alias = ALIAS_MAP[handle];
    return data[alias];
  }).filter(Boolean);

  return (
    <div className="pk-mega__grid">
      <ul className="pk-mega__tiles">
        {productTiles.map((c) => {
          if (!c) return null;
          const tagline = taglineFor(c.handle, t) || '';
          const image = c.image || c.products?.nodes?.[0]?.featuredImage;
          return (
            <li key={c.id} className="pk-mega__tile">
              <Link
                to={`/collections/${c.handle}`}
                prefetch="intent"
                className="pk-mega__tile-link"
                onClick={onNavigate}
              >
                <div className="pk-mega__tile-img">
                  {image ? (
                    <Image
                      data={image}
                      aspectRatio="4/5"
                      sizes="(max-width: 900px) 50vw, 200px"
                      loading="lazy"
                    />
                  ) : (
                    <div className="pk-mega__tile-placeholder" aria-hidden />
                  )}
                </div>
                <div className="pk-mega__tile-body">
                  <StarGlyph size={10} />
                  <h3 className="pk-mega__tile-title">{c.title}</h3>
                  {tagline && (
                    <p className="pk-mega__tile-tagline">{tagline}</p>
                  )}
                  <span className="pk-mega__tile-cta">Shop &rarr;</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      {featuredTiles.length > 0 && (
        <div className="pk-mega__featured-row">
          {featuredTiles.map((c) => {
            if (!c) return null;
            const tagline = taglineFor(c.handle, t) || '';
            return (
              <Link
                key={c.id}
                to={`/collections/${c.handle}`}
                prefetch="intent"
                className="pk-mega__featured-tile"
                onClick={onNavigate}
              >
                <p className="pk-mega__featured-eye">
                  <StarGlyph size={10} /> {tagline}
                </p>
                <h3 className="pk-mega__featured-title">{c.title}</h3>
                <span className="pk-mega__featured-cta">Shop &rarr;</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MegaMenuSkeleton() {
  return (
    <div className="pk-mega__grid" aria-hidden>
      <ul className="pk-mega__tiles">
        {PRODUCT_CATEGORIES.map((handle) => (
          <li key={handle} className="pk-mega__tile">
            <div className="pk-mega__tile-link">
              <div className="pk-mega__tile-img">
                <div className="pk-mega__tile-placeholder" />
              </div>
              <div className="pk-mega__tile-body">
                <h3 className="pk-mega__tile-title">&nbsp;</h3>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="pk-mega__featured-row">
        {FEATURED_CATEGORIES.map((handle) => (
          <div key={handle} className="pk-mega__featured-tile">
            <h3 className="pk-mega__featured-title">&nbsp;</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

function MegaMenuError() {
  return (
    <div className="pk-mega__error" role="alert">
      <p>We couldn&rsquo;t load the categories just now.</p>
      <Link to="/collections/all" className="pk-mega__error-link">
        Browse everything &rarr;
      </Link>
    </div>
  );
}