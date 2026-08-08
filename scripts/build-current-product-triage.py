#!/usr/bin/env python3
"""Build a provisional product-level triage from Shopify and DSers evidence.

This intentionally does not approve products. DSers card prices are product-level
ranges, not proof of the exact mapped Shopify variant or delivered cost.
"""

from __future__ import annotations

import csv
import json
import re
from decimal import Decimal
from pathlib import Path


CATALOG = Path("docs/recovery-evidence/shopify-admin-catalog-2026-08-08.json")
DSERS = Path("docs/recovery-evidence/dsers-mapping-verification-2026-08-08.csv")
CSV_OUT = Path("docs/recovery-evidence/current-product-triage-2026-08-08.csv")
MD_OUT = Path("docs/recovery-evidence/current-product-triage-2026-08-08.md")

HIGH_RISK = {
    "knife", "drill", "hammock", "flosser", "irrigator", "purifier",
    "massage", "straightener", "trimmer", "dash cam", "camera", "feeder",
    "padlock", "smart watch", "smartwatch", "earbuds", "espresso",
}
ELECTRICAL = {
    "usb", "rechargeable", "wireless", "smart", "electric", "battery",
    "wifi", "wi-fi", "led", "amoled", "bluetooth", "digital", "charger",
}
BRANDS = {
    "baseus", "lenovo", "tesla", "naturehike", "denokin", "70mai", "kawa",
    "zeblaze", "essager", "trustfire", "vgr",
}


def normalize_title(value: str) -> str:
    return value.replace("â€”", "—").replace("â€“", "–").strip().casefold()


def money_range(value: str) -> tuple[Decimal | None, Decimal | None]:
    amounts = [Decimal(match) for match in re.findall(r"\d+(?:\.\d+)?", value or "")]
    if not amounts:
        return None, None
    return min(amounts), max(amounts)


def percentage(value: Decimal | None) -> str:
    return f"{value.quantize(Decimal('0.1'))}" if value is not None else ""


def main() -> None:
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    with DSERS.open(newline="", encoding="utf-8-sig") as handle:
        dsers_rows = list(csv.DictReader(handle))
    dsers_by_title = {
        normalize_title(row["shopify_product"]): row for row in dsers_rows
    }

    rows: list[dict[str, str | int]] = []
    for product in catalog["products"]:
        dsers = dsers_by_title.get(normalize_title(product["title"]))
        variants = product["variants"]["nodes"]
        prices = [Decimal(variant["price"]) for variant in variants]
        price_min, price_max = min(prices), max(prices)
        cost_min, cost_max = money_range((dsers or {}).get("ca_cost", ""))
        headroom = None
        if cost_max is not None and price_min > 0:
            headroom = (price_min - cost_max) / price_min * 100

        title = product["title"]
        text = f"{title} {product.get('description') or ''}".casefold()
        risks = []
        if any(term in text for term in HIGH_RISK):
            risks.append("high safety/returns/support review")
        if any(term in text for term in ELECTRICAL):
            risks.append("electrical/battery/app review")
        if any(term in text for term in BRANDS):
            risks.append("brand/resale authenticity review")
        if "naturehike" in text:
            risks.append("confirmed copy/media mismatch")
        if "smart pet feeder" in text:
            risks.append("selected DSers SKU must be checked against WiFi/voice claims")
        if any(variant["inventoryQuantity"] in (50, 999) for variant in variants):
            risks.append("placeholder-like Shopify inventory")

        route = (dsers or {}).get("canada_route_status", "Not inspected")
        route_verified = route.startswith("Verified in DSers")
        score = 0
        if headroom is not None:
            score += 30 if headroom >= 60 else 20 if headroom >= 45 else 10 if headroom >= 30 else 0
        stock = int((dsers or {}).get("dsers_stock") or 0)
        score += 10 if stock >= 1000 else 5 if stock >= 100 else 0
        score += 20 if route_verified else 0
        score -= 12 if "high safety/returns/support review" in risks else 0
        score -= 8 if "electrical/battery/app review" in risks else 0
        score -= 8 if "brand/resale authenticity review" in risks else 0
        score -= 30 if "confirmed copy/media mismatch" in risks else 0

        if not dsers:
            status = "BLOCKED: DSers product row not joined"
        elif headroom is None:
            status = "HOLD: cost range unavailable"
        elif headroom < 30:
            status = "HOLD: item cost alone leaves under 30% before shipping/fees"
        elif route_verified:
            status = "DEEP REVIEW: route captured; verify exact SKU, claims and full margin"
        else:
            status = "ROUTE PRIORITY: mapped; inspect exact SKU and Canada/US delivery"

        rows.append({
            "provisional_score": score,
            "shopify_product_id": product["legacyResourceId"],
            "shopify_title": title,
            "dsers_product_id": (dsers or {}).get("dsers_product_id", ""),
            "shopify_price_min_cad": f"{price_min:.2f}",
            "shopify_price_max_cad": f"{price_max:.2f}",
            "dsers_card_cost_min_cad": f"{cost_min:.2f}" if cost_min is not None else "",
            "dsers_card_cost_max_cad": f"{cost_max:.2f}" if cost_max is not None else "",
            "item_cost_only_headroom_pct_conservative": percentage(headroom),
            "dsers_stock": stock,
            "canada_route_status": route,
            "triage_status": status,
            "risk_flags": " | ".join(risks),
            "evidence_limit": "DSers product-card range; exact variant, shipping, fees, returns and competition still required",
        })

    rows.sort(key=lambda row: int(row["provisional_score"]), reverse=True)
    with CSV_OUT.open("w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)

    route_priority = [row for row in rows if str(row["triage_status"]).startswith("ROUTE PRIORITY")]
    deep_review = [row for row in rows if str(row["triage_status"]).startswith("DEEP REVIEW")]
    hold = [row for row in rows if str(row["triage_status"]).startswith("HOLD")]
    lines = [
        "# Current mapped-product triage — 2026-08-08",
        "",
        "## Decision boundary",
        "",
        "All 29 products are mapped at DSers product level. This score is only a",
        "work-order priority; it is not product approval. DSers card cost ranges do",
        "not prove the exact variant, delivered cost, claim fidelity or competitive",
        "selling price.",
        "",
        f"- Route-priority records: {len(route_priority)}",
        f"- Deep-review records with a captured Canadian route: {len(deep_review)}",
        f"- Item-cost-only holds: {len(hold)}",
        "",
        "## Next inspection order",
        "",
    ]
    for index, row in enumerate(rows[:10], start=1):
        lines.append(
            f"{index}. **{row['shopify_title']}** — score {row['provisional_score']}; "
            f"{row['triage_status']}."
        )
    lines.extend([
        "",
        "The detailed 29-row workboard is `current-product-triage-2026-08-08.csv`.",
        "Inspect exact DSers variants and route economics in this order, then rerank",
        "with competitive price and product-fidelity evidence before selecting a cohort.",
    ])
    MD_OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {len(rows)} products to {CSV_OUT} and {MD_OUT}")


if __name__ == "__main__":
    main()
