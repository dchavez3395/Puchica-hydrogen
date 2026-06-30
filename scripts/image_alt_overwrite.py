#!/usr/bin/env python3
"""image_alt_overwrite.py — Force-overwrite ALL image alt text with
the richer generator output.

The original image_alt_apply_batched.py only acted on images
with empty alt. This script:
1. Regenerates alt for EVERY image (even ones already set)
2. Compares old vs new alt text
3. Only updates if different (saves bandwidth, no churn)
4. Uses batched fileUpdate for speed

This is the "richer alt" follow-up Daniel asked about on
2026-06-29 19:58 - force-rewrite the 14k thin alts already applied
plus any from earlier runs.

Usage:
    python scripts/image_alt_overwrite.py --dry-run
    python scripts/image_alt_overwrite.py --apply
    python scripts/image_alt_overwrite.py --resume image-alt-overwrite-progress.json

Dry-run: shows diff stats without applying.
"""
import argparse
import json
import sys
import time
import urllib.error
from collections import Counter
from pathlib import Path
import re

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin, ShopifyGraphQLError  # noqa: E402

# BATCH_SIZE: 25 per call. Each call is 10 throttle points regardless
# of N items in the array, so bigger is better.
BATCH_SIZE = 25
MAX_RETRIES = 3


def apply_batch(s, items, max_retries=MAX_RETRIES):
    """Apply N alt updates in one fileUpdate call.
    items: list of (media_id, new_alt)
    Returns: list of 'ok'|'fail' for each.
    """
    files = [{'id': mid, 'alt': a} for mid, a in items]
    for attempt in range(max_retries):
        try:
            res = s.gql('''
            mutation fu($files: [FileUpdateInput!]!) {
              fileUpdate(files: $files) {
                files { id alt }
                userErrors { field message }
              }
            }
            ''', {'files': files}, throttle=False)
            payload = res.get('fileUpdate') or {}
            errs = payload.get('userErrors') or []
            returned = payload.get('files') or []
            returned_ids = {f['id'] for f in returned}
            results = []
            for mid, _ in items:
                results.append('ok' if mid in returned_ids else 'fail')
            if not returned and not errs:
                results = ['fail'] * len(items)
            return results
        except (ShopifyGraphQLError, urllib.error.HTTPError) as e:
            if attempt < max_retries - 1:
                time.sleep(0.5 * (2 ** attempt))
                continue
            return ['fail'] * len(items)
    return ['fail'] * len(items)


def extract_features(title_l, priority_terms):
    """Pick up to 3 high-signal feature terms."""
    features = []
    seen = set()
    for needle, label in priority_terms:
        if needle in title_l:
            key = label.lower()
            if key in seen:
                continue
            if len(needle) < 6 and any(key in other.lower() for other, _ in priority_terms if other != needle):
                continue
            seen.add(key)
            features.append(label)
            if len(features) >= 3:
                break
    return features


def generate_alt(product_title, vendor, position, priority_terms):
    title = (product_title or '').strip()
    clean_title = re.sub(r'[^\x00-\x7F]+', ' ', title)
    clean_title = re.sub(r'\s+', ' ', clean_title).strip()
    if not clean_title:
        return None
    if vendor and vendor.lower() not in clean_title.lower() and vendor.lower() != 'puchica':
        base = f"{vendor} {clean_title}"
    else:
        base = clean_title
    title_l = title.lower()
    features = extract_features(title_l, priority_terms)
    if features:
        base = f"{base}, {', '.join(features)}"
    pos_labels = {
        0: None, 1: 'alternate angle', 2: 'detail', 3: 'in use',
        4: 'detail', 5: 'alternate angle', 6: 'detail',
    }
    pos_label = pos_labels.get(position)
    if pos_label:
        return f"{base} - {pos_label}"
    return base


