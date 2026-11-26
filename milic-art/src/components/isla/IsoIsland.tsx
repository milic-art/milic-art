import { useEffect, useRef } from "react";
import type { PlaceId } from "../../content";
import { ASSETS, CASITAS, PANZA, isoLayout } from "./config";
import noche from "./noche_tabla.json";

/**
 * Motor de la isla flotante isométrica (pixel art). Todo se dibuja en un canvas a resolución
 * lógica (lw x lh) y el navegador lo escala con número entero y image-rendering: pixelated.
 * Baldosa 32x16: la baldosa (i, j) va en x = ox + (i - j) * 16, y = oy + (i + j) * 8.
 */

export type IslaMode = "auto" | "day" | "night";

export type IslaControl = {
  /** parallax: x e y entre -1 y 1 (hacia dónde se está mirando) */
  setParallax: (x: number, y: number) => void;
};

type Props = {
  portrait: boolean;
  mode: IslaMode;
  hoverId: PlaceId | null;
  onReady?: (api: IslaControl) => void;
};

/* ------------------------------------------------------------------ utilidades */

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function assetUrl(name: string) {
  const bundled = (window as unknown as { __ASSETS__?: Record<string, string> }).__ASSETS__;
  if (bundled && bundled[name]) return bundled[name];
  return `${import.meta.env.BASE_URL}milicenda-assets/${name}`;
}

function loadImage(name: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = assetUrl(name);
  });
}

const TABLA = new Map<string, [number, number, number]>();
for (const [k, v] of Object.entries(noche as Record<string, string>)) {
  const rgb = (h: string): [number, number, number] => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  TABLA.set(rgb(k).join(","), rgb(v));
}
const LUCES = new Set(["255,211,107", "255,241,168", "255,246,214", "255,243,196"]);

function aNoche(src: HTMLCanvasElement): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = src.width;
  c.height = src.height;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(src, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height);
  const p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    if (p[i + 3] === 0) continue;
    const key = `${p[i]},${p[i + 1]},${p[i + 2]}`;
    if (LUCES.has(key)) continue;
    const m = TABLA.get(key);
    if (m) {
      p[i] = m[0]; p[i + 1] = m[1]; p[i + 2] = m[2];
    } else {
      p[i] = Math.round(p[i] * 0.45 + 0x1b * 0.55);
      p[i + 1] = Math.round(p[i + 1] * 0.45 + 0x18 * 0.55);
      p[i + 2] = Math.round(p[i + 2] * 0.45 + 0x40 * 0.55);
    }
  }
  ctx.putImageData(d, 0, 0);
  return c;
}

type Spr = { day: HTMLCanvasElement; night: HTMLCanvasElement; w: number; h: number };

function toSpr(img: HTMLImageElement | null, nightImg?: HTMLImageElement | null): Spr {
  const c = document.createElement("canvas");
  c.width = img?.width ?? 1;
  c.height = img?.height ?? 1;
  if (img) c.getContext("2d")!.drawImage(img, 0, 0);
  let n: HTMLCanvasElement;
  if (nightImg) {
    n = document.createElement("canvas");
    n.width = nightImg.width;
    n.height = nightImg.height;
    n.getContext("2d")!.drawImage(nightImg, 0, 0);
  } else n = aNoche(c);
  return { day: c, night: n, w: c.width, h: c.height };
}

const siluetas = new Map<HTMLCanvasElement, HTMLCanvasElement>();
function silueta(c: HTMLCanvasElement, sx: number, sy: number, sw: number, sh: number): HTMLCanvasElement {
  const key = c;
  const cacheKey = `${sx},${sy},${sw},${sh}`;
  let sub = (siluetas as unknown as Map<HTMLCanvasElement, Record<string, HTMLCanvasElement>>) as Map<HTMLCanvasElement, any>;
  let rec = sub.get(key);
  if (!rec) { rec = {}; sub.set(key, rec); }
  if (rec[cacheKey]) return rec[cacheKey];
  const o = document.createElement("canvas");
  o.width = sw; o.height = sh;
  const ctx = o.getContext("2d")!;
  ctx.drawImage(c, sx, sy, sw, sh, 0, 0, sw, sh);
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = "#fff1a8";
  ctx.fillRect(0, 0, sw, sh);
  rec[cacheKey] = o;
  return o;
}

/* ------------------------------------------------------------------ escena */

