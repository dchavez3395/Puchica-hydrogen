import {useMemo} from 'react';
import {
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
  // source order. The merchant wraps every inline image in one of
  // a few patterns — `<p><b><img></b></p>`, `<p><span><img></span></p>`,
  // a bare `<p><img></p>`, or occasionally a `<div class="grid_devider">
  // <img></div>`. Each match is a single image chunk, and the prose
  // between matches is a text chunk. This is the building block for
  // Layout A's paired-column render below.
  const chunks = useMemo(() => {
    if (!html) return [];
    // One regex that catches every common inline-image wrapper.
    // Group 1 captures the entire matching block so we can emit it
    // intact. We require the `<img>` to be the only meaningful
    // content inside the wrapper (whitespace between tags is OK).
    const re =
      /<(p|div)[^>]*>(?:\s*<(b|span|strong|em|i|figure|div)[^>]*>)?\s*<img\b[^>]*\/?>\s*(?:<\/(b|span|strong|em|i|figure|div)[^>]*>)?\s*<\/\1>/gi;
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
  // image chunk that follows it. Each pair becomes one section
  // with text on one side and the image on the other — the
  // columns alternate per section so the page reads top-to-bottom
  // like a magazine spread.
  //
  //   ┌─────────────────────────────────────────────────────────┐
  //   │ section 0  (text LEFT, image RIGHT)                     │
  //   │   h2 + intro paragraph  |  image 1                     │
  //   ├─────────────────────────────────────────────────────────┤
  //   │ section 1  (image LEFT, text RIGHT)                     │
  //   │   image 2              |  paragraph 2                  │
  //   ├─────────────────────────────────────────────────────────┤
  //   │ section 2  (text LEFT, image RIGHT)                     │
  //   │   features list        |  image 3                      │
  //   ├─────────────────────────────────────────────────────────┤
  //   │ section 3 (trailing — full width)                       │
  //   │   SPECS heading + 12-bullet specs list                  │
  //   └─────────────────────────────────────────────────────────┘
  //
  // Both columns share the same vertical rhythm and the same inner
  // width cap. On narrow viewports the columns stack.
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

            // Alternate the column order: even sections get text-
            // left / image-right, odd sections get image-left /
            // text-right. This is the magazine zigzag.
            const flipped = i % 2 === 1;

            return (
              <ScrollReveal
                key={i}
                as="div"
                variant="up"
                className={`pk-pdesc__pair ${
                  flipped ? 'pk-pdesc__pair--flip' : ''
                }`}
              >
                {section.text && (
                  <div className="pk-pdesc__col pk-pdesc__col--text">
                    <div
                      className="pk-pdesc__text"
                      dangerouslySetInnerHTML={{__html: textHtml}}
                    />
                  </div>
                )}
                {section.image && (
                  <div className="pk-pdesc__col pk-pdesc__col--image">
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

          {/* Trailing image-only chunks (no preceding text) get
           * their own full-width slot under the last paired row. */}
          {chunks
            .filter((c) => c.kind === 'image')
            .filter((c) =>
              // was this image already consumed by a pair?
              !sections.some((s) => s.image === c),
            )
            .map((orphan, j) => (
              <ScrollReveal
                key={`orphan-${j}`}
                as="div"
                variant="up"
                className="pk-pdesc__pair pk-pdesc__pair--solo"
              >
                <div className="pk-pdesc__col pk-pdesc__col--image">
                  <div
                    className="pk-pdesc__image"
                    dangerouslySetInnerHTML={{__html: orphan.html}}
                  />
                </div>
              </ScrollReveal>
            ))}
        </div>
      </section>
    );
  }

  // ── Layout B: no inline media — vertical magazine stack.
  // Render the same way Layout A does: a header (eyebrow + h2),
  // then a vertical section of head → visual → tail, each at
  // full width. The previous side-by-side 2-column grid left a
  // tall visual column next to a short h5 lead, creating dead
  // space below the heading. Stacking vertically puts the mosaic
  // (or accent) directly under the lead, and the tail under both,
  // giving the editorial description one clean reading rhythm.
  const visual = useMosaic ? (
    <MosaicFromGallery images={galleryImages} />
  ) : (
    <EditorialAccent mark="Puchica" />
  );

  return (
    <section className="pk-split pk-split--left pk-pdesc">
      <ScrollReveal
        as="div"
        className="pk-split__header"
        variant="up"
      >
        {eyebrow ? <p className="pk-split__eyebrow">{eyebrow}</p> : null}
        {productType ? (
          <h2 className="pk-split__headline">{productType}</h2>
        ) : null}
      </ScrollReveal>

      <div className="pk-pdesc__blocks pk-pdesc__blocks--stack">
        {lead ? (
          <ScrollReveal
            as="div"
            variant="up"
            className="pk-pdesc__row"
          >
            <div
              className="pk-pdesc__text"
              dangerouslySetInnerHTML={{__html: lead}}
            />
          </ScrollReveal>
        ) : null}

        {visual ? (
          <ScrollReveal
            as="div"
            variant="up"
            className="pk-pdesc__row"
          >
            {visual}
          </ScrollReveal>
        ) : null}

        {tail ? (
          <ScrollReveal
            as="div"
            variant="up"
            className="pk-pdesc__row"
          >
            <div
              className="pk-pdesc__text"
              dangerouslySetInnerHTML={{__html: tail}}
            />
          </ScrollReveal>
        ) : null}
      </div>
    </section>
  );
}
