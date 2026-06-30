"""sales_channels_audit_v3.py — Use Publication.products connection directly.

Schema: Publication.products is ProductConnection (paginated).
For each publication, fetch product count by iterating pages.
"""
import json, sys, time
from pathlib import Path
sys.path.insert(0, r'E:\puchica-storefront\scripts\lib')
from shopify_admin import ShopifyAdmin

with ShopifyAdmin() as s:
    # All publications
    pubs = []
    after = None
    while True:
        d = s.gql('''
        query($after: String) {
          publications(first: 50, after: $after) {
            pageInfo { hasNextPage endCursor }
            edges { node { id name } }
          }
        }
        ''', {'after': after})
        for e in (d.get('publications') or {}).get('edges', []):
            pubs.append(e['node'])
        pi = (d.get('publications') or {}).get('pageInfo', {})
        if not pi.get('hasNextPage'):
            break
        after = pi.get('endCursor')

    print(f'Publications: {len(pubs)}')

    # For each, count products via the products connection
    pub_data = []
    for p in pubs:
        pid = p['id']
        name = p.get('name', '')
        count = 0
        after = None
        while True:
            try:
                d = s.gql('''
                query($id: ID!, $after: String) {
                  publication(id: $id) {
                    products(first: 100, after: $after) {
                      pageInfo { hasNextPage endCursor }
                      edges { node { id } }
                    }
                  }
                }
                ''', {'id': pid, 'after': after})
                pub = d.get('publication') or {}
                prods = pub.get('products') or {}
                edges = prods.get('edges') or []
                count += len(edges)
                pi = prods.get('pageInfo') or {}
                if not pi.get('hasNextPage'):
                    break
                after = pi.get('endCursor')
            except Exception as e:
                count = f'ERR: {str(e)[:50]}'
                break
        pub_data.append({'name': name, 'count': count})

    out_path = Path('sales-channels-with-counts-2026-06-29.md')
    out = ['# Sales Channels — With Product Counts (2026-06-29)\n']
    out.append('| Name | Products |')
    out.append('| --- | ---:|')
    for p in sorted(pub_data, key=lambda x: -1 if isinstance(x['count'], str) else -x['count']):
        out.append(f"| {p['name']} | {p['count']} |")
    out_path.write_text('\n'.join(out), encoding='utf-8')
    print(f'\nReport: {out_path}')