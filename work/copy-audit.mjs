// Copy consistency: for every approved handle × locale, compare the size in
// the localized title (size chip), the "Size" fact in the description, and
// scan for stale wording (travel, US, discounts, hand-knitted).
import {DICTIONARIES} from '../app/lib/dictionaries.js';
import {APPROVED_CATALOG_OFFERS} from '../app/lib/launch-catalog.js';
import {presentLaunchProductCopy} from '../app/lib/product-presentation.js';
import {extractProductFacts} from '../app/lib/product-facts.js';
import {sizeChipFor} from '../app/lib/size-chip.js';

const handles = [...new Set(APPROVED_CATALOG_OFFERS.map((o) => o.handle))];
const STALE = /travel|packing|toiletry|jewelry case|organizer|organiseur|organizador|United States|États-Unis|Estados Unidos|\bUSD\b|\bUS\b|discount|rabais|descuento|desconto|% off|FIRST15|hand-knitted|tricoté à la main|tejido a mano|tricotado à mão/i;
const issues = [];
for (const handle of handles) {
  for (const [locale, dict] of Object.entries(DICTIONARIES)) {
    const copy = presentLaunchProductCopy(handle, dict);
    if (!copy) { issues.push(`${locale} ${handle}: no localized copy`); continue; }
    const html = dict[`${Object.keys(dict).find((k) => k.endsWith('_html') && dict[k] === copy.descriptionHtml) || ''}`] || copy.descriptionHtml;
    const facts = extractProductFacts(html);
    const chip = sizeChipFor({title: copy.title, productType: /sconce|applique|apliqu|arandela/i.test(copy.title) ? 'sconce' : 'pendant'});
    const titleCm = /(\d+(?:[.,]\d+)?)\s*cm/i.exec(copy.title)?.[1];
    const sizeFact = facts.find((f) => /size|taille|tama|tamanho|dimens|medid/i.test(f.label))?.value || '';
    const factNums = [...sizeFact.matchAll(/(\d+(?:[.,]\d+)?)\s*cm/gi)].map((m) => m[1].replace(',', '.'));
    if (!titleCm) issues.push(`${locale} ${handle}: title has no size ("${copy.title}")`);
    if (!facts.length) issues.push(`${locale} ${handle}: facts row empty`);
    else if (facts.length < 3) issues.push(`${locale} ${handle}: only ${facts.length} facts (${facts.map((f) => f.label).join(', ')})`);
    if (titleCm && factNums.length && !factNums.includes(String(Number(titleCm)))) issues.push(`${locale} ${handle}: title says ${titleCm} cm, size fact says [${factNums.join(', ')}] ("${sizeFact}")`);
    if (!sizeFact) issues.push(`${locale} ${handle}: no Size fact`);
    const text = `${copy.title} ${copy.summary} ${html}`;
    const m = STALE.exec(text);
    if (m) issues.push(`${locale} ${handle}: stale wording "${m[0]}" near: …${text.slice(Math.max(0, m.index - 40), m.index + 40).replace(/\s+/g, ' ')}…`);
    if (/Ø|W /.test(chip || '') === false && titleCm) issues.push(`${locale} ${handle}: chip not derivable from title "${copy.title}"`);
  }
}
console.log(`handles ${handles.length} × locales 4; issues: ${issues.length}`);
for (const i of issues) console.log(' -', i);
