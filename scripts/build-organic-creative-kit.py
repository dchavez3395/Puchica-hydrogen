"""Build Puchica's organic launch graphics from exact approved Shopify media.

The generated editorial background is decorative only. Product pixels come
from the downloaded live Shopify hero files under source-media and are never
regenerated, recoloured, retouched, or geometrically altered beyond uniform
scaling and cropping inside a white card.
"""

from pathlib import Path
from textwrap import wrap

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


REPO = Path(__file__).resolve().parents[1]
ROOT = REPO / "outputs" / "organic-launch-creative-kit"
SOURCE = ROOT / "source-media"
FINAL = ROOT / "final"
FRAMES = ROOT / "video-frames"

BG = SOURCE / "puchica-editorial-background-v1.png"
FONT_REGULAR = Path(r"C:\Windows\Fonts\arial.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\arialbd.ttf")

NAVY = "#101A2E"
GREEN = "#0F715D"
VIOLET = "#6D4CFF"
TERRACOTTA = "#B55332"
CREAM = "#FFF9EF"
MUTED = "#5E6674"
LINE = "#DED4C7"


PRODUCTS = {
    "packing": ("packing-cubes.webp", "Packing cubes", "Canada only"),
    "cable": ("cable-case.webp", "Cable organizer", "Canada + U.S."),
    "tag": ("luggage-tag.webp", "Luggage ID tag", "Canada + U.S."),
    "clips": ("cable-clips.webp", "Cable clips", "Canada + U.S."),
    "jewelry": ("jewelry-case.webp", "Travel jewelry case", "Canada + U.S."),
    "storage": ("storage-bag.webp", "Clothes storage bag", "Canada only"),
    "toiletry": ("toiletry-organizer.webp", "Toiletry organizer", "Canada + U.S."),
    "wheels": ("wheel-covers.webp", "Luggage wheel covers", "Canada + U.S."),
    "handle": ("handle-wrap.webp", "Luggage handle wrap", "Canada + U.S."),
}


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_BOLD if bold else FONT_REGULAR), size)


def cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    return ImageOps.fit(image.convert("RGB"), size, method=Image.Resampling.LANCZOS)


def rounded_image(image: Image.Image, size: tuple[int, int], radius: int) -> Image.Image:
    fitted = cover(image, size).convert("RGBA")
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, *size), radius=radius, fill=255)
    fitted.putalpha(mask)
    return fitted


def canvas(size: tuple[int, int]) -> Image.Image:
    base = cover(Image.open(BG), size).convert("RGBA")
    wash = Image.new("RGBA", size, (255, 249, 239, 52))
    return Image.alpha_composite(base, wash)


def text_width(draw: ImageDraw.ImageDraw, value: str, fnt: ImageFont.FreeTypeFont) -> int:
    box = draw.textbbox((0, 0), value, font=fnt)
    return box[2] - box[0]


def wrap_pixels(draw: ImageDraw.ImageDraw, value: str, fnt: ImageFont.FreeTypeFont, width: int) -> list[str]:
    words = value.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = word if not current else f"{current} {word}"
        if text_width(draw, candidate, fnt) <= width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_wrapped(draw: ImageDraw.ImageDraw, xy: tuple[int, int], value: str, fnt: ImageFont.FreeTypeFont,
                 fill: str, width: int, spacing: int = 12, max_lines: int | None = None) -> int:
    x, y = xy
    lines = wrap_pixels(draw, value, fnt, width)
    if max_lines:
        lines = lines[:max_lines]
    line_height = fnt.size + spacing
    for index, line in enumerate(lines):
        draw.text((x, y + index * line_height), line, font=fnt, fill=fill)
    return y + len(lines) * line_height


def shadowed_panel(base: Image.Image, box: tuple[int, int, int, int], radius: int = 34,
                   fill=(255, 253, 248, 246)) -> None:
    x1, y1, x2, y2 = box
    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle((x1 + 8, y1 + 14, x2 + 8, y2 + 14), radius=radius,
                                             fill=(16, 26, 46, 48))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    base.alpha_composite(shadow)
    ImageDraw.Draw(base).rounded_rectangle(box, radius=radius, fill=fill, outline=LINE, width=2)


