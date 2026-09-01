/**
 * WCAG and layout checks against the deployed storefront.
 *
 * Run by `npm run browser-check`, and in CI after the Oxygen deploy. These
 * replace nothing in tests/*.test.js — those are regex assertions over source
 * text, which cannot see contrast, focus order, computed ARIA state, or a
 * single pixel of layout. This file is the first thing in the repo that
 * actually renders the site and looks at it.
 */
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';

import {expect, test} from '@playwright/test';

import {
  findDistortedImages,
  findOverflow,
  findSmallTargets,
  findUnderservedImages,
} from './probes.js';

const require = createRequire(import.meta.url);
const AXE_SOURCE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const ROUTES = [
  {name: 'home', path: '/'},
  {name: 'collection', path: '/collections/all'},
  {name: 'product', path: '/products/travel-cable-organizer-case'},
  {name: 'cart', path: '/cart'},
];

const VIEWPORTS = [
  // SC 1.4.10 (Reflow) is specified at 320 CSS px, and until 2026-09-01 the
  // narrowest viewport here was 390 - so the one width the criterion actually
  // names was the one width never exercised. Dry-run against production on
  // 2026-09-01 before adding it: overflow, tap targets, image distortion and
  // image resolution all came back clean on all four routes at 320.
  {name: 'reflow320', width: 320, height: 800},
  {name: 'mobile', width: 390, height: 844},
  {name: 'tablet', width: 768, height: 1024},
  {name: 'desktop', width: 1440, height: 900},
  {name: 'wide', width: 1920, height: 1080},
];

/** Load a route and let lazy content settle before measuring. */
async function open(page, path) {
  await page.goto(path, {waitUntil: 'networkidle'});
  // Below-the-fold imagery is lazy; without this the image probes measure a
  // page that has barely rendered and report a falsely clean result.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
}

for (const viewport of VIEWPORTS) {
  test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
    test.use({viewport: {width: viewport.width, height: viewport.height}});

    for (const route of ROUTES) {
      test(`${route.name} has no serious or critical WCAG violations`, async ({page}) => {
        await open(page, route.path);
        await page.addScriptTag({content: AXE_SOURCE});
        const results = await page.evaluate(async () =>
          window.axe.run(document, {
            runOnly: {
              type: 'tag',
              values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
            },
          }),
        );

        const blocking = results.violations.filter((v) =>
          ['serious', 'critical'].includes(v.impact),
        );
        // Minor and moderate findings are surfaced but do not fail the run
        // yet. Tighten to 'moderate' once the first backlog is cleared; a
        // check that is red on day one teaches everyone to ignore it.
        const summary = blocking.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.length,
          example: v.nodes[0]?.target?.join(' '),
          help: v.help,
        }));
        expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
      });

      test(`${route.name} keeps its content inside the viewport`, async ({page}) => {
        await open(page, route.path);
        const overflowing = await page.evaluate(`(${findOverflow.toString()})()`);
        expect(overflowing, JSON.stringify(overflowing, null, 2)).toEqual([]);
      });

      test(`${route.name} does not distort any image`, async ({page}) => {
        await open(page, route.path);
        const distorted = await page.evaluate(`(${findDistortedImages.toString()})()`);
        expect(distorted, JSON.stringify(distorted, null, 2)).toEqual([]);
      });

      test(`${route.name} serves images at the resolution the layout needs`, async ({page}) => {
        await open(page, route.path);
        const underserved = await page.evaluate(`(${findUnderservedImages.toString()})()`);
        expect(underserved, JSON.stringify(underserved, null, 2)).toEqual([]);
      });
    }
  });
}

test.describe('mobile target sizes', () => {
  test.use({viewport: {width: 390, height: 844}});

  for (const route of ROUTES) {
    test(`${route.name} controls meet the 24px minimum`, async ({page}) => {
      // WCAG 2.2 SC 2.5.8. axe does not cover this criterion, so it is
      // measured directly.
      await open(page, route.path);
      const small = await page.evaluate(`(${findSmallTargets.toString()})()`);
      expect(small, JSON.stringify(small, null, 2)).toEqual([]);
    });
  }
});
