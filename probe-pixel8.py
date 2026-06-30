import sys
sys.path.insert(0, r'E:\puchica-storefront\scripts\lib')
from shopify_admin import ShopifyAdmin

with ShopifyAdmin() as s:
    products = s.list_all_products(fields=['handle title vendor status'])
    # Look for Pixel products with "Vintage" or "Blue"
    for p in products:
        title = (p.get('title') or '')
        if 'Vintage' in title and 'Pixel' in title:
            print(f"  [{p.get('status')}] {p['handle']}  ->  {title}")
        elif 'Pixel' in title and 'Blue' in title and 'Pro' in title:
            print(f"  [{p.get('status')}] {p['handle']}  ->  {title}")

    print()
    # Also check Pixel products in the storefront channel specifically
    print('--- searching storefront channel ---')
    d = s.gql('''
    query {
      publications(first: 50) {
        edges {
          node {
            id
            name
            catalog { id title productsCount { count } }
          }
        }
      }
    }
    ''')
    import json
    pubs = (d.get('publications') or {}).get('edges') or []
    for e in pubs:
        cat = (e['node'].get('catalog') or {})
        cnt = (cat.get('productsCount') or {}).get('count', '?')
        print(f"  {e['node']['name']}: catalog={cat.get('title', '?')} count={cnt}")