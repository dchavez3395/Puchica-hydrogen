#!/usr/bin/env python3
"""Create a storewide product operating board from the launch gate CSV."""
from __future__ import annotations

import argparse
import csv
from pathlib import Path


LIVE_QUOTE_DECISIONS = {'LIVE_QUOTE_REQUIRED', 'LIVE_QUOTE_AND_CONTENT_REVIEW'}


def build_quote_summary(rows: list[dict]) -> dict[str, dict[str, int]]:
    summary: dict[str, dict[str, int]] = {}
    for row in rows:
        product = row['handle']
        item = summary.setdefault(product, {
            'rows': 0,
            'canada_quoted': 0,
            'canada_failures': 0,
            'quoted': 0,
            'failures': 0,
            'sellable_failures': 0,
        })
        item['rows'] += 1
        canada_result = row.get('quote_result', '')
        if canada_result:
            item['canada_quoted'] += 1
        if canada_result.startswith('FAIL'):
            item['canada_failures'] += 1
        result = row.get('us_quote_result', '')
        if result:
            item['quoted'] += 1
        if result.startswith('FAIL'):
            item['failures'] += 1
            available = row.get('available_for_sale', '').lower() == 'true'
            try:
                inventory = int(row.get('inventory_quantity', '0'))
            except ValueError:
                inventory = 0
            if available and inventory > 0:
                item['sellable_failures'] += 1
    return summary


def money_key(value: str) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return -9999.0


def int_key(value: str) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return 999999


def workstream(row: dict) -> tuple[str, int, str]:
    decision = row['decision']
    active_launch = row['active_launch_gate'] == 'yes'
    cap = money_key(row['worst_canada_shipping_cap'])
    variants = int_key(row['variant_count'])

    if active_launch and decision == 'HOLD_RISK_REVIEW':
        return ('A1_REMOVE_FROM_LAUNCH_TAG', 1, 'Live launch tag is on a hard-risk product.')
    if active_launch and decision == 'HOLD_REPRICE_OR_REJECT':
        return ('A2_REMOVE_OR_REPRICE_ACTIVE', 2, 'Live product fails economics before shipping.')
    if decision == 'HOLD_RISK_REVIEW':
        return ('H1_RISK_HOLD', 80, 'Keep held until safety, claims, electrical, IP, or policy review is complete.')
    if decision == 'HOLD_MAPPING_REQUIRED':
        return ('H2_MAPPING_REPAIR', 70, 'Repair DSers mapping and SKU evidence before quoting.')
    if decision == 'HOLD_REPRICE_OR_REJECT':
        return ('H3_REPRICE_OR_REJECT', 60, 'Reprice, bundle, replace supplier, or reject before launch.')
    if decision in LIVE_QUOTE_DECISIONS and cap >= 3 and variants <= 12:
        return ('B1_QUOTE_QUICK_WINS', 10, 'Low-complexity live product with usable shipping headroom.')
    if decision in LIVE_QUOTE_DECISIONS and cap >= 3:
        return ('B2_QUOTE_HIGH_VARIANT', 20, 'Quote representative/worst variants, then normalize the option set.')
    if decision in LIVE_QUOTE_DECISIONS:
        return ('B3_QUOTE_TIGHT_MARGIN', 30, 'Live product with thin shipping headroom; quote before any paid traffic.')
    if decision == 'DRAFT_QUOTE_AND_CONTENT_REVIEW':
        return ('C1_DRAFT_REVIEW_BATCH', 50, 'Draft can be reviewed after active launch products are handled.')
    return ('Z_REVIEW_MANUALLY', 90, 'Manual status, visibility, or tag review required.')


def read_csv(path: Path) -> list[dict]:
    with path.open(encoding='utf-8', newline='') as f:
        return list(csv.DictReader(f))


