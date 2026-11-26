import { useEffect, useRef } from "react";
import type { PlaceId } from "../content";

/**
 * El fondo del mapa en pixel art. Se dibuja con código sobre una grilla de
 * 400x250 píxeles (cada píxel mide 4 del mundo de 1600x1000), con una paleta
 * cerrada. Lo que se mueve (río, nubes, girasoles, pinos, destellos, pájaros)
 * se redibuja a 8 cuadros por segundo.
 */

const W = 400;
const H = 250;

const C = {
  grass: "#e1e9bd",
  grass2: "#d7e1ac",
  grass3: "#cad79b",
  sage: "#c9d9a8",
  sageD: "#a9be8f",
  moss: "#6e8b5a",
  mossD: "#4f6b43",
  mossL: "#8aa874",
  sand: "#efe0c8",
  sand2: "#e2cfa9",
  water: "#a9d0ca",
  waterL: "#d3ebe5",
  waterD: "#86b8b1",
  chalk: "#fffdf7",
  orange: "#e8874a",
  orangeS: "#f4b183",
  ink: "#4b3a2a",
  paper: "#fbf3e4",
  beige: "#efe0c8",
  yellow: "#f2c230",
  yellowD: "#c99a12",
  brown: "#7a4a2a",
  stone: "#ddd2bd",
  stoneM: "#bfae94",
  stoneD: "#9a8a72",
  trunk: "#7a5a3a",
  cloudS: "#eef0d6",
};

type Place = { id: PlaceId; x: number; y: number };

/* ------------------------------------------------------------------ utils */

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, w = 1, h = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

function makeCanvas() {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  return c;
}

/** Dibuja una forma vectorial y la pasa a píxeles duros (sin bordes suaves). */
function shape(
  ctx: CanvasRenderingContext2D,
  color: string,
  draw: (t: CanvasRenderingContext2D) => void,
): Uint8Array {
  const tmp = makeCanvas();
  const t = tmp.getContext("2d", { willReadFrequently: true })!;
  t.fillStyle = "#000";
  t.strokeStyle = "#000";
  draw(t);
  const img = t.getImageData(0, 0, W, H);
  const mask = new Uint8Array(W * H);
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  for (let i = 0; i < W * H; i++) {
    const on = img.data[i * 4 + 3] > 127;
    mask[i] = on ? 1 : 0;
    img.data[i * 4] = r;
    img.data[i * 4 + 1] = g;
    img.data[i * 4 + 2] = b;
    img.data[i * 4 + 3] = on ? 255 : 0;
  }
  t.putImageData(img, 0, 0);
  ctx.drawImage(tmp, 0, 0);
  return mask;
}

const SCALE = 0.25;
const path = (d: string) => new Path2D(d);

/* ---------------------------------------------------------------- sprites */

type Pal = Record<string, string>;

/** Convierte filas de texto en un lienzo chico, con borde de pegatina opcional. */
function sprite(rows: string[], pal: Pal, outline = true): HTMLCanvasElement {
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  const pad = outline ? 1 : 0;
  const c = document.createElement("canvas");
  c.width = w + pad * 2;
  c.height = h + pad * 2;
  const x = c.getContext("2d")!;
  const filled = (px: number, py: number) => {
    const ch = rows[py]?.[px];
    return ch !== undefined && ch !== "." && ch !== " ";
  };
  if (outline) {
    x.fillStyle = C.chalk;
    for (let py = -1; py <= h; py++) {
      for (let px = -1; px <= w; px++) {
        if (filled(px, py)) continue;
        if (filled(px - 1, py) || filled(px + 1, py) || filled(px, py - 1) || filled(px, py + 1)) {
          x.fillRect(px + pad, py + pad, 1, 1);
        }
      }
    }
  }
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const ch = rows[py]?.[px];
      if (!ch || ch === "." || ch === " ") continue;
      x.fillStyle = pal[ch] ?? "#f0f";
      x.fillRect(px + pad, py + pad, 1, 1);
    }
  }
  return c;
}

/** Pone un sprite con su base (centro abajo) en x, y. */
function put(ctx: CanvasRenderingContext2D, sp: HTMLCanvasElement, x: number, y: number) {
  ctx.drawImage(sp, Math.round(x - sp.width / 2), Math.round(y - sp.height + 1));
}

