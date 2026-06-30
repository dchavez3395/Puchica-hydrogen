import {useMemo} from 'react';
import {SplitSection, MosaicFromGallery, EditorialAccent} from './SplitSection';

/**
 * EditorialDescription — PDP editorial block.
 *
 * Renders the merchant's descriptionHtml as a magazine spread.
 * Layout depends on whether the merchant's HTML carries inline
 * `<img>` / `<video>` tags:
 *
 *   • With inline media (e.g. Garden Hose Splitter, Giant Teddy Bear):
 *     Skip the dedicated top visual column entirely. Render the lead
 *     heading on the left and the full body (with floating inline
 *     images) on the right at desktop, both as one `.pk-pdesc` block.
 *     The inline images become the visual rhythm — they alternate
 *     left/right via `.pk-pdesc__body > p:has(> img):nth-of-type(…)`.
 *
 *   • Without inline media (most products):
 *     Keep the original three-zone layout: eyebrow + headline, then
 *     side-by-side lead beside a top mosaic / brand-accent column,
 *     then the tail wrapping under at full width.
 *
 * In both cases the prose body comes straight from
 * `product.descriptionHtml`. We add editorial framing (eyebrow,
 * headline, ember rule) — no merchant work required.
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
  // Split the merchant body into a lead and a tail. We split on the
  // first `</p>` / `</h1..4>` boundary — anything before is the lead,
  // anything after is the tail. SSR-safe (no DOMParser).
  const {lead, tail} = useMemo(() => {
    if (!html) return {lead: '', tail: ''};
    const closeRe = /<\/(p|h[1-6]|ul|ol|blockquote)>/i;
    const m = html.match(closeRe);
    if (!m) return {lead: html, tail: ''};
    const cutAt = m.index + m[0].length;
    return {lead: html.slice(0, cutAt), tail: html.slice(cutAt)};
  }, [html]);

  // Detect whether the merchant's body has inline <img>/<video>
  // media interleaved with the prose. If so, treat those images as
  // the editorial visual zone and skip the redundant top mosaic.
  const hasInlineMedia = useMemo(() => {
    if (!html) return false;
    return /<(img|video)\b/i.test(html);
  }, [html]);

  const useMosaic = useMemo(() => {
    return (galleryImages || []).slice(1, 4).length >= 3;
  }, [galleryImages]);

  if (!html) return null;

  // ── Layout A: inline media present ─────────────────────────────
  // Render the lead (heading) at full width, the body with floating
  // inline images below it. The CSS handles the image alternation.
  if (hasInlineMedia) {
    return (
      <section className="pk-pdesc pk-split pk-split--left">
        <div className="pk-split__inner pk-pdesc__with-media">
          <div className="pk-split__col-text pk-pdesc__lead-col">
            <p className="pk-split__eyebrow">{eyebrow}</p>
          </div>
          <div className="pk-split__col-visual pk-pdesc__body-col">
            <h2 className="pk-split__headline pk-pdesc__heading-inline">
              {productType || ''}
            </h2>
            <div
              className="pk-pdesc__body"
              dangerouslySetInnerHTML={{__html: html}}
            />
          </div>
        </div>
      </section>
    );
  }

  // ── Layout B: no inline media — keep the original three-zone form
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
