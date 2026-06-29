#!/usr/bin/env python3
"""orders_rest_probe.py — Try the REST /orders.json endpoint to see if
it works where GraphQL orders is access-denied.

Different endpoints sometimes have different scope behavior. If REST
works, we can build cross-sell on top of it without expanding OAuth.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin  # noqa: E402


def main():
    with ShopifyAdmin() as s:
        # Try REST
        try:
            r = s.rest_get('orders.json', {'limit': 5, 'status': 'any',
                                          'financial_status': 'paid'})
            orders = r.get('orders', [])
            print(f'REST /orders.json: SUCCESS — got {len(orders)} orders')
            if orders:
                sample = orders[0]
                print('Sample order keys:', list(sample.keys())[:15])
                print(f'Sample order id: {sample.get("id")}, name: {sample.get("name")}, '
                      f'created_at: {sample.get("created_at")}')
                if 'line_items' in sample:
                    print(f'Line items: {len(sample["line_items"])}')
        except Exception as e:
            print(f'REST /orders.json: FAILED — {e}')

        # Try GraphQL orders with different field selection
        try:
            d = s.gql('''
            {
              orders(first: 1, sortKey: CREATED_AT, reverse: true) {
                edges { node { id name } }
              }
            }
            ''')
            print(f'GraphQL orders: SUCCESS — {len((d.get("orders") or {}).get("edges") or [])} orders')
        except Exception as e:
            print(f'GraphQL orders: FAILED — {str(e)[:200]}')


if __name__ == '__main__':
    main()