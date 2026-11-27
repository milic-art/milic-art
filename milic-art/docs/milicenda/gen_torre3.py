"""Torre A v3. Parte 1 estilizada: aguja con veleta, techo cóncavo limpio, cuarto de madera de 2 tonos, reloj chico integrado. 56 x 96."""
import math
from gen_lib import *
from gen_redaccion2 import RAMPAS

W, H = 56, 96
CX = 28
VE = ["#35563a", "#4f9a7a", "#58cc9f", "#8fd2d2", "#c8ecdc"]
M = ["#8f5a30", "#bf8444", "#e0b070", "#f2bd6e"]      # madera: solo 2 tonos + junta + luz
L = RAMPAS["laton"]
G = RAMPAS["gris"]


def techo(l):
    top, bot = 16, 44
    for y in range(top, bot):
        t = (y - top) / (bot - top)
        half = 1.2 + 17.5 * (t ** 1.55)             # perfil cóncavo (más estilizado)
        xa, xb = round(CX - half), round(CX + half)
        for x in range(xa, xb + 1):
            izq = x < CX
            c = VE[2] if izq else VE[1]
            # escamas muy sutiles: un solo tono más oscuro, 1 px cada 4
            fila = (y - top) // 3
            if (y - top) % 3 == 2 and (x - xa + (2 if fila % 2 else 0)) % 4 == 0:
                c = VE[1] if izq else VE[0]
            l.px(x, y, c)
        l.px(xa, y, VE[3]); l.px(xb, y, VE[0])
    for y in range(top, bot):
        l.px(CX, y, VE[3] if y % 2 else VE[2])      # arista
    # luz suave en la cara izquierda (franja, no escalones)
    for y in range(top + 6, bot - 2):
        t = (y - top) / (bot - top)
        xa = round(CX - (1.2 + 17.5 * (t ** 1.55)))
        l.px(xa + 2, y, VE[3]); l.px(xa + 3, y, VE[3]) if y % 2 else None
    # alero: piedra clara + sombra, sin ménsulas
    l.rect(CX - 21, bot, CX + 21, bot, G[3]); l.rect(CX - 21, bot + 1, CX + 21, bot + 1, G[2]); l.rect(CX - 21, bot + 2, CX + 21, bot + 2, G[1])
    # aguja: poste de latón, bola, travesaño y pluma montada
    l.line((CX, 6), (CX, top), L[1]); l.line((CX - 1, 6), (CX - 1, top), L[3])
    l.ellipse(CX, top - 1, 2, 2, L[2]); l.px(CX - 1, top - 2, "#fffdf7")
    l.line((CX - 4, 9), (CX + 4, 9), L[1])                       # travesaño
    # pluma pequeña inclinada, enganchada al poste
    plum = [(CX + 1, 1), (CX + 4, 2), (CX + 6, 5), (CX + 4, 8), (CX + 1, 9)]
    l.poly(plum, "#fffdf7")
    l.line((CX, 9), (CX + 5, 3), "#a8a08e")


def cuarto(l):
    x0, x1 = 17, 39
    y0, y1 = 48, 90
    # tablones finos: 2 tonos alternados, junta oscura, luz en el primero
    for k, x in enumerate(range(x0, x1 + 1, 3)):
        xe = min(x1, x + 2)
        l.rect(x, y0, xe, y1, M[1] if k % 2 else M[2])
        l.line((x, y0), (x, y1), M[0])
    l.rect(x0, y0, x0, y1, M[3])
    l.rect(x1 - 1, y0, x1, y1, M[0])           # sombra del lado derecho
    # cabezal y pie: bandas de latón finas
    l.rect(x0 - 2, y0 - 1, x1 + 2, y0 + 1, L[1]); l.rect(x0 - 2, y0 - 1, x1 + 2, y0 - 1, L[3]); l.rect(x0 - 2, y0 + 1, x1 + 2, y0 + 1, L[0])
    l.rect(x0 - 2, y1, x1 + 2, y1 + 2, L[1]); l.rect(x0 - 2, y1, x1 + 2, y1, L[3]); l.rect(x0 - 2, y1 + 2, x1 + 2, y1 + 2, L[0])


def reloj(l, cx, cy):
    """Reloj chico, aro de latón fino sobre una placa de piedra redonda que lo integra a la madera."""
    l.ellipse(cx, cy, 10.5, 10.5, INK)
    l.ellipse(cx, cy, 9.8, 9.8, G[1])
    l.ellipse(cx, cy, 8.8, 8.8, L[1])
    l.ellipse(cx - 0.5, cy - 0.5, 8.2, 8.2, L[2])
    l.ellipse(cx, cy, 7, 7, INK)
    l.ellipse(cx, cy, 6.4, 6.4, "#fbf3e4")
    l.ellipse(cx - 0.6, cy - 0.6, 5.6, 5.6, "#fffdf7")
    for h in range(12):
        a = math.radians(h * 30 - 90)
        r1 = 4.4 if h % 3 == 0 else 5.2
        for k in range(0, 5):
            r = r1 + (5.8 - r1) * k / 4
            l.px(round(cx + math.cos(a) * r), round(cy + math.sin(a) * r), INK)
    l.px(cx, cy, INK)


def parte1(fr):
    c = Lienzo(W, H)
    techo(c)
    cuarto(c)
    reloj(c, CX, 66)
    c.contorno(INK)
    return c


if __name__ == "__main__":
    hoja = Lienzo(W * 2, H)
    for fr in range(2):
        hoja.pegar(parte1(fr), fr * W, 0)
    guardar(hoja, "torre3_parte1.png")
    print("ok")
