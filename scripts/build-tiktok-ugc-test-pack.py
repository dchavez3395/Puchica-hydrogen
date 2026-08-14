"""Build four no-spend vertical Puchica organic-video tests.

The fictional host is AI-generated and never presented as a customer. Product
pixels come from the exact approved Shopify source media and are only uniformly
scaled inside a white card. Videos are silent so licensed Commercial Music
Library audio can be selected inside TikTok at publication time.
"""

from pathlib import Path
import shutil
import subprocess

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


REPO = Path(__file__).resolve().parents[1]
ROOT = REPO / "outputs" / "tiktok-ugc-test-pack"
SOURCE = ROOT / "source-media"
ORGANIC_SOURCE = REPO / "outputs" / "organic-launch-creative-kit" / "source-media"
FRAMES = ROOT / "frames"
FINAL = ROOT / "final"

HOST = SOURCE / "puchica-synthetic-host-v1.png"
FONT_REGULAR = Path(r"C:\Windows\Fonts\arial.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\arialbd.ttf")

WIDTH, HEIGHT = 1080, 1920
NAVY = "#101A2E"
GREEN = "#0F715D"
CREAM = "#FFF9EF"
MUTED = "#5E6674"
LAVENDER = "#DDD7FF"
TERRACOTTA = "#B55332"
WHITE = "#FFFFFF"


CAMPAIGNS = {
    "cable-organizer": {
        "source": "cable-case.webp",
        "hook": "Your charger bag\nshouldn't look like this.",
        "title": "Give the small pieces one place.",
        "feature": "Double-layer layout",
        "proof": "Case sold empty.\nElectronics not included.",
        "availability": "Canada + U.S.",
        "cta": "See the cable organizer",
        "accent": GREEN,
    },
    "cable-organizer-offer-clarity": {
        "source": "cable-case.webp",
        "hook": "What actually arrives\nin this cable case?",
        "title": "One case. Two usable layers.",
        "feature": "Approx. 19 × 11 × 5.5 cm",
        "proof": "One empty black organizer.\nCables not included.",
        "availability": "Canada + U.S.",
        "cta": "See the cable organizer",
        "accent": GREEN,
    },
    "packing-cubes": {
        "source": "packing-cubes.webp",
        "hook": "One suitcase.\nThree separate zones.",
        "title": "Separate clothes before you zip.",
        "feature": "Small · medium · large",
        "proof": "Standard zippered organizers.\nNot vacuum compression bags.",
        "availability": "Canada only",
        "cta": "See the 3-piece set",
        "accent": TERRACOTTA,
    },
    "luggage-tag": {
        "source": "luggage-tag.webp",
        "hook": "The five-second check\nbefore your bag leaves.",
        "title": "Attach. Add details. Recheck.",
        "feature": "White luggage ID tag",
        "proof": "Update your contact details\nbefore each trip.",
        "availability": "Canada + U.S.",
        "cta": "See the luggage tag",
        "accent": GREEN,
    },
}


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_BOLD if bold else FONT_REGULAR), size)


def cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    return ImageOps.fit(image.convert("RGB"), size, method=Image.Resampling.LANCZOS)


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0], size[1]), radius=radius, fill=255)
    return mask


def wrap_text(draw: ImageDraw.ImageDraw, value: str, fnt: ImageFont.FreeTypeFont,
              max_width: int) -> list[str]:
    lines: list[str] = []
    for paragraph in value.splitlines():
        words = paragraph.split()
        current = ""
        for word in words:
            candidate = word if not current else f"{current} {word}"
            if draw.textbbox((0, 0), candidate, font=fnt)[2] <= max_width:
                current = candidate
            else:
                if current:
                    lines.append(current)
                current = word
        if current:
            lines.append(current)
    return lines


def draw_text_block(draw: ImageDraw.ImageDraw, xy: tuple[int, int], value: str,
                    fnt: ImageFont.FreeTypeFont, fill: str, max_width: int,
                    spacing: int = 12) -> int:
    x, y = xy
    lines = wrap_text(draw, value, fnt, max_width)
    step = fnt.size + spacing
    for index, line in enumerate(lines):
        draw.text((x, y + index * step), line, font=fnt, fill=fill)
    return y + len(lines) * step


