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
 *     image chunk. Chunks are paired: each text chunk is followed
 *     by the image that introduces it, and the pair becomes one
 *     vertical section (text on top, image directly below it). The
 *     image is always UNDER the h2 / paragraph that introduces it.
 *     Trailing text with no image partner (e.g. the final SPECS
 *     section) renders as its own full-width section.
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
  // Walk the chunk sequence and pair each text chunk with the
  // image chunk that follows it. Each pair becomes one vertical
  // section: text on top, image directly below it. The image
  // sits UNDER the h2 / intro paragraph, not beside it.
  //
  //   ┌─────────────────────────────────────────────────────────┐
  //   │ section 0                                              │
  //   │   h2 + intro paragraph                                 │
  //   │   image 1                                              │
  //   ├─────────────────────────────────────────────────────────┤
  //   │ section 1                                              │
  //   │   paragraph 2                                          │
  //   │   image 2                                              │
  //   ├─────────────────────────────────────────────────────────┤
  //   │ section 2                                              │
  //   │   "That's not all" + 8-bullet features list            │
  //   │   image 3                                              │
  //   ├─────────────────────────────────────────────────────────┤
  //   │ section 3 (trailing)                                   │
  //   │   SPECS heading + 12-bullet specs list (full-width)   │
  //   └─────────────────────────────────────────────────────────┘
  //
  // Each section uses the full grid width — text and image
  // stack vertically rather than side-by-side, so the image
  // is always directly under the h2/paragraph that introduces
  // it. No alternating side-rails, no half-empty columns.
  if (hasInlineMedia) {
    // Build sections: walk the chunk sequence and pair each
    // text chunk with the immediately-following image chunk.
    // Trailing text (no image partner) becomes its own full-
    // width section.
    const sections = [];
    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i];
      if (c.kind === 'text') {
        const next = chunks[i + 1];
        if (next && next.kind === 'image') {
          sections.push({text: c, image: next, trailing: false});
          i++; // consumed the image too
        } else {
          sections.push({text: c, image: null, trailing: true});
        }
      } else {
        // Orphan image (no preceding text) — render as its own
        // full-width section.
        sections.push({text: null, image: c, trailing: false});
      }
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
          {sections.map((section, i) => {
            // The first section's text carries the eyebrow + h2
            // above the merchant's prose — every other section
            // renders just the merchant HTML.
            const isFirstText =
              i === 0 && section.text != null;
            const textHtml = isFirstText
              ? headingHtml + section.text.html
              : section.text?.html || '';

            return (
              <ScrollReveal
                key={i}
                as="div"
                variant="up"
                className={`pk-pdesc__row pk-pdesc__row--section ${
                  section.trailing ? 'pk-pdesc__row--full' : ''
                }`}
              >
                {section.text && (
                  <div className="pk-pdesc__content pk-pdesc__content--text">
                    <div
                      className="pk-pdesc__text"
                      dangerouslySetInnerHTML={{__html: textHtml}}
                    />
                  </div>
                )}
                {section.image && (
                  <div className="pk-pdesc__content pk-pdesc__content--image">
                    <div
                      className="pk-pdesc__image"
                      dangerouslySetInnerHTML={{
                        __html: section.image.html,
                      }}
                    />
                  </div>
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
