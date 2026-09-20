# Globe pendant — 15 s "lights on" piece (2026-09-20)

Not posted anywhere. For TikTok / Reels / Stories use `globe-9x16.mp4` (1080×1920);
for a feed post use `globe-1x1.mp4` (1080×1080). Both 15.0 s, 30 fps, H.264, silent —
add a licence-free track in the app if you want sound. `qa-frames-9x16.jpg` shows four
frames; `qa-on-off.jpg` the two source stills side by side.

How it was made (`build.py`, rerunnable): the lit 4:5 hero from `work/ads/2026-09-18/`
plus an agy render of the same scene with the lamp off (reference-conditioned on the lit
image; the mug, book, chair and window match). ffmpeg: slow push-in on the dark room
(0–5.5 s), one-second dissolve as the lamp comes on, push-in continues, three text lines
fade in from 7 s: "Woven Bamboo Globe Pendant" / "25 cm · bulb not included" /
"Ships free across Canada · puchica.ca". No price, no discount, no people.

Honest framing: this is a cinemagraph from stills, not footage. It's fine as the first
post; TikTok will treat real phone video of the actual lamp better. If a sample lamp ever
arrives, replace this with a 15 s clip of it switching on.

Gotcha for the next one: `zoompan` emits its full frame count for every input frame, so
feed each still once (no `-loop 1`), or a 15 s clip becomes hours of render and a 170 MB
file.
