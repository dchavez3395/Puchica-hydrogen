#!/usr/bin/env python3
"""handle_audit.py — Audit product handle quality for SEO URL friendliness.

Best practices for product URL slugs:
- Lowercase
- Hyphens (not underscores)
- No redundant words (the, a, with, etc.)
- 3-5 words (50-80 chars)
- Include primary keyword
- No special chars / emojis / numbers (mostly)

This script:
1. Fetches every product handle
2. Scores it on these criteria
3. Surfaces the worst offenders

Output: handle-audit-2026-06-29.md + .csv
"""
import csv
import re
import statistics
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin  # noqa: E402

REDUNDANT_WORDS = {'the', 'a', 'an', 'with', 'for', 'of', 'and', 'or', 'in', 'on', 'to', 'by'}

def score_handle(handle):
    """Score 0-100. Higher = more SEO-friendly."""
    if not handle:
        return 0
    score = 100

    # Length: ideal 30-80 chars
    n = len(handle)
    if n < 10:
        score -= 30
    elif n > 100:
        score -= 40
    elif n > 80:
        score -= 20

    # Word count
    words = handle.split('-')
    if len(words) < 2:
        score -= 30
    elif len(words) > 8:
        score -= 20

    # Redundant words
    for w in words:
        if w.lower() in REDUNDANT_WORDS:
            score -= 5

    # Has numbers (often OK for SKU-like handles, but generally noise)
    if re.search(r'\d{4,}', handle):
        score -= 10

    # Has uppercase (should be lowercase)
    if any(c.isupper() for c in handle):
        score -= 20

    # Has special chars (emoji / non-ASCII)
    if not all(ord(c) < 128 for c in handle):
        score -= 30

    # Underscores instead of hyphens
    if '_' in handle:
        score -= 30

    # Ends in numbers (often preorder / variant suffix)
    if re.search(r'-\d+$', handle):
        score -= 15

    # Has '-new-', '-preorder-', '-sale-'
    if any(x in handle for x in ['-new', '-preorder', '-sale', '-clearance']):
        score -= 10

    # Has long redundant suffix like '-1', '-2'
    if re.search(r'-\d+$', handle):
        score -= 10

    return max(0, score)


def main():
    with ShopifyAdmin() as s:
        print('Fetching products…')
        products = s.list_all_products(fields=[
            'id', 'title', 'handle', 'productType', 'status',
        ])

    rows = []
    for p in products:
        if p.get('status') != 'ACTIVE':
            continue
        h = p.get('handle') or ''
        s_score = score_handle(h)
        rows.append({
            'id': p['id'].split('/')[-1],
            'handle': h,
            'title': (p.get('title') or '')[:80],
            'productType': p.get('productType') or '',
            'length': len(h),
            'word_count': len(h.split('-')) if h else 0,
            'score': s_score,
            'priority': 'high' if s_score < 50 else 'medium' if s_score < 70 else 'low',
        })

    # Stats
    by_score = Counter(r['priority'] for r in rows)
    print(f'Total: {len(rows)}')
    print(f'  High priority (score<50): {by_score["high"]}')
    print(f'  Medium (50-69): {by_score["medium"]}')
    print(f'  Low (70+): {by_score["low"]}')
    print(f'  Median length: {statistics.median(r["length"] for r in rows):.0f}')
    print(f'  Median word count: {statistics.median(r["word_count"] for r in rows):.0f}')

    # Common issues
    issues = Counter()
    for r in rows:
        if re.search(r'\d{4,}', r['handle']):
            issues['long_numbers'] += 1
        if any(c.isupper() for c in r['handle']):
            issues['uppercase'] += 1
        if '_' in r['handle']:
            issues['underscores'] += 1
        if not all(ord(c) < 128 for c in r['handle']):
            issues['non_ascii'] += 1
        if r['length'] > 100:
            issues['too_long'] += 1
        if r['word_count'] > 8:
            issues['too_many_words'] += 1
        if re.search(r'-\d+$', r['handle']):
            issues['ends_in_number'] += 1

    print('\nCommon issues:')
    for k, v in issues.most_common():
        print(f'  {k}: {v}')

    # Write CSV (priority order)
    out_csv = Path('handle-audit-2026-06-29.csv')
    with out_csv.open('w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'id', 'handle', 'title', 'productType',
            'length', 'word_count', 'score', 'priority',
        ])
        writer.writeheader()
        for r in sorted(rows, key=lambda x: x['score']):
            writer.writerow(r)
    print(f'\nCSV: {out_csv}')

    # Write Markdown
    md = []
    md.append('# Product Handle Audit (2026-06-29)')
    md.append('')
    md.append(f'## Summary')
    md.append('')
    md.append(f'- Total active products: {len(rows)}')
    md.append(f'- High priority (score<50): {by_score["high"]}')
    md.append(f'- Medium (50-69): {by_score["medium"]}')
    md.append(f'- Low (70+): {by_score["low"]}')
    md.append('')
    md.append('## Common issues')
    md.append('')
    md.append('| Issue | Count |')
    md.append('| --- | ---:|')
    for k, v in issues.most_common():
        md.append(f'| {k} | {v} |')
    md.append('')
    md.append('## Worst 50 handles (lowest score)')
    md.append('')
    md.append('| score | handle | length | words |')
    md.append('| ---:| --- | ---:| ---:|')
    for r in sorted(rows, key=lambda x: x['score'])[:50]:
        md.append(f"| {r['score']} | `{r['handle'][:80]}` | {r['length']} | {r['word_count']} |")
    md.append('')
    Path('handle-audit-2026-06-29.md').write_text('\n'.join(md), encoding='utf-8')
    print(f'Markdown: handle-audit-2026-06-29.md')


if __name__ == '__main__':
    main()