#!/usr/bin/env python3
"""intimate_subcategory_distribution.py — Break down the 90
intimate-tagged products by subcategory based on title keywords.

Goal: figure out if there's a natural split between:
  - Intimate Massagers (the Osuga/Terri/Trilux + Lelo vibrators)
  - Personal Lubricants
  - Condoms
  - Bondage / BDSM
  - Apparel (lingerie, etc.)
so we know how many productTypes we actually need.
"""
import sys
from pathlib import Path
from collections import Counter

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin  # noqa: E402

SUBCATEGORY_KEYWORDS = {
    'Intimate Massagers': ['massager', 'vibrator', 'wand', 'rabbit', 'bullet',
                           'dildo', 'anal', 'clitoral', 'g-spot', 'prostate',
                           'butt plug', 'love egg', 'thrusting', 'rose',
                           'air pulse', 'satisfyer', 'womanizer', 'magic wand',
                           'hitachi', 'osuga', 'terri', 'trilux', 'kegel',
                           'ben wa', 'love ball', 'geisha ball', 'sybian',
                           'strap-on', 'strapon', 'sybian', 'pulse'],
    'Lubricants & Care':   ['lubricant', 'lube', 'moisturizer', 'personal care'],
    'Condoms':             ['condom'],
    'BDSM & Fetish':       ['bdsm', 'bondage', 'restraint', 'handcuff', 'paddle',
                            'flogger', 'whip', 'fetish'],
    'Intimate Apparel':    ['lingerie', 'robe', 'babydoll', 'teddy', 'corset',
                            'bodystocking', 'hosiery', 'stockings'],
    'Penis Rings':         ['cock ring', 'penis ring', 'eros ring'],
}


def main():
    with ShopifyAdmin() as s:
        products = s.list_all_products(fields=[
            'id', 'title', 'handle', 'productType', 'tags', 'status',
        ])

    intimate_tagged = []
    for p in products:
        tags = [t.lower() for t in (p.get('tags') or [])]
        if 'intimate' in tags or 'intimate_massage' in tags or 'intimate_massagers' in tags:
            intimate_tagged.append(p)

    # Subcategory via keyword
    by_subcat = {k: [] for k in SUBCATEGORY_KEYWORDS}
    by_subcat['Other'] = []
    for p in intimate_tagged:
        title_l = (p.get('title') or '').lower()
        tags_l = ' '.join(t.lower() for t in (p.get('tags') or []))
        ptype_l = (p.get('productType') or '').lower()
        blob = ' '.join([title_l, tags_l, ptype_l])

        matched = False
        for subcat, keywords in SUBCATEGORY_KEYWORDS.items():
            if any(k in blob for k in keywords):
                by_subcat[subcat].append(p)
                matched = True
                break
        if not matched:
            by_subcat['Other'].append(p)

    print(f'Total intimate-tagged products: {len(intimate_tagged)}')
    print()
    for subcat, items in by_subcat.items():
        if items:
            print(f'{subcat}: {len(items)}')
            for p in items[:3]:
                print(f"  {p['handle']}: {p['title'][:60]}")
            if len(items) > 3:
                print(f"  ... and {len(items) - 3} more")
            print()

    # Save the breakdown to CSV
    out = Path('intimate-subcategory-breakdown-2026-06-29.csv')
    with out.open('w', encoding='utf-8', newline='') as f:
        f.write('subcategory,handle,title,current_productType,tags\n')
        for subcat, items in by_subcat.items():
            for p in items:
                f.write(f'"{subcat}","{p["handle"]}","{p["title"].replace(chr(34), chr(39))}",'
                        f'"{p.get("productType")}","{";".join(p.get("tags") or [])}"\n')
    print(f'\nSaved breakdown to {out}')


if __name__ == '__main__':
    main()