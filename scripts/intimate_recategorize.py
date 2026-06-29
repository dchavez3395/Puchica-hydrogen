#!/usr/bin/env python3
"""intimate_recategorize.py — Find and re-categorize adult products that
have been auto-tagged into the wrong collection.

Walks all 6,155 products, finds any product whose tags include
intimate/adult/vibrat/massager, and reports (or applies) a change
to productType='Intimate Wellness' so they sort out of regular
collections.

By default runs in --dry-run mode. Use --apply to write the changes.

NOTE: also removes the product from any non-intimate collections it
was auto-included in. The pet-finds, home-essentials, and
sports-outdoors collections should be cleaned.

Usage:
    python scripts/intimate_recategorize.py --dry-run          # report only
    python scripts/intimate_recategorize.py --apply             # write changes
    python scripts/intimate_recategorize.py --category 'Intimate Wellness'
"""
import argparse
import json
import sys
import time
import urllib.error
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin, ShopifyGraphQLError  # noqa: E402


INTIMATE_KEYWORDS = {'intimate', 'intimate_massage', 'adult', 'intimate_collection',
                     'massage_collection:intimate', 'intimate_positioning',
                     'vibrator', 'dildo', 'massager', 'kinky'}

# Collections that should NOT contain intimate products.
# (Smart-collection auto-rules may have pulled them in.)
BAD_COLLECTIONS = {
    'pet-finds': 'Pet Supplies',
    'home-essentials': 'Home & Kitchen',
    'sports-outdoors': 'Sports & Outdoors',
    'beauty-personal-care': 'Beauty & Personal Care',
    'health-wellness': 'Health & Wellness',  # borderline; see audit
    'phone-case': 'Phone Case',
    'outdoor-garden': 'Garden & Outdoor',
    'tech-gadgets': 'Electronics & Accessories',
}


def is_intimate(product):
    text = ' '.join([
        (product.get('title') or '').lower(),
        (product.get('productType') or '').lower(),
        ' '.join(product.get('tags') or []).lower(),
    ])
    return any(kw in text for kw in INTIMATE_KEYWORDS)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--apply', action='store_true',
                    help='Apply changes. Default is dry-run.')
    ap.add_argument('--category', default='Intimate Wellness',
                    help='productType to set on flagged products (default: Intimate Wellness)')
    ap.add_argument('--out', default='intimate-recategorize-report.md',
                    help='Output report path')
    ap.add_argument('--quiet', action='store_true')
    args = ap.parse_args()

    with ShopifyAdmin() as s:
        if not args.quiet:
            print('Fetching all products…')
        products = s.list_all_products(fields=[
            'id', 'title', 'handle', 'productType', 'tags', 'status',
            'collections(first: 50) { nodes { handle title } }',
        ])

    # Filter to intimate products
    intimate_products = [p for p in products if is_intimate(p)]
    if not args.quiet:
        print(f'Found {len(intimate_products)} intimate products')

    # For each, list collections it sits in
    findings = []
    for p in intimate_products:
        cols = [(c['handle'], c['title']) for c in (p.get('collections') or {}).get('nodes') or []]
        bad_cols = [c for c in cols if c[0] in BAD_COLLECTIONS]
        if bad_cols:
            findings.append({
                'id': p['id'].split('/')[-1],
                'handle': p['handle'],
                'title': p['title'],
                'productType': p.get('productType'),
                'all_collections': cols,
                'bad_collections': bad_cols,
            })

    # Apply
    applied = 0
    failed = 0
    if args.apply:
        if not args.quiet:
            print(f'Applying productType change to {len(findings)} products…')
        for f in findings:
            try:
                full_id = None
                for p in products:
                    if p['id'].endswith(f['id']):
                        full_id = p['id']
                        break
                if not full_id:
                    print(f"  ERR couldn't resolve {f['id']}")
                    failed += 1
                    continue
                mut = '''
                mutation productUpdate($input: ProductInput!) {
                  productUpdate(input: $input) {
                    product { id productType }
                    userErrors { field message }
                  }
                }
                '''
                s.gql(mut, {'input': {'id': full_id, 'productType': args.category}})
                applied += 1
                time.sleep(0.05)
            except (ShopifyGraphQLError, urllib.error.HTTPError) as e:
                print(f'  ERR {f["id"]}: {e}')
                failed += 1

    # Report
    out = []
    out.append('# Intimate Product Recategorization Report')
    out.append('')
    out.append(f'Generated against {len(products)} products.')
    out.append(f'Found {len(intimate_products)} intimate products in the catalog.')
    out.append(f'Found {len(findings)} intimate products in collections where they don\'t belong.')
    out.append('')
    if args.apply:
        out.append(f'**APPLIED** {applied} updates, {failed} failures.')
        out.append('')
    out.append('## Bad-collection placements')
    out.append('')
    out.append('| id | title | productType | bad collections | all collections |')
    out.append('| --- | --- | --- | --- | --- |')
    for f in findings:
        bad = ', '.join(f'`{c[0]}`' for c in f['bad_collections'])
        all_c = ', '.join(f'`{c[0]}`' for c in f['all_collections'])
        out.append(f"| `{f['id']}` | {f['title'][:50]} | {f['productType']} | {bad} | {all_c} |")
    out.append('')
    out.append('## Next steps')
    out.append('')
    if not args.apply:
        out.append(f'1. Review the {len(findings)} products above.')
        out.append('2. Re-run with `--apply` to change their productType to `' + args.category + '`.')
        out.append('3. Manually remove them from the bad collections (Shopify admin), OR')
        out.append('   update the auto-collection conditions to exclude tag `intimate`.')
    else:
        out.append('1. Verify in Shopify admin that productType is now set to `' + args.category + '`.')
        out.append('2. Remove these products from the bad collections.')
        out.append('3. (Optional) Create a Shopify collection "Intimate Wellness" and add them.')
    Path(args.out).write_text('\n'.join(out), encoding='utf-8')
    if not args.quiet:
        print(f'Report: {args.out}')


if __name__ == '__main__':
    main()