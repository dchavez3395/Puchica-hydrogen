"""Try REST PUT variant to update SKU."""
import json, sys
sys.path.insert(0, r'E:\puchica-storefront\scripts\lib')
from shopify_admin import ShopifyAdmin

with ShopifyAdmin() as s:
    # Try REST PUT variant
    # Get a variant id first
    d = s.gql('{ products(first: 1) { edges { node { variants(first: 1) { edges { node { id sku } } } } } } }')
    edges = (((d.get('products') or {}).get('edges') or [])[0].get('node').get('variants') or {}).get('edges') or []
    if not edges:
        print('No variants')
        sys.exit(1)
    v = edges[0]['node']
    vid = v['id'].split('/')[-1]
    old_sku = v.get('sku') or ''
    print(f'Test variant id: {vid}, current SKU: {old_sku!r}')

    # Try REST PUT to update sku
    try:
        r = s.rest_put(f'variants/{vid}.json', {'variant': {'sku': 'TEST-SKU-123'}})
        print(f'PUT result: {json.dumps(r, indent=2)[:500]}')
    except Exception as e:
        print(f'PUT failed: {str(e)[:200]}')