import {data, useLoaderData} from 'react-router';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {puchicaMeta} from '~/lib/seo';
import {useT} from '~/lib/t';
import {STOREFRONT_CONTAINMENT_ACTIVE} from '~/lib/launch-catalog';

/**
 * @type {Route.MetaFunction}
 *
 * 404 catch-all route. noindex,nofollow so the URL never enters
 * Google's index even if other sites link to a dead Puchica URL.
 * nofollow also stops us from passing link equity out of a 404.
 */
export const meta = ({data}) => {
  return puchicaMeta({
    title: 'Page not found – Puchica',
    description:
      "The page you're looking for doesn't exist. Return to Puchica or contact us for help.",
    noindex: true,
    pathname: data?.pathname || '/404',
  });
};

/**
 * @param {Route.LoaderArgs}
 *
 * Returns a 404 status without throwing, so the default export below
 * can render with proper meta + UI. The previous `throw new Response`
 * pattern skipped the component entirely and fell back to the bare
 * "Oops / 404" error boundary in root.jsx.
 */
export async function loader({request}) {
  const url = new URL(request.url);
  return data(
    {pathname: url.pathname},
    {status: 404, headers: {'X-Robots-Tag': 'noindex, nofollow'}},
  );
}

export default function CatchAllPage() {
  const t = useT();
  /** @type {LoaderReturnData} */
  const {pathname} = useLoaderData();

  if (STOREFRONT_CONTAINMENT_ACTIVE) {
    return (
      <div className="pk-hold">
        <section className="pk-hold__hero" aria-labelledby="not-found-title">
          <div className="pk-hold__hero-copy">
            <p className="pk-hold__eyebrow">404</p>
            <h1 id="not-found-title">{t('notfound_title')}</h1>
            <p className="pk-hold__lead">
              {t('notfound_sub', {path: <code>{pathname}</code>})}
            </p>
            <div className="pk-hold__actions">
              <Link className="pk-hold__button pk-hold__button--primary" to="/">
                {t('notfound_breadcrumb_home')}
              </Link>
              <Link className="pk-hold__button pk-hold__button--secondary" to="/pages/contact">
                {t('footer_contact')}
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="pk-collection">
      <nav className="pk-breadcrumbs" aria-label={t('notfound_breadcrumb_aria')}>
        <Link to="/">{t('notfound_breadcrumb_home')}</Link>
        <span className="pk-breadcrumbs__sep">/</span>
        <span className="pk-breadcrumbs__current">{t('notfound_breadcrumb_current')}</span>
      </nav>

      <header className="pk-col-hero pk-col-hero--soft">
        <div className="pk-col-hero__glow" aria-hidden />
        <div className="pk-col-hero__glow pk-col-hero__glow--ember" aria-hidden />
        <span className="pk-col-hero__eyebrow">{t('notfound_eyebrow')}</span>
        <h1 className="pk-col-hero__title">{t('notfound_title')}</h1>
        <p className="pk-col-hero__sub">
          {t('notfound_sub', {path: <code>{pathname}</code>})}
        </p>
      </header>

      <div className="pk-col-body" style={{gridTemplateColumns: '1fr'}}>
        <div className="pk-col-main">
          <div
            className="pk-empty"
            style={{padding: '32px 28px', textAlign: 'left'}}
          >
            <p className="pk-empty__title">{t('notfound_popular')}</p>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '12px 0 0',
                display: 'grid',
                gap: 10,
              }}
            >
              <li>
                <Link
                  to="/collections/all"
                  prefetch="intent"
                  style={{fontWeight: 600}}
                >
                  {t('nav_shop_all')}
                </Link>
              </li>
              <li>
                <Link
                  to="/pages/about"
                  prefetch="intent"
                  style={{fontWeight: 600}}
                >
                  {t('nav_about_short')}
                </Link>
              </li>
              <li>
                <Link
                  to="/pages/contact"
                  prefetch="intent"
                  style={{fontWeight: 600}}
                >
                  {t('footer_contact')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/** @typedef {import('./+types/$').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
