# Puchica Business Context for Ollama

> This document provides full business context for local LLM (Ollama) sessions working on the Puchica storefront. Contains pricing formulas, shipping constraints, DSers assumptions, Shopify fee structure, and safe language guidelines.

## Store Overview

- **Store:** Puchica (puchica.ca)
- **Platform:** Shopify Hydrogen (custom storefront) hosted on Shopify Oxygen
- **Repo:** `D:/Claude/puchica-site/` — React 19 + Vite + Tailwind + Hydrogen
- **Deploy:** Push to `main` → Shopify Oxygen auto-deploys
- **Business Model:** Dropshipping via DSers/AliExpress. No inventory held. Third-party suppliers. 
- **Catalog:** 69 active products, 72 archived (curated from 141 original)
- **Currency:** CAD (Canadian Dollars)
- **Contact Email:** hello@puchica.ca

## Pricing Formula

**Goal:** 20% contribution margin after FIRST15 discount + Shopify fees.

```
price >= (supplier_cost_ca + 0.30) / ((1 - 0.15) * (1 - 0.028 - 0.20))
```

### Constants

| Constant | Value | Notes |
|----------|-------|-------|
| FEE_RATE | 0.028 (2.8%) | Shopify payment processing rate (domestic cards) |
| FEE_FIXED | CA$0.30 | Fixed per-transaction fee |
| DISCOUNT | 0.15 (15%) | FIRST15 discount code |
| TARGET_MARGIN | 0.20 (20%) | Minimum contribution margin |
| ROUND_ENDING | .99 | All prices rounded up to nearest .99 |

### How It Works

1. Take DSers supplier cost (in CA$) — treated as landed cost to Canada
2. Add CA$0.30 fixed fee
3. Divide by `(1 - 0.15) * (1 - 0.028 - 0.20)` = `0.85 * 0.772 = 0.6562`
4. Round up to nearest .99

### Example

- Supplier cost: CA$5.00
- Formula: `(5.00 + 0.30) / 0.6562 = 5.30 / 0.6562 = CA$8.077`
- Round up to .99: **CA$8.99**

### Caveats

- **Amex/International cards:** ~3.5% + CA$0.30 (higher than 2.8% used in formula). Repricing used 2.8% — do NOT lower prices without recalculation.
- **15 zero-cushion products** are priced exactly at the formula floor. If supplier costs increase even slightly, these lose money.
- **Monthly pricing audit recommended** to catch supplier cost drift.

## Discount Codes

### FIRST15 (Active)

- 15% off sitewide
- Used in pricing formula — all prices account for this discount
- **Do NOT stack with other discounts** unless repriced with combined discount rate

### Safer Alternatives (if margins feel tight)

| Code | Discount | Impact |
|------|----------|--------|
| FIRST10 | 10% off | Extra 5% cushion vs. FIRST15 pricing |
| Threshold | "15% off orders over CA$50" | Only triggers on larger orders, protects small orders |

**Rule:** Any discount change requires repricing all products with the new discount rate in the formula.

## Shopify Fee Structure

| Fee Type | Rate | Notes |
|----------|------|-------|
| Shopify plan | $29 USD/month | Basic Shopify |
| Payment processing (domestic) | 2.8% + CA$0.30 | Visa/MC domestic |
| Payment processing (Amex/intl) | ~3.5% + CA$0.30 | Higher — repricing uses 2.8% |
| Oxygen hosting | Included | With Shopify plan |

### Monthly Cost Floor

- Shopify plan: ~CA$39/month (at current FX)
- Break-even: ~CA$39 / 0.20 (margin) = **~CA$195 in revenue/month** just to cover Shopify fees
- At 20% margin, need CA$195 * (1/0.6562) = ~CA$297 in gross sales to break even on platform cost alone

## DSers / Supplier Assumptions

### Cost Treatment

- DSers "Cost CA$" is treated as **supplier/landed cost to Canada**
- This is the `supplier_cost_ca` value in the pricing formula
- **Unverified:** Whether DSers cost includes shipping for every variant/supplier. Some suppliers may add shipping at checkout. Monitor for cost discrepancies.

### Fulfillment

- Orders placed on Puchica → DSers syncs to AliExpress supplier → supplier ships directly to customer
- **No inventory held** by Puchica
- Products may be fulfilled by **different third-party suppliers** (not all from one supplier)
- Tracking numbers provided by supplier, synced back through DSers where available

### Known Risks

1. **Supplier cost drift** — AliExpress prices change. Monthly audit needed.
2. **Shipping cost inclusion** — Not 100% confirmed if DSers CA$ cost includes shipping for all suppliers
3. **Supplier reliability** — Different suppliers have different processing times and quality
4. **Stock availability** — Products can go out of stock at supplier level without warning

## Shipping — Safe Storefront Language

### ✅ Approved Language (Safe, Verifiable)

- "Shipping options shown at checkout"
- "Processing and delivery details shown at checkout"
- "Products may be fulfilled by third-party suppliers"
- "Tracked where available"
- "30-day returns"
- "Secure checkout"
- "Review images, options, and product details before ordering"

### ❌ Prohibited Language (Unverifiable Claims)

- ~~"Free shipping over $75"~~ — unless shipping rates are actually configured
- ~~"Ships from Canada"~~ — products ship from suppliers (AliExpress/China)
- ~~"Fast 2–5 day shipping"~~ — cannot guarantee delivery times
- ~~"Canada Post delivery"~~ — not the carrier
- ~~"Prepaid label in every box"~~ — not provided

