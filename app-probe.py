import sys, json, urllib.request, urllib.error
sys.path.insert(0, r'E:\puchica-storefront\scripts\lib')
from shopify_admin import get_valid_token
token = get_valid_token()
q = '''{ apps(first: 20) { edges { node { id name apiKey } } } }'''
body = json.dumps({'query': q}).encode('utf-8')
req = urllib.request.Request('https://ug91ve-sz.myshopify.com/admin/api/2025-04/graphql.json',
    data=body, method='POST',
    headers={'X-Shopify-Access-Token': token, 'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        d = json.loads(r.read())
        apps = (d.get('apps') or {}).get('edges') or []
        for e in apps:
            n = e['node']
            ak = n.get('apiKey') or 'no-key'
            print(f'{ak[:50]:50s} {n.get("name", "?")}')
        if not apps:
            print('No apps returned')
            print(json.dumps(d, indent=2))
except urllib.error.HTTPError as e:
    print(f'HTTP {e.code}: {e.read().decode()}')