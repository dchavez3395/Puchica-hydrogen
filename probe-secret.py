import os

# Read from .env directly
with open('.env') as f:
    for line in f:
        if 'SHOPIFY_ADMIN_CLIENT_SECRET' in line and not line.strip().startswith('#'):
            key, _, val = line.partition('=')
            print(f'From .env length: {len(val.strip())}')
            print(f'From .env prefix: {val.strip()[:6]}')
            print(f'From .env suffix: {val.strip()[-6:]}')