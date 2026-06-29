# Homepage & Site-Wide UI Redesign — Design Spec
**Date:** 2026-06-29
**Scope:** Global button system, homepage section rhythm, product cards, typography scale

---

## 1. Direction

**Playful Premium** — big expressive type, unexpected color moments, strict light/dark section alternation. Confident editorial feel (think A24, Highsnobiety) without losing the warmth of the Puchica brand palette.

---

## 2. Global Design Tokens (additions/changes)

No new color tokens needed — existing palette covers everything:

| Token | Value | Use |
|-------|-------|-----|
| `--pk-paper` | `#F2EBDA` | Light section background |
| `--pk-indigo-900` | `#160F3A` | Dark section background (primary) |
| `--pk-violet-deep` | `#4B3BCC` | Dark section background (accent — new token) |
| `--pk-ember` | `#CC4300` | Primary CTA, badges on light sections |
| `--pk-violet-500` | `#6D4CFF` | Badges on dark sections |

Add to `:root`:
```css
--pk-violet-deep: #4B3BCC;
--pk-section-pad: 80px;
```

---

## 3. Button System (site-wide replacement)

All existing rounded/pill buttons are replaced with this sharp system.

### Shape
- `border-radius: 2px` universally
- `border: 1.5px solid currentColor` (primary), `1px solid currentColor` (secondary)
- `padding: 12px 28px` (primary), `10px 20px` (secondary)
- `font-size: 13px`, `font-weight: 700`, `letter-spacing: 0.08em`, `text-transform: uppercase`
- No transition on background/color — hard swap on hover for sharpness

### Variants

**Primary (light section)**
- Rest: no fill, `border: 1.5px solid #160F3A`, indigo text
- Hover: `background: #CC4300`, `border-color: #CC4300`, white text

**Primary (dark section)**
- Rest: no fill, `border: 1.5px solid #fff`, white text
- Hover: `background: #fff`, indigo text

**Secondary**
- Same shape, `1px border`, smaller padding
- Used for: "View all", elevated nav links, ghost actions

### MagneticButton.jsx
Keep magnetic effect, apply `border-radius: 2px` to override current shape.

---

## 4. Typography Scale

### Section Headlines
```css
font-size: clamp(52px, 7vw, 88px);
line-height: 0.95;
font-weight: 800;
```
Mixed case (not forced all-caps). The size and weight carry authority.

### Eyebrow Labels
Every section gets a small label above the headline:
```css
font-size: 11px;
font-weight: 700;
letter-spacing: 0.15em;
text-transform: uppercase;
color: var(--pk-ember); /* ember on light, rgba(255,255,255,0.5) on dark */
margin-bottom: 12px;
```
Examples: `— NEW ARRIVALS`, `— CURATED FOR YOU`, `— TOP PICKS`

### Body / Everything Else
Unchanged from current.

---

## 5. Homepage Section Rhythm

Strict alternation: paper → dark indigo → paper → deep violet → repeat. No two adjacent sections share a background family. Each section: `padding: var(--pk-section-pad) 0`.

| # | Section | Background | Text | Badge/Accent |
|---|---------|-----------|------|--------------|
| 1 | Hero | `#F2EBDA` | `#160F3A` | ember CTA |
| 2 | Trending ticker | `#160F3A` | white | ember highlights |
| 3 | Top picks carousel | `#F2EBDA` | `#160F3A` | ember badges |
| 4 | Small wins carousel | `#160F3A` | white | violet badges |
| 5 | Pick a budget | `#F2EBDA` | `#160F3A` | ember on budget tiles |
| 6 | Puchica Match | `#4B3BCC` | white | ember |
| 7 | Get outside | `#F2EBDA` | `#160F3A` | violet badges |
| 8 | Find your thing | `#160F3A` | white | ember |
| 9 | Three rooms | `#F2EBDA` | `#160F3A` | violet |
| 10 | Skin section | `#160F3A` | white | ember |
| 11 | Reorder list | `#F2EBDA` | `#160F3A` | ember |
| 12 | Stats / footer | `#160F3A` | white | ember |

---

## 6. Product Cards

### On Light Sections (paper background)
- `background: #fff`, `border-radius: 2px`, no shadow at rest
- Hover: `outline: 2px solid #160F3A`, `transform: translateY(-3px)`
- Image: top 58% of card
- Below image (tight stack):
  - Vendor: `11px` uppercase muted
  - Title: `14px font-weight: 700`, 2-line clamp
  - Price: `16px font-weight: 800`
- On hover: "Add to cart" CTA slides up from bottom (`translateY(100%) → 0`), sharp outlined style, full card width

### On Dark Sections (indigo/violet background)
- `background: rgba(255,255,255,0.06)`, glass effect
- Border: `1px solid rgba(255,255,255,0.12)` rest → `rgba(255,255,255,0.4)` hover
- Text: white
- CTA on hover: white fill, indigo text

### Badges (top-left, always visible)
- Shape: `border-radius: 2px`, `padding: 3px 8px`, `font-size: 10px font-weight: 700 uppercase`
- Badge color by product tag:

| Tag | Light section badge | Dark section badge |
|-----|--------------------|--------------------|
| `new-arrival` | ember fill, white text | ember fill, white text |
| `top-pick` | violet `#6D4CFF` fill, white text | violet fill, white text |
| `trending` | indigo `#160F3A` fill, white text | white fill, indigo text |
| `staff-pick` | paper `#F2EBDA` fill, indigo text | white fill, indigo text |

---

## 7. Out of Scope

- Navigation / header redesign
- Mobile-specific layout changes (cards/sections inherit responsively)
- New product data or Shopify metafield changes
- Animation timing beyond the existing lenis/scroll-reveal setup
