import sys
sys.path.insert(0, r'E:\puchica-storefront\scripts\lib')
from shopify_admin import ShopifyAdmin
with ShopifyAdmin() as s:
    d = s.gql('{ products(first: 1) { edges { node { id handle seo { description } } } } }')
    p = d['products']['edges'][0]['node']
    handle = p['handle']
    desc = p['seo']['description'] or ''
    print('product:', handle)
    print('seo.description len:', len(desc))
    print('seo.description:', repr(desc[:200]))