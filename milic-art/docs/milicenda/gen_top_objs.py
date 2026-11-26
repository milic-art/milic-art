"""Arbustos (3) y rocas (2) para la isla cenital. arbusto_hoja.png: 3 de 18x14. roca_hoja.png: 2 de 14x10."""
from gen_lib import *

def arbusto(v):
    l = Lienzo(18, 14)
    cs = [(5, 9, 5, 4), (11, 8, 6, 5), (8, 6, 5, 4)] if v != 1 else [(6, 8, 6, 5), (12, 9, 4, 4), (9, 6, 4, 4)]
    for cx, cy, rx, ry in cs:
        l.ellipse(cx, cy, rx, ry, "#35563a")
    for cx, cy, rx, ry in cs:
        l.ellipse(cx - 1, cy - 1, rx - 1, ry - 1, "#587a35")
    for cx, cy, rx, ry in cs:
        l.ellipse(cx - 2, cy - 2, max(1, rx - 3), max(1, ry - 3), "#8aa23a")
    l.px(6, 5, "#bcc046"); l.px(10, 4, "#bcc046"); l.px(8, 7, "#bcc046")
    if v == 2:
        for (x, y) in ((4, 8), (9, 10), (13, 8), (7, 5)):
            l.px(x, y, "#c94b64"); l.px(x + 1, y, "#f092a4")
    if v == 1:
        for (x, y) in ((5, 7), (11, 9), (9, 5)):
            l.px(x, y, "#fffdf7")
    l.contorno(INK)
    return l

def roca(v):
    l = Lienzo(14, 10)
    if v == 0:
        l.ellipse(7, 6, 6, 3.5, "#77707c"); l.ellipse(6, 5, 5, 2.5, "#a8a08e"); l.ellipse(5, 4, 2.5, 1.5, "#d6cbb0")
        l.line((9, 6), (11, 6), "#463f4a")
    else:
        l.ellipse(5, 6, 4.5, 3, "#77707c"); l.ellipse(10, 7, 3.5, 2.5, "#77707c")
        l.ellipse(4, 5, 3.5, 2, "#a8a08e"); l.ellipse(9, 6, 2.5, 1.5, "#a8a08e"); l.px(3, 4, "#d6cbb0"); l.px(9, 5, "#d6cbb0")
        l.px(6, 8, "#587a35"); l.px(7, 8, "#587a35")
    l.contorno(INK)
    return l

h = Lienzo(18 * 3, 14)
for v in range(3): h.pegar(arbusto(v), v * 18, 0)
guardar(h, "arbusto_hoja.png")
h = Lienzo(14 * 2, 10)
for v in range(2): h.pegar(roca(v), v * 14, 0)
guardar(h, "roca_hoja.png")
print("ok")
