#!/usr/bin/env python3
"""category_audit.py — Comprehensive category / collection audit.

Walks the full catalog and answers:
  1. Which productTypes are in use? How many products each?
  2. Which productTypes have NO matching collection?
  3. Which products are untyped (productType empty)?
  4. Which productTypes are PLACEHOLDERS or LOW-QUALITY
     (e.g. 'Puchica' literal leak, single-word defaults)?
  5. Which products sit in collections that don't match their type?
  6. Which collections are empty or near-empty?
  7. Which collections are bloated (>500 products, may need pruning
     or splitting)?
  8. Cross-reference: does every productType have a real
     corresponding collection?

Outputs a single markdown report. Read-only. Use the report to
guide what new collections to add, what products to recategorize,
and which placeholder types to clean up.

Usage:
    python scripts/category_audit.py [--out category-audit.md]
    python scripts/category_audit.py --out category-audit-2026-06-29.md
"""
import argparse
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin  # noqa: E402


# Heuristics: a productType name is "placeholder" if it matches any
# of these patterns. Real categories tend to be 2-3 word phrases
# with a noun + qualifier.
PLACEHOLDER_TYPE_PATTERNS = [
    re.compile(r'^puchica$', re.IGNORECASE),  # the "Puchica" leak
    re.compile(r'^(default|other|misc|miscellaneous|general|general merchandise)$', re.IGNORECASE),
    re.compile(r'^\W+$'),  # only punctuation
    re.compile(r'^\s*$'),  # empty
    re.compile(r'^(test|placeholder|tbd|todo|fixme|sample)$', re.IGNORECASE),
    re.compile(r'^[a-z]$', re.IGNORECASE),  # single letter
    re.compile(r'^(untitled|unknown|none|null)$', re.IGNORECASE),
]


def is_placeholder_type(name):
    if not name:
        return True
    for pat in PLACEHOLDER_TYPE_PATTERNS:
        if pat.search(name):
            return True
    # Single word all-lowercase is a smell; real categories usually
    # are 2+ words.
    if ' ' not in name and '-' not in name and name[0].islower():
        return True
    return False


