#!/usr/bin/env python3
"""
Phase 3: Generate lifestyle images for products missing them.
Uses Flux 2 Klein via FAL.ai (image_generate tool built in).
Workflow:
  1. Query Shopify for products with < 3 images
  2. For each, generate lifestyle shot using product's main image as reference
  3. Present batch for review (save to review folder)
  4. On approval, attach to Shopify
"""

import json, urllib.request, ssl, time, os, sys
from pathlib import Path

# ── Shopify auth ──────────────────────────────────────────────────────────────
import winreg
def get_token():
    with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Environment") as k:
        TOKEN, _ = winreg.QueryValueEx(k, "SHOPIFY_ADMIN_TOKEN")
    return TOKEN

TOKEN = get_token()
SHOP = "ug91ve-sz.myshopify.com"
API_URL = f"https://{SHOP}/admin/api/2025-01/graphql.json"

ctx = ssl.create_default_context()

def gql(query, variables=None):
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        API_URL, data=data,
        headers={"Content-Type": "application/json", "X-Shopify-Access-Token": TOKEN},
        method="POST"
    )
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=30, context=ctx) as resp:
                result = json.load(resp)
                if result.get("errors"):
                    msg = result["errors"][0].get("message", "")
                    if "Throttled" in msg:
                        time.sleep(2 ** attempt)
                        continue
                    raise Exception(f"GraphQL error: {msg}")
                return result
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            if "Throttled" in body:
                time.sleep(2 ** attempt)
                continue
            raise Exception(f"HTTP {e.code}: {body[:200]}")
    raise Exception("Max retries exceeded")

# ── Fetch products with < 3 images ──────────────────────────────────────────
print("Fetching products with fewer than 3 images...")

query = """
{
  products(first: 250, query: "status:active", sortKey: CREATED_AT) {
    pageInfo { hasNextPage }
    edges {
      node {
        id
        title
        handle
        images(first: 5) {
          edges {
            node {
              id
              url
            }
          }
        }
      }
    }
  }
}
"""

products_needing_images = []
cursor = None

for page in range(1, 20):  # up to 5000 products
    q = query.replace("first: 250", f"first: 250" + (f', after: "{cursor}"' if cursor else ''))
    result = gql(q)
    edges = result["data"]["products"]["edges"]
    page_info = result["data"]["products"]["pageInfo"]
    
    for edge in edges:
        node = edge["node"]
        img_count = len(node["images"]["edges"])
        if img_count < 3:
            products_needing_images.append({
                "gid": node["id"],
                "title": node["title"],
                "handle": node["handle"],
                "image_count": img_count,
                "images": [e["node"]["url"] for e in node["images"]["edges"]]
            })
    
    has_next = page_info["hasNextPage"]
    end_cursor = page_info.get("endCursor", "")
    
    print(f"  Page {page}: scanned {len(edges)} products, {len(products_needing_images)} need images so far")
    
    if not has_next:
        break
    cursor = end_cursor
    time.sleep(0.3)

print(f"\nTotal products needing images (< 3): {len(products_needing_images)}")

# Save the list
output = {
    "count": len(products_needing_images),
    "products": products_needing_images
}
with open("D:/puchica-storefront/products_needing_images.json", "w") as f:
    json.dump(output, f, indent=2)

print("Saved to products_needing_images.json")
print(f"\nFirst 5:")
for p in products_needing_images[:5]:
    print(f"  [{p['image_count']} imgs] {p['title'][:60]}")
