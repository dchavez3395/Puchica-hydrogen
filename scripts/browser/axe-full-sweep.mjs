// Full-impact axe sweep of the live storefront (all impacts, not just serious/critical),
// desktop + 390px mobile, five routes. Output: JSON summary per route.
import {readFileSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {chromium} from '@playwright/test';

const require = createRequire(import.meta.url);
const AXE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const BASE = 'https://puchica.ca';
const ROUTES = ['/', '/collections/all', '/products/woven-bamboo-globe-pendant-25cm', '/pages/about', '/pages/shipping', '/cart', '/search?q=pendant'];
const VIEWPORTS = [{name: 'desktop', width: 1440, height: 900}, {name: 'mobile', width: 390, height: 844}];

const browser = await chromium.launch();
const out = [];
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({viewport: {width: vp.width, height: vp.height}, bypassCSP: true});
  const page = await ctx.newPage();
  for (const route of ROUTES) {
    await page.goto(BASE + route, {waitUntil: 'networkidle'});
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    await page.addScriptTag({content: AXE});
    const res = await page.evaluate(() => window.axe.run(document, {runOnly: {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']}}));
    for (const v of res.violations) {
      out.push({viewport: vp.name, route, id: v.id, impact: v.impact, tags: v.tags.filter(t => /wcag\d|best/.test(t)).join(' '), help: v.help, nodes: v.nodes.length, sample: v.nodes[0]?.target?.join(' ') ?? '', summary: v.nodes[0]?.failureSummary?.slice(0, 220) ?? ''});
    }
    // headings + landmarks snapshot for 1.3.1 / 2.4.6
    const hs = await page.evaluate(() => [...document.querySelectorAll('h1,h2,h3')].map(h => h.tagName + ': ' + h.textContent.trim().slice(0, 60)));
    const lm = await page.evaluate(() => [...document.querySelectorAll('header,nav,main,footer,[role]')].map(e => (e.getAttribute('role') || e.tagName.toLowerCase()) + (e.getAttribute('aria-label') ? ' [' + e.getAttribute('aria-label') + ']' : '')));
    const skip = await page.evaluate(() => !!document.querySelector('a[href^="#"][class*="skip"], a[href="#main"], a[href="#content"], a[href="#mainContent"]'));
    const lang = await page.evaluate(() => document.documentElement.lang);
    const title = await page.title();
    out.push({viewport: vp.name, route, id: '_snapshot', title, lang, skipLink: skip, headings: hs, landmarks: lm});
  }
  await ctx.close();
}
await browser.close();
writeFileSync(new URL('../../work/axe-full.json', import.meta.url), JSON.stringify(out, null, 1));
const viol = out.filter(o => o.id !== '_snapshot');
console.log('violations:', viol.length);
for (const v of viol) console.log(`${v.viewport} ${v.route} ${v.impact} ${v.id} x${v.nodes} — ${v.help} — ${v.sample}`);
for (const s of out.filter(o => o.id === '_snapshot' && o.viewport === 'desktop')) console.log(`\n${s.route} | title="${s.title}" lang=${s.lang} skip=${s.skipLink}\n  ${s.headings.join('\n  ')}\n  landmarks: ${s.landmarks.join(', ')}`);
