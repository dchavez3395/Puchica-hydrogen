#!/usr/bin/env python3
"""Read-only Shopify Admin catalog export for emergency recovery evidence."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from lib.shopify_admin import ShopifyAdmin


QUERY = r"""
query RecoveryCatalog($after: String) {
  products(first: 40, after: $after, sortKey: UPDATED_AT, reverse: true) {
    pageInfo { hasNextPage endCursor }
    nodes {
      id
      legacyResourceId
      title
      handle
      status
      onlineStoreUrl
      vendor
      productType
      category { id name fullName }
      tags
      createdAt
      updatedAt
      totalInventory
      description
      seo { title description }
      options {
        id
        name
        position
        optionValues { id name hasVariants }
      }
      featuredMedia {
        ... on MediaImage {
          id
          alt
          image { url width height }
        }
      }
      media(first: 20) {
        nodes {
          mediaContentType
          ... on MediaImage {
            id
            alt
            image { url width height }
          }
        }
      }
      metafields(first: 50) {
        nodes { id namespace key type value updatedAt }
      }
      variants(first: 50) {
        nodes {
          id
          legacyResourceId
          title
          displayName
          sku
          barcode
          price
          compareAtPrice
          inventoryQuantity
          inventoryPolicy
          taxable
          availableForSale
          selectedOptions { name value }
          inventoryItem {
            id
            tracked
            requiresShipping
            unitCost { amount currencyCode }
            countryCodeOfOrigin
            provinceCodeOfOrigin
            harmonizedSystemCode
            measurement {
              weight { unit value }
            }
          }
        }
      }
    }
  }
  shop {
    id
    name
    primaryDomain { host }
    currencyCode
  }
}
"""

LOCATION_QUERY = r"""
query RecoveryInventoryLocations($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on ProductVariant {
      id
      inventoryItem {
        id
        inventoryLevels(first: 10) {
          nodes {
            id
            quantities(names: ["available"]) { name quantity }
            location { id name }
          }
        }
      }
    }
  }
}
"""


def main() -> None:
    products: list[dict] = []
    after = None
    shop_info = None
    with ShopifyAdmin() as shop:
        while True:
            data = shop.gql(QUERY, {"after": after})
            shop_info = shop_info or data.get("shop")
            connection = data["products"]
            products.extend(connection.get("nodes") or [])
            page_info = connection.get("pageInfo") or {}
            if not page_info.get("hasNextPage"):
                break
            after = page_info.get("endCursor")

        variant_ids = [
            variant["id"]
            for product in products
            for variant in product["variants"]["nodes"]
        ]
        levels_by_variant: dict[str, list[dict]] = {}
        for offset in range(0, len(variant_ids), 20):
            data = shop.gql(LOCATION_QUERY, {"ids": variant_ids[offset:offset + 20]})
            for node in data.get("nodes") or []:
                if not node:
                    continue
                item = node.get("inventoryItem") or {}
                levels_by_variant[node["id"]] = (
                    (item.get("inventoryLevels") or {}).get("nodes") or []
                )

        for product in products:
            for variant in product["variants"]["nodes"]:
                variant["inventoryItem"]["inventoryLevels"] = levels_by_variant.get(
                    variant["id"], []
                )

    out_dir = Path("docs/recovery-evidence")
    out_dir.mkdir(parents=True, exist_ok=True)
    output = out_dir / "shopify-admin-catalog-2026-08-08.json"
    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "provenance": {
            "source": "Shopify Admin GraphQL API",
            "apiVersion": "2025-04",
            "operation": "RecoveryCatalog",
            "readOnly": True,
        },
        "shop": shop_info,
        "productCount": len(products),
        "products": products,
    }
    output.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Wrote {len(products)} products to {output}")


if __name__ == "__main__":
    main()
