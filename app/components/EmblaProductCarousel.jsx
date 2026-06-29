import {useState, useEffect, useCallback} from 'react';
import {Link} from 'react-router';
import useEmblaCarousel from 'embla-carousel-react';
import {ProductPrice} from './ProductPrice';

/**
 * EmblaProductCarousel — swipe-able product row using Embla Carousel.
 *
 * Replaces CSS scroll-snap rows with drag/swipe, snap indicators, and
 * keyboard navigation. Falls back gracefully if Embla fails to init.
 *
 * @param {Object} props
 * @param {Array} props.products - Array of product objects from Shopify
 * @param {string} [props.title] - Optional section title
 * @param {string} [props.viewAllHref] - Optional "View all" link
 * @param {string} [props.emphasis] - 'light' (cream bg) or 'dark' (ink bg)
 */
export function EmblaProductCarousel({products, title, viewAllHref, emphasis = 'light'}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    dragFree: true,
    skipSnaps: false,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const onSelect = useCallback((api) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect(emblaApi);
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  if (!products || products.length === 0) return null;

  const sectionClass = emphasis === 'dark' ? 'pk-embla pk-embla--dark' : 'pk-embla pk-embla--light';
  const cardClass = emphasis === 'dark' ? 'pk-card pk-card--inverted' : 'pk-card';

  return (
    <section className={sectionClass}>
      {(title || viewAllHref) && (
        <header className="pk-embla__head">
          {title ? <h2 className="pk-embla__title">{title}</h2> : <span />}
          {viewAllHref ? (
            <Link to={viewAllHref} className="pk-embla__viewall">
              View all →
            </Link>
          ) : null}
        </header>
      )}

      <div className="pk-embla__viewport" ref={emblaRef}>
        <div className="pk-embla__container">
          {products.map((p, i) => (
            <div className="pk-embla__slide" key={p.id || p.handle || `slide-${i}`}>
              <Link
                to={`/products/${p.handle}`}
                className={cardClass}
                prefetch="intent"
              >
                <div className="pk-card__media">
                  {p.featuredImage ? (
                    <img
                      src={p.featuredImage.url}
                      alt={p.featuredImage.altText || p.title}
                      width={p.featuredImage.width || 400}
                      height={p.featuredImage.height || 400}
                      loading="lazy"
                    />
                  ) : (
                    <div className="pk-card__placeholder" />
                  )}
                </div>
                <div className="pk-card__body">
                  <h3 className="pk-card__title">{p.title}</h3>
                  <div className="pk-card__price">
                    <ProductPrice price={p.priceRange?.minVariantPrice} compareAtPrice={p.compareAtPriceRange?.minVariantPrice} />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {(canScrollPrev || canScrollNext) && (
        <div className="pk-embla__controls">
          <button
            type="button"
            className="pk-embla__btn"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            aria-label="Previous"
          >
            ←
          </button>
          <div className="pk-embla__dots" role="tablist" aria-label="Slide indicators">
            {scrollSnaps.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === selectedIndex}
                aria-label={`Go to slide ${i + 1}`}
                className={`pk-embla__dot ${i === selectedIndex ? 'is-active' : ''}`}
                onClick={() => emblaApi?.scrollTo(i)}
              />
            ))}
          </div>
          <button
            type="button"
            className="pk-embla__btn"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            aria-label="Next"
          >
            →
          </button>
        </div>
      )}
    </section>
  );
}
