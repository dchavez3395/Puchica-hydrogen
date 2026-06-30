# Collection hero images — how to add them

Puchica's category page heroes ([/collections/&lt;handle&gt;](/collections/home-kitchen), etc.) now support a full-bleed cover image behind the title. Without one, the hero falls back to a clean dark editorial layout — the same title and copy, just no image behind it.

To turn on the full-bleed image for a collection, add a `custom.hero_image` metafield pointing at a wide product photo.

## One-time setup — register the metafield

1. Open Shopify admin → **Settings** → **Custom data** → **Collections**.
2. Click **Add definition**.
3. Fill in:
   - **Name**: `Hero image`
   - **Namespace and key**: `custom.hero_image`
   - **Type**: `File` → select **Image** as the type.
4. Click **Save**.
5. After saving, click the new `Hero image` definition.
6. Scroll to **Storefront API access** and toggle it **on**. (This is the step that's easy to miss — without it, the metafield will return `null` even when populated, and the hero will keep falling back to dark.)
7. Click **Save**.

## Per-collection upload

For each collection you want a cover on:

1. Go to **Products** → **Collections** → open the collection (e.g. *Home & Kitchen*).
2. Scroll to the bottom — there's a **Metafields** section.
3. **Hero image** → click **Select file** → upload or pick an image.
4. **Save** the collection.

That's it. The storefront rebuilds within ~30 seconds (CDN cache).

## Image specs

- **Aspect ratio**: 16:9 (e.g. 2400×1350, 1600×900). The hero is capped at `min(640px, 60vh)` tall, so a wide landscape photo is what looks best.
- **Minimum size**: 1600×900 — below this and it'll be upscaled and look soft on retina.
- **File size**: ≤ 800 KB. Shopify will optimize on upload, but starting smaller is faster.
- **Format**: JPG for photos, PNG only if you need transparency.
- **Subject placement**: Important detail should sit in the **bottom third** of the image. There's a dark scrim over the lower 65% to keep the title legible, and items at the top stay fully visible.

## Good subject choices

- A flat-lay of the category's most iconic products (knife block + cutting board + cookbook for Home & Kitchen).
- A scene that captures the category's vibe without being literal (a sunlit windowsill for Outdoor, a vanity counter for Beauty).
- A single hero product shot with negative space on the right or left.

## Bad subject choices

- A collage of product cutouts on white — reads as a marketplace, not a magazine.
- A text-heavy graphic or a price tag — fights the title.
- A portrait-orientation image — will be cropped to a letterbox in the middle of the hero.

## What you'll see after upload

Desktop:

```
┌──────────────────────────────────────────────────┐
│                                                  │
│   [image — top half visible]                     │
│                                                  │
│ ──────────────                                   │
│ Home & Kitchen                                   │
│ Curated finds for the room you actually cook in. │
│ [ 12 of 24+ products ]                           │
└──────────────────────────────────────────────────┘
```

The eyebrow, title, sub, and count pill stay anchored to the bottom-left. The scrim keeps everything readable on busy photos.

## Fallback behavior

If a collection doesn't have a `custom.hero_image` (either the metafield isn't set or it returns `null`), the hero still renders — just without an image, on the dark ink background. This is what every collection looks like today, until you upload.

## Removing a hero image

Just delete the file from the metafield in the collection editor and save. The hero goes back to the dark fallback within ~30 seconds.

## Troubleshooting

- **I uploaded an image but the hero is still dark.**
  - Most common: you skipped the **Storefront API access** toggle in step 6 of setup.
  - Second most common: Shopify CDN cache — wait ~30 seconds, hard-refresh the page.
- **The image is cropped weirdly.**
  - Upload a 16:9 image, not a portrait. The hero's `object-position` is `center 30%`, so portrait images will appear as a thin slice in the middle.
- **The title is hard to read on a busy photo.**
  - The scrim is at 78% opacity in the bottom 65% — that should be enough for most photos. If you have a particularly bright/light image, the title will still be legible; if it's very low-contrast (white on white), pick a different image.
