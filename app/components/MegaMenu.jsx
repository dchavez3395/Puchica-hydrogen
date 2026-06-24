/**
 * MegaMenu -- Shop dropdown panel for the desktop header.
 *
 * Renders a hover-revealed (or click-revealed on touch) full-width panel with
 * 5 category tiles + a "Best Sellers" featured promo tile. Data is fetched
 * via Storefront API MEGA_MENU_QUERY, deferred to avoid blocking the header
 * render. Falls back to a clean empty state if the query fails.
 *
 * On mobile (< 900px), the parent HeaderMenuMobileToggle handles the drawer;
 * this component returns null.
 */
import {Suspense, useEffect, useId, useRef, useState} from 'react';
import {Await, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import StarGlyph from './StarGlyph';

const CATEGORY_ORDER = ['home', 'beauty', 'tech', 'outdoor', 'pet'];

// Curated copy for each category. Tone: short, no filler, sentence case.
// "tagline" is the single-eyebrow line that appears under the category name.
const TAGLINES = {
  home: 'Kitchen, storage, decor.',
  beauty: 'Skin, scent, grooming.',
  tech: 'Audio, chargers, smart devices.',
  outdoor: 'Garden, outdoor, patio.',
  pet: 'Toys, beds, things for them.',
};

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
  if (!data) return <MegaMenuSkeleton />;
  const tiles = CATEGORY_ORDER.map((key) => data[key]).filter(Boolean);
  const best = data.best;
  return (
    <div className="pk-mega__grid">
      <ul className="pk-mega__tiles">
        {tiles.map((c) => {
          if (!c) return null;
          const tagline = TAGLINES[c.handle] || '';
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
      {best && (
        <aside className="pk-mega__feature" aria-label="Featured: Best Sellers">
          <Link
            to={`/collections/${best.handle}`}
            prefetch="intent"
            className="pk-mega__feature-link"
            onClick={onNavigate}
          >
            <p className="pk-mega__feature-eye">
              <StarGlyph size={10} /> Curated
            </p>
            <h3 className="pk-mega__feature-title">{best.title}</h3>
            {best.description && (
              <p className="pk-mega__feature-desc">
                {best.description.slice(0, 110)}
                {best.description.length > 110 ? '…' : ''}
              </p>
            )}
            <span className="pk-mega__feature-cta">See the best &rarr;</span>
          </Link>
        </aside>
      )}
    </div>
  );
}

function MegaMenuSkeleton() {
  return (
    <div className="pk-mega__grid" aria-hidden>
      <ul className="pk-mega__tiles">
        {CATEGORY_ORDER.map((key) => (
          <li key={key} className="pk-mega__tile">
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
