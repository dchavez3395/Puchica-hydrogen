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
