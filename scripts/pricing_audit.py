#!/usr/bin/env python3
"""pricing_audit.py — Per-collection price analysis to flag over-priced products.

Walks the catalog and groups by productType (which maps to the
"top-level" Puchica collections: home, beauty, tech, outdoor, pet,
etc). For each group:
  - reports median, mean, stdev, IQR
  - reports upper-quartile outliers (Q3 + 1.5*IQR rule)
  - reports absolute outliers (|z| > 3 in the category)
  - cross-references each over-priced product with its productType
    so the report can be filtered to a single category

Outputs a markdown report. Read-only — does not write to Shopify.

Usage:
    python scripts/pricing_audit.py [--out pricing-audit.md]
    python scripts/pricing_audit.py --top 50    # show top-50 over-priced per category
"""
import argparse
import statistics
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin  # noqa: E402


def percentile(data, p):
    """p in [0, 100]. Returns the linear-interp percentile."""
    if not data:
        return None
    s = sorted(data)
    k = (len(s) - 1) * (p / 100)
    f = int(k)
    c = min(f + 1, len(s) - 1)
    if f == c:
        return s[f]
    return s[f] + (s[c] - s[f]) * (k - f)


def iqr_outliers(values, prices_with_meta):
    """Tukey Fence: values > Q3 + 1.5*IQR are upper outliers.

    prices_with_meta: list of (price, product dict) so we can
    return the actual products to flag, not just prices.
    """
    if len(values) < 4:
        return []
    q1 = percentile(values, 25)
    q3 = percentile(values, 75)
    iqr = q3 - q1
    upper_fence = q3 + 1.5 * iqr
    flagged = []
    for price, p in prices_with_meta:
        if price > upper_fence:
            flagged.append({
                'id': p['id'].split('/')[-1],
                'title': p['title'],
                'price': price,
                'upper_fence': round(upper_fence, 2),
                'overshoot_pct': round((price / upper_fence - 1) * 100, 1),
            })
    flagged.sort(key=lambda x: -x['overshoot_pct'])
    return flagged


def zscore_outliers(values, prices_with_meta):
    """Outliers = |z| > 3 within the group."""
    if len(values) < 5:
        return []
    mean = statistics.mean(values)
    stdev = statistics.stdev(values)
    if stdev == 0:
        return []
    flagged = []
    for price, p in prices_with_meta:
        z = (price - mean) / stdev
        if z > 3:
            flagged.append({
                'id': p['id'].split('/')[-1],
                'title': p['title'],
                'price': price,
                'z': round(z, 2),
                'mean': round(mean, 2),
            })
    flagged.sort(key=lambda x: -x['z'])
    return flagged


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='pricing-audit.md',
                    help='Output report path')
    ap.add_argument('--top', type=int, default=20,
                    help='Top-N over-priced per category to show in detail')
    ap.add_argument('--quiet', action='store_true')
    args = ap.parse_args()

    with ShopifyAdmin() as s:
        if not args.quiet:
            print('Fetching all products (this takes ~3 min)…')
        products = s.list_all_products(fields=[
            'id', 'title', 'productType', 'status',
            'tags',
            'variants(first: 1) { nodes { price } }',
        ])

    # Bucket by productType
    by_type = defaultdict(list)
    no_type = []
    for p in products:
        pt = (p.get('productType') or '').strip() or '_(uncategorized)_'
        variants = (p.get('variants') or {}).get('nodes') or []
        if not variants:
            continue
        try:
            price = float(variants[0].get('price') or 0)
        except (ValueError, TypeError):
            continue
        if price <= 0:
            continue
        by_type[pt].append((price, p))

    out = []
    out.append('# Pricing Audit Report')
    out.append('')
    out.append(f'Total products with prices: {sum(len(v) for v in by_type.values())}')
    out.append(f'Distinct productType buckets: {len(by_type)}')
    out.append('')

    # Global summary
    all_prices = []
    for items in by_type.values():
        for price, _ in items:
            all_prices.append(price)
    if all_prices:
        out.append('## Global price distribution')
        out.append('')
        out.append(f'- Median: ${statistics.median(all_prices):.2f}')
        out.append(f'- Mean:   ${statistics.mean(all_prices):.2f}')
        out.append(f'- Stdev:  ${statistics.stdev(all_prices):.2f}')
        out.append(f'- Min:    ${min(all_prices):.2f}')
        out.append(f'- Max:    ${max(all_prices):.2f}')
        out.append(f'- p25:    ${percentile(all_prices, 25):.2f}')
        out.append(f'- p75:    ${percentile(all_prices, 75):.2f}')
        out.append(f'- p90:    ${percentile(all_prices, 90):.2f}')
        out.append(f'- p99:    ${percentile(all_prices, 99):.2f}')
        out.append('')

    # Per-category report
    out.append('## Per-category analysis (sorted by count, descending)')
    out.append('')

    for cat in sorted(by_type, key=lambda k: -len(by_type[k])):
        items = by_type[cat]
        prices = [p for p, _ in items]
        n = len(prices)
        if n < 4:
            out.append(f'### `{cat}` — {n} products (skip, too few)')
            out.append('')
            continue
        med = statistics.median(prices)
        mean = statistics.mean(prices)
        stdev = statistics.stdev(prices)
        q1 = percentile(prices, 25)
        q3 = percentile(prices, 75)
        iqr_fence = q3 + 1.5 * (q3 - q1)
        out.append(f'### `{cat}` — {n} products')
        out.append('')
        out.append(f'- Median: ${med:.2f}')
        out.append(f'- Mean:   ${mean:.2f}')
        out.append(f'- Stdev:  ${stdev:.2f}')
        out.append(f'- Range:  ${min(prices):.2f} – ${max(prices):.2f}')
        out.append(f'- IQR upper fence (Q3 + 1.5*IQR): ${iqr_fence:.2f}')
        out.append('')

        # IQR outliers
        iqr_flagged = iqr_outliers(prices, items)
        # Z-score outliers
        z_flagged = zscore_outliers(prices, items)
        # Union by id
        union = {}
        for f in iqr_flagged + z_flagged:
            union.setdefault(f['id'], f)
            if 'overshoot_pct' in f:
                union[f['id']]['iqr_flagged'] = True
            if 'z' in f:
                union[f['id']]['z_flagged'] = True

        if not union:
            out.append('_No outliers detected in this category._')
            out.append('')
            continue

        out.append(f'**{len(union)} over-priced candidates** (top {min(args.top, len(union))}):')
        out.append('')
        out.append('| id | title | price | over fence | z | flags |')
        out.append('| --- | --- | --- | --- | --- | --- |')
        for f in list(union.values())[:args.top]:
            flags = []
            if f.get('iqr_flagged'):
                flags.append('IQR')
            if f.get('z_flagged'):
                flags.append('z>3')
            overshoot = f.get('overshoot_pct', '')
            z = f.get('z', '')
            out.append(
                f"| `{f['id']}` | {f['title'][:60]} | "
                f"${f['price']:.2f} | {overshoot}{'%' if overshoot else ''} | "
                f"{z} | {','.join(flags) or '-'} |"
            )
        if len(union) > args.top:
            out.append('')
            out.append(f'_...and {len(union) - args.top} more over-priced candidates in this category._')
        out.append('')

    Path(args.out).write_text('\n'.join(out), encoding='utf-8')
    if not args.quiet:
        print(f'Report written to {args.out}')
        print(f'  Buckets: {len(by_type)}')
        print(f'  Total priced: {sum(len(v) for v in by_type.values())}')


if __name__ == '__main__':
    main()