# Puchica — brand foundation

Written 2026-09-10, before paid traffic. The point of this doc is that every
surface — page titles, product copy, ads, email, the About page — can be checked
against one source instead of being invented per surface and drifting.

Companion to `claude/section-architecture.md` (how pages get built) and
`claude/supply-structure-and-duty.md` (what can actually be sold).

## The position, in one line

**A shop that refuses to oversell.**

That is not a tone note, it is the differentiator, and it is worth being
deliberate about because it is unusual in this category. Dropshipping is built
on overclaiming: invented review counts, "handmade by artisans", "made to
order", urgency timers, fake scarcity. Puchica already does the opposite, and
the codebase ENFORCES it — `tests/product-copy.test.js` fails the build if
product copy claims goods are handmade. The store's own live copy says:

> We are a small Canadian shop in Winnipeg. We do not have thousands of reviews
> yet and we are not going to invent any.

That sentence is the brand. Most competitors cannot write it, because it is not
true for them. It costs nothing and it is not copyable by anyone running the
standard playbook.

The commercial argument, not just the ethical one: the store sells a
considered-purchase item to a customer who is comparison-shopping against
Amazon. That customer has been burned by dropship listings before. Visible
restraint is a trust signal precisely where trust is the binding constraint.

## What the store actually is

- Woven bamboo pendant and plug-in wall lighting.
- Two products listed today. That number is small and the copy says so rather
  than implying a catalogue behind it.
- Ships direct from suppliers to customers in the United States.
- One person, working from Winnipeg.

Canada is not a market — it is where Daniel lives. The `.ca` domain and the
`puchica.canada` / `@puchica_canada` social handles both point the other way,
which is a real tension and is listed under Open questions below.

## The name

*Puchica* is a Central American exclamation — Salvadoran and Guatemalan,
roughly "wow" or "damn", the mild version of something stronger. It is a warm,
everyday word, not a designed brand name.

Two consequences worth holding to:

- The brand can be **warm and unfussy** without permission. The name already is.
- The heritage is **real, not decorative**. Daniel's roots are Central American.
  The store may reference that. It may NOT imply the goods are Central American,
  because they are not — they are sourced from Chinese suppliers. Heritage
  belongs to the shop, never to the product.

That distinction is the same discipline as the handmade rule: say true things
about who we are, never transfer them onto what we sell.

## Palette — already decided, do not re-invent

Recorded in `app/styles/app.css` as the "Añil pass, August 2026". One palette,
one temperature, built on El Salvador's indigo.

| token | hex | role |
|---|---|---|
| `--pk-anil` | `#1C2951` | primary. El Salvador's indigo — the "blue gold" export the country was built on |
| `--pk-anil-deep` | `#16213F` | hover / pressed |
| `--pk-anil-panel` | `#243560` | large filled panels |
| `--pk-tenido` | `#5C7CB8` | mid indigo. *teñido* = dyed |
| `--pk-tint` | `#E8EDF6` | pale indigo fill |
| `--pk-torogoz` | `#00B2A9` | turquoise, after El Salvador's national bird. **Strokes and large glyphs only — never small text on light** |
| `--pk-barro` | `#A64B21` | clay. The sole warm note |
| `--pk-ink` | `#191A1E` | body text |
| `--pk-cream` | `#F1EEE7` | surface |
| `--pk-bg` | `#F7F5F0` | page ground |

The legacy token names (`--pk-ember`, `--pk-marigold`, `--pk-lime`, `--pk-spark`,
`--pk-violet`) are all **remapped to añil** so old usages re-skin automatically.
Do not introduce a new hue by reaching for one of those names — it will come out
indigo, correctly.

Two contrast rules already measured and not to be relitigated:

- **Text over any photograph sits on `rgba(20,22,31,0.65)` and nothing else.**
  Against a white photo that composites to `#66686D`: white holds 5.58:1, the
  `#E8EDF6` tint 4.75:1. A 0.60 scrim was tested and rejected — the tint only
  reaches 4.02:1 there. axe cannot check text on images, so the backdrop is made
  deterministic instead of trusted.
- **`#9DB4EE` is barred over imagery** at 2.71:1. Panel only.

## Visual direction — decided 2026-09-10

Reference images supplied: a Central American market street, a Guatemalan
striped textile, a set of Lakota Sioux swatches, and a sheet of pre-Columbian
graphic motifs.

**The palette is NOT being replaced.** The references point at hot, saturated
multicolour; the Añil pass points at one temperature. These are less opposed
than they look — añil is the dye *in* those textiles, and El Salvador's indigo
is the restrained reading of the same heritage rather than a departure from it.

What changes is proportion, not hex values. **Barro and torogoz come off the
leash**: barro moves from lone accent to carrying section breaks and calls to
action; torogoz moves from strokes-only to fills and large glyphs. It still
never sets small text on light. No new colours are introduced.

**Pattern carries the heritage, colour does not.** The pre-Columbian reference
is black-on-cream — a pattern language. Stepped frets and spirals sit on top of
añil without fighting it, where extra hues would only muddy it.

