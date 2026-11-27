import { TOP, CASITAS_TOP } from "./config";
import type { PlaceId } from "../../content";

export type Pt = { x: number; y: number };
type Seg = { a: Pt; b: Pt };

/** Velocidad de Clocky en px lógicos por segundo y límites de duración. */
const SPEED = 320;
const MIN_MS = 700;
const MAX_MS = 1800;

export function walkMs(len: number) {
  return Math.round(Math.min(MAX_MS, Math.max(MIN_MS, (len / SPEED) * 1000)));
}

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

export function segmentsOf(portrait: boolean): Seg[] {
  const paths = (TOP[portrait ? "v" : "h"] as any).paths as number[][][];
  const out: Seg[] = [];
  for (const pth of paths) for (let i = 0; i < pth.length - 1; i++) out.push({ a: { x: pth[i][0], y: pth[i][1] }, b: { x: pth[i + 1][0], y: pth[i + 1][1] } });
  return out;
}

/** Punto más cercano de la red de caminitos. */
export function snap(segs: Seg[], p: Pt): Pt {
  let best = segs[0].a, bd = Infinity;
  for (const { a, b } of segs) {
    const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2));
    const q = { x: a.x + dx * t, y: a.y + dy * t };
    const d = dist(p, q);
    if (d < bd) { bd = d; best = q; }
  }
  return best;
}

const key = (p: Pt) => `${Math.round(p.x * 2)}_${Math.round(p.y * 2)}`;

/** Camino más corto por los caminitos (segmentos horizontales y verticales que se cruzan). */
export function graphRoute(segs: Seg[], from: Pt, to: Pt): Pt[] {
  // puntos de corte por segmento: extremos, cruces con otros segmentos, y los puntos de partida/llegada
  const nodes = new Map<string, Pt>();
  const edges = new Map<string, Map<string, number>>();
  const add = (p: Pt) => { nodes.set(key(p), p); return key(p); };
  const link = (p: Pt, q: Pt) => {
    const kp = add(p), kq = add(q);
    if (kp === kq) return;
    const d = dist(p, q);
    if (!edges.has(kp)) edges.set(kp, new Map());
    if (!edges.has(kq)) edges.set(kq, new Map());
    edges.get(kp)!.set(kq, d); edges.get(kq)!.set(kp, d);
  };
  const onSeg = (s: Seg, q: Pt) => {
    const dx = s.b.x - s.a.x, dy = s.b.y - s.a.y, l2 = dx * dx + dy * dy || 1;
    const t = ((q.x - s.a.x) * dx + (q.y - s.a.y) * dy) / l2;
    if (t < -0.001 || t > 1.001) return false;
    return Math.hypot(s.a.x + dx * t - q.x, s.a.y + dy * t - q.y) < 0.6;
  };
  const cross = (s: Seg, o: Seg): Pt | null => {
    const r = { x: s.b.x - s.a.x, y: s.b.y - s.a.y }, q = { x: o.b.x - o.a.x, y: o.b.y - o.a.y };
    const den = r.x * q.y - r.y * q.x;
    if (Math.abs(den) < 1e-9) return null;
    const t = ((o.a.x - s.a.x) * q.y - (o.a.y - s.a.y) * q.x) / den;
    const u = ((o.a.x - s.a.x) * r.y - (o.a.y - s.a.y) * r.x) / den;
    if (t < -0.001 || t > 1.001 || u < -0.001 || u > 1.001) return null;
    return { x: s.a.x + r.x * t, y: s.a.y + r.y * t };
  };
  for (const s of segs) {
    const cuts: Pt[] = [s.a, s.b];
    for (const o of segs) {
      if (o === s) continue;
      const c = cross(s, o);
      if (c) cuts.push(c);
    }
    for (const q of [from, to]) if (onSeg(s, q)) cuts.push(q);
    const dx = s.b.x - s.a.x, dy = s.b.y - s.a.y;
    cuts.sort((m, n) => (m.x - s.a.x) * dx + (m.y - s.a.y) * dy - ((n.x - s.a.x) * dx + (n.y - s.a.y) * dy));
    for (let i = 0; i < cuts.length - 1; i++) link(cuts[i], cuts[i + 1]);
  }
  const src = key(from), dst = key(to);
  const D = new Map<string, number>([[src, 0]]);
  const prev = new Map<string, string>();
  const todo = new Set<string>(nodes.keys());
  while (todo.size) {
    let u: string | null = null, ud = Infinity;
    for (const k of todo) { const d = D.get(k) ?? Infinity; if (d < ud) { ud = d; u = k; } }
    if (u === null || u === dst) break;
    todo.delete(u);
    for (const [v, w] of edges.get(u) ?? []) {
      if (ud + w < (D.get(v) ?? Infinity)) { D.set(v, ud + w); prev.set(v, u); }
    }
  }
  if (!prev.has(dst) && src !== dst) return [from, to];
  const out: Pt[] = [];
  for (let k: string | undefined = dst; k !== undefined; k = prev.get(k)) out.push(nodes.get(k)!);
  return out.reverse();
}

/** Puerta (en px lógicos) de cada casita: donde Clocky termina de caminar. */
export function doorOf(portrait: boolean, id: PlaceId): Pt {
  const D = TOP[portrait ? "v" : "h"];
  const [x, y] = D.casas[id];
  return { x: x - CASITAS_TOP[id].fw / 2 + CASITAS_TOP[id].puerta, y };
}

/** Ruta completa desde un punto cualquiera hasta la puerta de una casita, siguiendo los caminitos. */
export function routeTo(portrait: boolean, from: Pt, id: PlaceId): { pts: Pt[]; len: number } {
  const segs = segmentsOf(portrait);
  const door = doorOf(portrait, id);
  const a = snap(segs, from), b = snap(segs, door);
  const mid = graphRoute(segs, a, b);
  const pts = [from, ...mid, door].filter((p, i, arr) => i === 0 || dist(p, arr[i - 1]) > 0.01);
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += dist(pts[i], pts[i - 1]);
  return { pts, len };
}

export function pointAt(pts: Pt[], t: number): { p: Pt; dx: number } {
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += dist(pts[i], pts[i - 1]);
  let d = Math.max(0, Math.min(1, t)) * total;
  for (let i = 1; i < pts.length; i++) {
    const l = dist(pts[i], pts[i - 1]);
    if (d <= l || i === pts.length - 1) {
      const k = l ? Math.min(1, d / l) : 1;
      return { p: { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * k, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * k }, dx: pts[i].x - pts[i - 1].x };
    }
    d -= l;
  }
  return { p: pts[pts.length - 1], dx: 0 };
}
