import {useMemo} from 'react';
import {ScrollReveal} from './ScrollReveal';

/**
 * EditorialDescription — full-bleed editorial block for the PDP.
 *
 * Rendered below the gallery. Splits the merchant's
 * descriptionHtml into a clean prose column on the left and a small
 * accent column (image mosaic if there are 3+ gallery images, or a
 * brand mark if not) on the right at >= 900px. The body content
 * stays untouched — we wrap, we style, we reveal.
 *
 * Merchants don't need to author anything new — the prose body
 * comes straight from `product.descriptionHtml`. We add:
 *   - Eyebrow ("About this product")
 *   - Editorial headline (derived from the product type)
 *   - A pull-quote treatment for any `<blockquote>` the merchant
 *     includes in the body
 *   - Image mosaic if the gallery has 3+ images
 *
 * @param {{
 *   html: string;
 *   productType?: string | null;
 *   galleryImages?: Array<{url: string; altText?: string}>;
 *   eyebrow: string;        // i18n string, e.g. "About this product"
 *   t?: (k: string) => string; // optional — for future i18n headline
 * }}
 */
export function EditorialDescription({html, productType, galleryImages = [], eyebrow}) {
  // Pull secondary images from the gallery if available, to anchor
  // the right column. We skip the first (it's already on screen as
  // the hero) and need at least 3 to fill the mosaic grid. Below
  // that, fall back to the brand-accent column instead.
  const mosaic = useMemo(() => {
    const rest = (galleryImages || []).slice(1, 4);
    return rest.length >= 3 ? rest : [];
  }, [galleryImages]);

  if (!html) return null;

  return (
    <section className="pk-pdesc">
      <div className="pk-pdesc__inner">
        <ScrollReveal as="div" className="pk-pdesc__col-text" variant="up">
          <p className="pk-pdesc__eyebrow">{eyebrow}</p>
          {productType ? (
            <h2 className="pk-pdesc__headline">{productType}</h2>
          ) : null}
          <div
            className="pk-pdesc__body"
            dangerouslySetInnerHTML={{__html: html}}
          />
        </ScrollReveal>

        {mosaic.length > 0 ? (
          <ScrollReveal
            as="div"
            className="pk-pdesc__col-mosaic"
            variant="right"
            delay={120}
            aria-hidden
          >
            {mosaic.map((img, i) => (
              <div
                key={img.url || i}
                className={`pk-pdesc__tile pk-pdesc__tile--${i + 1}`}
              >
                <img
                  src={img.url}
                  alt=""
                  loading="lazy"
                  style={{aspectRatio: i === 1 ? '1/1' : '4/5'}}
                />
              </div>
            ))}
          </ScrollReveal>
        ) : (
          <ScrollReveal
            as="div"
            className="pk-pdesc__col-accent"
            variant="scale"
            delay={120}
          >
            <span className="pk-pdesc__brand-mark" aria-hidden>
              Puchica
            </span>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}