import { useEffect, useRef } from "react";
import type { PlaceId } from "../../content";
import { ASSETS, ASSETS_TOP, CASITAS_TOP, TOP, topLayout } from "./config";
import { loadImage, mulberry, mix, hexRgb, nightFactorFromClock, silueta, toSpr, SKY_DAY, SKY_NIGHT, SKY_DUSK, type IslaControl, type IslaMode, type Spr, type State } from "./IsoIsland";

/**
 * Motor de la isla flotante VISTA DESDE ARRIBA (cenital 3/4). El suelo está horneado en 4 cuadros (agua animada);
 * encima se dibujan árboles, arbustos, casitas, flores y bichitos ordenados por y. Todo en un canvas a resolución
 * lógica (lw x lh) escalado con número entero y image-rendering: pixelated.
 */

type Props = {
  portrait: boolean;
  mode: IslaMode;
  hoverId: PlaceId | null;
  onReady?: (api: IslaControl) => void;
};

type Draw = { y: number; x: number; fn: (g: CanvasRenderingContext2D, st: State) => void };

type Engine = {
  setMode: (m: IslaMode) => void;
  setHover: (id: PlaceId | null) => void;
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
  const still = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ids = Object.keys(CASITAS_TOP) as PlaceId[];
  const names = Object.values(ASSETS);
  const imgs = await Promise.all(names.map(loadImage));
  const A: Record<string, HTMLImageElement | null> = {};
  Object.keys(ASSETS).forEach((k, i) => (A[k] = imgs[i]));
  const [arbustoI, rocaI] = await Promise.all([loadImage(ASSETS_TOP.arbusto), loadImage(ASSETS_TOP.roca)]);
  const suelo = await Promise.all(Array.from({ length: D.nf as number }, (_, f) => loadImage(`generados/isla_${key}_${f}.png`)));
  const casaImgs = await Promise.all(ids.flatMap((id) => [loadImage(CASITAS_TOP[id].file), loadImage(CASITAS_TOP[id].fileNoche)]));

  const S = {
    arbol: toSpr(A.arbol), flores: toSpr(A.flores),
    nubeS: toSpr(A.nubeS), nubeM: toSpr(A.nubeM), nubeL: toSpr(A.nubeL), sol: toSpr(A.sol), luna: toSpr(A.luna),
    girasol: toSpr(A.girasol), mariposas: toSpr(A.mariposas), pato: toSpr(A.pato),
    arbusto: toSpr(arbustoI), roca: toSpr(rocaI),
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

  /* --- objetos ordenados por y --- */
  const objects: Draw[] = [];
  for (const t of D.arboles as { x: number; y: number; v: number }[]) {
    const ph = rnd() * 6, v = t.v % 3;
    objects.push({ x: t.x, y: t.y, fn: (_g, st) => {
      const sway = still ? 0 : Math.round(Math.sin(st.t * 1.1 + ph) * 1.2);
      const strips = [[0, 14, sway], [14, 12, Math.round(sway / 2)], [26, 22, 0]];
      for (const [sy, sh, off] of strips) put(S.arbol, v * 32, sy, 32, sh, t.x - 16 + off, t.y - 45 + sy, st);
    } });
  }
  for (const b of D.arbustos as { x: number; y: number; v: number }[]) {
    objects.push({ x: b.x, y: b.y, fn: (_g, st) => put(S.arbusto, (b.v % 3) * 18, 0, 18, 14, b.x - 9, b.y - 11, st) });
  }
  for (const r of D.rocas as { x: number; y: number; v: number }[]) {
    objects.push({ x: r.x, y: r.y, fn: (_g, st) => put(S.roca, (r.v % 2) * 14, 0, 14, 10, r.x - 7, r.y - 8, st) });
  }
  for (const f of D.flores as { x: number; y: number; v: number }[]) {
    objects.push({ x: f.x, y: f.y, fn: (_g, st) => put(S.flores, f.v * 8, 0, 8, 8, f.x - 4, f.y - 7, st) });
  }
  (D.girasoles as { x: number; y: number }[]).forEach((s, k) => {
    objects.push({ x: s.x, y: s.y, fn: (_g, st) => put(S.girasol, (Math.floor(st.t * 2.5 + k) % 2) * 16, 0, 16, 24, s.x - 8, s.y - 23, st) });
  });
  for (const h of casas) {
    const [bx, by] = h.pos;
    const x0 = bx - 32, y0 = by - h.c.base;
    objects.push({ x: bx, y: by, fn: (gg, st) => {
      const fr = Math.floor((st.t * 1000) / h.c.ms) % h.c.frames;
      const hov = st.hover === h.id;
      const bounce = hov ? -(Math.floor(st.t * 5) % 2) : 0;
      // luz de la puerta sobre el pasto (noche)
      if (st.n > 0.05) {
        gg.globalAlpha = 0.22 * st.n;
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
  for (const p of patos) {
    objects.push({ x: pcx, y: pcy + 4, fn: (_g, st) => {
      const a = st.t * p.sp + p.ph;
      const x = pcx + Math.round(Math.cos(a) * p.r), y = pcy + Math.round(Math.sin(a) * (pry * 0.35));
      put(S.pato, (Math.floor(st.t * 2) % 2) * 11, 0, 11, 9, x - 5, y - 6, st);
    } });
  }
  // mariposas
  const maripos = [
    { x0: ix + iw * 0.3, y0: iy + ih * 0.45, sx: 40, sy: 12, sp: 0.5, ph: 0, c: 0 },
    { x0: ix + iw * 0.62, y0: iy + ih * 0.7, sx: 34, sy: 10, sp: 0.42, ph: 2, c: 1 },
    { x0: ix + iw * 0.8, y0: iy + ih * 0.3, sx: 30, sy: 9, sp: 0.6, ph: 4, c: 0 },
  ];
  for (const b of maripos) {
    objects.push({ x: b.x0, y: lh + 10, fn: (_g, st) => {
      const a = st.t * b.sp + b.ph;
      put(S.mariposas, (b.c * 2 + (Math.floor(st.t * 4) % 2)) * 7, 0, 7, 5, b.x0 + Math.cos(a) * b.sx - 3, b.y0 + Math.sin(a * 1.7) * b.sy - 2, st);
    } });
  }
  objects.sort((a, b) => a.y - b.y || a.x - b.x);

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
    // isla (sube y baja suavemente)
    const bob = still ? 0 : Math.round(2.4 * Math.sin((t / 6) * Math.PI * 2));
    const cxI = ix + iw / 2;
    // sombra de la isla (se achica cuando sube)
    g.globalAlpha = 0.18;
    g.fillStyle = "#1b5f66";
    const shW = iw * 0.55 - bob * 3, shY = Math.min(lh - 8, iy + ih + 78);
    for (let r = -5; r <= 5; r++) {
      const w = Math.round(shW * Math.sqrt(1 - (r / 6) * (r / 6)));
      g.fillRect(Math.round(cxI - w / 2), shY + r, w, 1);
    }
    g.globalAlpha = 1;

    g.save();
    g.translate(Math.round(px * -1.5), bob + Math.round(py * -1));
    const fi = still ? 0 : (((Math.floor(t * 4) % sueloS.length) + sueloS.length) % sueloS.length);
    put(sueloS[fi], 0, 0, lw, lh, 0, 0, st);
    for (const o of objects) o.fn(g, st);
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
    setParallax: (x, y) => { par = { x: Math.max(-1, Math.min(1, x)) * 6, y: Math.max(-1, Math.min(1, y)) * 4 }; request(); },
    stop: () => { stopped = true; cancelAnimationFrame(raf); },
  };
}

/* ------------------------------------------------------------------ componente */

export function TopIsland({ portrait, mode, hoverId, onReady }: Props) {
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
