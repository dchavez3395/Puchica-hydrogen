"""Fast parallel backend push — reads pre-computed rewrites.json, pushes in parallel."""
import sys, json, time, os
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock

sys.path.insert(0, str(Path(r"C:\Users\dchav\.openclaw\workspace\runners")))
from shared import shopify_admin as sa

WORK_DIR = Path(r"C:\Users\dchav\.openclaw\workspace\work\backend_batch")
CREDS = {
    "SHOPIFY_STORE_DOMAIN": os.environ["SHOPIFY_STORE_DOMAIN"],
    "SHOPIFY_ADMIN_TOKEN": os.environ["SHOPIFY_ADMIN_TOKEN"],
}

# Apply creds to env so sa.get_creds() finds them
os.environ.update(CREDS)

SUMMARY_FILE = WORK_DIR / "summary.json"
PROGRESS_FILE = WORK_DIR / "progress.json"


def load_rewrites():
    data = json.loads((WORK_DIR / "rewrites.json").read_text(encoding="utf-8"))
    print(f"Loaded {len(data)} rewrites")
    return data


def push_one(r: dict) -> dict:
    """Push a single product's rewrites. Returns {'product_id': ..., 'errors': [...]}"""
    pid = r["product_id"]
    p_input = {"id": pid}
    for f in ("title", "descriptionHtml", "status", "tags", "seo"):
        if f in r:
            p_input[f] = r[f]

    errors = []

    # Push product-level fields
    if len(p_input) > 1:
        gql = """
        mutation($product: ProductUpdateInput!) {
          p0: productUpdate(product: $product) { userErrors { field message } }
        }
        """
        data = sa.graphql(gql, {"product": p_input})
        errs = data["data"]["p0"].get("userErrors") or []
        errors.extend(errs)

    # Push variant price updates
    if "variants" in r and r["variants"]:
        v_input = r["variants"]
        v_gql = """
        mutation($pid: ID!, $vr: [ProductVariantsBulkInput!]!) {
          v0: productVariantsBulkUpdate(productId: $pid, variants: $vr) {
            userErrors { field message }
          }
        }
        """
        data = sa.graphql(v_gql, {"pid": pid, "vr": v_input})
        errs = data["data"]["v0"].get("userErrors") or []
        errors.extend(errs)

    return {"product_id": pid, "errors": errors}


def write_summary(succeeded: int, failed: list):
    summary = {"total": succeeded + len(failed), "succeeded": succeeded, "failed": failed}
    (WORK_DIR / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    return summary


def main():
    rewrites = load_rewrites()
    total = len(rewrites)

    succeeded = 0
    failed = []
    lock = Lock()
    completed = 0
    last_log = [time.time()]
    start = time.time()

    def log_progress(force=False):
        now = time.time()
        if force or (now - last_log[0]) >= 30:
            elapsed = now - start
            rate = completed / elapsed if elapsed > 0 else 0
            eta = (total - completed) / rate / 60 if rate > 0 else 0
            print(f"[{elapsed/60:.1f}m] {completed}/{total} ({succeeded} ok, {len(failed)} failed) — {rate:.1f}/s — ETA {eta:.1f}m")
            last_log[0] = now

    # Try 20 threads first — tune based on rate
    MAX_THREADS = 20

    with ThreadPoolExecutor(max_workers=MAX_THREADS) as ex:
        futures = {ex.submit(push_one, r): r for r in rewrites}
        for future in as_completed(futures):
            result = future.result()
            with lock:
                if result["errors"]:
                    failed.append({"product_id": result["product_id"], "errors": result["errors"]})
                else:
                    succeeded += 1
                completed += 1
                if completed % 50 == 0:
                    log_progress()
                if completed % 200 == 0:
                    write_summary(succeeded, failed)

    log_progress(force=True)
    summary = write_summary(succeeded, failed)
    elapsed = time.time() - start
    print(f"\nDone in {elapsed/60:.1f}m — {succeeded} succeeded, {len(failed)} failed out of {total}")
    if failed:
        print("First 5 failures:")
        for f in failed[:5]:
            print(f"  {f['product_id']}: {f['errors']}")


if __name__ == "__main__":
    main()
