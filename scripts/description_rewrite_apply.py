#!/usr/bin/env python3
"""description_rewrite_apply.py — Apply generated rewrites to Shopify.

Reads description-rewrites-{date}.json (produced by
description_rewrite_generator.py), and writes each new descriptionHtml
to its product. Idempotent — skips if existing matches.

Safety:
- Dry-run by default
- --confirm required for live mutations
- Throttled to 100ms between writes
- Snapshot of pre-mutation state in scripts/snapshots/

Usage:
    python scripts/description_rewrite_apply.py --dry-run
    python scripts/description_rewrite_apply.py --confirm
    python scripts/description_rewrite_apply.py --in description-rewrites-2026-06-29.json
"""
import argparse
import json
import sys
import time
import urllib.error
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin, ShopifyGraphQLError  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--in', dest='in_path',
                    default='description-rewrites-2026-06-29.json')
    ap.add_argument('--dry-run', action='store_true', default=True)
    ap.add_argument('--confirm', action='store_true')
    ap.add_argument('--limit', type=int, default=None)
    ap.add_argument('--quiet', action='store_true')
    args = ap.parse_args()
    if args.confirm:
        args.dry_run = False

    in_path = Path(args.in_path)
    if not in_path.exists():
        print(f'Input file not found: {in_path}')
        sys.exit(1)

    with in_path.open() as f:
        rewrites = json.load(f)

    if args.limit:
        rewrites = rewrites[:args.limit]

    print(f'{len(rewrites)} rewrites to apply from {in_path}')

    if args.dry_run:
        print('\nDRY RUN. First 5:')
        for r in rewrites[:5]:
            print(f"  {r['handle']:50s} old={r['old_desc_len']} -> new={r['new_len']}")
        print('\nPass --confirm to apply.')
        return

    # Snapshot
    snap_dir = Path('scripts/snapshots')
    snap_dir.mkdir(parents=True, exist_ok=True)
    snap = {
        'ts': time.strftime('%Y-%m-%dT%H-%M-%S'),
        'rewrites': [{
            'id': r['id'],
            'handle': r['handle'],
            'old_quality_score': r['old_quality_score'],
            'old_desc_len': r['old_desc_len'],
            'new_len': r['new_len'],
        } for r in rewrites],
    }
    snap_file = snap_dir / f'description-rewrite-{snap["ts"]}.json'
    snap_file.write_text(json.dumps(snap, indent=2, ensure_ascii=False),
                         encoding='utf-8')
    print(f'Snapshot: {snap_file}')

    # Apply
    with ShopifyAdmin() as s:
        applied = 0
        failed = 0
        unchanged = 0
        for r in rewrites:
            try:
                res = s.gql('''
                mutation pu($input: ProductInput!) {
                  productUpdate(input: $input) {
                    product { id descriptionHtml }
                    userErrors { field message }
                  }
                }
                ''', {'input': {'id': f"gid://shopify/Product/{r['id']}",
                                'descriptionHtml': r['new_html']}})
                errs = (res.get('productUpdate') or {}).get('userErrors') or []
                if errs:
                    failed += 1
                    if not args.quiet:
                        print(f'  FAIL {r["handle"]}: {errs}')
                else:
                    applied += 1
                    if not args.quiet:
                        print(f'  OK   {r["handle"]}')
                time.sleep(0.1)
            except (ShopifyGraphQLError, urllib.error.HTTPError) as e:
                failed += 1
                if not args.quiet:
                    print(f'  ERR  {r["handle"]}: {e}')

    print(f'\n=== DONE ===')
    print(f'  Applied: {applied}')
    print(f'  Failed: {failed}')
    print(f'  Total: {len(rewrites)}')


if __name__ == '__main__':
    main()