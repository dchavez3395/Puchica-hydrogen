# Puchica Storefront (Shopify Hydrogen)

Headless storefront for **Puchica** (`puchica.ca`), built on Shopify Hydrogen
(React Router 7) and hosted on **Shopify Oxygen**.

Designed to the **Puchica Design System v1.0** — Outfit font, violet `#6D4CFF`
palette, 8pt spacing, soft shadows, SVG icons (no emoji).

---

## How the data flows (important)

Hosting and data are **separate**:

- **Products, collections, prices, images** load from the Shopify store via the
  **Storefront API** (`ug91ve-sz.myshopify.com`). They are the real Puchica
  catalog (with the AI lifestyle images), not placeholders.
- **Cart & checkout** hand off to the real **Shopify checkout** — payments,
  taxes, and orders all run through Shopify as normal.
- The hosting URL (`…o2.myshopify.dev` today) is the only "temporary" part and
  is replaced by pointing a custom domain at it (see below).

So no matter where this app is hosted, the catalog and checkout are always the
real Puchica store.

---

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

Env vars (Storefront API token, store domain, checkout domain, etc.) are
**auto-injected at runtime** because the project is linked to the Hydrogen
storefront (`.shopify/project.json`). To refresh them into a local `.env`:

```bash
npx shopify hydrogen env pull
```

---

## Deploy to Oxygen

**Preview** (private — requires Shopify login to view):

```bash
npx shopify hydrogen deploy --preview --force
```

**Production** (public `…o2.myshopify.dev` URL):

```bash
npx shopify hydrogen deploy --env production
# answer "yes" to the "Continue?" confirmation
```

Production deploy intentionally requires an interactive confirmation.

Environments:
- **Production** → https://puchica-storefront-f9aa94aa3bf86abb6754.o2.myshopify.dev (branch: `main`)
- **Preview** → per-deployment private URL

---

## Custom domain: `shop.puchica.ca`

Goal: serve this storefront at **`shop.puchica.ca`** while the existing
`puchica.ca` Horizon theme store keeps running untouched. Switch the apex
(`puchica.ca`) over only when you're 100% happy.

**1. Deploy to Production** (see above) if you haven't.

**2. Add the domain in the Hydrogen channel**
   Shopify admin → **Sales channels → Hydrogen → Puchica Storefront →
   Settings → Domains** → **Connect existing domain** → enter
   `shop.puchica.ca`. Shopify shows a **CNAME target** to point at.

**3. Add the DNS record**
   At wherever `puchica.ca` DNS is managed:
   - **If DNS is managed by Shopify** (admin → Settings → Domains shows
     puchica.ca as managed): add a **subdomain / CNAME** record there:
     `shop` → the target Shopify gave you.
   - **If DNS is at an external registrar** (GoDaddy, Namecheap, Cloudflare,
     etc.): add a **CNAME** record: host `shop`, value = the target Shopify
     gave you. (On Cloudflare, set the record to **DNS only / grey cloud**.)

**4. Wait for SSL** — Shopify auto-provisions HTTPS (minutes to a few hours).
   `https://shop.puchica.ca` then serves this storefront.

**Later — replace the main store:** to make `puchica.ca` itself use this
storefront, repoint the apex domain to Oxygen from the same Domains screen.
This is the only step that affects the live store, so do it last.

---

## Auto-deploy (optional, later)

Push this repo to GitHub, then in the Hydrogen channel connect the repository.
Every push to `main` then deploys to Production automatically — no manual CLI.

---

## Project map

- `app/routes/_index.jsx` — homepage (hero + spotlight, categories, best picks, trust bar)
- `app/components/Header.jsx` / `Footer.jsx` — header + footer (component kit)
- `app/components/Icons.jsx` — SVG icon set
- `app/components/ProductItem.jsx` — product card (collections/search)
- `app/routes/products.$handle.jsx` — product page
- `app/routes/collections.*.jsx` — collection / catalog pages
- `app/styles/app.css` — design tokens + all Puchica styles (search `Puchica`)
- `app/lib/context.js` — i18n country = `CA` (CAD pricing)
