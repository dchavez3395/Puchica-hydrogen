# Ink-Block Audit 2026-06-29

## Reported problem
"Too many fully black blocks" — Daniel, 2026-06-29 09:35 CDT. Visual heaviness
from overuse of `--pk-ink` (`#0E0C08`, warm black) as a section background.

## Inventory

Full-project scan of `app/styles/app.css`:
**41 ink-background uses across 27 distinct selectors.**

### Categorized

**A. Identity anchors (KEEP)**
- `.pk-footer` — site footer, single dark mass at the bottom
- `.pk-ann` (announcement bar)
- `.pk-marquee` — scrolling ticker strip
- `.pk-marquee` — useful for visual rhythm, small footprint

**B. Large section backgrounds (REVIEW / candidate for reduction)**
- `.pk-hero--bold` — alternative hero style, used 0 places on homepage
- `.pk-promo__panel` — rounded ink panel, used in promo areas
- `.pk-news` — full-width newsletter band, used on home (BIG)
- `.pk-col-hero` — collection page hero (rounded ink panel, 5 pages)
- `.pk-mosaic__cell` — large grid cells in homepage mosaic

**C. Card accent surfaces (KEEP, intentional)**
- `.pk-card__badge`, `.pk-review__avatar`, `.pk-empty-cart__icon`,
  `.pk-mood__card`, `.pk-mega__featured-tile` — all small/contained accent uses
  where ink provides visual punctuation

**D. Buttons (KEEP, intentional)**
- `.pk-btn--primary`, `.pk-btn--ink`, `.pk-card__viewbtn`,
  `.pk-catalog-cta .pk-btn--ink`

**E. Image placeholder surfaces (KEEP, expected)**
- `.pk-story__media` — image slot bg while loading

## Top 5 overuse offenders (per Daniel's complaint)

Evaluated by visible area on the homepage specifically. Sections only,
not buttons or accents.

| Rank | Selector | Lines | Notes |
|---|---|---|---|
| 1 | `.pk-arrivals` | 2624 | Full-width dark strip near top of homepage. Used in `pk-arrivals` card group layout. |
| 2 | `.pk-news` | 2836 | Full-width newsletter band. 60px+60px padding. |
| 3 | `.pk-mood__card` | 2703 | Individual mood grid cells (6 on home). |
| 4 | `.pk-col-hero` | 2959 | Collection page header, rounded panel. |
| 5 | `.pk-mosaic__cell` | 4447 | Each cell in homepage mosaic. |

## Proposed direction (awaits Daniel)

Default proposed (can revert):
- `.pk-arrivals` L2624: change `background: #0E0C08` →
  `background: var(--pk-cream-soft)` (light cream) with `border-top/bottom: 1px solid var(--pk-cream-dark)`
  so the strip still has visual identity without being a full black mass.
- `.pk-news` L2830: keep ink. It's the only CTA signoff block on the page; high-contrast
  here helps the email signup earn its prominence. Reduce padding from 60px/24px to 48px/24px
  so it feels less heavy.
- `.pk-mood__card` L2697: change `--pk-ink` to `var(--pk-cream-dark)`. Mood cards become
  light surface with image overlay; ink becomes the scarcer accent.
- `.pk-mosaic__cell` keep ink. Each mosaic cell is short; ink here gives the mosaic
  its dramatic visual rhythm.
- `.pk-col-hero` reduce vertical padding from `52px 44px` → `40px 32px` so the
  collection hero feels less like a "block."

**Aggregate impact:** removal of 1 full-width black strip (the worst offender),
reduced padding on 2 more, lighter cards in mood grid. The other 32 ink
uses are not visual blocks and stay.

## What I did not change today

Wrote this audit, did not unilaterally apply color changes. Awaiting
Daniel's call on color direction (next message or explicit "go ahead").
