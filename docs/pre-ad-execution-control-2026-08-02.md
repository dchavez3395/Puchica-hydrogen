# Puchica pre-ad execution control — 2026-08-02

## Authority, scope, and current decision

This is the single operational control for work required before Puchica spends
money on advertising. It reconciles the older launch, market, measurement,
supplier, and customer-trust notes. Those files remain evidence records, but
this file controls when a status, cap, or instruction conflicts.

**Current decision: `PAID_HOLD`.**

- Canada and United States storefront pages may remain accessible for QA.
- Organic/no-spend content work may continue, but this is not authorization to
  solicit or complete customer orders while mandatory Gate 0 disclosures fail.
- This document authorizes no ad, campaign, budget, order, purchase, auto-pay
  setting, refund, supplier charge, or live Admin change.
- A sample is not required for the zero-spend gates. Launching without one
  makes the first genuine customer order a manually monitored product and
  fulfillment proof; it does not permit quality claims.
- The first paid offer is **not selected**. The former Red 5-Piece Compression
  Packing Cube lead is rejected because its mapped supplier has no Canadian
  route, and the first replacement lead was a three-piece product mismatch.
- The current all-hands product review is consolidated in
  `docs/all-hands-hero-product-shortlist-2026-08-02.md`. No candidate has passed
  the exact-SKU, differentiation, worse-market economics, and IP gates.
- The follow-up risk pass still prioritizes a neutral six-piece true-compression
  travel set, but AliExpress item `1005007604243742` is rejected. Owner-supplied
  evidence showed C$34.55 as an explicit welcome-only price and C$73.52 crossed
  out; the welcome price is not repeat-order economics and already exceeds the
  landed-cost target before unknown costs. The search is reopened.
- DSers remains the current installed supplier-validation platform. Do not add
  AutoDS during this proof cycle. The subsequent sourcing-pivot decision in
  `docs/sourcing-pivot-decision-2026-08-02.md` records the owner-authorized free
  Shopify Collective installation and Canada Discovery audit. No supplier is
  connected and no product is imported. Free DropCommerce and Syncee catalog
  audits remain fallbacks only.

Paid activation requires every P0 gate below to pass and a new, explicit owner
approval of the exact market, creative set, daily cap, and total cap. Previous
general approvals do not authorize spend.

## Reconciled evidence status

| Workstream | Status | Verified | Not yet verified |
| --- | --- | --- | --- |
| Markets | PASS for availability | Canada/CAD and U.S./USD storefront contexts and checkout handoff | Supplier delivery to each address |
| Lead product | REOPENED | The packing-cube supplier and first replacement were rejected with evidence | Select a new exact product that passes Canada and U.S. fulfillment, margin, quality-risk, and creative gates |
| Canada checkout | PARTIAL PASS | No-payment Manitoba Shopify checkout showed CA$7.99 shipping | Supplier quotes to Manitoba and Ontario |
| U.S. checkout | PARTIAL PASS | U.S. market and checkout available | Supplier quotes to ZIP 10001 and ZIP 90001 |
| GA4 | PASS for pre-purchase | Production `view_item`, `add_to_cart`, checkout, and page-view evidence | Fresh Purchase and UTM persistence |
| Meta | HOLD | Shopify integration and historical events | Fresh Test Events, Purchase, CAPI/deduplication acceptance |
| Privacy policy | PARTIAL | Owner converted Shopify Admin from the automated template to the reviewed manual static policy on August 2, 2026 | Deploy and live-verify the no-cache/raw-template safeguard; designate a privacy official; complete seller disclosures and consent review |
| Shipping policy | PARTIAL / LIVE_VERIFIED | Owner published the reviewed replacement on August 2, 2026; “no surprise fees” was removed; explicit customer-paid duties, brokerage, and destination-charge wording was saved and verified on the public route | Add evidence-supported delivery date/method and refused-delivery treatment |
| Refund policy | PASS / LIVE_VERIFIED | Owner approved the operating model; reviewed replacement was saved in Shopify Admin and live-verified on August 2, 2026; Shopify's separate self-serve return window was aligned from 14 to 30 days | Support must still authorize the method and destination or no-return resolution for each case before instructing a customer to ship |
| Economics | HOLD | Provisional U.S. item and country-level shipping costs | Address-level costs, actual fees, duties, handling, apps, reserve |
| DSers operations | HOLD | DSers selected; auto-pay not approved | Exact mapping, sync, duplicate prevention, tracking, notifications |
| Creative | HOLD | Review concepts and source-faithful draft | Final exact-product accessible creative set |
| Paid media | BLOCKED | No spend authorized | All P0 gates and explicit owner approval |

