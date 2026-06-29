import {useMemo} from 'react';
import {ScrollReveal} from './ScrollReveal';

/**
 * SplitSection — generalized full-bleed two-column layout for the PDP.
 *
 * Extracted from EditorialDescription so adjacent sections can render as
 * text+image rows that alternate direction (text-left/image-right,
 * text-right/image-left). The grid lives here; the editorial block
 * delegates to it. Each section owns its right-column visual (image,
 * mosaic, brand mark, or arbitrary JSX) so we never duplicate layout.
 *
 * Always full-bleed: the section uses the same viewport-width breakout
 * trick as `.pk-pdesc` (margin-left/right: calc(50% - 50vw)). Sits
 * naturally between major PDP sections; collapses to a single column
 * on narrow viewports with the visual stacked above the text.
 *
 * @param {Object} props
 * @param {'left' | 'right'} [props.align='left']
 *   Which side carries the text. 'left' = text on the left, visual on
 *   the right (default; matches the original editorial description).
 *   'right' = flipped; the visual moves to the left.
 * @param {string} [props.eyebrow]
 *   Small uppercase label above the heading (e.g. "About this product").
 * @param {string} [props.heading]
 *   Display-size heading. If absent, eyebrow + children stand alone.
 * @param {React.ReactNode} [props.children]
 *   Text-column body content (paragraphs, lists, custom JSX).
 * @param {React.ReactNode} [props.visual]
 *   Right-column content. Use <MosaicFromGallery> for a 3-tile mosaic,
 *   a single <img>, an <EditorialAccent> brand-mark column, or any
 *   custom JSX.
 * @param {'default' | 'inverse'} [props.tone='default']
 *   Background treatment. 'default' sits on the page cream;
 *   'inverse' sits on a darker warm-black surface for rhythm.
 * @param {string} [props.className]
 *   Extra class on the section root.
 * @param {string} [props.as='section']
 *   Override the section element type.
 * @param {number} [props.revealDelay=0]
 *   ms delay applied to the ScrollReveal.
 */
export function SplitSection({
  align = 'left',
  eyebrow,
  heading,
  children,
  visual,
  tone = 'default',
  className = '',
  as: Tag = 'section',
  revealDelay = 0,
}) {
  if (!visual && !children && !heading && !eyebrow) return null;

  const alignClass = align === 'right' ? 'pk-split--right' : 'pk-split--left';
  const toneClass = tone === 'inverse' ? 'pk-split--inverse' : '';

  return (
    <Tag
      className={`pk-split ${alignClass} ${toneClass} ${className}`.trim()}
    >
      <div className="pk-split__inner">
        <ScrollReveal
          as="div"
          className="pk-split__col-text"
          variant={align === 'right' ? 'right' : 'up'}
          delay={revealDelay}
        >
          {eyebrow ? <p className="pk-split__eyebrow">{eyebrow}</p> : null}
          {heading ? (
            <h2 className="pk-split__headline">{heading}</h2>
          ) : null}
          {children ? (
            <div className="pk-split__body">{children}</div>
          ) : null}
        </ScrollReveal>

        <ScrollReveal
          as="div"
          className="pk-split__col-visual"
          variant={align === 'right' ? 'left' : 'right'}
          delay={revealDelay + 120}
        >
          {visual}
        </ScrollReveal>
      </div>
    </Tag>
  );
}

/**
 * MosaicFromGallery — three-tile image grid for the visual column.
 * Promoted out of EditorialDescription so any SplitSection can use it.
 * Uses images[1..3] (skipping the first which is already the hero) and
 * falls back to fewer tiles if the gallery is short.
 *
 * @param {Object} props
 * @param {Array<{url: string; altText?: string}>} props.images
 * @param {string} [props.title]
 */
export function MosaicFromGallery({images, title}) {
  const tiles = useMemo(() => {
    const rest = (images || []).slice(1, 4);
    return rest;
  }, [images]);

  if (tiles.length === 0) return null;

  return (
    <div className="pk-split__mosaic" aria-hidden={title ? undefined : true}>
      {tiles.map((img, i) => (
        <div
          key={img.url || i}
          className={`pk-split__tile pk-split__tile--${i + 1}`}
        >
          <img
            src={img.url}
            alt={img.altText || title || ''}
            loading="lazy"
            style={{aspectRatio: i === 1 ? '1/1' : '4/5'}}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * SplitHeroImage — single hero image for the visual column.
 * For sections where a second gallery shot is more evocative than a
 * 3-tile mosaic (e.g. a clean product photo on a colored background).
 *
 * @param {Object} props
 * @param {{url: string; altText?: string}} [props.image]
 * @param {string} [props.fallbackAlt]
 */
export function SplitHeroImage({image, fallbackAlt}) {
  if (!image?.url) return null;
  return (
    <div className="pk-split__hero-image">
      <img
        src={image.url}
        alt={image.altText || fallbackAlt || ''}
        loading="lazy"
      />
    </div>
  );
}

/**
 * EditorialAccent — vertical brand-mark column, used when the gallery
 * is too short to render a mosaic. Lifted from EditorialDescription so
 * any SplitSection can fall back to the same treatment.
 *
 * @param {Object} props
 * @param {string} [props.mark='Puchica']
 */
export function EditorialAccent({mark = 'Puchica'}) {
  return (
    <div className="pk-split__accent" aria-hidden>
      <span className="pk-split__brand-mark">{mark}</span>
    </div>
  );
}
