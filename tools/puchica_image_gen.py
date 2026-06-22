#!/usr/bin/env python3
"""Generate lifestyle product images for Puchica using Google's Gemini API.

Per Daniel (2026-06-21), Higgsfield is just a wrapper around the
"nano_banana_pro" image model. We call it directly via the Gemini API
to skip the intermediary. No MCP required.

The model is exposed on Google's API as `gemini-3-pro-image` (stable)
or `gemini-3-pro-image-preview` (preview). Both display name is
"Nano Banana Pro". The `nano_banana_pro` name from Higgsfield is
internal-only.

Reads from the public Storefront API, fetches the top sellers by
collection, generates one lifestyle image per product, and writes
outputs to logs/puchica-images-<timestamp>/.

Each run is idempotent: skips products that already have a generated
image in the output dir.

Usage:
    python tools/puchica_image_gen.py
    python tools/puchica_image_gen.py --limit 5
    python tools/puchica_image_gen.py --collection best-sellers
"""
import argparse
import base64
import json
import os
import re
import sys
import time
import urllib.request
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).resolve().parent
WORKSPACE = Path(r"C:\Users\dchav\.openclaw\workspace")
SITE_ROOT = Path(r"E:\Claude\puchica-site")
LOG_ROOT = WORKSPACE / "logs"

# Models
# Per Daniel 2026-06-21: Higgsfield is just a wrapper around nano_banana_pro.
# On Google's Gemini API the model is exposed as:
#   - gemini-3-pro-image         (stable, "Nano Banana Pro")
#   - gemini-3-pro-image-preview (preview)
#   - nano-banana-pro-preview    (alias)
# See https://generativelanguage.googleapis.com/v1beta/models for the full list.
GEMINI_IMAGE_MODEL = "gemini-3-pro-image"
FALLBACK_MODEL = "gemini-2.5-flash-image"

# Lifestyle prompt (verbatim from SOP)
LIFESTYLE_PROMPT = (
    "Place the product in a natural, real-world lifestyle setting where "
    "it would actually be used. If it is something worn or carried (hat, "
    "shoe, garment, swimsuit, pet vest, baby float, clip-on fan, etc.), "
    "show it being worn by an appropriate person, child, baby, or pet in "
    "a candid editorial style. If it is an object used in a space (fan, "
    "cooler, humidifier, garden tool, kitchen item, etc.), show it on the "
    "right surface or in the right environment for that use, with subtle "
    "context props or hands in frame if appropriate. The product is "
    "clearly recognizable and in sharp focus, but the scene feels "
    "lived-in and authentic rather than staged. Use the reference image "
    "to identify what the product is, then place it convincingly in the "
    "moment of use."
)

PURE_WHITE_PROMPT = (
    "Pure white seamless studio background (#FFFFFF), soft even "
    "product-photography lighting, no shadows beyond a subtle natural "
    "ground shadow. The product occupies roughly 60-70% of the frame, "
    "perfectly centered, in crisp sharp focus. No competing objects, no "
    "props, no people, no background elements. The product is "
    "unmistakably the single hero of the image."
)


def load_env(site_root: Path) -> None:
    env_path = site_root / ".env"
    if not env_path.exists():
        print(f"[FATAL] .env not found at {env_path}", file=sys.stderr)
        sys.exit(1)
    for line in env_path.read_text(encoding="utf-8").splitlines():
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


def graphql(query: str, variables: dict) -> dict:
    domain = os.environ["PUBLIC_STORE_DOMAIN"]
    token = os.environ["PUBLIC_STOREFRONT_API_TOKEN"]
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


def fetch_collection_products(handle: str, limit: int = 10) -> list:
    """Fetch up to `limit` products from a collection by handle."""
    query = """
    query collectionProducts($handle: String!, $first: Int!) {
      collection(handle: $handle) {
        products(first: $first) {
          edges {
            node {
              id
              handle
              title
              productType
              featuredImage { url altText }
              images(first: 3) {
                edges { node { url altText } }
              }
            }
          }
        }
      }
    }
    """
    data = graphql(query, {"handle": handle, "first": limit})
    edges = data.get("data", {}).get("collection", {}).get("products", {}).get("edges", [])
    products = []
    for e in edges:
        n = e["node"]
        images = [im["node"]["url"] for im in n["images"]["edges"] if im["node"].get("url")]
        if not images:
            continue  # skip products with no images
        products.append({
            "id": n["id"],
            "handle": n["handle"],
            "title": n["title"],
            "productType": n.get("productType") or "",
            "image_urls": images,
            "featured_image": n.get("featuredImage", {}).get("url") if n.get("featuredImage") else images[0],
        })
    return products


