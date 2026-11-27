import type { PlaceId } from "../../content";

/**
 * ÚNICO LUGAR donde se definen los assets de la isla y dónde se apoyan.
 * Para reemplazar una pieza por la de Malena: cambiar el archivo (y las medidas) acá.
 * Todos los archivos viven en public/milicenda-assets/.
 */

/** Panza de la isla (un solo sprite para 9x9). Reemplazar por panza_9x9 de Malena.
 *  left / right / bottom: posición (x, y) dentro del sprite de las esquinas izquierda, derecha e
 *  inferior del rombo SUPERIOR de la isla (el txt de la panza de Malena trae estos números).
 *  incluyeCarasDelBorde: true si el sprite ya trae las caras laterales del borde (entonces el
 *  motor no dibuja los bloques de borde_isla_hoja). */
/** Lado de la isla en baldosas. */
export const GRID = 11;

export const PANZA = {
  file: `generados/panza_${GRID}x${GRID}_claude.png`,
  left: [0, -13] as [number, number],
  right: [32 * GRID, -13] as [number, number],
  bottom: [16 * GRID, 8 * GRID - 13] as [number, number],
  incluyeCarasDelBorde: false,
};

/** Casitas de los lugares: hoja de 2 cuadros de 64x64 (día) y su versión de noche.
 *  (a, b): celda de arriba de la huella de 2x2 baldosas. Reemplazar `file`/`fileNoche` por las de Malena. */
export const CASITAS: Record<PlaceId, { file: string; fileNoche: string; fw: number; fh: number; frames: number; ms: number; a: number; b: number; humo: [number, number] | null }> = {
  periodismo: { file: "generados/casa_redaccion.png", fileNoche: "generados/casa_redaccion_noche.png", fw: 64, fh: 80, frames: 2, ms: 500, a: 0, b: 4, humo: [48, 33] },
  diseno: { file: "generados/casa_estudio.png", fileNoche: "generados/casa_estudio_noche.png", fw: 64, fh: 80, frames: 2, ms: 500, a: 4, b: 2, humo: null },
  dibujo: { file: "generados/casa_taller.png", fileNoche: "generados/casa_taller_noche.png", fw: 64, fh: 80, frames: 2, ms: 500, a: 8, b: 0, humo: null },
  programacion: { file: "generados/casa_laboratorio.png", fileNoche: "generados/casa_laboratorio_noche.png", fw: 64, fh: 80, frames: 2, ms: 500, a: 5, b: 8, humo: [47, 26] },
  casita: { file: "generados/casa_casita.png", fileNoche: "generados/casa_casita_noche.png", fw: 64, fh: 80, frames: 2, ms: 500, a: 8, b: 6, humo: [44, 31] },
};

export const ASSETS = {
  arbol: "arbol_prueba_hoja.png", // 3 árboles de 32x48
  arbolSombra: "arbol_sombra.png", // 24x12, un color
  pasto: "pasto_hoja.png", // 6 baldosas 32x16
  borde: "borde_isla_hoja.png", // 5 bloques 32x32
  flores: "flores_chicas.png", // 8 flores 8x8
  piedra: "piedra_flotante.png", // 16x16
  raiz: "raiz_colgante.png", // 16x32
  camino: "generados/camino_hoja.png", // 16 variantes de unión, 32x16
  agua: "generados/agua_hoja.png", // 16 variantes de orilla x 2 cuadros, 32x16
  cascada: "generados/cascada_hoja.png", // 3 cuadros 16x64
  nubeS: "generados/nube_s.png",
  nubeM: "generados/nube_m.png",
  nubeL: "generados/nube_l.png",
  sol: "generados/sol_hoja.png", // 2 cuadros 32x32
  luna: "generados/luna.png",
  girasol: "generados/girasol_hoja.png", // 2 cuadros 16x24
  mariposas: "generados/mariposas_hoja.png", // 4 cuadros 7x5 (2 colores x 2)
  pato: "generados/pato_hoja.png", // 2 cuadros 11x9
};

/** Qué vista usa el mapa: "cenital" (isla vista desde arriba, la que ayuda a que Clocky camine) o "isometrica" (la versión en diagonal, guardada para comparar). */
export const VISTA: "cenital" | "isometrica" = "cenital";

export const ASSETS_TOP = {
  arbusto: "generados/arbusto_hoja.png", // 3 arbustos 18x14
  roca: "generados/roca_hoja.png", // 2 rocas 14x10
};

/** Casitas vistas desde arriba: hoja de 2 cuadros de 64x72, base (puerta) en la fila 68. humo = punto de la chimenea. */
export const CASITAS_TOP: Record<PlaceId, { file: string; fileNoche: string; fw: number; fh: number; base: number; frames: number; ms: number; humo: [number, number] | null; puerta: number; ancla?: number }> = {
  periodismo: { file: "generados/casat_redaccion.png", fileNoche: "generados/casat_redaccion_noche.png", fw: 66, fh: 128, base: 120, frames: 4, ms: 250, humo: [21, 79], puerta: 38, ancla: 38 },
  diseno: { file: "generados/casat_estudio.png", fileNoche: "generados/casat_estudio_noche.png", fw: 64, fh: 72, base: 68, frames: 2, ms: 500, humo: null, puerta: 45 },
  dibujo: { file: "generados/casat_taller.png", fileNoche: "generados/casat_taller_noche.png", fw: 64, fh: 72, base: 68, frames: 2, ms: 500, humo: null, puerta: 31 },
  programacion: { file: "generados/casat_laboratorio.png", fileNoche: "generados/casat_laboratorio_noche.png", fw: 64, fh: 72, base: 68, frames: 2, ms: 500, humo: [49, 36], puerta: 31 },
  casita: { file: "generados/casat_casita.png", fileNoche: "generados/casat_casita_noche.png", fw: 64, fh: 72, base: 68, frames: 2, ms: 500, humo: [13, 7], puerta: 31 },
};

