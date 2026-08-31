# Nexus Defender

Videojuego web arcade de supervivencia y evasión creado como proyecto final de maestría. El jugador controla un nodo defensor, esquiva amenazas digitales y recoge módulos de inteligencia artificial para proteger el nexo el mayor tiempo posible.

## Características

- Pantalla de inicio con nombre opcional; si se deja vacío se utiliza «Operador».
- Movimiento con teclado: flechas o `W`, `A`, `S`, `D`.
- Dash con `Shift` o barra espaciadora, indicador visible y cooldown de 6 segundos.
- Tres skins seleccionables: Nexo, Quantum y Becker.
- Ataque automático que busca la amenaza más cercana.
- Puntería manual opcional con mouse y segundo joystick táctil, sin eliminar el modo automático.
- Ataque definitivo con `Q`, con una reserva de 200 puntos y un límite de daño equivalente al 20% de la vida máxima de cualquier jefe por activación.
- Arma diferente por skin:
  - Nexo: pulsos rápidos y precisos.
  - Quantum: dos proyectiles violetas en abanico.
  - Becker: orbes dorados lentos y de alto daño.
- Controles táctiles en pantallas pequeñas.
- Amenazas desde arriba, izquierda y derecha.
- Diez tipos de amenazas regulares: virus, bot, spam, sniper, hunter, glitch, tank, orbiter, mina pulsar y phantom.
- Estrella fugaz especial que atraviesa la arena a gran velocidad. Una línea luminosa y un mensaje anticipan exactamente su trayectoria.
- El enemigo Sniper apunta y dispara proyectiles al jugador.
- Hunter corrige su trayectoria para perseguir al jugador.
- Glitch se desplaza con movimientos laterales erráticos.
- Tank es más grande, lento y resistente.
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
- Bestiario con iconos, nombres y comportamientos de las amenazas.
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
- Cinco opciones de estela: ninguna, Neón, Quantum, Solar y Vacío YACERAMI.
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
│   └── game.js
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
- Evita las amenazas básicas y especiales: **Sniper** dispara, **Hunter** persigue, **Glitch** zigzaguea y **Tank** resiste varios impactos.
- Recoge los círculos de IA para activar ventajas.
- Cada amenaza esquivada suma puntos.
- Cada 20 segundos aumenta el nivel y la dificultad.
- El progreso se detiene durante los jefes: debes derrotarlos para continuar.
- Los guardianes aparecen en los niveles 3, 6, 9 y 12. YACERAMI aparece en el nivel 15.
- Después de cada guardián puedes mejorar daño, velocidad de disparo, movimiento, vidas, dash o escudo.
- El ultimate cambia con la skin: lluvia de pulsos, tormenta Quantum o Nova solar.
- Una sola Ultimate nunca puede quitar más de 20% de vida máxima a un jefe.
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

- Añadir puntería manual opcional y compatibilidad con control.
- Incorporar experiencia visible y mejoras menores durante cada oleada.
- Crear rutas alternativas, eventos secretos y jefes opcionales.
- Añadir modificadores de partida desbloqueables para personalizar el reto.
- Incorporar una sala de entrenamiento para practicar patrones de jefes.
- Agregar opciones de accesibilidad para velocidad, daño, contraste y reducción de destellos.
- Añadir pruebas automatizadas para funciones de colisión y puntuación.
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
