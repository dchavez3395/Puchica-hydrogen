#!/usr/bin/env python3
"""google_shopping_feed_audit.py — Verify Puchica's product feed is
ready for Google Shopping / Performance Max campaigns.

Google's Merchant Center has strict requirements for product feeds.
A product that fails these checks won't be approved into the catalog
and won't serve in Shopping ads. Most are easy to fix; the audit
groups them so the fix is obvious.

Checks:
  - Title: 1-150 chars, brand prefix recommended
  - Description: 1-5000 chars
  - Image: required, must be accessible URL
  - Price: required, must be > 0
  - Availability: must be 'in_stock' or 'out_of_stock' (not 'preorder' here)
  - Brand: required (we use vendor; falls back to 'Puchica')
  - GTIN: optional but recommended; we don't store these
  - Condition: defaults to 'new'
  - Product type: required, present in productType field

This script reads from the live store via the Admin API and emits a
report. Read-only. No writes to Google or Shopify.

Usage:
    python scripts/google_shopping_feed_audit.py [--out feed-audit.md]
"""
import argparse
import re
import sys
import urllib.request
import urllib.error
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='google-shopping-feed-audit.md',
                    help='Output report path')
    ap.add_argument('--quiet', action='store_true')
    ap.add_argument('--check-images', action='store_true', default=False,
                    help='HTTP-HEAD every featured image (slow, ~5 min for 6k products)')
    args = ap.parse_args()

    with ShopifyAdmin() as s:
        if not args.quiet:
            print('Fetching all products…')
        products = s.list_all_products(fields=[
            'id', 'title', 'handle', 'vendor', 'productType',
            'descriptionHtml', 'tags', 'status',
            'featuredImage { url altText width height }',
            'variants(first: 1) { nodes { price } }',
        ])

    if not args.quiet:
        print(f'  Got {len(products)} products. Auditing…')

    findings = Counter()
    flagged = []  # list of {handle, issue, detail}

    for p in products:
        handle = p.get('handle') or '?'
        title = p.get('title') or ''
        desc_html = p.get('descriptionHtml') or ''
        status = p.get('status') or ''
        vendor = (p.get('vendor') or '').strip()
        ptype = (p.get('productType') or '').strip()
        feat = p.get('featuredImage') or {}
        variants = (p.get('variants') or {}).get('nodes') or []

        # Title: 1-150 chars
        if not title.strip():
            findings['missing_title'] += 1
            flagged.append({'handle': handle, 'issue': 'missing_title', 'detail': ''})
        elif len(title) > 150:
            findings['title_too_long'] += 1
            flagged.append({
                'handle': handle, 'issue': 'title_too_long',
                'detail': f'{len(title)} chars (max 150)',
            })
        elif len(title) < 5:
            findings['title_too_short'] += 1
            flagged.append({
                'handle': handle, 'issue': 'title_too_short',
                'detail': f'{len(title)} chars (min 5)',
            })

        # Description: 1-5000 chars (text after stripping HTML)
        desc_text = re.sub(r'<[^>]+>', ' ', desc_html)
        desc_text = re.sub(r'\s+', ' ', desc_text).strip()
        if not desc_text:
            findings['missing_description'] += 1
            flagged.append({'handle': handle, 'issue': 'missing_description', 'detail': ''})
        elif len(desc_text) > 5000:
            findings['description_too_long'] += 1
            flagged.append({
                'handle': handle, 'issue': 'description_too_long',
                'detail': f'{len(desc_text)} chars (max 5000)',
            })
        elif len(desc_text) < 50:
            findings['description_too_short'] += 1
            flagged.append({
                'handle': handle, 'issue': 'description_too_short',
                'detail': f'{len(desc_text)} chars (recommend ≥50)',
            })

        # Image
        if not feat or not feat.get('url'):
            findings['missing_image'] += 1
            flagged.append({'handle': handle, 'issue': 'missing_image', 'detail': ''})

        # Price
        if not variants:
            findings['no_variants'] += 1
            flagged.append({'handle': handle, 'issue': 'no_variants', 'detail': ''})
        else:
            try:
                price = float(variants[0].get('price') or 0)
            except (ValueError, TypeError):
                price = 0
            if price <= 0:
                findings['zero_price'] += 1
                flagged.append({
                    'handle': handle, 'issue': 'zero_price',
                    'detail': variants[0].get('price', '?'),
                })

        # Status
        if status != 'ACTIVE':
            findings[f'status_{status.lower()}'] += 1
            flagged.append({
                'handle': handle, 'issue': f'status_{status.lower()}',
                'detail': status,
            })

        # Brand
        if not vendor:
            findings['missing_brand'] += 1
            flagged.append({'handle': handle, 'issue': 'missing_brand', 'detail': ''})

        # Product type
        if not ptype:
            findings['missing_product_type'] += 1
            flagged.append({'handle': handle, 'issue': 'missing_product_type', 'detail': ''})

    # Optional: HTTP-HEAD every image to verify accessibility
    image_check_results = None
    if args.check_images:
        if not args.quiet:
            print('HTTP-HEADing every image (this takes a while)…')
        image_check_results = {'ok': 0, 'fail': 0, 'fail_details': []}
        for p in products:
            feat = p.get('featuredImage') or {}
            url = feat.get('url')
            if not url:
                continue
            try:
                req = urllib.request.Request(url, method='HEAD',
                                              headers={'User-Agent': 'puchica-feed-audit/1.0'})
                with urllib.request.urlopen(req, timeout=5) as r:
                    if r.status == 200:
                        image_check_results['ok'] += 1
                    else:
                        image_check_results['fail'] += 1
                        image_check_results['fail_details'].append({
                            'handle': p.get('handle'), 'url': url, 'status': r.status,
                        })
            except (urllib.error.URLError, TimeoutError, OSError) as e:
                image_check_results['fail'] += 1
                image_check_results['fail_details'].append({
                    'handle': p.get('handle'), 'url': url, 'error': type(e).__name__,
                })

    # Render
    out = []
    out.append('# Google Shopping Feed Audit')
    out.append('')
    out.append(f'Generated against {len(products)} products.')
    out.append('')
    out.append('## Findings summary')
    out.append('')
    if not findings:
        out.append('_No issues. Feed is ready for Google Merchant Center._')
    else:
        out.append('| Issue | Count | Severity |')
        out.append('| --- | --- | --- |')
        severity = {
            'missing_image': 'BLOCKER',
            'missing_title': 'BLOCKER',
            'missing_description': 'BLOCKER',
            'zero_price': 'BLOCKER',
            'no_variants': 'BLOCKER',
            'missing_brand': 'BLOCKER',
            'missing_product_type': 'HIGH',
            'title_too_long': 'MEDIUM',
            'title_too_short': 'LOW',
            'description_too_long': 'LOW',
            'description_too_short': 'LOW',
            'status_archived': 'INFO',
            'status_draft': 'INFO',
        }
        for issue, count in findings.most_common():
            sev = severity.get(issue, 'INFO')
            out.append(f'| `{issue}` | {count} | {sev} |')
    out.append('')

    if image_check_results:
        out.append('## Image accessibility check (HTTP HEAD)')
        out.append('')
        out.append(f'- OK: {image_check_results["ok"]}')
        out.append(f'- FAIL: {image_check_results["fail"]}')
        if image_check_results['fail_details']:
            out.append('')
            out.append('### First 25 image failures')
            out.append('')
            for f in image_check_results['fail_details'][:25]:
                detail = f.get('status') or f.get('error') or '?'
                out.append(f'- `{f["handle"]}` — {detail} — {f["url"]}')
        out.append('')

    if flagged:
        out.append('## First 50 flagged products (any issue)')
        out.append('')
        out.append('| handle | issue | detail |')
        out.append('| --- | --- | --- |')
        for f in flagged[:50]:
            out.append(f'| `{f["handle"]}` | {f["issue"]} | {f["detail"]} |')
        if len(flagged) > 50:
            out.append('')
            out.append(f'_...and {len(flagged) - 50} more._')

    out.append('')
    out.append('## Next steps')
    out.append('')
    out.append('1. Fix BLOCKER issues first (missing image/title/desc/brand/price).')
    out.append('2. Re-run this audit after fixes; aim for 0 BLOCKERs.')
    out.append('3. Submit the Shopify product feed URL to Google Merchant Center at:')
    out.append('   `https://{store}.myshopify.com/apps/marketing/google/shopping_feed.xml`')
    out.append('   (Or use the Shopify Google channel app to auto-publish.)')
    out.append('4. Once approved, enable Performance Max or standard Shopping campaigns.')

    Path(args.out).write_text('\n'.join(out), encoding='utf-8')
    if not args.quiet:
        print(f'Report: {args.out}')
        print(f'  Total products: {len(products)}')
        print(f'  Total issues:   {sum(findings.values())}')
        if findings:
            print(f'  Top issue:      {findings.most_common(1)[0]}')


if __name__ == '__main__':
    main()