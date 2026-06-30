import sys, json
sys.path.insert(0, r'E:\puchica-storefront\scripts\lib')
from shopify_admin import ShopifyAdmin

with ShopifyAdmin() as s:
    products = s.list_all_products(fields=['handle title'])
    matched = [p for p in products if 'vintage' in (p.get('title') or '').lower()][:20]
    for p in matched:
        print(f"  {p['handle']}  ->  {p['title']}")