#!/usr/bin/env python3
"""Build explicit Canada and US pricing actions from the product gate and quote ledger."""
from __future__ import annotations

import argparse
import csv
import re
from decimal import Decimal, ROUND_CEILING, ROUND_HALF_UP
from pathlib import Path

DISCOUNT_RATE = Decimal('0.85')
PAYMENT_KEEP_RATE = Decimal('0.971')
PAYMENT_FIXED_FEE = Decimal('0.30')
TARGET_MARGIN = Decimal('0.30')
NET_PRICE_FACTOR = (DISCOUNT_RATE * PAYMENT_KEEP_RATE) - TARGET_MARGIN
CANADA_SHIPPING_FLOOR = Decimal('3.03')


def read_csv(path: Path) -> list[dict]:
    with path.open(encoding='utf-8-sig', newline='') as f:
        return list(csv.DictReader(f))


def q2(value: Decimal) -> str:
    return str(value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))


def minimum_price(cost: Decimal, shipping: Decimal) -> Decimal:
    return (cost + shipping + PAYMENT_FIXED_FEE) / NET_PRICE_FACTOR


def retail_99(value: Decimal) -> Decimal:
    return (value + Decimal('0.01')).to_integral_value(rounding=ROUND_CEILING) - Decimal('0.01')


def upper_us_cost(value: str) -> Decimal:
    cleaned = (value or '').replace('US$', '').strip()
    return Decimal(cleaned.split('~')[-1])

def upper_us_shipping(value: str) -> Decimal:
    amounts = re.findall(r'\d+(?:\.\d+)?', value or '')
    if not amounts:
        return Decimal('0')
    return max(Decimal(amount) for amount in amounts)