export type Layout = {
  lw: number; // ancho lógico en píxeles de pixel art
  lh: number;
  z: number; // escala entera: píxeles del mundo por píxel lógico
  ox: number; // origen de la isla (baldosa 0,0: vértice izquierdo del rombo)
  oy: number;
  worldW: number;
  worldH: number;
  /** centro del sprite de cada casita, y su base, en % del mundo */
  places: Record<PlaceId, { x: number; y: number }>;
  /** punto del mundo (px del mundo) sobre el que se centra la vista inicial, y alto de la isla en px lógicos */
  focus: { x: number; y: number };
  islaW: number;
  islaH: number;
  /** dónde descansa Clocky (en % del mundo) y cuánto se corre cuando camina hasta una casita (px del mundo) */
  rest: { x: number; y: number };
  walker: { dx: number; dy: number; ty: number };
};

export function isoLayout(portrait: boolean): Layout {
  const lw = portrait ? 420 : 760;
  const lh = portrait ? 720 : 440;
  const z = 3;
  const ox = portrait ? 194 : 364;
  const oy = portrait ? 215 : 78;
  const places = {} as Layout["places"];
  (Object.keys(CASITAS) as PlaceId[]).forEach((id) => {
    const c = CASITAS[id];
    const sx = ox + (c.a - c.b) * 16 - 16;
    const sy = oy + (c.a + c.b) * 8 - 49;
    // la base de la casita (centro abajo del sprite)
    places[id] = { x: ((sx + 32) / lw) * 100, y: ((sy + 78) / lh) * 100 };
  });
  return { lw, lh, z, ox, oy, worldW: lw * z, worldH: lh * z, places, focus: { x: (ox + 16) * z, y: (oy + 126) * z }, islaW: 16 * 2 * GRID + 16, islaH: 8 * GRID + 8 * GRID + 70, rest: { x: 50, y: 54 }, walker: { dx: 104, dy: 46, ty: -50 } };
}

import layoutTop from "./layout_top.json";

type TopOrient = { lw: number; lh: number; isl: number[]; casas: Record<string, number[]>; hub?: number[][] };
export const TOP = layoutTop as unknown as Record<"h" | "v", TopOrient & Record<string, any>>;

/** Layout de la vista cenital: las casitas están en coordenadas lógicas (base = puerta) y Clocky camina hasta la puerta. */
export function topLayout(portrait: boolean): Layout {
  const D = TOP[portrait ? "v" : "h"];
  const z = 3;
  const [ix, iy, iw, ih] = D.isl;
  const places = {} as Layout["places"];
  (Object.keys(CASITAS_TOP) as PlaceId[]).forEach((id) => {
    const [x, y] = D.casas[id];
    places[id] = { x: ((x - 32 + CASITAS_TOP[id].puerta) / D.lw) * 100, y: (y / D.lh) * 100 };
  });
  const rest0 = D.rest as number[];
  const rx = portrait ? rest0[0] : ix + iw / 2, ry = portrait ? rest0[1] : iy + ih / 2 + 24;
  return {
    lw: D.lw, lh: D.lh, z, ox: 0, oy: 0, worldW: D.lw * z, worldH: D.lh * z, places,
    focus: { x: rx * z, y: ry * z }, islaW: iw + 40, islaH: ih + 120,
    rest: { x: ((D.rest as number[])[0] / D.lw) * 100, y: ((D.rest as number[])[1] / D.lh) * 100 },
    walker: { dx: 0, dy: 34, ty: -92 },
  };
}

export function islaLayout(portrait: boolean): Layout {
  return VISTA === "cenital" ? topLayout(portrait) : isoLayout(portrait);
}

/** Datos de la torre de la Redacción (coordenadas dentro del cuadro de 66x128). Ver docs/milicenda/extra.json. */
export const REDACCION = {
  reloj: { x: 38, y: 40, r: 5.4 },
  papeles: [23, 109] as [number, number],
  chapita: [23, 104] as [number, number],
  ventana: { x: 5, y: 101, w: 17, h: 11 },
  pajaros: { w: 7, h: 4, posaderos: [[26, 30], [55, 27]] as [number, number][] },
  globito: { w: 9, h: 8, x: 52, y: 34 },
  files: {
    sombra: "generados/redaccion_sombra.png",
    ventanaOn: "generados/redaccion_ventana_on.png",
    pajaros: "generados/redaccion_pajaros.png",
    globitos: "generados/redaccion_globitos.png",
  },
};
