#!/usr/bin/env python3
"""sales_channels_audit.py — Check which sales channels are installed
on the Puchica Shopify store, which products are published to each,
and identify any channels that aren't connected.

Output: sales-channels-2026-06-29.md with full breakdown.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin  # noqa: E402


def main():
    with ShopifyAdmin() as s:
        # Use the channels connection (not publications) to see each
        # channel's product listings
        all_channels = []
        after = None
        while True:
            d3 = s.gql('''
            query($after: String) {
              channels(first: 50, after: $after) {
                edges {
                  node {
                    id name handle
                  }
                }
                pageInfo { hasNextPage endCursor }
              }
            }
            ''', {'after': after})
            for e in (d3.get('channels') or {}).get('edges', []):
                all_channels.append(e['node'])
            pi = (d3.get('channels') or {}).get('pageInfo', {})
            if not pi.get('hasNextPage'):
                break
            after = pi.get('endCursor')
            if not after:
                break

    print(f'Total channels found: {len(all_channels)}')
    out = []
    out.append('# Sales Channels Audit (2026-06-29)')
    out.append('')
    out.append('Sales channels let Puchica list products on multiple platforms from one Shopify backend. More channels = more surface area for sales.')
    out.append('')
    out.append('## Current channels')
    out.append('')
    out.append('| ID | Name | Handle | Products published |')
    out.append('| --- | --- | --- | ---:|')
    for c in all_channels:
        out.append(f"| `{c['id']}` | {c.get('name', '')} | `{c.get('handle', '')}` | (read_publications scope needed) |")
    out.append('')

    # Recommendations
    out.append('## Recommended channels to add')
    out.append('')
    out.append('Channels that connect directly to high-traffic marketplaces or social platforms:')
    out.append('')
    recs = [
        ('TikTok Shop', 'REQUIRED if "we have access to post from the tiktok app" — install TikTok channel in Shopify admin'),
        ('Facebook & Instagram', 'Meta Commerce channel for FB Shop + IG Shopping'),
        ('Google & YouTube', 'Google channel — already implied by Google Shopping feed work today'),
        ('Pinterest', 'Pinterest Sales channel — high purchase-intent audience'),
        ('Snapchat', 'Snapchat Sales channel — younger demographic'),
        ('Amazon', 'Amazon by Bazaarvoice / Amazon MCF — major marketplace'),
        ('Etsy', 'Etsy Marketplace Integration — niche buyers, high AOV'),
        ('Walmart', 'Walmart Marketplace — competing with Amazon for mass-market'),
        ('eBay', 'eBay channel — auction/buyer pool'),
    ]
    out.append('| Channel | Why install |')
    out.append('| --- | --- |')
    for ch, why in recs:
        out.append(f'| {ch} | {why} |')
    out.append('')

    # Existing known channels
    out.append('## Existing sales channels (likely present)')
    out.append('')
    known = ['Online Store', 'Point of Sale', 'Shop', 'Facebook & Instagram']
    for k in known:
        present = any(k.lower() in (c.get('name', '') or '').lower() for c in all_channels)
        out.append(f"- **{k}**: {'✓ present' if present else '✗ not found'}")
    out.append('')

    Path('sales-channels-2026-06-29.md').write_text('\n'.join(out), encoding='utf-8')
    print(f'\nReport: sales-channels-2026-06-29.md')


if __name__ == '__main__':
    main()