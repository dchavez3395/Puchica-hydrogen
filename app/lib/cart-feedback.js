/**
 * Capture the merchandise tied to the idle -> submitting transition exactly
 * once. A shopper can change variants while the request is in flight; later
 * renders must not reassign the old request to the new selection.
 */
export function captureCartSubmission({
  isSubmitting,
  wasSubmitting,
  attemptedIdsKey,
  submittedIdsKey,
}) {
  if (isSubmitting && !wasSubmitting) {
    return {wasSubmitting: true, submittedIdsKey: attemptedIdsKey};
  }
  return {wasSubmitting, submittedIdsKey};
}

export function isFeedbackForCurrentSelection(
  submittedIdsKey,
  attemptedIdsKey,
) {
  return Boolean(submittedIdsKey) && submittedIdsKey === attemptedIdsKey;
}
