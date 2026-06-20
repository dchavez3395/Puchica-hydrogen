import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Form,
  Link,
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
const favicon = '/favicon.svg';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import {PageLayout} from './components/PageLayout';
import {error as logError} from '~/lib/logger';

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 * @type {ShouldRevalidateFunction}
 */
export const shouldRevalidate = ({formMethod, currentUrl, nextUrl}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300..800&family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&display=swap',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
}

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const {storefront, env} = args.context;

  return {
    ...deferredData,
    ...criticalData,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    selectedLocale: args.context.storefront.i18n,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: false,
      // localize the privacy banner
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context}) {
  const {storefront} = context;

  const [header] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'main-menu', // Adjust to your header menu handle
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {header};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  const {storefront, customerAccount, cart} = context;

  // defer the footer query (below the fold)
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'footer', // Adjust to your footer menu handle
      },
    })
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      logError('deferred footer query failed', error);
      return null;
    });
  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
    footer,
  };
}

/**
 * @param {{children?: React.ReactNode}}
 */
export function Layout({children}) {
  const nonce = useNonce();

  return (
    <html lang="en-CA">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  /** @type {RootLoader} */
  const data = useRouteLoaderData('root');

  if (!data) {
    return <Outlet />;
  }

  return (
    <Analytics.Provider
      cart={data.cart}
      shop={data.shop}
      consent={data.consent}
    >
      <PageLayout {...data}>
        <Outlet />
      </PageLayout>
    </Analytics.Provider>
  );
}

/**
 * Friendly error / 404 page.
 *
 * Renders a styled, customer-facing page (no raw error.message) and
 * logs the underlying error through the dev-only logger so the merchant
 * can still see what happened. The page has two variants:
 *   - 404 ("We couldn't find that page"): routes that throw a Response
 *     with status 404 land here.
 *   - 5xx / unhandled ("Something went wrong"): everything else.
 *
 * Both variants offer a search box (GETs /search with the user's
 * query) and clear CTAs back into the shop. We never render the raw
 * error text — that's a leakage vector for server details and a
 * trust-destroyer on a real storefront.
 */
export function ErrorBoundary() {
  const error = useRouteError();
  let errorStatus = 500;
  let rawError;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    rawError = error?.data ?? error?.statusText;
  } else if (error instanceof Error) {
    rawError = error.message;
  }

  // Log once. The logger no-ops in production, so this is dev-only.
  logError('route error', {status: errorStatus, error: rawError, route: undefined});

  const isNotFound = errorStatus === 404;
  const heading = isNotFound
    ? "We couldn't find that page"
    : 'Something went wrong on our end';
  const subhead = isNotFound
    ? 'The link may be broken, or the page may have moved. Try a search, or head back to the shop.'
    : 'We hit an unexpected error rendering this page. Try again, or browse the catalog below.';

  return (
    <div className="route-error pk-route-error">
      <div className="pk-route-error__panel">
        <span className="pk-route-error__eyebrow" aria-hidden>
          {errorStatus}
        </span>
        <h1 className="pk-route-error__title">{heading}</h1>
        <p className="pk-route-error__sub">{subhead}</p>

        <Form
          method="get"
          action="/search"
          role="search"
          className="pk-route-error__search"
        >
          <label htmlFor="route-error-search" className="sr-only">
            Search the shop
          </label>
          <input
            id="route-error-search"
            type="search"
            name="q"
            placeholder="Search the shop…"
            autoComplete="off"
            className="pk-route-error__input"
          />
          <button type="submit" className="pk-btn pk-btn--primary">
            Search
          </button>
        </Form>

        <div className="pk-route-error__cta">
          <Link to="/" className="pk-btn pk-btn--primary pk-btn--lg">
            Back to home
          </Link>
          <Link to="/collections/all" className="pk-btn pk-btn--ghost pk-btn--lg">
            Browse all products
          </Link>
        </div>

        <p className="pk-route-error__contact">
          Still stuck? Email{' '}
          <a href="mailto:hello@puchica.ca">hello@puchica.ca</a> and
          we&apos;ll help.
        </p>
      </div>
    </div>
  );
}

/** @typedef {LoaderReturnData} RootLoader */

/** @typedef {import('react-router').ShouldRevalidateFunction} ShouldRevalidateFunction */
/** @typedef {import('./+types/root').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
