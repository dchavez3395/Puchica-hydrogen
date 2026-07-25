import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {puchicaMeta} from '~/lib/seo';
import StarGlyph from '~/components/StarGlyph';
import {IconBag, IconPackage, IconTruck} from '~/components/Icons';
import {useT} from '~/lib/t';

export const meta = ({params}) =>
  puchicaMeta({
    title: 'Shipping & Delivery – Puchica',
    description:
      'See delivery availability and shipping options for your destination at checkout. Puchica confirms delivery options per order before you pay.',
    pathname: '/pages/shipping',
    langKey: params?.locale,
  });

export async function loader() {
  return {};
}

export default function ShippingPage() {
  const t = useT();

  // These are launch priorities, not an assertion that all destinations or
  // products are currently deliverable. Checkout remains the source of truth.
  const regions = [
    {name: t('ship_market_ca_name'), detail: t('ship_market_ca_detail'), color: 'ember'},
    {name: t('ship_market_us_name'), detail: t('ship_market_us_detail'), color: 'jade'},
    {name: t('ship_market_next_name'), detail: t('ship_market_next_detail'), color: 'cobalt'},
  ];

  const rates = [
    {
      Icon: IconBag,
      title: t('ship_check_destination_title'),
      body: t('ship_check_destination_body'),
      eta: t('ship_check_destination_eta'),
      badge: '',
    },
    {
      Icon: IconPackage,
      title: t('ship_check_items_title'),
      body: t('ship_check_items_body'),
      eta: t('ship_check_items_eta'),
      badge: '',
    },
    {
      Icon: IconTruck,
      title: t('ship_check_tracking_title'),
      body: t('ship_check_tracking_body'),
      eta: t('ship_check_tracking_eta'),
      badge: '',
    },
  ];

  return (
    <div className="pk-shipping">
      {/* Hero */}
      <section className="pk-shipping-hero">
        <div className="pk-shipping-hero__glow" aria-hidden="true" />
        <div className="pk-shipping-hero__art" aria-hidden="true">
          <img
            src="/shipping/shipping-confidence-hero.webp"
            alt=""
            width="1376"
            height="768"
          />
        </div>
        <div className="pk-shipping-hero__inner">
          <span className="pk-shipping-hero__eyebrow">
            <StarGlyph /> {t('ship_hero_eyebrow')}
          </span>
          <h1 className="pk-shipping-hero__title">
            {t('ship_hero_title_main')}
            <br />
            <span className="pk-shipping-hero__em">{t('ship_hero_title_em')}</span>
          </h1>
          <p className="pk-shipping-hero__sub">{t('ship_launch_hero_sub')}</p>
          <div className="pk-shipping-hero__actions">
            <Link to="/collections/all" className="pk-btn pk-btn--paper pk-btn--lg">
            {t('ship_hero_cta')}
            </Link>
            <a href="#delivery-check" className="pk-shipping-hero__jump">
              See how delivery is confirmed <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </section>

      {/* Where we ship — coverage grid */}
      <section
        className="pk-shipping-regions"
        aria-label={t('ship_section_aria')}
      >
        <div className="pk-shipping-regions__inner">
          <div className="pk-shipping-regions__head">
            <span className="pk-shipping-regions__eye">
              <StarGlyph /> {t('ship_launch_regions_eye')}
            </span>
            <h2 className="pk-shipping-regions__title">
              {t('ship_launch_regions_title')}
            </h2>
            <p className="pk-shipping-regions__sub">{t('ship_launch_regions_sub')}</p>
          </div>
          <div className="pk-shipping-regions__grid">
            {regions.map(({name, detail, color}) => (
              <div
                key={name}
                className={`pk-shipping-regions__tile pk-shipping-regions__tile--${color}`}
              >
                <strong className="pk-shipping-regions__name">
                  {name}
                </strong>
                <span className="pk-shipping-regions__tag">
                  {detail}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping rates */}
      <section className="pk-shipping-rates" id="delivery-check">
        <div className="pk-shipping-rates__inner">
          <div className="pk-shipping-rates__head">
            <span className="pk-shipping-rates__eye">
              <StarGlyph /> {t('ship_launch_rates_eye')}
            </span>
            <h2 className="pk-shipping-rates__title">{t('ship_launch_rates_title')}</h2>
            <p className="pk-shipping-rates__sub">{t('ship_launch_rates_sub')}</p>
          </div>
          <div className="pk-shipping-rates__grid">
            {rates.map(({Icon, title, body, eta, badge}) => (
              <div key={title} className="pk-shipping-rates__card">
                <span className="pk-shipping-rates__icon" aria-hidden="true"><Icon size={24} /></span>
                <div className="pk-shipping-rates__card-head">
                  <h3 className="pk-shipping-rates__card-title">{title}</h3>
                  {badge ? (
                    <span className="pk-shipping-rates__badge">{badge}</span>
                  ) : null}
                </div>
                <p className="pk-shipping-rates__card-body">{body}</p>
                <span className="pk-shipping-rates__eta">{eta}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pk-shipping-cta">
        <div className="pk-shipping-cta__inner">
          <h2 className="pk-shipping-cta__title">{t('ship_cta_title')}</h2>
          <p className="pk-shipping-cta__sub">{t('ship_cta_sub')}</p>
          <Link to="/collections/all" className="pk-btn pk-btn--ink pk-btn--lg">
            {t('ship_cta_browse')}
          </Link>
        </div>
      </section>
    </div>
  );
}

/** @typedef {import('./+types/pages.shipping').Route} Route */
