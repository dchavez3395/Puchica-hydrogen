import sys
sys.path.insert(0, r'E:\puchica-storefront\scripts\lib')
from shopify_admin import ShopifyAdmin

with ShopifyAdmin() as s:
    products = s.list_all_products(fields=['handle title vendor tags productType'])
    # Search all "vintage blue" titles
    matched = [p for p in products if 'vintage' in (p.get('title') or '').lower()
                                  and 'blue' in (p.get('title') or '').lower()
                                  and 'pixel' in (p.get('title') or '').lower()]
    print(f'Total Vintage Blue Pixel: {len(matched)}')
    for p in matched[:20]:
        print(f"  {p['handle']}  ->  {p['title']}")
