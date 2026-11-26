"""Isla flotante vista desde arriba (cenital, 3/4). Hornea el suelo en 4 cuadros (agua animada) y escribe el layout.
Salida: public/milicenda-assets/generados/isla_{h|v}_{0..3}.png y src/components/isla/layout_top.json
h = compu (horizontal), v = celu (vertical). Todo con paleta cerrada."""
import json, math, os, random
import numpy as np
from PIL import Image
from gen_lib import OUT, SRC_ISLA, hx

NF = 4
CLIFF = 16

PUERTA = {"periodismo": 31, "diseno": 45, "dibujo": 31, "programacion": 31, "casita": 31}


def _dx(id_, base):
    return base[0] - 32 + PUERTA[id_]


def _h():
    # mundo grande: 760x580, isla de 680x430
    c = {"periodismo": (150, 168), "diseno": (380, 146), "dibujo": (610, 168), "programacion": (190, 346), "casita": (570, 346)}
    d = {k: _dx(k, v) for k, v in c.items()}
    TR, BT = 252, 392
    paths = [[(104, TR), (656, TR)]]
    for k in ("periodismo", "diseno", "dibujo"):
        paths.append([(d[k], c[k][1] + 2), (d[k], TR)])
    paths.append([(104, TR), (104, BT), (656, BT), (656, TR)])
    for k in ("programacion", "casita"):
        paths.append([(d[k], c[k][1] + 2), (d[k], BT)])
    return dict(lw=760, lh=580, isl=(40, 34, 680, 436), p=3.2, under=74, casas=c, pond=(380, 322, 28, 13), rest=(380, 276), paths=paths,
                n=(22, 20, 9, 12, 75), deco=[dict(k="pozo_balde_arriba", x=470, y=246, rx=11), dict(k="banco_derecha", x=296, y=248, rx=11), dict(k="cartel", x=338, y=246, rx=6),
                      dict(k="farolito", x=230, y=246, rx=3), dict(k="farolito", x=530, y=246, rx=3), 
                      dict(k="puesto", x=486, y=352, rx=14), dict(k="buzon_bandera_arriba", x=616, y=356, rx=4), dict(k="barril", x=236, y=352, rx=5),
                      dict(k="jardin:maceta_tulipanes", x=300, y=384, rx=4), dict(k="jardin:maceta_margaritas", x=330, y=384, rx=4),
                      dict(k="jardin:maceta_lavanda", x=436, y=384, rx=4), dict(k="jardin:maceta_cempasuchil", x=466, y=384, rx=4),
                      dict(k="jardin:enrejado", x=630, y=350, rx=8), dict(k="cerca_baja_derecha", x=128, y=334, rx=0)], hub=(380, TR), bridge_y=BT, stream=dict(amp=9, per=70))


def _v():
    c = {"periodismo": (112, 176), "diseno": (278, 298), "dibujo": (112, 420), "programacion": (278, 542), "casita": (112, 664)}
    d = {k: _dx(k, v) for k, v in c.items()}
    sx = lambda y: int(round(195 + 20 * math.sin((y - 160) / 530 * 2 * math.pi * 1.5)))
    ys_ = sorted(set(range(160, 691, 10)) | {v[1] + 14 for v in c.values()})
    paths = [[(sx(y), y) for y in ys_]]
    for k, v in c.items():
        yy = v[1] + 14
        paths.append([(d[k], v[1] + 2), (d[k], yy), (sx(yy), yy)])
    return dict(lw=390, lh=860, isl=(24, 52, 342, 702), p=3.2, under=64, casas=c, pond=(272, 676, 18, 10), rest=(195, 330), paths=paths,
                n=(18, 20, 10, 14, 150), deco=[dict(k="pozo_balde_arriba", x=250, y=372, rx=11), dict(k="cartel", x=sx(480) - 20, y=480, rx=6), dict(k="farolito", x=sx(250) - 20, y=250, rx=3), dict(k="farolito", x=sx(470) + 20, y=470, rx=3),
                      dict(k="puesto", x=250, y=630, rx=14), dict(k="buzon_bandera_arriba", x=sx(716) - 22, y=716, rx=4), dict(k="barril", x=80, y=272, rx=5),
                      dict(k="jardin:maceta_tulipanes", x=sx(190) + 24, y=190, rx=4), dict(k="jardin:maceta_margaritas", x=sx(330) - 24, y=330, rx=4),
                      dict(k="banco_derecha", x=sx(204) + 32, y=204, rx=11),
                      dict(k="farolito", x=sx(370) - 20, y=370, rx=3), dict(k="farolito", x=sx(600) + 20, y=600, rx=3), dict(k="farolito", x=sx(560) - 20, y=560, rx=3),
                      dict(k="jardin:enrejado", x=262, y=440, rx=8), dict(k="cerca_baja_derecha", x=78, y=520, rx=0),
                      dict(k="jardin:maceta_lavanda", x=sx(640) - 24, y=640, rx=4), dict(k="jardin:maceta_cempasuchil", x=sx(420) + 24, y=420, rx=4)], hub=(195, 330), stream=dict(amp=6, per=60))