# Minimal priority terms (kept in sync with image_alt_fix.py).
PRIORITY_TERMS = [
    ('personal moisturizer', 'Personal Moisturizer'),
    ('personal lubricant', 'Personal Lubricant'),
    ('feminine moisturizer', 'Feminine Moisturizer'),
    ('3-in-1', '3-in-1'),
    ('4-in-1', '4-in-1'),
    ('5-in-1', '5-in-1'),
    ('2-in-1', '2-in-1'),
    ('smart wifi', 'Smart WiFi'),
    ('wi-fi', 'WiFi'),
    ('wifi', 'WiFi'),
    ('bluetooth', 'Bluetooth'),
    ('app-controlled', 'App-Controlled'),
    ('app controlled', 'App-Controlled'),
    ('remote-controlled', 'Remote-Controlled'),
    ('remote controlled', 'Remote-Controlled'),
    ('rechargeable', 'Rechargeable'),
    ('cordless', 'Cordless'),
    ('battery-powered', 'Battery-Powered'),
    ('battery', 'Battery-Powered'),
    ('usb-c', 'USB-C'),
    ('usb', 'USB'),
    ('wireless', 'Wireless'),
    ('5g', '5G'),
    ('4g', '4G'),
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
    ('stainless steel', 'Stainless Steel'),
    ('memory foam', 'Memory Foam'),
    ('silicone', 'Body-Safe Silicone'),
    ('leather', 'Leather'),
    ('cotton', 'Cotton'),
    ('ceramic', 'Ceramic'),
    ('bamboo', 'Bamboo'),
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
    ('outdoor', 'Outdoor-Ready'),
    ('travel', 'Travel-Friendly'),
    ('xl', 'XL'),
    ('mini', 'Mini'),
    ('pro', 'Pro'),
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
    ('dyson', 'Dyson'),
    ('philips', 'Philips'),
    ('breville', 'Breville'),
    ('sony', 'Sony'),
    ('lg', 'LG'),
]  # noqa: E501


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--apply', action='store_true', default=True)
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--batch-size', type=int, default=BATCH_SIZE)
    ap.add_argument('--checkpoint', default='image-alt-overwrite-progress.json')
    ap.add_argument('--limit', type=int, default=None)
    args = ap.parse_args()
    if args.dry_run:
        args.apply = False

    print('Fetching all products + media (this takes ~3 min)...')
    with ShopifyAdmin() as s:
        products = s.list_all_products(fields=[
            'id', 'title', 'handle', 'vendor', 'status',
            'media(first: 20) { nodes { id alt mediaContentType } }',
        ])
    print(f'  Got {len(products)} products')

    diffs = []
    same = 0
    empty_count = 0
    for p in products:
        if p.get('status') != 'ACTIVE':
            continue
        media = (p.get('media') or {}).get('nodes') or []
        title = p.get('title') or ''
        vendor = p.get('vendor') or ''
        for idx, m in enumerate(media):
            old_alt = m.get('alt') or ''
            if not old_alt:
                empty_count += 1
            new_alt = generate_alt(title, vendor, idx, PRIORITY_TERMS)
            if not new_alt:
                continue
            if new_alt == old_alt:
                same += 1
                continue
            diffs.append({
                'media_id': m['id'],
                'handle': p['handle'],
                'title': title[:60],
                'position': idx,
                'old_alt': old_alt,
                'new_alt': new_alt,
            })

    print(f'\nDiff analysis:')
    print(f'  Currently empty alt: {empty_count}')
    print(f'  Same (skip): {same}')
    print(f'  Different (will rewrite): {len(diffs)}')

    if args.limit:
        diffs = diffs[:args.limit]
        print(f'  Limited to {len(diffs)}')

    if args.dry_run:
        print('\nDRY RUN. First 10 diffs:')
        for d in diffs[:10]:
            print(f"  [{d['position']}] {d['handle']:50s}")
            print(f"    OLD: {d['old_alt']!r}")
            print(f"    NEW: {d['new_alt']!r}")
        return

    completed = {}
    cp = Path(args.checkpoint)
    if cp.exists():
        try:
            completed = json.loads(cp.read_text())
            print(f'Loaded checkpoint: {len(completed)} done')
        except Exception:
            pass

    pending = [d for d in diffs if d['media_id'] not in completed]
    print(f'To apply: {len(pending)}')

    batches = [pending[i:i + args.batch_size]
                for i in range(0, len(pending), args.batch_size)]
    print(f'{len(batches)} batches')

    successful = 0
    failed = 0
    with ShopifyAdmin() as s:
        for bi, batch in enumerate(batches):
            items = [(d['media_id'], d['new_alt']) for d in batch]
            results = apply_batch(s, items)
            for d, res in zip(batch, results):
                completed[d['media_id']] = (res == 'ok')
                if res == 'ok':
                    successful += 1
                else:
                    failed += 1
            if (bi + 1) % 10 == 0:
                cp.write_text(json.dumps(completed))
                pct = (bi + 1) / len(batches) * 100
                print(f'  [{bi+1}/{len(batches)}] {pct:.0f}%  ok={successful} fail={failed}')
    cp.write_text(json.dumps(completed))
    print(f'\n=== DONE ===')
    print(f'  Successful: {successful}')
    print(f'  Failed: {failed}')
    print(f'  Checkpoint: {cp}')


if __name__ == '__main__':
    main()