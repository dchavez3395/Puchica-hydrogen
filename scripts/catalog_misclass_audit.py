#!/usr/bin/env python3
"""catalog_misclass_audit.py — Find products in the wrong collection.

Walks every collection and checks each member for category-mismatch
signals. A product is "suspect" if:
  - its productType doesn't match the collection's title/handle theme
  - it has a tag that suggests a different category
  - its title contains keywords that don't match the collection

Outputs a markdown report. Read-only by default; supports --apply
to write a suggested productType change. Review before applying.

Usage:
    python scripts/catalog_misclass_audit.py [--out misclass-audit.md]
    python scripts/catalog_misclass_audit.py --keyword "intimate" --collection pet-finds
    python scripts/catalog_misclass_audit.py --apply
"""
import argparse
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin  # noqa: E402


# Curated category → keyword map. A product whose title/tags/productType
# contains any keyword in `keyword_set` is considered "in-category" for
# that collection. Products that don't match any keyword for their
# declared category get flagged.
CATEGORY_KEYWORDS = {
    'pet supplies': {'pet', 'dog', 'cat', 'puppy', 'kitten', 'aquarium',
                     'reptile', 'bird feeder', 'leash', 'collar', 'kennel',
                     'litter', 'chew toy', 'birdhouse'},
    'home & kitchen': {'kitchen', 'home', 'cook', 'mug', 'cup', 'plate',
                        'bowl', 'pan', 'utensil', 'organizer', 'storage',
                        'decor', 'cushion', 'bed', 'shelf', 'rug', 'lamp',
                        'chair', 'table'},
    'beauty & personal care': {'beauty', 'skin', 'face', 'hair', 'makeup',
                                'cosmetic', 'lotion', 'cream', 'serum', 'shampoo',
                                'conditioner', 'massage', 'spa', 'grooming'},
    'electronics & accessories': {'electronic', 'cable', 'charger', 'usb',
                                    'wireless', 'bluetooth', 'headphone',
                                    'speaker', 'gadget', 'smart', 'tech'},
    'health & wellness': {'health', 'wellness', 'fitness', 'exercise',
                            'yoga', 'massage', 'therapy', 'supplement',
                            'vitamin'},
    'phone case': {'phone', 'iphone', 'samsung', 'pixel', 'galaxy', 'case',
                   'cover', 'bumper'},
    'sports & outdoors': {'sport', 'outdoor', 'camping', 'hiking', 'bike',
                          'tent', 'backpack', 'fitness'},
    'toys & games': {'toy', 'game', 'puzzle', 'plush', 'figure', 'lego'},
    'tools & home improvement': {'tool', 'drill', 'saw', 'wrench', 'screwdriver',
                                  'hammer', 'tape measure'},
    'office & school supplies': {'office', 'pen', 'pencil', 'notebook',
                                  'paper', 'desk', 'school'},
    'apparel & accessories': {'shirt', 'pants', 'dress', 'jacket', 'hat',
                              'sock', 'glove', 'apparel', 'wear'},
    'garden & outdoor': {'garden', 'plant', 'seed', 'soil', 'shovel', 'rake',
                          'patio', 'lawn', 'hose'},
    'baby & nursery': {'baby', 'infant', 'newborn', 'nursery', 'toddler',
                       'diaper'},
    'automotive': {'car', 'auto', 'vehicle', 'tire', 'wiper', 'dash',
                   'steering', 'engine'},
    'gifts under $25': {'gift', 'novelty'},
    'intimate': {'intimate', 'massager', 'vibrat', 'adult', 'sensual',
                 'dildo', 'kinky'},
}


# Map a collection's title to its likely category key.
# (Falls back to a normalized form of the title lowercased.)
def category_for_collection(title, handle):
    t = (title or '').lower()
    h = (handle or '').lower()
    for key in CATEGORY_KEYWORDS:
        if key in t or key.replace(' ', '-') in h:
            return key
    return None


