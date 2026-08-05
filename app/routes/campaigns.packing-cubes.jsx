import {redirect} from 'react-router';

/**
 * Campaign route for the Red 5-Piece Compression Packing Cube Set.
 *
 * This route existed only to sell a known-broken DSers mapping
 * (`5PCS Set Red` → `3PCS` supplier SKU, Shopify variant
 * `49961853026554` / AliExpress `1005008568050448`). Selling the
 * corrupted SKU ships a 3-piece set to customers who paid for 5.
 *
 * The product stays unpublished until the owner authorizes a clean
 * DSers re-import of a verified 5-piece SKU (see
 * `docs/canada-go-live-readiness-2026-08-04.md` §6). To remove the
 * footgun without breaking the route tree, the route now redirects
 * harmlessly to the catalog. Do not re-add the broken offer here.
 */

/** @param {Route.LoaderArgs} args */
export async function loader() {
  return redirect('/collections/all', {
    status: 302,
    headers: {'Cache-Control': 'no-store, max-age=0'},
  });
}

/**
 * Default export is required by the route module API but should never
 * render — the loader always redirects. Returning `null` makes an
 * accidental render obvious without showing anything.
 */
export default function PackingCubesCampaign() {
  return null;
}

/** @typedef {import('./+types/campaigns.packing-cubes').Route} Route */