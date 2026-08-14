from __future__ import annotations

from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "generated-images" / "organic-2026-08"
REF = OUT / "source-reference"

PAPER = "#FCF7EE"
CREAM = "#F4E7D0"
INK = "#1E1712"
MUTED = "#6E6353"
LINE = "#E9D9BE"
EMBER = "#BE451E"
JADE = "#0E7C5B"
COBALT = "#1F5FA8"
MARIGOLD = "#E8A020"
VIOLET = "#6D4CFF"
WHITE = "#FFFFFF"

FONT_REGULAR = Path(r"C:\Windows\Fonts\segoeui.ttf")
FONT_SEMIBOLD = Path(r"C:\Windows\Fonts\seguisb.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\segoeuib.ttf")


def font(size: int, bold: bool = False, semibold: bool = False) -> ImageFont.FreeTypeFont:
    path = FONT_BOLD if bold else FONT_SEMIBOLD if semibold else FONT_REGULAR
    return ImageFont.truetype(str(path), size=size)


def load_rgb(path: Path) -> Image.Image:
    return Image.open(path).convert("RGB")


DAY1 = load_rgb(OUT / "day-01-toiletry-organizer-feed-1080x1350.jpg")
DAY2 = load_rgb(OUT / "day-02-packing-cubes-feed-1080x1350.jpg")
DAY3 = load_rgb(OUT / "day-03-cable-organizer-feed-1080x1350.jpg")
TOILETRY_REF = load_rgb(REF / "toiletry-03.webp")
PACKING_DIM_REF = load_rgb(REF / "packing-03.webp")
PACKING_REF = load_rgb(REF / "packing-09.webp")
CABLE_REF = load_rgb(REF / "cable-10.webp")
DAY1_DETAIL = DAY1.crop((300, 90, 1040, 1330))


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius, fill=255)
    return mask


def paste_cover(canvas: Image.Image, source: Image.Image, box: tuple[int, int, int, int], radius: int = 28) -> None:
    x1, y1, x2, y2 = box
    fitted = ImageOps.fit(source, (x2 - x1, y2 - y1), method=Image.Resampling.LANCZOS)
    canvas.paste(fitted, (x1, y1), rounded_mask(fitted.size, radius))


