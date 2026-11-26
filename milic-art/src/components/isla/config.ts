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
export const PANZA = {
  file: "generados/panza_9x9_claude.png",
  left: [0, -13] as [number, number],
  right: [288, -13] as [number, number],
  bottom: [144, 59] as [number, number],
  incluyeCarasDelBorde: false,
};

/** Casitas de los lugares: hoja de 2 cuadros de 64x64 (día) y su versión de noche.
 *  (a, b): celda de arriba de la huella de 2x2 baldosas. Reemplazar `file`/`fileNoche` por las de Malena. */
export const CASITAS: Record<PlaceId, { file: string; fileNoche: string; fw: number; fh: number; frames: number; ms: number; a: number; b: number }> = {
  periodismo: { file: "generados/casa_redaccion.png", fileNoche: "generados/casa_redaccion_noche.png", fw: 64, fh: 64, frames: 2, ms: 500, a: 0, b: 4 },
  diseno: { file: "generados/casa_estudio.png", fileNoche: "generados/casa_estudio_noche.png", fw: 64, fh: 64, frames: 2, ms: 500, a: 3, b: 2 },
  dibujo: { file: "generados/casa_taller.png", fileNoche: "generados/casa_taller_noche.png", fw: 64, fh: 64, frames: 2, ms: 500, a: 6, b: 0 },
  programacion: { file: "generados/casa_laboratorio.png", fileNoche: "generados/casa_laboratorio_noche.png", fw: 64, fh: 64, frames: 2, ms: 500, a: 3, b: 6 },
  casita: { file: "generados/casa_casita.png", fileNoche: "generados/casa_casita_noche.png", fw: 64, fh: 64, frames: 2, ms: 500, a: 6, b: 5 },
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
};

export function isoLayout(portrait: boolean): Layout {
  const lw = portrait ? 320 : 700;
  const lh = portrait ? 640 : 420;
  const z = 3;
  const ox = portrait ? 144 : 334;
  const oy = portrait ? 196 : 86;
  const places = {} as Layout["places"];
  (Object.keys(CASITAS) as PlaceId[]).forEach((id) => {
    const c = CASITAS[id];
    const sx = ox + (c.a - c.b) * 16 - 16;
    const sy = oy + (c.a + c.b) * 8 - 33;
    // la base de la casita (centro abajo del sprite)
    places[id] = { x: ((sx + 32) / lw) * 100, y: ((sy + 62) / lh) * 100 };
  });
  return { lw, lh, z, ox, oy, worldW: lw * z, worldH: lh * z, places, focus: { x: (ox + 16) * z, y: (oy + 118) * z }, islaW: 300, islaH: 340 };
}
