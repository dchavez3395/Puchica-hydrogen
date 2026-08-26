/**
 * The layout probes, as plain functions that run inside the page.
 *
 * They live apart from the specs for one reason: the specs run against
 * production, which this container cannot reach and which cannot be framed
 * (`frame-ancestors 'none'`), so the only way to prove a probe actually
 * detects what it claims is to run it against a fixture that is deliberately
 * broken. `tests/browser/probes.test.js` does exactly that. A detector nobody
 * has ever seen fire is not evidence of anything.
 */

/**
 * Elements sticking out past the viewport's right edge, or off its left.
 *
 * Deliberately geometric rather than `document.scrollWidth`-based.
 *
 * An ancestor with `overflow: hidden` clips overflow rather than preventing
 * it, so `scrollWidth` reports a clean document while content is cut off —
 * `.pk-home` does exactly this. `getBoundingClientRect()`, though, reports an
 * element's full unclipped border box: clipping changes what is painted and
 * scrollable, not layout geometry. So this probe sees through the clip and
 * needs no neutraliser, while any `scrollWidth` check needs `overflowClipCss`
 * to mean anything. `probes.test.js` pins both halves of that.
 */
export function findOverflow() {
  const cw = document.documentElement.clientWidth;
  const seen = new Map();

  /**
   * Content inside a horizontal SCROLLER is reachable, so it is not overflow.
   *
   * The PDP thumbnail rail is `overflow-x: auto` with 763px of thumbnails in a
   * 465px box — working exactly as designed. The first version of this probe
   * reported all 23 of its children as viewport overflow on mobile, and I very
   * nearly "fixed" a rail that was never broken.
   *
   * `hidden` deliberately does NOT count: that clips content the user cannot
   * scroll to, which is a real defect and the thing `.pk-home` is suspected of.
   */
  const inScroller = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const ox = getComputedStyle(p).overflowX;
      if (ox === 'auto' || ox === 'scroll') return true;
    }
    return false;
  };

  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) continue;
    if (r.right <= cw + 1 && r.left >= -1) continue;
    if (inScroller(el)) continue;
    const sel = `${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 3).join('.')}`;
    const prev = seen.get(sel);
    if (!prev || r.right > prev.right) {
      seen.set(sel, {
        sel,
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width),
        viewport: cw,
      });
    }
  }
  return [...seen.values()].sort((a, b) => b.right - a.right);
}

/**
 * Neutralises the clipping wrappers.
 *
 * Needed only for `document.scrollWidth` assertions, which a clipping
 * ancestor silently falsifies. `findOverflow` does not need it.
 */
export const overflowClipCss =
  '.pk-home,.pk-collection,.pk-product{overflow:visible !important}';

/** Document width vs viewport width — meaningless unless clipping is off. */
export function measureScrollWidth() {
  const de = document.documentElement;
  return {scrollWidth: de.scrollWidth, clientWidth: de.clientWidth};
}

/**
 * Images whose rendered box disagrees with the file's own aspect ratio.
 *
 * Only `object-fit: fill` distorts — `contain` letterboxes and `cover` crops,
 * both of which are legitimate choices. The header logo failed this for
 * months: a 1200x360 file forced into a 120x32 box, stretched 12.5%.
 */
export function findDistortedImages(tolerance = 0.02) {
  const out = [];
  for (const img of document.querySelectorAll('img')) {
    if (!img.naturalWidth || !img.clientWidth || !img.clientHeight) continue;
    if (getComputedStyle(img).objectFit !== 'fill') continue;
    const natural = img.naturalWidth / img.naturalHeight;
    const rendered = img.clientWidth / img.clientHeight;
    const skew = rendered / natural - 1;
    if (Math.abs(skew) > tolerance) {
      out.push({
        src: (img.currentSrc || img.src).split('?')[0].split('/').pop(),
        natural: `${img.naturalWidth}x${img.naturalHeight}`,
        rendered: `${img.clientWidth}x${img.clientHeight}`,
        skewPct: Number((skew * 100).toFixed(1)),
      });
    }
  }
  return out;
}

/**
 * Interactive controls smaller than WCAG 2.2 SC 2.5.8's 24x24 minimum.
 *
 * Skips controls that are visually hidden or inert, and skips the full-screen
 * backdrop buttons that drawers use, which are intentionally not targets.
 */
export function findSmallTargets(min = 24) {
  const out = [];
  const sel = 'a[href], button, [role="button"], input:not([type="hidden"]), select';

  /**
   * SC 2.5.8's "Inline" exception: a target inside a sentence is exempt,
   * because its size is constrained by the line-height of the text around it.
   *
   * The PDP's "contact page" link sits mid-paragraph and measured 83x18. It is
   * not a violation, and padding it to 24px would push the surrounding line
   * apart. Scoped to `<p>` deliberately: breadcrumbs live in a `<nav>` and are
   * a navigation trail rather than a sentence, so they stay covered — they
   * were a real 34x20 failure and are fixed, not excused.
   */
  const inSentence = (el) => {
    if (getComputedStyle(el).display !== 'inline') return false;
    const p = el.closest('p');
    if (!p) return false;
    // Guard against a <p> used as a bare wrapper for a single link: the
    // exception is about running prose, not about markup choice.
    const own = (el.textContent || '').trim().length;
    return (p.textContent || '').trim().length > own + 20;
  };

  for (const el of document.querySelectorAll(sel)) {
    if (el.closest('[inert],[aria-hidden="true"]')) continue;
    if (el.tabIndex < 0) continue;
    if (inSentence(el)) continue;
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none' || s.opacity === '0') continue;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) continue;
    if (r.width >= min && r.height >= min) continue;
    out.push({
      sel: `${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 3).join('.')}`,
      label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30),
      size: `${Math.round(r.width)}x${Math.round(r.height)}`,
    });
  }
  return out;
}

/**
 * Images served at fewer pixels than the box needs.
 *
 * Deliberately reads `currentSrc`'s `width=` parameter rather than
 * `naturalWidth`. On a `srcset` image `naturalWidth` is DENSITY-CORRECTED —
 * it returns the CSS-pixel intrinsic size, not the file's size — so
 * `naturalWidth / (clientWidth * dpr)` looks catastrophic on a perfectly
 * well-served image. That mistake cost this project a wrong diagnosis and an
 * abandoned plan to re-shoot the whole catalog; the real ratio was 1.13.
 */
export function findUnderservedImages(floor = 0.9) {
  const dpr = window.devicePixelRatio || 1;
  const out = [];
  for (const img of document.querySelectorAll('img')) {
    if (!img.clientWidth) continue;
    const src = img.currentSrc || img.src;
    if (/\.svg(\?|$)/.test(src)) continue;
    const m = src.match(/[?&]width=(\d+)/);
    if (!m) continue;
    const delivered = Number(m[1]);
    const needed = img.clientWidth * dpr;
    const ratio = delivered / needed;
    if (ratio < floor) {
      out.push({
        src: src.split('?')[0].split('/').pop(),
        delivered,
        needed: Math.round(needed),
        ratio: Number(ratio.toFixed(2)),
      });
    }
  }
  return out;
}
