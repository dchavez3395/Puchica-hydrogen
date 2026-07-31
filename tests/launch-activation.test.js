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

  it('keeps customer-facing launch handles concise', () => {
    expect(FEATURED_LAUNCH_HANDLES.every((handle) => handle.length < 60)).toBe(true);
  });

  it('provides a one-click FIRST15 route from the offer callout', () => {
    const source = readFileSync(
      new URL('../app/components/OfferCallout.jsx', import.meta.url),
      'utf8',
    );

    expect(source).toContain('/discount/FIRST15?redirect=');
    expect(source).toContain("t('offer_apply_first15')");
  });

  it('keeps cart adjustments behind accessible native disclosures', () => {
    const source = readFileSync(
      new URL('../app/components/CartSummary.jsx', import.meta.url),
      'utf8',
    );

    expect(source.match(/<details className="cart-summary-disclosure">/g)).toHaveLength(2);
    expect(source).toContain('<summary>{t(\'cart_summary_promo_label\')}</summary>');
    expect(source).toContain('<summary>{t(\'cart_summary_gift_label\')}</summary>');
    expect(source.indexOf('<CartCheckoutActions')).toBeLessThan(
      source.indexOf('<CartDiscounts'),
    );
  });

  it('only presents cart recovery for a restored cart and below drawer overlays', () => {
    const source = readFileSync(
      new URL('../app/components/CartRecoveryBanner.jsx', import.meta.url),
      'utf8',
    );

    expect(source).toContain('restoredWithItems');
    expect(source).toContain("location.pathname.endsWith('/cart')");
    expect(source).toContain('zIndex: 900');
  });

  it('publishes one Hydrogen cart-view event from the direct cart route', () => {
    const source = readFileSync(
      new URL('../app/routes/cart.jsx', import.meta.url),
      'utf8',
    );

    expect(source).toContain("import {Analytics, CartForm} from '@shopify/hydrogen'");
    expect(source.match(/<Analytics\.CartView\s*\/>/g)).toHaveLength(1);
  });
});
