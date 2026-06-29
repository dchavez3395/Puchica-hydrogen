#!/usr/bin/env python3
"""catalog_sync.py — Reconcile a local CSV catalog snapshot against the
live Shopify store. Reports (or applies) differences in title, body,
price, status, tags, and SEO. Built on top of scripts/lib/shopify_admin.

Use cases:
    - Bulk-edited a CSV offline, want to push only the rows that changed
    - Found drift between a vendor feed and Shopify, want to see scope
    - Test mode (--dry-run) before committing to a write pass

CSV format (one product per row):
    handle,title,description,vendor,product_type,price,status,tags,seo_title,seo_description,model3d,videos
    hunting-laser-rangefinder,"Hunting Laser Rangefinder",...

    Required: handle (used as the join key)
    Optional: every other column. Missing columns = no check for that field.

Status values: 'active' | 'draft' | 'archived'
Tags: comma-separated within the cell, e.g. "outdoor,hiking,summer"

Examples:
    python scripts/catalog_sync.py --csv catalog.csv --dry-run
    python scripts/catalog_sync.py --csv catalog.csv --apply
    python scripts/catalog_sync.py --csv catalog.csv --filter handle,sku123,sku456
    python scripts/catalog_sync.py --csv catalog.csv --only price,seo_title
"""
import argparse
import csv
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'lib'))
from shopify_admin import ShopifyAdmin, ShopifyGraphQLError  # noqa: E402


# ----- Field mapping (CSV <-> Shopify) -----

# Display name -> (CSV column, Shopify GraphQL field on Product)
FIELDS = {
    'title':           ('title',           'title'),
    'description':     ('description',     'descriptionHtml'),
    'vendor':          ('vendor',          'vendor'),
    'product_type':    ('product_type',    'productType'),
    'status':          ('status',          'status'),
    'tags':            ('tags',            'tags'),
    'price':           ('price',           '__variant_price__'),  # special: pulls first variant
    'seo_title':       ('seo_title',       'seo.title'),
    'seo_description': ('seo_description', 'seo.description'),
    'model3d':         ('model3d',         'model3d.value'),
    'videos':          ('videos',          'videos.value'),
}

# Inverse map: Shopify field path -> CSV column
SHOPIFY_TO_CSV = {v[1]: k for k, v in FIELDS.items()}

WRITE_FIELDS = {'title', 'description', 'vendor', 'product_type',
                'status', 'tags', 'seo_title', 'seo_description',
                'model3d', 'videos'}


# ----- Normalization -----

def normalize_status(s):
    if not s:
        return None
    s = s.strip().upper()
    if s in ('ACTIVE', 'DRAFT', 'ARCHIVED'):
        return s
    return None


def normalize_tags(s):
    """Accept comma- or semicolon-separated tag lists.

    Real-world catalogs mix the two. Splits on both, strips whitespace,
    drops empties, returns a sorted, deduplicated list for diffing.
    """
    if not s:
        return []
    import re
    parts = re.split(r'[,;]', s)
    return sorted({p.strip() for p in parts if p.strip()})


def strip_html(s):
    """Best-effort HTML strip so a CSV plain-text description can be
    compared to a Shopify descriptionHtml without false mismatches."""
    if not s:
        return ''
    import re
    text = re.sub(r'<[^>]+>', ' ', s)
    import html
    text = html.unescape(text)
    return re.sub(r'\s+', ' ', text).strip()


def normalize_seo(s, max_len):
    if not s:
        return ''
    s = s.strip()
    if len(s) > max_len:
        s = s[:max_len]
    return s


# ----- Shopify read -----

PRODUCT_FIELDS = """
  id
  handle
  title
  descriptionHtml
  vendor
  productType
  status
  tags
  seo { title description }
  variants(first: 1) { nodes { price } }
  model3d: metafield(namespace: "custom", key: "model3d") { value }
  videos: metafield(namespace: "custom", key: "videos") { value }
""".strip()


def fetch_product(shop, product_id):
    """Fetch one product by GraphQL id (the only direct lookup)."""
    q = """
    query($id: ID!) {
      product(id: $id) {
        %s
      }
    }
    """ % PRODUCT_FIELDS
    data = shop.gql(q, {'id': product_id})
    return data.get('product')


