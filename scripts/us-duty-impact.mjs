#!/usr/bin/env node
/**
 * What the end of US de minimis does to the US route, per offer.
 *
 * Costs and supplier shipping: DSers "My Products", read 2026-09-03. DSers is
 * what we actually pay, and it does NOT always equal the AliExpress listing
 * price - the 4-slot quotes $31.24-31.67 in DSers against $30.02 on the
 * listing. Where they disagree, DSers wins here.
 * US retail: Shopify contextualPricing(country: US), read 2026-09-02 - and
 * RE-READ 2026-09-10, which is when the FX error below was found. Always read
 * this field rather than dividing the CAD price by a planning rate; the two do
 * not agree and the field is what the customer is charged.
 *
 * ---------------------------------------------------------------------------
 * REVISED 2026-09-03. Four inputs in the previous version were wrong, and they
 * did not err in the same direction, so the old output was not conservative -
 * it was just inaccurate.
 *
 *   duty rate        0.38  ->  0.551 for these goods (see below)
 *   carrier billback $12   ->  $0 on this line (see below)
 *   payment fees     3.5%  ->  5.5% (cross-border 3.5% + 2% conversion)
 *   exception reserve 5%   ->  8%
 *
 * A fifth was found on 2026-09-03 while repricing: the model charged the
 * CANADIAN delivery profile to US orders - $8 collected below a $50 free
 * threshold, nothing above it. The live US zone is a CA$6.99 flat rate with no
 * conditions and no free tier, so a US order collects about $4.99 of shipping
 * every time, including above $50 where the model collected nothing. That is
 * roughly $4.30 of contribution per order the model was throwing away.
 *
 * DUTY RATE. 0.38 was inherited, not sourced. For a PU/leather watch roll the
 * classification is HTS 4202.92.97 (cases with an outer surface of sheeting of
 * plastics or textile materials, other), and the stack on Chinese origin as of
 * 2026-09-03 is:
 *     17.6%  MFN, column 1 general
 *   + 25.0%  Section 301 List 3
 *   + 12.5%  Section 301 forced-labour action, effective 2026-07-24
 *   = 55.1%
 * The IEEPA layers were struck down by the Supreme Court 2026-02-20 and the
 * Section 122 surcharge that replaced them expired 2026-07-23; neither is
 * modelled. The flat per-parcel duty ($80/$160/$200) ceased 2026-02-28.
 * MPF on informal entry is $2.69, rising to $2.77 on 2026-10-01.
 *
 * CARRIER BILLBACK. $12 came from the UPS ICOD schedule, which is the wrong
 * document for this parcel twice over. UPS is not on this line, and its own
 * minimum is now $17.00 (2026-05-11); FedEx is $15 or 2%. The couriers that
 * ARE on this line - SpeedX, GOFO, Cainiao, USPS final mile - are domestic
 * last-mile carriers. They take possession after clearance, are not the entry
 * filer, and have no billing relationship with the recipient. On this line the
 * disbursement is $0. The fee risk that does exist sits entirely in the
 * residual legacy mail-entry path, where it is CBP's $7.39 dutiable-mail fee
 * (FY2026) plus USPS's $9.35 clearance-and-delivery charge = $16.74, and the
 * USPS half is non-refundable even if CBP later refunds the duty (IMM 712.4).
 *
 * ---------------------------------------------------------------------------
 * THE UNRESOLVED QUESTION, which is worth more than every correction above.
 *
 * Scenario E is new and it is the one that matters. Since 2026-07-24 the
 * postal informal-entry process requires a bonded filer who remits to CBP in
 * arrears through Pay.gov. That process has NO recipient-billing mechanism -
 * there is no Form 3419ALT in it, so there is nothing for a carrier to collect
 * at the door. On a consolidated AliExpress Selection / Choice line the duty
 * therefore has to be funded upstream, which means it is either taken at
 * AliExpress checkout or already inside the price we pay.
 *
 * If it is already inside the price, scenarios B-D double-count it: we would
 * be charging ourselves duty we have already paid as part of item cost.
 *
 * This has NOT been confirmed.
 *
 * CORRECTION 2026-09-10. The second route named here was wrong and it was the
 * one the whole plan rested on. The DSers "Tax&Fee" line does NOT measure US
 * import duty. Its own tooltip, read in the DSers order card:
 *
 *     "Tax&Fee is showing estimated tax amount or service fee generated when
 *      getting service from Tmall suppliers. 1. The estimated amount of tax
 *      may vary when you make payment. Please refer to the actual payment.
 *      2. Tmall products may have domestic shipping service fee included
 *      here."
 *
 * It is a Tmall tax-and-service-fee field. Every supplier in this catalogue is
 * an AliExpress marketplace seller, not Tmall, so the line would have read
 * $0.00 on a real order and settled nothing - and $0.00 was the outcome the
 * old note told us to read as 'prepaid'. That reading would have been a false
 * confirmation of the more profitable scenario, which is the worst possible
 * direction for an error like this. Corroborating detail already in the notes:
 * DSers' "Tax/Import charges" preview column also reads $0.00 on an approved
 * supplier. Neither field measures duty, which is why both are zero.
 *
 * WHAT THE PLATFORM ITSELF SAYS, read 2026-09-10 from the AliExpress Help
 * Center article "Do I need to pay for customs duties and import taxes?"
 * (Ordering & payment / Place Order, questionId 1061036456):
 *
 *   - "Duties and taxes are typically not included in the price of the item,
 *      and might not be included in the overall shipping costs you pay to the
 *      seller."
 *   - "Please note: Customs duties and taxes are never covered by AliExpress."
 *   - "Import duties, taxed or other customs-related charges are normally
 *      collected by the shipping company upon delivery."
 *   - the one stated exception is a seller shipping from a warehouse in the
 *     buyer's own country, where "you won't be asked to pay for any additional
 *     customs duties and taxes."
 *
 * The companion article "Tax Policy on United States" (questionId 1061037206)
 * covers state sales tax, refunds and the Colorado Retail Delivery Fee and
 * says nothing whatever about import duty.
 *
 * READ THAT CAREFULLY. It settles LIABILITY, not INCIDENCE. AliExpress states
 * it does not cover the duty and that a courier normally collects it at the
 * door. That is the legacy courier-brokerage model and it directly contradicts
 * the regulatory position above, under which the carriers on this line are
 * last-mile only and have no mechanism to bill anyone. Both can hold at once:
 * AliExpress disclaims the cost, and in practice nobody presents a bill,
 * meaning it is absorbed upstream by the seller or the consolidator. So the
 * platform's terms rule out "AliExpress prepays it for us" but do not rule out
 * "it is already inside the price we are quoted".
 *
 * The risk shape changed though. If a courier ever does collect, the bill
 * lands at the CUSTOMER'S door, not ours - a refund and a bad review rather
 * than a thin month.
 *
 * The only instrument that reads the actual number is the AliExpress
 * order-confirmation page for a US address, signed in, BEFORE payment is
 * authorised. No order is placed to see it. See US_DUTY_INCIDENCE in
 * app/lib/launch-catalog.js for how the catalogue treats the uncertainty, and
 * for the pricing rule that makes the answer stop mattering.
 */

