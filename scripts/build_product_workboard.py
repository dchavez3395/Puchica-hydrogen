#!/usr/bin/env python3
"""Create a storewide product operating board from the launch gate CSV."""
from __future__ import annotations

import argparse
import csv
from pathlib import Path


LIVE_QUOTE_DECISIONS = {'LIVE_QUOTE_REQUIRED', 'LIVE_QUOTE_AND_CONTENT_REVIEW'}


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
        'For each quoted product, record exact DSers/AliExpress Canada item cost, shipping cost, delivery window, service, stock, and pass/fail in the variant worksheet.',
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
        '## Drafts and holds',
        '',
    ])
    for stream in ('C1_DRAFT_REVIEW_BATCH', 'H1_RISK_HOLD', 'H2_MAPPING_REPAIR', 'H3_REPRICE_OR_REJECT', 'Z_REVIEW_MANUALLY'):
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
        'A product is done only after it has one final state: approved launch with quote evidence, organic-only with reason, draft-later with missing proof, hard hold/reject, or archived.',
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

    out_rows = []
    for row in rows:
        stream, priority, reason = workstream(row)
        operator_action = row['next_action']
        if stream == 'A1_REMOVE_FROM_LAUNCH_TAG':
            operator_action = 'Remove launch-ready tag or draft before paid traffic; then review category risk.'
        elif stream == 'A2_REMOVE_OR_REPRICE_ACTIVE':
            operator_action = 'Remove launch-ready tag, reprice, bundle, or reject.'
        elif stream == 'B1_QUOTE_QUICK_WINS':
            operator_action = 'Quote exact Canada delivery first; approve if shipping is at or below cap.'
        elif stream == 'B2_QUOTE_HIGH_VARIANT':
            operator_action = 'Quote worst-margin and top-selling option groups; reduce option complexity if needed.'
        elif stream == 'B3_QUOTE_TIGHT_MARGIN':
            operator_action = 'Quote before promotion; expect reprice/reject if shipping is not near-free.'

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
