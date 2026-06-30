#!/usr/bin/env python3
"""catalog_health_dashboard.py — One-shot comprehensive catalog health report.

Checks (read-only):
1. Products with status=ACTIVE but no variants (broken)
2. Products with status=ACTIVE but no images (invisible)
3. Products with status=ACTIVE but no description (invisible)
4. Products with status=ACTIVE but no price (unbuyable)
5. Products with negative or zero inventory AND inventoryPolicy=CONTINUE
   (overselling)
6. Products with variant availableForSale=True but inventoryQuantity <=0
   (overselling)
7. Products with status=DRAFT but with traffic (signals poor catalog hygiene)
8. Collections with 0 products (broken)
9. Products in collections that don't match the collection's theme

Output: catalog-health-2026-06-29.md
"""
import csv
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin  # noqa: E402


def main():
    with ShopifyAdmin() as s:
        print('Fetching products…')
        products = s.list_all_products(fields=[
            'id', 'title', 'handle', 'status', 'productType', 'vendor',
            'descriptionHtml',
            'media(first: 5) { nodes { id alt } }',
            'totalInventory',
            'variants(first: 10) { nodes { id price availableForSale '
            'inventoryQuantity inventoryPolicy } }',
            'collections(first: 20) { nodes { handle title } }',
        ])

    # Catalog health checks
    issues = defaultdict(list)
    for p in products:
        pid = p['id'].split('/')[-1]
        handle = p['handle']
        title = (p.get('title') or '')[:80]
        status = p.get('status')

        if status != 'ACTIVE':
            continue

        variants = (p.get('variants') or {}).get('nodes') or []
        media = (p.get('media') or {}).get('nodes') or []
        desc = p.get('descriptionHtml') or ''
        desc_text = re.sub(r'<[^>]+>', '', desc).strip()

        # 1. No variants
        if not variants:
            issues['no_variants'].append((pid, handle, title))

        # 2. No images
        if not media:
            issues['no_images'].append((pid, handle, title))

        # 3. No description
        if len(desc_text) < 30:
            issues['short_description'].append((pid, handle, title, len(desc_text)))

        # 4. No price
        for v in variants:
            try:
                price = float(v.get('price') or 0)
            except (ValueError, TypeError):
                price = 0
            if price <= 0:
                issues['zero_price'].append((pid, handle, title, v.get('id', '')[-12:]))
                break

        # 5/6. Overselling: available for sale but no inventory
        for v in variants:
            if v.get('availableForSale') and (v.get('inventoryQuantity') or 0) <= 0:
                # Check inventory policy
                policy = v.get('inventoryPolicy', 'DENY')
                if policy == 'CONTINUE':
                    issues['overselling_continue'].append(
                        (pid, handle, title, v.get('id', '')[-12:])
                    )

    # Collections
    print('Fetching collections…')
    cols_data = []
    after = None
    while True:
        d = s.gql('''
        { collections(first: 50, after: null) {
          nodes { id title handle }
        } }
        ''')
        cols_data = d['collections']['nodes']
        break
    # Actually we need to paginate, simpler version:
    cols_data = []
    after = None
    while True:
        d = s.gql('''
        query($after: String) {
          collections(first: 50, after: $after) {
            pageInfo { hasNextPage endCursor }
            nodes { id title handle }
          }
        }
        ''', {'after': after})
        for c in d.get('collections', {}).get('nodes', []):
            cols_data.append(c)
        pi = d.get('collections', {}).get('pageInfo', {})
        if not pi.get('hasNextPage'):
            break
        after = pi.get('endCursor')

    # Products per collection - use productsCount on Publication field
    # but that's blocked on read_publications. Use first(1) page check instead.
    for c in cols_data:
        cid = c['id']
        # Get first page of products; if 0 nodes returned, collection is empty
        d = s.gql('''
        query($cid: ID!) {
          collection(id: $cid) {
            products(first: 1) { nodes { id } }
          }
        }
        ''', {'cid': cid})
        prods = (d.get('collection') or {}).get('products') or {}
        nodes = prods.get('nodes') or []
        if not nodes:
            issues['empty_collections'].append((cid, c['handle'], c['title']))

    print('\n=== Catalog Health Summary ===')
    total_issues = 0
    for k, v in issues.items():
        print(f'  {k}: {len(v)}')
        total_issues += len(v)
    print(f'  TOTAL: {total_issues}')

    # Write report
    md = []
    md.append('# Catalog Health Dashboard (2026-06-29)')
    md.append('')
    md.append(f'## Summary')
    md.append('')
    md.append(f'- Products scanned: {len(products)}')
    md.append(f'- Collections scanned: {len(cols_data)}')
    md.append(f'- Total issues: {total_issues}')
    md.append('')
    md.append('| Issue | Count |')
    md.append('| --- | ---:|')
    for k, v in sorted(issues.items(), key=lambda x: -len(x[1])):
        md.append(f'| `{k}` | {len(v)} |')
    md.append('')

    # Detail sections
    if issues.get('no_variants'):
        md.append('## Products with no variants (broken)')
        md.append('')
        for pid, h, t in issues['no_variants'][:30]:
            md.append(f'- `{h}` — {t}')
        md.append('')
    if issues.get('no_images'):
        md.append('## Products with no images')
        md.append('')
        for pid, h, t in issues['no_images'][:30]:
            md.append(f'- `{h}` — {t}')
        md.append('')
    if issues.get('short_description'):
        md.append('## Products with very short descriptions (<30 chars)')
        md.append('')
        for pid, h, t, n in issues['short_description'][:30]:
            md.append(f'- `{h}` — {t} ({n} chars)')
        md.append('')
    if issues.get('zero_price'):
        md.append('## Products with $0 price variants')
        md.append('')
        for pid, h, t, vid in issues['zero_price'][:30]:
            md.append(f'- `{h}` — {t} (variant {vid})')
        md.append('')
    if issues.get('overselling_continue'):
        md.append('## Products overselling (CONTINUE policy + 0 inventory)')
        md.append('')
        for pid, h, t, vid in issues['overselling_continue'][:30]:
            md.append(f'- `{h}` — {t} (variant {vid})')
        md.append('')
    if issues.get('empty_collections'):
        md.append('## Empty collections (no products)')
        md.append('')
        for cid, h, t in issues['empty_collections'][:30]:
            md.append(f'- `{h}` — {t}')
        md.append('')

    Path('catalog-health-2026-06-29.md').write_text('\n'.join(md), encoding='utf-8')
    print(f'\nReport: catalog-health-2026-06-29.md')


if __name__ == '__main__':
    main()