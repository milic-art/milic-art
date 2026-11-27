"""Redacción (periodismo): torre sola con reloj + edificio chico con sótano de engranajes.
96x124, puerta (base) en la fila 104, centro de la puerta x=48. 2 cuadros. Solo día por ahora (noche automática)."""
import math
from gen_lib import *

W, H, YB = 96, 124, 104
GR0, GR1, GR2, GR3 = "#463f4a", "#77707c", "#a8a08e", "#d6cbb0"  # grafito oscuro, medio, claro, piedra clara
CR0, CR1 = "#fbf3e4", "#fffdf7"
LATON = ["#5f3a24", "#8f5a30", "#bf8444", "#e0b070"]
ORO = ["#8f5a30", "#d99a1c", "#f2c230", "#f9e07a"]
COBRE = ["#7a2e26", "#b96d32", "#dc9544", "#f2bd6e"]


def engranaje(l, cx, cy, r, fr, sentido=1, dientes=8, cuerpo=ORO):
    """Engranaje con dientes cuadrados con contorno; gira media vuelta de diente entre cuadros."""
    paso = 2 * math.pi / dientes
    off = (paso / 2) * fr * sentido
    pts = [(cx + math.cos(k * paso + off) * (r + 1.3), cy + math.sin(k * paso + off) * (r + 1.3)) for k in range(dientes)]
    for x, y in pts:  # contorno de los dientes
        l.rect(round(x) - 1, round(y) - 1, round(x) + 1, round(y) + 1, INK)
    l.ellipse(cx, cy, r + 1.1, r + 1.1, INK)
    for x, y in pts:  # dientes
        l.rect(round(x) - 1 + 1 if False else round(x) - 1, round(y) - 1, round(x), round(y), cuerpo[1])
    l.ellipse(cx, cy, r + 0.2, r + 0.2, cuerpo[1])
    l.ellipse(cx - 0.4, cy - 0.4, max(1.2, r - 1.2), max(1.2, r - 1.2), cuerpo[2])
    l.px(round(cx - r * 0.5), round(cy - r * 0.5), cuerpo[3])
    if r >= 4:
        for k in range(3):  # rayos
            a = k * 2 * math.pi / 3 + off * 0.6 + 0.5
            l.line((cx, cy), (round(cx + math.cos(a) * (r - 1.2)), round(cy + math.sin(a) * (r - 1.2))), cuerpo[0])
    l.ellipse(cx, cy, 1.2, 1.2, INK)
    l.px(cx, cy, cuerpo[3])


def reloj(l, cx, cy):
    # marco de latón con luz arriba-izquierda
    l.ellipse(cx, cy, 10.5, 10.5, INK)
    l.ellipse(cx, cy, 9.6, 9.6, LATON[1])
    l.ellipse(cx - 0.6, cy - 0.6, 9, 9, LATON[2])
    l.ellipse(cx - 1, cy - 1, 7.6, 7.6, LATON[3])
    l.ellipse(cx + 0.4, cy + 0.4, 7.9, 7.9, LATON[1])
    l.ellipse(cx, cy, 7.4, 7.4, CR1)
    l.ellipse(cx, cy, 7.4, 7.4, CR0)
    l.ellipse(cx - 1, cy - 1, 6, 6, CR1)
    # sombra interna
    for a in range(200, 330, 6):
        l.px(round(cx + math.cos(math.radians(a)) * 6.6) , round(cy + math.sin(math.radians(a)) * 6.6), GR3)
    # marcas de las horas
    for h in range(12):
        a = math.radians(h * 30 - 90)
        r1 = 5.2 if h % 3 else 4.6
        x1, y1 = round(cx + math.cos(a) * r1), round(cy + math.sin(a) * r1)
        x2, y2 = round(cx + math.cos(a) * 6.4), round(cy + math.sin(a) * 6.4)
        l.line((x1, y1), (x2, y2), INK)
    # remaches del marco
    for a in (45, 135, 225, 315):
        l.px(round(cx + math.cos(math.radians(a)) * 9.2), round(cy + math.sin(math.radians(a)) * 9.2), LATON[0])
    l.px(cx, cy, INK)


