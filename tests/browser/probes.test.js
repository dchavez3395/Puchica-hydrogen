/**
 * Tests for the probes themselves — run by `npm test`, no network needed.
 *
 * The probes' real job is to run against production, which CI can reach but a
 * dev container cannot, and which cannot be framed (`frame-ancestors 'none'`).
 * So the only place their detection logic can be proven is here, against a
 * fixture built to be broken in each specific way. Without this, a probe that
 * silently matched nothing would look exactly like a clean site.
 *
 * Chromium comes from PLAYWRIGHT_BROWSERS_PATH when set (it is, in this
 * container and in CI after `playwright install`); the whole file skips if no
 * browser is available, so `npm test` still passes on a machine without one.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  findDistortedImages,
  findOverflow,
  findSmallTargets,
  measureScrollWidth,
  findUnderservedImages,
  overflowClipCss,
} from './probes.js';

const FIXTURE = new URL('./fixture.html', import.meta.url).href;

let chromium;
try {
  ({chromium} = await import('@playwright/test'));
} catch {
  chromium = null;
}

/**
 * A Chromium this machine actually has.
 *
 * CI runs `playwright install`, so the bundled default is correct there and
 * this returns undefined. The dev container ships a pinned Chromium under
 * PLAYWRIGHT_BROWSERS_PATH whose build number rarely matches what the
 * installed Playwright expects, and re-downloading is blocked; pointing at it
 * explicitly lets the same tests run in both places.
 */
async function executablePath() {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!root) return undefined;
  const {readdir, access} = await import('node:fs/promises');
  const {join} = await import('node:path');
  let entries;
  try {
    entries = await readdir(root);
  } catch {
    return undefined;
  }
  for (const dir of entries.filter((d) => /^chromium-\d+$/.test(d))) {
    const candidate = join(root, dir, 'chrome-linux', 'chrome');
    try {
      await access(candidate);
      return candidate;
    } catch {
      /* try the next build */
    }
  }
  return undefined;
}

/** Run a probe inside a page loaded with the fixture. */
async function onFixture(fn, {extraCss} = {}) {
  const browser = await chromium.launch({executablePath: await executablePath()});
  try {
    const page = await browser.newPage({viewport: {width: 800, height: 600}});
    await page.goto(FIXTURE);
    if (extraCss) await page.addStyleTag({content: extraCss});
    return await page.evaluate(`(${fn.toString()})()`);
  } finally {
    await browser.close();
  }
}

/**
 * Whether a Chromium can actually be launched here, not merely imported.
 *
 * The first version of this guard only checked that `@playwright/test`
 * resolved, which is true the moment `npm ci` finishes — the browser binary is
 * a separate download. CI ran `npm test` before `playwright install`, all five
 * browser-backed tests threw instead of skipping, and the deploy was blocked.
 * The workflow now installs Chromium first so these genuinely run in CI; this
 * guard is the backstop for a machine that has no browser at all.
 */
async function browserUnavailable() {
  if (!chromium) return 'playwright is not installed';
  try {
    const browser = await chromium.launch({executablePath: await executablePath()});
    await browser.close();
    return false;
  } catch (error) {
    const first = String(error).split('\n')[0].slice(0, 120);
    // Loud on purpose: a permanently-skipping suite is indistinguishable from
    // a passing one in the summary line, which is how this got shipped.
    console.warn(`[probes] skipping browser tests — ${first}`);
    return `chromium could not launch: ${first}`;
  }
}

const skip = await browserUnavailable();

test('the overflow probe sees through a clipping ancestor', {skip}, async () => {
  // This is what the fixture proved and I had assumed the opposite of:
  // `overflow: hidden` clips painting and scrolling, not layout, so
  // getBoundingClientRect() still reports the full unclipped box. The probe
  // therefore needs no neutraliser — which also means the zero-overflow
  // readings taken on the live site were already trustworthy.
  const found = await onFixture(findOverflow);
  assert.equal(found.length, 1, 'clipping must not hide overflow from geometry');
  assert.match(found[0].sel, /runs-over/);
  assert.ok(
    found[0].right > found[0].viewport,
    'the reported element must actually exceed the viewport',
  );
});

test('scrollWidth IS fooled by a clipping ancestor, and the neutraliser fixes it', {skip}, async () => {
  // The other half, and the reason overflowClipCss exists at all. Any check
  // built on scrollWidth reads a clipped page as clean.
  const clipped = await onFixture(measureScrollWidth);
  assert.equal(
    clipped.scrollWidth,
    clipped.clientWidth,
    'a clipped page must look clean to scrollWidth — that is the trap',
  );

  const released = await onFixture(measureScrollWidth, {extraCss: overflowClipCss});
  assert.ok(
    released.scrollWidth > released.clientWidth,
    'with clipping off, scrollWidth must reveal the overflow',
  );
});

test('the distortion probe finds a stretched image and spares a letterboxed one', {skip}, async () => {
  const found = await onFixture(findDistortedImages);
  // Two <img> tags share the same 40x10 file in a 40x40 box. Only the one
  // left at the default `object-fit: fill` is distorted; `contain`
  // letterboxes, which is a legitimate choice and must not be reported.
  assert.equal(found.length, 1, 'exactly one image is distorted');
  assert.equal(found[0].natural, '40x10');
  assert.equal(found[0].rendered, '40x40');
  // skew = rendered AR / natural AR - 1 = (40/40) / (40/10) - 1 = -0.75.
  // Negative means squashed horizontally relative to the file; the header
  // logo's real-world failure was the other sign, +12.5% (3.75:1 box for a
  // 3.333:1 file). Both directions must be caught, hence Math.abs().
  assert.equal(found[0].skewPct, -75);
});

test('the target-size probe finds the small control and spares the rest', {skip}, async () => {
  const found = await onFixture(findSmallTargets);
  // 20x24 fails on width. The 44x44 button passes, the display:none button is
  // not rendered, and the 8x8 one is tabindex="-1" so it is not a target.
  assert.equal(found.length, 1);
  assert.equal(found[0].size, '20x24');
  assert.equal(found[0].label, 'too small');
});

test('the resolution probe ignores images with no width parameter', {skip}, async () => {
  // The fixture's images are data: URLs with no `width=`, which is the same
  // shape as any non-Shopify asset. Reporting those would be noise.
  const found = await onFixture(findUnderservedImages);
  assert.deepEqual(found, []);
});

test('the resolution probe reads the delivered width, not naturalWidth', {skip}, async () => {
  // Guarding the exact mistake that produced a wrong diagnosis: on a srcset
  // image `naturalWidth` is density-corrected, so it reports the CSS-pixel
  // size rather than the file's. A probe built on naturalWidth calls a
  // correctly-served 2000px file a 0.34x failure.
  const source = await import('node:fs/promises').then((fs) =>
    fs.readFile(new URL('./probes.js', import.meta.url), 'utf8'),
  );
  const body = source.slice(source.indexOf('export function findUnderservedImages'));
  assert.match(body, /currentSrc/);
  assert.doesNotMatch(
    body.slice(0, body.indexOf('\n}')),
    /naturalWidth\s*\/\s*\(/,
    'must not compute a ratio from naturalWidth',
  );
});
