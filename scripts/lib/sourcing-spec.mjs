/**
 * What to look for when sourcing a replacement catalog through DSers.
 *
 * This supersedes the flat-CPA framing in business-model-comparison.mjs, which
 * was anchored to a single CA$42 benchmark and therefore concluded that AOV had
 * to exceed about CA$92. That conclusion was too strong. Cost per acquisition
 * is not a constant: the same benchmark set puts Lifestyle & Boutique at CA$42
 * and Electronics at CA$69, because a more expensive product takes more
 * persuading. A CA$120 product never had a CA$42 CPA.
 *
 * But CPA does not scale down forever either. Whatever you sell, a cold click
 * from a stranger costs roughly the same, and enough of them have to land
 * before one converts. That gives CPA a floor - and the floor is what actually
 * killed the current catalog. At CA$35 retail a proportional CPA would be
 * CA$14, which does not exist on cold traffic. The real CPA is the floor, and
 * the floor is larger than the whole contribution.
 *
 *   CPA = max(floorCad, proportionOfAov x AOV)
 *
 * This single expression explains the entire problem. Below the crossover
 * point the floor dominates and low-ticket items lose no matter how good their
 * margin is. Above it, CPA scales with price while a good margin scales too,
 * and the business works. Dropshipping is not dead; it has a minimum viable
 * price, and this catalog sits underneath it.
 */

/**
 * Cold-traffic acquisition cost.
 *
 * `floorCad` is the practical minimum for a store with no brand, no pixel
 * history and no retargeting pool. `proportionOfAov` is what a well-run store
 * spends on ads as a share of revenue.
 */
export const CPA_MODEL = Object.freeze({
  floorCad: 28,
  proportionOfAov: 0.4,
});

/** Canadian import model, mirroring acquisition-economics.mjs. */
export const IMPORT_MODEL = Object.freeze({
  dutyDeMinimisCad: 20,
  taxDeMinimisCad: 40,
  dutyRate: 0.11,
  taxRate: 0.0876,
  carrierHandlingCad: 9.95,
});

export const ORDER_MODEL = Object.freeze({
  paymentPercentRate: 0.035,
  paymentFixedFee: 0.3,
  exceptionReserveRate: 0.05,
  freeShippingThresholdCad: 50,
  belowThresholdShippingCad: 5,
});

export function estimateCpa(aovCad, model = CPA_MODEL) {
  return Math.max(model.floorCad, model.proportionOfAov * Number(aovCad));
}

/**
 * The price at which a proportional CPA overtakes the floor. Below this, every
 * extra dollar of margin is competing with a fixed cost that does not shrink.
 */
export function cpaFloorCrossover(model = CPA_MODEL) {
  return model.floorCad / model.proportionOfAov;
}

/**
 * Duty and tax on one parcel, and what the customer is asked for if we do not
 * prepay. Declared value is the supplier cost, which is what an AliExpress
 * parcel normally declares.
 */
export function importCharges(declaredValueCad, model = IMPORT_MODEL) {
  const value = Number(declaredValueCad);
  const duty = value > model.dutyDeMinimisCad ? value * model.dutyRate : 0;
  const tax = value > model.taxDeMinimisCad ? (value + duty) * model.taxRate : 0;
  const assessed = duty > 0 || tax > 0;
  return {
    duty,
    tax,
    total: duty + tax,
    assessed,
    customerOwesIfNotPrepaid: assessed
      ? duty + tax + model.carrierHandlingCad
      : 0,
  };
}

/**
 * Full economics for a candidate product.
 *
 * `prepayDuties` is the recommended posture above the de minimis thresholds:
 * we absorb duty and tax so the customer is never asked for money on the
 * doorstep. It costs less than the refund rate of surprising them.
 */
export function evaluateCandidate({
  name = 'candidate',
  retailCad,
  supplierCostUsd,
  supplierShippingUsd = 0,
  fxCadPerUsd = 1.4,
  prepayDuties = true,
  profitShare = 0.3,
  order = ORDER_MODEL,
  cpaModel = CPA_MODEL,
}) {
  const retail = Number(retailCad);
  const landed =
    (Number(supplierCostUsd) + Number(supplierShippingUsd)) *
    Number(fxCadPerUsd);

  const shippingCollected =
    retail >= order.freeShippingThresholdCad ? 0 : order.belowThresholdShippingCad;
  const collected = retail + shippingCollected;
  const payment = collected * order.paymentPercentRate + order.paymentFixedFee;
  const reserve = collected * order.exceptionReserveRate;

  const charges = importCharges(landed);
  const dutiesAbsorbed = prepayDuties ? charges.total : 0;

  const contribution =
    collected - landed - payment - reserve - dutiesAbsorbed;
  const margin = collected > 0 ? contribution / collected : 0;

  const cpa = estimateCpa(collected, cpaModel);
  const profit = contribution - cpa;
  const requiredContribution = cpa / (1 - Number(profitShare));

  return {
    name,
    retailCad: retail,
    landedCad: landed,
    landedShareOfRetail: retail > 0 ? landed / retail : Infinity,
    collected,
    payment,
    reserve,
    importCharges: charges,
    dutiesAbsorbed,
    customerOwesAtDoor: prepayDuties ? 0 : charges.customerOwesIfNotPrepaid,
    contribution,
    margin,
    estimatedCpa: cpa,
    cpaIsFloorBound: cpa === cpaModel.floorCad,
    profitPerOrder: profit,
    requiredContribution,
    verdict:
      contribution >= requiredContribution
        ? 'PASS'
        : profit > 0
          ? 'MARGINAL'
          : 'FAIL',
  };
}

