/**
 * The facts row on the PDP buy box: size, cord, fitting, bulb.
 *
 * Read from the product's own localized "What you get" list, which every
 * fixture's copy carries as `<li><strong>Label:</strong> value</li>`. Reading
 * the copy rather than a second data source means the row can never disagree
 * with the description underneath it, in any locale. Returns at most four
 * facts in a fixed order; a product whose copy lacks a label simply shows
 * fewer.
 *
 * @param {string | null | undefined} html
 * @returns {Array<{label: string, value: string}>}
 */
export function extractProductFacts(html) {
  if (!html) return [];
  const pairs = [];
  const re = /<li>\s*<strong>([^<:]+):<\/strong>\s*([^<]+)<\/li>/g;
  let m;
  while ((m = re.exec(html))) {
    pairs.push({label: m[1].trim(), value: m[2].replace(/\s+/g, ' ').trim()});
  }
  const pickers = [
    /^(size|dimensions?|taille|dimensions|tama[ñn]o|tamanho|medidas?)$/i,
    /(cord|c[âa]ble|cabo|base and cord|base et c[âa]ble)/i,
    /^(fitting|socket|douille|portal[áa]mparas|soquete|casquilho)$/i,
    /^(bulb|ampoule|bombilla|l[âa]mpada)$/i,
  ];
  const out = [];
  for (const pick of pickers) {
    const hit = pairs.find((p) => pick.test(p.label) && !out.includes(p));
    if (hit) out.push(hit);
  }
  return out.slice(0, 4);
}
