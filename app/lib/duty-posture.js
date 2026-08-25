/**
 * Who pays import charges, stated once so code and customer copy cannot drift.
 *
 * This is a commercial posture, not a technical detail, and it is the kind of
 * thing that silently goes wrong: the storefront tells a customer one thing,
 * Shopify charges another, and the discrepancy surfaces as a refused parcel.
 *
 * Two postures exist.
 *
 * `customer-pays` (DDU) is where the store has been. Nothing is collected at
 * checkout; the carrier bills the customer on delivery. It was safe while the
 * catalog sat under Canada's CAD$20 duty and CAD$40 tax de minimis thresholds,
 * because no parcel was ever assessed - the copy described a risk that never
 * materialised.
 *
 * `prepaid` (DDP) is required above those thresholds. A CA$129 order declaring
 * CA$42 crosses both, so an unprepaid parcel would hand a first-time customer
 * a CA$18-24 bill on their doorstep - duty, tax, and the carrier's roughly
 * CA$9.95 disbursement fee. That is a refund and a chargeback, not a sale.
 * Absorbing about CA$8.70 instead is both cheaper than the refunds and the
 * honest thing to sell.
 *
 * Changing this constant is NOT sufficient on its own. Shopify must be
 * configured to match - see docs/duty-prepay-runbook-2026-08-24.md. The
 * storefront copy is derived from this value, so a mismatch between the two
 * would otherwise be invisible until a customer complained.
 */
export const DUTY_POSTURE = 'customer-pays';

export const DUTY_POSTURES = Object.freeze(['customer-pays', 'prepaid']);

/**
 * Reject a posture this module does not know about.
 *
 * Without this, a typo like `'pre-paid'` degrades silently: every helper below
 * falls through to the `customer-pays` branch, so the storefront keeps telling
 * customers they owe import charges while Shopify has been switched to prepay
 * them. That mismatch is invisible in code review and only surfaces as a
 * refused parcel. Failing loudly at the call site is the cheaper outcome.
 */
function assertKnownPosture(posture) {
  if (!DUTY_POSTURES.includes(posture)) {
    throw new Error(
      `Unknown duty posture "${posture}". Expected one of: ${DUTY_POSTURES.join(', ')}.`,
    );
  }
  return posture;
}

export function isDutyPrepaid(posture = DUTY_POSTURE) {
  return assertKnownPosture(posture) === 'prepaid';
}

/**
 * The dictionary key describing import charges under the current posture.
 *
 * Deriving the key rather than hardcoding it is what makes the two postures
 * impossible to mix up: switching the constant switches the customer-facing
 * sentence in every locale at once, and the test suite asserts both variants
 * exist before either can ship.
 */
export function dutyCopyKey(posture = DUTY_POSTURE) {
  return isDutyPrepaid(posture)
    ? 'ship_check_duties_body_prepaid'
    : 'ship_check_duties_body';
}

export function dutyEtaKey(posture = DUTY_POSTURE) {
  return isDutyPrepaid(posture)
    ? 'ship_check_duties_eta_prepaid'
    : 'ship_check_duties_eta';
}