def base_cream(accent: str) -> Image.Image:
    base = Image.new("RGBA", (WIDTH, HEIGHT), CREAM)
    shapes = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(shapes)
    draw.ellipse((-260, -180, 540, 620), fill=(*hex_rgb(LAVENDER), 92))
    draw.ellipse((680, 1310, 1320, 2020), fill=(*hex_rgb(accent), 35))
    shapes = shapes.filter(ImageFilter.GaussianBlur(26))
    return Image.alpha_composite(base, shapes)


def hex_rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4))


def host_canvas() -> Image.Image:
    return cover(Image.open(HOST), (WIDTH, HEIGHT)).convert("RGBA")


def dark_gradient(size: tuple[int, int], start_y: int = 860) -> Image.Image:
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    pixels = layer.load()
    for y in range(start_y, size[1]):
        alpha = int(220 * (y - start_y) / max(1, size[1] - start_y))
        for x in range(size[0]):
            pixels[x, y] = (16, 26, 46, alpha)
    return layer


def label_chip(base: Image.Image, text: str = "AI PRESENTER · PUCHICA") -> None:
    draw = ImageDraw.Draw(base)
    fnt = font(23, True)
    box = draw.textbbox((0, 0), text, font=fnt)
    w = box[2] - box[0] + 42
    draw.rounded_rectangle((58, 74, 58 + w, 124), radius=25, fill=(16, 26, 46, 225))
    draw.text((79, 88), text, font=fnt, fill=WHITE)


def brand_mark(base: Image.Image, dark: bool = False) -> None:
    draw = ImageDraw.Draw(base)
    fill = WHITE if dark else NAVY
    draw.text((64, 154), "Puchica", font=font(34, True), fill=fill)


def product_card(base: Image.Image, source_name: str, box: tuple[int, int, int, int]) -> None:
    x1, y1, x2, y2 = box
    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        (x1 + 10, y1 + 18, x2 + 10, y2 + 18), radius=44, fill=(16, 26, 46, 45)
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(20))
    base.alpha_composite(shadow)

    card = Image.new("RGBA", (x2 - x1, y2 - y1), WHITE)
    source = Image.open(ORGANIC_SOURCE / source_name).convert("RGB")
    contained = ImageOps.contain(source, (card.width - 70, card.height - 70), Image.Resampling.LANCZOS)
    card.alpha_composite(contained.convert("RGBA"), (
        (card.width - contained.width) // 2,
        (card.height - contained.height) // 2,
    ))
    card.putalpha(rounded_mask(card.size, 44))
    base.alpha_composite(card, (x1, y1))


def make_hook(slug: str, cfg: dict[str, str]) -> Path:
    base = host_canvas()
    base = Image.alpha_composite(base, dark_gradient(base.size, 820))
    label_chip(base)
    brand_mark(base, dark=True)
    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle((58, 1110, 1022, 1580), radius=46, fill=(16, 26, 46, 218))
    draw_text_block(draw, (96, 1170), cfg["hook"], font(70, True), WHITE, 860, spacing=9)
    draw.text((98, 1498), "A practical travel reset.", font=font(30), fill="#E8E5DF")
    return save_frame(base, slug, 1, "hook")


