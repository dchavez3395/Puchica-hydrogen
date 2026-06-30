#!/usr/bin/env python3
"""variant_sku_audit.py — Audit product variant SKUs for cleanliness.

Clean SKUs are essential for:
- Inventory tracking
- Fulfillment automation
- Reporting by SKU
- Returns processing

Patterns to flag:
- Empty SKUs (variant.sku == '')
- Duplicates within same product (two variants same SKU)
- Cross-product duplicates (same SKU used on different products)
- Special chars / spaces in SKU
- Overly long SKUs (>50 chars)

Output: variant-sku-audit-{date}.md + .csv
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
        print('Fetching products with variants…')
        products = s.list_all_products(fields=[
            'id', 'title', 'handle', 'vendor', 'status', 'productType',
            'variants(first: 10) { nodes { id sku price } }',
        ])

    # Issues
    issues = defaultdict(list)
    total_variants = 0
    sku_index = defaultdict(list)  # sku -> list of (product_id, variant_id, title)
    product_count = 0

    for p in products:
        if p.get('status') != 'ACTIVE':
            continue
        product_count += 1
        variants = (p.get('variants') or {}).get('nodes') or []
        seen_skus_in_product = set()
        for v in variants:
            total_variants += 1
            sku = (v.get('sku') or '').strip()
            vid = v['id'].split('/')[-1]
            pid = p['id'].split('/')[-1]

            # Empty SKU
            if not sku:
                issues['empty_sku'].append({
                    'product_id': pid, 'variant_id': vid,
                    'product_handle': p['handle'], 'product_title': (p.get('title') or '')[:50],
                    'price': v.get('price'),
                })
                continue

            # Special chars / spaces
            if not re.match(r'^[A-Za-z0-9._-]+$', sku):
                issues['special_chars'].append({
                    'sku': sku, 'variant_id': vid,
                    'product_handle': p['handle'],
                    'product_title': (p.get('title') or '')[:50],
                })

            # Length
            if len(sku) > 50:
                issues['too_long'].append({
                    'sku': sku, 'length': len(sku),
                    'variant_id': vid, 'product_handle': p['handle'],
                })

            # Duplicate within same product
            if sku in seen_skus_in_product:
                issues['dup_within_product'].append({
                    'sku': sku, 'product_id': pid,
                    'product_handle': p['handle'],
                })
            seen_skus_in_product.add(sku)

            # Cross-product index
            sku_index[sku].append({
                'product_id': pid, 'variant_id': vid,
                'product_handle': p['handle'],
                'product_title': (p.get('title') or '')[:50],
            })

    # Find cross-product duplicates
    for sku, refs in sku_index.items():
        if len(refs) > 1:
            # Only flag if on different products (not just same product)
            distinct_pids = set(r['product_id'] for r in refs)
            if len(distinct_pids) > 1:
                issues['cross_product_dup'].append({
                    'sku': sku, 'count': len(refs), 'products': refs[:5],
                })

    print(f'\n=== Variant SKU Audit ===')
    print(f'Products: {product_count}')
    print(f'Variants: {total_variants}')
    for k, v in sorted(issues.items(), key=lambda x: -len(x[1])):
        print(f'  {k}: {len(v)}')

    out_csv = Path('variant-sku-audit-2026-06-29.csv')
    with out_csv.open('w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['issue', 'sku', 'product_id', 'variant_id', 'product_handle', 'product_title', 'price', 'extra'])
        for k, items in issues.items():
            for it in items:
                if k == 'cross_product_dup':
                    for ref in it['products']:
                        writer.writerow([k, it['sku'], ref['product_id'], ref['variant_id'],
                                          ref['product_handle'], ref['product_title'], '', ''])
                elif k == 'empty_sku':
                    writer.writerow([k, '', it['product_id'], it['variant_id'],
                                      it['product_handle'], it['product_title'], it['price'], ''])
                elif k == 'special_chars':
                    writer.writerow([k, it['sku'], '', it['variant_id'],
                                      it['product_handle'], it['product_title'], '', ''])
                elif k == 'too_long':
                    writer.writerow([k, it['sku'], '', it['variant_id'],
                                      it['product_handle'], '', it['length'], ''])
                else:
                    writer.writerow([k, it['sku'], it['product_id'], '',
                                      it['product_handle'], '', '', ''])

    # Markdown
    md = []
    md.append('# Variant SKU Audit (2026-06-29)')
    md.append('')
    md.append(f'## Summary')
    md.append('')
    md.append(f'- Active products: {product_count}')
    md.append(f'- Total variants: {total_variants}')
    md.append(f'- Issues:')
    for k, v in sorted(issues.items(), key=lambda x: -len(x[1])):
        md.append(f'  - `{k}`: {len(v)}')
    md.append('')

    if issues.get('empty_sku'):
        md.append('## Products with empty SKUs')
        md.append('')
        md.append('These need SKUs assigned so fulfillment can track them.')
        md.append('')
        md.append('| handle | title | price |')
        md.append('| --- | --- | ---:|')
        for r in issues['empty_sku'][:50]:
            md.append(f"| `{r['product_handle']}` | {r['product_title']} | ${r['price']} |")
        if len(issues['empty_sku']) > 50:
            md.append(f"\n_...and {len(issues['empty_sku']) - 50} more._")
        md.append('')

    if issues.get('cross_product_dup'):
        md.append('## Cross-product duplicate SKUs')
        md.append('')
        md.append('Same SKU used on different products — breaks fulfillment.')
        md.append('')
        md.append('| sku | count | products |')
        md.append('| --- | ---:| --- |')
        for r in issues['cross_product_dup'][:30]:
            handles = ', '.join(f"`{p['product_handle']}`" for p in r['products'][:3])
            md.append(f"| `{r['sku']}` | {r['count']} | {handles} |")
        md.append('')

    if issues.get('special_chars'):
        md.append('## SKUs with special chars (spaces/symbols)')
        md.append('')
        md.append('| sku | handle |')
        md.append('| --- | --- |')
        for r in issues['special_chars'][:30]:
            md.append(f"| `{r['sku']}` | {r['product_handle']} |")
        md.append('')

    Path('variant-sku-audit-2026-06-29.md').write_text('\n'.join(md), encoding='utf-8')
    print(f'\nCSV: {out_csv}')
    print(f'Markdown: variant-sku-audit-2026-06-29.md')


if __name__ == '__main__':
    main()