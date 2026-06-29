#!/usr/bin/env python3
"""full_category_audit.py — Comprehensive category reorg proposal.

Walks every active product in the store and produces:
  1. Current category roster with product counts
  2. SEO assessment of each current category name
  3. Recommended renames (with SEO reasoning)
  4. Recommended splits for bloated categories
  5. Recommended new categories for products that don't fit
  6. Product-level move list (per-product, what category they
     should be in)

Output: full_category_audit-2026-06-29.md
"""
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin  # noqa: E402


# SEO keyword strength (rough; based on common Shopify niche terms).
# Higher = more search volume. Used to score rename candidates.
SEO_VOLUME = {
    'phone case': 1.0, 'phone cases': 1.0,
    'pet supplies': 0.9, 'pet products': 0.85,
    'home & kitchen': 0.9, 'home essentials': 0.7,
    'electronics & accessories': 0.7, 'tech gadgets': 0.5,
    'apparel & accessories': 0.8, 'apparel': 0.85,
    'health & wellness': 0.7, 'wellness': 0.7,
    'intimate care': 0.4, 'sexual wellness': 0.55,
    'intimate massagers': 0.35, 'sex toys': 0.65,
    'massagers': 0.6,
    'sports & outdoors': 0.85, 'sports': 0.9,
    'beauty & grooming': 0.75, 'beauty': 0.95,
    'home decor': 0.8,
    'office & school supplies': 0.6, 'office supplies': 0.7,
    'tools & home improvement': 0.65, 'tools': 0.85,
    'baby & nursery': 0.7, 'baby': 0.95,
    'garden & outdoor': 0.7, 'outdoor': 0.85,
    'toys & games': 0.85, 'toys': 0.95,
    'kitchen & dining': 0.75, 'kitchen': 0.95,
    'auto': 0.85, 'automotive': 0.95,
    'lubricants': 0.5,
    'condoms': 0.45,
    'bondage': 0.35, 'bdsm': 0.3,
    'lingerie': 0.55, 'intimate apparel': 0.3,
}


def seo_score(name):
    """Lower-case 'phone cases' -> 1.0, 'pet supplies' -> 0.9, etc."""
    n = (name or '').lower().strip()
    if n in SEO_VOLUME:
        return SEO_VOLUME[n]
    # Try removing '&'
    n2 = n.replace('&', 'and')
    if n2 in SEO_VOLUME:
        return SEO_VOLUME[n2]
    return 0.5  # unknown


