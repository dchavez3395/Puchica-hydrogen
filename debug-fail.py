"""debug-fail.py — Diagnose why fileUpdate is failing."""
import csv
import json
import sys
sys.path.insert(0, r'E:\puchica-storefront\scripts\lib')
from shopify_admin import ShopifyAdmin

with ShopifyAdmin() as s:
    s.token = sys.modules['shopify_admin'].get_valid_token()

    # Read first item
    with open('image-alt-fix-2026-06-29.csv', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        first = next(reader)

    media_id = first['media_id']
    alt = first['new_alt']
    print(f'First item: media_id={media_id}, alt={alt!r}')

    # Try fileUpdate
    res = s.gql_with_meta('''
    mutation fu($input: FileUpdateInput!) {
      fileUpdate(input: $input) {
        file { id alt }
        userErrors { field message }
      }
    }
    ''', {'input': {'id': media_id, 'alt': alt}})
    print('Result:')
    print(json.dumps(res, indent=2, ensure_ascii=False))