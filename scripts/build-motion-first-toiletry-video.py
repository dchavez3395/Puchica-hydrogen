"""Build a continuous-motion toiletry-organizer organic reel.

Only exact Shopify supplier photographs are used. The product is never
generated, recoloured, reshaped, or placed in a fabricated demonstration.
The source photograph containing a real hand remains an unaltered photograph
inside an editorial card. Pictured toiletries are explicitly excluded.

The master is silent so commercially licensed platform audio can be selected
at publication time.
"""

from __future__ import annotations

import math
from pathlib import Path
import shutil
import subprocess

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


REPO = Path(__file__).resolve().parents[1]
ROOT = REPO / "outputs" / "motion-first-toiletry"
SOURCE = ROOT / "source-media"
FINAL = ROOT / "final" / "toiletry-organizer-motion-first-v1-13s.mp4"

WIDTH, HEIGHT = 1080, 1920
FPS = 30
DURATION = 12.6
FONT_REGULAR = Path(r"C:\Windows\Fonts\arial.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\arialbd.ttf")

NAVY = (16, 26, 46)
GREEN = (15, 113, 93)
CREAM = (255, 249, 239)
LAVENDER = (221, 215, 255)
WHITE = (255, 255, 255)
MUTED = (94, 102, 116)
TERRACOTTA = (181, 83, 50)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_BOLD if bold else FONT_REGULAR), size)


def clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def ease_out(value: float) -> float:
    value = clamp(value)
    return 1 - (1 - value) ** 3


def ease_in_out(value: float) -> float:
    value = clamp(value)
    return value * value * (3 - 2 * value)


def lerp(start: float, end: float, value: float) -> float:
    return start + (end - start) * value


def cutout_without_white(image: Image.Image, box=None) -> Image.Image:
    crop = image.crop(box).convert("RGB") if box else image.convert("RGB")
    pixels = np.asarray(crop).astype(np.int16)
    distance = 255 - pixels.min(axis=2)
    alpha = np.clip((distance - 3) * 18, 0, 255).astype(np.uint8)
    result = crop.convert("RGBA")
    result.putalpha(Image.fromarray(alpha, mode="L"))
    return result


def fit_width(image: Image.Image, width: int) -> Image.Image:
    height = round(image.height * width / image.width)
    return image.resize((width, height), Image.Resampling.LANCZOS)


def text_width(draw: ImageDraw.ImageDraw, value: str, face: ImageFont.FreeTypeFont) -> int:
    box = draw.textbbox((0, 0), value, font=face)
    return box[2] - box[0]


def background(light: bool, t: float) -> Image.Image:
    colour = CREAM if light else NAVY
    base = Image.new("RGBA", (WIDTH, HEIGHT), (*colour, 255))
    shapes = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(shapes)
    drift = math.sin(t * 0.7)
    if light:
        draw.ellipse((-360 + drift * 55, -260, 560 + drift * 55, 660), fill=(*LAVENDER, 120))
        draw.ellipse((650 - drift * 45, 1260, 1370 - drift * 45, 2040), fill=(*GREEN, 44))
    else:
        draw.ellipse((-400 + drift * 45, 1160, 430 + drift * 45, 2020), fill=(*GREEN, 118))
        draw.ellipse((620 - drift * 35, -340, 1350 - drift * 35, 430), fill=(*LAVENDER, 38))
    return Image.alpha_composite(base, shapes.filter(ImageFilter.GaussianBlur(40)))


def header(base: Image.Image, dark: bool = False) -> None:
    draw = ImageDraw.Draw(base)
    ink = WHITE if dark else NAVY
    draw.text((64, 68), "Puchica", font=font(42, True), fill=ink)
    draw.text((64, 128), "TRAVEL ORGANIZATION", font=font(20, True), fill=GREEN)
    draw.line((64, 169, 214, 169), fill=GREEN, width=5)


