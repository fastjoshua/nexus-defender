# Nexus Defender V2.2.1 · Pantalla completa sin botón de instalación

**Fecha:** 16 de septiembre de 2026.

- Se retiró del menú el botón de instalación y descarga solicitado para simplificar la portada móvil.
- Al pulsar **Iniciar misión**, los teléfonos compatibles solicitan directamente la pantalla completa.
- La arena conserva el tamaño completo del dispositivo y los controles permanecen superpuestos.
- La capacidad PWA sigue disponible desde el menú propio del navegador, sin promoción dentro del juego.

## Versión anterior: V2.2 · Aplicación instalable y pantalla completa

**Fecha:** 16 de septiembre de 2026.

- Manifest PWA con apertura horizontal, modo `fullscreen`, identidad visual y acceso desde un icono instalado.
- Botón visible para instalar la aplicación o activar y desactivar pantalla completa.
- Solicitud de pantalla completa al iniciar una misión móvil, respetando el requisito del navegador de usar un gesto del jugador.
- Instrucción específica para agregar a inicio en iPhone cuando la instalación automática no está disponible.
- Service Worker con actualización de páginas por red y respaldo sin conexión del juego, la galería y sus recursos.

## Versión anterior: V2.1 · Juego horizontal y guía de puntería

**Fecha:** 16 de septiembre de 2026.

- La experiencia móvil exige orientación horizontal desde el menú principal y muestra una pantalla clara para girar el teléfono.
- Al pasar a horizontal, el menú se adapta al alto disponible y la arena ocupa toda la pantalla durante la misión.
- Los dos joysticks, Dash y Ultimate flotan encima del campo de juego, sin reducir el espacio jugable.
- Solicitud de bloqueo horizontal cuando el navegador lo admite, con alternativa visual compatible cuando no está disponible.
- Línea punteada de puntería manual con opacidad mínima, desde la nave hasta el límite de la arena.
- La guía sigue el joystick, se dibuja detrás de la acción y no modifica la trayectoria ni el daño.
- Pruebas móviles actualizadas para menú horizontal, arena completa, controles superpuestos, bloqueo vertical y guía visual.

## Versión anterior: V2.0 · Controles móviles y teclas configurables

**Fecha:** 15 de septiembre de 2026.

- Vista de misión dedicada para teléfono, joysticks flotantes más grandes, zona de respuesta corta y captura del dedo fuera del círculo.
- Movimiento y puntería simultáneos con dos dedos; Dash y Ultimate separados y fáciles de alcanzar.
- Editor táctil para arrastrar cuatro controles, guardar o cancelar, restablecer y conservar distribuciones independientes en vertical y horizontal.
- En horizontal, los controles quedan a los lados y no tapan los indicadores del juego.
- Siete teclas reasignables en computadora, intercambio ante duplicados, accesos alternativos y persistencia de la configuración.
- Verificación en `tests/v20-controls.test.cjs`, inspección visual móvil y regresión de las suites anteriores.

## Actualización anterior: v1.9 · Módulos y sinergias

**Fecha:** 15 de septiembre de 2026.

- Ocho módulos funcionales nuevos: drones, bobina iónica, marcador, prisma, condensador, nanoenjambre, repulsor y ancla de fase.
- Ocho sinergias nuevas activadas una vez al reunir sus dos módulos; las cuatro anteriores permanecen disponibles.
- Selección de tres categorías con pistas de combinación y mayor probabilidad de ofrecer el módulo que completa una sinergia.
- Bestiario actualizado con 14 módulos y 12 sinergias, tarjetas diferenciadas por color, iconos de módulos instalados y señales Canvas propias durante el combate.
- La selección móvil ocupa toda la pantalla y se puede desplazar para ver las tres cartas.
- Verificación en `tests/v19-modules.test.cjs` y regresión de las suites anteriores.

## Actualización anterior: v1.8 · Moneda estelar, naves y cosméticos

**Fecha:** 15 de septiembre de 2026.

