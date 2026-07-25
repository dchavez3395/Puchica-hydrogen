import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {Image} from '@shopify/hydrogen';
import {puchicaMeta} from '~/lib/seo';
import {useT} from '~/lib/t';

export const meta = ({params}) =>
  puchicaMeta({
    title: 'About Puchica | Useful finds, thoughtfully chosen',
    description:
      'Puchica is a Canadian-owned lifestyle shop for useful finds, clear shopping, and a catalog that stays easy to explore.',
    pathname: '/pages/about',
    langKey: params?.locale,
  });

export async function loader() {
  return {};
}

export default function AboutPage() {
  const t = useT();
  const principles = [
    {kicker: 'Browse', title: t('about_how_1_title'), body: t('about_how_1_body')},
    {kicker: 'Checkout', title: t('about_how_2_title'), body: t('about_how_2_body')},
    {kicker: 'Care', title: t('about_how_3_title'), body: t('about_how_3_body')},
  ];
  const departments = [
    {handle: 'home-kitchen', label: t('home_dept_home'), tone: 'violet'},
    {handle: 'apparel-accessories', label: t('home_dept_apparel'), tone: 'ember'},
    {handle: 'health-wellness', label: t('home_dept_health'), tone: 'jade'},
    {handle: 'pet-supplies', label: t('home_dept_pet'), tone: 'cobalt'},
  ];

  return (
    <div className="pk-about-v2">
      <section className="pk-about-v2__hero">
        <div className="pk-about-v2__hero-inner">
          <div className="pk-about-v2__hero-copy">
            <span className="pk-about-v2__eyebrow">{t('about_hero_eyebrow')}</span>
            <h1>{t('about_hero_title_main')} <em>{t('about_hero_title_em')}</em></h1>
            <p>{t('about_hero_sub')}</p>
            <div className="pk-about-v2__hero-actions">
              <Link to="/collections/all" className="pk-btn pk-btn--paper pk-btn--lg">
                {t('about_hero_cta')}
              </Link>
              <Link to="/pages/shipping" className="pk-about-v2__text-link">
                Shipping &amp; delivery <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <div className="pk-about-v2__hero-art">
            <Image
              src="/about/hero-still-life.webp"
              alt="A thoughtful collection of everyday objects on a warm textile"
              width={1376}
              height={768}
              sizes="(min-width: 900px) 48vw, 100vw"
              loading="eager"
            />
          </div>
        </div>
      </section>

      <section className="pk-about-v2__intro">
        <div>
          <span className="pk-about-v2__eyebrow pk-about-v2__eyebrow--ink">{t('about_mission_eye')}</span>
          <h2>{t('about_mission_title')}</h2>
        </div>
        <div className="pk-about-v2__intro-copy">
          <p>{t('about_mission_body_1')}</p>
          <p>{t('about_mission_body_2')}</p>
        </div>
      </section>

      <section className="pk-about-v2__principles">
        <div className="pk-about-v2__section-head">
          <span className="pk-about-v2__eyebrow">{t('about_how_eye')}</span>
          <h2>{t('about_how_title')}</h2>
        </div>
        <div className="pk-about-v2__principle-grid">
          {principles.map(({kicker, title, body}) => (
            <article key={title} className="pk-about-v2__principle">
              <span className="pk-about-v2__principle-kicker">{kicker}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pk-about-v2__roots">
        <div className="pk-about-v2__roots-art">
          <Image
            src="/about/roots-textile.webp"
            alt="Handwoven Central American textile and ceramic craft"
            width={768}
            height={960}
            sizes="(min-width: 900px) 42vw, 100vw"
            loading="lazy"
          />
        </div>
        <div className="pk-about-v2__roots-copy">
          <span className="pk-about-v2__eyebrow">{t('about_roots_eyebrow')}</span>
          <h2>{t('about_roots_heading')}</h2>
          <p>{t('about_roots_body')}</p>
          <p className="pk-about-v2__signature">{t('about_roots_signature')}</p>
        </div>
      </section>

      <section className="pk-about-v2__shop">
        <div className="pk-about-v2__section-head">
          <span className="pk-about-v2__eyebrow pk-about-v2__eyebrow--ink">Keep exploring</span>
          <h2>Start where it fits your day.</h2>
        </div>
        <ul className="pk-about-v2__department-list">
          {departments.map(({handle, label, tone}) => (
            <li key={handle}>
              <Link to={`/collections/${handle}`} prefetch="intent" className={`pk-about-v2__department pk-about-v2__department--${tone}`}>
                <span>{label}</span><span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="pk-about-v2__cta">
        <span className="pk-about-v2__eyebrow">Puchica</span>
        <h2>{t('about_cta_title')}</h2>
        <p>{t('about_cta_sub')}</p>
        <Link to="/collections/all" className="pk-btn pk-btn--paper pk-btn--lg">
          {t('about_cta_browse')}
        </Link>
      </section>
    </div>
  );
}

/** @typedef {import('./+types/pages.about').Route} Route */
