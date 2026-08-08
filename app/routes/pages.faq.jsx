import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {puchicaMeta} from '~/lib/seo';
import StarGlyph from '~/components/StarGlyph';
import {useT} from '~/lib/t';
import {useParams} from 'react-router';
import {STOREFRONT_CONTAINMENT_ACTIVE} from '~/lib/launch-catalog';

export const meta = ({params}) =>
  puchicaMeta({
    title: STOREFRONT_CONTAINMENT_ACTIVE
      ? 'Storefront questions – Puchica'
      : 'Frequently Asked Questions – Puchica',
    description: STOREFRONT_CONTAINMENT_ACTIVE
      ? 'Answers about Puchica’s paused catalog, product review process, and support contact.'
      : 'Answers about Puchica products, orders, shipping, returns, and accounts.',
    pathname: '/pages/faq',
    langKey: params?.locale,
  });

export async function loader() {
  return {};
}

export default function FaqPage() {
  const t = useT();

  if (STOREFRONT_CONTAINMENT_ACTIVE) {
    return <ContainmentFaq />;
  }

  // FAQ groups — each category is a section with a heading + a list of
  // accordion items. Questions and answers come from the dictionary so
  // all four locales stay in sync.
  const groups = [
    {
      key: 'orders',
      heading: t('faq_cat_orders'),
      items: [
        {q: t('faq_orders_1_q'), a: t('faq_orders_1_a')},
        {q: t('faq_orders_2_q'), a: t('faq_orders_2_a')},
        {q: t('faq_orders_3_q'), a: t('faq_orders_3_a')},
        {q: t('faq_orders_4_q'), a: t('faq_orders_4_a')},
      ],
    },
    {
      key: 'returns',
      heading: t('faq_cat_returns'),
      items: [
        {q: t('faq_returns_1_q'), a: t('faq_returns_1_a')},
        {q: t('faq_returns_2_q'), a: t('faq_returns_2_a')},
        {q: t('faq_returns_3_q'), a: t('faq_returns_3_a')},
      ],
    },
    {
      key: 'products',
      heading: t('faq_cat_products'),
      items: [
        {q: t('faq_products_1_q'), a: t('faq_products_1_a')},
        {q: t('faq_products_2_q'), a: t('faq_products_2_a')},
        {q: t('faq_products_3_q'), a: t('faq_products_3_a')},
      ],
    },
    {
      key: 'account',
      heading: t('faq_cat_account'),
      items: [
        {q: t('faq_account_1_q'), a: t('faq_account_1_a')},
        {q: t('faq_account_2_q'), a: t('faq_account_2_a')},
      ],
    },
  ];

  return (
    <div className="pk-faq">
      {/* Hero */}
      <section className="pk-faq-hero">
        <div className="pk-faq-hero__glow" aria-hidden="true" />
        <div className="pk-faq-hero__inner">
          <span className="pk-faq-hero__eyebrow">
            <StarGlyph /> {t('faq_hero_eyebrow')}
          </span>
          <h1 className="pk-faq-hero__title">{t('faq_hero_title')}</h1>
          <p className="pk-faq-hero__sub">{t('faq_hero_sub')}</p>
        </div>
      </section>

      {/* Accordion sections */}
      <section className="pk-faq-body" aria-label={t('faq_accordion_aria')}>
        <div className="pk-faq-body__inner">
          {groups.map((group) => (
            <div key={group.key} className="pk-faq-group">
              <h2 className="pk-faq-group__heading">{group.heading}</h2>
              <div className="pk-faq-group__list">
                {group.items.map((item) => (
                  <details key={item.q} className="pk-faq-item">
                    <summary>
                      <span>{item.q}</span>
                      <span className="pk-faq-item__chev" aria-hidden="true">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </span>
                    </summary>
                    <p className="pk-faq-item__a">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Still have questions? CTA band */}
      <section className="pk-faq-cta">
        <div className="pk-faq-cta__inner">
          <span className="pk-faq-cta__eye">
            <StarGlyph /> {t('faq_cta_eyebrow')}
          </span>
          <h2 className="pk-faq-cta__title">{t('faq_cta_title')}</h2>
          <p className="pk-faq-cta__sub">{t('faq_cta_sub')}</p>
          <Link
            to="/pages/contact"
            className="pk-btn pk-btn--primary pk-btn--lg"
          >
            {t('faq_cta_button')}
          </Link>
        </div>
      </section>
    </div>
  );
}

const CONTAINMENT_FAQ_COPY = {
  en: {
    eyebrow: 'Storefront update',
    title: 'Questions while the catalog is paused',
    sub: 'We are keeping the answers short and factual while product and delivery details are reviewed.',
    items: [
      ['Can I place an order right now?', 'No. Product pages, carts, discounts, and checkout entry points are closed while the catalog is being reviewed.'],
      ['Why is the catalog unavailable?', 'We are checking product details, supplier mappings, ordinary costs, shipping routes, and customer-facing claims before products return.'],
      ['How can I get help?', 'Email hello@puchica.ca. Include any relevant order number or product link so we can understand the request.'],
    ],
    contact: 'Contact us',
  },
  fr: {
    eyebrow: 'Mise à jour de la boutique',
    title: 'Questions pendant la pause du catalogue',
    sub: 'Les réponses restent courtes et factuelles pendant la vérification des produits et de la livraison.',
    items: [
      ['Puis-je commander maintenant?', 'Non. Les pages de produits, le panier, les rabais et l’accès au paiement sont fermés pendant la vérification du catalogue.'],
      ['Pourquoi le catalogue est-il indisponible?', 'Nous vérifions les produits, les fournisseurs, les coûts habituels, la livraison et les affirmations présentées aux clients.'],
      ['Comment obtenir de l’aide?', 'Écrivez à hello@puchica.ca. Ajoutez tout numéro de commande ou lien de produit pertinent.'],
    ],
    contact: 'Nous contacter',
  },
  es: {
    eyebrow: 'Actualización de la tienda',
    title: 'Preguntas mientras el catálogo está en pausa',
    sub: 'Mantenemos respuestas breves y objetivas mientras revisamos los productos y la entrega.',
    items: [
      ['¿Puedo hacer un pedido ahora?', 'No. Las páginas de producto, el carrito, los descuentos y el acceso al pago están cerrados durante la revisión.'],
      ['¿Por qué no está disponible el catálogo?', 'Estamos verificando productos, proveedores, costos habituales, rutas de envío y afirmaciones visibles para clientes.'],
      ['¿Cómo puedo pedir ayuda?', 'Escribe a hello@puchica.ca e incluye cualquier número de pedido o enlace de producto relevante.'],
    ],
    contact: 'Contáctanos',
  },
  'pt-br': {
    eyebrow: 'Atualização da loja',
    title: 'Perguntas enquanto o catálogo está pausado',
    sub: 'Mantemos respostas breves e objetivas enquanto revisamos produtos e entrega.',
    items: [
      ['Posso fazer um pedido agora?', 'Não. Páginas de produto, carrinho, descontos e acesso ao pagamento estão fechados durante a revisão.'],
      ['Por que o catálogo está indisponível?', 'Estamos verificando produtos, fornecedores, custos habituais, rotas de envio e afirmações apresentadas aos clientes.'],
      ['Como posso pedir ajuda?', 'Escreva para hello@puchica.ca e inclua qualquer número de pedido ou link de produto relevante.'],
    ],
    contact: 'Fale conosco',
  },
};

function ContainmentFaq() {
  const {locale} = useParams();
  const language = ['fr', 'es', 'pt-br'].includes(locale) ? locale : 'en';
  const copy = CONTAINMENT_FAQ_COPY[language];

  return (
    <div className="pk-faq">
      <section className="pk-faq-hero">
        <div className="pk-faq-hero__inner">
          <span className="pk-faq-hero__eyebrow">{copy.eyebrow}</span>
          <h1 className="pk-faq-hero__title">{copy.title}</h1>
          <p className="pk-faq-hero__sub">{copy.sub}</p>
        </div>
      </section>
      <section className="pk-faq-body" aria-label={copy.title}>
        <div className="pk-faq-body__inner">
          <div className="pk-faq-group__list">
            {copy.items.map(([question, answer]) => (
              <details key={question} className="pk-faq-item">
                <summary>
                  <span>{question}</span>
                  <span className="pk-faq-item__chev" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </summary>
                <p className="pk-faq-item__a">{answer}</p>
              </details>
            ))}
          </div>
          <div className="pk-hold__actions">
            <Link className="pk-hold__button pk-hold__button--primary" to="/pages/contact">
              {copy.contact}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/** @typedef {import('./+types/pages.faq').Route} Route */
