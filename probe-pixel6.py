"""Check if the product exists on the Hydrogen storefront (not Online Store)."""
import sys
sys.path.insert(0, r'E:\puchica-storefront\scripts\lib')
from shopify_admin import ShopifyAdmin

with ShopifyAdmin() as s:
    # Try to find via search across all products including drafts
    d = s.gql('''
    query {
      products(first: 5, query: "title:*vintage*blue*pixel*", sortKey: TITLE) {
        nodes { id title handle status productType vendor }
      }
    }
    ''')
    print('Search for vintage*blue*pixel*:')
    import json
    print(json.dumps(d, indent=2)[:3000])