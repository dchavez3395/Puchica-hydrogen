# Homepage & Site-Wide UI Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the "Playful Premium" design system across the homepage and globally — sharp button system, oversized typography, strict light/dark/violet section alternation, and upgraded product cards with badge logic and hover CTAs.

**Architecture:** All changes are CSS-first. Section backgrounds are set directly on each section's existing class (no new utility wrapper divs needed). Typography uses new shared `.pk-headline` / `.pk-eyebrow` classes applied via CSS to existing section heading selectors. Product card changes split between `ProductItem.jsx` (badge logic + `dark` prop) and `app.css` (glass variant + slide-up CTA).

**Tech Stack:** React (JSX), CSS (vanilla, BEM-style `.pk-` prefix), Shopify Hydrogen, Vite

## Global Constraints

- `border-radius` on all interactive elements (buttons, cards, badges): `2px` maximum — no pill shapes, no `999px`, no `12px+`
- Section padding: `80px 0` per section (existing sections already set padding — update where different)
- Primary button hover: hard color swap (no `transition` on `background` or `color`)
- Font sizes: section headlines `clamp(52px, 7vw, 88px)`, eyebrows `11px uppercase`
- `--pk-paper`: `#F2EBDA`, `--pk-indigo-900`: `#160F3A`, `--pk-violet-deep`: `#4B3BCC` (new token)
- Build command: `npm run build` — must pass after each task
- Dev server: `shopify hydrogen dev` — use for visual verification

---

## File Map

| File | What changes |
|------|-------------|
| `app/styles/app.css` | All CSS — tokens, buttons, typography, section BGs, card styles |
| `app/components/ProductItem.jsx` | Add `dark` prop, badge logic from `product.tags` |

No new files needed.

---

## Section Background Assignment (current → new)

| Section class | Current bg | New bg | Text flip |
|--------------|-----------|--------|-----------|
| `pk-hero2` | transparent | no change | — |
| `pk-marquee` | `#0E0C08` | no change | — |
| `pk-matchmaker` | `#0E0C08` | `#4B3BCC` | stays white |
| `pk-swiper` | `#0E0C08` | `#F2EBDA` | white → dark |
| `pk-rack` | `#F4F0E6` | `#160F3A` | dark → white |
| `pk-arrivals` | `#0E0C08` | `#F2EBDA` | white → dark |
| `pk-gift` | cream | `#160F3A` | light → white |
| `pk-bento` | `#0E0C08` | `#F2EBDA` | white → dark |
| `pk-rack--fresh` | cream (via `pk-rack`) | `#160F3A` | dark → white |
| `pk-feat-banner` | `var(--pk-ink)` | `#F2EBDA` | white → dark |
| `pk-catalog-cta` | cream | `#160F3A` | light → white |

---

## Task 1: Design Token

**Files:**
- Modify: `app/styles/app.css:1` (`:root` block, around line 1–21)

- [ ] **Step 1: Add `--pk-violet-deep` to `:root`**

In `app/styles/app.css`, find the `:root` block (line 1) and add after `--pk-gutter`:

```css
--pk-violet-deep: #4B3BCC;
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```
Expected: `✓ built in` — no errors.

- [ ] **Step 3: Commit**

```bash
git add app/styles/app.css
git commit -m "design: add --pk-violet-deep token"
```

---

## Task 2: Button System

**Files:**
- Modify: `app/styles/app.css` — `.pk-btn` base + all variant rules

The entire button system gets `border-radius: 2px`. The primary button becomes outlined with a hard-swap hover (no transition on `background`/`color`). All existing radius values in button rules (`12px`, `14px`, `999px`, `8px`) are replaced with `2px`.

- [ ] **Step 1: Replace `.pk-btn` base rule**

Find `.pk-btn {` (line ~1485). Replace the entire block:

```css
.pk-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--pk-font-body);
  font-weight: 700;
  border-radius: 2px;
  padding: 12px 28px;
  text-decoration: none;
  border: 1.5px solid currentColor;
  cursor: pointer;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
```

