"""Build the 15 s "lights on" piece from the on/off pair.

  python work/video/2026-09-20/build.py

Two stills (agy: the live 4:5 hero and its lamp-off twin), ffmpeg does the
rest: slow push-in on the dark room, a one-second dissolve as the lamp comes
on, the push-in continues, then three lines of text fade in over the table.
Outputs globe-9x16.mp4 (1080x1920, TikTok/Reels/Stories) and globe-1x1.mp4
(1080x1080, feed). Silent by design; add a licence-free track in the app.
"""
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ON = os.path.join(HERE, "globe-4x5-on.jpg")
OFF = os.path.join(HERE, "globe-4x5-off.jpg")
FPS = 30
OFF_S, ON_S, XF = 5.5, 10.5, 1.0  # total 15 s
SERIF = "C\\:/Windows/Fonts/georgia.ttf"
SANS = "C\\:/Windows/Fonts/segoeui.ttf"

TEXT = [
    ("Woven Bamboo Globe Pendant", SERIF, 64, 7.0),
    ("25 cm  ·  bulb not included", SANS, 40, 7.6),
    ("Ships free across Canada  ·  puchica.ca", SANS, 40, 8.2),
]


def esc(s):
    return s.replace("\\", "\\\\").replace(":", "\\:").replace("'", "\\'")


def zoom_clip(src, seconds, z0, z1, w, h, crop):
    frames = int(seconds * FPS)
    # Upscale first so zoompan has pixels to work with (no jitter), crop to the
    # output aspect, then animate the zoom about the centre.
    return (
        f"[{src}]scale={crop[0]*2}:{crop[1]*2}:force_original_aspect_ratio=increase,"
        f"crop={crop[0]*2}:{crop[1]*2},"
        f"zoompan=z='{z0}+({z1}-{z0})*on/{frames}':d={frames}:fps={FPS}"
        f":x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={w}x{h},format=yuv420p"
    )


def text_filters(w, h, y0):
    parts = []
    y = y0
    for text, font, size, t in TEXT:
        parts.append(
            f"drawtext=fontfile='{font}':text='{esc(text)}':fontsize={size}:fontcolor=0xFFFDF8"
            f":shadowcolor=0x1E2433@0.55:shadowx=0:shadowy=2:x=(w-text_w)/2:y={y}"
            f":alpha='if(lt(t,{t}),0,min(1,(t-{t})/0.8))'"
        )
        y += int(size * 1.6)
    return ",".join(parts)


def build(name, w, h, crop, text_y):
    out = os.path.join(HERE, name)
    graph = (
        zoom_clip("0:v", OFF_S, 1.00, 1.06, w, h, crop) + "[a];"
        + zoom_clip("1:v", ON_S, 1.06, 1.15, w, h, crop) + "[b];"
        + f"[a][b]xfade=transition=fade:duration={XF}:offset={OFF_S - XF}[ab];"
        + f"[ab]{text_filters(w, h, text_y)}[v]"
    )
    cmd = [
        "ffmpeg", "-y", "-loglevel", "error",
        # One frame per still: zoompan emits `d` frames for EACH input frame,
        # so a looped input multiplies the clip length (and the file size).
        "-i", OFF,
        "-i", ON,
        "-filter_complex", graph, "-map", "[v]",
        "-r", str(FPS), "-c:v", "libx264", "-preset", "medium", "-crf", "19",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", out,
    ]
    subprocess.run(cmd, check=True)
    print("wrote", out)


if __name__ == "__main__":
    build("globe-9x16.mp4", 1080, 1920, (675, 1200), 1460)
    build("globe-1x1.mp4", 1080, 1080, (896, 896), 840)
    sys.exit(0)
