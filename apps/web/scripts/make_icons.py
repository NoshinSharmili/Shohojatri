"""Generates the PWA icons in public/icons/ from public/brand/logo_shoho.png.

Run once when the logo changes (needs Pillow): python scripts/make_icons.py
The wordmark is unreadable at icon sizes, so only the figure above it is used.
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
LOGO = ROOT / "public" / "brand" / "logo_shoho.png"
OUT = ROOT / "public" / "icons"
# In the 755×815 logo the figure ends at row ~570, but the wordmark's tallest letter (ত্রী)
# already rises to row ~560 on the right, so that corner is cleared before cropping.
FIGURE_BOTTOM = 575
WORDMARK_CORNER = (450, 555)


def figure() -> Image.Image:
    logo = Image.open(LOGO).convert("RGBA")
    logo.paste((0, 0, 0, 0), (*WORDMARK_CORNER, logo.width, logo.height))
    top = logo.crop((0, 0, logo.width, FIGURE_BOTTOM))
    bbox = top.getbbox()
    assert bbox is not None
    return top.crop(bbox)


def icon(mark: Image.Image, size: int, fill: float) -> Image.Image:
    """`mark` centred on white, its longer side `fill` of the canvas."""
    canvas = Image.new("RGB", (size, size), "white")
    scale = size * fill / max(mark.size)
    resized = mark.resize(
        (round(mark.width * scale), round(mark.height * scale)), Image.Resampling.LANCZOS
    )
    canvas.paste(resized, ((size - resized.width) // 2, (size - resized.height) // 2), resized)
    return canvas


def main() -> None:
    OUT.mkdir(exist_ok=True)
    mark = figure()
    icon(mark, 192, 0.84).save(OUT / "icon-192.png", optimize=True)
    icon(mark, 512, 0.84).save(OUT / "icon-512.png", optimize=True)
    # Maskable icons may be cropped to a circle of 80% diameter: keep the figure inside it.
    icon(mark, 512, 0.6).save(OUT / "icon-maskable-512.png", optimize=True)
    icon(mark, 180, 0.8).save(OUT / "apple-touch-icon.png", optimize=True)


if __name__ == "__main__":
    main()