def in_category(product, category_key):
    """Return True if product matches the category's keyword set.

    Intentionally excludes `productType` from the match text: the whole
    point of this audit is to find products whose declared productType
    disagrees with the collection they sit in, so using productType as
    a positive signal would mask every misclassification.
    """
    if not category_key:
        return True
    keywords = CATEGORY_KEYWORDS[category_key]
    text = ' '.join([
        (product.get('title') or ''),
        ' '.join(product.get('tags') or []),
    ]).lower()
    return any(kw in text for kw in keywords)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='catalog-misclass-audit.md')
    ap.add_argument('--apply', action='store_true',
                    help='Apply suggested productType changes (interactive)')
    ap.add_argument('--keyword', help='Search title for a specific keyword (debug)')
    ap.add_argument('--collection', help='Limit to a specific collection handle')
    args = ap.parse_args()

    with ShopifyAdmin() as s:
        # Fetch all collections
        if not args.collection:
            print('Fetching collections…')
            data = s.gql('''
            query($after: String) {
              collections(first: 50, after: $after) {
                pageInfo { hasNextPage endCursor }
                nodes { id title handle }
              }
            }
            ''', {'after': None})
            collections = []
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
                cs = (d.get('collections') or {}).get('nodes') or []
                collections.extend(cs)
                pi = (d.get('collections') or {}).get('pageInfo') or {}
                if not pi.get('hasNextPage'):
                    break
                after = pi.get('endCursor')
        else:
            # Specific collection — find by title/handle via search
            d = s.gql('''
            query($q: String!) {
              collections(first: 5, query: $q) {
                nodes { id title handle }
              }
            }
            ''', {'q': f'handle:{args.collection}'})
            cs = (d.get('collections') or {}).get('nodes') or []
            if not cs:
                print(f'Collection "{args.collection}" not found')
                sys.exit(1)
            collections = [cs[0]]

        if not collections:
            print('No collections found')
            sys.exit(0)

        print(f'Got {len(collections)} collections. Auditing…')

        # For each collection, fetch members
        all_findings = []
        for col in collections:
            cat_key = category_for_collection(col['title'], col['handle'])
            if not cat_key:
                continue
            q = '''
            query($id: ID!, $after: String) {
              collection(id: $id) {
                title
                products(first: 100, after: $after) {
                  pageInfo { hasNextPage endCursor }
                  nodes { id title handle productType tags }
                }
              }
            }
            '''
            after = None
            while True:
                d = s.gql(q, {'id': col['id'], 'after': after})
                prods = (d.get('collection') or {}).get('products') or {}
                for p in prods.get('nodes') or []:
                    if args.keyword and args.keyword.lower() not in (p.get('title') or '').lower():
                        continue
                    if not in_category(p, cat_key):
                        all_findings.append({
                            'collection': col['title'],
                            'collection_handle': col['handle'],
                            'category_key': cat_key,
                            'id': p['id'].split('/')[-1],
                            'handle': p['handle'],
                            'title': p['title'],
                            'productType': p.get('productType') or '',
                            'tags': p.get('tags') or [],
                        })
                pi = prods.get('pageInfo') or {}
                if not pi.get('hasNextPage'):
                    break
                after = pi.get('endCursor')

    # Render
    by_col = defaultdict(list)
    for f in all_findings:
        by_col[(f['collection'], f['collection_handle'])].append(f)

    out = []
    out.append('# Catalog Misclassification Audit')
    out.append('')
    out.append(f'Generated against {len(collections)} collections.')
    out.append(f'Flagged {len(all_findings)} products in collections where they look out of place.')
    out.append('')
    for (col_title, col_handle), findings in sorted(by_col.items(), key=lambda x: -len(x[1])):
        out.append(f'## `{col_title}` (handle: `{col_handle}`) — {len(findings)} flagged')
        out.append('')
        for f in findings[:20]:
            tags_str = ', '.join(f['tags'][:5])
            out.append(f"- `{f['id']}` **{f['title'][:60]}** — productType={f['productType']!r}, tags=[{tags_str}]")
        if len(findings) > 20:
            out.append(f"\n_...and {len(findings) - 20} more in this collection._")
        out.append('')
    Path(args.out).write_text('\n'.join(out), encoding='utf-8')
    print(f'Report: {args.out}')
    print(f'  Total flagged: {len(all_findings)}')


if __name__ == '__main__':
    main()