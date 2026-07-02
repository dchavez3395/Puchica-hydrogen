/**
 * Diversify — interleave same-vendor products so adjacent items on
 * a list are from different vendors.
 *
 * The merchant's catalog is dominated by phone-case SKUs whose titles
 * all start with a vendor prefix (`Almond Latte - Cute iPhone 13 Case`,
 * `Almond Latte - Cute AirPods Case`, …). When Shopify's default
 * sortKey (`MANUAL` / `RELEVANCE`) returns these in alphabetical or
 * merchant-defined order, the first 12 visible products on a page
 * are almost always the same vendor — the page reads as one long
 * list of the same brand, not a curated selection.
 *
 * This helper walks a list once, groups items by a vendor key
 * (the prefix before the first " - " in the title, or the first
 * word if there's no dash), then emits them in a round-robin
 * pattern: the first item of each group, then the second item of
 * each group, etc. The result is the same items, in the same
 * within-vendor order, but with the dominant vendor's products
 * spread evenly across the page rather than clustered at the top.
 *
 * No items are removed and the total count is preserved. The cap
 * for how much of the dominant vendor shows up per page is
 * effectively `ceil(items.length / groups.size)` — for a 12-item
 * page with 2 distinct vendors that's 6 each, with 4 vendors it's
 * 3 each. When a vendor truly dominates the data (e.g. 90%+),
 * the page will still be mostly that vendor, but its items will
 * be spread across the row instead of stacked at the top.
 *
 * @template {{title: string}} T
 * @param {T[]} items - Products in their original (sort-applied) order.
 * @returns {T[]} A new array with the items interleaved by vendor.
 *   Items are never added or removed; only their order changes.
 */
export function diversifyByVendor(items) {
  if (!Array.isArray(items) || items.length < 3) return items;

  // Group by vendor. The vendor key is the prefix before the
  // first " - " in the title (matches the merchant's convention
  // for the catalogue). Fall back to the first word if there's
  // no dash, then to a stable id so we never throw.
  const groups = new Map();
  for (const item of items) {
    const key = vendorKey(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }

  // Single-vendor catalogues get nothing useful from re-ordering.
  if (groups.size < 2) return items;

  // Round-robin interleave. The first product is always the
  // first product of the first group (preserving the original
  // sort's top pick), then we take the second product from
  // each remaining group, then the third, etc.
  const orderedKeys = [...groups.keys()];
  const out = [];
  let placedAny = true;
  while (placedAny) {
    placedAny = false;
    for (const key of orderedKeys) {
      const bucket = groups.get(key);
      const next = bucket.shift();
      if (next) {
        out.push(next);
        placedAny = true;
      }
    }
  }
  return out;
}

/**
 * Derive a vendor key from a product's title. The merchant's
 * catalog uses `<Vendor> - <Product Description>` consistently,
 * so the first segment is a reliable vendor signal even without
 * pulling the `vendor` field. Returns a stable fallback for
 * products whose title doesn't follow the convention.
 *
 * @param {{title: string}} item
 * @returns {string}
 */
function vendorKey(item) {
  const t = (item?.title || '').trim();
  if (!t) return '__untitled__';
  // "Almond Latte - Cute iPhone 13 Case" → "Almond Latte"
  const dash = t.indexOf(' - ');
  if (dash > 0) return t.slice(0, dash).trim();
  // "Puchica XYZ" or "1080 Degree Faucet" → first word (or first
  // token, including numerics). Normalize whitespace so spacing
  // variations don't create different buckets.
  const firstWord = t.split(/\s+/)[0];
  return firstWord || '__untitled__';
}

/**
 * Reorder items so any item carrying `tag` (in its `tags` array) comes
 * first, with vendor-diversification preserved independently within
 * each group. Used to surface AI-showcase ("for-you" tagged) products
 * at the front of a section's results while still spreading the
 * dominant vendor within both the tagged and untagged groups.
 *
 * @template {{title: string, tags?: string[]}} T
 * @param {T[]} items
 * @param {string} tag
 * @returns {T[]}
 */
export function prioritizeTag(items, tag) {
  if (!Array.isArray(items) || items.length === 0) return items;
  const tagged = items.filter((item) => item?.tags?.includes(tag));
  const rest = items.filter((item) => !item?.tags?.includes(tag));
  return [...diversifyByVendor(tagged), ...diversifyByVendor(rest)];
}
