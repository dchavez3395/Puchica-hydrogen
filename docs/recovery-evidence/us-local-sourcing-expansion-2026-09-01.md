# US-local sourcing expansion — 2026-09-01

> **CORRECTION — 2026-09-03. The premise of this document is wrong. It is kept
> as the record of a mistake worth not repeating, not as guidance.**
>
> This survey selected candidates on the search field
> `itemCardType: "app_us_local_card"` and calls it "the validated US-warehouse
> marker". It is not. That flag marks an item as **merchandised in the US
> storefront** — it says nothing about where the goods physically ship from.
>
> The misreading was caught the same day on the watch-roll cohort. Those items
> carried the flag and were first entered as `us-local`; the listing's own
> shipping panel, read with ship-to United States, returned "AliExpress
> Selection Standard", $1.99, 8–11 days, couriers SpeedX / GOFO / USPS — USPS
> as final mile only. That is a China-direct consolidated line. Every offer in
> the cohort was corrected to `cn-direct`, which is what put it behind the
> suspended US route and made its duty clearance load-bearing.
>
> **The real check is the DSers supplier-side `Ship from` filter.** Set to
> United States → United States it returns genuine US-warehouse stock with $0
> domestic shipping. That is a supplier-side field about warehouse location.
> `itemCardType` is a storefront presentation field. They are not
> interchangeable, and the difference is the entire US duty exposure.
>
> Treat every "US-local" candidate below as **unverified** until it has been
> re-checked through the DSers Ship-from filter. None of them has been.

---

## Method

AliExpress with ship-to United States / USD (the US gateway, which returns a
different catalogue than the CA view). Candidates filtered on
`itemCardType: "app_us_local_card"` — the validated US-warehouse marker, not the
`shipFromCountry=US` URL parameter, which was proven unreliable on 2026-08-31
when it returned a Korean warehouse.

Eight search terms scanned, 60 results each, all returning 60/60 US-local.
Contribution modelled with the assumptions in
`organic-economics-ranking-2026-08-14.md`: payment reserve 3.5% + $0.30,
refund/exception reserve 5%. No duty term — a US warehouse shipping to a US
customer is a domestic shipment, so the duty stack does not apply.

## Result

| Offer                                          |   Cost | Retail | Contribution |     % |
| ---------------------------------------------- | -----: | -----: | -----------: | ----: |
| Watch winder, 4/8/12-slot (105 sold, 4.6)      | $82.18 |   $229 |      $127.05 | 55.5% |
| Watch winder, 6-slot (700+ sold, 4.8)          | $66.08 |   $199 |      $115.71 | 58.1% |
| Watch + jewelry box, 10 grid (1,000+ sold, 4.7)| $65.26 |   $179 |       $98.22 | 54.9% |
| Cigar humidor, glass top (500+ sold, 4.8)      | $39.50 |   $139 |       $87.38 | 62.9% |
| Wooden watch box, 6/10/12 grid (298 sold, 4.7) | $31.49 |   $109 |       $67.95 | 62.3% |
| Watch winder, single slot (1,000+ sold, 4.6)   | $22.39 |    $89 |       $58.74 | 66.0% |
| Globe whiskey decanter set (500+ sold, 4.7)    | $26.62 |    $89 |       $54.51 | 61.3% |
| Wooden watch box, 1/2/3 slot (1,000+ sold, 4.7)| $17.72 |    $69 |       $45.11 | 65.4% |
| Leather valet tray, 5 compartment (73 sold)    | $14.74 |    $49 |       $29.79 | 60.8% |
| Tortilla press, aluminium (434 sold, 4.5)      | $13.36 |    $39 |       $22.03 | 56.5% |

Benchmark CPA to clear: $19 (accessories) to $58 (home & garden).

## Decision

Build out **watch storage and winding** as a collection. It is the only vein
found that clears the CPA benchmark with room left over, and it is adjacent to
the two watch rolls already drafted — same buyer, same collection, natural
cross-sell and AOV lift rather than a second unrelated catalogue.

It also solves the constraint that has blocked every previous plan: a winder in
motion is a product that demos itself, so the creative does not depend on
Daniel filming anything.

## What did not clear, and why it matters

The brand-true candidates do not carry the margin. A tortilla press costs
$13.36, sells for about $39, and contributes $22 — below the home-and-garden CPA
benchmark of $58 before a single ad is bought. That is the same trap that killed
the original catalogue: correct percentage, insufficient absolute dollars.

So the Central American brand thesis and the margin are, on this supplier, in
different places. Watch accessories carry the economics; they do not carry the
brand story. That tension is real and is not resolved by this document.

## Screening still required before any of these is imported

1. **Brand/IP.** Many of the strongest listings carry a supplier brand in the
   title — Embers, IBBETON, FRUCASE, Oirlv, WELLZONE, VANSIHO, MISHITU,
   WOODTEN. A branded item is the flag that held back the CONTACTS FAMILY watch
   roll. Prefer unbranded equivalents, or verify the brand does not appear on
   the product or its packaging.
2. **US supplier shipping is unverified.** Modelled at $0. The 2026-09-01
   repricing was caused by exactly this assumption being wrong ($7.76 actual on
   the China-direct route). Read the real US figure in DSers per SKU before
   these prices are treated as settled.
3. **Cigar humidor is likely unadvertisable.** Google Ads prohibits tobacco
   products and accessories; a humidor will probably be disapproved. Strong
   organic/AOV offer, poor paid-channel offer. Do not build a paid test on it.
4. Stock depth per variant, as with the watch rolls, where a headline 146 was
   really one variant at 100 and five at 7-11.
