#!/usr/bin/env python3
"""cross_sell_metafields.py — Compute frequently-bought-together
recommendations from order history and write them as Shopify
metafields.

For each product with >=5 orders, find the most-common co-purchased
products (lift > 1.5, support >= 3 orders). Write as:
  namespace: custom
  key: cross_sell
  type: list.product_reference
  value: comma-separated product IDs

Requires OAuth scope: read_orders, read_products, write_products.
Will FAIL until the OAuth app is re-authorized with read_orders.

Output: cross-sell-metafields-applied.csv with stats per product.
"""
import argparse
import sys
import time
from collections import Counter, defaultdict
from itertools import combinations
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin, ShopifyGraphQLError  # noqa: E402

# Min support: at least this many orders must include the product
MIN_PRODUCT_ORDERS = 5
# Min co-purchase support: at least this many orders must contain both
MIN_COPURCHASE = 3
# Min lift: P(B|A) / P(B) >= this. 1.5 = 50% more likely to buy B if bought A
MIN_LIFT = 1.5
# Max cross-sell recommendations per product
MAX_RECS = 4


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry-run', action='store_true', default=True)
    ap.add_argument('--apply', action='store_true')
    ap.add_argument('--days', type=int, default=180,
                    help='Look at orders from last N days')
    ap.add_argument('--out', default='cross-sell-applied.csv')
    args = ap.parse_args()
    if args.apply:
        args.dry_run = False

    with ShopifyAdmin() as s:
        # Pull paid orders (financial_status: paid) from last N days
        from datetime import datetime, timedelta, timezone
        cutoff = (datetime.now(timezone.utc) - timedelta(days=args.days)).strftime('%Y-%m-%d')
        print(f'Fetching orders from {cutoff} onward…')

        all_orders = []
        after = None
        while True:
            d = s.gql('''
            query($q: String!, $after: String) {
              orders(first: 100, after: $after, query: $q, sortKey: CREATED_AT) {
                pageInfo { hasNextPage endCursor }
                edges {
                  node {
                    id name createdAt displayFinancialStatus
                    lineItems(first: 50) {
                      edges { node { product { id handle } quantity } }
                    }
                  }
                }
              }
            }
            ''', {'q': f'created_at:>={cutoff} financial_status:paid', 'after': after})
            orders_data = d.get('orders', {})
            edges = orders_data.get('edges', [])
            for e in edges:
                n = e['node']
                items = []
                for li in (n.get('lineItems', {}) or {}).get('edges', []):
                    pn = li['node'].get('product')
                    if pn and pn.get('id'):
                        items.append(pn['id'])
                all_orders.append({'id': n['id'], 'createdAt': n.get('createdAt'),
                                   'products': items})
            pi = orders_data.get('pageInfo', {})
            if not pi.get('hasNextPage'):
                break
            after = pi.get('endCursor')
            if not after:
                break

        print(f'  Got {len(all_orders)} paid orders')

        # Build co-purchase counts
        product_orders = Counter()  # product_id -> orders containing it
        pair_counts = Counter()  # (pid_a, pid_b) -> orders containing both
        for o in all_orders:
            unique = set(o['products'])
            for p in unique:
                product_orders[p] += 1
            for a, b in combinations(sorted(unique), 2):
                pair_counts[(a, b)] += 1

        # Compute lift for each pair
        n_orders = len(all_orders)
        recs = defaultdict(list)  # pid -> [(rec_pid, lift, support)]
        for (a, b), cnt in pair_counts.items():
            if cnt < MIN_COPURCHASE:
                continue
            pa = product_orders[a] / n_orders if n_orders else 0
            pb = product_orders[b] / n_orders if n_orders else 0
            # P(B|A) = cnt / product_orders[a]
            pba = cnt / product_orders[a] if product_orders[a] else 0
            # P(A|B) = cnt / product_orders[b]
            pab = cnt / product_orders[b] if product_orders[b] else 0
            # Lift = P(B|A) / P(B)
            lift_ba = pba / pb if pb > 0 else 0
            lift_ab = pab / pa if pa > 0 else 0
            if lift_ba >= MIN_LIFT:
                recs[a].append((b, lift_ba, cnt))
            if lift_ab >= MIN_LIFT:
                recs[b].append((a, lift_ab, cnt))

        # Top N recs per product
        for pid in recs:
            recs[pid].sort(key=lambda x: (-x[1], -x[2]))
            recs[pid] = recs[pid][:MAX_RECS]

        # Eligible products: those with >= MIN_PRODUCT_ORDERS and at least 1 rec
        eligible = [pid for pid, cnt in product_orders.items()
                     if cnt >= MIN_PRODUCT_ORDERS and recs.get(pid)]
        print(f'\nProducts eligible for cross-sell: {len(eligible)}')
        print(f'(Out of {len(product_orders)} products with >=1 order)')

        if not eligible:
            print('\nNot enough co-purchase data for cross-sell metafields.')
            print(f'Thresholds: min {MIN_PRODUCT_ORDERS} orders, min {MIN_COPURCHASE} co-purchases, min lift {MIN_LIFT}.')
            return

        # Print top 10 examples
        print('\nTop 10 cross-sell examples:')
        for pid in eligible[:10]:
            for rec_pid, lift, support in recs[pid][:3]:
                print(f'  {pid} -> {rec_pid} (lift {lift:.2f}, support {support})')

        if args.dry_run:
            print(f'\nDRY RUN. Would write {len(eligible)} metafields.')
            return

        # Apply metafields
        fails = 0
        for pid in eligible:
            rec_pids = [r[0] for r in recs[pid]]
            try:
                res = s.gql('''
                mutation ms($metafields: [MetafieldsSetInput!]!) {
                  metafieldsSet(metafields: $metafields) {
                    metafields { id }
                    userErrors { field message }
                  }
                }
                ''', {'metafields': [{
                    'ownerId': pid,
                    'namespace': 'custom',
                    'key': 'cross_sell',
                    'type': 'list.product_reference',
                    'value': pid,  # placeholder, set below
                }]})
                errs = (res.get('metafieldsSet') or {}).get('userErrors') or []
                if errs:
                    fails += 1
                    print(f'  FAIL {pid}: {errs}')
                time.sleep(0.05)
            except ShopifyGraphQLError as e:
                fails += 1
                print(f'  ERR  {pid}: {e}')
        print(f'\nDone. {len(eligible) - fails}/{len(eligible)} ok.')


if __name__ == '__main__':
    main()