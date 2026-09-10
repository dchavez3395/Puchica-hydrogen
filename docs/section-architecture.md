# Page sections — architecture and how to use it

Added 2026-09-10. Companion to `claude/supply-structure-and-duty.md` (sourcing)
and the deploy notes.

## Why this exists

Before this, the storefront had **no content architecture at all**:

- `collections.$handle.jsx` was 24 lines, every one a 301 redirect. Every
  category URL bounced to `/collections/all`.
- `collections._index`, `explore`, `best-sellers`, `new-arrivals` and `sale`
  were redirect stubs too.
- Zero metaobject usage anywhere in `app/`.
- The homepage was `SmallSpaceLanding.jsx`, 413 lines of hardcoded JSX.

Adding a page meant writing a route file. That does not scale, and it meant
Daniel could not change any page without a developer.

## Why metaobjects and not "sections and blocks"

Sections and blocks are a **Liquid theme** feature. Hydrogen has no equivalent
and cannot have one — there is no theme editor rendering the storefront.

The standard substitute, and what is implemented here, is **Shopify metaobjects
as the content store**. A merchant creates section entries in Shopify admin,
attaches an ordered list of them to a collection through a metafield, and the
storefront maps each entry's `type` to a React component at render time.

The practical result is the same one a theme editor gives: adding, reordering
or rewording a section is an admin edit, not a deploy. Only a genuinely NEW KIND
of section needs code — one component plus one line in the registry.

## What was built

| file | role |
|---|---|
| `app/lib/sections.js` | Storefront fragment + tolerant field readers |
| `app/sections/registry.jsx` | type -> component map, and `<SectionRenderer>` |
| `app/sections/SectionHero.jsx` | heading block, optionally over a photo |
| `app/sections/SectionRichText.jsx` | heading + paragraphs |
| `app/sections/SectionCategoryTiles.jsx` | row of collection tiles |
| `app/sections/SectionProductGrid.jsx` | grid of the products the PAGE loaded |
| `app/routes/collections.$handle.jsx` | **real category template**, replacing the 301 |
| `app/styles/app.css` | section styles, appended |

Created in Shopify:

| object | id |
|---|---|
| metaobject `section_hero` | `gid://shopify/MetaobjectDefinition/23631888634` |
| metaobject `section_rich_text` | `gid://shopify/MetaobjectDefinition/23631921402` |
| metaobject `section_category_tiles` | `gid://shopify/MetaobjectDefinition/23631954170` |
| metaobject `section_product_grid` | `gid://shopify/MetaobjectDefinition/23633101050` |
| metaobject `page_layout` | `gid://shopify/MetaobjectDefinition/23632806138` |
| metafield `custom.sections` on COLLECTION | `gid://shopify/MetafieldDefinition/263687799034` |

All four carry `access: {storefront: PUBLIC_READ}`, without which the Storefront
API returns them as null and every section silently vanishes.

`custom.sections` is `list.mixed_reference`, not `list.metaobject_reference` —
the single-type list can only point at ONE definition, so a mixed list is the
only way one collection can carry a hero AND text AND tiles.

## How to add a section (no deploy)

1. Shopify admin → Content → Metaobjects → pick a Section type → Add entry.
2. Fill the fields. Leave optional ones blank; components handle absence.
3. Collections → pick a collection → Metafields → **Sections** → add the entry,
   drag to order.

Sections render above the product grid, in that order.

## Guardrails this had to move, and why it was not just deleting them

Two tests failed, and both were deliberate. They were rewritten, not removed.

**`retired broad-catalog homepage sections stay removed`** asserted
`app/sections/` was EMPTY. That directory once held the retired broad-catalog
homepage — hardcoded departments for phone cases, pet supplies and electronics
the store no longer sells. The new system is the opposite thing: it hardcodes no
departments, because every section's content is fetched at request time and a
section whose collection disappears renders nothing. Banning the directory would
ban the fix along with the problem. The test now asserts the property that
actually mattered — no section component may name a retired department or embed
a taxonomy of its own.