def paste_contain(
    canvas: Image.Image,
    source: Image.Image,
    box: tuple[int, int, int, int],
    radius: int = 28,
    background: str = WHITE,
) -> None:
    x1, y1, x2, y2 = box
    panel = Image.new("RGB", (x2 - x1, y2 - y1), background)
    fitted = ImageOps.contain(source, panel.size, method=Image.Resampling.LANCZOS)
    panel.paste(fitted, ((panel.width - fitted.width) // 2, (panel.height - fitted.height) // 2))
    canvas.paste(panel, (x1, y1), rounded_mask(panel.size, radius))


def wrap_lines(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    line = ""
    for word in words:
        trial = word if not line else f"{line} {word}"
        if draw.textbbox((0, 0), trial, font=fnt)[2] <= max_width:
            line = trial
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def text_block(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    fnt: ImageFont.FreeTypeFont,
    fill: str,
    max_width: int,
    line_gap: int = 10,
    max_lines: int | None = None,
) -> int:
    x, y = xy
    lines = wrap_lines(draw, text, fnt, max_width)
    if max_lines:
        lines = lines[:max_lines]
    line_height = fnt.size + line_gap
    for index, line in enumerate(lines):
        draw.text((x, y + index * line_height), line, font=fnt, fill=fill)
    return y + len(lines) * line_height


def pill(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str, fill: str, ink: str = WHITE) -> int:
    x, y = xy
    fnt = font(27, semibold=True)
    width = draw.textbbox((0, 0), text, font=fnt)[2] + 38
    draw.rounded_rectangle((x, y, x + width, y + 48), radius=24, fill=fill)
    draw.text((x + 19, y + 7), text, font=fnt, fill=ink)
    return width


def brand_header(draw: ImageDraw.ImageDraw, day: str, accent: str = EMBER) -> None:
    draw.text((64, 48), "PUCHICA", font=font(31, bold=True), fill=INK)
    draw.ellipse((230, 57, 248, 75), fill=accent)
    pill(draw, (820, 42), day.upper(), accent)


def footer(draw: ImageDraw.ImageDraw, text: str, y: int, width: int = 1080, accent: str = EMBER) -> None:
    draw.rounded_rectangle((64, y, width - 64, y + 94), radius=28, fill=INK)
    text_block(draw, (92, y + 23), text, font(29, semibold=True), WHITE, width - 184, line_gap=6, max_lines=2)
    draw.rounded_rectangle((64, y + 105, 232, y + 111), radius=3, fill=accent)


def base(size: tuple[int, int], day: str, accent: str = EMBER) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    canvas = Image.new("RGB", size, PAPER)
    draw = ImageDraw.Draw(canvas)
    brand_header(draw, day, accent)
    return canvas, draw


def title(draw: ImageDraw.ImageDraw, heading: str, sub: str, width: int = 950, story: bool = False) -> int:
    h_size = 66 if story else 58
    s_size = 34 if story else 30
    end = text_block(draw, (64, 124), heading, font(h_size, bold=True), INK, width, line_gap=4, max_lines=3)
    return text_block(draw, (64, end + 16), sub, font(s_size), MUTED, width, line_gap=8, max_lines=3)


def save(canvas: Image.Image, name: str) -> None:
    canvas.save(OUT / name, format="JPEG", quality=92, optimize=True, progressive=True)


def day4(size: tuple[int, int], story: bool = False) -> Image.Image:
    canvas, draw = base(size, "Day 4", VIOLET)
    title(draw, "WHAT CAUSES THE MOST PACKING CHAOS?", "Pick the problem you want us to demonstrate next.", story=story)
    top = 390 if story else 330
    bottom = size[1] - (300 if story else 270)
    gap = 18
    panel_w = (size[0] - 128 - gap * 2) // 3
    items = [("A", "CLOTHING", DAY2, MARIGOLD), ("B", "TOILETRIES", DAY1, JADE), ("C", "CABLES", DAY3, COBALT)]
    for index, (letter, label, source, accent) in enumerate(items):
        x1 = 64 + index * (panel_w + gap)
        x2 = x1 + panel_w
        paste_cover(canvas, source, (x1, top, x2, bottom), radius=30)
        draw.rounded_rectangle((x1 + 16, top + 16, x1 + 72, top + 72), radius=18, fill=accent)
        draw.text((x1 + 34, top + 21), letter, font=font(31, bold=True), fill=WHITE, anchor="ma")
        draw.rounded_rectangle((x1 + 12, bottom - 76, x2 - 12, bottom - 14), radius=22, fill=INK)
        draw.text(((x1 + x2) // 2, bottom - 64), label, font=font(24, bold=True), fill=WHITE, anchor="ma")
    footer(draw, "Comment A, B, or C.", size[1] - 190, accent=VIOLET)
    return canvas


def detail_slide(day: str, heading: str, body: str, source: Image.Image, accent: str, contain: bool = False) -> Image.Image:
    canvas, draw = base((1080, 1350), day, accent)
    end = title(draw, heading, body)
    image_box = (64, max(360, end + 34), 1016, 1060)
    (paste_contain if contain else paste_cover)(canvas, source, image_box, radius=32)
    footer(draw, "Exact black organizer • toiletries not included", 1120, accent=accent)
    return canvas


def day5_story() -> Image.Image:
    canvas, draw = base((1080, 1920), "Day 5", JADE)
    title(draw, "SEE WHAT YOU PACKED", "Hook, carry loop, zip closure, and three storage sections.", story=True)
    paste_cover(canvas, DAY1, (64, 390, 1016, 1390), radius=36)
    draw.rounded_rectangle((92, 1320, 988, 1592), radius=32, fill=CREAM)
    facts = ["Closed: approx. 22 × 14 × 8 cm", "Open height: approx. 53 cm", "Wipe clean; dry fully before storing"]
    for i, fact in enumerate(facts):
        cy = 1375 + i * 70
        draw.ellipse((126, cy, 150, cy + 24), fill=JADE)
        draw.text((174, cy - 5), fact, font=font(31, semibold=True), fill=INK)
    footer(draw, "View the exact product details.", 1710, accent=JADE)
    return canvas


def sequence_slide(number: str, verb: str, body: str, accent: str) -> Image.Image:
    canvas, draw = base((1080, 1350), "Day 6", accent)
    draw.text((64, 132), number, font=font(150, bold=True), fill=accent)
    draw.text((256, 174), verb.upper(), font=font(70, bold=True), fill=INK)
    paste_cover(canvas, DAY2, (64, 330, 1016, 1010), radius=34)
    draw.rounded_rectangle((88, 920, 992, 1082), radius=30, fill=CREAM)
    text_block(draw, (122, 960), body, font(31, semibold=True), INK, 830, line_gap=8, max_lines=3)
    footer(draw, "Standard zippered organizers—not compression cubes.", 1130, accent=accent)
    return canvas


def day6_story() -> Image.Image:
    canvas, draw = base((1080, 1920), "Day 6", MARIGOLD)
    title(draw, "FOLD. GROUP. ZIP. PLACE.", "A calmer suitcase, one simple sequence.", story=True)
    paste_cover(canvas, DAY2, (64, 360, 1016, 1280), radius=38)
    steps = [("1", "FOLD"), ("2", "GROUP"), ("3", "ZIP"), ("4", "PLACE")]
    for i, (n, label) in enumerate(steps):
        x = 64 + i * 242
        draw.rounded_rectangle((x, 1340, x + 218, 1508), radius=28, fill=CREAM)
        draw.text((x + 109, 1370), n, font=font(42, bold=True), fill=MARIGOLD, anchor="ma")
        draw.text((x + 109, 1432), label, font=font(26, bold=True), fill=INK, anchor="ma")
    footer(draw, "Clothing shown is not included.", 1710, accent=MARIGOLD)
    return canvas


def day7(size: tuple[int, int], story: bool = False) -> Image.Image:
    canvas, draw = base(size, "Day 7", COBALT)
    title(draw, "BEFORE THE BAG CLOSES", "Give compatible small tech one place to travel together.", story=story)
    top = 370 if story else 340
    image_bottom = 1180 if story else 870
    paste_cover(canvas, DAY3, (64, top, 1016, image_bottom), radius=36)
    card_top = 1230 if story else 900
    card_bottom = size[1] - 260
    draw.rounded_rectangle((64, card_top, 1016, card_bottom), radius=34, fill=CREAM)
    items = ["Cable", "Adapter", "Earbuds", "Memory card"]
    cols = 2
    for i, item in enumerate(items):
        col, row = i % cols, i // cols
        x = 104 + col * 440
        y = card_top + 48 + row * 90
        draw.rounded_rectangle((x, y, x + 38, y + 38), radius=9, outline=COBALT, width=5)
        draw.line((x + 10, y + 20, x + 17, y + 29, x + 31, y + 9), fill=COBALT, width=5, joint="curve")
        draw.text((x + 58, y - 3), item, font=font(32, semibold=True), fill=INK)
    footer(draw, "Soft organizer—not a waterproof electronics case.", size[1] - 190, accent=COBALT)
    return canvas


def draw_loose_items(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int]) -> None:
    x1, y1, x2, y2 = box
    draw.rounded_rectangle(box, radius=28, fill=CREAM)
    colours = [EMBER, JADE, COBALT, MARIGOLD]
    shapes = [
        (x1 + 75, y1 + 150, x1 + 155, y1 + 360),
        (x1 + 180, y1 + 90, x1 + 285, y1 + 300),
        (x1 + 300, y1 + 180, x1 + 400, y1 + 390),
        (x1 + 115, y1 + 370, x1 + 340, y1 + 470),
    ]
    for colour, shape in zip(colours, shapes):
        draw.rounded_rectangle(shape, radius=24, fill=colour)
    draw.arc((x1 + 75, y1 + 30, x2 - 55, y2 - 20), 20, 270, fill=MUTED, width=11)


def day8(size: tuple[int, int], story: bool = False) -> Image.Image:
    canvas, draw = base(size, "Day 8", JADE)
    title(draw, "FROM LOOSE PILE TO VISIBLE SECTIONS", "A before-and-after built around separation—not inflated capacity claims.", story=story)
    top = 385 if story else 350
    bottom = 1500 if story else 1040
    mid = 535
    draw_loose_items(draw, (64, top, mid - 16, bottom))
    paste_cover(canvas, DAY1, (mid + 16, top, 1016, bottom), radius=28)
    pill(draw, (92, top + 28), "BEFORE", EMBER)
    pill(draw, (mid + 44, top + 28), "AFTER", JADE)
    footer(draw, "Hang only from a compatible hook or rail.", size[1] - 190, accent=JADE)
    return canvas


def day9_slide(label: str, dimensions: str, use: str, accent: str, source: Image.Image) -> Image.Image:
    canvas, draw = base((1080, 1350), "Day 9", accent)
    draw.text((64, 130), label.upper(), font=font(82, bold=True), fill=INK)
    pill(draw, (64, 242), f"APPROX. {dimensions}", accent)
    paste_contain(canvas, source, (64, 330, 1016, 940), radius=34, background=WHITE)
    draw.rounded_rectangle((64, 970, 1016, 1096), radius=30, fill=CREAM)
    text_block(draw, (96, 1000), f"Example use: {use}", font(32, semibold=True), INK, 870, line_gap=8, max_lines=2)
    footer(draw, "Check your luggage dimensions and avoid overfilling.", 1130, accent=accent)
    return canvas


def day9_story() -> Image.Image:
    canvas, draw = base((1080, 1920), "Day 9", MARIGOLD)
    title(draw, "THREE SIZES. THREE ZIPPERED ZONES.", "Examples, not capacity promises.", story=True)
    paste_contain(canvas, PACKING_DIM_REF, (64, 350, 1016, 1160), radius=36, background=WHITE)
    facts = [("SMALL", "~20 × 30 cm"), ("MEDIUM", "~25 × 35 cm"), ("LARGE", "~30 × 40 cm")]
    for i, (name, dim) in enumerate(facts):
        y = 1220 + i * 135
        draw.rounded_rectangle((64, y, 1016, y + 105), radius=26, fill=CREAM)
        draw.text((104, y + 28), name, font=font(31, bold=True), fill=INK)
        draw.text((956, y + 28), dim, font=font(31, semibold=True), fill=MARIGOLD, anchor="ra")
    footer(draw, "Canada storefront only • clothing not included", 1710, accent=MARIGOLD)
    return canvas


def day10(size: tuple[int, int], story: bool = False) -> Image.Image:
    canvas, draw = base(size, "Day 10", COBALT)
    title(draw, "ONE LAST ITEM BEFORE THE BAG CLOSES", "Two layers help keep compatible small accessories together.", story=story)
    top = 370 if story else 340
    bottom = 1360 if story else 980
    paste_cover(canvas, DAY3, (64, top, 1016, bottom), radius=36)
    badge_y = bottom - 120
    draw.rounded_rectangle((92, badge_y, 988, badge_y + 88), radius=26, fill=INK)
    draw.text((540, badge_y + 23), "WRIST STRAP • APPROX. 19 × 11 × 5.5 CM", font=font(29, bold=True), fill=WHITE, anchor="ma")
    footer(draw, "Compatibility depends on what you carry; electronics not included.", size[1] - 190, accent=COBALT)
    return canvas


def check(draw: ImageDraw.ImageDraw, x: int, y: int, text: str, accent: str) -> None:
    draw.ellipse((x, y, x + 42, y + 42), fill=accent)
    draw.line((x + 11, y + 22, x + 19, y + 31, x + 33, y + 12), fill=WHITE, width=5, joint="curve")
    draw.text((x + 64, y - 3), text, font=font(31, semibold=True), fill=INK)


def compact_check(draw: ImageDraw.ImageDraw, x: int, y: int, text: str, accent: str) -> None:
    draw.ellipse((x, y, x + 32, y + 32), fill=accent)
    draw.line((x + 8, y + 17, x + 14, y + 24, x + 25, y + 9), fill=WHITE, width=4, joint="curve")
    draw.text((x + 50, y - 2), text, font=font(25, semibold=True), fill=INK)


def day11(size: tuple[int, int], story: bool = False) -> Image.Image:
    canvas, draw = base(size, "Day 11", VIOLET)
    title(draw, "WE CUT THE CATALOG DOWN TO WHAT WE COULD VERIFY", "A smaller edit with a higher evidence bar.", story=story)
    photo_top = 380 if story else 345
    photo_bottom = 930 if story else 700
    gap = 18
    panel_w = (952 - gap * 2) // 3
    for i, source in enumerate((DAY1, DAY2, DAY3)):
        x = 64 + i * (panel_w + gap)
        paste_cover(canvas, source, (x, photo_top, x + panel_w, photo_bottom), radius=28)
    card_top = 990 if story else 740
    card_bottom = size[1] - 270
    draw.rounded_rectangle((64, card_top, 1016, card_bottom), radius=34, fill=CREAM)
    items = ["Exact variant", "Stock + cost", "Destination routes", "Storefront behavior", "Honest copy"]
    for i, item in enumerate(items):
        if story:
            check(draw, 110, card_top + 48 + i * 82, item, VIOLET)
        else:
            compact_check(draw, 110, card_top + 34 + i * 58, item, VIOLET)
    footer(draw, "This verification does not replace a real delivery test.", size[1] - 190, accent=VIOLET)
    return canvas


def faq_row(draw: ImageDraw.ImageDraw, y: int, question: str, answer: str, accent: str, width: int = 952) -> int:
    q_font = font(31, bold=True)
    a_font = font(27)
    q_lines = wrap_lines(draw, question, q_font, width - 96)
    a_lines = wrap_lines(draw, answer, a_font, width - 96)
    height = 48 + len(q_lines) * 40 + len(a_lines) * 36 + 30
    draw.rounded_rectangle((64, y, 1016, y + height), radius=28, fill=CREAM)
    draw.ellipse((94, y + 33, 120, y + 59), fill=accent)
    q_end = text_block(draw, (144, y + 25), question, q_font, INK, width - 120, line_gap=8)
    text_block(draw, (144, q_end + 2), answer, a_font, MUTED, width - 120, line_gap=9)
    return y + height + 18


def day12(size: tuple[int, int], story: bool = False) -> Image.Image:
    canvas, draw = base(size, "Day 12", JADE)
    end = title(draw, "SHIPPING FAQ", "The checkout—not a social caption—is the source for the exact rate.", story=story)
    y = max(330, end + 30)
    rows = [
        ("Where is shipping shown?", "Enter the delivery address and review the option and cost at checkout."),
        ("Is an arrival date guaranteed?", "No. A delivery estimate may not always be available."),
        ("What about tracking?", "When a tracked service is available, tracking is sent after the order ships."),
        ("How do returns work?", "Review the refund policy before buying and contact us before mailing a return."),
    ]
    for question, answer in rows:
        y = faq_row(draw, y, question, answer, JADE)
    footer(draw, "Read product, shipping, and refund details before payment.", size[1] - 190, accent=JADE)
    return canvas


def day13(size: tuple[int, int], story: bool = False) -> Image.Image:
    canvas, draw = base(size, "Day 13", MARIGOLD)
    title(draw, "HONEST PACKING-CUBE FIT", "What the charcoal three-piece set does—and what we are not claiming.", story=story)
    image_top = 390 if story else 350
    image_bottom = 1080 if story else 760
    paste_cover(canvas, DAY2, (64, image_top, 1016, image_bottom), radius=36)
    card_top = image_bottom + 30
    card_bottom = size[1] - 270
    gap = 24
    card_w = (952 - gap) // 2
    draw.rounded_rectangle((64, card_top, 64 + card_w, card_bottom), radius=30, fill="#E2F1EA")
    draw.rounded_rectangle((64 + card_w + gap, card_top, 1016, card_bottom), radius=30, fill="#FFF1E7")
    draw.text((96, card_top + 30), "WHAT IT DOES", font=font(29, bold=True), fill=JADE)
    draw.text((64 + card_w + gap + 32, card_top + 30), "NOT CLAIMED", font=font(29, bold=True), fill=EMBER)
    does = ["Separates clothing", "Zips closed", "Folds flat", "Carries easily"]
    not_claimed = ["Vacuum compression", "Waterproofing", "Included clothing"]
    for i, item in enumerate(does):
        check(draw, 96, card_top + 92 + i * 76, item, JADE)
    for i, item in enumerate(not_claimed):
        x = 64 + card_w + gap + 32
        y = card_top + 92 + i * 76
        draw.ellipse((x, y, x + 42, y + 42), fill=EMBER)
        draw.line((x + 12, y + 12, x + 30, y + 30), fill=WHITE, width=5)
        draw.line((x + 30, y + 12, x + 12, y + 30), fill=WHITE, width=5)
        text_block(draw, (x + 58, y - 3), item, font(29, semibold=True), INK, card_w - 110, line_gap=7, max_lines=2)
    footer(draw, "Canada storefront only • check luggage dimensions", size[1] - 190, accent=MARIGOLD)
    return canvas


def write_assets() -> Iterable[str]:
    assets: list[tuple[str, Image.Image]] = [
        ("day-04-system-poll-feed-1080x1350.jpg", day4((1080, 1350))),
        ("day-04-system-poll-story-1080x1920.jpg", day4((1080, 1920), story=True)),
        ("day-05-toiletry-details-01-feed-1080x1350.jpg", detail_slide("Day 5 • 1/3", "HANG + SEE", "Use a compatible hook or rail to keep travel-size items visible.", DAY1, JADE)),
        ("day-05-toiletry-details-02-feed-1080x1350.jpg", detail_slide("Day 5 • 2/3", "THREE STORAGE SECTIONS", "Internal sections separate compatible travel-size toiletries.", DAY1_DETAIL, JADE)),
        ("day-05-toiletry-details-03-feed-1080x1350.jpg", detail_slide("Day 5 • 3/3", "CHECK THE DIMENSIONS", "Closed: approx. 22 × 14 × 8 cm. Open height: approx. 53 cm.", TOILETRY_REF, JADE, contain=True)),
        ("day-05-toiletry-details-story-1080x1920.jpg", day5_story()),
        ("day-06-packing-sequence-01-feed-1080x1350.jpg", sequence_slide("1", "Fold", "Prepare clothing for the groups you actually use.", MARIGOLD)),
        ("day-06-packing-sequence-02-feed-1080x1350.jpg", sequence_slide("2", "Group", "Keep tops, bottoms, undergarments, or accessories separate.", MARIGOLD)),
        ("day-06-packing-sequence-03-feed-1080x1350.jpg", sequence_slide("3", "Zip", "Close each cube without overfilling it.", MARIGOLD)),
        ("day-06-packing-sequence-04-feed-1080x1350.jpg", sequence_slide("4", "Place", "Position the small, medium, and large cubes in the suitcase.", MARIGOLD)),
        ("day-06-packing-sequence-story-1080x1920.jpg", day6_story()),
        ("day-07-cable-checklist-feed-1080x1350.jpg", day7((1080, 1350))),
        ("day-07-cable-checklist-story-1080x1920.jpg", day7((1080, 1920), story=True)),
        ("day-08-toiletry-before-after-feed-1080x1350.jpg", day8((1080, 1350))),
        ("day-08-toiletry-before-after-story-1080x1920.jpg", day8((1080, 1920), story=True)),
        ("day-09-packing-sizes-01-feed-1080x1350.jpg", day9_slide("Small", "20 × 30 cm", "smaller items or accessories", JADE, PACKING_REF)),
        ("day-09-packing-sizes-02-feed-1080x1350.jpg", day9_slide("Medium", "25 × 35 cm", "tops or medium folded groups", COBALT, PACKING_REF)),
        ("day-09-packing-sizes-03-feed-1080x1350.jpg", day9_slide("Large", "30 × 40 cm", "larger folded pieces", MARIGOLD, PACKING_REF)),
        ("day-09-packing-sizes-story-1080x1920.jpg", day9_story()),
        ("day-10-cable-carryon-feed-1080x1350.jpg", day10((1080, 1350))),
        ("day-10-cable-carryon-story-1080x1920.jpg", day10((1080, 1920), story=True)),
        ("day-11-founder-verification-feed-1080x1350.jpg", day11((1080, 1350))),
        ("day-11-founder-verification-story-1080x1920.jpg", day11((1080, 1920), story=True)),
        ("day-12-shipping-faq-feed-1080x1350.jpg", day12((1080, 1350))),
        ("day-12-shipping-faq-story-1080x1920.jpg", day12((1080, 1920), story=True)),
        ("day-13-honest-packing-fit-feed-1080x1350.jpg", day13((1080, 1350))),
        ("day-13-honest-packing-fit-story-1080x1920.jpg", day13((1080, 1920), story=True)),
    ]
    for name, canvas in assets:
        save(canvas, name)
        yield name


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for filename in write_assets():
        print(filename)
