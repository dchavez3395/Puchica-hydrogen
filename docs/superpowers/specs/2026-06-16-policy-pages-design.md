---
title: Puchica policy pages (Refund / Shipping / Terms)
date: 2026-06-16
status: draft — awaiting user review
---

# Policy pages design

## Purpose

The Hydrogen storefront is missing 3 of the 4 policy pages Shopify
requires: **Refund Policy**, **Shipping Policy**, **Terms of Service**.
The Privacy Policy already exists (the legacy Horizon theme has it).

These pages are blocking:

- **Shopify Markets** flags stores without published refund and
  shipping policies. Without them, the Markets sales channel cannot
  be activated for Canada/US.
- **Google Trust Store** uses the presence of these pages as a
  ranking factor. Their absence is a soft-404 signal.
- **Shopify checkout, order confirmation, and customer account**
  link to `/policies/refund-policy`, `/policies/shipping-policy`,
  and `/policies/terms-of-service`. With the Hydrogen storefront
  live, those links will 404 until we ship this work.
- **Cutover from Horizon to Hydrogen** cannot happen until these
  pages render — even with placeholder copy — so the URL structure
  is in place.

The policy body content lives in **Shopify admin** (Settings >
Policies), exposed via the Storefront API as `ShopPolicy`. The
Hydrogen side is read-only: query, render, style.

## Scope

In scope:

- 3 policy routes: `/policies/refund-policy`, `/policies/shipping-policy`,
  `/policies/terms-of-service` (all already exist as stub routes —
  see `app/routes/policies.$handle.jsx`)
- The `/policies` index route (already exists as `app/routes/policies._index.jsx`)
- The policy page layout: typography, last-updated date, anchored
  navigation on long policies, empty state for unpublished policies
- The 3 policy bodies as **draft copy** in this spec, marked for
  legal review before publishing
- Verify the Footer policy links resolve

Out of scope (separate specs):

- Privacy Policy (already exists on the Horizon theme — copy as-is
  into Shopify admin if it's not there yet)
- Customer account / order history
- Email templates for return confirmations
- Automated return portal (Shopify Returns API integration)

## Architecture

The Hydrogen side is a renderer. Shopify owns the content.

```
Shopify admin (Settings > Policies)
  └── ShopPolicy { handle, title, body (HTML) }
        │
        │ Storefront API
        │   query: shop { policies { ... } }
        │
        ▼
Hydrogen loader (policies.$handle.jsx)
        │
        ▼
Hydrogen component (policies.$handle.jsx, default export)
        │
        ▼
<pk-policy> rendered HTML
```

### Files to change

| File | Change |
|---|---|
| `app/routes/policies.$handle.jsx` | Add `meta` (title + description). Render body via `dangerouslySetInnerHTML`. Handle 3 cases: published, unpublished (empty body), unknown handle. |
| `app/routes/policies._index.jsx` | Add `meta`. Replace placeholder list with a real list of 4 known policies, each with title + 1-line summary. |
| `app/styles/app.css` | New `.pk-policy` block: page hero, body typography, anchored-nav sidebar, empty state. |
| (none) | Footer already has policy links in the "Customer Care" column. Verify URLs. |

No new components. We reuse the existing `pk-col-hero`, `pk-empty`,
and the same brand language (Outfit, violet/indigo, `--r-xl`,
`--pk-sh-md`) used by the contact page and collection pages.

## Components and design

The policy page is a content page. The job is to make the merchant's
text easy to read, not to design around it.

### Layout (desktop ≥ 900px)

```
┌─────────────────────────────────────────────────┐
│  Hero (compact)                                 │
│  Eyebrow: "Legal"                               │
│  Title:        "Shipping Policy"                │
│  Sub:          "How we get your order to you"   │
│  Last updated: 2026-06-15                       │
├─────────────────────────────────────────────────┤
│                                  │              │
│  Body (max 720px)                │  Contents    │
│  ────────────                    │  ─────       │
│  Heading 2                      │  Section 1   │
│  Paragraph text...              │  Section 2   │
│                                 │  Section 3   │
│  Heading 2                      │              │
│  Paragraph text...              │  (sticky)    │
│                                 │              │
└──────────────────────────────────┴──────────────┘
```

The right-rail "Contents" appears **only** when the policy body has
`<h2>` headings. If the body is short (no `<h2>`s), no rail. The
current section is highlighted in the rail via `IntersectionObserver`.

The 900px breakpoint matches the catalog page's sidebar breakpoint
(`app/styles/app.css` `.pk-col-body` already uses 900px for the
two-column body layout). The 700px breakpoint below matches the
project's standard mobile collapse (used by `.pk-col-hero`,
`.pk-product__title`, `.pk-thumbs`, etc.).

