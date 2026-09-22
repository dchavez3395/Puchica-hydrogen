import {ServerRouter} from 'react-router';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';
import {
  dropModulePreloadLinks,
  placeTrailingRouterChunksInsideBody,
} from '~/lib/html-stream';

/**
 * @param {Request} request
 * @param {number} responseStatusCode
 * @param {Headers} responseHeaders
 * @param {EntryContext} reactRouterContext
 * @param {HydrogenRouterContextProvider} context
 */
export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  reactRouterContext,
  context,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain:
        context.env.PUBLIC_CHECKOUT_DOMAIN ||
        context.env.PUBLIC_STORE_DOMAIN ||
        '',
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      'https://cdn.shopify.com',
      'https://fonts.googleapis.com',
      'https://cdn.judge.me',
    ],
    // Oxygen serves built stylesheets from cdn.shopify.com, so a url(/fonts/…)
    // inside one resolves to the CDN; keep the CDN allowed even though the
    // @font-face block is inlined in root.jsx (2026-09-20: every self-hosted
    // font was CSP-blocked in production and the site fell back to system
    // fonts).
    fontSrc: ["'self'", 'https://cdn.shopify.com', 'https://fonts.gstatic.com', 'data:'],
    // Judge.me reviews widget — its script/API/images were being blocked by the
    // CSP (default-src had no judge.me entry), so reviews never rendered.
    // createContentSecurityPolicy merges these with Hydrogen's secure defaults
    // (nonce, 'self', Shopify domains stay intact).
    scriptSrc: [
      "'self'",
      'https://cdn.shopify.com',
      'https://cdn.judge.me',
      'https://cdnwidget.judge.me',
      'https://connect.facebook.net',
      'https://www.googletagmanager.com',
    ],
    connectSrc: [
      "'self'",
      'https://cdn.judge.me',
      'https://cdnwidget.judge.me',
      'https://api.judge.me',
      'https://cache.judge.me',
      'https://www.facebook.com',
      'https://www.google-analytics.com',
      'https://region1.google-analytics.com',
      'https://www.googletagmanager.com',
    ],
    imgSrc: [
      "'self'",
      'data:',
      'https://cdn.shopify.com',
      'https://cdn.judge.me',
      'https://judgeme.imgix.net',
      'https://www.facebook.com',
      'https://www.google-analytics.com',
    ],
    // Meta's pixel (fbevents 2.9.4xx) delivers events through a hidden
    // www.facebook.com frame; without this the storefront never sent a single
    // browser event (2026-09-20 Events Manager: PageView from checkout only).
    frameSrc: ["'self'", 'https://cdn.judge.me', 'https://www.facebook.com'],
    // The storefront does not embed legacy plugin content. Explicitly disable
    // <object>, <embed>, and <applet> loads instead of relying on default-src.
    objectSrc: ["'none'"],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  // The current root loader streams several deferred values. Sending the
  // document before they settle appends React Router's replacement nodes after
  // `</html>` in Chromium, which causes a full hydration bailout on ordinary
  // storefront loads. This small launch catalog favors a stable hydrated
  // document over a marginal streaming gain.
  await body.allReady;
  const html = dropModulePreloadLinks(
    placeTrailingRouterChunksInsideBody(await new Response(body).text()),
  );

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);
  responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  responseHeaders.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  );

  return new Response(html, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

/** @typedef {import('@shopify/hydrogen').HydrogenRouterContextProvider} HydrogenRouterContextProvider */
/** @typedef {import('react-router').EntryContext} EntryContext */
