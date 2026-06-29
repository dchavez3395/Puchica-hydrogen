#!/usr/bin/env python3
"""find_intimate_in_pet.py — Surface intimate products miscategorized
in pet-finds (or any non-intimate collection).

The category audit found that 'Pet Supplies' products can leak into
the 'pet-finds' smart collection. Sometimes those products ARE pet
items, but tagged wrong — and sometimes they're NOT pet items at all
(e.g. an intimate product picked up the 'pet_finds' tag by mistake).

This script pulls:
  1. All products with the 'intimate' tag (these should live in the
     intimate / sexual-wellness collections, NOT in pet-finds).
  2. All products currently in pet-finds collection.
  3. The INTERSECTION: intimate-tagged products that are also in
     pet-finds. These are the actual misplacements.

Also pulls products in pet-finds that have names containing
'intimate', 'massager', 'vibrator', 'wand', etc., regardless of
tag — to catch tag-missing cases.

Outputs a markdown report.
"""
import sys
from pathlib import Path
from collections import Counter

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin  # noqa: E402

# Words that strongly suggest intimate products. Case-insensitive.
INTIMATE_KEYWORDS = (
    'intimate', 'massager', 'vibrator', 'vibrating', 'wand massager',
    'bullet vibrator', 'rabbit vibrator', 'dildo', 'anal', 'clitoral',
    'g-spot', 'g spot', 'silicone massager', 'pleasure', 'clit',
    'cock ring', 'penis ring', 'prostate', 'butt plug', 'love egg',
    'remote control vibrator', 'couples vibrator', 'sex toy',
    'adult toy', 'eros', 'eros ring', 'erotic', 'nipple', 'bondage',
    'restraint', 'handcuff', 'paddle', 'flogger', 'whip', 'bdsm',
    'kegel', 'ben wa', 'benwa', 'love ball', 'geisha ball',
    'sex machine', 'sybian', 'harness', 'strap-on', 'strapon',
    'thrusting', 'sucking vibrator', 'rose toy', 'rose vibrator',
    'air pulse', 'satisfyer', 'womanizer', 'magic wand', 'hitachi',
)

# Tags that should keep a product OUT of pet-finds (anti-leak guard)
PET_FINDS_TAG_BLOCKLIST = (
    'intimate', 'intimate_massagers', 'adult', 'sex_toys',
    'sexual_wellness', 'sensual', 'erotic',
)


def looks_intimate(title, tags, product_type):
    blob = ' '.join([title or '', ' '.join(tags or []), product_type or '']).lower()
    return any(k in blob for k in INTIMATE_KEYWORDS)


def main():
    out = []
    out.append('# Intimate-in-Pet Audit')
    out.append('')
    out.append('Goal: find products tagged or titled as intimate that have leaked into the `pet-finds` smart collection.')
    out.append('')

    with ShopifyAdmin() as s:
        # 1. Pull all products. We need title + tags + productType + collections.
        print('Fetching products…')
        products = s.list_all_products(fields=[
            'id', 'title', 'handle', 'productType', 'tags', 'status',
            'collections(first: 50) { nodes { handle title } }',
        ])
        print(f'  Got {len(products)} products.')

        # 2. Resolve pet-finds and intimate collection ids.
        coll_map = {}
        d = s.gql('''
        { collections(first: 50) { nodes { id title handle } } }
        ''')
        for c in d.get('collections', {}).get('nodes', []):
            coll_map[c['handle']] = c

    pet_finds_handle = 'pet-finds'
    intimate_handle = 'intimate'
    pet_col_id = coll_map.get(pet_finds_handle, {}).get('id')
    intimate_col_id = coll_map.get(intimate_handle, {}).get('id')

    out.append(f'## Collections resolved')
    out.append('')
    out.append(f'- `pet-finds`: id={pet_col_id}')
    out.append(f'- `intimate`: id={intimate_col_id}')
    out.append('')

    # 3. Find products in pet-finds.
    in_pet = []
    in_intimate = []
    intimate_tagged = []
    intimate_titled_in_pet = []

    for p in products:
        cols = [c['handle'] for c in (p.get('collections') or {}).get('nodes') or []]
        tags = p.get('tags') or []
        title = p.get('title') or ''
        ptype = p.get('productType') or ''

        if pet_finds_handle in cols:
            in_pet.append(p)
        if intimate_handle in cols:
            in_intimate.append(p)
        if 'intimate' in tags or 'intimate_massagers' in tags:
            intimate_tagged.append(p)

        # The key check: is this product in pet-finds but seems intimate?
        if pet_finds_handle in cols and looks_intimate(title, tags, ptype):
            intimate_titled_in_pet.append(p)

    out.append('## Summary')
    out.append('')
    out.append(f'- Total products in `pet-finds`: **{len(in_pet)}**')
    out.append(f'- Total products in `intimate`: **{len(in_intimate)}**')
    out.append(f'- Products tagged `intimate` anywhere: **{len(intimate_tagged)}**')
    out.append(f'- Products in `pet-finds` that LOOK intimate (keyword match): **{len(intimate_titled_in_pet)}**')
    out.append('')

    if intimate_titled_in_pet:
        out.append('## Pet-finds products that look intimate')
        out.append('')
        out.append('These products are currently in the pet-finds collection but their title/tags/productType suggest they belong in the intimate collection.')
        out.append('')
        out.append('| handle | title | productType | tags (sample) | current cols | suggested fix |')
        out.append('| --- | --- | --- | --- | --- | --- |')
        for p in intimate_titled_in_pet:
            cols = [c['handle'] for c in (p.get('collections') or {}).get('nodes') or []]
            cols_str = ', '.join(c for c in cols if c != pet_finds_handle) or '_(only pet-finds)_'
            sample_tags = ', '.join((p.get('tags') or [])[:4])
            fix = 'move to `intimate` collection + remove `pet_finds` tag'
            out.append(f"| `{p['handle']}` | {p['title'][:60]} | `{p.get('productType')}` | {sample_tags} | {cols_str} | {fix} |")
        out.append('')
    else:
        out.append('## No pet-finds products look intimate by keyword match.')
        out.append('')
        out.append('Possible reasons:')
        out.append('- The intimate products in pet-finds use neutral titles/tags and would only be caught by category membership.')
        out.append('- The misplacement happened by tag, not by product name.')
        out.append('')
        out.append('### Cross-reference: products tagged `intimate` but NOT in `pet-finds`')
        out.append('')
        out.append('These ARE tagged intimate but for some reason are in pet-finds. Tag-conflict candidates.')
        out.append('')
        cross = [p for p in intimate_tagged if pet_finds_handle in [c['handle'] for c in (p.get('collections') or {}).get('nodes') or []]]
        if cross:
            out.append('| handle | title | productType | all collections |')
            out.append('| --- | --- | --- | --- |')
            for p in cross[:30]:
                cols = ', '.join(c['handle'] for c in (p.get('collections') or {}).get('nodes') or [])
                out.append(f"| `{p['handle']}` | {p['title'][:60]} | `{p.get('productType')}` | {cols} |")
        else:
            out.append('_None — no products tagged `intimate` are in pet-finds._')

    Path('intimate-in-pet-audit-2026-06-29.md').write_text('\n'.join(out), encoding='utf-8')
    print('\nReport: intimate-in-pet-audit-2026-06-29.md')
    print(f'  Pet-finds total: {len(in_pet)}')
    print(f'  Intimate-tagged: {len(intimate_tagged)}')
    print(f'  Intimate-titled in pet-finds: {len(intimate_titled_in_pet)}')


if __name__ == '__main__':
    main()