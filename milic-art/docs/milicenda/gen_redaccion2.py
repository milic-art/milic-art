"""Redacción v2 (más detallada): torre alta con cuarto del reloj, eje de vidrio con engranajes, escalera exterior,
edificio chico con sótano de engranajes, puesto de diarios y buzón. 128x190, puerta en la fila 170, centro x=60.
Se dibuja con rampas de 5 tonos de la paleta cerrada, tablones con variación, rayos de sol y sombras. Solo día por ahora."""
import math, random
from gen_lib import *

W, H, YB = 128, 190, 170
CX = 60

# rampas (oscuro -> claro), todas de la paleta cerrada
RAMPAS = {
    "madR": ["#5a3322", "#7a2e26", "#b84a2c", "#e8874a", "#f4b183"],
    "madD": ["#5f3a24", "#8f5a30", "#bf8444", "#e0b070", "#f2bd6e"],
    "gris": ["#463f4a", "#77707c", "#a8a08e", "#d6cbb0", "#fbf3e4"],
    "laton": ["#8f5a30", "#d99a1c", "#f2c230", "#f9e07a", "#fffdf7"],
    "cobre": ["#7a2e26", "#b96d32", "#dc9544", "#f2bd6e", "#f9e07a"],
    "cielo": ["#4f7fd0", "#a8cdf2", "#8fd2d2", "#c8ecdc", "#fbf3e4"],
    "pasto": ["#35563a", "#587a35", "#8aa23a", "#bcc046", "#e2d870"],
}
IDX = {}
for nom, r in RAMPAS.items():
    for i, c in enumerate(r):
        IDX.setdefault(c, (nom, i))


def mover(c, d):
    if c not in IDX:
        return c
    nom, i = IDX[c]
    return RAMPAS[nom][max(0, min(4, i + d))]


def rgb2hex(p):
    return "#%02x%02x%02x" % p[:3]


def tono(l, x, y, d):
    """Sube o baja un tono el píxel (x,y) dentro de su rampa."""
    if 0 <= x < l.w and 0 <= y < l.h:
        p = l.im.getpixel((x, y))
        if p[3]:
            n = mover(rgb2hex(p), d)
            l.im.putpixel((x, y), hx(n) + (255,))


def haz(l, region, fase, ancho=9, paso=34, pend=0.85, d=1):
    """Rayos de sol en diagonal: aclara (d>0) u oscurece (d<0) los píxeles de la región dentro de la banda."""
    x0, y0, x1, y1 = region
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if ((x + y * pend + fase) % paso) < ancho:
                tono(l, x, y, d)


