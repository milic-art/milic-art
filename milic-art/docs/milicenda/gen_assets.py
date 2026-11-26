"""Bloque 2: genera con código los sprites que faltan (todo original, paleta cerrada).
Salida en public/milicenda-assets/generados/. Después correr: python docs/milicenda/check_paleta.py public/milicenda-assets/generados
"""
import math, random
from gen_lib import *

# ------------------------------------------------------------------ agua
def ancho_fila(y):
    return 2 + 4 * y if y < 8 else 2 + 4 * (15 - y)


def baldosa_agua(flags, frame):
    l = Lienzo(32, 16)
    for y in range(16):
        w = ancho_fila(y)
        x0 = 16 - w // 2
        for x in range(x0, x0 + w):
            c = "#2c9488"
            # rayas largas oscuras y claras, se corren 2 px entre cuadros
            xx = x + (2 if frame else 0)
            if (y % 4 == 1) and ((xx // 6) % 3 == 0):
                c = "#58cc9f"
            elif (y % 4 == 3) and ((xx // 5) % 3 == 1):
                c = "#1b5f66"
            elif y % 8 == 5 and ((xx + y) // 4) % 4 == 0:
                c = "#58cc9f"
            if (frame == 0 and (x, y) in ((11, 6), (21, 10))) or (frame == 1 and (x, y) in ((13, 5), (19, 11))):
                c = "#b2f0cc"
            l.px(x, y, c)
        # espuma en los bordes que dan a tierra
        izq_ul = flags & 1 and y < 8
        der_ur = flags & 2 and y < 8
        der_lr = flags & 4 and y >= 8
        izq_ll = flags & 8 and y >= 8
        if izq_ul or izq_ll:
            for k in range(3):
                l.px(x0 + k, y, "#effbe6" if k < 2 else "#b2f0cc")
        if der_ur or der_lr:
            for k in range(3):
                l.px(x0 + w - 1 - k, y, "#effbe6" if k < 2 else "#b2f0cc")
    return l


def hoja_agua():
    hoja = Lienzo(32 * 16, 32)
    for f in range(16):
        for fr in range(2):
            hoja.pegar(baldosa_agua(f, fr), f * 32, fr * 16)
    guardar(hoja, "agua_hoja.png")


# ------------------------------------------------------------------ cascada 16x64 x3
def cascada():
    hoja = Lienzo(16 * 3, 64)
    for fr in range(3):
        l = Lienzo(16, 64)
        for x in range(16):
            top = 8 - x // 2
            # superficie sobre la baldosa y cara del borde: ancho completo
            ancho_caida = (0, 15) if True else None
            for y in range(top, 64):
                if y > 30 + x // 2 and (x < 2 or x > 13):
                    continue
                # fin: se desarma en rocío
                if y > 52 and ((x * 7 + y * 3 + fr * 5) % 4 != 0):
                    continue
                c = "#2c9488"
                col = (x + (y + fr * 4) // 5) % 4
                if col == 0:
                    c = "#58cc9f"
                elif col == 2 and (y + fr * 3) % 7 < 4:
                    c = "#b2f0cc"
                elif col == 3:
                    c = "#1b5f66" if (y + fr * 2) % 5 < 2 else "#2c9488"
                if y < 16 and col != 0:
                    c = "#2c9488"
                l.px(x, y, c)
        # espuma en el borde del labio
        for x in range(16):
            l.px(x, 8 + x // 2 + (1 if fr == 1 else 0), "#effbe6")
        # gotitas
        for (gx, gy) in ((4, 58), (11, 61), (7, 62)):
            l.px(gx + fr, gy - fr, "#effbe6")
        hoja.pegar(l, fr * 16, 0)
    guardar(hoja, "cascada_hoja.png")


# ------------------------------------------------------------------ nubes
def nube(w, h, seed, nombre):
    r = random.Random(seed)
    l = Lienzo(w, h)
    base = h - 3
    circulos = []
    n = max(3, w // 12)
    for k in range(n):
        cx = 6 + (w - 12) * k / max(1, n - 1)
        rad = r.randint(int(h * 0.28), int(h * 0.5))
        if k in (n // 2, (n - 1) // 2):
            rad = int(h * 0.55)
        circulos.append((cx, base - rad + 1, rad))
    for y in range(h):
        for x in range(w):
            dentro = any((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= rr * rr for cx, cy, rr in circulos)
            if dentro and y <= base:
                l.px(x, y, "#fffdf7")
    # base plana redondeada
    for x in range(2, w - 2):
        if l.im.getpixel((x, base))[3]:
            pass
    # sombra abajo (tercio inferior) y luz arriba-izquierda
    for y in range(h):
        for x in range(w):
            if l.im.getpixel((x, y))[3]:
                if y >= base - 2:
                    l.px(x, y, "#c2e0d8")
                elif y >= base - 5 and x > w * 0.45:
                    l.px(x, y, "#c8ecdc")
    guardar(l, nombre)


def sol():
    hoja = Lienzo(32 * 2, 32)
    for fr in range(2):
        l = Lienzo(32, 32)
        cx, cy = 16, 16
        rays = [(0, -1), (1, 0), (0, 1), (-1, 0)] if fr == 0 else [(1, -1), (1, 1), (-1, 1), (-1, -1)]
        for dx, dy in rays:
            for k in range(11, 15):
                l.px(cx + dx * k * (0.72 if dx and dy else 1), cy + dy * k * (0.72 if dx and dy else 1), "#f9e07a")
                l.px(cx + dx * k * (0.72 if dx and dy else 1) + (1 if not dx else 0), cy + dy * k * (0.72 if dx and dy else 1) + (1 if not dy else 0), "#f9e07a")
        l.ellipse(cx, cy, 9, 9, "#f2c230")
        l.ellipse(cx - 1, cy - 1, 8, 8, "#f9e07a")
        l.ellipse(cx - 3, cy - 3, 4, 4, "#fffdf7")
        # contorno ámbar abajo-derecha
        for y in range(32):
            for x in range(32):
                if ((x + .5 - cx) ** 2 + (y + .5 - cy) ** 2) <= 81 and ((x + .5 - cx) ** 2 + (y + .5 - cy) ** 2) > 64 and x + y > 32:
                    l.px(x, y, "#d99a1c")
        hoja.pegar(l, fr * 32, 0)
    guardar(hoja, "sol_hoja.png")


def luna():
    l = Lienzo(24, 24)
    for y in range(24):
        for x in range(24):
            d1 = (x + .5 - 12) ** 2 + (y + .5 - 12) ** 2
            d2 = (x + .5 - 17) ** 2 + (y + .5 - 9) ** 2
            if d1 <= 100 and d2 > 70:
                l.px(x, y, "#fff3c4")
    for (x, y) in ((6, 12), (7, 12), (6, 13), (8, 17), (9, 17)):
        l.px(x, y, "#f9e07a")
    guardar(l, "luna.png")


# ------------------------------------------------------------------ girasoles 16x24 x2
def girasol():
    hoja = Lienzo(16 * 2, 24)
    for fr in range(2):
        l = Lienzo(16, 24)
        sway = fr
        # tallo
        for y in range(11, 24):
            x = 8 + (sway if y < 16 else 0)
            l.px(x, y, "#587a35")
            l.px(x + 1, y, "#35563a")
        # hojas
        for (x, y) in ((5, 17), (4, 18), (5, 18), (6, 18), (11, 19), (12, 20), (10, 20), (11, 20)):
            l.px(x, y, "#8aa23a")
        l.px(6, 19, "#587a35"); l.px(10, 21, "#35563a")
        cx, cy = 8 + sway, 7
        l.ellipse(cx, cy, 7, 7, "#f2c230")
        for y in range(16):
            for x in range(16):
                dd = (x + .5 - cx) ** 2 + (y + .5 - cy) ** 2
                if dd <= 49 and x + y < cx + cy - 2:
                    l.px(x, y, "#f9e07a")
                if dd <= 49 and dd > 36 and x + y > cx + cy + 3:
                    l.px(x, y, "#d99a1c")
        l.ellipse(cx, cy, 3, 3, "#5a3322")
        l.px(cx - 1, cy - 1, "#8a4e2a"); l.px(cx, cy - 1, "#8a4e2a")
        l.contorno(INK)
        hoja.pegar(l, fr * 16, 0)
    guardar(hoja, "girasol_hoja.png")


# ------------------------------------------------------------------ bichitos
def mariposas():
    hoja = Lienzo(7 * 4, 5)
    pal = {"o": "#e8874a", "p": "#f4b183", "k": INK}
    pal2 = {"o": "#8a5fc0", "p": "#c3a2e6", "k": INK}
    f0 = ["oo.k.oo", "opokopo", ".ookoo.", "..oko..", "......."]
    f1 = ["...k...", ".ookoo.", ".opkpo.", "..okoo.", "......."]
    for i, (fr, p) in enumerate(((f0, pal), (f1, pal), (f0, pal2), (f1, pal2))):
        l = Lienzo(7, 5)
        bitmap(l, 0, 0, fr, p)
        hoja.pegar(l, i * 7, 0)
    guardar(hoja, "mariposas_hoja.png")


def pato():
    hoja = Lienzo(11 * 2, 9)
    pal = {"y": "#f9e07a", "Y": "#f2c230", "o": "#e8874a", "e": INK, "w": "#effbe6", "b": "#b2f0cc"}
    f0 = ["....yyy....",
          "...yyyyy...",
          ".o.yeyyy...",
          "ooyyyyyyy..",
          "..yyyyyyyY.",
          "..yyYYYYYY.",
          "bwbwbwbwbwb",
          ".b.b.b.b.b."]
    f1 = ["....yyy....",
          "...yyyyy...",
          ".o.yeyyy...",
          "ooyyyyyyy..",
          "..yyyyyyyY.",
          "..yyYYYYYY.",
          ".bwbwbwbwbw",
          "b.b.b.b.b.b"]
    for i, fr in enumerate((f0, f1)):
        l = Lienzo(11, 9)
        bitmap(l, 0, 0, fr, pal)
        hoja.pegar(l, i * 11, 0)
    guardar(hoja, "pato_hoja.png")


# ------------------------------------------------------------------ casitas 64x64
CAS = {
    "L": (8, 34), "T": (32, 22), "R": (56, 34), "B": (32, 46),
}


def pared_izq(x, yoff):  # plano de la pared izquierda
    return 29 + (x - 8) * 0.5 + yoff


def pared_der(x, yoff):  # plano de la pared derecha
    return 41 - (x - 32) * 0.5 + yoff


def rect_izq(l, x0, x1, y0, y1, c):
    l.poly([(x0, pared_izq(x0, y0)), (x1, pared_izq(x1, y0)), (x1, pared_izq(x1, y1)), (x0, pared_izq(x0, y1))], c)


def rect_der(l, x0, x1, y0, y1, c):
    l.poly([(x0, pared_der(x0, y0)), (x1, pared_der(x1, y0)), (x1, pared_der(x1, y1)), (x0, pared_der(x0, y1))], c)


def icono_izq(l, x0, yoff, filas, claves):
    for dy, fila in enumerate(filas):
        for dx, ch in enumerate(fila):
            if ch != ".":
                l.px(x0 + dx, pared_izq(x0 + dx, yoff + dy), claves[ch])


def icono_der(l, x0, yoff, filas, claves):
    for dy, fila in enumerate(filas):
        for dx, ch in enumerate(fila):
            if ch != ".":
                l.px(x0 + dx, pared_der(x0 + dx, yoff + dy), claves[ch])


def casa(nombre, acento, puerta, icono, frame, noche, extra):
    l = Lienzo(64, 64)
    # paredes
    l.poly([(8, 29), (32, 41), (32, 61), (8, 49)], "#fbf3e4")
    l.poly([(32, 41), (56, 29), (56, 49), (32, 61)], "#d6cbb0")
    # vigas de madera
    for x in range(8, 32):
        l.px(x, pared_izq(x, 18), "#bf8444")
        l.px(x, pared_izq(x, 19), "#8f5a30")
    for x in range(32, 56):
        l.px(x, pared_der(x, 18), "#8f5a30")
        l.px(x, pared_der(x, 19), "#5f3a24")
    rect_izq(l, 8, 9, 0, 19, "#bf8444")
    rect_der(l, 54, 56, 0, 19, "#8f5a30")
    # zócalo de piedra
    for x in range(8, 32):
        l.px(x, pared_izq(x, 16), "#a8a08e"); l.px(x, pared_izq(x, 17), "#77707c")
    for x in range(32, 56):
        l.px(x, pared_der(x, 16), "#77707c"); l.px(x, pared_der(x, 17), "#463f4a")
    # puerta (pared izquierda)
    rect_izq(l, 13, 21, 8, 18, "#5f3a24")
    rect_izq(l, 14, 20, 9, 18, puerta)
    for x in (14, 15):
        rect_izq(l, x, x, 9, 18, {"#4f7fd0": "#a8cdf2"}.get(puerta, "#f2bd6e") if x == 14 else puerta)
    l.px(19, pared_izq(19, 13), "#f2c230")
    # ventana pared izquierda (chica)
    vent = "#ffd36b" if noche else "#a8cdf2"
    rect_izq(l, 24, 30, 6, 13, "#5f3a24")
    rect_izq(l, 25, 29, 7, 12, vent)
    if noche:
        rect_izq(l, 26, 27, 8, 9, "#fff1a8")
    else:
        l.px(26, pared_izq(26, 8), "#ffffff"); l.px(27, pared_izq(27, 8), "#c2e0d8")
    # ventana grande pared derecha
    rect_der(l, 37, 49, 6, 14, "#5f3a24")
    rect_der(l, 38, 48, 7, 13, "#ffd36b" if noche else "#a8cdf2")
    for x in (43,):
        rect_der(l, x, x, 7, 13, "#5f3a24")
    if noche:
        rect_der(l, 39, 42, 8, 10, "#fff1a8"); rect_der(l, 44, 47, 8, 10, "#fff1a8")
    else:
        l.px(39, pared_der(39, 8), "#ffffff"); l.px(40, pared_der(40, 8), "#c2e0d8"); l.px(44, pared_der(44, 8), "#ffffff")
    # cortinas
    rect_der(l, 38, 39, 7, 10, acento); rect_der(l, 47, 48, 7, 10, acento)
    # cajón de flores bajo la ventana
    rect_der(l, 37, 49, 14, 15, "#8f5a30")
    for k, c in zip(range(38, 49, 2), ("#f092a4", "#fffdf7", "#f9e07a", "#f092a4", "#c3a2e6", "#fffdf7")):
        l.px(k, pared_der(k, 13), c)
        l.px(k + 1, pared_der(k + 1, 13), "#587a35")
    # icono / cartel sobre la puerta
    rect_izq(l, 13, 21, 4, 8, "#5f3a24")
    icono_izq(l, 15, 4, [r[:5] for r in icono[0][:4]], icono[1])
    # techo (hipped)
    A = (32, 10)
    Lh, Bh, Rh = (3, 31), (32, 46), (61, 31)
    l.poly([A, Lh, Bh], "#e8874a")
    l.poly([A, Bh, Rh], "#b84a2c")
    # hileras de tejas
    for t in (0.25, 0.5, 0.75):
        p0 = (A[0] + (Lh[0] - A[0]) * t, A[1] + (Lh[1] - A[1]) * t)
        p1 = (A[0] + (Bh[0] - A[0]) * t, A[1] + (Bh[1] - A[1]) * t)
        l.line(p0, p1, "#b84a2c")
        q0 = (A[0] + (Bh[0] - A[0]) * t, A[1] + (Bh[1] - A[1]) * t)
        q1 = (A[0] + (Rh[0] - A[0]) * t, A[1] + (Rh[1] - A[1]) * t)
        l.line(q0, q1, "#7a2e26")
    # luz en el techo (arriba izquierda)
    l.line((A[0], A[1] + 2), (Lh[0] + 4, Lh[1] - 3), "#f4b183")
    l.line((A[0] - 1, A[1] + 3), (Lh[0] + 6, Lh[1] - 4), "#f4b183")
    # canalón / alero (sombra)
    l.line((Lh[0], Lh[1] + 1), (Bh[0], Bh[1] + 1), "#7a2e26")
    l.line((Bh[0], Bh[1] + 1), (Rh[0], Rh[1] + 1), "#5a3322")
    # cumbrera marcada
    l.line(A, Bh, "#7a2e26")
    extra(l, frame, noche)
    l.contorno(INK)
    # contorno interno del techo y esquina de la pared
    l.line(Lh, Bh, INK); l.line(Bh, Rh, INK)
    l.line((32, 52), (32, 61), INK2)
    l.line(A, Lh, INK); l.line(A, Rh, INK)
    return l


def chimenea(l, x, y, frame):
    l.rect(x, y, x + 5, y + 10, "#b84a2c")
    l.rect(x + 3, y, x + 5, y + 10, "#7a2e26")
    l.rect(x - 1, y - 2, x + 6, y, "#5a3322")
    l.px(x + 1, y + 3, "#e8874a"); l.px(x + 1, y + 7, "#e8874a")


def extra_redaccion(l, fr, noche):
    chimenea(l, 42, 8, fr)
    # papelitos que vuelan (cuadro 2 sube uno)
    py = 20 - fr
    l.rect(9, py, 11, py + 1, "#fffdf7"); l.px(10, py, "#c2e0d8")
    # pila de papeles junto a la puerta
    l.rect(24, 54, 29, 55, "#fffdf7"); l.rect(25, 52, 30, 53, "#fbf3e4"); l.px(26, 53, "#4f7fd0")
    # buzón
    l.rect(4, 52, 7, 55, "#4f7fd0"); l.px(5, 53, "#a8cdf2"); l.line((5, 56), (5, 59), "#5f3a24")


def extra_estudio(l, fr, noche):
    chimenea(l, 42, 8, fr)
    # post-its en la pared izquierda
    for (x, yoff, c) in ((25, 10, "#f9e07a"), (29, 11, "#f092a4")):
        pass
    # lamparita (titila)
    l.px(6, 38, "#5f3a24"); l.line((6, 39), (6, 41), "#5f3a24")
    l.rect(5, 42, 7, 43, "#ffd36b" if noche else ("#f9e07a" if fr == 0 else "#fffdf7"))
    if fr == 1 or noche:
        l.px(4, 41, "#fff1a8" if noche else "#f9e07a"); l.px(8, 41, "#fff1a8" if noche else "#f9e07a")
    # maceta
    l.rect(52, 56, 56, 59, "#b84a2c"); l.px(53, 55, "#587a35"); l.px(54, 54, "#8aa23a"); l.px(55, 55, "#587a35"); l.px(54, 53, "#f092a4")


def extra_taller(l, fr, noche):
    chimenea(l, 42, 8, fr)
    # caballete junto a la puerta con lienzo que se va pintando
    l.line((6, 59), (9, 50), "#8f5a30"); l.line((13, 59), (10, 50), "#8f5a30")
    l.rect(5, 46, 12, 52, "#fffdf7")
    l.rect(6, 47, 7 + fr * 3, 49, "#f092a4")
    l.rect(6, 50, 9, 51, "#58cc9f")
    if fr == 1:
        l.rect(9, 47, 10, 48, "#f9e07a")
    # salpicaduras en el zócalo
    l.px(34, 55, "#f092a4"); l.px(40, 57, "#58cc9f"); l.px(46, 54, "#f9e07a")


def extra_lab(l, fr, noche):
    # tubo de ventilación y engranaje en el techo que gira
    l.rect(42, 9, 45, 20, "#77707c"); l.rect(42, 9, 43, 20, "#a8a08e"); l.rect(41, 7, 46, 9, "#463f4a")
    gx, gy = 21, 25
    l.ellipse(gx, gy, 4, 4, "#d99a1c"); l.ellipse(gx, gy, 2, 2, "#5a3322")
    dientes = [(0, -5), (0, 5), (-5, 0), (5, 0)] if fr == 0 else [(4, -4), (-4, 4), (-4, -4), (4, 4)]
    for dx, dy in dientes:
        l.px(gx + dx, gy + dy, "#d99a1c")
    l.px(gx - 2, gy - 2, "#f2c230")
    # burbujas
    l.px(42 - fr, 4 - fr, "#b2f0cc"); l.px(44 + fr, 2, "#effbe6")
    # matraz
    l.rect(5, 55, 8, 58, "#58cc9f"); l.rect(6, 52, 7, 54, "#c2e0d8"); l.px(5, 55, "#b2f0cc")


def extra_casita(l, fr, noche):
    chimenea(l, 42, 8, fr)
    # girasoles chiquitos a los lados
    for (x, y) in ((4, 52), (52, 55)):
        l.line((x, y + 2), (x, y + 8), "#587a35")
        l.rect(x - 1, y - 1, x + 1, y + 1, "#f2c230"); l.px(x, y, "#5a3322")
    # flores
    for (x, y, c) in ((24, 56, "#f092a4"), (27, 57, "#fffdf7"), (30, 56, "#c3a2e6")):
        l.px(x, y, c); l.px(x, y + 1, "#587a35")


ICONOS = {
    "redaccion": (["fffff", "fkfkf", "fffff", "fkkkf"], {"f": "#fffdf7", "k": "#463f4a"}),
    "estudio": (["yyyyy", "ykyky", "yyyyy", "ykkky"], {"y": "#f9e07a", "k": "#d99a1c"}),
    "taller": (["ppppp", "pkppk", "ppwpp", "pppkp"], {"p": "#fbf3e4", "k": "#f092a4", "w": "#58cc9f"}),
    "lab": (["ttttt", "tgtgt", "ttttt", "tgggt"], {"t": "#c2e0d8", "g": "#2c9488"}),
    "casita": (["fffff", "fhfhf", "fhhhf", "fffff"], {"f": "#fbf3e4", "h": "#c94b64"}),
}
CASAS = [
    ("casa_redaccion", "redaccion", "#c3a2e6", "#4f7fd0", extra_redaccion),
    ("casa_estudio", "estudio", "#f092a4", "#8a5fc0", extra_estudio),
    ("casa_taller", "taller", "#58cc9f", "#c94b64", extra_taller),
    ("casa_laboratorio", "lab", "#b2f0cc", "#2c9488", extra_lab),
    ("casa_casita", "casita", "#f092a4", "#f2c230", extra_casita),
]


def hojas_casas():
    for nombre, ic, acento, puerta, extra in CASAS:
        for noche in (False, True):
            hoja = Lienzo(64 * 2, 64)
            for fr in range(2):
                c = casa(nombre, acento, puerta, ICONOS[ic], fr, noche, extra)
                if noche:
                    c.im = a_noche_casa(c.im)
                hoja.pegar(c, fr * 64, 0)
            guardar(hoja, f"{nombre}{'_noche' if noche else ''}.png")


def a_noche_casa(im):
    """Pasa a noche pero deja las luces (#ffd36b, #fff1a8) sin oscurecer."""
    return a_noche(im)


if __name__ == "__main__":
    guardar_noche_json()
    hoja_agua()
    cascada()
    nube(40, 16, 1, "nube_s.png")
    nube(64, 24, 2, "nube_m.png")
    nube(96, 32, 3, "nube_l.png")
    sol(); luna(); girasol(); mariposas(); pato(); hojas_casas()
    print("ok")
