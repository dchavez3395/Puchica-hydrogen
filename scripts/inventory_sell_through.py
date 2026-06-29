#!/usr/bin/env python3
"""inventory_sell_through.py — Identify slow movers and dead stock.

Per-product analysis using:
  - inventoryQuantity (current stock)
  - units sold in last N days (from orders)
  - product status (active/draft/archived)

Outputs:
  1. Dead stock: in stock but no sales in 180 days. Candidates for removal/discounting.
  2. Slow movers: 1-3 sales in last 180 days, currently in stock.
  3. Stockout analysis: products with high velocity but inventoryQuantity=0.
  4. Overstock: inventory >90 days of forward sales.

BLOCKED: requires read_orders scope.
"""
import argparse
import csv
import sys
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin, ShopifyGraphQLError  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--days', type=int, default=180)
    ap.add_argument('--out-csv', default='sell-through-2026-06-29.csv')
    ap.add_argument('--out-md', default='sell-through-2026-06-29.md')
    args = ap.parse_args()

    with ShopifyAdmin() as s:
        # Pull paid orders
        cutoff = (datetime.now(timezone.utc) - timedelta(days=args.days)).strftime('%Y-%m-%d')
        print(f'Fetching paid orders from {cutoff} onward…')

        order_line_data = defaultdict(lambda: {'units': 0, 'orders': set()})
        after = None
        order_count = 0
        while True:
            d = s.gql('''
            query($q: String!, $after: String) {
              orders(first: 100, after: $after, query: $q, sortKey: CREATED_AT) {
                pageInfo { hasNextPage endCursor }
                edges {
                  node {
                    id
                    lineItems(first: 50) {
                      edges { node { product { id } quantity } }
                    }
                  }
                }
              }
            }
            ''', {'q': f'created_at:>={cutoff} financial_status:paid', 'after': after})
            orders_data = d.get('orders', {})
            for e in orders_data.get('edges', []):
                order_count += 1
                oid = e['node']['id']
                for li in (e['node'].get('lineItems', {}) or {}).get('edges', []):
                    ln = li['node']
                    pid = (ln.get('product') or {}).get('id')
                    if not pid:
                        continue
                    qty = ln.get('quantity') or 0
                    order_line_data[pid]['units'] += qty
                    order_line_data[pid]['orders'].add(oid)
            pi = orders_data.get('pageInfo', {})
            if not pi.get('hasNextPage'):
                break
            after = pi.get('endCursor')
            if not after:
                break
        for pid, d in order_line_data.items():
            d['orders'] = len(d['orders'])

        print(f'  Got {order_count} paid orders')

        # Pull all products with inventory
        print('Fetching products with inventory…')
        products = s.list_all_products(fields=[
            'id', 'title', 'handle', 'productType', 'status', 'vendor', 'createdAt',
            'totalInventory',
            'variants(first: 10) { nodes { id inventoryQuantity availableForSale } }',
        ])

    rows = []
    for p in products:
        if p.get('status') != 'ACTIVE':
            continue
        pid = p['id']
        sales = order_line_data.get(pid, {'units': 0, 'orders': 0})
        total_inv = p.get('totalInventory') or 0
        variants = (p.get('variants') or {}).get('nodes') or []
        v_inv = sum(v.get('inventoryQuantity') or 0 for v in variants)
        v_avail = sum(1 for v in variants if v.get('availableForSale'))
        units_per_day = sales['units'] / args.days if args.days else 0
        days_of_stock = v_inv / units_per_day if units_per_day > 0 else 9999
        rows.append({
            'id': pid.split('/')[-1],
            'handle': p['handle'],
            'title': (p.get('title') or '')[:80],
            'productType': p.get('productType') or '',
            'totalInventory': total_inv,
            'variantInventory': v_inv,
            'units_sold': sales['units'],
            'orders': sales['orders'],
            'units_per_day': round(units_per_day, 4),
            'days_of_stock': round(days_of_stock, 1),
            'category': '',  # filled later
        })

    # Categorize
    dead_stock = [r for r in rows if r['units_sold'] == 0 and r['variantInventory'] > 0]
    slow_movers = [r for r in rows if 0 < r['units_sold'] <= 3 and r['variantInventory'] > 0]
    stockouts = [r for r in rows if r['variantInventory'] == 0 and r['units_sold'] > 5]
    overstock = [r for r in rows if r['variantInventory'] > 100 and r['days_of_stock'] > 365]

    print(f'\nFindings (last {args.days} days):')
    print(f'  Dead stock (in stock, 0 sales): {len(dead_stock)}')
    print(f'  Slow movers (1-3 sales, in stock): {len(slow_movers)}')
    print(f'  Stockouts (out of stock, >5 sales): {len(stockouts)}')
    print(f'  Overstock (>100 units, >365 days of stock): {len(overstock)}')

    # Write CSV
    with open(args.out_csv, 'w', encoding='utf-8', newline='') as f:
        if rows:
            w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
            w.writeheader()
            for r in rows:
                w.writerow(r)

    # Write Markdown
    out = []
    out.append(f'# Sell-Through & Inventory Analysis ({args.days} days)')
    out.append('')
    out.append(f'Window: {cutoff} to {datetime.now(timezone.utc).strftime("%Y-%m-%d")}')
    out.append('')
    out.append('## Headline findings')
    out.append('')
    out.append(f'- Dead stock (in stock, 0 sales): **{len(dead_stock)}**')
    out.append(f'- Slow movers (1-3 sales, in stock): **{len(slow_movers)}**')
    out.append(f'- Stockouts (out of stock, >5 sales): **{len(stockouts)}**')
    out.append(f'- Overstock (>100 units, >365 days of stock): **{len(overstock)}**')
    out.append('')
    out.append('### Top 30 dead stock items')
    out.append('')
    out.append('| handle | productType | inv | price (variants) |')
    out.append('| --- | --- | ---:| --- |')
    for r in sorted(dead_stock, key=lambda x: -x['variantInventory'])[:30]:
        out.append(f'| `{r["handle"]}` | {r["productType"]} | {r["variantInventory"]} | (variants) |')
    out.append('')
    out.append('### Top 30 slow movers')
    out.append('')
    out.append('| handle | productType | units | inv |')
    out.append('| --- | --- | ---:| ---:|')
    for r in sorted(slow_movers, key=lambda x: x['units_sold'])[:30]:
        out.append(f'| `{r["handle"]}` | {r["productType"]} | {r["units_sold"]} | {r["variantInventory"]} |')
    out.append('')
    out.append('### Stockouts (lost sales — restock candidates)')
    out.append('')
    out.append('| handle | productType | units |')
    out.append('| --- | --- | ---:|')
    for r in sorted(stockouts, key=lambda x: -x['units_sold'])[:30]:
        out.append(f'| `{r["handle"]}` | {r["productType"]} | {r["units_sold"]} |')
    out.append('')

    Path(args.out_md).write_text('\n'.join(out), encoding='utf-8')
    print(f'\nCSV: {args.out_csv}')
    print(f'Markdown: {args.out_md}')


if __name__ == '__main__':
    main()