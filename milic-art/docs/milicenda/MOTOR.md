# Motor del mapa isométrico de Milicenda (especificación)

- Sprites en public/milicenda-assets/. Todo se dibuja en un canvas a resolución lógica y se escala con números enteros (x3 o x4) con image-rendering: pixelated.
- Isla de 9x9 baldosas. Baldosa de suelo 32x16 (30 px visibles). Posición de la baldosa (i, j): x = (i - j) * 16, y = (i + j) * 8, relativo al vértice izquierdo del rombo de la isla.
- Las baldosas de las filas i = 8 y j = 8 (borde de adelante) se reemplazan por bloques de borde_isla_hoja (32x32). La panza (panza_9x9, o las piezas panza_hoja mientras no esté) va debajo del borde.
- Capas, de atrás hacia adelante: cielo (degradé), estrellas (solo noche), nubes lejanas, islitas lejanas, sombra borrosa de la isla, panza, suelo, objetos ordenados por (i + j) (árboles, flores, casitas, Clocky), nubes cercanas, partículas.
- Movimiento: arrastrar el mapa mueve cada capa a distinta velocidad (parallax). La isla se balancea suave en vertical (2 a 3 px lógicos, periodo de unos 6 s) y la sombra se achica y agranda a la par.
- Día y noche: tabla de reemplazo color por color (ver TAREAS_CODE.md, lote D) aplicada al dibujar, con pasos día, atardecer, noche, amanecer y fundido entre pasos. Según la hora real del visitante, con botón sol/luna para forzarlo.
- Animación a 8 fps con requestAnimationFrame. Con prefers-reduced-motion, un solo cuadro quieto.
- Interacción: pasar el cursor o tocar una casita la ilumina y muestra su nombre; clic abre la sección. Funciona con dedo en celu. Lugares: Redacción, Estudio, Taller de dibujo, Laboratorio, Casita.
- Música lofi con botón, apagada por defecto.
- Entrega como artifact autocontenido (HTML único, imágenes como data URI, 16 MiB máximo).
