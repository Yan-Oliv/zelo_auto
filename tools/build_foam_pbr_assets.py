from pathlib import Path
from PIL import Image, ImageFilter, ImageOps

SOURCE = Path(r"C:\Users\yanog\.codex\generated_images\019f862b-5ce3-7a22-a298-70a70e003396\exec-6971c94e-e431-4de4-8d9d-83ff78e20ccc.png")
TARGET = Path("public/textures/cinematic")
SIZE = 1024

source = Image.open(SOURCE).convert("L").resize((SIZE, SIZE), Image.Resampling.LANCZOS)
detail = ImageOps.autocontrast(source, cutoff=1)
macro = detail.filter(ImageFilter.GaussianBlur(14))
roughness = ImageOps.invert(detail).point(lambda value: int(100 + value * 0.55))
height = ImageOps.autocontrast(detail.filter(ImageFilter.GaussianBlur(1)), cutoff=2)

packed = Image.merge("RGBA", (macro, detail, roughness, height))
TARGET.mkdir(parents=True, exist_ok=True)
packed.save(TARGET / "foam_packed.webp", "WEBP", quality=82, method=6)

pixels = height.load()
normal = Image.new("RGB", (SIZE, SIZE))
normal_pixels = normal.load()
strength = 2.6
for y in range(SIZE):
    prev_y = max(0, y - 1)
    next_y = min(SIZE - 1, y + 1)
    for x in range(SIZE):
        prev_x = max(0, x - 1)
        next_x = min(SIZE - 1, x + 1)
        dx = (pixels[next_x, y] - pixels[prev_x, y]) / 255.0 * strength
        dy = (pixels[x, next_y] - pixels[x, prev_y]) / 255.0 * strength
        length = (dx * dx + dy * dy + 1.0) ** 0.5
        nx, ny, nz = -dx / length, -dy / length, 1.0 / length
        normal_pixels[x, y] = (int((nx * .5 + .5) * 255), int((ny * .5 + .5) * 255), int((nz * .5 + .5) * 255))

normal.save(TARGET / "foam_normal.webp", "WEBP", quality=84, method=6)
