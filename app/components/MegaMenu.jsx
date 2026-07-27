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
import {filterLaunchProducts} from '~/lib/launch-catalog';

// Ordered category handles (largest departments first). These must be
// published to the Puchica Storefront channel in Shopify admin.
const CATEGORY_HANDLES = [
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
  'office-school',
  'baby-nursery',
  'outdoor-garden',
];

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
  // A collection can remain published after its last product is removed.
  // Only expose departments that have a real storefront product, otherwise
  // the primary navigation creates a frustrating dead end.
  const hasProducts = (collection) =>
    filterLaunchProducts(collection?.products?.nodes).length > 0;
  const categories = CATEGORY_HANDLES.map((h) => byHandle.get(h)).filter(
    hasProducts,
  );
  const featured = byHandle.get('best-sellers');
  const featuredImage =
    featured?.image || featured?.products?.nodes?.[0]?.featuredImage;

  const quickLinks = [
    {id: 'q-new', handle: 'new-arrivals', title: t('nav_new_arrivals'), url: '/collections/new-arrivals'},
    {id: 'q-all', title: t('nav_all_products'), url: '/collections/all'},
  ].filter((link) => !link.handle || hasProducts(byHandle.get(link.handle)));

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
              ) : (
                <span className="pk-mega__feature-img-fallback" aria-hidden="true">
                  ★
                </span>
              )}
            </div>
            <p className="pk-mega__feature-eye">{t('best_sellers_eyebrow')}</p>
            <h3 className="pk-mega__feature-title">
              {t('best_sellers_heading')}
            </h3>
            <span className="pk-mega__feature-cta">
              {t('megamenu_tile_cta')}
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
