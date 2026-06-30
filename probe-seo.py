import sys
sys.path.insert(0, r'E:\puchica-storefront\scripts\lib')
from shopify_admin import ShopifyAdmin
with ShopifyAdmin() as s:
    prods = s.list_all_products(fields=['id', 'title', 'handle', 'seo { title description }'])
    print(f'Total: {len(prods)}')
    no_title = sum(1 for p in prods if not (p.get('seo') or {}).get('title'))
    no_desc = sum(1 for p in prods if not (p.get('seo') or {}).get('description'))
    print(f'No seo.title: {no_title}')
    print(f'No seo.description: {no_desc}')
    # Sample first 5 with no SEO
    for p in prods:
        seo = p.get('seo') or {}
        if not seo.get('title'):
            print(f"  Sample missing title: {p['handle']}: {seo}")
            break