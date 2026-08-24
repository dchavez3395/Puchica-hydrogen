# Coordination — read this first

Two Claude sessions work on Puchica, and they cannot talk to each other. This
file is the only channel between them. Read it before starting; append to the
log at the bottom before you stop.

| Session | Runs on | Can reach | Cannot reach |
| --- | --- | --- | --- |
| **Local CLI** | Daniel's Windows PC | The logged-in browser: DSers, AliExpress, ad platforms | Live Shopify data unless the Shopify integration is configured there |
| **Remote (web/phone)** | Cloud container | Live Shopify Admin API, the repo, GitHub | Any browser session; `dsers.com` and `aliexpress.com` are blocked at its network gateway |

Both can read and write this repo. **The repo is the shared state.** If it is
not committed and pushed, the other session cannot see it.

Daniel reads the remote session on his phone to follow progress. Write the log
entries so they make sense to a person, not just to a machine.

## The goal

**Replace the catalog with products that can fund their own customer
acquisition, then get the first genuine sale.**

Not: more analysis, more audits, more documents. The repo already has enough of
those, and over-documentation is this project's known failure mode.

## Decided — do not relitigate

These are settled and evidenced. Reopening them wastes the session.

1. **The store is not the problem.** It is production-grade. Two months of
   engineering was never the blocker.
2. **No genuine customer has ever existed.** 14,549 sessions in 90 days, two
   orders, both owner tests. There is no demand signal either way.
3. **CPA has a floor of roughly CA$28** on cold traffic, and scales at about
   40% of order value above it. Crossover: **CA$70**. Full reasoning in
   `docs/sourcing-spec-2026-08-24.md`.
4. **The margins were never bad.** Three of four live products exceed 56%
   contribution margin. They lose money because they are priced under the
   crossover and pay the floor CPA regardless.
5. **Target band: retail CA$90–150, supplier cost at or under a third of
   retail, duties prepaid.** That is ordinary DSers dropshipping, just not
   cheap products.
6. **Canada only.** The US is commercially suspended over the de minimis
   repeal — logistics still work, economics do not.
7. **Hard disqualifiers are legal, not stylistic:** mains electrical, wireless,
   lithium battery, regulated goods, branded/licensed. See
   `docs/dsers-sourcing-criteria-2026-08-24.md`. The best-looking margins in
   this band cluster in exactly these categories, so a purely financial screen
   selects for them.

## Open — needs Daniel, not either session

- Rotate the leaked Admin credential (outstanding since 2026-08-18).
- Carry-On Kit: restore CA$89 or retire it. Live at CA$69, where it earns less
  than a single-order product while needing three manual supplier orders.
- Resolve the pixel-ID contradiction: `paid-launch-check` requires IDs that
  `.env.example` calls optional and only used with the custom Meta bridge —
  which double-counts Purchase and halves reported CPA.
- Confirm the Facebook & Instagram and Google channels are connected in Shopify.
- Switch duty posture to `prepaid` **in Shopify first**, then in code. See
  `docs/duty-prepay-runbook-2026-08-24.md`.

## Division of labour

**Local CLI owns** browser work: DSers variant costs, Canadian routes, stock,
AliExpress research, screenshots of evidence. This is the bottleneck and the
reason that session exists.

**Remote owns** live Shopify reads, GitHub, and reporting status to Daniel on
his phone.

**Either** may write code, docs and tests — but only one at a time, and push
before stopping so the other is not editing stale files.

## Rules that bind both sessions

- **Exact variant, never the listing headline.** A product-level card price is
  what produced the last broken catalog. Read the mapped variant's own cost and
  its Canadian route.
- **Score before importing.** `npm run sourcing-spec -- --csv <file>`. A fatal
  flag rejects regardless of margin.
- **The gates decide, not a persona file or a plan.** If a gate and a document
  disagree, the gate is right and the document needs fixing.
- **No unsupported claims.** Zero sales and zero reviews means no social proof,
  no bestseller framing, no scarcity, no compare-at pricing, no delivery promise
  beyond the disclosed window.
- **Never spend money, publish externally, pay a supplier, rotate a credential,
  or change what customers are charged** without Daniel saying so explicitly.
- **Don't add another audit document.** Extend a script or a test instead. If a
  finding matters, it should be something the build can check.
- **Push before you stop.** Unpushed work is invisible to the other session.

## Progress log

Append newest at the bottom. Keep entries short and factual: what changed, what
it means, what is next. Daniel reads these on his phone.

Format:

```
### YYYY-MM-DD · [local|remote] · headline
- what happened
- what it means
- next
```

### 2026-08-24 · remote · Gates, sourcing spec, and the CPA floor finding

- Added the acquisition gate, Canadian landed-cost model, measurement power
  analysis, campaign link builder, business-model comparison, sourcing spec and
  scorer, and the catalog-block generator. Seven commits, PR #15.
- Corrected an earlier over-strong conclusion: CPA is not flat, it has a floor.
  Dropshipping is viable; the current price point is not.
- Pruned four stale agency personas whose index stated confident falsehoods.
- Store is dormant: zero sessions on 22, 23 and 24 August.
- Next: local CLI reads real DSers numbers for the CA$90–150 band.
