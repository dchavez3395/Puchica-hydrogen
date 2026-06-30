# Variant SKU Audit (2026-06-29)

## Summary

- Active products: 6155
- Total variants: 13522
- Issues:
  - `empty_sku`: 329
  - `special_chars`: 185
  - `dup_within_product`: 143
  - `cross_product_dup`: 6
  - `too_long`: 1

## Products with empty SKUs

These need SKUs assigned so fulfillment can track them.

| handle | title | price |
| --- | --- | ---:|
| `1080p-night-vision-trail-camera` | 1080p HD Trail & Hunting Camera - 16MP, 0.6s Trigg | $41.80 |
| `24oz-leak-proof-glass-hummingbird-feeder` | 24oz Leak Proof Glass Hummingbird Feeder | $49.26 |
| `24oz-leak-proof-glass-hummingbird-feeder` | 24oz Leak Proof Glass Hummingbird Feeder | $49.26 |
| `2pcs-shoes-washing-bag-for-laundry` | 2Pcs Shoes Washing Bag for Laundry | $41.83 |
| `3-in-1-dog-hair-dryer-and-grooming-brush` | 3-in-1 Dog Hair Dryer, Slicker Brush & Grooming To | $44.62 |
| `4-in-1-cutting-board-with-thawing-tray-and-knife-sharpener` | 4-in-1 Cutting Board with Thawing Tray and Knife S | $20.91 |
| `4-in-1-cutting-board-with-thawing-tray-and-knife-sharpener` | 4-in-1 Cutting Board with Thawing Tray and Knife S | $27.88 |
| `450ml-smart-travel-mug-with-led-display` | 450ml Smart Travel Mug with LED Display | $41.83 |
| `4d-cloud-technology-insole-super-soft` | 4D Cloud Technology Insole - Super Soft! | $20.88 |
| `4d-cloud-technology-insole-super-soft` | 4D Cloud Technology Insole - Super Soft! | $20.88 |
| `4d-cloud-technology-insole-super-soft` | 4D Cloud Technology Insole - Super Soft! | $20.88 |
| `4d-cloud-technology-insole-super-soft` | 4D Cloud Technology Insole - Super Soft! | $20.88 |
| `5-in-1-forklift-design-wireless-charger-with-alarm-clock-and-night-light` | 5-in-1 Forklift Design MagSafe Wireless Charger wi | $46.01 |
| `600ml-leak-proof-protein-shaker-bottle-with-mixing-ball` | 600ml Leak-Proof Protein Shaker Bottle with Stainl | $12.54 |
| `600ml-leak-proof-protein-shaker-bottle-with-mixing-ball` | 600ml Leak-Proof Protein Shaker Bottle with Stainl | $12.54 |
| `adjustable-dog-boots` | Adjustable Dog Boots | $27.85 |
| `adjustable-dog-boots` | Adjustable Dog Boots | $27.85 |
| `adjustable-dog-boots` | Adjustable Dog Boots | $27.85 |
| `antislip-shower-mat` | Antislip Shower Mat | $41.77 |
| `antislip-shower-mat` | Antislip Shower Mat | $41.77 |
| `antislip-shower-mat` | Antislip Shower Mat | $41.77 |
| `antislip-shower-mat` | Antislip Shower Mat | $41.77 |
| `antislip-shower-mat` | Antislip Shower Mat | $41.77 |
| `antislip-shower-mat` | Antislip Shower Mat | $41.77 |
| `autogap-safety-fillers` | Auto Gap Safety Fillers | $55.76 |
| `autogap-safety-fillers` | Auto Gap Safety Fillers | $55.76 |
| `baby-blanket-1` | Baby Blanket | $19.39 |
| `baby-blanket-1` | Baby Blanket | $19.39 |
| `baby-blanket-1` | Baby Blanket | $19.39 |
| `baby-blanket-1` | Baby Blanket | $19.39 |
| `portable-air-conditioner-stand-up-room-cooler-indoor-ac-unit-windowless` | Portable Air Conditioner Stand Up Room Cooler Indo | $181.28 |
| `best-portable-air-cooler-stand-up-room-cooler-indoor-ac-unit-windowless` | Portable Air Cooler Stand Up Room Cooler Indoor AC | $221.77 |
| `car-dashboard-thermometer` | Car Dashboard Thermometer | $25.06 |
| `car-door-edge-scratch-protector-strip` | Car Door Edge Scratch Protector Strip | $16.74 |
| `car-door-edge-scratch-protector-strip` | Car Door Edge Scratch Protector Strip | $16.74 |
| `car-door-edge-scratch-protector-strip` | Car Door Edge Scratch Protector Strip | $16.74 |
| `car-door-edge-scratch-protector-strip` | Car Door Edge Scratch Protector Strip | $16.74 |
| `car-door-edge-scratch-protector-strip` | Car Door Edge Scratch Protector Strip | $16.74 |
| `car-door-edge-scratch-protector-strip` | Car Door Edge Scratch Protector Strip | $16.74 |
| `cat-carrier-pouch` | Cat Carrier Pouch | $27.85 |
| `cat-carrier-pouch` | Cat Carrier Pouch | $32.04 |
| `cat-carrier-pouch` | Cat Carrier Pouch | $34.83 |
| `cat-carrier-pouch` | Cat Carrier Pouch | $27.85 |
| `cat-carrier-pouch` | Cat Carrier Pouch | $32.04 |
| `cat-carrier-pouch` | Cat Carrier Pouch | $34.83 |
| `cat-carrier-pouch` | Cat Carrier Pouch | $27.85 |
| `cat-heating-pad-and-dog-warming-pad` | Cat Heating Pad and Dog Warming Pad | $27.85 |
| `cat-heating-pad-and-dog-warming-pad` | Cat Heating Pad and Dog Warming Pad | $27.85 |
| `cat-heating-pad-and-dog-warming-pad` | Cat Heating Pad and Dog Warming Pad | $27.85 |
| `cat-heating-pad-and-dog-warming-pad` | Cat Heating Pad and Dog Warming Pad | $27.85 |

