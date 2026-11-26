"""Isla flotante vista desde arriba (cenital, 3/4). Hornea el suelo en 4 cuadros (agua animada) y escribe el layout.
Salida: public/milicenda-assets/generados/isla_{h|v}_{0..3}.png y src/components/isla/layout_top.json
h = compu (horizontal), v = celu (vertical). Todo con paleta cerrada."""
import json, math, os, random
import numpy as np
from PIL import Image
from gen_lib import OUT, SRC_ISLA, hx

NF = 4
CLIFF = 13

PUERTA = {"periodismo": 31, "diseno": 45, "dibujo": 31, "programacion": 31, "casita": 31}


def _dx(id_, base):
    return base[0] - 32 + PUERTA[id_]


def _h():
    c = {"periodismo": (120, 120), "diseno": (240, 112), "dibujo": (360, 120), "programacion": (166, 208), "casita": (330, 208)}
    d = {k: _dx(k, v) for k, v in c.items()}
    paths = [[(108, 146), (372, 146)]]
    for k in ("periodismo", "diseno", "dibujo"):
        paths.append([(d[k], c[k][1] + 2), (d[k], 146)])
    paths.append([(108, 146), (108, 218), (d["programacion"], 218), (d["programacion"], c["programacion"][1] + 2)])
    paths.append([(372, 146), (372, 218), (d["casita"], 218), (d["casita"], c["casita"][1] + 2)])
    return dict(lw=480, lh=330, isl=(60, 36, 360, 204), p=3.4, under=46, casas=c, pond=(250, 190, 18, 10), rest=(186, 150), paths=paths,
                n=(7, 7, 4, 5, 55))


def _v():
    c = {"periodismo": (92, 158), "diseno": (208, 208), "dibujo": (92, 258), "programacion": (208, 308), "casita": (92, 358)}
    d = {k: _dx(k, v) for k, v in c.items()}
    paths = [[(150, 150), (150, 372)]]
    for k, v in c.items():
        paths.append([(d[k], v[1] + 2), (d[k], v[1] + 12), (150, v[1] + 12)])
    return dict(lw=300, lh=500, isl=(30, 62, 240, 340), p=3.4, under=50, casas=c, pond=(212, 372, 16, 9), rest=(150, 236), paths=paths,
                n=(6, 6, 3, 4, 40))


ORIENT = {"h": _h(), "v": _v()}


def rgb(h):
    return hx(h)


def blocky_mask(W, H, p, seed, step=4):
    r = random.Random(seed)
    ph = [r.random() * 6.28 for _ in range(4)]
    m = np.zeros((H, W), bool)
    for by in range(0, H, step):
        for bx in range(0, W, step):
            nx = (bx + step / 2 - W / 2) / (W / 2)
            ny = (by + step / 2 - H / 2) / (H / 2)
            rr = (abs(nx) ** p + abs(ny) ** p) ** (1 / p)
            th = math.atan2(ny, nx)
            rb = 0.97 + 0.035 * math.sin(3 * th + ph[0]) + 0.025 * math.sin(5 * th + ph[1]) + 0.015 * math.sin(9 * th + ph[2])
            if rr < rb:
                m[by:by + step, bx:bx + step] = True
    return m


def ellipse(m, cx, cy, rx, ry, val=True):
    H, W = m.shape
    ys, xs = np.ogrid[:H, :W]
    m[((xs + .5 - cx) / rx) ** 2 + ((ys + .5 - cy) / ry) ** 2 <= 1] = val


