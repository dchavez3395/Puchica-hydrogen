import {useMemo} from 'react';
import {
  SplitSection,
  MosaicFromGallery,
  EditorialAccent,
} from './SplitSection';
import {ScrollReveal} from './ScrollReveal';

/**
 * EditorialDescription — PDP editorial block.
 *
 * Renders the merchant's descriptionHtml as a magazine spread.
 * Layout depends on whether the merchant's HTML carries inline
 * `<img>` / `<video>` tags:
 *
 *   • With inline media (e.g. Garden Hose Splitter, Giant Teddy Bear):
 *     The body is parsed into a flat sequence of `{kind: 'text'|'image', html}`
 *     chunks — anything between images (paragraphs, lists, headings)
 *     is a text chunk, every `<p><b><img></b></p>` wrapper is an
 *     image chunk. Chunks render as a vertical zigzag: each chunk
 *     takes a full-width row, with its content sitting on alternating
 *     sides — chunk 0 left, chunk 1 right, chunk 2 left, and so on.
 *     The empty opposite half is whitespace, giving the magazine
 *     rhythm without forcing text to wrap beside images.
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
export function EditorialDescription({
  html,
  productType,
  galleryImages = [],
  eyebrow,
}) {
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

  // Walk the merchant body once and emit `{kind, html}` chunks in
  // source order. The merchant wraps every inline image in
  // `<p><b><img></b></p>` — each match is a single image chunk, and
  // the prose between matches is a text chunk. This is the building
  // block for Layout A's zigzag render below.
  const chunks = useMemo(() => {
    if (!html) return [];
    const re =
      /<p[^>]*>\s*<b[^>]*>\s*<img\b[^>]*\/?>\s*<\/b>\s*<\/p>/gi;
    const out = [];
    let last = 0;
    let m;
    while ((m = re.exec(html)) !== null) {
      if (m.index > last) {
        out.push({kind: 'text', html: html.slice(last, m.index)});
      }
      out.push({kind: 'image', html: m[0]});
      last = m.index + m[0].length;
    }
    if (last < html.length) {
      out.push({kind: 'text', html: html.slice(last)});
    }
    return out;
  }, [html]);

  const useMosaic = useMemo(() => {
    return (galleryImages || []).slice(1, 4).length >= 3;
  }, [galleryImages]);

  if (!html) return null;

  const hasInlineMedia = chunks.some((c) => c.kind === 'image');

  // ── Layout A: inline media present ─────────────────────────────
  // Zigzag. Each chunk gets its own full-width row. The row is a
  // two-column grid; the chunk's content sits in column 1 on
  // odd-indexed rows and column 2 on even-indexed rows, so the
  // page reads as: text-left → image-right → text-left → image-
  // right, with the opposite half of each row left as whitespace
  // for breathing room. ScrollReveal slides each row in from its
  // content side so consecutive rows arrive from opposite edges.
  if (hasInlineMedia) {
    return (
      <section className="pk-pdesc pk-pdesc--zigzag">
        <div className="pk-pdesc__header">
          <p className="pk-split__eyebrow">{eyebrow}</p>
          <h2 className="pk-split__headline pk-pdesc__heading-inline">
            {productType || ''}
          </h2>
        </div>
        <div className="pk-pdesc__blocks">
          {chunks.map((chunk, i) => {
            const side = i % 2 === 0 ? 'left' : 'right';
            const revealVariant = side === 'left' ? 'right' : 'left';
            return (
              <ScrollReveal
                key={i}
                as="div"
                variant={revealVariant}
                className={`pk-pdesc__block pk-pdesc__block--${chunk.kind} pk-pdesc__block--${side}`}
              >
                {chunk.kind === 'image' ? (
                  <div
                    className="pk-pdesc__image"
                    dangerouslySetInnerHTML={{__html: chunk.html}}
                  />
                ) : (
                  <div
                    className="pk-pdesc__text"
                    dangerouslySetInnerHTML={{__html: chunk.html}}
                  />
                )}
              </ScrollReveal>
            );
          })}
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
