# Puchica — Facebook Traffic Campaign Strategy

## Status: Ready to Execute (Pending Meta Pixel ID)

**Prerequisites:**
- [ ] Meta Pixel ID — create at https://business.facebook.com/events_manager
- [ ] Add to `.env` as `PUBLIC_FACEBOOK_PIXEL_ID=XXXXXXXXXXXXX`
- [ ] Add to Oxygen environment variables (Shopify Admin → Hydrogen storefront settings)
- [ ] Deploy: `npx shopify hydrogen deploy --shop ug91ve-sz.myshopify.com`
- [ ] Verify pixel firing: use Meta Pixel Helper Chrome extension on puchica.ca

---

## 1. Campaign Objective

**Traffic** — drive qualified visitors to product pages on puchica.ca.

We choose Traffic (not Conversions) for the first campaign because:
- We have zero pixel data — Meta needs 50+ conversion events to optimize
- Traffic campaigns optimize for link clicks, which we can get immediately
- After ~100 add-to-cart events fire, switch to Conversions objective
- Budget is limited — Traffic is cheaper per click than Conversions

## 2. Target Audience

### Primary: Cold traffic (Prospecting)
| Parameter | Value |
|-----------|-------|
| **Locations** | Canada (primary), United States (secondary) |
| **Age** | 25–55 |
| **Gender** | All |
| **Interests** | Online shopping, Deals, Dropshipping, Kitchen gadgets, Home organization, Gadgets |
| **Exclude** | Past purchasers (once we have a customer list) |

### Lookalike (Phase 2 — after 500+ pixel events)
- 1% lookalike of AddToCart users
- 1% lookalike of page viewers who spent >30s

### Retargeting (Phase 2)
- Cart abandoners (InitiateCheckout without Purchase)
- Product viewers (ViewContent, 7-day window)

## 3. Ad Creative Strategy

### Format
- **Single image ads** — product photos on clean backgrounds (from our WebP assets)
- **Carousel ads** — 3–5 products per ad, "Most Wanted" collections
- **Video ads** — product demo videos (source from DSers/AliExpress supplier content)

### Copy Framework
```
Headline: {Product benefit, not product name} — {price}
Example: "No more tangled cables. $24.99"

Body: 
{Pain point}?
{Product} solves it by {key feature}.
✅ {Benefit 1}
✅ {Benefit 2}
✅ {Benefit 3}
Shop now → puchica.ca

CTA: Shop Now
```

### Creative Variations (A/B test)
1. **Benefit-led**: "Stop losing your keys. Magnetic key holder, $19.99"
2. **Price-led**: "Under $25: gadgets that actually make life easier"
3. **Social proof**: "Join 500+ shoppers who found something useful today"
4. **Urgency**: "15% off your first order with code FIRST15"

## 4. Budget & Bidding

| Phase | Duration | Daily Budget | Bidding | Target |
|-------|----------|-------------|---------|--------|
| **Phase 1: Test** | 7 days | $5 CAD/day | Lowest cost | Link clicks |
| **Phase 2: Scale** | 14 days | $10–20 CAD/day | Lowest cost | Top-performing ads only |
| **Phase 3: Convert** | Ongoing | $15–30 CAD/day | Cost cap | AddToCart events |

**Budget rationale:**
- $5/day = ~$35/week = ~15–25 clicks (CPC $1.50–2.50 for traffic ads in CA)
- Test 4 ad variations → kill bottom 2 after 3 days → scale top 2
- FIRST15 discount (15% off) gives margin for ad spend: 20% target margin - 15% discount = 5% net margin floor

## 5. Campaign Structure

```
Campaign: Puchica Traffic — Cold (Objective: Traffic)
├── Ad Set 1: CA — Shopping Interests ($3/day)
│   ├── Ad 1: Carousel — Best Sellers
│   ├── Ad 2: Single Image — Hero Product
│   ├── Ad 3: Single Image — Price-Led
│   └── Ad 4: Video — Product Demo
└── Ad Set 2: US — Shopping Interests ($2/day)
    ├── Ad 1: Carousel — Best Sellers
    └── Ad 2: Single Image — Hero Product
```

## 6. Tracking & Measurement

### What Meta Pixel tracks (storefront side):
| Event | Trigger | Value |
|-------|---------|-------|
| PageView | Any page load | — |
| ViewContent | Product page | Product price |
| AddToCart | Add to cart button | Product price |
| InitiateCheckout | Cart page view | Cart total |

### What Shopify tracks (checkout side):
| Event | Trigger |
|-------|---------|
| Purchase | Order completed |
| (Handled by FB & Instagram Shopify channel) |

### Key Metrics to Monitor:
- **CPC** (Cost per Click) — target <$2.50 CAD
- **CTR** (Click-Through Rate) — target >1.5%
- **AddToCart rate** — target >5% of clicks
- **CPA** (Cost per AddToCart) — target <$5
- **ROAS** (Return on Ad Spend) — calculate once purchases flow

## 7. Launch Checklist

1. [ ] Get Meta Pixel ID from Events Manager
2. [ ] Add `PUBLIC_FACEBOOK_PIXEL_ID` to `.env` and Oxygen
3. [ ] Deploy to Oxygen
4. [ ] Verify pixel with Meta Pixel Helper extension
5. [ ] Create Facebook Business Manager account (if not existing)
6. [ ] Connect Instagram account for ad placement
7. [ ] Upload product images (WebP from src/assets/)
8. [ ] Write 4 ad copy variations
9. [ ] Launch campaign at $5/day
10. [ ] After 3 days: review performance, kill bottom ads
11. [ ] After 7 days: evaluate CPC/CTR, adjust budget
12. [ ] After 50 AddToCart events: switch to Conversions objective

## 8. Creative Assets Needed

- 4 product hero images (1200×1200 px, from existing WebP)
- 1 carousel set (3–5 products, 1200×1200 px)
- 1 video ad (15–30s, source from supplier)
- Ad copy: 4 variations (benefit, price, social proof, urgency)

---

**Created:** 2026-07-15
**Store:** puchica.ca (ug91ve-sz.myshopify.com)
**Discount:** FIRST15 (15% off first order)
**Shipping:** Standard $7.99 (≤$74.99), Free ≥$75 (CA/US)