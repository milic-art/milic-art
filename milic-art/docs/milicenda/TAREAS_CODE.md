# MILICENDA: tareas para Claude Code (modo autónomo)

Leé todo este documento y trabajá sola, de corrido, sin pedir confirmaciones. Si dudás, elegí lo más razonable y anotalo en DECISIONES.md. Malena no está; va a volver más tarde y va a revisar el resultado.

## OBJETIVO Y NIVEL DE CALIDAD (leer primero)
El mapa final es la cara del portfolio de milic_art y tiene que quedar **lo mejor posible: muy detallado, muy animado e interactivo**. Entonces:
- **Detalle:** cada zona tiene que tener muchos objetos distintos y variantes (no repetir el mismo sprite). Más variantes de árboles, flores, rocas y pasto. Detalles chiquitos que den ganas de mirar de cerca.
- **Animación en todo lo que se pueda:** agua, árboles y arbustos que se mecen, flores, girasoles, humo, nubes, bichitos, luces que titilan, cascada.
- **Interactividad:** cada casita y varios objetos tienen estados (reposo, hover, activo). Clocky reacciona. Hay cosas escondidas para encontrar.
- **Vida:** bichitos que se mueven solos (mariposas, pajaritos, abejas, libélulas, patitos, peces).
- Si hay que elegir entre cantidad y calidad, ganá la calidad, pero no abandones ningún lote: hacé todo y pulí lo que quede flojo en una segunda pasada.
- Usá la mayor cantidad de cuadros que valga la pena (la web los carga todos), siempre dentro de la paleta.

## 0. Antes de empezar
- Carpeta de trabajo: C:\Users\Malena\Pictures\pixel-art\milicenda\ (una subcarpeta por tema).
- Si existe ESTADO.md, leelo y seguí desde donde quedó. Si no existe, creálo y empezá por el lote A.
- Antes de empezar cada lote escribí en ESTADO.md qué lote es y qué falta. Si se corta por el límite de uso, el próximo arranque retoma desde ahí.
- Anotá en DECISIONES.md cualquier elección tuya (qué, por qué).
- Al terminar todo, escribí RESUMEN.md (máximo 15 líneas) y no hagas nada más.

## 1. Reglas de estilo (no negociables)
Proyecto: isla flotante isométrica en pixel art para la web de milic_art (mascota Clocky, un cocodrilo). Diorama cálido y acogedor tipo granja. Isométrico 2:1 (2 px horizontales por 1 vertical), baldosa de suelo 32x16 px (30 px visibles de ancho, filas de 2, 6, 10 ... 30). Luz arriba a la izquierda. Contorno #2e1b14, selectivo (más claro del lado de la luz, más oscuro en la sombra). Sin antialiasing, sin degradados, sin ruido, sin dithering. Formas en bloques grandes, 3 a 5 tonos por material con cambio de tono (sombras hacia verde azulado, luces hacia amarillo). Fondo transparente, sin semitransparencias. Las sombras de objetos van en archivo aparte (un solo color #35563a). Todo original; no copiar assets existentes.

Paleta cerrada (45 colores, usar SOLO estos):
#2e1b14 #4a2c1f / #35563a #587a35 #8aa23a #bcc046 #e2d870 / #5a3322 #8a4e2a #b96d32 #dc9544 #f2bd6e / #463f4a #77707c #a8a08e #d6cbb0 / #1b5f66 #2c9488 #58cc9f #b2f0cc #effbe6 / #7a2e26 #b84a2c #e8874a #f4b183 / #5f3a24 #8f5a30 #bf8444 #e0b070 / #fbf3e4 #fffdf7 / #d99a1c #f2c230 #f9e07a / #c94b64 #f092a4 / #8a5fc0 #c3a2e6 #4f7fd0 #a8cdf2 / #8fd2d2 #c8ecdc #fbf3e4 / #c2e0d8 #ffffff

## 2. Cómo trabajar cada hoja
1. Generala con script por bloques (herramientas compartidas: esferas sombreadas, contorno selectivo, empaquetador de hojas).
2. Mirá la copia ampliada x8 y pasá este checklist: silueta clara, cada grupo de hojas con luz arriba a la izquierda y sombra abajo, variantes con siluetas distintas (no solo otro color), sin bandas diagonales largas, sin píxeles sueltos sin sentido, contorno selectivo visible, nada de manchas pegadas al borde del rombo en baldosas, animaciones que cambien pocos píxeles entre cuadros.
3. Corré check_paleta.py sobre la carpeta. Si sale MAL, corregí y repetí.
4. Guardá: PNG de tamaño real, copia _x8 y un JSON con la posición de cada sprite en la hoja (nombre, x, y, ancho, alto, cuadros y ms si anima).

