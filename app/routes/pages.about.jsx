import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {Image} from '@shopify/hydrogen';
import {puchicaMeta} from '~/lib/seo';
import {useT} from '~/lib/t';
import {STOREFRONT_CONTAINMENT_ACTIVE} from '~/lib/launch-catalog';
import {useParams, useRouteLoaderData} from 'react-router';

export const meta = ({params}) =>
  puchicaMeta({
    ...(ABOUT_META[params?.locale || 'en'] || ABOUT_META.en),
    pathname: '/pages/about',
    langKey: params?.locale,
  });

const ABOUT_META = {
  en: {
    title: 'About Puchica | A focused Canadian travel shop',
    description:
      'Meet Puchica, an independent Canadian shop focused on practical travel organization and clear product details.',
  },
  fr: {
    title: 'À propos de Puchica | Une boutique canadienne de voyage',
    description:
      'Découvrez Puchica, une boutique canadienne indépendante axée sur l’organisation pratique des voyages.',
  },
  es: {
    title: 'Sobre Puchica | Una tienda canadiense de viaje',
    description:
      'Conoce Puchica, una tienda canadiense independiente centrada en la organización práctica de viajes.',
  },
  'pt-br': {
    title: 'Sobre a Puchica | Uma loja canadense de viagem',
    description:
      'Conheça a Puchica, uma loja canadense independente focada em organização prática para viagens.',
  },
};

export async function loader() {
  return {};
}

