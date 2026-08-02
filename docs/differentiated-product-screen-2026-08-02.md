# Differentiated product screen — 2026-08-02

## Decision

Three higher-value product families were screened in authenticated DSers and
against current public retail evidence. None passes the paid-acquisition gate.
No product was imported, mapped, ordered, published, paid for, or added to an
advertising campaign. `PAID_HOLD` remains in force.

The screen supports the niche but rejects these implementations. Puchica should
continue looking for a compact, visually demonstrable system or explicit bundle
with a credible normal retail price above roughly US$40 and worse-market landed
cost below US$16–18. A low unit cost is not enough when public marketplaces have
already collapsed the retail price.

## Results

| Product family | Authenticated supplier evidence | Public-market evidence | Decision |
| --- | --- | --- | --- |
| Modular wall-mounted pegboard set | DSers returned one U.S. result at US$27.97 plus US$119.06 shipping, one displayed order and no meaningful rating history | No benchmark was needed after the route failed | `REJECT_SHIPPING` |
| Wall-mounted foldable laundry hamper | Search result: US$10.62–24.54 plus US$1.99 U.S. shipping, six orders, 5.0. Optimizer visual matches included a stronger US$10.82–12.43 row with US$1.99 U.S. / US$2.16 Canada Selection Standard, six to seven days and 53 displayed sales | Walmart Canada exposed a near-identical mesh wall-mounted basket at CA$6.73; the category contains many commodity alternatives | `REJECT_PRICE_CEILING` |
| Expandable two-tier microwave/counter shelf | DSers results started at US$31.04–33.84 plus US$1.99 U.S. shipping; the lower established result had 33 orders and a 4.0 rating | Current Walmart U.S. comparators include US$23.99, US$25.70, US$28.80 and US$34.00 offers | `REJECT_LANDED_COST_AND_RATING` |

## Laundry-hamper route detail

Supplier Optimizer identified several country-level visual matches. The best
screening row carried product ID `1005012281272131` in the optimizer row key
and displayed:

- item range US$10.82–12.43;
- AliExpress Selection Standard;
- US$1.99 U.S. shipping and six displayed days;
- US$2.16 Canadian shipping and seven displayed days;
- 53 displayed sales and 4.6 / 4.7 / 4.7 / 4.8 supplier signals.

The exact product page could not be opened through the controlled browser, so
variant, dimensions, mounting hardware, stock and selected-option price remain
unproved. Even if those fields passed, the public CA$6.73 comparator removes a
credible retail ceiling for paid acquisition. This is therefore a commercial
rejection, not merely an evidence hold.

At a hypothetical US$29.99 retail price and conservative US$14.59 landed cost,
the standard planning formula leaves about US$9.76 contribution (32.6%) before
app allocation, FX, support, duties, chargebacks and paid acquisition. The
corresponding 70% target CAC is only about US$6.83. A US$39.99 price would create
better paper margin, but present public evidence does not support that price for
the same commodity product.

## Evidence boundaries

- DSers warns that Supplier Optimizer data may be incorrect; its rows are leads,
  not approved quotes.
- Country-level routes are not address-level promises.
- Public prices are volatile and must be refreshed before any future approval.
- No first-order, coupon or welcome price may be used in economics.
- A product with a wide item range must still prove the exact advertised option.

Public references:

- Walmart Canada wall-mounted mesh laundry basket, observed at CA$6.73:
  `https://www.walmart.ca/en/ip/Ohufall-Household-Foldable-Wall-Mounted-Laundry-Basket-Portable-Large-Capacity-Mesh-Breathable-Storage-Frame-For-Storing-Dirty-Clothes-In-Bathroom-Or/2PVN5NK4LLZR`
- Walmart U.S. microwave-rack comparison page with US$23.99–34.00 offers:
  `https://business.walmart.com/ip/Stainless-Steel-Microwave-Oven-Rack-Shelf-Stand-2-Tier-Flexible-Kitchen-Countertop-Storage-Hook/3622005323`

## Next discovery rule

Do not spend another pass on commodity hampers, ordinary microwave racks, or
large wall systems. The next pass should prioritize one of:

1. an explicit single-supplier transformation bundle that solves one narrow
   small-space problem and has combined shipping proved in both markets;
2. a compact organizer with a proprietary-looking mechanism or uncommon form;
3. a premium material/finish product whose public comparators actually sustain
   a US$40–70 normal retail price.

Before advancing, require explicit configuration, at least 100 displayed sales
or strong corroborating supplier history, rating near 4.7 or better, tracked
Canada and U.S. service, and practical target CAC of at least US$12–15 after the
planning reserve.
