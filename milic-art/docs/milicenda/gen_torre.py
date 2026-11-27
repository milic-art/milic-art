"""Torre de la Redacción, parte por parte. Parte 1: techo + cuarto del reloj (96x92)."""
import math, random
from gen_lib import *
from gen_redaccion2 import RAMPAS, mover, tablones, pluma, tono, haz

W, H = 96, 92
CX = 48
D = RAMPAS["madD"]


def techo(l, fr):
    """Pirámide en 3/4: cara izquierda iluminada, cara derecha en sombra, tejas escalonadas con borde claro y sombra debajo."""
    top, bot = 16, 52
    alto = bot - top
    for y in range(top, bot):
        t = (y - top) / alto
        half = 3 + t * 31
        xa, xb = round(CX - half), round(CX + half)
        fila = (y - top) // 4
        for x in range(xa, xb + 1):
            izq = x < CX
            rampa = [D[1], D[2], D[3], D[4]] if izq else [D[0], D[0], D[1], D[2]]
            # teja: ancho 7, desfasada por fila
            off = 3 if fila % 2 else 0
            tx = (x - xa + off) % 7
            ty = (y - top) % 4
            if ty == 0:
                c = rampa[3] if izq else rampa[3]      # filo claro de la hilera
            elif ty == 3:
                c = rampa[0]                              # sombra bajo la hilera
            else:
                c = rampa[2] if ty == 1 else rampa[1]
            if tx == 0 and ty != 0:
                c = rampa[0]                              # junta entre tejas
            if tx == 1 and ty in (1, 2) and izq:
                c = rampa[3]                              # brillo de la teja
            l.px(x, y, c)
        l.px(xa, y, D[4] if y % 2 else D[3]); l.px(xb, y, D[0])
    # arista central
    for y in range(top, bot):
        l.px(CX, y, D[4] if y % 3 else D[3])
    # remate de la punta
    l.rect(CX - 2, top - 2, CX + 2, top, RAMPAS["laton"][1]); l.rect(CX - 1, top - 3, CX + 1, top - 3, RAMPAS["laton"][3])
    l.px(CX - 1, top - 2, "#fffdf7")
    # cornisa en tres capas con ménsulas y gotas
    for yy, cc in ((bot, D[4]), (bot + 1, D[3]), (bot + 2, D[2]), (bot + 3, D[1]), (bot + 4, D[0])):
        l.rect(CX - 37, yy, CX + 37, yy, cc)
    for x in range(CX - 35, CX + 36, 5):
        l.rect(x, bot + 5, x + 2, bot + 8, D[2]); l.rect(x, bot + 5, x, bot + 8, D[3]); l.rect(x + 2, bot + 5, x + 2, bot + 8, D[0])
        l.px(x + 1, bot + 9, D[0])


def cuarto(l, fr):
    x0, x1 = 12, 83
    y0, y1 = 64, 91
    tablones(l, x0 + 4, y0, x1 - 4, y1, "madR", 4, 2)
    R = RAMPAS["madR"]
    # pilastras de esquina con capitel y base
    for xx in (x0 + 1, x1 - 6):
        l.rect(xx, y0, xx + 5, y1, D[1])
        l.rect(xx, y0, xx + 1, y1, D[3]); l.rect(xx + 4, y0, xx + 5, y1, D[0])
        l.rect(xx - 1, y0, xx + 6, y0 + 2, D[2]); l.rect(xx - 1, y0, xx + 6, y0, D[4])
        l.rect(xx - 1, y1 - 2, xx + 6, y1, D[2]); l.rect(xx - 1, y1, xx + 6, y1, D[0])
    # ventanas laterales cálidas con marco y alféizar
    for wx in (21, 66):
        l.rect(wx, 69, wx + 8, 85, INK)
        l.rect(wx + 1, 70, wx + 7, 84, D[1])
        l.rect(wx + 2, 71, wx + 6, 83, "#f9e07a")
        l.rect(wx + 2, 71, wx + 3, 83, "#fffdf7")
        l.line((wx + 4, 71), (wx + 4, 83), D[1]); l.line((wx + 2, 77), (wx + 6, 77), D[1])
        l.rect(wx - 1, 85, wx + 9, 86, D[3]); l.rect(wx - 1, 86, wx + 9, 86, D[0])
        l.rect(wx - 1, 67, wx + 9, 68, D[3]); l.rect(wx - 1, 68, wx + 9, 68, D[1])
    # friso oscuro bajo la cornisa
    l.rect(x0, 61, x1, 63, D[1]); l.rect(x0, 61, x1, 61, D[3]); l.rect(x0, 63, x1, 63, D[0])


def reloj_limpio(l, cx, cy):
    L = RAMPAS["laton"]
    l.ellipse(cx, cy, 14, 14, INK)
    l.ellipse(cx, cy, 13.3, 13.3, L[1])
    l.ellipse(cx - 0.8, cy - 0.8, 12.4, 12.4, L[2])
    l.ellipse(cx - 1.4, cy - 1.4, 11, 11, L[3])
    l.ellipse(cx + 0.9, cy + 0.9, 10.6, 10.6, L[1])
    l.ellipse(cx, cy, 10.4, 10.4, L[0])
    l.ellipse(cx, cy, 9.6, 9.6, "#fbf3e4")
    l.ellipse(cx - 0.8, cy - 0.8, 8.6, 8.6, "#fffdf7")
    for a in range(200, 290, 5):   # sombra interna arriba-izquierda
        l.px(round(cx + math.cos(math.radians(a)) * 8.6), round(cy + math.sin(math.radians(a)) * 8.6), "#d6cbb0")
    for h in range(12):
        a = math.radians(h * 30 - 90)
        r1, r2 = (6.2, 8.4) if h % 3 == 0 else (7.4, 8.4)
        pts = set()
        for k in range(0, 11):
            r = r1 + (r2 - r1) * k / 10
            pts.add((round(cx + math.cos(a) * r), round(cy + math.sin(a) * r)))
        for p in pts:
            l.px(p[0], p[1], INK)
    for a in (45, 135, 225, 315):  # remaches del bisel
        l.px(round(cx + math.cos(math.radians(a)) * 12), round(cy + math.sin(math.radians(a)) * 12), L[4])
    l.px(cx, cy, INK)


def parte1(fr):
    c = Lienzo(W, H)
    techo(c, fr)
    cuarto(c, fr)
    haz(c, (10, 16, 86, 91), 4, ancho=6, paso=30, d=1)
    haz(c, (10, 16, 86, 91), 17, ancho=4, paso=30, d=-1)
    reloj_limpio(c, CX, 77)
    l = Lienzo(W, H + 14)
    l.pegar(c, 0, 14)
    pluma(l, CX, 14, fr)
    l.contorno(INK)
    return l


if __name__ == "__main__":
    hoja = Lienzo(W * 2, H + 14)
    for fr in range(2):
        hoja.pegar(parte1(fr), fr * W, 0)
    guardar(hoja, "torre_parte1.png")
    print("ok")