def normalize(s):
    """Loose normalization for matching productType ↔ collection title."""
    if not s:
        return ''
    s = s.lower().strip()
    # remove "&" vs "and", punctuation
    s = re.sub(r'&', 'and', s)
    s = re.sub(r'[^\w\s-]', '', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s


def type_in_collection_name(p_type, col_titles_norm):
    """Return True if p_type (normalized) matches any collection title."""
    if not p_type:
        return False
    pt = normalize(p_type)
    if pt in col_titles_norm:
        return True
    # Substring match: e.g. "Phone Case" inside "Phone Case Collection"
    for ct in col_titles_norm:
        if pt in ct or ct in pt:
            return True
    return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='category-audit.md',
                    help='Output report path')
    ap.add_argument('--quiet', action='store_true')
    args = ap.parse_args()

    with ShopifyAdmin() as s:
        if not args.quiet:
            print('Fetching collections…')
        # 1. All collections
        collections = []
        after = None
        while True:
            d = s.gql('''
            query($after: String) {
              collections(first: 30, after: $after) {
                pageInfo { hasNextPage endCursor }
                nodes { id title handle ruleSet { rules { column relation condition } } }
              }
            }
            ''', {'after': after})
            cs = (d.get('collections') or {}).get('nodes') or []
            collections.extend(cs)
            pi = (d.get('collections') or {}).get('pageInfo') or {}
            if not pi.get('hasNextPage'):
                break
            after = pi.get('endCursor')

        if not args.quiet:
            print(f'Got {len(collections)} collections. Fetching products…')

        # 2. All products with collections they're in
        products = s.list_all_products(fields=[
            'id', 'title', 'handle', 'productType', 'status',
            'collections(first: 50) { nodes { handle title } }',
        ])

    if not args.quiet:
        print(f'  Got {len(products)} products. Analyzing…')

    col_titles_norm = {normalize(c['title']): c for c in collections}
    col_handles = {c['handle']: c for c in collections}

    # Counters
    by_type = Counter()
    placeholder_products = []
    untype_products = []
    bad_collection_products = []
    products_in_collection = defaultdict(int)
    product_types_in_use = set()

    for p in products:
        ptype = (p.get('productType') or '').strip()
        ptype = ptype or '_(empty)_'
        product_types_in_use.add(ptype)
        by_type[ptype] += 1

        # Untyped
        if not ptype or ptype == '_(empty)_':
            untype_products.append(p)

        # Placeholder
        if is_placeholder_type(ptype):
            placeholder_products.append(p)

        # For each collection this product is in, check that it matches the type
        cols = (p.get('collections') or {}).get('nodes') or []
        for c in cols:
            products_in_collection[c['handle']] += 1
            cn = normalize(c['title'])
            pt = normalize(ptype)
            if pt and pt not in cn and cn not in pt and ptype.lower() != c['title'].lower():
                # Mismatch: this product is in a collection whose title
                # doesn't reference its type. (We allow smart-collection
                # "frontpage" etc. since those pull anything.)
                if c['handle'] not in ('frontpage', 'all', 'trending-finds',
                                         'best-sellers', 'new', 'gifts-under-25'):
                    bad_collection_products.append({
                        'id': p['id'].split('/')[-1],
                        'handle': p['handle'],
                        'title': p['title'],
                        'productType': ptype,
                        'in_collection': c['title'],
                    })

    # Type → has matching collection?
    types_with_collection = set()
    types_without_collection = set()
    for pt in product_types_in_use:
        if type_in_collection_name(pt, col_titles_norm):
            types_with_collection.add(pt)
        else:
            types_without_collection.add(pt)

    # Collection size buckets
    bloated = []
    sparse = []
    empty = []
    for c in collections:
        h = c['handle']
        n = products_in_collection.get(h, 0)
        if n == 0:
            empty.append((c, 0))
        elif n < 5:
            sparse.append((c, n))
        elif n > 500:
            bloated.append((c, n))

    # Render report
    out = []
    out.append('# Category & Collection Audit')
    out.append('')
    out.append(f'Generated against {len(products)} products, {len(collections)} collections.')
    out.append('')
    out.append('## Top-level summary')
    out.append('')
    out.append(f'- Distinct productTypes: **{len(by_type)}**')
    out.append(f'- Collections: **{len(collections)}**')
    out.append(f'- Untyped products (empty productType): **{len(untype_products)}**')
    out.append(f'- Placeholder-typed products: **{len(placeholder_products)}**')
    out.append(f'- Products in mismatched collections: **{len(bad_collection_products)}**')
    out.append(f'- productTypes with NO matching collection: **{len(types_without_collection)}**')
    out.append(f'- Empty collections: **{len(empty)}**')
    out.append(f'- Sparse collections (<5 products): **{len(sparse)}**')
    out.append(f'- Bloated collections (>500 products): **{len(bloated)}**')
    out.append('')

    # ProductType distribution
    out.append('## productType distribution (top 30)')
    out.append('')
    out.append('| productType | count | has collection? | placeholder? |')
    out.append('| --- | --- | --- | --- |')
    for pt, n in by_type.most_common(30):
        has_col = '✓' if pt in types_with_collection else '✗'
        is_ph = '⚠' if is_placeholder_type(pt) else ''
        out.append(f'| `{pt}` | {n} | {has_col} | {is_ph} |')
    if len(by_type) > 30:
        out.append(f"\n_...and {len(by_type) - 30} more productTypes (most with <5 products each)._")
    out.append('')

    # productTypes without matching collection
    out.append('## productTypes without a matching collection')
    out.append('')
    out.append('These productTypes are in use but no collection title contains the type name.')
    out.append('Recommendation: create a new collection, OR rename an existing collection to include the type, OR recategorize the products.')
    out.append('')
    if types_without_collection:
        for pt in sorted(types_without_collection, key=lambda t: -by_type[t])[:30]:
            out.append(f'- `{pt}` ({by_type[pt]} products)')
        if len(types_without_collection) > 30:
            out.append(f'\n_...and {len(types_without_collection) - 30} more._')
    else:
        out.append('_All productTypes have a matching collection._')
    out.append('')

    # Untyped products
    out.append('## Untyped products (empty productType)')
    out.append('')
    out.append(f'**{len(untype_products)}** products have no productType set. These won\'t appear in any smart-collection filtered by productType, and they\'re likely orphans in the storefront nav.')
    out.append('')
    if untype_products:
        out.append('First 25 examples:')
        out.append('')
        for p in untype_products[:25]:
            out.append(f"- `{p['id'].split('/')[-1]}` {p['title'][:60]}")
        if len(untype_products) > 25:
            out.append(f'\n_...and {len(untype_products) - 25} more._')
    out.append('')

    # Placeholder products
    out.append('## Placeholder / low-quality productTypes')
    out.append('')
    if placeholder_products:
        # Group by productType
        ph_by_type = Counter((p.get('productType') or '').strip() or '_(empty)_'
                              for p in placeholder_products)
        for pt, n in ph_by_type.most_common(10):
            out.append(f'### `{pt}` ({n} products)')
            out.append('')
            examples = [p for p in placeholder_products
                        if (p.get('productType') or '').strip() == pt][:5]
            for p in examples:
                out.append(f"- `{p['id'].split('/')[-1]}` {p['title'][:60]}")
            if n > 5:
                out.append(f'\n_...and {n - 5} more._')
            out.append('')
    else:
        out.append('_No placeholder productTypes in use._')
    out.append('')

    # Empty / sparse / bloated
    out.append('## Collection sizes')
    out.append('')
    if empty:
        out.append('### Empty collections (0 products)')
        out.append('')
        for c, _ in empty:
            out.append(f"- `{c['handle']}` **{c['title']}** — empty")
        out.append('')
        out.append('**Recommendation:** Either delete these collections, or add products that should be in them.')
        out.append('')
    if sparse:
        out.append('### Sparse collections (<5 products)')
        out.append('')
        out.append('| collection | products |')
        out.append('| --- | --- |')
        for c, n in sorted(sparse, key=lambda x: x[1]):
            out.append(f"| `{c['handle']}` **{c['title']}** | {n} |")
        out.append('')
        out.append('**Recommendation:** If these are meant to be a real customer-facing collection, add products to them. If they\'re test/abandoned, delete them.')
        out.append('')
    if bloated:
        out.append('### Bloated collections (>500 products)')
        out.append('')
        out.append('| collection | products |')
        out.append('| --- | --- |')
        for c, n in sorted(bloated, key=lambda x: -x[1]):
            out.append(f"| `{c['handle']}` **{c['title']}** | {n} |")
        out.append('')
        out.append('**Recommendation:** Bloated collections overwhelm customers. Consider splitting by sub-type (e.g. Phone Case → iPhone Cases, Samsung Cases, Pixel Cases) or adding filters within the collection.')
        out.append('')

    # Bad-collection mismatches
    out.append('## Products in collections that don\'t match their type')
    out.append('')
    out.append(f'**{len(bad_collection_products)}** product/collection mismatches found. (Excludes broad collections: frontpage, all, trending-finds, best-sellers, new, gifts-under-25.)')
    out.append('')
    if bad_collection_products:
        # Group by collection
        by_col = defaultdict(list)
        for p in bad_collection_products:
            by_col[p['in_collection']].append(p)
        for col in sorted(by_col, key=lambda c: -len(by_col[c]))[:10]:
            items = by_col[col]
            out.append(f'### In `{col}` ({len(items)} mismatches)')
            out.append('')
            for p in items[:5]:
                out.append(f"- `{p['id']}` {p['title'][:50]} (productType=`{p['productType']}`)")
            if len(items) > 5:
                out.append(f'\n_...and {len(items) - 5} more._')
            out.append('')
    else:
        out.append('_All product/collection associations are within their matching types._')
    out.append('')

    out.append('## Recommendations')
    out.append('')
    out.append('1. **Create new collections for orphaned productTypes.** The list above shows what to add. Pick the top 5-10 by product count.')
    out.append('2. **Recategorize the untyped products.** Either assign a productType or delete the product.')
    out.append('3. **Clean up placeholder types.** Especially the `Puchica` literal leak if any remain.')
    out.append('4. **Fix the mismatched products.** Either change productType, remove from collection, or change the collection filter rule.')
    out.append('5. **Decide on bloated collections.** Split them or accept that they\'re catch-alls.')
    out.append('6. **Decide on sparse/empty collections.** Delete or populate.')

    Path(args.out).write_text('\n'.join(out), encoding='utf-8')
    if not args.quiet:
        print(f'\nReport: {args.out}')
        print(f'  Top productType: {by_type.most_common(1)[0]}')
        print(f'  Types without collection: {len(types_without_collection)}')
        print(f'  Untyped products: {len(untype_products)}')
        print(f'  Placeholder products: {len(placeholder_products)}')
        print(f'  Mismatched products: {len(bad_collection_products)}')
        print(f'  Empty collections: {len(empty)}')
        print(f'  Sparse collections: {len(sparse)}')
        print(f'  Bloated collections: {len(bloated)}')


if __name__ == '__main__':
    main()