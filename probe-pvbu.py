"""Probe the correct schema for productVariantsBulkUpdate."""
import json, sys
sys.path.insert(0, r'E:\puchica-storefront\scripts\lib')
from shopify_admin import ShopifyAdmin

with ShopifyAdmin() as s:
    # Get the schema info for ProductVariantsBulkInput
    d = s.gql('''
    {
      __type(name: "ProductVariantsBulkInput") {
        name
        inputFields {
          name
          type { name kind ofType { name kind } }
        }
      }
    }
    ''')
    print(json.dumps(d, indent=2))