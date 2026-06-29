#!/usr/bin/env python3
"""catalog_insights.py — Generate a markdown catalog health report.

Walks the full product catalog via the shopify_admin client and produces
a single report covering: SEO gaps, pricing outliers, inventory hygiene,
tag sparsity, image coverage. Idempotent — re-running won't change
store data.

Usage:
    python scripts/catalog_insights.py [--out report.md]
"""
import argparse
import json
import statistics
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='catalog-insights.md',
                    help='output report path (default: catalog-insights.md)')
    ap.add_argument('--quiet', action='store_true',
                    help='suppress progress prints')
    args = ap.parse_args()

    findings = []
    shop_info = None

    with ShopifyAdmin() as s:
        # Cheap shop info first so we fail fast on auth issues
        shop_info = s.ping().get('shop') or {}

        # Section-by-section scans
        for section in [
            scan_seo(s, args),
            scan_pricing(s, args),
            scan_images(s, args),
            scan_status(s, args),
            scan_tags(s, args),
            scan_variants(s, args),
        ]:
            findings.append(section)

    report = render_markdown(shop_info, findings, args.out)
    Path(args.out).write_text(report, encoding='utf-8')
    if not args.quiet:
        print(f'Report written to {args.out}')
        # Print short summary
        for sec in findings:
            n = sec.get('total_count', '?')
            print(f'  {sec["title"]:.<40s} {n} products scanned, '
                  f'{len(sec["issues"])} issues')


# ----- Scan sections -----

def scan_seo(s: ShopifyAdmin, args) -> dict:
    issues = []
    total = 0
    fields = ['id', 'title', 'seo { title description }']
    for page in s.list_products(fields=fields):
        for p in page:
            total += 1
            seo_p = (p.get('seo') or {})
            t_missing = not (seo_p.get('title') or '').strip()
            d_missing = not (seo_p.get('description') or '').strip()
            if t_missing or d_missing:
                issues.append({
                    'id': p['id'].split('/')[-1],
                    'title': p['title'],
                    'title_missing': t_missing,
                    'desc_missing': d_missing,
                })
    return {
        'title': 'SEO coverage',
        'total_count': total,
        'issues': issues,
        'summary': lambda: (
            f'{sum(1 for i in issues if i["title_missing"])} missing seo.title, '
            f'{sum(1 for i in issues if i["desc_missing"])} missing seo.description'
        ),
    }


def scan_pricing(s: ShopifyAdmin, args) -> dict:
    issues = []
    total = 0
    prices = []
    fields = [
        'id', 'title', 'status',
        'seo { title description }',
        'variants(first: 100) { nodes { price } }',
    ]
    for page in s.list_products(fields=fields):
        for p in page:
            total += 1
            if p.get('status') != 'ACTIVE':
                continue
            variants = (p.get('variants') or {}).get('nodes') or []
            for v in variants:
                price = v.get('price')
                if price is None:
                    issues.append({
                        'id': p['id'].split('/')[-1], 'title': p['title'],
                        'kind': 'variant_no_price',
                        'detail': 'variant exists without price',
                    })
                    continue
                try:
                    pv = float(price)
                except ValueError:
                    issues.append({
                        'id': p['id'].split('/')[-1], 'title': p['title'],
                        'kind': 'variant_price_unparseable',
                        'detail': f'price={price!r}',
                    })
                    continue
                if pv <= 0:
                    issues.append({
                        'id': p['id'].split('/')[-1], 'title': p['title'],
                        'kind': 'variant_zero_price', 'detail': f'price=${pv}',
                    })
                prices.append(pv)
    outliers = []
    if len(prices) >= 30:
        med = statistics.median(prices)
        stdev = statistics.stdev(prices) if len(prices) > 1 else 0
        for v_issue in [i for i in issues if i.get('kind', '').startswith('variant')]:
            v_issue['outlier'] = False  # placeholder, refined below
        # Identify z-score outliers in the population
        if stdev > 0:
            for idx, p in enumerate(prices):
                z = abs((p - med) / stdev)
                if z > 4:
                    outliers.append({'price': p, 'z': round(z, 2), 'median': med, 'stdev': stdev})
    return {
        'title': 'Pricing',
        'total_count': total,
        'issues': issues,
        'extra': {
            'price_count': len(prices),
            'median_price': round(statistics.median(prices), 2) if prices else None,
            'min_price': min(prices) if prices else None,
            'max_price': max(prices) if prices else None,
            'outliers': outliers[:20],
        },
    }


def scan_images(s: ShopifyAdmin, args) -> dict:
    issues = []
    total = 0
    fields = [
        'id', 'title', 'status',
        'media(first: 1) { edges { node { id } } }',
        'featuredImage { url }',
    ]
    for page in s.list_products(fields=fields):
        for p in page:
            total += 1
            if p.get('status') != 'ACTIVE':
                continue
            has_media = bool((p.get('media') or {}).get('edges'))
            has_featured = bool(p.get('featuredImage'))
            if not (has_media or has_featured):
                issues.append({
                    'id': p['id'].split('/')[-1], 'title': p['title'],
                    'kind': 'no_image',
                })
    return {'title': 'Image coverage', 'total_count': total, 'issues': issues}