def progress_bar(base: Image.Image, global_t: float, dark: bool = False) -> None:
    draw = ImageDraw.Draw(base)
    back = (255, 255, 255, 70) if dark else (16, 26, 46, 35)
    front = WHITE if dark else NAVY
    draw.rounded_rectangle((64, 1822, 1016, 1830), radius=4, fill=back)
    end = 64 + round(952 * clamp(global_t / DURATION))
    draw.rounded_rectangle((64, 1822, end, 1830), radius=4, fill=front)


def label(base: Image.Image, value: str, y: int, reveal: float, accent=GREEN) -> None:
    face = font(25, True)
    measure = ImageDraw.Draw(base)
    width = text_width(measure, value, face) + 50
    visible = round(width * ease_out(reveal))
    if visible <= 0:
        return
    chip = Image.new("RGBA", (width, 54), (0, 0, 0, 0))
    draw = ImageDraw.Draw(chip)
    draw.rounded_rectangle((0, 0, width, 54), radius=27, fill=(*accent, 255))
    draw.text((25, 14), value, font=face, fill=WHITE)
    base.alpha_composite(chip.crop((0, 0, visible, 54)), (64, y))


def reveal_lines(
    base: Image.Image,
    lines: list[str],
    xy: tuple[int, int],
    size: int,
    reveal: float,
    fill=NAVY,
    spacing: int = 8,
) -> None:
    x, y = xy
    face = font(size, True)
    for index, line in enumerate(lines):
        local = clamp(reveal * 1.4 - index * 0.24)
        if local <= 0:
            continue
        layer = Image.new("RGBA", (960, size + spacing + 24), (0, 0, 0, 0))
        draw = ImageDraw.Draw(layer)
        draw.text((0, 0), line, font=face, fill=fill)
        alpha = round(255 * clamp(local * 2.4))
        layer.putalpha(Image.eval(layer.getchannel("A"), lambda a: a * alpha // 255))
        rise = round(42 * (1 - ease_out(local)))
        base.alpha_composite(layer, (x, y + index * (size + spacing) + rise))


def product_with_shadow(
    base: Image.Image,
    product: Image.Image,
    xy: tuple[int, int],
    angle: float = 0,
) -> None:
    rotated = product.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
    shadow_alpha = rotated.getchannel("A").filter(ImageFilter.GaussianBlur(30))
    shadow = Image.new("RGBA", rotated.size, (16, 26, 46, 105))
    shadow.putalpha(shadow_alpha)
    base.alpha_composite(shadow, (xy[0] + 18, xy[1] + 32))
    base.alpha_composite(rotated, xy)


def photo_card(base: Image.Image, photo: Image.Image, t: float) -> None:
    card_size = (940, 940)
    scale = 1.05 + 0.04 * ease_in_out(t)
    working = photo.resize(
        (round(photo.width * scale), round(photo.height * scale)),
        Image.Resampling.LANCZOS,
    )
    pan_x = round((working.width - photo.width) * t)
    pan_y = round((working.height - photo.height) * (1 - t) * 0.55)
    working = working.crop((pan_x, pan_y, pan_x + photo.width, pan_y + photo.height))
    image = ImageOps.fit(working, card_size, method=Image.Resampling.LANCZOS)
    image = image.convert("RGBA")
    mask = Image.new("L", card_size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, *card_size), radius=48, fill=255)
    image.putalpha(mask)

    shadow = Image.new("RGBA", card_size, (16, 26, 46, 110))
    shadow.putalpha(mask.filter(ImageFilter.GaussianBlur(28)))
    base.alpha_composite(shadow, (88, 568))
    base.alpha_composite(image, (70, 540))


def scene_one(t: float, closed: Image.Image, context: Image.Image, opened: Image.Image) -> Image.Image:
    duration = 3.0
    p = clamp(t / duration)
    base = background(True, t)
    header(base)
    label(base, "THE COUNTER RESET", 226, p * 2.1)
    reveal_lines(base, ["SMALL BOTTLES.", "ONE PLACE."], (64, 326), 86, p * 1.42)
    draw = ImageDraw.Draw(base)
    alpha = round(255 * clamp(p * 2.3 - 0.78))
    draw.text((68, 548), "A compact organizer that opens to hang.", font=font(31), fill=(*MUTED, alpha))

    width = round(690 + 40 * math.sin(p * math.pi))
    item = fit_width(closed, width)
    x = round(690 - 430 * ease_out(p))
    y = round(800 - 90 * ease_out(p) + 16 * math.sin(t * 2.8))
    product_with_shadow(base, item, (x, y), lerp(9, -4, ease_in_out(p)))

    arc = Image.new("RGBA", base.size, (0, 0, 0, 0))
    ImageDraw.Draw(arc).arc((80, 690, 990, 1630), 205, round(220 + 305 * ease_out(p)), fill=(*GREEN, 150), width=8)
    base = Image.alpha_composite(base, arc)
    progress_bar(base, t)
    return base


def scene_two(t: float, closed: Image.Image, context: Image.Image, opened: Image.Image) -> Image.Image:
    duration = 3.3
    p = clamp(t / duration)
    base = background(False, t + 3.0)
    header(base, dark=True)
    label(base, "REAL SOURCE PHOTOGRAPH", 226, p * 2.1, accent=TERRACOTTA)
    reveal_lines(base, ["GRAB.", "ZIP. GO."], (64, 324), 88, p * 1.45, fill=WHITE)
    photo_card(base, context, ease_in_out(p))
    draw = ImageDraw.Draw(base)
    draw.text((86, 1540), "Closed black organizer with carry loop.", font=font(31, True), fill=WHITE)
    draw.text((86, 1600), "No generated hands or product pixels.", font=font(26), fill=(225, 225, 225))
    progress_bar(base, t + 3.0, dark=True)
    return base


def scene_three(t: float, closed: Image.Image, context: Image.Image, opened: Image.Image) -> Image.Image:
    duration = 3.1
    p = clamp(t / duration)
    base = background(True, t + 6.3)
    header(base)
    label(base, "OPEN LAYOUT", 226, p * 2.2)

    item = fit_width(opened, round(520 + 36 * math.sin(p * math.pi)))
    x = round(-70 + 240 * ease_out(p))
    y = round(355 + 12 * math.sin(t * 2.7))
    product_with_shadow(base, item, (x, y), lerp(-5, 2, ease_in_out(p)))

    draw = ImageDraw.Draw(base)
    facts = [
        ("01", "22 x 14 x 8 cm closed"),
        ("02", "Approx. 53 cm open"),
        ("03", "Built-in hanging hook"),
    ]
    for index, (number, value) in enumerate(facts):
        local = ease_out(clamp(p * 1.55 - 0.16 - index * 0.22))
        if local <= 0:
            continue
        y_fact = 1040 + index * 170 + round(46 * (1 - local))
        x_fact = round(235 - 165 * local)
        draw.rounded_rectangle((x_fact, y_fact, 1016, y_fact + 132), radius=34, fill=(255, 255, 255, 238), outline=(222, 212, 199), width=2)
        draw.text((x_fact + 32, y_fact + 31), number, font=font(27, True), fill=GREEN)
        draw.text((x_fact + 108, y_fact + 31), value, font=font(33, True), fill=NAVY)
    draw.text((64, 1604), "Pictured toiletries are not included.", font=font(30, True), fill=TERRACOTTA)
    progress_bar(base, t + 6.3)
    return base


def scene_four(t: float, closed: Image.Image, context: Image.Image, opened: Image.Image) -> Image.Image:
    duration = 3.2
    p = clamp(t / duration)
    base = background(False, t + 9.4)
    header(base, dark=True)
    label(base, "PUCHICA TRAVEL EDIT", 226, p * 2.3)
    reveal_lines(base, ["PACK IT.", "HANG IT."], (64, 324), 92, p * 1.45, fill=WHITE)

    closed_item = fit_width(closed, round(430 + 25 * math.sin(p * math.pi)))
    opened_item = fit_width(opened, round(370 + 28 * math.sin(p * math.pi)))
    slide = ease_out(p)
    product_with_shadow(base, closed_item, (round(-180 + 305 * slide), 760), -8 + 4 * slide)
    product_with_shadow(base, opened_item, (round(850 - 335 * slide), 700), 7 - 4 * slide)

    draw = ImageDraw.Draw(base)
    cta_y = 1450 + round(82 * (1 - ease_out(clamp(p * 2 - 0.55))))
    draw.rounded_rectangle((64, cta_y, 1016, cta_y + 124), radius=62, fill=GREEN)
    cta = "SEE THE TOILETRY ORGANIZER"
    face = font(32, True)
    draw.text(((WIDTH - text_width(draw, cta, face)) // 2, cta_y + 42), cta, font=face, fill=WHITE)
    draw.text((64, cta_y + 164), "puchica.ca", font=font(40, True), fill=WHITE)
    draw.text((64, cta_y + 220), "Canada + U.S. | Shipping shown at checkout.", font=font(25), fill=(225, 225, 225))
    progress_bar(base, t + 9.4, dark=True)
    return base


def render(t: float, closed: Image.Image, context: Image.Image, opened: Image.Image) -> Image.Image:
    boundaries = (0.0, 3.0, 6.3, 9.4, DURATION)
    durations = (3.0, 3.3, 3.1, 3.2)
    scenes = (scene_one, scene_two, scene_three, scene_four)
    if t < boundaries[1]:
        current, local = 0, t
    elif t < boundaries[2]:
        current, local = 1, t - boundaries[1]
    elif t < boundaries[3]:
        current, local = 2, t - boundaries[2]
    else:
        current, local = 3, t - boundaries[3]

    frame = scenes[current](local, closed, context, opened)
    transition = 0.24
    remaining = durations[current] - local
    if current < 3 and remaining < transition:
        next_frame = scenes[current + 1](transition - remaining, closed, context, opened)
        frame = Image.blend(frame, next_frame, ease_in_out((transition - remaining) / transition))
    return frame.convert("RGB")


def build() -> None:
    paths = [SOURCE / f"toiletry-{index:02d}.jpg" for index in range(1, 4)]
    missing = [path for path in paths if not path.exists()]
    if missing:
        raise FileNotFoundError(f"Missing exact Shopify source media: {missing}")
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise RuntimeError("FFmpeg was not found on PATH")

    closed = cutout_without_white(Image.open(paths[0]))
    context = Image.open(paths[1]).convert("RGB")
    opened = cutout_without_white(Image.open(paths[2]), (455, 5, 800, 755))

    FINAL.parent.mkdir(parents=True, exist_ok=True)
    command = [
        ffmpeg, "-y", "-v", "warning", "-f", "rawvideo", "-pix_fmt", "rgb24",
        "-s", f"{WIDTH}x{HEIGHT}", "-r", str(FPS), "-i", "-", "-an",
        "-c:v", "libx264", "-preset", "medium", "-crf", "18",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(FINAL),
    ]
    process = subprocess.Popen(command, stdin=subprocess.PIPE)
    assert process.stdin is not None
    try:
        for frame_number in range(round(DURATION * FPS)):
            frame = render(frame_number / FPS, closed, context, opened)
            process.stdin.write(np.asarray(frame, dtype=np.uint8).tobytes())
    finally:
        process.stdin.close()
    return_code = process.wait()
    if return_code:
        raise RuntimeError(f"FFmpeg exited with status {return_code}")
    print(FINAL.relative_to(REPO))


if __name__ == "__main__":
    build()