def _shift(cfg, dx, lw, lh, dy=0):
    """Agranda el cielo alrededor de la isla (para que se vea completa sin bordes vacíos)."""
    ix, iy, iw, ih = cfg["isl"]
    cfg["isl"] = (ix + dx, iy + dy, iw, ih)
    cfg["casas"] = {k: (x + dx, y + dy) for k, (x, y) in cfg["casas"].items()}
    cfg["pond"] = (cfg["pond"][0] + dx, cfg["pond"][1] + dy, cfg["pond"][2], cfg["pond"][3])
    cfg["rest"] = (cfg["rest"][0] + dx, cfg["rest"][1] + dy)
    cfg["paths"] = [[(x + dx, y + dy) for (x, y) in pth] for pth in cfg["paths"]]
    cfg["deco"] = [dict(d, x=d["x"] + dx, y=d["y"] + dy) for d in cfg["deco"]]
    cfg["hub"] = (cfg["hub"][0] + dx, cfg["hub"][1] + dy)
    cfg["lw"], cfg["lh"] = lw, lh
    return cfg


ORIENT = {"h": _shift(_h(), 130, 1020, 600), "v": _shift(_v(), 50, 490, 880)}


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


PASTO = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "public", "milicenda-assets", "code")


_SH = {}


def sheet(n):
    if n not in _SH:
        _SH[n] = (np.array(Image.open(os.path.join(PASTO, n + ".png")).convert("RGBA")), json.load(open(os.path.join(PASTO, n + ".json"))))
    return _SH[n]


