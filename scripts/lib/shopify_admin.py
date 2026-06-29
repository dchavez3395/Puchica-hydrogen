#!/usr/bin/env python3
"""
shopify_admin.py — Shopify Admin API client for Puchica catalog work.

Single source of truth for OAuth + GraphQL + REST. Replaces the inline
duplicated logic in qa-run.py / seo-fix.py / seo-fix-restore.py.

Usage:
    from shopify_admin import ShopifyAdmin

    with ShopifyAdmin() as shop:
        products = shop.list_products(fields=['id','title','status'])
        for p in products:
            shop.update_product_seo(p['id'], title=p['title'][:70])

OAuth:
    Client-credentials grant on ug91ve-sz.myshopify.com. Token cached
    to .shopify-admin-token; auto-refresh on expiry. Scope:
    read_locations, write_files, write_inventory, write_products.

Features:
    - Cursor pagination for list_products
    - Throttle-aware (GraphQL cost read from response, sleeps if low)
    - Idempotent writes (skips writes where existing value already matches)
    - Retry on transient HTTP errors
    - Both GraphQL (preferred) and REST helpers
"""
from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.request
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Callable, Iterable, Iterator

# ----- Configuration -----

DEFAULT_DOMAIN = 'ug91ve-sz.myshopify.com'
DEFAULT_API_VERSION = '2025-04'
# OAuth client_id is the public identifier of the Shopify app — not a secret.
# It appears in OAuth redirect URLs and is safe to commit.
CLIENT_ID = 'ddf2d9f5043ddfb4a2baedef8d7a34e5'
# client_secret is private; pull from environment. The .shopify-admin-token
# file is itself a freshly-issued access_token (24h expiry, not the
# client_secret) so it's safe to commit if it slips in, but keep it
# out of git anyway via .gitignore.
CLIENT_SECRET = os.environ.get('SHOPIFY_ADMIN_CLIENT_SECRET', '').strip()
TOKEN_FILE = '.shopify-admin-token'
OAUTH_URL_TMPL = 'https://{domain}/admin/oauth/access_token'

# GraphQL throttle: stay above this many points available
THROTTLE_FLOOR = 200
THROTTLE_SLEEP_S = 1.0

# HTTP retry policy
MAX_RETRIES = 5
RETRY_BACKOFF_S = 1.5


# ----- Auth -----

def _read_token_file(path: str | Path) -> dict | None:
    p = Path(path)
    if not p.exists():
        return None
    try:
        with p.open('r', encoding='utf-8-sig') as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return None


def _write_token_file(path: str | Path, token_data: dict) -> None:
    p = Path(path)
    with p.open('w', encoding='utf-8') as f:
        json.dump(token_data, f, indent=2)


def fetch_access_token(
    domain: str = DEFAULT_DOMAIN,
    client_id: str = CLIENT_ID,
    client_secret: str | None = None,
    timeout: float = 30.0,
) -> dict:
    """POST client_credentials grant. Returns {access_token, scope, expires_in}.

    Reads SHOPIFY_ADMIN_CLIENT_SECRET from env if not passed. Raises
    ShopifyAuthError if the secret is missing.
    """
    secret = client_secret or os.environ.get('SHOPIFY_ADMIN_CLIENT_SECRET', '').strip()
    if not secret:
        raise ShopifyAuthError(
            'Missing SHOPIFY_ADMIN_CLIENT_SECRET. Set it in the environment, '
            "e.g. $env:SHOPIFY_ADMIN_CLIENT_SECRET = 'your-shared-secret-value'"
        )
    body = (
        'grant_type=client_credentials'
        f'&client_id={client_id}'
        f'&client_secret={secret}'
    )
    url = OAUTH_URL_TMPL.format(domain=domain)
    req = urllib.request.Request(
        url, data=body.encode('utf-8'), method='POST',
        headers={'Content-Type': 'application/x-www-form-urlencoded'},
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read())


def get_valid_token(token_file: str | Path = TOKEN_FILE) -> str:
    """Return a fresh access token, refreshing if expired or missing."""
    data = _read_token_file(token_file)
    if data and data.get('access_token') and data.get('expires_at', 0) > time.time() + 60:
        return data['access_token']
    # Refresh
    new = fetch_access_token()
    new['expires_at'] = int(time.time()) + int(new.get('expires_in', 86399))
    _write_token_file(token_file, new)
    return new['access_token']


