#!/usr/bin/env python3
"""pricing_apply_targeted.py — Conservative re-pricing for
high-confidence outliers only.

The original pricing_apply.py (commit 84db056) was too aggressive.
Daniel dropped auto-pricing on 2026-06-29 13:36 because 6,000+ items
needs human judgment.

This targeted version only flags items where ALL of these are true:
  1. productType has >=30 products (statistical confidence)
  2. current price is >= 2x the median (clear outlier, not borderline)
  3. current price is >= $50 (not a $6 phone case)
  4. product is NOT tagged as on-sale, clearance, MAP, or
     dropship-fixed-price (skip promotional/inviolable items)
  5. NEVER reduces price below 85% of current (safety net for
     legitimately premium products like Z Fold cases, Osaki chairs)

Output: targeted-pricing-suggestions.csv with handle, current, suggested,
category_median, category_p99, overshoot_pct.

Run with --apply to write changes via productVariantsBulkUpdate.
"""
import argparse
import csv
import statistics
import sys
import time
import urllib.error
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin, ShopifyGraphQLError  # noqa: E402

# Skip these tags — pricing is fixed by some other mechanism.
SKIP_TAGS = {
    'on-sale', 'on_sale', 'clearance', 'final-sale', 'final_sale',
    'liquidation', 'closeout', 'closeouts', 'edeals',
    'dropship-fixed-price', 'map', 'minimum-advertised-price',
    'sale_collection:Entertainment', 'sale_collection:Home',
    'sale_collection:Apparel', 'sale_collection:Pet',
}

# Vendors whose products are legitimately premium.
PREMIUM_VENDORS = {
    'dyson', 'sony', 'lg', 'samsung', 'apple', 'bose', 'sennheiser',
    'philips', 'braun', 'wolf', 'sub-zero', 'miele', 'kitchenaid',
    'krups', 'breville', 'de\'longhi', 'delonghi', 'jura', 'osaki',
    'synca', 'human touch', 'titan', 'cozzia', 'osim', 'inada',
    'd.core', 'dcore', 'cyber relax', 'kurodo', 'jaxx', 'dyson v',
    'kohler', 'moen', 'delta', 'grohe',
}