def stamp(img, ok, n, name, x, y):
    """Pega una pieza de las hojas de pasto con su esquina sup-izq en (x, y), solo donde `ok`."""
    im_, js = sheet(n)
    d = js[name]
    sp = im_[d["y"]:d["y"] + d["h"], d["x"]:d["x"] + d["w"]]
    lh, lw = ok.shape
    for j in range(d["h"]):
        for i in range(d["w"]):
            yy, xx = y + j, x + i
            if sp[j, i, 3] and 0 <= yy < lh and 0 <= xx < lw and ok[yy, xx]:
                img[yy, xx, :3] = sp[j, i, :3]


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
    stal = [(cx0 + 4, 24, U + 52), (cx0 - iw * 0.27, 13, U + 26), (cx0 + iw * 0.3, 12, U + 20), (cx0 - iw * 0.08, 8, U + 14)]
    rs = random.Random(1234 + ord(key))
    for _ in range(max(4, int(iw / 70))):
        stal.append((cx0 + rs.uniform(-0.38, 0.38) * iw, rs.randint(7, 12), U + rs.randint(10, 36)))
    B = np.zeros((lh, lw), bool)
    S = np.zeros((lh, lw), bool)
    Sx = np.zeros((lh, lw), float)
    for x in range(lw):
        if yb[x] < 0:
            continue
        u = abs(x - cx0) / (iw / 2)
        d = U * max(0, 1 - u ** 1.6) ** 0.8 + bump.get(x, 0) * min(1, (1 - u) * 4)
        dm = d
        best = None
        for (sx, bw, ext) in stal:
            dx = abs(x - sx)
            if dx < bw:
                dd = (ext) * (1 - (dx / bw) ** 1.1) + (rs.random() - 0.5) * 1.6
                if dd > d:
                    d = dd
                    best = (sx, bw)
        top = yb[x] + CLIFF + 1
        bot = int(top + d)
        if bot > top:
            B[top:min(lh, bot), x] = True
            if best is not None and d > dm:
                S[int(top + dm):min(lh, bot), x] = True
                Sx[int(top + dm):min(lh, bot), x] = (x - best[0]) / best[1]
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

    def vnoise(seed, cell, thr, step=3):
        """Manchas orgánicas: ruido de valor en celdas, suavizado y cuantizado en bloques de `step` px."""
        r = random.Random(seed)
        gh, gw = lh // cell + 3, lw // cell + 3
        grid = np.array([[r.random() for _ in range(gw)] for _ in range(gh)])
        yy, xx = np.mgrid[:lh, :lw]
        yy = (yy // step) * step + step / 2
        xx = (xx // step) * step + step / 2
        gy, gx = yy / cell, xx / cell
        y0, x0 = gy.astype(int), gx.astype(int)
        fy, fx = gy - y0, gx - x0
        fy, fx = fy * fy * (3 - 2 * fy), fx * fx * (3 - 2 * fx)
        v = (grid[y0, x0] * (1 - fx) + grid[y0, x0 + 1] * fx) * (1 - fy) + (grid[y0 + 1, x0] * (1 - fx) + grid[y0 + 1, x0 + 1] * fx) * fy
        return v > thr

    # piso: texturas A/B/C de Code (256x256, encajan en cualquier orden), enmascaradas a la isla
    texs = [np.array(Image.open(os.path.join(PASTO, ("pasto_textura_celu_%s.png" if key == "v" else "pasto_textura_%s.png") % k)).convert("RGB")) for k in "ABC"]
    rt = random.Random(5 + ord(key))
    for yy0 in range(0, lh, 256):
        for xx0 in range(0, lw, 256):
            t = rt.choice(texs)
            hh, ww = min(256, lh - yy0), min(256, lw - xx0)
            blk = img[yy0:yy0 + hh, xx0:xx0 + ww]
            m = T[yy0:yy0 + hh, xx0:xx0 + ww]
            blk[m, :3] = t[:hh, :ww][m]
            blk[m, 3] = 255
    if key == "v":
        RAMP = [(0x35, 0x56, 0x3a), (0x58, 0x7a, 0x35), (0x8a, 0xa2, 0x3a), (0xbc, 0xc0, 0x46), (0xe2, 0xd8, 0x70)]
        def shift(mask, d):
            for i, c in enumerate(RAMP):
                j = i + d
                if 0 <= j < len(RAMP):
                    sel = mask & (img[:, :, 0] == c[0]) & (img[:, :, 1] == c[1]) & (img[:, :, 2] == c[2])
                    img[sel, :3] = RAMP[j]
        chk = ((xs + ys) % 2 == 0)
        tibio = (vnoise(7, 80, 0.67) | (vnoise(7, 80, 0.62) & chk)) & T
        umbra = (vnoise(9, 100, 0.68) | (vnoise(9, 100, 0.63) & chk)) & T & ~tibio
        orig = img.copy()
        shift(tibio, 1)
        img2 = img.copy(); img[:] = orig; shift(umbra, -1)
        img[tibio] = img2[tibio]
    dark = np.zeros((lh, lw), bool)
    light = dark
    SHEET = {n: (np.array(Image.open(os.path.join(PASTO, n + ".png")).convert("RGBA")), json.load(open(os.path.join(PASTO, n + ".json")))) for n in ("pasto_medianas_hoja", "pasto_extra_hoja")}
    def decal(sheet, name, x, y):
        im_, js = SHEET[sheet]
        d = js[name]
        sp = im_[d["y"]:d["y"] + d["h"], d["x"]:d["x"] + d["w"]]
        if not (0 <= y and y + d["h"] < lh and 0 <= x and x + d["w"] < lw):
            return
        if not (T[y, x] and T[y, x + d["w"] - 1] and T[y + d["h"] - 1, x] and T[y + d["h"] - 1, x + d["w"] - 1]):
            return
        m = sp[:, :, 3] > 0
        img[y:y + d["h"], x:x + d["w"]][m, :3] = sp[m, :3]
    def sprinkle(sheet, names, n, dist=0):
        for _ in range(n):
            nm = rnd.choice(names)
            x = rnd.randrange(ix + 3, ix + iw - 3)
            y = rnd.randrange(iy + 3, iy + ih - 3)
            decal(sheet, nm, x, y)
    M = "pasto_medianas_hoja"; X = "pasto_extra_hoja"
    sprinkle(M, [f"mancha_mediana_clara_{i}" for i in (1, 2, 3)] + [f"mancha_mediana_oscura_{i}" for i in (4, 5, 6)] + ["mancha_mediana_mixta_7", "mancha_mediana_mixta_8"], int(lw * lh / 7000))
    sprinkle(M, [f"claro_de_luz_{i}" for i in (1, 2, 3, 4)], int(lw * lh / 70000))
    sprinkle(X, [f"mata_alta_{i}" for i in range(1, 7)], int(lw * lh / 12000))
    sprinkle(X, [f"mechon_{i}" for i in range(1, 7)], int(lw * lh / 4000))
    sprinkle(X, ["flor_azul_1", "flor_azul_2", "flor_violeta_1", "flor_violeta_2", "trebol_1", "trebol_2", "hojas_caidas_1", "hojas_caidas_2", "hojas_caidas_3"], int(lw * lh / 5000))

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
    # tiras de pasto sobre el borde del camino (piezas de Code): la línea oscura de la tira reemplaza el borde del camino
    BJ = sheet("pasto_bordes_hoja")
    def tira(nm):
        im_, js = BJ
        d = js[nm]
        return im_[d["y"]:d["y"] + d["h"], d["x"]:d["x"] + d["w"]]
    Pu = np.roll(Pin, 1, 0); Pd = np.roll(Pin, -1, 0); Pl = np.roll(Pin, 1, 1); Pr = np.roll(Pin, -1, 1)
    for y_, x_ in np.argwhere(Pin & ~Pu):               # borde de arriba: pasto arriba, tierra abajo
        sp = tira("borde_tierra_recta_pasto_arriba")
        for r in range(1, sp.shape[0]):
            yy = y_ + r - 1
            if sp[r, x_ % 16, 3] and yy < lh and (r == 1 or Pin[yy, x_]):
                img[yy, x_, :3] = sp[r, x_ % 16, :3]
    for y_, x_ in np.argwhere(Pin & ~Pd & Pu):          # borde de abajo
        sp = tira("borde_tierra_recta_pasto_abajo")
        for r in range(2, 5):
            yy = y_ - (4 - r)
            if sp[r, x_ % 16, 3] and (r == 4 or Pin[yy, x_]):
                img[yy, x_, :3] = sp[r, x_ % 16, :3]
    for y_, x_ in np.argwhere(Pin & ~Pl & Pu & Pd):     # borde izquierdo
        sp = tira("borde_tierra_recta_pasto_izq")
        for c in (1, 2):
            xx = x_ + c - 1
            if sp[y_ % 16, c, 3] and (c == 1 or Pin[y_, xx]):
                img[y_, xx, :3] = sp[y_ % 16, c, :3]
    for y_, x_ in np.argwhere(Pin & ~Pr & Pu & Pd):     # borde derecho
        sp = tira("borde_tierra_recta_pasto_der")
        for c in (3, 4):
            xx = x_ - (4 - c)
            if sp[y_ % 16, c, 3] and (c == 4 or Pin[y_, xx]):
                img[y_, xx, :3] = sp[y_ % 16, c, :3]
    # matas altas pegadas al borde de los caminitos (rompen la línea recta)
    PX = SHEET[X][0]; PJ = SHEET[X][1]
    pe = np.argwhere(edge)
    for _ in range(int(len(pe) / 70)):
        yy_, xx_ = pe[rnd.randrange(len(pe))]
        nm = "mata_alta_%d" % rnd.randint(1, 6)
        d_ = PJ[nm]
        ox = xx_ + rnd.choice((-d_["w"] - 1, 2)); oy = yy_ - d_["h"] + rnd.randint(0, 3)
        if 0 <= ox and ox + d_["w"] < lw and 0 <= oy and oy + d_["h"] < lh and T[oy:oy + d_["h"], ox:ox + d_["w"]].all() and not P[oy:oy + d_["h"], ox:ox + d_["w"]].any():
            sp = PX[d_["y"]:d_["y"] + d_["h"], d_["x"]:d_["x"] + d_["w"]]
            mm = sp[:, :, 3] > 0
            img[oy:oy + d_["h"], ox:ox + d_["w"]][mm, :3] = sp[mm, :3]
    # piedritas
    for _ in range(30):
        y, x = rnd.randrange(lh), rnd.randrange(lw)
        if P[y, x] and not edge[y, x] and P[y, x + 2]:
            img[y, x, :3] = rgb("#a8a08e"); img[y, x + 1, :3] = rgb("#d6cbb0")

    # ---- estanque + arroyo sinuoso
    pcx, pcy, prx, pry = cfg["pond"]
    Wm = np.zeros((lh, lw), bool)
    ellipse(Wm, pcx, pcy, prx, pry)
    ellipse(Wm, pcx - prx * 0.55, pcy - 3, prx * 0.55, pry * 0.85)
    ellipse(Wm, pcx + prx * 0.6, pcy + 3, prx * 0.5, pry * 0.8)
    ellipse(Wm, pcx + prx * 0.1, pcy + pry * 0.6, prx * 0.4, pry * 0.6)
    amp, per = cfg["stream"]["amp"], cfg["stream"]["per"]
    ytop = int(pcy + pry * 0.5)
    exit_x = pcx
    ybot = int(yb[int(pcx)]) + CLIFF + 1
    for y in range(ytop, ybot):
        t = (y - ytop) / max(1, (yb[int(pcx)] - ytop))
        cxs = pcx + amp * math.sin((y - ytop) / per * 6.28) * min(1, t * 3) * (1 - 0.6 * max(0, t - 0.75) / 0.25)
        w = 3.2 + 1.8 * t
        for x in range(int(cxs - w), int(cxs + w) + 1):
            if 0 <= x < lw:
                Wm[y, x] = True
        exit_x = cxs
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
    # manchas con relieve, pasto pisado en las puertas y juncos en la orilla
    okg = T & ~Pin & ~Wm
    rr2 = random.Random(404 + ord(key))
    for nm, cnt in (("mancha_relieve_l", int(lw * lh / 160000) + 1), ("mancha_relieve_m", int(lw * lh / 60000) + 1), ("mancha_relieve_s", int(lw * lh / 35000) + 1)):
        for _ in range(cnt):
            x = rr2.randrange(ix + 4, ix + iw - 50); y = rr2.randrange(iy + 4, iy + ih - 24)
            stamp(img, okg, "pasto_extra_hoja", nm, x, y)
    for id_, (bx, by_) in cfg["casas"].items():
        dxp = bx - 32 + PUERTA[id_]
        stamp(img, okg, "pasto_extra_hoja", "pasto_pisado_1", dxp - 27, by_ - 1)
        stamp(img, okg, "pasto_extra_hoja", "pasto_pisado_3", dxp + 7, by_ + 1)
    bk = np.argwhere(bank & ~Pin & ~Wm)
    for _ in range(7):
        y_, x_ = bk[rr2.randrange(len(bk))]
        stamp(img, okg, "pasto_bordes_hoja", "juncos_%d" % rr2.randint(1, 3), int(x_) - 4, int(y_) - 13)
    for _ in range(9):
        y_, x_ = bk[rr2.randrange(len(bk))]
        stamp(img, okg, "pasto_bordes_hoja", "piedrita_%d" % rr2.randint(1, 4), int(x_) - 3, int(y_) - 3)
    # borde claro de pasto sobre el banco (arriba)
    # agua (se pinta por cuadro)
    Wedge = Wm & ~(np.roll(Wm, 1, 0) & np.roll(Wm, -1, 0) & np.roll(Wm, 1, 1) & np.roll(Wm, -1, 1))
    Win = Wm & ~Wedge

    # ---- panza: tierra + roca con luz arriba-izquierda
    def nz(seed, cell):
        r = random.Random(seed)
        gh, gw = lh // cell + 3, lw // cell + 3
        grid = np.array([[r.random() for _ in range(gw)] for _ in range(gh)])
        yy, xx = np.mgrid[:lh, :lw]
        gy, gx = yy / cell, xx / cell
        y0, x0 = gy.astype(int), gx.astype(int)
        fy, fx = gy - y0, gx - x0
        fy, fx = fy * fy * (3 - 2 * fy), fx * fx * (3 - 2 * fx)
        return (grid[y0, x0] * (1 - fx) + grid[y0, x0 + 1] * fx) * (1 - fy) + (grid[y0 + 1, x0] * (1 - fx) + grid[y0 + 1, x0 + 1] * fx) * fy
    n1, n2 = nz(71, 9), nz(72, 5)
    BODY = C | B
    # espesor de la tierra por columna (ondulado)
    soilT = np.zeros(lw)
    for x in range(lw):
        soilT[x] = CLIFF + 11 + 4 * math.sin(x / 23.0) + 3 * math.sin(x / 7.3 + 1)
    SOIL = ["#f2bd6e", "#dc9544", "#b96d32", "#8a4e2a", "#5a3322", "#4a2c1f"]
    ROCK = ["#d6cbb0", "#a8a08e", "#77707c", "#463f4a"]
    colbot = np.full(lw, 0)
    for x in range(lw):
        ys_ = np.where(BODY[:, x])[0]
        if len(ys_):
            colbot[x] = ys_.max()
    for y in range(lh):
        for x in range(lw):
            if not BODY[y, x]:
                continue
            d = y - (yb[x] + 1)
            u = (x - cx0) / (iw / 2)
            tot = max(1, colbot[x] - yb[x])
            v = d / tot
            sh = (u + 0.5) * 1.4 + (n1[y, x] - 0.5) * 0.9 + (((x + y) % 2) - 0.5) * 0.26      # 0 = iluminado, sube hacia la derecha
            if d < soilT[x] + (n2[y, x] - 0.5) * 3:
                # capas de tierra con vetas onduladas
                strat = int((d + 2.2 * math.sin(x / 5.0)) // 5)
                t = 1 + max(0, min(2, int(sh))) + (1 if strat % 3 == 2 else 0)
                if d < 2:
                    t += 2          # sombra bajo el labio de pasto
                elif d < 4:
                    t += 1
                col = SOIL[max(0, min(5, t))]
            else:
                t = 1 + max(0, min(1, int(sh + 0.15))) + (1 if v > 0.5 + (n2[y, x] - 0.5) * 0.3 else 0)
                if d < soilT[x] + 3:
                    t += 1          # sombra de la tierra sobre la roca
                col = ROCK[max(0, min(3, t))]
            img[y, x, :3] = rgb(col)
            img[y, x, 3] = 255
    # estalactitas: luz propia de cada una (izquierda clara, derecha oscura) y vetas
    for y, x in np.argwhere(S):
        ul = Sx[y, x]
        t = 1 if ul < -0.35 else (2 if ul < 0.25 else 3)
        if (x + y // 3) % 7 == 0 and t < 3:
            t += 1
        img[y, x, :3] = rgb(ROCK[t])
    # rocas con relieve: luz arriba-izquierda, sombra abajo-derecha
    def roca(cx, cy, rx, ry, base):
        m = np.zeros((lh, lw), bool)
        ellipse(m, cx, cy, rx, ry)
        m &= BODY
        up = np.roll(m, 1, 0); lf = np.roll(m, 1, 1)
        dn = np.roll(m, -1, 0); rt = np.roll(m, -1, 1)
        hi = m & (~up | ~lf)
        lo = m & (~dn | ~rt) & ~hi
        pr = ROCK if base == "r" else SOIL
        k = 2 if base == "r" else 2
        for mk, off in ((m, 0), (hi, -1), (lo, 1)):
            idx = max(0, min(len(pr) - 1, k + off))
            img[mk, :3] = rgb(pr[idx])
    rr = random.Random(77)
    for _ in range(int(iw / 11)):
        x = rr.randrange(ix + 6, ix + iw - 6)
        if yb[x] < 0:
            continue
        d0 = soilT[x] + 3 + rr.randrange(0, max(2, colbot[x] - yb[x] - int(soilT[x]) - 6))
        roca(x, yb[x] + d0, rr.randint(3, 7), rr.randint(2, 4), "r")
    for _ in range(int(iw / 14)):
        x = rr.randrange(ix + 6, ix + iw - 6)
        if yb[x] < 0:
            continue
        roca(x, yb[x] + rr.randint(4, int(soilT[x]) - 2), rr.randint(2, 4), rr.randint(1, 2), "s")
    # luz de borde: izquierda clara, derecha oscura (volumen del cuerpo)
    lfe = BODY & ~np.roll(BODY, 1, 1)
    rte = BODY & ~np.roll(BODY, -1, 1)
    for y, x in np.argwhere(lfe):
        for k in range(2):
            if x + k < lw and BODY[y, x + k]:
                c0 = tuple(img[y, x + k, :3])
                for pal in (SOIL, ROCK):
                    for i, hx in enumerate(pal):
                        if rgb(hx) == c0 and i > 0:
                            img[y, x + k, :3] = rgb(pal[i - 1]); break
    for y, x in np.argwhere(rte):
        c0 = tuple(img[y, x, :3])
        for pal in (SOIL, ROCK):
            for i, hx in enumerate(pal):
                if rgb(hx) == c0 and i < len(pal) - 1:
                    img[y, x, :3] = rgb(pal[i + 1]); break
    # raíces que cuelgan de la tierra, con ramitas
    for _ in range(int(iw / 30)):
        x = rr.randrange(ix + 8, ix + iw - 8)
        if yb[x] < 0:
            continue
        L = rr.randint(9, 18)
        xx = x
        for k in range(L):
            y = yb[x] + 3 + k
            if y < lh and BODY[y, xx]:
                img[y, xx, :3] = rgb("#4a2c1f" if k % 4 else "#5a3322")
            if k % 4 == 3:
                xx += rr.choice((-1, 1))
            if k in (5, 9) and rr.random() < 0.7:
                bx = xx + rr.choice((-1, 1))
                for j in range(1, 4):
                    if 0 <= y + j // 2 < lh and BODY[y + j // 2, bx + j * (1 if bx > xx else -1)]:
                        img[y + j // 2, bx + j * (1 if bx > xx else -1), :3] = rgb("#4a2c1f")
    # huesitos y piedritas claras en la tierra
    for _ in range(int(iw / 25)):
        x = rr.randrange(ix + 6, ix + iw - 6)
        if yb[x] < 0:
            continue
        y = yb[x] + rr.randint(5, int(soilT[x]) - 3)
        if BODY[y, x + 3] and BODY[y + 1, x + 3]:
            for dx in range(4):
                img[y, x + dx, :3] = rgb("#fbf3e4")
            img[y + 1, x, :3] = rgb("#d6cbb0"); img[y + 1, x + 3, :3] = rgb("#d6cbb0")
    # grietas en la roca
    for _ in range(int(iw / 30)):
        x = rr.randrange(ix + 8, ix + iw - 8)
        if yb[x] < 0:
            continue
        y = yb[x] + int(soilT[x]) + 4 + rr.randrange(0, 8)
        for k in range(rr.randint(6, 12)):
            if 0 <= y < lh and B[y, x]:
                img[y, x, :3] = rgb("#463f4a")
            y += 1
            if k % 2:
                x += rr.choice((-1, 1))
    # flequillo de pasto y musgo que cuelga del labio
    lip = T & ~np.roll(T, -1, 0)
    for y, x in np.argwhere(lip):
        img[y, x, :3] = rgb("#587a35")
    # flequillo de pasto y musgo (piezas de Code), siguiendo el labio de cada columna
    x = ix
    while x < ix + iw:
        nm = "flequillo_isla_%d" % rr.randint(1, 6)
        im_, js = sheet("pasto_extra_hoja")
        d = js[nm]
        sp = im_[d["y"]:d["y"] + d["h"], d["x"]:d["x"] + d["w"]]
        for i in range(d["w"]):
            xx = x + i
            if xx >= lw or yb[xx] < 0:
                continue
            for j in range(d["h"]):
                yy = yb[xx] + 1 + j
                if sp[j, i, 3] and yy < lh and BODY[yy, xx]:
                    img[yy, xx, :3] = sp[j, i, :3]
        x += d["w"]
    # luz arriba-izquierda: borde claro de la superficie
    topl = T & (~np.roll(T, 1, 0) | ~np.roll(T, 1, 1))
    put(topl, "#e2d870")
    # flequillo de pasto sobre el cielo (piezas de Code): hojitas hacia afuera en el contorno de arriba, izquierda y derecha
    blade = np.zeros((lh, lw), bool)
    sky = ~(T | C | B)
    for y_, x_ in np.argwhere(T):
        if y_ < 1 or x_ < 1 or x_ >= lw - 1:
            continue
        if sky[y_ - 1, x_]:
            sp = tira("flequillo_cielo_arriba")
            for r in range(0, 8):
                yy = y_ - (7 - r)
                if yy >= 0 and sp[r, x_ % 16, 3] and (sky[yy, x_] or r == 7):
                    img[yy, x_, :3] = sp[r, x_ % 16, :3]; img[yy, x_, 3] = 255
                    if r < 7: blade[yy, x_] = True
        elif sky[y_, x_ - 1]:
            sp = tira("flequillo_cielo_izq")
            for c in range(0, 8):
                xx = x_ - (7 - c)
                if xx >= 0 and sp[y_ % 16, c, 3] and (sky[y_, xx] or c == 7):
                    img[y_, xx, :3] = sp[y_ % 16, c, :3]; img[y_, xx, 3] = 255
                    if c < 7: blade[y_, xx] = True
        elif sky[y_, x_ + 1]:
            sp = tira("flequillo_cielo_der")
            for c in range(2, 6):
                xx = x_ + (c - 2) + 0
                if xx < lw and sp[y_ % 16, c, 3] and (sky[y_, xx] or c == 2):
                    img[y_, xx, :3] = sp[y_ % 16, c, :3]; img[y_, xx, 3] = 255
                    if c > 2: blade[y_, xx] = True
    # sombras de casas y árboles se hornean después (ver abajo)
    solid2 = T | C | B
    # contorno exterior
    outline = np.zeros_like(solid2)
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        outline |= np.roll(np.roll(solid2, dy, 0), dx, 1) & ~solid2
    outline[0, :] = False
    outline &= ~blade
    # la parte de arriba no lleva sombra: el contorno completo es #2e1b14
    return dict(exit_x=exit_x, img=img, T=T, C=C, B=B, P=Pin, Wm=Wm, Win=Win, Wedge=Wedge, outline=outline, yb=yb, bank=bank, cfg=cfg, rnd=rnd, lip=lip)


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
    pcx = g["exit_x"]
    bot = int(g["yb"][int(pcx)] + CLIFF + 1)
    for x in range(int(pcx - 5), int(pcx + 5)):
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
            if x in (int(pcx - 5), int(pcx + 4)):
                c = "#2c9488"
            img[y, x, :3] = rgb(c)
            img[y, x, 3] = 255
    # puente de tablones que cruza el arroyo por el caminito (cenital, alineado)
    by = g["cfg"].get("bridge_y")
    if by is not None:
        H = 5
        rows = Wm[by - H:by + H + 1]
        cols = np.where(rows.any(0))[0]
        x0, x1 = int(cols.min()) - 9, int(cols.max()) + 9
        for y in range(by - H, by + H + 1):
            for x in range(x0, x1 + 1):
                if y in (by - H, by + H):
                    c = "#2e1b14"
                elif y in (by - H + 1, by + H - 1):
                    c = "#8a4e2a" if y == by + H - 1 else "#b96d32"
                elif False:
                    c = "#5a3322"
                else:
                    c = "#e0b070" if ((x - x0) // 3 + (y - by) // 3) % 2 == 0 else "#bf8444"
                    if (x - x0) % 3 == 2:
                        c = "#8a4e2a"
                if x in (x0, x1) and abs(y - by) <= H:
                    c = "#2e1b14"
                img[y, x, :3] = rgb(c)
                img[y, x, 3] = 255
        for px_ in (x0 + 1, x0 + 2, x1 - 2, x1 - 1):
            for y in (by - H + 1, by + H - 1):
                img[y, px_, :3] = rgb("#5a3322")
        # sombra del puente sobre el agua
        for x in range(x0 + 2, x1 - 1):
            if Wm[by + H + 1, x]:
                img[by + H + 1, x, :3] = rgb("#1b5f66")
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
        if Wm[max(0, y - 12):y + 8, max(0, x - 16 - margen):x + 16 + margen].any():
            return False
        # la copa tapa lo que está arriba del pie: tampoco sobre el sendero
        if tipo == "arbol" and P[max(0, y - 42):max(0, y - 2), max(0, x - 20):x + 20].any():
            return False
        if tipo == "arbusto" and margen == 0 and P[max(0, y - 14):max(0, y - 1), max(0, x - 9):x + 9].any():
            return False
        return True
    out = {"props": [], "flores": [], "girasoles": [], "deco": cfg["deco"]}
    pts = [(d["x"], d["y"]) for d in cfg["deco"]]
    for (hx_, hy_) in casas.values():
        pts.append((hx_, hy_ - 12))

    def poisson(n, mind, tipo, margen=0, tries=6000):
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
    arboles = ["arbol_redondo"] * 4 + ["arbol_frutal"] * 3 + ["pino"] * 5 + ["sauce"] * 2 + ["alamo"] * 3 + ["arbol_paraguas"] * 2
    for i, (x, y) in enumerate(poisson(nt, 34, "arbol")):
        k = "arbol_grande_puerta" if i == 0 else rnd.choice(arboles)
        out["props"].append({"k": k, "x": x, "y": y})
    if cfg["key"] == "v":
        def borde(x, y):
            return not (T[y, x - 30] and T[y, x + 30])
        got = []
        for _ in range(9000):
            if len(got) >= 16:
                break
            x = rnd.randrange(ix + 8, ix + iw - 8); y = rnd.randrange(iy + 20, iy + ih - 10)
            if not libre(x, y, 0, "arbol") or not borde(x, y):
                continue
            if all(math.hypot(x - a, y - b) >= 26 for a, b in pts):
                got.append((x, y)); pts.append((x, y))
        for (x, y) in got:
            out["props"].append({"k": rnd.choice(["pino", "pino", "arbol_redondo", "sauce", "alamo", "arbol_frutal"]), "x": x, "y": y})
    arbustos = ["arbusto_1", "arbusto_2", "arbusto_3", "arbusto_4_alto", "arbusto_5_bayas", "jardin:arbusto_flores_rosas", "jardin:arbusto_flores_blancas", "jardin:arbusto_flores_amarillas"]
    for (x, y) in poisson(nb, 24, "arbusto"):
        out["props"].append({"k": rnd.choice(arbustos), "x": x, "y": y})
    rocas = ["roca_1", "roca_2", "roca_3", "roca_4_apilada", "tronco_1", "tronco_2", "tocon_1", "tocon_2"]
    for (x, y) in poisson(nr, 26, "arbusto"):
        out["props"].append({"k": rnd.choice(rocas), "x": x, "y": y})
    for (x, y) in poisson(max(8, nb), 14, "arbusto", tries=9000):
        out["props"].append({"k": rnd.choice(["hongos_1", "hongos_2", "hongos_3", "hongos_4", "hongos_5", "hongos_6", "jardin:pasto_alto_1", "jardin:pasto_alto_2", "jardin:pasto_alto_3"]), "x": x, "y": y})
    for (x, y) in poisson(ng, 30, "arbusto"):
        out["girasoles"].append({"x": x, "y": y, "g": rnd.choice(["girasol_grande", "girasol_grande", "girasol_chico"])})
    # flores en grupitos (2 especies por ramo) y algunas sueltas
    especies = ["tulipan", "margarita", "lavanda", "jacinto", "dalia", "amapola", "lirio", "pensamiento"]
    for (cx_, cy_) in poisson(max(4, nfl // 6), 38, "arbusto", tries=9000):
        ks = rnd.sample(especies, 3 if cfg["key"] == "v" else 2)
        n_ = rnd.randint(8, 14) if cfg["key"] == "v" else rnd.randint(3, 6)
        puestos = []
        for _ in range(60):
            if len(puestos) >= n_:
                break
            a_ = rnd.uniform(0, 6.283); r_ = rnd.uniform(4, 24 if cfg["key"] == "v" else 15)
            x = int(cx_ + math.cos(a_) * r_); y = int(cy_ + math.sin(a_) * r_ * 0.7)
            if not libre(x, y, 0, "arbusto"):
                continue
            if all(math.hypot(x - a, y - b) >= 8 for a, b in pts):
                puestos.append((x, y)); pts.append((x, y))
        for (x, y) in puestos:
            out["flores"].append({"x": x, "y": y, "k": rnd.choice(ks)})
    for (x, y) in poisson(max(4, nfl // 5), 13, "arbusto", tries=9000):
        out["flores"].append({"x": x, "y": y, "k": rnd.choice(especies)})
    return out


SOMBRA = {  # (dx, dy, rx, ry) por tipo de prop
    "arbol_grande_puerta": (0, -2, 20, 6), "sauce": (0, -1, 15, 5), "arbol_paraguas": (2, -1, 16, 5), "alamo": (1, -1, 8, 3),
    "arbol": (2, -1, 12, 4), "pino": (1, -1, 11, 4), "arbusto": (0, 0, 9, 3), "roca": (0, 0, 7, 2), "tronco": (0, 0, 10, 3), "tocon": (0, 0, 7, 2),
    "hongos": (0, 0, 4, 1), "jardin:arbusto": (0, 0, 9, 3), "jardin:pasto": (0, 0, 5, 1),
}


def sombra_de(k):
    for pref in sorted(SOMBRA, key=len, reverse=True):
        if k.startswith(pref):
            return SOMBRA[pref]
    return (0, 0, 6, 2)


def main():
    layout = {}
    for key, cfg in ORIENT.items():
        cfg["key"] = key
        g = build(key, cfg)
        pob = poblar(g, cfg)
        objs = [(a["x"] + sombra_de(a["k"])[0], a["y"] + sombra_de(a["k"])[1], sombra_de(a["k"])[2], sombra_de(a["k"])[3]) for a in pob["props"]]
        objs += [(a["x"], a["y"], 4, 2) for a in pob["girasoles"]]
        objs += [(d["x"], d["y"] - 1, max(1, d.get("rx", 9)), 3) for d in cfg["deco"] if d["k"] not in ("puente", "puente_nat")]
        okm = g["T"] & ~g["P"] & ~g["Wm"]
        rm = random.Random(808 + ord(key))
        for a_ in pob["props"]:
            if a_["k"] in ("alamo", "arbol_frutal", "arbol_grande_puerta", "arbol_paraguas", "arbol_redondo", "pino"):
                nm = "anillo_base_arbol_%d" % (3 if a_["k"] == "pino" else (2 if a_["k"] == "arbol_grande_puerta" else rm.choice((1, 3))))
                d_ = sheet("pasto_medianas_hoja")[1][nm]
                stamp(g["img"], okm, "pasto_medianas_hoja", nm, int(a_["x"] - d_["w"] / 2), int(a_["y"] - d_["h"] + 4))
        for id_, (bx, by_) in cfg["casas"].items():
            for sd, nm in ((-1, "mata_pared_2"), (1, "mata_pared_1")):
                d_ = sheet("pasto_extra_hoja")[1][nm]
                stamp(g["img"], okm, "pasto_extra_hoja", nm, bx + (-36 if sd < 0 else 12), by_ - d_["h"] + 1)
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
                           pond=list(cfg["pond"]), rest=list(cfg["rest"]), paths=[[list(pt) for pt in pth] for pth in cfg["paths"]], nf=NF, **pob)
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
