import {useEffect, useRef, useState} from 'react';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {ProductItem} from '~/components/ProductItem';
import {diversifyByVendor} from '~/lib/diversify';
import {useT} from '~/lib/t';

/**
 * Eyebrow + h2 + "See all →" + horizontal <ProductItem> rail, 8 cards.
 * Sources the `outdoor-garden` collection, sorted by CREATED desc.
 * Vendor diversification is applied so adjacent cards aren't from
 * the same supplier.
 *
 * @param {{ products: Array<object> }}
 */
export function NewArrivals({products = []}) {
  const t = useT();
  const items = diversifyByVendor(products).slice(0, 8);
  const trackRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => {
      setCanLeft(el.scrollLeft > 2);
      setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
    };
    el.addEventListener('scroll', update, {passive: true});
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, []);

  if (!items.length) return null;

  return (
    <section
      className="pk-section pk-section--new-arrivals"
      aria-label={t('new_arrivals_aria')}
    >
      <div className="pk-section__inner">
        <div className="pk-section__head pk-section__head--row">
          <div>
            <span className="pk-eyebrow">{t('new_arrivals_eyebrow')}</span>
            <h2 className="pk-section__h">{t('new_arrivals_heading')}</h2>
          </div>
          <Link
            to="/collections/outdoor-garden"
            prefetch="intent"
            className="pk-section__see-all"
          >
            {t('new_arrivals_see_all')} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="pk-rail">
          <button
            type="button"
            className="pk-rail__arr pk-rail__arr--left"
            disabled={!canLeft}
            aria-label={t('new_arrivals_scroll_left')}
            onClick={() => trackRef.current?.scrollBy({left: -320, behavior: 'smooth'})}
          >
            ‹
          </button>
          <ul className="pk-rail__track" ref={trackRef}>
            {items.map((p, i) => (
              <li key={p.id} className="pk-rail__item">
                <ProductItem product={p} loading={i < 2 ? 'eager' : 'lazy'} />
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="pk-rail__arr pk-rail__arr--right"
            disabled={!canRight}
            aria-label={t('new_arrivals_scroll_right')}
            onClick={() => trackRef.current?.scrollBy({left: 320, behavior: 'smooth'})}
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
