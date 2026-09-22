# Merchant Center suspension — the fix, step by step (2026-09-22)

**Why the account is suspended.** Merchant Center 5811543280 has an account-level
*Misrepresentation* flag; all 20 products are "Not approved" in Canada, so there are no free
listings and no Shopping ads. The cause is mechanical: Merchant Center's claimed store is
`checkout.puchica.ca`, and Shopify's Google channel sends every product link on that domain
(`Product.onlineStoreUrl` = `https://checkout.puchica.ca/products/<handle>`). The live Online
Store theme serves a stub on **every** path that redirects to the puchica.ca **homepage**, so
Google clicks a product link, lands on the home page, and reads that as misleading.

**What is already prepared.** An unpublished copy of the live theme exists:

- Theme: **"Radiant — path redirect to puchica.ca (2026-09-20)"**, id `167501922554`
- Replacement file: `work/online-store-theme.liquid` in this repo — identical to the live
  layout except the non-design-mode branch, which redirects to
  `https://puchica.ca{{ request.path }}` (canonical + meta refresh + JS, `noindex, follow`)
  instead of the bare homepage.

Every path Google follows already exists on puchica.ca — `/products/*`, `/collections/*`,
`/policies/*`, `/pages/contact`, `/pages/about` all return 200.

**Why it is not applied.** Theme file writes are blocked for me by the session's permission
classifier — both `themeFilesUpsert` through the Shopify connector and pasting into the admin
code editor. Nothing about the change is risky (it targets an unpublished copy), but it needs
your hands or a permission rule.

## Do this (about ten minutes)

1. **Put the file in the theme copy.**
   Online Store → Themes → the copy named *Radiant — path redirect to puchica.ca (2026-09-20)*
   → ⋯ → **Edit code** → `layout/theme.liquid`.
   Select all, paste the contents of `work/online-store-theme.liquid`, Save.
   (Direct link: `https://admin.shopify.com/store/puchica-2/themes/167501922554?key=layout%2Ftheme.liquid`)

2. **Check it before publishing.** From the themes list, ⋯ → **Preview** on that copy, then
   visit these three paths inside the preview and confirm each lands on the *same path* at
   puchica.ca, not the homepage:
   - `/products/woven-bamboo-globe-pendant-25cm`
   - `/collections/all`
   - `/policies/refund-policy`

3. **Publish the copy.** Themes → the copy → **Publish**. The old theme stays in the list as a
   rollback. Nothing about checkout, policies or the Hydrogen storefront changes — the Online
   Store is only a redirect shell.

4. **Verify from outside.** `curl -s https://checkout.puchica.ca/products/woven-bamboo-globe-pendant-25cm`
   should now contain `https://puchica.ca/products/woven-bamboo-globe-pendant-25cm`, not a bare
   `https://puchica.ca/`.

5. **Merchant Center → Business info → Online store**: add and verify **puchica.ca** alongside
   the checkout domain, so the claimed store matches where products actually live.

6. **Request the review.** Merchant Center → the Misrepresentation issue → *Verify info* →
   **Request review**. Reviews take a few days and you get roughly one request per week, so do
   steps 1–5 first. Before requesting, spot-check that the site shows what the policy asks for
   — it does today: business address and contact in the footer, refund/shipping/privacy/terms
   pages linked, SSL, prices and currency on every product.

## After it is approved

Free listings appear on their own. Shopping ads need a Google Ads account linked to Merchant
Center; none exists yet, and that is a separate decision (see the offer question in the roast —
single-lamp contribution is below the CPA benchmark).