- [ ] **Step 2: Replace `.pk-btn--primary` (outlined, light section)**

Find `.pk-btn--primary {` and its `:hover`. Replace both:

```css
.pk-btn--primary {
  background: transparent;
  color: #160F3A;
  border: 1.5px solid #160F3A;
  box-shadow: none;
}
.pk-btn--primary:hover {
  background: #CC4300;
  border-color: #CC4300;
  color: #fff;
  transform: none;
  box-shadow: none;
}
```

- [ ] **Step 3: Add `.pk-btn--primary-dark` (outlined, dark section)**

After the `.pk-btn--primary:hover` rule, add:

```css
.pk-btn--primary-dark {
  background: transparent;
  color: #fff;
  border: 1.5px solid #fff;
}
.pk-btn--primary-dark:hover {
  background: #fff;
  color: #160F3A;
  border-color: #fff;
}
```

- [ ] **Step 4: Add `.pk-btn--secondary`**

```css
.pk-btn--secondary {
  background: transparent;
  color: #160F3A;
  border: 1px solid #160F3A;
  padding: 10px 20px;
}
.pk-btn--secondary:hover {
  background: #160F3A;
  color: #fff;
}
.pk-btn--secondary-dark {
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255,255,255,0.5);
  padding: 10px 20px;
}
.pk-btn--secondary-dark:hover {
  background: #fff;
  color: #160F3A;
  border-color: #fff;
}
```

- [ ] **Step 5: Update `.pk-btn--ember` radius**

Find `.pk-btn--ember {`. Change only `border-radius` if present, or add it. Ember buttons keep their fill — just get sharp corners. Also remove the `transform: translateY(-1px)` on hover (no lift). The `:disabled` state stays.

```css
.pk-btn--ember {
  background: #CC4300;
  color: #F4F0E6;
  font-weight: 800;
  border: 1.5px solid #CC4300;
  border-radius: 2px;
  box-shadow: none;
}
.pk-btn--ember:hover {
  background: #A83800;
  border-color: #A83800;
  transform: none;
  box-shadow: none;
}
```

- [ ] **Step 6: Update `.pk-btn--spark` radius**

```css
.pk-btn--spark {
  background: var(--pk-lime);
  color: #0E0C08;
  border: 1.5px solid var(--pk-lime);
  border-radius: 2px;
  font-weight: 800;
  box-shadow: none;
}
.pk-btn--spark:hover {
  background: var(--pk-lime-hover);
  border-color: var(--pk-lime-hover);
  transform: none;
  box-shadow: none;
}
```

- [ ] **Step 7: Update `.pk-btn--ghost` radius**

```css
.pk-btn--ghost {
  background: rgba(244,240,230,0.10);
  color: #F4F0E6;
  border: 1px solid rgba(244,240,230,0.30);
  border-radius: 2px;
}
.pk-btn--ghost:hover {
  background: rgba(244,240,230,0.18);
}
```

- [ ] **Step 8: Update `.pk-btn--ember-ghost` radius**

```css
.pk-btn--ember-ghost {
  background: transparent;
  color: #CC4300;
  border: 1.5px solid #CC4300;
  border-radius: 2px;
  font-weight: 700;
}
.pk-btn--ember-ghost:hover { background: rgba(204, 67, 0, 0.08); }
```

- [ ] **Step 9: Update `.pk-btn--lg` radius**

Find `.pk-btn--lg {` (line ~2408). Change `border-radius: 14px` → `border-radius: 2px`.

- [ ] **Step 10: Update `.pk-section__link` radius**

Find `.pk-section__link {` (line ~1648). Change `border-radius: 999px` → `border-radius: 2px`.

- [ ] **Step 11: Update `.pk-arrivals__link` radius**

Find `.pk-arrivals__link {`. Change any `border-radius` value → `2px`.

- [ ] **Step 12: Update `.pk-rack__arr` + `.pk-swiper__arr` radius**

