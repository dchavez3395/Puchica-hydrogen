import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {
  FEATURED_LAUNCH_HANDLES,
  filterLaunchProducts,
  sortLaunchProducts,
} from '../app/lib/launch-catalog.js';

describe('launch activation', () => {
  it('keeps only sellable launch-ready products', () => {
    const products = [
      {handle: 'ready', availableForSale: true, tags: ['puchica-launch-ready']},
      {handle: 'draft', availableForSale: false, tags: ['puchica-launch-ready']},
      {handle: 'unreviewed', availableForSale: true, tags: []},
    ];

    expect(filterLaunchProducts(products).map(({handle}) => handle)).toEqual(['ready']);
  });

  it('uses the explicit launch merchandising order without mutating input', () => {
    const products = FEATURED_LAUNCH_HANDLES.slice(0, 3)
      .reverse()
      .map((handle) => ({handle}));
    const original = [...products];

    expect(sortLaunchProducts(products).map(({handle}) => handle)).toEqual(
      FEATURED_LAUNCH_HANDLES.slice(0, 3),
    );
    expect(products).toEqual(original);
  });

  it('provides a one-click FIRST15 route from the offer callout', () => {
    const source = readFileSync(
      new URL('../app/components/OfferCallout.jsx', import.meta.url),
      'utf8',
    );

    expect(source).toContain('/discount/FIRST15?redirect=');
    expect(source).toContain("t('offer_apply_first15')");
  });
});
