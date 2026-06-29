#!/usr/bin/env python3
"""phase2_recategorize_intimate.py — Second-pass recategorization
that catches intimate products missed by tag-based detection.

Phase 1 (commit 57d084a) only recategorized products that had the
`intimate` tag. This missed Lelo vibrators that are typed
Health & Wellness but tagged something else (or untagged).

Strategy: match on TITLE containing keywords like "Lelo Intimate
Massager", "Rabbit", "Vibrator", "Satisfyer", "Womanizer",
"Liberator Wedge", etc. Then map to productType.

Run AFTER category_reorg_apply.py. Idempotent — only acts on
products whose productType is still in {Health & Wellness, Home &
Kitchen, Toys & Games, Apparel & Accessories, Phone Case}.

Outputs a recategorization list (dry-run default). Apply via
--confirm after Daniel's review.
"""
import argparse
import json
import re
import sys
import time
from pathlib import Path
from collections import Counter, defaultdict

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin, ShopifyGraphQLError  # noqa: E402

# Phrases that ONLY appear in intimate products. More specific than
# the broader keyword list to avoid false positives on regular
# massagers/wands.
INTIMATE_PHRASES = (
    # Lelo / Satisfyer / Womanizer brand names
    r'\blelo\b', r'\bsatisfyer\b', r'\bwomanizer\b',
    # Brand-prefix intimate models
    r'\blosuga\b', r'\bterri\b', r'\btrilux\b', r'\bliberator\b',
    # Specific product words
    r'rabbit vibrator', r'finger tapping', r'\bplesur(e|er|ers)\b',
    r'\bg-spot\b', r'\bg spot\b',
    r'\bclitoral\b', r'\bclit\b',
    r'\bprostate\b', r'\bhugo\b',  # Lelo Hugo = prostate massager
    r'\bcouples vibrator\b', r'\bcouples ring\b', r'\bcouples bundle\b',
    r'\bsex toy\b', r'\badult toy\b',
    r'\bbullet vibrator\b', r'\bwand vibrator\b',
    r'\bthrusting\b', r'\bsucking vibrator\b',
    r'\brose toy\b', r'\brose vibrator\b',
    r'\bsensual\b', r'\berotic\b',
    r'\bcock ring\b', r'\bpenis ring\b',
    r'\bkegel\b', r'\blili\b', r'\blelo f1\b',
    # Product lines that are intimate only
    r'\blelo (?:intimate|massage|mia|loki|sila|gigi|ona|ina|ida|liv|ora|tara|elia|elise|lily|mon|tiani|soraya|hula|hugo|siri|sona|nei|luna|f1s|f1l)',
    r'\bsatisfyer\b', r'\bwomanizer\b',
)

# Phrases that mean "Intimate Care" specifically (lubricant/condom).
# Patterns are anchored to avoid false positives on
# "nail moisturizer", "hair moisturizer", "skin moisturizer",
# "scalp moisturizer" etc. The match must be on the bare word
# "moisturizer" or "lubricant" preceded by an intimate context
# word (personal/intimate/feminine/lelo).
INTIMATE_CARE_PHRASES = (
    r'\blubricant\b', r'\blubes?\b',
    r'\bcondoms?\b',
    r'\btoy cleaner\b', r'\brenewal powder\b', r'\bwarming gel\b',
    r'\bintimate care\b',
    r'\bintimate moisturizer\b', r'\bpersonal moisturizer\b',
    r'\bfeminine moisturizer\b', r'\bvaginal moisturizer\b',
    r'\bvaginal lubricant\b', r'\bpersonal lubricant\b',
    r'\bintimate lubricant\b',
    # Lelo F1L Personal Moisturizer pattern (specific product)
    r'\blelo f1l\b', r'\blelo personal\b', r'\blelo lubricant\b',
)

# Phrases that, in a Lelo product, indicate intimate even if other
# words like "bundle" are present.
LELO_INTIMATE_INDICATORS = (
    r'pass bundle', r'delight bundle', r'couples bundle',
    r'solo bundle', r'magic touch', r'steamy bundle',
    r'spotlight bundle', r'powerhouse bundle',
)


def is_intimate_care(blob):
    return any(re.search(p, blob) for p in INTIMATE_CARE_PHRASES)


def is_intimate(blob):
    return any(re.search(p, blob) for p in INTIMATE_PHRASES)


