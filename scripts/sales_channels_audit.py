"""sales_channels_audit_publications.py — Per-channel product counts.

Uses read_publications scope to count products published to each
channel.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin  # noqa: E402


def main():
    with ShopifyAdmin() as s:
        d = s.gql('''
        {
          publications(first: 50) {
            edges {
              node {
                id
                name
                app { id }
                catalog { id title }
              }
            }
          }
        }
        ''')
        publications = (d.get('publications') or {}).get('edges') or []
        if not publications:
            print('No publications returned (scope?)')
            return

        # Fetch product counts for each publication via Publication.productsCount
        rows = []
        for e in publications:
            pub = e['node']
            pid = pub['id']
            try:
                cnt = s.gql(f'''
                query($id: ID!) {{
                  publication(id: $id) {{
                    productsCount {{ count }}
                  }}
                }}
                ''', {'id': pid})
                count = (((cnt.get('publication') or {}).get('productsCount')) or {}).get('count', '?')
            except Exception as e:
                count = f'ERR: {str(e)[:50]}'
            rows.append({
                'id': pid,
                'name': pub.get('name', ''),
                'catalog': (pub.get('catalog') or {}).get('title', ''),
                'products': count,
            })

    print(f'Total publications: {len(rows)}')
    md = ['# Sales Channels — With Publication Counts (2026-06-29)\n']
    md.append('| Name | Catalog | Products |')
    md.append('| --- | --- | ---:|')
    for r in rows:
        md.append(f"| {r['name']} | {r['catalog']} | {r['products']} |")
    Path('sales-channels-with-counts-2026-06-29.md').write_text(
        '\n'.join(md), encoding='utf-8')
    print('Report: sales-channels-with-counts-2026-06-29.md')


if __name__ == '__main__':
    main()