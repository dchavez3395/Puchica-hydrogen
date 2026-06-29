#!/usr/bin/env python3
"""sales_weighted_pricing.py — Combine product-level pricing analysis
with sales-velocity data to identify:
  1. Categories driving 80%+ of revenue (where ad spend makes sense)
  2. Products with high price + low velocity (likely overpriced)
  3. Products with low price + high velocity (underpriced gems)
  4. Pareto analysis: which 20% of products generate 80% of revenue

Requires read_orders scope (BLOCKED — see OAUTH_SCOPE_NOTES.md).

Output: sales-weighted-pricing-2026-06-29.md with charts/tables
and sales-weighted-pricing-2026-06-29.csv with per-product stats.

Usage:
    python scripts/sales_weighted_pricing.py [--days 90]
"""
import argparse
import csv
import sys
import time
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin, ShopifyGraphQLError  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--days', type=int, default=90)
    ap.add_argument('--out-csv', default='sales-weighted-pricing-2026-06-29.csv')
    ap.add_argument('--out-md', default='sales-weighted-pricing-2026-06-29.md')
    args = ap.parse_args()

    with ShopifyAdmin() as s:
        # Pull paid orders
        cutoff = (datetime.now(timezone.utc) - timedelta(days=args.days)).strftime('%Y-%m-%d')
        print(f'Fetching paid orders from {cutoff} onward…')

        order_line_data = defaultdict(lambda: {'units': 0, 'revenue': 0.0, 'orders': set()})
        order_count = 0
        after = None
        while True:
            d = s.gql('''
            query($q: String!, $after: String) {
              orders(first: 100, after: $after, query: $q, sortKey: CREATED_AT) {
                pageInfo { hasNextPage endCursor }
                edges {
                  node {
                    id createdAt
                    lineItems(first: 50) {
                      edges { node { product { id handle } quantity originalUnitPriceSet { shopMoney { amount } } } }
                    }
                  }
                }
              }
            }
            ''', {'q': f'created_at:>={cutoff} financial_status:paid', 'after': after})
            orders_data = d.get('orders', {})
            for e in orders_data.get('edges', []):
                order_count += 1
                n = e['node']
                oid = n['id']
                for li in (n.get('lineItems', {}) or {}).get('edges', []):
                    ln = li['node']
                    pid = (ln.get('product') or {}).get('id')
                    if not pid:
                        continue
                    qty = ln.get('quantity') or 0
                    money = (ln.get('originalUnitPriceSet') or {}).get('shopMoney') or {}
                    try:
                        unit_price = float(money.get('amount') or 0)
                    except (ValueError, TypeError):
                        unit_price = 0
                    order_line_data[pid]['units'] += qty
                    order_line_data[pid]['revenue'] += qty * unit_price
                    order_line_data[pid]['orders'].add(oid)
            pi = orders_data.get('pageInfo', {})
            if not pi.get('hasNextPage'):
                break
            after = pi.get('endCursor')
            if not after:
                break

        print(f'  Got {order_count} paid orders')
        # Convert orders set to count
        for pid, d in order_line_data.items():
            d['orders'] = len(d['orders'])

        # Pull all products
        print('Fetching products…')
        products = s.list_all_products(fields=[
            'id', 'title', 'handle', 'productType', 'status', 'vendor',
            'variants(first: 1) { nodes { price } }',
        ])

    # Build per-product stats
    rows = []
    for p in products:
        if p.get('status') != 'ACTIVE':
            continue
        pid = p['id']
        sales = order_line_data.get(pid, {'units': 0, 'revenue': 0.0, 'orders': 0})
        variants = (p.get('variants') or {}).get('nodes') or []
        try:
            price = float(variants[0].get('price') or 0) if variants else 0
        except (ValueError, TypeError):
            price = 0
        rows.append({
            'id': pid.split('/')[-1],
            'handle': p['handle'],
            'title': (p.get('title') or '')[:80],
            'productType': p.get('productType') or '',
            'price': price,
            'units_sold': sales['units'],
            'orders': sales['orders'],
            'revenue': round(sales['revenue'], 2),
            'velocity_score': sales['units'] * price,  # rough revenue proxy
        })

    total_revenue = sum(r['revenue'] for r in rows)
    total_units = sum(r['units_sold'] for r in rows)
    print(f'\nLast {args.days} days: ${total_revenue:,.2f} revenue, {total_units} units')

    # Pareto analysis
    sorted_by_rev = sorted(rows, key=lambda r: -r['revenue'])
    cumulative = 0
    pareto_data = []
    for r in sorted_by_rev:
        cumulative += r['revenue']
        pareto_data.append({
            **r,
            'cum_revenue': cumulative,
            'cum_pct': cumulative / total_revenue * 100 if total_revenue else 0,
        })

    # Top 20% cutoff
    top20_count = max(1, len(rows) // 5)
    top20_revenue = sum(r['revenue'] for r in sorted_by_rev[:top20_count])
    print(f'Top 20% of products ({top20_count}): ${top20_revenue:,.2f} ({top20_revenue/total_revenue*100 if total_revenue else 0:.1f}% of revenue)')

    # Category breakdown
    by_cat_revenue = Counter()
    by_cat_units = Counter()
    for r in rows:
        by_cat_revenue[r['productType']] += r['revenue']
        by_cat_units[r['productType']] += r['units_sold']

    # High price + low velocity = overpriced
    overpriced = [r for r in rows if r['price'] > 100 and r['units_sold'] == 0
                  and r['productType'] in by_cat_revenue]
    # Low price + high velocity = potentially underpriced
    underpriced = [r for r in rows if r['price'] < 50 and r['units_sold'] > 10]

    # Write CSV
    with open(args.out_csv, 'w', encoding='utf-8', newline='') as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()) if rows else
                           ['id','handle','title','productType','price','units_sold','orders','revenue','velocity_score'])
        w.writeheader()
        for r in rows:
            w.writerow(r)

    # Write Markdown report
    out = []
    out.append(f'# Sales-Weighted Pricing Audit ({args.days} days)')
    out.append('')
    out.append(f'Window: {cutoff} to {datetime.now(timezone.utc).strftime("%Y-%m-%d")}')
    out.append(f'Total revenue: **${total_revenue:,.2f}**')
    out.append(f'Total units: {total_units}')
    out.append(f'Active products with >=1 sale: {sum(1 for r in rows if r["units_sold"] > 0)}')
    out.append(f'Active products with 0 sales: {sum(1 for r in rows if r["units_sold"] == 0)}')
    out.append('')

    # Category breakdown
    out.append('## Revenue by productType')
    out.append('')
    out.append('| productType | revenue | units | avg price |')
    out.append('| --- | ---:| ---:| ---:|')
    for cat, rev in by_cat_revenue.most_common():
        units = by_cat_units[cat]
        n = sum(1 for r in rows if r['productType'] == cat)
        avg_p = rev / units if units else 0
        out.append(f'| {cat} | ${rev:,.2f} | {units} | ${avg_p:.2f} |')
    out.append('')

    # Pareto
    out.append('## Pareto analysis')
    out.append('')
    out.append(f'Top 20% of products ({top20_count} of {len(rows)}): ${top20_revenue:,.2f} '
               f'= {top20_revenue/total_revenue*100 if total_revenue else 0:.1f}% of revenue')
    out.append('')
    out.append('### Top 20 revenue-generating products')
    out.append('')
    out.append('| handle | productType | units | revenue | price |')
    out.append('| --- | --- | ---:| ---:| ---:|')
    for r in sorted_by_rev[:20]:
        out.append(f'| `{r["handle"]}` | {r["productType"]} | {r["units_sold"]} | ${r["revenue"]:,.2f} | ${r["price"]:.2f} |')
    out.append('')

    # Overpriced candidates
    out.append('## Overpriced candidates (high price + 0 sales)')
    out.append('')
    out.append(f'{len(overpriced)} products priced >$100 with no sales in last {args.days} days.')
    out.append('Top 30:')
    out.append('')
    out.append('| handle | productType | price |')
    out.append('| --- | --- | ---:|')
    for r in sorted(overpriced, key=lambda x: -x['price'])[:30]:
        out.append(f'| `{r["handle"]}` | {r["productType"]} | ${r["price"]:.2f} |')
    out.append('')

    # Underpriced candidates
    out.append('## Underpriced candidates (low price + high volume)')
    out.append('')
    out.append(f'{len(underpriced)} products priced <$50 with >=10 units sold.')
    out.append('Top 30:')
    out.append('')
    out.append('| handle | productType | units | price |')
    out.append('| --- | --- | ---:| ---:|')
    for r in sorted(underpriced, key=lambda x: -x['units_sold'])[:30]:
        out.append(f'| `{r["handle"]}` | {r["productType"]} | {r["units_sold"]} | ${r["price"]:.2f} |')
    out.append('')

    Path(args.out_md).write_text('\n'.join(out), encoding='utf-8')
    print(f'\nCSV: {args.out_csv}')
    print(f'Markdown: {args.out_md}')


if __name__ == '__main__':
    main()