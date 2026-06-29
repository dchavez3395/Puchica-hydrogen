#!/usr/bin/env python3
"""app_diagnostic.py — Identify all custom apps on the store and check
which one matches our client_id.

Tries multiple GraphQL queries to find:
1. The current access token's actual app ID
2. All custom apps on the store
3. Which app's scopes are being granted
"""
import sys, json
sys.path.insert(0, r'E:\puchica-storefront\scripts\lib')
from shopify_admin import ShopifyAdmin, get_valid_token


def main():
    token = get_valid_token()
    s = ShopifyAdmin()
    s.token = token

    queries = [
        ('current app installation',
         '{ appInstallation { id app { id apiKey } } }'),
        ('app installations list (minimal)',
         '{ appInstallations(first: 20) { edges { node { id app { id apiKey } } } } }'),
        ('shop info + plan',
         '{ shop { id name email plan { displayName } } }'),
    ]

    for label, q in queries:
        print(f'\n--- {label} ---')
        try:
            d = s.gql(q)
            print(json.dumps(d, indent=2)[:1500])
        except Exception as e:
            print(f'  FAIL: {str(e)[:200]}')


if __name__ == '__main__':
    main()