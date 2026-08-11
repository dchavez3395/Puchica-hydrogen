# Puchica organic creative kit

Prepared for review only. Nothing in this folder authorizes publishing or ad
spend.

## Source integrity

- Every product image in `source-media/` is the exact live `og:image` served by
  the approved Shopify product page on 2026-08-10.
- Product pixels are only uniformly scaled inside white cards. The build script
  does not regenerate, recolour, retouch, reshape, or invent merchandise.
- `puchica-editorial-background-v1.png` was created with the built-in ImageGen
  tool as a decorative background only. It contains no product.
- Exact captions, alt text, market restrictions, links, response macros, and
  review rules are in `docs/organic-launch-content-pack-2026-08-10.md`.

## Deliverables

- Day 1: three 1080 x 1350 launch-carousel slides.
- Day 2: three 1080 x 1920 cable-organizer video frames and one nine-second MP4.
- Day 3: one 1080 x 1920 travel-details story.
- Days 4–7: four 1080 x 1350 feed/carousel graphics.

## ImageGen prompt

Built-in ImageGen mode was used. Exact prompt:

> Use case: ads-marketing
>
> Asset type: reusable square organic-social carousel background for Puchica,
> a focused travel-organization shop
>
> Primary request: create a polished editorial background only, with no
> products, for later deterministic compositing of exact product photographs
>
> Scene/backdrop: warm ivory paper and subtle sand-colored linen texture,
> restrained soft lavender and muted terracotta geometric color fields
> suggesting organized compartments, premium but approachable
>
> Style/medium: clean contemporary editorial still-life backdrop, realistic
> tactile materials, minimal e-commerce art direction
>
> Composition/framing: square composition, calm negative space across the
> center and lower third, visual interest limited to outer edges, no horizon
> line
>
> Lighting/mood: soft daylight, quiet, organized, trustworthy
>
> Color palette: warm ivory, oatmeal, soft lavender, muted terracotta, tiny
> deep navy accents
>
> Constraints: background only; no products; no bags; no suitcases; no people;
> no text; no letters; no logo; no watermark; no mock product silhouettes; no
> UI elements; preserve a clean central area for exact Shopify product media to
> be placed later
>
> Avoid: busy props, fake merchandise, gradients that reduce text legibility,
> glossy futuristic styling

The built-in ImageGen tool produced the background; deterministic Pillow and
FFmpeg post-processing builds the final assets around exact Shopify media.
