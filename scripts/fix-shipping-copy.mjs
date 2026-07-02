#!/usr/bin/env node
/**
 * fix-shipping-copy.mjs
 *
 * One-pass fix for stale "free shipping over $50" copy. Canada Standard shipping
 * is now FREE (set in Shopify admin 2026-07-01), so every "$50 threshold" claim
 * is wrong. Rewrites them to Canada-scoped messaging across all 4 languages plus
 * route meta descriptions, brand description, and footer.
 *
 * Run from the repo root:
 *     node scripts/fix-shipping-copy.mjs
 *
 * Logs every replacement and WARNS for any pattern not found (so you can tell if
 * copy drifted). Safe to re-run: already-fixed strings won't match. Review with
 * `git diff` before committing.
 *
 * Scope: free shipping is CANADA only (US/intl still pay). Copy is scoped
 * accordingly. Price-range filter labels ($25-$50, $50-$100) are left alone.
 */

import {readFileSync, writeFileSync, existsSync} from 'node:fs';

// [file, [ [from(RegExp|string), to], ... ] ]
const JOBS = [
  ['app/lib/dictionaries.js', [
    // Cross-language: about_stat_shipping_num is the identical '$50+' in en/es/pt.
    // "$0" (a $0 threshold = always free) reads correctly in every language, so a
    // single global replace is safe (no collision) and accurate.
    ["about_stat_shipping_num: '$50+'", "about_stat_shipping_num: '$0'"],
    // English
    ["hero_stat_shipping: 'Shipping $50+'", "hero_stat_shipping: 'Free shipping'"],
    ['with free shipping over $50.', 'with free shipping across Canada.'],
    ["cart_empty_perk_shipping: 'Free shipping over $50'", "cart_empty_perk_shipping: 'Free shipping across Canada'"],
    ["about_stat_shipping_label: 'Free shipping threshold'", "about_stat_shipping_label: 'Shipping across Canada'"],
    ['Free shipping over $50, 30-day returns, delivered fast.', 'Free shipping across Canada, 30-day returns, delivered fast.'],
    // French (NBSP may sit between 50 and $ -> regex tolerates any space)
    [/Livraison gratuite dès 50[\s ]*\$/g, 'Livraison gratuite au Canada'],
    [/Gratuit dès 50[\s ]*\$/g, 'Gratuit au Canada'],
    [/Livraison gratuite 50[\s ]*\$\+/g, 'Livraison gratuite au Canada'],
    [/Seuil de livraison gratuite/g, 'Livraison au Canada'],
    // Spanish
    [/Gratis desde \$50/g, 'Gratis en Canadá'],
    [/hero_stat_shipping: 'Envío \$50\+'/g, "hero_stat_shipping: 'Envío gratis'"],
    [/ticker_free_shipping: 'Envío gratis \$50\+'/g, "ticker_free_shipping: 'Envío gratis en Canadá'"],
    [/trust_shipping_sub: 'En pedidos de más de \$50'/g, "trust_shipping_sub: 'En pedidos a Canadá'"],
    [/product_trust_shipping_sub: 'en pedidos mayores de \$50'/g, "product_trust_shipping_sub: 'en pedidos a Canadá'"],
    [/envío gratis sobre \$50\./g, 'envío gratis en Canadá.'],
    [/cart_empty_perk_shipping: 'Envío gratis sobre \$50'/g, "cart_empty_perk_shipping: 'Envío gratis en Canadá'"],
    [/about_stat_shipping_label: 'Umbral de envío gratis'/g, "about_stat_shipping_label: 'Envío a Canadá'"],
    [/Envío gratis sobre \$50, devoluciones/g, 'Envío gratis en Canadá, devoluciones'],
    // Portuguese (BR)
    [/Grátis acima de \$50/g, 'Grátis no Canadá'],
    [/hero_stat_shipping: 'Frete \$50\+'/g, "hero_stat_shipping: 'Frete grátis'"],
    [/ticker_free_shipping: 'Frete grátis \$50\+'/g, "ticker_free_shipping: 'Frete grátis no Canadá'"],
    [/trust_shipping_sub: 'Em pedidos acima de \$50'/g, "trust_shipping_sub: 'Em pedidos para o Canadá'"],
    [/product_trust_shipping_sub: 'em pedidos acima de \$50'/g, "product_trust_shipping_sub: 'em pedidos para o Canadá'"],
    [/frete grátis acima de \$50\./g, 'frete grátis no Canadá.'],
    [/cart_empty_perk_shipping: 'Frete grátis acima de \$50'/g, "cart_empty_perk_shipping: 'Frete grátis no Canadá'"],
    [/about_stat_shipping_label: 'Limite para frete grátis'/g, "about_stat_shipping_label: 'Frete no Canadá'"],
    [/Frete grátis acima de \$50, devoluções/g, 'Frete grátis no Canadá, devoluções'],
  ]],
  ['app/lib/brand.js', [
    ['Free shipping over $50, easy 30-day returns', 'Free shipping across Canada, easy 30-day returns'],
  ]],
  ['app/routes/_index.jsx', [
    ['Free shipping over $50, 30-day returns.', 'Free shipping across Canada, 30-day returns.'],
  ]],
  ['app/routes/cart.jsx', [
    ['Free shipping over $50, easy 30-day returns', 'Free shipping across Canada, easy 30-day returns'],
  ]],
  ['app/routes/collections._index.jsx', [
    ['Free shipping over $50, easy 30-day returns.', 'Free shipping across Canada, easy 30-day returns.'],
  ]],
  ['app/routes/collections.all.jsx', [
    ['Free shipping over $50, 30-day returns.', 'Free shipping across Canada, 30-day returns.'],
  ]],
  ['app/routes/collections.$handle.jsx', [
    ['free shipping over $50 and easy 30-day returns', 'free shipping across Canada and easy 30-day returns'],
  ]],
  ['app/components/Footer.jsx', [
    // Footer stat renders "$50" under a "Free shipping" label -> make it "Canada".
    ['<span className="pk-footer__stat-value">$50</span>', '<span className="pk-footer__stat-value">Canada</span>'],
  ]],
];

let totalChanges = 0;
let warnings = 0;

for (const [file, repls] of JOBS) {
  if (!existsSync(file)) {
    console.warn(`SKIP  ${file} (not found)`);
    warnings++;
    continue;
  }
  let src = readFileSync(file, 'utf8');
  for (const [from, to] of repls) {
    const before = src;
    src = typeof from === 'string' ? src.split(from).join(to) : src.replace(from, to);
    if (src !== before) {
      totalChanges++;
      console.log(`  OK  ${file}: ${typeof from === 'string' ? from : from.source}`);
    } else {
      console.warn(`  ??  ${file}: not found (already fixed or drifted): ${typeof from === 'string' ? from : from.source}`);
      warnings++;
    }
  }
  writeFileSync(file, src);
}

console.log(`\nDone. ${totalChanges} replacements, ${warnings} not-found warnings.`);
console.log('Review with:  git diff');
console.log('Not touched (intentional): price-range labels like "$25 - $50".');
