import sys
import re
sys.path.insert(0, r'E:\puchica-storefront\scripts\lib')
from shopify_admin import ShopifyAdmin

handle = 'vintage-blue-google-pixel-9-pro-case'
with ShopifyAdmin() as s:
    d = s.gql('{ productByHandle(handle: "' + handle + '") { id title handle descriptionHtml vendor productType tags variants(first:1){nodes{price}} media(first:20){nodes{id alt mediaContentType}} } }')
    p = d.get('productByHandle')
    if not p:
        print(f'Not found: {handle}')
    else:
        print(f"Title: {p['title']}")
        print(f"Vendor: {p.get('vendor')}")
        print(f"productType: {p.get('productType')}")
        print(f"Tags: {p.get('tags')[:5]}...")
        variants = (p.get('variants') or {}).get('nodes') or []
        print(f"Price: {variants[0].get('price') if variants else 'n/a'}")
        print()
        desc = p.get('descriptionHtml') or ''
        text = re.sub(r'<[^>]+>', ' ', desc)
        text = re.sub(r'\s+', ' ', text).strip()
        print('Description:')
        print(text[:2000])
        print()
        media = (p.get('media') or {}).get('nodes') or []
        print(f'Media: {len(media)} items')
        for i, m in enumerate(media[:8]):
            print(f"  [{i}] {m.get('mediaContentType')}: alt={m.get('alt')!r}")