### Layout (mobile < 900px)

The right rail collapses into a top button "Contents" that opens
a slide-down list of section links. The hero padding shrinks to
match the contact page mobile pattern (`.pk-col-hero` already has
a 700px breakpoint for this).

### Typography

- **`<h1>` (page title)**: 40px / 1.1 / 800 weight / `pk-ink`
- **`<h2>` (body sections)**: 24px / 1.3 / 700 weight / `pk-ink`,
  with 36px top margin and a 1px `pk-border` divider above
- **Body text**: 17px / 1.7 / `pk-ink`
- **Lists**: 17px / 1.7, 8px gap between items, 24px left margin
- **Strong**: 700 weight, no color change (the merchant can use
  `<em>` or color via rich text if they want emphasis)
- **Links**: `pk-violet-700` with 1px underline, 3px offset

### Last-updated date

Rendered as a 12px / 1.4 / `pk-muted` line below the hero sub-text.
Updates whenever the merchant edits the policy in Shopify admin
(Shopify returns the `updatedAt` timestamp on `ShopPolicy`).

### Empty state

When the merchant hasn't set a policy yet, the route returns 200
with the empty state (not 404 — the URL is reserved). The empty
state reuses the `pk-empty` card style from the catalog:

```
┌────────────────────────────────────────┐
│                                        │
│  This policy isn't published yet.      │
│                                        │
│  We're working on it. If you have a    │
│  question, email us at                 │
│  hello@puchica.ca.                     │
│                                        │
│  [ Email us ]                          │
│                                        │
└────────────────────────────────────────┘
```

The `mailto:` link is pre-filled with `?subject=Re:%20Puchica%20[Policy%20Name]%20policy`
so the customer lands in the right inbox folder.

### 404 (unknown policy handle)

If the URL is `/policies/something-not-a-real-policy`, return 404
using the existing `$.jsx` catch-all (which already has a friendly
404 page from the SEO pass). No additional work needed.

## Data flow

### `policies.$handle.jsx`

```js
const POLICY_HANDLES = {
  'refund-policy': 'Refund Policy',
  'shipping-policy': 'Shipping Policy',
  'terms-of-service': 'Terms of Service',
  'privacy-policy': 'Privacy Policy',
};

export async function loader({context, params}) {
  const handle = params.handle;
  if (!POLICY_HANDLES[handle]) {
    throw new Response('Not Found', {status: 404});
  }
  const {shop} = await context.storefront.query(POLICY_QUERY, {
    variables: {handle},
  });
  if (!shop) {
    throw new Response('Shop not found', {status: 500});
  }
  const policy = shop.policies.find((p) => p && p.handle === handle);
  return {
    handle,
    title: POLICY_HANDLES[handle],
    body: policy?.body ?? null,
    updatedAt: policy?.updatedAt ?? null,
  };
}
```

`POLICY_QUERY` (from the existing route, with one tweak — the
`updatedAt` field needs to be added):

```graphql
query Policy($handle: String!) {
  shop {
    policies: shopPolicies {
      handle
      title
      body
      updatedAt
    }
  }
}
```

Wait — the existing `POLICY_QUERY` in `policies.$handle.jsx` is:

```graphql
query Policy($handle: String!) {
  shop { policies: shopPolicies { body handle title } }
}
```

It already queries the right fields. We need to add `updatedAt`.

