# Nexus Defender V2.1

## Actualización V2.1 · Misión horizontal y guía de puntería

En teléfono, la misión se activa únicamente con la pantalla horizontal. Si se inicia en vertical, el tiempo, los enemigos y el nivel quedan detenidos bajo un aviso para girar el dispositivo; al rotarlo, la partida continúa automáticamente con toda la arena y los controles visibles. El juego intenta solicitar orientación horizontal cuando el navegador lo permite y conserva el aviso como alternativa compatible con iPhone y Android.

Al usar el joystick de puntería aparece desde la nave una línea punteada casi invisible hasta el borde de la arena. La guía sigue la dirección real de los disparos, permanece detrás de los elementos de combate y desaparece fuera del modo manual.

## Versión anterior V2.0 · Controles móviles y teclas configurables

En teléfono, la misión usa una vista dedicada al juego y controles grandes bajo los pulgares. Los dos joysticks se centran al tocarlos, responden a un desplazamiento corto y mantienen la dirección aunque el dedo salga de su círculo. Movimiento y puntería funcionan con dos dedos simultáneos. Dash y Ultimate son botones separados junto al joystick de puntería.

Desde “Ajustes adicionales → Personalizar controles” o desde el botón de controles durante la misión se abre un editor para arrastrar movimiento, puntería, Dash y Ultimate. Las posiciones verticales y horizontales se guardan por separado; Guardar, Cancelar y Restablecer controlan los cambios. El juego se pausa mientras se edita desde una misión. En horizontal, los controles quedan a los lados y la información de la arena sigue visible.

En computadora se pueden reasignar las siete acciones: mover arriba, abajo, izquierda y derecha, Dash, Ultimate y pausa. Al asignar una tecla ya usada, ambas acciones intercambian sus teclas. Las flechas y Espacio siguen disponibles como accesos alternativos cuando no se hayan asignado a otra acción. El panel permite restablecer los valores originales y la configuración permanece al recargar. `tests/v20-controls.test.cjs` verifica la respuesta táctil, dos dedos, el editor, ambas orientaciones, las teclas y el guardado.

## Actualización v1.9 · Módulos y sinergias

La selección al derrotar a un guardián ofrece una carta de ataque, una de defensa y una de movilidad o energía. Cada carta muestra su efecto y la combinación que puede completar; los módulos de activación única dejan de aparecer después de elegirlos. El bestiario reúne los 14 módulos y las 12 sinergias disponibles, y durante la misión la nave muestra los módulos instalados.

Se incorporaron Drones escolta, Bobina iónica, Marcador táctico, Prisma fractal, Condensador Ultimate, Nanoenjambre, Repulsor gravitacional y Ancla de fase. Sus disparos, marcas, arcos, fragmentos, escudos, ondas y zonas de fase tienen señales visuales propias. Ocho sinergias nuevas conectan esos módulos con otros nuevos o con mejoras existentes: Constelación viva, Circuito cazador, Bastión vivo, Vórtice de fase, Lluvia prismática, Manto de rescate, Caza estelar y Enjambre iónico.

Las nuevas habilidades respetan el máximo de energía, la vida máxima, el límite de proyectiles y los límites de daño contra jefes. `tests/v19-modules.test.cjs` comprueba la selección, las combinaciones, impactos, bajas, dash, reparación y progresión de efectos; las suites anteriores siguen siendo válidas.

## Actualización v1.8 · Moneda estelar, naves y cosméticos

La moneda del juego aparece como **moneda estelar**. Core es la nave gratuita; Serenity y Firefly se desbloquean por 50 monedas estelares cada una. La compra se guarda y la selección de naves bloqueadas se impide antes de iniciar una misión. Los ids internos de las tres naves se conservan para mantener las armas, definitivas y partidas existentes.