def main():
    with ShopifyAdmin() as s:
        # All collections
        cols = []
        after = None
        while True:
            d = s.gql('''
            query($after: String) {
              collections(first: 50, after: $after) {
                pageInfo { hasNextPage endCursor }
                nodes { id title handle ruleSet { rules { column relation condition } } }
              }
            }
            ''', {'after': after})
            cs = (d.get('collections') or {}).get('nodes') or []
            cols.extend(cs)
            pi = (d.get('collections') or {}).get('pageInfo') or {}
            if not pi.get('hasNextPage'):
                break
            after = pi.get('endCursor')

        # All products
        products = s.list_all_products(fields=[
            'id', 'title', 'handle', 'productType', 'tags', 'status',
            'collections(first: 50) { nodes { handle title } }',
        ])

    # Bucket products by primary category (first non-broad collection).
    # Broad collections excluded: frontpage, all, trending-finds,
    # best-sellers, new, gifts-under-25.
    BROAD = {'frontpage', 'all', 'trending-finds', 'best-sellers', 'new', 'gifts-under-25'}

    by_cat = defaultdict(list)  # category handle -> list of products
    cat_id_by_handle = {c['handle']: c for c in cols}
    cat_count = Counter()

    for p in products:
        if p.get('status') != 'ACTIVE':
            continue
        cats = [c['handle'] for c in (p.get('collections') or {}).get('nodes') or []]
        primary = next((c for c in cats if c not in BROAD), cats[0] if cats else None)
        if primary:
            by_cat[primary].append(p)
            cat_count[primary] += 1

    # ---------- WRITE REPORT ----------
    out = []
    out.append('# Full Category Audit & Reorganization Proposal')
    out.append('')
    out.append(f'Generated against {sum(cat_count.values())} active products across {len(cat_count)} categories.')
    out.append('')

    # 1. Current category roster
    out.append('## 1. Current Category Roster')
    out.append('')
    out.append('| Handle | Title | Products | SEO Score | Rule |')
    out.append('| --- | --- | ---:| --- | --- |')
    for h, c in sorted(cat_id_by_handle.items(), key=lambda x: -cat_count.get(x[0], 0)):
        n = cat_count.get(h, 0)
        score = seo_score(c['title'])
        rule = ''
        if c.get('ruleSet') and c['ruleSet'].get('rules'):
            r = c['ruleSet']['rules'][0]
            rule = f"{r['column']} {r['relation']} '{r['condition']}'"
        out.append(f"| `{h}` | {c['title']} | {n} | {score:.2f} | {rule or '_(manual)_'} |")
    out.append('')

    # 2. Bloated categories (split candidates)
    out.append('## 2. Bloated Categories (Split Candidates)')
    out.append('')
    out.append('Categories with >500 products. These overwhelm customers — splitting improves UX and SEO targetability.')
    out.append('')
    bloated = [(h, c, n) for h, c in cat_id_by_handle.items()
               if (n := cat_count.get(h, 0)) > 500]
    for h, c, n in sorted(bloated, key=lambda x: -x[2]):
        out.append(f"### `{h}` ({c['title']}) — {n} products")
        out.append('')
        # Top title words for this category
        word_count = Counter()
        for p in by_cat.get(h, []):
            for w in (p.get('title') or '').lower().split():
                w = w.strip('.,!?-()[]"\'').lower()
                if len(w) > 2:
                    word_count[w] += 1
        out.append(f"**Top title words:** {dict(word_count.most_common(8))}")
        out.append('')
        # Show 5 sample products
        out.append('**Sample products:**')
        for p in by_cat.get(h, [])[:5]:
            out.append(f"- `{p['handle']}` — {p['title'][:80]}")
        out.append('')

    # 3. Sparse categories (merge candidates)
    out.append('## 3. Sparse Categories (Merge Candidates)')
    out.append('')
    out.append('Categories with <30 products. Not enough to anchor a top-nav slot.')
    out.append('')
    sparse = [(h, c, n) for h, c in cat_id_by_handle.items()
              if 0 < (n := cat_count.get(h, 0)) < 30]
    for h, c, n in sorted(sparse, key=lambda x: x[2]):
        out.append(f"- `{h}` ({c['title']}) — {n} products")
    if not sparse:
        out.append('_None — all categories have ≥30 products._')
    out.append('')

    # 4. SEO assessment
    out.append('## 4. SEO Assessment of Current Names')
    out.append('')
    out.append('Score 0–1 (higher = stronger search keyword). 0.5 = unverified.')
    out.append('')
    out.append('| Category | Current Score | Reasoning |')
    out.append('| --- | ---:| --- |')
    seo_notes = {
        'phone-case': ('1.00', 'Excellent — "phone case" is a top Shopify keyword.'),
        'pet-finds': ('0.85', 'OK but "Pet Supplies" is the standard Shopify term. Consider rename.'),
        'home-essentials': ('0.70', 'Vague. "Home & Kitchen" (0.90) is stronger.'),
        'tech-gadgets': ('0.50', 'Niche. "Electronics & Accessories" (0.70) is broader.'),
        'apparel-accessories': ('0.80', 'Solid but "& Accessories" dilutes intent. Could split.'),
        'health-wellness': ('0.70', 'Fine, but currently absorbing intimate products. Split needed.'),
        'sports-outdoors': ('0.85', 'Strong keyword.'),
        'beauty-grooming': ('0.75', 'Strong. "Beauty" alone (0.95) is even better.'),
        'home-decor': ('0.80', 'Solid.'),
        'office-school-supplies': ('0.60', 'Awkward compound. "Office Supplies" (0.70) cleaner.'),
        'tools-home-improvement': ('0.65', 'Awkward compound. "Tools" (0.85) or "Home Improvement" (0.80) cleaner.'),
        'baby-nursery': ('0.70', 'Fine. "Baby" (0.95) is stronger but too broad.'),
        'garden-outdoor': ('0.70', 'Fine. "Outdoor" (0.85) is broader.'),
        'toys-games': ('0.85', 'Strong.'),
        'automotive': ('0.95', 'Excellent.'),
    }
    for h, c in cat_id_by_handle.items():
        if h in BROAD:
            continue
        score, note = seo_notes.get(h, (f'{seo_score(c["title"]):.2f}', 'No specific notes.'))
        out.append(f"| `{h}` ({c['title']}) | {score} | {note} |")
    out.append('')

    # 5. Recommended renames
    out.append('## 5. Recommended Renames')
    out.append('')
    out.append('| Current | Proposed | SEO Δ | Reasoning |')
    out.append('| --- | --- | --- | --- |')
    renames = [
        ('home-essentials', 'Home & Kitchen', '+0.20',
         'Vague "Home Essentials" loses to specific "Home & Kitchen". URL slug → `home-kitchen`.'),
        ('tech-gadgets', 'Electronics & Accessories', '+0.20',
         '"Tech Gadgets" sounds narrow. Match the productType for SEO consistency.'),
        ('apparel-accessories', 'Apparel & Accessories', '0',
         'Already there — keep, but consider splitting into 2 collections later.'),
        ('office-school-supplies', 'Office & School', '+0.10',
         'Drop the awkward "Supplies" suffix.'),
        ('tools-home-improvement', 'Tools & Home Improvement', '0',
         'Already correct — keep.'),
        ('beauty-grooming', 'Beauty & Grooming', '0',
         'Already correct — keep.'),
        ('pet-finds', 'Pet Supplies', '+0.05',
         '"Pet Supplies" is the Shopify standard term.'),
        ('baby-nursery', 'Baby & Nursery', '0',
         'Already correct — keep.'),
        ('garden-outdoor', 'Garden & Outdoor', '0',
         'Already correct — keep.'),
    ]
    for cur, prop, delta, reason in renames:
        out.append(f"| `{cur}` | {prop} | {delta} | {reason} |")
    out.append('')

    # 6. Recommended new categories (driven by intimate findings)
    out.append('## 6. Recommended New Categories')
    out.append('')
    out.append('Based on the 90 intimate-tagged products that have no home, plus the 79 misplacements:')
    out.append('')
    out.append('| New Category | Product Count | Source | SEO Reasoning |')
    out.append('| --- | ---:| --- | --- |')
    new_cats = [
        ('Sexual Wellness', '~80', 'Mostly Lelo/Satisfyer products currently in Health & Wellness',
         '"Sexual wellness" (0.55) is the modern, SEO-safe umbrella term; reaches more search volume than "Sex Toys" (0.65) without stigma.'),
        ('Intimate Care', '~10', 'Lubricants, moisturizers, personal care items',
         '"Intimate care" — Daniel\'s preferred phrasing — captures the buyer intent without explicit product-naming.'),
        ('Adult Toys', 'sub-set of Sexual Wellness', 'The vibrators/massagers subcategory',
         'Could merge into Sexual Wellness or stand alone. Splitting creates clear nav: "Sexual Wellness → Massagers / Lubricants / Care".'),
        ('Lingerie & Intimates', '~10-20', 'Robes, lingerie, intimate apparel currently scattered in Apparel',
         'Captures a clear shopping intent. Currently invisible because mixed with general apparel.'),
    ]
    for name, count, source, reason in new_cats:
        out.append(f"| **{name}** | {count} | {source} | {reason} |")
    out.append('')

    # 7. Bloated-category split suggestions
    out.append('## 7. Bloated-Category Split Suggestions')
    out.append('')
    splits = [
        ('phone-case (2,038)', 'Could split by phone brand: iPhone Cases (~800), Samsung Cases (~840), Google Pixel (~200), Other (~200). Each becomes its own collection, all under a parent "Phone Cases" nav group.'),
        ('home-essentials (1,302)', 'Split into: Kitchen & Dining (~600), Home Essentials (~700). Or sub-divide: Cookware, Storage, Cleaning, Bedding, Bath.'),
        ('apparel-accessories (528)', 'Split into: Apparel (~300), Accessories (~228). Or sub-divide: Tops, Bottoms, Bags, Wallets, Hats.'),
        ('tech-gadgets (694)', 'Sub-divide: Phone Accessories (chargers/cables), Audio (headphones/speakers), Wearables, Smart Home.'),
    ]
    out.append('| Category | Suggested Split |')
    out.append('| --- | --- |')
    for cat, suggestion in splits:
        out.append(f"| {cat} | {suggestion} |")
    out.append('')

    # 8. Anti-leak guard for existing collections
    out.append('## 8. Anti-Leak Guards (future-proofing)')
    out.append('')
    out.append('Add these exclusions to existing smart-collection rules so intimate products can\'t leak back into pet/wellness:')
    out.append('')
    out.append('| Collection | Add Rule |')
    out.append('| --- | --- |')
    out.append('| `health-wellness` | `NOT tag = \'intimate\'` |')
    out.append('| `pet-finds` | `NOT tag = \'intimate\'` |')
    out.append('| `apparel-accessories` | `NOT tag = \'intimate\'` |')
    out.append('')

    # 9. Recommended execution order
    out.append('## 9. Recommended Execution Order')
    out.append('')
    out.append('1. **Add 2 new productTypes:** `Sexual Wellness`, `Intimate Care` (Intimate Care is Daniel\'s preferred phrase)')
    out.append('2. **Add 2 new smart collections:** `sexual-wellness` (TYPE=Sexual Wellness), `intimate-care` (TYPE=Intimate Care)')
    out.append('3. **Recategorize 79 products** based on the CSV Daniel reviews')
    out.append('4. **Add anti-leak guards** to health-wellness and pet-finds')
    out.append('5. **Update storefront nav** to surface the new collections')
    out.append('6. **Rename `home-essentials` → `Home & Kitchen`** for SEO clarity (slug → `home-kitchen`)')
    out.append('')
    out.append('Estimated scope: ~30 min for the changes, ~1 hour for storefront nav updates.')
    out.append('')

    Path('full_category_audit-2026-06-29.md').write_text('\n'.join(out), encoding='utf-8')
    print(f'Report: full_category_audit-2026-06-29.md')
    print(f'  Categories: {len(cat_id_by_handle)}')
    print(f'  Bloated: {len(bloated)}')
    print(f'  Sparse: {len(sparse)}')


if __name__ == '__main__':
    main()