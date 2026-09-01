import test from 'node:test';
import assert from 'node:assert/strict';

import {documentFacts, metadataPass} from '../scripts/check-public-metadata.mjs';

const html = `<!doctype html><html lang="fr"><head>
  <title>Page — Puchica</title>
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="https://puchica.ca/fr/page">
  <link rel="alternate" hreflang="en" href="https://puchica.ca/page">
  <link rel="alternate" hreflang="fr" href="https://puchica.ca/fr/page">
  <link rel="alternate" hreflang="es" href="https://puchica.ca/es/page">
  <link rel="alternate" hreflang="pt-br" href="https://puchica.ca/pt-br/page">
  <link rel="alternate" hreflang="x-default" href="https://puchica.ca/page">
</head><body><h1>Page</h1></body></html>`;

test('public metadata parser extracts the document contract', () => {
  assert.deepEqual(documentFacts(html), {
    lang: 'fr',
    title: 'Page — Puchica',
    canonical: 'https://puchica.ca/fr/page',
    h1Count: 1,
    robots: 'index,follow',
    hreflangs: ['en', 'fr', 'es', 'pt-br', 'x-default'],
  });
});

test('public metadata contract rejects bad canonical, noindex, or duplicate H1', () => {
  const expected = {lang: 'fr', canonical: 'https://puchica.ca/fr/page'};
  assert.equal(metadataPass(documentFacts(html), expected), true);
  assert.equal(metadataPass(documentFacts(html.replace('/fr/page', '/wrong')), expected), false);
  assert.equal(metadataPass(documentFacts(html.replace('index,follow', 'noindex')), expected), false);
  assert.equal(metadataPass(documentFacts(html.replace('</body>', '<h1>Two</h1></body>')), expected), false);
});

test('a deliberately noindexed page must carry noindex, not lose it', () => {
  // The collection route noindexes itself while the catalogue is empty, so the
  // check has to expect that rather than fail on correct behaviour. The
  // expectation inverts rather than relaxing: a page declared non-indexable
  // that comes back indexable is a failure too, which is what would catch the
  // empty shop page leaking into Google.
  const expected = {
    lang: 'fr',
    canonical: 'https://puchica.ca/fr/page',
    indexable: false,
  };
  assert.equal(metadataPass(documentFacts(html), expected), false);
  assert.equal(
    metadataPass(
      documentFacts(html.replace('index,follow', 'noindex,follow')),
      expected,
    ),
    true,
  );
});

test('public metadata accepts a regional HTML language for its locale', () => {
  const expected = {lang: 'fr', canonical: 'https://puchica.ca/fr/page'};
  assert.equal(
    metadataPass(documentFacts(html.replace('lang="fr"', 'lang="fr-CA"')), expected),
    true,
  );
});
