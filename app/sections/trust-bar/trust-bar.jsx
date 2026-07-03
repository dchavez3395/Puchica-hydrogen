import {useT} from '~/lib/t';
import {IconTruck, IconReturn, IconHome} from '~/components/Icons';

/**
 * 3-column trust strip. Each item is icon + heading + caption.
 * Defaults: free shipping / 30-day returns / curated in Toronto.
 *
 * Pure presentational; no GraphQL, no settings. Lives in
 * `app/sections/` so the merchant can later move it into the
 * theme editor without rewriting the component.
 */
export function TrustBar() {
  const t = useT();
  const items = [
    {
      icon: <IconTruck size={22} aria-hidden="true" />,
      heading: t('trust_bar_shipping_h'),
      sub: t('trust_bar_shipping_sub'),
    },
    {
      icon: <IconReturn size={22} aria-hidden="true" />,
      heading: t('trust_bar_returns_h'),
      sub: t('trust_bar_returns_sub'),
    },
    {
      icon: <IconHome size={22} aria-hidden="true" />,
      heading: t('trust_bar_curated_h'),
      sub: t('trust_bar_curated_sub'),
    },
  ];

  return (
    <section
      className="pk-section pk-section--trust"
      aria-label={t('trust_bar_aria')}
    >
      <div className="pk-section__inner">
        <ul className="pk-trust">
          {items.map((it) => (
            <li className="pk-trust__item" key={it.heading}>
              <span className="pk-trust__icon" aria-hidden="true">
                {it.icon}
              </span>
              <h3 className="pk-trust__h">{it.heading}</h3>
              <p className="pk-trust__sub">{it.sub}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
