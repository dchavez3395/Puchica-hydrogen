import {Link} from 'react-router';
import {puchicaMeta} from '~/lib/seo';
import StarGlyph from '~/components/StarGlyph';
import {IconSearch, IconHome, IconSparkles, IconLightbulb, IconLeaf, IconPawPrint, IconGift} from '~/components/Icons';

export const meta = () =>
  puchicaMeta({
    title: 'About Puchica – The good stuff, handpicked.',
    description:
      "Puchica is a Canadian online store with 6,000+ handpicked products across home, beauty, tech, pet, and more. We find the good stuff so you don't have to.",
    pathname: '/pages/about',
  });

export async function loader() {
  return {};
}

export default function AboutPage() {
  return (
    <div className="pk-about">
      {/* Hero */}
      <section className="pk-about-hero">
        <div className="pk-about-hero__glow" aria-hidden="true" />
        <div className="pk-about-hero__inner">
          <span className="pk-about-hero__eyebrow"><StarGlyph /> Our story</span>
          <h1 className="pk-about-hero__title">
            We find the good stuff.
            <br />
            <span className="pk-about-hero__em">You get to enjoy it.</span>
          </h1>
          <p className="pk-about-hero__sub">
            Puchica is a Canadian online store built on a simple idea: there
            are thousands of genuinely great products out there, buried under
            noise. We dig them up so you don't have to.
          </p>
          <Link to="/collections/all" className="pk-btn pk-btn--spark pk-btn--lg">
            Start shopping →
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <div className="pk-about-stats" aria-label="Puchica in numbers">
        {[
          {num: '6,000+', label: 'Handpicked products'},
          {num: '100%', label: 'Ships from Canada'},
          {num: '$50+', label: 'Free shipping threshold'},
          {num: '30 days', label: 'No-hassle returns'},
        ].map(({num, label}) => (
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
            <span className="pk-about-mission__eye"><StarGlyph /> Why we exist</span>
            <h2 className="pk-about-mission__title">
              Shopping shouldn&apos;t feel like a part-time job.
            </h2>
            <p className="pk-about-mission__body">
              The internet is full of products. Most of them are mediocre.
              Finding the good ones takes time you don&apos;t have — scrolling
              endless reviews, comparing options, second-guessing every click.
            </p>
            <p className="pk-about-mission__body">
              We built Puchica to be the shortcut. Everything in our catalog
              has been evaluated for real value: does it work? Is it worth the
              price? Would we actually buy it? If the answer to any of those is
              no, it doesn&apos;t make the cut.
            </p>
          </div>
          <div className="pk-about-mission__visual" aria-hidden="true">
            <div className="pk-about-mission__card">
              <span className="pk-about-mission__card-icon"><IconSearch size={32} /></span>
              <p className="pk-about-mission__card-text">
                We evaluate thousands of products. Only the ones worth your
                money make it through.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="pk-about-how">
        <div className="pk-about-how__inner">
          <div className="pk-about-how__head">
            <span className="pk-about-how__eye"><StarGlyph /> How we curate</span>
            <h2 className="pk-about-how__title">
              Every product earns its place.
            </h2>
          </div>
          <div className="pk-about-how__steps">
            {[
              {
                n: '01',
                title: 'We find it',
                body: 'Our team scans new products constantly — from trade shows to social media to deep dives into supplier catalogs. No algorithm involved.',
              },
              {
                n: '02',
                title: 'We evaluate it',
                body: 'Every product gets a real look: quality, price-to-value, usefulness, uniqueness. We ask: would we actually buy this? Would we recommend it?',
              },
              {
                n: '03',
                title: 'You get it',
                body: 'If it passes, it joins the catalog. We handle the rest — sourcing, fulfilment, and getting it to your door fast from our base in Toronto, ON.',
              },
            ].map(({n, title, body}) => (
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
          <span className="pk-about-cats__eye"><StarGlyph /> What we carry</span>
          <h2 className="pk-about-cats__title">6,000+ products. One store.</h2>
          <p className="pk-about-cats__sub">
            Across every category that actually matters in your day-to-day.
          </p>
          <div className="pk-about-cats__grid">
            {[
              {icon: IconHome,      name: 'Home & Living',       sub: 'Organization, decor, kitchen'},
              {icon: IconSparkles,  name: 'Beauty & Self-Care',  sub: 'Skincare, wellness, personal care'},
              {icon: IconLightbulb, name: 'Tech & Gadgets',      sub: 'Accessories, tools, smart home'},
              {icon: IconLeaf,      name: 'Outdoor & Garden',    sub: 'Patio, camping, gardening'},
              {icon: IconPawPrint,  name: 'Pet Finds',           sub: 'Toys, gear, grooming'},
              {icon: IconGift,      name: 'Gifts',               sub: 'For everyone on your list'},
            ].map(({icon: Icon, name, sub}) => (
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
            &ldquo;We&apos;re picky so you don&apos;t have to be. If it&apos;s
            on Puchica, someone on our team would actually buy it.&rdquo;
          </blockquote>
          <p className="pk-about-promise__attr">— The Puchica team, Toronto ON</p>
        </div>
      </section>

      {/* CTA */}
      <section className="pk-about-cta">
        <div className="pk-about-cta__inner">
          <h2 className="pk-about-cta__title">Ready to find your thing?</h2>
          <p className="pk-about-cta__sub">
            6,000+ products. Free shipping over $50. Easy 30-day returns. Ships
            from Canada.
          </p>
          <div className="pk-about-cta__btns">
            <Link to="/collections/all" className="pk-btn pk-btn--spark pk-btn--lg">
              Browse everything →
            </Link>
            <Link to="/pages/contact" className="pk-btn pk-btn--ghost pk-btn--lg">
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/** @typedef {import('./+types/pages.about').Route} Route */
