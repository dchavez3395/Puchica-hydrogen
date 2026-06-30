#!/usr/bin/env python3
"""image_alt_apply_batched.py — Faster alt text apply using fileUpdate batching.

The original image_alt_apply.py uses fileUpdate(files: [...]) per call,
one alt at a time. That works but is slow — each call costs 10 throttle
points and we have ~58k to do.

This version batches N updates per API call. With throttle rate of
100 points/sec restore rate, and each call costing 10 points (single
file) vs 10+(N-1)*0 for batches... actually fileUpdate always costs
10 points regardless of how many files are in the array. So batching
N alts per call gives us N x speedup.

Tested batch sizes: 10, 25, 50. Going too high risks losing all
batch on one error. Conservative: 25 per batch.

Checkpointing: same JSON-based resume as image_alt_apply.py.
"""
import argparse
import csv
import json
import sys
import time
import urllib.error
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin, ShopifyGraphQLError  # noqa: E402

BATCH_SIZE = 25
MAX_RETRIES = 3


def apply_batch(s, items, max_retries=MAX_RETRIES):
    """Apply N alt text updates in one fileUpdate call.
    items: list of (media_id, alt)
    Returns: list of 'ok'|'fail' for each item (same order).
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

            # Build result list. If a media id appears in returned, it's ok.
            returned_ids = {f['id'] for f in returned}
            results = []
            for mid, _ in items:
                if mid in returned_ids:
                    results.append('ok')
                else:
                    results.append('fail')
            # If global error and no userErrors, all failed
            if not returned and not errs:
                results = ['fail'] * len(items)
            return results
        except (ShopifyGraphQLError, urllib.error.HTTPError) as e:
            if attempt < max_retries - 1:
                time.sleep(0.5 * (2 ** attempt))
                continue
            return ['fail'] * len(items)
    return ['fail'] * len(items)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--in', dest='in_path', default='image-alt-fix-2026-06-29.csv')
    ap.add_argument('--apply', action='store_true', default=True)
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--batch-size', type=int, default=BATCH_SIZE)
    ap.add_argument('--checkpoint', default='image-alt-progress.json')
    ap.add_argument('--limit', type=int, default=None)
    args = ap.parse_args()
    if args.dry_run:
        args.apply = False

    in_path = Path(args.in_path)
    if not in_path.exists():
        print(f'Input not found: {in_path}')
        sys.exit(1)

    with in_path.open(encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    if args.limit:
        rows = rows[:args.limit]

    print(f'{len(rows)} rows from {in_path}')

    if args.dry_run:
        print('DRY RUN. Pass --apply.')
        return

    # Load checkpoint
    completed = {}
    cp_path = Path(args.checkpoint)
    if cp_path.exists():
        try:
            completed = json.loads(cp_path.read_text())
            print(f'Loaded checkpoint: {len(completed)} already done')
        except Exception:
            pass

    pending = [r for r in rows if r['media_id'] not in completed]
    print(f'{len(pending)} to process')

    # Batch into groups
    batches = []
    for i in range(0, len(pending), args.batch_size):
        batches.append(pending[i:i + args.batch_size])
    print(f'{len(batches)} batches of up to {args.batch_size}')

    successful = 0
    failed = 0
    with ShopifyAdmin() as s:
        for bi, batch in enumerate(batches):
            items = [(r['media_id'], r['new_alt']) for r in batch]
            results = apply_batch(s, items)
            for r, res in zip(batch, results):
                completed[r['media_id']] = (res == 'ok')
                if res == 'ok':
                    successful += 1
                else:
                    failed += 1

            # Checkpoint every 5 batches
            if (bi + 1) % 5 == 0:
                cp_path.write_text(json.dumps(completed))
                pct = (bi + 1) / len(batches) * 100
                print(f'  [{bi+1}/{len(batches)}] {pct:.0f}%  ok={successful} fail={failed}')

    cp_path.write_text(json.dumps(completed))
    print(f'\n=== DONE ===')
    print(f'  Successful: {successful}')
    print(f'  Failed: {failed}')
    print(f'  Total: {len(pending)}')
    print(f'  Throughput: {len(pending)/(successful+failed)*successful:.0f} successful items / batch')


if __name__ == '__main__':
    main()