const PAYMENT_RATE = 0.055; // 3.5% cross-border + 2% currency conversion
const PAYMENT_FIXED = 0.3;
const RESERVE_RATE = 0.08; // ~12% return rate x ~32% loss per return, + chargebacks
const MPF = 2.69; // -> $2.77 on 2026-10-01
const COURIER_DISBURSEMENT = 17.0; // UPS min, 2026-05-11. NOT on this line.
export const POSTAL_ENTRY_FEES = 16.74; // CBP $7.39 dutiable mail + USPS $9.35
export const CHOICE_LINE_DISBURSEMENT = 0.0; // SpeedX / GOFO / USPS are last-mile only

// What the CUSTOMER pays us for shipping, read from the live Shopify delivery
// profile on 2026-09-03 rather than assumed:
//   Canada zone        CA$5.00 under CA$50, free at CA$50 and over
//   United States zone CA$6.99 flat, NO conditions and no free tier
// The US rate is denominated in CAD because that is the store currency; at the
// planning rate of 1.40 it collects about USD $4.99 on every US order.
//
// The previous model used a $50 free-shipping threshold with $8 collected
// below it for BOTH markets. That describes the Canadian zone and nothing
// else - it understated US collected revenue by roughly $5 on every order,
// including the ones above $50 where it collected nothing at all.
const CA_FREE_SHIP_OVER = 50.0;
const CA_COLLECTED_SHIPPING = 5.0;

