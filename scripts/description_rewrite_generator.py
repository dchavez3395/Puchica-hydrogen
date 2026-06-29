#!/usr/bin/env python3
"""description_rewrite_generator.py — Generate new descriptions for the
115 low-quality products identified by description_quality_audit.py.

Approach: template-driven generation using the agency-agents personas'
principles (marketing-content-creator, marketing-seo-specialist,
design-brand-guardian) baked into the script. Generates HTML-formatted
descriptions for review BEFORE any live mutations.

Voice (per Puchica brand):
* Canadian-owned, friendly, helpful
* "we usually reply within one business day"
* Free shipping in Canada (where applicable)
* 30-day returns
* Plain language, no jargon

Structure (per marketing-seo-specialist + design-brand-guardian):
1. Hook paragraph (1-2 sentences) — answer "what is this?"
2. Bullet list of key features/specs (3-6 bullets)
3. "Why we love it" paragraph (1-2 sentences)
4. Shipping/returns CTA block
5. Brand mention ("Puchica — Canadian-owned, ship fast")

Output:
- description-rewrites-{date}.md (review file, one product per section)
- description-rewrites-{date}.csv (product_id, new_html, ready for apply)

This script does NOT mutate Shopify. It's a generation tool.
The apply script is description_rewrite_apply.py (separate).
"""
import argparse
import csv
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin  # noqa: E402


# Brand voice blocks
VOICE_HOOKS = {
    'intimate_care': "Your intimate wellness routine deserves better than the drugstore basics.",
    'sexual_wellness': "Premium pleasure, engineered for real bodies.",
    'phone_case': "Your phone works hard. Its case should too.",
    'home_kitchen': "The kitchen is the heart of the home. Make it work better.",
    'home_decor': "A space that feels like you starts with one piece at a time.",
    'apparel': "Style that fits your day, not someone else's runway.",
    'electronics': "Tech that does its job without making you read the manual twice.",
    'health_wellness': "Your body carries you everywhere. Give it tools that actually help.",
    'beauty': "Beauty routines that respect your time and your skin.",
    'tools': "The right tool turns a 2-hour job into a 20-minute job.",
    'automotive': "Your car sees more of the world than you do. Treat it accordingly.",
    'pets': "They don't ask for much. The least you can do is get them good stuff.",
    'baby': "For the tiny human who has more stuff than you do now.",
    'toys': "Play is serious business. Get something actually fun.",
    'sports': "Move your body. The couch will still be there when you get back.",
    'office': "Working from home? Working from anywhere? Your setup matters.",
    'garden': "Plants don't care if you're good at this. They'll die either way.",
}


# Tag-driven feature extraction
FEATURE_KEYWORDS = {
    # Material/build
    'material': ['stainless steel', 'silicone', 'plastic', 'wood', 'bamboo',
                 'glass', 'leather', 'cotton', 'polyester', 'abs plastic',
                 'aluminum', 'ceramic', 'memory foam', 'gel', 'rubber'],
    # Sizes
    'size': ['compact', 'mini', 'large', 'xl', 'small', 'medium', 'travel-size',
             'full-size', 'queen', 'king', 'twin'],
    # Functions
    'function': ['wireless', 'rechargeable', 'waterproof', 'portable',
                 'foldable', 'adjustable', 'removable', 'machine-washable',
                 'dishwasher-safe', 'microwave-safe', 'oven-safe', 'freezer-safe',
                 'leak-proof', 'spill-proof', 'shatterproof',
                 'app-controlled', 'remote-controlled', 'smart',
                 'automatic', 'manual', 'cordless', 'corded', 'usb',
                 'bluetooth', 'wifi'],
    # Use cases
    'use': ['outdoor', 'indoor', 'travel', 'office', 'kitchen', 'bathroom',
            'bedroom', 'car', 'gym', 'camping', 'hiking', 'running',
            'yoga', 'meditation', 'sleep', 'work', 'study', 'party'],
}


