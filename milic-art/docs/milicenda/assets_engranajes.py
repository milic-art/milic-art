"""Asset: engranajes que encajan de verdad (módulo m, N dientes), con relieve (luz arriba-izquierda) y giro animado."""
import math
from PIL import Image
from gen_lib import hx, INK

RAMPAS = {
    "laton": ["#8f5a30", "#d99a1c", "#f2c230", "#f9e07a", "#fffdf7"],
    "cobre": ["#7a2e26", "#b96d32", "#dc9544", "#f2bd6e", "#f9e07a"],
    "acero": ["#463f4a", "#77707c", "#a8a08e", "#d6cbb0", "#fbf3e4"],
}


def radio(theta, N, m, fase):
    p = 2 * math.pi / N
    u = ((theta - fase) % p) / p
    ro, rr = m * (N + 1.5) / 2, m * (N - 1.9) / 2
    d = abs(u - 0.5)
    if d <= 0.17: return ro
    if d <= 0.27: return ro + (rr - ro) * (d - 0.17) / 0.10
    return rr


def dentro(x, y, cx, cy, N, m, fase):
    dx, dy = x - cx, y - cy
    return math.hypot(dx, dy) <= radio(math.atan2(dy, dx), N, m, fase)


def engranaje(im, cx, cy, N, m, fase, rampa):
    R = [hx(c) + (255,) for c in RAMPAS[rampa]]
    ink = hx(INK) + (255,)
    ro = m * (N + 1.5) / 2
    rr = m * (N - 1.9) / 2
    x0, x1 = int(cx - ro - 2), int(cx + ro + 3)
    y0, y1 = int(cy - ro - 2), int(cy + ro + 3)
    mask = {}
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            mask[(x, y)] = dentro(x + 0.5, y + 0.5, cx, cy, N, m, fase)
    hub = max(1.6, m * 1.1)
    aro_in = rr - max(1.6, m * 1.2)
    nr = 3 if N < 10 else 4 if N < 14 else 6
    for (x, y), ins in mask.items():
        if not ins:
            continue
        d = math.hypot(x + 0.5 - cx, y + 0.5 - cy)
        ang = math.atan2(y + 0.5 - cy, x + 0.5 - cx)
        luz = mask.get((x - 1, y - 1), False) is False      # borde iluminado
        sombra = mask.get((x + 1, y + 1), False) is False   # borde en sombra
        if d > aro_in:                                       # cuerpo + dientes
            c = R[2]
            if luz: c = R[3]
            elif sombra: c = R[0]
            elif (x - cx) + (y - cy) < -ro * 0.3: c = R[3]
            elif (x - cx) + (y - cy) > ro * 0.5: c = R[1]
        else:                                                # interior hundido con rayos
            sp = False
            if d > hub:
                for k in range(nr):
                    a = fase * 0.0 + k * 2 * math.pi / nr + fase
                    da = abs(((ang - a + math.pi) % (2 * math.pi)) - math.pi)
                    if da * d < max(0.9, m * 0.55): sp = True
            if d <= hub:
                c = R[3] if (x - cx) + (y - cy) < 0 else R[1]
                if d <= hub * 0.45: c = R[0]
            elif sp:
                c = R[2] if (x - cx) + (y - cy) < 0 else R[1]
            else:
                c = R[0] if d > aro_in - 1.2 else hx("#2e1b14") + (255,)
                if c[:3] == hx("#2e1b14"): c = hx("#463f4a") + (255,)
        if 0 <= x < im.width and 0 <= y < im.height: im.putpixel((x, y), c)
    for (x, y), ins in mask.items():                         # contorno
        if ins: continue
        if any(mask.get((x + a, y + b), False) for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))):
            if 0 <= x < im.width and 0 <= y < im.height: im.putpixel((x, y), ink)


def cadena(im, ox, oy, cfg, giro):
    """cfg: lista (N, rampa, angulo_hacia_el_siguiente_en_grados). Los dientes encajan; vecinos giran al revés."""
    m = 2.6
    x, y = ox, oy
    prev = None
    items = []
    ang_prev = None
    for i, (N, ramp, ang) in enumerate(cfg):
        if i > 0:
            Np = cfg[i - 1][0]
            a = math.radians(cfg[i - 1][2])
            dist = m * (Np + N) / 2
            x += math.cos(a) * dist; y += math.sin(a) * dist
        items.append((x, y, N, ramp))
    for i, (x, y, N, ramp) in enumerate(items):
        p = 2 * math.pi / N
        if i == 0:
            a = math.radians(cfg[0][2]); fase = a - 0.5 * p
            fase += giro * p
        else:
            Np = items[i - 1][2]
            a = math.radians(cfg[i - 1][2]); ainv = a + math.pi
            fase0 = ainv  # hueco hacia el vecino anterior
            # el giro del vecino: sentido contrario, proporcional a N0/N
            fase = fase0 - giro * p * (items[0][2] / N) * ((-1) ** (i % 2) * -1) * -1
            fase = fase0 + ((-1) ** i) * (-giro) * (2 * math.pi / items[0][2]) * (items[0][2] / N)
        engranaje(im, x, y, N, m, fase, ramp)


if __name__ == "__main__":
    S = 8
    cfg = [(12, "laton", 25), (8, "cobre", -30), (10, "acero", 20), (6, "laton", 80)]
    hoja = Image.new("RGBA", (4 * 90, 80), (88, 122, 53, 255))
    for f in range(4):
        fr = Image.new("RGBA", (90, 80), (0, 0, 0, 0))
        cadena(fr, 24, 26, cfg, f / 4)
        hoja.alpha_composite(fr, (f * 90, 0))
    hoja.resize((hoja.width * 4, hoja.height * 4), Image.NEAREST).save("/tmp/engranajes.png")
    print("ok")
