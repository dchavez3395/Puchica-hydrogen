# Puchica — Product Image Batch Runbook (for a continuing agent / ollama)

Regenerate product images as **lifestyle "in-use" shots**, attach them to Shopify,
and set each as the **featured** image. Prioritize **soccer jerseys** (World Cup
timing), then the rest of the World Cup apparel, then the whole active catalog.

Store: **Puchica** (admin handle `puchica-2`, `shop.puchica.ca`). Shopify MCP is
connected. Image model is nano banana pro (see §Image model).

---

## LOCKED BRIEF (do not re-ask these)
- **Q1 — Scope:** ACTIVE products only.
- **Q2 — Style:** Lifestyle — product in use, real-world background.
- **Q3 — Mode:** MANUAL. A human is present. Confirm the store once, offer a
  one-product test run first, and wait for approval before the full batch.

## RUN MODE (Manual)
1. State the store being edited (one line) and confirm Shopify + the image tool
   are connected. Wait for the user to confirm.
2. Ask: "Test run on one jersey first, or run the full jersey batch?" Wait.
   - If test: fully process ONE jersey (generate → attach → set featured), show
     the result, stop, wait for approval. Skip that product when running the rest.
3. Only the user, a real tool error, or a zero-match scope may halt you.

---

## PRIORITY / BATCH ORDER
1. **Batch A — Soccer jerseys (do first).** Scope query (title-based, because
   `productType` is wrong on many of these):
   `status:active AND (title:jersey OR title:maillot OR title:soccer)`
   ~50+ products (Canada, Portugal, Argentina, Brasil; men's, kids, collar,
   waffle-effect). Paginate past the first 50.
2. **Batch B — Rest of World Cup apparel:** caps, tees, track jackets for the
   same nations. Query: `status:active AND (title:Canada OR title:Portugal OR
   title:Argentina OR title:Brasil OR title:Fifa OR title:World Cup)` minus the
   Batch-A ids already done.
3. **Batch C — Everything else:** all remaining ACTIVE products, in chunks.
   Query: `status:active`. Skip ids already processed (track in checkpoint).

Do Batch A end-to-end and report before starting B; B before C.

---

## PHASE 1 — Fetch (silent)
```graphql
query($query: String!, $first: Int!, $after: String) {
  products(query: $query, first: $first, after: $after) {
    edges { node {
      id title status
      featuredImage { url }
      images(first: 5) { edges { node { url } } }
    } }
    pageInfo { hasNextPage endCursor }
  }
}
```
Paginate with `after`. Save to `work/products.json`. Output only: `Fetch complete (N products)`.

## PHASE 2 — Generate lifestyle images
For each product: pick the best (largest/clearest) reference image URL from
`images`. Submit an image job. Save job-id → product-id to `work/jobs.txt` as you
go (only recovery path). Submit as many as the concurrency limit allows; on a
"too many jobs"/rate-limit error, wait ~15s and retry the same job.

**Prompt (lifestyle):** "Place the product in a natural, real-world lifestyle
setting where it would actually be used. If worn/carried (jersey, cap, tee,
jacket, shoe, bag…), show it worn by an appropriate person/kid in candid
editorial style; if an object used in a space (fan, humidifier, kitchen/garden
item…), show it on the right surface/environment with subtle context. Product is
unmistakable and in sharp focus; scene feels lived-in, not staged. Use the
reference image to identify the product, then place it convincingly in the moment
of use." aspect_ratio `1:1`; pass the reference as the image input/role.

**Jersey-specific guidance (Batch A):** read the nation + audience from the title.
Show a fan or amateur player **wearing the jersey** in a World-Cup moment — street
celebration, sports bar / living-room watch party, or stadium stands. Kids jerseys
→ a child; Men's → an adult; generic → any appropriate fan. Keep the crest/colours
accurate to the reference. Authentic, joyful, not studio.

**Error handling:**
- Rate-limit/"too many jobs" → wait 15s, retry same job. Never counts toward stop.
- Generic job failure ("something went wrong") → wait 20s, retry once on same
  reference; if it fails, retry once on the product's 2nd reference URL; only if
  that also fails, log the id to `work/failed_images.txt` and move on.
- Hard limit (credits/account cap) → stop submitting, attach whatever rendered,
  set featured, report.
- **Stop rule:** only distinct products that failed the full escalation count. If
  3 distinct products fail in a row, stop and report. A single bad reference never
  trips it.

Output per batch of ~10: `Products X–Y images submitted`. Then poll job status
until rendered (re-poll; don't assume done).

## PHASE 3 — Attach + set featured (silent)
Image-tool result URLs are public — Shopify ingests them directly via
`originalSource` (no staged upload; staged uploads are firewall-blocked in sandbox).

1. **Attach** (`productCreateMedia` is deprecated — use `productUpdate` with
   `media`), batch ~10 per call with aliases:
   ```graphql
   mutation($pid0: ID!, $m0: [CreateMediaInput!]!) {
     c0: productUpdate(product: {id: $pid0}, media: $m0) { userErrors { field message } }
   }
   ```
   `CreateMediaInput`: `originalSource` (URL), `mediaContentType: IMAGE`, `alt`.
2. **Set featured (required).** Attaching appends to the END — it is NOT featured.
   For each product: query its media, find the new image by its filename prefix,
   get the `MediaImage` id, then:
   `productReorderMedia(id: <productId>, moves: [{id: <mediaImageId>, newPosition: "0"}])`
   — `newPosition` is zero-based AND must be a **string** (`"0"`). Batch ~10.

## PHASE 4 — Summary
Report: how many products got a new featured image, how many failed, why, and the
fix. Manual: ask if they want to retry the failures.

## PHASE 5 — Verification (don't trust "no userErrors")
Query a sample (or all): `featuredMedia { ... on MediaImage { image { url } } }`
and confirm the featured URL is the NEW image (matches the new filename), not the
old photo. Report any product still showing the old image; Manual: offer to re-run
just those.

---

## Image model
Use the **latest nano banana pro** — this is final; do not substitute a
"recommended" model.
- Via **Higgsfield**: `model: "nano_banana_pro"`, `medias: [{role:"image", value:"<ref_url>"}]`.
- Alternatively via the **Gemini / antigravity nano-banana-pro** path if that's
  what's available — same model, same output. Either way the result is a public
  image URL, and Phase 3 (attach + featured) is identical regardless of backend.

## Context-efficiency rules
- Never echo GraphQL schema dumps. Use `graphql_schema` internally only.
- Mutations request only `userErrors`. Parse big JSON offline (Python/jq); show
  only summary lines (<50 chars, e.g. `Products 10–19 submitted`).
- Batch aggressively: ~10 products per GraphQL call via aliases. Build all batch
  payloads in one pass, then fire with no bash round-trips between them.
- No per-product progress spam, no mid-run workflow narration, no images in output.

## Recovery / checkpointing
Write `work/checkpoint.json` after each completed batch: `{batch, lastCursor,
doneIds[], failedIds[]}`. If context runs out, the user resumes with "Continue
from batch N" — reload checkpoint, skip `doneIds`, continue. If credits exhaust,
mark the image phase incomplete in the summary; re-run later for the remainder.

## Do NOT
- Re-ask the brief. Ask follow-ups after Phase 0 config (except the Manual
  test-run approval). Narrate the workflow mid-run. Stop for a single failure
  (only after 3 distinct in a row). Add "distortion/risk" warnings — the owner is
  regenerating from references on purpose. Report tools as "stopped/cut off"
  unless an actual tool call errored (if it did: wait 30s, retry; wait 30s, retry;
  then you may stop and report).
