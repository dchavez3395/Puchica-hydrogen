/**
 * MegaMenu -- Shop dropdown panel for the desktop header.
 *
 * Audit §4 layout: a full-width paper panel with the category link
 * columns on the left, one featured organization tile on the right,
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
import {useT} from '~/lib/t';

// Ordered category handles (largest departments first). These must be
// published to the Puchica Storefront channel in Shopify admin.
const SHOPPING_INTENTS = [
  {
    id: 'home-reset',
    titleKey: 'megamenu_intent_home_title',
    bodyKey: 'megamenu_intent_home_body',
    query: 'under sink organizer',
  },
  {
    id: 'cable-control',
    titleKey: 'megamenu_intent_cable_title',
    bodyKey: 'megamenu_intent_cable_body',
    query: 'cable organizer',
  },
  {
    id: 'travel-order',
    titleKey: 'megamenu_intent_travel_title',
    bodyKey: 'megamenu_intent_travel_body',
    query: 'packing cubes',
  },
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
        onClick={() => setOpen(true)}
        onFocus={(event) => {
          // Pointer clicks focus the button before firing onClick. Opening on
          // every focus made that same click immediately toggle the menu shut.
          // Keyboard focus still opens the menu for tab navigation.
          if (event.currentTarget.matches(':focus-visible')) handleEnter();
        }}
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
        inert={open ? undefined : ''}
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

/** @param {{data: any; onNavigate: () => void}} props */
function MegaMenuPanel({data, onNavigate}) {
  const t = useT();
  void data;

  const quickLinks = [
    {
      id: 'q-all',
      title: t('all_breadcrumb'),
      url: '/collections/all',
    },
    {
      id: 'q-best',
      title: t('nav_best_sellers'),
      url: '/collections/best-sellers',
    },
  ];

  return (
    <>
      <div className="pk-mega__grid">
        <nav className="pk-mega__cats" aria-label={t('megamenu_panel_aria')}>
          <p className="pk-mega__label">{t('megamenu_intent_heading')}</p>
          <ul className="pk-mega__list">
            {SHOPPING_INTENTS.map((intent) => (
              <li key={intent.id}>
                <Link
                  to={`/search?q=${encodeURIComponent(intent.query)}`}
                  prefetch="intent"
                  className="pk-mega__cat"
                  onClick={onNavigate}
                >
                  <strong>{t(intent.titleKey)}</strong>
                  <span>{t(intent.bodyKey)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link
          to="/campaigns/home-finds"
          prefetch="intent"
          className="pk-mega__feature"
          onClick={onNavigate}
        >
          <p className="pk-mega__feature-eye">{t('megamenu_edit_eyebrow')}</p>
          <h3 className="pk-mega__feature-title">{t('megamenu_edit_title')}</h3>
          <p className="pk-mega__feature-copy">{t('megamenu_edit_body')}</p>
          <span className="pk-mega__feature-cta">{t('megamenu_tile_cta')}</span>
        </Link>
      </div>
      <div className="pk-mega__quick">
        {quickLinks.map((q) => (
          <Link
            key={q.id}
            to={q.url}
            prefetch="intent"
            className="pk-mega__quick-link"
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
          {SHOPPING_INTENTS.map((intent) => (
            <li key={intent.id}>
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
