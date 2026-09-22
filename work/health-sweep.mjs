// Whole-catalogue health sweep: every approved product in every locale, plus
// the pages and collections the sitemap advertises. Checks what a customer or
// a crawler would notice — status, title, description, canonical, hreflang,
// Product JSON-LD completeness, price and currency, leftover travel/US/discount
// wording — and then that every internal link found along the way resolves.
//
//   node work/health-sweep.mjs [base] > work/health-sweep-<date>.md
//
// Exit code is the number of problems (0 = clean), so it can gate a loop.
import {APPROVED_CATALOG_OFFERS} from '../app/lib/launch-catalog.js';

const BASE = process.argv[2] || 'https://puchica.ca';
const LOCALES = ['', '/fr', '/es', '/pt-br'];
const STATIC_PATHS = ['/', '/collections/all', '/collections/pendant-lights', '/collections/wall-sconces', '/pages/about', '/pages/contact', '/pages/faq', '/pages/shipping'];
const HANDLES = [...new Set(APPROVED_CATALOG_OFFERS.map((o) => o.handle))].sort();
// Wording that should have died with the travel edit, plus anything implying a
// discount or a U.S. market on a Canada-only store. "travel" has to be the
// travel-shop noun, not the verb: the pear pendant legitimately says the shadow
// bands "travel down a wall" (false positive on 2026-09-19 and again today).
const STALE = [
  /travel (edit|accessor|organiz|gear|system|kit)/i,
  /\b(packing cubes?|toiletry organiz|jewel(le)?ry case)\b/i,
  /organiz(er|ers)\b/i,
  /United States/i,
  /\bUSD\b/i,
  /\b\d+% off\b/i,
  /\bsale price\b/i,
  /\bcoupon\b/i,
];

const problems = [];
const flag = (where, what) => problems.push(`${where} — ${what}`);
const text = (html) => html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ');

async function get(path) {
  const res = await fetch(BASE + path, {headers: {'oxygen-buyer-country': 'CA', 'user-agent': 'puchica-health-sweep'}});
  return {status: res.status, html: res.status === 200 ? await res.text() : ''};
}

function productJsonLd(html) {
  for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(m[1]);
      for (const node of Array.isArray(data) ? data : [data]) {
        if (node?.['@type'] === 'Product') return node;
      }
    } catch {
      /* a malformed block is reported by the caller as "no Product JSON-LD" */
    }
  }
  return null;
}

const links = new Set();
function collectLinks(html) {
  for (const m of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const href = m[1];
    // Locale prefixes too: /fr/account is as uncheckable as /account — both are
    // robots-disallowed and rate-limited.
    if (/^(\/(fr|es|pt-br))?\/(cdn|api|cart|cart-sync|account|newsletter|discount)\b/.test(href)) continue;
    links.add(href);
  }
}

async function checkProduct(handle, locale) {
  const path = `${locale}/products/${handle}`;
  const {status, html} = await get(path);
  if (status !== 200) return flag(path, `HTTP ${status}`);
  collectLinks(html);

  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  if (!/puchica/i.test(title)) flag(path, `title has no brand: "${title}"`);
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  if (!desc) flag(path, 'no meta description');
  else if (desc.length > 200) flag(path, `meta description ${desc.length} chars`);

  const canonical = (html.match(/rel="canonical" href="([^"]*)"/) || [])[1] || '';
  const expected = `${BASE}${locale}/products/${handle}`;
  if (canonical !== expected) flag(path, `canonical is ${canonical || '(none)'}, expected ${expected}`);

  const alts = (html.match(/rel="alternate"/g) || []).length;
  if (alts < LOCALES.length) flag(path, `${alts} hreflang alternates, expected >= ${LOCALES.length}`);

  const p = productJsonLd(html);
  if (!p) return flag(path, 'no Product JSON-LD');
  const offer = Array.isArray(p.offers) ? p.offers[0] : p.offers;
  for (const [field, value] of Object.entries({
    name: p.name, image: p.image, description: p.description, sku: p.sku, brand: p.brand,
    'offers.price': offer?.price, 'offers.availability': offer?.availability, 'offers.url': offer?.url,
    'offers.shippingDetails': offer?.shippingDetails, 'offers.hasMerchantReturnPolicy': offer?.hasMerchantReturnPolicy,
  })) if (!value) flag(path, `JSON-LD missing ${field}`);
  if (offer?.priceCurrency && offer.priceCurrency !== 'CAD') flag(path, `priceCurrency ${offer.priceCurrency}`);

  const body = text(html);
  for (const re of STALE) if (re.test(body)) flag(path, `stale wording ${re}`);
  return {handle, locale, price: offer?.price};
}

async function checkStatic(path, locale) {
  const full = `${locale}${path === '/' ? '' : path}` || '/';
  const {status, html} = await get(full);
  if (status !== 200) return flag(full, `HTTP ${status}`);
  collectLinks(html);
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  if (!/puchica/i.test(title)) flag(full, `title has no brand: "${title}"`);
  const body = text(html);
  for (const re of STALE) if (re.test(body)) flag(full, `stale wording ${re}`);
}

// Small pool: the origin is a single Oxygen worker and this is ~100 requests.
async function pool(items, worker, size = 6) {
  const out = [];
  const queue = [...items];
  await Promise.all(Array.from({length: size}, async () => {
    while (queue.length) out.push(await worker(queue.shift()));
  }));
  return out;
}

const jobs = [];
for (const locale of LOCALES) {
  for (const handle of HANDLES) jobs.push(() => checkProduct(handle, locale));
  for (const path of STATIC_PATHS) jobs.push(() => checkStatic(path, locale));
}
const results = (await pool(jobs, (job) => job())).filter(Boolean);

// One price per product, whatever the locale: a mismatch means a market or a
// currency leaked into a localized route.
const byHandle = new Map();
for (const r of results) {
  if (!r?.price) continue;
  const seen = byHandle.get(r.handle);
  if (seen && seen !== r.price) flag(`/products/${r.handle}`, `price differs by locale: ${seen} vs ${r.price}`);
  byHandle.set(r.handle, r.price);
}

// Oxygen answers HEAD with 404 for static assets it serves happily on GET
// (/favicon.svg did exactly that), so a failed HEAD is re-checked with GET
// before it counts as a broken link.
const linkResults = await pool([...links], async (href) => {
  let res = await fetch(BASE + href, {method: 'HEAD', headers: {'oxygen-buyer-country': 'CA'}});
  if (res.status >= 400) res = await fetch(BASE + href, {headers: {'oxygen-buyer-country': 'CA'}});
  if (res.status >= 400) flag(href, `internal link HTTP ${res.status}`);
  return null;
}, 6);

const date = new Date().toISOString().slice(0, 10);
console.log(`# Health sweep ${date}\n`);
console.log(`${HANDLES.length} products x ${LOCALES.length} locales + ${STATIC_PATHS.length} static paths = ${jobs.length} pages, ${links.size} distinct internal links.\n`);
console.log(problems.length ? `## ${problems.length} problem(s)\n\n${problems.map((p) => `- ${p}`).join('\n')}` : '## No problems found\n');
console.log(`\nPrices seen: ${[...new Set(byHandle.values())].sort().join(', ')} CAD across ${byHandle.size} products.`);
void linkResults;
process.exit(problems.length);
