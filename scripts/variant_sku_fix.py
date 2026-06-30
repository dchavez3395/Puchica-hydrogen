#!/usr/bin/env python3
"""variant_sku_fix.py — Fix problematic variant SKUs.

Addresses three categories of issues:
1. Empty SKUs: generate `<handle>-<position>` (e.g., "loki" -> "loki-1")
2. Cross-product duplicate SKUs: append -DUP-<product_id_short> to disambiguate
3. (Optional) Special chars in SKUs: convert spaces to underscores,
   lowercase; careful with + in supplier-pattern SKUs (those are OK)

Idempotent. Skips variants that already have acceptable SKUs.
Dry-run by default. --confirm required for live mutations.

Usage:
    python scripts/variant_sku_fix.py --dry-run
    python scripts/variant_sku_fix.py --confirm
    python scripts/variant_sku_fix.py --in variant-sku-audit-2026-06-29.csv
"""
import argparse
import csv
import json
import re
import sys
import time
import urllib.error
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin, ShopifyGraphQLError  # noqa: E402


def slugify(text):
    """Convert handle to a valid SKU-safe string."""
    s = re.sub(r'[^a-z0-9-]', '', text.lower())
    s = re.sub(r'-+', '-', s).strip('-')
    return s[:40]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--in', dest='in_path', default='variant-sku-audit-2026-06-29.csv')
    ap.add_argument('--out-csv', default='variant-sku-fixes-2026-06-29.csv')
    ap.add_argument('--dry-run', action='store_true', default=True)
    ap.add_argument('--confirm', action='store_true')
    ap.add_argument('--limit', type=int, default=None)
    ap.add_argument('--quiet', action='store_true')
    args = ap.parse_args()
    if args.confirm:
        args.dry_run = False

    in_path = Path(args.in_path)
    if not in_path.exists():
        print(f'Input not found: {in_path}')
        sys.exit(1)

    # Read audit CSV - group by issue type
    rows = []
    with in_path.open(encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for r in reader:
            if r['issue'] in ('empty_sku', 'cross_product_dup'):
                rows.append(r)

    print(f'Loaded {len(rows)} actionable rows from {in_path}')

    # For cross_product_dup, group by sku to apply disambiguation
    by_sku = defaultdict(list)
    for r in rows:
        if r['issue'] == 'cross_product_dup':
            by_sku[r['sku']].append(r)
        else:
            r['_new_sku'] = None  # filled below

    # Compute proposed new SKUs
    fixes = []
    for r in rows:
        if r['issue'] == 'empty_sku':
            # Use product handle + variant short id
            handle = r['product_handle']
            vid_short = r['variant_id'][-6:] if r['variant_id'] else '0'
            new_sku = f"{slugify(handle)}-{vid_short}"
            fixes.append({**r, '_new_sku': new_sku, '_action': 'fill_empty'})
        elif r['issue'] == 'cross_product_dup':
            # Append -DUP-<short_pid> to each duplicate occurrence
            base_sku = r['sku']
            for dup in by_sku[base_sku]:
                if dup['product_id'] == r['product_id']:
                    new_sku = f"{base_sku}-D-{r['product_id'][-6:]}"
                    fixes.append({**dup, '_new_sku': new_sku, '_action': 'disambiguate'})
                    break

    if args.limit:
        fixes = fixes[:args.limit]

    print(f'\nProposed fixes: {len(fixes)}')
    by_action = defaultdict(int)
    for f in fixes:
        by_action[f['_action']] += 1
    for a, n in by_action.items():
        print(f'  {a}: {n}')

    # Write proposed CSV
    with open(args.out_csv, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'action', 'old_sku', 'new_sku', 'product_id', 'variant_id',
            'product_handle', 'product_title',
        ])
        writer.writeheader()
        for f in fixes:
            writer.writerow({
                'action': f['_action'],
                'old_sku': f.get('sku') or '',
                'new_sku': f['_new_sku'],
                'product_id': f['product_id'],
                'variant_id': f['variant_id'],
                'product_handle': f['product_handle'],
                'product_title': f.get('product_title') or '',
            })
    print(f'\nCSV: {args.out_csv}')

    if args.dry_run:
        print('\nDRY RUN. First 10 fixes:')
        for f in fixes[:10]:
            print(f"  [{f['_action']}] {f['product_handle']:50s}")
            print(f"    OLD: {f.get('sku') or '(empty)'!r}")
            print(f"    NEW: {f['_new_sku']!r}")
        print('\nPass --confirm to apply.')
        return

    # Snapshot
    snap_dir = Path('scripts/snapshots')
    snap_dir.mkdir(parents=True, exist_ok=True)
    snap = {'ts': time.strftime('%Y-%m-%dT%H-%M-%S'),
            'fixes': [{'variant_id': f['variant_id'],
                        'old_sku': f.get('sku') or '',
                        'new_sku': f['_new_sku']} for f in fixes]}
    snap_file = snap_dir / f'variant-sku-fix-{snap["ts"]}.json'
    snap_file.write_text(json.dumps(snap, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f'Snapshot: {snap_file}')

    # Apply via REST PUT on each variant
    fails = 0
    applied = 0
    with ShopifyAdmin() as s:
        for f in fixes:
            try:
                r = s.rest_put(
                    f'variants/{f["variant_id"]}.json',
                    {'variant': {'sku': f['_new_sku']}}
                )
                if r and 'variant' in r:
                    applied += 1
                else:
                    fails += 1
                    if not args.quiet:
                        print(f'  FAIL {f["product_handle"]}: {r}')
                time.sleep(0.1)
            except (ShopifyGraphQLError, urllib.error.HTTPError) as e:
                fails += 1
                if not args.quiet:
                    print(f'  ERR  {f["product_handle"]}: {e}')

    print(f'\n=== DONE ===')
    print(f'  Applied: {applied}/{len(fixes)}')
    print(f'  Failed: {fails}')
    print(f'  Rollback: --rollback {snap["ts"]}')


if __name__ == '__main__':
    main()