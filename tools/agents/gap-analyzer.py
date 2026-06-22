#!/usr/bin/env python3
"""Gap Analyzer - compare live puchica.ca schema coverage vs Hydrogen repo expectations."""
import json
import os
import re
import subprocess
import sys
import urllib.request
from collections import Counter
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
          productType tags
          featuredImage { url altText }
          descriptionHtml
          seo { title description }
        } }
      }
    }
    """
    resp = graphql(domain, token, query, {"first": 100})
    if resp.get("errors"):
        print(f"[FATAL] GraphQL errors: {json.dumps(resp['errors'])}", file=sys.stderr)
        sys.exit(1)

    nodes = [e["node"] for e in resp["data"]["products"]["edges"]]

    # Type histogram
    types = Counter(p.get("productType") or "(empty)" for p in nodes)

    # Tag histogram
    tags = Counter()
    for p in nodes:
        for t in p.get("tags") or []:
            tags[t] += 1

    # Description stats
    desc_lens = [len(p.get("descriptionHtml") or "") for p in nodes]
    avg_desc = round(sum(desc_lens) / max(1, len(desc_lens)))
    empty_desc = sum(1 for n in desc_lens if n == 0)

    # SEO
    seo_missing = sum(
        1 for p in nodes
        if not p.get("seo") or not p["seo"].get("title") or not p["seo"].get("description")
    )

    # Repo GraphQL query locations
    repo_queries = []
    skip_dirs = {"node_modules", ".react-router", ".git", "build", "dist"}
    for ts_path in SITE_ROOT.rglob("*.ts"):
        if any(part in skip_dirs for part in ts_path.parts):
            continue
        try:
            text = ts_path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        if re.search(r"\bproduct[s]?\s*\{|productType|featuredImage", text):
            try:
                rel = ts_path.relative_to(SITE_ROOT)
            except ValueError:
                rel = ts_path
            repo_queries.append(str(rel))

    stamp = datetime.now().strftime("%Y%m%d-%H%M")
    out_path = LOG_ROOT / f"gap-analyzer-{stamp}.md"

    lines = []
    lines.append(f"# Gap Analyzer - {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append("")
    lines.append(f"- Sample size: {len(nodes)} products")
    lines.append("")
    lines.append("## Product Types (top 15)")
    lines.append("")
    lines.append("| Type | Count |")
    lines.append("|---|---:|")
    for typ, cnt in types.most_common(15):
        lines.append(f"| {typ} | {cnt} |")
    lines.append("")
    lines.append("## Top Tags")
    lines.append("")
    lines.append("| Tag | Count |")
    lines.append("|---|---:|")
    for tag, cnt in tags.most_common(25):
        lines.append(f"| {tag} | {cnt} |")
    lines.append("")
    lines.append("## Description Coverage")
    lines.append("")
    lines.append(f"- Avg HTML length: {avg_desc}")
    lines.append(f"- Min: {min(desc_lens)}")
    lines.append(f"- Max: {max(desc_lens)}")
    lines.append(f"- Products with empty description: {empty_desc}")
    lines.append("")
    lines.append("## SEO")
    lines.append("")
    lines.append(f"- With custom SEO title/description: {len(nodes) - seo_missing} / {len(nodes)}")
    lines.append(f"- Missing SEO: {seo_missing}")
    lines.append("")
    lines.append("## Repo GraphQL Query Locations")
    lines.append("")
    if not repo_queries:
        lines.append("No product GraphQL queries found in repo source.")
    else:
        seen = sorted(set(repo_queries))
        for q in seen:
            lines.append(f"- `{q}`")
    lines.append("")

    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"[OK] Wrote {out_path}")


if __name__ == "__main__":
    main()
