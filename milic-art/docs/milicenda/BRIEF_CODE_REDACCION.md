# Brief para Code: edificios de Milicenda con mucho más detalle (pixel art)

## Contexto
- Proyecto: **Milicenda**, mapa pixel art vista top-down 3/4 de un bosque con 5 casitas. Cuenta de arte: milic_art (Malena, Argentina).
- Repo: `milic-art/milic-art`, rama **`isla-pixel-art`**. NO tocar `main` ni `version-claude`.
- Todo lo nuevo se publica solo en el artifact PROTOTIPO "Milicenda prototipo" (slug `b605fcd0-561b-423d-819c-f60b8a64c722`), con `mcp__claude-artifacts__publish_files`, `as: index.html`, path `dist-artifact/artifact-fragment.html`. El artifact público "Milicenda" (slug `c06ad38a-ac17-453c-93f3-6e3bed100af7`) queda congelado.
- Notas y decisiones: Doc maestro https://claude.ai/artifact/J57YDgC5WznLAbA2EKZFXJ, TAB 5 "Milicenda". Agregar solo líneas concisas, sin crear docs nuevos.
- Build: `node docs/milicenda/build_artifact.mjs` → `dist-artifact/artifact-fragment.html` y `artifact.html`. Test con playwright (`NODE_PATH=/opt/npm-tools/node_modules`): `file:///.../dist-artifact/artifact.html?modo=dia&sin-movimiento`, anclas `#periodismo #diseno #dibujo #programacion #casita`.
- Commits: terminar con `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` y `Claude-Session: <url de la sesión>`.

## Qué pidió ella (lo que importa)
1. **Todas las casitas mucho más detalladas** que el resto del mapa. Regla: "cuanto más detallado y mejor hecho el pixel art, mejor". Nivel de referencia: torre de reloj de madera con eje de vidrio con engranajes, escalera exterior, reloj con números romanos, rayos de sol, pájaros. **Quiere ese nivel de detalle, NO una copia**: analizar parte por parte y hacer diseño propio.
2. **Ella no va a dibujar nada en Krita.** Lo tiene que producir Code.
3. Empezar por la **Redacción (periodismo)**, versión **de día solamente** para ir probando. Después Estudio, Taller de dibujo, Laboratorio y Casita.
4. Mostrarle cada parte/pieza para que apruebe antes de seguir. Tiene mucha sensibilidad visual y ya rechazó varios intentos.

## Por qué fallaron mis intentos (para no repetirlos)
Dibujé píxel por píxel con código, plano y sin volumen. Sus críticas textuales y de fondo:
- "Parece una casita de madera con reloj, no una torre de reloj"; "parece un pico".
- Techo con franjas que parecen escalones, poca naturalidad.
- Reloj desproporcionado (demasiado grande) y mal integrado.
- Demasiados marrones juntos: madera desordenada, ruido en las texturas.
- Pluma/veleta "desconectada" de la estructura.
- Colores no convencen; falta trabajar **sombras, perspectiva y forma**; falta detalle.
- Escaleras enredadas, engranajes que se funden en una mancha, composición de piezas pegadas.
Lo que sí funcionó: **assets modulares bien terminados** (ver engranajes abajo) y dos tonos de madera como máximo.

## Dirección de arte decidida para la Redacción
- Forma elegida: **A, torre alta y angosta**, una sola torre alta sola + un edificito al lado que parece seguir bajo tierra con engranajes. Silueta elegante, techo bajo y liviano (perfil cóncavo), pocos materiales claros.
- Colores elegidos: **base de piedra gris + cuarto del reloj de madera + techo de cobre oxidado (verde/turquesa)**, acentos de latón. Moderno, no piedra clara.
- Tiene que verse volumen: luz arriba-izquierda, caras con 2 o 3 tonos por material, sombra proyectada, perspectiva 3/4 coherente (ver cómo están hechos los otros sprites `casat_*.png`).
- Detalles pedidos: reloj con **hora real del visitante** (agujas las dibuja el código), veleta de pluma/lápiz, bandera que flamea, faroles en la puerta, ventanas con luz cálida de noche (noche después), puerta de madera con cartel de pluma, afuera atril de diarios, buzón, banquito; efectos: papeles volando, luz de escritorio de noche. **Sin personitas.** **Ningún dirigible.**
- Steampunk solo como detalles: máquina de escribir, historia de la escritura (pluma/tintero, imprenta, linotipo, telégrafo, rotativa), engranajes y caños bajo tierra.
- Paleta cerrada de 45 colores (`PAL_TXT` en `docs/milicenda/gen_lib.py`) y tabla de noche (`NOCHE`, `a_noche`). Luces `#ffd36b #fff1a8 #fff6d6 #fff3c4` no se oscurecen de noche.