## 3. Cola de tareas, en este orden

### Lote A: lote 2 (si no está hecho)
- P4 camino_hoja: baldosas de tierra 32x16 (4 variantes) y transiciones tierra-pasto (recta, esquina interior, esquina exterior, punta).
- P5 agua_hoja: baldosa 32x16 en 2 cuadros (500 ms), rayas horizontales largas y brillos agrupados, cambia solo 4 al 8 % de los píxeles; orilla con espuma (recta y esquinas); cascada 16x48 en 3 cuadros (150 ms); estanque con piedras y juncos 48x32.
- P6 naturaleza_hoja: 6 árboles (redondo, pino, sauce, grande con puerta, dos más de otras siluetas), 5 arbustos, 4 rocas, 2 troncos, 2 tocones, 6 hongos blancos.
- P6b jardin_hoja: 4 macetas con flores, 3 arbustos con florcitas, enrejado de madera 24x40 con flores trepadoras, 3 matas de pasto alto.
- P2b flores_hoja: 8 flores de 12x16 con silueta propia (tulipán, margarita, lavanda, jacinto, dalia, amapola, lirio, pensamiento), cada una con montoncito de tierra y 2 hojas.
- P7 girasoles_hoja: grande 16x24 y chico 12x16, 2 cuadros (400 ms) cada uno.
- P10 cielo_hoja: nubes esponjosas de 3 tamaños, sol, luna, estrellas, 3 islitas lejanas borrosas.
- P11 deco_hoja: cartel de madera, cerca, barril, buzón con bandera arriba y abajo, puesto de papelería con toldo, farolito, muelle, puente de madera, pozo con balde, banco de madera.
- P12 efectos_hoja: brillitos de 4 cuadros, luciérnaga de 2 cuadros, gota de cascada, hoja que cae, humo de chimenea de 4 cuadros.

