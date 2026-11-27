"""Torre A (alta y angosta) de la Redacción. Parte 1: techo de cobre oxidado + cuarto del reloj (64 x 84)."""
import math
from gen_lib import *
from gen_redaccion2 import RAMPAS, tablones, pluma, haz
from gen_torre import reloj_limpio

W, H = 64, 84
CX = 32
VE = ["#35563a", "#4f9a7a", "#58cc9f", "#8fd2d2", "#c8ecdc"]   # cobre oxidado (oscuro -> claro)
D = RAMPAS["madD"]
L = RAMPAS["laton"]
G = RAMPAS["gris"]


def techo(l):
    top, bot = 14, 36
    for y in range(top, bot):
        t = (y - top) / (bot - top)
        half = 2 + t * 21
        xa, xb = round(CX - half), round(CX + half)
        fila = (y - top) // 3
        for x in range(xa, xb + 1):
            izq = x < CX
            r = [VE[1], VE[2], VE[3], VE[4]] if izq else [VE[0], VE[0], VE[1], VE[2]]
            off = 2 if fila % 2 else 0
            tx = (x - xa + off) % 5
            ty = (y - top) % 3
            c = r[3] if ty == 0 else (r[2] if ty == 1 else r[0])
            if tx == 0 and ty != 0:
                c = r[0]
            # borde redondeado de cada teja
            if ty == 2 and tx in (1, 2, 3):
                c = r[1]
            l.px(x, y, c)
        l.px(xa, y, VE[4]); l.px(xb, y, VE[0])
    for y in range(top, bot):
        l.px(CX, y, VE[4] if y % 2 else VE[3])
    # alero de piedra con friso de latón
    l.rect(CX - 25, bot, CX + 25, bot, G[3]); l.rect(CX - 25, bot + 1, CX + 25, bot + 1, G[2])
    l.rect(CX - 25, bot + 2, CX + 25, bot + 2, G[1]); l.rect(CX - 25, bot + 3, CX + 25, bot + 3, G[0])
    for x in range(CX - 23, CX + 24, 6):
        l.rect(x, bot + 4, x + 1, bot + 5, L[1]); l.px(x, bot + 4, L[3])
    # remate
    l.rect(CX - 2, top - 2, CX + 2, top, L[1]); l.rect(CX - 1, top - 3, CX + 1, top - 3, L[3]); l.px(CX - 1, top - 2, "#fffdf7")


def cuarto(l):
    x0, x1 = 14, 50
    y0, y1 = 42, 80
    tablones(l, x0, y0, x1, y1, "madD", 4, 3)
    # esquineros finos con tapa de latón
    for xx in (x0 - 1, x1 - 1):
        l.rect(xx, y0, xx + 2, y1, D[1]); l.rect(xx, y0, xx, y1, D[3]); l.rect(xx + 2, y0, xx + 2, y1, D[0])
    for xx in (x0 - 2, x1 - 2):
        l.rect(xx, y0, xx + 4, y0 + 1, L[2]); l.rect(xx, y0, xx + 4, y0, L[3])
        l.rect(xx, y1 - 1, xx + 4, y1, L[1]); l.rect(xx, y1, xx + 4, y1, L[0])
    # banda de latón con remaches al pie
    l.rect(x0 - 2, y1 + 1, x1 + 2, y1 + 4, L[1]); l.rect(x0 - 2, y1 + 1, x1 + 2, y1 + 1, L[3]); l.rect(x0 - 2, y1 + 4, x1 + 2, y1 + 4, L[0])
    for x in range(x0, x1 + 1, 5):
        l.px(x, y1 + 2, L[4]); l.px(x, y1 + 3, L[0])


def parte1(fr):
    c = Lienzo(W, H)
    techo(c)
    cuarto(c)
    haz(c, (10, 14, 54, 83), 3, ancho=5, paso=26, d=1)
    haz(c, (10, 14, 54, 83), 14, ancho=3, paso=26, d=-1)
    reloj_limpio(c, CX, 61)
    l = Lienzo(W, H + 14)
    l.pegar(c, 0, 14)
    pluma(l, CX, 14, fr)
    l.contorno(INK)
    return l


if __name__ == "__main__":
    hoja = Lienzo(W * 2, H + 14)
    for fr in range(2):
        hoja.pegar(parte1(fr), fr * W, 0)
    guardar(hoja, "torre2_parte1.png")
    print("ok")
