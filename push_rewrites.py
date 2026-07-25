"""Push backend rewrites to Shopify for all products that still exist.
Skips products that were deleted after rewrites.json was computed.
Uses direct urllib to avoid shopify_admin sys.exit() on throttling."""
import sys, json, os, time, threading, urllib.request, urllib.error
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# Read token from Windows registry
try:
    import winreg
    with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Environment") as k:
        TOKEN, _ = winreg.QueryValueEx(k, "SHOPIFY_ADMIN_TOKEN")
except Exception:
    # Fallback: read from env file
    ENV_PATH = Path(r"D:\\puchica-storefront\\env")
    TOKEN = None
    for line in open(ENV_PATH).read().splitlines():
        if "shpat_" in line:
            TOKEN = line.split("=", 1)[1].strip()
            break

API_URL = "https://ug91ve-sz.myshopify.com/admin/api/2025-01/graphql.json"

def gql(query, variables=None):
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        API_URL,
        data=data,
        headers={
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": TOKEN
        },
        method="POST"
    )
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                result = json.load(resp)
                errors = result.get("errors", [])
                if errors:
                    err_msg = errors[0].get("message", "")
                    if "Throttled" in err_msg:
                        time.sleep(2 ** attempt)
                        continue
                    raise Exception(errors)
                return result
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            if "Throttled" in body:
                time.sleep(2 ** attempt)
                continue
            raise Exception(f"HTTP {e.code}: {body[:200]}")
    raise Exception("Max retries exceeded for throttling")

# Load rewrites
rewrites_path = Path(r"C:\\Users\\dchav\\.openclaw\\workspace\\work\\backend_batch\\rewrites.json")
rewrites = json.load(open(rewrites_path, encoding="utf-8"))
print(f"Total rewrite entries: {len(rewrites)}")

updates = []
for item in rewrites:
    pid = item.get("product_id", "").strip("'")
    if not pid:
        continue
    update = {"id": pid}

    title = item.get("title")
    if title:
        update["title"] = title

    body = item.get("descriptionHtml")
    if body:
        update["descriptionHtml"] = body

    status = item.get("status")
    if status:
        update["status"] = status

    seo = item.get("seo", {})
    tags = item.get("tags", [])
    if tags:
        update["tags"] = tags

    updates.append({
        "id": pid,
        "update": update,
        "seo": seo
    })

print(f"Updates to push: {len(updates)}")

done = [0]
errors = [0]
skipped = [0]
lock = threading.Lock()
ERRORS = []

GRAPHQL_PRODUCT_UPDATE = (
    "mutation productUpdate($input: ProductInput!) {"
    "  productUpdate(input: $input) {"
    "    product { id }"
    "    userErrors { field message }"
    "  }"
    "}"
)

GRAPHQL_METAFIELDS_SET = (
    "mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {"
    "  metafieldsSet(metafields: $metafields) {"
    "    metafields { key namespace }"
    "    userErrors { field message }"
    "  }"
    "}"
)

def push_product(item):
    pid = item["id"]
    update = item["update"]
    seo = item["seo"]

    try:
        result = gql(GRAPHQL_PRODUCT_UPDATE, {"input": update})
        user_errors = result.get("data", {}).get("productUpdate", {}).get("userErrors", [])
        if user_errors:
            err_str = str(user_errors)
            if any(x in err_str.lower() for x in ["does not exist", "not found", "no such product"]):
                with lock:
                    skipped[0] += 1
                return ("skip", user_errors)
            with lock:
                errors[0] += 1
                ERRORS.append((pid, user_errors))
            return ("error", user_errors)

        # SEO metafields
        if seo:
            meta_inputs = []
            seo_title = seo.get("title", "")
            seo_desc = seo.get("description", "")
            if seo_title:
                meta_inputs.append({
                    "namespace": "_global",
                    "key": "title_tag",
                    "value": seo_title,
                    "type": "single_line_text_field",
                    "ownerId": pid
                })
            if seo_desc:
                meta_inputs.append({
                    "namespace": "_global",
                    "key": "description_tag",
                    "value": seo_desc,
                    "type": "multi_line_text_field",
                    "ownerId": pid
                })
            if meta_inputs:
                gql(GRAPHQL_METAFIELDS_SET, {"metafields": meta_inputs})

        with lock:
            done[0] += 1

    except Exception as e:
        with lock:
            errors[0] += 1
            ERRORS.append((pid, str(e)))
        return ("error", str(e))
    return ("ok", None)

print(f"\nPushing with 3 threads...")
start = time.time()
done_count = [0]

with ThreadPoolExecutor(max_workers=3) as executor:
    futures = {executor.submit(push_product, u): u for u in updates}
    for future in as_completed(futures):
        future.result()
        elapsed = time.time() - start
        total = done[0] + errors[0] + skipped[0]
        if total - done_count[0] >= 50:
            rate = total / elapsed if elapsed > 0 else 1
            eta = int((len(updates) - total) / rate) if rate > 0 else 0
            print(f"  [{int(elapsed)}s] {done[0]}/{len(updates)} done | {errors[0]} errors | {skipped[0]} skipped | ETA: {eta}s")
            done_count[0] = total

elapsed = time.time() - start
print(f"\n=== DONE in {int(elapsed)}s ===")
print(f"Updated: {done[0]}")
print(f"Skipped (deleted): {skipped[0]}")
print(f"Errors: {errors[0]}")
if ERRORS:
    print("First errors:")
    for e in ERRORS[:5]:
        print(f"  {e[0]}: {e[1]}")
