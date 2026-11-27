import { useEffect, useRef } from "react";
import type { PlaceId } from "../../content";
import { ASSETS, CASITAS_TOP, TOP, topLayout } from "./config";
import atNat from "./atlas/naturaleza_hoja_v2_mix.json";
import atDeco from "./atlas/deco_hoja_v2_mix.json";
import atNat3 from "./atlas/naturaleza_v3.json";
import atDeco3 from "./atlas/deco_v3.json";
import atJar from "./atlas/jardin_hoja_mix.json";
import atFlor from "./atlas/flores_hoja_mix.json";
import atGira from "./atlas/girasoles.json";
import atMece from "./atlas/mecen_hoja_mix.json";
import atBich from "./atlas/bichitos_hoja_mix.json";
import atPuesto from "./atlas/puesto.json";
import atLuces from "./atlas/luces.json";
import atBosque from "./atlas/bosque_arboles.json";
import atCasEx from "./atlas/casitas_extras.json";

type Meta = { x: number; y: number; w: number; h: number; frames?: { x: number; y: number }[]; ms?: number };
type Atlas = { spr: Spr; meta: Record<string, Meta> };
const RAMP_V: [number, number, number][] = [[0x35, 0x56, 0x3a], [0x58, 0x7a, 0x35], [0x8a, 0xa2, 0x3a], [0xbc, 0xc0, 0x46], [0xe2, 0xd8, 0x70]];
/** Copia del atlas con los verdes corridos un escalón en la rampa (árbol más oscuro o más claro). */
function shiftAtlas(at: { spr: Spr; meta: Record<string, Meta> }, d: number) {
  const src = at.spr.day;
  const c = document.createElement("canvas");
  c.width = src.width; c.height = src.height;
  const cg = c.getContext("2d")!;
  cg.drawImage(src, 0, 0);
  const im = cg.getImageData(0, 0, c.width, c.height);
  const a = im.data;
  for (let i = 0; i < a.length; i += 4) {
    if (!a[i + 3]) continue;
    for (let k = 0; k < RAMP_V.length; k++) {
      const r = RAMP_V[k];
      if (a[i] === r[0] && a[i + 1] === r[1] && a[i + 2] === r[2]) {
        const t = RAMP_V[Math.max(0, Math.min(RAMP_V.length - 1, k + d))];
        a[i] = t[0]; a[i + 1] = t[1]; a[i + 2] = t[2];
        break;
      }
    }
  }
  cg.putImageData(im, 0, 0);
  return { spr: toSpr(c as unknown as HTMLImageElement), meta: at.meta };
}

async function atlas(file: string, meta: unknown): Promise<Atlas> {
  return { spr: toSpr(await loadImage(`code/${file}.png`)), meta: meta as Record<string, Meta> };
}
import { loadImage, mulberry, mix, hexRgb, nightFactorFromClock, silueta, toSpr, SKY_DAY, SKY_NIGHT, SKY_DUSK, type IslaControl, type IslaMode, type Spr, type State } from "./IsoIsland";

/**
 * Motor de la isla flotante VISTA DESDE ARRIBA (cenital 3/4). El suelo está horneado en 4 cuadros (agua animada);
 * encima se dibujan árboles, arbustos, casitas, flores y bichitos ordenados por y. Todo en un canvas a resolución
 * lógica (lw x lh) escalado con número entero y image-rendering: pixelated.
 */

// cielo del celu: más alto y con más color (azul arriba, durazno en el horizonte)
const SKY_DAY_V = ["#5fa8e6", "#74b6ea", "#8cc6ee", "#a3d4ee", "#b9e0ea", "#d2ead8", "#f1efc4", "#f9dcb0"];

type Props = {
  portrait: boolean;
  mode: IslaMode;
  hoverId: PlaceId | null;
  visited?: PlaceId[];
  onReady?: (api: IslaControl) => void;
};

type Draw = { y: number; x: number; fn: (g: CanvasRenderingContext2D, st: State) => void };

type Engine = {
  setMode: (m: IslaMode) => void;
  setHover: (id: PlaceId | null) => void;
  setVisited: (ids: PlaceId[]) => void;
  setParallax: (x: number, y: number) => void;
  stop: () => void;
};

