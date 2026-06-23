---
name: frontend-design
description: Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and making choices that don't read as templated defaults. PRIMARY design voice for the Puchica Storefront rebuild -- use when working on homepage, landing pages, or any visual change.
license: Complete terms in LICENSE.txt
applies_to: puchica-site Hydrogen rebuild
---

# Frontend Design (Puchica-Context)

> **Puchica context:** This skill is the design voice for the Puchica Storefront rebuild at `E:\Claude\puchica-site`. The live storefront is at `puchica.ca` (Hydrogen on Cloudflare workerd). The Phase 2 design spec lives at `docs/superpowers/specs/2026-06-20-puchica-phase-2-design.md`. The current design system uses **acid lime as the signature accent** (already baked into the CSS as `--pk-spark`), a **near-black/cream duotone palette**, and **Lucide-style line icons** (in `app/components/Icons.jsx`).

Approach this as the design lead at a small studio known for giving every client a visual identity that could not be mistaken for anyone else's. This client has already rejected proposals that felt templated, and is paying for a distinctive point of view: make deliberate, opinionated choices about palette, typography, and layout that are specific to this brief, and take one real aesthetic risk you can justify.

## Ground it in the subject

If the brief does not pin down what the product or subject is, pin it yourself before designing: name one concrete subject, its audience, and the page's single job, and state your choice. If there's any information in your memory about the human's preferences, context about what they're building, or designs you've made before -- use that as a hint. The subject's own world, its materials, instruments, artifacts, and vernacular, is where distinctive choices come from. Build with the brief's real content and subject matter throughout.

**Puchica-specific grounding:**
- Subject: a curated 6,000+ product Shopify store (massage chairs, pet vests, baby floats, fans, home/kitchen/beauty/tech). Inventory is wide and varied -- the design must feel like a *curator's hand*, not a department store
- Audience: Canadian shoppers, design-conscious, looking for "the good stuff" without doom-scrolling
- Page's single job: **make the catalog feel like 50 finds, not 6,000 SKUs**. Show variety, not volume. Section variety, not duplicate product listings.
- Brand voice: direct, no filler, no corporate drone. "The good stuff. All in one place."

## Design principles

For web designs, the hero is a thesis. Open with the most characteristic thing in the subject's world, in whatever form makes sense for it: a headline, an image, an animation, a live demo, an interactive moment. Be deliberate with your choice: a big number with a small label, supporting stats, and a gradient accent is the template answer, only use if that's truly the best option.

**Puchica hero guidance:**
- Current hero is `pk-hero2` (dark, full-bleed, animated word reveal, product deck on right). Keep this as the hero thesis.
- The current CatalogStatement section ("6+k products, one store") is the **big-number template answer** -- consider replacing or recasting if a more distinctive moment fits the brief better.

Typography carries the personality of the page. Pair the display and body faces deliberately, not the same families you would reach for on any other project, and set a clear type scale with intentional weights, widths, and spacing. Make the type treatment itself a memorable part of the design, not a neutral delivery vehicle for the content.

**Puchica typography guidance:**
- Current display + body face is in `app/styles/app.css` near `:root` -- check `--pk-font-display` and `--pk-font-body`
- Existing scale: check `--pk-h1` through `--pk-h6` for size tokens
- Avoid templated pairings (Inter + Inter, Geist + Geist, system-ui + system-ui). If the current pair is generic, propose a deliberate alternative with reasoning

Structure is information. Structural devices, numbering, eyebrows, dividers, labels, should encode something true about the content, not decorate it. Many generic designs use numbered markers (01 / 02 / 03), but that's only appropriate if the content actually is a sequence -- like a real process or a typed timeline where order carries information the reader needs. Question if choices like numbered markers actually make sense before incorporating them.

**Puchica structural guidance:**
- Eyebrows with `<StarGlyph />` (component in `app/components/StarGlyph.jsx`) are already the pattern. Keep them where the section is genuinely a *category announcement* (Trending now, Just dropped, Best Sellers). Drop them from generic copy.
- The Phase 2 spec calls for **variety in section structure** -- 10+ structurally distinct sections, not 10 sections that all look like "Hero + cards + heading". This is the biggest design risk the spec is asking for.

Leverage motion deliberately. Think about where and if animation can serve the subject: a page-load sequence, a scroll-triggered reveal, hover micro-interactions, ambient atmosphere. An orchestrated moment usually lands harder than scattered effects; choose what the direction calls for. However, sometimes less is more, and extra animation contributes to the feeling that the design is AI-generated.

**Puchica motion guidance:**
- Current motion: word-reveal on hero title, marquee, carousel scroll-snap, hover lifts on cards. All CSS-driven, no JS animation libs.
- DO NOT add framer-motion, gsap, lottie, or any new animation dependency. Hydrogen's bundle is already 500KB+. Stick to CSS @keyframes + transition.
- Reduced-motion: check `app.css` for `@media (prefers-reduced-motion: reduce)` -- it must be honored.

Match complexity to the vision. Maximalist directions need elaborate execution; minimal directions need precision in spacing, type, and detail. Elegance is executing the chosen vision well.

Consider written content carefully. Often a design brief may not contain real content, and it's up to you to come up with copy. Copy can make a design feel as templated as the design itself. See the below section on writing for more guidance.

## Process: brainstorm, explore, plan, critique, build, critique again

