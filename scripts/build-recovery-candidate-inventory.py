#!/usr/bin/env python3
"""Normalize the read-only recovery catalog export into variant evidence."""

from __future__ import annotations

import csv
import json
from decimal import Decimal, InvalidOperation
from pathlib import Path


SOURCE = Path("docs/recovery-evidence/shopify-admin-catalog-2026-08-08.json")
CSV_OUT = Path("docs/recovery-evidence/candidate-variant-inventory-2026-08-08.csv")
JSON_OUT = Path("docs/recovery-evidence/candidate-variant-inventory-2026-08-08.json")

BRAND_TERMS = {
    "baseus", "lenovo", "tesla", "naturehike", "denokin", "70mai",
    "kawa", "zeblaze", "essager", "trustfire", "vgr",
}
ELECTRICAL_TERMS = {
    "usb", "rechargeable", "wireless", "smart", "electric", "battery",
    "wifi", "wi-fi", "led", "amoled", "bluetooth", "digital",
}
HEALTH_TERMS = {
    "pain relief", "therapy", "oral", "dental", "flosser", "irrigator",
    "air purifier", "massage", "heart rate", "spo2",
}
HIGH_RISK_TERMS = {
    "knife", "drill", "hammock", "padlock", "feeder", "dash cam",
    "straightener", "trimmer", "camera", "charger", "thermos",
}


def dec(value: str | None) -> Decimal | None:
    try:
        return Decimal(value) if value not in (None, "") else None
    except InvalidOperation:
        return None


def location_summary(variant: dict) -> str:
    levels = (variant.get("inventoryItem") or {}).get("inventoryLevels") or []
    parts = []
    for level in levels:
        available = next(
            (q.get("quantity") for q in level.get("quantities") or []
             if q.get("name") == "available"),
            None,
        )
        parts.append(f"{level['location']['name']}:{available}")
    return " | ".join(parts)


def mapping_evidence(product: dict, variant: dict) -> str:
    tags = {tag.lower() for tag in product.get("tags") or []}
    locations = location_summary(variant).lower()
    if "dsers-mapped" in tags and "dsers-fulfillment-service" in locations:
        return "explicit Shopify tag + DSers fulfillment location"
    if "dsers-fulfillment-service" in locations:
        return "DSers fulfillment location only; exact mapping not independently verified"
    if variant.get("sku") and (variant.get("inventoryItem") or {}).get("unitCost"):
        return "current DSers state not inspected; supplier-formatted SKU + unit cost exist"
    return "current DSers state not inspected"


def risk_flags(product: dict, variant: dict) -> list[str]:
    flags: list[str] = []
    title = product["title"]
    text = f"{title} {product.get('description') or ''}".lower()
    price = dec(variant.get("price"))
    compare = dec(variant.get("compareAtPrice"))
    item = variant.get("inventoryItem") or {}
    weight = (item.get("measurement") or {}).get("weight") or {}
    tags = {tag.lower() for tag in product.get("tags") or []}

    if "puchica-launch-ready" in tags:
        flags.append("unsupported launch-ready tag")
    if "trending" in tags:
        flags.append("unsupported trending tag")
    if compare and price and abs(compare - (price * Decimal("1.5"))) <= Decimal("0.01"):
        flags.append("synthetic-looking 1.5x compare-at price")
    if variant.get("inventoryQuantity") in (50, 999):
        flags.append(f"placeholder-like inventory {variant['inventoryQuantity']}")
    if not weight.get("value"):
        flags.append("zero/missing shipping weight")
    if not item.get("countryCodeOfOrigin"):
        flags.append("origin country missing")
    if not item.get("harmonizedSystemCode"):
        flags.append("HS code missing")
    if variant.get("title") == "Default Title":
        flags.append("single Default Title variant")
    if len(title) > 60:
        flags.append("title exceeds 60 characters")
    if len((product.get("media") or {}).get("nodes") or []) < 3:
        flags.append("fewer than 3 product media items")
    if any(term in text for term in BRAND_TERMS):
        flags.append("brand/trademark authorization unknown")
    if any(term in text for term in ELECTRICAL_TERMS):
        flags.append("electrical/battery compliance and warranty risk")
    if any(term in text for term in HEALTH_TERMS):
        flags.append("health/performance claims need substantiation")
    if any(term in text for term in HIGH_RISK_TERMS):
        flags.append("elevated safety/returns/support risk")
    if product.get("onlineStoreUrl"):
        flags.append("published to Online Store in Shopify")
    if "Naturehike" in title:
        flags.extend([
            "critical copy/media mismatch: description says roll-top 8L/15L bag; media shows zip case 22/24 cm",
            "waterproof/IPX6/submersion/YKK/MOLLE claims not supported by supplied media",
            "option named Color combines color and size codes",
            "all 12 alt texts duplicated and omit Brown variants",
            "embedded-image text must be conveyed accessibly",
            "each variant stock below 25-unit launch threshold",
        ])
    return flags


