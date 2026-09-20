// Screen-reader walk-through of the live storefront with a real copy of NVDA
// (guidepup drives NVDA and captures what it speaks). Reads the product page
// top to bottom in browse mode, tabs to Add to cart and presses it, then reads
// the footer newsletter form. Writes the transcript to work/nvda/<date>/ and
// asserts the things a script can assert: the H1 is a level-1 heading, the
// price is spoken close to the name, Add to cart is a button, the add and the
// cart dialog are announced, the email field has its label, nothing is spoken
// twice in a row. Whether the transcript *reads well* is still a human
// judgement — read the file.
//
// Needs a desktop session (NVDA cannot run headless) and the guidepup NVDA
// build: npx @guidepup/setup install && npx @guidepup/setup setup. NVDA reads
// whichever window is in front, so the script keeps re-raising the browser;
// if a transcript line is clearly another app, that is focus drift, not the
// site.
//
//   node scripts/browser/nvda-walk.mjs [base]
import {chromium} from '@playwright/test';
import {nvda} from '@guidepup/guidepup';
import {mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const BASE = process.argv[2] || 'https://puchica.ca';
const PDP = '/products/woven-bamboo-globe-pendant-25cm';
const MAX_ITEMS = 220;
const OUT_DIR = join('work', 'nvda', new Date().toISOString().slice(0, 10));
mkdirSync(OUT_DIR, {recursive: true});

const problems = [];
const fail = (msg) => {
  problems.push(msg);
  console.log(`  FAIL ${msg}`);
};
const pass = (msg) => console.log(`  ok   ${msg}`);
const clean = (s) => s.replace(/\s+/g, ' ').trim();
const save = (name, lines) => writeFileSync(join(OUT_DIR, name), lines.join('\n') + '\n');

const browser = await chromium.launch({headless: false});
const ctx = await browser.newContext({
  viewport: {width: 1280, height: 900},
  extraHTTPHeaders: {'oxygen-buyer-country': 'CA'},
});
const page = await ctx.newPage();
await page.goto(BASE + PDP, {waitUntil: 'networkidle'});
await page.bringToFront();

const drawerOpen = () => page.evaluate(() => !!document.querySelector('.overlay.expanded'));
const focusedNow = () =>
  page.evaluate(() => {
    const el = document.activeElement;
    return el && el !== document.body ? `${el.tagName} ${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40)}` : 'BODY';
  });

// Read forward in browse mode until the footer landmark or the item cap.
async function readPage(label) {
  await nvda.clearSpokenPhraseLog();
  const phrases = [];
  for (let i = 0; i < MAX_ITEMS; i++) {
    if (i % 10 === 0) await page.bringToFront();
    await nvda.next();
    const p = clean(await nvda.lastSpokenPhrase());
    if (!p) continue;
    phrases.push(p);
    if (/content info landmark|contentinfo/i.test(p) && i > 20) break;
  }
  save(`${label}.txt`, phrases);
  console.log(`  ${phrases.length} phrases → ${OUT_DIR}/${label}.txt`);
  return phrases;
}

await nvda.start();
try {
  await page.waitForTimeout(1500);
  await page.bringToFront();
  await nvda.press('Control+Home');
  await page.waitForTimeout(500);

  console.log(`\n== ${PDP} read top to bottom`);
  const pdp = await readPage('pdp-read');

  const h1At = pdp.findIndex((p) => /heading,? level 1/i.test(p) && /globe pendant/i.test(p));
  h1At >= 0 ? pass(`H1 spoken as heading level 1 (#${h1At + 1}: ${pdp[h1At]})`) : fail('H1 not spoken as "heading, level 1" with the product name');

  const priceAt = pdp.findIndex((p, i) => i > h1At && /CA\$\s?\d+|\$\s?\d+|\d+\s?dollars/i.test(p));
  if (h1At >= 0 && priceAt >= 0 && priceAt - h1At <= 12) pass(`price spoken ${priceAt - h1At} items after the name (${pdp[priceAt]})`);
  else fail(`price not spoken within 12 items of the name (found at ${priceAt + 1})`);

  const atcAt = pdp.findIndex((p) => /add to cart/i.test(p) && /button/i.test(p));
  atcAt >= 0 ? pass(`Add to cart spoken as a button (#${atcAt + 1}: ${pdp[atcAt]})`) : fail('Add to cart not spoken as a button in the page read');

  const factsAt = pdp.findIndex((p) => /^size/i.test(p) || /size and fitting/i.test(p));
  factsAt >= 0 ? pass(`facts row reached (${pdp[factsAt]})`) : fail('facts row (Size …) not spoken');

  const dupes = pdp.filter((p, i) => i > 0 && p === pdp[i - 1] && p.length > 12);
  dupes.length === 0 ? pass('nothing spoken twice in a row') : fail(`spoken twice in a row: ${[...new Set(dupes)].slice(0, 3).join(' | ')}`);

  const drift = pdp.filter((p) => /shell command|nvda-walk|ctrl plus/i.test(p));
  if (drift.length) console.log(`  note ${drift.length} line(s) are another window (focus drift), ignore them`);

  // Add to cart through the keyboard, as a screen-reader user would.
  console.log('\n== Add to cart');
  await page.bringToFront();
  await nvda.press('Control+Home');
  await page.waitForTimeout(300);
  await nvda.clearSpokenPhraseLog();
  let focusedAtc = false;
  for (let i = 0; i < 60; i++) {
    await nvda.press('Tab');
    const p = clean(await nvda.lastSpokenPhrase());
    if (/add to cart/i.test(p) && /button/i.test(p)) { focusedAtc = true; break; }
  }
  if (!focusedAtc) fail('could not Tab to the Add to cart button');
  else {
    pass(`Tab reaches Add to cart (focus: ${await focusedNow()})`);
    // guidepup only records speech inside a command's capture window, so the
    // add (which resolves ~1 s after Enter) and the drawer opening are
    // captured by making one command out of the key press plus a wait.
    const {spokenPhrase} = await nvda.capture(async () => {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(4000);
    }, {capture: true});
    const log = spokenPhrase.split('. ').map(clean).filter(Boolean);
    save('add-to-cart.txt', log);
    const adding = log.find((p) => /adding/i.test(p));
    const added = log.find((p) => /added|púchica!/i.test(p) && !/adding/i.test(p));
    adding ? pass(`"${adding}" announced`) : fail('"Adding…" not announced');
    added ? pass(`"${added}" announced`) : fail('"Added — ¡púchica!" not announced (live region text lost when the drawer opened?)');
    const dialog = log.find((p) => /dialog/i.test(p));
    dialog ? pass(`cart dialog announced: "${dialog}"`) : fail('cart drawer not announced as a dialog after opening');
    const open = await drawerOpen();
    open ? pass(`drawer is open (focus: ${await focusedNow()})`) : fail('drawer did not open');
    if (open) {
      await nvda.press('Escape');
      await page.waitForTimeout(600);
      (await drawerOpen()) ? fail(`Escape did not close the drawer (focus: ${await focusedNow()})`) : pass(`Escape closes the drawer (focus returns to: ${await focusedNow()})`);
    }
  }

  // Newsletter form in the footer: labels must be spoken with the fields.
  // Shift+F is NVDA's "previous form field" quick-nav key in browse mode.
  console.log('\n== Newsletter form');
  await page.bringToFront();
  if (await drawerOpen()) await page.keyboard.press('Escape');
  await nvda.press('Control+End');
  await page.waitForTimeout(300);
  await nvda.clearSpokenPhraseLog();
  const formLog = [];
  for (let i = 0; i < 6; i++) {
    await nvda.press('Shift+f');
    formLog.unshift(clean(await nvda.lastSpokenPhrase()));
  }
  save('newsletter.txt', formLog);
  const emailPhrase = formLog.find((p) => /email/i.test(p) && /edit/i.test(p));
  const buttonPhrase = formLog.find((p) => /sign up/i.test(p) && /button/i.test(p));
  emailPhrase ? pass(`email field spoken with its label: "${emailPhrase}"`) : fail(`email field not spoken with an "email" label (${formLog.join(' | ')})`);
  buttonPhrase ? pass(`submit spoken as a button: "${buttonPhrase}"`) : fail('Sign up not spoken as a button');
  const honeypot = formLog.find((p) => /website/i.test(p));
  honeypot ? fail(`honeypot field is reachable by a screen reader: "${honeypot}"`) : pass('honeypot field not exposed');
} finally {
  await nvda.stop().catch(() => {});
  await browser.close();
}

console.log(`\n${problems.length} problem(s). Transcripts in ${OUT_DIR}/`);
process.exit(problems.length ? 1 : 0);
