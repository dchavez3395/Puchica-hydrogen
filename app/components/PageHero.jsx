import StarGlyph from './StarGlyph';

/**
 * Type-only editorial hero used on inner pages (category, all-products,
 * about, search, contact). One component, three visual variants — the
 * inner structure is identical so the type rhythm matches across the
 * site.
 *
 * Variants:
 *   - default      → dark ink background, cream type, lime accent
 *   - 'paper'      → cream / paper background, ink type, ember accent
 *   - 'ink'        → dark ink background, cream type, lime accent (same
 *                    colors as default; reserved as a marker for "this
 *                    page intentionally has no imagery" — e.g. /about)
 *
 * The visual chrome is: a tracked eyebrow with a star glyph and a
 * hairline horizontal rule, an oversized display title right-anchored
 * so it crowds the panel's right edge, the sub indented to match the
 * title's leading edge, and a small count chip below.
 *
 * No images, no scrim, no carousel — the hero relies entirely on type
 * weight, the eyebrow ornament, and the right-anchored title to feel
 * editorial. This means every inner page looks the same regardless of
 * whether the merchant has uploaded anything.
 *
 * @param {{
 *   variant?: 'default' | 'paper' | 'ink';
 *   eyebrow?: React.ReactNode;
 *   title: React.ReactNode;
 *   sub?: React.ReactNode;
 *   count?: React.ReactNode;
 *   children?: React.ReactNode; // optional content (CTA, search form) below the type stack
 * }}
 */
export function PageHero({
  variant = 'default',
  eyebrow,
  title,
  sub,
  count,
  children,
}) {
  const variantClass =
    variant === 'paper' ? 'pk-hero--paper' :
    variant === 'ink' ? 'pk-hero--ink' :
    '';

  return (
    <header className={`pk-hero ${variantClass}`}>
      {eyebrow ? (
        <div className="pk-hero__eyebrow-row">
          <span className="pk-hero__star" aria-hidden="true">
            <StarGlyph size={14} />
          </span>
          <span className="pk-hero__rule" aria-hidden="true" />
          <span className="pk-hero__eyebrow">{eyebrow}</span>
        </div>
      ) : null}
      <h1 className="pk-hero__title">{title}</h1>
      {sub ? <p className="pk-hero__sub">{sub}</p> : null}
      {count ? <span className="pk-hero__count">{count}</span> : null}
      {children}
    </header>
  );
}
