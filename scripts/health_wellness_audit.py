#!/usr/bin/env python3
"""health_wellness_collection_audit.py — Check whether intimate products
have leaked into the health-wellness collection.

The intimate-product-type audit found 76 products with:
  productType = 'Health & Wellness'
  tags include 'intimate' or 'intimate_massage'

This script:
  1. Pulls the health-wellness collection's smart-collection rules.
  2. Pulls all products currently in health-wellness.
  3. Identifies which ones look intimate (keyword + tag match).
  4. Cross-references with the intimate-tagged set.

This will tell us whether intimate massagers are also showing up
under health-wellness (likely yes, since 76 are typed as such).
"""
import sys
from pathlib import Path
from collections import Counter

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin  # noqa: E402

INTIMATE_KEYWORDS = (
    'intimate', 'massager', 'vibrator', 'vibrating', 'wand',
    'bullet', 'rabbit', 'dildo', 'anal', 'clitoral', 'g-spot',
    'pleasure', 'cock ring', 'prostate', 'butt plug', 'love egg',
    'couples vibrator', 'sex toy', 'adult toy', 'erotic', 'nipple',
    'bondage', 'restraint', 'kegel', 'ben wa', 'love ball',
    'geisha ball', 'sybian', 'harness', 'strap-on', 'strapon',
    'thrusting', 'sucking vibrator', 'rose toy', 'rose vibrator',
    'air pulse', 'satisfyer', 'womanizer', 'magic wand', 'hitachi',
    # Specific brand/product words we've seen
    'osuga', 'terri', 'trilux',
)

# Pet-specific keywords — exclude these from "intimate" detection
# since they appear in legit pet products (harness, leash, collar).
PET_KEYWORDS = ('harness', 'leash', 'collar', 'pet', 'dog', 'cat')


def looks_intimate(title, tags, product_type):
    """True if product seems intimate AND not pet."""
    blob = ' '.join([title or '', ' '.join(tags or []), product_type or '']).lower()
    if any(k in blob for k in INTIMATE_KEYWORDS):
        # Make sure it's not a pet item.
        is_pet = any(k in blob for k in PET_KEYWORDS)
        if is_pet and 'intimate' not in blob and 'vibrator' not in blob and 'massager' not in blob:
            return False
        return True
    return False


def main():
    with ShopifyAdmin() as s:
        # Resolve health-wellness + pet-finds collections with rules
        d = s.gql('''
        { collections(first: 50) {
            nodes { id title handle ruleSet { rules { column relation condition } } }
        } }
        ''')
        col_by_handle = {c['handle']: c for c in d['collections']['nodes']}
        hw = col_by_handle.get('health-wellness')
        pf = col_by_handle.get('pet-finds')
        print('health-wellness rules:', hw.get('ruleSet') if hw else None)
        print('pet-finds rules:', pf.get('ruleSet') if pf else None)
        print()

        products = s.list_all_products(fields=[
            'id', 'title', 'handle', 'productType', 'tags', 'status',
            'collections(first: 50) { nodes { handle title } }',
        ])

    in_hw = []
    in_pf = []
    intimate_in_hw = []
    intimate_in_pf = []
    intimate_tagged_in_hw = []
    intimate_tagged_in_pf = []

    for p in products:
        cols = [c['handle'] for c in (p.get('collections') or {}).get('nodes') or []]
        tags = p.get('tags') or []
        title = p.get('title') or ''
        ptype = p.get('productType') or ''

        if 'health-wellness' in cols:
            in_hw.append(p)
        if 'pet-finds' in cols:
            in_pf.append(p)

        if 'health-wellness' in cols and looks_intimate(title, tags, ptype):
            intimate_in_hw.append(p)
        if 'pet-finds' in cols and looks_intimate(title, tags, ptype):
            intimate_in_pf.append(p)

        has_intimate_tag = any(t.lower() in ('intimate', 'intimate_massage', 'intimate_massagers') for t in tags)
        if 'health-wellness' in cols and has_intimate_tag:
            intimate_tagged_in_hw.append(p)
        if 'pet-finds' in cols and has_intimate_tag:
            intimate_tagged_in_pf.append(p)

    print('--- Summary ---')
    print(f'health-wellness total: {len(in_hw)}')
    print(f'pet-finds total: {len(in_pf)}')
    print(f'Intimate-by-keyword in health-wellness: {len(intimate_in_hw)}')
    print(f'Intimate-by-keyword in pet-finds: {len(intimate_in_pf)}')
    print(f'Intimate-tagged in health-wellness: {len(intimate_tagged_in_hw)}')
    print(f'Intimate-tagged in pet-finds: {len(intimate_tagged_in_pf)}')

    if intimate_tagged_in_hw:
        print('\nIntimate-tagged products in health-wellness:')
        for p in intimate_tagged_in_hw[:30]:
            print(f"  {p['handle']}: {p['title'][:60]}")
    if intimate_tagged_in_pf:
        print('\nIntimate-tagged products in pet-finds:')
        for p in intimate_tagged_in_pf[:30]:
            print(f"  {p['handle']}: {p['title'][:60]}")


if __name__ == '__main__':
    main()