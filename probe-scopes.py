"""Probe what scopes ACTUALLY work right now."""
import json, sys, urllib.request, urllib.error
sys.path.insert(0, r'E:\puchica-storefront\scripts\lib')
from shopify_admin import get_valid_token

token = get_valid_token()
url = 'https://ug91ve-sz.myshopify.com/admin/api/2025-04/graphql.json'

print('Probing fields against current token...')
tests = [
    ('shop', 'read scope check',
     '{ shop { id name plan { displayName } } }'),
    ('locations', 'read_locations',
     '{ locations(first: 1) { edges { node { id name } } } }'),
    ('products', 'read_products',
     '{ products(first: 1) { edges { node { id title } } } }'),
    ('inventoryItems', 'read_inventory',
     '{ inventoryItems(first: 1) { edges { node { id } } } }'),
    ('files', 'read_files (via theme)',
     '{ themes(first: 1) { edges { node { id name } } } }'),
    ('orders', 'read_orders',
     '{ orders(first: 1) { edges { node { id } } } }'),
    ('customers', 'read_customers',
     '{ customers(first: 1) { edges { node { id } } } }'),
    ('abandonedCheckouts', 'read_checkouts',
     '{ abandonedCheckouts(first: 1) { edges { node { id } } } }'),
    ('publications', 'read_publications',
     '{ publications(first: 1) { edges { node { id } } } }'),
    ('collections', 'no scope needed (admin always has)',
     '{ collections(first: 1) { edges { node { id handle } } } }'),
    ('app installation publication', 'check publication',
     '{ appInstallation { publication { id } } }'),
]

for label, scope_label, q in tests:
    body = json.dumps({'query': q}).encode('utf-8')
    req = urllib.request.Request(url, data=body, method='POST',
        headers={'X-Shopify-Access-Token': token, 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            resp = json.loads(r.read())
            if 'errors' in resp:
                msg = resp['errors'][0]['message']
                if 'Access denied' in msg or 'Required access' in msg:
                    print(f'  DENIED  {label:40s} ({scope_label})')
                else:
                    print(f'  ERR     {label:40s} ({scope_label}): {msg[:80]}')
            else:
                print(f'  OK      {label:40s} ({scope_label})')
    except urllib.error.HTTPError as e:
        print(f'  HTTP {e.code}  {label}')