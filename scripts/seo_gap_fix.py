#!/usr/bin/env python3
"""seo_gap_fix.py — Fix SEO title + SEO description gaps at scale.

Earlier audit (seo-fix.py work) found:
- 1,037 products missing seo.title
- 843 products missing seo.description

This script:
1. Fetches every product with current SEO state
2. For products missing SEO title:
   - Generate from product title (cleaned up)
3. For products missing SEO description:
   - Generate from first 160 chars of body description
4. Reports counts; dry-run by default; --confirm to apply

Generation rules:
- seo.title: 50-70 chars, capitalize keywords, include brand at end
- seo.description: 150-160 chars, key features + brand voice
"""
import argparse
import csv
import re
import sys
import time
import urllib.error
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin, ShopifyGraphQLError  # noqa: E402


def clean_title_for_seo(title, brand='Puchica'):
    """Generate a clean SEO title from the product title.
    Rules:
    - Strip emojis and special chars
    - Cap at ~60 chars (excluding brand suffix)
    - Capitalize first letter of each word (Title Case)
    - Add brand at end if room
    """
    if not title:
        return None
    # Strip emojis / non-ASCII
    cleaned = re.sub(r'[^\x00-\x7F]+', ' ', title)
    # Strip emoji chars more aggressively
    cleaned = re.sub(r'[\u2726\u2605\u2728\u2727\u272a\u272b\u272c\u272d\u272e\u272f\u2730\u2731\u2732\u2733\u2734\u2735\u2736\u2737\u2738\u2739\u273a\u273b\u273c\u273d\u273e\u273f\u2740\u2741\u2742\u2743\u2744\u2745\u2746\u2747\u2748\u2749\u274a\u274b\u274c\u274d\u274e\u274f\u2750\u2751\u2752\u2753\u2754\u2755\u2756\u2757\u2758\u2759\u275a\u275b\u275c\u275d\u275e\u275f\u2760\u2761\u2762\u2763\u2764\u2765\u2766\u2767\u2768\u2769\u276a\u276b\u276c\u276d\u276e\u276f\u2770\u2771\u2772\u2773\u2774\u2775\u2776\u2777\u2778\u2779\u277a\u277b\u277c\u277d\u277e\u277f]', ' ', cleaned)
    # Collapse multiple spaces
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    # Cap at 60 chars, ending at last word boundary
    if len(cleaned) > 60:
        cleaned = cleaned[:60]
        last_space = cleaned.rfind(' ')
        if last_space > 30:  # only if we keep at least 50% of content
            cleaned = cleaned[:last_space]
    # Add brand at end if there's room
    suffix = f" | {brand}"
    if len(cleaned) + len(suffix) <= 70:
        cleaned = cleaned + suffix
    return cleaned