def fetch_products_by_handles(shop, handles):
    """Fetch multiple products by handle. Builds a handle->product map.

    Strategy: one bulk search via the products query with title-like or
    handle:in filter; in 2025-04 API the handle filter isn't supported
    so we instead do a single query that pulls all 6155 products' (id,
    handle) pairs, build a local handle->id map, then bulk-fetch the
    matched ones by id.
    """
    if not handles:
        return {}

    # 1. Build handle -> id index (cheap; uses products query with id+handle)
    handles_set = set(handles)
    handle_to_id = {}
    q_index = """
    query($after: String) {
      products(first: 100, after: $after) {
        pageInfo { hasNextPage endCursor }
        nodes { id handle }
      }
    }
    """
    after = None
    # Cheap scan: only paginate until we've seen all target handles.
    # Most of the time we'll see all targets in the first 1-2 pages.
    seen = 0
    while True:
        data = shop.gql(q_index, {'after': after})
        prods = data.get('products') or {}
        for n in prods.get('nodes') or []:
            seen += 1
            if n.get('handle') in handles_set:
                handle_to_id[n['handle']] = n['id']
            # early-exit if we've found all targets and the next page
            # is unlikely to add more (handles are stable).
            if len(handle_to_id) == len(handles_set):
                break
        if len(handle_to_id) == len(handles_set):
            break
        pi = prods.get('pageInfo') or {}
        if not pi.get('hasNextPage'):
            break
        after = pi.get('endCursor')
        if not after:
            break

    # 2. Fetch each matched product by id (could batch via GraphQL aliases,
    # but per-id queries are simpler and stay under throttle floor for
    # small N).
    out = {}
    for handle, pid in handle_to_id.items():
        p = fetch_product(shop, pid)
        if p:
            out[handle] = p
    return out


# ----- Diff -----

def to_shopify_value(csv_row, field_name):
    """Convert a CSV cell value to the form Shopify stores."""
    csv_col = FIELDS[field_name][0]
    raw = csv_row.get(csv_col, '')
    if field_name == 'status':
        return normalize_status(raw)
    if field_name == 'tags':
        return normalize_tags(raw)
    if field_name in ('model3d', 'videos'):
        return raw.strip() if raw.strip() else None
    return raw.strip()


def live_value(shop_product, field_name):
    """Extract the current live value for a field, in CSV-comparable form."""
    if not shop_product:
        return None
    if field_name == 'title':
        return shop_product.get('title') or ''
    if field_name == 'description':
        return strip_html(shop_product.get('descriptionHtml') or '')
    if field_name == 'vendor':
        return shop_product.get('vendor') or ''
    if field_name == 'product_type':
        return shop_product.get('productType') or ''
    if field_name == 'status':
        return shop_product.get('status') or ''
    if field_name == 'tags':
        return sorted(shop_product.get('tags') or [])
    if field_name == 'price':
        variants = (shop_product.get('variants') or {}).get('nodes') or []
        if not variants:
            return ''
        return variants[0].get('price') or ''
    if field_name == 'seo_title':
        return (shop_product.get('seo') or {}).get('title') or ''
    if field_name == 'seo_description':
        return (shop_product.get('seo') or {}).get('description') or ''
    if field_name in ('model3d', 'videos'):
        meta = shop_product.get(field_name)
        return (meta or {}).get('value') if meta else None
    return None


def csv_value(csv_row, field_name):
    if field_name == 'tags':
        return sorted(normalize_tags(csv_row.get('tags', '')))
    return to_shopify_value(csv_row, field_name)


def values_match(field_name, csv_v, live_v):
    if csv_v is None and live_v in (None, ''):
        return True
    if field_name == 'status':
        return (csv_v or '').upper() == (live_v or '').upper()
    if field_name == 'description':
        # compare HTML-stripped forms to ignore markup differences
        return strip_html(csv_v or '') == strip_html(live_v or '')
    if field_name == 'seo_title':
        # max 70 chars
        return normalize_seo(csv_v, 70) == (live_v or '')
    if field_name == 'seo_description':
        return normalize_seo(csv_v, 320) == (live_v or '')
    if field_name == 'price':
        # Compare numeric; ignore currency mismatch (CSV is plain numbers)
        try:
            csv_num = float(csv_v or 0)
        except ValueError:
            csv_num = 0
        try:
            live_num = float(live_v or 0)
        except ValueError:
            live_num = 0
        return abs(csv_num - live_num) < 0.01
    if field_name in ('model3d', 'videos'):
        return (csv_v or '') == (live_v or '')
    return (csv_v or '') == (live_v or '')


# ----- Apply -----