// CORRECTED 2026-09-10. This was 6.99 / 1.4, and 1.4 was never Shopify's rate -
// it was a planning number inherited from the delivery-profile note. Measured
// against what the store ACTUALLY serves, via contextualPricing(country: US) on
// all four live variants:
//
//   CA$143.99 -> $107   CA$139.00 -> $103   CA$100.99 -> $75   CA$119.00 -> $88
//
// Those four imply 1.3457 / 1.3495 / 1.3465 / 1.3523. A single rate of ~1.352
// with rounding to the NEAREST WHOLE DOLLAR reproduces all four exactly, so the
// mechanism is: convert at the live market rate, then round to a whole dollar.
//
// Two consequences, and they point in opposite directions:
//   1. Every recorded contribution figure was computed off CAD/1.4 and is
//      therefore ~3.7% LOW on retail. The offers are slightly better than the
//      file claimed - $1.29 to $3.59 per unit.
//   2. RULE 2 WAS BREACHED IN THE MARKET THAT MATTERS and nobody saw it,
//      because the ceiling was compared against a number the store never
//      charged. At the real prices the 36cm pendant sells at $107 against a
//      $103.49 ceiling and the sconce at $75 against $72.43.
//
// The rate DRIFTS, so a CAD price that clears the ceiling today can breach it
// next month with no change on our side. The durable fix is an explicit fixed
// USD price per variant in the `Puchica US USD` price list (PriceList/
// 22620078330), whose eight existing fixed prices are all ARCHIVED products -
// not one live variant is pinned. Until that is done, US retail is a function
// of the foreign exchange market.
const PLANNING_FX_CAD_PER_USD = 1.352;
const US_COLLECTED_SHIPPING = 6.99 / PLANNING_FX_CAD_PER_USD;

// handle, US retail (USD), supplier item cost (USD), supplier ship to US (USD), duty rate
//
// Archived cohort. Rates left at the values they were modelled with so the
// historical mean stays comparable; these products are not for sale.
const OFFERS = [
  ['travel-cable-organizer-case', 15.0, 4.05, 1.99, 0.38],
  ['white-semi-circular-travel-jewelry-case', 18.0, 4.29, 1.99, 0.38],
  ['black-hanging-travel-toiletry-organizer', 21.0, 8.32, 2.16, 0.55],
  ['3-piece-packing-cube-set', 30.0, 12.45, 0.0, 0.55],
  ['the-carry-on-kit-toiletry-organizer-packing-cubes-cable-case', 52.0, 24.82, 4.15, 0.55],
];

/**
 * The live 2026-09-01 watch-roll cohort, kept as its own list so the archived
 * mean above stays comparable to what was reported when the market closed.
 *
 * Costs re-read in DSers 2026-09-03: 3-slot $26.18, 4-slot $31.24-31.67 (the
 * worst is carried), 6-slot $43.48. The baseline file recorded $30.52 and
 * $43.64 for the last two, both from the AliExpress listing rather than DSers.
 *
 * REPRICED 2026-09-03 from $89 / $99 / $129 to $49 / $62 / $85. The old prices
 * were about double the market: PU three-slot rolls cluster at $30-40 and the
 * well-reviewed winners all sit at or under $80, with the $89-129 band holding
 * only established brands (M Mirage, Barton, WOLF). Holding a price nobody
 * pays does not protect the margin, it just guarantees no orders - and no
 * orders means the duty incidence question can never be settled, because the
 * DSers Tax&Fee reading only exists on a real order.
 *
 * ON THE SALE PRICE. The listing shows "LABOR DAY SALE - ends Sep 7" at $26.18
 * against a $55.70 anchor. Do not plan around that end date. The Korea Fair
 * Trade Commission penalised AliExpress affiliates on 2025-08-31 for anchors
 * across 7,400+ listings that the goods had never sold at, and the European
 * Commission's 2026-03-26 sweep found more than half of observed countdown
 * timers deceptive. AliExpress runs 20+ named sales a year and Labor Day rolls
 * straight into Super September. Treat $26.18 as the price. The real cost risk
 * here is tariff pass-through, not a promotion ending.
 */
const LIVE_OFFERS = [
  // REPRICED 2026-09-08. Was 89.0 / 99.0 / 129.0, and those are not the prices
  // the store charges. The `Puchica US USD` price list (PriceList/22620078330)
  // carries explicit fixed USD overrides at 49 / 62 / 85 on all eight live
  // variants, read from the Admin API and confirmed against
  // contextualPricing(country: US) the same day. Why it disagrees with the
  // 2026-09-02 reading is unexplained rather than resolved - see the note on
  // APPROVED_CATALOG_OFFERS in app/lib/launch-catalog.js.
  ['watch-roll 3 slot', 49.0, 26.18, 1.99, 0.551],
  ['watch-roll 4 slot', 62.0, 31.67, 1.99, 0.551],
  ['watch-roll 6 slot', 85.0, 43.48, 1.99, 0.551],
];

const COHORTS = [
  ['Archived 2026-08 cohort', OFFERS, 'CA'],
  ['Live 2026-09 watch-roll cohort', LIVE_OFFERS, 'US'],
];

