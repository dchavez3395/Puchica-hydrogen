#!/usr/bin/env python3
"""fix_disjunctive.py — Fix the anti-leak guard's appliedDisjunctively
flag from True to False so the rules are AND-ed, not OR-ed.

Background: my category_reorg_apply.py wrote the guard as
  ruleSet: { rules: [...], appliedDisjunctively: True }

With disjunctive (OR) logic, the second rule "NOT tag = intimate"
matches every product that isn't tagged 'intimate', which is
nearly everything. So the collection exploded to 6,000+ products.

With conjunctive (AND) logic — appliedDisjunctively = False — both
rules must match, so a product only enters the collection if it
has TYPE=Health & Wellness AND is not tagged intimate.

This script flips the flag on:
  health-wellness
  pet-supplies
  apparel-accessories

Run with --confirm.
"""
import argparse
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin, ShopifyGraphQLError  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry-run', action='store_true', default=True)
    ap.add_argument('--confirm', action='store_true')
    args = ap.parse_args()
    if args.confirm:
        args.dry_run = False

    TARGETS = ['health-wellness', 'pet-supplies', 'apparel-accessories']

    with ShopifyAdmin() as s:
        # Fetch current state
        d = s.gql('''
        { collections(first: 50) {
            nodes { id title handle ruleSet { rules { column relation condition } appliedDisjunctively }
                    productsCount { count }
            }
        } }
        ''')
        cols = {c['handle']: c for c in d['collections']['nodes']}

        for h in TARGETS:
            c = cols.get(h)
            if not c:
                print(f'  WARN: {h} not found')
                continue
            rs = c.get('ruleSet') or {}
            cur = rs.get('appliedDisjunctively', False)
            pc = (c.get('productsCount') or {}).get('count', '?')
            print(f'  {h}: appliedDisjunctively={cur} productsCount={pc}')
            if not cur:
                print(f'    SKIP: already conjunctive')
                continue
            if args.dry_run:
                print(f'    PLAN: flip to False')
                continue
            try:
                result = s.gql('''
                mutation cu($input: CollectionInput!) {
                  collectionUpdate(input: $input) {
                    collection { id handle }
                    userErrors { field message }
                  }
                }
                ''', {
                    'input': {
                        'id': c['id'],
                        'ruleSet': {
                            'rules': rs.get('rules') or [],
                            'appliedDisjunctively': False,
                        }
                    }
                })
                errs = (result.get('collectionUpdate') or {}).get('userErrors') or []
                if errs:
                    print(f'    FAIL: {errs}')
                else:
                    print(f'    OK: flipped to conjunctive (AND)')
            except ShopifyGraphQLError as e:
                print(f'    ERR: {e}')


if __name__ == '__main__':
    main()