def write_csv(path: Path, rows: list[dict]) -> None:
    with path.open('w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def table(rows: list[dict], columns: list[tuple[str, str]], limit: int | None = None) -> list[str]:
    selected = rows[:limit] if limit else rows
    lines = [
        '| ' + ' | '.join(label for label, _ in columns) + ' |',
        '| ' + ' | '.join('---' for _ in columns) + ' |',
    ]
    for row in selected:
        lines.append('| ' + ' | '.join(str(row.get(key, '') or '') for _, key in columns) + ' |')
    return lines


def write_markdown(path: Path, rows: list[dict], run_date: str) -> None:
    grouped: dict[str, list[dict]] = {}
    for row in rows:
        grouped.setdefault(row['workstream'], []).append(row)

    lines = [
        f'# Storewide product workboard - {run_date}',
        '',
        'This board turns the Shopify Admin product gate into the order of operations for finishing the whole store.',
        '',
        '## Current board',
        '',
    ]

    for stream in sorted(grouped):
        lines.append(f"- {stream}: {len(grouped[stream])}")

    lines.extend([
        '',
        '## Do first',
        '',
        'These are the live-store controls to handle before promotion or ad spend.',
        '',
    ])
    urgent = [r for r in rows if r['workstream'].startswith('A')]
    lines.extend(table(urgent, [
        ('product', 'title'),
        ('status', 'status'),
        ('decision', 'decision'),
        ('reason', 'work_reason'),
        ('action', 'operator_next_action'),
    ]))

    lines.extend([
        '',
        '## Quote batches',
        '',
        'For each quoted product, record separate exact DSers/AliExpress Canada and US item cost, shipping cost, delivery window, service, stock, and pass/fail in the variant worksheet.',
        '',
    ])
    for stream in ('B1_QUOTE_QUICK_WINS', 'B2_QUOTE_HIGH_VARIANT', 'B3_QUOTE_TIGHT_MARGIN'):
        batch = grouped.get(stream, [])
        lines.extend([
            f'### {stream}',
            '',
        ])
        lines.extend(table(batch, [
            ('product', 'title'),
            ('variants', 'variant_count'),
            ('cap', 'worst_canada_shipping_cap'),
            ('risk', 'risk_flags'),
            ('action', 'operator_next_action'),
        ]))
        lines.append('')

    lines.extend([
        '## US margin and storefront validation',
        '',
    ])
    lines.extend(table(grouped.get('D1_US_MARGIN_PENDING', []), [
        ('product', 'title'),
        ('variants', 'variant_count'),
        ('decision', 'decision'),
        ('action', 'operator_next_action'),
    ]))
    lines.append('')

    lines.extend([
        '## Drafts and holds',
        '',
    ])
    for stream in ('C1_DRAFT_REVIEW_BATCH', 'C2_DRAFT_REPRICE_CONTENT_REVIEW', 'C3_DRAFT_CONTENT_REVIEW', 'C4_DRAFT_US_ONLY_REVIEW', 'H1_RISK_HOLD', 'H4_DRAFT_CANADA_FAIL_EXCLUDED', 'H2_MAPPING_REPAIR', 'H3_REPRICE_OR_REJECT', 'Z_REVIEW_MANUALLY'):
        batch = grouped.get(stream, [])
        if not batch:
            continue
        lines.extend([
            f'### {stream}',
            '',
        ])
        lines.extend(table(batch, [
            ('product', 'title'),
            ('status', 'status'),
            ('variants', 'variant_count'),
            ('issue', 'risk_flags'),
            ('action', 'operator_next_action'),
        ]))
        lines.append('')

    lines.extend([
        '## Completion rule',
        '',
        'A product is done only after it has one final state: approved launch with Canada and US quote evidence, organic-only with reason, draft-later with missing proof, hard hold/reject, or archived.',
    ])
    path.write_text('\n'.join(lines), encoding='utf-8')


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--date', required=True)
    parser.add_argument('--docs-dir', default='docs')
    args = parser.parse_args()

    docs_dir = Path(args.docs_dir)
    gate_path = docs_dir / f'storewide-product-gate-{args.date}.csv'
    rows = read_csv(gate_path)
    quote_path = docs_dir / f'storewide-variant-quote-worksheet-{args.date}.csv'
    quote_state = build_quote_summary(read_csv(quote_path)) if quote_path.exists() else {}
    review_path = docs_dir / f'storewide-content-compliance-review-{args.date}.csv'
    content_reviews = {row['handle']: row for row in read_csv(review_path)} if review_path.exists() else {}

    out_rows = []
    for row in rows:
        stream, priority, reason = workstream(row)
        operator_action = row['next_action']
        if stream == 'A1_REMOVE_FROM_LAUNCH_TAG':
            operator_action = 'Remove launch-ready tag or draft before paid traffic; then review category risk.'
        elif stream == 'A2_REMOVE_OR_REPRICE_ACTIVE':
            operator_action = 'Remove launch-ready tag, reprice, bundle, or reject.'
        elif stream == 'B1_QUOTE_QUICK_WINS':
            operator_action = 'Quote exact Canada and US delivery; approve only if both destinations pass.'
        elif stream == 'B2_QUOTE_HIGH_VARIANT':
            operator_action = 'Quote worst-margin and top-selling option groups; reduce option complexity if needed.'
        elif stream == 'B3_QUOTE_TIGHT_MARGIN':
            operator_action = 'Quote both destinations before promotion; expect reprice/reject if shipping is not near-free.'
        elif stream == 'C1_DRAFT_REVIEW_BATCH':
            operator_action = 'Repair/verify mapping, quote Canada and US, review content, then decide whether to tag.'

        out = {
            'priority': priority,
            'workstream': stream,
            'title': row['title'],
            'handle': row['handle'],
            'status': row['status'],
            'launch_tag': row['launch_tag'],
            'variant_count': row['variant_count'],
            'worst_canada_shipping_cap': row['worst_canada_shipping_cap'],
            'risk_flags': row['risk_flags'],
            'decision': row['decision'],
            'work_reason': reason,
            'operator_next_action': operator_action,
        }
        us = quote_state.get(row['handle'])
        if row['active_launch_gate'] == 'yes' and us and us['quoted'] == us['rows']:
            if us['sellable_failures']:
                out.update({
                    'priority': 3,
                    'workstream': 'A3_US_MARKET_EXCLUDED',
                    'decision': 'US_QUOTE_COMPLETE_US_EXCLUDED',
                    'work_reason': (
                        f"{us['sellable_failures']} sellable variant(s) cannot ship to the US; "
                        'keep the product excluded from the US catalog while preserving Canada.'
                    ),
                    'operator_next_action': (
                        'Replace or separate the failing supplier variant before restoring this product to the US catalog.'
                    ),
                })
            else:
                out.update({
                    'priority': 40,
                    'workstream': 'D1_US_MARGIN_PENDING',
                    'decision': 'US_QUOTE_COMPLETE_MARGIN_PENDING',
                    'work_reason': (
                        'Canada and US supplier quote evidence is complete for the sellable variant set.'
                    ),
                    'operator_next_action': (
                        'Validate USD storefront price, landed contribution, checkout delivery, and live US availability.'
                    ),
                })
        elif (
            row['status'] == 'DRAFT'
            and row['decision'] == 'DRAFT_QUOTE_AND_CONTENT_REVIEW'
            and us
            and us['canada_quoted'] == us['rows']
            and us['canada_failures'] == us['rows']
            and us['quoted'] == us['rows']
            and us['failures'] == 0
        ):
            out.update({
                'priority': 47,
                'workstream': 'C4_DRAFT_US_ONLY_REVIEW',
                'decision': 'DRAFT_US_ONLY_CANDIDATE',
                'work_reason': (
                    'Every mapped variant fails the Canada gate, but the complete US shipping sample passes.'
                ),
                'operator_next_action': (
                    'Keep excluded from Canada; validate USD pricing, contribution, content, and policy risk before US-only activation.'
                ),
            })
        elif (
            row['status'] == 'DRAFT'
            and row['decision'] == 'DRAFT_QUOTE_AND_CONTENT_REVIEW'
            and us
            and us['canada_quoted'] == us['rows']
            and us['canada_failures'] == us['rows']
        ):
            out.update({
                'priority': 55,
                'workstream': 'H4_DRAFT_CANADA_FAIL_EXCLUDED',
                'decision': 'DRAFT_CANADA_QUOTE_FAIL_KEEP_EXCLUDED',
                'work_reason': (
                    'Every mapped variant row fails the Canada supplier-shipping or margin gate.'
                ),
                'operator_next_action': (
                    'Keep excluded; replace supplier or reprice before spending time on US quotes or activation.'
                ),
            })
        elif (
            row['status'] == 'DRAFT'
            and row['decision'] == 'DRAFT_QUOTE_AND_CONTENT_REVIEW'
            and us
            and us['canada_quoted'] == us['rows']
            and us['quoted'] == us['rows']
        ):
            if us['canada_failures']:
                out.update({
                    'priority': 45,
                    'workstream': 'C2_DRAFT_REPRICE_CONTENT_REVIEW',
                    'decision': 'DRAFT_QUOTE_COMPLETE_REPRICE_REQUIRED',
                    'work_reason': (
                        f"Both-country quote evidence is complete, but {us['canada_failures']} variant row(s) "
                        'fail the Canada shipping allowance.'
                    ),
                    'operator_next_action': (
                        'Reprice failing variants, clean title/content, verify contribution, then reconsider activation.'
                    ),
                })
            else:
                out.update({
                    'priority': 46,
                    'workstream': 'C3_DRAFT_CONTENT_REVIEW',
                    'decision': 'DRAFT_QUOTE_COMPLETE_CONTENT_REVIEW',
                    'work_reason': 'Both-country quote evidence is complete and shipping economics pass.',
                    'operator_next_action': (
                        'Complete content/compliance review and contribution validation before activation.'
                    ),
                })
        review = content_reviews.get(row['handle'])
        if review and review['disposition'] == 'HOLD_CONTENT_COMPLIANCE_REVIEW':
            combined_flags = sorted(set(filter(None, (row['risk_flags'] + ';' + review['risk_flags']).split(';'))))
            out.update({
                'priority': 80,
                'workstream': 'H1_RISK_HOLD',
                'risk_flags': ';'.join(combined_flags),
                'decision': 'HOLD_CONTENT_COMPLIANCE_REVIEW',
                'work_reason': review['reason'],
                'operator_next_action': review['required_evidence'],
            })
        out_rows.append(out)

    out_rows.sort(key=lambda r: (
        int(r['priority']),
        -money_key(r['worst_canada_shipping_cap']),
        int_key(r['variant_count']),
        r['title'].lower(),
    ))

    csv_path = docs_dir / f'storewide-product-workboard-{args.date}.csv'
    md_path = docs_dir / f'storewide-product-workboard-{args.date}.md'
    write_csv(csv_path, out_rows)
    write_markdown(md_path, out_rows, args.date)
    print(f'Product workboard CSV: {csv_path}')
    print(f'Product workboard Markdown: {md_path}')


if __name__ == '__main__':
    main()
