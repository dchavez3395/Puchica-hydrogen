import process from 'node:process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  APPROVED_PRODUCT_HANDLES_BY_MARKET,
  DISCOVERABLE_PRODUCT_HANDLES,
  OPERATIONAL_HOLD_HANDLES,
  RETIRED_CATALOG_HANDLES,
} from '../app/lib/launch-catalog.js';

export const EXPECTED_HANDLES_BY_MARKET = APPROVED_PRODUCT_HANDLES_BY_MARKET;

const DEFAULT_BASE_URL = 'https://puchica.ca';
const REQUEST_TIMEOUT_MS = 15_000;
const MARKET_COOKIE = 'pk_market';
const USER_AGENT = 'Puchica-Production-Health/1.0';

export function extractProductHandles(xml) {
  return [
    ...String(xml).matchAll(/<loc>https?:\/\/[^<]+\/products\/([^<]+)<\/loc>/g),
  ]
    .map((match) => match[1].trim())
    .filter(Boolean);
}

export function extractFeedHandles(xml) {
  return [
    ...String(xml).matchAll(
      /<g:link>https?:\/\/[^<]+\/products\/([^<]+)<\/g:link>/g,
    ),
  ]
    .map((match) => match[1].trim())
    .filter(Boolean);
}

export function sameMembers(actual, expected) {
  const sortedActual = [...actual].sort();
  const sortedExpected = [...expected].sort();
  return (
    sortedActual.length === sortedExpected.length &&
    sortedActual.every((value, index) => value === sortedExpected[index])
  );
}

export function hasNoStore(headers) {
  return /(?:^|,)\s*no-store(?:\s*(?:,|$))/i.test(
    headers.get('cache-control') || '',
  );
}

export function hasNoIndex(headers) {
  return /(?:^|,)\s*noindex(?:\s*(?:,|$))/i.test(
    headers.get('x-robots-tag') || '',
  );
}

function parseArgs(argv) {
  const valueAfter = (name) => {
    const index = argv.indexOf(name);
    return index >= 0 ? argv[index + 1] : null;
  };
  return {
    baseUrl: valueAfter('--base-url') || DEFAULT_BASE_URL,
    json: argv.includes('--json'),
  };
}

function marketHeaders(market) {
  const headers = {
    Accept: 'text/html,application/xml;q=0.9,text/plain;q=0.8',
    'Cache-Control': 'no-cache',
    'User-Agent': USER_AGENT,
  };
  if (market) headers.Cookie = `${MARKET_COOKIE}=${market}`;
  return headers;
}