def detect_product_context(title, product_type, tags):
    """Map a product to one of the voice hooks by keyword + productType."""
    title_l = (title or '').lower()
    tags_l = ' '.join(t.lower() for t in (tags or []))
    ptype_l = (product_type or '').lower()
    blob = ' '.join([title_l, tags_l, ptype_l])

    # Check for intimate / sexual first (most specific)
    if any(k in blob for k in ['intimate', 'massager', 'vibrator', 'dildo',
                                  'kegel', 'lubricant', 'condom', 'lelo',
                                  'satisfyer', 'liberator']):
        return 'sexual_wellness' if 'massager' in blob or 'vibrator' in blob else 'intimate_care'

    if 'phone case' in ptype_l or 'phonecase' in tags_l:
        return 'phone_case'

    return {
        'phone case': 'phone_case',
        'home & kitchen': 'home_kitchen',
        'home decor': 'home_decor',
        'apparel & accessories': 'apparel',
        'electronics & accessories': 'electronics',
        'health & wellness': 'health_wellness',
        'beauty & grooming': 'beauty',
        'tools & home improvement': 'tools',
        'automotive': 'automotive',
        'pet supplies': 'pets',
        'baby & nursery': 'baby',
        'toys & games': 'toys',
        'sports & outdoors': 'sports',
        'office & school supplies': 'office',
        'garden & outdoor': 'garden',
    }.get(ptype_l, 'home_kitchen')


def extract_features(title, tags):
    """Pull features from title + tags using keyword matching.
    Skip tags that look like promotions / collections / brand-meta."""
    title_l = (title or '').lower()
    tags_l = ' '.join(t.lower() for t in (tags or []))
    blob = ' '.join([title_l, tags_l])

    found = defaultdict(list)
    for category, kws in FEATURE_KEYWORDS.items():
        for kw in kws:
            if kw in blob:
                found[category].append(kw)
    return found


def extract_title_features(title):
    """Extract product-specific features from the title.
    Returns human-readable bullets derived from title tokens."""
    if not title:
        return []
    bullets = []
    # Look for technical/specific tokens that indicate features.
    # These are the kinds of words a copywriter would lift as bullets.
    title_lower = title.lower()
    tokens = re.split(r'[\s,/&-]+', title_lower)
    tokens = [t.strip('.,()') for t in tokens if t.strip()]

    # High-signal terms to surface as bullets
    PRIORITY_TERMS = {
        # Tech
        'smart': 'Smart WiFi enabled',
        'wireless': 'Wireless',
        'bluetooth': 'Bluetooth connectivity',
        'rechargeable': 'Rechargeable',
        'cordless': 'Cordless',
        'app-controlled': 'App-controlled',
        'app controlled': 'App-controlled',
        'remote-controlled': 'Remote-controlled',
        'remote controlled': 'Remote-controlled',
        'usb': 'USB powered',
        'wifi': 'WiFi enabled',
        # Materials
        'stainless steel': 'Stainless steel',
        'silicone': 'Silicone',
        'leather': 'Leather',
        'memory foam': 'Memory foam',
        'cotton': 'Cotton',
        'ceramic': 'Ceramic',
        # Build/size
        'waterproof': 'Waterproof',
        'shatterproof': 'Shatterproof',
        'leak-proof': 'Leak-proof',
        'leak proof': 'Leak-proof',
        'foldable': 'Foldable',
        'collapsible': 'Collapsible',
        'compact': 'Compact design',
        'portable': 'Portable',
        'travel-size': 'Travel-friendly',
        'travel size': 'Travel-friendly',
        'machine-washable': 'Machine washable',
        'machine washable': 'Machine washable',
        'dishwasher-safe': 'Dishwasher safe',
        'dishwasher safe': 'Dishwasher safe',
        'microwave-safe': 'Microwave safe',
        'oven-safe': 'Oven safe',
        # Configs
        '3-in-1': '3-in-1 functionality',
        '4-in-1': '4-in-1 functionality',
        '5-in-1': '5-in-1 functionality',
        '2-in-1': '2-in-1 functionality',
        # Use context
        'outdoor': 'Outdoor-ready',
        'indoor': 'Indoor-friendly',
        'travel': 'Travel-friendly',
        'office': 'Office-friendly',
        # Specific feature words
        'heated': 'Heated',
        'massage': 'Massage function',
        'massager': 'Massage function',
        'led': 'LED',
        'cct': 'Adjustable color temperature',
        'rgb': 'RGB color changing',
        'magnetic': 'Magnetic',
        'adjustable': 'Adjustable',
        'removable': 'Removable parts',
    }

    seen = set()
    for term, label in PRIORITY_TERMS.items():
        if term in title_lower:
            key = label.lower()
            # Don't add 'Smart' alone if we already have 'Smart WiFi enabled'
            if key in seen:
                continue
            # Skip bare 'Smart' if a 'Smart X enabled' label exists
            if key == 'smart':
                if 'smart wifi enabled' in seen or 'bluetooth' in key:
                    continue
            seen.add(key)
            bullets.append(label)
        if len(bullets) >= 5:
            break

    return bullets


