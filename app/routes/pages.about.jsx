import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {Image} from '@shopify/hydrogen';
import {puchicaMeta} from '~/lib/seo';
import StarGlyph from '~/components/StarGlyph';
import {STORE_LOGO_URL} from '~/lib/brand';
import {IconHome, IconSparkles, IconLightbulb, IconLeaf, IconPawPrint, IconGift} from '~/components/Icons';
import {ShippingReach} from '~/components/ShippingReach';
import {useT} from '~/lib/t';

export const meta = ({params}) =>
  puchicaMeta({
    title: 'About Puchica – The good stuff, handpicked.',
    description:
      "We're picky about what makes the catalog. If we wouldn't buy it ourselves, it doesn't go up. 6,000+ products, handpicked with care.",
    pathname: '/pages/about',
    langKey: params?.locale,
  });

export async function loader() {
  return {};
}

export default function AboutPage() {
  const t = useT();

  // Stat tiles + category items are static structure with translated
  // labels — pulling the strings out of JSX so the markup stays compact.
  const stats = [
    {num: t('about_stat_products_num'),  label: t('about_stat_products_label')},
    {num: t('about_stat_quality_num'),   label: t('about_stat_quality_label')},
    {num: t('about_stat_shipping_num'),  label: t('about_stat_shipping_label')},
    {num: t('about_stat_returns_num'),   label: t('about_stat_returns_label')},
  ];

  const howSteps = [
    {n: '01', title: t('about_how_1_title'), body: t('about_how_1_body')},
    {n: '02', title: t('about_how_2_title'), body: t('about_how_2_body')},
    {n: '03', title: t('about_how_3_title'), body: t('about_how_3_body')},
  ];

  const categories = [
    {icon: IconHome,      name: t('about_cat_home_name'),    sub: t('about_cat_home_sub')},
    {icon: IconSparkles,  name: t('about_cat_beauty_name'),  sub: t('about_cat_beauty_sub')},
    {icon: IconLightbulb, name: t('about_cat_tech_name'),    sub: t('about_cat_tech_sub')},
    {icon: IconLeaf,      name: t('about_cat_outdoor_name'), sub: t('about_cat_outdoor_sub')},
    {icon: IconPawPrint,  name: t('about_cat_pet_name'),     sub: t('about_cat_pet_sub')},
    {icon: IconGift,      name: t('about_cat_gift_name'),    sub: t('about_cat_gift_sub')},
  ];

  return (
    <div className="pk-about">
      {/* Hero */}
      <section className="pk-about-hero">
        <div className="pk-about-hero__glow" aria-hidden="true" />
        <div className="pk-about-hero__inner">
          <span className="pk-about-hero__eyebrow"><StarGlyph /> {t('about_hero_eyebrow')}</span>
          <h1 className="pk-about-hero__title">
            {t('about_hero_title_main')}
            <br />
            <span className="pk-about-hero__em">{t('about_hero_title_em')}</span>
          </h1>
          <p className="pk-about-hero__sub">{t('about_hero_sub')}</p>
          <Link to="/collections/all" className="pk-btn pk-btn--spark pk-btn--lg">
            {t('about_hero_cta')}
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <div className="pk-about-stats" aria-label={t('about_stats_aria')}>
        {stats.map(({num, label}) => (
          <div key={label} className="pk-about-stats__item">
            <strong className="pk-about-stats__num">{num}</strong>
            <span className="pk-about-stats__label">{label}</span>
          </div>
        ))}
      </div>

      {/* Mission */}
      <section className="pk-about-mission">
        <div className="pk-about-mission__inner">
          <div className="pk-about-mission__copy">
            <span className="pk-about-mission__eye"><StarGlyph /> {t('about_mission_eye')}</span>
            <h2 className="pk-about-mission__title">{t('about_mission_title')}</h2>
            <p className="pk-about-mission__body">{t('about_mission_body_1')}</p>
            <p className="pk-about-mission__body">{t('about_mission_body_2')}</p>
          </div>
          <div className="pk-about-mission__visual">
            <div className="pk-about-mission__card">
              <Image
                className="pk-about-mission__logo"
                src={STORE_LOGO_URL}
                alt="Puchica"
                width={400}
                height={120}
                loading="lazy"
              />
              <p className="pk-about-mission__card-text">
                {t('about_mission_card_text')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Shipping reach — "we ship anywhere" panel */}
      <ShippingReach />

      {/* How it works */}
      <section className="pk-about-how">
        <div className="pk-about-how__inner">
          <div className="pk-about-how__head">
            <span className="pk-about-how__eye"><StarGlyph /> {t('about_how_eye')}</span>
            <h2 className="pk-about-how__title">{t('about_how_title')}</h2>
          </div>
          <div className="pk-about-how__steps">
            {howSteps.map(({n, title, body}) => (
              <div key={n} className="pk-about-how__step">
                <span className="pk-about-how__n">{n}</span>
                <h3 className="pk-about-how__step-title">{title}</h3>
                <p className="pk-about-how__step-body">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="pk-about-cats">
        <div className="pk-about-cats__inner">
          <span className="pk-about-cats__eye"><StarGlyph /> {t('about_cats_eye')}</span>
          <h2 className="pk-about-cats__title">{t('about_cats_title')}</h2>
          <p className="pk-about-cats__sub">{t('about_cats_sub')}</p>
          <div className="pk-about-cats__grid">
            {categories.map(({icon: Icon, name, sub}) => (
              <div key={name} className="pk-about-cats__item">
                <span className="pk-about-cats__icon" aria-hidden="true"><Icon size={22} /></span>
                <strong className="pk-about-cats__name">{name}</strong>
                <span className="pk-about-cats__sub">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promise */}
      <section className="pk-about-promise">
        <div className="pk-about-promise__inner">
          <blockquote className="pk-about-promise__quote">
            &ldquo;{t('about_promise_quote')}&rdquo;
          </blockquote>
          <p className="pk-about-promise__attr">{t('about_promise_attr')}</p>
        </div>
      </section>

      {/* CTA */}
      <section className="pk-about-cta">
        <div className="pk-about-cta__inner">
          <h2 className="pk-about-cta__title">{t('about_cta_title')}</h2>
          <p className="pk-about-cta__sub">{t('about_cta_sub')}</p>
          <div className="pk-about-cta__btns">
            <Link to="/collections/all" className="pk-btn pk-btn--spark pk-btn--lg">
              {t('about_cta_browse')}
            </Link>
            <Link to="/pages/contact" className="pk-btn pk-btn--ghost pk-btn--lg">
              {t('about_cta_contact')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/** @typedef {import('./+types/pages.about').Route} Route */
