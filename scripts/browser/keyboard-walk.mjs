// Keyboard walk-through of the live storefront for the accessibility sheet
// (SC 2.1.1 Keyboard, 2.1.2 No Keyboard Trap, 2.4.3 Focus Order, 2.4.7 Focus
// Visible, 2.4.11 Focus Not Obscured). Tabs through home, the PDP and the
// cart drawer, recording every focused element, whether its focus indicator
// is visible (outline or box-shadow, not 'none'), and whether the sticky
// header covers it. Prints one line per stop and a summary; exit 1 on a trap,
// an invisible indicator, or an obscured target.
//
//   node scripts/browser/keyboard-walk.mjs [base]
import {chromium} from '@playwright/test';

const BASE = process.argv[2] || 'https://puchica.ca';
const ROUTES = ['/', '/products/woven-bamboo-globe-pendant-25cm', '/collections/all'];
const MAX_TABS = 80;

const browser = await chromium.launch();
const ctx = await browser.newContext({viewport: {width: 1280, height: 800}, extraHTTPHeaders: {'oxygen-buyer-country': 'CA'}});
const page = await ctx.newPage();
let problems = 0;

const describe = () =>
  page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return {tag: 'BODY'};
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const header = document.querySelector('.pk-header');
    const hb = header ? header.getBoundingClientRect() : null;
    const hz = header ? parseInt(getComputedStyle(header).zIndex, 10) || 0 : 0;
    const ez = parseInt(cs.zIndex, 10) || 0;
    const obscured = !!hb && ez <= hz && r.top < hb.bottom && r.bottom > hb.top && r.height > 0 && r.top >= 0 && header.contains(el) === false && cs.position !== 'fixed';
    const visibleRing = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow && cs.boxShadow !== 'none');
    const label = (el.getAttribute('aria-label') || el.textContent || el.value || '').trim().replace(/\s+/g, ' ').slice(0, 50);
    const inDialog = !!el.closest('[role="dialog"], dialog, .pk-aside, aside');
    return {tag: el.tagName, cls: (el.className || '').toString().split(' ')[0], label, visibleRing, obscured, inDialog, offscreen: r.bottom < 0 || r.top > window.innerHeight};
  });

async function walk(route, opts = {}) {
  await page.goto(BASE + route, {waitUntil: 'networkidle'});
  await page.keyboard.press('Tab');
  const seen = [];
  let trap = false;
  for (let i = 0; i < MAX_TABS; i++) {
    const d = await describe();
    if (d.tag === 'BODY' && i > 0) break; // wrapped around
    const key = `${d.tag}.${d.cls}:${d.label}`;
    if (seen.length > 3 && seen.slice(-3).every((k) => k === key)) { trap = true; break; }
    seen.push(key);
    const flag = !d.visibleRing ? ' NO-RING' : '';
    const obs = d.obscured ? ' OBSCURED-BY-HEADER' : '';
    if (flag || obs) problems++;
    console.log(`${route} #${String(i + 1).padStart(2)} ${d.tag.padEnd(7)} ${(d.cls || '').padEnd(28)} ${d.label.padEnd(50)}${flag}${obs}`);
    if (opts.openCartAt && d.label.toLowerCase().includes(opts.openCartAt)) {
      await page.keyboard.press('Enter');
      const opened = await page.waitForSelector('.overlay.expanded', {timeout: 6000}).then(() => true).catch(() => false);
      console.log(`${route}   cart drawer opened after Enter: ${opened}`);
      if (!opened) problems++;
      await page.waitForTimeout(300);
      const inside = [];
      for (let j = 0; j < 12; j++) {
        await page.keyboard.press('Tab');
        const e = await describe();
        inside.push(e.inDialog);
        console.log(`${route}   cart-drawer tab ${j + 1}: ${e.tag} ${e.cls} ${e.label}${e.visibleRing ? '' : ' NO-RING'}${e.inDialog ? '' : ' LEFT-DIALOG'}`);
        if (!e.visibleRing) problems++;
      }
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
      const after = await describe();
      console.log(`${route}   after Escape focus -> ${after.tag} ${after.cls} ${after.label}`);
      if (!inside.every(Boolean)) { console.log(`${route}   FOCUS ESCAPED THE CART DRAWER`); problems++; }
      break;
    }
    await page.keyboard.press('Tab');
  }
  if (trap) { console.log(`${route} KEYBOARD TRAP after ${seen.length} stops`); problems++; }
  console.log(`${route} stops: ${seen.length}${trap ? ' (trap)' : ''}`);
}

for (const r of ROUTES) await walk(r, r.startsWith('/products') ? {openCartAt: 'add to cart'} : {});
await browser.close();
console.log(`\nproblems: ${problems}`);
process.exit(problems ? 1 : 0);
