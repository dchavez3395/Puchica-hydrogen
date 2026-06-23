# Puchica Storefront Agency — Skill Index

A curated set of 6 agent personas + 1 design voice, set up for the **Puchica Storefront Hydrogen rebuild** at `E:\Claude\puchica-site`. The live storefront is at `puchica.ca` (Hydrogen on Cloudflare workerd). The Phase 2 design spec is at `docs/superpowers/specs/2026-06-20-puchica-phase-2-design.md`.

These personas are **role-specialized prompt files** -- you activate one per session/task to get the model's attention focused on that discipline. The full upstream library (100+ personas) is at `C:\Users\dchav\.openclaw\workspace\agency-agents\` if you need to browse for other specializations.

## Curated set for Puchica

| # | Persona | When to use | File |
|---|---|---|---|
| 00 | Frontend Design (Puchica) | Any visual/UI change -- color, type, layout, motion, copy voice | `frontend-design.md` |
| 01 | SEO Specialist | Meta titles, descriptions, structured data, sitemap, crawl issues | `01-seo-specialist.md` |
| 02 | Content Creator | Product copy, blog posts, About/Journal/Blog content, hero copy | `02-content-creator.md` |
| 03 | UI Designer | Component design, mockups, design system tokens, Figma/HTML handoff | `03-ui-designer.md` |
| 04 | UX Architect | Site IA, navigation patterns, mega-menu structure, page flow | `04-ux-architect.md` |
| 05 | Frontend Developer | React Router 7 + Hydrogen implementation, JSX, GraphQL queries | `05-frontend-developer.md` |
| 06 | Image Prompt Engineer | Gemini image prompts for the runners (lifestyle / studio shots) | `06-image-prompt-engineer.md` |

## Puchica context to load alongside any persona

Every persona inherits the same project context. Read this block before activating any of them:

- **Repo:** `E:\Claude\puchica-site` (Hydrogen 2026.4.3, React Router 7.16, Vite, GraphQL codegen, Cloudflare workerd)
- **Storefront API:** live, working. Used by Hydrogen for all product reads.
- **Admin API:** token dead, not needed for design/UI work. Don't recommend it.
- **Design system:** acid lime accent (`--pk-spark` in `app/styles/app.css`), near-black/cream duotone, Lucide line icons in `app/components/Icons.jsx`
- **Critical shared components:** `app/components/StarGlyph.jsx` (replaces decorative stars), `app/components/Icons.jsx` (has `categoryIcon()` mapper), `app/components/PageLayout.jsx` (announcement bar, header, footer)
- **Critical rules (from Phase 2 spec):** each section should pull from a different collection (variety), no emoji in copy, hard character limits on titles (60), SEO titles (70), SEO descriptions (160)
- **Currently in flight (don't duplicate):** Claude Code on the local machine is doing homepage contrast fixes, a11y focus rings, marquee pause, carousel keyboard nav, About page, GiftFinder/SocialProof/FreshFinds sections, and variety-by-collection query rewrites. Before doing any of that, check if it's already done.

## Puchica code conventions (load before any implementation work)

- **CSS namespace:** all new classes use the `pk-` prefix (BEM-style: `.pk-section__element--modifier`)
- **JSX imports:** `~/components/Icons.jsx` for icons, `~/components/StarGlyph.jsx` for star glyphs, `~/lib/seo` for SEO meta, `~/lib/logger` for logging
- **Animations:** CSS only. No new JS animation libs (framer-motion, gsap, lottie).
- **Data fetching:** use `<Await resolve={deferred.X}>` with `<Suspense fallback={...}>`, never `await` in render
- **Image:** always `<Image data={p.featuredImage} aspectRatio="..." sizes="..." />` from `@shopify/hydrogen`, never raw `<img>`
- **Money:** wrap in `<div>` not `<p>` (Money renders a div internally; p > div is invalid HTML and causes hydration mismatches)
- **Tracking:** puchicaMeta() helper for SEO, organizationJsonLd()/websiteJsonLd() for structured data
- **Lint:** `npx eslint app/` before declaring done. The repo has known unused-var warnings; new code should not add more.

## When to activate which persona

| Task | Persona |
|---|---|
| Add a new homepage section | `frontend-design.md` + `engineering-frontend-developer.md` |
| Rewrite product SEO title/description | `seo-specialist.md` (backend runners do this in bulk) |
| Write About/Journal/Blog copy | `content-creator.md` |
| Design a new page from scratch | `ux-architect.md` -> `frontend-design.md` -> `engineering-frontend-developer.md` |
| Build the mega-dropdown nav | `ux-architect.md` + `engineering-frontend-developer.md` |
| Generate lifestyle product images | `image-prompt-engineer.md` + `runners/images/run.py` |
| Audit page for a11y issues | `frontend-design.md` (has self-critique checklist) |
| Pick a new font / type pairing | `frontend-design.md` |
| Add a new section but unsure of structure | `frontend-design.md` (two-pass brainstorm) |

## Activation pattern

When starting a task, lead with the relevant persona file. The model's first user turn should reference it by name:

> "Activating frontend-design + frontend-developer personas. Puchica context loaded. Task: add a Press Strip section between FreshFinds and FeaturedBanner. Use the `trending-finds` collection (already used by Hero, so re-route to a new one). Build to the self-critique checklist before declaring done."

Or in OpenClaw / Claude Code, drop the persona content into the system prompt for the session.

## What this isn't

- These are **prompt scaffolding**, not autonomous agents. They sharpen the model's attention for a particular role, but the model still needs your context, your approval, and your review.
- This is not a SaaS. There's no hosted service. The personas live as files in this folder; you (or your tooling) read them.
- These do not replace the **Hydrogen/Hydrogen-overrides** patterns. They augment them.
- These are upstream-modified. The originals are MIT-licensed at github.com/msitarzewski/agency-agents.

## Maintenance

If a persona proves unhelpful for a recurring task, edit the file directly to add a "Puchica: " section. Don't rewrite the whole thing -- the upstream content is good baseline.
