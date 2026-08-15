/**
 * Release buffered analytics only after the initial document has had two
 * frames to hydrate. Third-party pixels can mutate the DOM as soon as their
 * buffered page-view fires; releasing them during concurrent hydration makes
 * React abandon the server-rendered document.
 *
 * @param {() => void} ready
 * @param {{
 *   raf?: typeof globalThis.requestAnimationFrame,
 *   defer?: typeof globalThis.setTimeout,
 * }} [scheduler]
 */
export function scheduleAnalyticsReady(
  ready,
  {
    raf = globalThis.requestAnimationFrame,
    defer = globalThis.setTimeout,
  } = {},
) {
  if (typeof ready !== 'function' || typeof defer !== 'function') return;

  const release = () => defer(ready, 0);
  if (typeof raf !== 'function') {
    release();
    return;
  }

  raf(() => raf(release));
}
