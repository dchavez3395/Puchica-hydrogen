#!/usr/bin/env python3
"""description_quality_audit.py — Score current description quality
across the catalog and surface rewrite priorities.

Quality scoring:
  0-50 chars: too short, basic info
  50-200 chars: minimal, OK for low-stakes products
  200-1000 chars: ideal range for SEO
  1000-5000 chars: long-form, OK if readable
  >5000 chars: too long, Google truncates

Bonus criteria:
  - Has bullet points or <ul>: +10
  - Mentions productType or category: +10
  - Has call-to-action ("buy", "shop", "order"): +10
  - Has shipping info ("free shipping", "fast"): +5
  - Has Canadian keywords ("Canada", "Canadian"): +5

Output: description-quality-2026-06-29.md with rewrite priority list.
"""
import argparse
import re
import statistics
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin  # noqa: E402


def score(desc, product_type):
    """Quality score 0-100."""
    if not desc:
        return 0
    text = re.sub(r'<[^>]+>', '', desc).strip()
    n = len(text)
    # Length scoring
    if n < 50:
        score = 10
    elif n < 200:
        score = 30
    elif n < 1000:
        score = 70
    elif n < 5000:
        score = 80
    else:
        score = 50  # too long
    # Bonus points
    if '<ul' in desc.lower() or '<li' in desc.lower():
        score += 10
    if 'buy' in text.lower() or 'shop now' in text.lower() or 'order now' in text.lower():
        score += 10
    if 'free shipping' in text.lower() or 'fast shipping' in text.lower():
        score += 5
    if 'canada' in text.lower() or 'canadian' in text.lower():
        score += 5
    if product_type and product_type.lower() in text.lower():
        score += 10
    return min(100, score)


def main():
    with ShopifyAdmin() as s:
        print('Fetching products…')
        products = s.list_all_products(fields=[
            'id', 'title', 'handle', 'productType', 'descriptionHtml', 'status',
        ])

    rows = []
    for p in products:
        if p.get('status') != 'ACTIVE':
            continue
        desc = p.get('descriptionHtml') or ''
        text = re.sub(r'<[^>]+>', '', desc).strip()
        s_score = score(desc, p.get('productType') or '')
        rows.append({
            'id': p['id'].split('/')[-1],
            'handle': p['handle'],
            'title': (p.get('title') or '')[:80],
            'productType': p.get('productType') or '',
            'desc_len': len(text),
            'quality_score': s_score,
            'priority': 'high' if s_score < 50 else 'medium' if s_score < 70 else 'low',
        })

    # Stats by category
    by_cat_count = Counter(r['productType'] for r in rows)
    by_cat_low = Counter(r['productType'] for r in rows if r['quality_score'] < 50)
    print(f'Total active products: {len(rows)}')
    print(f'  Low quality (score <50): {sum(1 for r in rows if r["quality_score"] < 50)}')
    print(f'  Medium (50-69): {sum(1 for r in rows if 50 <= r["quality_score"] < 70)}')
    print(f'  High (70+): {sum(1 for r in rows if r["quality_score"] >= 70)}')
    print(f'  Median description length: {statistics.median(r["desc_len"] for r in rows):.0f} chars')

    # Per-category breakdown
    out = []
    out.append('# Description Quality Audit (2026-06-29)')
    out.append('')
    out.append(f'## Overall stats')
    out.append('')
    out.append(f'- Total active products: {len(rows)}')
    out.append(f'- Low quality (<50): {sum(1 for r in rows if r["quality_score"] < 50)}')
    out.append(f'- Medium (50-69): {sum(1 for r in rows if 50 <= r["quality_score"] < 70)}')
    out.append(f'- High (70+): {sum(1 for r in rows if r["quality_score"] >= 70)}')
    out.append(f'- Median description length: {statistics.median(r["desc_len"] for r in rows):.0f} chars')
    out.append('')

    out.append('## By category')
    out.append('')
    out.append('| productType | total | low quality | % |')
    out.append('| --- | ---:| ---:| ---:|')
    for cat in sorted(by_cat_count.keys(), key=lambda c: -by_cat_low.get(c, 0)):
        total = by_cat_count[cat]
        low = by_cat_low.get(cat, 0)
        pct = low / total * 100 if total else 0
        out.append(f'| {cat} | {total} | {low} | {pct:.0f}% |')
    out.append('')

    out.append('## Rewrite priority: top 100 by score (worst first)')
    out.append('')
    out.append('| score | length | handle | productType |')
    out.append('| ---:| ---:| --- | --- |')
    for r in sorted(rows, key=lambda x: x['quality_score'])[:100]:
        out.append(f"| {r['quality_score']} | {r['desc_len']} | `{r['handle']}` | {r['productType']} |")
    out.append('')

    Path('description-quality-2026-06-29.md').write_text('\n'.join(out), encoding='utf-8')
    print(f'\nReport: description-quality-2026-06-29.md')

    # Save the priority list for use by the rewrite script
    with open('description-rewrite-priority.csv', 'w', encoding='utf-8', newline='') as f:
        f.write('id,handle,title,productType,desc_len,quality_score,priority\n')
        for r in sorted(rows, key=lambda x: x['quality_score']):
            f.write(f'"{r["id"]}","{r["handle"]}","{r["title"].replace(chr(34), chr(39))}",'
                    f'"{r["productType"]}",{r["desc_len"]},{r["quality_score"]},{r["priority"]}\n')
    print('Priority CSV: description-rewrite-priority.csv')


if __name__ == '__main__':
    main()