def apply_update(shop, product, field_name, csv_v):
    """Apply a single field update to a product. Returns (ok, err_msg)."""
    pid = product['id']
    if field_name in WRITE_FIELDS:
        # Build a partial ProductInput
        inp = {'id': pid}
        if field_name == 'title':
            inp['title'] = csv_v
        elif field_name == 'description':
            inp['descriptionHtml'] = csv_v
        elif field_name == 'vendor':
            inp['vendor'] = csv_v
        elif field_name == 'product_type':
            inp['productType'] = csv_v
        elif field_name == 'status':
            inp['status'] = csv_v
        elif field_name == 'tags':
            inp['tags'] = csv_v  # already list
        elif field_name == 'seo_title':
            return _apply_seo(shop, pid, title=csv_v)
        elif field_name == 'seo_description':
            return _apply_seo(shop, pid, description=csv_v)
        elif field_name in ('model3d', 'videos'):
            return _apply_metafield(shop, pid, field_name, csv_v)

        mut = """
        mutation productUpdate($input: ProductInput!) {
          productUpdate(input: $input) {
            product { id }
            userErrors { field message }
          }
        }
        """
        result = shop.gql(mut, {'input': inp})
        errs = (result.get('productUpdate') or {}).get('userErrors') or []
        if errs:
            return False, '; '.join(e.get('message') for e in errs)
        return True, ''
    if field_name == 'price':
        # Update first variant's price
        variants = (product.get('variants') or {}).get('nodes') or []
        if not variants:
            return False, 'no variants to update'
        vid = variants[0]['id']
        mut = """
        mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
          productVariantsBulkUpdate(productId: $productId, variants: $variants) {
            product { id }
            userErrors { field message }
          }
        }
        """
        try:
            csv_price = float(csv_v or 0)
        except ValueError:
            return False, f'invalid price: {csv_v!r}'
        result = shop.gql(mut, {
            'productId': pid,
            'variants': [{'id': vid, 'price': csv_price}],
        })
        errs = (result.get('productVariantsBulkUpdate') or {}).get('userErrors') or []
        if errs:
            return False, '; '.join(e.get('message') for e in errs)
        return True, ''
    return False, f'field {field_name} not writable'


def _apply_seo(shop, product_id, *, title=None, description=None):
    """Idempotent SEO write: read current, only send the changing field."""
    q = 'query($id: ID!) { product(id: $id) { seo { title description } } }'
    cur = (shop.gql(q, {'id': product_id}).get('product') or {}).get('seo') or {}
    seo = {}
    if title is not None and (cur.get('title') or '') != title:
        seo['title'] = title
    if description is not None and (cur.get('description') or '') != description:
        seo['description'] = description
    if not seo:
        return True, ''  # no change
    mut = """
    mutation productUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product { id seo { title description } }
        userErrors { field message }
      }
    }
    """
    result = shop.gql(mut, {'input': {'id': product_id, 'seo': seo}})
    errs = (result.get('productUpdate') or {}).get('userErrors') or []
    if errs:
        return False, '; '.join(e.get('message') for e in errs)
    return True, ''


def _apply_metafield(shop, product_id, name, value):
    """Set custom.<name> metafield. value=None clears it."""
    mut = """
    mutation setMetafield($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id }
        userErrors { field message }
      }
    }
    """
    payload = [{
        'ownerId': product_id,
        'namespace': 'custom',
        'key': name,
        'type': 'single_line_text_field',
    }]
    if value is None:
        # Use a delete call instead — metafieldsSet with empty value is no-op
        dmut = """
        mutation deleteMetafield($input: MetafieldDeleteInput!) {
          metafieldDelete(input: $input) {
            deletedId
            userErrors { field message }
          }
        }
        """
        result = shop.gql(dmut, {'input': {
            'ownerId': product_id,
            'namespace': 'custom',
            'key': name,
        }})
        errs = (result.get('metafieldDelete') or {}).get('userErrors') or []
        if errs:
            return False, '; '.join(e.get('message') for e in errs)
        return True, ''
    payload[0]['value'] = value
    result = shop.gql(mut, {'metafields': payload})
    errs = (result.get('metafieldsSet') or {}).get('userErrors') or []
    if errs:
        return False, '; '.join(e.get('message') for e in errs)
    return True, ''


# ----- Main -----

