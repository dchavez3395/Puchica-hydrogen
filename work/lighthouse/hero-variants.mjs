// A/B the home page's critical-request mix without deploying: rewrite the HTML
// in flight (route interception) and measure LCP under the same throttling the
// other probes use (1.6 Mbps / 150 ms / 4x CPU, Moto G4). Three runs per
// variant, median reported.
//   node work/lighthouse/hero-variants.mjs
import {chromium, devices} from '@playwright/test';

const URL = 'https://puchica.ca/';
const RUNS = 3;
const VARIANTS = {
  'as-is': (html) => html,
  // Six modulepreload links fetch the client bundle at high priority while the
  // hero image is still downloading.
  'no modulepreload': (html) => html.replace(/<link rel="modulepreload"[^>]*>/g, ''),
  // The phone preload offers 412w and 640w; at DPR 3 the browser takes 640w
  // (73 KB) for a 360 px-wide box behind a gradient.
  'hero 412 only': (html) => html.replace(/width=640&amp;height=853&crop=center 640w|,\s*https:\/\/[^"\s]+width=640&amp;height=853[^"\s]*\s640w/g, ''),
};

const browser = await chromium.launch();
async function measure(rewrite) {
  const ctx = await browser.newContext({...devices['Moto G4'], extraHTTPHeaders: {'oxygen-buyer-country': 'CA'}});
  const page = await ctx.newPage();
  await page.route(URL, async (route) => {
    const res = await route.fetch();
    const body = rewrite(await res.text());
    await route.fulfill({response: res, body, headers: {...res.headers(), 'content-length': String(Buffer.byteLength(body))}});
  });
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8});
  await cdp.send('Emulation.setCPUThrottlingRate', {rate: 4});
  await page.addInitScript(() => {
    window.__lcp = [];
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp.push({t: Math.round(e.startTime), tag: e.element?.tagName, url: (e.url || '').slice(-40)}); }).observe({type: 'largest-contentful-paint', buffered: true});
    window.__cls = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({type: 'layout-shift', buffered: true});
  });
  await page.goto(URL, {waitUntil: 'networkidle'});
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => {
    // When the client bundle finished arriving: the cost side of removing the
    // module preloads. Hydration cannot start before this.
    const js = performance.getEntriesByType('resource').filter((e) => /\.js(\?|$)/.test(e.name));
    const jsDone = js.length ? Math.round(Math.max(...js.map((e) => e.responseEnd))) : 0;
    return {lcp: window.__lcp.at(-1), fcp: Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0), cls: Math.round(window.__cls * 1000) / 1000, jsDone};
  });
  await ctx.close();
  return r;
}

for (const [name, rewrite] of Object.entries(VARIANTS)) {
  const rs = [];
  for (let i = 0; i < RUNS; i++) rs.push(await measure(rewrite));
  const lcps = rs.map((r) => r.lcp?.t || 0).sort((a, b) => a - b);
  const fcps = rs.map((r) => r.fcp).sort((a, b) => a - b);
  const jsd = rs.map((r) => r.jsDone).sort((a, b) => a - b);
  console.log(`${name.padEnd(22)} LCP median ${lcps[1]} ms (${lcps.join('/')})  FCP ${fcps[1]} ms  JS done ${jsd[1]} ms  CLS ${rs.map((r) => r.cls).join('/')}`);
}
await browser.close();
