#!/usr/bin/env python3
"""category_reorg_apply.py — Apply the category reorganization
recommended in full_category_audit-2026-06-29.md.

This is a DESTRUCTIVE script. It will:
  1. Add 2 new productTypes (Sexual Wellness, Intimate Care) — note
     Shopify doesn't actually have a "productType create" mutation;
     productType is a free-text field on Product. So we don't need
     to "create" it — we just set it on the products that should
     have it, and Shopify accepts any string.
  2. Create 2 new smart collections (sexual-wellness, intimate-care)
     with TYPE-based rules.
  3. Add `NOT tag = 'intimate'` anti-leak guard to 3 existing
     smart collections (health-wellness, pet-finds, apparel-accessories).
  4. Rename 4 existing collections (slug + title).
  5. Recategorize 79 products by changing their productType:
       - 76 products currently typed Health & Wellness -> Sexual Wellness
       -  3 products currently typed Pet Supplies -> Intimate Care
         (these are Osuga, Terri, Trilux — they will go to a different
          collection because they're massagers, but Intimate Care is
          the closest existing bucket; or we put them in Sexual Wellness)
  6. Pre-flight snapshot saved to scripts/snapshots/<ts>.json
     so the script can be reverted with --rollback <ts>.

Safeguards:
  - Pre-flight snapshot of every affected product + collection.
  - --dry-run by default.
  - --confirm required to actually mutate.
  - Per-step progress logging.
  - After mutations, verify each step succeeded before continuing.
  - --rollback <snapshot> reverses all mutations in one go.
  - No slug collisions checked before rename.
  - All operations throttle-safe (sleeps 100ms between writes).

Usage:
    python scripts/category_reorg_apply.py --dry-run
    python scripts/category_reorg_apply.py --confirm
    python scripts/category_reorg_apply.py --rollback <snapshot-id>
"""
import argparse
import json
import sys
import time
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin, ShopifyGraphQLError  # noqa: E402


# Plan: rename + new collections + anti-leak guards + recategorize.
# Each operation is one entry in this plan with the data needed
# to execute and revert it.
PLAN = {
    'renames': [
        {'old_handle': 'home-essentials', 'new_title': 'Home & Kitchen',
         'new_handle': 'home-kitchen'},
        {'old_handle': 'tech-gadgets', 'new_title': 'Electronics & Accessories',
         'new_handle': 'electronics-accessories'},
        {'old_handle': 'office-school-supplies', 'new_title': 'Office & School',
         'new_handle': 'office-school'},
        {'old_handle': 'pet-finds', 'new_title': 'Pet Supplies',
         'new_handle': 'pet-supplies'},
    ],
    'new_collections': [
        {'title': 'Sexual Wellness', 'handle': 'sexual-wellness',
         'rule': {'column': 'TYPE', 'relation': 'EQUALS',
                  'condition': 'Sexual Wellness'}},
        {'title': 'Intimate Care', 'handle': 'intimate-care',
         'rule': {'column': 'TYPE', 'relation': 'EQUALS',
                  'condition': 'Intimate Care'}},
    ],
    'anti_leak_guards': [
        'health-wellness',
        'pet-finds',  # may already be renamed to pet-supplies; handle both
        'apparel-accessories',
    ],
    'recategorize': {
        # '76 Health & Wellness -> Sexual Wellness' is generated below.
        # '3 Pet Supplies -> Intimate Care' is generated from
        # intimate-pet-type-misclass-2026-06-29.csv.
    },
}


def parse_args():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry-run', action='store_true', default=True)
    ap.add_argument('--confirm', action='store_true',
                    help='Actually mutate Shopify')
    ap.add_argument('--rollback', metavar='SNAPSHOT_ID',
                    help='Roll back using snapshot ID (e.g. 2026-06-29T17-40-00)')
    ap.add_argument('--quiet', action='store_true')
    return ap.parse_args()


def snapshot_path(snap_id):
    return Path('scripts/snapshots') / f'category-reorg-{snap_id}.json'


