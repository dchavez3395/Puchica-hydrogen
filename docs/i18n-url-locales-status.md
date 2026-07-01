# URL locales + hreflang — implementation status

_Last updated: 2026-07-01. Companion to `plan-url-locales-hreflang.md`._

Turns the four languages (en/fr/es/pt-br) from cookie-switched (invisible to
search engines) into crawlable per-language URLs with reciprocal hreflang.
English stays unprefixed; fr/es/pt-br serve under `/fr`, `/es`, `/pt-br`.

## Done & how it works

**Locale plumbing**
- `app/lib/i18n.js` — `PREFIXED_LANGS`, `parseLocaleFromPath`, `localizePath`;
  `getLocaleFromRequest` resolves language URL-first → cookie → country → EN.
  (Logic unit-tested: prefix parse, reprefix fr→es, external pass-through.)
- `app/routes.js` — all file routes mounted under an optional `:locale?` parent.
- `app/components/LocaleBoundary.jsx` — validates the segment; 404s unknown
  prefixes (falls through to Shopify redirect handling).

**Canonicals + hreflang**
- `app/lib/seo.js` — `canonical(pathname, langKey)` (backward-compatible) +
  `hreflangAlternates(pathname)`. `puchicaMeta` accepts `langKey`.
- `app/root.jsx` — emits reciprocal hreflang + `x-default` for the current path.
- 14 content routes pass `langKey: params?.locale` into `puchicaMeta`, so each
  language self-canonicalizes. (Skipped: `cart`, `$`/404 — not indexed.)

**Link localization**
- `app/lib/useLocalizedHref.js` + `app/components/LocalizedLink.jsx`
  (`LocalizedLink`, `LocalizedNavLink`).
- `app/components/LocaleSwitcher.jsx` — now navigates to the localized URL
  (sets cookie AND moves to `/fr…` via the existing `/locale` action).
- 27 files swapped `react-router` `Link`/`NavLink` → the localized wrappers:
  Header, Footer, MegaMenu, PageLayout, ProductItem, CollectionShowcase,
  CartMain, CartLineItem, EmblaProductCarousel, TrendingTicker, ParallaxBanner,
  ScrollPillNav, SearchResults, SearchResultsPredictive, ProductForm, and the
  routes _index, products.$handle, collections.$handle/._index/.all,
  policies.$handle/._index, pages.about, explore, blogs._index,
  blogs.$blogHandle._index, $.

## Verified
- `npm run build` compiles (LocaleBoundary chunk emitted); `/` renders English.
- Typing `/fr`, `/es` renders translated content (confirmed by Daniel).
- Switcher fix applied (needs a click-test after HMR — see below).

## Test before shipping (needs `npm run dev`)
1. Toggle in header: EN→FR moves you to `/fr/…`, FR→ES to `/es/…`, back to EN
   drops the prefix. URL bar reflects it.
2. Click around in FR (product cards, mega-menu, footer, cart) — you STAY under
   `/fr` and never silently fall back to English.
3. `/xx/products/<h>` → 404. `/pages/about` and other single-segment paths still
   resolve (the `$.jsx` splat + storefrontRedirect edge case).
4. View source on `/fr/products/<h>`: `<link rel=canonical>` points to the
   `/fr/...` URL, and four `hreflang` alternates + `x-default` are present.

## Remaining work
- **Sitemap hreflang alternates (plan step 6)** — `sitemap.$type.$page[.xml].jsx`
  still emits one URL per resource with no `<xhtml:link hreflang>` entries.
  Do this before/with go-live so Google discovers the language variants.
- **root.jsx ErrorBoundary link** — the 404 "Back to home" `Link` is still plain
  react-router (English). Low priority; localize if desired.
- **GSC** — after deploy, submit the updated sitemap and watch the
  International Targeting / hreflang report.

## Revert
- Routing: in `app/routes.js` replace the `{path:':locale?', …}` block with
  `...fileRoutes`. Everything else is additive/no-op for English and can stay.

## Notes for a continuing session
- Git is locked in the authoring sandbox — Daniel commits on his machine.
- The FUSE mount serves STALE bytes to shell `cat`/parsers; trust the file API
  (Read tool) and `npm run build`, not `node --check`/esbuild in the sandbox.
- All edits preserved CRLF, so diffs show only real changes, not line-ending
  churn.
