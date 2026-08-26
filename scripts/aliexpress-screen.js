/**
 * Puchica supplier screen — runs INSIDE an aliexpress.com tab, not in Node.
 *
 * Why it lives here and runs there: this container's egress cannot reach
 * aliexpress.com, and AliExpress serves a reCAPTCHA to automated product-page
 * navigation. But a page already open on the domain can fetch other
 * same-origin pages without tripping the gate, so the screen runs in the
 * browser and only the results come back.
 *
 * USAGE
 *   1. Open any https://www.aliexpress.com/w/... search page (Canada / CAD).
 *   2. Paste this whole file into the console (or inject it).
 *   3. await __pkScreen([...terms])
 *
 * WHAT IT FILTERS, AND WHY EACH ONE EARNED ITS PLACE
 *
 * - AliExpress Choice (`choice_atm`). Freight, not unit cost, is the binding
 *   constraint on anything bulky going to Canada. Measured the same day: a
 *   Choice duffel shipped free in 7-14 days; a non-Choice one cost US$23.41
 *   over 18-27 days and lost money at both CA$129 and CA$149 despite a LOWER
 *   unit cost. Non-Choice is unsellable at any price the market will bear.
 *
 * - Price floor of CA$25. Below roughly CA$70 retail the CA$28 CPA floor
 *   exceeds 40% of the order, so no margin can rescue it. All six products
 *   currently live in the store sit under that line and lose CA$4.91-20.66
 *   per order on paid traffic.
 *
 * - Brand-name blocklist. A brand mark is a takedown and a frozen payment
 *   processor waiting to happen. The list below is every mark actually hit
 *   while sourcing; extend it as new ones turn up. NOTE this only catches
 *   marks in the TITLE - "DUANG BAG" and "KEADOME" were printed on the
 *   product and visible only in the photos, so imagery still needs eyes.
 *
 * - Sold count and star rating. Cheap quality proxies, nothing more.
 *
 * WHAT IT CANNOT DO
 *
 * Stock is invisible until the product is imported into DSers, and it is what
 * kills most candidates: of eleven imported across three rounds, seven held
 * under 50 units. One had 1,000 lifetime sales against SIX units in stock, so
 * sold-count is no guide at all. Screen here, then import and read stock
 * before looking at anything else.
 */
window.__pkScreen = async function (terms, opts = {}) {
  const {minP = 25, maxP = 75, minSold = 150, minStar = 4.4} = opts;

  // Every brand mark hit while sourcing. Append as new ones appear.
  const BRANDS =
    /MARKROYAL|BAGSMART|BANGE|OIWAS|TIGERNU|XIAOMI|BUYLOR|HOMEFISH|MADEN|CONTACT|NESITU|HUMERPAUL|DUANG|MAD TRUNK|KEADOME|LOVEVOOK|CLUCI|VASCHY|BULLCAPTAIN|SCHLATUM|VANSIHO|RELAVEL|BYOOTIQUE|HAGIBIS|ECOFLOW/i;

  /** "3,000+ sold" -> 3000, "1.5k sold" -> 1500. */
  const soldN = (s) => {
    if (!s) return 0;
    const t = String(s).replace(/,/g, '');
    const k = /(\d+(?:\.\d+)?)\s*k/i.exec(t);
    if (k) return Math.round(parseFloat(k[1]) * 1000);
    const n = /(\d+)/.exec(t);
    return n ? +n[1] : 0;
  };

  const out = [];
  for (const term of terms) {
    let html;
    try {
      const url = '/w/wholesale-' + term.trim().replace(/\s+/g, '-') + '.html';
      html = await (await fetch(url, {credentials: 'include'})).text();
    } catch {
      continue; // one dead term must not sink the batch
    }

    // The page embeds its catalogue in `window._dida_config_`, which is NOT
    // valid JSON as a whole (JSON.parse fails on it). Splitting on the
    // productId key yields one self-contained record per card, and those parse
    // fine with plain regex. 3000 chars comfortably covers title through trade.
    for (const chunk of html.split('"productId":"').slice(1)) {
      const seg = chunk.slice(0, 3000);
      const id = (/^(\d+)/.exec(chunk) || [])[1];
      // No upper bound on the title: capping at 120 chars silently dropped
      // every long-titled product, which is most of them.
      const title = (/"displayTitle":"([^"]+)"/.exec(seg) || [])[1];
      const price = parseFloat(
        (/"salePrice":\{[^}]*?"minPrice":([\d.]+)/.exec(seg) || [])[1],
      );
      const star = parseFloat((/"starRating":"?([\d.]+)/.exec(seg) || [])[1]);
      const sold = soldN((/"tradeDesc":"([^"]+)"/.exec(seg) || [])[1]);

      if (!id || !title || !isFinite(price)) continue;
      if (!/choice_atm/.test(seg)) continue;
      if (price < minP || price > maxP) continue;
      if (BRANDS.test(title)) continue;
      if (sold < minSold || !(star >= minStar)) continue;

      out.push({term, id, t: title.slice(0, 46), p: price, sold, star});
    }
  }

  // The same product surfaces under several terms; keep the best read of it.
  const best = new Map();
  for (const r of out) {
    if (!best.has(r.id) || best.get(r.id).sold < r.sold) best.set(r.id, r);
  }
  return [...best.values()].sort((a, b) => b.sold - a.sold);
};

/**
 * `minPrice` is the CHEAPEST VARIANT, not what you will pay. It understated
 * true cost by up to 34% on verified candidates. Treat every price here as a
 * lower bound and confirm in DSers before it reaches the scorer.
 */
