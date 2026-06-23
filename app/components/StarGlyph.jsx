/**
 * StarGlyph -- small inline SVG star used in place of decorative
 * unicode stars (U+2726 BLACK FOUR POINTED STAR, U+2605 BLACK STAR).
 *
 * Per Phase 2 design spec: "Decorative characters in copy. The U+2726
 * BLACK FOUR POINTED STAR is in the unicode emoji/misc-symbols range and
 * fails the emoji sweep. The eyebrow characters used in the marquee,
 * nav, and section eyebrows all need to be replaced with a small inline
 * StarGlyph SVG component, or with simple text labels."
 *
 * Defaults to the four-pointed variant. For a five-point star
 * pass variant="five".
 *
 * Usage:
 *   <StarGlyph />
 *   <StarGlyph size={14} />
 *   <StarGlyph variant="five" />
 *   <span className="pk-mood__eye"><StarGlyph /> Discover</span>
 */

function StarFourPoint({size}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M8 0.5 L9.6 6.4 L15.5 8 L9.6 9.6 L8 15.5 L6.4 9.6 L0.5 8 L6.4 6.4 Z" />
    </svg>
  );
}

function StarFivePoint({size}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M8 1.5 L9.9 5.9 L14.7 6.2 L11 9.4 L12.2 14.1 L8 11.6 L3.8 14.1 L5 9.4 L1.3 6.2 L6.1 5.9 Z" />
    </svg>
  );
}

export default function StarGlyph({
  variant = 'four',
  size = '0.9em',
  className = 'pk-star-glyph',
  style,
  ...rest
}) {
  const numericSize = typeof size === 'number' ? size : null;
  const Comp = variant === 'five' ? StarFivePoint : StarFourPoint;
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        verticalAlign: '-0.15em',
        marginRight: '0.35em',
        lineHeight: 1,
        ...style,
      }}
      {...rest}
    >
      <Comp size={numericSize ?? 16} />
    </span>
  );
}
