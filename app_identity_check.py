"""app_identity_check.py — Print everything we can about the OAuth app
that's issuing our tokens, so we can confirm which one it is."""
import sys, json
sys.path.insert(0, r'E:\puchica-storefront\scripts\lib')
from shopify_admin import get_valid_token, ShopifyAdmin

token = get_valid_token()
s = ShopifyAdmin()
s.token = token

# Print every field we can pull from the app installation
queries = [
    ('current app installation (all fields)',
     '{ appInstallation { id launchUrl app { id apiKey handle } accessScopes { handle } } }'),
    ('shop + plan',
     '{ shop { id name email myshopifyDomain plan { displayName partnerDevelopment } } }'),
]

for label, q in queries:
    print(f'\n=== {label} ===')
    try:
        d = s.gql(q)
        print(json.dumps(d, indent=2))
    except Exception as e:
        print(f'  FAIL: {str(e)[:300]}')

# Also dump the current token metadata
print('\n=== Current token ===')
import time
with open('.shopify-admin-token') as f:
    tok = json.load(f)
print(f'  expires_at: {tok.get("expires_at")}')
print(f'  expires_in_human: {(tok.get("expires_at", 0) - time.time()) / 3600:.1f} hours')
print(f'  scope: {tok.get("scope")}')