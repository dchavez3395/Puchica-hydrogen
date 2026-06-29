#!/usr/bin/env python3
"""verify_category_reorg.py — Post-apply verification.

Run AFTER category_reorg_apply.py --confirm. Confirms:
  1. The 2 new collections exist with the right rules.
  2. The 4 renamed collections have new titles/handles.
  3. The 3 anti-leak guards are in place.
  4. health-wellness no longer contains intimate products.
  5. pet-supplies no longer contains intimate products.
  6. apparel-accessories no longer contains intimate products.
  7. sexual-wellness has ~67 products.
  8. intimate-care has ~12 products.
  9. The 3 Osuga/Terri/Trilux products are no longer in pet-supplies.
"""
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin  # noqa: E402

INTIMATE_KEYWORDS = (
    'intimate massager', 'intimate ring', 'couples vibrator',
    'couples ring', 'sex toy', 'adult toy', 'dildo', 'anal plug',
    'anal bead', 'butt plug', 'clitoral stimulator', 'clit stimulator',
    'g-spot', 'g spot', 'prostate massager', 'kegel', 'kegel ball',
    'love egg', 'thrusting', 'sucking vibrator', 'rose toy',
    'rose vibrator', 'air pulse', 'satisfyer', 'womanizer',
    'magic wand vibrator', 'magic wand massager',
    'sensual positioning', 'sex positioning', 'sex position',
    'wand massager', 'clitoral', 'clit ring', 'clitoral massager',
    'rabbit vibrator', 'rabbit massager', 'finger tapping',
    'shibari', 'kinbaku', 'whip', 'paddle', 'flogger', 'gag',
    'cock ring', 'penis ring', 'erotic', 'kinky',
    # Brand names (intimate-only)
    'satisfyer', 'womanizer', 'we-vibe', 'lelo ',
    'lelo intimate', 'lelo massager', 'lelo vibrator',
    'lelo mia', 'lelo loki', 'lelo sila', 'lelo gigi',
    'lelo ona', 'lelo ina', 'lelo ida', 'lelo liv',
    'lelo ora', 'lelo tara', 'lelo elia', 'lelo elise',
    'lelo mona', 'lelo tiani', 'lelo soraya', 'lelo hula',
    'lelo hugo', 'lelo siri', 'lelo sona', 'lelo luna',
    'lelo f1s', 'lelo f1l', 'lelo bea', 'lelo beads',
    'lelo dot', 'lelo noa', 'lelo nea', 'lelo akira',
    'leleu', 'lelo yva', 'lelo inez', 'lelo alia',
    'lelo billy', 'lelo moka', 'lelo olga', 'lelo ilya',
    # Brand names (intimate furniture)
    'liberator wedge', 'liberator ramp', 'liberator chaise',
    'liberator pillow', 'liberator flip', 'liberator esse',
    'liberator aria', 'liberator jaz', 'liberator heart',
    'liberator tutu', 'liberator ambiance',
    # Specific product lines
    'sensual lounge', 'intimate bundle', 'intimate bundle',
    'sex positioning', 'intimate pillow', 'intimate bed',
)

PROBLEMATIC_HANDLES = ['osuga-osurging-thruster-waterproof-rechargeable-curved-rabbit',
                       'terri-app-controlled-kinky-finger-tapping-rabbit-vibrator',
                       'trilux-kinky-finger-rabbit-vibrator-with-anal-beads']


def looks_intimate(title, tags, ptype):
    blob = ' '.join([title or '', ' '.join(tags or []), ptype or '']).lower()
    return any(k in blob for k in INTIMATE_KEYWORDS)