def build_description(title, product_type, tags, price=None, vendor=None):
    """Generate an HTML description for a product using brand voice."""
    ctx = detect_product_context(title, product_type, tags)
    hook = VOICE_HOOKS.get(ctx, VOICE_HOOKS['home_kitchen'])
    features = extract_features(title, tags)
    title_features = extract_title_features(title)

    # Build feature bullets - title-derived first, then keyword features
    bullets = []
    seen = set()

    # Priority 1: high-signal title-derived features
    for f in title_features:
        key = f.lower()
        if key in seen:
            continue
        seen.add(key)
        bullets.append(f)

    # Priority 2: keyword-based features (function/material/use)
    priority_order = ['function', 'material', 'use']
    for cat in priority_order:
        for f in features.get(cat, [])[:2]:
            f_clean = f.replace('-', ' ').title()
            key = f_clean.lower()
            if key in seen:
                continue
            seen.add(key)
            bullets.append(f_clean)

    # Priority 3: descriptive tags (skip promotional / collection / vendor tags)
    if len(bullets) < 3 and tags:
        for t in tags[:8]:
            tl = t.lower()
            if any(x in tl for x in ['vendor_', 'audience_', 'category_',
                                       'collection_', 'bf24', '_promo',
                                       'sale_', 'gift_', 'all ', '_sale',
                                       'best_sellers', 'trending', 'new_arrival']):
                continue
            t_clean = t.replace('-', ' ').replace('_', ' ').title()
            if len(t_clean) < 4 or len(t_clean) > 30:
                continue
            key = t_clean.lower()
            if key in seen:
                continue
            seen.add(key)
            bullets.append(t_clean)
            if len(bullets) >= 5:
                break

    # Fallback bullets if still empty
    if not bullets:
        bullets = ['Premium quality', 'Fast shipping', '30-day returns']

    # Build HTML
    bullets_html = '\n'.join(f'  <li>{b}</li>' for b in bullets[:6])

    price_str = ''
    if price is not None:
        price_str = f" <strong>${price:.2f}</strong>"

    vendor_str = ''
    if vendor and vendor.lower() != 'puchica':
        vendor_str = f" by <strong>{vendor}</strong>"

    price_str = f"<strong>${price:.2f}</strong>" if price is not None else ''
    description = f"""<p><strong>{title}</strong>{vendor_str} — {price_str} at Puchica.</p>

<p>{hook}</p>

<h3>What makes it worth your time</h3>
<ul>
{bullets_html}
</ul>

<p>Every product we sell is hand-picked by our team in Winnipeg. We dropship directly from vetted suppliers so you get fair prices without the retail markup — and if something's not right, reply to your order email and we'll make it right.</p>

<h3>Shipping &amp; returns</h3>
<ul>
  <li>Free shipping on Canadian orders over $50</li>
  <li>Ships within 2-3 business days from our Canadian warehouse</li>
  <li>30-day returns, no restocking fees</li>
  <li>Questions? We usually reply within one business day</li>
</ul>

<p>Puchica is Canadian-owned. Thank you for shopping small.</p>"""

    return description


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--priority-csv', default='description-rewrite-priority.csv')
    ap.add_argument('--limit', type=int, default=None,
                    help='Limit number of products (for testing)')
    ap.add_argument('--out-md', default='description-rewrites-2026-06-29.md')
    ap.add_argument('--out-csv', default='description-rewrites-2026-06-29.csv')
    ap.add_argument('--out-json', default='description-rewrites-2026-06-29.json')
    args = ap.parse_args()

    priority_path = Path(args.priority_csv)
    if not priority_path.exists():
        print(f'Priority CSV not found: {priority_path}')
        print('Run scripts/description_quality_audit.py first.')
        sys.exit(1)

    # Read priority list, filter to score<50
    with priority_path.open(encoding='utf-8') as f:
        reader = csv.DictReader(f)
        priority_rows = [r for r in reader if int(r['quality_score']) < 50]

    if args.limit:
        priority_rows = priority_rows[:args.limit]

    print(f'Generating rewrites for {len(priority_rows)} low-quality products')

    # Fetch full product data for each
    handles = [r['handle'] for r in priority_rows]
    with ShopifyAdmin() as s:
        all_products = s.list_all_products(fields=[
            'id', 'title', 'handle', 'productType', 'tags', 'vendor', 'status',
            'variants(first: 1) { nodes { price } }',
        ])

    by_handle = {p['handle']: p for p in all_products}

    rewrites = []
    not_found = 0
    for r in priority_rows:
        p = by_handle.get(r['handle'])
        if not p:
            not_found += 1
            continue
        variants = (p.get('variants') or {}).get('nodes') or []
        price = float(variants[0].get('price')) if variants and variants[0].get('price') else None
        new_desc = build_description(p['title'], p.get('productType'),
                                      p.get('tags'), price=price,
                                      vendor=p.get('vendor'))
        rewrites.append({
            'id': p['id'].split('/')[-1],
            'handle': p['handle'],
            'title': p['title'],
            'productType': p.get('productType') or '',
            'old_quality_score': int(r['quality_score']),
            'old_desc_len': int(r['desc_len']),
            'price': price,
            'new_html': new_desc,
            'new_len': len(re.sub(r'<[^>]+>', '', new_desc).strip()),
        })

    if not_found:
        print(f'  Warning: {not_found} products not found in store')

    # Stats
    avg_old = sum(r['old_desc_len'] for r in rewrites) / len(rewrites) if rewrites else 0
    avg_new = sum(r['new_len'] for r in rewrites) / len(rewrites) if rewrites else 0
    print(f'  Avg description length: {avg_old:.0f} -> {avg_new:.0f} chars')
    print(f'  All new descriptions: {min(r["new_len"] for r in rewrites)}-{max(r["new_len"] for r in rewrites)} chars')

    # Write CSV
    with open(args.out_csv, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'id', 'handle', 'title', 'productType',
            'old_quality_score', 'old_desc_len',
            'price', 'new_len',
        ])
        writer.writeheader()
        for r in rewrites:
            writer.writerow({k: r[k] for k in writer.fieldnames})

    # Write JSON with full HTML for the apply script
    with open(args.out_json, 'w', encoding='utf-8') as f:
        json.dump([{k: v for k, v in r.items()} for r in rewrites],
                  f, indent=2, ensure_ascii=False)

    # Write Markdown for review
    md = []
    md.append('# Description Rewrites — Review File')
    md.append('')
    md.append(f'Generated for **{len(rewrites)} products** with quality score < 50.')
    md.append('')
    md.append('Each section shows the original product, the new description, and a render preview.')
    md.append('')
    for r in rewrites:
        md.append('---')
        md.append('')
        md.append(f"## `{r['handle']}` — {r['title']}")
        md.append('')
        md.append(f"- productType: `{r['productType']}`")
        md.append(f"- price: ${r['price']:.2f}" if r['price'] else '- price: (none)')
        md.append(f"- old length: {r['old_desc_len']} chars (quality score: {r['old_quality_score']})")
        md.append(f"- new length: {r['new_len']} chars")
        md.append('')
        md.append('### Generated HTML')
        md.append('')
        md.append('```html')
        md.append(r['new_html'])
        md.append('```')
        md.append('')
    Path(args.out_md).write_text('\n'.join(md), encoding='utf-8')

    print(f'\nWrote:')
    print(f'  {args.out_csv}  (apply-friendly)')
    print(f'  {args.out_json} (full HTML for apply script)')
    print(f'  {args.out_md}   (human review)')


if __name__ == '__main__':
    main()