def pluma(l, x, y, fr):
    """Veleta con forma de pluma."""
    l.line((x, y + 8), (x, y + 2), INK2)
    l.line((x + 1, y + 8), (x + 1, y + 3), LATON[1])
    # pluma inclinada (cambia 1 px entre cuadros)
    s = fr
    cuerpo = [(x - 1 + s, y - 6), (x + s, y - 7), (x + 2 + s, y - 6), (x + 3 + s, y - 4), (x + 3 + s, y - 2), (x + 2 + s, y), (x + 1, y + 1), (x, y + 1), (x - 1, y - 1), (x - 2 + s, y - 3), (x - 2 + s, y - 5)]
    l.poly(cuerpo, CR1)
    l.line((x + s, y - 6), (x, y + 1), COBRE[1])  # raquis
    for k in range(4):
        l.px(x + 2 + s - (k // 2), y - 5 + k, GR3)
    l.px(x + s, y - 7, INK)


def farol(l, x, y):
    Y = 128 if y > 100 else YB
    l.line((x, y), (x, Y - 1), INK)
    l.rect(x - 2, y - 5, x + 2, y - 1, INK)
    l.rect(x - 1, y - 4, x + 1, y - 2, ORO[3])
    l.px(x - 1, y - 4, CR1)
    l.rect(x - 2, y - 6, x + 2, y - 6, GR1)
    l.px(x, y - 7, INK)
    l.rect(x - 1, Y - 3, x + 1, Y - 1, GR1)


def torre_vieja_placeholder(l, fr):
    pass


def edificio_chico(l, fr):
    # cuerpo crema moderno con ventanal y toldo
    l.rect(66, 72, 92, YB - 1, CR0)
    l.rect(89, 72, 92, YB - 1, GR3)
    l.rect(66, 72, 67, YB - 1, CR1)
    l.rect(65, 98, 93, YB - 1, GR0); l.rect(65, 98, 93, 98, GR1)
    # techo plano con parapeto y filo naranja
    l.rect(64, 66, 94, 71, GR0)
    l.rect(64, 66, 94, 66, GR2)
    l.rect(64, 70, 94, 70, "#e8874a"); l.rect(64, 71, 94, 71, "#b84a2c")
    l.rect(66, 67, 92, 69, GR1)
    for x in range(68, 92, 6):
        l.rect(x, 67, x + 2, 69, GR0)
    # ventanal
    l.rect(69, 80, 83, 96, GR0)
    l.rect(70, 81, 82, 95, "#a8cdf2")
    l.rect(70, 81, 82, 83, "#c8ecdc")
    l.line((76, 81), (76, 95), GR0); l.line((70, 88), (82, 88), GR0)
    for k in range(3):
        l.px(71 + k, 82 + k, CR1); l.px(77 + k, 82 + k, CR1)
    l.rect(69, 96, 83, 97, GR2)
    # toldo naranja a rayas
    for i, x in enumerate(range(68, 85)):
        c = "#e8874a" if (i // 2) % 2 == 0 else CR1
        l.line((x, 74), (x, 79), c)
        l.px(x, 79 if i % 2 == 0 else 80, c)
    l.rect(68, 74, 84, 74, "#b84a2c"); l.rect(68, 80, 84, 80, "#7a2e26") if False else None
    # puerta chica con vidrio
    l.rect(85, 86, 90, YB - 1, INK)
    l.rect(86, 87, 89, YB - 1, GR1)
    l.rect(86, 88, 89, 93, "#a8cdf2"); l.px(86, 88, CR1)
    l.px(88, 99, ORO[2])
    # tubería de cobre hacia la torre
    l.line((59, 82), (65, 82), COBRE[1]); l.line((59, 83), (65, 83), COBRE[2]); l.line((59, 81), (65, 81), COBRE[0])
    for x in (61, 64):
        l.line((x, 80), (x, 84), COBRE[0])
    # chimenea de cobre con tapa de latón
    l.rect(86, 54, 90, 65, COBRE[1]); l.rect(86, 54, 87, 65, COBRE[2]); l.rect(90, 54, 90, 65, COBRE[0])
    l.rect(85, 52, 91, 54, LATON[1]); l.rect(85, 52, 91, 52, LATON[3])
    for y in (58, 62):
        l.line((86, y), (90, y), COBRE[0])
    # mástil con bandera
    l.line((70, 56), (70, 66), INK2)
    l.px(70, 55, ORO[2])
    w = [0, 1][fr]
    l.poly([(71, 56), (78, 57 + w), (76, 59), (78, 61 - w), (71, 61)], "#c94b64")
    l.line((71, 56), (77, 57 + w), "#f092a4")
    l.px(73, 58, CR1); l.px(74, 59, CR1)


def sotano(l, fr):
    """Patio inglés: el edificio sigue hacia abajo, con engranajes y tuberías."""
    x0, x1, y0, y1 = 64, 94, YB, YB + 17
    # borde de piedra
    l.rect(x0, y0, x1, y0 + 1, GR3); l.rect(x0, y0 + 1, x1, y0 + 1, GR2)
    # pared del sótano (continúa la fachada) y vacío oscuro
    l.rect(x0 + 1, y0 + 2, x1 - 1, y1, GR0)
    l.rect(x0 + 1, y0 + 2, x1 - 1, y0 + 3, "#2e1b14")
    # ladrillos/paneles
    for y in range(y0 + 5, y1, 4):
        for x in range(x0 + 2, x1 - 1, 2):
            l.px(x, y, GR1)
    # tubería horizontal baja
    l.rect(x0 + 1, y1 - 3, x1 - 1, y1 - 2, COBRE[1]); l.line((x0 + 1, y1 - 3), (x1 - 1, y1 - 3), COBRE[3])
    l.line((x0 + 1, y1 - 1), (x1 - 1, y1 - 1), COBRE[0])
    for x in range(x0 + 5, x1 - 1, 7):
        l.line((x, y1 - 4), (x, y1 - 1), COBRE[0])
    # engranajes
    engranaje(l, 72, y0 + 9, 4, fr, 1, 8, ORO)
    engranaje(l, 80, y0 + 5, 3, fr, -1, 6, COBRE)
    engranaje(l, 86, y0 + 10, 3, fr, 1, 6, LATON)
    # lucecita cálida
    l.rect(90, y0 + 4, 92, y0 + 7, ORO[2]); l.px(90, y0 + 4, ORO[3])
    # baranda de hierro al frente
    l.rect(x0, y1, x1, y1 + 1, GR2); l.rect(x0, y1 + 1, x1, y1 + 1, GR1)
    for x in range(x0, x1 + 1, 5):
        l.line((x, y1 - 3), (x, y1), INK)
        l.px(x, y1 - 4, GR2)
    l.line((x0, y1 - 3), (x1, y1 - 3), INK) if False else None


def quiosco(l, fr):
    # puesto de diarios, a la izquierda
    l.rect(8, 98, 28, YB - 1, LATON[1]); l.rect(8, 98, 28, 98, LATON[3])
    l.rect(8, 104 - 1, 28, YB - 1, LATON[0])
    l.rect(9, 99, 27, 102, LATON[0])
    # diarios apilados y exhibidos
    for i, x in enumerate((10, 15, 20, 25)):
        l.rect(x, 90, x + 3, 97, CR1 if i % 2 else CR0)
        l.line((x + 1, 92), (x + 2, 92), GR1); l.line((x + 1, 94), (x + 2, 94), GR2)
        l.px(x, 90, GR3)
    l.rect(11, 94, 14, 94, INK) if False else None
    # postes y techito
    l.line((8, 84), (8, 98), INK); l.line((28, 84), (28, 98), INK)
    for i, x in enumerate(range(6, 31)):
        c = GR1 if (i // 3) % 2 == 0 else "#e8874a"
        l.line((x, 82), (x, 86), c); l.px(x, 87 if i % 2 == 0 else 86, c)
    l.rect(6, 82, 30, 82, GR2)
    # cartelito
    l.rect(14, 88, 22, 90, CR0) if False else None


def buzon(l):
    l.rect(32, 96, 37, YB - 1, "#7a2e26"); l.rect(32, 96, 33, YB - 1, "#c94b64"); l.rect(31, 94, 38, 96, "#c94b64")
    l.rect(32, 93, 37, 94, "#c94b64"); l.rect(32, 93, 33, 94, "#f092a4")
    l.rect(33, 98, 36, 98, INK); l.rect(34, 100, 35, 102, CR0)
    l.line((34, YB), (34, YB), INK)


WB, HB, YBB = 112, 148, 128   # lienzo final y fila de la puerta
OX, OY = 16, 24               # desplazamiento de lo "viejo" (96x124) dentro del lienzo grande

MAD_R = ["#5a3322", "#7a2e26", "#b84a2c", "#e8874a"]       # madera rojiza (torre alta)
MAD_D = ["#5f3a24", "#8f5a30", "#bf8444", "#e0b070"]       # tablones dorados


def tablones(l, x0, y0, x1, y1, cols, paso=4, seed=0):
    """Pared de tablones verticales con vetas y luz a la izquierda."""
    l.rect(x0, y0, x1, y1, cols[1])
    for i, x in enumerate(range(x0, x1 + 1, paso)):
        l.line((x, y0), (x, y1), cols[0])
        if x + 1 <= x1:
            l.line((x + 1, y0), (x + 1, y1), cols[2])
        for k in range(y0 + 2 + (i * 5 + seed) % 7, y1, 9):
            l.px(x + 2 if x + 2 <= x1 else x, k, cols[0])
    l.rect(x1 - 2, y0, x1, y1, cols[0])


def reloj_romano(l, cx, cy):
    l.ellipse(cx, cy, 12.5, 12.5, INK)
    l.ellipse(cx, cy, 11.6, 11.6, MAD_D[1])
    l.ellipse(cx - 0.7, cy - 0.7, 11, 11, MAD_D[2])
    l.ellipse(cx - 1.2, cy - 1.2, 9.6, 9.6, MAD_D[3])
    l.ellipse(cx + 0.5, cy + 0.5, 9.8, 9.8, MAD_D[1])
    l.ellipse(cx, cy, 9.2, 9.2, INK2)
    l.ellipse(cx, cy, 8.8, 8.8, CR0)
    l.ellipse(cx - 1.2, cy - 1.2, 7.4, 7.4, CR1)
    for a in range(190, 340, 5):  # sombra interna abajo-derecha
        l.px(round(cx + math.cos(math.radians(a)) * 8.2), round(cy + math.sin(math.radians(a)) * 8.2), GR3)
    for h in range(12):
        a = math.radians(h * 30 - 90)
        if h % 3:
            l.px(round(cx + math.cos(a) * 7.4), round(cy + math.sin(a) * 7.4), INK)
    # marcas de los cuartos (grandes) como números romanos simplificados
    l.rect(cx - 1, cy - 8, cx + 1, cy - 6, INK); l.px(cx, cy - 7, CR0)           # XII
    l.rect(cx - 1, cy + 6, cx + 1, cy + 8, INK); l.px(cx, cy + 7, CR0)           # VI
    l.rect(cx + 6, cy - 1, cx + 8, cy + 1, INK); l.px(cx + 7, cy, CR0)           # III
    l.rect(cx - 8, cy - 1, cx - 6, cy + 1, INK); l.px(cx - 7, cy, CR0)           # IX
    for a in (45, 135, 225, 315):
        l.px(round(cx + math.cos(math.radians(a)) * 10.6), round(cy + math.sin(math.radians(a)) * 10.6), MAD_D[0])


def torre_alta(l, fr):
    cx = 56
    x0, x1 = 42, 70
    # --- base de tablones dorados
    tablones(l, x0, 100, x1, YBB - 1, MAD_D, 4, 1)
    l.rect(x0 - 1, 124, x1 + 1, YBB - 1, GR0); l.rect(x0 - 1, 124, x1 + 1, 124, GR1)
    # --- tramo de vidrio con engranajes a la vista
    l.rect(x0, 70, x1, 99, GR0)
    for xx in (x0, x1 - 3):  # postes de madera
        l.rect(xx, 70, xx + 3, 99, MAD_R[1]); l.rect(xx, 70, xx, 99, MAD_R[2]); l.rect(xx + 3, 70, xx + 3, 99, MAD_R[0])
    l.rect(x0 + 4, 71, x1 - 4, 98, "#8fd2d2")
    for y in range(71, 99):  # velo del vidrio con rayas diagonales de luz
        for x in range(x0 + 4, x1 - 3):
            if (x + y) % 9 == 0:
                l.px(x, y, "#c8ecdc")
            elif (x - y) % 13 == 0:
                l.px(x, y, "#a8cdf2")
    l.line((56, 71), (56, 98), GR1)  # travesaño central del vidrio
    engranaje(l, 52, 81, 6, fr, 1, 10, ORO)
    engranaje(l, 63, 77, 4, fr, -1, 8, COBRE)
    engranaje(l, 63, 90, 4, fr, 1, 8, LATON)
    engranaje(l, 50, 93, 3, fr, -1, 6, ORO)
    l.rect(x0 + 4, 71, x1 - 4, 72, GR1); l.rect(x0 + 4, 97, x1 - 4, 98, GR1)
    # --- cámara del reloj (madera rojiza)
    tablones(l, x0 - 1, 36, x1 + 1, 69, MAD_R, 4, 2)
    l.rect(x0 - 4, 66, x1 + 4, 70, MAD_D[2]); l.rect(x0 - 4, 66, x1 + 4, 66, MAD_D[3]); l.rect(x0 - 4, 70, x1 + 4, 70, MAD_D[0])
    l.rect(x0 - 4, 33, x1 + 4, 36, MAD_D[2]); l.rect(x0 - 4, 33, x1 + 4, 33, MAD_D[3]); l.rect(x0 - 4, 36, x1 + 4, 36, MAD_D[0])
    # ventanita con luz cálida a la izquierda del reloj
    l.rect(x0 + 1, 40, x0 + 6, 49, INK); l.rect(x0 + 2, 41, x0 + 5, 48, "#f9e07a"); l.line((x0 + 3, 41), (x0 + 3, 48), MAD_D[0]); l.line((x0 + 2, 44), (x0 + 5, 44), MAD_D[0]); l.px(x0 + 2, 41, CR1)
    reloj_romano(l, cx + 4, 52)
    # --- techo piramidal de tejas de madera oscura
    for i, y in enumerate(range(14, 33)):
        half = 3 + i * 1.18
        xa, xb = round(cx - half), round(cx + half)
        c = MAD_D[0] if i % 3 == 2 else "#8f5a30"
        l.line((xa, y), (xb, y), c)
        l.px(xa, y, MAD_D[2]); l.px(xb, y, MAD_R[0])
        if i % 3 == 2:
            for x in range(xa + 1 + (i % 2) * 2, xb, 5):
                l.px(x, y - 1, MAD_R[0])
    l.line((cx, 13), (cx, 32), MAD_D[2])
    l.rect(cx - 25, 32, cx + 25, 32, MAD_D[3]); l.rect(cx - 25, 33, cx + 25, 33, MAD_D[0]) if False else None
    pluma(l, cx, 9, fr)
    # --- escalera exterior en zigzag con baranda (izquierda y derecha, alternadas)
    def tramo(xa, ya, xb, yb):
        n = abs(xb - xa)
        for k in range(0, n + 1, 2):
            x = xa + (xb - xa) * k // n
            y = ya + (yb - ya) * k // n
            l.rect(x, y, x + 3, y + 1, MAD_D[2]); l.rect(x, y, x + 3, y, MAD_D[3]); l.rect(x, y + 2, x + 3, y + 2, MAD_D[0])
            if k % 4 == 0:
                l.line((x + 1, y - 6), (x + 1, y), INK2)
        l.line((xa + 1, ya - 6), (xb + 1, yb - 6), MAD_D[1]); l.line((xa + 1, ya - 7), (xb + 1, yb - 7), MAD_D[3])
        l.line((xa, ya + 3), (xb, yb + 3), MAD_D[0])
    tramo(33, 124, 43, 112)     # izquierda, abajo
    l.rect(33, 112, 43, 113, MAD_D[2])
    tramo(69, 108, 79, 96)      # derecha
    tramo(33, 94, 43, 82)       # izquierda
    tramo(69, 80, 79, 68)       # derecha, hasta el balcón del reloj
    # --- pájaros
    for (bx, by) in ((24, 22), (33, 16), (90, 26), (84, 18)):
        d = 0 if fr == 0 else 1
        l.px(bx, by + d, INK); l.px(bx - 1, by - 1 + d, INK); l.px(bx - 2, by - 1, INK) if d == 0 else l.px(bx - 2, by, INK)
        l.px(bx + 1, by - 1 + d, INK); l.px(bx + 2, by - 1, INK) if d == 0 else l.px(bx + 2, by, INK)
    # --- puerta de madera con arco y cartelito
    l.rect(52, 112, 60, YBB - 1, INK)
    l.rect(53, 113, 59, YBB - 1, MAD_D[1]); l.rect(53, 113, 54, YBB - 1, MAD_D[2])
    l.line((56, 113), (56, YBB - 1), MAD_D[0]); l.line((53, 118), (59, 118), MAD_D[0])
    l.px(58, 123, ORO[3]); l.px(58, 124, ORO[2])
    l.rect(51, 104, 61, 109, MAD_D[1]); l.rect(52, 105, 60, 108, CR0)
    l.line((54, 108), (58, 106), COBRE[1]); l.px(58, 106, CR1); l.px(53, 106, GR3); l.px(54, 106, GR3)
    l.rect(51, YBB, 61, YBB + 1, GR3); l.rect(50, YBB + 1, 62, YBB + 2, GR2); l.rect(50, YBB + 2, 62, YBB + 2, GR1)
    farol(l, 46, 112)
    farol(l, 66, 112)


def redaccion(fr):
    l = Lienzo(WB, HB)
    torre_alta(l, fr)
    resto = Lienzo(W, H)
    quiosco(resto, fr); buzon(resto); edificio_chico(resto, fr); sotano(resto, fr)
    l.pegar(resto, OX, OY)
    l.contorno(INK)
    return l


def todo():
    for noche in (False, True):
        hoja = Lienzo(WB * 2, HB)
        for fr in range(2):
            c = redaccion(fr)
            if noche:
                c.im = a_noche(c.im)
            hoja.pegar(c, fr * WB, 0)
        guardar(hoja, f"casat_redaccion{'_noche' if noche else ''}.png")


if __name__ == "__main__":
    todo()
    print("redaccion ok")
