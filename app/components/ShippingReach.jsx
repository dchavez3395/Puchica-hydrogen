import {useT} from '~/lib/t';
import StarGlyph from '~/components/StarGlyph';
import {SHIPPING_DESTINATIONS, REGION_KEYS, REGION_ORDER} from '~/lib/shippingDestinations';

/**
 * ShippingReach — visual treatment of the storefront's shipping reach
 * for surfaces other than the homepage map. Two variants:
 *
 * - `variant="cities"` (about page): region grid (one card per region,
 *   each card lists its cities). All 8 regions render — NA / SA / UK /
 *   EU / AF / ME / AP / OC, totaling 60+ cities from
 *   `SHIPPING_DESTINATIONS`.
 * - `variant="compact"` (contact page): region row, one cell per
 *   region with a city count.
 *
 * Both variants group cities by region using REGION_ORDER for stable
 * display order, and read all copy via useT() so they translate with
 * the locale switcher.
 *
 * @param {{variant?: 'cities' | 'compact'}} props
 */
export function ShippingReach({variant = 'cities'}) {
  const t = useT();

  // Group cities by region, preserving REGION_ORDER for stable display.
  const grouped = REGION_ORDER.map((region) => ({
    region,
    cities: SHIPPING_DESTINATIONS.filter((d) => d.region === region),
  })).filter((g) => g.cities.length > 0);

  if (variant === 'compact') {
    return (
      <section className="pk-contact__reach" aria-label={t('ship_section_aria')}>
        <h2 className="pk-contact__section-head">
          <span className="pk-contact__eyebrow">{t('ship_eyebrow')}</span>
          <span className="pk-contact__title">{t('ship_compact_title')}</span>
        </h2>
        <ul className="pk-contact__reach-list">
          {grouped.map(({region, cities}) => (
            <li key={region}>
              <strong>{t(REGION_KEYS[region])}</strong>
              <span>
                {cities.length} {t('ship_cities_label')}
              </span>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  // variant === 'cities' — about page treatment. 8-region grid, each
  // card lists the cities for that region.
  return (
    <section className="pk-about-reach" aria-label={t('ship_section_aria')}>
      <div className="pk-about-reach__inner">
        <span className="pk-about-reach__eye">
          <StarGlyph /> {t('ship_eyebrow')}
        </span>
        <h2 className="pk-about-reach__title">{t('ship_title')}</h2>
        <p className="pk-about-reach__sub">{t('ship_sub')}</p>
        <div className="pk-about-reach__grid">
          {grouped.map(({region, cities}) => (
            <div key={region} className="pk-about-reach__region">
              <h3 className="pk-about-reach__region-name">
                {t(REGION_KEYS[region])}
              </h3>
              <ul className="pk-about-reach__cities">
                {cities.map((c) => (
                  <li key={`${c.city}-${c.country}`}>
                    {c.city}, <span>{c.country}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