def candidate_status(product: dict) -> str:
    title = product["title"].lower()
    if "naturehike" in title:
        return "QUARANTINED: critical fidelity, stock, and route evidence failures"
    return "NOT_INSPECTED: retain and score after current DSers mapping and route capture"


def unknowns(product: dict, variant: dict) -> list[str]:
    return [
        "exact current supplier listing and option mapping",
        "ordinary supplier item price freshness",
        "Canada shipping cost/method/ETA/tracking",
        "US shipping cost/method/ETA/tracking",
        "duties/brokerage treatment",
        "defect/refund reserve",
        "payment-fee and active-discount contribution margin",
        "supplier stock freshness and warehouse origin",
        "product/image usage rights",
        "sample quality and packaging",
    ]


def main() -> None:
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    rows: list[dict] = []
    for product in source["products"]:
        options = [
            {"name": option["name"], "values": [v["name"] for v in option["optionValues"]]}
            for option in product.get("options") or []
        ]
        media = (product.get("media") or {}).get("nodes") or []
        featured = product.get("featuredMedia") or {}
        for variant in (product.get("variants") or {}).get("nodes") or []:
            item = variant.get("inventoryItem") or {}
            cost = item.get("unitCost") or {}
            price = dec(variant.get("price"))
            unit_cost = dec(cost.get("amount"))
            headroom = None
            if price and unit_cost is not None and price > 0:
                headroom = ((price - unit_cost) / price * 100).quantize(Decimal("0.01"))
            image = featured.get("image") or {}
            row = {
                "product_gid": product["id"],
                "product_id": product["legacyResourceId"],
                "variant_gid": variant["id"],
                "variant_id": variant["legacyResourceId"],
                "product_title": product["title"],
                "handle": product["handle"],
                "status": product["status"],
                "online_store_url": product.get("onlineStoreUrl") or "",
                "created_at": product["createdAt"],
                "updated_at": product["updatedAt"],
                "vendor": product.get("vendor") or "",
                "product_type": product.get("productType") or "",
                "category": (product.get("category") or {}).get("fullName") or "",
                "tags": " | ".join(product.get("tags") or []),
                "product_options_json": json.dumps(options, ensure_ascii=False),
                "variant_title": variant["title"],
                "selected_options_json": json.dumps(variant.get("selectedOptions") or [], ensure_ascii=False),
                "sku": variant.get("sku") or "",
                "barcode": variant.get("barcode") or "",
                "price": variant.get("price") or "",
                "compare_at_price": variant.get("compareAtPrice") or "",
                "unit_cost": cost.get("amount") or "",
                "currency": cost.get("currencyCode") or source["shop"].get("currencyCode") or "",
                "item_cost_only_headroom_pct": str(headroom) if headroom is not None else "",
                "inventory_quantity": variant.get("inventoryQuantity"),
                "inventory_locations": location_summary(variant),
                "inventory_policy": variant.get("inventoryPolicy") or "",
                "available_for_sale": variant.get("availableForSale"),
                "inventory_tracked": item.get("tracked"),
                "requires_shipping": item.get("requiresShipping"),
                "taxable": variant.get("taxable"),
                "weight_value": ((item.get("measurement") or {}).get("weight") or {}).get("value"),
                "weight_unit": ((item.get("measurement") or {}).get("weight") or {}).get("unit") or "",
                "origin_country": item.get("countryCodeOfOrigin") or "",
                "hs_code": item.get("harmonizedSystemCode") or "",
                "media_count": len(media),
                "featured_image_url": image.get("url") or "",
                "featured_image_alt": featured.get("alt") or "",
                "featured_image_width": image.get("width") or "",
                "featured_image_height": image.get("height") or "",
                "dsers_mapping_evidence": mapping_evidence(product, variant),
                "candidate_status": candidate_status(product),
                "risk_flags": " | ".join(risk_flags(product, variant)),
                "explicit_unknowns": " | ".join(unknowns(product, variant)),
            }
            rows.append(row)

    CSV_OUT.parent.mkdir(parents=True, exist_ok=True)
    with CSV_OUT.open("w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    JSON_OUT.write_text(json.dumps(rows, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {len(rows)} variants to {CSV_OUT} and {JSON_OUT}")


if __name__ == "__main__":
    main()
