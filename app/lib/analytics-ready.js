/**
 * How long the analytics bus may stay buffered waiting for paint.
 *
 * Long enough that a normally painting tab always releases through the
 * two-frame path first (two frames is ~33ms at 60Hz, and well under this even
 * on a slow device), short enough that a tab which never paints still gets
 * measured.
 */
export const ANALYTICS_READY_DEADLINE_MS = 250;

/**
 * Release buffered analytics only after the initial document has had two
 * frames to hydrate. Third-party pixels can mutate the DOM as soon as their
 * buffered page-view fires; releasing them during concurrent hydration makes
 * React abandon the server-rendered document.
 *
 * WHY THERE IS ALSO A DEADLINE
 *
 * Hydrogen's analytics bus is all-or-nothing. `register(name)` marks a key
 * false, and `publish()` refuses to deliver *any* event to *any* subscriber
 * until every registered key has reported ready:
 *
 *     function publish(event, payload) {
 *       if (!areRegistersReady()) { waitForReadyQueue.set(event, payload); return; }
 *       publishEvent(event, payload);
 *     }
 *
 * So one integration that never calls `ready()` does not merely disable
 * itself - it silences Shopify's own analytics and every other integration
 * with it, permanently and without an error. That is not a hypothetical: it
 * is what was live on puchica.ca. Forcing this one key ready from the console
 * flushed the queue and the pixel installed instantly, which is how the jam
 * was identified.
 *
 * A double `requestAnimationFrame` is a fine way to wait for hydration when
 * frames are being painted. It is a poor thing to make the entire measurement
 * stack depend on, because frames are not guaranteed: a background or
 * throttled tab does not paint, and a render React discards never reaches its
 * effect at all. The deadline below means the worst case is a slightly early
 * release, not a storefront that measures nothing.
 *
 * @param {() => void} ready
 * @param {{
 *   raf?: typeof globalThis.requestAnimationFrame,
 *   defer?: typeof globalThis.setTimeout,
 *   deadlineMs?: number,
 * }} [scheduler]
 */
export function scheduleAnalyticsReady(
  ready,
  {
    raf = globalThis.requestAnimationFrame,
    defer = globalThis.setTimeout,
    deadlineMs = ANALYTICS_READY_DEADLINE_MS,
  } = {},
) {
  if (typeof ready !== 'function' || typeof defer !== 'function') return;

  // ready() is idempotent in Hydrogen, but calling it twice would also flush
  // the wait-room queue twice. Release exactly once, whichever path wins.
  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    ready();
  };

  // The deadline is armed first and unconditionally, so no later step in this
  // function can leave the bus jammed.
  defer(release, deadlineMs);

  if (typeof raf !== 'function') {
    defer(release, 0);
    return;
  }

  raf(() => raf(() => defer(release, 0)));
}