La tienda conserva los cosméticos ya comprados y eleva el precio de los artículos un 20 % (redondeado hacia arriba a monedas enteras). Tiene 30 estelas, 16 opciones de aura y 16 de dash; en cada una de estas dos últimas categorías hay **15 diseños activos únicos** y una opción gratuita sin efecto. La nave seleccionada en el menú muestra el nombre y la vista animada de la estela, el aura y el dash equipados.

Difícil solo se desbloquea tras derrotar a YACERAMI en modo normal. Boss Rush requiere después derrotarlo en modo difícil. Las victorias se guardan por modo; el progreso anterior se reconoce al migrar los registros existentes. `tests/v18-economy-art.test.cjs` comprueba precios, diseños, compras, vista equipada, desbloqueos y persistencia.

## Actualización v1.7 · Menú principal y orden de la tienda

El menú principal presenta ahora la misión y una vista dinámica de la nave seleccionada junto a un panel claro para elegir operador, nave y dificultad. Las preferencias de puntería y audio se abren en “Ajustes adicionales”; tienda, bestiario y galería se encuentran en la portada. En móvil el menú usa toda la pantalla y permite desplazarse sin que el botón de inicio tape los campos.

La tienda muestra estelas, auras y dash en secciones distintas. Dentro de cada tipo, los cosméticos están ordenados del artículo gratuito al más caro. Los filtros conservan esa agrupación y orden. `tests/v17-menu-store.test.cjs` comprueba la distribución, la selección de nave, el orden de precios y el acceso móvil a tienda, bestiario e inicio de misión.

## Actualización v1.6 · Enemigos y tienda cosmética

GLITCH anuncia su eco más pronto y se teletransporta aproximadamente cada 1.9 segundos. La Mina Pulsar ahora señala ocho carriles durante su carga, marca en verde la abertura segura, emite un pulso de daño cercano y lanza proyectiles más grandes y rápidos; tiene sonido propio. Los jefes entran en patrulla desde su posición visible y Sailor Mars vuelve suavemente después de su embestida anunciada, evitando saltos repentinos.

La tienda ofrece 42 efectos: 30 estelas, 6 auras y 6 estilos de dash. Las 20 estelas originales recibieron color secundario y detalles propios; se añadieron 10 estelas y las categorías de aura y dash. Las tarjetas muestran vistas previas Canvas animadas del mismo efecto que aparece durante la partida. Se conservan las compras y la estela equipada de versiones anteriores. En móvil la tienda ocupa toda la pantalla y permite cerrar desde arriba.

Verificación: `tests/v16-features.test.cjs` cubre la frecuencia de GLITCH, el pulso y abertura de la mina, las transiciones de los cinco jefes, los filtros, las compras y la apariencia de los efectos nuevos.

## Actualización v1.5 · Combate, señales y audio

Las líneas punteadas del BOT, HUNTER y ORBITER terminan en el punto exacto de su desplazamiento; el movimiento usa el mismo destino, incluso si se ralentiza. GLITCH y SPAM reconocen los límites de la arena de 1200 × 750.

Nexo perfora con cada cuarta ráfaga y activa tres oleadas dirigidas. Los proyectiles gemelos de Quantum convergen y pueden enlazar un arco eléctrico; su definitiva lanza dos ondas de fase, ralentiza amenazas y da escudo. Becker causa una explosión pequeña con cada orbe pesado y su Nova solar se expande por la arena antes de limpiar enemigos y balas. El daño de todas las definitivas contra jefes sigue los límites de 25 % por activación y 20 % por segundo.

El dash muestra ecos de la nave en las posiciones reales del recorrido y destellos al salir y llegar. `js/audio-system.js` crea efectos propios para cada nave y siete arreglos musicales: cinco escenarios, combate de jefe y segunda fase de YACERAMI. El selector explica el ataque y la definitiva de cada skin. Las transiciones musicales se mezclan sin reiniciar la canción.

Las pruebas nuevas viven en `tests/v15-features.test.cjs`; los controles anteriores siguen en `tests/enemy-art.test.cjs`, `tests/gameplay.test.cjs`, `tests/player-art.test.cjs` y `tests/game-rules.test.cjs`.

