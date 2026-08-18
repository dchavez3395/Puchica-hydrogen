import process from 'node:process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {DISCOVERABLE_PRODUCT_HANDLES} from '../app/lib/launch-catalog.js';

const BASE_URL = 'https://puchica.ca';
const TIMEOUT_MS = 15_000;
const USER_AGENT = 'Puchica-Public-Metadata-Health/1.0';

export function documentFacts(html) {
  const source = String(html);
  const value = (pattern) => source.match(pattern)?.[1]?.trim() || '';
  return {
    lang: value(/<html[^>]*\blang=["']([^"']+)["']/i),
    title: value(/<title[^>]*>([^<]*)<\/title>/i),
    canonical: value(/<link[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']+)["']/i),
    h1Count: [...source.matchAll(/<h1\b/gi)].length,
    robots: value(/<meta[^>]*\bname=["']robots["'][^>]*\bcontent=["']([^"']+)["']/i),
    hreflangs: [...source.matchAll(/<link[^>]*\brel=["']alternate["'][^>]*\bhreflang=["']([^"']+)["'][^>]*>/gi)].map((match) => match[1]),
  };
}

export function metadataPass(facts, expected) {
  const actualLang = facts.lang.toLowerCase();
  const expectedLang = expected.lang.toLowerCase();
  const languageMatches =
    actualLang === expectedLang || actualLang.startsWith(`${expectedLang}-`);
  return (
    languageMatches &&
    facts.title.includes('Puchica') &&
    facts.canonical === expected.canonical &&
    facts.h1Count === 1 &&
    !/noindex/i.test(facts.robots) &&
    ['en', 'fr', 'es', 'pt-br', 'x-default'].every((lang) =>
      facts.hreflangs.includes(lang),
    )
  );
}

const locales = [
  {prefix: '', lang: 'en'},
  {prefix: '/fr', lang: 'fr'},
  {prefix: '/es', lang: 'es'},
  {prefix: '/pt-br', lang: 'pt-BR'},
];
const staticPaths = [
  '/',
  '/collections/all',
  '/pages/about',
  '/pages/contact',
  '/pages/faq',
  '/pages/shipping',
];

function localizedPath(prefix, pathname) {
  if (!prefix) return pathname;
  return pathname === '/' ? prefix : `${prefix}${pathname}`;
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'text/html',
      'Cache-Control': 'no-cache',
      'User-Agent': USER_AGENT,
      ...(options.headers || {}),
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  return {response, body: await response.text()};
}

async function inspectPage(prefix, lang, pathname) {
  const localized = localizedPath(prefix, pathname);
  const canonical = `${BASE_URL}${localized}`;
  try {
    const {response, body} = await fetchText(canonical);
    const facts = documentFacts(body);
    return {
      label: localized,
      pass: response.status === 200 && metadataPass(facts, {lang, canonical}),
      actual: `${response.status}; lang=${facts.lang || 'missing'}; h1=${facts.h1Count}; title=${facts.title || 'missing'}; canonical=${facts.canonical || 'missing'}`,
    };
  } catch (error) {
    return {label: localized, pass: false, actual: String(error)};
  }
}

async function redirectCheck(prefix, pathname) {
  const localized = localizedPath(prefix, pathname);
  const expected = `${localizedPath(prefix, '/collections/all')}`;
  try {
    const {response} = await fetchText(`${BASE_URL}${localized}`, {
      redirect: 'manual',
    });
    return {
      label: `${localized} redirect`,
      pass: response.status === 301 && response.headers.get('location') === expected,
      actual: `${response.status}; location=${response.headers.get('location') || 'missing'}`,
    };
  } catch (error) {
    return {label: `${localized} redirect`, pass: false, actual: String(error)};
  }
}

export async function run() {
  const checks = [];
  for (const locale of locales) {
    for (const pathname of staticPaths) {
      checks.push(await inspectPage(locale.prefix, locale.lang, pathname));
    }
    for (const handle of DISCOVERABLE_PRODUCT_HANDLES) {
      checks.push(
        await inspectPage(locale.prefix, locale.lang, `/products/${handle}`),
      );
    }
    for (const pathname of ['/blogs', '/campaigns/home-finds', '/newsletter']) {
      checks.push(await redirectCheck(locale.prefix, pathname));
    }
  }
  const failed = checks.filter((check) => !check.pass);
  for (const check of checks) {
    console.log(`${check.pass ? 'PASS' : 'FAIL'} ${check.label}: ${check.actual}`);
  }
  console.log(`Result: ${checks.length - failed.length}/${checks.length} checks passed.`);
  if (failed.length) process.exitCode = 1;
  return checks;
}

const isMain = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;
if (isMain) await run();
