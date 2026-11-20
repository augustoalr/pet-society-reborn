# Registro de Aprendizaje del Proyecto (Modo Profesor)

Este documento registra los aprendizajes técnicos, lecciones de arquitectura y buenas prácticas aprendidas en cada tarea del proyecto Pet Society.

---

## Estructura de cada lección
- **Tarea:** Identificador (ej. T-01) y nombre.
- **Concepto clave:** Qué principio de ingeniería o arquitectura se aplicó.
- **Por qué se hizo así:** Motivo y beneficio a largo plazo.
- **Qué aprendí:** Explicación simple para afianzar conocimientos como desarrollador.

---

### T-01: Configuración del Proyecto y Entorno de Verificación
- **Concepto clave:** Verificación multi-entorno y configuración de test runners (pool threads en Vitest).
- **Por qué se hizo así:** Un check de CI en la nube (Linux) puede enmascarar incompatibilidades de ejecución local en Windows (Node 22 con forks de procesos). Configurar explícitamente `pool: 'threads'` garantiza paridad y reproducibilidad en cualquier máquina.
- **Qué aprendí:** El comando `npm run verify` unifica linter, compilador de tipos, tests y build en un solo paso inmutable; si falla localmente, no debe llegar a producción aunque el CI remoto pase.

---

### T-02: [DELICADA] Capa de Persistencia Agnóstica y Modelos de Dominio
- **Concepto clave:** Inversión de Dependencias (DIP), inmutabilidad estricta y validación estructural en tiempo de ejecución.
- **Por qué se hizo así:** Separar el contrato de guardado (`IStorageService`) del motor físico (`LocalStorageAdapter`) permite migrar en el futuro a bases de datos en la nube (Supabase) sin tocar el dominio ni la UI. Además, validar la integridad del JSON almacenado antes de cargarlo evita pantallas en blanco por datos corruptos.
- **Qué aprendí:** Al diseñar persistencia cliente, inyectar el almacén (`Storage`) en el adaptador permite probar fallos de cuota (`QuotaExceededError`) y corrupción de datos en tests unitarios rápidos sin depender del navegador.

---

### T-03: Motor Gráfico 2D Base y Lienzo Responsive
- **Concepto clave:** Desacoplamiento de renderizado WebGL/Canvas de React y lógica de escalado con resolución virtual fija.
- **Por qué se hizo así:** Separar las matemáticas de relación de aspecto (`calculateViewportScale`) en funciones puras permite testear el soporte para móviles, tablets y monitores ultra-panorámicos en Node sin necesidad de renderizar WebGL.
- **Qué aprendí:** En motores 2D, definir un lienzo virtual inmutable (800x600) y escalar mediante letterbox/pillarbox preserva la proporción del juego sin distorsionar gráficos ni requerir recalcular posiciones relativas en cada sprite.

---

### T-04: Sistema de Renderizado de Mascota por Capas
- **Concepto clave:** Renderizado procedimental modular por capas (Layer Pattern) y reactividad gráfica desacoplada.
- **Por qué se hizo así:** Separar la mascota en capas independientes (orejas, cuerpo, cabeza, ojos, boca, ropa) y recolorear/redibujar cada capa de forma atómica evita regenerar todo el árbol de nodos de PixiJS, asegurando 60 FPS estables al cambiar de ropa o color.
- **Qué aprendí:** Dibujar elementos visuales vectorialmente con `Graphics` de PixiJS permite una resolución infinita y nítida en pantallas Retina/móviles sin la sobrecarga de descargar decenas de imágenes PNG en el MVP.

---

### T-04B: README Comercial y Documentación del Proyecto
- **Concepto clave:** Comunicación de producto (Product-Led Documentation) y separación de capas de lectura.
- **Por qué se hizo así:** El repositorio necesita una puerta de entrada comercial que seduzca al jugador y al desarrollador sin obligarlo a bucear en los diagramas técnicos de `docs/`.
- **Qué aprendí:** Un buen README balancea la propuesta de valor del juego con las garantías de ingeniería (badges de CI, Clean Architecture y guía de comandos unificada `verify`), generando confianza inmediata.

---

