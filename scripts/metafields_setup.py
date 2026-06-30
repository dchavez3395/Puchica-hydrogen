#!/usr/bin/env python3
"""metafields_setup.py — Add SEO/useful metafields to products.

Puchica currently has no metafields. Useful additions:
* custom.brand - brand name (extracted from vendor or tags like Vendor_LELO)
* custom.supplier - supplier identifier (extract from tags)
* custom.category_label - human-friendly category name
* custom.last_seen - timestamp of last catalog audit (for tracking)
* custom.color, custom.size - extracted from title for filterable nav

The custom.* namespace is the standard for Shopify stores without
a Shopify Plus plan. Use shopify.* or app-prefixed namespaces if
the store is Plus or has app-installed namespaces.

This script reads existing metafields, identifies what's missing,
and applies them in bulk.

Read-only by default. --confirm to apply.
"""
import argparse
import csv
import json
import re
import sys
import time
import urllib.error
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin, ShopifyGraphQLError  # noqa: E402

METAFIELDS_TO_SET = [
    'custom.brand',
    'custom.supplier',
    'custom.last_seen',
]


def extract_brand(vendor, tags):
    """Extract brand. Use vendor if not 'Puchica', else look at tags."""
    if vendor and vendor.lower() != 'puchica':
        return vendor
    for tag in tags:
        if tag.lower().startswith('vendor_'):
            return tag.split('_', 1)[1]
    return None


def extract_supplier(tags):
    """Look for supplier-style tags."""
    for tag in tags:
        if tag.lower().startswith('supplier:'):
            return tag.split(':', 1)[1].strip()
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out-csv', default='metafields-setup-2026-06-29.csv')
    ap.add_argument('--dry-run', action='store_true', default=True)
    ap.add_argument('--confirm', action='store_true')
    ap.add_argument('--limit', type=int, default=None)
    ap.add_argument('--quiet', action='store_true')
    args = ap.parse_args()
    if args.confirm:
        args.dry_run = False

    with ShopifyAdmin() as s:
        print('Fetching products with metafields…')
        products = []
        count = 0
        for page in s.list_products(fields=[
            'id', 'title', 'handle', 'vendor', 'status',
            'tags', 'metafields(namespace: \"custom\", first: 50) { edges { node { key value type } } }',
        ]):
            products.extend(page)
            count += len(page)
            if count >= 5000:
                break
        print(f'  Got {len(products)} products')

    to_set = []
    skipped_no_data = 0
    skipped_already = 0
    for p in products:
        if p.get('status') != 'ACTIVE':
            continue
        pid = p['id'].split('/')[-1]
        handle = p['handle']
        vendor = p.get('vendor') or ''
        tags = p.get('tags') or []

        brand = extract_brand(vendor, tags)
        supplier = extract_supplier(tags)

        if not brand and not supplier:
            skipped_no_data += 1
            continue

        # Check existing metafields
        existing = (p.get('metafields') or {}).get('edges') or []
        existing_keys = {(e['node']['namespace'], e['node']['key']) for e in existing}

        sets = []
        if brand and ('custom', 'brand') not in existing_keys:
            sets.append(('custom.brand', 'single_line_text_field', brand[:50]))
        if supplier and ('custom', 'supplier') not in existing_keys:
            sets.append(('custom.supplier', 'single_line_text_field', supplier[:50]))

        if sets:
            to_set.append({
                'product_id': pid,
                'handle': handle,
                'title': (p.get('title') or '')[:50],
                'sets': sets,
            })
        else:
            skipped_already += 1

    print(f'\n=== Metafield audit ===')
    print(f'Products needing metafields: {len(to_set)}')
    print(f'Products with no extractable brand/supplier: {skipped_no_data}')
    print(f'Products already with both metafields: {skipped_already}')

    if args.limit:
        to_set = to_set[:args.limit]

    # Write CSV
    out_path = Path(args.out_csv)
    with out_path.open('w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['product_id', 'handle', 'title', 'metafields_to_set'])
        for r in to_set:
            sets_str = '; '.join(f"{n}={v}" for n, t, v in r['sets'])
            writer.writerow([r['product_id'], r['handle'], r['title'], sets_str])

    print(f'\nCSV: {out_path}')

    if args.dry_run:
        print('\nDRY RUN. First 5 products to update:')
        for r in to_set[:5]:
            print(f"  {r['handle']}")
            for n, t, v in r['sets']:
                print(f"    {n} = {v!r}")
        print('\nPass --confirm to apply.')
        return

    # Apply
    fails = 0
    applied = 0
    with ShopifyAdmin() as s:
        for r in to_set:
            metafields = [{'ownerId': f"gid://shopify/Product/{r['product_id']}",
                            'namespace': n.split('.')[0],
                            'key': n.split('.')[1],
                            'type': t,
                            'value': v} for n, t, v in r['sets']]
            try:
                res = s.gql('''
                mutation ms($metafields: [MetafieldsSetInput!]!) {
                  metafieldsSet(metafields: $metafields) {
                    metafields { id key }
                    userErrors { field message }
                  }
                }
                ''', {'metafields': metafields})
                errs = (res.get('metafieldsSet') or {}).get('userErrors') or []
                if errs:
                    fails += 1
                    if not args.quiet:
                        print(f'  FAIL {r["handle"]}: {errs}')
                else:
                    applied += 1
                time.sleep(0.05)
            except Exception as e:
                fails += 1
                if not args.quiet:
                    print(f'  ERR  {r["handle"]}: {e}')

    print(f'\n=== DONE ===')
    print(f'  Applied: {applied}/{len(to_set)}')
    print(f'  Failed: {fails}')


if __name__ == '__main__':
    main()