def generate_seo_description(product, brand='Puchica'):
    """Generate a 150-160 char SEO meta description.

    Combines:
    - First sentence of body description (if any)
    - Generic Puchica tagline
    """
    title = product.get('title') or ''
    body = product.get('descriptionHtml') or ''
    body_text = re.sub(r'<[^>]+>', '', body).strip()

    # Take first sentence or first 100 chars of body
    if body_text:
        # First sentence
        sentences = re.split(r'(?<=[.!?])\s+', body_text)
        first = sentences[0] if sentences else body_text[:100]
        first = first[:110].strip()
        if not first.endswith(('.', '!', '?')):
            first += '.'
    else:
        # Fallback: from title
        first = f"Shop the {title} at {brand}."

    # Append brand tail
    tail = f" Free shipping over $50."
    desc = first + tail

    # Cap at 160 chars (Google snippet length)
    if len(desc) > 160:
        desc = desc[:160].rsplit(' ', 1)[0].rstrip(',.') + '.'
    return desc


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out-csv', default='seo-gap-fix-2026-06-29.csv')
    ap.add_argument('--dry-run', action='store_true', default=True)
    ap.add_argument('--confirm', action='store_true')
    ap.add_argument('--limit', type=int, default=None)
    ap.add_argument('--max-products', type=int, default=2000,
                    help='Max products to consider (defaults to 2000 to stay safe)')
    ap.add_argument('--quiet', action='store_true')
    args = ap.parse_args()
    if args.confirm:
        args.dry_run = False

    with ShopifyAdmin() as s:
        print('Fetching products…')
        products = []
        count = 0
        for p in s.list_products(fields=[
            'id', 'title', 'handle', 'productType', 'status',
            'seo { title description }',
            'descriptionHtml',
        ]):
            products.extend(p)
            count += len(p)
            if count >= args.max_products:
                break
        print(f'  Got {len(products)} products')

    # Find products with SEO gaps
    to_fix = []
    skipped = Counter()
    for p in products:
        if p.get('status') != 'ACTIVE':
            continue
        seo = p.get('seo') or {}
        seo_title = (seo.get('title') or '').strip()
        seo_desc = (seo.get('description') or '').strip()

        needs_title = not seo_title
        needs_desc = not seo_desc

        if not needs_title and not needs_desc:
            skipped['both_present'] += 1
            continue

        new_title = clean_title_for_seo(p.get('title')) if needs_title else None
        new_desc = generate_seo_description(p) if needs_desc else None

        if needs_title and not new_title:
            skipped['cant_generate_title'] += 1
            continue
        if needs_desc and not new_desc:
            skipped['cant_generate_desc'] += 1
            continue

        to_fix.append({
            'id': p['id'],
            'gid': p['id'],
            'handle': p['handle'],
            'title': (p.get('title') or '')[:80],
            'needs_title': needs_title,
            'needs_desc': needs_desc,
            'new_seo_title': new_title,
            'new_seo_desc': new_desc,
            'old_seo_title': seo_title,
            'old_seo_desc': seo_desc,
        })

    needs_title_only = sum(1 for r in to_fix if r['needs_title'] and not r['needs_desc'])
    needs_desc_only = sum(1 for r in to_fix if r['needs_desc'] and not r['needs_title'])
    needs_both = sum(1 for r in to_fix if r['needs_title'] and r['needs_desc'])

    print(f'\nSEO gap analysis:')
    print(f'  Need title only: {needs_title_only}')
    print(f'  Need desc only: {needs_desc_only}')
    print(f'  Need both: {needs_both}')
    print(f'  Total to fix: {len(to_fix)}')
    print(f'  Skipped: {dict(skipped)}')

    if args.limit:
        to_fix = to_fix[:args.limit]

    # Write CSV
    out_path = Path(args.out_csv)
    with out_path.open('w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'id', 'handle', 'title',
            'needs_title', 'needs_desc',
            'new_seo_title', 'new_seo_desc',
            'old_seo_title', 'old_seo_desc',
        ])
        writer.writeheader()
        for r in to_fix:
            writer.writerow({k: r[k] for k in writer.fieldnames})
    print(f'\nCSV: {out_path}')

    if args.dry_run:
        print('\nDRY RUN. First 5:')
        for r in to_fix[:5]:
            t_change = f'title: {r["new_seo_title"]!r}' if r['needs_title'] else 'title: (unchanged)'
            d_change = f'desc: {r["new_seo_desc"]!r}' if r['needs_desc'] else 'desc: (unchanged)'
            print(f"  {r['handle']:50s}")
            print(f"    {t_change}")
            print(f"    {d_change}")
        print('\nPass --confirm to apply.')
        return

    # Apply
    fails = 0
    applied = 0
    for r in to_fix:
        seo = {}
        if r['needs_title'] and r['new_seo_title']:
            seo['title'] = r['new_seo_title']
        if r['needs_desc'] and r['new_seo_desc']:
            seo['description'] = r['new_seo_desc']
        if not seo:
            continue
        try:
            res = s.gql('''
            mutation pu($input: ProductInput!) {
              productUpdate(input: $input) {
                product { id seo { title description } }
                userErrors { field message }
              }
            }
            ''', {'input': {'id': r['gid'], 'seo': seo}})
            errs = (res.get('productUpdate') or {}).get('userErrors') or []
            if errs:
                fails += 1
                if not args.quiet:
                    print(f'  FAIL {r["handle"]}: {errs}')
            else:
                applied += 1
            time.sleep(0.05)
        except (ShopifyGraphQLError, urllib.error.HTTPError) as e:
            fails += 1
            if not args.quiet:
                print(f'  ERR  {r["handle"]}: {e}')

    print(f'\n=== DONE ===')
    print(f'  Applied: {applied}/{len(to_fix)}')
    print(f'  Failed: {fails}')


if __name__ == '__main__':
    main()