**`retired discovery hubs permanently redirect`** pinned `collections._index`,
`explore` AND `collections.$handle` as permanent 301s. The first two stay
redirected: they advertised a department taxonomy and nothing has refilled it.
`collections.$handle` was removed from that list because the redirect had become
actively harmful — it swallowed the `?price=` filter that `collections.all.jsx`
explicitly routes to these URLs to apply, so the homepage budget cards silently
did nothing.

A NEW test replaced it, pinning the three escape hatches that made removing the
redirect safe at all:

- `STOREFRONT_CONTAINMENT_ACTIVE` still wins outright
- an empty result set sets `noindex` rather than publishing a bare page
- products still run through `filterLaunchProducts`

That last set is the real answer to "why was the redirect there" — an empty
category page gets crawled and ranks the store for a department it cannot serve.

## Gates

lint, 374/374 tests, payload-health, launch-check, build — all pass.

Two things payload-health caught while building, worth knowing:

- `sectionFlag` was written speculatively and nothing used it. `export-usage`
  failed the build. It was deleted rather than given a fake caller. **Every
  export must have a real consumer in the same change.**
- Every CSS class added to `app.css` must appear in JSX or `stylesheet-usage`
  flags it. There is one pre-existing offender, `pk-logo__img`.

## Page layouts — one entry per page, addressed by handle

`page_layout` (metaobject `gid://shopify/MetaobjectDefinition/23632806138`)
holds an ordered `sections` list. **The handle picks the page**: the entry with
handle `home` lays out the homepage. The same primitive covers About or any
other route later without new code.

A page with no entry keeps whatever layout is compiled into its route.

## The homepage is a migration, not a cutover

`SmallSpaceLanding.jsx` — 413 lines written for the retired travel-organizer
catalogue — has NOT been deleted. `_index.jsx` now renders metaobject sections
when a `page_layout` entry with handle `home` carries any, and the built-in
landing otherwise.

That means the switch is reversible from Shopify admin with **no deploy in
either direction**. Create the entry and the new homepage goes live; delete it
and the old one comes straight back. For a live front door that is the only
sane way to do it — and it means the new homepage can be built and previewed
incrementally rather than landing in one commit.

Two details that matter:

- The layout lookup is **its own request with its own catch**. If metaobjects
  are unreachable or misconfigured, the homepage still renders its product
  cohort. A content system that can take the front door down is worse than no
  content system.
- `tests/operations-guardrails.test.js` pins both properties — the fallback and
  the isolated catch — so neither can be quietly removed.

## The product grid fetches nothing

`section_product_grid` renders the products the ROUTE already loaded. It has no
query of its own, deliberately: a metaobject with its own product query would
let a merchant turn one render into four round trips by adding three of them to
a page, and it would let admin content decide what the storefront queries —
which is the coupling `filterLaunchProducts` exists to prevent.

The homepage passes its launch cohort. **The collection route passes nothing**,
because its own grid is paginated and a section cannot paginate; a grid section
dropped onto a collection page renders nothing rather than a second truncated
copy of the list already on screen. That constraint is written into the
metaobject's admin description so it is discoverable before it is confusing.

## Palette proportions applied 2026-09-10

Per `claude/brand-foundation.md`: barro and torogoz came off the leash. No new
hex values — the Añil pass tokens are unchanged, only their proportions.

- **Barro** (`--pk-barro`) now carries calls to action. The hero CTA moved off
  cobalt. Hover is `color-mix(in srgb, var(--pk-barro) 84%, black)` rather than
  a new token.
- **Torogoz** (`--pk-torogoz`) now rules section headings at 2px and outlines
  blank tiles. Both are strokes, so the "never small text on light" bar still
  holds — this is the promoted use the direction called for, not a relaxation.

## Not done yet

- No `page_layout` entry exists yet, so the homepage still renders
  `SmallSpaceLanding.jsx`. Building the entry in admin is what switches it.
- `app/lib/brand.js` still describes the store as "a focused edit of practical
  travel organizers". That is the brand identity in code and it is wrong.
- No section ENTRIES exist yet — the definitions are empty. Nothing renders
  until entries are created and attached.
- `app.css` is 256 KB in one file with no token layer extracted.
