import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {useT} from '~/lib/t';
import StarGlyph from '~/components/StarGlyph';
import {ScrollReveal} from '~/components/ScrollReveal';
import {TiltCard} from '~/components/TiltCard';

/**
 * ForYouShowcase — 1 large + 4 small magazine grid for the "for-you"
 * tagged products (AI-styled lifestyle shots). Never backfills with
 * untagged products: if fewer than 5 are available, renders fewer cards.
 *
 * @param {Object} props
 * @param {Array} props.products
 */
export function ForYouShowcase({products = []}) {
  const t = useT();
  const items = products.slice(0, 5);
  if (!items.length) return null;

  const [hero, ...rest] = items;

  return (
    <ScrollReveal variant="up">
      <section className="pk-foryou" aria-label={t('foryou_section_aria')}>
        <div className="pk-inner pk-foryou__head">
          <div>
            <p className="pk-foryou__eye"><StarGlyph /> {t('foryou_eyebrow')}</p>
            <h2 className="pk-foryou__title">{t('foryou_title')}</h2>
            <p className="pk-foryou__sub">{t('foryou_sub')}</p>
          </div>
          <Link to="/collections/for-you" className="pk-foryou__cta">
            {t('foryou_cta')} →
          </Link>
        </div>

        <div className="pk-foryou__grid pk-inner">
          <TiltCard className="pk-foryou__hero-wrap" maxTilt={4}>
            <Link to={`/products/${hero.handle}`} className="pk-foryou__hero" aria-label={hero.title}>
              {hero.featuredImage && (
                <Image data={hero.featuredImage} aspectRatio="4/5" sizes="(min-width: 900px) 560px, 100vw" loading="eager" />
              )}
              <div className="pk-foryou__hero-body">
                <p className="pk-foryou__name">{hero.title}</p>
                <div className="pk-foryou__price"><Money data={hero.priceRange.minVariantPrice} /></div>
              </div>
            </Link>
          </TiltCard>

          <div className="pk-foryou__rest">
            {rest.map((p) => (
              <TiltCard key={p.id} className="pk-foryou__small-wrap" maxTilt={4}>
                <Link to={`/products/${p.handle}`} className="pk-foryou__small" aria-label={p.title}>
                  {p.featuredImage && (
                    <Image data={p.featuredImage} aspectRatio="1/1" sizes="220px" loading="lazy" />
                  )}
                  <div className="pk-foryou__small-body">
                    <p className="pk-foryou__name">{p.title}</p>
                    <div className="pk-foryou__price"><Money data={p.priceRange.minVariantPrice} /></div>
                  </div>
                </Link>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