## Retoque visual v1.4.2

Las advertencias de BOT, HUNTER y ORBITER ahora muestran un trazo corto y suave cerca del enemigo y una pequeña marca en el destino, en lugar de una línea punteada larga. El Sniper conserva una línea continua tenue para indicar su disparo. Las señales de los jefes y de la estrella fugaz también son continuas y más difusas, sin alterar sus tiempos ni zonas peligrosas.

## Actualización v1.4 · Arena, controles y rendimiento

La arena pasó de 960 × 540 a 1200 × 750 y se muestra más grande en computadora. En móvil, las cuatro flechas se reemplazaron por un joystick analógico con zona muerta y captura táctil; el segundo joystick permite apuntar y conserva la última dirección al soltarlo. La puntería manual ya no guía los proyectiles hacia los jefes. En el menú puedes activar números de daño; un golpe recibido muestra un aviso y un borde rojo temporal.

La tienda ofrece 20 estelas cosméticas con distintas formas, colores y precios. La Ultimate tiene un máximo de 25% de daño por activación contra jefes, sin romper el límite general de 20% en cualquier segundo. Si un dispositivo baja de rendimiento, se reducen partículas, proyectiles acumulados, nodos del fondo y estelas, mientras el reloj del nivel sigue funcionando.

Pruebas: `node --test tests/game-rules.test.cjs`. Con Playwright y Microsoft Edge disponibles, ejecuta `node tests/gameplay.test.cjs` para revisar partida, progresión, enemigos, apuntado manual, Ultimate, límites visuales y joystick móvil.

## Novedad: skins del jugador v1.3

El selector de `index.html` muestra los mismos diseños que aparecen en combate. Nexo ahora es un interceptor de alas angulares y riel de pulso; Quantum tiene dos emisores y alas espejadas; Becker lleva blindaje ancho y un reactor central. Los motores y las señales de disparo siguen el estilo de cada nave. Las tres conservan sus armas, atributos y área de colisión de 44 × 44.

La apariencia compartida del menú y la arena se dibuja en `js/player-art.js`. Ejecuta `tests/player-art.test.cjs` para comprobar los retratos, la selección, el tamaño de colisión y las estadísticas en Microsoft Edge.

## Diseños y comportamientos de enemigos v1.2

Abre `designs.html` para explorar los diez enemigos, cinco jefes y la estrella fugaz animados. Los botones permiten verlos a tamaño de combate, mostrar las grietas del TANK y activar la apariencia de la segunda fase de YACERAMI.

Abre `index.html` para jugar con los diseños nuevos. El bestiario muestra las mismas figuras que aparecen en la arena y explica sus comportamientos actuales.

La apariencia se dibuja en `js/enemy-art.js`, los diez comportamientos viven en `js/enemy-behavior.js` y el bestiario y la galería comparten `js/enemy-previews.js`. Las nuevas habilidades usan los mismos controles y rectángulos de colisión. Las líneas, ecos, anillos y marcas anuncian sus ataques.

Consulta `COMPORTAMIENTO.md` para la propuesta de cada enemigo, `VERSION.md` para los cambios y `tests/enemy-art.test.cjs` para las pruebas de integración en navegador.

Videojuego web arcade de supervivencia y evasión creado como proyecto final de maestría. El jugador controla un nodo defensor, esquiva amenazas digitales y recoge módulos de inteligencia artificial para proteger el nexo el mayor tiempo posible.

## Características

