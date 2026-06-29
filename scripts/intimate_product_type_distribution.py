#!/usr/bin/env python3
"""intimate_product_type_distribution.py — For products tagged intimate,
show the distribution of their productType values.

Goal: figure out what productType the 77 intimate-tagged products
use, so we can (a) verify consistency and (b) pick a canonical
productType for 'intimate' items if needed.
"""
import sys
from pathlib import Path
from collections import Counter

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin  # noqa: E402


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

    ptype_count = Counter(p.get('productType') or '_(none)_' for p in intimate_tagged)
    print(f'Total intimate-tagged products: {len(intimate_tagged)}')
    print()
    print('productType distribution:')
    for pt, n in ptype_count.most_common():
        print(f'  {pt!r}: {n}')


if __name__ == '__main__':
    main()