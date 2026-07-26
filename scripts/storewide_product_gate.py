#!/usr/bin/env python3
"""Build a read-only storewide product launch gate.

Outputs:
- docs/storewide-product-gate-YYYY-MM-DD.csv
- docs/storewide-product-gate-YYYY-MM-DD.md
- docs/storewide-variant-quote-worksheet-YYYY-MM-DD.csv

The script does not write to Shopify. It turns Admin product/variant data into
an operating ledger for DSers mapping, landed-cost, and launch decisions.
"""
from __future__ import annotations

import argparse
import csv
from datetime import date
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from pathlib import Path
import re
import sys

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin  # noqa: E402


LAUNCH_TAG = 'puchica-launch-ready'
FIRST_ORDER_DISCOUNT = Decimal('0.85')
PAYMENT_FEE_FACTOR = Decimal('0.971')
PAYMENT_FIXED_FEE = Decimal('0.30')
TARGET_MARGIN = Decimal('0.30')

HIGH_RISK_PATTERNS = {
    'child_safety': re.compile(r'\b(baby|infant|toddler|child|children|kids?|toy|rc|drone)\b', re.I),
    'medical_health': re.compile(r'\b(medical|therapy|therapeutic|pain|cure|treatment|orthopedic|posture|blood|health)\b', re.I),
    'electrical': re.compile(r'\b(electric|heated|heating|led|usb|battery|rechargeable|voltage|plug|laser)\b', re.I),
    'hygiene_beauty': re.compile(r'\b(ear|nail|skin|face|facial|beauty|razor|hair|teeth|oral|hygiene|piercing|nose ring|body jewelry)\b', re.I),
    'likely_ip': re.compile(r'\b(disney|pokemon|mario|nike|adidas|apple|iphone|marvel|lego|barbie|michael jackson|elsa)\b', re.I),
    'chemical_cosmetic': re.compile(r'\b(nail glue|uv gel|acrylic nail|cosmetic adhesive)\b', re.I),
    'animal_derived': re.compile(r'\b(rabbit fur|mink fur|real fur)\b', re.I),
    'animal_welfare': re.compile(r'\b(duck shoes|goose shoes|poultry boots)\b', re.I),
}
HARD_RISK_FLAGS = {'child_safety', 'medical_health', 'electrical', 'likely_ip', 'chemical_cosmetic'}


def money(value) -> Decimal | None:
    if value in (None, ''):
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError):
        return None


def q2(value: Decimal | None) -> str:
    if value is None:
        return ''
    return str(value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))


def product_gid_tail(gid: str) -> str:
    return (gid or '').rsplit('/', 1)[-1]


def shipping_cap(price: Decimal | None, unit_cost: Decimal | None) -> Decimal | None:
    if price is None or unit_cost is None:
        return None
    discounted_after_fees = (price * FIRST_ORDER_DISCOUNT * PAYMENT_FEE_FACTOR) - PAYMENT_FIXED_FEE
    return discounted_after_fees - unit_cost - (price * TARGET_MARGIN)


def extract_unit_cost(variant: dict) -> Decimal | None:
    inventory_item = variant.get('inventoryItem') or {}
    unit_cost = inventory_item.get('unitCost') or {}
    return money(unit_cost.get('amount'))


def option_value_count(product: dict) -> int:
    total = 0
    for option in product.get('options') or []:
        values = option.get('values') or []
        total += len(values)
    return total


def is_default_only(product: dict) -> bool:
    options = product.get('options') or []
    if len(options) != 1:
        return False
    name = (options[0].get('name') or '').strip().lower()
    values = [str(v).strip().lower() for v in options[0].get('values') or []]
    return name == 'title' and values == ['default title']


def risk_flags(product: dict) -> list[str]:
    text = ' '.join([
        product.get('title') or '',
        product.get('productType') or '',
        ' '.join(product.get('tags') or []),
        (product.get('seo') or {}).get('title') or '',
        (product.get('seo') or {}).get('description') or '',
    ])
    return [name for name, pattern in HIGH_RISK_PATTERNS.items() if pattern.search(text)]


def risk_severity(flags: list[str]) -> str:
    if any(flag in HARD_RISK_FLAGS for flag in flags):
        return 'hard_hold'
    if flags:
        return 'content_review'
    return ''


def has_supplier_sku(sku: str) -> bool:
    sku = (sku or '').strip()
    if not sku:
        return False
    # DSers / AliExpress imports in this store are not perfectly uniform, so
    # use non-empty SKU as mapping evidence, not final fulfillment approval.
    return True