/**
 * The sourcing brief: the price band and cost ceiling a candidate must hit.
 *
 * Expressed as a maximum landed cost as a share of retail, because that is the
 * number visible while browsing AliExpress with a calculator.
 */
export function sourcingSpec({
  retailBandCad = [90, 150],
  profitShare = 0.3,
  cpaModel = CPA_MODEL,
  order = ORDER_MODEL,
} = {}) {
  return retailBandCad.map((retail) => {
    const collected = retail;
    const cpa = estimateCpa(collected, cpaModel);
    const needed = cpa / (1 - profitShare);
    const payment = collected * order.paymentPercentRate + order.paymentFixedFee;
    const reserve = collected * order.exceptionReserveRate;

    // Solve for the landed cost that leaves exactly the needed contribution,
    // accounting for duty and tax we absorb on that landed value.
    let maxLanded = 0;
    for (let guess = retail; guess >= 0; guess -= 0.01) {
      const duties = importCharges(guess).total;
      if (collected - guess - payment - reserve - duties >= needed) {
        maxLanded = guess;
        break;
      }
    }

    return {
      retailCad: retail,
      estimatedCpa: cpa,
      requiredContribution: needed,
      maxLandedCad: maxLanded,
      maxLandedShare: maxLanded / retail,
      maxSupplierCostUsd: maxLanded / 1.4,
    };
  });
}

/**
 * Hard disqualifiers for a Canadian solo operator sourcing through DSers.
 *
 * Worth stating plainly, because most "high-ticket dropshipping" advice does
 * not apply here. The categories those lists name - rowing machines, standing
 * desks, pressure washers, power stations - are brand-authorized dropshipping
 * from domestic distributors, which needs supplier applications, resale
 * certificates and a business relationship. That is a different model from
 * DSers/AliExpress, and it is not hands-off.
 *
 * What is left for an AliExpress solo operator is narrower but real: unpowered,
 * uncertified, unsized goods between CA$90 and CA$150.
 *
 * Each flag below either ends the evaluation or costs the candidate points.
 * `fatal` items are not judgement calls - they are legal, safety or platform
 * requirements a one-person store cannot satisfy.
 */
export const DISQUALIFIERS = Object.freeze({
  mainsElectrical: {
    fatal: true,
    why: 'Anything plugging into Canadian mains needs CSA or cUL certification. A supplier listing is not certification, and selling uncertified is an offence.',
  },
  wireless: {
    fatal: true,
    why: 'Radio and Bluetooth devices need ISED certification and an IC ID. Neither can be inherited from an AliExpress listing.',
  },
  lithiumBattery: {
    fatal: true,
    why: 'Shipping restrictions, fire liability, and refusal risk in transit. Not worth it at any margin.',
  },
  regulatedGoods: {
    fatal: true,
    why: 'Cosmetics need Health Canada notification; food and supplements fall under CFIA; toys and childrens products under the Canada Consumer Product Safety Act; anything with a health claim is a medical device. All require work a solo store cannot absorb.',
  },
  brandedOrLicensed: {
    fatal: true,
    why: 'Counterfeit and IP exposure. A supplier photo showing a brand mark is a takedown and a frozen payment processor waiting to happen.',
  },
  sized: {
    fatal: false,
    penalty: 3,
    why: 'Apparel and footwear return at 20-40%. Sizing disputes are the single largest support burden in ecommerce and they scale with order value.',
  },
  fragile: {
    fatal: false,
    penalty: 2,
    why: 'Breakage over an 8-14 day route, and a replacement costs the full landed cost again.',
  },
  needsAssemblyOrSupport: {
    fatal: false,
    penalty: 2,
    why: 'Every support email is unpaid labour and works directly against a hands-off store.',
  },
  bulky: {
    fatal: false,
    penalty: 1,
    why: 'Supplier shipping rises faster than product cost, and route availability to Canada thins out.',
  },
});

/**
 * Bilingual labelling is a requirement, not a preference: Canadian consumer
 * products generally need English and French safety information and
 * instructions. A supplier who ships English-only packaging is a compliance
 * problem you inherit at the border, so it belongs in research rather than in
 * a discovery after the first order.
 */
export const BILINGUAL_LABELLING_REQUIRED = true;

/**
 * Combine the economics with the risk flags into one ranked verdict.
 *
 * `flags` is an object of DISQUALIFIERS keys set true. Any fatal flag rejects
 * the candidate outright regardless of how good the margin looks - which is
 * the point, because the attractive margins in this price band cluster in
 * exactly the categories that are fatal.
 */
export function scoreCandidate({flags = {}, ...candidate}) {
  const economics = evaluateCandidate(candidate);

  const fatal = [];
  const penalties = [];
  let penalty = 0;

  for (const [key, rule] of Object.entries(DISQUALIFIERS)) {
    if (!flags[key]) continue;
    if (rule.fatal) fatal.push({key, why: rule.why});
    else {
      penalty += rule.penalty;
      penalties.push({key, penalty: rule.penalty, why: rule.why});
    }
  }

  // Financial score: profit per order, scaled so a CA$30 profit reads as 10.
  const financialScore = Math.max(
    0,
    Math.min(10, (economics.profitPerOrder / 30) * 10),
  );
  const score = fatal.length ? 0 : Math.max(0, financialScore - penalty);

  return {
    ...economics,
    fatal,
    penalties,
    penalty,
    score,
    recommendation: fatal.length
      ? 'REJECT'
      : economics.verdict === 'FAIL'
        ? 'REJECT'
        : score >= 6
          ? 'SHORTLIST'
          : score >= 3
            ? 'CONSIDER'
            : 'WEAK',
  };
}