type Draw = { y: number; x: number; fn: (g: CanvasRenderingContext2D, st: State) => void };

type State = { tick: number; t: number; n: number; hover: PlaceId | null; still: boolean };

const SKY_DAY = ["#8fd2d2", "#a9dccf", "#c8ecdc", "#e3efdc", "#fbf3e4"];
const SKY_NIGHT = ["#1b1840", "#252058", "#3a2f6e", "#4d4287", "#6a5aa0"];
const SKY_DUSK = ["#8a5fc0", "#c3a2e6", "#f092a4", "#f4b183", "#f9e07a"];

function hexRgb(h: string): [number, number, number] {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}
function mix(a: string, b: string, t: number) {
  const A = hexRgb(a), B = hexRgb(b);
  return `rgb(${Math.round(A[0] + (B[0] - A[0]) * t)},${Math.round(A[1] + (B[1] - A[1]) * t)},${Math.round(A[2] + (B[2] - A[2]) * t)})`;
}

function nightFactorFromClock(): number {
  const d = new Date();
  const h = d.getHours() + d.getMinutes() / 60;
  if (h >= 7.5 && h < 17.5) return 0;
  if (h >= 17.5 && h < 20) return (h - 17.5) / 2.5;
  if (h >= 20 || h < 5.5) return 1;
  return 1 - (h - 5.5) / 2;
}

type Engine = {
  setMode: (m: IslaMode) => void;
  setHover: (id: PlaceId | null) => void;
  setParallax: (x: number, y: number) => void;
  stop: () => void;
};