- Moneda estelar como nombre visible del saldo y recompensas. El guardado anterior del saldo se conserva.
- Core gratis; Serenity y Firefly cuestan 50 monedas estelares cada una. Las naves bloqueadas no se pueden elegir ni lanzar y la compra se guarda.
- Precios cosméticos aumentados un 20 %, redondeados hacia arriba. Se conservan los artículos comprados.
- 30 estelas, 15 auras activas y 15 dash activos, más una opción sin efecto en cada categoría. Los nuevos motivos tienen siluetas, paletas y animaciones propias.
- La portada muestra nombre, estela, aura y dash equipados en la misma nave seleccionada.
- Difícil requiere una victoria contra YACERAMI en modo normal; Boss Rush requiere una victoria en modo difícil. Los registros antiguos se migran al nuevo guardado por modo.
- Verificación nueva en `tests/v18-economy-art.test.cjs` y suites de regresión anteriores.

## Actualización anterior: v1.7 · Menú principal y tienda ordenada

**Fecha:** 15 de septiembre de 2026.

- Menú de misión con portada visual, nave seleccionada en Canvas y panel de preparación. Nave, operador y dificultad se mantienen visibles; puntería, números de daño y audio están en un desplegable.
- Atajos de bestiario, diseños y tienda integrados en la portada. En móvil, el menú ocupa la pantalla completa y la acción de iniciar se ubica después de los campos.
- Estelas, auras y dash aparecen en secciones propias, con cada conjunto ordenado por precio ascendente.
- El bestiario se muestra por encima del menú móvil cuando se abre desde él. Pruebas en `tests/v17-menu-store.test.cjs` y regresión de las suites anteriores.

## Actualización anterior: v1.6 · Enemigos y tienda cosmética

**Fecha:** 15 de septiembre de 2026.

- GLITCH anuncia su destino a los 0.8 s y repite el salto después de 1.45 s de recarga y 0.43 s de eco. Una salida y llegada con partículas y sonido distinto ayudan a seguirlo.
- La Mina Pulsar señala los siete carriles peligrosos y una abertura verde 0.78 s antes de disparar. Su pulso alcanza 108 px en los carriles activos, dispara siete proyectiles de 18 px a 225 px/s y vuelve a cargar en 2.15 s.
- Los cinco jefes limitan la distancia de patrulla entre cuadros desde su entrada. La embestida anunciada de Sailor Mars conserva su punto final, y la vuelta a patrulla es gradual.
- Las 20 estelas anteriores se redibujaron con formas y colores secundarios; la tienda añade 10 estelas, 6 auras y 6 estilos de dash. Las vistas previas usan el mismo dibujo que el efecto equipado, con filtros y mejor diseño móvil.
- Las compras y elecciones anteriores siguen siendo compatibles con el guardado existente. Se añadieron pruebas en `tests/v16-features.test.cjs` y se actualizó la verificación de Mina Pulsar y catálogo.

## Actualización anterior: v1.5 · Combate, señales y audio

**Fecha:** 15 de septiembre de 2026.

- BOT, HUNTER y ORBITER anuncian una posición final exacta. El desplazamiento llega al mismo punto; una ralentización retrasa la llegada sin desplazar la marca.
- Nexo gana un pulso perforante cada cuatro ráfagas y una definitiva de tres oleadas dirigidas.
- Quantum dispara desde dos emisores hacia un mismo blanco, enlaza un arco al impactar con ambos y activa dos ondas de fase con escudo y ralentización.
- Becker añade daño cercano a su orbe pesado. Su Nova solar carga y se expande por la arena, limpia enemigos y balas y protege al jugador durante la expansión.
- Dash con ecos de la silueta de la skin en las posiciones reales, una estela direccional y destellos de salida y llegada.
- Disparos y definitivas con sonidos propios por skin, nuevos avisos y una mezcla que evita saturación.
- Cinco composiciones procedurales para los escenarios, más arreglos de combate y de segunda fase de YACERAMI. Las transiciones se mezclan gradualmente.
- Los límites de rebote y teletransporte de SPAM y GLITCH se ajustan a la arena actual.

Las definitivas conservan los límites de daño contra jefes de 25 % por activación y 20 % dentro de cualquier segundo. Pruebas en `tests/v15-features.test.cjs` y regresión en las suites anteriores.

## Actualización anterior: v1.4.2 · Señales visuales más naturales

**Fecha:** 15 de septiembre de 2026.

- Líneas punteadas extensas sustituidas por trazos cortos, curvos y tenues en enemigos que apuntan o anuncian movimiento.
- Marcas de destino pequeñas para conservar la información del ataque.
- Láser del Sniper suavizado, pero visible durante su aviso.
- Señales de jefes y estrella fugaz continuas y difusas, sin modificar patrones, zonas de impacto ni tiempos de aviso.
- Verificadas de nuevo las 65 pruebas de enemigos y señales.