export function contribution({retail, itemCost, supplierShip, dutyRate, basis, carrier, market}) {
  const collected =
    market === 'US'
      ? retail + US_COLLECTED_SHIPPING
      : retail >= CA_FREE_SHIP_OVER
        ? retail
        : retail + CA_COLLECTED_SHIPPING;
  const landed = itemCost + supplierShip;
  const payment = collected * PAYMENT_RATE + PAYMENT_FIXED;
  const reserve = collected * RESERVE_RATE;

  let duty = 0;
  let fees = 0;
  if (basis === 'wholesale') {
    duty = landed * dutyRate;
    fees = MPF + carrier;
  } else if (basis === 'retail') {
    duty = retail * dutyRate;
    fees = MPF + carrier;
  }
  // basis 'none' and basis 'prepaid' both add nothing: 'none' is the pre-2025
  // world, 'prepaid' is the world where the duty is already inside itemCost.

  return collected - landed - payment - reserve - duty - fees;
}

export const SCENARIOS = [
  ['A. Pre-2025 model (no duty anywhere)', 'none', 0],
  ['B. Duty on declared supplier cost, DDP', 'wholesale', CHOICE_LINE_DISBURSEMENT],
  ['C. Duty on supplier cost, legacy mail entry billed at the door', 'wholesale', POSTAL_ENTRY_FEES],
  ['D. Duty on retail transaction value, billed at the door', 'retail', POSTAL_ENTRY_FEES],
  ['D-. Duty on retail transaction value, no billback (this line)', 'retail', CHOICE_LINE_DISBURSEMENT],
  ['E. Duty already inside the supplier price we pay', 'prepaid', 0],
];

const pad = (s, n) => String(s).padEnd(n);
const num = (v) => (v < 0 ? '-' : ' ') + '$' + Math.abs(v).toFixed(2).padStart(6);

// The report only runs as a CLI. scripts/check-undercut.mjs imports
// contribution() from here so the gate computes the real per-unit number
// instead of comparing prices as a proxy for it - without this guard, every
// import would print the whole report.
const IS_CLI =
  process.argv[1] && process.argv[1].endsWith('us-duty-impact.mjs');

if (IS_CLI) {
for (const [cohortLabel, cohort, market] of COHORTS) {
  console.log('\n\n=== ' + cohortLabel + ' ===');
  for (const [label, basis, carrier] of SCENARIOS) {
    console.log('\n' + label);
    console.log('-'.repeat(76));
    let total = 0;
    for (const [handle, retail, itemCost, supplierShip, dutyRate] of cohort) {
      const c = contribution({retail, itemCost, supplierShip, dutyRate, basis, carrier, market});
      total += c;
      const flag = c < 0 ? '  LOSS' : '';
      console.log(
        `  ${pad(handle.slice(0, 44), 46)} ${pad('$' + retail.toFixed(2), 8)} ${num(c)}${flag}`,
      );
    }
    console.log(`  ${pad('', 46)} ${pad('mean', 8)} ${num(total / cohort.length)}`);
  }
}

}

if (IS_CLI) console.log(`
Reading this:
  A  is the pre-2025 world. Nothing enters on it any more; it is the yardstick.
  B  supplier prepays duty on the wholesale value and absorbs it into the line.
  C  the residual legacy mail-entry path: duty on wholesale plus $16.74 of
     CBP and USPS fees collected from whoever answers the door.
  D  the same door-billed path, but CBP valuing on what the CUSTOMER paid.
     This is the basis CBP is entitled to apply to a dropship, and it is the
     worst outcome that can actually happen.
  D- the same retail basis with no billback, which is what the couriers on this
     line would actually produce. Duty still has to be paid by someone.
  E  the duty is already inside what we pay AliExpress. Nothing extra is due
     on our side, and the margin is the ordinary dropship margin.

  E and D- are the two live candidates. Everything turns on which is true, and
  the difference on a 3-slot at $49 is about $30 an order.

  Watch B as closely as E and D-. At the real price list the supplier prepaying
  duty on wholesale value returns $2.62 / -$1.57 / $0.01 - break-even. That is
  an ordinary AliExpress arrangement, so the middle case is now the thin one.

  Do NOT try to read it off the DSers Tax&Fee line. That field is Tmall tax
  and service fees, per its own tooltip - see the correction at the top of this
  file. It reads $0.00 for every AliExpress marketplace supplier whatever the
  duty does, so treating $0.00 as proof of E would have confirmed the
  profitable scenario on no evidence at all.

  The instrument that does read it is the AliExpress order-confirmation page
  for a US address, signed in, before payment is authorised. Nothing is bought
  to look at it.

  Better still, stop needing the answer. An offer priced so that BOTH the
  prepaid and the billed contribution clear the $12.00 undercut floor is true
  under E and under D- alike, and US_DUTY_INCIDENCE can stay 'unverified'
  forever without gating it. Three of the five live offers already do.
`);
