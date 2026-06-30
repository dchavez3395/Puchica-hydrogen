/**
 * Page-header hero used on inner pages (category, all-products, about,
 * search, contact). One component, three visual variants — the inner
 * structure is identical so the type rhythm matches across the site.
 *
 * Variants:
 *   - default      → dark ink background, cream type, ember eyebrow
 *   - 'paper'      → cream / paper background, ink type, ember eyebrow
 *   - 'ink'        → dark ink background, cream type, ember eyebrow
 *                    (same colors as default; reserved as a marker for
 *                    "this page intentionally has no imagery" — e.g. /about)
 *
 * The hero is a confident page header, not a magazine cover: tracked
 * eyebrow, a single left-aligned display title at ~40-56px, the sub
 * below it, and a small count chip. No images, no carousel, no
 * oversized type. Same template on every surface, regardless of
 * whether the page has products or images available.
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
      {eyebrow ? <span className="pk-hero__eyebrow">{eyebrow}</span> : null}
      <h1 className="pk-hero__title">{title}</h1>
      {sub ? <p className="pk-hero__sub">{sub}</p> : null}
      {count ? <span className="pk-hero__count">{count}</span> : null}
      {children}
    </header>
  );
}
