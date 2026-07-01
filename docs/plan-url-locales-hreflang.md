# Plan — URL-based locales + hreflang

**Goal:** make the French / Spanish / Portuguese translations crawlable and
rankable by giving each language its own URL and emitting reciprocal `hreflang`
tags. Today all four languages share one cookie-switched URL, so search engines
only index one of them (see STOREFRONT-AUDIT.md §1).

## Status (2026-07-01)

- **Landed (safe foundation, validated logic):**
  - `app/lib/i18n.js` — `PREFIXED_LANGS`, `parseLocaleFromPath`, `localizePath`,
    and `getLocaleFromRequest` now reads the URL prefix first (step 1).
  - `app/lib/seo.js` — `canonical(pathname, langKey)` is now locale-aware and
    backward-compatible; new `hreflangAlternates(pathname)` helper (steps 4-5).
  - These are additive and change nothing for English URLs.
- **Not yet wired (needs a running dev server to test):** the `($locale)` route
  segment (step 2), link localization (step 3), emitting hreflang in `root.jsx`
  (step 5 wiring), sitemap alternates (step 6), switcher (step 7). hreflang must
  not go live until the routes resolve — otherwise it advertises 404s.

---

## Key design decision — encode *language* only

Puchica already separates the two axes of localization:

- **country** → currency / market pricing, driven by Oxygen's geo header
  (`getLocaleFromRequest` in `app/lib/i18n.js`). Automatic, per visitor.
- **language** → translated content, driven by the `pk_locale` cookie.

Only **language** needs to live in the URL. Country/currency stays geo-driven and
unchanged. This keeps the scheme simple and avoids a country×language URL matrix.

### URL scheme

| Language | URL example | Canonical |
| --- | --- | --- |
| English (default) | `/products/foo` | self (no prefix) |
| French | `/fr/products/foo` | self |
| Spanish | `/es/products/foo` | self |
| Portuguese (BR) | `/pt-br/products/foo` | self |

English stays unprefixed, so **every existing URL keeps working** — zero SEO
migration risk on the current traffic. The three prefixed trees are net-new
indexable pages: pure upside.

`hreflang` values emitted: `en`, `fr`, `es`, `pt-br`, plus `x-default` → English.

---

## Implementation approach — route-segment (corrected)

