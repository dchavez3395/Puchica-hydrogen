"""probe-alt-progress.py — Check how many products now have alt text."""
import sys
sys.path.insert(0, r'E:\puchica-storefront\scripts\lib')
from shopify_admin import ShopifyAdmin

with ShopifyAdmin() as s:
    prods = s.list_all_products(fields=[
        'id', 'handle', 'media(first: 20) { nodes { alt } }'
    ])
    total_images = 0
    with_alt = 0
    without_alt = 0
    products_with_gaps = 0
    sample_missing = []
    for p in prods:
        media = (p.get('media') or {}).get('nodes') or []
        product_has_missing = False
        for m in media:
            total_images += 1
            if m.get('alt'):
                with_alt += 1
            else:
                without_alt += 1
                product_has_missing = True
                if len(sample_missing) < 5:
                    sample_missing.append((p['handle'], m.get('id', '')[-12:]))
        if product_has_missing:
            products_with_gaps += 1

    print(f'Total products sampled: {len(prods)}')
    print(f'Products with at least one image missing alt: {products_with_gaps}')
    print(f'Total images: {total_images}')
    print(f'  With alt: {with_alt}')
    print(f'  Without alt: {without_alt}')
    print(f'\nFirst few still-missing:')
    for h, mid in sample_missing:
        print(f'  {h:50s} {mid}')