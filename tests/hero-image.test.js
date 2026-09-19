import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  heroCropUrl,
  heroPortraitSrcSet,
  heroPreloadLinks,
  heroSquareSrcSet,
} from '../app/lib/hero-image.js';

const BASE =
  'https://cdn.shopify.com/s/files/1/0842/2644/1466/files/globe.jpg?v=123';

test('hero crops keep the cache key and ask the CDN for exact sizes', () => {
  assert.equal(
    heroCropUrl(BASE, 640, 853),
    `${BASE}&width=640&height=853&crop=center`,
  );
  assert.match(heroPortraitSrcSet(BASE), /width=412&height=549&crop=center 412w/);
  assert.match(heroPortraitSrcSet(BASE), /width=640&height=853&crop=center 640w/);
  assert.doesNotMatch(heroPortraitSrcSet(BASE), /824w/);
  // The CI resolution probe needs a 1024 candidate for the 1024px desktop box.
  assert.match(heroSquareSrcSet(BASE), /width=1024&height=1024&crop=center 1024w/);
});

test('preloads name the same candidates the picture renders, one per media range', () => {
  const links = heroPreloadLinks(BASE);
  assert.equal(links.length, 2);
  for (const l of links) {
    assert.equal(l.tagName, 'link');
    assert.equal(l.rel, 'preload');
    assert.equal(l.as, 'image');
    assert.equal(l.fetchpriority, 'high');
  }
  assert.equal(links[0].imageSrcSet, heroPortraitSrcSet(BASE));
  assert.equal(links[1].imageSrcSet, heroSquareSrcSet(BASE));
  assert.deepEqual(heroPreloadLinks(''), []);
});

test('the home hero is art-directed and the route preloads it', () => {
  const landing = readFileSync('app/components/HomeLanding.jsx', 'utf8');
  const route = readFileSync('app/routes/_index.jsx', 'utf8');
  assert.match(landing, /<picture>/);
  assert.match(landing, /srcSet=\{heroPortraitSrcSet\(heroImage\.url\)\}/);
  assert.match(landing, /fetchpriority: 'high'/);
  assert.match(landing, /loading="eager"/);
  assert.match(route, /\.\.\.heroPreloadLinks\(heroUrl\)/);
});
