import {Link} from 'react-router';
import {puchicaMeta} from '~/lib/seo';
import StarGlyph from '~/components/StarGlyph';
import {IconSearch, IconHome, IconSparkles, IconLightbulb, IconLeaf, IconPawPrint, IconGift} from '~/components/Icons';

export const meta = () =>
  puchicaMeta({
    title: 'About Puchica – The good stuff, handpicked.',
    description:
      "We're picky about what makes the catalog. If we wouldn't buy it ourselves, it doesn't go up. 6,000+ products, picked in Toronto, shipped from Canada.",
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
            We pick the good stuff.
            <br />
            <span className="pk-about-hero__em">You get to skip the research.</span>
          </h1>
          <p className="pk-about-hero__sub">
            Puchica is a Canadian-owned store that dropships curated finds. We
            sort through thousands of products so you don&apos;t have to. If it
            doesn&apos;t earn its spot, it doesn&apos;t ship.
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
              There are a lot of products out there. Most are forgettable.
            </h2>
            <p className="pk-about-mission__body">
              We sort through them so you don&apos;t have to. Each one gets a
              real look: does it work, is it worth the money, would we
              actually use it. If the answer is no to any of those, it doesn&apos;t
              go in the catalog.
            </p>
            <p className="pk-about-mission__body">
              Puchica is a Canadian-owned store. We don&apos;t warehouse
              inventory ourselves — products ship from our suppliers, which
              lets us keep the catalog broad without locking up capital in
              stock. You get a real, curated selection instead of a guess at
              what might sell.
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
                body: 'Our team checks new products constantly — trade shows, suppliers, social media. No algorithm picks what goes up.',
              },
              {
                n: '02',
                title: 'We check it',
                body: 'Does it work. Is it worth the money. Would we actually use it. If any answer is no, it doesn’t make the cut.',
              },
              {
                n: '03',
                title: 'You get it',
                body: 'If it passes, it’s in the shop. It ships from our supplier to your door, with a pre-paid return label in every box.',
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
            &ldquo;If it&apos;s on Puchica, we&apos;d buy it ourselves. We test
            it, we live with it, and we keep the bar where it is.&rdquo;
          </blockquote>
          <p className="pk-about-promise__attr">— The Puchica team, Toronto ON</p>
        </div>
      </section>

      {/* CTA */}
      <section className="pk-about-cta">
        <div className="pk-about-cta__inner">
          <h2 className="pk-about-cta__title">Ready to find your thing?</h2>
          <p className="pk-about-cta__sub">
            6,000+ products, picked by humans. Most under $100. Free shipping
            over $50, 30-day returns, ships from Canada.
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
