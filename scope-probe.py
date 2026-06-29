import sys, json, urllib.request, urllib.error
sys.path.insert(0, r'E:\puchica-storefront\scripts\lib')

# Load token from file
with open('.shopify-admin-token') as f:
    tok_data = json.load(f)
print('Token scope:', tok_data.get('scope'))
print('Expires at:', tok_data.get('expires_at'))
print('Token prefix:', tok_data['access_token'][:15] + '...')
print()

# Test what scopes work
token = tok_data['access_token']
url = 'https://ug91ve-sz.myshopify.com/admin/api/2025-04/graphql.json'
tests = [
    ('shop', '{ shop { name } }'),
    ('orders', '{ orders(first: 1) { edges { node { id } } } }'),
    ('customers', '{ customers(first: 1) { edges { node { id } } } }'),
    ('publications', '{ publications(first: 1) { edges { node { id } } } }'),
    ('abandonedCheckouts', '{ abandonedCheckouts(first: 1) { edges { node { id } } } }'),
]
for label, q in tests:
    body = json.dumps({'query': q}).encode('utf-8')
    req = urllib.request.Request(url, data=body, method='POST',
        headers={'X-Shopify-Access-Token': token, 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            d = json.loads(r.read())
            if 'errors' in d:
                err_msg = d['errors'][0]['message'][:120]
                print(f'  FAIL  {label:20s}: {err_msg}')
            else:
                print(f'  OK    {label:20s}')
    except urllib.error.HTTPError as e:
        print(f'  HTTP {e.code}  {label:20s}')