Find `.pk-rack__arr {`. Change `border-radius: 50%` → `border-radius: 2px`.
Find `.pk-swiper__arr {`. Change `border-radius: 50%` → `border-radius: 2px`.

- [ ] **Step 13: Verify build passes**

```bash
npm run build
```
Expected: `✓ built` — no errors.

- [ ] **Step 14: Commit**

```bash
git add app/styles/app.css
git commit -m "design: sharp button system — border-radius 2px, outlined primary"
```

---

## Task 3: Typography Scale

**Files:**
- Modify: `app/styles/app.css` — add shared classes, update section title sizes

- [ ] **Step 1: Add `.pk-headline` and `.pk-eyebrow` utility classes**

After the `.pk-inner` block (line ~45), add:

```css
/* === Playful Premium Typography === */
.pk-headline {
  font-size: clamp(52px, 7vw, 88px);
  line-height: 0.95;
  font-weight: 800;
  letter-spacing: -2px;
  margin: 0;
}
.pk-eyebrow {
  display: block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--pk-ember);
  margin-bottom: 12px;
}
.pk-eyebrow--on-dark {
  color: rgba(255, 255, 255, 0.5);
}
```

- [ ] **Step 2: Apply headline scale to each section's title selector**

Find and update each section title rule to use the headline scale. Replace **only** the `font-size` and `line-height` properties within each rule (leave all other properties intact):

```css
/* pk-rack__title — find around line 6655 */
/* change: font-size: clamp(26px, 3.5vw, 48px) → clamp(52px, 7vw, 88px); line-height: 1.06 → 0.95; letter-spacing: -1.5px → -2px */

/* pk-swiper__title — find around line 6416 */
/* change: font-size: clamp(26px, 3.5vw, 48px) → clamp(52px, 7vw, 88px); color: #F4F0E6 → var(--pk-ink) (will be overridden by section BG task) */

/* pk-arrivals__title — find around line 2669 */
/* change: font-size: clamp(22px, 3vw, 40px) → clamp(52px, 7vw, 88px); line-height default → 0.95 */

/* pk-gift__title — find within pk-gift block ~line 6896+ */
/* change font-size to clamp(52px, 7vw, 88px), line-height: 0.95 */

/* pk-bento title (__title within pk-bento) */
/* change font-size to clamp(52px, 7vw, 88px), line-height: 0.95 */

/* pk-matchmaker__title */
/* change font-size to clamp(52px, 7vw, 88px), line-height: 0.95 */

/* pk-feat-banner__title */
/* change font-size to clamp(52px, 7vw, 88px), line-height: 0.95 */
```

For each selector, make the targeted change in-place. Example for `pk-rack__title`:

Before:
```css
.pk-rack__title {
  font-family: var(--pk-font-display);
  font-size: clamp(26px, 3.5vw, 48px);
  font-weight: 800;
  letter-spacing: -1.5px;
  margin: 0;
  color: var(--pk-ink);
  line-height: 1.06;
}
```

After:
```css
.pk-rack__title {
  font-family: var(--pk-font-display);
  font-size: clamp(52px, 7vw, 88px);
  font-weight: 800;
  letter-spacing: -2px;
  margin: 0;
  color: var(--pk-ink);
  line-height: 0.95;
}
```

Apply this same pattern (`font-size: clamp(52px, 7vw, 88px); line-height: 0.95; letter-spacing: -2px`) to all 7 section title selectors listed above.

- [ ] **Step 3: Update eyebrow selectors to use ember color**

Each section has an `__eye` class for the small label above the headline. Update the `color` on each:
- `.pk-rack__eye` — currently `color: var(--pk-violet)` → `color: var(--pk-ember)`
- `.pk-swiper__eye` — currently `color: var(--pk-lime)` → `color: var(--pk-ember)` (will flip on dark bg in Task 4)
- `.pk-arrivals__eye` — currently `color: var(--pk-spark)` → `color: var(--pk-ember)`
- `.pk-gift__eye` (if exists) or `__eye` within gift → `color: var(--pk-ember)`
- `.pk-matchmaker__eye` → `color: rgba(255,255,255,0.5)` (violet bg, so muted white)