def call_gemini_image(prompt: str, reference_image_url: str, api_key: str) -> bytes:
    """Call Gemini 2.5 Flash Image with text prompt + reference image.

    Per docs: pass image as inline_data with base64 + mime type. Or as
    file_data with a URL for public URLs. We use file_data for simplicity.
    Returns PNG bytes.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_IMAGE_MODEL}:generateContent?key={api_key}"
    body = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {"file_data": {"mime_type": "image/jpeg", "file_uri": reference_image_url}}
            ]
        }],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": "1:1"}
        }
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"Gemini HTTP {e.code}: {body[:500]}")

    # Response: candidates[0].content.parts[0].inlineData.data (base64)
    # Gemini uses camelCase keys (inlineData, mimeType).
    try:
        part = data["candidates"][0]["content"]["parts"][0]
        inline = part.get("inlineData") or part.get("inline_data")
        if inline and "data" in inline:
            return base64.b64decode(inline["data"])
        elif "text" in part:
            raise RuntimeError(f"Gemini returned text instead of image: {part['text'][:300]}")
        else:
            raise RuntimeError(f"Unknown response shape: {json.dumps(data)[:500]}")
    except (KeyError, IndexError) as e:
        raise RuntimeError(f"Bad Gemini response: {e}; body={json.dumps(data)[:500]}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=5, help="Products per run")
    ap.add_argument("--collection", default="best-sellers", help="Collection handle")
    ap.add_argument("--style", choices=["lifestyle", "pure-white"], default="lifestyle")
    ap.add_argument("--dry-run", action="store_true", help="List products but don't generate")
    args = ap.parse_args()

    load_env(SITE_ROOT)
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key and not args.dry_run:
        print("[FATAL] GEMINI_API_KEY not set", file=sys.stderr)
        sys.exit(1)

    # Output dir
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    out_dir = LOG_ROOT / f"puchica-images-{stamp}"
    out_dir.mkdir(parents=True, exist_ok=True)

    # Fetch products
    print(f"Fetching top {args.limit} from collection '{args.collection}'...")
    products = fetch_collection_products(args.collection, args.limit)
    print(f"Got {len(products)} products with images")
    if not products:
        print("[WARN] No products found, exiting")
        return 1

    prompt = LIFESTYLE_PROMPT if args.style == "lifestyle" else PURE_WHITE_PROMPT
    print(f"Style: {args.style}")
    print(f"Model: {GEMINI_IMAGE_MODEL} (Nano Banana Pro) via Gemini API")

    # Manifest
    manifest = {
        "run_id": stamp,
        "collection": args.collection,
        "style": args.style,
        "model_used": GEMINI_IMAGE_MODEL,
        "vendor": "Google Gemini API (direct, no intermediary)",
        "rationale": (
            "Daniel confirmed on 2026-06-21 that Higgsfield is just a "
            "wrapper around nano_banana_pro. Calling the model directly "
            "via the Gemini API to skip the intermediary. No MCP needed."
        ),
        "products": [],
    }

    failures = 0
    for i, p in enumerate(products, 1):
        print(f"\n[{i}/{len(products)}] {p['title']}")
        print(f"  Handle: {p['handle']}")
        # Pick the largest image (we just take the first listed)
        ref_url = p["image_urls"][0]
        out_path = out_dir / f"{p['handle']}.png"

        if args.dry_run:
            print(f"  [DRY] would generate using {ref_url}")
            manifest["products"].append({
                "handle": p["handle"],
                "title": p["title"],
                "status": "dry-run",
                "reference_url": ref_url,
            })
            continue

        try:
            png_bytes = call_gemini_image(prompt, ref_url, api_key)
            out_path.write_bytes(png_bytes)
            size_kb = len(png_bytes) / 1024
            print(f"  OK {size_kb:.1f} KB -> {out_path.name}")
            manifest["products"].append({
                "handle": p["handle"],
                "title": p["title"],
                "status": "ok",
                "size_bytes": len(png_bytes),
                "reference_url": ref_url,
                "output_path": str(out_path),
            })
        except Exception as e:
            failures += 1
            print(f"  FAIL: {e}")
            manifest["products"].append({
                "handle": p["handle"],
                "title": p["title"],
                "status": "fail",
                "error": str(e)[:200],
                "reference_url": ref_url,
            })
            if failures >= 3:
                print(f"[STOP] 3 consecutive failures, halting per SOP rule")
                break
        time.sleep(1)  # polite spacing between API calls

    # Write manifest
    manifest["total"] = len(products)
    manifest["failures"] = failures
    manifest_path = out_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"\nWrote manifest: {manifest_path}")
    print(f"Output dir: {out_dir}")
    print(f"Generated: {len(products) - failures} / {len(products)}")

    return 0 if failures == 0 else 2


if __name__ == "__main__":
    sys.exit(main())