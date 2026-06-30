import sys
sys.path.insert(0, r'E:\puchica-storefront\scripts\lib')
from shopify_admin import ShopifyAdmin

with ShopifyAdmin() as s:
    # Get sexual-wellness collection
    d = s.gql('{ collections(first: 1, query: "handle:sexual-wellness") { nodes { id handle title } } }')
    col = d['collections']['nodes'][0]
    cid = col['id']

    # Get products in collection - first page
    d2 = s.gql('''
    query($cid: ID!) {
      collection(id: $cid) {
        products(first: 5) {
          pageInfo { hasNextPage endCursor }
          nodes { handle productType }
        }
      }
    }
    ''', {'cid': cid})
    prods = d2['collection']['products']
    print(f'{col["title"]} products:')
    for p in prods['nodes'][:5]:
        print(f"  {p['handle']} (type={p['productType']})")
    print(f'hasNextPage: {prods["pageInfo"]["hasNextPage"]}')

    # Get intimate-care
    d = s.gql('{ collections(first: 1, query: "handle:intimate-care") { nodes { id } } }')
    cid = d['collections']['nodes'][0]['id']
    d2 = s.gql('''
    query($cid: ID!) {
      collection(id: $cid) {
        products(first: 5) {
          pageInfo { hasNextPage endCursor }
          nodes { handle productType }
        }
      }
    }
    ''', {'cid': cid})
    prods = d2['collection']['products']
    print(f'\nIntimate Care products:')
    for p in prods['nodes'][:5]:
        print(f"  {p['handle']} (type={p['productType']})")
    print(f'hasNextPage: {prods["pageInfo"]["hasNextPage"]}')