/** Corre las primeras filas 1 píxel para el balanceo. */
function sway(rows: string[], top: number, dx: number): string[] {
  const w = Math.max(...rows.map((r) => r.length)) + 1;
  return rows.map((r, i) => {
    const padded = r.padEnd(w, ".");
    if (i >= top) return padded;
    const shift = i < top / 2 ? dx : dx;
    return shift > 0 ? "." + padded.slice(0, -1) : padded;
  });
}

const PINE_BIG = [
  ".....a.....",
  "....aca....",
  "....aaa....",
  "...acaab...",
  "...aaaab...",
  "..acaaaab..",
  "..aaaaabb..",
  ".acaaaaaab.",
  ".aaaaaabbb.",
  "....aab....",
  "..acaaabb..",
  ".aaaaaaabb.",
  "aaaaaaaabbb",
  ".....tt....",
  ".....tt....",
];
const PINE_SMALL = [
  "....a....",
  "...aca...",
  "...aaab..",
  "..acaaab.",
  "..aaaabb.",
  ".acaaaabb",
  ".aaaaabbb",
  "...aab...",
  "....tt...",
  "....tt...",
];
const BUSH = [
  "..aaa....",
  ".acaaaa..",
  "acaaaaba.",
  "aaaaaabaa",
  ".aabbbbb.",
];
const ROCK = [
  "..cccc..",
  ".ccccaa.",
  "ccccaaab",
  "caaaabbb",
  ".bbbbbb.",
];
const MUSH = [
  "..ooo..",
  ".oowoo.",
  "ooooowo",
  ".wwwww.",
  "..sss..",
  "..sss..",
];
const FLOWER = [
  ".p.",
  "pyp",
  ".p.",
];
const SUN_BIG = [
  "..yyyyy..",
  ".yYyyyYy.",
  "yyybbbyyy",
  "yYybbbyYy",
  "yyybbbyyy",
  ".yYyyyYy.",
  "..yyyyy..",
  "....g....",
  "..gggg...",
  "..ggg....",
  "....g....",
  "....g....",
  "....g....",
];
const SUN_SMALL = [
  ".yyyyy.",
  "yYybyYy",
  "yybbbyy",
  "yYybyYy",
  ".yyyyy.",
  "...g...",
  "..ggg..",
  "...g...",
  "...g...",
];

const pineBig = (c1: string, c2: string, c3: string) => ({ a: c1, b: c2, c: c3, t: C.trunk });

/* ---------------------------------------------------------------- scene */

type Anim = {
  base: HTMLCanvasElement;
  river: number[]; // índices de píxeles del agua
  pines: { sp: [HTMLCanvasElement, HTMLCanvasElement]; x: number; y: number; ph: number }[];
  suns: { sp: [HTMLCanvasElement, HTMLCanvasElement]; x: number; y: number; ph: number }[];
  sparks: { x: number; y: number; ph: number }[];
  flowers: { sp: HTMLCanvasElement; x: number; y: number }[];
  clouds: { x: number; y: number; w: number; speed: number }[];
  trail: { x: number; y: number }[];
  cloudSp: HTMLCanvasElement;
};

