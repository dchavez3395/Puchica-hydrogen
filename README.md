# Puchica Storefront (Shopify Hydrogen)

Headless storefront for **Puchica** (`puchica.ca`), built on Shopify Hydrogen
(React Router 7) and hosted on **Shopify Oxygen**.

## Current operating scope — read first

Before changing products, suppliers, markets, design, or launch state, read
[`docs/CURRENT-SCOPE.md`](docs/CURRENT-SCOPE.md). It is the canonical current
goal, catalog boundary, readiness status, stop rules, and next-action sequence.
Older dated plans are historical context when they conflict with that file.

The live visual system is the warm, focused Puchica travel edit. Treat the
current production storefront and `docs/CURRENT-SCOPE.md` as the design and
commercial baseline; do not reconstruct an older broad-catalog theme from this
README.

---

## How the data flows (important)

Hosting and data are **separate**:

- **Products, collections, prices, images** load from the Shopify store via the
  **Storefront API** (`ug91ve-sz.myshopify.com`). They are the approved Puchica
  catalog with exact Shopify-hosted product media, not placeholders.
- **Cart & checkout** hand off to the real **Shopify checkout** — payments,
  taxes, and orders all run through Shopify as normal.
- The public Hydrogen/Oxygen storefront is already live on the apex domain
  **`https://puchica.ca`**. Do not change DNS or reconnect the domain as a normal
  development step.

So no matter where this app is hosted, the catalog and checkout are always the
real Puchica store.

---

## Run locally

Use Node 22 and npm 10.9.8, matching the production workflow. Do not regenerate
`package-lock.json` with npm 11; its optional-peer output is not guaranteed to
pass the npm 10 clean install used by GitHub Actions.

```bash
npm ci
npm run dev          # http://localhost:3000
```

When dependencies intentionally change, regenerate and validate the lockfile
with the pinned package-manager generation before committing:

```bash
npx --yes npm@10.9.8 install --package-lock-only --ignore-scripts
npx --yes npm@10.9.8 ci --dry-run --ignore-scripts
```

Env vars (Storefront API token, store domain, checkout domain, etc.) are
**auto-injected at runtime** because the project is linked to the Hydrogen
storefront (`.shopify/project.json`). To refresh them into a local `.env`:

```bash
npx shopify hydrogen env pull
```

---

## Deploy to Oxygen

The normal production path is a reviewed push to GitHub `main`. The
`Deploy to Shopify Oxygen` workflow installs locked dependencies, runs the full
test suite and release gate, builds, deploys the exact commit, and verifies the
live storefront. A workflow is not successful until its production-health step
passes.

**Preview** (private — requires Shopify login to view):

```bash
npx shopify hydrogen deploy --preview --force
```

**Emergency manual production fallback** (public at `https://puchica.ca`):

```bash
npx shopify hydrogen deploy --env production
# answer "yes" to the "Continue?" confirmation
```

Use the manual command only when the normal GitHub workflow is unavailable and
the exact committed SHA has passed the same checks.

Environments:

- **Production** → Oxygen handle `production`, custom domain
  `https://puchica.ca`. The Hydrogen environment may display `main` as branch
  metadata; that is not authorization to deploy an arbitrary `main` checkout.
- **Preview** → per-deployment private URL.

Deploy only a clean, committed, pushed exact SHA after the repository checks in
`docs/CURRENT-SCOPE.md`.

---

## Live domain

`puchica.ca` already resolves to the Hydrogen/Oxygen production storefront.
Domain or DNS work is out of scope unless a verified outage or an explicitly
approved domain change requires it. The former `shop.puchica.ca` migration plan
is historical and must not be repeated.

---

## Automated release gate

Production deployment is intentionally automated from `main`, but publication
is still gated: tests, launch checks, build, Oxygen upload, and live production
health must all pass. Do not bypass, weaken, or cancel those controls merely to
turn a failed workflow green.

---

## Project map

- `app/routes/_index.jsx` — focused travel-edit homepage
- `app/components/Header.jsx` / `Footer.jsx` — header + footer (component kit)
- `app/components/Icons.jsx` — SVG icon set
- `app/components/ProductItem.jsx` — product card (collections/search)
- `app/routes/products.$handle.jsx` — product page
- `app/routes/collections.*.jsx` — collection / catalog pages
- `app/styles/app.css` — design tokens + all Puchica styles (search `Puchica`)
- `app/lib/context.js` — market-aware CA/CAD and US/USD locale resolution
