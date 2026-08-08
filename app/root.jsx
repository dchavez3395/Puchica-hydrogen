import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Form,
  Link,
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  useLocation,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
import {hreflangAlternates} from '~/lib/seo';
const favicon = '/favicon.svg';
import {FOOTER_QUERY, HEADER_QUERY, MEGA_MENU_QUERY} from '~/lib/fragments';
import {resolveStorefrontLocale} from '~/lib/i18n';
import {
  filterLaunchProducts,
  STOREFRONT_CONTAINMENT_ACTIVE,
} from '~/lib/launch-catalog';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import commerceStyles from '~/styles/app-commerce.css?url';
import {PageLayout} from './components/PageLayout';
// SmoothScroll removed in Phase 1 — Lenis was passive scroll
// enhancement with no callers; native scroll is fine.
import {MetaPixel} from './components/MetaPixel';
import {CartRecoveryBanner} from './components/CartRecoveryBanner';
import {GoogleAnalytics4} from './components/GoogleAnalytics4';
import {error as logError} from '~/lib/logger';
import {useT} from '~/lib/t';

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
  const selectedLocale = resolveStorefrontLocale(
    storefront.i18n,
    criticalData.header?.localization,
  );
  // Analytics ownership is intentionally split. Shopify owns checkout-side
  // Google events and the current Meta browser/server integration. The optional
  // GA4 storefront bridge emits only Hydrogen product and cart events.
  const customMetaEnabled = env.PUBLIC_CUSTOM_META_ENABLED === 'true';
  const ga4StorefrontEnabled =
    env.PUBLIC_GA4_STOREFRONT_EVENTS_ENABLED === 'true';

  return {
    ...deferredData,
    ...criticalData,
    maintenanceMode: env.MAINTENANCE_MODE === 'true',
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    // Meta Pixel ID (Meta Events Manager) — enables storefront-side ad tracking.
    // No-ops until this env var is set. See app/components/MetaPixel.jsx.
    metaPixelId: customMetaEnabled
      ? env.PUBLIC_FACEBOOK_PIXEL_ID || null
      : null,
    ga4MeasurementId: ga4StorefrontEnabled
      ? env.PUBLIC_GA4_MEASUREMENT_ID || null
      : null,
    selectedLocale,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN || 'checkout.puchica.ca',
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: true,
      // localize the privacy banner
      country: selectedLocale.country,
      language: selectedLocale.language,
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
  const {country, language} = storefront.i18n;

  const [header] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'main-menu', // Adjust to your header menu handle
        country,
        language,
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
  const {country, language} = storefront.i18n;

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

  // defer the mega-menu collection query (used by the desktop header's
  // Shop dropdown). Failure is non-fatal; the header falls back to a
  // single "Shop" link.
  const megaMenu = STOREFRONT_CONTAINMENT_ACTIVE
    ? Promise.resolve(null)
    : storefront
        .query(MEGA_MENU_QUERY, {
          cache: storefront.CacheLong(),
          variables: {country, language},
        })
        .then(filterMegaMenuProducts)
        .catch((error) => {
          logError('deferred mega-menu query failed', error);
          return null;
        });

  return {
    cart: STOREFRONT_CONTAINMENT_ACTIVE ? Promise.resolve(null) : cart.get(),
    isLoggedIn: STOREFRONT_CONTAINMENT_ACTIVE
      ? Promise.resolve(false)
      : customerAccount.isLoggedIn(),
    footer,
    megaMenu,
  };
}

function filterMegaMenuProducts(data) {
  const collections = data?.collections;
  if (!collections?.nodes) return data;

  return {
    ...data,
    collections: {
      ...collections,
      nodes: collections.nodes.map((collection) => ({
        ...collection,
        products: {
          ...collection.products,
          nodes: filterLaunchProducts(collection.products?.nodes),
        },
      })),
    },
  };
}

/**
 * @param {{children?: React.ReactNode}}
 */
export function Layout({children}) {
  const nonce = useNonce();
  const {pathname} = useLocation();
  const rootData = useRouteLoaderData('root');
  const language = rootData?.selectedLocale?.language || 'EN';
  const country = rootData?.selectedLocale?.country || 'US';
  const normalizedLanguage = language.toLowerCase().replace('_', '-');
  const documentLanguage = normalizedLanguage.includes('-')
    ? normalizedLanguage.replace(/-([a-z]{2})$/, (_, region) =>
        `-${region.toUpperCase()}`,
      )
    : `${normalizedLanguage}-${country}`;
  // Reciprocal hreflang alternates for all four languages + x-default, keyed to
  // the current path. Correct now that the /fr, /es, /pt-br routes resolve.
  const alternates = hreflangAlternates(pathname);

  return (
    <html lang={documentLanguage}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <link rel="stylesheet" href={commerceStyles}></link>
        {alternates.map((a) => (
          <link
            key={a.hreflang}
            rel="alternate"
            hrefLang={a.hreflang}
            href={a.href}
          />
        ))}
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
      <MetaPixel pixelId={data.metaPixelId} />
      <GoogleAnalytics4 measurementId={data.ga4MeasurementId} />
      {!STOREFRONT_CONTAINMENT_ACTIVE && (
        <CartRecoveryBanner cart={data.cart} />
      )}
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
  const t = useT();
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
  logError('route error', {
    status: errorStatus,
    error: rawError,
    route: undefined,
  });

  const isNotFound = errorStatus === 404;
  const heading = isNotFound ? t('err_404_h') : t('err_500_h');
  const subhead = isNotFound ? t('err_404_body') : t('err_500_body');

  return (
    <div className="route-error pk-route-error">
      <div className="pk-route-error__panel">
        <span className="pk-route-error__eyebrow" aria-hidden>
          {errorStatus}
        </span>
        <h1 className="pk-route-error__title">{heading}</h1>
        <p className="pk-route-error__sub">{subhead}</p>

        {!STOREFRONT_CONTAINMENT_ACTIVE && (
          <Form
            method="get"
            action="/search"
            role="search"
            className="pk-route-error__search"
          >
            <label htmlFor="route-error-search" className="sr-only">
              {t('err_search_aria')}
            </label>
            <input
              id="route-error-search"
              type="search"
              name="q"
              placeholder={t('err_search_placeholder')}
              autoComplete="off"
              className="pk-route-error__input"
            />
            <button type="submit" className="pk-btn pk-btn--primary">
              {t('err_search_btn')}
            </button>
          </Form>
        )}

        <div className="pk-route-error__cta">
          <Link to="/" className="pk-btn pk-btn--primary pk-btn--lg">
            {t('err_home')}
          </Link>
          <Link
            to={STOREFRONT_CONTAINMENT_ACTIVE ? '/pages/contact' : '/pages/about'}
            className="pk-btn pk-btn--ghost pk-btn--lg"
          >
            {STOREFRONT_CONTAINMENT_ACTIVE
              ? t('footer_contact')
              : t('err_browse')}
          </Link>
        </div>

        <p className="pk-route-error__contact">
          {t('err_contact', {
            email: (
              <a key="support-email" href="mailto:hello@puchica.ca">
                hello@puchica.ca
              </a>
            ),
          })}
        </p>
      </div>
    </div>
  );
}

/** @typedef {LoaderReturnData} RootLoader */

/** @typedef {import('react-router').ShouldRevalidateFunction} ShouldRevalidateFunction */
/** @typedef {import('./+types/root').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