### Current Shipping State (2026-07-15)

| Zone | Rates Configured | Status |
|------|-----------------|--------|
| Canada (Domestic) | **0 rates** | 🚨 **BROKEN — customers cannot checkout** |
| US Cross-border | 2 weight-based ($7.90 / $34.90) | ⚠️ Products have no weight set → rates won't calculate |
| International (26 countries) | **0 rates** | 🚨 BROKEN |
| Rest of World | **0 rates** | 🚨 BROKEN |

**Action Required:** Configure shipping rates in Shopify Admin → Settings → Shipping & Delivery. The Admin API token lacks `write_shipping` scope, so this must be done manually.

**Recommended Setup:**
1. Canada: Flat CA$7.99, Free over CA$75
2. US: Flat CA$12.99, Free over CA$100
3. International: Flat CA$19.99
4. Rest of World: Flat CA$24.99

## Return Policy

### Guidelines

- **Do NOT put Daniel's home address publicly** on the store
- Use **contact-first return policy**: customer emails hello@puchica.ca to initiate return
- Handle returns **case-by-case** at early stage (low volume)
- Later: set up business mailbox, virtual address, or return processing service

### Current Policy (Live)

Refund policy is live at `/policies/refund-policy` with contact-first language. No public return address displayed.

## What Ollama Should Do Next (Post-Deploy)

### Priority 1: Fix Shipping (BLOCKED — requires Shopify Admin access)

Shipping rates must be configured manually in Shopify Admin. No API path available with current token scopes.

### Priority 2: CSS Adjustments for Department Cards

If mobile department cards still show too much whitespace after a hard refresh, apply these CSS fixes to `app/styles/app.css`:

```css
.pk-dept-grid {
  align-items: start;
}

.pk-dept-tile__link {
  min-height: 0;
}

.pk-dept-tile__body {
  flex: 0 0 auto;
}
```

Optional — if images still feel too tall on mobile:

```css
@media (max-width: 700px) {
  .pk-dept-tile__media {
    aspect-ratio: 1 / 0.86;
  }
}
```

**Note:** The main issue is text body height (flex stretching), not image height. The `flex: 0 0 auto` on `.pk-dept-tile__body` is the key fix.

### Priority 3: Product Page Improvements

1. **Surface FIRST15 discount** prominently near the buy box (not just announcement bar)
2. **Show shipping info** near buy box: "Shipping options shown at checkout"
3. **Email capture** should explicitly mention the FIRST15 incentive
4. **Mobile performance:** Lazy-load `three`/`@react-three/drei`/`lenis` (1.6MB bundle, 93% mobile traffic)

### Priority 4: Business Operations

1. **Re-authorize Admin API token** with scopes: `write_shipping`, `write_products`, `read_products`, `write_discounts`, `read_markets`
2. **Clear fake compareAtPrice data** on 39 products (frontend fixed, data-level fix blocked by token scope)
3. **Set up abandoned cart automation** (Shopify email is Draft, 0 sent)
4. **Configure analytics pixels** (Meta/GA conversion tracking verification)
5. **Monthly pricing audit** (script at `C:\Users\dchav\puchica_audit.py`)

## File Locations

| File | Purpose |
|------|---------|
| `app/styles/app.css` | Main stylesheet (contrast fixes, department cards) |
| `app/components/ProductPrice.jsx` | Price rendering (fake sale fix) |
| `app/components/Aside.jsx` | Cart drawer (focus trap) |
| `app/components/NewsletterPopup.jsx` | Email capture popup (focus trap) |
| `app/components/PageLayout.jsx` | Layout wrapper (skip link, aria) |
| `app/lib/seo.js` | SEO meta + JSON-LD builder |
| `app/routes/products.$handle.jsx` | PDP route (buy box, JSON-LD) |
| `.env` | Store credentials (DO NOT COMMIT) |
| `C:\Users\dchav\puchica_pricing_audit_2026-07-15.json` | Full 69-product pricing audit |
| `C:\Users\dchav\puchica_audit.py` | Pricing audit script |
| `D:/puchica-store/pricing-profit-reprice-20pct-2026-07-15.csv` | Supplier costs CSV (141 handles) |

## Git State

- **Branch:** main
- **Last commit:** `40fb26a` (fake sale fix)
- **Prior commit:** `7f5e8cd` (WCAG accessibility fixes)
- **Working tree:** Clean
- **Hosting:** Shopify Oxygen (auto-deploy on push to main)

## Storefront Technical Details

- **Store Domain:** `ug91ve-sz.myshopify.com`
- **Shop ID:** `84226441466`
- **Storefront API endpoint:** `https://ug91ve-sz.myshopify.com/api/2024-10/graphql.json`
- **Public domain:** puchica.ca (Hydrogen), shop.puchica.ca (legacy)

## Tailwind Color Palette

`ink`, `muted`, `canvas`, `surface`, `border`, `berry`, `clay`, `gold`, `teal`, `jade`, `night`

## Accessibility (WCAG 2.2 AA)

- **100% compliance is a hard requirement** — Deque University standards
- All contrast ratios ≥ 4.5:1 (normal text), 3:1 (large text/UI components)
- Focus traps in all modals (cart drawer, newsletter popup)
- Skip-to-content link present
- ARIA labels on all interactive elements
- Reference: [Deque WCAG 2.2 AA Checklist](https://docs.google.com/spreadsheets/d/1X4Qez75HTtamrXymTZ34irDzUxf1IvYmmKztMoxbRY0/edit?usp=sharing)