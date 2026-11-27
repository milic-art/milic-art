import { TOP, topLayout } from "./config";
import { segmentsOf, snap, graphRoute, walkMs, pointAt } from "./route";
import { assetUrl } from "./IsoIsland";
import interacciones from "./interacciones.js?raw";

/** Puente para interacciones.js (interacciones de Clocky + jueguito secreto): lo expone el motor, igual que en la v34. */
export function installMil() {
  const w = window as unknown as Record<string, unknown>;
  if (w.__mil) return;
  w.__milSheet = assetUrl("code/efectos_clocky_hoja.png");
  w.__mil = { er: TOP, xx: segmentsOf, Oc: snap, fx: graphRoute, kx: pointAt, Jc: walkMs, Ei: topLayout };
  const s = document.createElement("script");
  s.id = "mil-interacciones";
  s.textContent = interacciones;
  document.body.appendChild(s);
}
