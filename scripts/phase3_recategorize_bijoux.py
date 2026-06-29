#!/usr/bin/env python3
"""phase3_recategorize_bijoux.py — Catch the Lelo massage oil that
slipped through phase 2.

The product 'Bijoux Warming massage oil' is:
* Vendor = LELO (tag: Vendor_LELO)
* Tagged 'final_sale', 'for sex', 'valentines'
* Currently typed Health & Wellness
* Should be Intimate Care (it's a massage oil for intimate use)

This script catches it and similar Lelo Vendor-tagged products
that are typed Health & Wellness but should be Intimate Care.

Read-only / dry-run default. --confirm to apply.
"""
import argparse
import re
import sys
import time
from pathlib import Path
from collections import Counter

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin, ShopifyGraphQLError  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry-run', action='store_true', default=True)
    ap.add_argument('--confirm', action='store_true')
    args = ap.parse_args()
    if args.confirm:
        args.dry_run = False

    with ShopifyAdmin() as s:
        products = s.list_all_products(fields=[
            'id', 'title', 'handle', 'productType', 'tags',
        ])

    # Target: products with Vendor_LELO tag that are typed Health & Wellness
    # and look like intimate care (massage oil, lubricant, moisturizer)
    targets = []
    for p in products:
        tags = p.get('tags') or []
        ptype = p.get('productType') or ''
        # Only act on products that are still in misclassified types
        if ptype not in ('Health & Wellness', 'Home & Kitchen', 'Apparel & Accessories',
                          'Toys & Games', 'Beauty & Grooming'):
            continue
        # Must be a Lelo vendor product
        is_lelo = any(t.lower() == 'vendor_lelo' or t.lower() == 'vendor:lelo' for t in tags)
        if not is_lelo:
            continue
        # Look at title for intimate-care hints
        title_l = (p.get('title') or '').lower()
        is_care = any(k in title_l for k in (
            'massage oil', 'warming', 'lubricant', 'lube', 'moisturizer',
            'personal care', 'intimate', 'pleasure gel',
        ))
        if is_care:
            targets.append({
                'id': p['id'], 'handle': p['handle'],
                'old_type': ptype, 'new_type': 'Intimate Care',
                'title': p['title'][:60],
            })

    print(f'Lelo vendor-tagged products that look like intimate care: {len(targets)}')
    for t in targets:
        print(f"  {t['handle']:50s} {t['old_type']:25s} -> {t['new_type']}")

    if args.dry_run:
        print('\nDRY RUN.')
        return

    fails = 0
    for t in targets:
        try:
            res = s.gql('''
            mutation pu($input: ProductInput!) {
              productUpdate(input: $input) {
                product { id }
                userErrors { field message }
              }
            }
            ''', {'input': {'id': t['id'], 'productType': t['new_type']}})
            errs = (res.get('productUpdate') or {}).get('userErrors') or []
            if errs:
                fails += 1
                print(f'  FAIL {t["handle"]}: {errs}')
            time.sleep(0.05)
        except ShopifyGraphQLError as e:
            fails += 1
            print(f'  ERR {t["handle"]}: {e}')
    print(f'\nDone. {len(targets) - fails}/{len(targets)} ok.')


if __name__ == '__main__':
    main()