_...and 279 more._

## Cross-product duplicate SKUs

Same SKU used on different products — breaks fulfillment.

| sku | count | products |
| --- | ---:| --- |
| `CHC364` | 2 | `car-heater-150w-300w-12v-ceramic-car-fan-heater`, `set-live-oct-2025-car-heater-150w-300w-12v-ceramic-car-fan-heater-copy` |
| `CST888` | 2 | `chicken-shredder-tool`, `coffee-scale-with-timer` |
| `Air-C GEL` | 2 | `air-c-care`, `air-c-univision` |
| `SAS0012-09NA` | 2 | `kitta-performance-percussive-sports-therapy-massage-gun`, `kitta-performance-percussive-sports-therapy-massage-gun-by-synca-massage-chair` |
| `SAS0020-08NA` | 2 | `kitta-performance-percussive-sports-therapy-massage-gun`, `kitta-performance-percussive-sports-therapy-massage-gun-by-synca-massage-chair` |
| `XPRESS` | 2 | `xpress-knee-massager`, `xpress-offer` |

## SKUs with special chars (spaces/symbols)

| sku | handle |
| --- | --- |
| `ST_10_RedmiNote11Pro+_TH` | 5am-club-xiaomi-redmi-note-11-pro-plus-case |
| `ST_10_RedmiNote12Pro+_TH` | 5am-club-xiaomi-redmi-note-12-pro-plus-5g-case |
| `ST_10_RedmiNote13Pro+_TH` | 5am-club-xiaomi-redmi-note-13-pro-plus-5g-case |
| `ST_10_RedmiNote14Pro+_TH` | 5am-club-xiaomi-redmi-note-14-pro-plus-5g-case |
| `AS_06_RedmiNote11Pro+_TH` | abyss-xiaomi-redmi-note-11-pro-plus-case |
| `AS_06_RedmiNote12Pro+_TH` | abyss-xiaomi-redmi-note-12-pro-plus-5g-case |
| `AS_06_RedmiNote13Pro+_TH` | abyss-xiaomi-redmi-note-13-pro-plus-5g-case |
| `AS_06_RedmiNote14Pro+_TH` | abyss-xiaomi-redmi-note-14-pro-plus-5g-case |
| `OH_13_RedmiNote11Pro+_TH` | academy-xiaomi-redmi-note-11-pro-plus-case |
| `OH_13_RedmiNote13Pro+_TH` | academy-xiaomi-redmi-note-13-pro-plus-5g-case |
| `OH_13_RedmiNote12Pro+_TH` | academy-xiaomi-redmi-note-12-pro-plus-5g-case |
| `OH_13_RedmiNote14Pro+_TH` | academy-xiaomi-redmi-note-14-pro-plus-5g-case |
| `UN_03_RedmiNote11Pro+_TH` | achromatic-xiaomi-redmi-note-11-pro-plus-case |
| `UN_03_RedmiNote12Pro+_TH` | achromatic-xiaomi-redmi-note-12-pro-plus-5g-case |
| `UN_03_RedmiNote13Pro+_TH` | achromatic-xiaomi-redmi-note-13-pro-plus-5g-case |
| `UN_03_RedmiNote14Pro+_TH` | achromatic-xiaomi-redmi-note-14-pro-plus-5g-case |
| `GK_11_RedmiNote11Pro+_TH` | aegean-affair-xiaomi-redmi-note-11-pro-plus-case |
| `GK_11_RedmiNote12Pro+_TH` | aegean-affair-xiaomi-redmi-note-12-pro-plus-5g-case |
| `GK_11_RedmiNote13Pro+_TH` | aegean-affair-xiaomi-redmi-note-13-pro-plus-5g-case |
| `GK_11_RedmiNote14Pro+_TH` | aegean-affair-xiaomi-redmi-note-14-pro-plus-5g-case |
| `PA_05_RedmiNote11Pro+_TH` | after-hours-xiaomi-redmi-note-11-pro-plus-case |
| `PA_05_RedmiNote12Pro+_TH` | after-hours-xiaomi-redmi-note-12-pro-plus-5g-case |
| `PA_05_RedmiNote14Pro+_TH` | after-hours-xiaomi-redmi-note-14-pro-plus-5g-case |
| `PA_05_RedmiNote13Pro+_TH` | after-hours-xiaomi-redmi-note-13-pro-plus-5g-case |
| `DN_08_RedmiNote11Pro+_TH` | afternoon-nap-xiaomi-redmi-note-11-pro-plus-case |
| `DN_08_RedmiNote12Pro+_TH` | afternoon-nap-xiaomi-redmi-note-12-pro-plus-5g-case |
| `DN_08_RedmiNote13Pro+_TH` | afternoon-nap-xiaomi-redmi-note-13-pro-plus-5g-case |
| `DN_08_RedmiNote14Pro+_TH` | afternoon-nap-xiaomi-redmi-note-14-pro-plus-5g-case |
| `BA_04_RedmiNote11Pro+_TH` | afternoon-treat-xiaomi-redmi-note-11-pro-plus-case |
| `BA_04_RedmiNote12Pro+_TH` | afternoon-treat-xiaomi-redmi-note-12-pro-plus-5g-case |
