import sys
sys.path.insert(0, r'E:\puchica-storefront\scripts\lib')
from shopify_admin import ShopifyAdmin

with ShopifyAdmin() as s:
    products = s.list_all_products(fields=['id handle title vendor productType status'])
    print('"blue" + "pixel" + "case" products:')
    for p in products:
        title = (p.get('title') or '').lower()
        if 'blue' in title and 'pixel' in title and 'case' in title and 'pro' in title:
            print(f"  [{p.get('status')}] {p['handle']} -> {p['title']}")