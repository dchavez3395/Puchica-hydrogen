/**
 * The size chip on product cards: "Ø 25 cm" for a pendant, "W 18 cm" for a
 * sconce. Read from the product title's "— 25cm" suffix, which the catalogue
 * writes for every fixture, so the chip can never disagree with the title.
 * Returns null when the title carries no size, and the card simply omits it.
 *
 * @param {{title?: string, productType?: string} | null | undefined} product
 * @returns {string | null}
 */
export function sizeChipFor(product) {
  const match = /[—–-]\s*(\d+(?:[.,]\d+)?)\s*cm\b/i.exec(product?.title || '');
  if (!match) return null;
  const n = match[1].replace(',', '.');
  const sconce = /sconce/i.test(product?.productType || '') || /sconce/i.test(product?.title || '');
  return `${sconce ? 'W' : 'Ø'} ${n} cm`;
}

/**
 * A card shows the size as a chip, so the title's "— 25cm" suffix would say
 * it twice. Strip it for cards only; the PDP, cart and checkout keep the full
 * title, which is also what Shopify, feeds and analytics carry.
 *
 * @param {string} title
 * @returns {string}
 */
export function cardTitle(title) {
  return String(title || '').replace(/\s*[—–-]\s*\d+(?:[.,]\d+)?\s*cm\s*$/i, '').trim() || title;
}
