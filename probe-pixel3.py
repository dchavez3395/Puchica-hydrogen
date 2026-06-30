import sys
import re
sys.path.insert(0, r'E:\puchica-storefront\scripts\lib')
from shopify_admin import ShopifyAdmin

with ShopifyAdmin() as s:
    products = s.list_all_products(fields=['id handle title vendor'])
    for p in products:
        if 'vintage' in (p.get('title') or '').lower() and 'pixel 9' in (p.get('title') or '').lower():
            print(f"  {p['handle']}  ->  {p['title']}")