"""debug-fail2.py — Try correct fileUpdate signature."""
import csv
import json
import sys
sys.path.insert(0, r'E:\puchica-storefront\scripts\lib')
from shopify_admin import ShopifyAdmin

with ShopifyAdmin() as s:
    s.token = sys.modules['shopify_admin'].get_valid_token()

    with open('image-alt-fix-2026-06-29.csv', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        first = next(reader)

    media_id = first['media_id']
    alt = first['new_alt']
    print(f'Testing media_id={media_id}, alt={alt!r}')

    # Correct shape: files is an array, response is files (plural)
    res = s.gql_with_meta('''
    mutation fu($files: [FileUpdateInput!]!) {
      fileUpdate(files: $files) {
        files { id alt }
        userErrors { field message }
      }
    }
    ''', {'files': [{'id': media_id, 'alt': alt}]})
    print('Result:')
    print(json.dumps(res, indent=2, ensure_ascii=False))