def build(key, cfg):
    lw, lh = cfg["lw"], cfg["lh"]
    ix, iy, iw, ih = cfg["isl"]
    rnd = random.Random(11 + ord(key))
    # superficie superior (en coordenadas del mundo)
    T = np.zeros((lh, lw), bool)
    T[iy:iy + ih, ix:ix + iw] = blocky_mask(iw, ih, cfg["p"], 3 + ord(key))
    # acantilado: bajo cada columna
    yb = np.full(lw, -1)
    for x in range(lw):
        ys = np.where(T[:, x])[0]
        if len(ys):
            yb[x] = ys.max()
    cx0 = ix + iw / 2
    C = np.zeros((lh, lw), bool)
    for x in range(lw):
        if yb[x] >= 0:
            C[yb[x] + 1:yb[x] + 1 + CLIFF, x] = True
    # cuerpo de abajo
    U = cfg["under"]
    bump = {}
    x = 0
    while x < lw:
        seg = rnd.randint(4, 9)
        v = rnd.randint(-4, 4)
        for k in range(seg):
            bump[x + k] = v
        x += seg
    stal = [(cx0 + 4, 20, U + 40), (cx0 - iw * 0.27, 10, U + 18), (cx0 + iw * 0.3, 9, U + 12)]
    B = np.zeros((lh, lw), bool)
    for x in range(lw):
        if yb[x] < 0:
            continue
        u = abs(x - cx0) / (iw / 2)
        d = U * max(0, 1 - u ** 1.6) ** 0.8 + bump.get(x, 0) * min(1, (1 - u) * 4)
        for (sx, bw, ext) in stal:
            dx = abs(x - sx)
            if dx < bw:
                d = max(d, (ext) * (1 - (dx / bw) ** 1.1))
        top = yb[x] + CLIFF + 1
        bot = int(top + d)
        if bot > top:
            B[top:min(lh, bot), x] = True
    solid = T | C | B
    img = np.zeros((lh, lw, 4), np.uint8)

    def put(mask, color):
        img[mask, :3] = rgb(color)
        img[mask, 3] = 255

    # ---- pasto
    put(T, "#8aa23a")
    ys, xs = np.mgrid[:lh, :lw]

    def blobs(n, rx, ry, seed, region):
        r = random.Random(seed)
        out = np.zeros((lh, lw), bool)
        pts = np.argwhere(region)
        for _ in range(n):
            y, x = pts[r.randrange(len(pts))]
            ellipse(out, x, y, r.randint(*rx), r.randint(*ry))
        return out

    put(blobs(34, (8, 22), (5, 11), 21, T) & T, "#bcc046")
    put(blobs(22, (6, 14), (3, 7), 22, T) & T, "#587a35")
    put(blobs(14, (5, 10), (3, 6), 23, T) & T & blobs(40, (10, 20), (5, 9), 24, T), "#e2d870")
    # matitas de pasto (v de 3 px)
    for _ in range(200):
        y = rnd.randrange(iy + 4, iy + ih - 6)
        x = rnd.randrange(ix + 4, ix + iw - 6)
        if T[y, x] and T[y + 2, x + 2] and T[y, x + 2]:
            col = "#587a35" if rnd.random() < 0.5 else "#bcc046"
            for dx, dy in ((0, 0), (2, 0), (1, 1)):
                img[y + dy, x + dx, :3] = rgb(col)

    # ---- camino
    P = np.zeros((lh, lw), bool)
    for pts in cfg["paths"]:
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            n = int(max(abs(x1 - x0), abs(y1 - y0)))
            for k in range(n + 1):
                t = k / max(1, n)
                ellipse(P, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, 5.2, 5.2)
    # el camino sigue alrededor del pasto solamente
    P &= T
    Pin = P.copy()
    edge = np.zeros_like(P)
    edge[1:, :] |= P[1:, :] & ~P[:-1, :]
    edge[:-1, :] |= P[:-1, :] & ~P[1:, :]
    edge[:, 1:] |= P[:, 1:] & ~P[:, :-1]
    edge[:, :-1] |= P[:, :-1] & ~P[:, 1:]
    put(P, "#e0b070")
    put(P & ((xs // 5 + ys // 4) % 5 == 0) & ~edge, "#f2bd6e")
    put(P & ((xs * 3 + ys * 5) % 29 == 0) & ~edge, "#bf8444")
    put(edge, "#bf8444")
    # piedritas
    for _ in range(30):
        y, x = rnd.randrange(lh), rnd.randrange(lw)
        if P[y, x] and not edge[y, x] and P[y, x + 2]:
            img[y, x, :3] = rgb("#a8a08e"); img[y, x + 1, :3] = rgb("#d6cbb0")

    # ---- estanque + arroyo
    pcx, pcy, prx, pry = cfg["pond"]
    Wm = np.zeros((lh, lw), bool)
    ellipse(Wm, pcx, pcy, prx, pry)
    ellipse(Wm, pcx - 9, pcy - 3, prx * 0.6, pry * 0.9)
    ellipse(Wm, pcx + 12, pcy + 2, prx * 0.55, pry * 0.8)
    # arroyo hasta el borde del frente
    sx0 = pcx
    for x in range(int(sx0 - 4), int(sx0 + 4)):
        Wm[int(pcy):yb[x] + CLIFF + 1, x] = True
    Wm &= (T | C)
    # banco de tierra alrededor
    bank = np.zeros_like(Wm)
    for dy in (-2, -1, 0, 1, 2):
        for dx in (-2, -1, 0, 1, 2):
            if abs(dx) + abs(dy) <= 3:
                bank |= np.roll(np.roll(Wm, dy, 0), dx, 1)
    bank &= T & ~Wm
    put(bank & ~P, "#587a35")
    put(bank & P, "#bf8444")
    # borde claro de pasto sobre el banco (arriba)
    # agua (se pinta por cuadro)
    Wedge = Wm & ~(np.roll(Wm, 1, 0) & np.roll(Wm, -1, 0) & np.roll(Wm, 1, 1) & np.roll(Wm, -1, 1))
    Win = Wm & ~Wedge

    # ---- acantilado, roca y contorno
    soil_rows = CLIFF + 6
    # bandas de tierra
    cliff_top = np.zeros(lw, int)
    for x in range(lw):
        cliff_top[x] = yb[x] + 1
    # transición tierra-roca irregular
    trans = {}
    x = 0
    cur = 5
    while x < lw:
        seg = rnd.randint(6, 13)
        cur = max(2, min(12, cur + rnd.randint(-4, 4)))
        for k in range(seg):
            trans[x + k] = cur
        x += seg
    rb1 = blobs(26, (8, 18), (3, 8), 31, C | B)
    rb2 = blobs(26, (8, 18), (3, 8), 32, C | B)
    for y in range(lh):
        for x in range(lw):
            if not (C[y, x] or B[y, x]):
                continue
            d = y - cliff_top[x]
            zx = (x + 0.9 * d - cx0) / (iw * 0.22)
            zone = 0 if zx < -1 else (1 if zx < 1 else 2)
            soil = d < CLIFF + trans.get(x, 6)
            if soil:
                pal = ["#f2bd6e", "#dc9544", "#b96d32", "#8a4e2a", "#5a3322", "#4a2c1f"]
                t = 2
                if d < 3:
                    t -= 1
                if rb1[y, x] and d > 3:
                    t -= 1
                if rb2[y, x] and d > 5:
                    t += 1
                if d > CLIFF - 3 and d <= CLIFF + trans.get(x, 6):
                    t += 1
                col = pal[max(0, min(5, t + zone - (1 if zone else 0) * 0))]
            else:
                pal = ["#d6cbb0", "#a8a08e", "#77707c", "#463f4a", "#463f4a"]
                t = 1
                rd = d - (CLIFF + trans.get(x, 6))
                if rd < 2:
                    t = 0
                if rb1[y, x] and rd > 3:
                    t -= 1
                if rb2[y, x] and rd > 3:
                    t += 1
                if y - (yb[x] + CLIFF) > U * 0.6:
                    t += 1
                col = pal[max(0, min(4, t + (1 if zone else 0) + (1 if zone == 2 else 0) * 0))]
            img[y, x, :3] = rgb(col)
            img[y, x, 3] = 255
    # piedritas y raíces en la tierra
    for _ in range(40):
        x = rnd.randrange(ix, ix + iw)
        if yb[x] < 0:
            continue
        y = yb[x] + 1 + rnd.randrange(1, CLIFF - 2)
        if C[y, x] and C[y + 1, x + 2]:
            for dx in range(3):
                img[y, x + dx, :3] = rgb("#a8a08e" if x < cx0 else "#77707c")
            img[y + 1, x + 1, :3] = rgb("#5a3322")
    for _ in range(14):
        x = rnd.randrange(ix + 6, ix + iw - 6)
        if yb[x] < 0:
            continue
        L = rnd.randint(7, 12)
        xx = x
        for k in range(L):
            y = yb[x] + 2 + k
            if y < lh and C[y, xx]:
                img[y, xx, :3] = rgb("#4a2c1f")
            if k % 3 == 2:
                xx += rnd.choice((-1, 1))
    # grietas en la roca
    for _ in range(16):
        x = rnd.randrange(ix + 8, ix + iw - 8)
        if yb[x] < 0:
            continue
        y = yb[x] + CLIFF + 8 + rnd.randrange(0, 10)
        for k in range(rnd.randint(6, 11)):
            if 0 <= y < lh and B[y, x]:
                img[y, x, :3] = rgb("#35303a" if False else "#463f4a")
            y += 1
            if k % 2:
                x += rnd.choice((-1, 1))
    # labio de pasto: sombra y mechones colgando
    lip = T & ~np.roll(T, -1, 0)
    for y, x in np.argwhere(lip):
        for k in range(0, 2):
            if y - k >= 0 and T[y - k, x]:
                img[y - k, x, :3] = rgb("#587a35" if k == 0 else "#587a35")
    for x in range(ix, ix + iw):
        if yb[x] < 0:
            continue
        if (x * 7 + 3) % 9 in (0, 1, 2):
            for k in range(1, 3 + (x % 3)):
                if C[yb[x] + k, x]:
                    img[yb[x] + k, x, :3] = rgb("#587a35" if k > 1 else "#8aa23a")
    # luz arriba-izquierda: borde claro de la superficie
    topl = T & (~np.roll(T, 1, 0) | ~np.roll(T, 1, 1))
    put(topl, "#e2d870")
    # sombras de casas y árboles se hornean después (ver abajo)
    solid2 = T | C | B
    # contorno exterior
    outline = np.zeros_like(solid2)
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        outline |= np.roll(np.roll(solid2, dy, 0), dx, 1) & ~solid2
    outline[0, :] = False
    # la parte de arriba no lleva sombra: el contorno completo es #2e1b14
    return dict(img=img, T=T, C=C, B=B, P=Pin, Wm=Wm, Win=Win, Wedge=Wedge, outline=outline, yb=yb, bank=bank, cfg=cfg, rnd=rnd, lip=lip)


def pintar_agua(g, frame):
    img = g["img"].copy()
    lh, lw = img.shape[:2]
    Wm, Wedge, Win = g["Wm"], g["Wedge"], g["Win"]
    ys, xs = np.mgrid[:lh, :lw]
    base = Wm
    img[base, :3] = rgb("#2c9488")
    img[base, 3] = 255
    sh = frame
    # rayas largas horizontales que se corren
    r1 = base & ((ys % 4 == 1) & (((xs + sh * 2) // 7) % 3 == 0))
    r2 = base & ((ys % 4 == 3) & (((xs - sh * 3) // 6) % 3 == 1))
    r3 = base & ((ys % 9 == 5) & (((xs + ys + sh * 4) // 5) % 4 == 0))
    img[r1, :3] = rgb("#58cc9f")
    img[r2, :3] = rgb("#1b5f66")
    img[r3, :3] = rgb("#58cc9f")
    sp = base & (((xs * 5 + ys * 11 + sh * 13) % 97) == 0)
    img[sp, :3] = rgb("#b2f0cc")
    # espuma en la orilla
    foam = Wedge
    img[foam, :3] = rgb("#effbe6")
    inner = Win & (np.roll(~Win, 1, 0) | np.roll(~Win, 1, 1) | np.roll(~Win, -1, 0) | np.roll(~Win, -1, 1)) & ~foam
    img[inner, :3] = rgb("#b2f0cc")
    # cascada sobre el acantilado: franja vertical que cae
    cliff_water = Wm & g["C"]
    cw = cliff_water
    colpat = ((xs + (ys + sh * 5) // 5) % 4)
    img[cw & (colpat == 0), :3] = rgb("#b2f0cc")
    img[cw & (colpat == 2), :3] = rgb("#58cc9f")
    # chorro que sigue cayendo bajo el acantilado
    pcx = g["cfg"]["pond"][0]
    bot = int(g["yb"][int(pcx)] + CLIFF + 1)
    for x in range(int(pcx - 4), int(pcx + 4)):
        for k in range(0, 46):
            y = bot + k
            if y >= lh:
                break
            if k > 18 and ((x * 7 + y * 3 + sh * 5) % 4 != 0):
                continue
            if k > 34 and ((x * 5 + y + sh * 3) % 3 != 0):
                continue
            if g["B"][y, x]:
                pass
            c = "#58cc9f" if ((x + (y + sh * 5) // 4) % 3) else "#b2f0cc"
            if x in (int(pcx - 4), int(pcx + 3)):
                c = "#2c9488"
            img[y, x, :3] = rgb(c)
            img[y, x, 3] = 255
    # el borde del arroyo
    return img


def hornear_sombras(g, objs, casas):
    img = g["img"]
    lh, lw = img.shape[:2]
    T = g["T"]
    ys, xs = np.mgrid[:lh, :lw]

    def sombra(cx, cy, rx, ry):
        m = ((xs + .5 - cx) / rx) ** 2 + ((ys + .5 - cy) / ry) ** 2 <= 1
        m &= T & ~g["Wm"]
        img[m, :3] = rgb("#587a35")
    for (x, y, rx, ry) in objs:
        sombra(x, y, rx, ry)
    for (x, y) in casas:
        sombra(x + 4, y - 1, 38, 9)


def poblar(g, cfg):
    """Árboles, arbustos, flores, girasoles, rocas: puntos sobre pasto libre."""
    rnd = random.Random(99 + ord(cfg["key"]))
    T = g["T"]
    lh, lw = T.shape
    ix, iy, iw, ih = cfg["isl"]
    casas = cfg["casas"]
    ys, xs = np.mgrid[:lh, :lw]
    P = g["P"]
    Wm = g["Wm"]
    block = np.zeros((lh, lw), bool)
    # zonas ocupadas por casas (sprite ~ 72x76 por encima de la base)
    def libre(x, y, margen=0, tipo="arbol"):
        if not (0 <= y < lh and 0 <= x < lw) or not T[y, x]:
            return False
        # borde: lejos del labio
        if not (T[y + 8, x] and T[y, x - 10] and T[y, x + 10] and T[max(0, y - 6), x]):
            return False
        for (hx_, hy_) in casas.values():
            if tipo == "arbol":
                if abs(x - hx_) < 40 and hy_ - 66 < y < hy_ + 14:
                    return False
            else:
                if abs(x - hx_) < 36 and hy_ - 62 < y < hy_ + 12:
                    return False
        r = 8 + margen
        if P[max(0, y - r):y + r, max(0, x - r):x + r].any():
            return False
        pcx, pcy, prx, pry = cfg["pond"]
        if ((x - pcx) / (prx + 12 + margen)) ** 2 + ((y - pcy) / (pry + 10 + margen)) ** 2 < 1.4:
            return False
        if abs(x - pcx) < 12 + margen and y > pcy:
            return False
        return True
    out = {"arboles": [], "arbustos": [], "flores": [], "girasoles": [], "rocas": []}
    pts = []

    def poisson(n, mind, tipo, margen=0, tries=4000):
        got = []
        for _ in range(tries):
            if len(got) >= n:
                break
            x = rnd.randrange(ix + 8, ix + iw - 8)
            y = rnd.randrange(iy + 12, iy + ih - 6)
            if not libre(x, y, margen, tipo):
                continue
            if all(math.hypot(x - a, y - b) >= mind for a, b in pts):
                got.append((x, y))
                pts.append((x, y))
        return got
    nt, nb, nr, ng, nfl = cfg["n"]
    for (x, y) in poisson(nt, 30, "arbol"):
        out["arboles"].append({"x": x, "y": y, "v": rnd.choice([0, 1, 2, 0, 1, 2, 3, 3])})
    for (x, y) in poisson(nb, 20, "arbusto"):
        out["arbustos"].append({"x": x, "y": y, "v": rnd.randrange(3)})
    for (x, y) in poisson(nr, 22, "arbusto"):
        out["rocas"].append({"x": x, "y": y, "v": rnd.randrange(2)})
    for (x, y) in poisson(ng, 24, "arbusto"):
        out["girasoles"].append({"x": x, "y": y})
    for (x, y) in poisson(nfl, 12, "arbusto", tries=9000):
        out["flores"].append({"x": x, "y": y, "v": rnd.randrange(8)})
    return out


def main():
    layout = {}
    for key, cfg in ORIENT.items():
        cfg["key"] = key
        g = build(key, cfg)
        pob = poblar(g, cfg)
        objs = [(a["x"] + 3, a["y"], 12, 5) for a in pob["arboles"]] + [(a["x"], a["y"], 8, 3) for a in pob["arbustos"]] + [(a["x"], a["y"], 5, 2) for a in pob["rocas"]]
        hornear_sombras(g, objs, list(cfg["casas"].values()))
        lh, lw = cfg["lh"], cfg["lw"]
        for f in range(NF):
            im = pintar_agua(g, f)
            # contorno (queda sobre todo, incluido el agua que cae)
            im[g["outline"], :3] = rgb("#2e1b14")
            im[g["outline"], 3] = 255
            Image.fromarray(im, "RGBA").save(os.path.join(OUT, f"isla_{key}_{f}.png"))
        pcx, pcy, prx, pry = cfg["pond"]
        layout[key] = dict(lw=lw, lh=lh, isl=list(cfg["isl"]), casas={k: list(v) for k, v in cfg["casas"].items()},
                           pond=list(cfg["pond"]), rest=list(cfg["rest"]), nf=NF, **pob)
        # vista previa
        prev = Image.open(os.path.join(OUT, f"isla_{key}_0.png"))
        bg = Image.new("RGBA", prev.size, (143, 210, 210, 255))
        bg.alpha_composite(prev)
        bg.resize((lw * 2, lh * 2), Image.NEAREST).save(f"/tmp/s/top_{key}.png")
    with open(os.path.join(SRC_ISLA, "layout_top.json"), "w") as f:
        json.dump(layout, f)
    print("ok")


if __name__ == "__main__":
    main()