- [ ] **Step 4: Verify build passes**

```bash
npm run build
```
Expected: `✓ built` — no errors.

- [ ] **Step 5: Commit**

```bash
git add app/styles/app.css
git commit -m "design: oversized headline scale + eyebrow typography"
```

---

## Task 4: Section Background Rhythm

**Files:**
- Modify: `app/styles/app.css` — 9 section background + text color updates

Change each section's background and cascade text/element colors to match. Work through sections one at a time.

### 4a — `pk-matchmaker`: dark → deep violet

- [ ] **Step 1: Update `pk-matchmaker` background**

Find `.pk-matchmaker {` (line ~8669). Change `background: #0E0C08` → `background: var(--pk-violet-deep)`:

```css
.pk-matchmaker {
  width: 100%;
  background: var(--pk-violet-deep);
  padding: 88px 0;
  overflow: hidden;
  position: relative;
}
```

No text color cascade needed — existing white text reads fine on violet.

### 4b — `pk-swiper`: dark → paper

- [ ] **Step 2: Update `pk-swiper` background + color**

Find `.pk-swiper {` (line ~6392). Change:

```css
.pk-swiper {
  width: 100%;
  background: var(--pk-paper);
  padding: 80px 0 72px;
  overflow: hidden;
}
```

- [ ] **Step 3: Flip swiper text to dark**

Find and update these selectors within the swiper block:

```css
/* pk-swiper__eye: was color: var(--pk-lime) */
.pk-swiper__eye { color: var(--pk-ember); }

/* pk-swiper__title: was color: #F4F0E6 */
.pk-swiper__title { color: var(--pk-ink); }

/* pk-swiper__arr: was light-on-dark */
.pk-swiper__arr {
  border: 1.5px solid rgba(22, 15, 58, 0.25);
  background: transparent;
  color: var(--pk-ink);
  border-radius: 2px;
}
.pk-swiper__arr:hover:not(:disabled) {
  background: var(--pk-ink);
  border-color: var(--pk-ink);
  color: var(--pk-paper);
}
.pk-swiper__arr:focus-visible { outline: 2px solid var(--pk-ember); outline-offset: 3px; }

/* pk-swiper__count */
.pk-swiper__count { color: rgba(22, 15, 58, 0.4); }

/* pk-swiper__name */
.pk-swiper__name { color: var(--pk-ink); }

/* pk-swiper__price */
.pk-swiper__price { color: var(--pk-ember); }

/* pk-swiper__dot */
.pk-swiper__dot { background: rgba(22, 15, 58, 0.18); }
.pk-swiper__dot.is-active { background: var(--pk-ember); transform: scale(1.5); }
.pk-swiper__dot:focus-visible { outline: 2px solid var(--pk-ember); }

/* pk-swiper__ctrl-btn */
.pk-swiper__ctrl-btn { border-color: rgba(22,15,58,0.2); color: var(--pk-ink); }
.pk-swiper__ctrl-btn:hover { background: rgba(22,15,58,0.06); }
```

Also find the swiper card `.pk-swiper__card` — if it has a dark background, update to white/paper, and text to dark ink.

### 4c — `pk-rack`: paper → dark indigo

- [ ] **Step 4: Update `pk-rack` background**

Find `.pk-rack {` (line ~6589). Change:

```css
.pk-rack {
  width: 100%;
  background: #160F3A;
  padding: 80px 0 72px;
  overflow: hidden;
}
```

- [ ] **Step 5: Flip rack headings to white**

```css
.pk-rack__title { color: #F4F0E6; }
.pk-rack__eye { color: rgba(255,255,255,0.5); }

/* Nav arrows — flip to white-on-dark */
.pk-rack__arr {
  border: 1.5px solid rgba(244,240,230,0.25);
  background: transparent;
  color: #F4F0E6;
  border-radius: 2px;
}
.pk-rack__arr:hover:not(:disabled) {
  background: #F4F0E6;
  border-color: #F4F0E6;
  color: #160F3A;
}
```

