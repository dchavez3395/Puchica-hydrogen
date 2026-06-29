#!/usr/bin/env python3
"""find_intimate_tagged_pet_type.py — Find products tagged intimate
but with productType='Pet Supplies'.

The 3 known misplacements (Osuga, Terri, Trilux) all share:
  productType = 'Pet Supplies'
  tags includes 'intimate' AND 'intimate_massage'
  collections includes pet-finds but NOT intimate (which doesn't
  exist as a collection — see audit)

This script surfaces ALL such products so we can fix them all at
once. Fix: change productType to 'Intimate Massagers' (or similar
non-pet type) and they'll naturally fall out of pet-finds and into
any future intimate collection.
"""
import sys
from pathlib import Path
from collections import Counter

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin  # noqa: E402

INTIMATE_TAGS = ('intimate', 'intimate_massage', 'intimate_massagers', 'massage_collection:Intimate')
PET_TYPE = 'Pet Supplies'


def main():
    with ShopifyAdmin() as s:
        products = s.list_all_products(fields=[
            'id', 'title', 'handle', 'productType', 'tags', 'status',
            'collections(first: 50) { nodes { handle title } }',
        ])

    flagged = []
    for p in products:
        tags = [t.lower() for t in (p.get('tags') or [])]
        ptype = p.get('productType') or ''
        # Match: productType is Pet Supplies AND has any intimate tag
        if ptype == PET_TYPE and any(t.lower() in [it.lower() for it in INTIMATE_TAGS] for t in tags):
            cols = [c['handle'] for c in (p.get('collections') or {}).get('nodes') or []]
            flagged.append({
                'id': p['id'].split('/')[-1],
                'handle': p['handle'],
                'title': p['title'],
                'productType': ptype,
                'tags': ';'.join(p.get('tags') or []),
                'collections': ';'.join(cols),
            })

    # Also: products tagged intimate but with a different (non-pet) productType
    # Those are already correctly typed and we leave them alone.

    # Write CSV
    out = Path('intimate-pet-type-misclass-2026-06-29.csv')
    with out.open('w', encoding='utf-8', newline='') as f:
        f.write('id,handle,title,productType,tags,collections\n')
        for r in flagged:
            f.write(f'"{r["id"]}","{r["handle"]}","{r["title"].replace(chr(34), chr(39))}",'
                    f'"{r["productType"]}","{r["tags"]}","{r["collections"]}"\n')

    print(f'Found {len(flagged)} products with productType="Pet Supplies" AND intimate tags.')
    print(f'CSV: {out}')
    if flagged:
        print('\nList:')
        for r in flagged:
            print(f"  {r['handle']}: {r['title'][:60]}")


if __name__ == '__main__':
    main()