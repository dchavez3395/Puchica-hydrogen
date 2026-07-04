import {data, useLoaderData} from 'react-router';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {puchicaMeta} from '~/lib/seo';
import {useT} from '~/lib/t';

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
      "The page you&apos;re looking for doesn&apos;t exist. Browse our collections or search the catalog.",
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
                  to="/collections/best-sellers"
                  prefetch="intent"
                  style={{fontWeight: 600}}
                >
                  {t('notfound_best')}
                </Link>
              </li>
              <li>
                <Link
                  to="/collections/new"
                  prefetch="intent"
                  style={{fontWeight: 600}}
                >
                  {t('notfound_new')}
                </Link>
              </li>
              <li>
                <Link
                  to="/collections"
                  prefetch="intent"
                  style={{fontWeight: 600}}
                >
                  {t('notfound_all_collections')}
                </Link>
              </li>
              <li>
                <Link
                  to="/collections/all"
                  prefetch="intent"
                  style={{fontWeight: 600}}
                >
                  {t('notfound_all_catalog')}
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