## Método sugerido
Hacerlo **modular**: piezas sueltas, bien terminadas, mostradas una por una, y después armar la torre:
engranajes, reloj, ventana de vidrio con reflejos, tablones/pared, techo de cobre oxidado, escalera con baranda, puerta, farol, cartel, veleta.
Opciones para lograr volumen real: (a) dibujo procedural con sombreado por borde (luz arriba-izquierda, borde claro/oscuro por vecino); (b) modelar en 3D simple (three.js con playwright, cámara ortográfica 3/4, luz con sombras), renderizar, reducir y cuantizar a la paleta de 45 colores y agregar contorno. Elegir lo que dé mejor resultado visual; probar con una sola torre antes de seguir.

## Estado del código (en la carpeta de trabajo de mi sesión, SIN commitear)
- `docs/milicenda/gen_redaccion.py`, `gen_redaccion2.py`, `gen_torre.py`, `gen_torre2.py`, `gen_torre3.py`: intentos descartados de la Redacción (sirven solo como referencia de funciones: `Lienzo`, `tablones`, `haz`, `reloj_limpio`).
- `docs/milicenda/assets_engranajes.py`: **asset aprobable**: engranajes que encajan de verdad (módulo m, N dientes, fase para que el diente caiga en el hueco; vecinos giran al revés; 4 cuadros). Dientes anchos y cortos, relieve con luz arriba-izquierda, anillo hundido con rayos, tornillo central. Cálculo en el doc de proyecto `claude/banco-de-assets-engranajes.md`.
- `src/components/isla/config.ts`: `CASITAS_TOP.periodismo` ya apunta a `generados/casat_redaccion.png` con `fw:128, fh:190, base:170, puerta:60, humo:[117,92]` (medidas del intento descartado: ajustar al sprite final).
- `src/components/isla/TopIsland.tsx`: `x0 = bx - h.c.fw / 2`; sombra solo si `fw === 64`; bloque `h.id === "periodismo"` con agujas del reloj en (x0+66, y0+82) y papeles volando desde el puesto (x0+14, y0+148). Actualizar coordenadas al sprite final.
- `src/components/isla/route.ts` (~línea 104): `x - fw/2 + puerta`.
- `docs/milicenda/gen_casas_top.py`: `casat_redaccion` sacada de `CASAS` para no pisar el sprite nuevo.
- Resolución: el canvas es de resolución lógica (`canvas.width = lw`, layouts 1020x600 horizontal y 490x880 vertical, `z` entero). Más detalle = sprites más grandes con el mismo tamaño de píxel. Revisar espacio en el layout (la Redacción está en [280,168] h y [162,176] v; la isla empieza en y≈34) y mover/escalar lo necesario.


## Análisis de la referencia, parte por parte (inspirarse, no copiar)
La imagen es una torre de reloj de madera con engranajes de vidrio. Qué hace bien cada parte y cómo traducirlo:
1. **Silueta:** torre alta, de planta cuadrada, en tres bloques bien distintos: cuarto del reloj arriba (oscuro, rojizo), tramo medio con el reloj, tramo inferior dorado con vidrio. Entre bloques hay vigas horizontales que sobresalen un poco. Traducción: mantener la lectura en 3 bloques, pero con diseño propio (piedra + madera + cobre oxidado).
2. **Techo:** pirámide baja, oscura, con aleros que sobresalen y una aguja fina arriba. Es sobrio: no tiene franjas llamativas. Traducción: techo de cobre oxidado de perfil cóncavo, un tono por cara y escamas sutiles, aleros con sombra, aguja de latón con pluma montada en la aguja.
3. **Madera:** tablones verticales finos, con 3 o 4 tonos cercanos, vetas y juntas, y diferente temperatura según el sector (rojiza arriba, dorada abajo). El orden viene de que cada sector usa SU rampa, no todos los marrones mezclados. Traducción: una rampa de 3 tonos por material, luz arriba-izquierda, juntas oscuras y 2 o 3 vetas, nada de manchas al azar.
4. **Reloj:** esfera crema con números romanos, agujas oscuras, bisel fino y sombra proyectada. Es chico respecto de la torre (más o menos 1/3 del ancho de la cara). Traducción: reloj de radio ≈ 1/3 del ancho, bisel de latón fino, agujas dibujadas por el código con la hora real.
5. **Vidrio con engranajes:** columna vertical con marco de madera, vidrio claro con reflejos diagonales y engranajes de latón grandes, pocos, bien separados y encajados. Se ve hasta adentro. Traducción: usar `assets_engranajes.py` (engranajes que encajan) detrás de un vidrio turquesa claro con 2 o 3 reflejos diagonales.
6. **Escalera exterior:** zigzag/espiral que rodea la torre, con baranda y escalones con su soporte. Pasa por delante y por detrás, con perspectiva. Traducción: una sola escalera clara (un tramo por lado como máximo), sin cruzarse con otros elementos, con escalones que muestran tapa clara y frente oscuro, baranda con postes y pasamanos.
7. **Luz:** rayos diagonales de sol que atraviesan toda la torre y proyectan sombras sobre los tablones. Traducción: sombra proyectada coherente (alero sobre la pared, escalera sobre la pared) y una o dos bandas de luz suaves, sin estropear el reloj.
8. **Extras:** ventana encendida con luz cálida, pájaros, remates de metal en los bordes.

