# Klaviyo Flow Config (Puchica)

Puchica needs the following Klaviyo flows set up. Without a
Klaviyo API key I can't push these programmatically, but this
spec is enough to set them up manually in Klaviyo admin (or
hand to a VA).

OAuth scope: doesn't require additional Shopify scopes. Just
need a Klaviyo private API key (Settings → API keys in Klaviyo
admin) and the Klaviyo-Shopify integration installed.

---

## Flow 1: Abandoned Cart Recovery

**Trigger**: `Checkout Started` event from Shopify
**Filter**: customer has not placed an order in last 24h
**Goal**: Recover lost carts (industry avg recovery rate 5-15%)

### Email 1: 1 hour after cart abandon
- **Subject**: "You left something in your cart"
- **From**: hello@puchica.ca
- **Preview text**: "Your cart is waiting — complete your order in 1 click"
- **Content**:
  ```
  Hi {{ first_name|default:"there" }},

  Looks like you found something you liked but didn't quite finish.
  Your cart at Puchica is saved and ready when you are.

  [Cart items block — auto-populated from Klaviyo-Shopify integration]
  [CTA button: Complete Your Order → {{ checkout_url }}]

  Not ready yet? Browse more from the categories you love:
  [Personalized category recommendations block]

  Questions? Reply to this email — we usually reply within one business day.

  — The Puchica team
  ```

### Email 2: 24 hours after cart abandon (if not purchased)
- **Subject**: "Still thinking it over? Here's 10% off to make it easy"
- **From**: hello@puchica.ca
- **Content**:
  ```
  Hi {{ first_name|default:"there" }},

  We held your cart for 24 hours but noticed you haven't
  completed checkout yet. We get it — sometimes you need a
  little nudge.

  Use code COMEBACK10 for 10% off your order. Expires in 48 hours.

  [Cart items block]
  [CTA button: Use My 10% Off → {{ checkout_url_with_discount }}]

  — The Puchica team
  ```
- **Discount**: 10% off, single use, expires in 48h
  - Configure in Klaviyo with shopify discount code `COMEBACK10`

### Email 3: 72 hours after cart abandon (last chance)
- **Subject**: "Last call — your cart expires tomorrow"
- **From**: hello@puchica.ca
- **Content**:
  ```
  Hi {{ first_name|default:"there" }},

  Quick reminder — your cart at Puchica is reserved but
  we can only hold it for so long.

  Your 10% off code COMEBACK10 is still valid for another
  48 hours.

  [CTA button: Complete My Order → {{ checkout_url_with_discount }}]

  If shopping with us isn't right for you, no worries — we
  won't email you about this again.

  — The Puchica team
  ```

**Exit condition**: customer places an order.

---

## Flow 2: Browse Abandonment

**Trigger**: `Product Viewed` event from Shopify (Klaviyo-Shopify integration)
**Filter**: viewed a product in last 24h AND hasn't purchased AND hasn't been in this flow for 14 days
**Goal**: Re-engage window-shoppers (industry avg conversion 2-5%)

### Email: 4 hours after browse
- **Subject**: "Still thinking about this?"
- **From**: hello@puchica.ca
- **Preview text**: "It's still here — and so are we"
- **Content**:
  ```
  Hi {{ first_name|default:"there" }},

  Earlier today you were checking out {{ product_title }} on Puchica.
  Just wanted to make sure it didn't slip through the cracks.

  [Product image block — links back to product page]

  {{ product_description|truncatewords:30 }}

  See what other shoppers also liked:
  [Related products block — by category]

  [CTA button: View {{ product_title }} → {{ product_url }}]

  — The Puchica team
  ```

**Exit condition**: customer purchases OR views a product then
places an order within 7 days.

---

## Flow 3: Welcome Series (after newsletter signup)

**Trigger**: `Subscribed to List` event (Puchica newsletter)
**Goal**: Nurture new subscribers toward first purchase

### Email 1: Immediately on signup
- **Subject**: "Welcome to Puchica — here's 10% off your first order"
- **Content**:
  ```
  Hi {{ first_name|default:"there" }},

  Welcome to the Puchica family. We're a Canadian-owned shop
  curating unique finds from around the world — dropshipped
  to your door with care.

  As a welcome, here's 10% off your first order:
  Code WELCOME10

  [CTA button: Start Shopping → https://puchica.ca]

  Categories we think you'll love:
  - Sexual Wellness (vibrators, massagers, kegel sets)
  - Intimate Care (lubricants, moisturizers)
  - Phone Cases (iPhone, Samsung, Pixel)
  - Home & Kitchen

  — Daniel + the Puchica team
  ```

### Email 2: 3 days after signup
- **Subject**: "What's actually popular right now"
- **Content**: Top 10 trending products this week

### Email 3: 7 days after signup (if no purchase)
- **Subject**: "Don't forget your 10% off"
- **Content**: Reminder about WELCOME10 expiry (7 days left)

**Exit condition**: customer makes first purchase.

---

## Flow 4: Post-Purchase (Thank You + Cross-Sell)

**Trigger**: `Order Placed` event
**Goal**: Build loyalty, drive repeat purchase, request review

### Email 1: Immediately on order
- **Subject**: "Your Puchica order is confirmed — thank you!"
- **Content**:
  ```
  Hi {{ first_name|default:"there" }},

  Order #{{ order_number }} confirmed. Here's what to expect:

  [Order details block]
  [Shipping timeline: "Orders ship within 2-3 business days"]

  Have questions about your order? Reply to this email — we
  usually reply within one business day.

  — The Puchica team
  ```

### Email 2: 14 days after delivery (or order date if no tracking)
- **Subject**: "How's your order? Quick favor to ask"
- **Content**: Request for product review

### Email 3: 45 days after delivery
- **Subject**: "You might also love these"
- **Content**: Cross-sell recommendations based on purchase history

---

## Implementation steps

1. **Install Klaviyo-Shopify integration** (Klaviyo admin → Integrations → Shopify → enter store domain)
2. **Set up List**: "Newsletter" (already exists if you had a popup)
3. **Create each flow** in Klaviyo Flows UI with the specs above
4. **Configure discount codes**: COMEBACK10, WELCOME10 in Shopify admin
5. **Test**: Trigger each flow with a test email address

## Expected revenue impact

Industry benchmarks (Klaviyo 2024 ecommerce study):
- Abandoned cart: 5-15% recovery → if Puchica has 100 abandoned
  carts/month at $60 AOV = $300-$900/month recovered
- Browse abandonment: 2-5% conversion → 1000 views/month = $1,200-$3,000
- Welcome series: 5-10% conversion → 200 signups/month = $1,200-$2,400
- Post-purchase cross-sell: 5-10% repeat rate lift

Total potential: $3-7k/month additional revenue, conservative.

## Required credentials (none I have)

- Klaviyo private API key (Settings → API keys in Klaviyo admin)
- Klaviyo public API key (for on-site tracking — Settings → Account)
- Discount codes: COMEBACK10, WELCOME10 (Shopify admin → Discounts)

Once Klaviyo is connected and these flows are built, I can:
- A/B test subject lines
- Track revenue attribution per flow
- Tune timing based on real engagement
- Push segment updates programmatically