For calibration: AI-generated design right now clusters around three looks: (1) a warm cream background (near #F4F1EA) with a high-contrast serif display and a terracotta accent; (2) a near-black background with a single bright acid-green or vermilion accent; (3) a broadsheet-style layout with hairline rules, zero border-radius, and dense newspaper-like columns. All three are legitimate for some briefs, but they are defaults rather than choices, and they appear regardless of subject. Where the brief pins down a visual direction, follow it exactly -- the brief's own words always win, including when it asks for one of these looks. Where it leaves an axis free, don't spend that freedom on one of these defaults. Just like a human designer who's hired, there's often a careful balance between doing what you're good at and taking each project as a chance to experiment and learn.

**Puchica calibration warning:**
- The current Puchica design **IS the "near-black + acid-green accent" look** (palette #2 above). It's already established. So:
  - The "default answer" for Puchica is to *stay in the established system* -- which is good, but means there's no visible aesthetic risk
  - The spec's whole point is to take a deliberate step away from defaults. If you're extending the system, do it with intent -- propose a new accent, a new layout pattern, a new content rhythm
  - One real risk worth considering: **introduce a single editorial/lifestyle section in a third visual mode** (cream bg, serif display) to break up the duotone. The Phase 2 spec calls for this in spirit (EditorialStory) but it's not yet implemented

Work in two passes. First, brainstorm a short design plan based on the human's design brief: create a compact token system with color, type, layout, and signature. Color: describe the palette as 4-6 named hex values. Type: the typefaces for 2+ roles (a characterful display face that's used with restraint, a complementary body face, and a utility face for captions or data if needed). Layout: a layout concept, using one-sentence prose descriptions and ASCII wireframes to ideate and compare. Signature: the single unique element this page will be remembered by that embodies the brief in an appropriate way.

Then review that plan against the brief before building: if any part of it reads like the generic default you would produce for any similar page (work through a similar prompt to see if you arrive somewhere similar) rather than a choice made for this specific brief -- revise that part, say what you changed and why. Only after you've confirmed the relative uniqueness of your design plan should you start to write the code, following the revised plan exactly and deriving every color and type decision from it.

When writing the code, be careful of structuring your CSS selector specificities. It's easy to generate CSS classes that cancel each other out (especially with a type-based selector like .section and a element-based selector like .cta). This can happen often with paddings/margins between sections.

**Puchica code conventions:**
- BEM-style: `.pk-<section>__<element>--<modifier>`. The `pk-` prefix is the Puchica namespace. Use it for ALL new CSS classes so they don't collide with Hydrogen/Hydrogen-overrides.
- Co-locate section CSS near other `pk-<section>` rules in `app/styles/app.css` (don't scatter to the bottom of the file -- find the alphabetical neighborhood or the related section)
- CSS custom properties on `:root` for any new tokens. Don't hardcode hex.

Try to do a lot of this planning and iteration in your thinking, and only show ideas to the user when you have higher confidence it'll delight them.

## Restraint and self-critique

Spend your boldness in one place. Let the signature element be the one memorable thing, keep everything around it quiet and disciplined, and cut any decoration that does not serve the brief. Not taking a risk can be a risk itself! Build to a quality floor without announcing it: responsive down to mobile, visible keyboard focus, reduced motion respected. Critique your own work as you build, taking screenshots if your environment supports them -- a picture is worth 1000 tokens. Consider Chanel's advice: before leaving the house, take a look in the mirror and remove one accessory. Human creators have memory and always try to do something new, so if you have a space to quickly jot down notes about what you've tried, it can help you in future passes.

**Puchica-specific self-critique checklist (use before declaring done):**
- [ ] Does this section show products from a **different collection** than the section above it? (variety rule)
- [ ] Does the new CSS use the `pk-` namespace?
- [ ] Does the new JSX use existing components (`<StarGlyph />`, `<categoryIcon />`, `~/components/Icons.jsx`) instead of inline emoji or hardcoded SVG?
- [ ] Does it work with `prefers-reduced-motion: reduce`?
- [ ] Does it have visible keyboard focus styles? (`:focus-visible` rule already in `app.css`)
- [ ] Does the new section's heading align with the cards below at all screen widths? (`max(24px, calc((100vw - 1200px) / 2 + 24px))` formula)
- [ ] Does the new JSX have any nested `<p>` containing a `<Money>`? (causes hydration mismatch)

## More on writing in design

Words appear in a design for one reason: to make it easier to understand, and therefore easier to use. They are design material, not decoration. Bring the same intentionality to copy that you would bring to spacing and color. Before writing anything, ask what the design needs to say, and how it can best be said to help the person navigate the experience.

Write from the end user's side of the screen. Name things by what people control and recognize, never by how the system is built. A person manages notifications, not webhook config. Describe what something does in plain terms rather than selling it. Being specific is always better than being clever.

Use active voice as default. A control should say exactly what happens when it is used: "Save changes," not "Submit." An action keeps the same name through the whole flow, so the button that says "Publish" produces a toast that says "Published." The vocabulary of an interface is the signposting for someone navigating the product. Cohesion and consistency are how people learn their way around.

Treat failure and emptiness as moments for direction, not mood. Explain what went wrong and how to fix it, in the interface's voice rather than a person's. Errors don't apologize, and they are never vague about what happened. An empty screen is an invitation to act.

Keep the register conversational and tuned: plain verbs, sentence case, no filler, with tone matched to the brand and the audience. Let each element do exactly one job. A label labels, an example demonstrates, and nothing quietly does double duty.

**Puchica voice rules:**
- Sentence case, not Title Case
- No emoji in copy (eyebrows use `<StarGlyph />` SVG)
- Numbers are concrete: "6,000+ products" not "thousands of products"
- CTAs are verbs: "Shop the catalog", "Find your thing", not "Browse now"
- Empty states are invitations, not apologies
- "Puchica is a curated shop for everyday life -- home, beauty, tech, pet, and more." is the brand-voice north star. Match this register.
