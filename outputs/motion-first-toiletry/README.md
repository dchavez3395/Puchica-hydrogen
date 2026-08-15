# Motion-first toiletry-organizer reel

Status: **MASTER READY — NOT PUBLISHED — NO AD SPEND**

`final/toiletry-organizer-motion-first-v1-13s.mp4` is a silent 12.6-second,
1080 × 1920, 30 fps organic-video master for the approved Black Hanging Travel
Toiletry Organizer. Every scene contains continuous product, camera, text, or
graphic motion; it is not a four-card slideshow.

An every-third-frame luminance-difference audit measured meaningful movement
in **93.6%** of 125 sampled intervals using the same `YAVG > 1.0` threshold as
the cable-organizer motion audit. The visual-QA contact sheet is at
`preview/contact-sheet.jpg`.

## Source integrity

These are the complete ready-image set returned by Shopify Admin GraphQL for
product `gid://shopify/Product/9367768596730` on 2026-08-14. Shopify returned no
`Video` or `ExternalVideo` node.

- `source-media/toiletry-01.jpg`: closed black organizer on white.
- `source-media/toiletry-02.jpg`: supplier photograph of a real hand holding
  the closed organizer. It remains an unaltered photograph inside an editorial
  card; no generated hand or product is used.
- `source-media/toiletry-03.jpg`: packed and hanging views with source
  dimensions.

The script removes only white image backdrops from the isolated product views.
It does not generate, recolour, reshape, retouch, or fabricate merchandise.
The master explicitly states that pictured toiletries are not included.

Shopify source URLs:

- `https://cdn.shopify.com/s/files/1/0842/2644/1466/files/Scb4528e204874e15ad7388b7213df420T.webp?v=1786386778`
- `https://cdn.shopify.com/s/files/1/0842/2644/1466/files/S02aec30c5a5f461d8462ad3c07888d44y.webp?v=1786386778`
- `https://cdn.shopify.com/s/files/1/0842/2644/1466/files/S9e32c019d1a840c7882535d2fde10d1bv.webp?v=1786386777`

## Technical verification

- H.264 video, 1080 × 1920, 30 fps.
- Duration: 12.60 seconds.
- File size: 2,812,012 bytes.
- No audio stream.
- Fast-start MP4 output.
- `python -m py_compile scripts/build-motion-first-toiletry-video.py`: PASS.
- Visual contact-sheet review: PASS.

## Prepared organic caption

> Small travel bottles are easier to manage when they share one organizer.
> This black case closes to approximately 22 × 14 × 8 cm and opens to
> approximately 53 cm with a built-in hanging hook. Toiletries pictured are not
> included. Available in Canada and the United States. Shipping is shown at
> checkout. #TravelOrganization #ToiletryOrganizer #Puchica

Prepared destination:

`https://puchica.ca/products/black-hanging-travel-toiletry-organizer?utm_source=tiktok&utm_medium=organic_social&utm_campaign=travel_edit_organic_202608&utm_content=ugc_toiletry_motion_v1`

## Publication controls

1. Keep the master unpublished until the current live TikTok post's evidence
   checkpoint is recorded and the next-post decision is made.
2. At publication, add only audio with documented commercial-use rights.
3. Enable Puchica's own-brand commercial-content disclosure.
4. Do not boost, use Spark Ads, or start paid promotion during organic
   validation.
5. Record the live URL, publication timestamp, baseline metrics, and attributed
   Shopify sessions before evaluating the post.

Rebuild with:

`python scripts/build-motion-first-toiletry-video.py`
