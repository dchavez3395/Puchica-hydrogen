"""Build a continuous-motion cable-organizer reel from exact Shopify media.

The sellable product is never generated, recoloured, reshaped, or shown in a
fabricated use scene. The script crops the closed and open views from the exact
approved black double-layer Shopify image, removes only the white backdrop,
and animates those pixels inside an editorial motion-graphics treatment.

The master is silent so commercially licensed platform audio can be selected
at publication time.
"""

from __future__ import annotations

import math
from pathlib import Path
import shutil
import subprocess

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


REPO = Path(__file__).resolve().parents[1]
ROOT = REPO / "outputs" / "motion-first-cable"
SOURCE = ROOT / "source-media" / "cable-10.jpg"
FINAL = ROOT / "final" / "cable-organizer-motion-first-v1-12s.mp4"

WIDTH, HEIGHT = 1080, 1920
FPS = 30
DURATION = 12.4
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


def ease_out_cubic(value: float) -> float:
    value = clamp(value)
    return 1 - (1 - value) ** 3


def ease_in_out(value: float) -> float:
    value = clamp(value)
    return value * value * (3 - 2 * value)


def lerp(start: float, end: float, value: float) -> float:
    return start + (end - start) * value


def rgba_crop_without_white(image: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    crop = image.crop(box).convert("RGB")
    pixels = np.asarray(crop).astype(np.int16)
    distance = 255 - pixels.min(axis=2)
    alpha = np.clip((distance - 3) * 16, 0, 255).astype(np.uint8)
    result = crop.convert("RGBA")
    result.putalpha(Image.fromarray(alpha, mode="L"))
    return result


def fit(image: Image.Image, width: int) -> Image.Image:
    height = round(image.height * width / image.width)
    return image.resize((width, height), Image.Resampling.LANCZOS)


def text_width(draw: ImageDraw.ImageDraw, value: str, face: ImageFont.FreeTypeFont) -> int:
    box = draw.textbbox((0, 0), value, font=face)
    return box[2] - box[0]


def draw_tracking_text(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    value: str,
    face: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int] | tuple[int, int, int, int],
    tracking: int,
) -> None:
    x, y = xy
    for char in value:
        draw.text((x, y), char, font=face, fill=fill)
        x += text_width(draw, char, face) + tracking


def draw_label(base: Image.Image, text: str, y: int, progress: float, accent=GREEN) -> None:
    draw = ImageDraw.Draw(base)
    face = font(25, True)
    width = text_width(draw, text, face) + 50
    visible = round(width * ease_out_cubic(progress))
    if visible <= 0:
        return
    layer = Image.new("RGBA", (width, 54), (0, 0, 0, 0))
    layer_draw = ImageDraw.Draw(layer)
    layer_draw.rounded_rectangle((0, 0, width, 54), radius=27, fill=(*accent, 255))
    layer_draw.text((25, 14), text, font=face, fill=WHITE)
    base.alpha_composite(layer.crop((0, 0, visible, 54)), (64, y))


