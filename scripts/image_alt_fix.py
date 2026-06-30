#!/usr/bin/env python3
"""image_alt_fix.py — Generate SEO-friendly alt text for product images.

Many product images on Shopify have empty alt text. Alt text is:
* Read by screen readers (a11y)
* Indexed by Google Images (SEO)
* Shown when images fail to load

This script:
1. Fetches every product + its images
2. For images with empty alt text, generates alt text from:
   - Product title (cleaned)
   - Vendor (if not "Puchica")
   - 2 priority feature terms extracted from the title
   - Image position (front/angle/detail/in use)
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
    0: None,  # main, no suffix
    1: 'alternate angle',
    2: 'detail',
    3: 'in use',
    4: 'detail',
    5: 'alternate angle',
    6: 'detail',
}

# Priority terms — title tokens that should surface as alt-text features.
# Same vocabulary as description rewrites. Order matters: longer/more
# specific tokens must appear before their substrings (e.g. "leak-proof"
# before "leak", "machine-washable" before "machine").
PRIORITY_TERMS = [
    # Bundles
    ('3-in-1', '3-in-1'),
    ('4-in-1', '4-in-1'),
    ('5-in-1', '5-in-1'),
    ('2-in-1', '2-in-1'),
    # Connectivity
    ('smart wifi', 'Smart WiFi'),
    ('wi-fi', 'WiFi'),
    ('wifi', 'WiFi'),
    ('bluetooth', 'Bluetooth'),
    ('app-controlled', 'App-Controlled'),
    ('app controlled', 'App-Controlled'),
    ('remote-controlled', 'Remote-Controlled'),
    ('remote controlled', 'Remote-Controlled'),
    # Phone connectivity
    ('5g', '5G'),
    ('4g', '4G'),
    # Power
    ('rechargeable', 'Rechargeable'),
    ('cordless', 'Cordless'),
    ('battery-powered', 'Battery-Powered'),
    ('battery', 'Battery-Powered'),
    ('usb-c', 'USB-C'),
    ('usb', 'USB'),
    ('wireless', 'Wireless'),
    # Build / quality
    ('waterproof', 'Waterproof'),
    ('water-resistant', 'Water-Resistant'),
    ('shatterproof', 'Shatterproof'),
    ('leak-proof', 'Leak-Proof'),
    ('leak proof', 'Leak-Proof'),
    ('leak resistant', 'Leak-Resistant'),
    ('machine-washable', 'Machine-Washable'),
    ('machine washable', 'Machine-Washable'),
    ('dishwasher-safe', 'Dishwasher-Safe'),
    ('microwave-safe', 'Microwave-Safe'),
    ('oven-safe', 'Oven-Safe'),
    ('freezer-safe', 'Freezer-Safe'),
    ('foldable', 'Foldable'),
    ('collapsible', 'Collapsible'),
    ('portable', 'Portable'),
    ('lightweight', 'Lightweight'),
    ('compact', 'Compact'),
    # Materials
    ('stainless steel', 'Stainless Steel'),
    ('memory foam', 'Memory Foam'),
    ('silicone', 'Body-Safe Silicone'),
    ('leather', 'Leather'),
    ('cotton', 'Cotton'),
    ('ceramic', 'Ceramic'),
    ('bamboo', 'Bamboo'),
    # Function-specific
    ('heated', 'Heated'),
    ('cooling', 'Cooling'),
    ('massage', 'Massage'),
    ('led', 'LED'),
    ('cct', 'CCT Adjustable'),
    ('rgb', 'RGB Color-Changing'),
    ('magnetic', 'Magnetic'),
    ('adjustable', 'Adjustable'),
    ('removable', 'Removable'),
    ('automatic', 'Automatic'),
    # Use context
    ('outdoor', 'Outdoor-Ready'),
    ('travel', 'Travel-Friendly'),
    ('waterproof', 'Waterproof'),
    # Form factor keywords
    ('xl', 'XL'),
    ('mini', 'Mini'),
    ('pro', 'Pro'),
    # Domain: intimate / sexual wellness
    ('personal moisturizer', 'Personal Moisturizer'),
    ('feminine moisturizer', 'Feminine Moisturizer'),
    ('vaginal moisturizer', 'Vaginal Moisturizer'),
    ('personal lubricant', 'Personal Lubricant'),
    ('water-based lubricant', 'Water-Based Lubricant'),
    ('silicone-based lubricant', 'Silicone-Based Lubricant'),
    ('intimate moisturizer', 'Intimate Moisturizer'),
    ('vibrator', 'Vibrator'),
    ('vibrating', 'Vibrating'),
    ('massager', 'Massager'),
    ('kegel', 'Kegel'),
    ('rabbit', 'Rabbit'),
    ('clitoral', 'Clitoral'),
    ('g-spot', 'G-Spot'),
    ('wand', 'Wand'),
    ('bullet', 'Bullet'),
    ('couples', 'For Couples'),
    ('lingerie', 'Lingerie'),
    # Domain: phone accessories
    ('iphone', 'iPhone'),
    ('samsung', 'Samsung'),
    ('galaxy', 'Galaxy'),
    ('pixel', 'Pixel'),
    ('xiaomi', 'Xiaomi'),
    ('huawei', 'Huawei'),
    ('motorola', 'Motorola'),
    ('oneplus', 'OnePlus'),
    ('ipad', 'iPad'),
    ('kindle', 'Kindle'),
    # Domain: prestige brands — features by brand
    ('dyson', 'Dyson'),
    ('philips', 'Philips'),
    ('breville', 'Breville'),
    ('sony', 'Sony'),
    ('lg', 'LG'),
]


def extract_priority_features(title):
    """Pick up to 2 high-signal feature terms from the title.
    Returns comma-separated string, or empty if no matches.
    """
    title_l = (title or '').lower()
    found = []
    seen = set()
    for needle, label in PRIORITY_TERMS:
        if needle in title_l:
            key = label.lower()
            if key in seen:
                continue
            # Skip generic needles when a more specific one already matched
            # (e.g. if "app-controlled" matched, skip "app")
            if len(needle) < 6 and any(key in other.lower() for other, _ in PRIORITY_TERMS if other != needle):
                continue
            seen.add(key)
            found.append(label)
            if len(found) >= 3:
                break
    return ', '.join(found)


def generate_alt_text(product_title, product_type, vendor, position):
    """Generate richer alt text: product title + vendor + features + position.

    Examples:
        'Lelo Smart Wand 2 Large, Wand, Rechargeable'
        'Lelo Smart Wand 2 Large, Wand, Rechargeable - alternate angle'
        'Hunting Laser Rangefinder - 1000 Yard, 6.5X Magnification'
        'Nexxt Home Smart A19 CCT Bulb, WiFi, CCT Adjustable'
        '5AM Club - Xiaomi Redmi Note 13 Pro 5G Case, Xiaomi, 5G'
    """
    title = (product_title or '').strip()
    vendor = (vendor or '').strip()

    # Clean title - strip non-ASCII / emoji / smart quotes
    clean_title = re.sub(r'[^\x00-\x7F]+', ' ', title)
    clean_title = re.sub(r'\s+', ' ', clean_title).strip()
    if not clean_title:
        return None

    # Compose base
    if vendor and vendor.lower() not in clean_title.lower() and vendor.lower() != 'puchica':
        base = f"{vendor} {clean_title}"
    else:
        base = clean_title

    # Extract features
    features = extract_priority_features(title)
    if features:
        base = f"{base}, {features}"

    # Add position suffix (skip main image)
    pos_label = POSITION_LABELS.get(position)
    if pos_label:
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
        all_products = []
        for page in s.list_products(fields=[
            'id', 'title', 'handle', 'productType', 'vendor', 'status',
            'media(first: 20) { nodes { id alt mediaContentType } }',
        ]):
            all_products.extend(page)
        print(f'  Got {len(all_products)} products')

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
        print('\nDRY RUN. First 8:')
        for r in to_fix[:8]:
            print(f"  [{r['position']}] {r['handle']:50s} -> {r['new_alt']}")
        print('\nPass --confirm to apply.')
        return

    fails = 0
    applied = 0
    for r in to_fix:
        try:
            res = s.gql('''
            mutation fu($files: [FileUpdateInput!]!) {
              fileUpdate(files: $files) {
                files { id alt }
                userErrors { field message }
              }
            }
            ''', {'files': [{'id': r['media_id'], 'alt': r['new_alt']}]})
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
