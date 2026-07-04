import {useEffect, useRef, useState} from 'react';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {ProductItem} from '~/components/ProductItem';
import {diversifyByVendor} from '~/lib/diversify';

/**
 * Eyebrow + h2 + "See all" link + horizontal <ProductItem> rail.
 *
 * Shared by NewArrivals, SportsOutdoors, and WorldCup so the
 * three rails stay visually identical and the scroll-state
 * effect lives in one place. Each section still owns its own
 * outer <section> wrapper and class name so per-section CSS
 * (background, accent stripe) keeps working.
 *
 * Vendor diversification is applied here so adjacent cards
 * aren't from the same supplier -- the merchant's catalog is
 * dominated by phone-case / Almond Latte SKUs, and a raw
 * CREATED_AT sort would put them in one long block.
 *
 * Strings are passed in already-translated (each section calls
 * useT() before rendering). The component itself is locale-agnostic.
 *
 * @param {{
 *   products: Array<object>;
 *   eyebrow: string;
 *   heading: string;
 *   seeAllLabel: string;
 *   seeAllHref: string;
 *   scrollLeftAria: string;
 *   scrollRightAria: string;
 *   maxItems?: number;
 * }}
 */
export function ProductRail({
  products = [],
  eyebrow,
  heading,
  seeAllLabel,
  seeAllHref,
  scrollLeftAria,
  scrollRightAria,
  maxItems = 8,
}) {
  const items = diversifyByVendor(products).slice(0, maxItems);
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
    <>
      <div className="pk-section__head pk-section__head--row">
        <div>
          <span className="pk-eyebrow">{eyebrow}</span>
          <h2 className="pk-section__h">{heading}</h2>
        </div>
        <Link
          to={seeAllHref}
          prefetch="intent"
          className="pk-section__see-all"
        >
          {seeAllLabel} <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div className="pk-rail">
        <button
          type="button"
          className="pk-rail__arr pk-rail__arr--left"
          disabled={!canLeft}
          aria-label={scrollLeftAria}
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
          aria-label={scrollRightAria}
          onClick={() => trackRef.current?.scrollBy({left: 320, behavior: 'smooth'})}
        >
          ›
        </button>
      </div>
    </>
  );
}
