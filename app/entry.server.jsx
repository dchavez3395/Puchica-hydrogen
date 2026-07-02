import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';

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
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN || context.env.PUBLIC_STORE_DOMAIN || '',
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      'https://cdn.shopify.com',
      'https://fonts.googleapis.com',
      'https://cdn.judge.me',
    ],
    fontSrc: [
      "'self'",
      'https://fonts.gstatic.com',
      'data:',
    ],
    // Judge.me reviews widget — its script/API/images were being blocked by the
    // CSP (default-src had no judge.me entry), so reviews never rendered.
    // createContentSecurityPolicy merges these with Hydrogen's secure defaults
    // (nonce, 'self', Shopify domains stay intact).
    scriptSrc: [
      "'self'",
      'https://cdn.shopify.com',
      'https://cdn.judge.me',
      'https://cdnwidget.judge.me',
    ],
    connectSrc: [
      "'self'",
      'https://cdn.judge.me',
      'https://cdnwidget.judge.me',
      'https://api.judge.me',
      'https://cache.judge.me',
    ],
    imgSrc: [
      "'self'",
      'data:',
      'https://cdn.shopify.com',
      'https://cdn.judge.me',
      'https://judgeme.imgix.net',
    ],
    frameSrc: ["'self'", 'https://cdn.judge.me'],
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

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

/** @typedef {import('@shopify/hydrogen').HydrogenRouterContextProvider} HydrogenRouterContextProvider */
/** @typedef {import('react-router').EntryContext} EntryContext */
