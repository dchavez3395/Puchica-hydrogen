import {useEffect} from 'react';
import {JUDGEME_SHOP_DOMAIN, JUDGEME_PUBLIC_TOKEN} from '~/lib/judgeme';
import StarGlyph from '~/components/StarGlyph';
import {useT} from '~/lib/t';

/**
 * Compact star rating for the product title area, rendered from the
 * server-fetched Judge.me badge. Renders nothing until at least one review
 * exists, so we never show fake/empty stars. Self-contained inline styles
 * so it needs no global CSS.
 *
 * @param {{rating?: number, count?: number}} props
 */
export function ReviewStars({rating = 0, count = 0}) {
  const t = useT();
  if (!count) return null;
  const full = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <a
      href="#reviews"
      aria-label={t('reviews_aria', {rating, count})}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <span aria-hidden style={{color: '#f5a623', display: 'inline-flex', alignItems: 'center', gap: '2px'}}>
        {Array.from({length: full}, (_, i) => (
          <StarGlyph key={`f${i}`} variant="five" size={14} style={{margin: 0, color: '#f5a623'}} />
        ))}
        {Array.from({length: 5 - full}, (_, i) => (
          <StarGlyph key={`e${i}`} variant="five" size={14} style={{margin: 0, opacity: 0.3}} />
        ))}
      </span>
      <span style={{fontSize: '13px', opacity: 0.75}}>
        {rating.toFixed(1)} {count === 1 ? t('reviews_count_one', {count}) : t('reviews_count_many', {count})}
      </span>
    </a>
  );
}

/**
 * Full Judge.me review widget (review list + "write a review" form).
 * Loads Judge.me's official client preloader once; their script then scans
 * for `.jdgm-widget` targets and renders into them — including the review
 * schema markup Judge.me injects for SEO.
 *
 * @param {{externalId?: number|string|null, productTitle?: string}} props
 */
export function JudgemeReviews({externalId, productTitle}) {
  const t = useT();
  useEffect(() => {
    if (!externalId || typeof window === 'undefined') return;

    window.jdgm = window.jdgm || {};
    window.jdgm.SHOP_DOMAIN = JUDGEME_SHOP_DOMAIN;
    window.jdgm.PLATFORM = 'shopify';
    window.jdgm.PUBLIC_TOKEN = JUDGEME_PUBLIC_TOKEN;

    if (!document.getElementById('judgeme-preloader')) {
      const s = document.createElement('script');
      s.id = 'judgeme-preloader';
      s.src = 'https://cdn.judge.me/widget_preloader.js';
      s.async = true;
      s.setAttribute('data-cfasync', 'false');
      document.body.appendChild(s);
    } else {
      // Already loaded on a previous page — re-scan for the widget on this
      // client-side navigation.
      try {
        window.jdgmLoadAllWidgets?.();
        window.jdgm?.batchRatersInit?.();
      } catch {
        /* non-fatal */
      }
    }
  }, [externalId]);

  if (!externalId) return null;

  return (
    <section
      id="reviews"
      aria-label={t('reviews_section_aria')}
      style={{maxWidth: '1100px', margin: '8px auto 0', padding: '0 16px'}}
    >
      <h2 style={{fontSize: '22px', fontWeight: 700, margin: '0 0 16px'}}>
        {t('reviews_heading')}
      </h2>
      <div
        className="jdgm-widget jdgm-review-widget"
        data-id={externalId}
        data-product-title={productTitle || ''}
      />
    </section>
  );
}