def main():
    failures = []
    with ShopifyAdmin() as s:
        # 1+2+3: Collections
        d = s.gql('''
        { collections(first: 50) {
            nodes { id title handle ruleSet { rules { column relation condition } } }
        } }
        ''')
        cols = {c['handle']: c for c in d['collections']['nodes']}

        def check(label, ok, detail=''):
            sym = 'OK  ' if ok else 'FAIL'
            print(f'  [{sym}] {label} {detail}')
            if not ok:
                failures.append(label)

        print('--- Collection state ---')
        # New collections
        for h, title in [('sexual-wellness', 'Sexual Wellness'),
                          ('intimate-care', 'Intimate Care')]:
            c = cols.get(h)
            check(f'{h} exists', c is not None)
            if c:
                check(f'  title is {title!r}', c['title'] == title,
                      f'(got {c["title"]!r})')
                rule = (c.get('ruleSet') or {}).get('rules') or []
                if rule:
                    check(f'  rule column TYPE',
                          rule[0].get('column') == 'TYPE',
                          f'(got {rule[0].get("column")!r})')
                    check(f'  rule condition {title!r}',
                          rule[0].get('condition') == title,
                          f'(got {rule[0].get("condition")!r})')

        # Renames
        renames = [
            ('home-kitchen', 'Home & Kitchen'),
            ('electronics-accessories', 'Electronics & Accessories'),
            ('office-school', 'Office & School'),
            ('pet-supplies', 'Pet Supplies'),
        ]
        for h, t in renames:
            c = cols.get(h)
            check(f'renamed {h} exists', c is not None)
            if c:
                check(f'  title is {t!r}', c['title'] == t,
                      f'(got {c["title"]!r})')

        # Anti-leak guards
        print('\n--- Anti-leak guards ---')
        guard_targets = ['health-wellness', 'apparel-accessories', 'pet-supplies']
        for h in guard_targets:
            c = cols.get(h)
            if not c:
                check(f'{h} not found', False)
                continue
            rules = (c.get('ruleSet') or {}).get('rules') or []
            has_guard = any(
                r.get('column') == 'TAG' and r.get('relation') == 'NOT_EQUALS'
                and r.get('condition') == 'intimate'
                for r in rules
            )
            check(f'{h} has NOT tag=intimate guard', has_guard,
                  f'(rules: {rules})')

        # 4-9: Product memberships
        print('\n--- Product memberships ---')
        products = s.list_all_products(fields=[
            'id', 'title', 'handle', 'productType', 'tags', 'status',
            'collections(first: 50) { nodes { handle title } }',
        ])

        # health-wellness should not have intimate products
        hw_intimate = []
        for p in products:
            cols_h = [c['handle'] for c in (p.get('collections') or {}).get('nodes') or []]
            if 'health-wellness' not in cols_h:
                continue
            if looks_intimate(p.get('title', ''), p.get('tags') or [], p.get('productType')):
                hw_intimate.append(p)
        check(f'health-wellness has 0 intimate products (got {len(hw_intimate)})',
              len(hw_intimate) == 0,
              f': {[(p["handle"]) for p in hw_intimate[:3]]}' if hw_intimate else '')

        # pet-supplies should not have intimate products
        pf_intimate = []
        for p in products:
            cols_h = [c['handle'] for c in (p.get('collections') or {}).get('nodes') or []]
            if 'pet-supplies' not in cols_h:
                continue
            if looks_intimate(p.get('title', ''), p.get('tags') or [], p.get('productType')):
                pf_intimate.append(p)
        check(f'pet-supplies has 0 intimate products (got {len(pf_intimate)})',
              len(pf_intimate) == 0)

        # apparel-accessories should not have intimate products
        aa_intimate = []
        for p in products:
            cols_h = [c['handle'] for c in (p.get('collections') or {}).get('nodes') or []]
            if 'apparel-accessories' not in cols_h:
                continue
            if looks_intimate(p.get('title', ''), p.get('tags') or [], p.get('productType')):
                aa_intimate.append(p)
        check(f'apparel-accessories has 0 intimate products (got {len(aa_intimate)})',
              len(aa_intimate) == 0)

        # The 3 problem products must not be in pet-supplies
        for h in PROBLEMATIC_HANDLES:
            p = next((p for p in products if p['handle'] == h), None)
            if not p:
                check(f'  {h} not found', False)
                continue
            cols_h = [c['handle'] for c in (p.get('collections') or {}).get('nodes') or []]
            in_pf = 'pet-supplies' in cols_h or 'pet-finds' in cols_h
            check(f'{h} not in pet collection', not in_pf,
                  f'(in {cols_h})' if in_pf else '')

        # New collection sizes
        sw_count = sum(1 for p in products if 'sexual-wellness' in
                       [c['handle'] for c in (p.get('collections') or {}).get('nodes') or []])
        ic_count = sum(1 for p in products if 'intimate-care' in
                       [c['handle'] for c in (p.get('collections') or {}).get('nodes') or []])
        check(f'sexual-wellness has ~67 products (got {sw_count})',
              60 <= sw_count <= 75, '')
        check(f'intimate-care has ~12 products (got {ic_count})',
              8 <= ic_count <= 18, '')

        # Product types
        sw_types = Counter(p.get('productType') for p in products
                            if 'sexual-wellness' in
                            [c['handle'] for c in (p.get('collections') or {}).get('nodes') or []])
        ic_types = Counter(p.get('productType') for p in products
                            if 'intimate-care' in
                            [c['handle'] for c in (p.get('collections') or {}).get('nodes') or []])
        print(f'\nsexual-wellness productType breakdown: {dict(sw_types)}')
        print(f'intimate-care productType breakdown: {dict(ic_types)}')
        check('sexual-wellness is all "Sexual Wellness" type',
              list(sw_types.keys()) == ['Sexual Wellness'],
              f'(got {list(sw_types.keys())})')
        check('intimate-care is all "Intimate Care" type',
              list(ic_types.keys()) == ['Intimate Care'],
              f'(got {list(ic_types.keys())})')

    print(f'\n=== {len(failures)} failures ===')
    for f in failures:
        print(f'  - {f}')
    return 0 if not failures else 1


if __name__ == '__main__':
    sys.exit(main())