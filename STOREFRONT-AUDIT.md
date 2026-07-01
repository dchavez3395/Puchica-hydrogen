# Puchica Storefront Audit — 2026-07-01

Overall the storefront is in strong shape: deferred loading with `Suspense`/`Await`,
Hydrogen `<Image>`, full Product / Organization / WebSite / Breadcrumb JSON-LD
(with `aggregateRating` and `offers`), font preconnects, and a clean SEO meta
helper. The findings below are the genuine gaps, ranked by impact.

---

## 1. HIGH — The 4 language translations are invisible to search engines

**What's happening.** The store ships English, French, Spanish, and Portuguese
(BR) content produced via Shopify Translate & Adapt. Language is chosen by a
cookie (`pk_locale`) set through the `/locale` resource route — there are **no
per-language URLs**. Every language renders at the same URL (e.g.
`/products/foo`), and there are **zero `hreflang` tags** anywhere in the app.
The sitemap route even has a leftover TODO comment acknowledging this.

**Why it matters.** `hreflang` requires distinct, crawlable URLs per language.
Because all four languages live on one cookie-switched URL, Googlebot only ever
sees one version (whatever renders by default) and indexes each page in a single
language. The French / Spanish / Portuguese translations — real work that was
already paid for — earn **no SEO value** and will never rank in those markets.

**Fix (this is a project, not a patch).** To capture that value you'd move to
URL-based locales — `/fr/...`, `/es/...`, `/pt-br/...` — via a route prefix
(a `($locale)` segment or middleware), then emit reciprocal `hreflang`
`<link rel="alternate">` tags (including `x-default`) in `root.jsx` and add the
locale variants to the sitemap. Meaningful but well-scoped; happy to plan it.

**Cheap interim option.** If URL locales aren't worth it yet, at minimum keep
serving one canonical language to crawlers and stop there — but know the other
three are dead weight for SEO until URLs exist.

---

## 2. MEDIUM — Product JSON-LD only exposes the featured image

**Where.** `app/routes/products.$handle.jsx`, `buildJsonLd()`:

```js
image: product.featuredImage?.url ? [product.featuredImage.url] : undefined,
```

**Why it matters.** Google rich results and Merchant listings favour products
that expose multiple images. The route already builds a full `galleryImages`
array a few lines up — it's just not passed to the JSON-LD.

**Fix.** Pass `galleryImages` into `buildJsonLd` and emit all of them:

```js
// call site (~line 98)
const jsonLd = buildJsonLd(product, selectedVariant, reviews, galleryImages);

// in buildJsonLd(...):
image: galleryImages?.length
  ? galleryImages.map((i) => i.url).filter(Boolean).slice(0, 10)
  : product.featuredImage?.url
    ? [product.featuredImage.url]
    : undefined,
```

Low risk, single function, immediate rich-result upside.

---

## 3. MEDIUM — Render-blocking Google Fonts

**Where.** `app/root.jsx` loads two families with wide weight/optical ranges via
a blocking stylesheet link:

```
Outfit:wght@300..800 + DM Sans (italic + optical, 300..700)
```

`display=swap` is set (good), and there are preconnects (good), but it's still a
render-blocking request pulling a large variable-font CSS payload, and the two
families with full ranges are heavier than the page likely uses.

**Fix options (pick one).** (a) Trim to the weights actually used. (b) Self-host
the two woff2 files and `<link rel="preload" as="font" crossorigin>` them —
removes the third-party round trip on the critical path. (c) Keep as-is but
preload the specific font files. This is a Lighthouse LCP nicety, not urgent.

---

## 4. LOW — Confirm the 3D/scroll libraries aren't on the LCP path

The bundle includes `three`, `@react-three/fiber`, `@react-three/drei`, and
`lenis` smooth-scroll — all heavy client JS. They appear to power hero/tilt
effects. Worth confirming they're lazy-loaded (dynamic import / client-only) and
not blocking the hero's Largest Contentful Paint on mobile. A quick mobile
Lighthouse run against the deployed preview will tell you in one number.

---

## Suggested order

1. Ship #2 (JSON-LD gallery) — 10-minute clean win.
2. Decide on #1 (URL locales + hreflang) — biggest payoff, needs a plan.
3. #3 / #4 — fold into a general performance pass when convenient.

I can implement #2 directly and draft the #1 plan whenever you want.
