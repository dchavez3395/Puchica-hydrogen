/**
 * Where the social bio links land, stated once.
 *
 * The `/tiktok` route and the production health check both need to agree on
 * this, and they did not: the route was repointed at the cable-organizer PDP
 * during the organic relaunch, while `check-production-health.mjs` kept
 * asserting the older jewelry-case destination and its retired campaign name.
 * The result was a post-deploy step that failed on every single run, which is
 * worse than having no check at all - a workflow that is always red teaches
 * everyone to ignore it, so a genuine regression would have gone unnoticed.
 *
 * Both sides now import from here. Repointing the bio link means editing one
 * constant, and the check follows automatically.
 */

/** The PDP the TikTok profile bio sends people to. */
export const TIKTOK_DESTINATION = '/products/travel-cable-organizer-case';

/**
 * Attribution stamped on every click from the TikTok bio.
 *
 * Five incompatible campaign values accumulated across earlier content packs,
 * which made organic sessions impossible to compare. Every organic surface now
 * carries this one.
 */
export const TIKTOK_ATTRIBUTION = Object.freeze({
  utm_source: 'tiktok',
  utm_medium: 'organic_social',
  utm_campaign: 'organic_relaunch_2026_08',
  utm_content: 'profile_bio_cable_case',
});

/**
 * The absolute URL a TikTok bio click should finish on.
 *
 * @param {string} origin e.g. 'https://puchica.ca'
 * @returns {string}
 */
export function tiktokBioDestinationUrl(origin) {
  const params = new URLSearchParams(TIKTOK_ATTRIBUTION);
  return `${String(origin).replace(/\/$/, '')}${TIKTOK_DESTINATION}?${params.toString()}`;
}