async function request(baseUrl, pathname, market) {
  const startedAt = performance.now();
  try {
    const response = await fetch(new URL(pathname, baseUrl), {
      headers: marketHeaders(market),
      redirect: 'follow',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    return {
      response,
      body: await response.text(),
      durationMs: Math.round(performance.now() - startedAt),
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
      durationMs: Math.round(performance.now() - startedAt),
    };
  }
}

function result(label, pathname, market, expected, actual, pass, durationMs) {
  return {
    label,
    pathname,
    market: market || 'default',
    expected,
    actual,
    pass,
    durationMs,
  };
}

async function statusCheck(
  baseUrl,
  {
    label,
    pathname,
    market,
    expectedStatus,
    expectedFinalUrl,
    requireFailClosed = false,
    requireMarketNotice = false,
  },
) {
  const inspected = await request(baseUrl, pathname, market);
  if (inspected.error) {
    return result(
      label,
      pathname,
      market,
      String(expectedStatus),
      inspected.error,
      false,
      inspected.durationMs,
    );
  }

  const {response, body, durationMs} = inspected;
  const failClosed =
    !requireFailClosed ||
    (hasNoStore(response.headers) && hasNoIndex(response.headers));
  const finalUrlMatches =
    !expectedFinalUrl || response.url === expectedFinalUrl;
  const marketNoticeMatches =
    !requireMarketNotice || body.includes('data-market-unavailable="true"');
  const actual = requireFailClosed
    ? `${response.status}; cache=${response.headers.get('cache-control') || 'missing'}; robots=${response.headers.get('x-robots-tag') || 'missing'}`
    : expectedFinalUrl
      ? `${response.status}; final=${response.url}`
      : requireMarketNotice
        ? `${response.status}; market-notice=${marketNoticeMatches ? 'present' : 'missing'}`
        : String(response.status);
  const expected = requireFailClosed
    ? `${expectedStatus}; no-store; noindex`
    : expectedFinalUrl
      ? `${expectedStatus}; final=${expectedFinalUrl}`
      : requireMarketNotice
        ? `${expectedStatus}; market-notice=present`
        : String(expectedStatus);

  return result(
    label,
    pathname,
    market,
    expected,
    actual,
    response.status === expectedStatus &&
      failClosed &&
      finalUrlMatches &&
      marketNoticeMatches,
    durationMs,
  );
}

async function documentSetCheck(
  baseUrl,
  {label, pathname, extractor, expectedHandles},
) {
  const inspected = await request(baseUrl, pathname);
  if (inspected.error) {
    return result(
      label,
      pathname,
      null,
      expectedHandles.join(', '),
      inspected.error,
      false,
      inspected.durationMs,
    );
  }
  const actualHandles = extractor(inspected.body);
  const pass =
    inspected.response.status === 200 &&
    sameMembers(actualHandles, expectedHandles);
  return result(
    label,
    pathname,
    null,
    expectedHandles.join(', '),
    actualHandles.join(', ') || '(none)',
    pass,
    inspected.durationMs,
  );
}

function routeChecks() {
  const checks = [
    {label: 'Homepage', pathname: '/', expectedStatus: 200},
    {
      label: 'All-products collection',
      pathname: '/collections/all',
      expectedStatus: 200,
    },
    {label: 'Cart entry', pathname: '/cart', expectedStatus: 200},
    {label: 'Robots policy', pathname: '/robots.txt', expectedStatus: 200},
    {label: 'Sitemap index', pathname: '/sitemap.xml', expectedStatus: 200},
    {
      label: 'French localized PDP',
      pathname: '/fr/products/white-semi-circular-travel-jewelry-case',
      expectedStatus: 200,
    },
    {
      label: 'Instagram bio destination',
      pathname:
        'http://www.puchica.ca/?utm_source=ig&utm_medium=social&utm_content=link_in_bio',
      expectedStatus: 200,
      expectedFinalUrl:
        'https://puchica.ca/?utm_source=ig&utm_medium=social&utm_content=link_in_bio',
    },
    {
      label: 'TikTok bio destination',
      pathname: '/tiktok',
      expectedStatus: 200,
      expectedFinalUrl:
        'https://puchica.ca/products/white-semi-circular-travel-jewelry-case?utm_source=tiktok&utm_medium=organic_social&utm_campaign=travel_edit_organic_202608&utm_content=profile_bio_jewelry_case',
    },
  ];

  for (const [market, handles] of Object.entries(EXPECTED_HANDLES_BY_MARKET)) {
    for (const handle of handles) {
      checks.push({
        label: `${market} live product: ${handle}`,
        pathname: `/products/${handle}`,
        market,
        expectedStatus: 200,
      });
    }
  }

  for (const market of ['CA', 'US']) {
    for (const handle of DISCOVERABLE_PRODUCT_HANDLES) {
      if (EXPECTED_HANDLES_BY_MARKET[market].includes(handle)) continue;
      checks.push({
        label: `${market} informational product: ${handle}`,
        pathname: `/products/${handle}`,
        market,
        expectedStatus: 200,
        requireMarketNotice: true,
      });
    }
  }

  for (const handle of RETIRED_CATALOG_HANDLES) {
    for (const market of ['CA', 'US']) {
      checks.push({
        label: `${market} retired product: ${handle}`,
        pathname: `/products/${handle}`,
        market,
        expectedStatus: 404,
        requireFailClosed: true,
      });
    }
  }

  for (const handle of OPERATIONAL_HOLD_HANDLES) {
    for (const market of ['CA', 'US']) {
      checks.push({
        label: `${market} operational hold: ${handle}`,
        pathname: `/products/${handle}`,
        market,
        expectedStatus: 404,
        requireFailClosed: true,
      });
    }
  }

  return checks;
}

async function runInBatches(tasks, batchSize = 4) {
  const output = [];
  for (let index = 0; index < tasks.length; index += batchSize) {
    const batch = tasks.slice(index, index + batchSize);
    output.push(...(await Promise.all(batch.map((task) => task()))));
  }
  return output;
}

export async function runProductionHealth(baseUrl = DEFAULT_BASE_URL) {
  const normalizedBaseUrl = new URL(baseUrl).toString();
  const tasks = routeChecks().map(
    (check) => () => statusCheck(normalizedBaseUrl, check),
  );
  tasks.push(
    () =>
      documentSetCheck(normalizedBaseUrl, {
        label: 'Canada product feed exact set',
        pathname: '/feed.xml',
        extractor: extractFeedHandles,
        expectedHandles: EXPECTED_HANDLES_BY_MARKET.CA,
      }),
    () =>
      documentSetCheck(normalizedBaseUrl, {
        label: 'Product sitemap exact set',
        pathname: '/sitemap/products/1.xml',
        extractor: extractProductHandles,
        expectedHandles: DISCOVERABLE_PRODUCT_HANDLES,
      }),
  );
  return runInBatches(tasks);
}

function printHuman(results, baseUrl) {
  console.log(`Puchica production health: ${baseUrl}`);
  console.log(
    'Read-only: no cart mutation, checkout, order, payment, or supplier action.',
  );
  for (const check of results) {
    const mark = check.pass ? 'PASS' : 'FAIL';
    console.log(
      `${mark} [${check.market}] ${check.label} (${check.durationMs} ms)`,
    );
    if (!check.pass) {
      console.log(`  expected: ${check.expected}`);
      console.log(`  actual:   ${check.actual}`);
    }
  }
  const passed = results.filter((check) => check.pass).length;
  console.log(`Result: ${passed}/${results.length} checks passed.`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const baseUrl = new URL(args.baseUrl).toString();
  const checks = await runProductionHealth(baseUrl);
  const payload = {
    checkedAt: new Date().toISOString(),
    baseUrl,
    readOnly: true,
    passed: checks.every((check) => check.pass),
    checks,
  };
  if (args.json) console.log(JSON.stringify(payload, null, 2));
  else printHuman(checks, baseUrl);
  if (!payload.passed) process.exitCode = 1;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
