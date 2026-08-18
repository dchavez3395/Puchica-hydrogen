import process from 'node:process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {DISCOVERABLE_PRODUCT_HANDLES} from '../app/lib/launch-catalog.js';

const ORIGIN = 'https://puchica.ca';
const TIMEOUT_MS = 15_000;
const USER_AGENT = 'Puchica-Public-Link-Health/1.0';
const LOCALES = ['', '/fr', '/es', '/pt-br'];
const SEED_PATHS = [
  '/',
  '/collections/all',
  ...DISCOVERABLE_PRODUCT_HANDLES.map((handle) => `/products/${handle}`),
];

export function internalLinks(html, pageUrl, origin = ORIGIN) {
  const links = new Set();
  const source = String(html || '');
  for (const match of source.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) {
    const href = match[1].trim();
    if (!href || /^(?:#|mailto:|tel:|javascript:)/i.test(href)) continue;
    try {
      const url = new URL(href, pageUrl);
      if (url.origin !== origin) continue;
      url.hash = '';
      links.add(`${url.pathname}${url.search}`);
    } catch {
      // Malformed links are ignored here; the HTML/accessibility contract owns them.
    }
  }
  return [...links].sort();
}

async function request(pathname) {
  const url = new URL(pathname, ORIGIN);
  try {
    const response = await fetch(url, {
      redirect: 'manual',
      headers: {
        Accept: 'text/html',
        'Cache-Control': 'no-cache',
        'User-Agent': USER_AGENT,
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return {
      path: `${url.pathname}${url.search}`,
      status: response.status,
      location: response.headers.get('location') || '',
      body: response.status === 200 ? await response.text() : '',
    };
  } catch (error) {
    return {path: `${url.pathname}${url.search}`, status: 0, location: '', error: String(error)};
  }
}

export async function run() {
  const seedPaths = LOCALES.flatMap((prefix) =>
    SEED_PATHS.map((pathname) =>
      prefix && pathname === '/' ? prefix : `${prefix}${pathname}`,
    ),
  );
  const seedResults = await Promise.all(seedPaths.map(request));
  const discovered = new Set(seedPaths);
  for (const result of seedResults) {
    if (result.status !== 200) continue;
    for (const link of internalLinks(result.body, `${ORIGIN}${result.path}`)) {
      discovered.add(link);
    }
  }

  const resultsByPath = new Map(seedResults.map((result) => [result.path, result]));
  const remaining = [...discovered].filter((pathname) => !resultsByPath.has(pathname));
  for (let index = 0; index < remaining.length; index += 8) {
    const batch = await Promise.all(remaining.slice(index, index + 8).map(request));
    for (const result of batch) resultsByPath.set(result.path, result);
  }

  const results = [...resultsByPath.values()].sort((a, b) => a.path.localeCompare(b.path));
  const failed = results.filter(({status}) => status < 200 || status >= 400);
  for (const result of results) {
    const redirect = result.location ? ` -> ${result.location}` : '';
    const detail = result.error ? `; ${result.error}` : '';
    console.log(`${result.status >= 200 && result.status < 400 ? 'PASS' : 'FAIL'} ${result.path}: ${result.status}${redirect}${detail}`);
  }
  console.log(`Result: ${results.length - failed.length}/${results.length} internal links passed.`);
  if (failed.length) process.exitCode = 1;
  return results;
}

const isMain = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;
if (isMain) await run();