function buildScene(places: Place[], portrait: boolean): Anim {
  const base = makeCanvas();
  const g = base.getContext("2d")!;
  const rand = rng(7);

  const at = (id: PlaceId) => {
    const p = places.find((item) => item.id === id) ?? { x: 50, y: 50 };
    return { x: p.x * 4, y: p.y * 2.5 };
  };

  /* pasto con salpicado */
  g.fillStyle = C.grass;
  g.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const r = rand();
      if (r < 0.05) dot(g, x, y, C.grass2);
      else if (r < 0.065) dot(g, x, y, C.grass3);
    }
  }

  /* manchones de tierra */
  shape(g, C.sage, (t) => {
    t.scale(SCALE, SCALE);
    t.fill(path("M-40 250 C120 120 300 140 380 60 C470 -30 640 10 720 70 C820 40 880 120 830 210 C900 260 860 340 760 350 C700 440 520 430 470 360 C380 400 240 380 190 320 C80 340 -20 330 -40 250 Z"));
  });
  shape(g, C.sageD, (t) => {
    t.scale(SCALE, SCALE);
    t.fill(path("M980 1000 C960 900 1040 840 1160 850 C1220 760 1380 760 1440 830 C1560 800 1640 880 1640 1000 Z"));
  });
  shape(g, C.sand, (t) => {
    t.scale(SCALE, SCALE);
    t.fill(path("M-20 720 C90 640 220 660 280 700 C340 640 460 640 500 700 C540 780 440 860 340 850 C260 920 120 900 60 840 C-10 840 -60 790 -20 720 Z"));
  });

  /* zonas con borde punteado */
  const zone = (c: { x: number; y: number }, tone: string) => {
    const cx = c.x;
    const cy = c.y + 7.5;
    const rx = 54;
    const ry = 41;
    for (let y = Math.max(0, Math.floor(cy - ry)); y < Math.min(H, cy + ry); y++) {
      for (let x = Math.max(0, Math.floor(cx - rx)); x < Math.min(W, cx + rx); x++) {
        const d = Math.hypot((x - cx) / rx, (y - cy) / ry);
        if (d >= 1) continue;
        if (d < 0.74 || (1 - d) / 0.26 > BAYER[(y & 3) * 4 + (x & 3)]) dot(g, x, y, tone);
      }
    }
  };
  const news = at("periodismo");
  const studio = at("diseno");
  const draw = at("dibujo");
  const lab = at("programacion");
  const home = at("casita");
  zone(news, "#efe4c4");
  zone(studio, "#f5d8c0");
  zone(draw, "#dce9bb");
  zone(lab, "#cfe3dd");
  zone(home, "#f4e3a6");

  /* río */
  const RIVER = "M760 -30 C800 120 700 210 740 320 C780 430 900 470 930 560 C960 660 880 760 900 860 C915 940 960 990 990 1030";
  shape(g, C.chalk, (t) => {
    t.scale(SCALE, SCALE);
    t.lineWidth = 64;
    t.lineCap = "round";
    t.stroke(path(RIVER));
  });
  const riverMask = shape(g, C.water, (t) => {
    t.scale(SCALE, SCALE);
    t.lineWidth = 46;
    t.lineCap = "round";
    t.stroke(path(RIVER));
  });
  const river: number[] = [];
  for (let i = 0; i < riverMask.length; i++) if (riverMask[i]) river.push(i);
  // orilla más oscura del lado izquierdo del agua
  for (const i of river) {
    const x = i % W;
    const y = (i / W) | 0;
    if (!riverMask[y * W + x - 1]) dot(g, x, y, C.waterD);
  }

  /* senderos: puntitos de pegatina con centro naranja */
  const pairs: [PlaceId, PlaceId][] = portrait
    ? [
        ["periodismo", "diseno"],
        ["diseno", "dibujo"],
        ["dibujo", "programacion"],
        ["programacion", "casita"],
      ]
    : [
        ["periodismo", "diseno"],
        ["diseno", "dibujo"],
        ["periodismo", "programacion"],
        ["dibujo", "casita"],
        ["programacion", "casita"],
        ["diseno", "casita"],
      ];
  const trail: { x: number; y: number }[] = [];
  for (const [from, to] of pairs) {
    const a = at(from);
    const b = at(to);
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2 + (Math.abs(b.x - a.x) > 125 ? 17.5 : -12.5);
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= 80; i++) {
      const u = i / 80;
      pts.push({
        x: (1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * mx + u * u * b.x,
        y: (1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * my + u * u * b.y,
      });
    }
    let acc = 0;
    let last = pts[0];
    for (const p of pts) {
      acc += Math.hypot(p.x - last.x, p.y - last.y);
      last = p;
      if (acc >= 5) {
        acc = 0;
        trail.push({ x: Math.round(p.x), y: Math.round(p.y) });
      }
    }
  }
  for (const p of trail) {
    dot(g, p.x - 1, p.y - 1, C.chalk, 4, 4);
    dot(g, p.x - 1, p.y - 1, C.grass, 1, 1);
    dot(g, p.x + 2, p.y - 1, C.grass, 1, 1);
    dot(g, p.x - 1, p.y + 2, C.grass, 1, 1);
    dot(g, p.x + 2, p.y + 2, C.grass, 1, 1);
  }
  // los de las esquinas se pintan del color de abajo: se vuelve a repintar el centro
  for (const p of trail) dot(g, p.x, p.y, C.orange, 2, 2);

  /* detalles de cada zona */
  // Redacción: hojas sueltas
  const paper = (x: number, y: number) => {
    dot(g, x, y, C.stoneM, 7, 9);
    dot(g, x, y, C.chalk, 6, 8);
    dot(g, x + 1, y + 2, "#c9bda5", 4, 1);
    dot(g, x + 1, y + 4, "#c9bda5", 3, 1);
  };
  paper(news.x - 44, news.y + 24);
  paper(news.x + 31, news.y + 32);
  paper(news.x + 30, news.y - 19);
  // Estudio: manchas de pintura
  const blob = (x: number, y: number, r: number, color: string) => {
    for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) if (xx * xx + yy * yy <= r * r + 1) dot(g, x + xx, y + yy, color);
  };
  blob(studio.x - 37, studio.y + 22, 4, C.orange);
  blob(studio.x - 29, studio.y + 28, 3, C.orangeS);
  blob(studio.x + 35, studio.y + 24, 3, C.sageD);
  blob(studio.x + 42, studio.y + 17, 2, C.orange);
  blob(studio.x + 5, studio.y + 37, 2, C.moss);
  // Dibujo: garabatos ondulados
  const wave = (x: number, y: number, n: number) => {
    for (let i = 0; i < n * 8; i++) dot(g, x + i, y + [0, -1, -2, -2, -1, 0, 1, 1][i % 8], C.orange);
  };
  wave(draw.x - 40, draw.y + 30, 2);
  wave(draw.x + 23, draw.y + 33, 2);
  // Laboratorio: grilla de puntos y paréntesis < >
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) dot(g, lab.x - 35 + c * 8, lab.y + 25 + r * 6, "#9fb3a8");
  const chevron = (x: number, y: number, dir: 1 | -1) => {
    for (let i = 0; i < 3; i++) {
      dot(g, x + dir * i, y + i, C.moss, 1, 1);
      dot(g, x + dir * i, y + 5 - i, C.moss, 1, 1);
    }
    dot(g, x + dir * 3, y + 3, C.moss);
  };
  chevron(lab.x + 30, lab.y + 22, 1);
  chevron(lab.x + 46, lab.y + 22, -1);

  /* cosas quietas */
  const bush = sprite(BUSH, { a: C.mossL, b: C.moss, c: "#b3cc9b" });
  const rock = sprite(ROCK, { c: C.stone, a: C.stoneM, b: C.stoneD });
  const mush = sprite(MUSH, { o: C.orange, w: C.chalk, s: C.paper });
  const mushS = sprite(MUSH.slice(0, 5), { o: C.orange, w: C.chalk, s: C.paper });
  const flowerOf = (c: string) => sprite(FLOWER, { p: c, y: C.yellow }, false);

  const bushes = [[310, 300], [880, 330], [1120, 420], [600, 690], [1000, 820], [260, 960], [1220, 540]];
  for (const [x, y] of bushes) put(g, bush, x / 4, y / 4);
  const rocks = [[690, 420], [540, 560], [1180, 860], [300, 430]];
  for (const [x, y] of rocks) put(g, rock, x / 4, y / 4);
  const mushes: [number, number, boolean][] = [[620, 840, false], [660, 870, true], [1260, 300, false], [1296, 326, true], [420, 520, true]];
  for (const [x, y, small] of mushes) put(g, small ? mushS : mush, x / 4, y / 4);

  const flowerTones: [number, number, string][] = [
    [360, 250, C.orangeS],
    [940, 260, C.chalk],
    [780, 700, C.orange],
    [560, 340, C.orangeS],
    [1050, 640, C.chalk],
  ];
  const flowers = flowerTones.map(([x, y, c]) => ({ sp: flowerOf(c), x: x / 4, y: y / 4 }));

  /* cosas que se mueven */
  const pines: Anim["pines"] = [];
  const pineData: [number, number, number, boolean][] = [
    [140, 220, 1.15, false], [215, 170, 0.85, true], [90, 330, 0.95, false], [400, 150, 1, false], [470, 205, 0.8, true],
    [560, 130, 1.1, false], [690, 200, 0.85, false], [980, 150, 1, false], [1050, 205, 0.85, true], [1330, 180, 1.15, false],
    [1420, 245, 0.9, false], [1470, 420, 1.05, false], [1380, 480, 0.8, true], [120, 540, 1, false], [200, 620, 0.85, false],
    [130, 780, 1.1, false], [230, 860, 0.9, true], [330, 930, 0.85, false], [640, 900, 1, false], [720, 950, 0.8, true],
    [1080, 880, 1.05, false], [1150, 940, 0.85, false], [1500, 880, 1, false], [1360, 940, 0.8, true], [1480, 690, 0.95, false],
  ];
  pineData.forEach(([x, y, s, light], i) => {
    const rows = s >= 0.95 ? PINE_BIG : PINE_SMALL;
    const pal = light ? pineBig(C.mossL, C.moss, "#b3cc9b") : pineBig(C.moss, C.mossD, C.mossL);
    pines.push({
      sp: [sprite(rows, pal), sprite(sway(rows, Math.floor(rows.length * 0.55), 1), pal)],
      x: x / 4,
      y: y / 4,
      ph: i * 7,
    });
  });

  const sunPal = { y: C.yellow, Y: C.yellowD, b: C.brown, g: "#4f6b3d" };
  const sunData: [number, number, number][] = [
    [395, 800, 1.2], [440, 840, 1], [580, 810, 1.15], [625, 770, 0.9], [370, 740, 0.95], [1150, 770, 1], [1290, 790, 0.9], [660, 480, 0.85], [1010, 330, 0.8],
  ];
  // los de la zona de la casita acompañan a la casita
  const homeSuns: [number, number, number][] = [
    [home.x * 4 - 150, home.y * 4 + 120, 0.9],
    [home.x * 4 + 150, home.y * 4 + 110, 0.8],
    [home.x * 4 + 110, home.y * 4 + 150, 0.7],
  ];
  const suns: Anim["suns"] = [...sunData, ...homeSuns].map(([x, y, s], i) => {
    const rows = s >= 0.95 ? SUN_BIG : SUN_SMALL;
    return {
      sp: [sprite(rows, sunPal), sprite(sway(rows, 7, 1), sunPal)] as [HTMLCanvasElement, HTMLCanvasElement],
      x: x / 4,
      y: y / 4,
      ph: i * 5,
    };
  });

  const sparks = [[520, 330], [1010, 480], [1420, 600], [360, 620]].map(([x, y], i) => ({ x: x / 4, y: y / 4, ph: i * 9 }));
  sparks.push({ x: draw.x - 30, y: draw.y - 10, ph: 4 }, { x: draw.x + 35, y: draw.y - 5, ph: 13 });

  const cloudSp = sprite(
    [
      ".....cccc...........",
      "...ccccccc..ccc.....",
      "..cccccccccccccc....",
      ".cccccccccccccccc...",
      "cccccccccccccccccc..",
      ".sssssssssssssssss..",
    ],
    { c: C.chalk, s: C.cloudS },
    false,
  );
  const clouds = [
    { x: 58, y: 28, w: 20, speed: 2.2 },
    { x: 220, y: 18, w: 20, speed: 1.6 },
    { x: 325, y: 38, w: 20, speed: 1.9 },
    { x: 130, y: 130, w: 20, speed: 1.3 },
  ];

  /* brújula */
  const cx = 32;
  const cy = 222;
  for (let y = -10; y <= 10; y++) for (let x = -10; x <= 10; x++) {
    const d = x * x + y * y;
    if (d <= 100) dot(g, cx + x, cy + y, d > 72 ? C.beige : C.paper);
  }
  for (let i = 0; i < 6; i++) dot(g, cx, cy - 6 + i, C.orange);
  dot(g, cx - 1, cy - 2, C.orange, 3, 1);
  for (let i = 0; i < 5; i++) dot(g, cx, cy + 1 + i, C.sageD);
  dot(g, cx - 1, cy + 2, C.sageD, 3, 1);
  const N = ["X...X", "XX..X", "X.X.X", "X..XX", "X...X"];
  N.forEach((row, ry) => [...row].forEach((ch, rx) => ch === "X" && dot(g, cx - 2 + rx, cy - 19 + ry, C.ink)));

  /* borde punteado */
  for (let x = 6; x < W - 6; x += 4) {
    dot(g, x, 4, C.beige);
    dot(g, x, H - 5, C.beige);
  }
  for (let y = 6; y < H - 6; y += 4) {
    dot(g, 4, y, C.beige);
    dot(g, W - 5, y, C.beige);
  }

  return { base, river, pines, suns, sparks, flowers, clouds, trail, cloudSp };
}

