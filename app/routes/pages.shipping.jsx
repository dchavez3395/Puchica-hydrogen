import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {puchicaMeta} from '~/lib/seo';
import StarGlyph from '~/components/StarGlyph';
import {useT} from '~/lib/t';

export const meta = ({params}) =>
  puchicaMeta({
    title: 'Shipping & Delivery – Puchica',
    description:
      'Puchica ships worldwide. Free shipping across Canada on orders over $75, with international delivery to 8 regions. Track your order from checkout to your door.',
    pathname: '/pages/shipping',
    langKey: params?.locale,
  });

export async function loader() {
  return {};
}

export default function ShippingPage() {
  const t = useT();

  // Eight coverage regions, cycled through the six brand colors
  // (ember, jade, cobalt, marigold, rosa, violet). Each tile pulls its
  // label from the existing ship_region_* keys and its short tagline
  // from the new ship_region_*_sub keys.
  const regions = [
    {key: 'na', color: 'ember'},
    {key: 'sa', color: 'jade'},
    {key: 'uk', color: 'cobalt'},
    {key: 'eu', color: 'marigold'},
    {key: 'ap', color: 'rosa'},
    {key: 'me', color: 'violet'},
    {key: 'af', color: 'ember'},
    {key: 'oc', color: 'jade'},
  ];

  const rates = [
    {
      flag: t('ship_rates_canada_flag'),
      title: t('ship_rates_canada_title'),
      body: t('ship_rates_canada_body'),
      eta: t('ship_rates_canada_eta'),
      badge: t('ship_rates_canada_badge'),
    },
    {
      flag: t('ship_rates_us_flag'),
      title: t('ship_rates_us_title'),
      body: t('ship_rates_us_body'),
      eta: t('ship_rates_us_eta'),
      badge: t('ship_rates_us_badge'),
    },
    {
      flag: t('ship_rates_intl_flag'),
      title: t('ship_rates_intl_title'),
      body: t('ship_rates_intl_body'),
      eta: t('ship_rates_intl_eta'),
      badge: t('ship_rates_intl_badge'),
    },
  ];

  const howSteps = [
    {n: '01', title: t('ship_how_1_title'), body: t('ship_how_1_body')},
    {n: '02', title: t('ship_how_2_title'), body: t('ship_how_2_body')},
    {n: '03', title: t('ship_how_3_title'), body: t('ship_how_3_body')},
  ];

  return (
    <div className="pk-shipping">
      {/* Hero */}
      <section className="pk-shipping-hero">
        <div className="pk-shipping-hero__glow" aria-hidden="true" />
        <div className="pk-shipping-hero__inner">
          <span className="pk-shipping-hero__eyebrow">
            <StarGlyph /> {t('ship_hero_eyebrow')}
          </span>
          <h1 className="pk-shipping-hero__title">
            {t('ship_hero_title_main')}
            <br />
            <span className="pk-shipping-hero__em">{t('ship_hero_title_em')}</span>
          </h1>
          <p className="pk-shipping-hero__sub">{t('ship_hero_sub')}</p>
          <Link to="/collections/all" className="pk-btn pk-btn--ink pk-btn--lg">
            {t('ship_hero_cta')}
          </Link>
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
              <StarGlyph /> {t('ship_regions_eye')}
            </span>
            <h2 className="pk-shipping-regions__title">
              {t('ship_regions_title')}
            </h2>
            <p className="pk-shipping-regions__sub">{t('ship_regions_sub')}</p>
          </div>
          <div className="pk-shipping-regions__grid">
            {regions.map(({key, color}) => (
              <div
                key={key}
                className={`pk-shipping-regions__tile pk-shipping-regions__tile--${color}`}
              >
                <strong className="pk-shipping-regions__name">
                  {t(`ship_region_${key}`)}
                </strong>
                <span className="pk-shipping-regions__tag">
                  {t(`ship_region_${key}_sub`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping rates */}
      <section className="pk-shipping-rates">
        <div className="pk-shipping-rates__inner">
          <div className="pk-shipping-rates__head">
            <span className="pk-shipping-rates__eye">
              <StarGlyph /> {t('ship_rates_eye')}
            </span>
            <h2 className="pk-shipping-rates__title">{t('ship_rates_title')}</h2>
            <p className="pk-shipping-rates__sub">{t('ship_rates_sub')}</p>
          </div>
          <div className="pk-shipping-rates__grid">
            {rates.map(({flag, title, body, eta, badge}) => (
              <div key={title} className="pk-shipping-rates__card">
                <span className="pk-shipping-rates__flag" aria-hidden="true">
                  {flag}
                </span>
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

      {/* How it works */}
      <section className="pk-shipping-how">
        <div className="pk-shipping-how__inner">
          <div className="pk-shipping-how__head">
            <span className="pk-shipping-how__eye">
              <StarGlyph /> {t('ship_how_eye')}
            </span>
            <h2 className="pk-shipping-how__title">{t('ship_how_title')}</h2>
          </div>
          <div className="pk-shipping-how__steps">
            {howSteps.map(({n, title, body}) => (
              <div key={n} className="pk-shipping-how__step">
                <span className="pk-shipping-how__n">{n}</span>
                <h3 className="pk-shipping-how__step-title">{title}</h3>
                <p className="pk-shipping-how__step-body">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tracking */}
      <section className="pk-shipping-track">
        <div className="pk-shipping-track__inner">
          <div className="pk-shipping-track__copy">
            <span className="pk-shipping-track__eye">
              <StarGlyph /> {t('ship_track_eye')}
            </span>
            <h2 className="pk-shipping-track__title">{t('ship_track_title')}</h2>
            <p className="pk-shipping-track__body">{t('ship_track_body_1')}</p>
            <p className="pk-shipping-track__body">{t('ship_track_body_2')}</p>
            <Link
              to="/pages/contact"
              className="pk-btn pk-btn--ghost pk-btn--lg"
            >
              {t('ship_track_cta')}
            </Link>
          </div>
          <div className="pk-shipping-track__visual" aria-hidden="true">
            <div className="pk-shipping-track__dot" />
            <div className="pk-shipping-track__line" />
            <div className="pk-shipping-track__dot" />
            <div className="pk-shipping-track__line" />
            <div className="pk-shipping-track__dot pk-shipping-track__dot--end" />
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