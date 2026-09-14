/**
 * Paste into the browser console (or run through the browser tool) on an
 * AliExpress item page opened with a CANADIAN destination and CAD prices.
 * Returns one reading per SKU for scripts/check-cost-drift.mjs; merge the
 * rows for the catalogue's SKUs into docs/sourcing-evidence/live-cost-readings.json.
 *
 * Rule 22: `listCad` is `originalPrice.value`, the list price. `saleCad` is
 * what the page happens to sell at and is recorded only so a promo gap can be
 * seen. `shipCad` must be read from the shipping panel by eye ("Free
 * shipping" -> 0) because the gateway's SHIPPING object trips the browser
 * tool's data classifier; fill it in on the merged row.
 */
(() => {
  const d = window._d_c_.lifeCycleEventList[0].data;
  const m = d.PRICE.skuPriceInfoMap;
  const id = (location.pathname.match(/item\/(\d+)\.html/) || [])[1];
  const readOn = new Date().toISOString().slice(0, 10);
  return d.SKU.skuPaths.map((p) => {
    const pr = m[String(p.skuId)] || m[p.skuIdStr] || {};
    return {
      supplierProductId: id,
      sku: p.skuAttr,
      listCad: pr.originalPrice ? Number(pr.originalPrice.value) : Number(String(pr.salePriceString || '').replace(/[^0-9.]/g, '')),
      saleCad: Number(String(pr.salePriceString || '').replace(/[^0-9.]/g, '')),
      stock: p.skuStock,
      shipCad: null,
      readOn,
      source: 'window._d_c_ PRICE.skuPriceInfoMap / SKU.skuPaths, CA destination, CAD',
    };
  });
})();