def product_decision(product: dict, variants: list[dict], worst_cap: Decimal | None, flags: list[str]) -> str:
    tags = set(product.get('tags') or [])
    status = product.get('status')
    sku_count = sum(1 for v in variants if has_supplier_sku(v.get('sku') or ''))
    unit_cost_count = sum(1 for v in variants if extract_unit_cost(v) is not None)

    severity = risk_severity(flags)

    if severity == 'hard_hold':
        return 'HOLD_RISK_REVIEW'
    if sku_count == 0:
        return 'HOLD_MAPPING_REQUIRED'
    if unit_cost_count == 0:
        return 'HOLD_COST_MISSING'
    if worst_cap is not None and worst_cap < 0:
        return 'HOLD_REPRICE_OR_REJECT'
    if status == 'ACTIVE' and LAUNCH_TAG in tags:
        if severity == 'content_review':
            return 'LIVE_QUOTE_AND_CONTENT_REVIEW'
        return 'LIVE_QUOTE_REQUIRED'
    if status == 'DRAFT':
        return 'DRAFT_QUOTE_AND_CONTENT_REVIEW'
    return 'REVIEW_VISIBILITY_AND_TAGS'


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--out-dir', default='docs')
    parser.add_argument('--date', default=date.today().isoformat())
    parser.add_argument('--query', default=None, help='Optional Shopify product search query')
    args = parser.parse_args()

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    fields = [
        'id',
        'title',
        'handle',
        'status',
        'productType',
        'vendor',
        'tags',
        'seo { title description }',
        'options { name values }',
        '''
        variants(first: 100) {
          nodes {
            id
            title
            sku
            price
            compareAtPrice
            inventoryQuantity
            availableForSale
            inventoryItem {
              unitCost { amount currencyCode }
            }
          }
        }
        ''',
    ]

    with ShopifyAdmin(api_version='2026-04') as shop:
        products = shop.list_all_products(fields=fields, query_filter=args.query)

    product_rows = []
    variant_rows = []

    for product in products:
        variants = (product.get('variants') or {}).get('nodes') or []
        tags = product.get('tags') or []
        prices = [money(v.get('price')) for v in variants]
        prices = [p for p in prices if p is not None]
        costs = [extract_unit_cost(v) for v in variants]
        costs = [c for c in costs if c is not None]
        caps = [shipping_cap(money(v.get('price')), extract_unit_cost(v)) for v in variants]
        caps = [c for c in caps if c is not None]
        worst_cap = min(caps) if caps else None
        risks = risk_flags(product)
        sku_count = sum(1 for v in variants if has_supplier_sku(v.get('sku') or ''))
        empty_sku_count = len(variants) - sku_count
        active_launch = product.get('status') == 'ACTIVE' and LAUNCH_TAG in tags
        decision = product_decision(product, variants, worst_cap, risks)

        row = {
            'product_id': product_gid_tail(product.get('id')),
            'title': product.get('title') or '',
            'handle': product.get('handle') or '',
            'status': product.get('status') or '',
            'launch_tag': 'yes' if LAUNCH_TAG in tags else 'no',
            'active_launch_gate': 'yes' if active_launch else 'no',
            'product_type': product.get('productType') or '',
            'variant_count': len(variants),
            'option_value_count': option_value_count(product),
            'default_only': 'yes' if is_default_only(product) else 'no',
            'sku_variant_count': sku_count,
            'empty_sku_count': empty_sku_count,
            'variants_with_unit_cost': len(costs),
            'min_price': q2(min(prices) if prices else None),
            'max_price': q2(max(prices) if prices else None),
            'max_unit_cost': q2(max(costs) if costs else None),
            'worst_canada_shipping_cap': q2(worst_cap),
            'risk_flags': ';'.join(risks),
            'risk_severity': risk_severity(risks),
            'decision': decision,
            'next_action': next_action(decision),
        }
        product_rows.append(row)

        for variant in variants:
            price = money(variant.get('price'))
            cost = extract_unit_cost(variant)
            cap = shipping_cap(price, cost)
            variant_rows.append({
                'product_id': row['product_id'],
                'product_title': row['title'],
                'handle': row['handle'],
                'status': row['status'],
                'launch_tag': row['launch_tag'],
                'variant_id': product_gid_tail(variant.get('id')),
                'variant_title': variant.get('title') or '',
                'sku': variant.get('sku') or '',
                'available_for_sale': variant.get('availableForSale'),
                'inventory_quantity': variant.get('inventoryQuantity'),
                'price': q2(price),
                'unit_cost': q2(cost),
                'canada_shipping_cap': q2(cap),
                'needs_quote': 'yes' if row['decision'] not in {'HOLD_RISK_REVIEW', 'HOLD_MAPPING_REQUIRED'} else 'no',
                'quote_item_cost': '',
                'quote_shipping_cost': '',
                'quote_delivery_window': '',
                'quote_service': '',
                'quote_stock': '',
                'quote_result': '',
                'us_quote_item_cost': '',
                'us_quote_shipping_cost': '',
                'us_quote_delivery_window': '',
                'us_quote_service': '',
                'us_quote_stock': '',
                'us_quote_result': '',
                'notes': '',
            })

    product_rows.sort(key=lambda r: (
        r['active_launch_gate'] != 'yes',
        r['status'],
        r['decision'],
        r['title'].lower(),
    ))
    variant_rows.sort(key=lambda r: (r['product_title'].lower(), r['variant_title'].lower()))

    product_csv = out_dir / f'storewide-product-gate-{args.date}.csv'
    variant_csv = out_dir / f'storewide-variant-quote-worksheet-{args.date}.csv'
    md_path = out_dir / f'storewide-product-gate-{args.date}.md'

    write_csv(product_csv, product_rows)
    write_csv(variant_csv, variant_rows)
    write_markdown(md_path, product_rows, variant_rows, args.date)

    print(f'Products audited: {len(product_rows)}')
    print(f'Variants audited: {len(variant_rows)}')
    print(f'Product gate: {product_csv}')
    print(f'Variant quote worksheet: {variant_csv}')
    print(f'Markdown summary: {md_path}')