async function createEngine(canvas: HTMLCanvasElement, portrait: boolean, initial: { mode: IslaMode; hover: PlaceId | null }): Promise<Engine> {
  const L = topLayout(portrait);
  const D = TOP[portrait ? "v" : "h"];
  const key = portrait ? "v" : "h";
  const { lw, lh } = L;
  const [ix, iy, iw, ih] = D.isl;
  canvas.width = lw;
  canvas.height = lh;
  const g = canvas.getContext("2d")!;
  g.imageSmoothingEnabled = false;
  const still = (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches) || /[?&]sin-movimiento/.test(window.location.search);

  const ids = Object.keys(CASITAS_TOP) as PlaceId[];
  const names = Object.values(ASSETS);
  const imgs = await Promise.all(names.map(loadImage));
  const A: Record<string, HTMLImageElement | null> = {};
  Object.keys(ASSETS).forEach((k, i) => (A[k] = imgs[i]));
  const atlasN = async (file: string, meta: unknown): Promise<Atlas> => ({ spr: toSpr(await loadImage(`code/${file}.png`), await loadImage(`code/${file}_noche.png`)), meta: meta as Record<string, Meta> });
  const [aNat, aDeco, aJar, aFlor, aGira, aMece, aBich, aPuesto, aLuz, aBq, aCasEx, aN3, aD3] = await Promise.all([
    atlas("naturaleza_hoja_v2_mix", atNat), atlas("deco_hoja_v2_mix", atDeco), atlas("jardin_hoja_mix", atJar), atlas("flores_hoja_mix", atFlor),
    atlas("girasoles_hoja", atGira), atlas("mecen_hoja_mix", atMece), atlas("bichitos_hoja_mix", atBich), atlas("puesto_papeleria_v2", atPuesto), atlas("pasto_luces_hoja", atLuces),
    atlas("bosque_arboles_hoja", atBosque), atlas("casitas_extras_hoja", atCasEx),
    atlasN("naturaleza_v3_hoja", atNat3), atlasN("deco_v3_hoja", atDeco3),
  ]);
  const treeVar = (at: Atlas): Atlas[] => [at, shiftAtlas(at, -1), shiftAtlas(at, 1)];
  const natV = treeVar(aNat), meceV = treeVar(aMece);
  const aSombra = { spr: toSpr(A.arbolSombra), meta: {} as Record<string, Meta> };
  void aSombra;
  const suelo = await Promise.all(Array.from({ length: D.nf as number }, (_, f) => loadImage(`generados/isla_${key}_${f}.png`)));
  const casaImgs = await Promise.all(ids.flatMap((id) => [loadImage(CASITAS_TOP[id].file), loadImage(CASITAS_TOP[id].fileNoche)]));

  const S = {
    arbol: toSpr(A.arbol), flores: toSpr(A.flores),
    nubeS: toSpr(A.nubeS), nubeM: toSpr(A.nubeM), nubeL: toSpr(A.nubeL), sol: toSpr(A.sol), luna: toSpr(A.luna),
  };
  const sueloS = suelo.map((im) => toSpr(im));
  const casas = ids.map((id, k) => ({ id, spr: toSpr(casaImgs[k * 2], casaImgs[k * 2 + 1]), c: CASITAS_TOP[id], pos: D.casas[id] as number[] }));

  const rnd = mulberry(20261);
  const sparkles = Array.from({ length: 14 }, () => ({ x: ix + 10 + rnd() * (iw - 20), y: iy + 10 + rnd() * (ih - 20), ph: Math.floor(rnd() * 16) }));
  const stars = Array.from({ length: 70 }, () => ({ x: rnd() * lw, y: rnd() * lh * 0.62, s: rnd() < 0.18 ? 2 : 1, ph: Math.floor(rnd() * 12) }));
  const flies = Array.from({ length: 18 }, (_, k) => ({ x: ix + 12 + rnd() * (iw - 24), y: iy + 12 + rnd() * (ih - 24), ph: rnd() * 6.28, sp: 0.4 + rnd() * 0.6, k }));
  const clouds = [
    { spr: S.nubeL, y: lh * 0.06, x: 20, sp: 2.2, k: 0.25, far: true },
    { spr: S.nubeM, y: lh * 0.2, x: lw * 0.7, sp: 3.4, k: 0.35, far: true },
    { spr: S.nubeS, y: lh * 0.12, x: lw * 0.4, sp: 4.1, k: 0.4, far: true },
    { spr: S.nubeM, y: lh * (portrait ? 0.9 : 0.92), x: lw * 0.1, sp: 5.2, k: -0.6, far: false },
    { spr: S.nubeL, y: lh * (portrait ? 0.78 : 0.86), x: lw * 0.6, sp: 4.4, k: -0.8, far: false },
  ];

  let pending = false;
  let nTarget = nightFactorFromClock();
  let n = nTarget;
  let hover: PlaceId | null = initial.hover;
  let visitedSet = new Set<PlaceId>();
  let par = { x: 0, y: 0 };
  const setMode = (m: IslaMode) => {
    nTarget = m === "day" ? 0 : m === "night" ? 1 : nightFactorFromClock();
    if (still) { n = nTarget; request(); }
  };
  nTarget = initial.mode === "day" ? 0 : initial.mode === "night" ? 1 : nightFactorFromClock();
  n = nTarget;

  function put(sp: Spr, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, st: State, alpha = 1) {
    dx = Math.round(dx); dy = Math.round(dy);
    if (st.n < 0.999) {
      g.globalAlpha = alpha;
      g.drawImage(sp.day, sx, sy, sw, sh, dx, dy, sw, sh);
    }
    if (st.n > 0.001) {
      g.globalAlpha = alpha * (st.n < 0.999 ? st.n : 1);
      g.drawImage(sp.night, sx, sy, sw, sh, dx, dy, sw, sh);
    }
    g.globalAlpha = 1;
  }

  // luces nocturnas: sprite con sus colores de día (no pasa por el filtro de noche) + halo suave
  const lit = (m: Meta, fi: number, cx: number, by: number, st: State, halo: number) => {
    const fr = m.frames![fi % m.frames!.length];
    const dx = Math.round(cx - m.w / 2), dy = Math.round(by - m.h);
    const a = Math.min(1, (st.n - 0.5) * 2);
    g.globalAlpha = 0.16 * a;
    g.fillStyle = "#ffd36b";
    for (let r = -halo; r <= halo; r++) {
      const w = Math.round(halo * 1.5 * Math.sqrt(1 - (r / (halo + 0.5)) ** 2));
      g.fillRect(Math.round(cx - w), Math.round(by - m.h / 2) + r, w * 2, 1);
    }
    g.globalAlpha = a;
    g.drawImage(aLuz.spr.day, fr.x, fr.y, m.w, m.h, dx, dy, m.w, m.h);
    g.globalAlpha = 1;
  };

  /* --- objetos ordenados por y (ancla = centro abajo del sprite) --- */
  const objects: Draw[] = [];
  const drawM = (at: Atlas, m: Meta, fi: number, cx: number, by: number, st: State) => {
    const fr = m.frames ? m.frames[fi % m.frames.length] : { x: m.x, y: m.y };
    put(at.spr, fr.x, fr.y, m.w, m.h, cx - m.w / 2, by - m.h, st);
  };
  const frameAt = (m: Meta, t: number, ph = 0) => (m.frames ? Math.floor((t * 1000) / (m.ms ?? 300) + ph) % m.frames.length : 0);
  const HONGO3 = ["rojo", "beige", "violeta", "marron", "blanco", "amarillo"];
  const ALIAS3: Record<string, string> = { arbusto_4_alto: "arbusto_4", arbusto_5_bayas: "arbusto_5", "jardin:arbusto_flores_blancas": "arbusto_flores_blanca", "jardin:arbusto_flores_amarillas": "arbusto_flores_amarilla", "jardin:pasto_alto_1": "pasto_alto_1", "jardin:pasto_alto_2": "pasto_alto_2", "jardin:pasto_alto_3": "pasto_alto_3", banco_derecha: "banco_costado" };
  const v3Key = (k: string): string => {
    const hm = /^hongos_(\d)$/.exec(k);
    if (hm) return `hongo_${hm[1]}_${HONGO3[+hm[1] - 1]}`;
    return ALIAS3[k] ?? k;
  };
  const findAt = (k: string): [Atlas, Meta] | null => {
    const k3 = v3Key(k);
    if (aN3.meta[k3] && !k3.startsWith("sombra_")) return [aN3, aN3.meta[k3]];
    if (aD3.meta[k3] && k3 !== "farolito_halo") return [aD3, aD3.meta[k3]];
    if (k.startsWith("jardin:")) { const m = aJar.meta[k.slice(7)]; return m ? [aJar, m] : null; }
    if (aNat.meta[k]) return [aNat, aNat.meta[k]];
    if (aDeco.meta[k]) return [aDeco, aDeco.meta[k]];
    return null;
  };
  for (const p of D.props as { k: string; x: number; y: number }[]) {
    if (p.k.startsWith("bq_")) {
      // árbol grande del bosque: sombra (y=-2, bajo todo), helecho al pie, tronco + copa (el sauce mece la copa)
      const q = "arbol_" + p.k.slice(3);
      const c = aBq.meta[`${q}_copa`], t = aBq.meta[`${q}_tronco`], h = aBq.meta[`${q}_sombra`], mm = aBq.meta[`${q}_copa_mece`];
      if (!c || !t) continue;
      const X = Math.round(p.x - 32), Y0 = Math.round(p.y - 78), ph = Math.abs(Math.round(p.x * 3 + p.y)) % 8;
      if (h) objects.push({ x: p.x, y: -2, fn: (_g, st) => { const ox = (h as Meta & { ox?: number }).ox ?? 0, oy = (h as Meta & { oy?: number }).oy ?? 0; put(aBq.spr, h.x, h.y, h.w, h.h, X + ox, Y0 + oy, st); } });
      if (ph % 2 === 0) {
        const hf = aBq.meta[`helecho_${1 + (ph % 3)}`];
        const fx = Math.round(p.x + (ph % 4 ? 13 : -13)), fy = Math.round(p.y + 2);
        if (hf) objects.push({ x: fx, y: fy, fn: (_g, st) => put(aBq.spr, hf.x, hf.y, hf.w, hf.h, fx - hf.w / 2, fy - hf.h, st) });
      }
      objects.push({ x: p.x, y: p.y, fn: (_g, st) => {
        const fr = mm && mm.frames && !still ? mm.frames[(Math.floor((st.t * 1000) / (mm.ms || 220)) + ph) % mm.frames.length] : c;
        put(aBq.spr, t.x, t.y, t.w, t.h, X, Y0, st);
        put(aBq.spr, fr.x, fr.y, c.w, c.h, X, Y0, st);
      } });
      continue;
    }
    if (p.k === "arbol_grande_puerta") {
      // árbol con puertita (entrada al jueguito): pie pisado, árbol y luz de noche
      const T = aD3.meta["arbol_puerta"], TL = aD3.meta["arbol_puerta_luz"], R = aD3.meta["anillo_pisado_1"];
      objects.push({ x: p.x, y: -1, fn: (_g, st) => put(aD3.spr, R.x, R.y, R.w, R.h, p.x - R.w / 2, p.y - R.h + 8, st) });
      objects.push({ x: p.x, y: p.y, fn: (_g, st) => {
        put(aD3.spr, T.x, T.y, T.w, T.h, p.x - T.w / 2, p.y - 90, st);
        if (st.n > 0.05) put(aD3.spr, TL.x, TL.y, TL.w, TL.h, p.x - TL.w / 2, p.y - 90, st, st.n);
      } });
      continue;
    }
    const f = findAt(p.k);
    if (!f) continue;
    const ph = rnd() * 8;
    if (f[0] === aN3) {
      const sh = aN3.meta[`sombra_${v3Key(p.k)}`];
      if (sh) objects.push({ x: p.x, y: -2, fn: (_g, st) => put(aN3.spr, sh.x, sh.y, sh.w, sh.h, p.x - f[1].w / 2 + 2, p.y - sh.h + 2, st) });
    }
    const mece = aMece.meta[`${p.k}_mece`];
    const esArbol = /^(arbol|pino|sauce|alamo)/.test(p.k);
    const vi = esArbol ? Math.abs(Math.floor(p.x * 7 + p.y * 13)) % 3 : 0;
    const hm = /^hongos_(\d)$/.exec(p.k);
    const luz = hm ? aLuz.meta[`hongos_brillo_${[1, 1, 2, 2, 3, 3][+hm[1] - 1]}`] : null;
    objects.push({ x: p.x, y: p.y, fn: (_g, st) => {
      if (luz && st.n > 0.5) { lit(luz, still ? 0 : frameAt(luz, st.t, ph), p.x, p.y, st, 5); return; }
      if (mece && !still) drawM(meceV[vi], mece, frameAt(mece, st.t, ph), p.x, p.y, st);
      else drawM(f[0] === aNat ? natV[vi] : f[0], f[1], f[1].frames && !still ? frameAt(f[1], st.t, ph) : 0, p.x, p.y, st);
    } });
  }
  for (const d of D.deco as { k: string; x: number; y: number }[]) {
    if (d.k === "puesto") {
      const m = aPuesto.meta["puesto_papeleria_v2"];
      objects.push({ x: d.x, y: d.y, fn: (_g, st) => drawM(aPuesto, m, still ? 0 : frameAt(m, st.t), d.x, d.y, st) });
      continue;
    }
    const f = findAt(d.k);
    if (!f) continue;
    if (d.k === "farolito") {
      const hl = aD3.meta["farolito_halo"];
      objects.push({ x: d.x, y: d.y + 40, fn: (_g, st) => { if (st.n > 0.05) put(aD3.spr, hl.x, hl.y, hl.w, hl.h, d.x - hl.w / 2, d.y - 22 - hl.h / 2, st, st.n * 0.6); } });
    }
    const isBridge = d.k === "puente";
    objects.push({ x: d.x, y: isBridge ? -1 : d.y, fn: (_g, st) => {
      const alt = d.k === "pozo_balde_arriba" && !still && Math.floor(st.t / 2.2) % 2 === 1 ? aDeco.meta["pozo_balde_abajo"] : f[1];
      drawM(f[0], alt, alt.frames && !still ? frameAt(alt, st.t) : 0, d.x, d.y, st);
    } });
  }
  // puente de tablones donde el caminito cruza el arroyo (compu); dibujado a mano, con versión de noche
  if (!portrait) {
    const BW = 26, BH = 16, bc = document.createElement("canvas");
    bc.width = BW; bc.height = BH;
    const b = bc.getContext("2d")!;
    const px = (c: string, x: number, y: number, w = 1, h = 1) => { b.fillStyle = c; b.fillRect(x, y, w, h); };
    px("#2e1b14", 0, 0, BW, BH);
    for (let x = 0; x < BW; x++) {
      px(x % 3 === 2 ? "#8a4e2a" : (Math.floor(x / 3) % 2 === 0 ? "#e0b070" : "#bf8444"), x, 1, 1, BH - 2);
    }
    px("#b96d32", 0, 1, BW, 1); px("#8a4e2a", 0, 2, BW, 1);          // baranda de arriba
    px("#b96d32", 0, BH - 4, BW, 1); px("#8a4e2a", 0, BH - 3, BW, 1); // baranda de abajo
    for (const [qx, qy] of [[1, 1], [BW - 3, 1], [1, BH - 4], [BW - 3, BH - 4]]) { px("#2e1b14", qx - 1, qy - 1, 4, 4); px("#5a3322", qx, qy, 2, 2); px("#bf8444", qx, qy, 1, 1); }
    // los extremos quedan abiertos: las tablas siguen el caminito
    px("#8a4e2a", 0, 3, 1, BH - 7); px("#8a4e2a", BW - 1, 3, 1, BH - 7);
    const bspr = toSpr(bc as unknown as HTMLImageElement);
    const bx = 493, by = 385;
    objects.push({ x: bx, y: by + BH, fn: (_g, st) => put(bspr, 0, 0, BW, BH, bx, by, st) });
    // sombra del puente sobre el agua
    objects.push({ x: bx, y: by + BH, fn: (gg, st) => { gg.globalAlpha = 0.35; gg.fillStyle = st.n > 0.5 ? "#10284a" : "#1b5f66"; gg.fillRect(bx + 3, by + BH, BW - 6, 2); gg.globalAlpha = 1; } });
  }
  // rayos de luz entre copas (solo de día), sobre algunos árboles grandes
  (D.props as { k: string; x: number; y: number }[]).filter((q) => q.k.startsWith("bq_") && !q.k.endsWith("_chico")).filter((_, i) => i % 9 === 4).forEach((q, i) => {
    const m = aD3.meta[`rayos_luz_${1 + (i % 2)}`];
    objects.push({ x: q.x, y: q.y + 200, fn: (_g, st) => { if (st.n < 0.95) put(aD3.spr, m.frames ? m.frames[still ? 0 : frameAt(m, st.t, i)].x : m.x, m.frames ? m.frames[still ? 0 : frameAt(m, st.t, i)].y : m.y, m.w, m.h, q.x - m.w / 2 + 6, q.y - 62, st, 0.9 * (1 - st.n)); } });
  });
  for (const fl of D.flores as { x: number; y: number; k: string }[]) {
    const m = aFlor.meta[fl.k];
    const luz = fl.k === "margarita" ? aLuz.meta["luciernaga_flor_blanca"] : fl.k === "dalia" ? aLuz.meta["luciernaga_flor_rosa"] : null;
    const lph = (fl.x * 7 + fl.y * 3) % 5;
    if (m) objects.push({ x: fl.x, y: fl.y, fn: (_g, st) => {
      if (luz && st.n > 0.5) lit(luz, still ? 0 : frameAt(luz, st.t, lph), fl.x, fl.y, st, 5);
      else drawM(aFlor, m, 0, fl.x, fl.y, st);
    } });
  }
  (D.girasoles as { x: number; y: number; g: string }[]).forEach((s2, k) => {
    const m = aGira.meta[s2.g] ?? aGira.meta["girasol_grande"];
    objects.push({ x: s2.x, y: s2.y, fn: (_g, st) => drawM(aGira, m, still ? 0 : (Math.floor(st.t * 2.5 + k) % 2), s2.x, s2.y, st) });
  });
  for (const h of casas) {
    const [bx, by] = h.pos;
    const x0 = bx - 32, y0 = by - h.c.base;
    const shM = aCasEx.meta[`sombra_${({ periodismo: "redaccion", diseno: "estudio", dibujo: "taller", programacion: "laboratorio", casita: "casita" } as Record<string, string>)[h.id] ?? ""}`] as (Meta & { ox: number; oy: number }) | undefined;
    if (shM) objects.push({ x: bx, y: -2, fn: (_g, st) => put(aCasEx.spr, shM.x, shM.y, shM.w, shM.h, x0 + shM.ox, y0 + shM.oy, st) });
    const sen = aCasEx.meta[`senda_piedras_${1 + (ids.indexOf(h.id) % 2)}`], fel = aCasEx.meta["felpudo"];
    const dX = x0 + h.c.puerta;
    if (sen) objects.push({ x: bx, y: -1, fn: (_g, st) => put(aCasEx.spr, sen.x, sen.y, sen.w, sen.h, dX - sen.w / 2, by - 2, st) });
    if (fel) objects.push({ x: bx, y: by + 1, fn: (_g, st) => put(aCasEx.spr, fel.x, fel.y, fel.w, fel.h, dX - fel.w / 2, by - 3, st) });
    objects.push({ x: bx, y: by, fn: (gg, st) => {
      const fr = Math.floor((st.t * 1000) / h.c.ms) % h.c.frames;
      const hov = st.hover === h.id;
      const bounce = hov ? -(Math.floor(st.t * 5) % 2) : 0;
      // luz de la puerta sobre el pasto: de noche, al pasar el mouse y en los lugares ya visitados
      const vis = visitedSet.has(h.id);
      const lightA = Math.max(0.22 * st.n, hov ? 0.2 : 0, vis ? 0.12 : 0);
      if (lightA > 0.02) {
        gg.globalAlpha = lightA;
        gg.fillStyle = "#ffd36b";
        for (let r = -5; r <= 5; r++) {
          const w = Math.round(14 * Math.sqrt(1 - (r / 6) * (r / 6)));
          gg.fillRect(Math.round(x0 + h.c.puerta - w), by + 6 + r, w * 2, 1);
        }
        gg.globalAlpha = 1;
      }
      if (hov) {
        const sil = silueta(h.spr.day, fr * h.c.fw, 0, h.c.fw, h.c.fh);
        for (const [ddx, ddy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) gg.drawImage(sil, x0 + ddx, y0 + ddy + bounce);
      }
      put(h.spr, fr * h.c.fw, 0, h.c.fw, h.c.fh, x0, y0 + bounce, st);
      if (hov && !st.still) {
        // destellitos que titilan sobre el techo
        gg.fillStyle = "#fff1a8";
        [[0.2, 8], [0.5, 0], [0.8, 10]].forEach(([fx, fy], i) => {
          const ph = (st.t * 2.2 + i * 0.7) % 2;
          if (ph > 1) return;
          const sx = Math.round(x0 + h.c.fw * fx), sy = Math.round(y0 + fy + bounce), a = ph < 0.5 ? 1 : 0;
          gg.fillRect(sx, sy, 1, 1);
          if (a) { gg.fillRect(sx - 1, sy, 3, 1); gg.fillRect(sx, sy - 1, 1, 3); }
        });
      }
      if (vis) {
        // sello de "visitado": chapita verde con tilde, junto a la puerta
        const cx = Math.round(x0 + h.c.puerta + 24), cy = by - 6;
        gg.fillStyle = "#2e1b14";
        gg.fillRect(cx - 4, cy - 3, 9, 7); gg.fillRect(cx - 3, cy - 4, 7, 9);
        gg.fillStyle = "#587a35";
        gg.fillRect(cx - 3, cy - 2, 7, 5); gg.fillRect(cx - 2, cy - 3, 5, 7);
        gg.fillStyle = "#fffdf7";
        for (const [qx, qy] of [[-2, 0], [-1, 1], [0, 0], [1, -1], [2, -2]]) gg.fillRect(cx + qx, cy + qy, 1, 1);
      }
      const puffs = h.c.humo ? (hov ? 6 : 4) : 0;
      for (let p = 0; p < puffs; p++) {
        const life = ((st.t * (hov ? 7 : 4.5) + p * (10 / puffs)) % 10) / 10;
        const px = x0 + (h.c.humo?.[0] ?? 0) + Math.round(life * 7 + Math.sin(life * 6 + p) * 1.5);
        const py = y0 + (h.c.humo?.[1] ?? 0) - Math.round(life * 20) + bounce;
        gg.globalAlpha = 1 - life * 0.9;
        gg.fillStyle = st.n > 0.5 ? "#a8a08e" : life < 0.5 ? "#fffdf7" : "#c8ecdc";
        const sz = life < 0.35 ? 2 : 3;
        gg.fillRect(px, py, sz, sz);
        gg.globalAlpha = 1;
      }
    } });
  }
  // patos en el estanque
  const [pcx, pcy, prx, pry] = D.pond as number[];
  const patos = [{ r: prx * 0.45, sp: 0.5, ph: 0 }, { r: prx * 0.3, sp: 0.37, ph: 2.4 }];
  const mPatos = aBich.meta["patitos_nadando"];
  for (const p of patos) {
    objects.push({ x: pcx, y: pcy + 6, fn: (_g, st) => {
      const a = st.t * p.sp + p.ph;
      const x = pcx + Math.round(Math.cos(a) * p.r), y = pcy + Math.round(Math.sin(a) * (pry * 0.35));
      drawM(aBich, mPatos, still ? 0 : frameAt(mPatos, st.t, p.ph), x, y + 3, st);
    } });
  }
  // bichitos que andan por la isla
  const vola = [
    { n: "mariposa_rosa", x0: ix + iw * 0.3, y0: iy + ih * 0.45, sx: 70, sy: 22, sp: 0.5, ph: 0 },
    { n: "mariposa_lila", x0: ix + iw * 0.62, y0: iy + ih * 0.68, sx: 60, sy: 18, sp: 0.42, ph: 2 },
    { n: "mariposa_rosa", x0: ix + iw * 0.8, y0: iy + ih * 0.3, sx: 50, sy: 16, sp: 0.6, ph: 4 },
    { n: "abeja", x0: ix + iw * 0.45, y0: iy + ih * 0.3, sx: 36, sy: 12, sp: 0.9, ph: 1 },
    { n: "libelula", x0: pcx, y0: pcy - 8, sx: 46, sy: 14, sp: 0.7, ph: 3 },
  ];
  for (const b of vola) {
    const m = aBich.meta[b.n];
    objects.push({ x: b.x0, y: lh + 10, fn: (_g, st) => {
      const a = st.t * b.sp + b.ph;
      drawM(aBich, m, still ? 0 : frameAt(m, st.t), b.x0 + Math.cos(a) * b.sx, b.y0 + Math.sin(a * 1.7) * b.sy + m.h / 2, st);
    } });
  }
  objects.sort((a, b) => a.y - b.y || a.x - b.x);

  function frame(st: State) {
    const t = st.t;
    const nn = st.n;
    // cielo en franjas
    const warm = Math.sin(Math.PI * Math.min(1, Math.max(0, nn))) * 0.55;
    const SD = SKY_DAY_V;
    const bands = SD.length;
    for (let b = 0; b < bands; b++) {
      const bi = Math.min(SKY_NIGHT.length - 1, Math.floor((b * SKY_NIGHT.length) / bands));
      let col = mix(SD[b], SKY_NIGHT[bi], nn);
      if (warm > 0.02) {
        const d = SKY_DUSK[bi];
        const base = hexRgb(SD[b]);
        const nb = hexRgb(SKY_NIGHT[bi]);
        const m = base.map((v, k) => v + (nb[k] - v) * nn);
        const dd = hexRgb(d);
        col = `rgb(${Math.round(m[0] + (dd[0] - m[0]) * warm)},${Math.round(m[1] + (dd[1] - m[1]) * warm)},${Math.round(m[2] + (dd[2] - m[2]) * warm)})`;
      }
      g.fillStyle = col;
      const y0 = Math.floor((lh * b) / bands), y1 = Math.floor((lh * (b + 1)) / bands);
      g.fillRect(0, y0, lw, y1 - y0);
    }
    const px = par.x, py = par.y;
    // estrellas (noche)
    if (nn > 0.15) {
      g.fillStyle = "#fff6d6";
      for (const s of stars) {
        const tw = (Math.floor(t * 2 + s.ph) % 6) === 0;
        if (nn < 0.99 && (s.ph % 3) / 3 > nn) continue;
        const x = Math.round(s.x + px * 1), y = Math.round(s.y + py * 1);
        if (s.s === 2) {
          g.fillRect(x, y + 1, 3, 1); g.fillRect(x + 1, y, 1, 3);
          if (tw) { g.fillRect(x - 1, y + 1, 1, 1); g.fillRect(x + 3, y + 1, 1, 1); }
        } else if (!tw) g.fillRect(x, y, 1, 1);
      }
    }
    // sol y luna
    const sunX = lw * (portrait ? 0.22 : 0.14) + px * 4, sunY = lh * 0.1 + py * 3;
    const moonX = lw * (portrait ? 0.78 : 0.72) + px * 4, moonY = lh * 0.1 + py * 3;
    const sunVis = 1 - nn, moonVis = nn;
    if (sunVis > 0.02) {
      g.globalAlpha = sunVis;
      g.drawImage(S.sol.day, (Math.floor(t * 1.5) % 2) * 32, 0, 32, 32, Math.round(sunX), Math.round(sunY + nn * 24), 32, 32);
      g.globalAlpha = 1;
    }
    if (moonVis > 0.02) {
      g.globalAlpha = moonVis;
      g.drawImage(S.luna.day, Math.round(moonX), Math.round(moonY + (1 - nn) * 24));
      g.globalAlpha = 1;
    }
    // nubes de atrás
    for (const c of clouds) {
      if (!c.far) continue;
      const span = lw + c.spr.w + 40;
      const x = ((c.x + t * c.sp) % span) - c.spr.w - 10 + px * c.k * 4;
      put(c.spr, 0, 0, c.spr.w, c.spr.h, x, c.y + py * c.k * 2, st);
    }
    // pajaritos (de día)
    if (nn < 0.7) {
      g.fillStyle = "#463f4a";
      for (let k = 0; k < 3; k++) {
        const span = lw + 60;
        const bx = Math.round(((t * (5 + k * 1.7) + k * 170) % span) - 30 + px * 3);
        const by = Math.round(lh * (0.16 + k * 0.07) + Math.sin(t * 0.8 + k) * 3 + py * 2);
        const wing = Math.floor(t * 4 + k) % 2 === 0;
        const pts = wing ? [[-3, -1], [-2, 0], [-1, 0], [0, 1], [1, 0], [2, 0], [3, -1]] : [[-3, 1], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [3, 1]];
        g.globalAlpha = 1 - nn / 0.7;
        for (const [dx, dy] of pts) g.fillRect(bx + dx, by + dy, 1, 1);
        g.globalAlpha = 1;
      }
    }
    // isla (sube y baja suavemente)
    const bob = 0; // v34: el terreno no se mece
    const cxI = ix + iw / 2;
    // sombra de la isla (se achica cuando sube)
    g.globalAlpha = 0; // v34: sin sombra de isla
    g.fillStyle = "#1b5f66";
    const shW = iw * 0.55 - bob * 3, shY = Math.min(lh - 8, iy + ih + 78);
    for (let r = -5; r <= 5; r++) {
      const w = Math.round(shW * Math.sqrt(1 - (r / 6) * (r / 6)));
      g.fillRect(Math.round(cxI - w / 2), shY + r, w, 1);
    }
    g.globalAlpha = 1;

    g.save();
    g.translate(0, bob); // la isla no se corre con el parallax: queda alineada con carteles y Clocky
    const fi = still ? 0 : (((Math.floor(t * 4) % sueloS.length) + sueloS.length) % sueloS.length);
    put(sueloS[fi], 0, 0, lw, lh, 0, 0, st);
    for (const o of objects) o.fn(g, st);
    // rayos de luz entre las copas (solo de día): franjas diagonales que respiran despacio
    if (st.n < 0.7) {
      const k = 1 - st.n / 0.7;
      g.fillStyle = "#f9e07a";
      for (let i = 0; i < 7; i++) {
        const bx = ix + 30 + ((i * 97 + 40) % (iw - 60));
        const w = 9 + (i % 3) * 4;
        const a = (0.05 + 0.04 * Math.sin(t * 0.5 + i * 1.7)) * k;
        if (a <= 0.005) continue;
        g.globalAlpha = a;
        for (let y = iy + 30; y < iy + ih - 40; y += 2) {
          const x = Math.round(bx + (y - iy) * 0.35);
          g.fillRect(x, y, w, 2);
        }
      }
      g.globalAlpha = 1;
    }
    // brillitos
    for (const s of sparkles) {
      const f = (Math.floor(t * 4) + s.ph) % 16;
      if (f > 3) continue;
      const x = Math.round(s.x), y = Math.round(s.y);
      g.fillStyle = f === 1 || f === 2 ? "#f9e07a" : "#fffdf7";
      if (f === 1 || f === 2) { g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); }
      else g.fillRect(x, y, 1, 1);
    }
    g.restore();

    // luciérnagas
    if (nn > 0.3) {
      for (const f of flies) {
        const a = t * f.sp + f.ph;
        const x = Math.round(f.x + Math.cos(a) * 14 + Math.sin(a * 0.6) * 8);
        const y = Math.round(f.y + Math.sin(a * 1.3) * 8 + bob);
        const on = (Math.floor(t * 3 + f.k) % 4) !== 0;
        g.globalAlpha = Math.min(1, (nn - 0.3) * 2);
        g.fillStyle = on ? "#fff1a8" : "#ffd36b";
        g.fillRect(x, y, 1, 1);
        if (on) { g.fillStyle = "#ffd36b"; g.fillRect(x - 1, y, 1, 1); g.fillRect(x + 1, y, 1, 1); g.fillRect(x, y - 1, 1, 1); g.fillRect(x, y + 1, 1, 1); }
        g.globalAlpha = 1;
      }
    }
    // nubes de adelante
    for (const c of clouds) {
      if (c.far || true) continue;
      const span = lw + c.spr.w + 40;
      const x = ((c.x + t * c.sp) % span) - c.spr.w - 10 + px * c.k * 4;
      put(c.spr, 0, 0, c.spr.w, c.spr.h, x, c.y + py * c.k * 2, st);
    }
  }

  /* --- bucle --- */
  let raf = 0;
  let stopped = false;
  let lastTick = -1;
  const t0 = performance.now();
  const state: State = { tick: 0, t: 0, n, hover, still };
  function paint(now: number) {
    state.t = still ? 0 : Math.max(0, (now - t0) / 1000);
    state.n = n;
    state.hover = hover;
    frame(state);
  }
  function loop(now: number) {
    if (stopped) return;
    const tick = Math.floor(now / 125);
    if (tick !== lastTick) {
      lastTick = tick;
      if (Math.abs(n - nTarget) > 0.002) n += Math.sign(nTarget - n) * Math.min(0.04, Math.abs(nTarget - n));
      else n = nTarget;
      paint(now);
    }
    raf = requestAnimationFrame(loop);
  }
  function request() {
    if (pending || !still) return;
    pending = true;
    requestAnimationFrame((now) => { pending = false; paint(now); });
  }
  if (still) paint(performance.now()); else raf = requestAnimationFrame(loop);

  return {
    setMode,
    setHover: (id) => { hover = id; request(); },
    setVisited: (ids) => { visitedSet = new Set(ids); request(); },
    setParallax: (x, y) => { par = { x: Math.max(-1, Math.min(1, x)) * 6, y: Math.max(-1, Math.min(1, y)) * 4 }; request(); },
    stop: () => { stopped = true; cancelAnimationFrame(raf); },
  };
}

/* ------------------------------------------------------------------ componente */

export function TopIsland({ portrait, mode, hoverId, visited, onReady }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const engine = useRef<Engine | null>(null);
  const live = useRef({ mode, hoverId, visited });
  live.current = { mode, hoverId, visited };

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let dead = false;
    createEngine(canvas, portrait, { mode: live.current.mode, hover: live.current.hoverId }).then((e) => {
      if (dead) { e.stop(); return; }
      engine.current = e;
      e.setMode(live.current.mode);
      e.setHover(live.current.hoverId);
      e.setVisited(live.current.visited ?? []);
      onReady?.({ setParallax: e.setParallax });
    });
    return () => {
      dead = true;
      engine.current?.stop();
      engine.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portrait]);

  useEffect(() => { engine.current?.setMode(mode); }, [mode]);
  useEffect(() => { engine.current?.setHover(hoverId); }, [hoverId]);
  useEffect(() => { engine.current?.setVisited(visited ?? []); }, [visited]);

  const L = topLayout(portrait);
  return (
    <canvas
      ref={ref}
      width={L.lw}
      height={L.lh}
      aria-hidden="true"
      style={{ display: "block", width: "100%", height: "100%", imageRendering: "pixelated" }}
    />
  );
}
