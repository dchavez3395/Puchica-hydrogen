#!/usr/bin/env python3
"""order_history_probe.py — Check what order data we have access to.

Quick probe to see:
  1. How many orders total (any timeframe)
  2. Last 30/60/90 day order counts
  3. Sample order shape (what fields are populated)
  4. Whether line items are accessible via GraphQL Admin API

Output: prints counts + sample structure to stdout.
"""
import json
import sys
from pathlib import Path
from datetime import datetime, timedelta, timezone

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin  # noqa: E402


def main():
    with ShopifyAdmin() as s:
        # Total orders via orders(first:1, sortKey:CREATED_AT, reverse:true)
        d = s.gql('''
        {
          orders(first: 1, sortKey: CREATED_AT, reverse: true) {
            edges {
              node {
                id name createdAt
                lineItems(first: 10) {
                  edges {
                    node { title quantity product { id handle } }
                  }
                }
              }
            }
          }
        }
        ''')
        edges = d.get('orders', {}).get('edges', [])
        if edges:
            sample = edges[0]['node']
            print('Sample latest order:')
            print(json.dumps(sample, indent=2)[:2000])

        # Total count (rough): just paginate to last page
        # Faster: query shop info + use orders count via count connection
        d = s.gql('''
        {
          orders(first: 1, query: "created_at:>=2025-01-01") {
            edges { node { id } }
            pageInfo { hasNextPage }
          }
        }
        ''')

        # Use orders count via paginating
        count = 0
        after = None
        while True:
            d = s.gql('''
            query($after: String) {
              orders(first: 100, after: $after, sortKey: CREATED_AT, reverse: true) {
                edges { node { id createdAt displayFinancialStatus displayFulfillmentStatus } }
                pageInfo { hasNextPage endCursor }
              }
            }
            ''', {'after': after})
            edges = d.get('orders', {}).get('edges', [])
            count += len(edges)
            pi = d.get('orders', {}).get('pageInfo', {})
            if not pi.get('hasNextPage'):
                break
            after = pi.get('endCursor')
        print(f'\nTotal orders reachable (paginated, all-time): {count}')

        # Last 30 / 60 / 90 day counts
        now = datetime.now(timezone.utc)
        for days in [7, 30, 60, 90, 180, 365]:
            cutoff = (now - timedelta(days=days)).strftime('%Y-%m-%d')
            d = s.gql(f'''
            {{
              orders(first: 1, query: "created_at:>={cutoff}") {{
                edges {{ node {{ id }} }}
                pageInfo {{ hasNextPage }}
              }}
            }}
            ''')
            edges = d.get('orders', {}).get('edges', [])
            print(f'  Last {days} days (created_at >= {cutoff}): {len(edges)}+ (first page only)')


if __name__ == '__main__':
    main()