# Nexus Defender · Propuesta de comportamiento v1.2

La identidad de cada enemigo combina **una regla de movimiento, una señal y una respuesta posible**. Los tiempos son aproximados y pueden ajustarse en pruebas de juego. La versión v1.5 conserva sus identidades y hace exactas las marcas de desplazamiento del BOT, HUNTER y ORBITER.

| Amenaza | Función en la oleada | Comportamiento nuevo | Señal para anticiparla | Respuesta del jugador |
|---|---|---|---|---|
| **VIRUS** | Crear presión de enjambre | Sigue una trayectoria recta. Si el ejemplar principal muere por un disparo, libera dos esporas pequeñas, rápidas y de un punto de vida. Las esporas no vuelven a dividirse. | Dos nodos laterales indican qué ejemplares pueden dividirse. | Reservar espacio para las esporas al disparar a un Virus grande. |
| **BOT** | Cortar rutas previsibles | Calcula la dirección reciente del jugador, fija un punto final y da un paso rápido solo en horizontal o vertical. Tiene tres puntos de vida base. | Una línea violeta punteada y una silueta marcan exactamente dónde terminará el paso durante 0,36 segundos. | Cruzar el carril antes o después del paso; evitar moverse continuamente en un mismo eje. |
| **SPAM** | Añadir velocidad y rebotes | Es más pequeño y veloz, baja por la arena y rebota en los bordes laterales. Su velocidad máxima se limita en niveles altos para conservar tiempo de reacción. | Su tamaño, forma y trayectoria hacen visibles los cambios de dirección. | Vigilar el borde al que se acerca; no confiar en que salga de la pantalla al llegar al lateral. |
| **SNIPER** | Castigar la inmovilidad | Se frena en la arena, fija una posición del jugador y dispara hacia el punto marcado. No cambia la dirección una vez bloqueada. | Lente cargada y línea roja hacia el punto durante los últimos 0,62 segundos. | Desplazarse lateralmente después de que el punto quede fijado. |
| **HUNTER** | Perseguir y embestir | Corrige su ruta hacia una posición futura del jugador; a corta distancia fija el final real de su embestida. | Línea punteada rosa y silueta final durante 0,44 segundos. | Cambiar de rumbo al ver la marca. |
| **GLITCH** | Romper la lectura espacial | Se teletransporta hacia un eco visible, situado lejos del jugador, aproximadamente cada 2,7 segundos. | Silueta magenta transparente en el destino durante 0,48 segundos. | Salir del eco antes de que llegue el cuerpo sólido. |
| **TANK** | Forzar rodeos | Avanza lentamente con siete puntos de vida base; los disparos que llegan a su mitad frontal hacen 30 % menos daño. Cuando está cerca anuncia un impacto circular. | Grietas del blindaje y anillo carmesí de 94 unidades durante 0,78 segundos. | Atacar desde un lateral o desde atrás; salir del anillo antes del impacto. |
| **ORBITER** | Controlar el espacio cercano | Vuela tangencialmente a unos 125 unidades del jugador, fija el final real y se impulsa hacia él como una honda. | Línea punteada cian y silueta final durante 0,38 segundos. | Alejarse del punto marcado; evitar perseguirlo alrededor de su órbita. |
| **MINA PULSAR** | Crear un patrón con ruta segura | Se ancla y dispara en siete de sus ocho direcciones. El hueco rota tres posiciones en cada descarga. Nunca hay más de tres minas activas en una misma oleada. | El emisor gris muestra la salida libre; el anillo indica la carga. | Buscar el emisor apagado y moverse hacia ese corredor. |
| **PHANTOM** | Alternar peligro y oportunidad | Es sólido durante 1,35 segundos y etéreo durante 0,75. En forma etérea, el jugador y los disparos atraviesan su cuerpo; el ataque automático busca otros blancos. | Cuerpo transparente y aro magenta; el aro se vuelve claro antes de materializarse. | Cruzarlo durante la fase etérea y atacarlo cuando recupere su forma sólida. |

Los jefes mantienen su identidad visual y su patrón principal. Sus reglas nuevas cambian cómo se posicionan y qué decisiones exigen al jugador.

| Jefe | Comportamiento nuevo | Señal | Respuesta del jugador |
|---|---|---|---|
| **Sailor Moon** | Alterna un campo gravitatorio que atrae al jugador cercano mientras sigue lanzando un abanico de cinco proyectiles. | Anillo dorado de 175 unidades durante la fase activa. | Salir del círculo o avanzar contra la atracción antes del abanico. |
| **Sailor Mars** | Marca una nueva posición horizontal, se desplaza rápidamente hacia ella y vuelve a lanzar ráfagas de tres proyectiles. | Destino y trazo continuo tenue durante 0,58 segundos. | No esperar a que permanezca en el mismo carril; preparar un paso lateral para su ráfaga. |
| **Sailor Venus** | Recorre una órbita elíptica y libera espirales radiales desde una posición que cambia también en altura. | Su órbita y aspas giratorias indican el desplazamiento. | Leer la nueva posición del centro de la espiral, no solo esquivar en horizontal. |
| **Sailor Mercury** | Alterna una barrera de 0,72 segundos con una cruz de ocho proyectiles rotatoria. | Aro cian punteado antes de la barrera y brillante durante la protección. | Aprovechar la pausa para recolocarse; atacar cuando el aro desaparezca. |
| **YACERAMI** | Conserva los cuatro patrones y la transformación al 50 % de vida. En fase dos, cada tercer ataque marca una zona que estalla 1,05 segundos después. | Círculos rojos concéntricos en el suelo. | Salir del círculo y buscar un hueco en la corona de proyectiles. |

**Estrella fugaz:** conserva su primer aviso de 1,6 segundos y regresa por una segunda ruta indicada durante 1,2 segundos. Los avisos muestran la trayectoria completa de cada paso.

La dificultad difícil conserva sus multiplicadores generales de velocidad y vida. El diseño busca decisiones distintas y avisos comprensibles, incluso cuando aparecen varios enemigos en una misma oleada.