> **Correction (2026-07-01):** an earlier draft recommended stripping the prefix
> in `server.js` and leaving routes untouched ("approach B"). That works for the
> server render but **breaks client-side navigation**: after hydration the
> browser URL still contains `/fr`, and the client router has no matching route
> for the prefix (the server stripped it; the client can't). Result: hydration
> mismatch and broken in-app nav. Approach B is therefore rejected.

The correct method is a route segment so **server and client agree on the URL**:

- **Optional `($locale)` segment** *(recommended)* — the locale prefix is part
  of the route tree, so React Router matches it on both server and client.
  Wire it once in `app/routes.js` (programmatically wrap `flatRoutes()` under an
  optional `:locale?` parent) with a **validation** step that lets any first
  segment which isn't a known locale fall through to the unprefixed match.
  This keeps English URLs (`/products/x`) working while adding `/fr/...` etc.

The delicate part is the validation/fallthrough (a bug here can 404 the whole
site), which is exactly why it must be built against a running dev server rather
than shipped blind.

---

## Work breakdown

### 1. Locale resolution reads the URL first — `app/lib/i18n.js`
Add `parseLocaleFromPath(pathname)` returning `{lang, rest}` (e.g.
`/fr/products/x` → `{lang:'fr', rest:'/products/x'}`). In `getLocaleFromRequest`,
resolution order becomes: **URL prefix → cookie → country default → EN/CA**.
Country logic is untouched.

### 2. Wire the optional locale segment — `app/routes.js` (needs local testing)
Wrap the file routes under an optional `:locale?` parent and validate the
segment so unknown first segments fall through to the unprefixed match:

```js
import {flatRoutes} from '@react-router/fs-routes';

const fileRoutes = await flatRoutes();

export default [
  // Prefixed tree: /fr/*, /es/*, /pt-br/* (validated in a layout loader that
  // throws 404 for any :locale that isn't in PREFIXED_LANGS, so RR falls
  // through to the unprefixed English tree below).
  {path: ':locale', file: 'routes/($locale).jsx', children: fileRoutes},
  // Unprefixed English tree (unchanged):
  ...fileRoutes,
];
```

`routes/($locale).jsx` is a thin pass-through layout: its loader reads
`params.locale`, and if it isn't in `PREFIXED_LANGS` it `throw`s a 404 Response
so the router tries the next match. Because `getLocaleFromRequest` already reads
the language from the URL (landed — step 1), no extra plumbing is needed to make
the Storefront API serve the right language. **Validate this against
`npm run dev` before committing** — a mistake here can 404 every route.

### 3. Localize internal links — new helper + wrapper *(the long pole)*
There are **~101 `to=` link usages across 29 files** (`Header`, `Footer`,
product cards, showcases, etc.), all currently raw. Add:
- `app/lib/localizedHref.js` → `useLocalizedHref()` that prefixes the current
  language onto absolute app paths (no-op for EN, external, and hash links).
- A thin `Link` / `NavLink` wrapper (or codemod the call sites) so navigation
  stays inside the active locale.

This is the bulk of the effort and the main correctness risk — a missed link
drops the user back to English.

### 4. Locale-aware canonicals — `app/lib/seo.js`
`canonical(pathname)` must include the active language prefix so each language
**self-canonicalizes** (French page canonical = the French URL, not English).
Thread the language through, or read it from a request-scoped value.

### 5. hreflang alternates — `app/lib/seo.js` + `app/root.jsx`
Add `hreflangAlternates(pathname)` returning the four language URLs + `x-default`.
Emit them as `<link rel="alternate" hreflang="…">` for the *current* path.
Because tags must reflect the real pathname, emit them per-route via a shared
meta helper (or in the root layout using `useLocation`), not as static links.

### 6. Sitemap — `app/routes/sitemap.$type.$page[.xml].jsx`
Hydrogen's `getSitemapPaths` emits one URL per resource. Extend the output so
each `<url>` carries `<xhtml:link rel="alternate" hreflang="…">` entries for all
four languages (reciprocal). Update the sitemap index namespace accordingly.

### 7. LocaleSwitcher — `app/components/LocaleSwitcher.jsx`
Today it POSTs to `/locale` to set the cookie and reloads. Change it to
**navigate to the prefixed URL** for the same page (`/fr` + current `rest`). Keep
the cookie only as a soft "sticky preference" for the bare `/` entry point, or
retire it. The `/locale` action can stay as a fallback.

### 8. Redirect hygiene
EN URLs are unchanged, so no 301s needed there. Optionally 301 a prefixed
English path (`/en/...`) to the unprefixed canonical to avoid a duplicate.

---

## Effort & risk

- **Effort:** ~1–2 focused days. Routing + resolution + canonicals + hreflang is
  a few hours; link localization (step 3) and QA are the rest.
- **Caching:** Oxygen full-page cache keys on the path, which now differs per
  language — so caching stays correct automatically. `@inContext` already varies
  the Storefront API calls by language.
- **Duplicate content:** mitigated by self-canonicals (step 4) + reciprocal
  hreflang (steps 5–6).
- **Main risk:** incomplete link coverage (step 3). Mitigate with the wrapper +
  a grep audit of remaining raw `to=`/`href=` app paths before launch.

---

## Phasing (ship safely)

1. **Plumbing, EN only.** Land steps 1–2, 4–5 with English behaving exactly as
   today (no visible change) to validate routing/canonicals/hreflang scaffolding.
2. **Turn on `fr`,** verify, then **`es`,** then **`pt-br`** — one language at a
   time so regressions are isolated.
3. **Submit** the updated sitemap in Google Search Console; watch the
   International Targeting / hreflang report and Rich Results test.

## Verification checklist

- `curl -s /fr/products/<h>` returns French content, `<link rel=canonical>` =
  the `/fr/...` URL, and the four `hreflang` alternates + `x-default`.
- LocaleSwitcher round-trips and preserves the current page.
- Click-through audit: nav, footer, product cards, breadcrumbs all stay in
  locale (no silent drop to EN).
- Sitemap validates; hreflang is reciprocal across all four languages.
- Mobile Lighthouse unchanged vs. baseline.

---

*When you're ready to build, I'd start with Phase 1 (steps 1–2, 4–5) so we prove
the routing end-to-end before touching 101 links.*
