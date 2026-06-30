#!/usr/bin/env python3
"""image_alt_fix.py — Generate SEO-friendly alt text for product images.

Many product images on Shopify have empty alt text. Alt text is:
* Read by screen readers (a11y)
* Indexed by Google Images (SEO)
* Shown when images fail to load

This script:
1. Fetches every product + its images
2. For images with empty alt text, generates alt text from:
   - Product title
   - Product type
   - Position (front/angle/detail)
3. Dry-run default; --confirm to apply
"""
import argparse
import csv
import re
import sys
import time
import urllib.error
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin, ShopifyGraphQLError  # noqa: E402


POSITION_LABELS = {
    0: 'main',
    1: 'alternate angle',
    2: 'detail',
    3: 'in use',
    4: 'detail',
    5: 'alternate angle',
    6: 'detail',
}


def generate_alt_text(product_title, product_type, vendor, position):
    """Generate alt text following Shopify/SEO best practices."""
    title = (product_title or '').strip()
    ptype = (product_type or '').strip()
    vendor = (vendor or '').strip()

    # Clean the title for alt text
    clean_title = re.sub(r'[^\x00-\x7F]+', ' ', title)
    clean_title = re.sub(r'\s+', ' ', clean_title).strip()
    if not clean_title:
        return None

    # Compose
    if vendor and vendor.lower() not in clean_title.lower() and vendor.lower() != 'puchica':
        base = f"{vendor} {clean_title}"
    else:
        base = clean_title

    # Add position if not the main image
    pos_label = POSITION_LABELS.get(position)
    if pos_label and position > 0:
        return f"{base} - {pos_label}"
    return base


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out-csv', default='image-alt-fix-2026-06-29.csv')
    ap.add_argument('--dry-run', action='store_true', default=True)
    ap.add_argument('--confirm', action='store_true')
    ap.add_argument('--limit', type=int, default=None)
    ap.add_argument('--quiet', action='store_true')
    args = ap.parse_args()
    if args.confirm:
        args.dry_run = False

    with ShopifyAdmin() as s:
        print('Fetching products with images…')
        # Get products with their images + alt text status
        # Note: media(first:N) returns media nodes
        all_products = []
        for page in s.list_products(fields=[
            'id', 'title', 'handle', 'productType', 'vendor', 'status',
            'media(first: 20) { nodes { id alt mediaContentType } }',
        ]):
            all_products.extend(page)
        print(f'  Got {len(all_products)} products')

    # Find images with missing alt
    to_fix = []
    products_with_images = 0
    total_images = 0
    missing_alt = 0
    for p in all_products:
        if p.get('status') != 'ACTIVE':
            continue
        media = (p.get('media') or {}).get('nodes') or []
        if not media:
            continue
        products_with_images += 1
        for idx, m in enumerate(media):
            total_images += 1
            if m.get('alt'):
                continue
            missing_alt += 1
            new_alt = generate_alt_text(p.get('title'), p.get('productType'),
                                          p.get('vendor'), idx)
            if new_alt:
                to_fix.append({
                    'product_id': p['id'].split('/')[-1],
                    'media_id': m['id'],
                    'handle': p['handle'],
                    'product_title': (p.get('title') or '')[:60],
                    'position': idx,
                    'old_alt': '',
                    'new_alt': new_alt,
                    'media_type': m.get('mediaContentType') or 'IMAGE',
                })

    print(f'\nImage alt gap analysis:')
    print(f'  Products with images: {products_with_images}')
    print(f'  Total images: {total_images}')
    print(f'  Missing alt: {missing_alt}')
    print(f'  To fix: {len(to_fix)}')

    if args.limit:
        to_fix = to_fix[:args.limit]

    # Write CSV
    out_path = Path(args.out_csv)
    with out_path.open('w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'product_id', 'media_id', 'handle', 'product_title', 'position',
            'old_alt', 'new_alt', 'media_type',
        ])
        writer.writeheader()
        for r in to_fix:
            writer.writerow(r)
    print(f'\nCSV: {out_path}')

    if args.dry_run:
        print('\nDRY RUN. First 5:')
        for r in to_fix[:5]:
            print(f"  [{r['position']}] {r['handle']:50s} -> {r['new_alt']}")
        print('\nPass --confirm to apply.')
        return

    # Apply via fileUpdate on each media
    fails = 0
    applied = 0
    for r in to_fix:
        try:
            res = s.gql('''
            mutation fu($input: FileUpdateInput!) {
              fileUpdate(input: $input) {
                file { id alt }
                userErrors { field message }
              }
            }
            ''', {'input': {'id': r['media_id'], 'alt': r['new_alt']}})
            errs = (res.get('fileUpdate') or {}).get('userErrors') or []
            if errs:
                fails += 1
                if not args.quiet:
                    print(f'  FAIL {r["handle"]} pos={r["position"]}: {errs}')
            else:
                applied += 1
            time.sleep(0.05)
        except (ShopifyGraphQLError, urllib.error.HTTPError) as e:
            fails += 1
            if not args.quiet:
                print(f'  ERR  {r["handle"]} pos={r["position"]}: {e}')

    print(f'\n=== DONE ===')
    print(f'  Applied: {applied}/{len(to_fix)}')
    print(f'  Failed: {fails}')


if __name__ == '__main__':
    main()