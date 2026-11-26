"""Genera la panza de la isla 9x9 como UN solo sprite (original, paleta cerrada).

Salida: public/milicenda-assets/generados/panza_9x9_claude.png (+ _x8 y .json con el ancla).
Sprite de 288 px de ancho. Su borde superior es la "V" que queda justo debajo de los
bloques de borde_isla_hoja (se mete 3 px detrás de ellos para que no haya costura).
Ancla: esquina izquierda del rombo de la isla en (0, -13), derecha (288, -13),
inferior (144, 59) relativas al sprite.
"""
import json, os, random
import numpy as np
from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "public", "milicenda-assets", "generados")
os.makedirs(OUT, exist_ok=True)

def hx(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))

INK = hx("#2e1b14")
# tierra
TL = [hx(c) for c in ("#f2bd6e", "#dc9544", "#b96d32", "#8a4e2a")]  # cara izquierda: luz -> sombra
TR = [hx(c) for c in ("#b96d32", "#8a4e2a", "#5a3322", "#4a2c1f")]  # cara derecha
# roca
RL = [hx(c) for c in ("#d6cbb0", "#a8a08e", "#77707c", "#463f4a")]
RR = [hx(c) for c in ("#a8a08e", "#77707c", "#463f4a", "#463f4a")]

import sys
N = int(sys.argv[1]) if len(sys.argv) > 1 else 11
W = 32 * N
CX = W // 2
SC = W / 288.0
VC = 3 + 8 * N
H = VC + 92
rnd = random.Random(7)


def vtop(x):
    return 3 + 8 * N - abs(x - CX) / 2.0


def lerp_profile(points, x):
    for (x0, v0), (x1, v1) in zip(points, points[1:]):
        if x0 <= x <= x1:
            t = (x - x0) / (x1 - x0) if x1 != x0 else 0
            return v0 + (v1 - v0) * t
    return points[-1][1]


# cuerpo: el fondo de la panza es un cuenco que se afina hacia el centro (y absoluto en el sprite)
rr = random.Random(5)
bump = [0] * W
x = 0
while x < W:
    seg = rr.randint(5, 11)
    v = rr.randint(-5, 5)
    for k in range(seg):
        if x + k < W:
            bump[x + k] = v
    x += seg

def body_bottom(x):
    u = abs(x - CX) / float(CX)
    base = 3 + (8 * N + 50) * (1 - u ** 1.6) ** 0.85
    # los costados quedan en la V; el centro baja mucho
    return base + bump[x] * min(1, (1 - u) * 3)

# estalactitas (x, ancho de base, y de la punta, y donde nace)
stal = [(CX + 2, 22, VC + 86, VC + 24), (CX - 6 * N, 11, VC + 62, VC + 12), (CX + 7 * N, 10, VC + 56, VC + 10)]

mask = np.zeros((H, W), bool)
for x in range(W):
    yb = body_bottom(x)
    for (sx, bw, tip, y0) in stal:
        dx = abs(x - sx)
        if dx < bw:
            t = dx / bw
            ys = tip - (tip - y0) * (t ** 0.9) * 0.0 + 0  # punta
            ys = y0 + (tip - y0) * (1 - t ** 1.15)
            yb = max(yb, ys)
    bottom_x = int(round(yb))
    y0v = int(vtop(x))
    for y in range(y0v, min(H, bottom_x + 1)):
        mask[y, x] = True

# ---------- material: tierra arriba, roca abajo, transición irregular ----------
# altura de la transición (profundidad desde la V) en tramos escalonados
trans = np.zeros(W, int)
x = 0
cur = 30
while x < W:
    seg = rnd.randint(7, 15)
    cur = max(28, min(50, cur + rnd.randint(-7, 7)))
    for k in range(seg):
        if x + k < W:
            trans[x + k] = cur
    x += seg
# más tierra cerca de los costados
for x in range(W):
    trans[x] = int(trans[x] * (0.85 + 0.15 * min(1, abs(x - CX) / 60))) if False else trans[x]

img = np.zeros((H, W, 4), np.uint8)


def blobs(n, rx, ry, seed):
    r = random.Random(seed)
    return [(r.randint(0, W), r.randint(0, H), r.randint(*rx), r.randint(*ry)) for _ in range(n)]


def in_blob(bl, x, y):
    for (bx, by, rx, ry) in bl:
        if ((x - bx) / rx) ** 2 + ((y - by) / ry) ** 2 <= 1:
            return True
    return False


b_light = blobs(40, (6, 14), (3, 6), 11)    # parches claros
b_dark = blobs(40, (6, 15), (3, 7), 12)     # parches oscuros
b_rock_l = blobs(30, (6, 13), (3, 7), 13)
b_rock_d = blobs(34, (6, 14), (3, 8), 14)

for y in range(H):
    for x in range(W):
        if not mask[y, x]:
            continue
        depth = y - vtop(x)
        left = x < CX
        isrock = depth > trans[x]
        if not isrock:
            pal = TL if left else TR
            t = 2 if left else 1  # tono base (mid)
            # luz arriba: más claro cerca de la V, más oscuro hacia abajo
            if depth < 5:
                t -= 1
            if in_blob(b_light, x, y) and depth > 4:
                t -= 1
            if in_blob(b_dark, x, y) and depth > 6:
                t += 1
            if trans[x] - depth < 5:
                t += 1  # sombra justo arriba de la roca
            t = max(0, min(3, t))
            col = pal[t]
        else:
            pal = RL if left else RR
            t = 1
            rd = depth - trans[x]
            if rd < 3:
                t = 0 if left else 0  # borde claro bajo la tierra
            if in_blob(b_rock_l, x, y) and rd > 4:
                t -= 1
            if in_blob(b_rock_d, x, y) and rd > 4:
                t += 1
            if y > VC + 26 + bump[x] * 3:
                t += 1  # más oscuro cuanto más abajo
            if y > VC + 50 + bump[x] * 3 and left:
                t += 1
            t = max(0, min(3, t))
            col = pal[t]
        img[y, x, :3] = col
        img[y, x, 3] = 255

