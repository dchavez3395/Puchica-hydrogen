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
 *     image chunk. Each chunk gets its OWN row, sitting on one half
 *     of the row (left or right). Consecutive rows alternate which
 *     side carries the content (text-left → image-right → text-left
 *     → …), and the opposite half is intentional whitespace — the
 *     magazine rhythm depends on it. A trailing text chunk with no
 *     image partner (e.g. the final SPECS section) spans the full
 *     width.
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
  // Each chunk renders as its own row. Text chunks sit on one half
  // of the row (column 1 left, or column 2 right), image chunks sit
  // on the other half, alternating by source order:
  //
  //   chunk 0 (text)  → row 0, left  (right is intentional whitespace)
  //   chunk 1 (image) → row 1, right (left  is intentional whitespace)
  //   chunk 2 (text)  → row 2, left  (right is intentional whitespace)
  //   chunk 3 (image) → row 3, right (left  is intentional whitespace)
  //   …
  //
  // The opposite half is empty whitespace — the magazine rhythm
  // depends on it. We deliberately do NOT pair text and image in
  // the same row: when text and image share a row, the empty half
  // vanishes and the spread loses its breathing room.
  //
  // A trailing text chunk with no image partner (e.g. the final
  // SPECS list after the last image) breaks the alternating
  // pattern and renders full-width so the spec list has room to
  // breathe.
  if (hasInlineMedia) {
    // Split into "alternating" chunks (which render single-side
    // per row) and "trailing" content (which renders full-width).
    //
    // The standard pattern is text/image/text/image/text/image/…
    // alternating. We walk the chunks and accumulate the leading
    // alternating run. Then:
    //   • If the final chunk is a text chunk with no image
    //     following it (e.g. SPECS list after the last product
    //     image), pull it out as trailing so the spec list has
    //     room to breathe at full width.
    //   • If the pattern itself breaks (e.g. image-image or text-
    //     text), everything after the break is trailing.
    const altChunks = [];
    let trailing = null;
    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i];
      const expected = i % 2 === 0 ? 'text' : 'image';
      if (c.kind === expected) {
        altChunks.push(c);
      } else {
        // Pattern breaks — everything from here on is trailing.
        const rest = chunks.slice(i);
        if (rest[0].kind === 'image') {
          altChunks.push(rest[0]);
          trailing = rest.slice(1);
        } else {
          trailing = rest;
        }
        break;
      }
    }

    // If the alternating run ends on a text chunk with no image
    // partner (the common case — merchant body ends with the
    // SPECS list after the last image), pull the trailing text
    // out into the full-width slot so it doesn't sit alone on a
    // half-row.
    if (
      !trailing &&
      altChunks.length > 0 &&
      altChunks[altChunks.length - 1].kind === 'text' &&
      (altChunks.length === 1 ||
        altChunks[altChunks.length - 2].kind === 'image')
    ) {
      trailing = [altChunks.pop()];
    }

    // The eyebrow + h2 ride along at the top of the first text
    // chunk so the headline belongs to the article instead of
    // floating above it (which read as dead space).
    const headingHtml =
      (eyebrow ? `<p class="pk-split__eyebrow">${eyebrow}</p>` : '') +
      (productType
        ? `<h2 class="pk-split__headline pk-pdesc__heading-inline">${productType}</h2>`
        : '');

    return (
      <section className="pk-pdesc pk-pdesc--zigzag">
        <div className="pk-pdesc__blocks">
          {altChunks.map((chunk, i) => {
            // Each chunk sits on one side: text on left, image on
            // right, alternating. i=0 (text) → left, i=1 (image) →
            // right, i=2 (text) → left, …
            const side = i % 2 === 0 ? 'left' : 'right';
            const isText = chunk.kind === 'text';

            // The first chunk carries the eyebrow + h2 above its
            // content — subsequent chunks render just the merchant
            // HTML.
            const html =
              i === 0 && isText
                ? headingHtml + chunk.html
                : chunk.html;

            // Reveal direction: text slides in from its side
            // (right→left when text is on the left), image slides
            // in from its side (left→right when image is on the
            // right).
            const revealVariant =
              side === 'left' ? 'right' : 'left';

            return (
              <ScrollReveal
                key={i}
                as="div"
                variant={revealVariant}
                className={`pk-pdesc__row pk-pdesc__row--single pk-pdesc__row--${side} pk-pdesc__row--${chunk.kind}`}
              >
                <div
                  className={`pk-pdesc__content pk-pdesc__content--${chunk.kind}`}
                >
                  <div
                    className={
                      isText ? 'pk-pdesc__text' : 'pk-pdesc__image'
                    }
                    dangerouslySetInnerHTML={{__html: html}}
                  />
                </div>
              </ScrollReveal>
            );
          })}

          {/* Trailing text without an image partner (e.g. SPECS
           * list after the last image) renders full-width so it
           * doesn't sit alone on a half-row. */}
          {trailing && trailing.length > 0 && (
            <ScrollReveal
              as="div"
              variant="up"
              className="pk-pdesc__row pk-pdesc__row--full pk-pdesc__row--text"
            >
              {trailing.map((chunk, i) => (
                <div
                  key={i}
                  className={`pk-pdesc__content pk-pdesc__content--${chunk.kind}`}
                >
                  <div
                    className={
                      chunk.kind === 'text'
                        ? 'pk-pdesc__text'
                        : 'pk-pdesc__image'
                    }
                    dangerouslySetInnerHTML={{__html: chunk.html}}
                  />
                </div>
              ))}
            </ScrollReveal>
          )}
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
