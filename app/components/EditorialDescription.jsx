import {useMemo} from 'react';
import {SplitSection, MosaicFromGallery, EditorialAccent} from './SplitSection';

/**
 * EditorialDescription — PDP editorial block.
 *
 * Renders the merchant's descriptionHtml as a three-zone magazine
 * spread: full-width eyebrow + headline at the top, side-by-side
 * text + visual in the middle, with the body wrapping at full
 * width under both. The first paragraph / first prose block sits
 * beside the visual; everything after wraps below.
 *
 * Picking the right-column visual: at least 3 secondary images
 * (galleryImages.slice(1, 4)) → mosaic; otherwise → brand-accent
 * column.
 *
 * The prose body comes straight from `product.descriptionHtml`. We
 * add the editorial framing (eyebrow, headline) — no merchant work
 * required. Blockquote pull-quotes get a left ember rule.
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
  // Split the merchant body into a lead (sits beside the visual)
  // and a tail (wraps below at full width). We split on the first
  // `</p>` / `</h1..4>` boundary — anything before is the lead,
  // anything after is the tail. SSR-safe (no DOMParser).
  const {lead, tail} = useMemo(() => {
    if (!html) return {lead: '', tail: ''};
    const closeRe = /<\/(p|h[1-6]|ul|ol|blockquote)>/i;
    const m = html.match(closeRe);
    if (!m) return {lead: html, tail: ''};
    const cutAt = m.index + m[0].length;
    return {lead: html.slice(0, cutAt), tail: html.slice(cutAt)};
  }, [html]);

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
      head={
        <div
          className="pk-pdesc__body"
          dangerouslySetInnerHTML={{__html: lead}}
        />
      }
      tail={
        tail ? (
          <div
            className="pk-pdesc__body"
            dangerouslySetInnerHTML={{__html: tail}}
          />
        ) : null
      }
    />
  );
}
