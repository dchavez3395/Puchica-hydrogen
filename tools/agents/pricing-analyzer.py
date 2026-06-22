#!/usr/bin/env python3
"""Pricing Analyzer - reads all 6000+ puchica.ca products, computes price distributions,
flags outliers, suggests price bands by inferred category.

Read-only. Uses PUBLIC_STOREFRONT_API_TOKEN from .env.
Paginates through all products via cursors.
"""
import json
import os
import re
import statistics
import sys
import urllib.request
from collections import defaultdict
from datetime import datetime
from pathlib import Path

SITE_ROOT = Path(r"E:\Claude\puchica-site")
LOG_ROOT = Path(r"C:\Users\dchav\.openclaw\workspace\logs")
LOG_ROOT.mkdir(parents=True, exist_ok=True)


def load_env(path: Path) -> None:
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
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main() -> None:
    load_env(SITE_ROOT / ".env")
    token = os.environ.get("PUBLIC_STOREFRONT_API_TOKEN", "")
    domain = os.environ.get("PUBLIC_STORE_DOMAIN", "")
    if not token or not domain:
        print("[FATAL] PUBLIC_STOREFRONT_API_TOKEN or PUBLIC_STORE_DOMAIN missing", file=sys.stderr)
        sys.exit(1)

    query = """
    query products($first: Int!, $after: String) {
      products(first: $first, after: $after) {
        edges { cursor node {
          id handle title productType vendor tags
          priceRange { minVariantPrice { amount currencyCode } }
          variants(first: 100) {
            edges { node { id title price { amount } } }
          }
        } }
        pageInfo { hasNextPage endCursor }
      }
    }
    """

    all_products = []
    cursor = None
    page = 0
    while True:
        page += 1
        resp = graphql(domain, token, query, {"first": 100, "after": cursor})
        if resp.get("errors"):
            print(f"[FATAL] GraphQL errors: {json.dumps(resp['errors'])}", file=sys.stderr)
            sys.exit(1)
        data = resp["data"]["products"]
        for edge in data["edges"]:
            all_products.append(edge["node"])
        if not data["pageInfo"]["hasNextPage"]:
            break
        cursor = data["pageInfo"]["endCursor"]
        if page % 5 == 0:
            print(f"[progress] {len(all_products)} products fetched (page {page})...", file=sys.stderr)

    # Collect prices; group by tag-derived category (since productType is mostly empty)
    by_tag_bucket = defaultdict(list)
    flat_prices = []
    flat_min_prices = []
    zero_price = 0
    very_high = 0
    for p in all_products:
        try:
            min_amt = float(p["priceRange"]["minVariantPrice"]["amount"])
        except (KeyError, TypeError, ValueError):
            min_amt = 0.0
        flat_min_prices.append(min_amt)
        if min_amt <= 0:
            zero_price += 1
        if min_amt > 1000:
            very_high += 1

        for v_edge in p.get("variants", {}).get("edges", []):
            try:
                amt = float(v_edge["node"]["price"]["amount"])
            except (KeyError, TypeError, ValueError):
                continue
            flat_prices.append(amt)
            # Bucket by first tag (if any) — common Shopify pattern
            tags = p.get("tags") or []
            bucket = tags[0] if tags else "(no tag)"
            by_tag_bucket[bucket].append(amt)

    # Compute overall stats
    flat_min_prices = [p for p in flat_min_prices if p > 0]
    if not flat_min_prices:
        print("[WARN] No positive prices found", file=sys.stderr)
        sys.exit(1)

    sorted_prices = sorted(flat_min_prices)
    n = len(sorted_prices)
    def pct(p):
        i = max(0, min(n - 1, int(p * n)))
        return sorted_prices[i]
    stats_overall = {
        "count": n,
        "min": sorted_prices[0],
        "p10": pct(0.10),
        "p25": pct(0.25),
        "median": pct(0.50),
        "p75": pct(0.75),
        "p90": pct(0.90),
        "p99": pct(0.99),
        "max": sorted_prices[-1],
        "mean": round(statistics.mean(sorted_prices), 2),
        "stdev": round(statistics.stdev(sorted_prices), 2) if n > 1 else 0,
    }

    # Outliers (1.5x IQR above Q3 or below Q1)
    iqr = stats_overall["p75"] - stats_overall["p25"]
    upper_fence = stats_overall["p75"] + 1.5 * iqr
    lower_fence = max(0, stats_overall["p25"] - 1.5 * iqr)

    outliers_high = []
    outliers_low = []
    for p in all_products:
        try:
            amt = float(p["priceRange"]["minVariantPrice"]["amount"])
        except (KeyError, TypeError, ValueError):
            continue
        if amt > upper_fence and amt > 0:
            outliers_high.append((amt, p["handle"], p["title"]))
        elif 0 < amt < lower_fence:
            outliers_low.append((amt, p["handle"], p["title"]))
    outliers_high.sort(reverse=True)

    # Top 25 tag buckets
    bucket_stats = []
    for tag, prices in by_tag_bucket.items():
        if len(prices) < 3:
            continue
        sorted_b = sorted(prices)
        nb = len(sorted_b)
        bpct = lambda p: sorted_b[max(0, min(nb - 1, int(p * nb)))]
        bucket_stats.append({
            "tag": tag[:60],
            "n": nb,
            "min": sorted_b[0],
            "median": bpct(0.5),
            "max": sorted_b[-1],
        })
    bucket_stats.sort(key=lambda x: -x["n"])

    # Write report
    stamp = datetime.now().strftime("%Y%m%d-%H%M")
    out_path = LOG_ROOT / f"pricing-analyzer-{stamp}.md"
    lines = []
    lines.append(f"# Pricing Analyzer - {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append("")
    lines.append(f"- Sample: {len(all_products)} products, {n} non-zero prices (min variants)")
    lines.append(f"- Zero/missing prices: {zero_price}")
    lines.append(f"- Above $1000: {very_high}")
    lines.append("")
    lines.append("## Overall Distribution (min-variant prices)")
    lines.append("")
    lines.append("| Stat | Value |")
    lines.append("|---|---:|")
    for k, v in stats_overall.items():
        lines.append(f"| {k} | {v} |")
    lines.append("")
    lines.append("## Outlier Thresholds (1.5x IQR)")
    lines.append("")
    lines.append(f"- IQR: {iqr:.2f}")
    lines.append(f"- Lower fence: {lower_fence:.2f}")
    lines.append(f"- Upper fence: {upper_fence:.2f}")
    lines.append("")
    lines.append(f"## High Outliers (above ${upper_fence:.2f}): {len(outliers_high)}")
    lines.append("")
    lines.append("| Price | Handle | Title |")
    lines.append("|---:|---|---|")
    for amt, handle, title in outliers_high[:50]:
        lines.append(f"| {amt:.2f} | {handle} | {title} |")
    if len(outliers_high) > 50:
        lines.append(f"")
        lines.append(f"_({len(outliers_high) - 50} more high outliers — see `outliers-high-{stamp}.json`)_")
    lines.append("")
    lines.append(f"## Low Outliers (below ${lower_fence:.2f}): {len(outliers_low)}")
    lines.append("")
    if outliers_low:
        lines.append("| Price | Handle | Title |")
        lines.append("|---:|---|---|")
        for amt, handle, title in sorted(outliers_low)[:50]:
            lines.append(f"| {amt:.2f} | {handle} | {title} |")
    if len(outliers_low) > 50:
        lines.append(f"")
        lines.append(f"_({len(outliers_low) - 50} more low outliers — see `outliers-low-{stamp}.json`)_")
    else:
        lines.append("_None._")
    lines.append("")
    lines.append("## Top 25 Tag Buckets (by sample size)")
    lines.append("")
    lines.append("| Tag | N | Min | Median | Max |")
    lines.append("|---|---:|---:|---:|---:|")
    for b in bucket_stats[:25]:
        lines.append(f"| {b['tag']} | {b['n']} | {b['min']:.2f} | {b['median']:.2f} | {b['max']:.2f} |")
    lines.append("")
    lines.append("## Quick Observations")
    lines.append("")
    lines.append(f"- Median min-variant price: **${stats_overall['median']:.2f}**")
    lines.append(f"- Top 10% of products start above: **${stats_overall['p90']:.2f}**")
    lines.append(f"- Bottom 10% of products start below: **${stats_overall['p10']:.2f}**")
    if stats_overall["stdev"] > stats_overall["median"] * 2:
        lines.append(f"- Std dev (${stats_overall['stdev']:.2f}) is over 2x the median — large price dispersion, suggests inconsistent pricing strategy.")
    if zero_price > 0:
        lines.append(f"- {zero_price} products have zero price — likely placeholders or unconfigured SKUs.")
    if very_high > 0:
        lines.append(f"- {very_high} products priced above $1000 — verify these are intentional premium SKUs.")
    lines.append("")

    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"[OK] Wrote {out_path}")

    # Also dump full outliers as JSON so the markdown truncation doesn't
    # hide data. Schema: list of {price, handle, title}.
    import json
    (LOG_ROOT / f"outliers-high-{stamp}.json").write_text(
        json.dumps(
            [{"price": a, "handle": h, "title": t} for a, h, t in outliers_high],
            ensure_ascii=False, indent=2
        ),
        encoding="utf-8"
    )
    (LOG_ROOT / f"outliers-low-{stamp}.json").write_text(
        json.dumps(
            [{"price": a, "handle": h, "title": t} for a, h, t in outliers_low],
            ensure_ascii=False, indent=2
        ),
        encoding="utf-8"
    )
    print(f"[OK] Wrote full outliers as JSON")


if __name__ == "__main__":
    main()