### Lote B: ajustes pendientes de lo ya entregado
- pasto_hoja: sumar 3 variantes (dos con menos manchas y una casi lisa), total 9. Las manchas no tocan el borde del rombo (2 px de base #8aa23a alrededor). Regenerar pasto_mosaico (6x6).
- borde_isla_hoja: más mechones de pasto colgando sobre la tierra, 5 variantes.
- raiz_colgante: más fina y con curva, que no parezca una rama.
- panza_9x9 (2 variantes, panza_9x9_a.png y panza_9x9_b.png): parte de abajo de una isla flotante de 9x9 baldosas en UN solo sprite. Incluye las caras laterales del borde de arriba (16 px, tierra con pasto colgando) y todo lo que cuelga. Masa continua sin líneas negras horizontales entre capas; contorno solo en el perfil exterior. Silueta irregular que se afina hasta una panza gruesa, 3 estalactitas de roca de largos distintos (la central la más larga y gruesa, no una aguja), transición tierra-roca irregular con raíces y piedras, raíces colgando en 2 o 3 lugares, piedritas, huesito en una variante. Cara izquierda clara, derecha oscura. Altura máxima 120 px por debajo del borde. Guardar panza_9x9.txt con la posición exacta (x, y) de la esquina izquierda, derecha e inferior del rombo superior respecto del sprite.

### Lote C: casitas y Clocky
- Casitas (5), cada una de 64x64 px (si hace falta para el detalle, hasta 64x80), **4 cuadros (300 ms)** con mini escena propia y mucho detalle (ventanas con cortinas, cartel con el símbolo del lugar, chimenea, mini jardín, objetos en la puerta): casa_redaccion (máquina de escribir, papelitos que vuelan), casa_estudio (pizarra con post-its, lamparita que titila), casa_taller (caballete donde se va pintando, paleta y pinceles), casa_laboratorio (engranajes girando, burbujas), casa_casita (chimenea con humo, girasoles alrededor, Clocky dormido en la puerta). Techos naranjas de la marca (#7a2e26 #b84a2c #e8874a #f4b183), una maceta con flores en cada puerta. Sombra aparte.
- clocky_hoja, 32x32 px, isométrico: cocodrilo cuadrúpedo juvenil, gordito y compacto, patas cortas y gruesas, cola larga, hocico ancho y redondeado, verde pantanoso (#35563a #587a35 #8aa23a), vientre amarillo manteca (#f9e07a), cicatriz sobre el ojo izquierdo, pupila vertical, contorno #2e1b14. Animaciones: reposo (4 cuadros), caminar en 4 direcciones (6 cuadros cada una, 100 ms), saludar con una patita, dormir (4 cuadros), despertarse (abre un ojo, abre el otro, se estira, se levanta), estornudar, sorpresa, saltito de contento, mirar al costado, comer girasol. Es bobo, bueno y torpe, "medio golden retriever". Sin globos de texto que narren la acción. Sombra aparte.

### Lote D: versión de noche de todo
Escribí noche.py que, para cada PNG de las hojas, genere NOMBRE_noche.png reemplazando colores así:
- Pasto: #35563a→#1b2a3a, #587a35→#2a4546, #8aa23a→#3f6552, #bcc046→#6a8a68, #e2d870→#94ad86
- Tierra: #5a3322→#1c1424, #8a4e2a→#35243a, #b96d32→#583a48, #dc9544→#7e5456, #f2bd6e→#a47868
- Agua: #1b5f66→#10284a, #2c9488→#1c4a7a, #58cc9f→#3a7fa8, #b2f0cc→#7fbbd0, #effbe6→#d6f0f0
- Techo: #7a2e26→#2a1930, #b84a2c→#53283e, #e8874a→#8a4a52, #f4b183→#b57a7a
- Flores frías: #8a5fc0→#4a3a8a, #c3a2e6→#7a6aa8, #4f7fd0→#2a4a8a, #a8cdf2→#6a8ab8
- Cielo: #8fd2d2→#1b1840, #c8ecdc→#3a2f6e, #fbf3e4→#6a5aa0
- Los demás colores (piedra, madera, crema, flores cálidas, nubes, amarillos, contornos): mezclar 55 % con #1b1840.
- Las luces (farolito, luciérnaga, brillitos, ventanas) no se oscurecen: en las casitas, las ventanas de noche usan #ffd36b y #fff1a8.
Generá además casa_*_noche con ventanas encendidas y, en noche, estrellas (#fff6d6) y luna (#fff3c4) en cielo_hoja_noche. Chequeá las versiones de noche con check_paleta ampliado a la paleta de noche (agregá esos colores en el script solo para los archivos _noche).

### Lote E: vida e interacción (importante, es lo que hace que el mapa se sienta vivo)
- **Estados de las 5 casitas:** además del reposo, hover (se ilumina el contorno, la ventana prende, el humo sale más fuerte, rebote de 1 px; 3 cuadros, 150 ms) y activo (puerta que se abre; 4 cuadros).
- **Árboles, arbustos y pasto alto meciéndose:** versión de 2 a 4 cuadros (300 a 400 ms) de cada uno, moviendo pocos píxeles de las hojas de arriba.
- **Bichitos que se mueven solos:** mariposas (2 colores, 4 cuadros), pajarito posado y volando (4 cuadros), abeja (2 cuadros), libélula (2 cuadros), rana, pez que salta (4 cuadros), patitos nadando (2 cuadros), cocodrilito asomando entre juncos (4 cuadros).
- **Objetos con reacción:** cartel que se mece, buzón con la bandera que sube (3 cuadros), farolito que titila (2 cuadros), molinito de viento girando (4 cuadros), pozo con balde que sube, fogata (4 cuadros), girasol que se inclina hacia el cursor (3 posiciones).
- **Efectos de interacción:** ondas en el agua (4 cuadros), destello al tocar (4 cuadros), polvito de pasos de Clocky (3 cuadros), pétalos que vuelan (4 cuadros), brillitos al encontrar un coleccionable.
- **Coleccionables escondidos:** 8 objetitos de 12x12 (llave, moneda, pluma, estrella, hongo dorado, concha, huevo, libro chiquito), cada uno con un brillito de 2 cuadros.

### Lote F: tanda 2 (solo si terminaste todo lo anterior)
- Puesto de papelería con productos variados y toldo animado (2 cuadros).
- Eventos de temporada, un set chico cada uno, 8 a 10 sprites: San Valentín (corazones, guirnalda, globitos rosa), Halloween (calabazas, telarañas, murciélago, fantasma chico), Navidad (arbolito con luces, guirnaldas, copos, regalo).

## 4. Entrega
- Dejá todo en C:\Users\Malena\Pictures\pixel-art\milicenda\entrega\ con una subcarpeta por tema, cada hoja con su _x8 y su JSON.
- Armá milicenda_assets.zip con todo.
- Corré check_paleta.py sobre toda la carpeta y guardá el resultado en CHECK.txt.
- Escribí RESUMEN.md: qué lotes terminaste, qué quedó pendiente, qué decisiones tomaste.

## 5. Si algo falla
- Si un lote no sale bien después de 2 intentos, dejalo en ESTADO.md como pendiente con el motivo y pasá al siguiente. Volvé a él al final.
- No borres nada ya entregado. Para cambios, creá versiones nuevas (sufijo _v2).
