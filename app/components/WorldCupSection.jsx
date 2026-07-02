import {Money} from '@shopify/hydrogen';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import StarGlyph from '~/components/StarGlyph';

/**
 * WorldCupSection — homepage feature for the national soccer jerseys, timed to
 * the World Cup. Pulls jersey products (title contains jersey/maillot) and shows
 * them in a bold, dark, flag-accented grid. Self-contained inline styles (no CSS
 * dependency) + a naturally-responsive auto-fill grid (no fixed rows, so no empty
 * space on mobile). Fail-safe: renders nothing if no products, so it can never
 * break the homepage. Cards use each product's featuredImage — so once the AI
 * lifestyle images are regenerated (see docs/image-batch-runbook.md), this
 * section upgrades automatically.
 *
 * @param {{products?: Array<any>}} props
 */

// Flag-inspired accent per nation, matched from the product title.
const NATIONS = [
  {re: /canad/i, name: 'Canada', dot: '#FF0000'},
  {re: /portugal/i, name: 'Portugal', dot: '#00843D'},
  {re: /argentin/i, name: 'Argentina', dot: '#6CACE4'},
  {re: /bra[sz]il/i, name: 'Brasil', dot: '#FFDF00'},
];
const nationOf = (title = '') => NATIONS.find((n) => n.re.test(title)) || null;
const cleanTitle = (t = '') => t.split('||')[0].trim();

export function WorldCupSection({products}) {
  const list = (products || []).filter((p) => p?.featuredImage?.url).slice(0, 12);
  if (!list.length) return null;

  return (
    <section
      aria-label="World Cup jerseys"
      style={{
        background: '#0E0C08',
        color: '#F4F0E6',
        // Tighter top/bottom on phones so the heading + first row
        // of cards fit above the fold. Hero is 100dvh on mobile,
        // so this section is the user's first scroll target.
        padding: 'clamp(40px, 8vw, 76px) 0',
      }}
    >
      <div style={{maxWidth: 1200, margin: '0 auto', padding: '0 20px'}}>
        <p
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            margin: 0,
            fontSize: 13,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#C6F24E',
            fontWeight: 700,
          }}
        >
          <StarGlyph /> World Cup 2026
        </p>
        <h2
          style={{
            margin: '10px 0 8px',
            fontSize: 'clamp(30px, 6vw, 54px)',
            lineHeight: 1.02,
            fontWeight: 800,
            letterSpacing: '-0.02em',
          }}
        >
          Represent your <span style={{color: '#C6F24E'}}>country.</span>
        </h2>
        <p style={{margin: '0 0 28px', maxWidth: 560, color: '#C9C4B4', fontSize: 16, lineHeight: 1.45}}>
          National jerseys for the whole squad — adults and kids. Free shipping
          across Canada. Wear your colours to every match.
        </p>

        <div
          style={{
            display: 'grid',
            // Smaller min on phones (~150px → 2 cols on 360px viewport)
            // so the heading + first row of cards appear above the
            // fold after scrolling past the 100dvh hero.
            gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(150px, 38vw, 180px), 1fr))',
            gap: 'clamp(12px, 2.5vw, 16px)',
          }}
        >
          {list.map((p) => {
            const nat = nationOf(p.title);
            return (
              <Link
                key={p.id}
                to={`/products/${p.handle}`}
                style={{textDecoration: 'none', color: 'inherit', display: 'block'}}
                aria-label={cleanTitle(p.title)}
              >
                <div
                  style={{
                    position: 'relative',
                    aspectRatio: '4 / 5',
                    borderRadius: 14,
                    overflow: 'hidden',
                    background: '#1C1A12',
                  }}
                >
                  <img
                    src={p.featuredImage.url}
                    alt={p.featuredImage.altText || cleanTitle(p.title)}
                    loading="lazy"
                    style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
                  />
                  {nat && (
                    <span
                      title={nat.name}
                      style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: nat.dot,
                        boxShadow: '0 0 0 2px rgba(0,0,0,0.35)',
                      }}
                    />
                  )}
                </div>
                <p style={{margin: '10px 2px 2px', fontSize: 14, fontWeight: 600, lineHeight: 1.3}}>
                  {cleanTitle(p.title)}
                </p>
                <p style={{margin: '0 2px', fontSize: 14, color: '#C6F24E', fontWeight: 700}}>
                  {p.priceRange?.minVariantPrice ? (
                    <Money data={p.priceRange.minVariantPrice} />
                  ) : null}
                </p>
              </Link>
            );
          })}
        </div>

        <div style={{marginTop: 30}}>
          <Link
            to="/search?q=jersey"
            style={{
              display: 'inline-block',
              padding: '13px 22px',
              borderRadius: 999,
              background: '#C6F24E',
              color: '#14120C',
              fontWeight: 700,
              fontSize: 15,
              textDecoration: 'none',
            }}
          >
            Shop all jerseys →
          </Link>
        </div>
      </div>
    </section>
  );
}
