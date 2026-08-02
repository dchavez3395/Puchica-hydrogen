import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {puchicaMeta} from '~/lib/seo';
import StarGlyph from '~/components/StarGlyph';
import {useT} from '~/lib/t';

export const meta = ({params}) =>
  puchicaMeta({
    title: 'Frequently Asked Questions – Puchica',
    description:
      'Answers about Puchica products, orders, shipping, returns, and accounts.',
    pathname: '/pages/faq',
    langKey: params?.locale,
  });

export async function loader() {
  return {};
}

export default function FaqPage() {
  const t = useT();

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

/** @typedef {import('./+types/pages.faq').Route} Route */