### T-README-FIX: Adecuación Comercial, Derechos de Autor y Enfoque de Exhibición
- **Concepto clave:** Protección de propiedad intelectual y posicionamiento de portafolio profesional en repositorios públicos.
- **Por qué se hizo así:** Un proyecto de autoría propia para exhibición profesional y reclutamiento en LinkedIn debe declarar claramente sus derechos de autor sin licencias permisivas que autoricen la explotación por terceros, sustituyendo guías de instalación por anuncios de demo web.
- **Qué aprendí:** En proyectos de exhibición, el README es el escaparate del arquitecto y creador: debe invitar a probar la demo web y a contactar por LinkedIn, no a clonar el código fuente.

---

### T-05: Lógica de Necesidades y Cuidados (Hambre, Higiene, Felicidad)
- **Concepto clave:** Simulación temporal offline/online mediante funciones deterministas y desacoplamiento de ciclo de vida.
- **Por qué se hizo así:** Almacenar `lastSavedTimestamp` permite calcular el decaimiento de necesidades acumulado en el momento exacto en que el usuario recarga la app (`elapsedSeconds`), sin requerir procesos en segundo plano costosos o servidores activos.
- **Qué aprendí:** Las acciones sobre necesidades (`feedPet`, `cleanPet`, `petAnimal`) deben tratarse como transacciones atómicas inmutables con validación de rango cerrado `[0, 100]`, asegurando que la interfaz de usuario nunca reciba estados inconsistentes.

---

### T-06: [DELICADA] Sistema de Economía y Billetera Dual (Coins y Cash)
- **Concepto clave:** Atomicidad multidivisa, prevención de Split-Brain en persistencia y validación contra exploits de costos negativos.
- **Por qué se hizo así:** Si las operaciones de billetera se gestionaran en un hook de React separado sin coordinar con el repositorio central, un guardado en memoria de necesidades sobrescribiría los saldos de la billetera (Split-Brain). Además, en sistemas financieros de videojuegos, cualquier función de débito debe rechazar montos negativos para evitar que un atacante genere dinero de la nada al "comprar" un ítem con precio negativo.
- **Qué aprendí:** Centralizar las mutaciones atómicas en el hook orquestador del estado y tratar las compras como transacciones que verifican saldo, deducen fondos y persisten en un único ciclo de escritura garantiza coherencia absoluta sin condiciones de carrera.

---

### T-07: Habitación y Sistema de Muebles / Decoración
- **Concepto clave:** Renderizado por capas con ordenamiento de profundidad (Y-sorting) y manipulación espacial acotada (Spatial Clamping).
- **Por qué se hizo así:** En juegos con perspectiva isométrica o 2.5D, los objetos más cercanos al borde inferior de la pantalla deben dibujarse por delante de los más lejanos para crear una ilusión de volumen tridimensional correcta. Además, acotar las coordenadas en funciones matemáticas puras independientes de PixiJS previene que los muebles se salgan del lienzo ante eventos táctiles erráticos.
- **Qué aprendí:** Separar la geometría matemática de la sala (`roomLogic.ts`) del renderizado en PixiJS (`RoomView` / `FurnitureView`) permite comprobar las restricciones físicas de decoración con pruebas unitarias instantáneas sin montar un lienzo WebGL real.

---

### T-08: Tienda de Ítems (Comida, Ropa, Muebles)
- **Concepto clave:** Composición de transacciones financieras y acumulación inmutable de inventario.
- **Por qué se hizo así:** Separar el catálogo comercial de las reglas de adquisición permite agregar o modificar precios y productos sin tocar el motor de compras (`shopLogic.ts`). Al procesar una compra, coordinar la deducción de saldo y la inserción/acumulación en el inventario dentro de una sola mutación atómica en `usePetCare` previene la pérdida de ítems o monedas en caso de cierre intempestivo de la aplicación.
- **Qué aprendí:** En la arquitectura de videojuegos, los tests de integración cruzada (como `shopIntegration.test.ts`) son esenciales para verificar que un ítem comprado en la tienda impacta de inmediato en los otros subsistemas (alimentar a la mascota o colocar el mueble recién adquirido en la habitación) sin estados intermedios inconsistentes.
