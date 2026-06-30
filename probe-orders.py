"""Probe orders data — see what's actually there."""
import sys
sys.path.insert(0, r'E:\puchica-storefront\scripts\lib')
from shopify_admin import ShopifyAdmin

with ShopifyAdmin() as s:
    # Try various queries
    print('orders (any status):')
    d = s.gql('{ orders(first: 5) { edges { node { id name createdAt displayFinancialStatus displayFulfillmentStatus } } } }')
    import json
    edges = (d.get('orders') or {}).get('edges') or []
    print(f'  count: {len(edges)}')
    for e in edges:
        print(f'  {json.dumps(e["node"])}')

    print('\norders (financial_status:paid):')
    d = s.gql('{ orders(first: 5, query: "financial_status:paid") { edges { node { id name createdAt } } } }')
    edges = (d.get('orders') or {}).get('edges') or []
    print(f'  count: {len(edges)}')
    for e in edges:
        print(f'  {json.dumps(e["node"])}')

    print('\norders (any, last 30 days):')
    d = s.gql('{ orders(first: 5, query: "created_at:>=2026-06-01") { edges { node { id name createdAt displayFinancialStatus } } } }')
    edges = (d.get('orders') or {}).get('edges') or []
    print(f'  count: {len(edges)}')
    for e in edges:
        print(f'  {json.dumps(e["node"])}')

    print('\norders (created_at>=2024-01-01):')
    d = s.gql('{ orders(first: 5, query: "created_at:>=2024-01-01") { edges { node { id name createdAt } } } }')
    edges = (d.get('orders') or {}).get('edges') or []
    print(f'  count: {len(edges)}')
    for e in edges:
        print(f'  {json.dumps(e["node"])}')