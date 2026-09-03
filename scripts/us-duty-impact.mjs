#!/usr/bin/env node
/**
 * What the end of US de minimis does to the US route, per offer.
 *
 * Costs and supplier shipping: DSers "My Products", read 2026-09-03. DSers is
 * what we actually pay, and it does NOT always equal the AliExpress listing
 * price - the 4-slot quotes $31.24-31.67 in DSers against $30.02 on the
 * listing. Where they disagree, DSers wins here.
 * US retail: Shopify contextualPricing(country: US), read 2026-09-02.
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
 * This has NOT been confirmed. Confirming it needs a signed-in AliExpress
 * checkout with a US address, or the "Tax&Fee" line DSers shows on a real
 * order before payment is taken. See US_DUTY_INCIDENCE in
 * app/lib/launch-catalog.js for how the catalogue treats the uncertainty.
 */

const PAYMENT_RATE = 0.055; // 3.5% cross-border + 2% currency conversion
const PAYMENT_FIXED = 0.3;
const RESERVE_RATE = 0.08; // ~12% return rate x ~32% loss per return, + chargebacks
const MPF = 2.69; // -> $2.77 on 2026-10-01
const COURIER_DISBURSEMENT = 17.0; // UPS min, 2026-05-11. NOT on this line.
const POSTAL_ENTRY_FEES = 16.74; // CBP $7.39 dutiable mail + USPS $9.35
const CHOICE_LINE_DISBURSEMENT = 0.0; // SpeedX / GOFO / USPS are last-mile only
const FREE_SHIP_OVER = 50.0;
const COLLECTED_SHIPPING = 8.0;

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
  ['watch-roll 3 slot', 89.0, 26.18, 1.99, 0.551],
  ['watch-roll 4 slot', 99.0, 31.67, 1.99, 0.551],
  ['watch-roll 6 slot', 129.0, 43.48, 1.99, 0.551],
];

const COHORTS = [
  ['Archived 2026-08 cohort', OFFERS],
  ['Live 2026-09 watch-roll cohort', LIVE_OFFERS],
];

function contribution({retail, itemCost, supplierShip, dutyRate, basis, carrier}) {
  const collected = retail >= FREE_SHIP_OVER ? retail : retail + COLLECTED_SHIPPING;
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

const SCENARIOS = [
  ['A. Pre-2025 model (no duty anywhere)', 'none', 0],
  ['B. Duty on declared supplier cost, DDP', 'wholesale', CHOICE_LINE_DISBURSEMENT],
  ['C. Duty on supplier cost, legacy mail entry billed at the door', 'wholesale', POSTAL_ENTRY_FEES],
  ['D. Duty on retail transaction value, billed at the door', 'retail', POSTAL_ENTRY_FEES],
  ['D-. Duty on retail transaction value, no billback (this line)', 'retail', CHOICE_LINE_DISBURSEMENT],
  ['E. Duty already inside the supplier price we pay', 'prepaid', 0],
];

const pad = (s, n) => String(s).padEnd(n);
const num = (v) => (v < 0 ? '-' : ' ') + '$' + Math.abs(v).toFixed(2).padStart(6);

for (const [cohortLabel, cohort] of COHORTS) {
  console.log('\n\n=== ' + cohortLabel + ' ===');
  for (const [label, basis, carrier] of SCENARIOS) {
    console.log('\n' + label);
    console.log('-'.repeat(76));
    let total = 0;
    for (const [handle, retail, itemCost, supplierShip, dutyRate] of cohort) {
      const c = contribution({retail, itemCost, supplierShip, dutyRate, basis, carrier});
      total += c;
      const flag = c < 0 ? '  LOSS' : '';
      console.log(
        `  ${pad(handle.slice(0, 44), 46)} ${pad('$' + retail.toFixed(2), 8)} ${num(c)}${flag}`,
      );
    }
    console.log(`  ${pad('', 46)} ${pad('mean', 8)} ${num(total / cohort.length)}`);
  }
}

console.log(`
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
  the difference on a 3-slot at $89 is about $52 an order.

  Read it off a real order: DSers shows "Tax&Fee" on the order card BEFORE
  payment is taken. $0.00 there on a US order means E. Anything else means the
  duty is landing on us and D- is the floor.
`);