def header(base: Image.Image, series: str) -> None:
    draw = ImageDraw.Draw(base)
    draw.text((64, 54), "Puchica", font=font(42, True), fill=NAVY)
    draw.text((64, 108), series.upper(), font=font(21, True), fill=GREEN)
    draw.line((64, 144, 210, 144), fill=GREEN, width=4)


def footer(base: Image.Image, text: str = "puchica.ca  ·  Shipping shown at checkout") -> None:
    draw = ImageDraw.Draw(base)
    y = base.height - 82
    draw.line((64, y - 22, base.width - 64, y - 22), fill=(16, 26, 46, 60), width=2)
    draw.text((64, y), text, font=font(24, True), fill=NAVY)


def product_card(base: Image.Image, key: str, box: tuple[int, int, int, int], show_market: bool = True) -> None:
    filename, label, market = PRODUCTS[key]
    x1, y1, x2, y2 = box
    shadowed_panel(base, box, radius=28)
    pad = 18
    image_height = int((y2 - y1) * 0.68)
    image_box = (x1 + pad, y1 + pad, x2 - pad, y1 + image_height)
    source = Image.open(SOURCE / filename).convert("RGB")
    white = Image.new("RGB", (image_box[2] - image_box[0], image_box[3] - image_box[1]), "white")
    fitted = ImageOps.contain(source, white.size, Image.Resampling.LANCZOS)
    white.paste(fitted, ((white.width - fitted.width) // 2, (white.height - fitted.height) // 2))
    base.alpha_composite(rounded_image(white, white.size, 20), (image_box[0], image_box[1]))

    draw = ImageDraw.Draw(base)
    label_y = image_box[3] + 20
    draw_wrapped(draw, (x1 + 24, label_y), label, font(30, True), NAVY, x2 - x1 - 48,
                 spacing=5, max_lines=2)
    if show_market:
        market_y = y2 - 55
        badge_fill = GREEN if market != "Canada only" else TERRACOTTA
        badge_w = text_width(draw, market, font(20, True)) + 28
        draw.rounded_rectangle((x1 + 24, market_y - 8, x1 + 24 + badge_w, market_y + 28),
                               radius=16, fill=badge_fill)
        draw.text((x1 + 38, market_y), market, font=font(20, True), fill="white")


def make_feed(filename: str, series: str, title: str, subtitle: str, keys: list[str],
              note: str | None = None) -> None:
    size = (1080, 1350)
    base = canvas(size)
    header(base, series)
    draw = ImageDraw.Draw(base)
    title_bottom = draw_wrapped(draw, (64, 182), title, font(72, True), NAVY, 920, spacing=2, max_lines=3)
    subtitle_bottom = draw_wrapped(draw, (64, title_bottom + 18), subtitle, font(31), MUTED, 920,
                                   spacing=10, max_lines=3)
    grid_top = max(480, subtitle_bottom + 26)
    gap = 20
    card_width = (952 - gap * (len(keys) - 1)) // len(keys)
    for index, key in enumerate(keys):
        x1 = 64 + index * (card_width + gap)
        product_card(base, key, (x1, grid_top, x1 + card_width, 1190))
    if note:
        draw.rounded_rectangle((64, 1204, 1016, 1254), radius=20, fill=(255, 249, 239, 230))
        draw.text((82, 1217), note, font=font(21, True), fill=TERRACOTTA)
    footer(base)
    FINAL.mkdir(parents=True, exist_ok=True)
    base.convert("RGB").save(FINAL / filename, quality=95)


def make_story(filename: str, series: str, title: str, subtitle: str, keys: list[str],
               cta: str) -> None:
    size = (1080, 1920)
    base = canvas(size)
    header(base, series)
    draw = ImageDraw.Draw(base)
    title_bottom = draw_wrapped(draw, (64, 190), title, font(82, True), NAVY, 920, spacing=3, max_lines=3)
    subtitle_bottom = draw_wrapped(draw, (64, title_bottom + 18), subtitle, font(34), MUTED, 920,
                                   spacing=10, max_lines=3)
    grid_top = max(560, subtitle_bottom + 34)
    if len(keys) == 1:
        product_card(base, keys[0], (120, grid_top, 960, 1580))
    else:
        gap = 18
        card_width = (952 - gap * (len(keys) - 1)) // len(keys)
        for index, key in enumerate(keys):
            x1 = 64 + index * (card_width + gap)
            product_card(base, key, (x1, grid_top, x1 + card_width, 1580))
    draw.rounded_rectangle((120, 1640, 960, 1738), radius=44, fill=NAVY)
    cta_width = text_width(draw, cta, font(31, True))
    draw.text(((1080 - cta_width) // 2, 1671), cta, font=font(31, True), fill="white")
    footer(base)
    FRAMES.mkdir(parents=True, exist_ok=True)
    base.convert("RGB").save(FRAMES / filename, quality=95)


def build() -> None:
    FINAL.mkdir(parents=True, exist_ok=True)
    FRAMES.mkdir(parents=True, exist_ok=True)

    make_feed(
        "day01-slide01-launch-edit.png",
        "The Puchica travel edit",
        "Pack with less rummaging.",
        "A focused set of organizers for clothes, cables, and toiletries.",
        ["packing", "cable", "toiletry"],
        "Availability varies by country.",
    )
    make_feed(
        "day01-slide02-three-ways.png",
        "Three ways to pack smarter",
        "Give travel essentials a place.",
        "Separate clothing, contain small cables, and keep travel-size toiletries visible.",
        ["packing", "cable", "toiletry"],
    )
    make_feed(
        "day01-slide03-market-note.png",
        "Shop by destination",
        "Clear availability before checkout.",
        "The full edit is available in Canada. Seven product pages are available in the United States.",
        ["cable", "handle"],
        "Packing cubes + Large Blue storage bag: Canada only.",
    )

    make_story(
        "day02-frame01-loose-cables.png",
        "Cable organization",
        "Loose cables?",
        "Start with one compact case.",
        ["cable"],
        "See the organizer",
    )
    make_story(
        "day02-frame02-two-layers.png",
        "Cable organization",
        "Two layers. One place.",
        "For small cables, adapters, memory cards, and travel accessories.",
        ["cable"],
        "Electronics not included",
    )
    make_story(
        "day02-frame03-availability.png",
        "Cable organization",
        "Ready for the next trip.",
        "Available in Canada and the United States.",
        ["cable"],
        "Shipping shown at checkout",
    )

    make_story(
        "day03-story-travel-details.png",
        "Travel details",
        "Which detail do you notice first?",
        "An ID tag, a soft handle wrap, or wheel covers for compatible luggage.",
        ["tag", "handle", "wheels"],
        "Reply with your pick",
    )
    make_feed(
        "day04-small-things-carousel.png",
        "Small-item organization",
        "Keep the small things together.",
        "Dedicated spaces for jewelry and travel-size toiletries.",
        ["jewelry", "toiletry"],
    )
    make_feed(
        "day05-canada-organization.png",
        "Canada edit",
        "For the trip—and the unpacking.",
        "Standard zippered packing cubes plus a handled bag for folded soft items.",
        ["packing", "storage"],
        "Both products are currently Canada only.",
    )
    make_feed(
        "day06-cable-utility.png",
        "Cable organization",
        "At the desk or in the bag.",
        "Route compatible loose cables, then contain the small accessories you carry.",
        ["clips", "cable"],
        "Cable case sold empty. Cable clips sold separately. Electronics are not included.",
    )
    make_feed(
        "day07-travel-edit-recap.png",
        "The Puchica travel edit",
        "What would make your next trip easier?",
        "Start with the organizer that solves a real packing annoyance for you.",
        ["cable", "jewelry", "handle"],
        "Explore the travel edit at puchica.ca.",
    )


if __name__ == "__main__":
    build()