def main():
    ap = argparse.ArgumentParser(description='Reconcile a CSV catalog snapshot with Shopify.')
    ap.add_argument('--csv', required=True, help='Path to the catalog CSV.')
    ap.add_argument('--dry-run', action='store_true', default=True,
                    help='Report only, no writes (default).')
    ap.add_argument('--apply', action='store_true',
                    help='Apply changes. Suppresses --dry-run.')
    ap.add_argument('--filter', default='',
                    help='Comma-separated handle list to limit scope.')
    ap.add_argument('--only', default='',
                    help='Comma-separated field names to limit scope (e.g. "price,seo_title").')
    ap.add_argument('--out', default='catalog-sync-report.md',
                    help='Output report path (default: catalog-sync-report.md).')
    ap.add_argument('--quiet', action='store_true')
    args = ap.parse_args()

    apply = args.apply
    if apply:
        args.dry_run = False

    only_set = set(f.strip() for f in args.only.split(',') if f.strip())
    filter_set = set(h.strip() for h in args.filter.split(',') if h.strip())

    if only_set and not set(only_set).issubset(set(FIELDS.keys())):
        bad = set(only_set) - set(FIELDS.keys())
        print(f'Unknown fields: {bad}', file=sys.stderr)
        sys.exit(2)

    with open(args.csv, encoding='utf-8-sig', newline='') as f:
        reader = csv.DictReader(f)
        rows = [r for r in reader]
    if not rows:
        print('CSV is empty', file=sys.stderr)
        sys.exit(2)

    if filter_set:
        rows = [r for r in rows if r.get('handle', '').strip() in filter_set]
        if not rows:
            print(f'No rows match --filter handles', file=sys.stderr)
            sys.exit(0)

    fields_to_check = list(only_set) if only_set else list(FIELDS.keys())

    # Fetch all referenced products
    handles = [r.get('handle', '').strip() for r in rows if r.get('handle', '').strip()]
    if not handles:
        print('No handles found in CSV', file=sys.stderr)
        sys.exit(2)

    diffs = []  # list of {handle, field, csv_value, live_value, action, ok, err}
    missing = []  # handle not found in store

    with ShopifyAdmin() as shop:
        if not args.quiet:
            print(f'Fetching {len(handles)} products from Shopify…')
        live = fetch_products_by_handles(shop, handles)
        if not args.quiet:
            print(f'Got {len(live)} live products ({len(handles) - len(live)} missing).')

        for row in rows:
            handle = row.get('handle', '').strip()
            if not handle:
                continue
            product = live.get(handle)
            if not product:
                missing.append(handle)
                continue
            for fname in fields_to_check:
                csv_v = csv_value(row, fname)
                live_v = live_value(product, fname)
                if values_match(fname, csv_v, live_v):
                    continue
                diff = {
                    'handle': handle,
                    'field': fname,
                    'csv': csv_v,
                    'live': live_v,
                    'action': 'would_write' if args.dry_run else 'wrote',
                    'ok': None,
                    'err': '',
                }
                if not args.dry_run:
                    ok, err = apply_update(shop, product, fname, csv_v)
                    diff['ok'] = ok
                    diff['err'] = err
                    if ok:
                        diff['action'] = 'wrote'
                    else:
                        diff['action'] = 'failed'
                diffs.append(diff)
                if not args.quiet and not args.dry_run:
                    print(f'  {"OK" if diff["ok"] else "FAIL"} {handle} {fname}')

    # Report
    report = render_report(rows, diffs, missing, args, apply)
    Path(args.out).write_text(report, encoding='utf-8')
    if not args.quiet:
        print(f'\nReport: {args.out}')
        print(f'  Scanned:   {len(rows)} rows ({len(handles)} unique handles)')
        print(f'  Missing:   {len(missing)}')
        print(f'  Diff:      {len(diffs)}')
        if apply:
            ok = sum(1 for d in diffs if d.get('ok'))
            failed = sum(1 for d in diffs if d.get('ok') is False)
            print(f'  Applied:   {ok} ok, {failed} failed')


def render_report(rows, diffs, missing, args, apply):
    out = []
    out.append('# Catalog Sync Report')
    out.append('')
    out.append(f'Generated: {time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())}')
    out.append(f'CSV: `{args.csv}` ({len(rows)} rows)')
    out.append(f'Mode: {"apply" if apply else "dry-run"}')
    if args.filter:
        out.append(f'Filter: {args.filter}')
    if args.only:
        out.append(f'Only fields: {args.only}')
    out.append('')

    if missing:
        out.append('## Missing products (handle not in Shopify)')
        out.append('')
        for h in missing:
            out.append(f'- `{h}`')
        out.append('')

    if not diffs:
        out.append('## No differences found.')
        return '\n'.join(out) + '\n'

    out.append(f'## {len(diffs)} differences')
    out.append('')
    if apply:
        ok = sum(1 for d in diffs if d.get('ok'))
        failed = sum(1 for d in diffs if d.get('ok') is False)
        out.append(f'Applied: **{ok} ok**, **{failed} failed**')
        out.append('')

    # Group by handle
    by_handle = {}
    for d in diffs:
        by_handle.setdefault(d['handle'], []).append(d)

    for handle in sorted(by_handle):
        out.append(f'### `{handle}`')
        out.append('')
        out.append('| field | live | csv | action |')
        out.append('| --- | --- | --- | --- |')
        for d in by_handle[handle]:
            csv_s = json.dumps(d['csv'], default=str) if d['csv'] not in (None, '') else '_(empty)_'
            live_s = json.dumps(d['live'], default=str) if d['live'] not in (None, '') else '_(empty)_'
            act = d['action']
            if d.get('err'):
                act += f' — `{d["err"]}`'
            out.append(f'| `{d["field"]}` | {live_s[:80]} | {csv_s[:80]} | {act} |')
        out.append('')
    return '\n'.join(out) + '\n'


if __name__ == '__main__':
    main()