/* ------------------------------------------------------------- animación */

function drawFrame(ctx: CanvasRenderingContext2D, s: Anim, f: number) {
  ctx.drawImage(s.base, 0, 0);

  // brillos del río que bajan
  for (const i of s.river) {
    const x = i % W;
    const y = (i / W) | 0;
    const wave = (y * 2 + ((x >> 1) & 3) - f) & 31;
    if (wave < 2 && ((x + (y >> 3)) & 3) < 2) {
      ctx.fillStyle = C.waterL;
      ctx.fillRect(x, y, 1, 1);
    } else if (((y + f) & 15) === 0 && (x & 7) === 3) {
      ctx.fillStyle = C.waterD;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // senderos: un destello que camina
  const k = f >> 1;
  for (let i = 0; i < s.trail.length; i++) {
    if ((i + k) % 9 === 0) {
      const p = s.trail[i];
      ctx.fillStyle = C.yellow;
      ctx.fillRect(p.x, p.y, 2, 2);
    }
  }

  // flores
  for (const fl of s.flowers) put(ctx, fl.sp, fl.x, fl.y);

  // pinos y girasoles se mecen
  for (const p of s.pines) put(ctx, p.sp[((f + p.ph) >> 4) & 1 ? 1 : 0], p.x, p.y);
  for (const p of s.suns) put(ctx, p.sp[((f + p.ph) >> 3) % 3 === 1 ? 1 : 0], p.x, p.y);

  // destellos
  for (const sp of s.sparks) {
    const ph = (f + sp.ph) % 24;
    if (ph < 12) {
      const big = ph >= 4 && ph < 8;
      ctx.fillStyle = C.yellow;
      ctx.fillRect(sp.x, sp.y - (big ? 2 : 1), 1, big ? 5 : 3);
      ctx.fillRect(sp.x - (big ? 2 : 1), sp.y, big ? 5 : 3, 1);
      if (big) {
        ctx.fillStyle = C.chalk;
        ctx.fillRect(sp.x, sp.y, 1, 1);
      }
    }
  }

  // nubes con su sombra en el pasto
  const t = f / 8;
  for (const c of s.clouds) {
    const x = ((c.x + t * c.speed) % (W + 50)) - 25;
    ctx.fillStyle = C.grass3;
    for (let yy = 0; yy < 3; yy++) for (let xx = 0; xx < 18; xx++) if (((xx + yy) & 1) === 0) ctx.fillRect(Math.round(x) + 4 + xx, c.y + 16 + yy, 1, 1);
    ctx.drawImage(s.cloudSp, Math.round(x), c.y);
  }

  // pajaritos que cruzan de vez en cuando
  for (let b = 0; b < 2; b++) {
    const cycle = 220;
    const local = (f + b * 31 + 40) % cycle;
    if (local < 150) {
      const x = -6 + (local / 150) * (W + 12);
      const y = 52 + b * 14 + Math.round(Math.sin(local / 9) * 3);
      ctx.fillStyle = C.ink;
      if ((f >> 2) & 1) {
        ctx.fillRect(x, y, 1, 1);
        ctx.fillRect(x + 1, y + 1, 1, 1);
        ctx.fillRect(x + 2, y, 1, 1);
        ctx.fillRect(x + 3, y + 1, 1, 1);
        ctx.fillRect(x + 4, y, 1, 1);
      } else {
        ctx.fillRect(x, y + 1, 1, 1);
        ctx.fillRect(x + 1, y, 1, 1);
        ctx.fillRect(x + 2, y + 1, 1, 1);
        ctx.fillRect(x + 3, y, 1, 1);
        ctx.fillRect(x + 4, y + 1, 1, 1);
      }
    }
  }
}

export function PixelBackdrop({ places, portrait = false }: { places: Place[]; portrait?: boolean }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const key = JSON.stringify(places) + portrait;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    const scene = buildScene(places, portrait);
    const still = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    drawFrame(ctx, scene, 0);
    if (still) return;
    let raf = 0;
    let last = -1;
    const loop = (now: number) => {
      const f = Math.floor(now / 125);
      if (f !== last) {
        last = f;
        drawFrame(ctx, scene, f);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <canvas
      ref={ref}
      width={W}
      height={H}
      aria-hidden="true"
      style={{ display: "block", width: "100%", height: "100%", imageRendering: "pixelated" }}
    />
  );
}