- Pantalla de inicio con nombre opcional; si se deja vacío se utiliza «Operador».
- Movimiento con teclado: flechas o `W`, `A`, `S`, `D`.
- Dash con `Shift` o barra espaciadora, indicador visible y cooldown de 6 segundos.
- Tres skins seleccionables: Nexo, Quantum y Becker.
- Ataque automático que busca la amenaza más cercana.
- Puntería manual opcional con mouse y segundo joystick táctil, sin eliminar el modo automático.
- Ataque definitivo con `Q`, con una reserva de 200 puntos y un límite de daño equivalente al 25% de la vida máxima de cualquier jefe por activación.
- Arma diferente por skin:
  - Nexo: pulsos rápidos y precisos.
  - Quantum: dos proyectiles violetas en abanico.
  - Becker: orbes dorados lentos y de alto daño.
- Dos joysticks táctiles analógicos en pantallas pequeñas: movimiento y apuntado manual, además de botones de dash y Ultimate.
- Amenazas desde arriba, izquierda y derecha, con siluetas propias de insecto, autómata, paquete, torreta, cazador, error digital, blindado, satélite, mina y espectro.
- Diez tipos de amenazas regulares: virus, bot, spam, sniper, hunter, glitch, tank, orbiter, mina pulsar y phantom.
- Estrella fugaz especial que atraviesa la arena dos veces. Una línea luminosa y un mensaje anticipan cada trayectoria.
- Sniper fija una posición y dispara allí después de mostrarla con un láser.
- Hunter persigue, marca la próxima posición y embiste.
- Glitch anuncia su destino con un eco antes de teletransportarse.
- Tank es más grande, lento y resistente; tiene blindaje frontal y anuncia una onda de impacto.
- Sistema de colisiones, tres vidas, puntuación y niveles.
- Dificultad progresiva: aparecen más amenazas y se mueven más rápido.
- Power-ups de IA:
  - Icono de escudo: protección durante 7 segundos.
  - Icono de reloj: análisis temporal que ralentiza amenazas durante 6 segundos.
  - Icono de corazón: repara una vida hasta el máximo disponible.
- Música electrónica procedural que acelera y añade percusión durante los jefes.
- Efectos de sonido para colisiones, dash, power-ups, disparos y jefes.
- Barra de progreso para cada nivel de 20 segundos.
- Cuatro guardianes estelares: Sailor Moon, Sailor Mars, Sailor Venus y Sailor Mercury.
- Elección de una de tres mejoras después de derrotar a cada guardián.
- Jefe final YACERAMI en el nivel 15 con 30% más vida que su versión anterior. Al llegar a 50% activa una segunda fase con nueva música, color, velocidad y patrones adicionales.
- Protección de jefes por ventana móvil: ningún jefe puede perder más de 20% de su vida máxima por todo el daño combinado durante cualquier periodo de un segundo.
- Sinergia Nova Estelar al combinar Overclock y Pulso ofensivo; ahora requiere diez ciclos de disparo, 100% más tiempo que antes.
- Más sinergias:
  - Propulsores + Dash cuántico: onda de choque al hacer dash.
  - Núcleo reforzado + Escudo Becker: Égida que absorbe un golpe cada 20 segundos.
  - Overclock + Escudo Becker: Reactor Quantum que carga más rápido el ultimate.