## Medidas reales del repo (para dimensionar)
- Casitas actuales: 64×72 px por cuadro, 2 cuadros (hoja de 128×72), unos 21 colores por sprite, `base: 68`. La Redacción es el único edificio alto: mi intento descartado ocupaba 128×190 por cuadro, probablemente demasiado grande. Probar entre 80 y 110 px de alto y ver cómo queda en el mapa antes de fijar tamaño.
- Cada sprite lleva versión `_noche` (se deriva con `a_noche`) y una versión `_x8` solo para mirar.
- `puerta` en config = x de la puerta dentro del sprite (Clocky camina hasta ahí); `humo` = punto de salida del humo.

## Criterios de aceptación (checklist antes de mostrarle cada pieza)
- [ ] Se ve el volumen: cada cara tiene su tono, hay borde de luz y sombra proyectada.
- [ ] Cada material usa su rampa de 3 tonos como máximo (nada de manchas marrones).
- [ ] Proporciones lógicas: el reloj no domina, el techo no es más pesado que el cuerpo, las escaleras no se cruzan.
- [ ] Todas las piezas están ancladas (la veleta toca la aguja, el caño toca la pared).
- [ ] Solo colores de la paleta cerrada de 45.
- [ ] Probado en el mapa en compu y celu, no solo en la hoja de sprites.
- [ ] Mostrarle a ella cada pieza (imagen ampliada ×6 o ×8 sobre fondo verde del mapa) y esperar aprobación.

## Qué tiene que adjuntar ella al pasarle esto a Code
Las referencias no están en el repo (son de terceros, solo inspiración): adjuntar en el chat de Code la imagen de la torre de reloj de madera, y la hoja de engranajes `engranajes.png` que se hizo en esta sesión. Mis scripts (`assets_engranajes.py`, etc.) están sin commitear: pedir a Claude que los suba a la rama antes.

## Animación (obligatoria)
- **Los engranajes del eje de vidrio tienen que girar de verdad**, también los del sótano/bajo tierra del edificito. Usar `assets_engranajes.py`: vecinos giran en sentido contrario, un diente por ciclo para que el loop sea perfecto (360/N grados), y el último cuadro igual al primero.
- Hoy los sprites tienen 2 cuadros a 500 ms (`frames: 2, ms: 500`). Para los engranajes alcanzan 4 cuadros (subir `frames` a 4 y ajustar `ms` a ~250 para que gire suave sin marear; ella pidió que **nada rote ni se mueva de forma marcante** porque se marea). Mantener el giro lento.
- También se animan: bandera que flamea, papeles volando, pájaros, agujas del reloj (hora real). Todo se detiene con `?sin-movimiento` y para quien tenga reducción de movimiento.

## Entregables
1. Torre de la Redacción (día) mostrada por partes y aprobada.
2. Integración en el mapa (config, TopIsland, route, hit areas/silueta de hover/chapita de visitado en `interacciones.js`), Clocky caminando bien hasta la puerta.
3. Screenshots día en compu y celu (hacer scroll hasta la Redacción), build, publicación al PROTOTIPO, commit a `isla-pixel-art`.
4. Después: versión noche, y las otras casas con el mismo estándar.