### `policies._index.jsx`

```js
export async function loader({context}) {
  const {shop} = await context.storefront.query(POLICIES_QUERY);
  return {
    shopPolicies: shop?.policies ?? [],
  };
}
```

`POLICIES_QUERY` already exists. We just need the meta and the
list view component.

## Draft policy copy

> ⚠️ **DRAFT — these are starting points, not legal advice.** A
> Canadian small-business lawyer would normally review and finalize
> these for $500-1500. Review before publishing.

### Shipping Policy

> # Shipping Policy
>
> **Where we ship.** Canada and the United States. We're not set
> up for international orders yet — if you're elsewhere and really
> want something, email us at hello@puchica.ca and we'll see what
> we can do.
>
> **How long it takes.** Most orders arrive in **10 to 20 business
> days** from the time you place your order. Business days =
> Monday to Friday, excluding holidays. We source products from
> suppliers around the world, and a small number of orders take
> longer due to customs processing or carrier delays — we'll always
> keep you posted.
>
> **Order processing.** Orders are processed within 1–2 business
> days. You'll get a confirmation email with your order details
> right away, and a shipping confirmation with a tracking link as
> soon as your order is on the move.
>
> **Tracking.** Every order gets a tracking link in the shipping
> confirmation email. If you don't see movement for 5+ business
> days, email us and we'll chase it down with the carrier.
>
> **Shipping costs.** Free standard shipping on orders over $50
> CAD. Below $50, flat $5.99 CAD. No surprise fees at checkout —
> what you see is what you pay.
>
> **Lost or stuck orders.** If tracking shows no movement for 14+
> business days, email us. We'll work with the carrier to find
> your order or send a replacement at no charge.
>
> **Address changes.** Reply to your order confirmation within 2
> hours of placing the order. After that the order is being
> prepared for shipment and we can't change the address — but
> returns are always free once it arrives.
>
> Last updated: 2026-06-15

### Refund Policy

> # Refund Policy
>
> **30-day return window.** You have **30 days from the day your
> order arrives** to start a return. After 30 days we can't offer
> a refund or exchange, but email us anyway and we'll see what we
> can do.
>
> **What can be returned.** Most items in new, unused condition.
> If your item arrived damaged, defective, or wrong, that's on us —
> we'll send a replacement or refund in full, and we'll cover the
> return shipping.
>
> **What can't be returned.** Items marked "Final Sale" on the
> product page. Perishable or hygiene-sensitive items (skincare,
> cosmetics, undergarments, earbuds) if the seal is broken. Gift
> cards.
>
> **How to start a return.** Email us at hello@puchica.ca with
> your order number. We'll send you a pre-paid return label — peel
> it off, repack the item, drop it at any post office. No printing
> required.
>
> **Refunds.** Once we receive your return, your refund is issued
> to the original payment method within 5–7 business days. We'll
> email you when the refund is on its way.
>
> **No restocking fees.** We don't charge a restocking fee on
> returns. The only thing you pay for is the time it takes to ship
> it back to us — and on defective items, even that is free.
>
> **Exchanges.** We don't do direct exchanges. The fastest way to
> "exchange" is to start a return and place a new order for the
> item you want.
>
> Last updated: 2026-06-15

### Terms of Service

> # Terms of Service
>
> **Who we are.** Puchica (puchica.ca) is a Canadian online store
> operated from Ontario. By using our website or buying from us
> you agree to these terms.
>
> **Shopping with us.** Prices are listed in Canadian dollars
> (CAD) and include any applicable taxes. We reserve the right to
> correct pricing errors — if a price is clearly wrong, we'll
> contact you before processing your order.
>
> **Order acceptance.** Placing an order is an offer to buy, not
> a binding sale. We accept your offer when your payment is
> processed and your order ships. We may decline an order if the
> item is out of stock, the price is wrong, the payment can't be
> verified, or the order looks like fraud.
>
> **Accounts.** You're responsible for keeping your account
> password secure. We can suspend or close accounts that abuse
> the site.
>
> **Intellectual property.** Everything on this site — photos,
> product descriptions, the Puchica logo, the site design — is
> owned by us or our suppliers. Don't copy it for commercial use
> without asking.
>
> **Liability.** Puchica is not liable for indirect, incidental,
> or consequential damages arising from your use of the site or
> our products. Our total liability for any claim is limited to
> the amount you paid for the product in question.
>
> **Disputes.** These terms are governed by the laws of Ontario,
> Canada. Any dispute is resolved in the courts of Ontario.
>
> **Changes.** We may update these terms occasionally. The "Last
> updated" date at the top will reflect the change. Continued use
> of the site after a change means you accept the new terms.
>
> **Contact.** Questions about these terms? Email hello@puchica.ca.
>
> Last updated: 2026-06-15