def make_product(slug: str, cfg: dict[str, str]) -> Path:
    base = base_cream(cfg["accent"])
    label_chip(base)
    brand_mark(base)
    draw = ImageDraw.Draw(base)
    draw_text_block(draw, (64, 236), cfg["title"], font(66, True), NAVY, 920, spacing=8)
    product_card(base, cfg["source"], (90, 550, 990, 1440))
    draw.rounded_rectangle((90, 1492, 990, 1592), radius=42, fill=cfg["accent"])
    feature_font = font(32, True)
    box = draw.textbbox((0, 0), cfg["feature"], font=feature_font)
    draw.text(((WIDTH - (box[2] - box[0])) // 2, 1525), cfg["feature"], font=feature_font, fill=WHITE)
    draw.text((90, 1660), "Exact approved product image", font=font(25, True), fill=MUTED)
    return save_frame(base, slug, 2, "product")


def make_proof(slug: str, cfg: dict[str, str]) -> Path:
    base = base_cream(cfg["accent"])
    label_chip(base)
    brand_mark(base)
    product_card(base, cfg["source"], (170, 310, 910, 1010))
    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle((64, 1090, 1016, 1510), radius=48, fill=(255, 255, 255, 235),
                           outline="#DED4C7", width=3)
    draw.text((112, 1150), "GOOD TO KNOW", font=font(25, True), fill=cfg["accent"])
    draw_text_block(draw, (112, 1210), cfg["proof"], font(55, True), NAVY, 840, spacing=10)
    draw.text((112, 1445), "Clear facts before checkout.", font=font(28), fill=MUTED)
    return save_frame(base, slug, 3, "facts")


def make_cta(slug: str, cfg: dict[str, str]) -> Path:
    base = host_canvas()
    wash = Image.new("RGBA", base.size, (16, 26, 46, 118))
    base = Image.alpha_composite(base, wash)
    label_chip(base)
    brand_mark(base, dark=True)
    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle((58, 1080, 1022, 1585), radius=48, fill=(255, 249, 239, 238))
    draw.text((102, 1140), cfg["availability"].upper(), font=font(28, True), fill=cfg["accent"])
    draw_text_block(draw, (102, 1210), cfg["cta"], font(67, True), NAVY, 820, spacing=8)
    draw.text((104, 1450), "puchica.ca · shipping shown at checkout", font=font(25, True), fill=MUTED)
    return save_frame(base, slug, 4, "cta")


def save_frame(base: Image.Image, slug: str, number: int, name: str) -> Path:
    folder = FRAMES / slug
    folder.mkdir(parents=True, exist_ok=True)
    path = folder / f"{number:02d}-{name}.jpg"
    base.convert("RGB").save(path, quality=95, subsampling=0)
    return path


def encode_video(slug: str, frames: list[Path]) -> Path:
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise RuntimeError("FFmpeg was not found on PATH")
    FINAL.mkdir(parents=True, exist_ok=True)
    output = FINAL / f"{slug}-organic-test-11s.mp4"
    command = [ffmpeg, "-y"]
    for frame in frames:
        command.extend(["-loop", "1", "-t", "3", "-i", str(frame)])
    filter_graph = (
        "[0:v]fps=30,format=yuv420p,setsar=1[v0];"
        "[1:v]fps=30,format=yuv420p,setsar=1[v1];"
        "[2:v]fps=30,format=yuv420p,setsar=1[v2];"
        "[3:v]fps=30,format=yuv420p,setsar=1[v3];"
        "[v0][v1]xfade=transition=fade:duration=0.35:offset=2.65[x1];"
        "[x1][v2]xfade=transition=fade:duration=0.35:offset=5.30[x2];"
        "[x2][v3]xfade=transition=fade:duration=0.35:offset=7.95,format=yuv420p[v]"
    )
    command.extend([
        "-filter_complex", filter_graph,
        "-map", "[v]",
        "-t", "10.95",
        "-r", "30",
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "18",
        "-movflags", "+faststart",
        "-an",
        str(output),
    ])
    subprocess.run(command, check=True, capture_output=True, text=True)
    return output


def build() -> None:
    if not HOST.exists():
        raise FileNotFoundError(f"Missing synthetic host: {HOST}")
    for slug, cfg in CAMPAIGNS.items():
        frames = [
            make_hook(slug, cfg),
            make_product(slug, cfg),
            make_proof(slug, cfg),
            make_cta(slug, cfg),
        ]
        path = encode_video(slug, frames)
        print(path.relative_to(REPO))


if __name__ == "__main__":
    build()
