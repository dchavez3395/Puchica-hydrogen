import json, time, urllib.request, urllib.error

# Read client_secret from .env
with open('.env') as f:
    for line in f:
        if 'SHOPIFY_ADMIN_CLIENT_SECRET' in line and not line.strip().startswith('#'):
            key, _, val = line.partition('=')
            secret = val.strip()
            break

print(f'Secret length: {len(secret)}, prefix: {secret[:6]}, suffix: {secret[-6:]}')

body = (
    'grant_type=client_credentials'
    '&client_id=ddf2d9f5043ddfb4a2baedef8d7a34e5'
    '&client_secret=' + secret
)
req = urllib.request.Request('https://ug91ve-sz.myshopify.com/admin/oauth/access_token',
    data=body.encode('utf-8'), method='POST',
    headers={'Content-Type': 'application/x-www-form-urlencoded'})
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.loads(r.read())
        print('SUCCESS:')
        print(json.dumps(data, indent=2))
        data['expires_at'] = int(time.time()) + data.get('expires_in', 86399)
        with open('.shopify-admin-token', 'w', encoding='utf-8') as f:
            f.write(json.dumps(data, indent=2))
        print('Token saved')
except urllib.error.HTTPError as e:
    print(f'HTTP {e.code}')
    body_bytes = e.read()
    try:
        text = body_bytes.decode('utf-8')
    except UnicodeDecodeError:
        text = body_bytes.decode('latin-1', errors='replace')
    # Show the actual error message embedded in HTML
    import re
    m = re.search(r'content--desc-large">([^<]+)</p>', text)
    if m:
        print(f'Error: {m.group(1)}')
    m2 = re.search(r'<h3>What happened\?</h3>\s*<div[^>]*>([^<]+)', text)
    if m2:
        print(f'  What: {m2.group(1)[:300]}')
    print(f'(Raw 500 chars: {text[:500]!r})')