## Error handling

| Case | Behavior |
|---|---|
| `handle` is missing from the URL | Route doesn't match (parent route catches it) |
| `handle` not in the 4 known values | Throw 404 (caught by `$.jsx`) |
| `shop` is null (Storefront API error) | Throw 500 |
| `policy` is null (no policy with that handle in Shopify) | Render empty state |
| `policy.body` is empty string | Render empty state |
| `policy.body` is non-empty HTML | Render with `dangerouslySetInnerHTML` |
| Shopify returns malformed HTML | Render as-is — we trust Shopify's output |

The empty state never throws. A 200 with a "this policy isn't
published yet" message is friendlier than a 404 — the URL is
reserved and the page tells the visitor why.

## Testing

Hydrogen has no test framework wired in this project (no Jest,
no Vitest, no Playwright config). The verification strategy for
this work:

1. **Manual smoke test in dev**: `npm run dev`, navigate to each
   of the 4 policy URLs, confirm the page renders.
2. **Headless Chrome screenshot**: take screenshots at desktop
   (1280x900), tablet (768x1024), and mobile (390x844) widths to
   confirm responsive layout.
3. **Shopify integration test**: create stub policy bodies in
   Shopify admin (or in a test store), confirm the Storefront
   API returns them, confirm the Hydrogen route renders them.
4. **Build verification**: `npm run build` and `npm run lint`
   pass clean.
5. **Deploy verification**: after `npx shopify hydrogen deploy`,
   confirm the policy pages render on `puchica.ca`.

Adding a test framework is a separate spec.

## Open questions

- **Privacy Policy**: the memory says the Horizon theme has one.
  Does it need to be re-copied into Shopify admin for the
  Hydrogen storefront to query it? Or is it already there?
- **The 10-20 business day shipping time**: this is the honest
  answer. Will the marketing team want a different (shorter) number
  for ads and product pages, separate from the policy number?
- **Return label logistics**: the Refund Policy promises a
  "pre-paid return label — peel it off, repack the item". This
  implies the label is already in the box. Is that actually
  true, or is the email a PDF the customer prints? If it's an
  email, the policy needs to say "we'll email you a return label
  you can print".
- **Restocking fee**: confirmed "no restocking fee" in this
  brainstorm. Confirm this is the long-term position, not a
  launch promotion.

## Critical issues / risks

- **These drafts are not legal advice.** A lawyer should review
  before the policies go live. The drafts are reasonable starting
  points based on standard e-commerce practice but they are not
  reviewed for Ontario consumer law (Consumer Protection Act, 2002),
  the federal Competition Act (advertising and "ordinary selling
  price" claims), or US state-level sales-and-use tax (CA + US
  shipping). Factor in $500-1500 for legal review.
- **The 30-day / no restocking fee position is generous for a
  dropshipper.** If return rate is high (typical dropshipping
  return rate is 15-30%), this is a meaningful cost. Watch the
  return rate after launch and tighten if needed.
- **The 10-20 business day shipping time hurts conversion.** This
  is the honest answer. The aggressive version is 7-14 with a
  refund-if-late guarantee, but that means refunding a lot of
  orders. The honest version means losing some sales to faster-
  shipping competitors. There is no good answer; the policy
  reflects a deliberate choice to be honest.
