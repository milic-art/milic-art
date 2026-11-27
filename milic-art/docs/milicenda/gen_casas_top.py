"""Las 5 casitas vistas de frente desde arriba (cenital 3/4), cada una con su silueta propia.
64x72, base (puerta) en la fila 68. 2 cuadros, día y noche. Salida: casat_*.png"""
from gen_lib import *

W_, H_ = 64, 72
YB = 68


def techo(l, xa0, xa1, xb0, xb1, ya, yb, c1, c2, c3, c4, fila=4):
    """Trapecio de techo visto desde arriba: arriba (xa0..xa1 en ya), abajo (xb0..xb1 en yb)."""
    l.poly([(xa0, ya), (xa1, ya), (xb1, yb), (xb0, yb)], c1)
    n = yb - ya
    for k, y in enumerate(range(ya, yb + 1)):
        t = (y - ya) / max(1, n)
        x0 = xa0 + (xb0 - xa0) * t
        x1 = xa1 + (xb1 - xa1) * t
        if (y - ya) % fila == fila - 1:
            l.line((x0, y), (x1, y), c2)
            # tejas: marcas verticales alternadas
            off = 0 if ((y - ya) // fila) % 2 == 0 else 3
            for x in range(int(x0) + off, int(x1), 6):
                l.px(x, y - 1, c2)
        if (y - ya) % fila == 0:
            l.line((x0 + 1, y), (x1 - 1, y), c4) if y > ya + 1 else None
    l.line((xa0, ya), (xa1, ya), c4)  # cumbrera clara
    l.line((xa0, ya + 1), (xa1, ya + 1), c1)
    # alero (sombra bajo el techo)
    l.line((xb0, yb), (xb1, yb), c3)
    l.line((xb0 + 1, yb + 1), (xb1 - 1, yb + 1), "#5a3322")


def pared(l, x0, y0, x1, y1, c, c2, zocalo="#77707c"):
    l.rect(x0, y0, x1, y1, c)
    l.rect(x1 - 2, y0, x1, y1, c2)  # lado en sombra
    l.rect(x0, y1 - 2, x1, y1, zocalo)
    l.rect(x0, y1 - 1, x1, y1, "#463f4a")


def ventana(l, x0, y0, x1, y1, noche, marco="#5f3a24", cort=None, cruz=True):
    l.rect(x0, y0, x1, y1, marco)
    l.rect(x0 + 1, y0 + 1, x1 - 1, y1 - 1, "#ffd36b" if noche else "#a8cdf2")
    if noche:
        l.rect(x0 + 2, y0 + 2, x1 - 2, y1 - 2, "#fff1a8")
    else:
        l.px(x0 + 1, y0 + 1, "#ffffff")
    if cruz and x1 - x0 >= 4:
        xm = (x0 + x1) // 2
        l.line((xm, y0 + 1), (xm, y1 - 1), marco)
    if cort:
        l.line((x0 + 1, y0 + 1), (x0 + 1, y1 - 1), cort)
        l.line((x1 - 1, y0 + 1), (x1 - 1, y1 - 1), cort)
    l.line((x0 - 1, y1 + 1), (x1 + 1, y1 + 1), "#8f5a30")


def puerta(l, x0, x1, y0, c, redonda=False, noche=False):
    l.rect(x0 - 1, y0 - 1, x1 + 1, YB, "#5f3a24")
    l.rect(x0, y0, x1, YB, c)
    if redonda:
        l.px(x0 - 1, y0 - 1, None) if False else None
    l.px(x1 - 1, (y0 + YB) // 2, "#f2c230")
    l.line((x0 + 1, y0 + 1), (x0 + 1, YB - 1), "#f9e07a" if c == "#f2c230" else "#bf8444")


def chimenea(l, x, y, h):
    l.rect(x, y, x + 5, y + h, "#b84a2c")
    l.rect(x + 3, y, x + 5, y + h, "#7a2e26")
    l.rect(x - 1, y - 2, x + 6, y, "#5a3322")


def maceta(l, x, y, c="#f092a4"):
    l.rect(x, y, x + 4, y + 2, "#b96d32")
    l.px(x + 1, y - 1, "#587a35"); l.px(x + 3, y - 1, "#587a35"); l.px(x + 2, y - 2, c)
    l.px(x, y - 2, c); l.px(x + 4, y - 2, "#fffdf7")


# ---------------------------------------------------------------- 1 Redacción
def redaccion(fr, noche):
    l = Lienzo(W_, H_)
    pared(l, 14, 38, 49, YB, "#f4b183", "#e8874a")
    # franja de piedra y entablado
    for y in (46, 54):
        l.line((14, y), (46, y), "#e8874a")
    techo(l, 22, 41, 11, 52, 14, 38, "#b84a2c", "#7a2e26", "#7a2e26", "#e8874a", 4)
    # torrecita con reloj
    l.rect(26, 20, 37, 32, "#fbf3e4"); l.rect(35, 20, 37, 32, "#d6cbb0"); l.rect(26, 20, 37, 21, "#8a4e2a")
    l.ellipse(31, 27, 4.5, 4.5, "#2e1b14"); l.ellipse(31, 27, 3.5, 3.5, "#fffdf7")
    l.line((31, 27), (31, 24), "#2e1b14")
    l.line((31, 27), (33 if fr == 0 else 32, 29 if fr else 27), "#2e1b14")
    # bandera
    l.line((31, 20), (31, 11), "#5f3a24")
    l.poly([(32, 11), (38 + fr, 12 + fr), (32, 14)], "#c94b64")
    chimenea(l, 44, 8, 10)
    # ventanas con diarios
    ventana(l, 17, 42, 24, 50, noche, cort="#fbf3e4")
    ventana(l, 39, 42, 46, 50, noche, cort="#fbf3e4")
    # puerta con marquesina
    puerta(l, 28, 35, 54, "#5f3a24")
    l.rect(26, 51, 37, 53, "#e8874a"); l.line((26, 53), (37, 53), "#7a2e26")
    # cartel de diario a un costado
    l.rect(8, 56, 13, 66, "#fbf3e4"); l.line((8, 56), (13, 56), "#8a4e2a")
    for y in (58, 60, 62, 64):
        l.line((9, y), (12, y), "#77707c")
    l.px(10, 66, "#5f3a24"); l.px(11, 66, "#5f3a24")
    # pilas de papel
    l.rect(51, 62, 57, 66, "#fffdf7"); l.rect(51, 66, 57, 67, "#d6cbb0")
    l.rect(52, 59, 56, 61, "#fbf3e4"); l.line((52, 61), (56, 61), "#d6cbb0")
    l.contorno(INK)
    return l, (41, 5)


# ---------------------------------------------------------------- 2 Estudio
def estudio(fr, noche):
    l = Lienzo(W_, H_)
    pared(l, 6, 38, 57, YB, "#fbf3e4", "#d6cbb0", "#8a5fc0")
    # terraza: piso de madera visto desde arriba + baranda
    l.rect(4, 20, 59, 37, "#bf8444")
    for y in (24, 28, 32):
        l.line((5, y), (58, y), "#8f5a30")
    for x in range(5, 58, 5):
        l.px(x, 22, "#8f5a30"); l.px(x + 2, 26, "#8f5a30"); l.px(x + 1, 30, "#8f5a30")
    l.rect(4, 36, 59, 37, "#5f3a24")
    for x in range(4, 60, 4):
        l.rect(x, 33, x, 36, "#fbf3e4")
    l.line((4, 33), (59, 33), "#fbf3e4")
    # sombrilla lila (se mece)
    sx = 18 + fr
    l.line((sx, 27), (sx, 33), "#5f3a24")
    l.ellipse(sx, 24, 9, 5, "#c3a2e6"); l.ellipse(sx, 24, 5, 3, "#8a5fc0"); l.px(sx, 24, "#fffdf7")
    # plantas y mesita
    maceta(l, 42, 29, "#f092a4"); maceta(l, 50, 27, "#f9e07a")
    l.rect(32, 28, 38, 30, "#8f5a30"); l.line((32, 28), (38, 28), "#e0b070")
    l.rect(34, 26, 36, 27, "#4f7fd0")
    # farol de la terraza
    l.px(55, 22, "#5f3a24"); l.rect(54, 20, 56, 21, "#ffd36b" if noche else ("#fffdf7" if fr else "#f9e07a"))
    # toldo lila y rayas
    for x in range(6, 58):
        c = "#8a5fc0" if ((x - 6) // 3) % 2 == 0 else "#fbf3e4"
        l.line((x, 38), (x, 41), c)
        l.px(x, 42, c if x % 2 else "#463f4a")
    l.line((6, 38), (57, 38), "#4a3a8a" if False else "#463f4a")
    # ventanal grande con post-its
    l.rect(10, 45, 34, 59, "#5f3a24")
    l.rect(11, 46, 33, 58, "#ffd36b" if noche else "#a8cdf2")
    if noche:
        l.rect(12, 47, 32, 57, "#fff1a8")
    for (x, y, c) in ((13, 48, "#f9e07a"), (18, 50, "#f092a4"), (24, 48, "#58cc9f"), (28, 52, "#c3a2e6"), (14, 53, "#c3a2e6"), (21, 55, "#f9e07a"), (30, 56, "#f092a4")):
        l.rect(x, y, x + 2, y + 2, c)
    l.line((22, 46), (22, 58), "#5f3a24")
    # puerta
    puerta(l, 42, 49, 52, "#8a5fc0")
    ventana(l, 51, 45, 55, 52, noche, cruz=False)
    # caballete de colores
    l.rect(7, 64, 9, 67, "#c94b64"); l.rect(10, 65, 12, 67, "#4f7fd0"); l.rect(13, 64, 15, 67, "#f2c230")
    l.contorno(INK)
    return l, None


# ---------------------------------------------------------------- 3 Taller de dibujo
def taller(fr, noche):
    l = Lienzo(W_, H_)
    pared(l, 8, 44, 55, YB, "#e0b070", "#bf8444", "#8f5a30")
    # entablado vertical
    for x in range(10, 54, 4):
        l.line((x, 46), (x, YB - 3), "#bf8444")
    techo(l, 12, 51, 3, 60, 22, 44, "#8f5a30", "#5f3a24", "#463f4a", "#bf8444", 4)
    # claraboya
    l.rect(24, 28, 39, 36, "#463f4a"); l.rect(25, 29, 38, 35, "#ffd36b" if noche else "#a8cdf2")
    l.line((31, 29), (31, 35), "#463f4a"); l.px(26, 30, "#ffffff")
    # cartel con pincel
    l.rect(24, 40, 39, 43, "#5f3a24")
    l.rect(25, 41, 38, 42, "#fbf3e4"); l.px(28, 41, "#c94b64"); l.px(31, 42, "#4f7fd0"); l.px(34, 41, "#f2c230")
    # puerta ancha con toldo rayado
    puerta(l, 27, 36, 56, "#5f3a24")
    for x in range(22, 42):
        c = "#c94b64" if ((x - 22) // 3) % 2 == 0 else "#fffdf7"
        l.line((x, 50), (x, 53), c)
        l.px(x, 54, c if x % 2 else "#463f4a")
    l.line((22, 49), (41, 49), "#7a2e26")
    ventana(l, 11, 50, 19, 58, noche, cort="#f9e07a")
    ventana(l, 44, 50, 52, 58, noche, cort="#f9e07a")
    # caballete con lienzo (cuadro 2: pincelada nueva)
    l.line((57, 66), (59, 56), "#5f3a24"); l.line((62, 66), (60, 56), "#5f3a24")
    l.rect(55, 52, 62, 60, "#fffdf7"); l.rect(55, 52, 62, 52, "#bf8444")
    l.rect(56, 54, 58, 58, "#58cc9f"); l.rect(59, 55, 61, 57, "#f092a4")
    if fr:
        l.rect(57, 56, 60, 56, "#f2c230")
    # latas de pintura
    for k, c in enumerate(("#c94b64", "#4f7fd0", "#f2c230")):
        l.rect(2 + k * 4, 63, 4 + k * 4, 67, "#a8a08e"); l.rect(2 + k * 4, 63, 4 + k * 4, 64, c)
    l.contorno(INK)
    return l, None


# ---------------------------------------------------------------- 4 Laboratorio
def laboratorio(fr, noche):
    l = Lienzo(W_, H_)
    pared(l, 16, 36, 47, YB, "#a8a08e", "#77707c", "#463f4a")
    # sillares de piedra
    for y in range(40, YB - 2, 5):
        l.line((16, y), (45, y), "#77707c")
        for x in range(18 + (y // 5 % 2) * 4, 45, 8):
            l.px(x, y + 2, "#77707c")
    # techo cónico teal visto de frente
    l.poly([(31, 6), (13, 36), (50, 36)], "#2c9488")
    l.poly([(31, 6), (31, 36), (50, 36)], "#1b5f66")
    for y in range(12, 36, 4):
        t = (y - 6) / 30
        l.line((31 - 18 * t, y), (31 + 19 * t, y), "#1b5f66" if y % 8 else "#58cc9f")
    l.line((31, 6), (13, 36), "#2e1b14"); l.line((31, 6), (50, 36), "#2e1b14"); l.line((13, 36), (50, 36), "#2e1b14")
    # veleta y estrella
    l.line((31, 2), (31, 6), "#5f3a24"); l.px(30, 2, "#f2c230"); l.px(32, 2, "#f2c230"); l.px(31, 1, "#f9e07a")
    # ventana redonda brillante
    l.ellipse(31, 46, 6, 6, "#5f3a24"); l.ellipse(31, 46, 5, 5, "#ffd36b" if noche else "#58cc9f")
    l.ellipse(31, 46, 3, 3, "#fff1a8" if noche else "#b2f0cc")
    l.px(29, 44, "#ffffff")
    l.line((31, 41), (31, 51), "#5f3a24"); l.line((26, 46), (36, 46), "#5f3a24")
    # puerta
    puerta(l, 27, 35, 57, "#2c9488")
    # engranaje en la pared
    gx, gy = 21, 59
    l.ellipse(gx, gy, 3, 3, "#d99a1c"); l.px(gx, gy, "#5f3a24")
    for (dx, dy) in ((0, -4), (0, 4), (-4, 0), (4, 0)) if fr == 0 else ((3, -3), (-3, 3), (-3, -3), (3, 3)):
        l.px(gx + dx, gy + dy, "#d99a1c")
    # caños de cobre
    l.rect(48, 44, 50, 66, "#b96d32"); l.line((48, 44), (48, 66), "#dc9544"); l.rect(46, 41, 52, 43, "#8a4e2a")
    l.rect(50, 62, 56, 64, "#b96d32")
    # frascos burbujeantes
    l.rect(9, 62, 13, 67, "#effbe6"); l.rect(10, 64, 12, 67, "#58cc9f"); l.px(11, 62 - fr, "#b2f0cc")
    l.rect(53, 64, 58, 67, "#effbe6"); l.rect(54, 65, 57, 67, "#f092a4")
    l.contorno(INK)
    return l, (49, 36)


# ---------------------------------------------------------------- 5 Casita
def casita(fr, noche):
    l = Lienzo(W_, H_)
    pared(l, 12, 42, 51, YB, "#fbf3e4", "#d6cbb0", "#a8a08e")
    # vigas
    for x in (12, 26, 37, 49):
        l.line((x, 42), (x, YB - 3), "#8f5a30")
    l.line((12, 42), (51, 42), "#8f5a30")
    techo(l, 22, 41, 7, 56, 20, 42, "#e8874a", "#b84a2c", "#7a2e26", "#f4b183", 4)
    # corazón en el techo
    for (x, y) in ((28, 27), (30, 27), (33, 27), (35, 27)):
        pass
    for (x, y) in ((27, 29), (29, 29), (33, 29), (35, 29), (26, 30), (27, 30), (28, 30), (29, 30), (30, 30), (32, 30), (33, 30), (34, 30), (35, 30), (36, 30)):
        pass
    heart = ["..X.X..", ".XXXXX.", ".XXXXX.", "..XXX..", "...X..."]
    bitmap(l, 28, 27, heart, {"X": "#c94b64"})
    chimenea(l, 11, 14, 14)
    # puerta redonda amarilla
    l.rect(27, 55, 36, YB, "#5f3a24"); l.ellipse(31.5, 56, 5, 4, "#5f3a24")
    l.rect(28, 56, 35, YB, "#f2c230"); l.ellipse(31.5, 56, 4, 3, "#f2c230")
    l.line((29, 55), (29, YB - 1), "#f9e07a"); l.px(34, 62, "#8f5a30")
    ventana(l, 15, 47, 22, 54, noche, cort="#f092a4")
    ventana(l, 41, 47, 48, 54, noche, cort="#f092a4")
    # cajón de flores
    l.rect(40, 55, 49, 57, "#8f5a30")
    for k, c in zip(range(41, 49, 2), ("#f092a4", "#fffdf7", "#f9e07a", "#f092a4")):
        l.px(k, 54, c); l.px(k + 1, 54, "#587a35")
    # girasoles al frente
    for x in (6, 57):
        l.line((x, 62), (x, 68), "#587a35"); l.rect(x - 1, 59, x + 1, 61, "#f2c230"); l.px(x, 60, "#5a3322")
        l.px(x + (1 if fr else -1), 58, "#f2c230")
    # cuenco de Clocky
    l.rect(15, 65, 20, 66, "#c94b64"); l.px(16, 64, "#f9e07a"); l.px(18, 64, "#f9e07a")
    # escalón
    l.rect(26, YB - 1, 37, YB, "#a8a08e")
    l.contorno(INK)
    return l, (13, 7)


CASAS = [("casat_estudio", estudio), ("casat_taller", taller), ("casat_laboratorio", laboratorio), ("casat_casita", casita)]


def todo():
    humos = {}
    for nombre, fn in CASAS:
        for noche in (False, True):
            hoja = Lienzo(W_ * 2, H_)
            for fr in range(2):
                c, h = fn(fr, noche)
                if noche:
                    c.im = a_noche(c.im)
                hoja.pegar(c, fr * W_, 0)
                humos[nombre] = h
            guardar(hoja, f"{nombre}{'_noche' if noche else ''}.png")
    with open(os.path.join(SRC_ISLA, "casas_top.json"), "w") as f:
        json.dump(humos, f)


if __name__ == "__main__":
    todo()
    print("casas top ok")