export default function AboutPage() {
  const t = useT();
  const rootData = useRouteLoaderData('root');
  const market = rootData?.selectedLocale?.country || 'CA';
  if (STOREFRONT_CONTAINMENT_ACTIVE) {
    return <ContainmentAbout />;
  }
  const principles = [
    {
      number: '01',
      title: t('about_how_1_title'),
      body: t('about_how_1_body'),
    },
    {
      number: '02',
      title: t('about_how_2_title'),
      body: t('about_how_2_body'),
    },
    {
      number: '03',
      title: t('about_how_3_title'),
      body: t('about_how_3_body'),
    },
  ];
  // Emptied 2026-08-31. All three destination cards pointed at product handles
  // deleted from the catalog on 2026-08-28, so every card was a 404. The
  // section below is guarded on length and simply does not render while this
  // is empty. Repopulate with handles verified to resolve.
  const destinations = [].filter(({markets}) => markets.includes(market));

  return (
    <div className="pk-about-v3">
      <section className="pk-about-v3__hero">
        <div className="pk-about-v3__hero-copy">
          <span className="pk-about-v3__eyebrow">
            {t('about_hero_eyebrow')}
          </span>
          <h1>
            {t('about_hero_title_main')} <em>{t('about_hero_title_em')}</em>
          </h1>
          <p>{t('about_hero_sub')}</p>
          <div className="pk-about-v3__actions">
            <Link
              to="/collections/all"
              className="pk-btn pk-btn--primary pk-btn--lg"
            >
              {t('about_hero_cta')}
            </Link>
            <Link to="/pages/shipping" className="pk-about-v3__text-link">
              {t('footer_shipping_info')} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <figure className="pk-about-v3__hero-figure">
          <Image
            src="/lifestyle/everyday-motion.webp"
            alt={t('about_hero_image_alt')}
            width={1536}
            height={1024}
            sizes="(min-width: 900px) 54vw, 100vw"
            loading="eager"
          />
          <figcaption>{t('about_hero_caption')}</figcaption>
        </figure>
      </section>

      <section className="pk-about-v3__shop">
        <div className="pk-about-v3__shop-head">
          <div className="pk-about-v3__section-heading">
            <span className="pk-about-v3__eyebrow">{t('about_shop_eye')}</span>
            <h2>{t('about_shop_title')}</h2>
          </div>
          <Link to="/collections/all" className="pk-about-v3__text-link">
            {t('about_shop_all')} <span aria-hidden="true">→</span>
          </Link>
        </div>
        {destinations.length ? (
        <ul className="pk-about-v3__shop-grid">
          {destinations.map(({url, label, body}) => (
            <li key={`${url}-${label}`}>
              <Link
                to={url}
                prefetch="intent"
                className="pk-about-v3__shop-card"
              >
                <span className="pk-about-v3__shop-arrow" aria-hidden="true">
                  ↗
                </span>
                <h3>{label}</h3>
                <p>{body}</p>
              </Link>
            </li>
          ))}
        </ul>
        ) : null}
      </section>

      <section className="pk-about-v3__story">
        <div className="pk-about-v3__story-heading">
          <span className="pk-about-v3__eyebrow">{t('about_mission_eye')}</span>
          <h2>{t('about_mission_title')}</h2>
        </div>
        <div className="pk-about-v3__story-copy">
          <p>{t('about_mission_body_1')}</p>
          <p>{t('about_mission_body_2')}</p>
          <p className="pk-about-v3__callout">{t('about_mission_card_text')}</p>
        </div>
      </section>

      <section className="pk-about-v3__standards">
        <div className="pk-about-v3__section-heading">
          <span className="pk-about-v3__eyebrow">{t('about_how_eye')}</span>
          <h2>{t('about_how_title')}</h2>
          <p>{t('about_standards_intro')}</p>
        </div>
        <ol className="pk-about-v3__standards-grid">
          {principles.map(({number, title, body}) => (
            <li key={number} className="pk-about-v3__standard">
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="pk-about-v3__roots">
        <div className="pk-about-v3__roots-art">
          <Image
            src="/about/roots-textile.webp"
            alt={t('about_roots_image_alt')}
            width={768}
            height={960}
            sizes="(min-width: 900px) 42vw, 100vw"
            loading="lazy"
          />
        </div>
        <div className="pk-about-v3__roots-copy">
          <span className="pk-about-v3__eyebrow">
            {t('about_roots_eyebrow')}
          </span>
          <h2>{t('about_roots_heading')}</h2>
          <p>{t('about_roots_body')}</p>
          <p className="pk-about-v3__signature">{t('about_roots_signature')}</p>
        </div>
      </section>

      <section className="pk-about-v3__now">
        <div className="pk-about-v3__now-copy">
          <span className="pk-about-v3__eyebrow">{t('about_now_eye')}</span>
          <h2>{t('about_now_title')}</h2>
          <p>{t('about_now_body')}</p>
          <a href="mailto:hello@puchica.ca">{t('about_now_email')}</a>
        </div>
        <div className="pk-about-v3__delivery-panel">
          <div className="pk-about-v3__delivery-head">
            <span aria-hidden="true" />
            <strong>{t('about_delivery_panel_title')}</strong>
          </div>
          <ol className="pk-about-v3__delivery-steps">
            {[1, 2, 3].map((step) => (
              <li key={step}>
                <span aria-hidden="true">{step}</span>
                <div>
                  <strong>{t(`about_delivery_step_${step}_title`)}</strong>
                  <p>{t(`about_delivery_step_${step}_body`)}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="pk-about-v3__delivery-note">
            <span aria-hidden="true">✓</span>
            {t('about_delivery_note')}
          </p>
        </div>
      </section>
    </div>
  );
}

const CONTAINMENT_ABOUT_COPY = {
  en: {
    eyebrow: 'About Puchica',
    title: 'We are building a shop that earns your trust.',
    body: 'Puchica is an independent Canadian shop building a focused catalog of practical products for everyday life.',
    standard:
      'Before a product is published, we review its supplier route, price, delivery information, product details, and customer-facing claims.',
    contact: 'Contact us',
    policies: 'Read our policies',
    artNote: 'Useful things deserve a clear reason to be here.',
  },
  fr: {
    eyebrow: 'À propos de Puchica',
    title: 'Nous bâtissons une boutique digne de votre confiance.',
    body: 'Puchica est une boutique canadienne indépendante qui prépare un catalogue ciblé de produits pratiques pour la vie quotidienne.',
    standard:
      'Avant de publier un produit, nous vérifions son fournisseur, son prix, la livraison, ses détails et les affirmations présentées aux clients.',
    contact: 'Nous contacter',
    policies: 'Lire nos politiques',
    artNote: 'Les objets utiles méritent une vraie raison d’être ici.',
  },
  es: {
    eyebrow: 'Acerca de Puchica',
    title: 'Estamos creando una tienda que se gane tu confianza.',
    body: 'Puchica es una tienda canadiense independiente que prepara un catálogo enfocado de productos prácticos para la vida diaria.',
    standard:
      'Antes de publicar un producto, revisamos el proveedor, el precio, la entrega, los detalles y las afirmaciones que verá el cliente.',
    contact: 'Contáctanos',
    policies: 'Lee nuestras políticas',
    artNote: 'Las cosas útiles merecen una razón clara para estar aquí.',
  },
  'pt-br': {
    eyebrow: 'Sobre a Puchica',
    title: 'Estamos criando uma loja que mereça sua confiança.',
    body: 'A Puchica é uma loja canadense independente que prepara um catálogo focado de produtos práticos para o dia a dia.',
    standard:
      'Antes de publicar um produto, revisamos fornecedor, preço, entrega, detalhes e afirmações apresentadas aos clientes.',
    contact: 'Fale conosco',
    policies: 'Leia nossas políticas',
    artNote: 'Coisas úteis merecem uma razão clara para estar aqui.',
  },
};

function ContainmentAbout() {
  const {locale} = useParams();
  const language = ['fr', 'es', 'pt-br'].includes(locale) ? locale : 'en';
  const copy = CONTAINMENT_ABOUT_COPY[language] || CONTAINMENT_ABOUT_COPY.en;

  return (
    <div className="pk-hold">
      <section className="pk-hold__hero" aria-labelledby="about-hold-title">
        <div className="pk-hold__hero-copy">
          <p className="pk-hold__eyebrow">{copy.eyebrow}</p>
          <h1 id="about-hold-title">{copy.title}</h1>
          <p className="pk-hold__lead">{copy.body}</p>
          <p className="pk-hold__focus">{copy.standard}</p>
          <div className="pk-hold__actions">
            <Link
              className="pk-hold__button pk-hold__button--primary"
              to="/pages/contact"
            >
              {copy.contact}
            </Link>
            <Link
              className="pk-hold__button pk-hold__button--secondary"
              to="/policies"
            >
              {copy.policies}
            </Link>
          </div>
        </div>
        <div className="pk-hold__art" aria-hidden="true">
          <span className="pk-hold__art-label">Puchica</span>
          <span className="pk-hold__shape pk-hold__shape--one" />
          <span className="pk-hold__shape pk-hold__shape--two" />
          <span className="pk-hold__shape pk-hold__shape--three" />
          <span className="pk-hold__art-note">{copy.artNote}</span>
        </div>
      </section>
    </div>
  );
}

/** @typedef {import('./+types/pages.about').Route} Route */
