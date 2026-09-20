# Weekly baseline — how to produce `work/baseline/<date>.md`

Purpose: one comparable snapshot per week so "did the organic posts / the ads change
anything" is read off numbers, not memory. Shopify's own analytics are the source because
they already exclude the CI browsers and the health check (since 18 Sep, commit da56b6e;
sessions before that are mostly monitors). Test orders (payment gateway in test mode) are
excluded by Shopify from `FROM sales` automatically.

There is no Admin API token on this machine (it expired in Aug 2026), so the queries run
through the claude.ai Shopify connector (`run-analytics-query`, ShopifyQL). Paste the
results into the template below. Run it on Saturdays; keep `SINCE`/`UNTIL` as absolute
dates so weeks don't overlap.

## Queries (replace the dates)

1. Funnel by day
   ```
   FROM sessions SHOW sessions, online_store_visitors, sessions_with_cart_additions,
   sessions_that_reached_checkout, sessions_that_completed_checkout, conversion_rate
   TIMESERIES day SINCE 2026-09-19 UNTIL 2026-09-26
   ```
2. Where sessions came from
   ```
   FROM sessions SHOW sessions, sessions_with_cart_additions, sessions_that_reached_checkout,
   sessions_that_completed_checkout GROUP BY referrer_source, referrer_name
   SINCE 2026-09-19 UNTIL 2026-09-26 ORDER BY sessions DESC LIMIT 12
   ```
3. Country × device (Canada-only store: US sessions are noise or scrapers)
   ```
   FROM sessions SHOW sessions, sessions_with_cart_additions, sessions_that_reached_checkout
   GROUP BY session_country, session_device_type SINCE 2026-09-19 UNTIL 2026-09-26
   ORDER BY sessions DESC LIMIT 10
   ```
4. Money
   ```
   FROM sales SHOW orders, gross_sales, net_sales, total_sales, average_order_value
   SINCE 2026-09-19 UNTIL 2026-09-26
   ```
5. What sold (only once there are orders)
   ```
   FROM sales SHOW orders, net_sales GROUP BY product_title
   SINCE 2026-09-19 UNTIL 2026-09-26 ORDER BY orders DESC LIMIT 20
   ```

GA4 (G-KTMM6KWWT6) is the cross-check for the storefront half (view_item, add_to_cart)
and Meta Events Manager for the pixel; both lag, Shopify does not.

## Template

```
# Baseline <start> → <end>

| day | sessions | visitors | +cart | reached checkout | completed | CR |
| … |

Sources: …
Country × device: …
Sales: orders N · net CA$ … · AOV CA$ …
Sold: …

Notes: what changed this week (posts, ads, price, site).
```
