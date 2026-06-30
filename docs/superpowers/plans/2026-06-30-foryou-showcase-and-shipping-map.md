# For You Showcase + Shipping Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish rolling out the ~300 AI-generated ("Higgsfield") product images as featured images, tag them for reuse, add a new "For You" homepage showcase section + bias existing sections toward those products, and add a decorative interactive shipping-reach world map section.

**Architecture:** Two independent phases sharing one homepage route file (`app/routes/_index.jsx`). Phase A is a one-time Shopify data fix (Admin API mutations) plus storefront-side query/component changes. Phase B is a net-new component + data file + a new npm dependency. Both phases plug into the same loader/render pattern already used by every other homepage section (deferred GraphQL query → `<Suspense>`/`<Await>` → presentational component).

**Tech Stack:** React Router 7 / Hydrogen 2026.4.3, Shopify Admin GraphQL API (via `mcp__claude_ai_Shopify__graphql_query` / `graphql_mutation` tools), Shopify Storefront API, `react-simple-maps` (new dependency).

## Global Constraints

- Tag value is exactly `for-you` (lowercase, hyphenated) — used verbatim in Admin mutations, Storefront `query:` strings, and the new smart collection's rule.
- New homepage section is titled "For You" (see i18n keys below for exact copy).
- The "For You" showcase section never falls back to untagged products — if fewer than 5 tagged products are available, it renders fewer cards.
- Existing collection-based sections (Hero/trending, Rack, Fresh Finds, New Arrivals, Discover, Match) keep pulling from their current collection handles and counts — only their in-memory ordering changes.
- **No test runner is configured in this repo** (confirmed: zero `*.test.js`/`*.spec.js` files, no vitest/jest config, `npm run lint` is the only check script). Verification steps in this plan use `npm run lint`, a throwaway `node` sanity check for pure functions (not committed), and live dev-server checks — not an automated test suite. Do not introduce a test framework as part of this plan; that's a separate decision for Daniel to make.
- Brand color tokens (from `app/styles/app.css`): `--pk-ink: #0E0C08`, `--pk-cream: #F4F0E6`, `--pk-cream-soft: #EDE8D8`, `--pk-lime: #C6FF4E`, `--pk-lime-pale: #EFFFCC`, `--pk-muted: #72685A`. Reuse these — don't hardcode new hex values.
- Shop domain for Admin/Storefront API calls: `shop.puchica.ca`. Higgsfield image filenames match the pattern `/hf_` (substring match anywhere in the Shopify CDN URL path is sufficient — e.g. `.../files/hf_20260612_203236_<uuid>.png`).

---

## Phase A — For You showcase

### Task 1: Tag and reposition Higgsfield-image products in Shopify

**Files:** None (no repo files — this is a one-time Shopify Admin data operation performed via the `mcp__claude_ai_Shopify__graphql_query` and `mcp__claude_ai_Shopify__graphql_mutation` tools).

**Interfaces:**
- Produces: every product with an `hf_*` image now has (a) the tag `for-you` and (b) that image as `featuredImage` (position 1). This is the data precondition every later task in Phase A depends on (the `tag:'for-you'` queries in Tasks 3/5/6 return nothing until this task runs).

- [ ] **Step 1: Paginate the catalog to find every product with an `hf_` image**

Run this query repeatedly, starting with no `after`, then passing the previous `pageInfo.endCursor`, sorted newest-updated-first so matches cluster early:

```graphql
query($after: String) {
  products(first: 50, sortKey: UPDATED_AT, reverse: true, after: $after) {
    pageInfo { hasNextPage endCursor }
    edges {
      node {
        id
        handle
        tags
        featuredImage { url }
        images(first: 10) { edges { node { id url } } }
      }
    }
  }
}
```

For each product in the page, compute:
- `hasHf = images.edges.some(e => e.node.url.includes('/hf_'))`
- `featuredIsHf = (featuredImage?.url ?? '').includes('/hf_')`
- `hfImageId = images.edges.find(e => e.node.url.includes('/hf_'))?.node.id` (the `MediaImage` id, needed for Step 3)

If the tool response is too large and gets written to a file instead of returned inline, parse it with `jq` via Bash rather than reading the raw file — e.g.:

```bash
cat /path/to/result.txt | jq -r '.data.products.edges[].node | [.id, .handle, (.tags | join(",")), (.featuredImage.url // "" | test("/hf_")), ([.images.edges[].node.url] | any(test("/hf_")))] | @tsv'
```

Keep a running tally of `hasHf` sightings per page. **Stop condition:** once 5 consecutive pages (250 products) have zero `hasHf == true` rows, stop paginating — this means you've passed the entire batch (matches were already established to cluster within the first few hundred most-recently-updated products).

Collect every `hasHf == true` row into a list (id, handle, hfImageId, featuredIsHf, tags).

- [ ] **Step 2: Tag every matched product with `for-you`**

For each product from Step 1 that does **not** already have `for-you` in its `tags` array, run:

```graphql
mutation tagProduct($id: ID!, $tags: [String!]!) {
  tagsAdd(id: $id, tags: $tags) {
    node { id }
    userErrors { field message }
  }
}
```
with `variables: {"id": "<product gid>", "tags": ["for-you"]}`. Check `userErrors` is empty on each call; if not empty, log the product handle + error and continue (don't abort the whole batch over one failure).

- [ ] **Step 3: Reposition the `hf_` image to featured (position 1) where needed**

For each product from Step 1 where `featuredIsHf == false`, reposition its images so the `hf_` `MediaImage` is first:

```graphql
mutation reorder($id: ID!, $moves: [MoveInput!]!) {
  productReorderMedia(id: $id, moves: $moves) {
    job { id }
    userErrors { field message }
  }
}
```
with `variables: {"id": "<product gid>", "moves": [{"id": "<hfImageId>", "newPosition": "0"}]}`. (Use `graphql_schema` on `Mutation` first to confirm the exact mutation name and `MoveInput` shape on this API version before running at scale — the schema is the source of truth, not this plan.) Check `userErrors` on each call the same way as Step 2.

- [ ] **Step 4: Verify**

Re-run the Step 1 query for a sample of ~20 of the fixed product handles (by `handle:` search via `search_products` or a targeted `products(first: 1, query: "handle:'<handle>'")` lookup) and confirm `featuredImage.url` now contains `/hf_` for all of them, and `tags` includes `for-you`.

Report back: total products tagged, total repositioned, any failures with handles.

- [ ] **Step 5: No commit needed**

This task makes no repo changes — nothing to commit. Proceed to Task 2.

---

### Task 2: Add `prioritizeTag` helper to `app/lib/diversify.js`

**Files:**
- Modify: `app/lib/diversify.js` (append new function after the existing `diversifyByVendor` / `vendorKey` functions, end of file)

**Interfaces:**
- Consumes: `diversifyByVendor(items)` (already defined in this file, signature `(T[]) => T[]`)
- Produces: `prioritizeTag(items, tag)` — `<T extends {tags?: string[]}>(items: T[], tag: string) => T[]`. Task 3 imports and calls this.

- [ ] **Step 1: Add the function**

Append to `app/lib/diversify.js`:

```js
/**
 * Reorder items so any item carrying `tag` (in its `tags` array) comes
 * first, with vendor-diversification preserved independently within
 * each group. Used to surface AI-showcase ("for-you" tagged) products
 * at the front of a section's results while still spreading the
 * dominant vendor within both the tagged and untagged groups.
 *
 * @template {{title: string, tags?: string[]}} T
 * @param {T[]} items
 * @param {string} tag
 * @returns {T[]}
 */
export function prioritizeTag(items, tag) {
  if (!Array.isArray(items) || items.length === 0) return items;
  const tagged = items.filter((item) => item?.tags?.includes(tag));
  const rest = items.filter((item) => !item?.tags?.includes(tag));
  return [...diversifyByVendor(tagged), ...diversifyByVendor(rest)];
}
```

- [ ] **Step 2: Sanity-check with a throwaway script (not committed)**

```bash
cat <<'EOF' > /tmp/check-prioritize-tag.mjs
import {prioritizeTag} from '/Users/danielc/puchica-storefront/app/lib/diversify.js';

const items = [
  {title: 'A - One', tags: []},
  {title: 'B - Two', tags: ['for-you']},
  {title: 'A - Three', tags: []},
  {title: 'C - Four', tags: ['for-you']},
];
const out = prioritizeTag(items, 'for-you');
console.log(out.map((i) => i.title));
// Expect tagged items (B, C) first, then untagged (A, A), each
// internally vendor-diversified.
EOF
node /tmp/check-prioritize-tag.mjs
```

Expected output: `[ 'B - Two', 'C - Four', 'A - One', 'A - Three' ]`. Delete `/tmp/check-prioritize-tag.mjs` after confirming.

- [ ] **Step 3: Lint**

Run: `npm run lint -- app/lib/diversify.js`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/lib/diversify.js
git commit -m "feat(lib): add prioritizeTag helper for For You bias"
```

---

### Task 3: Add `tags` field to existing section fragments and apply `prioritizeTag`

**Files:**
- Modify: `app/routes/_index.jsx` (fragments: `TrendingProduct`, `RackProduct`, `FreshFind`, `NewArrival`, `DiscoverProduct`, `MatchProduct`; function: `loadDeferredData`)

**Interfaces:**
- Consumes: `prioritizeTag` from `~/lib/diversify` (Task 2)
- Produces: `loadDeferredData`'s `norm()` closure now applies tag-priority ordering; later tasks (Task 6) don't touch this function further.

- [ ] **Step 1: Add `tags` to the six fragments**

In each of these fragments, add a `tags` line right after `handle`:

```
fragment TrendingProduct on Product {
  id title handle
  tags
  ...
```

Apply the same one-line addition to `RackProduct`, `FreshFind`, `NewArrival`, `DiscoverProduct`, and `MatchProduct` fragments (do **not** touch `BestPick`, `CatProduct`, or `ShowCol` — those power `bestPicks`/`catWorld`/`showcaseCollections`, which are out of scope per the spec).

- [ ] **Step 2: Replace the `norm()` closure to apply `prioritizeTag`**

Current code (`app/routes/_index.jsx`, inside `loadDeferredData`):

```js
const norm = () => (res) => {
  const nodes =
    res?.collection?.products?.nodes ?? res?.products?.nodes ?? [];
  return diversifyByVendor(nodes);
};
```

Replace with:

```js
const norm = () => (res) => {
  const nodes =
    res?.collection?.products?.nodes ?? res?.products?.nodes ?? [];
  return prioritizeTag(nodes, 'for-you');
};
```

(`prioritizeTag` already calls `diversifyByVendor` internally on both the tagged and untagged groups, so this is a drop-in replacement — no caller of `norm()` changes.)

- [ ] **Step 3: Update the import**

Change:
```js
import {diversifyByVendor} from '~/lib/diversify';
```
to:
```js
import {diversifyByVendor, prioritizeTag} from '~/lib/diversify';
```
(`diversifyByVendor` is still used directly inside `catWorld`'s `.then()` handler a few lines down — keep that import.)

- [ ] **Step 4: Lint**

Run: `npm run lint -- app/routes/_index.jsx`
Expected: no errors.

- [ ] **Step 5: Manual verification**

Run `npm run dev`, open the homepage, confirm it still renders (no GraphQL errors in the terminal or browser console — `tags` is a valid field on `Product` so this should be a no-op visually until Task 1's tagging has propagated, at which point tagged products should visibly shift to the front of the Discover Swiper / Product Rack / New Arrivals / Fresh Finds / Matchmaker sections).

- [ ] **Step 6: Commit**

```bash
git add app/routes/_index.jsx
git commit -m "feat(home): bias existing sections toward for-you tagged products"
```

---

### Task 4: Add "For You" i18n keys to `app/lib/dictionaries.js`

**Files:**
- Modify: `app/lib/dictionaries.js` (four locations — one per locale block: `en`, `fr`, `es`, `pt-br`)

**Interfaces:**
- Produces: translation keys `foryou_eyebrow`, `foryou_title`, `foryou_sub`, `foryou_cta`, `foryou_section_aria`, consumed by `ForYouShowcase.jsx` (Task 5) via `useT()`.

- [ ] **Step 1: Locate the four locale blocks**

Run: `grep -n "arrivals_eyebrow" app/lib/dictionaries.js`
Expected: 4 line numbers (one per locale — `en` ~line 193, `fr` ~line 532, `es` ~line 861, `pt-br` ~line 1191; exact numbers may have shifted, use the grep output).

- [ ] **Step 2: Add the English block**

Near the `en` locale's `arrivals_eyebrow` group, add a new section:

```js
  // ── For You ───────────────────────────────────────────────────
  foryou_eyebrow: 'Curated for you',
  foryou_title: 'Picture this.',
  foryou_sub: 'A hand-styled edit — every shot made just for these products.',
  foryou_cta: 'Shop the edit',
  foryou_section_aria: 'For You showcase',
```

- [ ] **Step 3: Add the French block**

```js
  // ── For You ───────────────────────────────────────────────────
  foryou_eyebrow: 'Sélectionné pour vous',
  foryou_title: 'Imaginez ça.',
  foryou_sub: 'Une sélection stylisée — chaque photo créée pour ces produits.',
  foryou_cta: 'Découvrir la sélection',
  foryou_section_aria: 'Vitrine Pour vous',
```

- [ ] **Step 4: Add the Spanish block**

```js
  // ── For You ───────────────────────────────────────────────────
  foryou_eyebrow: 'Seleccionado para ti',
  foryou_title: 'Imagínalo así.',
  foryou_sub: 'Una selección con estilo propio — cada foto creada para estos productos.',
  foryou_cta: 'Ver la selección',
  foryou_section_aria: 'Vitrina Para ti',
```

- [ ] **Step 5: Add the Portuguese (Brazil) block**

```js
  // ── For You ───────────────────────────────────────────────────
  foryou_eyebrow: 'Selecionado para você',
  foryou_title: 'Imagine assim.',
  foryou_sub: 'Uma curadoria com estilo próprio — cada foto feita para estes produtos.',
  foryou_cta: 'Ver a seleção',
  foryou_section_aria: 'Vitrine Para você',
```

- [ ] **Step 6: Lint**

Run: `npm run lint -- app/lib/dictionaries.js`
Expected: no errors (in particular, no trailing-comma or duplicate-key lint failures — if `foryou_*` keys already exist anywhere in the file, ESLint won't catch duplicates but a quick `grep -c "foryou_eyebrow" app/lib/dictionaries.js` should show exactly 4).

- [ ] **Step 7: Commit**

```bash
git add app/lib/dictionaries.js
git commit -m "feat(i18n): add For You section translations (en/fr/es/pt-br)"
```

---

### Task 5: Build the `ForYouShowcase` component

**Files:**
- Create: `app/components/ForYouShowcase.jsx`
- Modify: `app/styles/app.css` (append new `pk-foryou` block — see Step 2)

**Interfaces:**
- Consumes: `useT()` from `~/lib/t`; `Image`, `Money` from `@shopify/hydrogen`; `Link` from `react-router`; `ScrollReveal` from `~/components/ScrollReveal`; `TiltCard` from `~/components/TiltCard`; `StarGlyph` from `~/components/StarGlyph`. Props: `{products: Array<{id, title, handle, featuredImage, priceRange}>}` (same product shape as every other homepage section).
- Produces: default... no, named export `ForYouShowcase` — `export function ForYouShowcase({products})`. Task 6 imports `{ForYouShowcase}` from `~/components/ForYouShowcase`.

- [ ] **Step 1: Create the component**

```jsx
import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {useT} from '~/lib/t';
import StarGlyph from '~/components/StarGlyph';
import {ScrollReveal} from '~/components/ScrollReveal';
import {TiltCard} from '~/components/TiltCard';

/**
 * ForYouShowcase — 1 large + 4 small magazine grid for the "for-you"
 * tagged products (AI-styled lifestyle shots). Never backfills with
 * untagged products: if fewer than 5 are available, renders fewer cards.
 *
 * @param {Object} props
 * @param {Array} props.products
 */
export function ForYouShowcase({products = []}) {
  const t = useT();
  const items = products.slice(0, 5);
  if (!items.length) return null;

  const [hero, ...rest] = items;

  return (
    <ScrollReveal variant="up">
      <section className="pk-foryou" aria-label={t('foryou_section_aria')}>
        <div className="pk-inner pk-foryou__head">
          <div>
            <p className="pk-foryou__eye"><StarGlyph /> {t('foryou_eyebrow')}</p>
            <h2 className="pk-foryou__title">{t('foryou_title')}</h2>
            <p className="pk-foryou__sub">{t('foryou_sub')}</p>
          </div>
          <Link to="/collections/for-you" className="pk-foryou__cta">
            {t('foryou_cta')} →
          </Link>
        </div>

        <div className="pk-foryou__grid pk-inner">
          <TiltCard className="pk-foryou__hero-wrap" maxTilt={4}>
            <Link to={`/products/${hero.handle}`} className="pk-foryou__hero" aria-label={hero.title}>
              {hero.featuredImage && (
                <Image data={hero.featuredImage} aspectRatio="4/5" sizes="(min-width: 900px) 560px, 100vw" loading="eager" />
              )}
              <div className="pk-foryou__hero-body">
                <p className="pk-foryou__name">{hero.title}</p>
                <div className="pk-foryou__price"><Money data={hero.priceRange.minVariantPrice} /></div>
              </div>
            </Link>
          </TiltCard>

          <div className="pk-foryou__rest">
            {rest.map((p) => (
              <TiltCard key={p.id} className="pk-foryou__small-wrap" maxTilt={4}>
                <Link to={`/products/${p.handle}`} className="pk-foryou__small" aria-label={p.title}>
                  {p.featuredImage && (
                    <Image data={p.featuredImage} aspectRatio="1/1" sizes="220px" loading="lazy" />
                  )}
                  <div className="pk-foryou__small-body">
                    <p className="pk-foryou__name">{p.title}</p>
                    <div className="pk-foryou__price"><Money data={p.priceRange.minVariantPrice} /></div>
                  </div>
                </Link>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
```

- [ ] **Step 2: Add CSS**

Append to `app/styles/app.css` (end of file is fine — this codebase already groups component styles loosely by section, not strictly alphabetically):

```css
/* ── For You showcase ───────────────────────────────────────── */
.pk-foryou {
  background: var(--pk-cream);
  padding: 64px 0;
}
.pk-foryou__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}
.pk-foryou__eye {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--pk-muted);
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}
.pk-foryou__title {
  font-size: clamp(28px, 4vw, 42px);
  color: var(--pk-ink);
  margin: 0 0 8px;
}
.pk-foryou__sub {
  color: var(--pk-muted);
  max-width: 480px;
  margin: 0;
}
.pk-foryou__cta {
  color: var(--pk-ink);
  font-weight: 600;
  white-space: nowrap;
  text-decoration: none;
  border-bottom: 1px solid var(--pk-ink);
  padding-bottom: 2px;
}
.pk-foryou__grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 16px;
}
.pk-foryou__hero, .pk-foryou__small {
  display: block;
  position: relative;
  text-decoration: none;
  color: inherit;
  border-radius: 12px;
  overflow: hidden;
  background: var(--pk-cream-soft);
}
.pk-foryou__hero-body, .pk-foryou__small-body {
  padding: 12px 14px;
}
.pk-foryou__name {
  font-weight: 600;
  color: var(--pk-ink);
  margin: 0 0 4px;
  font-size: 14px;
}
.pk-foryou__price {
  color: var(--pk-muted);
  font-size: 13px;
}
.pk-foryou__rest {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
@media (max-width: 760px) {
  .pk-foryou__grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Lint**

Run: `npm run lint -- app/components/ForYouShowcase.jsx app/styles/app.css`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/components/ForYouShowcase.jsx app/styles/app.css
git commit -m "feat(home): add ForYouShowcase component"
```

---

### Task 6: Wire `ForYouShowcase` into the homepage

**Files:**
- Modify: `app/routes/_index.jsx` (add `FOR_YOU_QUERY`, add `forYou` to `loadDeferredData`'s return + the `Index` component's render tree)

**Interfaces:**
- Consumes: `ForYouShowcase` from `~/components/ForYouShowcase` (Task 5)
- Produces: `data.forYou` resolves to `Array<Product>` for the For You section.

- [ ] **Step 1: Add the import**

Near the top of `app/routes/_index.jsx`, alongside the other component imports:

```js
import {ForYouShowcase} from '~/components/ForYouShowcase';
```

- [ ] **Step 2: Add the query constant**

Add near the other query constants (e.g. right before `RACK_QUERY`):

```js
/* ── For You — products tagged for-you (Higgsfield-image showcase) ── */
const FOR_YOU_QUERY = `#graphql
  fragment ForYouProduct on Product {
    id title handle
    tags
    priceRange { minVariantPrice { amount currencyCode } }
    featuredImage { id url altText width height }
  }
  query ForYou($country: CountryCode!, $language: LanguageCode!) @inContext(country: $country, language: $language) {
    products(first: 12, sortKey: BEST_SELLING, query: "tag:'for-you'") {
      nodes { ...ForYouProduct }
    }
  }
`;
```

- [ ] **Step 3: Fetch it in `loadDeferredData`**

Add alongside the other deferred queries (e.g. right after `trending`):

```js
const forYou = context.storefront
  .query(FOR_YOU_QUERY, {variables: {country, language}})
  .then((res) => diversifyByVendor(res?.products?.nodes ?? []))
  .catch((e) => { logError('forYou query failed', e); return []; });
```

Add `forYou` to the function's final return object:
```js
return {trending, rackProducts, bestPicks, catWorld, newArrivals, freshFinds, showcaseCollections, discoverProducts, matchProducts, forYou};
```

- [ ] **Step 4: Render it after the Marquee**

In the `Index` component, right after the `</div>` closing the `pk-dark-lead` hero block (i.e. right after `<Marquee isPlaying={isPlaying} />` and before the Discover Swiper's `<Suspense>` block), add:

```jsx
      {/* For You — Higgsfield-image showcase */}
      <Suspense fallback={null}>
        <Await resolve={data.forYou}>
          {(products) => <ForYouShowcase products={products ?? []} />}
        </Await>
      </Suspense>
```

- [ ] **Step 5: Lint**

Run: `npm run lint -- app/routes/_index.jsx`
Expected: no errors.

- [ ] **Step 6: Manual verification**

Run `npm run dev`, load the homepage. Confirm: (a) no GraphQL errors in console/terminal, (b) once Task 1 has tagged products, a "For You" section appears directly under the hero marquee with a large card + up to 4 small cards, all linking to real product pages with working images and prices, (c) if Task 1 hasn't run yet / zero tagged products exist, the section renders nothing (no broken empty section).

- [ ] **Step 7: Commit**

```bash
git add app/routes/_index.jsx
git commit -m "feat(home): wire ForYouShowcase section into homepage"
```

---

### Task 7: Create the `for-you` smart collection in Shopify

**Files:** None (Shopify Admin operation via `mcp__claude_ai_Shopify__graphql_mutation`).

**Interfaces:**
- Produces: a live collection at `/collections/for-you`, the destination of `ForYouShowcase`'s CTA link (Task 5/6).

- [ ] **Step 1: Look up the mutation shape**

Use `mcp__claude_ai_Shopify__graphql_schema` with `type_name: "Mutation"` to confirm `collectionCreate` exists and `type_name: "CollectionInput"` for its input shape (specifically the `ruleSet` field) — don't guess the shape from this plan.

- [ ] **Step 2: Create the collection**

```graphql
mutation createForYouCollection($input: CollectionInput!) {
  collectionCreate(input: $input) {
    collection { id handle title }
    userErrors { field message }
  }
}
```
with `variables.input` set to: title `"For You"`, handle `"for-you"`, a `ruleSet` with `appliedDisjunctively: false` and one rule `{column: TAG, relation: EQUALS, condition: "for-you"}`.

- [ ] **Step 3: Verify**

Query `collection(handle: "for-you") { id title productsCount { count } }` via `graphql_query` and confirm `productsCount.count` is greater than 0 (i.e. matches Task 1's tagged products).

- [ ] **Step 4: No commit needed**

This task makes no repo changes.

---

## Phase B — Shipping-reach map

### Task 8: Add the `react-simple-maps` dependency

**Files:**
- Modify: `package.json`, `package-lock.json` (via npm install)

- [ ] **Step 1: Install**

Run: `npm install react-simple-maps@^3`
Expected: `package.json` gains `"react-simple-maps": "^3.x.x"` under `dependencies`, `package-lock.json` updates.

- [ ] **Step 2: Verify it builds**

Run: `npm run lint`
Expected: no new errors (the package isn't imported yet, so this is just confirming the install didn't break anything).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add react-simple-maps dependency"
```

---

### Task 9: Create the shipping destinations data file

**Files:**
- Create: `app/lib/shippingDestinations.js`

**Interfaces:**
- Produces: `SHIPPING_DESTINATIONS` — `Array<{city: string, country: string, lat: number, lng: number, tier: 'major' | 'secondary'}>`. Consumed by `ShippingMap.jsx` (Task 10).

- [ ] **Step 1: Create the file**

```js
/**
 * Hand-curated, illustrative list of shipping destinations for the
 * homepage shipping-reach map. Not derived from real order data —
 * purely a visual representation of "we ship across the Americas,
 * UK & EU". `tier: 'major'` cities render larger/pulsing; `'secondary'`
 * cities render smaller/static to suggest broader organic reach.
 *
 * @typedef {{city: string, country: string, lat: number, lng: number, tier: 'major'|'secondary'}} ShippingDestination
 * @type {ShippingDestination[]}
 */
export const SHIPPING_DESTINATIONS = [
  // North America
  {city: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, tier: 'major'},
  {city: 'Vancouver', country: 'Canada', lat: 49.2827, lng: -123.1207, tier: 'major'},
  {city: 'Montreal', country: 'Canada', lat: 45.5019, lng: -73.5674, tier: 'secondary'},
  {city: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060, tier: 'major'},
  {city: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437, tier: 'major'},
  {city: 'Chicago', country: 'USA', lat: 41.8781, lng: -87.6298, tier: 'secondary'},
  {city: 'Austin', country: 'USA', lat: 30.2672, lng: -97.7431, tier: 'secondary'},
  {city: 'Miami', country: 'USA', lat: 25.7617, lng: -80.1918, tier: 'secondary'},
  {city: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332, tier: 'major'},
  {city: 'Guadalajara', country: 'Mexico', lat: 20.6597, lng: -103.3496, tier: 'secondary'},

  // South America
  {city: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333, tier: 'major'},
  {city: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lng: -43.1729, tier: 'secondary'},
  {city: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lng: -58.3816, tier: 'major'},
  {city: 'Bogotá', country: 'Colombia', lat: 4.7110, lng: -74.0721, tier: 'secondary'},
  {city: 'Santiago', country: 'Chile', lat: -33.4489, lng: -70.6693, tier: 'secondary'},
  {city: 'Lima', country: 'Peru', lat: -12.0464, lng: -77.0428, tier: 'secondary'},

  // UK & EU
  {city: 'London', country: 'UK', lat: 51.5072, lng: -0.1276, tier: 'major'},
  {city: 'Manchester', country: 'UK', lat: 53.4808, lng: -2.2426, tier: 'secondary'},
  {city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, tier: 'major'},
  {city: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, tier: 'major'},
  {city: 'Munich', country: 'Germany', lat: 48.1351, lng: 11.5820, tier: 'secondary'},
  {city: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038, tier: 'secondary'},
  {city: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041, tier: 'secondary'},
  {city: 'Dublin', country: 'Ireland', lat: 53.3498, lng: -6.2603, tier: 'secondary'},
];
```

- [ ] **Step 2: Sanity-check with a throwaway script (not committed)**

```bash
cat <<'EOF' > /tmp/check-destinations.mjs
import {SHIPPING_DESTINATIONS} from '/Users/danielc/puchica-storefront/app/lib/shippingDestinations.js';
console.log('total:', SHIPPING_DESTINATIONS.length);
console.log('major:', SHIPPING_DESTINATIONS.filter((d) => d.tier === 'major').length);
console.log('bad rows:', SHIPPING_DESTINATIONS.filter((d) =>
  typeof d.lat !== 'number' || typeof d.lng !== 'number' || !['major', 'secondary'].includes(d.tier)
));
EOF
node /tmp/check-destinations.mjs
```
Expected: `total: 24`, `major: 9`, `bad rows: []`. Delete `/tmp/check-destinations.mjs` after confirming.

- [ ] **Step 3: Lint**

Run: `npm run lint -- app/lib/shippingDestinations.js`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/lib/shippingDestinations.js
git commit -m "feat(lib): add hand-curated shipping destinations data"
```

---

### Task 10: Add shipping-map i18n keys

**Files:**
- Modify: `app/lib/dictionaries.js` (same four locale blocks as Task 4)

**Interfaces:**
- Produces: `shipmap_eyebrow`, `shipmap_title`, `shipmap_sub`, `shipmap_section_aria`, consumed by `ShippingMap.jsx` (Task 11).

- [ ] **Step 1: Add the English block**

Near the `foryou_*` keys added in Task 4 (same `en` locale section), add:

```js
  // ── Shipping map ──────────────────────────────────────────────
  shipmap_eyebrow: 'Where we ship',
  shipmap_title: 'From here to everywhere.',
  shipmap_sub: 'Toronto to Toronto, São Paulo to Berlin — Puchica ships across North & South America, the UK and the EU.',
  shipmap_section_aria: 'Shipping destinations map',
```

- [ ] **Step 2: Add the French block**

```js
  // ── Shipping map ──────────────────────────────────────────────
  shipmap_eyebrow: 'Où nous livrons',
  shipmap_title: "D'ici à partout.",
  shipmap_sub: 'De Toronto à Toronto, de São Paulo à Berlin — Puchica livre en Amérique du Nord et du Sud, au Royaume-Uni et dans l\'UE.',
  shipmap_section_aria: 'Carte des destinations de livraison',
```

- [ ] **Step 3: Add the Spanish block**

```js
  // ── Shipping map ──────────────────────────────────────────────
  shipmap_eyebrow: 'A dónde enviamos',
  shipmap_title: 'De aquí a todas partes.',
  shipmap_sub: 'De Toronto a Toronto, de São Paulo a Berlín — Puchica envía a Norte y Sudamérica, Reino Unido y la UE.',
  shipmap_section_aria: 'Mapa de destinos de envío',
```

- [ ] **Step 4: Add the Portuguese (Brazil) block**

```js
  // ── Shipping map ──────────────────────────────────────────────
  shipmap_eyebrow: 'Para onde enviamos',
  shipmap_title: 'Daqui para qualquer lugar.',
  shipmap_sub: 'De Toronto a Toronto, de São Paulo a Berlim — a Puchica envia para América do Norte e do Sul, Reino Unido e UE.',
  shipmap_section_aria: 'Mapa de destinos de envio',
```

- [ ] **Step 5: Lint + verify key count**

Run: `npm run lint -- app/lib/dictionaries.js && grep -c "shipmap_eyebrow" app/lib/dictionaries.js`
Expected: lint passes, grep prints `4`.

- [ ] **Step 6: Commit**

```bash
git add app/lib/dictionaries.js
git commit -m "feat(i18n): add shipping map translations (en/fr/es/pt-br)"
```

---

### Task 11: Build the `ShippingMap` component

**Files:**
- Create: `app/components/ShippingMap.jsx`
- Modify: `app/styles/app.css` (append new `pk-shipmap` block)

**Interfaces:**
- Consumes: `SHIPPING_DESTINATIONS` from `~/lib/shippingDestinations` (Task 9); `useT()` from `~/lib/t`; `ComposableMap`, `Geographies`, `Geography`, `Marker`, `ZoomableGroup` from `react-simple-maps` (Task 8); `ScrollReveal` from `~/components/ScrollReveal`.
- Produces: `export function ShippingMap()` — no props, self-contained (reads its own data + translations). Task 12 imports `{ShippingMap}` from `~/components/ShippingMap`.

- [ ] **Step 1: Create the component**

```jsx
import {useState} from 'react';
import {ComposableMap, Geographies, Geography, Marker, ZoomableGroup} from 'react-simple-maps';
import {useT} from '~/lib/t';
import StarGlyph from '~/components/StarGlyph';
import {ScrollReveal} from '~/components/ScrollReveal';
import {SHIPPING_DESTINATIONS} from '~/lib/shippingDestinations';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

/**
 * ShippingMap — decorative, pan/zoomable world map showing illustrative
 * shipping reach across the Americas, UK & EU. Data is hand-curated
 * (see app/lib/shippingDestinations.js), not derived from real orders.
 */
export function ShippingMap() {
  const t = useT();
  const [active, setActive] = useState(null);
  const [reducedMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );

  return (
    <ScrollReveal variant="up">
      <section className="pk-shipmap" aria-label={t('shipmap_section_aria')}>
        <div className="pk-inner pk-shipmap__head">
          <p className="pk-shipmap__eye"><StarGlyph /> {t('shipmap_eyebrow')}</p>
          <h2 className="pk-shipmap__title">{t('shipmap_title')}</h2>
          <p className="pk-shipmap__sub">{t('shipmap_sub')}</p>
        </div>

        <div className="pk-shipmap__canvas">
          <ComposableMap
            projectionConfig={{scale: 140}}
            style={{width: '100%', height: 'auto'}}
          >
            <ZoomableGroup center={[-40, 20]} zoom={1} minZoom={1} maxZoom={6}>
              <Geographies geography={GEO_URL}>
                {({geographies}) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      className="pk-shipmap__geo"
                      tabIndex={-1}
                    />
                  ))
                }
              </Geographies>

              {SHIPPING_DESTINATIONS.map((d) => (
                <Marker
                  key={`${d.city}-${d.country}`}
                  coordinates={[d.lng, d.lat]}
                  onMouseEnter={() => setActive(d)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(d)}
                  onBlur={() => setActive(null)}
                  onClick={() => setActive((prev) => (prev === d ? null : d))}
                >
                  <circle
                    r={d.tier === 'major' ? 5 : 2.5}
                    className={
                      d.tier === 'major' && !reducedMotion
                        ? 'pk-shipmap__dot pk-shipmap__dot--major'
                        : 'pk-shipmap__dot'
                    }
                    tabIndex={0}
                    role="button"
                    aria-label={`${d.city}, ${d.country}`}
                  />
                </Marker>
              ))}
            </ZoomableGroup>
          </ComposableMap>

          {active && (
            <div className="pk-shipmap__tooltip" role="status">
              {active.city}, {active.country}
            </div>
          )}
        </div>
      </section>
    </ScrollReveal>
  );
}
```

- [ ] **Step 2: Add CSS**

Append to `app/styles/app.css`:

```css
/* ── Shipping map ────────────────────────────────────────────── */
.pk-shipmap {
  background: var(--pk-ink);
  padding: 64px 0;
  color: var(--pk-cream);
}
.pk-shipmap__head {
  margin-bottom: 24px;
}
.pk-shipmap__eye {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--pk-lime);
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}
.pk-shipmap__title {
  font-size: clamp(28px, 4vw, 42px);
  color: var(--pk-cream);
  margin: 0 0 8px;
}
.pk-shipmap__sub {
  color: var(--pk-cream-soft);
  max-width: 560px;
  margin: 0;
}
.pk-shipmap__canvas {
  position: relative;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
}
.pk-shipmap__geo {
  fill: var(--pk-ink-soft, #1C1A12);
  stroke: var(--pk-ink-softer, #2A2820);
  stroke-width: 0.5;
  outline: none;
}
.pk-shipmap__dot {
  fill: var(--pk-lime);
  cursor: pointer;
  outline: none;
}
.pk-shipmap__dot--major {
  animation: pk-shipmap-pulse 2s ease-in-out infinite;
}
@keyframes pk-shipmap-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.pk-shipmap__tooltip {
  position: absolute;
  top: 12px;
  left: 36px;
  background: var(--pk-cream);
  color: var(--pk-ink);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  .pk-shipmap__dot--major {
    animation: none;
  }
}
```

- [ ] **Step 3: Lint**

Run: `npm run lint -- app/components/ShippingMap.jsx app/styles/app.css`
Expected: no errors.

- [ ] **Step 4: Manual verification**

Run `npm run dev`, navigate to a page that (temporarily, for this check) renders `<ShippingMap />` — or skip to Task 12 and verify in place on the homepage. Confirm: map renders, scroll-to-zoom and drag-to-pan both work, hovering/tapping a dot shows the tooltip with city name, major-tier dots pulse (and stop pulsing under simulated `prefers-reduced-motion: reduce` in DevTools).

- [ ] **Step 5: Commit**

```bash
git add app/components/ShippingMap.jsx app/styles/app.css
git commit -m "feat(home): add ShippingMap component"
```

---

### Task 12: Wire `ShippingMap` into the homepage

**Files:**
- Modify: `app/routes/_index.jsx`

**Interfaces:**
- Consumes: `ShippingMap` from `~/components/ShippingMap` (Task 11)

- [ ] **Step 1: Add the import**

```js
import {ShippingMap} from '~/components/ShippingMap';
```

- [ ] **Step 2: Render it before `CatalogStatement`**

Find:
```jsx
      {/* Catalog statement */}
      <CatalogStatement />
```

Replace with:
```jsx
      {/* Shipping reach map */}
      <ShippingMap />

      {/* Catalog statement */}
      <CatalogStatement />
```

(`ShippingMap` is self-contained — no `Suspense`/`Await` needed since it has no loader data dependency, per Task 11's design.)

- [ ] **Step 3: Lint**

Run: `npm run lint -- app/routes/_index.jsx`
Expected: no errors.

- [ ] **Step 4: Manual verification**

Run `npm run dev`, load the homepage, scroll to just above the "6,000+" catalog statement counter. Confirm the shipping map section renders there with working pan/zoom and tooltips, and doesn't visually clash with the dark `pk-catalog-cta` section immediately below it (both should read as intentionally dark/contrasting against the cream sections around them).

- [ ] **Step 5: Commit**

```bash
git add app/routes/_index.jsx
git commit -m "feat(home): wire ShippingMap section into homepage"
```

---

## Self-Review Notes

- **Spec coverage:** Tagging (Task 1), audit-fix (Task 1), new section (Tasks 4-6), bias (Tasks 2-3), smart collection (Task 7), i18n (Tasks 4, 10) — all covered for Phase A. Library choice, data file, component, placement, a11y/reduced-motion — all covered for Phase B (Tasks 8-12).
- **Placeholder scan:** no TBD/TODO; all code blocks are complete; Task 1's mutation name is flagged as "confirm via `graphql_schema`" rather than guessed, which is a deliberate safety step for a production-data mutation, not a placeholder — Step 1 of Task 1 gives the exact read query and stop condition needed regardless of which exact reorder mutation name the schema confirms.
- **Type/name consistency:** `prioritizeTag(items, tag)` (Task 2) called the same way in Task 3; `ForYouShowcase({products})` (Task 5) called the same way in Task 6; `SHIPPING_DESTINATIONS` shape (Task 9) matches what `ShippingMap.jsx` (Task 11) destructures (`city, country, lat, lng, tier`).