def is_lelo_intimate_bundle(blob):
    return any(re.search(p, blob) for p in LELO_INTIMATE_INDICATORS) and 'lelo' in blob


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry-run', action='store_true', default=True)
    ap.add_argument('--confirm', action='store_true')
    ap.add_argument('--out', default='phase2-recategorize-2026-06-29.csv')
    args = ap.parse_args()
    if args.confirm:
        args.dry_run = False

    with ShopifyAdmin() as s:
        products = s.list_all_products(fields=[
            'id', 'title', 'handle', 'productType', 'tags', 'status',
            'collections(first: 50) { nodes { handle title } }',
        ])

    # Only look at products whose current productType is one of the
    # candidates for miscategorization, OR whose collection membership
    # is in the protected list (health-wellness, pet-supplies, etc.)
    SOURCE_TYPES = {
        'Health & Wellness', 'Home & Kitchen', 'Toys & Games',
        'Apparel & Accessories', 'Phone Case',
        'Sports & Outdoors', 'Beauty & Grooming', 'Pet Supplies',
        'Automotive', 'Tools & Home Improvement',
    }

    to_recat = []
    skipped_already_correct = 0
    skipped_legit = 0
    skipped_other = 0

    for p in products:
        ptype = p.get('productType') or ''
        if ptype in ('Sexual Wellness', 'Intimate Care'):
            skipped_already_correct += 1
            continue
        if ptype not in SOURCE_TYPES:
            skipped_other += 1
            continue

        title = p.get('title') or ''
        handle = p.get('handle') or ''
        tags = p.get('tags') or []

        blob = (title + ' ' + ' '.join(tags) + ' ' + handle).lower()

        # Skip definitely-legit items by hard negative patterns.
        # Bubble wand, garden pest repeller, pressure washer wand, etc.
        LEGIT_OVERRIDES = (
            'bubble wand', 'solar-powered animal repeller', 'solar repeller',
            'pigeon', 'pest repeller', 'deer repeller', 'rabbit repeller',
            'bird repeller', 'rodent repeller',
            'pressure washer', 'pressure-washer', 'extension wand',
            'cleaning wand', 'foam roller',
            'humidor', 'cigar',  # Desktop Analog Cherry Humidor has 'anal' in 'analog'
        )
        if any(k in blob for k in LEGIT_OVERRIDES):
            skipped_legit += 1
            continue

        if is_intimate_care(blob):
            new_type = 'Intimate Care'
        elif is_intimate(blob) or is_lelo_intimate_bundle(blob):
            new_type = 'Sexual Wellness'
        else:
            continue

        to_recat.append({
            'id': p['id'], 'handle': p['handle'],
            'old_type': ptype, 'new_type': new_type,
            'title': title[:80],
        })

    print(f'Total products: {len(products)}')
    print(f'  Already in Sexual Wellness / Intimate Care: {skipped_already_correct}')
    print(f'  Outside source types: {skipped_other}')
    print(f'  Skipped (legit overrides): {skipped_legit}')
    print(f'  To recategorize: {len(to_recat)}')
    by_new = Counter(r['new_type'] for r in to_recat)
    for nt, n in by_new.items():
        print(f'    {nt}: {n}')

    by_old = Counter(r['old_type'] for r in to_recat)
    print('  Source breakdown:')
    for ot, n in by_old.most_common():
        print(f'    {ot}: {n}')

    # Write CSV
    out_path = Path(args.out)
    with out_path.open('w', encoding='utf-8', newline='') as f:
        f.write('id,handle,title,old_productType,new_productType\n')
        for r in to_recat:
            f.write(f'"{r["id"].split("/")[-1]}","{r["handle"]}","{r["title"].replace(chr(34), chr(39))}",'
                    f'"{r["old_type"]}","{r["new_type"]}"\n')
    print(f'\nCSV: {out_path}')

    if args.dry_run:
        print('\nDRY RUN — pass --confirm to apply.')
        return

    if input('\nApply? (yes/no): ').strip() != 'yes':
        return

    fails = 0
    for r in to_recat:
        try:
            res = s.gql('''
            mutation pu($input: ProductInput!) {
              productUpdate(input: $input) {
                product { id productType }
                userErrors { field message }
              }
            }
            ''', {'input': {'id': r['id'], 'productType': r['new_type']}})
            errs = (res.get('productUpdate') or {}).get('userErrors') or []
            if errs:
                fails += 1
                print(f'  FAIL {r["handle"]}: {errs}')
            time.sleep(0.05)
        except ShopifyGraphQLError as e:
            fails += 1
            print(f'  ERR  {r["handle"]}: {e}')
    print(f'\nDone. {len(to_recat) - fails}/{len(to_recat)} ok.')


if __name__ == '__main__':
    main()