async function createEngine(canvas: HTMLCanvasElement, portrait: boolean, initial: { mode: IslaMode; hover: PlaceId | null }): Promise<Engine> {
  const L = isoLayout(portrait);
  const { lw, lh, ox, oy } = L;
  canvas.width = lw;
  canvas.height = lh;
  const g = canvas.getContext("2d")!;
  g.imageSmoothingEnabled = false;
  const still = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ids = Object.keys(CASITAS) as PlaceId[];
  const names = Object.values(ASSETS);
  const imgs = await Promise.all(names.map(loadImage));
  const A: Record<string, HTMLImageElement | null> = {};
  Object.keys(ASSETS).forEach((k, i) => (A[k] = imgs[i]));
  const casaImgs = await Promise.all(ids.flatMap((id) => [loadImage(CASITAS[id].file), loadImage(CASITAS[id].fileNoche)]));
  const panzaImg = await loadImage(PANZA.file);

  const S = {
    arbol: toSpr(A.arbol), arbolSombra: toSpr(A.arbolSombra), pasto: toSpr(A.pasto), borde: toSpr(A.borde),
    flores: toSpr(A.flores), camino: toSpr(A.camino), piedra: toSpr(A.piedra), raiz: toSpr(A.raiz), agua: toSpr(A.agua), cascada: toSpr(A.cascada),
    nubeS: toSpr(A.nubeS), nubeM: toSpr(A.nubeM), nubeL: toSpr(A.nubeL), sol: toSpr(A.sol), luna: toSpr(A.luna),
    girasol: toSpr(A.girasol), mariposas: toSpr(A.mariposas), pato: toSpr(A.pato), panza: toSpr(panzaImg),
  };
  const casas = ids.map((id, k) => ({ id, spr: toSpr(casaImgs[k * 2], casaImgs[k * 2 + 1]) }));

  /* --- ocupación de celdas --- */
  const occ: (string | null)[][] = Array.from({ length: 9 }, () => Array(9).fill(null));
  for (const id of ids) {
    const c = CASITAS[id];
    for (let di = 0; di < 2; di++) for (let dj = 0; dj < 2; dj++) occ[c.a + di][c.b + dj] = "casa:" + id;
  }
  const pond = [[1, 6], [1, 7], [1, 8]];
  for (const [i, j] of pond) occ[i][j] = "agua";
  const isWater = (i: number, j: number) => pond.some(([a, b]) => a === i && b === j);
  // camino de tierra entre las casitas
  const pathCells: [number, number][] = [];
  for (let i = 2; i <= 7; i++) pathCells.push([i, 4]);
  for (let j = 5; j <= 7; j++) pathCells.push([2, j], [5, j]);
  pathCells.push([6, 7], [7, 2], [7, 3]);
  for (const [i, j] of pathCells) if (!occ[i][j]) occ[i][j] = "camino";
  const isPath = (i: number, j: number) => i >= 0 && j >= 0 && i <= 8 && j <= 8 && occ[i]?.[j] === "camino";

  const rnd = mulberry(20260);
  const cx = (i: number, j: number) => ox + (i - j) * 16 + 16;
  const cy = (i: number, j: number) => oy + (i + j) * 8 + 8;

  /* --- baldosas de suelo --- */
  const grass: number[][] = [];
  let prev = -1;
  for (let i = 0; i < 9; i++) {
    grass[i] = [];
    for (let j = 0; j < 9; j++) {
      let v = Math.floor(rnd() * 6);
      if (v === prev || (i > 0 && grass[i - 1][j] === v)) v = (v + 1 + Math.floor(rnd() * 4)) % 6;
      grass[i][j] = v;
      prev = v;
    }
  }
  const blocks: number[][] = [];
  for (let i = 0; i < 9; i++) { blocks[i] = []; for (let j = 0; j < 9; j++) blocks[i][j] = Math.floor(rnd() * 5); }

  /* --- decoración --- */
  type Tree = { i: number; j: number; v: number; ph: number };
  const treeCells: [number, number, number][] = [
    [0, 1, 0], [2, 0, 1], [4, 0, 2], [7, 0, 0], [0, 4, 1], [7, 3, 2], [5, 7, 2], [0, 2, 2],
  ];
  const trees: Tree[] = [];
  for (const [i, j, v] of treeCells) {
    if (!occ[i][j]) { occ[i][j] = "arbol"; trees.push({ i, j, v, ph: rnd() * 6 }); }
  }
  const sunflowers: { i: number; j: number; ph: number }[] = [];
  for (const [i, j] of [[0, 3], [5, 3], [2, 6], [6, 7], [4, 4], [7, 6], [3, 1], [0, 5]] as [number, number][]) {
    if (!occ[i][j]) { occ[i][j] = "girasol"; sunflowers.push({ i, j, ph: rnd() * 4 }); }
  }
  const flowers: { x: number; y: number; v: number }[] = [];
  for (let n = 0; n < 46; n++) {
    const i = Math.floor(rnd() * 8), j = Math.floor(rnd() * 8);
    if (occ[i][j] === "agua" || occ[i][j] === "camino" || (occ[i][j] || "").startsWith("casa")) continue;
    flowers.push({ x: cx(i, j) + Math.round((rnd() - 0.5) * 18), y: cy(i, j) + Math.round((rnd() - 0.5) * 6), v: Math.floor(rnd() * 8) });
  }
  const sparkles = Array.from({ length: 14 }, () => ({ x: ox - 120 + rnd() * 270, y: oy + 20 + rnd() * 120, ph: Math.floor(rnd() * 16) }));
  const stars = Array.from({ length: 70 }, () => ({ x: rnd() * lw, y: rnd() * lh * 0.62, s: rnd() < 0.18 ? 2 : 1, ph: Math.floor(rnd() * 12) }));
  const flies = Array.from({ length: 16 }, (_, k) => ({ x: ox - 100 + rnd() * 250, y: oy + 40 + rnd() * 100, ph: rnd() * 6.28, sp: 0.4 + rnd() * 0.6, k }));
  const clouds = [
    { spr: S.nubeL, y: lh * 0.12, x: 20, sp: 2.2, k: 0.25, far: true },
    { spr: S.nubeM, y: lh * 0.28, x: lw * 0.7, sp: 3.4, k: 0.35, far: true },
    { spr: S.nubeS, y: lh * 0.2, x: lw * 0.4, sp: 4.1, k: 0.4, far: true },
    { spr: S.nubeM, y: lh * (portrait ? 0.7 : 0.8), x: lw * 0.1, sp: 5.2, k: -0.6, far: false },
    { spr: S.nubeL, y: lh * (portrait ? 0.84 : 0.9), x: lw * 0.6, sp: 4.4, k: -0.8, far: false },
    { spr: S.nubeS, y: lh * (portrait ? 0.62 : 0.5), x: lw * 0.95, sp: 3.0, k: -0.5, far: false },
  ];

  let pending = false;
  let nTarget = nightFactorFromClock();
  let n = nTarget;
  let hover: PlaceId | null = initial.hover;
  let par = { x: 0, y: 0 };
  const setMode = (m: IslaMode) => {
    nTarget = m === "day" ? 0 : m === "night" ? 1 : nightFactorFromClock();
    if (still) { n = nTarget; request(); }
  };
  nTarget = initial.mode === "day" ? 0 : initial.mode === "night" ? 1 : nightFactorFromClock();
  n = nTarget;

  /* --- dibujo de sprites con fundido día/noche --- */
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

  /* --- panza y posición --- */
  const pOx = ox - 128; // x del origen del sprite de la panza
  const pOy = oy + 72 - PANZA.left[1];
  const pOxFix = ox - 128 - PANZA.left[0];

  /* --- lista de objetos (se ordenan por y de la base) --- */
  const objects: Draw[] = [];
  const shadows: Draw[] = [];

  for (const t of trees) {
    const x = cx(t.i, t.j), y = cy(t.i, t.j) + 3;
    shadows.push({ x, y, fn: (gg) => {
      gg.globalAlpha = 0.34;
      gg.drawImage(S.arbolSombra.day, x - 9, y - 7);
      gg.globalAlpha = 1;
    } });
    objects.push({ x, y, fn: (gg, st) => {
      const sway = Math.round(Math.sin(st.t * 1.1 + t.ph) * 1.2);
      // el follaje (arriba) se mece; el tronco queda fijo
      const strips = [[0, 14, sway], [14, 12, Math.round(sway / 2)], [26, 22, 0]];
      for (const [sy, sh, off] of strips) put(S.arbol, t.v * 32, sy, 32, sh, x - 16 + off, y - 47 + sy, st);
    } });
  }
  for (const f of flowers) {
    objects.push({ x: f.x, y: f.y, fn: (gg, st) => put(S.flores, f.v * 8, 0, 8, 8, f.x - 4, f.y - 7, st) });
  }
  for (const s of sunflowers) {
    const x = cx(s.i, s.j), y = cy(s.i, s.j) + 3;
    objects.push({ x, y, fn: (gg, st) => put(S.girasol, ((Math.floor(st.t * 2.5 + s.ph) % 2) * 16), 0, 16, 24, x - 8, y - 23, st) });
  }
  // casitas
  const casaInfo = casas.map(({ id, spr }) => {
    const c = CASITAS[id];
    const x = ox + (c.a - c.b) * 16 - 16;
    const y = oy + (c.a + c.b) * 8 - 33;
    return { id, spr, c, x, y };
  });
  for (const h of casaInfo) {
    const baseY = h.y + 61;
    shadows.push({ x: h.x, y: baseY, fn: (gg) => {
      gg.globalAlpha = 0.3;
      gg.fillStyle = "#35563a";
      for (let r = -12; r <= 12; r++) {
        const w = Math.round(30 * (1 - Math.abs(r) / 13));
        gg.fillRect(h.x + 32 - w + 4, h.y + 49 + r + 3, w * 2, 1);
      }
      gg.globalAlpha = 1;
    } });
    objects.push({ x: h.x, y: baseY, fn: (gg, st) => {
      const fr = Math.floor((st.t * 1000) / h.c.ms) % h.c.frames;
      const hov = st.hover === h.id;
      const bounce = hov ? -(Math.floor(st.t * 5) % 2) : 0;
      if (hov) {
        const sil = silueta(h.spr.day, fr * h.c.fw, 0, h.c.fw, h.c.fh);
        for (const [ddx, ddy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) gg.drawImage(sil, h.x + ddx, h.y + ddy + bounce);
      }
      put(h.spr, fr * h.c.fw, 0, h.c.fw, h.c.fh, h.x, h.y + bounce, st);
      // humo de la chimenea
      const puffs = hov ? 6 : 4;
      for (let p = 0; p < puffs; p++) {
        const life = ((st.t * (hov ? 7 : 4.5) + p * (10 / puffs)) % 10) / 10;
        const px = h.x + 44 + Math.round(life * 7 + Math.sin(life * 6 + p) * 1.5);
        const py = h.y + 6 - Math.round(life * 20);
        const sz = life < 0.35 ? 2 : 3;
        gg.globalAlpha = 1 - life * 0.9;
        gg.fillStyle = st.n > 0.5 ? "#a8a08e" : life < 0.5 ? "#fffdf7" : "#c8ecdc";
        gg.fillRect(px, py, sz, sz);
        gg.globalAlpha = 1;
      }
    } });
  }
  // estanque y cascada (suelo)
  const waterTiles: Draw[] = [];

  // patos
  const patos = [
    { cx: cx(1, 7) + 2, cy: cy(1, 7) + 1, r: 5, sp: 0.5, ph: 0 },
    { cx: cx(1, 6) + 1, cy: cy(1, 6) + 1, r: 4, sp: 0.37, ph: 2 },
  ];
  for (const p of patos) {
    objects.push({ x: p.cx, y: p.cy + 3, fn: (gg, st) => {
      const a = st.t * p.sp + p.ph;
      const x = p.cx + Math.round(Math.cos(a) * p.r);
      const y = p.cy + Math.round(Math.sin(a) * 2);
      put(S.pato, (Math.floor(st.t * 2) % 2) * 11, 0, 11, 9, x - 5, y - 6, st);
    } });
  }
  // mariposas
  const maripos = [
    { x0: cx(3, 4), y0: cy(3, 4) - 14, sx: 40, sy: 8, sp: 0.5, ph: 0, c: 0 },
    { x0: cx(5, 6), y0: cy(5, 6) - 12, sx: 34, sy: 7, sp: 0.42, ph: 2, c: 1 },
    { x0: cx(1, 1), y0: cy(1, 1) - 16, sx: 30, sy: 6, sp: 0.6, ph: 4, c: 0 },
  ];
  for (const b of maripos) {
    objects.push({ x: b.x0, y: b.y0 + 100, fn: (gg, st) => {
      const a = st.t * b.sp + b.ph;
      const x = b.x0 + Math.cos(a) * b.sx, y = b.y0 + Math.sin(a * 1.7) * b.sy;
      put(S.mariposas, (b.c * 2 + (Math.floor(st.t * 4) % 2)) * 7, 0, 7, 5, x - 3, y - 2, st);
    } });
  }

  function drawGround(st: State) {
    for (let s = 0; s <= 16; s++) {
      for (let i = 0; i < 9; i++) {
        const j = s - i;
        if (j < 0 || j > 8) continue;
        const x = ox + (i - j) * 16, y = oy + (i + j) * 8;
        const water = isWater(i, j);
        if (water) {
          let flags = 0;
          if (!isWater(i - 1, j) && i - 1 >= 0) flags |= 1;
          if (!isWater(i, j - 1) && j - 1 >= 0) flags |= 2;
          if (!isWater(i + 1, j) && i + 1 <= 8) flags |= 4;
          if (!isWater(i, j + 1) && j + 1 <= 8) flags |= 8;
          if (i - 1 < 0) flags |= 1;
          if (j - 1 < 0) flags |= 2;
          const fr = Math.floor(st.t * 2) % 2;
          put(S.agua, flags * 32, fr * 16, 32, 16, x, y, st);
        } else {
          put(S.pasto, grass[i][j] * 32, 0, 32, 16, x, y, st);
          if (isPath(i, j)) {
            const fl = (isPath(i - 1, j) ? 1 : 0) | (isPath(i, j - 1) ? 2 : 0) | (isPath(i + 1, j) ? 4 : 0) | (isPath(i, j + 1) ? 8 : 0);
            put(S.camino, fl * 32, 0, 32, 16, x, y, st);
          }
        }
        const edgeL = j === 8, edgeR = i === 8;
        if (edgeL || edgeR) {
          if (water) {
            put(S.borde, blocks[i][j] * 32, 0, 16, 32, x, y, st); // cara izquierda del bloque
          } else {
            if (edgeL) put(S.borde, blocks[i][j] * 32, 0, 16, 32, x, y, st);
            if (edgeR) put(S.borde, blocks[i][j] * 32 + 16, 0, 16, 32, x + 16, y, st);
          }
        }
        if (i === 1 && j === 8) {
          const fr = Math.floor(st.t * 8) % 3;
          put(S.cascada, fr * 16, 0, 16, 64, x, y, st);
        }
      }
    }
  }

  function frame(st: State) {
    const t = st.t;
    const nn = st.n;
    // cielo en franjas
    const warm = Math.sin(Math.PI * Math.min(1, Math.max(0, nn))) * 0.55;
    const bands = SKY_DAY.length;
    for (let b = 0; b < bands; b++) {
      let col = mix(SKY_DAY[b], SKY_NIGHT[b], nn);
      if (warm > 0.02) {
        const d = SKY_DUSK[b];
        const base = hexRgb(SKY_DAY[b]);
        const nb = hexRgb(SKY_NIGHT[b]);
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
      const x = ((c.x + t * c.sp) % span) - c.spr.w - 10 + px * c.k * 8;
      put(c.spr, 0, 0, c.spr.w, c.spr.h, x, c.y + py * c.k * 4, st);
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
    // isla
    const bob = still ? 0 : Math.round(2.4 * Math.sin((t / 6) * Math.PI * 2));
    const bob2 = still ? 0 : Math.round(3 * Math.sin((t / 5) * Math.PI * 2 + 1));
    // sombra de la isla (se achica cuando sube)
    g.globalAlpha = 0.18;
    g.fillStyle = "#1b5f66";
    const shW = 100 - bob * 3, shY = oy + (portrait ? 330 : 308);
    for (let r = -5; r <= 5; r++) {
      const w = Math.round(shW * Math.sqrt(1 - (r / 6) * (r / 6)));
      g.fillRect(Math.round(ox + 16 - w / 2), shY + r, w, 1);
    }
    g.globalAlpha = 1;

    g.save();
    g.translate(Math.round(px * -1.5), bob + Math.round(py * -1));
    // raíces colgantes (atrás de la panza)
    for (const [rx, side] of [[-76, 0], [58, 1], [-20, 0], [100, 1]] as [number, number][]) {
      const x = ox + 16 + rx;
      const ry = side === 0 ? oy + 160 - (16 - (x - ox)) / 2 : oy + 160 - (x - ox - 16) / 2;
      put(S.raiz, 0, 0, 16, 32, x - 8, ry - 14, st);
    }
    // panza
    put(S.panza, 0, 0, S.panza.w, S.panza.h, pOxFix, pOy, st);
    g.save();
    // piedra flotante
    g.restore();
    drawGround(st);
    for (const s of shadows) s.fn(g, st);
    // sparkles de la hierba
    const all = [...objects].sort((a, b) => a.y - b.y || a.x - b.x);
    for (const o of all) o.fn(g, st);
    // brillitos
    g.fillStyle = "#fffdf7";
    for (const s of sparkles) {
      const f = (Math.floor(t * 4) + s.ph) % 16;
      if (f > 3) continue;
      const x = Math.round(s.x), y = Math.round(s.y);
      g.fillStyle = f === 1 || f === 2 ? "#f9e07a" : "#fffdf7";
      if (f === 1 || f === 2) { g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); }
      else g.fillRect(x, y, 1, 1);
    }
    g.restore();

    // piedra flotante (se mueve aparte)
    g.save();
    g.translate(Math.round(px * -2.5), bob2 + Math.round(py * -1.5));
    put(S.piedra, 0, 0, 16, 16, ox + 176, oy + 22, st);
    put(S.piedra, 0, 0, 16, 16, ox - 170, oy + 96, st, 1);
    g.restore();

    // luciérnagas
    if (nn > 0.3) {
      for (const f of flies) {
        const a = t * f.sp + f.ph;
        const x = Math.round(f.x + Math.cos(a) * 14 + Math.sin(a * 0.6) * 8 - px * 1.5);
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
      if (c.far) continue;
      const span = lw + c.spr.w + 40;
      const x = ((c.x + t * c.sp) % span) - c.spr.w - 10 + px * c.k * 8;
      put(c.spr, 0, 0, c.spr.w, c.spr.h, x, c.y + py * c.k * 4, st);
    }
  }

  /* --- bucle --- */
  let raf = 0;
  let stopped = false;
  let lastTick = -1;
  const t0 = performance.now();
  const state: State = { tick: 0, t: 0, n, hover, still };
  function paint(now: number) {
    state.t = still ? 0 : (now - t0) / 1000;
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
    setParallax: (x, y) => { par = { x: Math.max(-1, Math.min(1, x)) * 6, y: Math.max(-1, Math.min(1, y)) * 4 }; request(); },
    stop: () => { stopped = true; cancelAnimationFrame(raf); },
  };
}

/* ------------------------------------------------------------------ componente */

export function IsoIsland({ portrait, mode, hoverId, onReady }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const engine = useRef<Engine | null>(null);
  const live = useRef({ mode, hoverId });
  live.current = { mode, hoverId };

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let dead = false;
    createEngine(canvas, portrait, { mode: live.current.mode, hover: live.current.hoverId }).then((e) => {
      if (dead) { e.stop(); return; }
      engine.current = e;
      e.setMode(live.current.mode);
      e.setHover(live.current.hoverId);
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

  const L = isoLayout(portrait);
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
