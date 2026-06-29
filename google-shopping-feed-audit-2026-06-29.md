# Google Shopping Feed Audit

Generated against 6155 products.

## Findings summary

| Issue | Count | Severity |
| --- | --- | --- |
| `description_too_short` | 14 | LOW |
| `description_too_long` | 12 | LOW |
| `missing_description` | 2 | BLOCKER |

## First 50 flagged products (any issue)

| handle | issue | detail |
| --- | --- | --- |
| `decompression-belt-for-back-pain-relief` | description_too_long | 5001 chars (max 5000) |
| `flower-brush` | missing_description |  |
| `rechargeable-heated-socks` | missing_description |  |
| `amamedic-hilux-4d-massage-chair` | description_too_long | 6877 chars (max 5000) |
| `nexxt-home-smart-a19-cct-bulb` | description_too_short | 42 chars (recommend ≥50) |
| `nexxt-home-smart-br30-cct-bulb` | description_too_short | 43 chars (recommend ≥50) |
| `nexxt-home-smart-a19-cct-bulb-4-pk` | description_too_short | 42 chars (recommend ≥50) |
| `nexxt-home-smart-gu10-cct-bulb` | description_too_short | 43 chars (recommend ≥50) |
| `nexxt-home-smart-br30-cct-bulb-4pk` | description_too_short | 43 chars (recommend ≥50) |
| `nexxt-home-smart-br30-rgb-bulb` | description_too_short | 43 chars (recommend ≥50) |
| `nexxt-home-smart-br30-cct-bulb-2pk` | description_too_short | 43 chars (recommend ≥50) |
| `nexxt-home-smart-gu10-cct-bulb-3pk` | description_too_short | 43 chars (recommend ≥50) |
| `nexxt-home-smart-par38-cct-bulb` | description_too_short | 44 chars (recommend ≥50) |
| `osaki-4d-manhattan-duo-mech` | description_too_long | 5227 chars (max 5000) |
| `osaki-ai-monarch-le` | description_too_long | 5231 chars (max 5000) |
| `osaki-op-4d-master-massage-chair` | description_too_long | 5040 chars (max 5000) |
| `osaki-os-pro-4d-paragon` | description_too_long | 8179 chars (max 5000) |
| `osaki-os-pro-4d-emperor` | description_too_long | 7010 chars (max 5000) |
| `osaki-os-pro-3d-tecno-massage-chair` | description_too_long | 5048 chars (max 5000) |
| `osaki-theramedic-4d-lt-massage-chair` | description_too_long | 7282 chars (max 5000) |
| `osaki-theramedic-flex-massage-chair` | description_too_long | 6173 chars (max 5000) |
| `blankets` | description_too_short | 39 chars (recommend ≥50) |
| `beige-bag-set` | description_too_short | 29 chars (recommend ≥50) |
| `koru-design-bag-set` | description_too_short | 23 chars (recommend ≥50) |
| `koru-design-bag-set-1` | description_too_short | 37 chars (recommend ≥50) |
| `pink-design-bag-set-preorder-1` | description_too_short | 37 chars (recommend ≥50) |
| `titan-pro-cascade-3d-massage-chair` | description_too_long | 6400 chars (max 5000) |
| `titan-vibe-3d` | description_too_long | 5357 chars (max 5000) |

## Next steps

1. Fix BLOCKER issues first (missing image/title/desc/brand/price).
2. Re-run this audit after fixes; aim for 0 BLOCKERs.
3. Submit the Shopify product feed URL to Google Merchant Center at:
   `https://{store}.myshopify.com/apps/marketing/google/shopping_feed.xml`
   (Or use the Shopify Google channel app to auto-publish.)
4. Once approved, enable Performance Max or standard Shopping campaigns.