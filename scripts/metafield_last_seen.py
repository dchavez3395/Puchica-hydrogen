#!/usr/bin/env python3
"""metafield_last_seen.py — Stamp every active product with
custom.last_seen = today's timestamp.

Useful for future audits:
* "What products haven't been touched in 90 days?" (potential dead
  stock candidates without needing orders data)
* "When did I last audit this?" (provenance)

Metafield schema:
* namespace: custom
* key: last_seen
* type: date_time
* value: ISO 8601 timestamp

Idempotent — overwrites previous last_seen value.

Usage:
    python scripts/metafield_last_seen.py --dry-run
    python scripts/metafield_last_seen.py --confirm
"""
import argparse
import csv
import sys
import time
import urllib.error
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin, ShopifyGraphQLError  # noqa: E402

BATCH_SIZE = 25  # metafieldsSet max input limit per call


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry-run', action='store_true', default=True)
    ap.add_argument('--confirm', action='store_true')
    ap.add_argument('--limit', type=int, default=None)
    ap.add_argument('--quiet', action='store_true')
    args = ap.parse_args()
    if args.confirm:
        args.dry_run = False

    timestamp = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    print(f'Will stamp every product with custom.last_seen = {timestamp}')

    with ShopifyAdmin() as s:
        print('Fetching products…')
        products = s.list_all_products(fields=['id', 'handle', 'status'])

    active = [p for p in products if p.get('status') == 'ACTIVE']
    if args.limit:
        active = active[:args.limit]
    print(f'Active products: {len(active)}')

    if args.dry_run:
        print('\nDRY RUN. First 5:')
        for p in active[:5]:
            print(f"  {p['id']} -> custom.last_seen = {timestamp}")
        print(f'\nPass --confirm to apply (writes {len(active)} metafields).')
        return

    # Apply in batches via metafieldsSet
    batches = [active[i:i + BATCH_SIZE]
                for i in range(0, len(active), BATCH_SIZE)]
    applied = 0
    failed = 0
    with ShopifyAdmin() as s:
        for bi, batch in enumerate(batches):
            metafields = [{
                'ownerId': p['id'],
                'namespace': 'custom',
                'key': 'last_seen',
                'type': 'date_time',
                'value': timestamp,
            } for p in batch]
            try:
                res = s.gql('''
                mutation ms($metafields: [MetafieldsSetInput!]!) {
                  metafieldsSet(metafields: $metafields) {
                    metafields { id }
                    userErrors { field message }
                  }
                }
                ''', {'metafields': metafields})
                errs = (res.get('metafieldsSet') or {}).get('userErrors') or []
                if errs:
                    failed += len(batch)
                    if not args.quiet:
                        print(f'  FAIL batch {bi}: {errs[:3]}')
                else:
                    applied += len(batch)
                time.sleep(0.1)
            except (ShopifyGraphQLError, urllib.error.HTTPError) as e:
                failed += len(batch)
                if not args.quiet:
                    print(f'  ERR batch {bi}: {e}')
            if (bi + 1) % 10 == 0:
                print(f'  [{bi+1}/{len(batches)}] applied={applied} failed={failed}')

    print(f'\n=== DONE ===')
    print(f'  Applied: {applied}/{len(active)}')
    print(f'  Failed: {failed}')


if __name__ == '__main__':
    main()