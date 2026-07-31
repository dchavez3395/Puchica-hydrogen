import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';

describe('cart checkout recovery', () => {
  const source = readFileSync(
    new URL('../app/components/CartSummary.jsx', import.meta.url),
    'utf8',
  );
  const dictionaries = readFileSync(
    new URL('../app/lib/dictionaries.js', import.meta.url),
    'utf8',
  );

  it('keeps a missing checkout URL visible and recoverable', () => {
    expect(source).toContain("if (disabled) return null;");
    expect(source).toContain('disabled\n          className="is-disabled"');
    expect(source).toContain('style={DISABLED_CHECKOUT_STYLE}');
    expect(source).toContain("t('cart_summary_checkout_unavailable_btn')");
    expect(source).toContain("t('cart_summary_checkout_unavailable_help')");
    expect(source).toContain('window.location.reload()');
    expect(source).toContain("t('cart_summary_checkout_retry')");
  });

  it('preserves the existing checkout link when a URL is available', () => {
    expect(source).toContain('href={checkoutUrl}');
    expect(source).toContain("publish('checkout_started'");
  });

  it('localizes recovery messaging in every supported locale', () => {
    for (const key of [
      'cart_summary_checkout_unavailable_btn',
      'cart_summary_checkout_unavailable_help',
      'cart_summary_checkout_retry',
    ]) {
      expect(dictionaries.match(new RegExp(`${key}:`, 'g'))).toHaveLength(4);
    }
  });
});
