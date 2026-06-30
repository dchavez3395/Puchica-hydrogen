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
 *     Pure two-column split. Left column carries the eyebrow plus the
 *     text-only portion of the body (paragraphs, lists, headings).
 *     Right column carries the section heading plus the merchant's
 *     inline images stacked vertically. No text wraps beside images —
 *     text and images live in separate columns and read as
 *     "text on one side, images on the other."
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
  // media interleaved with the prose. If so, we split the body into
  // a text-only chunk and an images-only chunk and render them in
  // separate columns.
  const {textOnly, imagesOnly} = useMemo(() => {
    if (!html) return {textOnly: '', imagesOnly: []};
    const hasMedia = /<(img|video)\b/i.test(html);
    if (!hasMedia) return {textOnly: html, imagesOnly: []};
    // The merchant wraps every inline image in `<p><b><img></b></p>`.
    // Strip those wrapper paragraphs from the text and capture their
    // inner markup separately.
    const wrapperRe = /<p[^>]*>\s*<b[^>]*>\s*(<img\b[^>]*\/?>)\s*<\/b>\s*<\/p>/gi;
    const imgs = [];
    const stripped = html.replace(wrapperRe, (_m, img) => {
      imgs.push(img);
      return '';
    });
    return {textOnly: stripped, imagesOnly: imgs};
  }, [html]);

  const useMosaic = useMemo(() => {
    return (galleryImages || []).slice(1, 4).length >= 3;
  }, [galleryImages]);

  if (!html) return null;

  const hasInlineMedia = imagesOnly.length > 0;

  // ── Layout A: inline media present ─────────────────────────────
  // Two-column magazine. Left column owns the editorial framing
  // (eyebrow + h2) plus ALL the merchant's prose text. Right column
  // owns the merchant's images stacked vertically, alternating
  // left/right within the column so consecutive images don't pile
  // up on one side — image 1 leans left, image 2 leans right,
  // image 3 leans left, and so on.
  if (hasInlineMedia) {
    return (
      <section className="pk-pdesc pk-split pk-split--left">
        <div className="pk-split__inner pk-pdesc__with-media">
          <div className="pk-split__col-text pk-pdesc__text-col">
            <p className="pk-split__eyebrow">{eyebrow}</p>
            <h2 className="pk-split__headline pk-pdesc__heading-inline">
              {productType || ''}
            </h2>
            <div
              className="pk-pdesc__body"
              dangerouslySetInnerHTML={{__html: textOnly}}
            />
          </div>
          <div className="pk-split__col-visual pk-pdesc__media-col">
            <div className="pk-pdesc__image-stack">
              {imagesOnly.map((img, i) => (
                <div
                  key={i}
                  className={`pk-pdesc__image-item pk-pdesc__image-item--${i % 2 === 0 ? 'left' : 'right'}`}
                  dangerouslySetInnerHTML={{__html: img}}
                />
              ))}
            </div>
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
