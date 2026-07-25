import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {useT} from '~/lib/t';

const LIFESTYLES = [
  {
    titleKey: 'lifestyle_shop_home_title',
    bodyKey: 'lifestyle_shop_home_body',
    href: '/collections/home-decor',
    image: '/lifestyle/home-refresh.webp',
    alt: 'Sunlit kitchen and dining space with linen and greenery',
  },
  {
    titleKey: 'lifestyle_shop_motion_title',
    bodyKey: 'lifestyle_shop_motion_body',
    href: '/collections/apparel-accessories',
    image: '/lifestyle/everyday-motion.webp',
    alt: 'Neutral everyday essentials arranged in an entryway',
  },
  {
    titleKey: 'lifestyle_shop_family_title',
    bodyKey: 'lifestyle_shop_family_body',
    href: '/collections/toys-games',
    image: '/lifestyle/play-and-family.webp',
    alt: 'Bright play corner with abstract wooden blocks and a soft rug',
  },
];

/** A destination-led discovery block: it broadens browsing without repeating the catalog. */
export function ShopByLifestyle() {
  const t = useT();

  return (
    <section className="pk-section pk-section--lifestyle-shop" aria-label={t('mood_section_aria')}>
      <div className="pk-section__inner">
        <div className="pk-section__head pk-section__head--row">
          <div>
            <span className="pk-eyebrow">{t('lifestyle_shop_eyebrow')}</span>
            <h2 className="pk-section__h">{t('lifestyle_shop_heading')}</h2>
          </div>
          <p className="pk-section__sub">{t('lifestyle_shop_sub')}</p>
        </div>
        <ul className="pk-lifestyle-shop__grid">
          {LIFESTYLES.map((lifestyle) => (
            <li key={lifestyle.href}>
              <Link to={lifestyle.href} prefetch="intent" className="pk-lifestyle-shop__card">
                <img src={lifestyle.image} alt={lifestyle.alt} width="1264" height="848" loading="lazy" />
                <span className="pk-lifestyle-shop__scrim" aria-hidden="true" />
                <span className="pk-lifestyle-shop__copy">
                  <span className="pk-lifestyle-shop__title">{t(lifestyle.titleKey)}</span>
                  <span className="pk-lifestyle-shop__body">{t(lifestyle.bodyKey)}</span>
                  <span className="pk-lifestyle-shop__link">{t('lifestyle_shop_cta')}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