# luz a la izquierda de cada cara: columna clara en el perfil izquierdo, sombra al derecho
# ---------- raíces finas (tierra) ----------
def root(x0, y0, length, drift, color):
    x = x0
    for k in range(length):
        y = y0 + k
        if 0 <= x < W and 0 <= y < H and mask[y, x] and int(y - vtop(x)) < trans[x] + 2:
            img[y, x, :3] = color
        if k % (4 + (x0 % 3)) == 3:
            x += drift

for rx0, ln, dr in [(int(a * SC), b, c) for a, b, c in ((22, 24, 1), (58, 28, -1), (108, 30, 1), (150, 22, -1), (176, 32, 1), (222, 28, -1), (254, 22, 1), (40, 20, -1), (200, 24, 1), (130, 20, 1))]:
    d0 = int(vtop(rx0)) + 2
    col = TL[3] if rx0 < CX else TR[3]
    root(rx0, d0, ln, dr, col)
    # una rama chica
    root(rx0 + dr * 3, d0 + 10, ln // 2, -dr, col)

# ---------- piedritas en la tierra (3x2 / 4x2, dos tonos) ----------
def stone(sx, sy, w, h, left):
    pal = RL if left else RR
    for dy in range(h):
        for dx in range(w):
            x, y = sx + dx, sy + dy
            if 0 <= x < W and 0 <= y < H and mask[y, x]:
                img[y, x, :3] = pal[0] if dy == 0 else pal[1]
        # sombra
    for dx in range(w):
        x, y = sx + dx + 1, sy + h
        if 0 <= x < W and 0 <= y < H and mask[y, x]:
            img[y, x, :3] = (TL if left else TR)[3]

for (sx, off, w, h) in [(int(a * SC), b, c, d) for a, b, c, d in ((16, 18, 4, 2), (44, 26, 3, 2), (72, 14, 4, 2), (100, 34, 3, 2), (124, 22, 4, 2),
                         (166, 30, 3, 2), (192, 16, 4, 2), (220, 32, 3, 2), (246, 20, 4, 2), (270, 10, 3, 2), (30, 30, 3, 2), (140, 36, 3, 2), (210, 28, 4, 2))]:
    stone(sx, int(vtop(sx)) + off, w, h, sx < CX)

# ---------- grietas en la roca (líneas cortas quebradas) ----------
def crack(x0, y0, n, left):
    x, y = x0, y0
    col = RL[3] if left else RR[3]
    for k in range(n):
        if 0 <= x < W and 0 <= y < H and mask[y, x]:
            img[y, x, :3] = col
        if k % 2 == 0:
            y += 1
        else:
            x += rnd.choice((-1, 1)) if k % 4 == 1 else 1
            if k % 3 == 0:
                y += 1

for (cx, off, n) in [(int(a * SC), b, c) for a, b, c in ((30, 12, 9), (66, 18, 11), (96, 22, 10), (130, 16, 12), (160, 30, 12), (186, 18, 9), (230, 14, 10), (262, 6, 7), (50, 10, 8), (210, 26, 9))]:
    crack(cx, int(vtop(cx)) + trans[cx] + off, n, cx < CX)

# ---------- huesito en la tierra (derecha-centro) ----------
bone = [(0, 0), (1, 0), (2, 0), (3, 0), (4, 0), (5, 0), (6, 0)]
bx = int(186 * SC)
by = int(vtop(bx)) + 20
bone_px = [(0, 0, 1), (1, 0, 1), (0, 1, 1), (1, 1, 1), (2, 1, 1), (3, 1, 1), (4, 1, 1), (5, 1, 1), (6, 1, 1), (6, 0, 1), (5, 0, 1), (6, 2, 1), (5, 2, 1), (0, 2, 1), (1, 2, 1)]
for dx, dy, _ in bone_px:
    x, y = bx + dx, by + dy
    if mask[y, x]:
        img[y, x, :3] = hx("#d6cbb0") if dy < 2 else hx("#a8a08e")

# ---------- contorno solo en el perfil exterior ----------
out = img.copy()
for y in range(H):
    for x in range(W):
        if not mask[y, x]:
            continue
        if y < vtop(x) + 4:
            continue  # la V de arriba queda tapada por los bloques de borde
        edge = False
        for dx, dy in ((-1, 0), (1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if nx < 0 or nx >= W or ny >= H or not mask[ny, nx]:
                edge = True
        if edge:
            out[y, x, :3] = INK
# sombra de contorno: un píxel más oscuro suave en la derecha (ya es tono oscuro). Fin.

# recortar altura real
ys = np.where(out[:, :, 3] > 0)[0]
H2 = int(ys.max()) + 1
out = out[:H2]
im = Image.fromarray(out, "RGBA")
im.save(os.path.join(OUT, f"panza_{N}x{N}_claude.png"))
im.resize((im.width * 8, im.height * 8), Image.NEAREST).save(os.path.join(OUT, f"panza_{N}x{N}_claude_x8.png"))
with open(os.path.join(OUT, f"panza_{N}x{N}_claude.json"), "w") as f:
    json.dump({"file": f"panza_{N}x{N}_claude.png", "w": im.width, "h": im.height,
               "left": [0, -13], "right": [W, -13], "bottom": [CX, 8 * N - 13],
               "incluyeCarasDelBorde": False}, f)
print("panza", im.size)