Cards (`.pk-rack__card`) keep their white background and dark text — white cards on dark section is intentional contrast.

### 4d — `pk-arrivals`: dark → paper

- [ ] **Step 6: Update `pk-arrivals` background**

Find `.pk-arrivals {` (line ~2661). Change:

```css
.pk-arrivals {
  width: 100%;
  background: var(--pk-paper);
  padding: 72px 0 64px;
  overflow: hidden;
}
```

- [ ] **Step 7: Flip arrivals text to dark**

```css
.pk-arrivals__eye { color: var(--pk-ember); }
.pk-arrivals__title { color: var(--pk-ink); }

/* arrivals link — was light-on-dark */
.pk-arrivals__link { color: var(--pk-ember); border-color: var(--pk-ember); }
.pk-arrivals__link:hover { background: rgba(204,67,0,0.08); border-color: var(--pk-ember); }

/* arrivals cards — keep their own styling but update badge/text contrast */
.pk-arrivals__card { border: 1px solid rgba(22,15,58,0.12); background: #fff; }
.pk-arrivals__card:hover { border-color: rgba(22,15,58,0.35); }
.pk-arrivals__card-name { color: var(--pk-ink); }
.pk-arrivals__card-price { color: var(--pk-ember); }

/* Nav arrows */
.pk-rack__arr--dark {
  border-color: rgba(22,15,58,0.2);
  color: var(--pk-ink);
}
.pk-rack__arr--dark:hover:not(:disabled) {
  background: var(--pk-ink);
  border-color: var(--pk-ink);
  color: #fff;
}
```

### 4e — `pk-gift`: light → dark indigo

- [ ] **Step 8: Update `pk-gift` background**

Find `.pk-gift {` (line ~6896). Change:

```css
.pk-gift {
  width: 100%;
  background: #160F3A;
  padding: 88px 0;
}
```

- [ ] **Step 9: Flip gift text to white**

Within the gift block, update heading and card text selectors to white. Find `.pk-gift__head`, `.pk-gift__title`, `.pk-gift__sub`, `.pk-gift__card` and update:

```css
.pk-gift__eye { color: rgba(255,255,255,0.5); }
.pk-gift__title { color: #F4F0E6; }
.pk-gift__sub { color: rgba(244,240,230,0.65); }

.pk-gift__card {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  color: #F4F0E6;
}
.pk-gift__card:hover {
  background: rgba(255,255,255,0.10);
  border-color: rgba(255,255,255,0.35);
}
.pk-gift__label { color: #F4F0E6; }
.pk-gift__card-sub { color: rgba(244,240,230,0.6); }
.pk-gift__icon { color: var(--pk-ember); }
.pk-gift__arrow { color: var(--pk-ember); }
```

### 4f — `pk-bento`: dark → paper

- [ ] **Step 10: Update `pk-bento` background**

Find `.pk-bento {` (line ~6727). Change:

```css
.pk-bento {
  width: 100%;
  background: var(--pk-paper);
  color: var(--pk-ink);
  padding: 80px 0 88px;
}
```

- [ ] **Step 11: Flip bento text to dark**

Within the bento block, update heading, card, and eye selectors. Find `.pk-bento__eye`, `.pk-bento__title`, `.pk-bento__card` and update colors from white/light → ink. Key rules:

```css
.pk-bento__eye { color: var(--pk-ember); }
.pk-bento__title { color: var(--pk-ink); }
/* bento category cards: flip from dark-bg glass to white card with dark text */
.pk-bento__card { background: #fff; border: 1px solid rgba(22,15,58,0.1); color: var(--pk-ink); }
.pk-bento__card:hover { border-color: rgba(22,15,58,0.3); }
.pk-bento__card-label { color: var(--pk-ink); }
.pk-bento__card-tagline { color: rgba(22,15,58,0.65); }
.pk-bento__card-icon { color: var(--pk-violet-500); }
```

