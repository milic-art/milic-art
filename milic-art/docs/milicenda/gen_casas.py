"""Las 5 casitas de los lugares, cada una con su propia silueta (64x80, 2 cuadros, día y noche).
Redacción: torre alta con techo a dos aguas y reloj. Estudio: techo plano con terraza, toldo y post-its.
Taller: casa baja y ancha con galpón, toldo rayado y caballete. Laboratorio: torre con techo puntiagudo, caños y engranaje.
Casita: cabaña clásica con puerta redonda, chimenea y flores."""
from gen_lib import *

YB = 77
W_, H_ = 64, 80


class G:
    def __init__(s, wh):
        s.wh = wh
        s.lt = YB - 12 - wh
        s.bt = YB - wh

    def yl(s, x, yo):
        return s.lt + (x - 8) * 0.5 + yo

    def yr(s, x, yo):
        return s.bt - (x - 32) * 0.5 + yo


def rl(l, g, x0, x1, y0, y1, c):
    l.poly([(x0, g.yl(x0, y0)), (x1, g.yl(x1, y0)), (x1, g.yl(x1, y1)), (x0, g.yl(x0, y1))], c)


def rr(l, g, x0, x1, y0, y1, c):
    l.poly([(x0, g.yr(x0, y0)), (x1, g.yr(x1, y0)), (x1, g.yr(x1, y1)), (x0, g.yr(x0, y1))], c)


def pl(l, g, x, yo, c):
    l.px(x, g.yl(x, yo), c)


def pr(l, g, x, yo, c):
    l.px(x, g.yr(x, yo), c)


def paredes(l, g, wl, wr, zl, zr):
    l.poly([(8, g.lt), (32, g.bt), (32, YB), (8, YB - 12)], wl)
    l.poly([(32, g.bt), (56, g.lt), (56, YB - 12), (32, YB)], wr)
    # zócalo de piedra
    for x in range(8, 32):
        pl(l, g, x, g.wh - 3, "#a8a08e"); pl(l, g, x, g.wh - 2, "#77707c"); pl(l, g, x, g.wh - 1, "#77707c"); pl(l, g, x, g.wh, "#463f4a")
    for x in range(32, 56):
        pr(l, g, x, g.wh - 3, "#77707c"); pr(l, g, x, g.wh - 2, "#463f4a"); pr(l, g, x, g.wh - 1, "#463f4a"); pr(l, g, x, g.wh, "#35563a")
    # esquinas de madera
    rl(l, g, 8, 9, 0, g.wh, zl)
    rr(l, g, 54, 56, 0, g.wh, zr)


def ventana_l(l, g, x0, x1, y0, y1, noche, marco="#5f3a24", cortina=None):
    rl(l, g, x0, x1, y0, y1, marco)
    rl(l, g, x0 + 1, x1 - 1, y0 + 1, y1 - 1, "#ffd36b" if noche else "#a8cdf2")
    if noche:
        rl(l, g, x0 + 2, x1 - 2, y0 + 2, y1 - 2, "#fff1a8")
    else:
        pl(l, g, x0 + 1, y0 + 1, "#ffffff")
    if cortina:
        rl(l, g, x0 + 1, x0 + 1, y0 + 1, y1 - 1, cortina)


def ventana_r(l, g, x0, x1, y0, y1, noche, marco="#5f3a24", cortina=None):
    rr(l, g, x0, x1, y0, y1, marco)
    rr(l, g, x0 + 1, x1 - 1, y0 + 1, y1 - 1, "#ffd36b" if noche else "#a8cdf2")
    xm = (x0 + x1) // 2
    rr(l, g, xm, xm, y0 + 1, y1 - 1, marco)
    if noche:
        rr(l, g, x0 + 1, xm - 1, y0 + 2, y1 - 2, "#fff1a8")
    else:
        pr(l, g, x0 + 1, y0 + 1, "#ffffff")
    if cortina:
        rr(l, g, x0 + 1, x0 + 1, y0 + 1, y1 - 1, cortina)
        rr(l, g, x1 - 1, x1 - 1, y0 + 1, y1 - 1, cortina)


