# Puchica Custom Metafield Schema

Single source of truth for `custom.*` metafields on Shopify products.
Maintained by Connor. Update this file when adding a new metafield
key so future scripts/JSX know what's available.

## Conformance rules

- **Namespace:** `custom` (Shopify's reserved-for-merchants namespace)
- **Owner type:** `product` (all current keys live on products)
- **Type discipline:** always use a Shopify-supported type (`single_line_text_field`,
  `multi_line_text_field`, `number_integer`, `number_decimal`, `boolean`,
  `date`, `date_time`, `json`, `url`, `color`, `weight`, `volume`, `dimension`,
  `rating`, `money`, `file_reference`, `product_reference`, etc.)
- **Read pattern:** JSX reads via `metafield(namespace: "custom", key: "...") { value }`
- **Write pattern:** scripts use `metafieldsSet` (set) or `metafieldDelete` (clear)
  via `scripts/lib/shopify_admin.py::ShopifyAdmin.set_metafield`
- **Idempotency:** the catalog_sync script reads current value first, only writes
  when the incoming value differs. Don't bypass that path.

## Current keys

### `model3d`

| Property | Value |
| --- | --- |
| Type | `single_line_text_field` (URL string) |
| Required | No |
| UI consumer | `app/components/ProductImage.jsx` 3D toggle, `app/components/ProductViewer3D.jsx` |
| Read by | `app/routes/products.$handle.jsx` (alias `model3d`) |
| Write by | `scripts/catalog_sync.py --only model3d` |
| Default when unset | Component does not render the 3D toggle in the gallery. |

**Format:** HTTPS URL to a `.glb` or `.gltf` file. CDN-backed preferred
(Cloudflare R2, Shopify Files, or a vendor's CDN). The viewer's
`useGLTF` accepts cross-origin URLs but the CDN must serve
`Access-Control-Allow-Origin: *` for the lazy load to work.

**Validation:**
- Must start with `https://`
- Path must end in `.glb` or `.gltf` (case-insensitive)
- Empty string is treated as "not set" — toggle stays hidden
- 70-char `seo.title` and 320-char `seo.description` truncations happen
  server-side in `apply_seo`; do not pre-truncate before writing

**Example:**
```
https://cdn.puchica.ca/3d/rangefinder-v3.glb
```

**Gotchas:**
- Don't store a relative path. The viewer always fetches via URL.
- Don't store JSON. We had a brief schema-flip in 2026-06-29 during
  PDP wire-in. The decision was to keep this a plain URL string so
  `useGLTF(url)` works without intermediate parsing.

### `videos`

| Property | Value |
| --- | --- |
| Type | `single_line_text_field` (JSON-as-string) |
| Required | No |
| UI consumer | None yet (parked 2026-06-29) |
| Read by | `app/routes/products.$handle.jsx` (alias `videos`) — defined for future |
| Write by | (none; bulk-edit manual) |
| Default when unset | Empty array. |

**Format:** JSON-encoded array of `{platform, url, title, thumbnailUrl}`
objects. Stored as a string in `single_line_text_field` for portability.

**Example:**
```json
[
  {
    "platform": "youtube",
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "title": "Rangefinder test in low light",
    "thumbnailUrl": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
  },
  {
    "platform": "tiktok",
    "url": "https://www.tiktok.com/@puchica/video/12345",
    "title": "Side-by-side with competitor",
    "thumbnailUrl": "https://p16-sign-va.tiktokcdn.com/..."
  }
]
```

**Status:** Parked. The PDP video section was scoped but Daniel
opted to skip on 2026-06-29 due to scope (curation cost). Schema is
in place so a future script can bulk-populate without redoing the
GraphQL alias. See `~/.openclaw/workspace/MEMORY.md` "PDP video
section" entry.

## Future keys (proposed, not yet shipped)

### `size_chart` (proposed)

Type: `multi_line_text_field` (markdown)
Purpose: per-product size guide. JSX renders a modal/accordion on
the PDP. Currently the storefront uses a single global size chart
from the theme settings. Adding per-product is a future Daniel call.

### `care_instructions` (proposed)

Type: `multi_line_text_field` (plain text or markdown)
Purpose: laundry/care notes. Optional per product.

### `related_collection_handle` (proposed)

Type: `single_line_text_field`
Purpose: explicit cross-sell pointer if the algorithm's recommendations
miss. JSX would surface a single "Pairs with →" card row above the
recommendation grid.

## Audit history

- 2026-06-29: schema created. Initial keys: `model3d`, `videos`.
  `videos` is parked but schema is in place for future bulk write.