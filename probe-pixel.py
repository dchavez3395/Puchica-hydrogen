import sys
sys.path.insert(0, r'E:\puchica-storefront\scripts\lib')
from shopify_admin import ShopifyAdmin

with ShopifyAdmin() as s:
    products = s.list_all_products(fields=['id handle title vendor productType'])
    for p in products:
        if 'pixel 9' in (p.get('title') or '').lower() and 'case' in (p.get('title') or '').lower():
            print(f"  {p['handle']:50s} {p['title']}")