def tablones(l, x0, y0, x1, y1, rampa, paso=4, sem=0):
    """Pared de tablones verticales: cada tablón con su tono, juntas oscuras, vetas y nudos; luz a la izquierda."""
    r = RAMPAS[rampa]
    rnd = random.Random(sem)
    for k, x in enumerate(range(x0, x1 + 1, paso)):
        base = r[2] if (k + sem) % 3 else r[1]
        if k == 0:
            base = r[3]
        xe = min(x1, x + paso - 1)
        l.rect(x, y0, xe, y1, base)
        l.line((x, y0), (x, y1), r[0])                       # junta
        if xe - x >= 2:
            l.line((x + 1, y0), (x + 1, y1), mover(base, 1))  # luz del borde
            l.line((xe, y0), (xe, y1), mover(base, -1))       # sombra del borde
        # vetas
        for _ in range((y1 - y0) // 7):
            yy = rnd.randint(y0 + 1, y1 - 3)
            xx = rnd.randint(x + 1, max(x + 1, xe - 1))
            l.line((xx, yy), (xx, yy + rnd.randint(1, 3)), mover(base, -1))
        # nudo
        if rnd.random() < 0.28 and xe - x >= 3:
            yy = rnd.randint(y0 + 4, y1 - 4)
            l.px(x + 2, yy, r[0]); l.px(x + 1, yy, mover(base, -1)); l.px(x + 2, yy - 1, mover(base, 1))
        # remates: algunos tablones más cortos (junta horizontal)
        if rnd.random() < 0.35:
            yy = rnd.randint(y0 + 6, y1 - 6)
            l.line((x, yy), (xe, yy), r[0])
    # sombra del lado derecho
    for y in range(y0, y1 + 1):
        for x in range(x1 - 2, x1 + 1):
            tono(l, x, y, -1)


def engranaje(l, cx, cy, r, fr, sentido=1, dientes=10, rampa="laton"):
    R = RAMPAS[rampa]
    paso = 2 * math.pi / dientes
    off = (paso / 2) * fr * sentido
    pts = [(cx + math.cos(k * paso + off) * (r + 1.6), cy + math.sin(k * paso + off) * (r + 1.6)) for k in range(dientes)]
    gr = 2 if r >= 5 else 1
    for x, y in pts:
        l.rect(round(x) - gr - 1, round(y) - gr - 1, round(x) + gr, round(y) + gr, INK)
    l.ellipse(cx, cy, r + 1.3, r + 1.3, INK)
    for x, y in pts:
        l.rect(round(x) - gr, round(y) - gr, round(x) + gr - 1, round(y) + gr - 1, R[1])
        l.px(round(x) - gr, round(y) - gr, R[2])
    l.ellipse(cx, cy, r + 0.4, r + 0.4, R[1])
    l.ellipse(cx - 0.5, cy - 0.5, r - 0.6, r - 0.6, R[2])
    l.ellipse(cx - 1, cy - 1, max(1.2, r - 2), max(1.2, r - 2), R[3])
    # aro interior y rayos
    if r >= 5:
        l.ellipse(cx, cy, r - 2.4, r - 2.4, R[0])
        l.ellipse(cx, cy, r - 3.2, r - 3.2, INK)
        for k in range(4):
            a = k * math.pi / 2 + off * 0.5 + 0.4
            l.line((cx, cy), (round(cx + math.cos(a) * (r - 2.5)), round(cy + math.sin(a) * (r - 2.5))), R[1])
    l.ellipse(cx, cy, 1.5, 1.5, R[0])
    l.px(cx, cy, R[3])
    l.px(round(cx - r * 0.55), round(cy - r * 0.55), R[4])


def reloj(l, cx, cy):
    """Reloj grande con bisel de latón, números romanos y remaches (las agujas las dibuja el código con la hora real)."""
    L, G = RAMPAS["laton"], RAMPAS["gris"]
    l.ellipse(cx, cy, 14, 14, INK)
    l.ellipse(cx, cy, 13.2, 13.2, L[0])
    l.ellipse(cx - 0.7, cy - 0.7, 12.6, 12.6, L[1])
    l.ellipse(cx - 1.3, cy - 1.3, 11.4, 11.4, L[2])
    l.ellipse(cx - 1.9, cy - 1.9, 10.2, 10.2, L[3])
    l.ellipse(cx + 0.8, cy + 0.8, 11, 11, L[1])
    l.ellipse(cx, cy, 10.4, 10.4, L[0])
    l.ellipse(cx, cy, 10, 10, INK)
    l.ellipse(cx, cy, 9.4, 9.4, "#fbf3e4")
    l.ellipse(cx - 1.2, cy - 1.2, 8.2, 8.2, "#fffdf7")
    for a in range(200, 340, 4):  # sombra interna del bisel (arriba-izquierda cae sombra sobre el cuadrante)
        pass
    for a in range(20, 160, 4):
        l.px(round(cx + math.cos(math.radians(a)) * 8.8), round(cy + math.sin(math.radians(a)) * 8.8), "#d6cbb0")
    for a in range(180, 270, 4):
        l.px(round(cx + math.cos(math.radians(a)) * 9.2), round(cy + math.sin(math.radians(a)) * 9.2), "#a8a08e")
    # marcas de minutos y horas
    for m in range(60):
        a = math.radians(m * 6 - 90)
        if m % 5 == 0:
            continue
        l.px(round(cx + math.cos(a) * 8.6), round(cy + math.sin(a) * 8.6), "#a8a08e")
    # romanos (mini glifos de 3px de alto)
    G3 = {"I": ["X", "X", "X"], "V": ["X.X", "X.X", ".X."], "X": ["X.X", ".X.", "X.X"]}

    def rom(txt, x, y):
        xx = x
        for ch in txt:
            g = G3[ch]
            for dy, fila in enumerate(g):
                for dx, c in enumerate(fila):
                    if c == "X":
                        l.px(xx + dx, y + dy, INK)
            xx += len(g[0]) + 1
        return xx - x - 1
    rom("XII", cx - 5, cy - 8)
    rom("VI", cx - 3, cy + 6)
    # III (derecha) y IX (izquierda) en vertical corto
    for i in range(3):
        l.line((cx + 5 + i * 2, cy - 1), (cx + 5 + i * 2, cy + 1), INK)
    l.px(cx - 8, cy - 1, INK); l.px(cx - 6, cy - 1, INK); l.px(cx - 7, cy, INK); l.px(cx - 8, cy + 1, INK); l.px(cx - 6, cy + 1, INK)
    l.line((cx - 4, cy - 1), (cx - 4, cy + 1), INK)
    # remaches del bisel
    for a in (30, 90, 150, 210, 270, 330):
        l.px(round(cx + math.cos(math.radians(a)) * 12), round(cy + math.sin(math.radians(a)) * 12), L[4])
    l.px(cx, cy, INK)


def pluma(l, x, y, fr):
    l.line((x, y + 14), (x, y + 3), INK)
    l.line((x + 1, y + 14), (x + 1, y + 4), RAMPAS["laton"][1])
    s = fr
    cuerpo = [(x - 1 + s, y - 10), (x + s, y - 11), (x + 2 + s, y - 10), (x + 4 + s, y - 7), (x + 4 + s, y - 3), (x + 3 + s, y), (x + 1, y + 2), (x, y + 2), (x - 1, y - 1), (x - 3 + s, y - 5), (x - 3 + s, y - 8)]
    l.poly(cuerpo, "#fffdf7")
    l.line((x + s, y - 10), (x, y + 2), RAMPAS["cobre"][1])
    for k in range(6):
        l.px(x + 3 + s - (k // 3), y - 8 + k, "#d6cbb0")
        l.px(x - 2 + s + (k // 3), y - 7 + k, "#fbf3e4")
    l.px(x + s, y - 11, INK)


def farol(l, x, y):
    l.line((x, y), (x, YB - 1), INK)
    l.line((x + 1, y), (x + 1, YB - 1), RAMPAS["gris"][0])
    l.rect(x - 3, y - 8, x + 4, y - 1, INK)
    l.rect(x - 2, y - 7, x + 3, y - 2, RAMPAS["laton"][3])
    l.rect(x - 2, y - 7, x - 1, y - 2, "#fffdf7")
    l.line((x + 1, y - 7), (x + 1, y - 2), RAMPAS["laton"][2])
    l.rect(x - 4, y - 10, x + 5, y - 9, RAMPAS["gris"][1]); l.rect(x - 3, y - 11, x + 4, y - 11, RAMPAS["gris"][2])
    l.px(x, y - 12, INK); l.px(x + 1, y - 12, INK)
    l.rect(x - 2, YB - 4, x + 3, YB - 1, RAMPAS["gris"][1]); l.rect(x - 2, YB - 4, x - 1, YB - 1, RAMPAS["gris"][2])


# ----------------------------------------------------------------------------- partes
def parte_techo(l, fr):
    """Techo piramidal de tejas de madera en dos tramos con cornisa, ménsulas y veleta de pluma."""
    D = RAMPAS["madD"]
    for i, y in enumerate(range(20, 50)):
        half = 4 + i * 0.98
        xa, xb = round(CX - half), round(CX + half)
        fila = i % 5
        c = D[1] if fila == 4 else D[2] if fila in (1, 2) else D[1]
        l.line((xa, y), (xb, y), c)
        l.px(xa, y, D[3]); l.px(xa + 1, y, D[3]) if fila < 4 else None
        l.px(xb, y, D[0]); l.px(xb - 1, y, D[0]) if fila < 4 else None
        if fila == 4:
            l.line((xa, y), (xb, y), D[0])
        else:
            for x in range(xa + 2 + (i // 5 % 2) * 3, xb - 1, 6):  # tejas
                l.px(x, y, D[0]); l.px(x + 1, y, D[3])
    l.line((CX, 19), (CX, 49), D[3])  # arista iluminada
    # aleros: cornisa en capas con ménsulas
    for yy, cc in ((50, D[3]), (51, D[2]), (52, D[1]), (53, D[0])):
        l.rect(CX - 28, yy, CX + 28, yy, cc)
    for x in range(CX - 26, CX + 27, 6):
        l.rect(x, 54, x + 2, 56, D[1]); l.px(x, 54, D[3]); l.rect(x, 57, x + 1, 57, D[0])
    pluma(l, CX, 14, fr)


def parte_cuarto(l, fr):
    """Cuarto del reloj: tablones rojizos con ventana de luz cálida, reloj grande y balcón con baranda."""
    x0, x1 = 42, 78
    tablones(l, x0, 58, x1, 106, "madR", 4, 2)
    # marcos verticales de esquina
    for xx in (x0 - 1, x1 - 2):
        l.rect(xx, 58, xx + 2, 106, RAMPAS["madD"][1]); l.line((xx, 58), (xx, 106), RAMPAS["madD"][3]); l.line((xx + 2, 58), (xx + 2, 106), RAMPAS["madD"][0])
    # ventana cálida a la izquierda del reloj
    l.rect(46, 68, 54, 84, INK)
    l.rect(47, 69, 53, 83, RAMPAS["madD"][1])
    l.rect(48, 70, 52, 82, "#f9e07a")
    l.rect(48, 70, 49, 82, "#fffdf7")
    l.line((50, 70), (50, 82), RAMPAS["madD"][1]); l.line((48, 76), (52, 76), RAMPAS["madD"][1])
    l.line((52, 70), (52, 82), "#f2c230")
    l.rect(45, 84, 55, 85, RAMPAS["madD"][2]); l.rect(45, 85, 55, 85, RAMPAS["madD"][0])
    l.rect(45, 66, 55, 67, RAMPAS["madD"][2]); l.rect(45, 66, 55, 66, RAMPAS["madD"][3])
    reloj(l, 66, 82)
    l.px(53, 78, "#fffdf7")  # reflejo
    # balcón saliente
    D = RAMPAS["madD"]
    l.rect(x0 - 8, 106, x1 + 8, 109, D[2]); l.rect(x0 - 8, 106, x1 + 8, 106, D[4]); l.rect(x0 - 8, 109, x1 + 8, 109, D[0])
    for x in range(x0 - 7, x1 + 8, 4):
        l.rect(x, 110, x + 1, 112, D[1]); l.px(x, 110, D[3])
    # baranda
    l.line((x0 - 8, 99), (x1 + 8, 99), D[3])
    l.line((x0 - 8, 100), (x1 + 8, 100), D[1])
    for x in range(x0 - 7, x1 + 8, 4):
        l.line((x, 100), (x, 105), D[0]); l.px(x, 100, D[2])


def parte_vidrio(l, fr):
    """Eje de vidrio: postes de madera, vidrio con reflejos y engranajes de varios tamaños que giran."""
    x0, x1 = 42, 78
    l.rect(x0, 113, x1, 148, RAMPAS["gris"][0])
    C = RAMPAS["cielo"]
    l.rect(x0 + 5, 114, x1 - 5, 147, C[2])
    # degradado del vidrio por franjas dentro de la paleta
    for y in range(114, 148):
        for x in range(x0 + 5, x1 - 4):
            if y < 122 and (x + y) % 2 == 0:
                l.px(x, y, C[3])
            elif y > 138 and (x + y) % 3 == 0:
                l.px(x, y, C[1])
    # rayas diagonales de reflejo
    for k in range(-40, 60, 11):
        for t in range(0, 34):
            xx, yy = x0 + 6 + k + t, 114 + t
            if x0 + 5 <= xx <= x1 - 5:
                l.px(xx, yy, C[4]) if t % 2 == 0 else None
    # soportes internos
    l.line((CX, 114), (CX, 147), RAMPAS["gris"][1]); l.line((CX + 1, 114), (CX + 1, 147), RAMPAS["gris"][0])
    # engranajes (los grandes atrás, giran en sentidos opuestos)
    engranaje(l, 53, 126, 8, fr, 1, 12, "laton")
    engranaje(l, 68, 121, 5, fr, -1, 8, "cobre")
    engranaje(l, 69, 137, 6, fr, 1, 10, "madD")
    engranaje(l, 52, 141, 4, fr, -1, 8, "laton")
    engranaje(l, 62, 144, 3, fr, 1, 6, "cobre")
    # ejes que atraviesan
    l.line((53, 126), (68, 121), RAMPAS["gris"][1]) if False else None
    # postes de madera a los lados
    for xx in (x0, x1 - 4):
        l.rect(xx, 113, xx + 4, 148, RAMPAS["madR"][1]); l.rect(xx, 113, xx, 148, RAMPAS["madR"][3]); l.rect(xx + 1, 113, xx + 1, 148, RAMPAS["madR"][2]); l.rect(xx + 4, 113, xx + 4, 148, RAMPAS["madR"][0])
        for yy in range(118, 148, 8):
            l.px(xx + 2, yy, RAMPAS["madR"][0])
    l.rect(x0, 113, x1, 114, RAMPAS["madD"][1]); l.rect(x0, 147, x1, 148, RAMPAS["madD"][0])
    # marco superior e inferior con remaches
    for x in range(x0 + 6, x1 - 5, 5):
        l.px(x, 113, RAMPAS["laton"][3]); l.px(x, 148, RAMPAS["laton"][1])


def parte_base(l, fr):
    """Base de tablones dorados con puerta arqueada, cartel de pluma, faroles y escalones."""
    x0, x1 = 42, 78
    tablones(l, x0, 149, x1, YB - 1, "madD", 4, 1)
    D, G = RAMPAS["madD"], RAMPAS["gris"]
    l.rect(x0 - 2, YB - 6, x1 + 2, YB - 1, G[0]); l.rect(x0 - 2, YB - 6, x1 + 2, YB - 6, G[2]); l.rect(x0 - 2, YB - 5, x1 + 2, YB - 5, G[1])
    # cartel colgante
    l.line((54, 150), (54, 153), INK); l.line((66, 150), (66, 153), INK)
    l.rect(51, 153, 69, 159, INK); l.rect(52, 154, 68, 158, D[1]); l.rect(53, 155, 67, 157, "#fbf3e4")
    l.line((55, 157), (63, 155), RAMPAS["cobre"][1]); l.px(63, 155, "#fffdf7"); l.px(64, 155, "#d6cbb0")
    l.px(65, 156, G[2]); l.px(66, 156, G[2])
    # puerta con arco
    l.rect(52, 161, 68, YB - 1, INK)
    l.rect(53, 162, 67, YB - 1, D[1]); l.rect(53, 162, 55, YB - 1, D[2])
    l.rect(52, 161, 53, 162, INK); l.rect(67, 161, 68, 162, INK)
    l.px(53, 162, INK); l.px(67, 162, INK)
    for x in (57, 60, 63):
        l.line((x, 163), (x, YB - 1), D[0])
    for y in (166, 172):
        pass
    l.line((53, 167), (67, 167), D[0])
    l.rect(64, 165, 65, 167, RAMPAS["laton"][2]); l.px(64, 165, "#fffdf7")
    # escalones
    l.rect(50, YB, 70, YB + 1, G[3]); l.rect(48, YB + 1, 72, YB + 2, G[2]); l.rect(48, YB + 2, 72, YB + 3, G[1]); l.rect(48, YB + 3, 72, YB + 3, G[0])
    farol(l, 46, 160)
    farol(l, 74, 160)


def parte_escalera(l, fr):
    D = RAMPAS["madD"]

    def tramo(xa, ya, xb, yb, base=True):
        n = abs(xb - xa)
        for k in range(0, n + 1, 2):
            x = xa + (xb - xa) * k // n
            y = ya + (yb - ya) * k // n
            l.rect(x, y, x + 4, y + 1, D[2]); l.rect(x, y, x + 4, y, D[3]); l.rect(x, y + 2, x + 4, y + 2, D[0])
            if k % 4 == 0:
                l.line((x + 1, y - 8), (x + 1, y - 1), D[0]); l.px(x + 1, y - 8, D[2])
        l.line((xa + 1, ya - 9), (xb + 1, yb - 9), D[3])
        l.line((xa + 1, ya - 8), (xb + 1, yb - 8), D[1])
        # soporte inferior diagonal
        l.line((xa, ya + 3), (xb, yb + 3), D[0]); l.line((xa, ya + 4), (xb, yb + 4), D[1])
    tramo(26, 166, 42, 148)
    tramo(78, 146, 92, 130)
    tramo(26, 126, 42, 108)
    tramo(78, 106, 92, 96)


def parte_edificio_chico(l, fr):
    G, C = RAMPAS["gris"], RAMPAS["cielo"]
    x0, x1 = 94, 126
    l.rect(x0, 128, x1, YB - 1, "#fbf3e4")
    l.rect(x0, 128, x0 + 2, YB - 1, "#fffdf7"); l.rect(x1 - 3, 128, x1, YB - 1, "#d6cbb0")
    for y in range(134, YB - 4, 8):
        l.line((x0 + 3, y), (x1 - 4, y), "#fbf3e4")
        l.line((x0 + 3, y + 1), (x1 - 4, y + 1), "#d6cbb0") if False else None
    l.rect(x0 - 1, YB - 8, x1 + 1, YB - 1, G[0]); l.rect(x0 - 1, YB - 8, x1 + 1, YB - 8, G[2]); l.rect(x0 - 1, YB - 7, x1 + 1, YB - 7, G[1])
    # techo plano con parapeto, filo naranja y tanque
    l.rect(x0 - 2, 119, x1 + 2, 127, G[0]); l.rect(x0 - 2, 119, x1 + 2, 119, G[2]); l.rect(x0 - 2, 120, x1 + 2, 120, G[1])
    l.rect(x0 - 2, 125, x1 + 2, 125, RAMPAS["madR"][3]); l.rect(x0 - 2, 126, x1 + 2, 127, RAMPAS["madR"][1])
    for x in range(x0 + 1, x1, 6):
        l.rect(x, 121, x + 3, 124, G[1]); l.rect(x, 121, x + 3, 121, G[2])
    # ventanal con marco y toldo naranja a rayas
    l.rect(x0 + 4, 140, x0 + 22, 160, INK)
    l.rect(x0 + 5, 141, x0 + 21, 159, "#a8cdf2")
    l.rect(x0 + 5, 141, x0 + 21, 144, "#c8ecdc")
    l.line((x0 + 13, 141), (x0 + 13, 159), G[0]); l.line((x0 + 5, 150), (x0 + 21, 150), G[0])
    for k in range(4):
        l.px(x0 + 6 + k, 142 + k, "#fffdf7"); l.px(x0 + 14 + k, 142 + k, "#fffdf7")
    l.rect(x0 + 4, 160, x0 + 22, 162, G[2]); l.rect(x0 + 4, 162, x0 + 22, 162, G[0])
    # plantas en el alféizar
    for x in (x0 + 7, x0 + 17):
        l.rect(x, 157, x + 3, 159, RAMPAS["cobre"][1]); l.px(x + 1, 155, "#587a35"); l.px(x + 2, 154, "#8aa23a"); l.px(x, 156, "#587a35"); l.px(x + 3, 156, "#8aa23a")
    for i, x in enumerate(range(x0 + 2, x0 + 25)):
        c = RAMPAS["madR"][3] if (i // 3) % 2 == 0 else "#fffdf7"
        l.line((x, 132), (x, 139), c)
        l.px(x, 140 if i % 2 == 0 else 139, c)
    l.rect(x0 + 2, 131, x0 + 24, 132, RAMPAS["madR"][1])
    # puerta de vidrio
    l.rect(x1 - 10, 142, x1 - 3, YB - 1, INK)
    l.rect(x1 - 9, 143, x1 - 4, YB - 1, G[1])
    l.rect(x1 - 9, 144, x1 - 4, 160, "#a8cdf2"); l.px(x1 - 9, 144, "#fffdf7"); l.line((x1 - 6, 144), (x1 - 6, 160), G[0])
    l.px(x1 - 5, 166, RAMPAS["laton"][2])
    # cartelito moderno sobre la puerta
    l.rect(x1 - 12, 135, x1 - 1, 139, G[0]); l.rect(x1 - 11, 136, x1 - 2, 138, "#fbf3e4"); l.line((x1 - 10, 137), (x1 - 4, 137), RAMPAS["madR"][2])
    # tubería de cobre hacia la torre, con válvula
    C2 = RAMPAS["cobre"]
    l.rect(79, 132, 93, 134, C2[1]); l.line((79, 132), (93, 132), C2[3]); l.line((79, 134), (93, 134), C2[0])
    for x in (83, 90):
        l.rect(x, 130, x + 1, 136, C2[0]); l.px(x, 130, C2[3])
    l.ellipse(86, 133, 2, 2, RAMPAS["laton"][2]); l.px(86, 133, INK)
    # chimenea de cobre con tapa
    l.rect(114, 98, 120, 119, C2[1]); l.rect(114, 98, 115, 119, C2[3]); l.rect(120, 98, 120, 119, C2[0])
    l.rect(112, 94, 122, 98, RAMPAS["laton"][1]); l.rect(112, 94, 122, 94, RAMPAS["laton"][3]); l.rect(112, 98, 122, 98, RAMPAS["laton"][0])
    for y in (104, 110, 116):
        l.line((114, y), (120, y), C2[0])
    # mástil y bandera
    l.line((100, 100), (100, 119), INK); l.line((101, 100), (101, 119), RAMPAS["madD"][1]); l.px(100, 99, RAMPAS["laton"][3]); l.px(101, 99, RAMPAS["laton"][2])
    w = 0 if fr == 0 else 1
    l.poly([(102, 101), (111, 102 + w), (108, 104), (111, 106 - w), (102, 107)], "#c94b64")
    l.line((102, 101), (110, 102 + w), "#f092a4"); l.px(105, 104, "#fffdf7"); l.px(106, 105, "#fffdf7")


def parte_sotano(l, fr):
    x0, x1, y0, y1 = 90, 127, YB, YB + 19
    G = RAMPAS["gris"]
    l.rect(x0, y0, x1, y0 + 1, G[3]); l.rect(x0, y0 + 1, x1, y0 + 1, G[2])
    l.rect(x0 + 1, y0 + 2, x1 - 1, y1, G[0])
    l.rect(x0 + 1, y0 + 2, x1 - 1, y0 + 4, "#2e1b14")
    for y in range(y0 + 6, y1, 4):
        for x in range(x0 + 2 + ((y - y0) // 4 % 2) * 2, x1 - 1, 4):
            l.px(x, y, G[1])
    engranaje(l, 102, y0 + 11, 5, fr, 1, 10, "laton")
    engranaje(l, 113, y0 + 8, 4, fr, -1, 8, "cobre")
    engranaje(l, 120, y0 + 13, 3, fr, 1, 6, "madD")
    # tubería baja y luz
    C2 = RAMPAS["cobre"]
    l.rect(x0 + 1, y1 - 3, x1 - 1, y1 - 2, C2[1]); l.line((x0 + 1, y1 - 3), (x1 - 1, y1 - 3), C2[3]); l.line((x0 + 1, y1 - 1), (x1 - 1, y1 - 1), C2[0])
    l.rect(x1 - 5, y0 + 4, x1 - 3, y0 + 7, RAMPAS["laton"][2]); l.px(x1 - 5, y0 + 4, "#fffdf7")
    # baranda de hierro
    l.rect(x0, y1, x1, y1 + 1, G[2]); l.rect(x0, y1 + 1, x1, y1 + 1, G[1])
    for x in range(x0, x1 + 1, 5):
        l.line((x, y1 - 4), (x, y1), INK); l.px(x, y1 - 5, G[2])


def parte_quiosco(l, fr):
    """Puesto de diarios con toldo, pilas de diarios, cartel y banquito; buzón a un costado."""
    D, G = RAMPAS["madD"], RAMPAS["gris"]
    x0, x1 = 2, 36
    l.rect(x0, 156, x1, YB - 1, D[2]); l.rect(x0, 156, x1, 156, D[4]); l.rect(x0, YB - 3, x1, YB - 1, D[0])
    for x in range(x0 + 3, x1, 6):
        l.line((x, 158), (x, YB - 4), D[1])
    # diarios exhibidos
    for i, x in enumerate(range(x0 + 2, x1 - 3, 7)):
        l.rect(x, 142, x + 5, 155, "#fffdf7" if i % 2 else "#fbf3e4")
        l.line((x, 142), (x + 5, 142), "#d6cbb0")
        l.rect(x + 1, 144, x + 4, 145, G[0])                      # titular
        for yy in (147, 149, 151, 153):
            l.line((x + 1, yy), (x + 4, yy), G[2])
        l.px(x + 4, 143, RAMPAS["madR"][2])
    # postes y toldo a rayas
    l.line((x0, 130), (x0, 156), INK); l.line((x1, 130), (x1, 156), INK)
    for i, x in enumerate(range(x0 - 3, x1 + 4)):
        c = G[1] if (i // 4) % 2 == 0 else RAMPAS["madR"][3]
        l.line((x, 128), (x, 134), c)
        l.px(x, 135 if i % 2 == 0 else 134, c)
    l.rect(x0 - 3, 127, x1 + 3, 128, G[3]); l.rect(x0 - 3, 128, x1 + 3, 128, G[1])
    # cartel "DIARIOS" (rayitas)
    l.rect(x0 + 8, 136, x1 - 8, 140, INK); l.rect(x0 + 9, 137, x1 - 9, 139, "#fbf3e4")
    l.line((x0 + 11, 138), (x1 - 11, 138), G[0])
    # buzón
    R = ["#7a2e26", "#c94b64", "#f092a4"]
    l.rect(40, 150, 47, YB - 1, R[1]); l.rect(40, 150, 41, YB - 1, R[2]); l.rect(46, 150, 47, YB - 1, R[0])
    l.rect(39, 146, 48, 150, R[1]); l.rect(39, 146, 48, 146, R[2]); l.rect(39, 149, 48, 150, R[0])
    l.rect(41, 154, 46, 154, INK); l.rect(42, 158, 45, 163, "#fbf3e4"); l.px(43, 160, G[2]); l.px(44, 162, G[2])
    l.rect(41, YB - 3, 46, YB - 1, G[0])


def redaccion(fr):
    l = Lienzo(W, H)
    parte_quiosco(l, fr)
    parte_base(l, fr)
    parte_vidrio(l, fr)
    parte_cuarto(l, fr)
    parte_techo(l, fr)
    parte_escalera(l, fr)
    parte_edificio_chico(l, fr)
    parte_sotano(l, fr)
    # rayos de sol: aclaran en diagonal sobre la torre y oscurecen una franja contigua (sombra de la estructura)
    haz(l, (40, 20, 80, YB), 6, ancho=7, paso=40, d=1)
    haz(l, (40, 20, 80, YB), 22, ancho=5, paso=40, d=-1)
    # pájaros
    for (bx, by) in ((18, 34), (30, 26), (100, 40), (110, 30)):
        d = 0 if fr == 0 else 1
        l.px(bx, by + d, INK); l.px(bx - 1, by - 1 + d, INK); l.px(bx + 1, by - 1 + d, INK)
        l.px(bx - 2, by - 1 if d == 0 else by, INK); l.px(bx + 2, by - 1 if d == 0 else by, INK)
    l.contorno(INK)
    return l


def todo():
    for noche in (False, True):
        hoja = Lienzo(W * 2, H)
        for fr in range(2):
            c = redaccion(fr)
            if noche:
                c.im = a_noche(c.im)
            hoja.pegar(c, fr * W, 0)
        guardar(hoja, f"casat_redaccion{'_noche' if noche else ''}.png")


if __name__ == "__main__":
    todo()
    print("redaccion v2 ok")