### Greenfield product decision

Puchica is committed to the small-space organization niche, not to any current
SKU. Existing products have no preference over new products. Product discovery
must start with customer problem, dual-market route, normal-price margin and
quality risk; storefront redesign and creative production follow only after an
exact product passes those gates. See
`docs/greenfield-product-discovery-sprint-2026-08-02.md`.

Authenticated DSers screening on August 2 produced the first viable replacement
category: accordion document organizers. Item `1005010145905527` (zippered,
13-pocket A4) and item `1005010531361199` (labeled multi-compartment A4) both
showed AliExpress Selection Standard routes to Canada and the United States.
They remain secondary candidates. A later visual supplier screen temporarily
advanced a four-piece magnetic refrigerator-rack concept, but exact-title
follow-up showed that the attractive low-cost rows were not proven to be the
four-piece option. Explicit multi-piece listings ranged as high as US$75–93.
That concept is downgraded to `VARIANT_MISMATCH_RISK`; the paid-acquisition lead
is reopened. No product is selected and no import, mapping, order or payment
was made. See
`docs/hero-product-screening-2026-08-02.md` and
`docs/greenfield-supplier-evidence-2026-08-02.md`.

A subsequent explicit-bundle screen rejected a 25-piece drawer organizer for
mass-market price pressure and a 12-box shoe-storage set for excessive landed
cost. Four linen/sheet boxes remain a conditional organic merchandising lead,
not a paid hero, because the cheapest DSers rows do not expose exact pack count
and the US$29.99–33.49 retail band leaves insufficient absolute contribution.
See `docs/bundle-product-screen-2026-08-02.md`.

A subsequent differentiated-product screen rejected a modular pegboard system
for excessive shipping, a fold-away wall hamper for a collapsed public price
ceiling despite usable Canada/U.S. routes, and an expandable microwave shelf
because supplier cost met or exceeded current mass-market retail. No product
advanced and no import or commercial action occurred. See
`docs/differentiated-product-screen-2026-08-02.md`.

## P0 gate 0 — mandatory Manitoba seller disclosures

Puchica is operated from Manitoba, so the Internet Agreements Regulation is a
release gate for ordinary online sales, not only advertising. Before entering
an internet agreement, the seller must disclose the seller and trade names,
business and mailing addresses, phone/email, a fair product description,
warranty information, itemized price and charges, total and currency, payment
terms, delivery date and arrangements, geographic restrictions, refund/
cancellation terms, and personal/financial-information protections.

Official sources:

