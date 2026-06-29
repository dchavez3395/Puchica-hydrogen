#!/usr/bin/env python3
"""force_oauth_install.py — Force a fresh OAuth install to pick up new scopes.

The client_credentials grant on this app isn't reflecting new scopes.
This script:
1. Builds the OAuth install URL
2. Documents the steps for Daniel to do the install in a browser
3. Catches the redirect that includes the new access_token
"""
import sys
sys.path.insert(0, r'E:\puchica-storefront\scripts\lib')

CLIENT_ID = 'ddf2d9f5043ddfb4a2baedef8d7a34e5'
SHOP = 'ug91ve-sz.myshopify.com'

# Build install URL with the scopes we need
SCOPES = ','.join([
    'read_products', 'write_products',
    'read_orders',
    'read_customers',
    'read_publications',
    'read_checkouts',
    'read_analytics',
    'read_locations', 'write_files', 'write_inventory',
])

URL = f'https://{SHOP}/admin/oauth/authorize?client_id={CLIENT_ID}&scope={SCOPES}&redirect_uri=https://puchica.ca/callback'

print('=' * 80)
print('OAUTH INSTALL URL (paste into browser):')
print('=' * 80)
print(URL)
print()
print('What happens next:')
print('1. Browser opens the URL above')
print('2. Shopify shows consent screen listing the scopes')
print('3. Click "Install app"')
print('4. Shopify redirects to https://puchica.ca/callback?code=...&shop=...&hmac=...')
print('5. The "code" parameter can be exchanged for an access_token:')
print()
print('Or — simpler — copy the new access_token from:')
print('Shopify admin → Settings → Apps and sales channels → [your app]')
print('→ API credentials → Installs → Latest install → "Reveal token once"')
print()
print('Save it to .shopify-admin-token in this format:')
print()
import json
print(json.dumps({
    'access_token': 'shpat_NEW_TOKEN_HERE',
    'scope': SCOPES,
    'expires_in': 86399,
    'expires_at': 9999999999
}, indent=2))