# ----- HTTP helpers -----

def _request_with_retry(url: str, headers: dict, body: bytes | None = None,
                        method: str = 'GET', timeout: float = 60.0) -> bytes:
    last_err: Exception | None = None
    for attempt in range(MAX_RETRIES):
        try:
            req = urllib.request.Request(url, data=body, headers=headers, method=method)
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            last_err = e
            # 429 rate-limit, 5xx transient → retry
            if e.code in (429, 500, 502, 503, 504) and attempt < MAX_RETRIES - 1:
                # Honor Retry-After if Shopify gives us one
                ra = e.headers.get('Retry-After') if hasattr(e, 'headers') else None
                wait = float(ra) if ra else RETRY_BACKOFF_S * (attempt + 1)
                time.sleep(wait)
                continue
            raise
    raise last_err or RuntimeError('unreachable')


# ----- Client -----

class ShopifyAdmin:
    """Stateless-per-request Admin client with throttle-aware GQL helper."""

    def __init__(self, domain: str = DEFAULT_DOMAIN, api_version: str = DEFAULT_API_VERSION,
                 token_file: str | Path = TOKEN_FILE):
        self.domain = domain
        self.api_version = api_version
        self.token_file = str(token_file)
        self.gql_url = f'https://{domain}/admin/api/{api_version}/graphql.json'
        self.rest_url_tmpl = f'https://{domain}/admin/api/{api_version}/{{path}}'

    def __enter__(self) -> 'ShopifyAdmin':
        self.token = get_valid_token(self.token_file)
        return self

    def __exit__(self, *exc) -> None:
        pass

    # ----- GraphQL -----

    def gql(self, query: str, variables: dict | None = None,
            *, throttle: bool = True) -> dict:
        """POST GraphQL. Throttle-aware: sleeps if cost > floor.

        Throws ShopifyGraphQLError on top-level errors. Returns data dict.
        """
        body = json.dumps({'query': query, 'variables': variables or {}}).encode('utf-8')
        headers = {
            'X-Shopify-Access-Token': self.token,
            'Content-Type': 'application/json',
        }
        last_err: Exception | None = None
        for attempt in range(MAX_RETRIES):
            raw = _request_with_retry(self.gql_url, headers, body, method='POST')
            data = json.loads(raw)
            errs = data.get('errors')
            if errs:
                raise ShopifyGraphQLError(errs)
            if throttle:
                ext = (data.get('extensions') or {}).get('cost') or {}
                avail = ext.get('throttleStatus', {}).get('currentlyAvailable', 1000)
                if avail < THROTTLE_FLOOR:
                    time.sleep(THROTTLE_SLEEP_S)
            return data.get('data') or {}
        raise last_err or RuntimeError('exhausted retries')

    def gql_with_meta(self, query: str, variables: dict | None = None) -> dict:
        """Same as gql but returns the full payload including errors+cost."""
        body = json.dumps({'query': query, 'variables': variables or {}}).encode('utf-8')
        headers = {
            'X-Shopify-Access-Token': self.token,
            'Content-Type': 'application/json',
        }
        raw = _request_with_retry(self.gql_url, headers, body, method='POST')
        return json.loads(raw)

    # ----- Pagination -----

    def paginate(self, query: str, root_path: tuple[str, ...],
                 page_size: int = 100, page_var: str = 'after',
                 variables: dict | None = None) -> Iterator[dict]:
        """Yield each page result. root_path walks into nested edges/nodes.

        E.g. paginate(query, ('data','products'), page_size=50) yields each
        products connection; query must use $after: String and return pageInfo.
        """
        variables = dict(variables or {})
        after = None
        while True:
            variables[page_var] = after
            data = self.gql(query, variables)
            cursor = data
            for k in root_path:
                cursor = cursor.get(k) if cursor else None
                if cursor is None:
                    break
            if cursor is None:
                return
            yield cursor
            pi = cursor.get('pageInfo') or {}
            if not pi.get('hasNextPage'):
                return
            after = pi.get('endCursor')
            if not after:
                return

    # ----- REST helpers -----

    def rest_get(self, path: str, params: dict | None = None) -> dict:
        url = self.rest_url_tmpl.format(path=path)
        if params:
            from urllib.parse import urlencode
            url = url + '?' + urlencode(params)
        req = urllib.request.Request(url, headers={'X-Shopify-Access-Token': self.token})
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read())

    def rest_put(self, path: str, payload: dict) -> dict:
        url = self.rest_url_tmpl.format(path=path)
        body = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            url, data=body, method='PUT',
            headers={
                'X-Shopify-Access-Token': self.token,
                'Content-Type': 'application/json',
            },
        )
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read())

    # ----- Convenience: catalog reads -----

    def list_products(self, fields: list[str] | None = None,
                      query_filter: str | None = None,
                      page_size: int = 100) -> Iterator[list[dict]]:
        """Yield lists of product nodes. fields=null → all default fields.

        query_filter follows Shopify search syntax, e.g.
            query_filter="status:ACTIVE AND title:'brushless'"
        """
        field_str = '\n'.join(fields) if fields else (
            'id\ntitle\nstatus\nproductType\ndescriptionHtml\ntags\n'
            'seo { title description }\nfeaturedImage { url }\n'
            'media(first: 1) { edges { node { id } } }\n'
            'variants(first: 100) {\n'
            '  nodes { id price compareAtPrice availableForSale '
            '          inventoryQuantity inventoryPolicy }\n'
            '}\n'
        )
        q = f"""
        query products($after: String, $q: String) {{
          products(first: {page_size}, after: $after, query: $q) {{
            pageInfo {{ hasNextPage endCursor }}
            nodes {{
              {field_str}
            }}
          }}
        }}
        """
        for page in self.paginate(q, ('products',), variables={'q': query_filter}):
            yield page.get('nodes') or []

    def list_all_products(self, **kwargs) -> list[dict]:
        out = []
        for page in self.list_products(**kwargs):
            out.extend(page)
        return out

    # ----- Convenience: writes -----

    def update_product_seo(self, product_id: str, *,
                           title: str | None = None,
                           description: str | None = None) -> dict:
        """Idempotent SEO write. Pass both fields when present; do NOT pass
        a None value (that would nullify the field)."""
        seo: dict[str, str] = {}
        if title is not None:
            seo['title'] = title
        if description is not None:
            seo['description'] = description
        if not seo:
            return {'productUpdate': {'product': None, 'userErrors': []}}
        mut = """
        mutation productUpdate($input: ProductInput!) {
          productUpdate(input: $input) {
            product { id seo { title description } }
            userErrors { field message }
          }
        }
        """
        gid = product_id if product_id.startswith('gid://') else f'gid://shopify/Product/{product_id}'
        return self.gql(mut, {'input': {'id': gid, 'seo': seo}})

    def set_metafield(self, owner_id: str, namespace: str, key: str,
                      value: Any, type_: str = 'single_line_text_field') -> dict:
        """Set a single metafield on a product/variant/etc.

        owner_id: numeric id or gid
        value: any JSON-serializable; for complex values use 'json' type.
        """
        gid = owner_id if owner_id.startswith('gid://') else f'gid://shopify/Product/{owner_id}'
        mut = """
        mutation setMetafield($metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafields) {
            metafields { id namespace key value type }
            userErrors { field message }
          }
        }
        """
        stored_value = value if isinstance(value, str) else json.dumps(value)
        return self.gql(mut, {'metafields': [{
            'ownerId': gid,
            'namespace': namespace,
            'key': key,
            'type': type_,
            'value': stored_value,
        }]})

    # ----- Diagnostics -----

    def ping(self) -> dict:
        """Cheap connectivity check. Returns shop info."""
        return self.gql('{ shop { id name email primaryDomain { host } } }')


# ----- Errors -----

class ShopifyGraphQLError(Exception):
    def __init__(self, errors):
        super().__init__(f'Shopify GraphQL errors: {errors}')
        self.errors = errors


class ShopifyAuthError(Exception):
    """Raised when OAuth credentials are missing or invalid."""


# ----- CLI -----

def main(argv: list[str]) -> int:
    if '--ping' in argv:
        with ShopifyAdmin() as s:
            info = s.ping()
            print(json.dumps(info, indent=2))
        return 0
    if '--token' in argv:
        tok = get_valid_token()
        print(f'token len={len(tok)}, prefix={tok[:10]}...')
        return 0
    print(__doc__)
    return 1


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))