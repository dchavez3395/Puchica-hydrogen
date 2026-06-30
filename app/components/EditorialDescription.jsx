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
 *     image chunk. Chunks are then paired into rows: each row holds
 *     one text chunk and one image chunk side-by-side in a 50/50
 *     grid, and consecutive rows alternate which side carries the
 *     text (text-left|image-right → image-left|text-right → …).
 *     A trailing text chunk with no image partner (e.g. the final
 *     SPECS section) spans the full width.
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
  // Paired rows. Walk the chunk sequence once and pair each text
  // chunk with the immediately-following image chunk into a single
  // 50/50 row. Consecutive rows alternate which side carries the
  // text: row 0 = text-left / image-right, row 1 = image-left /
  // text-right, row 2 = text-left / image-right, … If a text chunk
  // has no image partner (e.g. the final SPECS list trailing after
  // the last image), it spans the full row width so no content is
  // stranded on its own half. No empty whitespace columns.
  if (hasInlineMedia) {
    // Build the row list: each row is either {text, image} (paired)
    // or {text, image: null} (full-width trailing text).
    const rows = [];
    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i];
      if (c.kind === 'text') {
        const next = chunks[i + 1];
        if (next && next.kind === 'image') {
          rows.push({text: c, image: next});
          i++; // consumed the image too
        } else {
          rows.push({text: c, image: null});
        }
      } else {
        // Orphan image (no preceding text) — render as full-width
        // image row so it isn't dropped.
        rows.push({text: null, image: c});
      }
    }

    // The h2 + eyebrow used to live in a separate header band
    // above all rows. That read as "dead space" and broke the
    // rhythm — the headline should belong to the article itself,
    // not float above it. Inline both into the first text chunk
    // so they sit INSIDE the first row's text column.
    const headingHtml =
      (eyebrow ? `<p class="pk-split__eyebrow">${eyebrow}</p>` : '') +
      (productType
        ? `<h2 class="pk-split__headline pk-pdesc__heading-inline">${productType}</h2>`
        : '');

    return (
      <section className="pk-pdesc pk-pdesc--zigzag">
        <div className="pk-pdesc__blocks">
          {rows.map((row, i) => {
            const side = i % 2 === 0 ? 'left' : 'right';
            // Paired rows slide in from the text side; full-width
            // tail rows slide up from below.
            const revealVariant =
              row.image == null
                ? 'up'
                : side === 'left'
                ? 'right'
                : 'left';

            // The first paired row carries the eyebrow + h2 above
            // its text — every subsequent row renders just the
            // merchant's prose.
            const isFirstPaired = i === 0 && row.image != null;
            const textHtml =
              (isFirstPaired ? headingHtml : '') + (row.text?.html || '');

            // Full-width row: either text-only tail or orphan image.
            if (row.image == null) {
              const isText = row.text != null;
              return (
                <ScrollReveal
                  key={i}
                  as="div"
                  variant="up"
                  className={`pk-pdesc__row pk-pdesc__row--full pk-pdesc__row--${isText ? 'text' : 'image'}`}
                >
                  {isText ? (
                    <div
                      className="pk-pdesc__text"
                      dangerouslySetInnerHTML={{__html: textHtml}}
                    />
                  ) : (
                    <div
                      className="pk-pdesc__image"
                      dangerouslySetInnerHTML={{__html: row.image?.html || ''}}
                    />
                  )}
                </ScrollReveal>
              );
            }

            // Paired row: text + image side-by-side. `side` decides
            // which column carries the text.
            return (
              <ScrollReveal
                key={i}
                as="div"
                variant={revealVariant}
                className={`pk-pdesc__row pk-pdesc__row--paired pk-pdesc__row--${side}`}
              >
                <div className="pk-pdesc__row-text">
                  <div
                    className="pk-pdesc__text"
                    dangerouslySetInnerHTML={{__html: textHtml}}
                  />
                </div>
                <div className="pk-pdesc__row-image">
                  <div
                    className="pk-pdesc__image"
                    dangerouslySetInnerHTML={{__html: row.image.html}}
                  />
                </div>
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