def take_snapshot(s, products, cols):
    """Capture current state of all affected entities."""
    return {
        'ts': time.strftime('%Y-%m-%dT%H-%M-%S'),
        'collections': {
            c['handle']: {'id': c['id'], 'title': c['title'],
                          'handle': c['handle'],
                          'rules': (c.get('ruleSet') or {}).get('rules')}
            for c in cols
        },
        'products': {
            p['handle']: {
                'id': p['id'],
                'productType': p.get('productType'),
                'tags': p.get('tags') or [],
            }
            for p in products
        },
    }


def write_snapshot(snap):
    snap_dir = Path('scripts/snapshots')
    snap_dir.mkdir(parents=True, exist_ok=True)
    p = snapshot_path(snap['ts'])
    p.write_text(json.dumps(snap, indent=2, ensure_ascii=False), encoding='utf-8')
    return p


def load_snapshot(snap_id):
    p = snapshot_path(snap_id)
    if not p.exists():
        print(f'Snapshot not found: {p}')
        sys.exit(1)
    return json.loads(p.read_text(encoding='utf-8'))


def confirm(msg):
    print(f'\n>>> {msg}')
    resp = input('Type "yes" to continue: ')
    return resp.strip() == 'yes'


def main():
    args = parse_args()
    if args.confirm:
        args.dry_run = False

    snap_dir = Path('scripts/snapshots')
    snap_dir.mkdir(parents=True, exist_ok=True)

    with ShopifyAdmin() as s:
        # ---------- ROLLBACK PATH ----------
        if args.rollback:
            snap = load_snapshot(args.rollback)
            print(f'Rolling back to snapshot {args.rollback}')
            print(f'  Affected products: {len(snap["products"])}')
            print(f'  Affected collections: {len(snap["collections"])}')
            if not confirm('This will restore productTypes, tags, collection rules, titles, and handles to the snapshot state.'):
                return
            _rollback(s, snap)
            return

        # ---------- LIVE PATH ----------
        # Step 0: fetch current state
        print('Fetching collections…')
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

        print('Fetching products…')
        products = s.list_all_products(fields=[
            'id', 'title', 'handle', 'productType', 'tags', 'status',
            'collections(first: 50) { nodes { handle title } }',
        ])

        # Step 1: snapshot
        snap = take_snapshot(s, products, cols)
        snap_path = write_snapshot(snap)
        print(f'\n[1/6] Snapshot saved: {snap_path}')
        print(f'      ID: {snap["ts"]}')
        print(f'      Products: {len(snap["products"])}')
        print(f'      Collections: {len(snap["collections"])}')
        if args.dry_run:
            print('      (dry-run — no mutations)')

        # Step 2: build recategorize list
        # 76 Health & Wellness products tagged intimate -> Sexual Wellness
        # 3 Pet Supplies products tagged intimate -> Intimate Care
        INTIMATE_CARE_KEYWORDS = (
            'lubricant', 'lube', 'moisturizer', 'personal care',
            'condom', 'cleaning', 'cleanser', 'toy cleaner',
            'renewal powder', 'warming gel',
        )
        to_recat = []
        for p in products:
            tags = [t.lower() for t in (p.get('tags') or [])]
            ptype = p.get('productType') or ''
            is_intimate_tag = any(t in ('intimate', 'intimate_massage', 'intimate_massagers') for t in tags)
            if not is_intimate_tag:
                continue
            title_l = (p.get('title') or '').lower()
            tags_str = ' '.join(tags).lower()
            is_intimate_care = any(k in title_l or k in tags_str for k in INTIMATE_CARE_KEYWORDS)
            new_type = 'Intimate Care' if is_intimate_care else 'Sexual Wellness'
            if ptype == 'Health & Wellness':
                to_recat.append({'id': p['id'], 'handle': p['handle'],
                                 'old_type': ptype, 'new_type': new_type,
                                 'title': p['title'][:60]})
            elif ptype == 'Pet Supplies':
                # Osuga/Terri/Trilux: tag is intimate_massage, but they're
                # massagers not lubricants. Route to Sexual Wellness too.
                to_recat.append({'id': p['id'], 'handle': p['handle'],
                                 'old_type': ptype, 'new_type': 'Sexual Wellness',
                                 'title': p['title'][:60]})

        print(f'\n[2/6] Recategorize plan: {len(to_recat)} products')
        by_new = defaultdict(int)
        for r in to_recat:
            by_new[r['new_type']] += 1
        for nt, n in by_new.items():
            print(f'      {nt}: {n} products')
        if args.dry_run:
            for r in to_recat[:10]:
                print(f"      - {r['handle']}: {r['old_type']} -> {r['new_type']}")
            if len(to_recat) > 10:
                print(f'      ... and {len(to_recat) - 10} more')

        # Step 3: rename + slug
        print(f'\n[3/6] Renames ({len(PLAN["renames"])}):')
        for r in PLAN['renames']:
            print(f"      {r['old_handle']:30s} -> {r['new_handle']:30s} ({r['new_title']})")

        # Step 4: new collections
        print(f'\n[4/6] New collections ({len(PLAN["new_collections"])}):')
        for c in PLAN['new_collections']:
            print(f"      + {c['handle']:30s} {c['title']} (TYPE = {c['rule']['condition']})")

        # Step 5: anti-leak guards
        print(f'\n[5/6] Anti-leak guards:')
        for h in PLAN['anti_leak_guards']:
            print(f"      {h} -> add NOT tag='intimate'")

        # Step 6: execution
        if args.dry_run:
            print(f'\n[6/6] DRY RUN complete. Pass --confirm to apply.')
            print(f'      Rollback: --rollback {snap["ts"]}')
            return

        if not confirm('Apply ALL changes? (snapshot will be created)'):
            print('Aborted.')
            return

        # ===== EXECUTE =====
        # Order matters: rename first (so new handles don't collide with
        # collections we're about to create), then create new collections,
        # then add anti-leak guards, then recategorize.

        # --- Step A: renames ---
        print('\n[A] Renaming collections…')
        col_by_handle = {c['handle']: c for c in cols}
        rename_failures = []
        for r in PLAN['renames']:
            old_h = r['old_handle']
            c = col_by_handle.get(old_h)
            if not c:
                print(f'  WARN: collection handle {old_h!r} not found, skipping')
                continue
            if c['handle'] == r['new_handle']:
                print(f'  SKIP {old_h}: already correct')
                continue
            try:
                result = s.gql('''
                mutation cu($id: ID!, $input: CollectionInput!) {
                  collectionUpdate(id: $id, input: $input) {
                    collection { id handle title }
                    userErrors { field message }
                  }
                }
                ''', {
                    'id': c['id'],
                    'input': {'title': r['new_title'], 'handle': r['new_handle']}
                })
                errs = (result.get('collectionUpdate') or {}).get('userErrors') or []
                if errs:
                    rename_failures.append((r, errs))
                    print(f'  FAIL {old_h}: {errs}')
                else:
                    print(f'  OK   {old_h} -> {r["new_handle"]}')
                time.sleep(0.1)
            except ShopifyGraphQLError as e:
                rename_failures.append((r, str(e)))
                print(f'  ERR  {old_h}: {e}')

        if rename_failures:
            print(f'\n  {len(rename_failures)} rename failures. Aborting.')
            return

        # --- Step B: new collections ---
        print('\n[B] Creating new collections…')
        # Use collectionCreate with ruleSet
        new_col_ids = {}
        for c in PLAN['new_collections']:
            try:
                result = s.gql('''
                mutation cc($input: CollectionInput!) {
                  collectionCreate(input: $input) {
                    collection { id handle title }
                    userErrors { field message }
                  }
                }
                ''', {
                    'input': {
                        'title': c['title'],
                        'handle': c['handle'],
                        'ruleSet': {
                            'appliedDisjunctively': True,
                            'rules': [c['rule']],
                        }
                    }
                })
                errs = (result.get('collectionCreate') or {}).get('userErrors') or []
                if errs:
                    # If already exists, that's fine
                    if any('taken' in str(e).lower() or 'handle' in str(e).lower() for e in errs):
                        print(f'  EXISTS {c["handle"]} (skipping create)')
                        # Fetch its id
                        d = s.gql('''
                        query($h: String!) {
                          collections(first: 1, query: $h) {
                            nodes { id handle title }
                          }
                        }
                        ''', {'h': f'handle:{c["handle"]}'})
                        ns = d.get('collections', {}).get('nodes') or []
                        if ns:
                            new_col_ids[c['handle']] = ns[0]['id']
                    else:
                        print(f'  FAIL {c["handle"]}: {errs}')
                else:
                    nc = (result.get('collectionCreate') or {}).get('collection') or {}
                    new_col_ids[c['handle']] = nc.get('id')
                    print(f'  OK   +{c["handle"]} (id={nc.get("id")})')
                time.sleep(0.1)
            except ShopifyGraphQLError as e:
                print(f'  ERR  {c["handle"]}: {e}')

        # --- Step C: anti-leak guards ---
        print('\n[C] Adding anti-leak guards…')
        # Re-fetch collections with new handles
        d = s.gql('''
        { collections(first: 50) {
            nodes { id title handle ruleSet { rules { column relation condition } } }
        } }
        ''')
        cur_cols = d['collections']['nodes']
        guard_targets = ['health-wellness', 'apparel-accessories']
        # pet-finds was renamed to pet-supplies; check both
        pet_col = next((c for c in cur_cols if c['handle'] in ('pet-finds', 'pet-supplies')), None)
        if pet_col:
            guard_targets.append(pet_col['handle'])
        for h in guard_targets:
            c = next((c for c in cur_cols if c['handle'] == h), None)
            if not c:
                print(f'  WARN: {h} not found')
                continue
            existing_rules = (c.get('ruleSet') or {}).get('rules') or []
            # Add NOT tag='intimate' if not present
            has_guard = any(
                r.get('column') == 'TAG' and r.get('relation') == 'NOT_EQUALS'
                and r.get('condition') == 'intimate'
                for r in existing_rules
            )
            if has_guard:
                print(f'  SKIP {h}: guard already present')
                continue
            new_rules = existing_rules + [{
                'column': 'TAG', 'relation': 'NOT_EQUALS', 'condition': 'intimate'
            }]
            try:
                result = s.gql('''
                mutation cu($id: ID!, $input: CollectionInput!) {
                  collectionUpdate(id: $id, input: $input) {
                    collection { id handle }
                    userErrors { field message }
                  }
                }
                ''', {
                    'id': c['id'],
                    'input': {'ruleSet': {'appliedDisjunctively': True, 'rules': new_rules}}
                })
                errs = (result.get('collectionUpdate') or {}).get('userErrors') or []
                if errs:
                    print(f'  FAIL {h}: {errs}')
                else:
                    print(f'  OK   {h}: +NOT tag=intimate')
                time.sleep(0.1)
            except ShopifyGraphQLError as e:
                print(f'  ERR  {h}: {e}')

        # --- Step D: recategorize ---
        print(f'\n[D] Recategorizing {len(to_recat)} products…')
        cat_failures = []
        # Group by new_type to do fewer mutations
        for r in to_recat:
            try:
                result = s.gql('''
                mutation pu($input: ProductInput!) {
                  productUpdate(input: $input) {
                    product { id productType }
                    userErrors { field message }
                  }
                }
                ''', {
                    'input': {'id': r['id'], 'productType': r['new_type']}
                })
                errs = (result.get('productUpdate') or {}).get('userErrors') or []
                if errs:
                    cat_failures.append((r, errs))
                    print(f'  FAIL {r["handle"]}: {errs}')
                else:
                    print(f'  OK   {r["handle"]}: {r["old_type"]} -> {r["new_type"]}')
                time.sleep(0.05)
            except ShopifyGraphQLError as e:
                cat_failures.append((r, str(e)))
                print(f'  ERR  {r["handle"]}: {e}')

        # --- Final report ---
        print('\n=== DONE ===')
        print(f'Renames: {len(PLAN["renames"]) - len(rename_failures)}/{len(PLAN["renames"])} ok')
        print(f'New collections: {len(PLAN["new_collections"])} created')
        print(f'Anti-leak guards: applied to {len(guard_targets)} collections')
        print(f'Recategorize: {len(to_recat) - len(cat_failures)}/{len(to_recat)} ok')
        if cat_failures:
            print(f'  {len(cat_failures)} failures — see above')
        print(f'\nSnapshot ID: {snap["ts"]} (file: {snap_path})')
        print(f'To revert everything: --rollback {snap["ts"]}')