### 4g — `pk-rack--fresh`: paper → dark indigo

- [ ] **Step 12: Update `pk-rack--fresh` background**

Find `.pk-rack--fresh` override block (around line 7110). Add background:

```css
.pk-rack--fresh {
  background: #160F3A;
}
```

The existing `.pk-rack--fresh .pk-rack__title { color: #F4F0E6 }` and other overrides already set white text — verify they still exist and keep them.

### 4h — `pk-feat-banner`: dark → paper

- [ ] **Step 13: Update `pk-feat-banner` background**

Find `.pk-feat-banner {` (line ~6079). Change:

```css
.pk-feat-banner {
  width: 100%;
  background: var(--pk-paper);
  color: var(--pk-ink);
}
```

- [ ] **Step 14: Flip feat-banner text to dark**

```css
.pk-feat-banner__label { color: var(--pk-ember); }
.pk-feat-banner__title { color: var(--pk-ink); }
.pk-feat-banner__sub { color: rgba(22,15,58,0.65); }

/* Cards on paper background: white cards with ink text */
.pk-feat-banner__card { background: #fff; border: 1px solid rgba(22,15,58,0.1); }
.pk-feat-banner__card:hover { background: #fff; border-color: rgba(22,15,58,0.25); transform: translateY(-4px); }
.pk-feat-banner__card-name { color: var(--pk-ink); }
.pk-feat-banner__card-price { color: var(--pk-ember); }
```

### 4i — `pk-catalog-cta`: light → dark indigo

- [ ] **Step 15: Update `pk-catalog-cta` background**

Find `.pk-catalog-cta {` (line ~2782). Change:

```css
.pk-catalog-cta {
  width: 100%;
  background: #160F3A;
  padding: 96px 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 32px;
}
```

- [ ] **Step 16: Flip catalog-cta text to white**

Find `.pk-catalog-cta__number`, `.pk-catalog-cta__body`, `.pk-catalog-cta__sup`:

```css
.pk-catalog-cta__number { color: #F4F0E6; }
.pk-catalog-cta__sup { color: var(--pk-ember); }
.pk-catalog-cta__body { color: rgba(244,240,230,0.7); }

/* CTA buttons on dark background */
.pk-catalog-cta .pk-btn--ink {
  background: transparent;
  color: #F4F0E6;
  border: 1.5px solid #F4F0E6;
  border-radius: 2px;
}
.pk-catalog-cta .pk-btn--ink:hover { background: #F4F0E6; color: #160F3A; }
.pk-catalog-cta .pk-btn--outline {
  background: transparent;
  color: rgba(244,240,230,0.6);
  border: 1px solid rgba(244,240,230,0.3);
  border-radius: 2px;
}
.pk-catalog-cta .pk-btn--outline:hover { border-color: #F4F0E6; color: #F4F0E6; }
```

- [ ] **Step 17: Verify build passes**

```bash
npm run build
```
Expected: `✓ built` — no errors.

- [ ] **Step 18: Start dev server and spot-check section alternation**

```bash
shopify hydrogen dev
```

Open the homepage. Scroll top to bottom. Verify the rhythm:
- hero: warm cream ✓
- ticker: dark ✓
- matchmaker: violet ✓
- swiper: cream ✓
- rack: dark indigo ✓
- arrivals: cream ✓
- gift: dark indigo ✓
- bento: cream ✓
- rack-fresh: dark indigo ✓
- feat-banner: cream ✓
- catalog-cta: dark indigo ✓

- [ ] **Step 19: Commit**

```bash
git add app/styles/app.css
git commit -m "design: strict light/dark/violet section alternation across homepage"
```

---

## Task 5: Product Card Redesign

**Files:**
- Modify: `app/styles/app.css` — card CSS
- Modify: `app/components/ProductItem.jsx` — badge logic + `dark` prop

