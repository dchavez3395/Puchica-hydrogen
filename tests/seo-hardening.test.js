import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DICTIONARIES} from '../app/lib/dictionaries.js';

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('product route exposes one semantic h1 across responsive layouts', () => {
  const source = read('app/routes/products.$handle.jsx');
  assert.equal((source.match(/<h1\b/g) || []).length, 1);
  assert.match(source, /<h1 className="sr-only">\{displayTitle\}<\/h1>/);
});

test('legacy best-sellers language resolves to an honest Featured view', () => {
  const redirect = read('app/routes/collections.best-sellers.jsx');
  const catalog = read('app/routes/collections.all.jsx');
  assert.match(redirect, /view=featured/);
  assert.doesNotMatch(redirect, /sort=best-selling/);
  assert.match(catalog, /t\('featured_heading'\)/);
  assert.doesNotMatch(catalog, /t\('best_sellers_eyebrow'\)/);
});

test('Featured and New Arrivals view copy is localized without sales claims', () => {
  const header = read('app/components/Header.jsx');
  const megaMenu = read('app/components/MegaMenu.jsx');
  const notFound = read('app/routes/$.jsx');
  const catalog = read('app/routes/collections.all.jsx');

  for (const locale of ['en', 'fr', 'es', 'pt-br']) {
    const dictionary = DICTIONARIES[locale];
    for (const key of [
      'nav_featured',
      'notfound_featured',
      'featured_eyebrow',
      'featured_heading',
      'featured_sub',
      'featured_meta_title',
      'featured_meta_description',
      'new_arrivals_meta_title',
      'new_arrivals_meta_description',
      'notfound_meta_title',
      'notfound_meta_description',
    ]) {
      assert.ok(dictionary[key], `${locale} is missing ${key}`);
    }
  }

  for (const source of [header, megaMenu]) {
    assert.match(source, /t\('nav_featured'\)/);
  }
  assert.match(notFound, /t\('notfound_featured'\)/);
  assert.match(catalog, /dictionary\.featured_meta_title/);
});

test('localized product and breadcrumb schema use localized canonical URLs', () => {
  const product = read('app/routes/products.$handle.jsx');
  const seo = read('app/lib/seo.js');

  assert.match(
    product,
    /canonical\(`\/products\/\$\{product\.handle\}`, langKey\)/,
  );
  assert.match(product, /breadcrumbJsonLd\([\s\S]*langKey/);
  assert.match(seo, /export function breadcrumbJsonLd\(items, langKey\)/);
  assert.match(seo, /item: canonical\(item\.url, langKey\)/);
});

test('localized catch-all metadata matches the request language', () => {
  const source = read('app/routes/$.jsx');
  assert.match(source, /dictionary\.notfound_meta_title/);
  assert.match(source, /dictionary\.notfound_meta_description/);
  assert.match(source, /langKey,/);
});

test('unreviewed locales stay accessible but are not advertised for indexing', () => {
  const boundary = read('app/components/LocaleBoundary.jsx');
  const seo = read('app/lib/seo.js');
  const sitemap = read('app/routes/sitemap.$type.$page[.xml].jsx');

  assert.match(boundary, /params\.locale[\s\S]*noindex, follow/);
  assert.match(seo, /isUnreviewedLocale/);
  assert.match(seo, /hreflang: 'en'/);
  assert.match(seo, /hreflang: 'x-default'/);
  assert.doesNotMatch(seo, /const langs = \['en', 'fr', 'es', 'pt-br'\]/);
  assert.match(sitemap, /const locales = \['en'\]/);
});

test('merchant feed emits exact contextual variants without invented identifiers', () => {
  const source = read('app/routes/[feed.xml].tsx');
  assert.match(
    source,
    /@inContext\(country: \$country, language: \$language\)/,
  );
  assert.match(source, /selectedOptions \{ name value \}/);
  assert.match(source, /product\.variants\.edges/);
  assert.match(
    source,
    /variant\.image\?\.url \|\| product\.featuredImage\?\.url/,
  );
  assert.match(source, /<g:gtin>/);
  assert.match(source, /<g:identifier_exists>no<\/g:identifier_exists>/);
  assert.doesNotMatch(source, /<g:mpn>/);
  assert.doesNotMatch(source, /<g:brand>Puchica<\/g:brand>/);
});

test('obsolete broad explore route permanently redirects to the gated catalog', () => {
  const source = read('app/routes/explore.jsx');
  assert.match(source, /localizePath\('\/collections\/all', params\.locale\)/);
  assert.match(source, /, 301\)/);
  assert.doesNotMatch(source, /phone-case|pet-supplies|beauty-personal-care/);
});