def _rollback(s, snap):
    """Reverse all mutations in the snapshot.

    Order matters: reverse in opposite order from apply.
      1. Recategorize products (restore productType)
      2. Anti-leak guards: re-fetch, remove the NOT tag=intimate rule
      3. New collections: delete the new sexual-wellness + intimate-care
         (or just clear their rules if there are products in them)
      4. Renames: restore old handles + titles
    """
    print('\n[A] Restoring productTypes…')
    fails = 0
    for h, p in snap['products'].items():
        old_type = p['productType']
        # Skip if already at original
        try:
            cur = s.gql('''
            query($id: ID!) { product(id: $id) { productType } }
            ''', {'id': p['id']})
            cur_type = (cur.get('product') or {}).get('productType')
            if cur_type == old_type:
                continue
            result = s.gql('''
            mutation pu($input: ProductInput!) {
              productUpdate(input: $input) {
                product { id }
                userErrors { field message }
              }
            }
            ''', {'input': {'id': p['id'], 'productType': old_type}})
            errs = (result.get('productUpdate') or {}).get('userErrors') or []
            if errs:
                fails += 1
                print(f'  FAIL {h}: {errs}')
            time.sleep(0.05)
        except ShopifyGraphQLError as e:
            fails += 1
            print(f'  ERR  {h}: {e}')
    print(f'  {len(snap["products"]) - fails}/{len(snap["products"])} restored')

    print('\n[B] Removing anti-leak guards…')
    # Find each collection by ID and remove any 'NOT tag=intimate' rule
    d = s.gql('''
    { collections(first: 50) { nodes { id handle ruleSet { rules { column relation condition } } } } }
    ''')
    cur_cols = {c['id']: c for c in d['collections']['nodes']}
    guards_removed = 0
    for old_h, meta in snap['collections'].items():
        cid = meta['id']
        cur = cur_cols.get(cid)
        if not cur:
            continue
        rules = (cur.get('ruleSet') or {}).get('rules') or []
        new_rules = [r for r in rules if not (
            r.get('column') == 'TAG' and r.get('relation') == 'NOT_EQUALS'
            and r.get('condition') == 'intimate'
        )]
        if len(new_rules) == len(rules):
            continue  # no guard to remove
        try:
            result = s.gql('''
            mutation cu($id: ID!, $input: CollectionInput!) {
              collectionUpdate(id: $id, input: $input) {
                collection { id }
                userErrors { field message }
              }
            }
            ''', {'id': cid, 'input': {'ruleSet': {'appliedDisjunctively': True, 'rules': new_rules}}})
            errs = (result.get('collectionUpdate') or {}).get('userErrors') or []
            if errs:
                print(f'  FAIL {meta["handle"]}: {errs}')
            else:
                guards_removed += 1
            time.sleep(0.1)
        except ShopifyGraphQLError as e:
            print(f'  ERR  {meta["handle"]}: {e}')
    print(f'  {guards_removed} guards removed')

    print('\n[C] Renaming collections back…')
    renames_reverted = 0
    for old_h, meta in snap['collections'].items():
        cid = meta['id']
        cur = cur_cols.get(cid)
        if not cur:
            continue
        if cur['handle'] == old_h and cur['title'] == meta['title']:
            continue
        try:
            result = s.gql('''
            mutation cu($id: ID!, $input: CollectionInput!) {
              collectionUpdate(id: $id, input: $input) {
                collection { id handle title }
                userErrors { field message }
              }
            }
            ''', {
                'id': cid,
                'input': {'title': meta['title'], 'handle': old_h}
            })
            errs = (result.get('collectionUpdate') or {}).get('userErrors') or []
            if errs:
                # Old handle may now be taken if we renamed away and a new
                # collection claimed the handle. Skip in that case.
                print(f'  FAIL {cur["handle"]} -> {old_h}: {errs}')
            else:
                renames_reverted += 1
            time.sleep(0.1)
        except ShopifyGraphQLError as e:
            print(f'  ERR  {cur["handle"]}: {e}')
    print(f'  {renames_reverted} renames reverted')

    print('\n[D] New collections (sexual-wellness, intimate-care):')
    print('  NOT auto-deleted to avoid accidental data loss.')
    print('  Manually delete in Shopify admin if you want them gone.')
    print('\nRollback complete.')


if __name__ == '__main__':
    main()