def next_action(decision: str) -> str:
    return {
        'LIVE_QUOTE_REQUIRED': 'Capture exact Canada and US DSers quotes; approve, reprice, or remove launch tag.',
        'LIVE_QUOTE_AND_CONTENT_REVIEW': 'Capture exact Canada and US quotes and verify claims/content before promotion.',
        'DRAFT_QUOTE_AND_CONTENT_REVIEW': 'Repair/verify mapping, quote Canada and US, review content, then decide whether to tag.',
        'HOLD_RISK_REVIEW': 'Keep held until safety/claims/IP/compliance review is complete.',
        'HOLD_MAPPING_REQUIRED': 'Do not quote yet; repair DSers mapping/SKU first.',
        'HOLD_COST_MISSING': 'Record Shopify unit cost or DSers source cost before pricing.',
        'HOLD_REPRICE_OR_REJECT': 'Reprice, change variant/supplier, bundle, or reject before launch.',
        'REVIEW_VISIBILITY_AND_TAGS': 'Check status, launch tag, and collection visibility.',
    }.get(decision, 'Review manually.')


def write_csv(path: Path, rows: list[dict]) -> None:
    if not rows:
        path.write_text('', encoding='utf-8')
        return
    with path.open('w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def write_markdown(path: Path, product_rows: list[dict], variant_rows: list[dict], run_date: str) -> None:
    decisions: dict[str, int] = {}
    statuses: dict[str, int] = {}
    for row in product_rows:
        decisions[row['decision']] = decisions.get(row['decision'], 0) + 1
        statuses[row['status']] = statuses.get(row['status'], 0) + 1

    live = [r for r in product_rows if r['active_launch_gate'] == 'yes']
    quote_first = [
        r for r in product_rows
        if r['decision'] == 'LIVE_QUOTE_REQUIRED'
    ][:30]
    hold = [
        r for r in product_rows
        if r['decision'].startswith('HOLD')
    ][:30]

    lines = [
        f'# Storewide product gate - {run_date}',
        '',
        'Read-only Shopify Admin snapshot. This is an operating ledger, not a launch approval.',
        '',
        '## Summary',
        '',
        f'- Products audited: {len(product_rows)}',
        f'- Variants audited: {len(variant_rows)}',
        f'- Active launch-gated products: {len(live)}',
        '',
        '### By Shopify status',
        '',
    ]
    for status, count in sorted(statuses.items()):
        lines.append(f'- {status}: {count}')
    lines.extend(['', '### By gate decision', ''])
    for decision, count in sorted(decisions.items()):
        lines.append(f'- {decision}: {count}')

    lines.extend([
        '',
        '## Quote-first queue',
        '',
        '| product | variants | worst CA shipping cap | next action |',
        '| --- | ---: | ---: | --- |',
    ])
    for row in quote_first:
        lines.append(
            f"| {row['title']} | {row['variant_count']} | "
            f"{row['worst_canada_shipping_cap'] or 'n/a'} | {row['next_action']} |"
        )

    lines.extend([
        '',
        '## Hold-first queue',
        '',
        '| product | status | decision | risk / issue |',
        '| --- | --- | --- | --- |',
    ])
    for row in hold:
        issue = row['risk_flags'] or row['next_action']
        lines.append(f"| {row['title']} | {row['status']} | {row['decision']} | {issue} |")

    lines.extend([
        '',
        '## Files',
        '',
        f"- Product gate CSV: `docs/storewide-product-gate-{run_date}.csv`",
        f"- Variant quote worksheet: `docs/storewide-variant-quote-worksheet-{run_date}.csv`",
        '',
        '## Rule',
        '',
        'Each product only becomes promotion-ready after exact variant mapping, exact Canada supplier quote, delivery estimate, stock, and a passing margin calculation are recorded.',
    ])

    path.write_text('\n'.join(lines), encoding='utf-8')


if __name__ == '__main__':
    main()
