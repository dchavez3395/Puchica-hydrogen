import {redirect} from 'react-router';

export const INSTAGRAM_DESTINATION = '/';
export const INSTAGRAM_ATTRIBUTION = Object.freeze({
  utm_source: 'instagram',
  utm_medium: 'organic_social',
  utm_campaign: 'travel_edit_organic_202608',
  utm_content: 'profile_bio',
});

/** @param {Route.LoaderArgs} args */
export async function loader({request}) {
  const sourceUrl = new URL(request.url);
  const params = new URLSearchParams(sourceUrl.search);
  for (const [key, value] of Object.entries(INSTAGRAM_ATTRIBUTION)) {
    params.set(key, value);
  }

  return redirect(`${INSTAGRAM_DESTINATION}?${params.toString()}`, {
    status: 302,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

export default function InstagramRedirect() {
  return null;
}

/** @typedef {import('./+types/instagram').Route} Route */
