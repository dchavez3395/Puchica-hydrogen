import {useMemo} from 'react';
import {SplitSection, MosaicFromGallery, EditorialAccent} from './SplitSection';

/**
 * EditorialDescription — PDP editorial block.
 *
 * Two-column full-bleed section that splits the merchant's
 * descriptionHtml into a clean prose column on the left and an image
 * mosaic (or brand accent) on the right at >= 900px.
 *
 * As of the SplitSection extraction, this component delegates layout
 * to SplitSection. It owns only the editorial copy wiring: the body
 * dangerouslySetInnerHTML passthrough and the visual-column fallback
 * decision (mosaic when 3+ gallery images are available, brand-mark
 * accent otherwise).
 *
 * Merchants don't need to author anything new — the prose body comes
 * straight from `product.descriptionHtml`. We add:
 *   - Eyebrow ("About this product")
 *   - Editorial headline (derived from the product type)
 *   - A pull-quote treatment for any `<blockquote>` the merchant
 *     includes in the body
 *
 * @param {{
 *   html: string;
 *   productType?: string | null;
 *   galleryImages?: Array<{url: string; altText?: string}>;
 *   eyebrow: string;
 *   t?: (k: string) => string;
 * }}
 */
export function EditorialDescription({html, productType, galleryImages = [], eyebrow}) {
  // Pick the right-column visual. Need at least 3 secondary images
  // to fill the mosaic grid; below that, fall back to the brand
  // accent. The hero is galleryImages[0]; everything else can
  // populate the right column.
  const useMosaic = useMemo(() => {
    return (galleryImages || []).slice(1, 4).length >= 3;
  }, [galleryImages]);

  if (!html) return null;

  const visual = useMosaic ? (
    <MosaicFromGallery images={galleryImages} />
  ) : (
    <EditorialAccent mark="Puchica" />
  );

  return (
    <SplitSection
      align="left"
      eyebrow={eyebrow}
      heading={productType || undefined}
      visual={visual}
      className="pk-pdesc"
    >
      <div
        className="pk-pdesc__body"
        dangerouslySetInnerHTML={{__html: html}}
      />
    </SplitSection>
  );
}
