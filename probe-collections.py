import sys
sys.path.insert(0, r'E:\puchica-storefront\scripts\lib')
from shopify_admin import ShopifyAdmin
with ShopifyAdmin() as s:
    d = s.gql('{ collections(first: 30) { nodes { handle title } } }')
    for c in d['collections']['nodes']:
        print(f"  {c['handle']:30s} {c['title']}")