#!/usr/bin/env python3
"""find_misplaced_phone_cases.py — Find phone cases in wrong collections.

The category audit found that 652 products tagged 'PhoneCase2' are
sitting in non-phone-case collections (Home & Kitchen, Electronics,
Apparel, etc.) because of overlapping tag rules in those smart
collections. This script produces a CSV that can be used to either
manually remove them in Shopify admin, or to update the smart
collection rules to exclude the PhoneCase2 tag.

Outputs:
  - misplaced-phone-cases.csv with handle, current productType,
    current collections, suggested action.
"""
import csv
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin  # noqa: E402


def main():
    with ShopifyAdmin() as s:
        # All products
        print('Fetching products…')
        products = s.list_all_products(fields=[
            'id', 'title', 'handle', 'productType', 'tags',
            'collections(first: 50) { nodes { handle title } }',
        ])

    # Phone cases = productType='Phone Case' OR 'PhoneCase2' tag
    # "Wrong collection" = in a non-phone-case collection
    phone_collections = {'phone-case'}
    rows = []
    for p in products:
        tags = p.get('tags') or []
        ptype = p.get('productType') or ''
        is_phone_case = (ptype == 'Phone Case') or 'PhoneCase2' in tags
        if not is_phone_case:
            continue
        cols = [(c['handle'], c['title']) for c in (p.get('collections') or {}).get('nodes') or []]
        wrong_cols = [c for c in cols if c[0] not in phone_collections]
        if wrong_cols:
            rows.append({
                'id': p['id'].split('/')[-1],
                'handle': p['handle'],
                'title': p['title'][:80],
                'productType': ptype,
                'tags_phone_case_2': 'PhoneCase2' in tags,
                'wrong_collections': ';'.join(f'{c[0]}({c[1]})' for c in wrong_cols),
                'correct_collection': 'phone-case(Phone Case)',
            })

    # Write CSV
    out_path = Path('misplaced-phone-cases.csv')
    with out_path.open('w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'id', 'handle', 'title', 'productType', 'tags_phone_case_2',
            'wrong_collections', 'correct_collection',
        ])
        writer.writeheader()
        for r in rows:
            writer.writerow(r)

    print(f'Wrote {len(rows)} misplaced phone cases to {out_path}')
    if rows:
        from collections import Counter
        col_count = Counter()
        for r in rows:
            for c in r['wrong_collections'].split(';'):
                col_count[c.split('(')[0]] += 1
        print('\nBreakdown by wrong collection:')
        for col, n in col_count.most_common():
            print(f'  {col}: {n} misplaced')


if __name__ == '__main__':
    main()