- [Manitoba Internet Agreements Regulation, M.R. 176/2000](https://web2.gov.mb.ca/laws/regs/current/176-2000.php?lang=en)
- [Manitoba Consumer Protection Office — Consumer Protection Act overview](https://www.gov.mb.ca/cca/MobilePages/cpo/acts/cpa.html)

Required owner inputs, none of which may be invented:

- [ ] Legal seller name and, if different, the `Puchica` trade name.
- [ ] Current business address.
- [ ] Current mailing address if different.
- [ ] Customer-service phone number.
- [ ] `hello@puchica.ca` confirmed as the monitored customer-service email.
- [ ] Designated privacy official name or public-facing title and contact path.
- [ ] Evidence-supported delivery date/range and delivery method for each
      approved market/route, disclosed before the order becomes binding.
- [ ] Complete cancellation, exchange, refund, duty, brokerage, destination-
      charge, and refused-delivery decisions.

**Prohibited address:** `R2P 2X1` is a former address and must never be used as
a Puchica business, mailing, privacy, return, quote-recipient, or shipping
address. Do not publish it, place an order to it, or use it to imply current
operations.

Gate 0 passes only after the owner supplies and approves the real information,
the disclosures are visible before payment, the order/confirmation retains the
required terms, and a no-payment review verifies them. Legal counsel should
review the implementation; this control is not legal advice.

## P0 gate 1 — publish accurate customer policies

These drafts are operational copy, not legal advice. They avoid unknown
addresses, unsupported guarantees, and raw Shopify Liquid. The Privacy and
Shipping drafts were published manually in Shopify Admin on August 2, 2026.
The owner approved the Refund operating model and the reviewed replacement was
saved in Shopify Admin on August 2, 2026. The public storefront initially served
the superseded July 15 policy, then propagated the replacement; the August 2
body was live-verified with the approved return-shipping language and no old
date. Shopify's separate self-serve return rule was also changed from 14 to 30
days and saved successfully. Each policy must continue to be
served through the deployed storefront, be cache-current, contain no template
code, agree with checkout/operations, and include the Gate 0 disclosures.

### Recorded Admin action and current gate

| Policy | Admin action | Current gate | Required to pass |
| --- | --- | --- | --- |
| Privacy | Automated Shopify policy replaced with reviewed manual static policy on August 2 | PARTIAL | Deploy and verify the raw-Liquid fallback/no-cache behavior; add designated privacy official and required seller contact; verify consent/data disclosures |
| Shipping | Reviewed replacement published on August 2; customer duty responsibility decided August 2 | PARTIAL | Publish/verify customer-paid destination-charge wording; add evidence-supported delivery date/method and refused-delivery treatment |
| Refund | Reviewed replacement saved in Shopify Admin; public route and approved language live-verified; self-serve return window aligned to 30 days on August 2 | PASS | Maintain the contact-first, case-specific destination/no-return operating control; never direct a customer to an unapproved address |

### Privacy Policy — paste-ready replacement

```text
Privacy Policy

Last updated: August 2, 2026

This Privacy Policy describes how Puchica ("Puchica," "we," "us," or "our") collects, uses, and shares personal information when you visit puchica.ca, make a purchase, contact us, or otherwise use our online store.

Information we collect

Depending on how you use the store, we may collect:

• Contact information, such as your name, email address, phone number, and billing or shipping address.
• Order information, such as the products you purchase, order value, currency, discounts, shipping method, and order status.
• Payment-related information. Payments are processed by Shopify and its payment providers. Puchica does not receive your full payment-card number.
• Device and usage information, such as IP address, browser type, device type, pages viewed, referring page, and interactions with the store.
• Communications and support information that you provide when you contact us.

How we use information

We use personal information to:

• provide the store and process, fulfill, deliver, support, cancel, return, or refund orders;
• communicate about orders, shipping, service updates, and support requests;
• prevent fraud, misuse, security incidents, and unauthorized transactions;
• maintain, measure, troubleshoot, and improve the store and customer experience;
• comply with legal, tax, accounting, and regulatory obligations; and
• provide marketing or advertising where permitted and in accordance with your choices.

How we share information

We share personal information only as reasonably needed to operate the store, including with Shopify, payment processors, suppliers and fulfillment partners, delivery carriers, customer-support providers, analytics or advertising providers enabled for the store, professional advisers, and authorities where required by law.

Our service providers may process information in Canada, the United States, or other countries. Information processed in another country may be subject to the laws of that country.

Cookies and similar technologies

The store and its service providers use cookies and similar technologies for essential store functions, security, preferences, measurement, and, where enabled and permitted, marketing. The choices available to you depend on your location, browser, device, and the consent controls presented on the store. Blocking some cookies may affect store functionality.

Retention

We retain personal information only for as long as reasonably necessary for the purposes described in this policy, including order support, fraud prevention, legal, tax, accounting, dispute, and record-keeping requirements. Retention periods vary by the information and applicable obligation.

Your choices and rights

Depending on where you live, you may have rights to request access to, correction of, deletion of, or a copy of personal information, or to object to or restrict certain processing. You may also withdraw marketing consent or use available cookie and privacy controls. These rights may be subject to legal exceptions and identity verification.

To make a privacy request, email hello@puchica.ca. Please describe the request and the country or region where you live. We may ask for information needed to verify your identity and protect your account or order information.

Children

The store is intended for adults and is not directed to children. We do not knowingly collect personal information from children in violation of applicable law. A parent or guardian who believes a child provided personal information may contact us.

Third-party links

The store may link to websites or services operated by others. Their privacy practices are governed by their own policies, and Puchica is not responsible for those practices.

Security

We use reasonable administrative and technical safeguards appropriate to an online store. No method of transmission or storage is completely secure, so absolute security cannot be guaranteed.

Changes to this policy

We may update this policy to reflect operational, legal, or service changes. The updated version will be posted with a revised "Last updated" date.

Contact

Questions or privacy requests can be sent to hello@puchica.ca.
```

Publication checks:

- [ ] No Shopify template variable, conditional tag, bracketed placeholder, or
      template comment is visible.
- [ ] The live policy identifies Puchica, `puchica.ca`, and
      `hello@puchica.ca`.
- [ ] Enabled analytics/advertising providers agree with the consent experience.
- [ ] The designated privacy official and owner-approved Gate 0 contact details
      are present.
- [ ] The page is checked in each indexed storefront language.
- [ ] The deployed storefront serves the manual policy rather than raw Liquid;
      the no-cache/fallback safeguard is verified after deployment.

### Shipping Policy — paste-ready replacement

```text
Shipping Policy

Last updated: August 2, 2026

Where we ship

Puchica currently offers checkout for eligible orders and addresses in Canada and the United States. Availability can vary by product, cart, and destination. An available country or market does not guarantee that every product can be delivered to every address.

Shipping options and estimates

Enter your delivery address at checkout to see the shipping methods, charges collected at checkout, and available delivery estimates for that cart and destination. Delivery estimates are estimates rather than guaranteed arrival dates. Carrier, customs, weather, address, and other delays can affect delivery.

Fulfillment

Orders may be fulfilled by third-party supply partners and may ship from locations outside Canada or the United States. Items in one order may arrive separately. We use the contact information on the order for fulfillment and service updates.

Taxes, duties, and destination charges

Taxes and shipping charges collected by Shopify are shown before payment. The customer is responsible for duties, import charges, brokerage, or other destination-specific charges that are not collected at checkout. These charges may be assessed separately by the carrier or destination authority where permitted by law. Contact hello@puchica.ca before ordering if you need help understanding the checkout presentation.

Tracking

When the selected shipping service provides tracking, tracking information is sent after the supplier or carrier issues it. Tracking can take time to show the first carrier scan.

Address changes and cancellations

Contact hello@puchica.ca as soon as possible if an address is incorrect or you want to request a cancellation. We cannot guarantee a change or cancellation after fulfillment has started.

Delays, missing orders, or damage

If an order is materially late compared with the estimate shown at checkout, tracking has not updated for an unusual period, or the parcel arrives damaged, email hello@puchica.ca with the order number and relevant photos or tracking details. We will review the order, carrier, and supplier information and explain the available resolution.
```

### Refund Policy — paste-ready replacement

```text
Refund and Return Policy

Last updated: August 2, 2026

Request window

Contact hello@puchica.ca within 30 days after delivery to request an eligible return. Include the order number, the item, the reason for the request, and photos when the item is damaged, defective, or incorrect.

Do not mail an item until Puchica confirms eligibility and sends return instructions. The return destination may differ from the address on the parcel. Items sent without authorization or to an unapproved address may not be received or credited.

Eligibility

For a change-of-mind return, the item must be unused, in the condition received, and include its original packaging and included parts. Proof of purchase is required. Gift cards and items identified as final sale cannot be returned except where required by law.

Change-of-mind return shipping

For an approved change-of-mind return, the customer is responsible for the return-shipping cost and for using the return method provided in the authorization, except where applicable law requires otherwise. Original shipping charges are not refundable unless required by law or Puchica confirms an exception in writing.

Damaged, defective, or incorrect items

Contact us promptly with photos of the product, packaging, and shipping label. If Puchica confirms that the item arrived damaged, defective, or incorrect, Puchica will provide the approved resolution. If Puchica requires an authorized return for a confirmed issue, Puchica will pay or reimburse the approved return-shipping cost. Depending on the circumstances, the resolution may be a replacement, refund, partial refund, or instructions for an authorized return. Do not discard or ship the item until instructed.

Review and approval

Puchica will tell you whether a return is required. If it is, we will provide the approved return method and destination for that case. Some confirmed issues may be resolved without requiring the item to be returned. Do not ship the item to the address on the parcel unless Puchica specifically authorizes that destination.

After an authorized return is received, when a return is required, we inspect it and notify you whether the refund is approved. Puchica may request additional information reasonably needed to verify an order or claim. This policy does not limit rights that cannot be excluded under applicable law.

Refund timing

Approved refunds are issued to the original payment method. After Puchica submits a refund, the bank or payment provider may require additional processing time before the credit appears. Shipping, bank, currency-conversion, or other third-party charges are refunded only where this policy or applicable law requires it.

Cancellations

Contact hello@puchica.ca as soon as possible to request a cancellation. A cancellation cannot be guaranteed after fulfillment has started. If an order has already shipped, the applicable return process will apply.

Contact

For a return, refund, cancellation, or order problem, email hello@puchica.ca with the order number and relevant details.
```

Policy operations before publication:

- Owner accepts that customers pay approved change-of-mind return shipping and
  Puchica covers authorized damaged/defective/incorrect return shipping.
- Operations documents a real per-case return destination or no-return
  resolution. It need not be published, but support must have it before
  authorizing a return.
- Never direct a customer to a supplier or parcel-sender address unless that
  exact destination is approved for the return.
- Storefront summaries use “Start eligible returns within 30 days,” not an
  unconditional “30-day returns” promise.
- Until the Refund replacement is published, remove or suppress every
  “30-day returns” marketing claim; an unpublished draft is not a customer term.

Privacy accountability and behavioural-advertising sources:

- [Office of the Privacy Commissioner of Canada — Accountability](https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/p_principle/principles/p_accountability/)
- [OPC — Guidelines on privacy and online behavioural advertising](https://www.priv.gc.ca/en/privacy-topics/technology/online-privacy-tracking-cookies/tracking-and-ads/gl_ba_1112/)

The privacy gate does not pass until the owner designates a privacy official,
the live policy tells customers how to reach that role, and the consent system
is verified against the Meta/Google tracking actually enabled.

## P0 gate 2 — destination quote evidence

### Core launch market rule

Puchica's initial catalog standard is **dual-market fulfillment**: an advertised
or featured product must have a current, tracked, profitable route for the exact
SKU in both Canada and the United States. A route that works in only one country
does not qualify as a core launch product. Exclude or remap it; do not rely on
country detection to conceal an operationally weak assortment.

Spanish storefront copy is localization capability, not evidence that a market
is open. Mexico, Spain, and each future Latin American country remain disabled
for promotion until their own checkout, currency, supplier route, delivery,
duty/tax, return, policy, support, and margin gates pass.

Country-level Supplier Optimizer results are preflight evidence, not an
address-level promise. No order or payment is required to complete this matrix.
Use the exact mapped red five-piece option and ordinary supplier pricing.

| Market | Destination | Shopify evidence | DSers country evidence | Exact supplier quote | Tracking/service | Gate |
| --- | --- | --- | --- | --- | --- | --- |
| US | ZIP 10001 | Market available; row incomplete | US$20.39 item + US$1.99 Selection Standard; country-level; six-day estimate | Missing | Missing | HOLD |
| US | ZIP 90001 | Market available; row incomplete | Same country-level record | Missing | Missing | HOLD |
| CA | Owner-approved Manitoba postal code | Prior public-address checkout showed CA$7.99 customer shipping | US$20.62 item + US$1.99 estimated shipping; country-level; seven-day estimate | Missing | Missing | HOLD |
| CA | Owner-approved Ontario postal code | Not captured | Same country-level record | Missing | Missing | HOLD |

### Exact mapped-SKU Shipping info refresh — 2026-08-02

At `2026-08-02T18:50:26Z`, authenticated DSers **My Products → Shipping info**
was checked without creating an order or entering recipient data. The selected
supplier SKU was `5PCS Set Red` on supplier item `1005008568050448`.

| Market | DSers destination scope | Exact-SKU route | Result |
| --- | --- | --- | --- |
| Canada | Country only | `No Shipping` | Canada paid and organic promotion HOLD for this offer |
| United States | Country only | AliExpress Selection Standard; CN origin; free shipping; 7–12 days; tracking available | Preflight only; two-ZIP evidence still blocked |

DSers exposes no city, postal-code, or ZIP input in this tool. Winnipeg and
Toronto therefore share the failed Canada result, while ZIP 10001 and ZIP 90001
cannot be distinguished. Record the U.S. rows as `ADDRESS_LEVEL_QUOTE_BLOCKED`,
not as passed quotes. The My Products card displayed supplier stock `1,023`
and a US$4.38–20.39 item-cost range; the exact red-set item price remains
unproven. No paid activation is authorized.

### Dual-market replacement search — 2026-08-02

Authenticated DSers Supplier Optimizer identified AliExpress item
`1005005283270949` as the strongest current established-sales shortlist lead.
It displayed US$11.22–13.04 plus US$1.99 AliExpress Selection Standard shipping
and seven displayed days for both Canada and the United States, with 194 sales
and 4.7 / 4.7 / 4.8 / 4.8 supplier signals. DSers warns that optimizer data may
be incorrect, so this is not a passed quote.

The exact red five-piece variant, price, stock and destination-level route could
not be proven without direct listing inspection, which the browser security
policy blocked. No bypass, import, remap, order, or payment was attempted. Keep
the candidate `SHORTLIST_PENDING_VARIANT_PROOF`; see
`docs/dual-market-packing-cube-supplier-shortlist-2026-08-02.md`.

For each destination record the timestamp, evidence link, Shopify variant,
DSers/supplier IDs, mapped option/SKU, destination postal code without excess
personal data, ordinary item price, shipping, currency, ship-from, stock,
service, dispatch/delivery ranges, tracking, checkout price/discount/shipping/
tax/currency, and every duty, import, app, handling, and packaging cost.

Refresh quotes within seven days of an activation review. PASS requires the
exact option, usable tracked service, and all costs. A blank cost, different
option, untracked route, promotional new-buyer price, or `No Shipping` fails.

### 2026-08-02 authenticated Supplier Optimizer refresh

Read-only DSers evidence was captured from the Supplier Optimizer for the
Shopify image currently associated with the packing-cube workflow. No product
was imported, mapped, ordered, or paid for. DSers itself displayed a warning
that the optimizer is being adjusted and some data may be incorrect, so these
rows are comparison leads rather than an approved supplier quote.

| Market | Candidate item range | Shipping method | Country-level shipping | Displayed delivery days | Result |
| --- | ---: | --- | ---: | ---: | --- |
| US | US$13.74-US$15.60 | AliExpress Selection Standard | US$1.99 | 6 | LEAD ONLY |
| US | US$11.22-US$13.04 | AliExpress Selection Standard | US$1.99 | 7 | LEAD ONLY |
| CA | US$13.74-US$15.60 | AliExpress Selection Standard | US$2.16 | 7 | LEAD ONLY |
| CA | US$11.22-US$13.04 | AliExpress Selection Standard | US$1.99 | 7 | LEAD ONLY |

The search also returned zero-sale and weak-history candidates, and results
changed across image-analysis refreshes. Do not select the cheapest row. The
next evidence step is to open the strongest established candidate, prove the
exact red 5PCS option/SKU and current stock, then capture destination-specific
checkout quotes for approved non-personal CA/US postal codes. The gate remains
HOLD until that evidence reconciles with the older US$20.39/US$20.62 records.

## P0 gate 3 — DSers first-order SOP

This applies to the first genuine customer order if the owner proceeds without
a sample. It does not authorize an order or supplier charge.

Before activation:

- [ ] DSers is the sole automation owner for variant `49961853026554`.
- [ ] Capture exact Shopify option → supplier option/SKU mapping.
- [ ] Keep auto-order and auto-pay disabled.
- [ ] Verify no duplicate/open record related to Shopify order #1001.
- [ ] Verify supplier/route still match the quote matrix.
- [ ] Assign daily Shopify, DSers, support, and tracking monitoring.
- [ ] Prepare messages for receipt, tracking delay, route failure, material
      delay, damage/wrong item, cancellation, and refund.

When the first genuine order arrives:

1. Pause the campaign immediately; do not accumulate unproven orders.
2. Record Shopify order ID, variant, quantity, destination region, merchandise,
   discount, shipping, tax, total, currency, and payment status.
3. Confirm exactly one matching DSers order. Never recreate an absent record
   before diagnosing sync; this prevents duplicates.
4. Compare DSers supplier option/SKU and destination with the approved mapping.
5. Refresh supplier charge and tracked service. Stop on any unknown or change.
6. Present the owner with Shopify/DSers IDs, option, destination, service,
   supplier charge, quote variance, and charge ceiling.
7. Only the owner may approve and submit supplier payment. Keep auto-pay off.
8. Record supplier order ID, charge, currency, service, and promised range.
9. Require real carrier acceptance; a label-only number is not shipment proof.
10. Confirm one tracking sync, one Shopify fulfillment, and no duplicate notice.
11. Monitor through delivery and proactively handle a material delay.
12. Record actual cost, timing, issue/refund, defect, and contribution before
    deciding whether the campaign may resume.

Immediate stops: mismatch; duplicate; unapproved charge; untracked service;
supplier charge over quote by more than 5%; materially worse delivery estimate;
damage/defect/complaint; missing/duplicate/wrong-currency Purchase; or actual
contribution below 30%. The first five genuine orders remain manual review.

## P0 gate 4 — SKU economics

Complete one row per exact variant and market in one currency. Unknown is not
zero.

Detailed price benchmarking, authenticated DSers evidence, margin sensitivity,
all-in cost ceilings, and customs/fee controls are maintained in
[`unit-economics-price-control-2026-08-02.md`](./unit-economics-price-control-2026-08-02.md).
That file is subordinate to this release gate but is the current economics
worksheet for activation decisions.

| Field | U.S. red 5PCS evidence | Canada red 5PCS evidence |
| --- | ---: | ---: |
| Merchandise price | US$52.00 | CA$71.45 |
| Promotion | Not approved | Not approved |
| Payment fee | Shopify Basic base rate 2.8% + CA$0.30 verified; U.S. conversion/payout treatment missing | Shopify Basic 2.8% + CA$0.30 online verified |
| Item cost | US$20.39 country-level | CA$28.93 equivalent country-level |
| Destination shipping | US$1.99 country-level only | Approx. CA$2.79 equivalent, country-level only |
| Duties/brokerage/import | Customer pays charges not collected at checkout; refusal/return exposure missing | Customer pays charges not collected at checkout; refusal/return exposure missing |
| Automation/order charge | DSers Basic verified free; supplier/order charges still verify | DSers Basic verified free; supplier/order charges still verify |
| Handling/packaging | Missing | Missing |
| App allocation | Shopify CA$49/month after Sept. 12; Judge.me verified on Forever Free after August 2 downgrade; allocation missing | Same |
| Return/refund reserve | Use 15% planning case pending evidence | Use 15% planning case pending evidence |
| Customer shipping retained | Exclude until proven | Exclude CA$7.99 until net treatment proven |
| Status | HOLD | HOLD |

Authenticated Shopify Admin verification on August 2 confirmed that Shopify
Payments is accepting payments and payouts, the payout account is CAD, PayPal
Express is active, and the Basic plan's online card rate is 2.8% + CA$0.30.
The plan is CA$1/month until September 12, then displays CA$49/month. Judge.me's
Awesome plan was downgraded successfully to Forever Free on August 2; its
scheduled US$15 August 7 charge was cancelled while the app remained installed.
DSers is on its free Basic plan. U.S. currency conversion, payout, PayPal,
refund, and chargeback treatment remain missing, so the economics gate remains
HOLD.

```text
R = merchandise price × (1 - promotion rate)
F = (R × payment percentage) + fixed payment fee
L = item cost + supplier shipping + duties/brokerage/import charges
    + automation/order charge + handling + packaging + app allocation
Q = R × refund/return reserve rate
C = R - F - L - Q
pre-ad contribution margin = C / R
break-even CAC = C
initial target CAC = 0.70 × C
```

At current provisional U.S. assumptions, a 15% reserve produces about US$20.01
contribution, 38.5% margin, and a US$14.01 target CAC before unknown duties,
handling, packaging, automation, or app costs. This is not a passed row.

The August 2 market benchmark places a credible lead-offer band near
US$47–49 / CA$66–69. At US$49, the provisional full-price margin is about
35.9% before unknowns under the verified base card rate; applying 15% off
reduces it to about 27.7%. At the current Canadian price, 15% off produces about
29.5%. `FIRST15` was verified expired/inactive in Shopify Admin with zero
recorded uses on August 2, 2026. This P0 margin leak is closed; it must not be
reactivated or replaced unless exact landed costs prove the discounted offer
still clears the gate.

PASS requires every cost, at least 30% worse-destination contribution, any live
promotion still clearing 30%, a daily cap no greater than 70% of evidenced
contribution, and owner review of fulfillment/refund/dispute cash exposure.

## P0 gate 5 — analytics proof

Ownership stays explicit: Shopify Facebook & Instagram owns Meta; custom Meta
stays disabled; Shopify Google owns page view and checkout; the scoped custom
GA4 bridge owns only `view_item` and `add_to_cart`.

| Check | Required evidence | Status |
| --- | --- | --- |
| GA4 `view_item` | Exact variant/value/currency; one event | PASS |
| GA4 `add_to_cart` | Exact variant/value/currency; one per action | PASS |
| GA4 checkout/page view | Production Realtime | PASS |
| GA4 Purchase | Correct transaction/value/currency; no duplicate | HOLD |
| Meta PageView | Fresh production Test Events | HOLD |
| Meta ViewContent | Exact variant/value/currency; one event | HOLD |
| Meta AddToCart | Exact variant/value/currency; one event | HOLD |
| Meta InitiateCheckout | Correct value/currency; one event | HOLD |
| Meta Purchase | Correct order/value/currency after deduplication | HOLD |
| Meta CAPI quality | Diagnostic fixed or capped-test risk accepted | HOLD |
| Attribution | UTMs persist through checkout/order | HOLD |
| Consent | Canada/U.S. behavior documented/tested | HOLD |
| Test exclusion | Internal traffic excluded from decisions | HOLD |

No purchase is needed to repair pre-purchase events. Purchase may be proven by
the first genuine controlled order or a separately authorized test. A missing
or duplicate Purchase after the first order is an immediate paid pause.

```text
utm_source=meta
utm_medium=paid_social
utm_campaign={market}_packing_cubes_sales_t01
utm_content={angle}_{hook}_{format}_{version}
utm_term=broad
```

## Final go/no-go control

**Organic/no-spend content work: GO** if it makes no unsupported delivery,
review, quality, scarcity, discount, or performance claim. This is not an
ordinary-sales clearance: do not treat the store as transaction-ready until
mandatory Gate 0 disclosures pass.

**Paid test: NO-GO** until all pass:

- [ ] Manitoba Gate 0 seller identity, current address, phone, delivery, and
      transaction disclosures are complete and verified before payment.
- [ ] Privacy, Shipping, and Refund policies published and live-verified.
- [ ] All four address-level quote rows pass.
- [ ] DSers mapping, tracked service, and first-order SOP accepted.
- [ ] Worse-destination economics clear 30% with no blank cost.
- [ ] Fresh Meta pre-purchase events pass; Purchase is proven or owner accepts
      a first-order Purchase hard-stop.
- [ ] GA4/Meta values, currency, event count, UTMs, and consent pass.
- [ ] Campaign page, cart, checkout, mobile, keyboard, WCAG, and policies have
      no P0/P1 issue.
- [ ] Final exact-product, captioned, accessible creative is owner-approved.
- [ ] Supplier/price/stock/quote evidence is less than seven days old.
- [ ] Owner explicitly approves the exact market and cap at activation time.

If every gate passes, the recommendation is one U.S. Meta Sales campaign, one
ad set, no more than three creatives, at **US$14/day and US$100 total**. Do not
simultaneously test Canada, Google, TikTok, or another product. This cap is a
maximum, not standing authorization.

Pause on US$100 without a sale; tracking errors; supplier/route/option/price
change; untracked or duplicate fulfillment; complaint/defect/wrong item;
contribution below 30%; or policy, consent, accessibility, or security regression.

Scaling remains NO-GO until at least five genuine paid orders are delivered,
all five have valid end-to-end tracking, actual contribution is at least 30%,
the combined mismatch/defect/refund/complaint rate is below 10%, Purchase is
reliable, and actual CAC is no more than 70% of actual contribution.

## Owner-intervention checklist

| ID | Owner/admin action | Why required | Boundary |
| --- | --- | --- | --- |
| O1 | Supply legal seller name and `Puchica` trade name | Required seller identity cannot be inferred from branding | Information and publication approval only |
| O2 | Supply current business address and mailing address if different | Manitoba pre-contract disclosure requires real addresses | Never use `R2P 2X1`; no order or mail authorization |
| O3 | Supply monitored customer-service phone number | Required seller contact cannot be invented | Information and publication approval only |
| O4 | Designate the privacy official by name or public-facing title and contact | PIPEDA accountability requires a responsible contact | Privacy-role decision only |
| O5 | COMPLETE — approved August 2, 2026: customer pays approved change-of-mind return shipping; Puchica pays or reimburses approved confirmed-issue return shipping; contact-first per-case destination/no-return resolution | Owner decision recorded; no return/refund issued | No further owner decision required for this rule |
| O6 | COMPLETE for Refund — replacement saved and live-verified; separate Shopify self-serve return rule aligned to 30 days on August 2 | Privacy and Shipping remain PARTIAL for their separately listed missing disclosures and operational decisions | Recheck all policies after the next production deployment; no further Refund publication action currently required |
| O7 | PARTIAL — owner decided August 2 that customers pay duties, brokerage, and destination charges not collected at checkout; refused-delivery cost/refund treatment remains to decide | Duty responsibility is recorded; refusal and return-to-sender exposure cannot be inferred | No further duty decision; refused-delivery decision still required |
| O8 | Approve evidence-supported delivery date/range and method per route | Manitoba disclosure and customer promise require evidence | No order; no unsupported guarantee |
| O9 | Provide authenticated Shopify/DSers access during evidence capture | Mapping/rates live in private systems | Read/no-payment only |
| O10 | Approve non-personal quote postal codes if more than a code is required | Never reuse or ship to the former `R2P 2X1` address | Quote only |
| O11 | Confirm Shopify Payments fee and business costs | Economics cannot pass on assumptions | Information only |
| O12 | Observe Meta/GA4 proof in authenticated sessions | Test Events/diagnostics are not repo facts | No activation |
| O13 | Approve exact final creative | Media cannot self-approve | Creative only |
| O14 | Approve any first-order supplier charge | Purchasing authority cannot be inferred | One charge only |
| O15 | Approve market, US$14/day, US$100 total | Spend requires fresh explicit consent | One test only |

The owner is not needed for repository tests, drafting, worksheet preparation,
accessibility/SEO repairs, creative drafts, or no-payment evidence planning.

## Retained evidence sources

- `docs/no-spend-measurement-proof-2026-08-01.md`
- `docs/launch-measurement-product-readiness-audit-2026-08-01.md`
- `docs/canada-market-activation-control-2026-08-01.md`
- `docs/us-packing-cubes-limited-test-control-2026-08-01.md`
- `docs/us-organization-launch-control-2026-08-01.md`
- `docs/us-sample-and-dsers-test-order-runbook-2026-08-01.md`
- `docs/customer-trust-admin-actions-2026-08-01.md`

These retain evidence and process history. They do not independently authorize
advertising, orders, policy publication, refunds, or supplier spend.
