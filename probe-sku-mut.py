"""Find SKU mutation."""
import json, sys
sys.path.insert(0, r'E:\puchica-storefront\scripts\lib')
from shopify_admin import ShopifyAdmin

with ShopifyAdmin() as s:
    # Schema-level mutation search
    d = s.gql('''
    {
      __schema {
        mutationType {
          fields {
            name
            args { name type { name kind ofType { name } } }
            type { name }
          }
        }
      }
    }
    ''')
    fields = (((d.get('__schema') or {}).get('mutationType') or {}).get('fields') or [])
    sku_related = [f for f in fields if 'sku' in f['name'].lower() or 'variant' in f['name'].lower()]
    for f in sku_related:
        args = ', '.join(a['name'] for a in f['args'])
        print(f"{f['name']}({args}) -> {f['type'].get('name')}")