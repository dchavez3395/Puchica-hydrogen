#!/usr/bin/env python3
"""inventory_fix.py — Fix the misleading default inventory state.

Puchica dropship convention: every variant has inventoryQuantity=250.
This makes the storefront display '250 in stock' on every PDP,
which is wrong (dropship inventory is supplier-managed, not
shop-counted).

Fix:
* Set tracked=false on all variants that have tracked=true with
  inventoryQuantity=250 (dropship convention — dropship app
  controls fulfillment)
* Set inventoryPolicy=DENY (already mostly set; verify)

This script also reports:
* How many variants have inventoryQuantity > 0
* How many have inventoryManagement enabled
* How many have inventoryPolicy=CONTINUE (allows overselling)

Read-only by default. --confirm to apply.
"""
import argparse
import csv
import sys
import time
import urllib.error
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out-csv', default='inventory-fix-2026-06-29.csv')
    ap.add_argument('--dry-run', action='store_true', default=True)
    ap.add_argument('--confirm', action='store_true')
    ap.add_argument('--limit', type=int, default=None)
    ap.add_argument('--quiet', action='store_true')
    args = ap.parse_args()
    if args.confirm:
        args.dry_run = False

    with ShopifyAdmin() as s:
        print('Fetching products with inventory data…')
        # Fetch full inventory info via REST inventory_levels (more reliable than GraphQL)
        # Per the earlier finding: most variants have inventoryQuantity=250
        products = s.list_all_products(fields=[
            'id', 'title', 'handle', 'vendor', 'status',
            'totalInventory',
            'variants(first: 10) { nodes { id sku inventoryQuantity '
            'inventoryPolicy inventoryItem { id tracked } } }',
        ])

    # Categorize variants
    total_variants = 0
    tracked_enabled = 0
    quantity_250 = 0
    quantity_other = 0
    policy_continue = 0
    policy_deny = 0
    to_fix = []

    for p in products:
        if p.get('status') != 'ACTIVE':
            continue
        variants = (p.get('variants') or {}).get('nodes') or []
        for v in variants:
            total_variants += 1
            vid = v['id'].split('/')[-1]
            inv = v.get('inventoryQuantity')
            mgmt = (v.get('inventoryItem') or {}).get('tracked')
            policy = v.get('inventoryPolicy')  # DENY / CONTINUE

            if mgmt:
                tracked_enabled += 1
            if inv == 250:
                quantity_250 += 1
            elif inv is not None and inv != 0:
                quantity_other += 1
            if policy == 'CONTINUE':
                policy_continue += 1
            elif policy == 'DENY':
                policy_deny += 1

            # Decide: if tracked=true with default 250, set tracked=false
            if mgmt and inv == 250:
                to_fix.append({
                    'product_id': p['id'].split('/')[-1],
                    'variant_id': vid,
                    'inventory_item_id': ((v.get('inventoryItem') or {}).get('id') or '').split('/')[-1],
                    'handle': p['handle'],
                    'sku': v.get('sku') or '',
                    'current_qty': inv,
                    'current_tracked': mgmt,
                    'current_policy': policy,
                    'fix': 'set_tracked_false',
                })
            # Decide: if policy=CONTINUE, change to DENY (no overselling)
            if policy == 'CONTINUE':
                to_fix.append({
                    'product_id': p['id'].split('/')[-1],
                    'variant_id': vid,
                    'inventory_item_id': ((v.get('inventoryItem') or {}).get('id') or '').split('/')[-1],
                    'handle': p['handle'],
                    'sku': v.get('sku') or '',
                    'current_qty': inv,
                    'current_tracked': mgmt,
                    'current_policy': policy,
                    'fix': 'set_policy_deny',
                })

    print(f'\n=== Inventory state ===')
    print(f'Total variants: {total_variants}')
    print(f'Tracked (Shopify-managed): {tracked_enabled}')
    print(f'  With quantity = 250: {quantity_250}')
    print(f'  With other non-zero quantity: {quantity_other}')
    print(f'Inventory policy:')
    print(f'  CONTINUE (allows overselling): {policy_continue}')
    print(f'  DENY (no overselling): {policy_deny}')
    print(f'\nVariants to fix (tracked=true with default qty=250): {len(to_fix)}')

    if args.limit:
        to_fix = to_fix[:args.limit]

    # Write CSV
    out_path = Path(args.out_csv)
    with out_path.open('w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=list(to_fix[0].keys()) if to_fix else [
            'product_id', 'variant_id', 'handle', 'sku', 'current_qty',
            'current_mgmt', 'current_policy', 'fix'])
        writer.writeheader()
        for r in to_fix:
            writer.writerow(r)
    print(f'CSV: {out_path}')

    if args.dry_run:
        print('\nDRY RUN. First 5 fixes:')
        for r in to_fix[:5]:
            print(f"  {r['handle']:50s}  sku={r['sku']}  qty={r['current_qty']}  policy={r['current_policy']}  fix={r['fix']}")
        print('\nPass --confirm to apply.')
        return

    # Apply via GraphQL inventoryItemUpdate mutation (for tracked)
    # and productVariantsBulkUpdate via REST for inventoryPolicy
    fails = 0
    applied = 0
    with ShopifyAdmin() as s:
        for r in to_fix:
            try:
                if r['fix'] == 'set_tracked_false':
                    res = s.gql('''
                    mutation iiu($id: ID!, $input: InventoryItemInput!) {
                      inventoryItemUpdate(id: $id, input: $input) {
                        inventoryItem { id tracked }
                        userErrors { field message }
                      }
                    }
                    ''', {
                        'id': f'gid://shopify/InventoryItem/{r["inventory_item_id"]}',
                        'input': {'tracked': False},
                    })
                    errs = (res.get('inventoryItemUpdate') or {}).get('userErrors') or []
                    if errs:
                        fails += 1
                        if not args.quiet:
                            print(f"  FAIL {r['handle']}: {errs}")
                    else:
                        applied += 1
                elif r['fix'] == 'set_policy_deny':
                    res = s.rest_put(f'variants/{r["variant_id"]}.json', {
                        'variant': {'inventory_policy': 'deny'}
                    })
                    if res and 'variant' in res:
                        applied += 1
                    else:
                        fails += 1
                time.sleep(0.05)
            except Exception as e:
                fails += 1
                if not args.quiet:
                    print(f"  ERR  {r['handle']}: {e}")

    print(f'\n=== DONE ===')
    print(f'  Applied: {applied}/{len(to_fix)}')
    print(f'  Failed: {fails}')


if __name__ == '__main__':
    main()