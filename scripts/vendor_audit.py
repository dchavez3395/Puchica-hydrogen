#!/usr/bin/env python3
"""vendor_audit.py — Audit vendor field consistency.

Vendor names should be consistent for:
- Filtering / search
- Inventory analytics (per-vendor sales)
- Brand protection (avoid "lelo" vs "Lelo" vs "LELO INC")

This script:
1. Fetches all products with their vendor field
2. Normalizes vendor names (lowercase, strip whitespace, expand abbreviations)
3. Identifies likely-duplicate vendors (e.g., "Lelo" vs "lelo")
4. Outputs a report

Output: vendor-audit-2026-06-29.md + .csv
"""
import argparse
import csv
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin  # noqa: E402


def normalize_vendor(name):
    if not name:
        return None
    n = name.strip().lower()
    n = re.sub(r'\s+', ' ', n)
    n = re.sub(r'[^\w\s&-]', '', n)
    return n


def main():
    with ShopifyAdmin() as s:
        print('Fetching products…')
        products = s.list_all_products(fields=[
            'id', 'title', 'handle', 'vendor', 'productType', 'status',
        ])

    # Bucket by normalized vendor name
    by_norm = defaultdict(list)
    raw_counter = Counter()
    for p in products:
        if p.get('status') != 'ACTIVE':
            continue
        v = p.get('vendor') or ''
        raw_counter[v] += 1
        norm = normalize_vendor(v) or '_(empty)_'
        by_norm[norm].append({
            'id': p['id'].split('/')[-1],
            'handle': p['handle'],
            'title': (p.get('title') or '')[:60],
            'raw_vendor': v,
            'productType': p.get('productType') or '',
        })

    print(f'Total products: {len(products)}')
    print(f'Unique normalized vendors: {len(by_norm)}')
    print(f'Total raw vendor strings: {len(raw_counter)}')

    # Likely duplicates: same normalized form but multiple raw variants
    duplicates = []
    for norm, items in by_norm.items():
        raw_set = set(it['raw_vendor'] for it in items)
        if len(raw_set) > 1 and norm != '_(empty)_':
            duplicates.append({
                'normalized': norm,
                'raw_variants': sorted(raw_set),
                'count': len(items),
                'products': items[:5],  # sample
            })

    duplicates.sort(key=lambda x: -x['count'])
    print(f'\nLikely-duplicate vendor groups: {len(duplicates)}')

    # Write CSV
    out_csv = Path('vendor-audit-2026-06-29.csv')
    with out_csv.open('w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'normalized', 'raw_variants', 'count', 'sample_products',
        ])
        writer.writeheader()
        for d in duplicates:
            sample = ' | '.join(f"{p['handle']} ({p['raw_vendor']})" for p in d['products'])
            writer.writerow({
                'normalized': d['normalized'],
                'raw_variants': ' || '.join(d['raw_variants']),
                'count': d['count'],
                'sample_products': sample,
            })

    # Write Markdown
    md = []
    md.append('# Vendor Field Audit (2026-06-29)')
    md.append('')
    md.append(f'## Summary')
    md.append('')
    md.append(f'- Total products: {len(products)}')
    md.append(f'- Unique raw vendor strings: {len(raw_counter)}')
    md.append(f'- Unique normalized vendors: {len(by_norm)}')
    md.append(f'- Likely duplicate vendor groups: {len(duplicates)}')
    md.append('')
    md.append('## Top 50 raw vendor strings (by product count)')
    md.append('')
    md.append('| raw_vendor | count |')
    md.append('| --- | ---:|')
    for v, n in raw_counter.most_common(50):
        md.append(f'| {v or "_(empty)_"} | {n} |')
    md.append('')
    md.append('## Top 30 likely-duplicate vendor groups')
    md.append('')
    md.append('| normalized | raw variants | count |')
    md.append('| --- | --- | ---:|')
    for d in duplicates[:30]:
        md.append(f"| `{d['normalized']}` | {', '.join(d['raw_variants'])} | {d['count']} |")
    md.append('')

    Path('vendor-audit-2026-06-29.md').write_text('\n'.join(md), encoding='utf-8')
    print(f'\nCSV: {out_csv}')
    print(f'Markdown: vendor-audit-2026-06-29.md')


if __name__ == '__main__':
    main()