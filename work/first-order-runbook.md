# The first real order — what to do, in order

Written 2026-09-22, before any real order exists. Nothing here is automatic: DSers syncs the
order and attaches the mapped supplier variant, but **it never places or pays for the supplier
order**. That is you, by hand, in DSers → Open Orders → AliExpress.

Budget about 15 minutes for the first one, 3 minutes for later ones.

---

## 0. Confirm it is real

Shopify → Orders. A real order has **no "Test" badge** and no "Your payment gateway was in test
mode" notice. (Order #1003 from 2026-09-20 is a test — leave it alone, or cancel and archive it
once DSers releases the fulfilment.)

Check the shipping address is in Canada. The store sells Canada-only: the U.S. market is a
draft and the only delivery zone is Canada, so anything else means something is misconfigured —
stop and look before fulfilling.

## 1. Read the order

- Which product and which variant.
- Total paid, and that the payment shows **Paid** (Shopify Payments, daily payout to the
  Scotiabank account).
- Whether they left a note.

## 2. Place the supplier order in DSers

DSers → **Open Orders** → *Awaiting order*. The order appears within a few minutes of Shopify.

1. **Fix the mapping if DSers asks.** As of 2026-09-20 DSers flags the globe pendant line with
   *"Variant deleted or value-changed on Shopify. Click the Mapping button…"* — a leftover from
   the option-value renames on the 17th–18th. Click **Mapping**, confirm the supplier variant
   (the one whose cost matches the band in `docs/supply-structure-and-duty.md`), save. This is a
   one-time fix per product.
2. **Choose a shipping method.** DSers will not let you order without one and does not pick a
   default. Choose the cheapest tracked option to Canada — usually AliExpress Standard Shipping.
   Note the quoted delivery window; it should land inside the 10–21 days the site promises.
3. **Check the cost.** Landed cost should be inside CA$16–34 for the pendants and sconces. If it
   is far outside, the supplier changed the price — do not order, check the band first.
4. **ORDER**, then pay on AliExpress. Pay with the card you use for the business so the cost is
   traceable.

After paying, the DSers card moves *Awaiting order → Awaiting payment → Awaiting shipment*.

### What the DSers tabs mean

| Tab | Means |
|---|---|
| Awaiting order | Shopify sent it; you have not ordered from the supplier yet |
| Awaiting payment | Ordered on AliExpress, not paid |
| Awaiting shipment | Paid; supplier has not dispatched |
| Awaiting fulfillment | Supplier dispatched; tracking is syncing back to Shopify |
| Fulfilled | Tracking is on the Shopify order and the customer has been emailed |

## 3. Get tracking back to the customer within 24 h

On the **Basic** DSers plan the tracking-number sync window is **7 days**, not 14, and the
monitor scans every 24–36 h. So: check DSers the day after the supplier marks it shipped. If the
tracking number has not reached Shopify by then, copy it from AliExpress and add it by hand —
Shopify → the order → **Add tracking** — which also sends the shipping-confirmation email.

Nothing else emails the customer about shipping. The Klaviyo flows only cover the welcome
sequence and abandoned checkout.

## 4. After delivery

- **Judge.me** sends the review request automatically once the order is fulfilled and the
  delivery window passes. It has zero reviews today, so the first one matters more than the next
  twenty — it is the thing every other visitor is looking for.
- If the product is one of the **arm sconces (products 18–20)**, ask the customer whether it
  worked on a normal Canadian 120 V circuit. The supplier labels them 220 V while the listing
  says 90–260 V, and that has never been verified on a real unit. Their answer settles it. If it
  does not work, pull those three products before anything else is spent on ads.

## 5. Watch the numbers land

Within an hour the order should appear as:

- **Shopify**: orders 1, and the session shows in `FROM sessions … sessions_that_completed_checkout`.
- **GA4** (G-KTMM6KWWT6): a `purchase` key event.
- **Meta** Events Manager, pixel 996669459615534: a **Purchase** row. This is the one event
  never verified end to end (Shopify does not forward test orders), so check it — if Purchase is
  missing an hour after a real order, the checkout-side integration needs looking at before any
  ad optimises on it.

Record the week in `work/baseline/<date>.md`.

## If something goes wrong

- **Supplier cancels or is out of stock.** DSers shows the AliExpress order as closed. Re-map to
  another supplier variant or product (My Products → Mapping), or refund the customer in Shopify
  and email them — be direct about the delay; a refund on day two costs less than a bad first
  review.
- **Customer emails.** `hello@puchica.ca` forwards to you. The site promises a reply within one
  business day.
- **You need to cancel a Shopify order that DSers already accepted.** Shopify hides *Cancel
  order* until the fulfilment is released: the order's ⋯ menu → **Request cancellation** first,
  wait for DSers to accept, then cancel.
- **Flip DSers back to Advanced** the week ads start — Basic has no supplier stock auto-sync, so
  a sold-out supplier keeps selling on the site.
