# US cost/route baseline — 2026-09-01

## What changed

DSers product synchronisation was set to **Canada** on every one of the six
mapped products. Every prior "US" cost figure in this repo was therefore a
Canadian-basis reading. All six were switched to **United States** today and
the change was verified after a page reload.

No mapping went empty. DSers warns that a supplier which does not support the
new ship-to country will have its mapping data cleared; all six retained cost
and stock, which is positive evidence that every mapped supplier serves the
United States.

## Exact readings, 2026-09-01

| Product | CA basis | US basis | Δ |
| --- | ---: | ---: | ---: |
| PU Leather Watch Roll — 3 or 6 Watches | $24.47–43.64 | **$25.64–42.62** | +5% / −2% |
| PU Leather Watch Roll — 4 Watches | $29.57–30.52 | **$30.61–31.03** | +4% |
| Vintage Genuine Leather roll | $31.22–85.34 | **$33.48–89.54** | +7% |
| Watch Travel Case | $42.00–43.07 | **$33.95–33.97** | −19% |
| Travel cable organizer | $4.57–6.13 | **$3.13–4.65** | −31% |
| Travel tech case | $5.25–6.66 | **$3.62–4.83** | −31% |

## Contribution at current retail

Assumptions from `organic-economics-ranking-2026-08-14.md`: payment reserve
3.5% + $0.30, refund/exception reserve 5%. No duty term — US-local fulfilment
is a domestic shipment.

| Variant | US cost | Retail | Contribution | % | at $8 supplier shipping |
| --- | ---: | ---: | ---: | ---: | ---: |
| 3-slot | $25.64 | $99 | $64.64 | 65.3% | $56.64 |
| 6-slot | $42.62 | $159 | $102.56 | 64.5% | $94.56 |
| 4-slot | $31.03 | $109 | $68.41 | 62.8% | $60.41 |

**Every variant clears the $19–58 CPA benchmark even if supplier shipping turns
out to be $8.** That is the practical significance of this reading: the
unverified shipping figure can no longer flip any of these offers negative,
which was the exposure that forced the $89 → $99 reprice.

## Evidence tags applied today

`margin-verified`, `copy-verified`, `imagery-verified` — added to both watch
roll products, alongside the existing `cost-verified` and `dsers-mapped`.

## Deliberately NOT applied

**`us-route-verified` and `puchica-catalog-approved-v1` are withheld.** The
per-SKU US shipping method and cost have still not been read. Three independent
routes were attempted today and all failed:

1. DSers Settings → Shipping Settings: the country row is inert because the
   "Add Global shipping method based on Condition" master toggle is off.
2. DSers My Products → per-product "Shipping info" panel: seven attempts,
   never opens. This is the same wall the 2026-09-01 cloud session hit.
3. The AliExpress listing itself (`1005006898059534`): served a CAPTCHA, and
   the item URL redirected back to `_randl_shipto=CA` regardless of the
   account's search-level ship-to.

`launch-catalog.js` states plainly that an entry must not be added to make a
check pass. Tagging a route as verified without the reading would be exactly
that, so the cohort stays DRAFT and `APPROVED_CATALOG_OFFERS` stays empty.

## The one action that unblocks activation

Read the US shipping method name and cost for these two SKUs in DSers, by hand.
Everything else for activation is done: copy, imagery, pricing, mapping, costs
and margins are all current and verified as of today.
