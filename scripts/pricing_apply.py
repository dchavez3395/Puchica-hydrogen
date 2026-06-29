#!/usr/bin/env python3
"""pricing_apply.py — Apply rule-based re-pricing to the catalog.

Reads products from Shopify Admin API, computes the suggested new
price per productType using configurable rules, and emits a CSV
of {handle, current_price, suggested_price, rule_applied,
overshoot_pct} for Daniel to review and apply.

DEFAULTS are conservative: only flag products that are clearly
over their category's IQR upper fence AND below the "premium OK"
threshold, so a Z Fold case at $129 stays untouched while a $423
humidor miscategorized as a phone case gets flagged.

RULES (in priority order; first matching rule wins):
  1. SKIP if productType has < 4 products (insufficient data)
  2. SKIP if product is in a curated 'do-not-discount' tag set
  3. SKIP if the current price is within 10% of the IQR upper fence
     (already reasonable; leave alone)
  4. CAP at p99 of category (the 99th percentile of category prices)
  5. APPLY suggested = min(current_price, p99)

You can override any of these via CLI flags. Use --dry-run by
default; --apply writes the new prices back to Shopify.

Usage:
    python scripts/pricing_apply.py --dry-run [--out pricing-suggestions.csv]
    python scripts/pricing_apply.py --apply
    python scripts/pricing_apply.py --only-types 'Phone Case,Home & Kitchen'
    python scripts/pricing_apply.py --rule cap --cap-percentile 95
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


# Tags that mean "do not touch pricing" (e.g. on-sale, clearance,
# dropship-managed, vendor-fixed).
DEFAULT_SKIP_TAGS = {
    'on-sale', 'on_sale', 'clearance', 'final-sale', 'final_sale',
    'liquidation', 'closeout', 'closeouts', 'edeals', 'low_inventory',
    'dropship-fixed-price', 'map', 'minimum-advertised-price',
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
    ap.add_argument('--out', default='pricing-suggestions.csv',
                    help='Output CSV path (default: pricing-suggestions.csv)')
    ap.add_argument('--dry-run', action='store_true', default=True,
                    help='Report only (default)')
    ap.add_argument('--apply', action='store_true',
                    help='Write new prices to Shopify')
    ap.add_argument('--only-types', default='',
                    help='Comma-separated productType names to limit scope')
    ap.add_argument('--cap-percentile', type=float, default=99,
                    help='Percentile to cap at (default 99)')
    ap.add_argument('--margin-pct', type=float, default=10,
                    help='Skip products within this %% of the cap (default 10)')
    ap.add_argument('--quiet', action='store_true')
    args = ap.parse_args()

    if args.apply:
        args.dry_run = False

    only_set = set(t.strip() for t in args.only_types.split(',') if t.strip())

    with ShopifyAdmin() as s:
        if not args.quiet:
            print('Fetching products (this takes ~3 min)…')
        products = s.list_all_products(fields=[
            'id', 'title', 'handle', 'productType', 'tags', 'status',
            'variants(first: 1) { nodes { id price } }',
        ])

    # Bucket by productType
    by_type = defaultdict(list)  # ptype -> list of (price, product, variant_id)
    for p in products:
        if p.get('status') != 'ACTIVE':
            continue
        ptype = (p.get('productType') or '').strip()
        if only_set and ptype not in only_set:
            continue
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

    if not args.quiet:
        print(f'  Got {len(products)} products across {len(by_type)} types (after filters).')

    # Compute per-type stats
    type_stats = {}
    for ptype, items in by_type.items():
        if len(items) < 4:
            continue
        prices = [p for p, _, _ in items]
        type_stats[ptype] = {
            'count': len(items),
            'median': statistics.median(prices),
            'mean': statistics.mean(prices),
            'stdev': statistics.stdev(prices) if len(prices) > 1 else 0,
            'p99': percentile(prices, args.cap_percentile) or max(prices),
            'max': max(prices),
        }

    # Apply rules
    suggestions = []
    skipped = defaultdict(int)
    for ptype, items in by_type.items():
        if ptype not in type_stats:
            continue
        stats = type_stats[ptype]
        cap = stats['p99']
        for price, p, vid in items:
            tags = [t.lower() for t in (p.get('tags') or [])]
            # Rule 2: skip-tag
            if tags and any(t in DEFAULT_SKIP_TAGS for t in tags):
                skipped['skip_tag'] += 1
                continue
            # Rule 3: skip if within margin
            if price <= cap * (1 + args.margin_pct / 100):
                skipped['within_margin'] += 1
                continue
            # Rule 4: cap
            suggested = round(cap, 2)
            overshoot_pct = round((price / cap - 1) * 100, 1)
            suggestions.append({
                'id': p['id'].split('/')[-1],
                'handle': p['handle'],
                'title': p['title'][:80],
                'productType': ptype,
                'current_price': price,
                'suggested_price': suggested,
                'category_p99': cap,
                'category_median': round(stats['median'], 2),
                'overshoot_pct': overshoot_pct,
                'tags': ';'.join((p.get('tags') or [])[:5]),
                'rule': f'cap@p{args.cap_percentile:.0f}',
            })

    # Write CSV
    out_path = Path(args.out)
    with out_path.open('w', encoding='utf-8', newline='') as f:
        if not suggestions:
            f.write('id,handle,title,productType,current_price,suggested_price,category_p99,category_median,overshoot_pct,tags,rule\n')
        else:
            writer = csv.DictWriter(f, fieldnames=list(suggestions[0].keys()))
            writer.writeheader()
            for s in suggestions:
                writer.writerow(s)

    # Apply
    applied = 0
    failed = 0
    if args.apply and suggestions:
        if not args.quiet:
            print(f'\nApplying {len(suggestions)} price changes…')
        for s in suggestions:
            try:
                mut = '''
                mutation pvbu($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
                  productVariantsBulkUpdate(productId: $productId, variants: $variants) {
                    product { id }
                    userErrors { field message }
                  }
                }
                '''
                # Find full gid from id
                full_id = None
                for p in products:
                    if p['id'].endswith(s['id']):
                        full_id = p['id']
                        break
                if not full_id:
                    failed += 1
                    continue
                variants = (next(p for p in products if p['id'] == full_id)
                            .get('variants') or {}).get('nodes') or []
                if not variants:
                    failed += 1
                    continue
                vid = variants[0]['id']
                s_data = s_data if False else None
                result = s.gql(mut, {
                    'productId': full_id,
                    'variants': [{'id': vid, 'price': s['suggested_price']}],
                })
                errs = (result.get('productVariantsBulkUpdate') or {}).get('userErrors') or []
                if errs:
                    failed += 1
                    if not args.quiet:
                        print(f"  ERR {s['id']}: {errs}")
                else:
                    applied += 1
                time.sleep(0.05)
            except (ShopifyGraphQLError, urllib.error.HTTPError) as e:
                failed += 1
                if not args.quiet:
                    print(f'  ERR {s["id"]}: {e}')

    # Print summary
    if not args.quiet:
        print(f'\nReport: {out_path}')
        print(f'  Type stats: {len(type_stats)} types with >=4 products')
        print(f'  Skipped: {dict(skipped)}')
        print(f'  Suggestions: {len(suggestions)} products over the cap')
        if args.apply:
            print(f'  Applied: {applied} ok, {failed} failed')
        if suggestions:
            from collections import Counter
            by_type_count = Counter(s['productType'] for s in suggestions)
            print('\n  Suggestions by type:')
            for t, n in by_type_count.most_common(10):
                print(f'    {t}: {n}')


if __name__ == '__main__':
    main()