def draw_reveal_text(
    base: Image.Image,
    lines: list[str],
    xy: tuple[int, int],
    size: int,
    progress: float,
    fill=NAVY,
    spacing: int = 8,
) -> None:
    x, y = xy
    face = font(size, True)
    line_height = size + spacing
    for index, line in enumerate(lines):
        local = clamp(progress * 1.4 - index * 0.24)
        if local <= 0:
            continue
        layer_width = 940
        layer = Image.new("RGBA", (layer_width, line_height + 20), (0, 0, 0, 0))
        layer_draw = ImageDraw.Draw(layer)
        layer_draw.text((0, 0), line, font=face, fill=fill)
        rise = round(42 * (1 - ease_out_cubic(local)))
        alpha = round(255 * clamp(local * 2.4))
        layer.putalpha(Image.eval(layer.getchannel("A"), lambda a: a * alpha // 255))
        base.alpha_composite(layer, (x, y + index * line_height + rise))


def make_background(light: bool, t: float) -> Image.Image:
    base_colour = CREAM if light else NAVY
    base = Image.new("RGBA", (WIDTH, HEIGHT), (*base_colour, 255))
    shapes = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(shapes)
    drift = math.sin(t * 0.8)
    if light:
        draw.ellipse((-330 + drift * 40, -270, 540 + drift * 40, 610), fill=(*LAVENDER, 120))
        draw.ellipse((660 - drift * 35, 1280, 1360 - drift * 35, 2010), fill=(*GREEN, 42))
    else:
        draw.ellipse((-380 + drift * 30, 1180, 410 + drift * 30, 1980), fill=(*GREEN, 115))
        draw.ellipse((620 - drift * 40, -320, 1330 - drift * 40, 430), fill=(*LAVENDER, 38))
    shapes = shapes.filter(ImageFilter.GaussianBlur(38))
    return Image.alpha_composite(base, shapes)


def draw_header(base: Image.Image, dark: bool = False) -> None:
    draw = ImageDraw.Draw(base)
    ink = WHITE if dark else NAVY
    draw.text((64, 68), "Puchica", font=font(42, True), fill=ink)
    draw_tracking_text(draw, (64, 126), "TRAVEL ORGANIZATION", font(18, True), GREEN, 3)
    draw.line((64, 167, 214, 167), fill=GREEN, width=5)


def draw_progress(base: Image.Image, t: float, dark: bool = False) -> None:
    draw = ImageDraw.Draw(base)
    back = (255, 255, 255, 70) if dark else (16, 26, 46, 35)
    front = WHITE if dark else NAVY
    draw.rounded_rectangle((64, 1822, 1016, 1830), radius=4, fill=back)
    draw.rounded_rectangle((64, 1822, 64 + round(952 * clamp(t / DURATION)), 1830), radius=4, fill=front)


def product_with_shadow(
    base: Image.Image,
    product: Image.Image,
    xy: tuple[int, int],
    angle: float = 0,
    opacity: int = 255,
) -> None:
    rotated = product.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
    if opacity < 255:
        rotated.putalpha(Image.eval(rotated.getchannel("A"), lambda a: a * opacity // 255))
    shadow = Image.new("RGBA", rotated.size, (0, 0, 0, 0))
    shadow.putalpha(rotated.getchannel("A").filter(ImageFilter.GaussianBlur(30)))
    shadow_colour = Image.new("RGBA", rotated.size, (16, 26, 46, 105))
    shadow_colour.putalpha(shadow.getchannel("A"))
    base.alpha_composite(shadow_colour, (xy[0] + 18, xy[1] + 32))
    base.alpha_composite(rotated, xy)


def scene_one(t: float, closed: Image.Image, opened: Image.Image) -> Image.Image:
    duration = 2.8
    progress = clamp(t / duration)
    base = make_background(True, t)
    draw_header(base)
    draw_label(base, "THE CABLE RESET", 226, progress * 2.0)
    draw_reveal_text(base, ["LOOSE", "CABLES?"], (64, 324), 112, progress * 1.35)
    draw = ImageDraw.Draw(base)
    sub_alpha = round(255 * clamp(progress * 2.3 - 0.85))
    draw.text((68, 604), "Give the small pieces one place.", font=font(34), fill=(*MUTED, sub_alpha))

    motion = ease_out_cubic(progress)
    width = round(530 + 38 * math.sin(progress * math.pi))
    item = fit(closed, width)
    x = round(660 - 300 * motion)
    y = round(810 - 110 * motion + 14 * math.sin(t * 3.1))
    angle = lerp(10, -4, motion)
    product_with_shadow(base, item, (x, y), angle)

    # A moving line gives the static product photography a clear spatial path.
    path = Image.new("RGBA", base.size, (0, 0, 0, 0))
    path_draw = ImageDraw.Draw(path)
    end = round(300 + 580 * motion)
    path_draw.arc((100, 730, 980, 1610), start=208, end=end, fill=(*GREEN, 150), width=8)
    base = Image.alpha_composite(base, path)
    draw_progress(base, t)
    return base


def scene_two(t: float, closed: Image.Image, opened: Image.Image) -> Image.Image:
    duration = 3.4
    progress = clamp(t / duration)
    base = make_background(False, t + 2.8)
    draw_header(base, dark=True)
    draw_label(base, "WHAT ARRIVES", 226, progress * 2.0, accent=TERRACOTTA)
    draw_reveal_text(base, ["TWO LAYERS.", "ONE CASE."], (64, 322), 96, progress * 1.45, fill=WHITE)

    open_width = round(690 + 40 * math.sin(progress * math.pi))
    open_item = fit(opened, open_width)
    open_x = round(560 - 430 * ease_out_cubic(progress))
    open_y = round(760 + 18 * math.sin(t * 2.8))
    product_with_shadow(base, open_item, (open_x, open_y), lerp(-9, 3, ease_in_out(progress)))

    draw = ImageDraw.Draw(base)
    chips = [
        ("BLACK", 80, 1455, 0.32),
        ("DOUBLE-LAYER", 294, 1455, 0.43),
        ("EMPTY CASE", 683, 1455, 0.56),
    ]
    for label, x, y, start in chips:
        local = ease_out_cubic(clamp((progress - start) / 0.24))
        if local <= 0:
            continue
        face = font(24, True)
        width = text_width(draw, label, face) + 40
        chip = Image.new("RGBA", (width, 56), (0, 0, 0, 0))
        chip_draw = ImageDraw.Draw(chip)
        chip_draw.rounded_rectangle((0, 0, width, 56), radius=28, fill=(*WHITE, 235))
        chip_draw.text((20, 15), label, font=face, fill=NAVY)
        base.alpha_composite(chip, (x, y + round(42 * (1 - local))))
    draw.text((80, 1570), "Electronics are not included.", font=font(31, True), fill=(232, 229, 222))
    draw_progress(base, t + 2.8, dark=True)
    return base


def scene_three(t: float, closed: Image.Image, opened: Image.Image) -> Image.Image:
    duration = 3.0
    progress = clamp(t / duration)
    base = make_background(True, t + 6.2)
    draw_header(base)
    draw_label(base, "QUICK FACTS", 226, progress * 2.2)

    closed_width = round(470 * lerp(0.88, 1.06, ease_in_out(progress)))
    closed_item = fit(closed, closed_width)
    product_with_shadow(base, closed_item, (round(-130 + 240 * ease_out_cubic(progress)), 500), -8 + 5 * progress)

    draw = ImageDraw.Draw(base)
    facts = [
        ("01", "Approx. 19 × 11 × 5.5 cm"),
        ("02", "Double-layer layout"),
        ("03", "Canada + U.S."),
    ]
    start_y = 1000
    for index, (number, value) in enumerate(facts):
        local = ease_out_cubic(clamp(progress * 1.55 - 0.18 - index * 0.22))
        if local <= 0:
            continue
        y = start_y + index * 174 + round(48 * (1 - local))
        x = round(230 - 155 * local)
        draw.rounded_rectangle((x, y, 1016, y + 136), radius=34, fill=(255, 255, 255, 238), outline=(222, 212, 199), width=2)
        draw.text((x + 34, y + 31), number, font=font(27, True), fill=GREEN)
        draw.text((x + 110, y + 31), value, font=font(34, True), fill=NAVY)

    draw_reveal_text(base, ["PACK SMALL.", "STAY READY."], (546, 400), 67, progress * 1.6, fill=NAVY, spacing=2)
    draw_progress(base, t + 6.2)
    return base


def scene_four(t: float, closed: Image.Image, opened: Image.Image) -> Image.Image:
    duration = 3.2
    progress = clamp(t / duration)
    base = make_background(False, t + 9.2)
    draw_header(base, dark=True)
    draw_label(base, "PUCHICA TRAVEL EDIT", 226, progress * 2.4)
    draw_reveal_text(base, ["ONE PLACE FOR", "THE SMALL GEAR."], (64, 324), 84, progress * 1.45, fill=WHITE)

    closed_item = fit(closed, round(410 + 26 * math.sin(progress * math.pi)))
    opened_item = fit(opened, round(500 + 34 * math.sin(progress * math.pi)))
    slide = ease_out_cubic(progress)
    product_with_shadow(base, closed_item, (round(-170 + 300 * slide), 760), -8 + 4 * slide)
    product_with_shadow(base, opened_item, (round(760 - 280 * slide), 830), 8 - 5 * slide)

    draw = ImageDraw.Draw(base)
    cta_y = 1460 + round(80 * (1 - ease_out_cubic(clamp(progress * 2 - 0.55))))
    draw.rounded_rectangle((64, cta_y, 1016, cta_y + 124), radius=62, fill=GREEN)
    cta = "SEE THE CABLE ORGANIZER"
    cta_face = font(33, True)
    cta_width = text_width(draw, cta, cta_face)
    draw.text(((WIDTH - cta_width) // 2, cta_y + 41), cta, font=cta_face, fill=WHITE)
    draw.text((64, cta_y + 164), "puchica.ca/tiktok", font=font(40, True), fill=WHITE)
    draw.text((64, cta_y + 220), "Shipping shown at checkout.", font=font(27), fill=(225, 225, 225))
    draw_progress(base, t + 9.2, dark=True)
    return base


def render(t: float, closed: Image.Image, opened: Image.Image) -> Image.Image:
    boundaries = (0.0, 2.8, 6.2, 9.2, DURATION)
    if t < boundaries[1]:
        current, local = 0, t
    elif t < boundaries[2]:
        current, local = 1, t - boundaries[1]
    elif t < boundaries[3]:
        current, local = 2, t - boundaries[2]
    else:
        current, local = 3, t - boundaries[3]

    scenes = (scene_one, scene_two, scene_three, scene_four)
    durations = (2.8, 3.4, 3.0, 3.2)
    frame = scenes[current](local, closed, opened)

    transition = 0.24
    remaining = durations[current] - local
    if current < 3 and remaining < transition:
        next_frame = scenes[current + 1](transition - remaining, closed, opened)
        amount = ease_in_out((transition - remaining) / transition)
        frame = Image.blend(frame, next_frame, amount)
    return frame.convert("RGB")


def build() -> None:
    if not SOURCE.exists():
        raise FileNotFoundError(f"Missing exact approved source image: {SOURCE}")
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise RuntimeError("FFmpeg was not found on PATH")

    source = Image.open(SOURCE).convert("RGB")
    closed = rgba_crop_without_white(source, (0, 105, 405, 735))
    opened = rgba_crop_without_white(source, (360, 135, 800, 630))

    FINAL.parent.mkdir(parents=True, exist_ok=True)
    command = [
        ffmpeg,
        "-y",
        "-v",
        "warning",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "rgb24",
        "-s",
        f"{WIDTH}x{HEIGHT}",
        "-r",
        str(FPS),
        "-i",
        "-",
        "-an",
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "18",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        str(FINAL),
    ]
    process = subprocess.Popen(command, stdin=subprocess.PIPE)
    assert process.stdin is not None
    frame_count = round(DURATION * FPS)
    try:
        for frame_number in range(frame_count):
            frame = render(frame_number / FPS, closed, opened)
            process.stdin.write(np.asarray(frame, dtype=np.uint8).tobytes())
    finally:
        process.stdin.close()
    return_code = process.wait()
    if return_code:
        raise RuntimeError(f"FFmpeg exited with status {return_code}")
    print(FINAL.relative_to(REPO))


if __name__ == "__main__":
    build()
