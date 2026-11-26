"""Herramientas compartidas para generar sprites en pixel art (paleta cerrada de 45 colores)."""
import json, os
from PIL import Image, ImageDraw

ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
OUT = os.path.join(ROOT, "public", "milicenda-assets", "generados")
SRC_ISLA = os.path.join(ROOT, "src", "components", "isla")
os.makedirs(OUT, exist_ok=True)
os.makedirs(SRC_ISLA, exist_ok=True)


def hx(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


INK = "#2e1b14"
INK2 = "#4a2c1f"

# tabla de noche (lote D de TAREAS_CODE.md)
NOCHE = {
    "#35563a": "#1b2a3a", "#587a35": "#2a4546", "#8aa23a": "#3f6552", "#bcc046": "#6a8a68", "#e2d870": "#94ad86",
    "#5a3322": "#1c1424", "#8a4e2a": "#35243a", "#b96d32": "#583a48", "#dc9544": "#7e5456", "#f2bd6e": "#a47868",
    "#1b5f66": "#10284a", "#2c9488": "#1c4a7a", "#58cc9f": "#3a7fa8", "#b2f0cc": "#7fbbd0", "#effbe6": "#d6f0f0",
    "#7a2e26": "#2a1930", "#b84a2c": "#53283e", "#e8874a": "#8a4a52", "#f4b183": "#b57a7a",
    "#8a5fc0": "#4a3a8a", "#c3a2e6": "#7a6aa8", "#4f7fd0": "#2a4a8a", "#a8cdf2": "#6a8ab8",
    "#8fd2d2": "#1b1840", "#c8ecdc": "#3a2f6e", "#fbf3e4": "#6a5aa0",
}
PAL_TXT = """2e1b14 4a2c1f 35563a 587a35 8aa23a bcc046 e2d870 5a3322 8a4e2a b96d32 dc9544 f2bd6e 463f4a 77707c a8a08e d6cbb0 1b5f66 2c9488 58cc9f b2f0cc effbe6 7a2e26 b84a2c e8874a f4b183 5f3a24 8f5a30 bf8444 e0b070 fbf3e4 fffdf7 d99a1c f2c230 f9e07a c94b64 f092a4 8a5fc0 c3a2e6 4f7fd0 a8cdf2 8fd2d2 c8ecdc c2e0d8 ffffff""".split()
NOCHE_BASE = hx("#1b1840")
LUCES = {"#ffd36b", "#fff1a8", "#fff6d6", "#fff3c4"}  # no se oscurecen


def noche_color(rgb):
    key = "#%02x%02x%02x" % rgb
    if key in NOCHE:
        return hx(NOCHE[key])
    if key in LUCES:
        return rgb
    return tuple(int(round(rgb[k] * 0.45 + NOCHE_BASE[k] * 0.55)) for k in range(3))


def a_noche(im):
    im = im.convert("RGBA")
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a:
                px[x, y] = noche_color((r, g, b)) + (a,)
    return im


def guardar_noche_json():
    tabla = {k: v for k, v in NOCHE.items()}
    for h in PAL_TXT:
        k = "#" + h
        if k not in tabla:
            tabla[k] = "#%02x%02x%02x" % noche_color(hx(k))
    with open(os.path.join(SRC_ISLA, "noche_tabla.json"), "w") as f:
        json.dump(tabla, f, indent=0)


class Lienzo:
    """Lienzo RGBA con dibujo sin antialiasing."""

    def __init__(self, w, h):
        self.im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.im)
        self.w, self.h = w, h

    def px(self, x, y, c):
        x, y = int(x), int(y)
        if 0 <= x < self.w and 0 <= y < self.h:
            self.im.putpixel((x, y), hx(c) + (255,))

    def rect(self, x0, y0, x1, y1, c):
        self.d.rectangle([x0, y0, x1, y1], fill=hx(c) + (255,))

    def poly(self, pts, c):
        self.d.polygon([(int(x), int(y)) for x, y in pts], fill=hx(c) + (255,))

    def line(self, p0, p1, c):
        self.d.line([(int(p0[0]), int(p0[1])), (int(p1[0]), int(p1[1]))], fill=hx(c) + (255,), width=1)

    def ellipse(self, cx, cy, rx, ry, c):
        for y in range(int(cy - ry), int(cy + ry) + 1):
            for x in range(int(cx - rx), int(cx + rx) + 1):
                if ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1:
                    self.px(x, y, c)

    def pegar(self, otro, x, y):
        self.im.alpha_composite(otro.im if isinstance(otro, Lienzo) else otro, (int(x), int(y)))

    def contorno(self, color=INK, solo_abajo=False):
        """Contorno exterior de 1 px (por fuera de la silueta)."""
        src = self.im.copy()
        sp = src.load()
        dp = self.im.load()
        c = hx(color) + (255,)
        for y in range(self.h):
            for x in range(self.w):
                if sp[x, y][3] == 0:
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < self.w and 0 <= ny < self.h and sp[nx, ny][3] > 0:
                            dp[x, y] = c
                            break


def bitmap(l, x0, y0, filas, claves):
    """Dibuja un bitmap de texto: cada carácter se mapea a un color; '.' es transparente."""
    for dy, fila in enumerate(filas):
        for dx, ch in enumerate(fila):
            if ch != "." and ch in claves:
                l.px(x0 + dx, y0 + dy, claves[ch])


def guardar(im, nombre, escala8=True):
    im = im.im if isinstance(im, Lienzo) else im
    p = os.path.join(OUT, nombre)
    im.save(p)
    if escala8:
        im.resize((im.width * 8, im.height * 8), Image.NEAREST).save(p.replace(".png", "_x8.png"))
    return p