- Bestiario con retratos animados, nombres y comportamientos únicos de todas las amenazas y jefes.
- Sección de módulos dentro del Bestiario con las seis mejoras y las cuatro sinergias.
- Cinco escenarios con colores y obstáculos nuevos cada tres niveles.
- Obstáculos destructibles con vida propia y señales visuales de daño.
- Aviso «BOSS EN CAMINO» antes de cada jefe y animación de entrada sin eliminar a los enemigos que ya estaban en la arena.
- Silueta y efectos exclusivos para cada Sailor; YACERAMI tiene una apariencia abisal, múltiples ojos, cuernos y movimiento de respiración.
- Barras de vida pequeñas para enemigos, visibles solamente después de recibir daño, además de barras para obstáculos y cofres.
- Cofre móvil más pequeño y veloz que aparece cada 28 segundos, puede romperse a disparos y libera un power-up.
- Pantalla de victoria al restaurar el Nexo.
- Controles independientes para volumen de música y efectos.
- Tabla local con los cinco mejores récords y nombres de operador.
- Contador permanente de victorias contra YACERAMI guardado en el navegador.
- Modo difícil desbloqueable después de la primera victoria: dos vidas, enemigos 22% más rápidos, 30% más resistentes, oleadas 25% más frecuentes y jefes 25% más resistentes.
- Boss Rush desbloqueable al superar el modo difícil: enfrenta a los cinco jefes consecutivamente y elige una mejora entre combates.
- Estadísticas al terminar: enemigos destruidos, cofres abiertos, daño recibido y Ultimate utilizadas.
- Ajustes persistentes de skin, música y volumen de efectos.
- La selección de puntería y la estela equipada también se conservan.
- Economía cosmética: al terminar una misión se obtiene un fragmento por cada 500 puntos, con un mínimo de uno.
- Tienda cosmética accesible desde el menú y entre combates, sin mejoras de poder.
- Veinte estelas cosméticas desbloqueables, con puntos, anillos, diamantes, cuadros, chispas y estrellas.
- Números de daño opcionales y aviso visual claro al perder una vida.
- Límite adaptativo de partículas, proyectiles y estelas para dispositivos lentos.
- Cuatro logros persistentes, incluido derrotar a YACERAMI sin recibir daño.
- Pausa con la tecla `P` y pausa automática al cambiar de pestaña.
- Pantalla de Game Over con el mensaje de derrota de YACERAMI y botón de reinicio.
- Récord guardado en el navegador con `localStorage`.
- Diseño futurista y responsivo.

## Estructura del proyecto

```text
nexus-defender/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── game.js
│   └── game-rules.js
├── tests/
│   ├── game-rules.test.cjs
│   └── gameplay.test.cjs
└── README.md
```

## Cómo ejecutar el juego

No requiere instalaciones ni dependencias.

El juego incluye un respaldo temporal para que también pueda iniciar al abrir `index.html` directamente, incluso si el navegador limita el almacenamiento de archivos locales.

### Opción sencilla

1. Descarga o copia la carpeta completa.
2. Abre `index.html` con un navegador moderno.
3. Escribe tu nombre y selecciona **INICIAR MISIÓN**.

### Opción recomendada durante el desarrollo

Usa un servidor local, por ejemplo la extensión **Live Server** de Visual Studio Code:

1. Abre la carpeta del proyecto en Visual Studio Code.
2. Instala la extensión Live Server si todavía no la tienes.
3. Haz clic derecho en `index.html`.
4. Selecciona **Open with Live Server**.

## Cómo jugar

- Muévete con las flechas o con `W`, `A`, `S`, `D`.
- En puntería manual, dirige el arma con el mouse sobre el canvas o con el segundo joystick táctil.
- Usa `Shift` o espacio para hacer dash; tarda 6 segundos en recargarse.
- Pulsa `Q` cuando la barra Ultimate llegue al 100%.
- Lee las señales de los enemigos: el láser del **Sniper**, la marca del **Hunter**, el eco del **Glitch** y el anillo de impacto del **Tank**.
- Recoge los círculos de IA para activar ventajas.
- Cada amenaza esquivada suma puntos.
- Cada 20 segundos aumenta el nivel y la dificultad.
- El progreso se detiene durante los jefes: debes derrotarlos para continuar.
- Los guardianes aparecen en los niveles 3, 6, 9 y 12. YACERAMI aparece en el nivel 15.
- Después de cada guardián puedes mejorar daño, velocidad de disparo, movimiento, vidas, dash o escudo.
- El ultimate cambia con la skin: lluvia de pulsos, tormenta Quantum o Nova solar.
- Una sola Ultimate nunca puede quitar más de 25% de vida máxima a un jefe.
- Todo el daño combinado contra un jefe está limitado a 20% de su vida máxima por segundo.
- Al reducir a YACERAMI a la mitad de su vida comienza su segunda fase.
- La partida termina al perder todas las vidas disponibles; el modo difícil comienza con dos.
- Al terminar, los puntos se convierten en fragmentos para comprar estelas; las compras son exclusivamente visuales.

