import {handleNewsletterSignup} from '../lib/newsletter.js';

/**
 * POST /api/newsletter — footer signup relay to Klaviyo's double-opt-in
 * list. All the logic (origin check, honeypot, validation, relay) lives in
 * app/lib/newsletter.js so tests/newsletter.test.js can exercise it.
 */

/** @param {Route.ActionArgs} */
export async function action({request, context}) {
  return handleNewsletterSignup(request, context?.env || {});
}

/** Direct GET hits (bots, curiosity) get nothing useful. */
export function loader() {
  return new Response(null, {status: 405, headers: {Allow: 'POST'}});
}

/** @typedef {import('./+types/api.newsletter').Route} Route */