def scan_status(s: ShopifyAdmin, args) -> dict:
    issues = []
    total = 0
    by_status = Counter()
    fields = [
        'id', 'title', 'status', 'productType',
        'descriptionHtml',
        'media(first: 1) { edges { node { id } } }',
        'variants(first: 1) { nodes { price } }',
    ]
    for page in s.list_products(fields=fields):
        for p in page:
            total += 1
            by_status[p.get('status', '?')] += 1
            if p.get('status') != 'ACTIVE':
                continue
            desc = (p.get('descriptionHtml') or '').strip()
            has_media = bool((p.get('media') or {}).get('edges'))
            variants = (p.get('variants') or {}).get('nodes') or []
            no_price = not any(float(v.get('price') or 0) > 0 for v in variants)
            if not desc or not has_media or no_price:
                issues.append({
                    'id': p['id'].split('/')[-1], 'title': p['title'],
                    'kind': 'active_but_empty',
                    'missing': [
                        'desc' if not desc else None,
                        'media' if not has_media else None,
                        'price' if no_price else None,
                    ],
                })
            if p.get('productType') == 'Puchica':
                issues.append({
                    'id': p['id'].split('/')[-1], 'title': p['title'],
                    'kind': 'puchica_type_leak',
                })
    return {
        'title': 'Status hygiene',
        'total_count': total,
        'issues': issues,
        'extra': {'by_status': dict(by_status)},
    }


def scan_tags(s: ShopifyAdmin, args) -> dict:
    issues = []
    total = 0
    tag_counts = Counter()
    fields = ['id', 'title', 'tags']
    for page in s.list_products(fields=fields):
        for p in page:
            total += 1
            tags = p.get('tags') or []
            tag_counts[len(tags)] += 1
            if not tags:
                issues.append({
                    'id': p['id'].split('/')[-1], 'title': p['title'],
                    'kind': 'no_tags',
                })
    return {
        'title': 'Tag health',
        'total_count': total,
        'issues': issues,
        'extra': {'distribution': dict(tag_counts)},
    }


def scan_variants(s: ShopifyAdmin, args) -> dict:
    """Detect: variants marked available but qty<0 (real bug).

    Dropship normal: availableForSale=True, qty=0, inventoryPolicy=DENY.
    That's intentional — DON'T flag. Only flag negative inventory.
    """
    issues = []
    total = 0
    fields = [
        'id', 'title',
        'variants(first: 100) { nodes { id inventoryQuantity } }',
    ]
    for page in s.list_products(fields=fields):
        for p in page:
            total += 1
            variants = (p.get('variants') or {}).get('nodes') or []
            for v in variants:
                qty = v.get('inventoryQuantity')
                if qty is not None and qty < 0:
                    issues.append({
                        'id': p['id'].split('/')[-1], 'title': p['title'],
                        'kind': 'negative_inventory',
                        'detail': f'variant={v["id"].split("/")[-1]} qty={qty}',
                    })
    return {'title': 'Variant hygiene', 'total_count': total, 'issues': issues}


# ----- Render -----

def render_markdown(shop: dict, sections: list[dict], out: str) -> str:
    lines = []
    now = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')
    lines.append(f'# Catalog Insights Report')
    lines.append('')
    lines.append(f'Generated: {now}')
    if shop:
        lines.append(f'Shop: {shop.get("name")} ({shop.get("primaryDomain", {}).get("host")})')
    lines.append('')
    for sec in sections:
        title = sec['title']
        total = sec.get('total_count', 0)
        issues = sec.get('issues', [])
        extra = sec.get('extra', {})
        lines.append(f'## {title}')
        lines.append('')
        lines.append(f'- Products scanned: **{total}**')
        lines.append(f'- Issues: **{len(issues)}**')
        if extra.get('price_count'):
            lines.append(f'- Median price: ${extra["median_price"]}')
            lines.append(f'- Price range: ${extra["min_price"]}–${extra["max_price"]}')
        if extra.get('outliers'):
            lines.append(f'- Price outliers (|z|>4): {len(extra["outliers"])}')
        if extra.get('by_status'):
            lines.append(f'- Status distribution: {extra["by_status"]}')
        if extra.get('distribution'):
            lines.append(f'- Tag-count distribution: {extra["distribution"]}')
        lines.append('')
        if issues:
            lines.append('### First 25 issues')
            lines.append('')
            for i in issues[:25]:
                kind = i.get('kind', '?')
                detail = i.get('detail', '')
                title_m = i.get('title_missing')
                desc_m = i.get('desc_missing')
                missing = i.get('missing')
                bits = []
                if title_m: bits.append('title')
                if desc_m: bits.append('desc')
                if missing: bits.append(','.join(x for x in missing if x))
                if kind in ('variant_no_price', 'variant_zero_price',
                            'variant_price_unparseable'):
                    bits.append(kind.replace('variant_', ''))
                bits.append(kind if kind not in ('variant_no_price',) else '')
                if detail: bits.append(detail)
                bits_str = ', '.join(b for b in bits if b)
                lines.append(f'- `{pid_of(i)}` **{i.get("title", "?")[:60]}** — {bits_str}')
            if len(issues) > 25:
                lines.append('')
                lines.append(f'_...and {len(issues) - 25} more issues (not shown)_')
        else:
            lines.append('_No issues._')
        lines.append('')
    return '\n'.join(lines) + '\n'


def pid_of(issue: dict) -> str:
    return issue.get('id', '?')[-8:]  # last 8 chars of gid


if __name__ == '__main__':
    main()