def puerta(l, g, x0, x1, alto, color, marco="#5f3a24"):
    y1 = g.wh - 4
    y0 = y1 - alto
    rl(l, g, x0, x1, y0, y1, marco)
    rl(l, g, x0 + 1, x1 - 1, y0 + 1, y1, color)
    pl(l, g, x1 - 2, y0 + alto // 2, "#f2c230")


def techo_hip(l, g, apex_h, c_l="#e8874a", c_r="#b84a2c", filas=3):
    A = (32, g.lt - apex_h)
    Lh, Bh, Rh = (3, g.lt + 2), (32, g.bt + 5), (61, g.lt + 2)
    l.poly([A, Lh, Bh], c_l)
    l.poly([A, Bh, Rh], c_r)
    for k in range(1, filas + 1):
        t = k / (filas + 1)
        l.line((A[0] + (Lh[0] - A[0]) * t, A[1] + (Lh[1] - A[1]) * t), (A[0] + (Bh[0] - A[0]) * t, A[1] + (Bh[1] - A[1]) * t), "#b84a2c")
        l.line((A[0] + (Bh[0] - A[0]) * t, A[1] + (Bh[1] - A[1]) * t), (A[0] + (Rh[0] - A[0]) * t, A[1] + (Rh[1] - A[1]) * t), "#7a2e26")
    l.line((A[0], A[1] + 2), (Lh[0] + 4, Lh[1] - 3), "#f4b183")
    l.line((A[0] - 1, A[1] + 3), (Lh[0] + 6, Lh[1] - 4), "#f4b183")
    l.line(Lh, Bh, "#7a2e26"); l.line(Bh, Rh, "#5a3322"); l.line(A, Bh, "#7a2e26")
    l.line(Lh, Bh, INK); l.line(Bh, Rh, INK); l.line(A, Lh, INK); l.line(A, Rh, INK)
    return A


def techo_dos_aguas(l, g, gh):
    """Frente de la pared izquierda en triángulo; el techo baja hacia la derecha."""
    M = (20, (g.lt + g.bt) / 2 - gh)
    E = (44, M[1] - 12)
    Be = (33, g.bt + 4)
    Re = (60, g.lt + 3)
    # triángulo del hastial (pared)
    l.poly([(8, g.lt), (32, g.bt), M], "#a8cdf2")
    # faldón del techo
    l.poly([M, E, Re, Be], "#b84a2c")
    for t in (0.3, 0.55, 0.8):
        l.line((M[0] + (Be[0] - M[0]) * t, M[1] + (Be[1] - M[1]) * t), (E[0] + (Re[0] - E[0]) * t, E[1] + (Re[1] - E[1]) * t), "#7a2e26")
    l.line(M, E, "#e8874a"); l.line((M[0], M[1] + 1), (E[0], E[1] + 1), "#e8874a")
    # cornisa del frente (aleros del hastial)
    l.line((5, g.lt + 3), M, "#e8874a"); l.line((6, g.lt + 4), (M[0], M[1] + 1), "#b84a2c")
    l.line(M, Be, "#e8874a"); l.line((Be[0] - 1, Be[1] + 1), (M[0], M[1] + 1), "#b84a2c")
    l.line((5, g.lt + 3), (32, g.bt + 4), "#7a2e26")
    l.line((5, g.lt + 3), M, INK); l.line(M, E, INK); l.line(E, Re, INK); l.line(Re, Be, INK); l.line(M, Be, INK)
    return M


def chimenea(l, x, y, h=10):
    l.rect(x, y, x + 5, y + h, "#b84a2c")
    l.rect(x + 3, y, x + 5, y + h, "#7a2e26")
    l.rect(x - 1, y - 2, x + 6, y, "#5a3322")
    l.px(x + 1, y + 3, "#e8874a"); l.px(x + 1, y + 7, "#e8874a")


def toldo_r(l, g, x0, x1, y0, c1, c2):
    for x in range(x0, x1 + 1):
        c = c1 if ((x - x0) // 2) % 2 == 0 else c2
        for yo in range(y0, y0 + 3):
            pr(l, g, x, yo, c)
        pr(l, g, x, y0 + 3, c if (x % 2) else "#5a3322")


def toldo_l(l, g, x0, x1, y0, c1, c2):
    for x in range(x0, x1 + 1):
        c = c1 if ((x - x0) // 2) % 2 == 0 else c2
        for yo in range(y0, y0 + 3):
            pl(l, g, x, yo, c)
        pl(l, g, x, y0 + 3, c if (x % 2) else "#5a3322")


# ------------------------------------------------------------------ cada casa
def redaccion(fr, noche):
    l = Lienzo(W_, H_)
    g = G(22)
    paredes(l, g, "#a8cdf2", "#6a8fd0" if False else "#4f7fd0", "#5f3a24", "#463f4a")
    # ladrillos en la pared derecha
    for yo in range(2, g.wh - 3, 3):
        for x in range(33, 54, 4):
            pr(l, g, x + (yo // 3 % 2) * 2, yo, "#2a4a8a" if False else "#8a5fc0")
    puerta(l, g, 13, 21, 11, "#7a2e26")
    # cartel "NOTICIAS" arriba de la puerta
    rl(l, g, 11, 23, 2, 7, "#5f3a24"); rl(l, g, 12, 22, 3, 6, "#fffdf7")
    for x in (13, 15, 17, 19, 21):
        pl(l, g, x, 4, "#463f4a")
    pl(l, g, 14, 5, "#c94b64"); pl(l, g, 18, 5, "#463f4a")
    ventana_l(l, g, 24, 30, 6, 13, noche, cortina="#f092a4")
    ventana_r(l, g, 37, 49, 5, 12, noche, cortina="#f4b183")
    ventana_r(l, g, 37, 49, 14, 18, noche) if False else None
    M = techo_dos_aguas(l, g, 11)
    # reloj en el hastial
    cx, cy = 20, int(M[1]) + 10
    l.ellipse(cx, cy, 4, 4, "#5f3a24"); l.ellipse(cx, cy, 3, 3, "#fffdf7")
    l.px(cx, cy, INK); l.px(cx, cy - 2, INK); l.px(cx + (1 if fr else 2), cy, INK) if True else None
    chimenea(l, 46, int(M[1]) - 3, 11)
    # papelitos que vuelan
    py = 30 - fr * 2
    l.rect(4, py, 6, py + 1, "#fffdf7"); l.px(5, py, "#c2e0d8")
    l.rect(10, py - 8 + fr, 12, py - 7 + fr, "#fffdf7")
    # buzón
    l.rect(2, 66, 6, 69, "#4f7fd0"); l.px(3, 67, "#a8cdf2"); l.line((4, 70), (4, 74), "#5f3a24")
    # pila de diarios
    l.rect(24, 72, 30, 73, "#fffdf7"); l.rect(25, 70, 31, 71, "#fbf3e4"); l.px(27, 71, "#463f4a")
    l.contorno(INK)
    return l


def estudio(fr, noche):
    l = Lienzo(W_, H_)
    g = G(19)
    paredes(l, g, "#c3a2e6", "#8a5fc0", "#5f3a24", "#463f4a")
    # post-its en la pared izquierda
    for (x, yo, c) in ((24, 5, "#f9e07a"), (27, 5, "#f092a4"), (30, 6, "#58cc9f"), (25, 9, "#f4b183"), (28, 9, "#f9e07a")):
        rl(l, g, x, x + 1, yo, yo + 2, c)
    puerta(l, g, 12, 20, 10, "#f2c230")
    # ventanal grande en la pared derecha con toldo rayado
    ventana_r(l, g, 37, 51, 7, 14, noche)
    toldo_r(l, g, 35, 53, 3, "#e8874a", "#fffdf7")
    # techo plano con parapeto
    Lt, Bt, Rt, Tt = (8, g.lt), (32, g.bt), (56, g.lt), (32, g.bt - 12)
    up = 3
    l.poly([(8, g.lt - up), (32, g.bt - up), (32, g.bt), (8, g.lt)], "#e8874a")
    l.poly([(32, g.bt - up), (56, g.lt - up), (56, g.lt), (32, g.bt)], "#b84a2c")
    l.poly([(8, g.lt - up), (32, g.bt - up - 12), (56, g.lt - up), (32, g.bt - up)], "#d99a1c" if False else "#bf8444")
    l.poly([(10, g.lt - up), (32, g.bt - up - 10), (54, g.lt - up), (32, g.bt - up - 1)], "#e0b070")
    # tragaluz de vidrio
    l.poly([(26, g.lt - 9), (34, g.lt - 13), (42, g.lt - 9), (34, g.lt - 5)], "#c2e0d8")
    l.poly([(28, g.lt - 9), (34, g.lt - 12), (40, g.lt - 9), (34, g.lt - 6)], "#a8cdf2")
    l.line((34, g.lt - 12), (34, g.lt - 6), "#5f3a24")
    # macetas y pérgola en la terraza
    for (x, y) in ((14, g.lt - 6), (46, g.lt - 6)):
        l.rect(x, y, x + 3, y + 2, "#b84a2c"); l.rect(x, y - 3, x + 3, y - 1, "#587a35"); l.px(x + 1, y - 4, "#f092a4"); l.px(x + 2, y - 3, "#fffdf7")
    # lamparita que titila en un poste
    l.line((9, g.lt - 6), (9, g.lt - 14), "#5f3a24")
    l.rect(7, g.lt - 18, 11, g.lt - 15, "#ffd36b" if noche else ("#f9e07a" if fr == 0 else "#fffdf7"))
    l.px(9, g.lt - 19, "#fff1a8" if noche else "#fffdf7")
    if fr == 1:
        l.px(6, g.lt - 17, "#f9e07a"); l.px(12, g.lt - 17, "#f9e07a")
    # antena con banderín
    l.line((54, g.lt - 4), (54, g.lt - 16), "#463f4a")
    l.rect(55, g.lt - 16, 58 + fr, g.lt - 14, "#c94b64")
    # maceta en la entrada
    l.rect(2, 70, 6, 73, "#b84a2c"); l.px(3, 69, "#587a35"); l.px(4, 68, "#8aa23a"); l.px(5, 69, "#587a35"); l.px(4, 67, "#f092a4")
    l.contorno(INK)
    return l


def taller(fr, noche):
    l = Lienzo(W_, H_)
    g = G(16)
    paredes(l, g, "#f092a4", "#c94b64", "#8f5a30", "#5f3a24")
    # portón grande de galpón (abierto) en la pared izquierda
    rl(l, g, 11, 25, 1, g.wh - 3, "#5f3a24")
    rl(l, g, 12, 24, 2, g.wh - 3, "#2e1b14" if False else "#463f4a")
    rl(l, g, 12, 14, 2, g.wh - 3, "#bf8444"); rl(l, g, 22, 24, 2, g.wh - 3, "#bf8444")
    # cuadro en el fondo del galpón
    rl(l, g, 16, 20, 3, 7, "#fffdf7"); pl(l, g, 17, 4, "#58cc9f"); pl(l, g, 18, 5, "#f9e07a")
    ventana_r(l, g, 38, 50, 3, 9, noche, cortina="#fffdf7")
    # marcos colgados en la pared derecha
    # techo bajo y ancho con claraboya
    A = techo_hip(l, g, 11, "#e8874a", "#b84a2c", 2)
    l.poly([(26, 22), (31, 25), (36, 22), (31, 19)], "#c2e0d8")
    l.line((31, 19), (31, 25), "#5f3a24")
    # cartel colgante con paleta
    l.line((48, g.lt - 4), (48, g.lt + 8), "#5f3a24")
    l.ellipse(48, g.lt + 12, 4, 3, "#e0b070"); l.px(46, g.lt + 11, "#c94b64"); l.px(48, g.lt + 10, "#4f7fd0"); l.px(50, g.lt + 11, "#58cc9f"); l.px(47, g.lt + 13, "#f2c230")
    # toldo rayado sobre el portón
    toldo_l(l, g, 9, 27, 0, "#fffdf7", "#c94b64")
    # caballete frente al portón con lienzo que se va pintando
    l.line((4, 77), (8, 62), "#8f5a30"); l.line((14, 77), (10, 62), "#8f5a30"); l.line((9, 62), (9, 77), "#5f3a24")
    l.rect(3, 55, 14, 63, "#fffdf7")
    l.rect(4, 56, 6 + fr * 4, 58, "#f092a4"); l.rect(4, 59, 9, 61, "#58cc9f")
    if fr:
        l.rect(10, 56, 12, 57, "#f9e07a")
    l.rect(3, 55, 14, 55, "#d6cbb0")
    # latas de pintura
    for (x, c) in ((46, "#4f7fd0"), (50, "#f2c230"), (54, "#58cc9f")):
        l.rect(x, 73, x + 2, 75, c); l.rect(x, 73, x + 2, 73, "#fffdf7")
    l.px(40, 72, "#f092a4"); l.px(35, 74, "#f9e07a")
    l.contorno(INK)
    return l


def laboratorio(fr, noche):
    l = Lienzo(W_, H_)
    g = G(22)
    paredes(l, g, "#b2f0cc", "#2c9488", "#1b5f66", "#1b5f66")
    puerta(l, g, 13, 21, 10, "#c94b64" if False else "#8a5fc0")
    # ojo de buey
    rl(l, g, 24, 30, 3, 9, "#463f4a"); l.ellipse(27, g.yl(27, 6), 3, 3, "#ffd36b" if noche else "#a8cdf2")
    l.px(26, g.yl(26, 5), "#fff1a8" if noche else "#ffffff")
    # caños con válvula en la pared derecha
    rr(l, g, 36, 38, 0, g.wh - 3, "#a8a08e"); rr(l, g, 37, 38, 0, g.wh - 3, "#77707c")
    rr(l, g, 36, 52, 9, 11, "#a8a08e"); rr(l, g, 36, 52, 10, 11, "#77707c")
    l.ellipse(44, g.yr(44, 6), 2, 2, "#c94b64")
    ventana_r(l, g, 46, 54, 3, 8, noche)
    # techo puntiagudo naranja
    A = techo_hip(l, g, 30, "#e8874a", "#b84a2c", 5)
    # engranaje en la punta que gira
    gx, gy = 32, A[1] - 5
    l.ellipse(gx, gy, 3, 3, "#d99a1c"); l.px(gx, gy, "#5a3322")
    ds = [(0, -4), (0, 4), (-4, 0), (4, 0)] if fr == 0 else [(3, -3), (-3, 3), (-3, -3), (3, 3)]
    for dx, dy in ds:
        l.px(gx + dx, gy + dy, "#d99a1c")
    # ventana redonda en el techo
    l.ellipse(26, g.lt - 4, 3, 3, "#5f3a24"); l.ellipse(26, g.lt - 4, 2, 2, "#ffd36b" if noche else "#58cc9f")
    # chimenea de vapor
    l.rect(46, g.lt - 12, 49, g.lt - 2, "#77707c"); l.rect(46, g.lt - 12, 47, g.lt - 2, "#a8a08e"); l.rect(45, g.lt - 14, 50, g.lt - 12, "#463f4a")
    for k, (bx, by) in enumerate(((47, -18), (49, -23), (46, -27))):
        l.px(bx + (fr if k % 2 else -fr), g.lt + by + fr * -1, "#effbe6" if k != 1 else "#b2f0cc")
    # matraz y mesa
    l.rect(4, 72, 8, 75, "#58cc9f"); l.rect(5, 69, 7, 71, "#c2e0d8"); l.px(4, 72, "#b2f0cc")
    l.rect(10, 74, 12, 75, "#8a5fc0"); l.px(11, 73 - fr, "#c3a2e6")
    # tanque de burbujas
    l.rect(48, 66, 54, 75, "#2c9488"); l.rect(49, 67, 53, 74, "#58cc9f"); l.px(50, 72 - fr * 2, "#effbe6"); l.px(52, 69 + fr, "#effbe6")
    l.contorno(INK)
    return l


def casita(fr, noche):
    l = Lienzo(W_, H_)
    g = G(20)
    paredes(l, g, "#fbf3e4", "#e0b070", "#bf8444", "#8f5a30")
    # entramado de madera
    for x in (18, 26):
        rl(l, g, x, x, 0, g.wh - 4, "#bf8444")
    for x in (40, 48):
        rr(l, g, x, x, 0, g.wh - 4, "#8f5a30")
    # puerta redonda amarilla con escalón
    rl(l, g, 12, 20, 5, g.wh - 3, "#5f3a24"); rl(l, g, 13, 19, 6, g.wh - 3, "#f2c230")
    for x in (13, 14):
        rl(l, g, x, x, 7, g.wh - 3, "#f9e07a")
    rl(l, g, 12, 20, 5, 6, "#5f3a24")
    pl(l, g, 18, 10, "#8f5a30")
    l.rect(11, 77 - 3, 22, 77 - 2, "#a8a08e") if False else None
    ventana_l(l, g, 24, 30, 6, 12, noche, cortina="#f092a4")
    ventana_r(l, g, 37, 49, 5, 11, noche, cortina="#f092a4")
    # cajón de flores
    rr(l, g, 37, 49, 11, 13, "#8f5a30")
    for k, c in zip(range(38, 49, 2), ("#f092a4", "#fffdf7", "#f9e07a", "#f092a4", "#c3a2e6", "#fffdf7")):
        pr(l, g, k, 10, c); pr(l, g, k + 1, 10, "#587a35")
    techo_hip(l, g, 19)
    chimenea(l, 42, g.lt - 12, 11)
    # corazón en el techo
    for (x, y) in ((26, g.lt - 6), (28, g.lt - 6), (25, g.lt - 5), (26, g.lt - 5), (27, g.lt - 5), (28, g.lt - 5), (29, g.lt - 5), (26, g.lt - 4), (27, g.lt - 4), (28, g.lt - 4), (27, g.lt - 3)):
        l.px(x, y, "#c94b64")
    # girasoles y flores
    for (x, y) in ((4, 66), (56, 70)):
        l.line((x, y + 2), (x, y + 9), "#587a35")
        l.rect(x - 1, y - 1, x + 1, y + 1, "#f2c230"); l.px(x, y, "#5a3322")
        l.px(x + (fr or -1), y - 2, "#f2c230")
    for (x, y, c) in ((24, 73, "#f092a4"), (27, 74, "#fffdf7"), (30, 73, "#c3a2e6")):
        l.px(x, y, c); l.px(x, y + 1, "#587a35")
    # cuenco de Clocky
    l.rect(8, 74, 12, 75, "#c94b64"); l.px(9, 73, "#f9e07a")
    l.contorno(INK)
    return l


CASAS = [("casa_redaccion", redaccion), ("casa_estudio", estudio), ("casa_taller", taller), ("casa_laboratorio", laboratorio), ("casa_casita", casita)]


def todo():
    for nombre, fn in CASAS:
        for noche in (False, True):
            hoja = Lienzo(W_ * 2, H_)
            for fr in range(2):
                c = fn(fr, noche)
                if noche:
                    c.im = a_noche(c.im)
                hoja.pegar(c, fr * W_, 0)
            guardar(hoja, f"{nombre}{'_noche' if noche else ''}.png")


if __name__ == "__main__":
    todo()
    print("casas ok")
