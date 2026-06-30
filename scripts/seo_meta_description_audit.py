#!/usr/bin/env python3
"""seo_meta_description_audit.py — Audit SEO meta description quality.

seo_gap_fix.py confirmed 100% of products have seo.title and
seo.description. But "present" doesn't mean "good".

This script audits quality:
- Length: 70-160 chars (Google truncates at ~160)
- Generic / templated text (low information density)
- Identical descriptions across many products (signals bulk
  templated generation, not real optimization)

Output: seo-meta-description-audit-{date}.md
"""
import re
import statistics
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin  # noqa: E402


def quality_score(desc, title):
    """Score 0-100. Higher = better SEO snippet."""
    if not desc:
        return 0
    n = len(desc)
    score = 100

    # Length penalties
    if n < 50:
        score -= 30
    elif n < 70:
        score -= 15
    elif n > 160:
        score -= 25
    elif n > 155:
        score -= 10

    # Generic / templated phrases
    GENERIC = ['high quality', 'best price', 'free shipping',
                'shop now', 'buy now', 'order now', 'on sale',
                'best seller', 'top quality', 'high quality',
                'guaranteed', 'satisfaction guaranteed']
    blob = desc.lower()
    for g in GENERIC:
        if g in blob:
            score -= 10

    # Has CTA
    if any(k in blob for k in ['buy', 'shop', 'order', 'get', 'find']):
        score += 5
    else:
        score -= 5

    # Reuse of title words (signal of relevance)
    if title:
        title_words = set(w.lower() for w in re.findall(r'\w+', title) if len(w) > 3)
        desc_words = set(w.lower() for w in re.findall(r'\w+', desc) if len(w) > 3)
        overlap = title_words & desc_words
        if overlap:
            score += min(10, len(overlap))

    return max(0, min(100, score))


def main():
    with ShopifyAdmin() as s:
        print('Fetching products with SEO…')
        products = s.list_all_products(fields=[
            'id', 'title', 'handle', 'status',
            'seo { title description }',
        ])

    rows = []
    for p in products:
        if p.get('status') != 'ACTIVE':
            continue
        seo = p.get('seo') or {}
        desc = (seo.get('description') or '').strip()
        title = (seo.get('title') or '').strip()
        s_score = quality_score(desc, p.get('title') or '')
        rows.append({
            'handle': p['handle'],
            'product_title': (p.get('title') or '')[:60],
            'seo_title': title,
            'seo_desc_len': len(desc),
            'seo_desc_score': s_score,
            'seo_desc_first_60': desc[:60],
        })

    print(f'Total active products: {len(rows)}')
    low_quality = [r for r in rows if r['seo_desc_score'] < 60]
    too_long = [r for r in rows if r['seo_desc_len'] > 160]
    too_short = [r for r in rows if 0 < r['seo_desc_len'] < 70]
    generic = [r for r in rows if any(g in r['seo_desc_first_60'].lower()
                                       for g in ['high quality', 'best price', 'free shipping'])]
    print(f'Low quality (<60): {len(low_quality)}')
    print(f'Too long (>160): {len(too_long)}')
    print(f'Too short (<70): {len(too_short)}')
    print(f'Generic first-60 phrases: {len(generic)}')

    # Sample for review
    out_path = Path('seo-meta-description-audit-2026-06-29.md')
    md = []
    md.append('# SEO Meta Description Audit (2026-06-29)')
    md.append('')
    md.append(f'## Summary')
    md.append('')
    md.append(f'- Active products: {len(rows)}')
    md.append(f'- Low quality score (<60): {len(low_quality)}')
    md.append(f'- Too long (>160 chars): {len(too_long)}')
    md.append(f'- Too short (<70 chars): {len(too_short)}')
    md.append(f'- Generic templates in first 60 chars: {len(generic)}')
    md.append('')
    if generic:
        md.append('## Generic templates (first 60 chars contain "high quality" / "best price" / "free shipping")')
        md.append('')
        md.append('| handle | title | first 60 |')
        md.append('| --- | --- | --- |')
        for r in generic[:30]:
            md.append(f"| `{r['handle']}` | {r['product_title']} | {r['seo_desc_first_60']!r} |")
        md.append('')
    if too_long:
        md.append('## Too long (>160 chars — Google truncates)')
        md.append('')
        md.append('| handle | length |')
        md.append('| --- | ---:|')
        for r in sorted(too_long, key=lambda x: -x['seo_desc_len'])[:20]:
            md.append(f"| `{r['handle']}` | {r['seo_desc_len']} |")
        md.append('')
    if too_short:
        md.append('## Too short (<70 chars — wasted real estate)')
        md.append('')
        md.append('| handle | length |')
        md.append('| --- | ---:|')
        for r in sorted(too_short, key=lambda x: x['seo_desc_len'])[:20]:
            md.append(f"| `{r['handle']}` | {r['seo_desc_len']} |")
        md.append('')
    out_path.write_text('\n'.join(md), encoding='utf-8')
    print(f'\nReport: {out_path}')


if __name__ == '__main__':
    main()