import {redirect} from 'react-router';

export const TIKTOK_DESTINATION =
  '/products/white-semi-circular-travel-jewelry-case';
export const TIKTOK_ATTRIBUTION = Object.freeze({
  utm_source: 'tiktok',
  utm_medium: 'organic_social',
  utm_campaign: 'travel_edit_organic_202608',
  utm_content: 'profile_bio_jewelry_case',
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
