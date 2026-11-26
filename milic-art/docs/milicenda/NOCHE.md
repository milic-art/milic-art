# Noche de trabajo: isla flotante (rama isla-pixel-art)

## Qué quedó hecho
- Motor `src/components/isla/IsoIsland.tsx` (React + canvas, escala entera, pixelated). Reemplaza a PixelBackdrop (el archivo viejo sigue en el repo, sin usar).
- Isla 9x9 con pasto (6 variantes, semilla fija), bloques de borde, panza propia, árboles con sombra aparte y balanceo, flores, girasoles animados, piedras flotantes, raíces colgantes, estanque con orilla de espuma, patitos, cascada de 3 cuadros por el borde, camino de tierra, mariposas, brillitos, humo de chimenea, pajaritos, nubes (3 tamaños), sol, luna y estrellas.
- 5 casitas (Redacción, Estudio, Taller de dibujo, Laboratorio, Casita) de 64x64, 2 cuadros, versión de noche con ventanas encendidas. Hover/toque: contorno claro, rebote de 1 px, más humo y el nombre resaltado. Clic abre la sección como antes (probado en compu, celu y movimiento reducido: las 5 abren).
- Día y noche por tabla de reemplazo de colores (lote D), según la hora del visitante, con fundido y botón sol/luna. Atardecer/amanecer: cielo cálido durante el fundido.
- Parallax (arrastre y mouse), balanceo de la isla (~6 s) con su sombra, nubes que pasan. `prefers-reduced-motion`: un solo cuadro quieto.
- Botón de música (apagado, sin audio todavía).
- La vista inicial encuadra la isla entera; en celu los nombres se esconden al alejarse (tapan las casitas) y se ven al tocar.
- Artifact: `node docs/milicenda/build_artifact.mjs` arma un HTML único (0,8 MiB) con imágenes incrustadas (`dist-artifact/`, no se versiona).

## Generadores (todo original, check_paleta.py en OK)
- `gen_panza.py`: panza_9x9_claude.png (288x200).
- `gen_assets.py` (+ `gen_lib.py`): agua, cascada, camino, nubes, sol, luna, girasol, mariposas, pato, casitas y sus versiones _noche. Salida en `public/milicenda-assets/generados/` (con copias _x8 para revisar).
- `check_paleta.py` ahora acepta la paleta de noche para archivos `*noche*` y `luna`.

## Cómo reemplazar piezas por las de Malena
Todo en `src/components/isla/config.ts`:
- Panza: `PANZA.file` + las esquinas izquierda/derecha/inferior del rombo (los números del `panza_9x9.txt`). Si el sprite trae las caras del borde, poner `incluyeCarasDelBorde: true` (falta implementar ese caso en el motor: hoy el flag solo documenta; hay que saltear los bloques de borde).
- Casitas: `CASITAS[id].file` / `fileNoche` / medidas / cuadros / `ms` y la celda `(a, b)`.
- Resto de sprites: `ASSETS`.

## Decisiones
- Mundo en píxeles lógicos: compu 700x420, celu 320x640, escala x3. Las posiciones de los lugares salen de la grilla isométrica (no de site.map.places x/y).
- Las casitas ocupan 2x2 baldosas, repartidas a mano para que no se superpongan.
- El humo, brillitos, luciérnagas, estrellas y pajaritos se dibujan por código (rectángulos de 1 px), sin sprite.
- Sombras de objetos: un solo color #35563a con transparencia, como en los assets aprobados.

## Pendiente / ideas
- Falta: pinos, cascada que conecte con el agua con más gracia, ondas en el agua al tocar, destello al tocar, música real, Clocky caminando por el camino.
- La panza puede ganar detalle (más raíces, piedritas); las casitas son parecidas entre sí, esperan las de Malena.
- Texto de los lugares y contenidos del sitio: no se tocó nada.
- Audio: no incluido.
