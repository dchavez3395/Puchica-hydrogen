import sys, json
sys.path.insert(0, r'E:\puchica-storefront\scripts\lib')
from shopify_admin import ShopifyAdmin

with ShopifyAdmin() as s:
    # Use orderConnection or different syntax
    print('Test: orders(sortKey: CREATED_AT, reverse: true) — last 5')
    d = s.gql('{ orders(first: 5, sortKey: CREATED_AT, reverse: true) { edges { node { id name createdAt displayFinancialStatus } } } }')
    print(json.dumps(d, indent=2)[:2000])

    print('\n\nTest: orderCount via appSubscription')
    d = s.gql('{ shop { name } }')
    print(json.dumps(d, indent=2))
