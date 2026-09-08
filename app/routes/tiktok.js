import {redirect} from 'react-router';

// TIKTOK_DESTINATION is /collections/all, and that is now the right answer
// for a different reason than the one this comment used to give. It used to
// say "the cable-organizer PDP, the only product with published TikTok
// creative" - that product was deleted on 2026-08-28 and the constant had
// already been moved to the collection page. Today NEITHER live product has
// any TikTok creative, because neither has a single second of video, so the
// collection page is the only landing that does not promise a click something
// it cannot deliver. See ORGANIC_ASSET_GAPS in scripts/build-campaign-links.mjs.
//
// The destination and its attribution live in app/lib/social-bio-links.js so
// the production health check asserts the same values this route redirects to.
// They had drifted apart, and the check failed on every deploy as a result.
// Relative, not the `~` alias: tests/tiktok-attribution.test.js loads this
// module under plain node, which cannot resolve the Vite alias.
import {
  TIKTOK_ATTRIBUTION,
  TIKTOK_DESTINATION,
} from '../lib/social-bio-links.js';

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
