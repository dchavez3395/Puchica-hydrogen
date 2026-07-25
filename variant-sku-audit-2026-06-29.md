# Variant SKU Audit (refreshed 2026-07-25)

## Summary

- Active products: 5
- Total variants: 33
- Issues:
  - `special_chars`: 33
  - `cross_product_dup`: 2

## Cross-product duplicate SKUs

Same SKU used on different products — breaks fulfillment.

| sku | count | products |
| --- | ---:| --- |
| `14:175#Green` | 2 | `1-64-bluetooth-remote-control-crane-and-forklift-two-in-one-desktop-mini-alloy-toy-car-with-trailer-christmas-gift-in-color-box`, `watch-wrist-hand-controlled-induction-rc-drone-mini-rechargeable-helicopter-with-led-lights` |
| `14:366#Yellow` | 2 | `1-64-bluetooth-remote-control-crane-and-forklift-two-in-one-desktop-mini-alloy-toy-car-with-trailer-christmas-gift-in-color-box`, `watch-wrist-hand-controlled-induction-rc-drone-mini-rechargeable-helicopter-with-led-lights` |

## SKUs with special chars (spaces/symbols)

| sku | handle |
| --- | --- |
| `14:193#Black;5:361385` | 100-pure-cotton-t-shirt-with-round-neck-shoulder-design-for-both-men-women-summer-solid-color-short-sleeved-casual-loose-fit |
| `14:193#Black;5:361386` | 100-pure-cotton-t-shirt-with-round-neck-shoulder-design-for-both-men-women-summer-solid-color-short-sleeved-casual-loose-fit |
| `14:193#Black;5:100014064` | 100-pure-cotton-t-shirt-with-round-neck-shoulder-design-for-both-men-women-summer-solid-color-short-sleeved-casual-loose-fit |
| `14:193#Black;5:4182` | 100-pure-cotton-t-shirt-with-round-neck-shoulder-design-for-both-men-women-summer-solid-color-short-sleeved-casual-loose-fit |
| `14:193#Black;5:100014065` | 100-pure-cotton-t-shirt-with-round-neck-shoulder-design-for-both-men-women-summer-solid-color-short-sleeved-casual-loose-fit |
| `14:771#White;5:4183` | 100-pure-cotton-t-shirt-with-round-neck-shoulder-design-for-both-men-women-summer-solid-color-short-sleeved-casual-loose-fit |
| `14:173#Advanced Gray;5:100014064` | 100-pure-cotton-t-shirt-with-round-neck-shoulder-design-for-both-men-women-summer-solid-color-short-sleeved-casual-loose-fit |
| `14:173#Advanced Gray;5:4182` | 100-pure-cotton-t-shirt-with-round-neck-shoulder-design-for-both-men-women-summer-solid-color-short-sleeved-casual-loose-fit |
| `14:173#Advanced Gray;5:100014065` | 100-pure-cotton-t-shirt-with-round-neck-shoulder-design-for-both-men-women-summer-solid-color-short-sleeved-casual-loose-fit |
| `14:771#White;5:361385` | 100-pure-cotton-t-shirt-with-round-neck-shoulder-design-for-both-men-women-summer-solid-color-short-sleeved-casual-loose-fit |
| `14:200004890;5:100014064` | 2026-new-mens-high-neck-sweater-solid-color-pullover-knitted-warm-casual-turtleneck-sweatwear-woolen-mens-winter-outdoor-tops |
| `14:200004890;5:100014065` | 2026-new-mens-high-neck-sweater-solid-color-pullover-knitted-warm-casual-turtleneck-sweatwear-woolen-mens-winter-outdoor-tops |
| `14:771;5:100014065` | 2026-new-mens-high-neck-sweater-solid-color-pullover-knitted-warm-casual-turtleneck-sweatwear-woolen-mens-winter-outdoor-tops |
| `14:200004890;5:361385` | 2026-new-mens-high-neck-sweater-solid-color-pullover-knitted-warm-casual-turtleneck-sweatwear-woolen-mens-winter-outdoor-tops |
| `14:771;5:361386` | 2026-new-mens-high-neck-sweater-solid-color-pullover-knitted-warm-casual-turtleneck-sweatwear-woolen-mens-winter-outdoor-tops |
| `14:771;5:361385` | 2026-new-mens-high-neck-sweater-solid-color-pullover-knitted-warm-casual-turtleneck-sweatwear-woolen-mens-winter-outdoor-tops |
| `14:771;5:100014064` | 2026-new-mens-high-neck-sweater-solid-color-pullover-knitted-warm-casual-turtleneck-sweatwear-woolen-mens-winter-outdoor-tops |
| `14:193;5:100014064` | 2026-new-mens-high-neck-sweater-solid-color-pullover-knitted-warm-casual-turtleneck-sweatwear-woolen-mens-winter-outdoor-tops |
| `14:200004890;5:361386` | 2026-new-mens-high-neck-sweater-solid-color-pullover-knitted-warm-casual-turtleneck-sweatwear-woolen-mens-winter-outdoor-tops |
| `14:350852#Caramel;5:361386` | 2026-new-mens-high-neck-sweater-solid-color-pullover-knitted-warm-casual-turtleneck-sweatwear-woolen-mens-winter-outdoor-tops |
| `14:175#Green` | 1-64-bluetooth-remote-control-crane-and-forklift-two-in-one-desktop-mini-alloy-toy-car-with-trailer-christmas-gift-in-color-box |
| `14:691#Excavator-Green` | 1-64-bluetooth-remote-control-crane-and-forklift-two-in-one-desktop-mini-alloy-toy-car-with-trailer-christmas-gift-in-color-box |
| `14:366#Yellow` | 1-64-bluetooth-remote-control-crane-and-forklift-two-in-one-desktop-mini-alloy-toy-car-with-trailer-christmas-gift-in-color-box |
| `14:10#Excavator-Yellow` | 1-64-bluetooth-remote-control-crane-and-forklift-two-in-one-desktop-mini-alloy-toy-car-with-trailer-christmas-gift-in-color-box |
| `14:29#Dump Truck-Yellow` | 1-64-bluetooth-remote-control-crane-and-forklift-two-in-one-desktop-mini-alloy-toy-car-with-trailer-christmas-gift-in-color-box |
| `14:193#Dump Truck-Green` | 1-64-bluetooth-remote-control-crane-and-forklift-two-in-one-desktop-mini-alloy-toy-car-with-trailer-christmas-gift-in-color-box |
| `14:10#Purple` | pet-supplies-cat-bowls-water-bowls-dog-bowls-tip-over-resistant-pet-bowls-height-adjustable |
| `14:175#Black` | pet-supplies-cat-bowls-water-bowls-dog-bowls-tip-over-resistant-pet-bowls-height-adjustable |
| `14:193#Red blue` | pet-supplies-cat-bowls-water-bowls-dog-bowls-tip-over-resistant-pet-bowls-height-adjustable |
| `14:29#Pink` | pet-supplies-cat-bowls-water-bowls-dog-bowls-tip-over-resistant-pet-bowls-height-adjustable |