## Explicación técnica breve

El proyecto usa tecnologías web básicas:

- **HTML** contiene las pantallas, el marcador y el elemento `canvas`.
- **CSS** crea el diseño futurista y lo adapta a computadora o celular.
- **JavaScript** mantiene el estado del juego, lee los controles, mueve los objetos, detecta colisiones y dibuja cada cuadro.

El ciclo principal usa `requestAnimationFrame`. En cada cuadro se ejecutan dos pasos:

1. `update(deltaTime)`: actualiza posiciones, tiempo, puntuación y colisiones.
2. `draw(time)`: dibuja el fondo, el jugador, las amenazas, los power-ups y las partículas.

La variable `deltaTime` permite que la velocidad sea estable en equipos con diferentes tasas de refresco.

## Posibles mejoras para una segunda versión

- Añadir compatibilidad con control físico.
- Incorporar experiencia visible y mejoras menores durante cada oleada.
- Crear rutas alternativas, eventos secretos y jefes opcionales.
- Añadir modificadores de partida desbloqueables para personalizar el reto.
- Incorporar una sala de entrenamiento para practicar patrones de jefes.
- Agregar opciones de accesibilidad para velocidad, contraste, reducción de destellos y tamaño de interfaz.
- Ampliar las pruebas automatizadas a una partida completa y diferentes dispositivos.
- Publicar en GitHub Pages o en el servidor FTP institucional.

## Aprendizajes de otros juegos del género

- **Oleadas legibles:** tiempos cortos y una barra de progreso dan un objetivo inmediato.
- **Patrones con anticipación:** los proyectiles deben ser visibles y dejar rutas posibles de escape.
- **Hitos de dificultad:** los jefes dividen la partida en etapas memorables.
- **Decisiones entre niveles:** las tres mejoras disponibles permiten crear una estrategia diferente en cada partida.
- **Variedad de estilos:** las skins pueden evolucionar hasta personajes con estadísticas o habilidades distintas.
- **Recompensa constante:** efectos de sonido, partículas, récords y bonificaciones hacen visible el progreso.
- **Brotato:** oleadas breves, puntería automática o manual y ajustes de accesibilidad para vida, daño y velocidad enemiga.
- **Enter the Gungeon:** armas con comportamientos muy distintos, secretos, botín y escenarios que elevan el riesgo gradualmente.
- **Hades:** progresión persistente, narrativa que reacciona a los intentos y dificultad opcional para jugadores avanzados.
- **Risk of Rain 2:** el jugador y los enemigos escalan juntos, haciendo que cada combinación de objetos cambie el ritmo de la partida.
- **Dead Cells:** rutas no lineales y niveles de dificultad permanentes que se desbloquean al vencer jefes.

Fuentes consultadas: [Brotato](https://store.steampowered.com/app/1942280/Brotato/), [Enter the Gungeon](https://store.steampowered.com/app/311690/Enter_the_Gungeon/), [Hades](https://store.steampowered.com/app/1145360/Hades/), [Risk of Rain 2](https://store.steampowered.com/app/632360/Risk_of_Rain_2/) y [Dead Cells](https://deadcells.com/).

## Lista previa a la entrega

- [ ] Probar movimiento y colisiones en computadora.
- [ ] Probar controles táctiles en celular.
- [ ] Confirmar que el récord se conserva al recargar la página.
- [ ] Publicar el juego y verificar el enlace desde otro dispositivo.
- [ ] Preparar documentación académica: objetivo, justificación, metodología, arquitectura, resultados y conclusiones.
- [ ] Tomar capturas de la pantalla de inicio y de una partida.
- [ ] Compartir el enlace funcional y la documentación por Classroom o correo institucional.

## Autoría

Proyecto académico desarrollado con HTML5, CSS3 y JavaScript puro.