### 5a — CSS: sharp corners + hover border + badge + slide-up CTA

- [ ] **Step 1: Update `.pk-card` base styles**

Find `.pk-card {` in `app/styles/app.css`. Add/update:

```css
.pk-card {
  border-radius: 2px;
  overflow: hidden;
  background: #fff;
  border: 1px solid rgba(22,15,58,0.08);
  transition: transform 0.22s ease, outline 0.1s;
  position: relative;
}
.pk-card:hover {
  outline: 2px solid #160F3A;
  transform: translateY(-3px);
}
```

- [ ] **Step 2: Add `.pk-card__badge` styles**

After the `.pk-card` block, add:

```css
.pk-card__badge {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  border-radius: 2px;
  padding: 3px 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1.4;
  pointer-events: none;
}
.pk-card__badge--new-arrival { background: #CC4300; color: #fff; }
.pk-card__badge--top-pick { background: #6D4CFF; color: #fff; }
.pk-card__badge--trending { background: #160F3A; color: #fff; }
.pk-card__badge--staff-pick { background: #F2EBDA; color: #160F3A; border: 1px solid rgba(22,15,58,0.2); }
```

- [ ] **Step 3: Add hover slide-up CTA to `.pk-card__cart`**

Find `.pk-card__cart {` (line ~1732). Replace the block:

```css
.pk-card__cart {
  margin-top: auto;
  padding-top: 10px;
  overflow: hidden;
}
.pk-card__cart form { margin: 0; }
.pk-card__cart button[type="submit"],
.pk-card__viewbtn {
  width: 100%;
  display: block;
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: transparent;
  color: #160F3A;
  border: 1.5px solid #160F3A;
  border-radius: 2px;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  transform: translateY(100%);
  transition: transform 0.22s ease, background 0s, color 0s;
}
.pk-card:hover .pk-card__cart button[type="submit"],
.pk-card:hover .pk-card__viewbtn {
  transform: translateY(0);
}
.pk-card__cart button[type="submit"]:hover,
.pk-card__viewbtn:hover {
  background: #160F3A;
  color: #fff;
}
.pk-card__cart button[type="submit"]:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  background: transparent;
  color: rgba(22,15,58,0.4);
  border-color: rgba(22,15,58,0.2);
  transform: translateY(0);
}
```

- [ ] **Step 4: Add `.pk-card--dark` glass variant**

```css
.pk-card--dark {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  color: #F4F0E6;
}
.pk-card--dark:hover {
  outline: 2px solid rgba(255,255,255,0.4);
  transform: translateY(-3px);
}
.pk-card--dark .pk-card__title { color: #F4F0E6; }
.pk-card--dark .pk-card__price { color: #F4F0E6; }
.pk-card--dark .pk-card__vendor { color: rgba(244,240,230,0.55); }
.pk-card--dark .pk-card__cart button[type="submit"],
.pk-card--dark .pk-card__viewbtn {
  background: transparent;
  color: #F4F0E6;
  border-color: rgba(244,240,230,0.5);
}
.pk-card--dark:hover .pk-card__cart button[type="submit"],
.pk-card--dark:hover .pk-card__viewbtn {
  transform: translateY(0);
}
.pk-card--dark .pk-card__cart button[type="submit"]:hover,
.pk-card--dark .pk-card__viewbtn:hover {
  background: #fff;
  color: #160F3A;
  border-color: #fff;
}
.pk-card--dark .pk-card__badge--trending {
  background: #fff;
  color: #160F3A;
}
```

### 5b — JSX: badge logic + `dark` prop in ProductItem

- [ ] **Step 5: Update `ProductItem.jsx`**

Open `app/components/ProductItem.jsx`. Replace the entire file content:

