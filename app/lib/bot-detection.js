/**
 * Bot detection for analytics filtering.
 *
 * Prevents analytics scripts (GA4, Meta Pixel) from loading/executing
 * for known bot and crawler user-agents. This avoids inflating
 * analytics data with bot traffic.
 *
 * Uses the `isbot` library (already a dependency) for server-side
 * detection, plus a client-side pattern check for headless browsers
 * and known analytics spam patterns.
 */

// Known bot/crawler patterns — checked client-side
const BOT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /headless/i,
  /phantom/i,
  /puppeteer/i,
  /selenium/i,
  /webdriver/i,
  /lighthouse/i,
  /googlebot/i,
  /bingbot/i,
  /yandexbot/i,
  /baiduspider/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /whatsapp/i,
  /telegrambot/i,
  /applebot/i,
  /petalbot/i,
  /semrush/i,
  /ahrefs/i,
  /mj12/i,
  /dotbot/i,
  /bytespider/i,
  /claudebot/i,
  /gptbot/i,
  /perplexity/i,
  /amazonbot/i,
  /siteaudit/i,
  /seo/i,
  /monitor/i,
  /uptime/i,
  /statuscake/i,
  /pingdom/i,
  /datadog/i,
];

/**
 * Check if the current browser session is a bot.
 * Client-side only — uses navigator.userAgent.
 * @returns {boolean}
 */
export function isBotClient() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  if (!ua) return false;

  // Headless Chrome signals
  if (navigator.webdriver === true) return true;

  // Missing typical browser properties
  if (!navigator.language || !navigator.languages?.length) return true;

  // Known bot UA patterns
  return BOT_PATTERNS.some((pattern) => pattern.test(ua));
}

/**
 * Server-side bot check using the `isbot` library.
 * @param {string | null} userAgent
 * @returns {boolean}
 */
export function isBotServer(userAgent) {
  if (!userAgent) return false;
  // isbot is imported dynamically to avoid bundling issues
  try {
    const {isbot} = require('isbot');
    return isbot(userAgent);
  } catch {
    // Fallback to pattern check if isbot isn't available
    return BOT_PATTERNS.some((p) => p.test(userAgent));
  }
}