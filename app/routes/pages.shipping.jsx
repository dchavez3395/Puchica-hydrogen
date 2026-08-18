import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {puchicaMeta} from '~/lib/seo';
import {utilityMetaCopy} from '~/lib/utility-meta';
import StarGlyph from '~/components/StarGlyph';
import {IconBag, IconPackage, IconTruck} from '~/components/Icons';
import {useT} from '~/lib/t';
import {useParams, useRouteLoaderData} from 'react-router';
import {STOREFRONT_CONTAINMENT_ACTIVE} from '~/lib/launch-catalog';

export const meta = ({params}) => {
  const copy = utilityMetaCopy(params?.locale).shipping;
  return puchicaMeta({
    title: STOREFRONT_CONTAINMENT_ACTIVE
      ? 'Shipping review – Puchica'
      : copy.title,
    description: STOREFRONT_CONTAINMENT_ACTIVE
      ? 'Puchica is verifying product-specific shipping and delivery details before the catalog returns.'
      : copy.description,
    pathname: '/pages/shipping',
    langKey: params?.locale,
  });
};

export async function loader() {
  return {};
}

export default function ShippingPage() {
  const t = useT();
  const root = useRouteLoaderData('root');

  if (STOREFRONT_CONTAINMENT_ACTIVE) {
    return <ContainmentShipping />;
  }

  // Only present markets Shopify actually publishes to this storefront.
  // Delivery remains cart-and-address specific even inside an available market.
  const regions = (root?.selectedLocale?.availableMarkets || [])
    .filter((market) => market.country === 'CA' || market.country === 'US')
    .map((market) => ({
      name: `${t(`locale_market_${market.country.toLowerCase()}`)} · ${market.currency}`,
      detail: `${market.currency} · ${t('ship_check_destination_eta')}`,
      color: market.country === 'CA' ? 'ember' : 'jade',
    }));

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
    {
      Icon: IconPackage,
      title: t('ship_check_duties_title'),
      body: t('ship_check_duties_body'),
      eta: t('ship_check_duties_eta'),
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
              {t('ship_jump')} <span aria-hidden="true">↓</span>
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
              {regions.length > 1
                ? t('ship_launch_regions_title')
                : t('ship_launch_regions_eye')}
            </h2>
            <p className="pk-shipping-regions__sub">
              {regions.length > 1
                ? t('ship_launch_regions_sub')
                : t('ship_launch_rates_sub')}
            </p>
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

const CONTAINMENT_SHIPPING_COPY = {
  en: {
    eyebrow: 'Shipping review',
    title: 'Delivery details are being checked product by product.',
    body: 'Shopping is paused while we verify supplier routes, shipping costs, delivery estimates, and destination availability for the catalog.',
    note: 'We will publish delivery information only after it matches the product and destination. No delivery promise is being made while the catalog is paused.',
    contact: 'Contact us',
    policies: 'Read our policies',
  },
  fr: {
    eyebrow: 'Vérification de la livraison',
    title: 'Les détails de livraison sont vérifiés produit par produit.',
    body: 'Les achats sont suspendus pendant que nous vérifions les fournisseurs, les coûts, les délais et les destinations disponibles.',
    note: 'Les renseignements seront publiés seulement lorsqu’ils correspondront au produit et à la destination. Aucune promesse de livraison n’est faite pendant cette pause.',
    contact: 'Nous contacter',
    policies: 'Lire nos politiques',
  },
  es: {
    eyebrow: 'Revisión de envíos',
    title: 'Estamos comprobando la entrega producto por producto.',
    body: 'Las compras están en pausa mientras verificamos proveedores, costos de envío, plazos y disponibilidad por destino.',
    note: 'Publicaremos la información solo cuando coincida con el producto y el destino. No prometemos una entrega mientras el catálogo esté en pausa.',
    contact: 'Contáctanos',
    policies: 'Lee nuestras políticas',
  },
  'pt-br': {
    eyebrow: 'Revisão de envio',
    title: 'Estamos verificando a entrega produto por produto.',
    body: 'As compras estão pausadas enquanto verificamos fornecedores, custos de envio, prazos e disponibilidade por destino.',
    note: 'As informações serão publicadas apenas quando corresponderem ao produto e ao destino. Nenhuma entrega é prometida enquanto o catálogo estiver pausado.',
    contact: 'Fale conosco',
    policies: 'Leia nossas políticas',
  },
};

function ContainmentShipping() {
  const {locale} = useParams();
  const language = ['fr', 'es', 'pt-br'].includes(locale) ? locale : 'en';
  const copy = CONTAINMENT_SHIPPING_COPY[language];

  return (
    <div className="pk-hold">
      <section className="pk-hold__hero" aria-labelledby="shipping-hold-title">
        <div className="pk-hold__hero-copy">
          <p className="pk-hold__eyebrow">{copy.eyebrow}</p>
          <h1 id="shipping-hold-title">{copy.title}</h1>
          <p className="pk-hold__lead">{copy.body}</p>
          <p className="pk-hold__focus">{copy.note}</p>
          <div className="pk-hold__actions">
            <Link className="pk-hold__button pk-hold__button--primary" to="/pages/contact">
              {copy.contact}
            </Link>
            <Link className="pk-hold__button pk-hold__button--secondary" to="/policies">
              {copy.policies}
            </Link>
          </div>
        </div>
        <div className="pk-hold__art" aria-hidden="true">
          <span className="pk-hold__art-label">Puchica</span>
          <span className="pk-hold__shape pk-hold__shape--one" />
          <span className="pk-hold__shape pk-hold__shape--two" />
          <span className="pk-hold__shape pk-hold__shape--three" />
        </div>
      </section>
    </div>
  );
}

/** @typedef {import('./+types/pages.shipping').Route} Route */
