#!/usr/bin/env python3
"""google_shopping_feed_fix.py — Fix BLOCKER + LOW issues found by
google_shopping_feed_audit.py.

Reads the audit CSV output, fixes:
  1. missing_description: generate a minimal description from the
     product title + productType + tags (150-300 chars). These
     are BLOCKER — Google won't list products with no description.
  2. description_too_long: trim to 4990 chars, ending at the last
     full sentence boundary before that mark.

Output: writes back via productUpdate, dry-run by default.

Usage:
    python scripts/google_shopping_feed_fix.py --dry-run
    python scripts/google_shopping_feed_fix.py --confirm
"""
import argparse
import re
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin, ShopifyGraphQLError  # noqa: E402

MAX_LEN = 4990


def make_minimal_description(title, product_type, tags):
    """Generate a minimal but SEO-friendly description for products
    that have none. ~250 chars."""
    tag_str = ''
    if tags:
        # Pick top 5 short tags
        clean = [t.strip() for t in tags if t and len(t) < 25][:5]
        if clean:
            tag_str = ' Features: ' + ', '.join(clean) + '.'
    pt = product_type or ''
    intro = f"Shop the {title}"
    if pt:
        intro += f" — a {pt} from Puchica."
    else:
        intro += " from Puchica."
    return intro + tag_str + " Fast shipping. Canadian-owned. Free returns within 30 days."


def trim_description(desc):
    """Trim a long description to MAX_LEN chars, ending at the last
    full sentence boundary. Falls back to last space if no sentence
    boundary is found."""
    if len(desc) <= MAX_LEN:
        return desc
    truncated = desc[:MAX_LEN]
    # Find last '.', '!', or '?' before MAX_LEN
    matches = list(re.finditer(r'[.!?]', truncated))
    if matches:
        return truncated[:matches[-1].end()].strip()
    # No sentence boundary — cut at last space to avoid mid-word break
    last_space = truncated.rfind(' ')
    if last_space > MAX_LEN * 0.8:  # only if we keep at least 80% of content
        return truncated[:last_space].rstrip() + '.'
    return truncated.rstrip() + '...'

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry-run', action='store_true', default=True)
    ap.add_argument('--confirm', action='store_true')
    ap.add_argument('--max-len', type=int, default=MAX_LEN)
    args = ap.parse_args()
    if args.confirm:
        args.dry_run = False

    with ShopifyAdmin() as s:
        print('Fetching products…')
        products = s.list_all_products(fields=[
            'id', 'title', 'handle', 'productType', 'tags', 'descriptionHtml',
            'status',
        ])

    to_fix = []
    for p in products:
        if p.get('status') != 'ACTIVE':
            continue
        desc = p.get('descriptionHtml') or ''
        desc_text = re.sub(r'<[^>]+>', '', desc).strip()  # strip HTML
        if not desc_text:
            to_fix.append({
                'id': p['id'],
                'handle': p['handle'],
                'title': p['title'],
                'productType': p.get('productType') or '',
                'tags': p.get('tags') or [],
                'issue': 'missing_description',
                'new_desc': make_minimal_description(p['title'], p.get('productType') or '',
                                                     p.get('tags') or []),
            })
        elif len(desc_text) > args.max_len:
            to_fix.append({
                'id': p['id'],
                'handle': p['handle'],
                'title': p['title'],
                'productType': p.get('productType') or '',
                'tags': p.get('tags') or [],
                'issue': 'description_too_long',
                'new_desc': trim_description(desc_text),
            })

    by_issue = {}
    for f in to_fix:
        by_issue[f['issue']] = by_issue.get(f['issue'], 0) + 1

    print(f'\nFixes to apply: {len(to_fix)}')
    for issue, n in by_issue.items():
        print(f'  {issue}: {n}')

    if args.dry_run:
        print('\nDRY RUN. First 10:')
        for f in to_fix[:10]:
            print(f"  {f['handle']:50s} {f['issue']:25s} new_len={len(f['new_desc'])}")
        print('\nPass --confirm to apply.')
        return

    fails = 0
    for f in to_fix:
        try:
            res = s.gql('''
            mutation pu($input: ProductInput!) {
              productUpdate(input: $input) {
                product { id }
                userErrors { field message }
              }
            }
            ''', {'input': {'id': f['id'], 'descriptionHtml': f['new_desc']}})
            errs = (res.get('productUpdate') or {}).get('userErrors') or []
            if errs:
                fails += 1
                print(f'  FAIL {f["handle"]}: {errs}')
            time.sleep(0.05)
        except ShopifyGraphQLError as e:
            fails += 1
            print(f'  ERR  {f["handle"]}: {e}')
    print(f'\nDone. {len(to_fix) - fails}/{len(to_fix)} ok.')


if __name__ == '__main__':
    main()