# Core Web Vitals pass — 2026-09-18 (Lighthouse 13, mobile, Moto G emulation)

| page | before (simulated) | after fonts + slim dictionary (simulated) | after, devtools throttling |
|---|---|---|---|
| / | perf 75 · LCP 4.3 s · CLS 0 | perf 78 · LCP 4.1 s (hero image, fetchpriority=high) | — |
| /collections/all | perf 61 · LCP 7.9 s · CLS 0 | **perf 89 · LCP 2.7 s** · CLS 0.03 | — |
| /products/…globe… | perf 63 · LCP 8.5 s · CLS 0 | perf 65 · LCP 8.6 s (Lantern artefact, see below) | **perf 79 · LCP 2.8 s** · CLS 0 |

Changes shipped: 96352b7 (self-hosted Fraunces + Instrument Sans, preload of the two upright
files; removed the render-blocking fonts.googleapis.com stylesheet, ~0.9 s) and e64efdc (root
dictionary no longer carries product_copy_*_html: PDP HTML 202 KB → 123 KB, gz 42 → 29 KB).

Why the simulated PDP number is wrong: Lantern extrapolates from one cold, unthrottled pass in
which Chrome paints ~0.9 s after `load` on this page (observedFCP 1230 vs observedLoad 370);
a real-throttle run (`--throttling-method=devtools`) and a Playwright probe at 1.6 Mbps/150 ms/4×
CPU both put FCP = LCP (the H1) at 2.2–2.8 s. Warm loads paint at `load`. Field data (CrUX) is
what Google scores and there is none yet; re-check PageSpeed Insights after ~28 days of ads.

Left alone on purpose: card thumbnails "oversized" (400 px for a 179 px slot at DPR 2.6 — the
srcset is right), gtag/fbevents long tasks (~180 ms each, after LCP), the home hero JPEG
(already the right rendition; Shopify CDN negotiates WebP/AVIF by Accept header).

Probes: lcp-probe.mjs, res-probe.mjs, fcp-probe.mjs, fcp-variants.mjs (run from the repo so
@playwright/test resolves).

## 2026-09-20 — home LCP: drop the font preloads

`hero-variants.mjs` (route-intercepted HTML, 1.6 Mbps / 150 ms / 4× CPU, 3 runs each):
as-is 3560 ms median · no Fraunces preload 3232 ms · **no font preloads 2036 ms**, CLS 0 in
every run. The two preloaded upright woff2 files (~100 KB) were competing with the 74 KB hero
for the link. Shipped in 20cd82a. Live Lighthouse afterwards (`--throttling-method=devtools`,
two runs): **perf 78 · LCP 2.78 s / 2.76 s · CLS 0 · TBT 540–560 ms** (was perf 74 · LCP 3.2 s
the same night before the change; `home-no-font-preload.json`). Cost: `font-display: swap`
now shows Georgia / system sans for a moment on a cold load. Next lever if needed is the
hero's 640w rendition (~74 KB) or app.css (24.5 KB gz, render-blocking); TBT is gtag +
fbevents after LCP and does not move the score much.

## 2026-09-22 — home LCP under the 2.5 s threshold

A/B with `hero-variants.mjs` (route-intercepted HTML, 1.6 Mbps / 150 ms / 4× CPU, 3 runs, now
also reporting when the client bundle finishes arriving):

| variant | LCP median | JS done | CLS |
|---|---|---|---|
| as-is | 2032 ms | 5113 ms | 0 |
| **no modulepreload** | **1092 ms** | 6411 ms | 0 |
| hero 412w only | 1836 ms | 5053 ms | 0 |

Shipped the first (a878123): React Router's six `<link rel="modulepreload">` were pulling
~110 KB of bundle at high priority while the 73 KB hero — the LCP element — downloaded.
Vite's `build.modulePreload` is not the lever (React Router emits them itself), so it is a
stream transform in `app/lib/html-stream.js` next to the existing one.

Live afterwards (`--throttling-method=devtools`, two runs): **perf 77–78 · LCP 2.15 s / 2.20 s ·
CLS 0**, from 2.78 s. TBT rose 540→740–810 ms, which is the other side of the same coin: the
bundle arrives later and executes in a tighter window. TBT is a lab proxy, not a Core Web Vital,
and the score held — but if INP ever looks bad in field data, this is the first thing to revisit.

Not shipped: capping the phone hero at 412w (−200 ms). CI's `findUnderservedImages` check would
reject it, correctly — a 412 px file on a DPR-3 phone is a soft image.
