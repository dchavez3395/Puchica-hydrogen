import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {ScrollReveal} from '~/components/ScrollReveal';
import {TiltCard} from '~/components/TiltCard';
import {categoryIcon} from '~/components/Icons';

/**
 * CollectionShowcase — alternating left/right layout showing 6 collections
 * on the homepage. Each row: image + title + description + CTA.
 *
 * @param {Object} props
 * @param {Array} props.collections - array of collection objects from Storefront API
 */
export function CollectionShowcase({collections = []}) {
  if (!collections.length) return null;

  return (
    <section className="pk-showcase" aria-label="Collection showcase">
      <div className="pk-inner">
        <ScrollReveal as="h2" className="pk-showcase__heading" variant="up">
          Explore by category
        </ScrollReveal>
        <ScrollReveal as="p" className="pk-showcase__sub" variant="up" delay={100}>
          {collections.length} collections. {Math.round(collections.length / 19 * 100)}% of the catalog covered.
        </ScrollReveal>
      </div>

      <div className="pk-showcase__list">
        {collections.map((collection, i) => (
          <ShowcaseRow
            key={collection.id || i}
            collection={collection}
            index={i}
            reverse={i % 2 === 1}
          />
        ))}
      </div>
    </section>
  );
}

function ShowcaseRow({collection, index, reverse}) {
  const image = collection?.image || collection?.products?.nodes?.[0]?.featuredImage;
  const handle = collection?.handle || '';
  const title = collection?.title || '';

  return (
    <div className={`pk-showcase__row ${reverse ? 'pk-showcase__row--reverse' : ''}`}>
      <ScrollReveal
        className="pk-showcase__media-wrap"
        variant={reverse ? 'right' : 'left'}
        delay={0}
      >
        <TiltCard className="pk-showcase__tilt" maxTilt={6}>
          <Link to={`/collections/${handle}`} prefetch="intent">
            <div className="pk-showcase__media">
              {image ? (
                <Image
                  alt={image.altText || title}
                  aspectRatio="4/3"
                  data={image}
                  sizes="(min-width: 900px) 560px, 100vw"
                />
              ) : (
                <div className="pk-showcase__media-fallback">
                  <span aria-hidden="true">
                    {categoryIcon(title, {size: 80})}
                  </span>
                </div>
              )}
            </div>
          </Link>
        </TiltCard>
      </ScrollReveal>

      <ScrollReveal
        className="pk-showcase__copy"
        variant={reverse ? 'left' : 'right'}
        delay={100}
      >
        <span className="pk-showcase__eyebrow">
          Collection {String(index + 1).padStart(2, '0')}
        </span>
        <h3 className="pk-showcase__title">{title}</h3>
        <p className="pk-showcase__desc">
          Discover our {title.toLowerCase()} selection — handpicked products
          with free shipping over $50.
        </p>
        <Link
          to={`/collections/${handle}`}
          className="pk-btn pk-btn--ghost pk-showcase__cta"
          prefetch="intent"
        >
          Shop {title} →
        </Link>
      </ScrollReveal>
    </div>
  );
}