def write_csv(path: Path, rows: list[dict]) -> None:
    with path.open('w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()), quoting=csv.QUOTE_ALL, lineterminator='\n')
        writer.writeheader()
        writer.writerows(rows)


def write_markdown(path: Path, rows: list[dict], audit_date: str) -> None:
    by_product: dict[tuple[str, str], list[dict]] = {}
    for row in rows:
        by_product.setdefault((row['country'], row['product_title']), []).append(row)
    lines = [
        f'# Storewide pricing actions ? {audit_date}', '',
        'This ledger converts verified cost and shipping evidence into minimum prices under the existing gate assumptions.', '',
        '## Assumptions', '',
        '- First-order collected price: 85% of storefront price.',
        '- Variable payment fee: 2.9%; fixed payment fee: CA/US$0.30.',
        '- Target contribution after supplier cost and shipping: 30% of storefront price.',
        f'- Net price factor available for supplier cost, shipping, and fixed fee: {NET_PRICE_FACTOR}.',
        '- Minimum price formula: `(supplier cost + shipping + 0.30) / 0.52535`.',
        '- Recommended action price rounds upward to a `.99` ending.', '',
        '## Product actions', '',
        '| country | product | rows | failing rows | current price range | minimum / action price | disposition |',
        '| --- | --- | ---: | ---: | --- | --- | --- |',
    ]
    for (country, title), group in sorted(by_product.items()):
        failing = [r for r in group if r['price_action_required'] == 'yes']
        current = [Decimal(part) for r in group if r['current_storefront_price'] for part in r['current_storefront_price'].split('~')]
        actions = [Decimal(r['recommended_action_price']) for r in group]
        current_range = '' if not current else f"{q2(min(current))}~{q2(max(current))}"
        action_range = f"{q2(min(actions))}~{q2(max(actions))}"
        dispositions = '; '.join(sorted(set(r['disposition'] for r in group)))
        safe_title = title.replace('|', '\|')
        lines.append(f'| {country} | {safe_title} | {len(group)} | {len(failing)} | {current_range} | {action_range} | {dispositions} |')
    lines += ['', '## Operating rule', '', 'A calculated price floor does not activate a product. Mapping, stock, content/compliance, country shipping, checkout, and storefront visibility must still pass.']
    path.write_text('\n'.join(lines) + '\n', encoding='utf-8')


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--date', required=True)
    parser.add_argument('--docs-dir', default='docs')
    args = parser.parse_args()
    docs = Path(args.docs_dir)
    quotes = read_csv(docs / f'storewide-variant-quote-worksheet-{args.date}.csv')
    gate = {row['handle']: row for row in read_csv(docs / f'storewide-product-gate-{args.date}.csv')}
    rows: list[dict] = []

    canada_targets = {
        'mens-casual-sports-hoodie-spring-autumn-fashion-solid-color-long-sleeved-pullover-with-arm-pocket-and-pull-rope-plus-size': 'VERIFIED_CANADA_DSERs_QUOTE',
        '100-pure-cotton-t-shirt-with-round-neck-shoulder-design-for-both-men-women-summer-solid-color-short-sleeved-casual-loose-fit': 'VERIFIED_CANADA_DSERs_QUOTE',
        '2024-mens-print-pants-autumn-winter-new-in-mens-clothing-trousers-sport-jogging-fitness-running-trousers-harajuku-streetwear': 'VERIFIED_CANADA_QUOTE',
        'windproof-infant-stroller-gloves-childrens-outdoor-sports-mittens-cartoon-printed-hands-warmer-scooter-accessory-for-winter': 'VERIFIED_CANADA_DSERs_QUOTE',
        'kids-toddler-foot-measure-gauge-shoes-size-measuring-ruler-tool-baby-boy-girl-childrens-foot-length-measuring-ruler-fittings': 'VERIFIED_CANADA_DSERs_QUOTE',
        '300-280-200-100pcs-washer-copper-sealing-solid-gasket-washer-sump-plug-oil-for-boat-crush-flat-seal-ring-tool': 'VERIFIED_CANADA_DSERs_QUOTE',
        'summer-spring-candy-color-kids-pantyhose-ballet-dance-tights-for-girls-stocking-children-velvet-solid-white-pantyhose': 'VERIFIED_CANADA_DSERs_QUOTE',
        'thermal-underwear-tops-men-winter-clothes-thermal-shirt-autumn-mens-winter-tights-high-neck-thin-slim-fit-long-sleeve-t-shirt': 'VERIFIED_CANADA_DSERs_QUOTE',
        'summer-mens-shorts-cool-sportswear-running-sport-shorts-casual-bottoms-gym-fitness-training-jogging-short-pants-men-black-gray': 'VERIFIED_CANADA_DSERs_QUOTE',
    }
    no_shipping_withhold_handles = {
        'windproof-infant-stroller-gloves-childrens-outdoor-sports-mittens-cartoon-printed-hands-warmer-scooter-accessory-for-winter',
        'kids-toddler-foot-measure-gauge-shoes-size-measuring-ruler-tool-baby-boy-girl-childrens-foot-length-measuring-ruler-fittings',
        '300-280-200-100pcs-washer-copper-sealing-solid-gasket-washer-sump-plug-oil-for-boat-crush-flat-seal-ring-tool',
        'summer-spring-candy-color-kids-pantyhose-ballet-dance-tights-for-girls-stocking-children-velvet-solid-white-pantyhose',
        'thermal-underwear-tops-men-winter-clothes-thermal-shirt-autumn-mens-winter-tights-high-neck-thin-slim-fit-long-sleeve-t-shirt',
        'summer-mens-shorts-cool-sportswear-running-sport-shorts-casual-bottoms-gym-fitness-training-jogging-short-pants-men-black-gray',
    }
    canada_fixed_group_prices = {
        '2024-mens-print-pants-autumn-winter-new-in-mens-clothing-trousers-sport-jogging-fitness-running-trousers-harajuku-streetwear': {
            'M': Decimal('28.02'),
            'XXXL': Decimal('26.99'),
            'XXL': Decimal('25.99'),
            'XL': Decimal('27.53'),
            'S': Decimal('24.99'),
            'L': Decimal('25.99'),
        },
    }
    for quote in quotes:
        handle = quote['handle']
        if handle not in canada_targets:
            continue
        cost = Decimal(quote['unit_cost'])
        original_price = Decimal(quote['price'])
        size = quote['variant_title'].split(' / ', 1)[0]
        current = canada_fixed_group_prices.get(handle, {}).get(size, original_price)
        if handle in no_shipping_withhold_handles and quote['quote_result'] == 'FAIL_NO_SHIPPING':
            rows.append({
                'country': 'CA', 'product_title': quote['product_title'], 'handle': handle,
                'variant_title': quote['variant_title'], 'sku': quote['sku'],
                'current_storefront_price': q2(current), 'supplier_cost_basis': q2(cost),
                'shipping_cost_basis': '', 'shipping_evidence': canada_targets[handle],
                'minimum_price': '', 'recommended_action_price': q2(current),
                'price_change': '0.00', 'price_action_required': 'no',
                'quote_result': quote['quote_result'],
                'disposition': 'DISABLE_CA_VARIANT_NO_SHIPPING',
                'formula': '',
            })
            continue
        shipping = Decimal(quote['quote_shipping_cost']) if quote['quote_shipping_cost'] not in ('', 'NO_SHIPPING') else CANADA_SHIPPING_FLOOR
        floor = minimum_price(cost, shipping)
        action_required = current < floor
        recommended = retail_99(floor) if action_required else current
        rows.append({
            'country': 'CA', 'product_title': quote['product_title'], 'handle': handle,
            'variant_title': quote['variant_title'], 'sku': quote['sku'],
            'current_storefront_price': q2(current), 'supplier_cost_basis': q2(cost),
            'shipping_cost_basis': q2(shipping), 'shipping_evidence': canada_targets[handle],
            'minimum_price': q2(floor), 'recommended_action_price': q2(recommended),
            'price_change': q2(max(Decimal('0'), recommended - current)),
            'price_action_required': 'yes' if action_required else 'no',
            'quote_result': quote['quote_result'],
            'disposition': (
                'CANADA_FIXED_PRICE_VALIDATED'
                if handle in canada_fixed_group_prices and not action_required
                else ('REPRICE_THEN_REVIEW' if action_required else 'PRICE_PASSES_CURRENT_GATE')
            ),
            'formula': '(supplier_cost + shipping + 0.30) / 0.52535',
        })

    us_handles = {
        '3pcs-set-men-business-watches-casual-leather-band-analog-males-quartz-watch-necklace-bracelet-set',
        '1-2pcs-men-business-watches-fashion-mens-steel-band-quartz-watch-with-bracelet-box-not-included',
        '6-piece-set-of-fashion-electronic-watch-necklace-earrings-ring-set-for-teenagers-boys-and-girls-the-best-choice-for-frien-watch-for-women-women-watches',
    }
    for handle in sorted(us_handles):
        product_rows = [r for r in quotes if r['handle'] == handle]
        if not product_rows:
            raise RuntimeError(f'No quote rows for {handle}')
        cost = max(upper_us_cost(r['us_quote_item_cost']) for r in product_rows if r['us_quote_item_cost'])
        shipping = max(upper_us_shipping(r['us_quote_shipping_cost']) for r in product_rows if r['us_quote_shipping_cost'] and 'NO SHIPPING' not in r['us_quote_shipping_cost'])
        floor = minimum_price(cost, shipping)
        recommended = retail_99(floor)
        rows.append({
            'country': 'US', 'product_title': product_rows[0]['product_title'], 'handle': handle,
            'variant_title': 'ALL MAPPED VARIANTS (CONSERVATIVE MAX COST)', 'sku': '',
            'current_storefront_price': '', 'supplier_cost_basis': q2(cost),
            'shipping_cost_basis': q2(shipping), 'shipping_evidence': 'VERIFIED_US_QUOTE',
            'minimum_price': q2(floor), 'recommended_action_price': q2(recommended),
            'price_change': '', 'price_action_required': 'yes',
            'quote_result': ';'.join(sorted(set(r['us_quote_result'] for r in product_rows))),
            'disposition': 'USD_STOREFRONT_PRICE_VALIDATION_REQUIRED',
            'formula': '(supplier_cost + shipping + 0.30) / 0.52535',
        })

    active_groups: dict[str, list[dict]] = {}
    for quote in quotes:
        if quote['status'] == 'ACTIVE' and quote['launch_tag'] == 'yes' and quote['us_quote_result']:
            active_groups.setdefault(quote['handle'], []).append(quote)
    for handle, product_rows in sorted(active_groups.items()):
        sellable_failure = any(
            r['us_quote_result'].startswith('FAIL')
            and r['available_for_sale'].lower() == 'true'
            and int(r['inventory_quantity'] or 0) > 0
            for r in product_rows
        )
        if sellable_failure:
            continue
        cost_rows = [r for r in product_rows if r['us_quote_item_cost']]
        shipping_rows = [r for r in product_rows if r['us_quote_shipping_cost'] and 'NO SHIPPING' not in r['us_quote_shipping_cost']]
        if not cost_rows or not shipping_rows:
            raise RuntimeError(f'Incomplete active US cost evidence for {handle}')
        cost = max(upper_us_cost(r['us_quote_item_cost']) for r in cost_rows)
        shipping = max(upper_us_shipping(r['us_quote_shipping_cost']) for r in shipping_rows)
        floor = minimum_price(cost, shipping)
        recommended = retail_99(floor)
        rows.append({
            'country': 'US', 'product_title': product_rows[0]['product_title'], 'handle': handle,
            'variant_title': 'ACTIVE SELLABLE SET (CONSERVATIVE MAX COST)', 'sku': '',
            'current_storefront_price': '', 'supplier_cost_basis': q2(cost),
            'shipping_cost_basis': q2(shipping), 'shipping_evidence': 'VERIFIED_US_ACTIVE_QUOTE_SET',
            'minimum_price': q2(floor), 'recommended_action_price': q2(recommended),
            'price_change': '', 'price_action_required': 'yes',
            'quote_result': ';'.join(sorted(set(r['us_quote_result'] for r in product_rows))),
            'disposition': 'ACTIVE_US_PRICE_VALIDATION_REQUIRED',
            'formula': '(supplier_cost + shipping + 0.30) / 0.52535',
        })

    catalog_path = docs / f'storewide-us-catalog-price-validation-{args.date}.csv'
    if catalog_path.exists():
        catalog_reviews = {r['handle']: r for r in read_csv(catalog_path)}
        for row in rows:
            review = catalog_reviews.get(row['handle'])
            if (
                row['disposition'] in {
                    'ACTIVE_US_PRICE_VALIDATION_REQUIRED',
                    'USD_STOREFRONT_PRICE_VALIDATION_REQUIRED',
                }
                and review
                and review['verdict'].startswith('PASS_')
            ):
                row['current_storefront_price'] = review['observed_us_price_range']
                row['price_change'] = '0.00'
                row['price_action_required'] = 'no'
                if row['disposition'] == 'USD_STOREFRONT_PRICE_VALIDATION_REQUIRED':
                    row['disposition'] = (
                        'DRAFT_US_FIXED_OVERRIDE_VALIDATED'
                        if review['verdict'] == 'PASS_FIXED_US_PRICE_OVERRIDE'
                        else 'DRAFT_US_PRICE_VALIDATED'
                    )
                else:
                    row['disposition'] = (
                        'ACTIVE_US_FIXED_OVERRIDE_VALIDATED'
                        if review['verdict'] == 'PASS_FIXED_US_PRICE_OVERRIDE'
                        else 'ACTIVE_US_PRICE_VALIDATED'
                    )

    rows.sort(key=lambda r: (r['country'], r['product_title'].lower(), r['variant_title'].lower()))
    write_csv(docs / f'storewide-pricing-actions-{args.date}.csv', rows)
    write_markdown(docs / f'storewide-pricing-actions-{args.date}.md', rows, args.date)
    print(f'Pricing rows: {len(rows)}')


if __name__ == '__main__':
    main()