- Pattern belongs on: section dividers, footer bands, About, email and
  packing-slip furniture, empty states. Anywhere the SHOP is speaking.
- Pattern must not appear on: product photography, product cards, PDP galleries,
  or ad creative showing a product. Anywhere it could be read as provenance.

**The Lakota swatches were set aside.** That is a Plains North American palette,
not Mesoamerican. Borrowing another people's visual identity has no defence, and
añil is already both his and in the code.

### The visual line — the handmade rule, applied to pictures

The risk of an "indigenous artisanal" aesthetic on dropshipped goods is that the
claim banned in words gets made louder in images. A styled market-stall product
shot implies a maker and a provenance as clearly as the word "handmade" does.

- **The shop may look Central American.** Palette, pattern, About page, the story
  of the name.
- **Products stay plainly photographed and plainly described.** Supplier imagery,
  real dimensions, stated limits, no styled context implying origin.

### Selection criteria for sourcing

Select for natural fibre and warm wood, woven or ribbed or turned texture,
unglazed clay, handloom-look textiles — **but only inside categories that
manufacture in runs**: lighting, framed mirrors, fixtures.

Stop selecting baskets, trays, individual craft pieces and one-off decor. Twenty-
five listings were clamped on 9–10 September; craft goods went zero for six
across four materials, with best per-SKU stock in single digits, while woven
bamboo lighting holds thousands. The aesthetic and the supply reality currently
overlap in exactly one category, and it is the one already live.

## Voice

Plain, specific, and willing to say the unflattering thing.

**Do**
- Name the thing. "A woven bamboo shade" beats "elevate your space".
- Give the number. 30 cm, E27, 120 cm cord, 9 to 12 days.
- State limits before the customer finds them. "Bulb not included."
  "This is a hardwired fixture — if you are not comfortable at a ceiling box,
  have an electrician hang it."
- Say what we do not know. Delivery windows are the supplier's quoted ones, and
  where they are not confirmed the copy says so.
- Write like one person, because it is one person.

**Do not**
- Claim handmade, hand-woven, artisan, or made to order. These are bought and
  shipped direct. The build fails on it.
- Invent reviews, ratings, scarcity, or countdowns.
- Use "elevate", "curated", "luxury", "must-have", "game-changer".
- Imply a catalogue that does not exist. Two products is two products.
- Transfer the shop's Central American heritage onto the goods.

**Register check:** if a sentence would still be true written by a competitor
who has never seen the product, it is marketing filler and should be cut.

## Naming

- **Product titles**: material, form, size. "Woven Bamboo Pendant Light — 30cm".
  No adjectives that cannot be verified from the listing.
- **Collections**: what a customer would type, not what a merchandiser would
  file it under. "Pendant lights", not "Illumination".
- **Sections**: content lives in metaobjects now, so section headings are edited
  in Shopify admin and should follow the same voice rules as product copy.

## Where the brand is asserted in code

| surface | file | status |
|---|---|---|
| Organization JSON-LD description | `app/lib/brand.js` `BRAND_DESCRIPTION` | **fixed 2026-09-10** — described retired travel organizers until today |
| Page titles + meta, 4 locales | `app/lib/launch-meta.js` | current and truthful |
| Palette + contrast contract | `app/styles/app.css` (Añil pass) | current |
| Logo | `app/lib/brand.js` `STORE_LOGO_URL` | Shopify CDN SVG; Header/Footer prefer Settings → Brand when set |
| Social profiles | `app/lib/brand.js` `SOCIAL_PROFILES` | Instagram, Facebook, TikTok — all "canada" handles |
| Product copy rules | `tests/product-copy.test.js` | enforced at build time |

## Open questions — Daniel's calls, not mine

1. **`.ca` domain, US market.** `puchica.ca` and `checkout.puchica.ca` sell to
   American customers. This is survivable, and plenty of shops do it, but it is
   a small trust tax at checkout for a first-time US buyer. Options: leave it,
   buy `puchica.com` and redirect, or make the Canadian ownership explicit
   enough that the domain reads as a fact rather than a mistake.
2. **Social handles say Canada.** Same tension, cheaper to change than a domain,
   more disruptive to follower counts. Currently negligible either way.
3. **Shopify's own shop description is EMPTY.** It should carry the same line as
   `BRAND_DESCRIPTION`. Settings → Store details.
4. **How far to lean on the Central American story.** It is genuine and it is
   distinctive, but the goods are not from there. The honest version is that it
   is the shop's story and the palette's origin — an About page subject, not a
   product page one. Worth deciding before writing About.
5. **No brand mark beyond a wordmark logo.** Fine for now; becomes a gap once
   there is packaging, email, or an ad account.

## Not yet done

- The homepage still renders `SmallSpaceLanding.jsx`, 413 hardcoded lines
  written for the travel-organizer store.
- Live product descriptions still say "hand-woven" and "Made to order" in body
  copy and image alt text on both active products, and in tags on the drafted
  ones. The dictionaries were cleaned; the Shopify product records were not.
- `app.css` is 256 KB in one file with no token layer extracted, so the palette
  above is embedded rather than importable.
