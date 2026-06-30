"""Analyze the diffs to figure out what % are worth replacing."""
import sys, json
sys.path.insert(0, r'E:\puchica-storefront\scripts\lib')
sys.path.insert(0, r'E:\puchica-storefront\scripts')
from image_alt_overwrite import generate_alt, PRIORITY_TERMS
import csv

with open('image-alt-fix-2026-06-29-richer.csv', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    target_rows = list(reader)

# Pull existing alts from store
from shopify_admin import ShopifyAdmin

print('Refreshing existing-alt data from Shopify...')
with ShopifyAdmin() as s:
    products = s.list_all_products(fields=[
        'id title handle vendor status media(first:20){nodes{id alt mediaContentType}}'
    ])

# Build map: media_id -> existing alt
existing_alts = {}
for p in products:
    media = (p.get('media') or {}).get('nodes') or []
    for m in media:
        existing_alts[m['id']] = m.get('alt') or ''

# Add existing_alt to each target row
diff_categories = {
    'empty_to_new': [],       # currently empty, generator adds
    'thin_to_thick': [],      # currently thin (~40 chars), generator adds features
    'thick_to_thin': [],      # currently detailed, generator would shorten
    'different_lens': [],     # different content but similar length
}
for r in target_rows:
    mid = r['media_id']
    new_alt = r['new_alt']
    old_alt = existing_alts.get(mid, '')
    r['actual_old_alt'] = old_alt
    r['actual_old_len'] = len(old_alt)
    if not old_alt:
        diff_categories['empty_to_new'].append(r)
    elif old_alt == new_alt:
        pass  # same, skip
    elif len(old_alt) > 100 and len(new_alt) < len(old_alt):
        diff_categories['thick_to_thin'].append(r)
    elif len(new_alt) > len(old_alt):
        diff_categories['thin_to_thick'].append(r)
    else:
        diff_categories['different_lens'].append(r)

print(f'\nDiff categorization:')
for cat, items in diff_categories.items():
    print(f'  {cat}: {len(items)}')

print()
print('=== thick_to_thin samples (DO NOT OVERWRITE - existing is better):')
for r in diff_categories['thick_to_thin'][:5]:
    print(f"\n  {r['handle']} pos={r['position']}:")
    print(f"    OLD ({r['actual_old_len']} chars): {r['actual_old_alt']!r}")
    print(f"    NEW ({len(r['new_alt'])} chars): {r['new_alt']!r}")

print('\n=== thin_to_thick samples (worth updating):')
for r in diff_categories['thin_to_thick'][:5]:
    print(f"\n  {r['handle']} pos={r['position']}:")
    print(f"    OLD ({r['actual_old_len']} chars): {r['actual_old_alt']!r}")
    print(f"    NEW ({len(r['new_alt'])} chars): {r['new_alt']!r}")
