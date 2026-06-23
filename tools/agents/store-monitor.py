#!/usr/bin/env python3
"""Store Monitor - reads puchica.ca store data via Storefront API.
Read-only. Uses PUBLIC_STOREFRONT_API_TOKEN from .env.
"""
import json
import os
import re
import sys
import urllib.request
from datetime import datetime
from pathlib import Path

SITE_ROOT = Path(r"E:\Claude\puchica-site")
LOG_ROOT = Path(r"C:\Users\dchav\.openclaw\workspace\logs")
LOG_ROOT.mkdir(parents=True, exist_ok=True)


def load_env(path: Path) -> None:
    """Parse a .env file into os.environ (no shell expansion)."""
    if not path.exists():
        print(f"[FATAL] .env not found at {path}", file=sys.stderr)
        sys.exit(1)
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        m = re.match(r"^([A-Z_][A-Z0-9_]*)=(.*)$", line)
        if not m:
            continue
        key, val = m.group(1), m.group(2).strip()
        if (val.startswith('"') and val.endswith('"')) or (
            val.startswith("'") and val.endswith("'")
        ):
            val = val[1:-1]
        os.environ[key] = val


def graphql(domain: str, token: str, query: str, variables: dict) -> dict:
    body = json.dumps({"query": query, "variables": variables}).encode("utf-8")
    req = urllib.request.Request(
        f"https://{domain}/api/2025-04/graphql.json",
        data=body,
        headers={
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": token,
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main() -> None:
    load_env(SITE_ROOT / ".env")
    token = os.environ.get("PUBLIC_STOREFRONT_API_TOKEN", "")
    domain = os.environ.get("PUBLIC_STORE_DOMAIN", "")
    if not token or not domain:
        print("[FATAL] PUBLIC_STOREFRONT_API_TOKEN or PUBLIC_STORE_DOMAIN missing", file=sys.stderr)
        sys.exit(1)

    query = """
    query products($first: Int!) {
      products(first: $first) {
        edges { node {
          id handle title productType vendor tags onlineStoreUrl
          featuredImage { url altText }
          images(first: 1) { edges { node { url altText } } }
          variants(first: 10) { edges { node { id title availableForSale sku } } }
        } }
        pageInfo { hasNextPage endCursor }
      }
    }
    """
    resp = graphql(domain, token, query, {"first": 50})
    if resp.get("errors"):
        print(f"[FATAL] GraphQL errors: {json.dumps(resp['errors'])}", file=sys.stderr)
        sys.exit(1)

    nodes = [e["node"] for e in resp["data"]["products"]["edges"]]

    in_stock = sum(
        1 for p in nodes for v in p["variants"]["edges"] if v["node"]["availableForSale"]
    )
    oos_variants = sum(
        1 for p in nodes for v in p["variants"]["edges"] if not v["node"]["availableForSale"]
    )
    missing_alt = sum(
        1 for p in nodes if not p.get("featuredImage") or not p["featuredImage"].get("altText")
    )
    missing_type = sum(1 for p in nodes if not p.get("productType"))
    missing_vendor = sum(1 for p in nodes if not p.get("vendor"))
    missing_image = sum(1 for p in nodes if not p.get("featuredImage"))

    oos_per_product = []
    for p in nodes:
        oos = sum(1 for v in p["variants"]["edges"] if not v["node"]["availableForSale"])
        oos_per_product.append((oos, p["handle"], p["title"]))
    oos_per_product.sort(reverse=True)

    fully_oos = [
        p for p in nodes
        if all(not v["node"]["availableForSale"] for v in p["variants"]["edges"])
    ]

    stamp = datetime.now().strftime("%Y%m%d-%H%M")
    out_path = LOG_ROOT / f"store-monitor-{stamp}.md"

    lines = []
    lines.append(f"# Store Monitor - {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append("")
    lines.append(f"- Domain: {domain}")
    lines.append(f"- Sample size: {len(nodes)} products (50 max per pass)")
    lines.append("")
    lines.append("NOTE: totalInventory not available on public storefront scope; using availableForSale per variant.")
    lines.append("")
    lines.append("## Aggregate (Variant-Level)")
    lines.append("")
    lines.append(f"- Total variants (sample): {in_stock + oos_variants}")
    lines.append(f"- In stock: {in_stock}")
    lines.append(f"- Out of stock: {oos_variants}")
    lines.append(f"- Products missing featured-image alt text: {missing_alt}")
    lines.append(f"- Products missing productType: {missing_type}")
    lines.append(f"- Products missing vendor: {missing_vendor}")
    lines.append("")
    lines.append("## Top 10 Products With Most OOS Variants")
    lines.append("")
    lines.append("| Handle | Title | OOS Variants |")
    lines.append("|---|---|---:|")
    for oos, handle, title in oos_per_product[:10]:
        lines.append(f"| {handle} | {title} | {oos} |")
    lines.append("")
    lines.append("## Fully-Out-of-Stock Products")
    lines.append("")
    if not fully_oos:
        lines.append("None in sample.")
    else:
        for p in fully_oos:
            lines.append(f"- {p['handle']} - {p['title']}")
    lines.append("")
    lines.append("## SEO Gaps")
    lines.append("")
    lines.append(f"- Products missing featured image: {missing_image}")
    lines.append(f"- Products missing alt text on featured image: {missing_alt}")
    lines.append(f"- Products missing productType: {missing_type}")
    lines.append(f"- Products missing vendor: {missing_vendor}")
    lines.append("")

    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"[OK] Wrote {out_path}")


if __name__ == "__main__":
    main()
