#!/usr/bin/env python3
"""seo_meta_description_fix.py — Trim too-long SEO descriptions.

seo_meta_description_audit.py found 948 products with seo.description
> 160 chars. Google truncates snippets at ~160 chars so anything
longer is wasted.

Fix: trim to 155 chars at last sentence boundary, ending with
period. Preserves readability.

Idempotent. Skips if description is already <= 155 chars.

Usage:
    python scripts/seo_meta_description_fix.py --dry-run
    python scripts/seo_meta_description_fix.py --confirm
"""
import argparse
import csv
import re
import sys
import time
import urllib.error
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin, ShopifyGraphQLError  # noqa: E402

MAX_LEN = 155


def trim(desc):
    if len(desc) <= MAX_LEN:
        return desc
    truncated = desc[:MAX_LEN]
    matches = list(re.finditer(r'[.!?]', truncated))
    if matches:
        return truncated[:matches[-1].end()].strip()
    last_space = truncated.rfind(' ')
    if last_space > MAX_LEN * 0.8:
        return truncated[:last_space].rstrip() + '.'
    return truncated.rstrip() + '...'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out-csv', default='seo-meta-description-fix-2026-06-29.csv')
    ap.add_argument('--dry-run', action='store_true', default=True)
    ap.add_argument('--confirm', action='store_true')
    ap.add_argument('--limit', type=int, default=None)
    ap.add_argument('--quiet', action='store_true')
    args = ap.parse_args()
    if args.confirm:
        args.dry_run = False

    with ShopifyAdmin() as s:
        print('Fetching products with SEO…')
        products = s.list_all_products(fields=[
            'id', 'title', 'handle', 'status',
            'seo { title description }',
        ])

    to_fix = []
    for p in products:
        if p.get('status') != 'ACTIVE':
            continue
        seo = p.get('seo') or {}
        desc = (seo.get('description') or '').strip()
        if len(desc) <= MAX_LEN:
            continue
        new_desc = trim(desc)
        to_fix.append({
            'id': p['id'].split('/')[-1],
            'handle': p['handle'],
            'title': (p.get('title') or '')[:60],
            'old_len': len(desc),
            'new_len': len(new_desc),
            'old_desc': desc[:100],
            'new_desc': new_desc,
        })

    print(f'\nTo fix: {len(to_fix)}')
    if args.limit:
        to_fix = to_fix[:args.limit]
        print(f'  Limited to {len(to_fix)}')

    out_path = Path(args.out_csv)
    with out_path.open('w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=list(to_fix[0].keys()))
        writer.writeheader()
        for r in to_fix:
            writer.writerow(r)
    print(f'CSV: {out_path}')

    if args.dry_run:
        print('\nDRY RUN. First 5:')
        for r in to_fix[:5]:
            print(f"  {r['handle']:50s}  {r['old_len']} -> {r['new_len']}")
            print(f"    OLD: {r['old_desc']!r}")
            print(f"    NEW: {r['new_desc']!r}")
        print('\nPass --confirm to apply.')
        return

    fails = 0
    applied = 0
    with ShopifyAdmin() as s:
        for r in to_fix:
            try:
                res = s.gql('''
                mutation pu($input: ProductInput!) {
                  productUpdate(input: $input) {
                    product { id }
                    userErrors { field message }
                  }
                }
                ''', {'input': {'id': f"gid://shopify/Product/{r['id']}",
                                  'seo': {'description': r['new_desc']}}})
                errs = (res.get('productUpdate') or {}).get('userErrors') or []
                if errs:
                    fails += 1
                    if not args.quiet:
                        print(f'  FAIL {r["handle"]}: {errs}')
                else:
                    applied += 1
                time.sleep(0.05)
            except (ShopifyGraphQLError, urllib.error.HTTPError) as e:
                fails += 1
                if not args.quiet:
                    print(f'  ERR  {r["handle"]}: {e}')

    print(f'\n=== DONE ===')
    print(f'  Applied: {applied}/{len(to_fix)}')
    print(f'  Failed: {fails}')


if __name__ == '__main__':
    main()