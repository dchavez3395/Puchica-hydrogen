// WCAG 1.4.4 Resize Text (200%), 1.4.10 Reflow (320 CSS px) and 1.4.12 Text
// Spacing: load each production route at 320px wide, with CSS zoom 2 (the
// browser's 200% text zoom at a 640px window is equivalent), and at 390px
// with the 1.4.12 overrides applied (line-height 1.5, paragraph spacing 2em,
// letter-spacing 0.12em, word-spacing 0.16em), and report clipped text,
// horizontal overflow, and overlapping interactive controls.
//   node scripts/browser/zoom-reflow.mjs [base]
import {chromium} from '@playwright/test';

const BASE = process.argv[2] || 'https://puchica.ca';
const ROUTES = ['/', '/collections/all', '/products/woven-bamboo-globe-pendant-25cm', '/pages/about', '/cart'];
const browser = await chromium.launch();
let problems = 0;

const probe = () => {
  const cw = document.documentElement.clientWidth;
  const out = {overflow: [], clipped: [], overlaps: []};
  const sel = (el) => `${el.tagName.toLowerCase()}${el.className ? '.' + String(el.className).split(' ').filter(Boolean).slice(0, 2).join('.') : ''}`;
  const inScroller = (el) => { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll') return true; } return false; };
  if (document.documentElement.scrollWidth > cw + 2) out.overflow.push({scrollWidth: document.documentElement.scrollWidth, cw});
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) continue;
    // 1px boxes are the visually-hidden pattern (sr-only, honeypot): meant to clip.
    if (r.width <= 2 || r.height <= 2 || el.clientHeight <= 2 || el.clientWidth <= 2) continue;
    if (r.right > cw + 2 && !inScroller(el)) out.overflow.push({sel: sel(el), right: Math.round(r.right), cw});
    const cs = getComputedStyle(el);
    // text cut off by overflow:hidden on a fixed-height box
    if (cs.overflow === 'hidden' || cs.overflowY === 'hidden') {
      if (el.scrollHeight > el.clientHeight + 4 && el.textContent.trim().length > 0 && !/^(html|body)$/i.test(el.tagName) && !el.querySelector('img,video,svg')) {
        out.clipped.push({sel: sel(el), scrollHeight: el.scrollHeight, clientHeight: el.clientHeight});
      }
    }
  }
  // The part of an element a user can actually see: its box clipped by every
  // overflow:hidden/clip ancestor. Text inside a collapsed disclosure keeps a
  // real bounding box that can land anywhere on the page; it is not a control
  // anyone can hit.
  const visibleRect = (el) => {
    let r = el.getBoundingClientRect();
    let box = {left: r.left, top: r.top, right: r.right, bottom: r.bottom};
    for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (!/hidden|clip/.test(cs.overflow + cs.overflowX + cs.overflowY)) continue;
      const pr = p.getBoundingClientRect();
      box = {left: Math.max(box.left, pr.left), top: Math.max(box.top, pr.top), right: Math.min(box.right, pr.right), bottom: Math.min(box.bottom, pr.bottom)};
      if (box.right <= box.left || box.bottom <= box.top) return null;
    }
    return {left: box.left, top: box.top, right: box.right, bottom: box.bottom, width: box.right - box.left, height: box.bottom - box.top};
  };
  // overlapping interactive controls (buttons/links that intersect > 30%)
  const ctrls = [...document.querySelectorAll('a[href],button,input,select,textarea')].filter((e) => { const r = visibleRect(e); return r && r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; });
  for (let i = 0; i < ctrls.length; i++) for (let j = i + 1; j < ctrls.length; j++) {
    if (ctrls[i].contains(ctrls[j]) || ctrls[j].contains(ctrls[i])) continue;
    const a = visibleRect(ctrls[i]), b = visibleRect(ctrls[j]);
    const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    const iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    const inter = ix * iy; const min = Math.min(a.width * a.height, b.width * b.height);
    if (min > 0 && inter / min > 0.3) out.overlaps.push({a: sel(ctrls[i]), b: sel(ctrls[j])});
  }
  return out;
};

// The 1.4.12 test: these overrides, as the WCAG bookmarklet applies them, must not
// clip or overlap content. !important so they beat every component rule.
const TEXT_SPACING_CSS = `* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }`;

const PASSES = [
  ['320px', {width: 320, height: 800}, 1, ''],
  ['200% zoom', {width: 640, height: 900}, 2, ''],
  ['text spacing', {width: 390, height: 844}, 1, TEXT_SPACING_CSS],
];

for (const [label, viewport, zoom, extraCss] of PASSES) {
  const ctx = await browser.newContext({viewport, extraHTTPHeaders: {'oxygen-buyer-country': 'CA'}});
  const page = await ctx.newPage();
  for (const route of ROUTES) {
    await page.goto(BASE + route, {waitUntil: 'networkidle'});
    if (zoom !== 1) { await page.addStyleTag({content: `html{zoom:${zoom}}`}); await page.waitForTimeout(400); }
    if (extraCss) { await page.addStyleTag({content: extraCss}); await page.waitForTimeout(400); }
    const r = await page.evaluate(probe);
    const n = r.overflow.length + r.clipped.length + r.overlaps.length;
    problems += n;
    console.log(`${label.padEnd(13)} ${route.padEnd(44)} overflow=${r.overflow.length} clipped=${r.clipped.length} overlaps=${r.overlaps.length}`);
    for (const o of r.overflow.slice(0, 5)) console.log('    overflow', JSON.stringify(o));
    for (const c of r.clipped.slice(0, 5)) console.log('    clipped ', JSON.stringify(c));
    for (const o of r.overlaps.slice(0, 5)) console.log('    overlap ', JSON.stringify(o));
  }
  await ctx.close();
}
await browser.close();
console.log(`\nproblems: ${problems}`);
process.exit(problems ? 1 : 0);
