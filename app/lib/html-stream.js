const DOCUMENT_CLOSE = '</body></html>';

/**
 * React Router can append deferred loader scripts after the document closing
 * tags. Chromium then starts the module hydration script before those router
 * chunks finish parsing and reports an unexpected `<div>` under `<html>`.
 * Buffering the already-complete response and placing the trailing chunks at
 * the end of `<body>` preserves their order and valid document structure.
 *
 * @param {string} html
 */
export function placeTrailingRouterChunksInsideBody(html) {
  const closeIndex = html.indexOf(DOCUMENT_CLOSE);
  if (closeIndex < 0) return html;

  const tail = html.slice(closeIndex + DOCUMENT_CLOSE.length);
  if (!tail.trim()) return html;

  return `${html.slice(0, closeIndex)}${tail}${DOCUMENT_CLOSE}`;
}

/**
 * Drop React Router's `<link rel="modulepreload">` hints from the streamed
 * document.
 *
 * Six of them pull ~110 KB of client bundle at high priority while the hero
 * image — the LCP element — is still downloading. On a throttled phone
 * (1.6 Mbps / 150 ms / 4x CPU, `work/lighthouse/hero-variants.mjs`, 3 runs,
 * 2026-09-22) that costs about a second of LCP:
 *
 *   with preloads     LCP 2032 ms · JS arrives 5113 ms
 *   without preloads  LCP 1092 ms · JS arrives 6411 ms
 *
 * The scripts still load — only the early hint is gone — so the trade is
 * ~0.9 s sooner first paint for ~1.3 s later hydration. That is the right way
 * round here because the page works before it hydrates: product and collection
 * links are real anchors, and add-to-cart is a real
 * `<form method="post" action="/cart">` that the browser submits natively (the
 * 2026-09-19 probe added to the cart on the first click 40 times out of 40).
 * Client-side prefetch on hover is unaffected; it is emitted after hydration.
 *
 * @param {string} html
 */
export function dropModulePreloadLinks(html) {
  return html.replace(/<link\b[^>]*\brel="modulepreload"[^>]*>/g, '');
}
