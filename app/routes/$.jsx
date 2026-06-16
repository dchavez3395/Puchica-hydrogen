import {Link, data, useLoaderData} from 'react-router';
import {puchicaMeta} from '~/lib/seo';

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
  /** @type {LoaderReturnData} */
  const {pathname} = useLoaderData();
  return (
    <div className="pk-collection">
      <nav className="pk-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="pk-breadcrumbs__sep">/</span>
        <span className="pk-breadcrumbs__current">Page not found</span>
      </nav>

      <header className="pk-col-hero pk-col-hero--soft">
        <span className="pk-col-hero__eyebrow">404</span>
        <h1 className="pk-col-hero__title">We couldn&apos;t find that page</h1>
        <p className="pk-col-hero__sub">
          The link <code>{pathname}</code> doesn&apos;t exist on Puchica. It may
          have been moved, renamed, or never existed. Try one of these
          instead:
        </p>
      </header>

      <div className="pk-col-body" style={{gridTemplateColumns: '1fr'}}>
        <div className="pk-col-main">
          <div
            className="pk-empty"
            style={{padding: '32px 28px', textAlign: 'left'}}
          >
            <p className="pk-empty__title">Popular collections</p>
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
                  Best sellers →
                </Link>
              </li>
              <li>
                <Link
                  to="/collections/new"
                  prefetch="intent"
                  style={{fontWeight: 600}}
                >
                  New arrivals →
                </Link>
              </li>
              <li>
                <Link
                  to="/collections"
                  prefetch="intent"
                  style={{fontWeight: 600}}
                >
                  All collections →
                </Link>
              </li>
              <li>
                <Link
                  to="/collections/all"
                  prefetch="intent"
                  style={{fontWeight: 600}}
                >
                  Full catalog →
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