```jsx
import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {ScrollReveal} from '~/components/ScrollReveal';
import {TiltCard} from '~/components/TiltCard';
import {useT} from '~/lib/t';

const BADGE_TAG_MAP = {
  'new-arrival': {label: 'New Arrival', cls: 'pk-card__badge--new-arrival'},
  'top-pick':    {label: 'Top Pick',    cls: 'pk-card__badge--top-pick'},
  'trending':    {label: 'Trending',    cls: 'pk-card__badge--trending'},
  'staff-pick':  {label: 'Staff Pick',  cls: 'pk-card__badge--staff-pick'},
};

function resolveBadge(tags) {
  if (!tags?.length) return null;
  const normalized = tags.map((t) => t.toLowerCase().replace(/\s+/g, '-'));
  for (const key of Object.keys(BADGE_TAG_MAP)) {
    if (normalized.includes(key)) return BADGE_TAG_MAP[key];
  }
  return null;
}

/**
 * @param {{
 *   product:
 *     | CollectionItemFragment
 *     | ProductItemFragment
 *     | RecommendedProductFragment;
 *   loading?: 'eager' | 'lazy';
 *   index?: number;
 *   dark?: boolean;
 * }}
 */
export function ProductItem({product, loading, index, dark = false}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const t = useT();
  const variant = product.variants?.nodes?.[0];
  const {open} = useAside();
  const delay = typeof index === 'number' ? Math.min(index * 40, 320) : 0;
  const badge = resolveBadge(product.tags);
  const cardClass = `pk-card pk-card--link${dark ? ' pk-card--dark' : ''}`;

  return (
    <ScrollReveal delay={delay} variant="up">
      <TiltCard className={cardClass} maxTilt={6}>
        {badge && (
          <span className={`pk-card__badge ${badge.cls}`} aria-label={badge.label}>
            {badge.label}
          </span>
        )}
        <Link
          className="pk-card__media"
          to={variantUrl}
          prefetch="intent"
          aria-label={product.title}
        >
          {image ? (
            <Image
              alt={image.altText || product.title}
              aspectRatio="1/1"
              data={image}
              loading={loading}
              sizes="(min-width: 45em) 25vw, 50vw"
            />
          ) : (
            <div className="pk-card__placeholder" aria-hidden="true">
              <span className="pk-card__placeholder-text">Puchica</span>
            </div>
          )}
        </Link>
        <div className="pk-card__body">
          <Link to={variantUrl} className="pk-card__title" prefetch="intent">
            {product.title}
          </Link>
          {product.productType ? (
            <span className="pk-card__vendor">{product.productType}</span>
          ) : null}
          <div className="pk-card__price">
            <Money data={product.priceRange.minVariantPrice} />
          </div>
          {variant ? (
            <div className="pk-card__cart">
              <AddToCartButton
                lines={[{merchandiseId: variant.id, quantity: 1}]}
                disabled={!variant.availableForSale}
                onClick={(e) => {
                  e.stopPropagation();
                  open('cart');
                }}
              >
                {variant.availableForSale ? t('product_add_to_cart') : t('product_sold_out')}
              </AddToCartButton>
            </div>
          ) : (
            <Link to={variantUrl} className="pk-card__viewbtn" prefetch="intent">
              {t('card_view_details')}
            </Link>
          )}
        </div>
      </TiltCard>
    </ScrollReveal>
  );
}

/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
```

- [ ] **Step 6: Verify build passes**

```bash
npm run build
```
Expected: `✓ built` — no errors.

- [ ] **Step 7: Start dev server and spot-check cards**

```bash
shopify hydrogen dev
```

Navigate to `/collections/all`. Verify:
- Cards have sharp corners (no rounded pills)
- Hovering a card shows slide-up "Add to cart" button
- Card with a `new-arrival` / `top-pick` / `trending` / `staff-pick` tag shows the correct badge top-left
- Badge colors match spec (ember red, violet, indigo, paper)
- On a dark section, cards with `dark` prop show glass effect (verify by temporarily passing `dark={true}` to one ProductItem call, then revert)

- [ ] **Step 8: Commit**

```bash
git add app/styles/app.css app/components/ProductItem.jsx
git commit -m "design: product cards — sharp corners, badge system, slide-up CTA, dark variant"
```