## Actualización anterior: v1.4 · Arena y controles móviles

**Fecha:** 15 de septiembre de 2026.

- Arena de 1200 × 750, mostrada más grande en escritorio.
- Joystick táctil analógico de movimiento y joystick de apuntado con mejor tamaño, zona muerta y captura del dedo.
- Apuntado manual sin proyectiles guiados contra jefes.
- Números de daño opcionales y alerta visual al recibir un golpe.
- Ultimate con techo de 25% de vida máxima por activación; el límite global de 20% por segundo permanece. La Nova de Becker entrega el último tramo después de un segundo.
- Tienda ampliada de cinco a veinte estelas con nuevas formas visuales.
- Optimización automática cuando el tiempo de cuadro aumenta: se limitan partículas, balas, estelas y detalles del fondo.
- Reglas separadas en `js/game-rules.js` y pruebas automáticas en `tests/game-rules.test.cjs` y `tests/gameplay.test.cjs`.

## Actualización anterior: v1.3 · Skins del jugador

**Fecha:** 15 de septiembre de 2026.

Basada en la versión de presentación v1.0 del 20 de agosto de 2026. La copia original y sus paquetes de agosto se conservan intactos; esta carpeta contiene la versión nueva.

## Cambios

- Nexo: silueta de interceptor con alas angulares, visor y riel central que se ilumina al disparar.
- Quantum: alas espejadas, dos emisores visibles y dos propulsores cian.
- Becker: blindaje ancho, hombreras y reactor dorado que carga un disparo pesado.
- Retratos animados en el menú creados con el mismo dibujo Canvas utilizado en combate; cada opción indica su estilo de ataque.
- Motores, destellos de disparo, dash y energía definitiva reflejan visualmente el estado de la nave.
- Preferencia de movimiento reducido aplicada también a los retratos de selección.

Las tres naves conservan sus armas, estadísticas y rectángulo de colisión de 44 × 44. `js/player-art.js` reúne los nuevos dibujos y `tests/player-art.test.cjs` verifica la selección en escritorio y móvil.

## Mejoras previas de enemigos (v1.2)

- Diez enemigos con siluetas, armaduras y animaciones propias, dibujadas en Canvas.
- Cinco jefes rediseñados y transformación visible de YACERAMI en la segunda fase.
- Estrella fugaz facetada con estela y advertencia de trayectoria.
- Lente del SNIPER y anillo de la mina sincronizados con sus tiempos de disparo.
- TANK con grietas según vida restante; PHANTOM con contorno persistente.
- Bestiario completo con los mismos dibujos de combate, textos corregidos y consulta a pantalla completa en móvil.
- Galería animada con escala de combate, daño del TANK y segunda fase de YACERAMI.
- Barra del jefe legible durante los combates, sin solaparse con el progreso de oleada.
- Diez reglas distintas: división, pasos calculados, rebotes, disparo a una posición fijada, embestida, teletransporte, impacto circular, impulso orbital, corredor seguro y fase etérea.
- Cinco reglas nuevas para los jefes y segundo paso anunciado de la estrella fugaz.
- `COMPORTAMIENTO.md` describe la función, señal y forma de responder a cada amenaza.

La progresión, las recompensas y los rectángulos de colisión se mantienen. La vida base del BOT, el tamaño y velocidad del SPAM y los ataques de los enemigos cambiaron para diferenciarlos. El modo difícil conserva sus multiplicadores generales.

## Abrir

- `index.html`: jugar y consultar el bestiario.
- `designs.html`: explorar los dieciséis diseños animados.

Ambas páginas funcionan al abrirlas directamente en un navegador, sin instalación y sin recursos externos.

## Verificación

73 comprobaciones aprobadas en Microsoft Edge con Playwright: 65 del comportamiento de enemigos, avisos antes de los ataques, daño y protección, habilidades de los cinco jefes, regreso de la estrella fugaz, progresión y galería; 8 de las nuevas skins, su selección, retratos, estadísticas, colisión y vista móvil. La galería y los retratos respetan la preferencia de movimiento reducido.

Ejecutar `node tests/enemy-art.test.cjs` y `node tests/player-art.test.cjs` en un entorno con Playwright disponible. Los tests guardan capturas en `work/verification/`.