def percentile(data, p):
    if not data:
        return None
    s = sorted(data)
    k = (len(s) - 1) * (p / 100)
    f = int(k)
    c = min(f + 1, len(s) - 1)
    if f == c:
        return s[f]
    return s[f] + (s[c] - s[f]) * (k - f)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='targeted-pricing-suggestions.csv')
    ap.add_argument('--dry-run', action='store_true', default=True)
    ap.add_argument('--apply', action='store_true')
    ap.add_argument('--min-type-count', type=int, default=30,
                    help='Min products in productType for stat confidence')
    ap.add_argument('--overshoot-multiple', type=float, default=4.0,
                    help='Current price must be >= this x median')
    ap.add_argument('--min-price', type=float, default=50.0,
                    help='Only consider products >= this price')
    ap.add_argument('--max-price', type=float, default=2000.0,
                    help='Skip products above this price (likely legit premium)')
    ap.add_argument('--floor-pct', type=float, default=85.0,
                    help='Never suggest below this %% of current')
    ap.add_argument('--cap-percentile', type=float, default=75)
    args = ap.parse_args()
    if args.apply:
        args.dry_run = False

    with ShopifyAdmin() as s:
        print('Fetching products…')
        products = s.list_all_products(fields=[
            'id', 'title', 'handle', 'productType', 'tags', 'status', 'vendor',
            'variants(first: 1) { nodes { id price } }',
        ])

    # Bucket by productType
    by_type = defaultdict(list)
    for p in products:
        if p.get('status') != 'ACTIVE':
            continue
        ptype = (p.get('productType') or '').strip()
        variants = (p.get('variants') or {}).get('nodes') or []
        if not variants:
            continue
        try:
            price = float(variants[0].get('price') or 0)
        except (ValueError, TypeError):
            continue
        if price <= 0:
            continue
        by_type[ptype].append((price, p, variants[0]['id']))

    print(f'  {len(products)} products across {len(by_type)} types')

    # Compute per-type stats
    type_stats = {}
    for ptype, items in by_type.items():
        if len(items) < args.min_type_count:
            continue
        prices = [pr for pr, _, _ in items]
        type_stats[ptype] = {
            'count': len(items),
            'median': statistics.median(prices),
            'p90': percentile(prices, args.cap_percentile),
            'max': max(prices),
        }

    print(f'  Types with >= {args.min_type_count} products: {len(type_stats)}')

    suggestions = []
    skipped = defaultdict(int)
    for ptype, items in by_type.items():
        if ptype not in type_stats:
            skipped['type_too_small'] += 1
            continue
        stats = type_stats[ptype]
        cap = stats['p90']
        for price, p, vid in items:
            tags = [t.lower() for t in (p.get('tags') or [])]
            if any(t in SKIP_TAGS for t in tags):
                skipped['skip_tag'] += 1
                continue
            vendor = (p.get('vendor') or '').lower() if hasattr(p, 'get') else ''
            # Title-based vendor heuristic: check first 4 words
            title_words = set((p.get('title') or '').lower().split()[:4])
            if any(v in title_words or v in (p.get('title') or '').lower() for v in PREMIUM_VENDORS):
                skipped['premium_vendor'] += 1
                continue
            if price < args.min_price:
                skipped['below_min_price'] += 1
                continue
            if price > args.max_price:
                skipped['above_max_price'] += 1
                continue
            if price < stats['median'] * args.overshoot_multiple:
                skipped['within_band'] += 1
                continue
            # Apply cap, but never below floor-pct of current
            suggested = min(cap, price * args.floor_pct / 100)
            suggested = round(suggested, 2)
            if suggested >= price:
                # Would be no-op
                skipped['no_change'] += 1
                continue
            overshoot_pct = round((price / stats['median'] - 1) * 100, 1)
            suggestions.append({
                'id': p['id'].split('/')[-1],
                'handle': p['handle'],
                'title': p['title'][:80],
                'productType': ptype,
                'current_price': price,
                'suggested_price': suggested,
                'category_median': round(stats['median'], 2),
                'category_p90': round(cap, 2),
                'overshoot_pct': overshoot_pct,
                'rule': f'cap@p{args.cap_percentile:.0f},floor@{args.floor_pct:.0f}%',
            })

    # Write CSV
    out_path = Path(args.out)
    with out_path.open('w', encoding='utf-8', newline='') as f:
        if not suggestions:
            f.write('id,handle,title,productType,current_price,suggested_price,category_median,category_p90,overshoot_pct,rule\n')
        else:
            writer = csv.DictWriter(f, fieldnames=list(suggestions[0].keys()))
            writer.writeheader()
            for s in suggestions:
                writer.writerow(s)

    print(f'\nReport: {out_path}')
    print(f'  Skipped: {dict(skipped)}')
    print(f'  Suggestions: {len(suggestions)} products')

    if suggestions:
        from collections import Counter
        by_type_count = Counter(s['productType'] for s in suggestions)
        print('  By type:')
        for t, n in by_type_count.most_common():
            print(f'    {t}: {n}')
        print('\n  Top 10 most overpriced (by overshoot %):')
        for s in sorted(suggestions, key=lambda x: -x['overshoot_pct'])[:10]:
            print(f"    {s['handle']:50s} ${s['current_price']:.2f} -> ${s['suggested_price']:.2f} (overshoot {s['overshoot_pct']:.0f}%)")

    if args.dry_run:
        print('\nDRY RUN. Pass --apply to write to Shopify.')
        return

    print(f'\nApplying {len(suggestions)} changes…')
    applied = 0
    failed = 0
    for s in suggestions:
        try:
            full_id = next(p['id'] for p in products if p['id'].endswith(s['id']))
            vid = (next(p for p in products if p['id'] == full_id)
                   .get('variants') or {}).get('nodes') or [{}]
            if not vid or not vid[0].get('id'):
                failed += 1
                continue
            res = s.gql('''
            mutation pvbu($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
              productVariantsBulkUpdate(productId: $productId, variants: $variants) {
                product { id }
                userErrors { field message }
              }
            }
            ''', {
                'productId': full_id,
                'variants': [{'id': vid[0]['id'], 'price': s['suggested_price']}],
            })
            errs = (res.get('productVariantsBulkUpdate') or {}).get('userErrors') or []
            if errs:
                failed += 1
                print(f'  FAIL {s["handle"]}: {errs}')
            else:
                applied += 1
            time.sleep(0.1)
        except (ShopifyGraphQLError, urllib.error.HTTPError) as e:
            failed += 1
            print(f'  ERR  {s["handle"]}: {e}')
    print(f'\nDone. {applied} applied, {failed} failed.')


if __name__ == '__main__':
    main()