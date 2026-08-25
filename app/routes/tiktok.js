import {redirect} from 'react-router';

// The cable-organizer PDP: the only product with published TikTok creative.
// The live @puchica_canada bio and the UGC pack both promise this landing —
// pointing the bio at a product with no TikTok creative wastes the click.
export const TIKTOK_DESTINATION = '/products/travel-cable-organizer-case';
export const TIKTOK_ATTRIBUTION = Object.freeze({
  utm_source: 'tiktok',
  utm_medium: 'organic_social',
  // Canonical campaign for the 2026-08 organic relaunch. Five incompatible
  // campaign values accumulated across earlier packs; every organic surface
  // now carries this one so sessions are comparable.
  utm_campaign: 'organic_relaunch_2026_08',
  utm_content: 'profile_bio_cable_case',
});

/** @param {Route.LoaderArgs} args */
export async function loader({request}) {
  const sourceUrl = new URL(request.url);
  const params = new URLSearchParams(sourceUrl.search);
  for (const [key, value] of Object.entries(TIKTOK_ATTRIBUTION)) {
    params.set(key, value);
  }

  return redirect(`${TIKTOK_DESTINATION}?${params.toString()}`, {
    status: 302,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

export default function TikTokRedirect() {
  return null;
}

/** @typedef {import('./+types/tiktok').Route} Route */
