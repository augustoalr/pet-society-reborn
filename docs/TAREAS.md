# Plan de Tareas del MVP: Pet Society

Este documento contiene el desglose de tareas atómicas para el MVP.
Cada tarea tiene un tamaño máximo estimado de 1 a 2 días y criterios claros de aceptación.

Leyenda de etiquetas:
- `[DELICADA]`: Toca persistencia, base de datos, seguridad, contratos de datos o economía.

---

### Sprint 1: Cimientos y Arquitectura Base

#### T-01: Configuración del Proyecto y Entorno de Verificación [COMPLETADA]
- **Dependencias:** Ninguna
- **Merge:** Commit `5c120b8` en `main` (PR #2).
- **Objetivo:** Inicializar el proyecto con Vite, React, TypeScript, PixiJS y configurar el script `npm run verify` que corre linter, chequeo de tipos TypeScript y tests.
- **Criterios de Aceptación:**
  1. Repositorio compila limpiamente con `npm run build` [CUMPLIDO].
  2. `npm run verify` ejecuta verificación de tipos (`tsc --noEmit`), linter y suite de tests básica sin errores [CUMPLIDO].
  3. Estructura de carpetas según `docs/ARQUITECTURA.md` creada [CUMPLIDO].

#### T-02: [DELICADA] Capa de Persistencia Agnóstica y Modelos de Dominio [COMPLETADA]
- **Dependencias:** T-01
- **Merge:** Commit `c34665b` en `main` (PR #4).
- **Objetivo:** Definir las interfaces de dominio (`Pet`, `Wallet`, `InventoryItem`, `Room`) y la interfaz `IStorageService` con su implementación inicial `LocalStorageAdapter`.
- **Criterios de Aceptación:**
  1. Modelos de dominio tipados estrictamente en TypeScript con inmutabilidad [CUMPLIDO].
  2. Implementación de `LocalStorageAdapter` con pruebas unitarias que verifiquen guardar, leer y resetear el estado del juego [CUMPLIDO].
  3. Mecanismo de fallback: si no hay datos guardados, inicializa un estado por defecto válido [CUMPLIDO].

---

### Sprint 2: Mecánicas Núcleo de Mascota y Render 2D

#### T-03: Motor Gráfico 2D Base y Lienzo Responsive [COMPLETADA]
- **Dependencias:** T-01
- **Merge:** Commit `270fa21` en `main` (PR #6).
- **Objetivo:** Montar el viewport de PixiJS integrado en React con resolución virtual fija adaptable a pantallas móviles y de escritorio (escalado con preservación de relación de aspecto).
- **Criterios de Aceptación:**
  1. El lienzo de juego mantiene su proporción visual sin deformarse en redimensionamiento de ventana y dispositivos móviles táctiles [CUMPLIDO].
  2. Soporte para eventos de puntero (clic y toque táctil unificados) [CUMPLIDO].

#### T-04: Sistema de Renderizado de Mascota por Capas [COMPLETADA]
- **Dependencias:** T-02, T-03
- **Merge:** Commit `f01b554` en `main` (PR #8).
- **Objetivo:** Crear el renderizador de la mascota modular (cuerpo base, color, ojos, orejas, boca y capas de ropa).
- **Criterios de Aceptación:**
  1. La mascota se visualiza correctamente según su configuración en el estado [CUMPLIDO].
  2. Capacidad de alternar colores y equipar/desequipar ropa visualmente en tiempo real [CUMPLIDO].

#### T-04B: README Comercial y Documento de Presentación del Proyecto [COMPLETADA]
- **Dependencias:** T-01
- **Merge:** Commit `095f9c7` en `main` (PR #11).
- **Objetivo:** Crear el archivo `README.md` en la raíz del repositorio con enfoque comercial, atractivo y técnico para presentar Pet Society (Reborn), sus características destacadas, arquitectura, stack tecnológico y guía de inicio rápido.
- **Criterios de Aceptación:**
  1. `README.md` creado con propuesta de valor, capturas/diagrama conceptual, tabla de características (personalización, cuidados, minijuegos, economía) [CUMPLIDO].
  2. Documentación de comandos de desarrollo y verificación (`npm run dev`, `npm run verify`, `npm run build`) [CUMPLIDO].
  3. Enlaces a la documentación interna (`docs/ARQUITECTURA.md`, `docs/TAREAS.md`, `docs/REGLAS.md`) [CUMPLIDO].
  4. Pasa `npm run verify` limpiamente [CUMPLIDO].

#### T-README-FIX: Adecuación Comercial, Derechos de Autor y Enfoque de Exhibición de README.md [COMPLETADA]
- **Dependencias:** T-04B
- **Merge:** Commit `b7e4d5c` en `main` (PR #14).
- **Objetivo:** Ajustar el `README.md` según la directriz comercial de Augusto (dueño del producto): eliminar licencia MIT e insignia de MIT, establecer copyright reservado a nombre de Augusto, retirar guía de clonado/instalación (git clone/npm install) reemplazándola por estado del proyecto y anuncio de demo web, y destacar a Augusto como creador y arquitecto del producto.
- **Criterios de Aceptación:**
  1. Insignia y mención de licencia MIT eliminadas completamente [CUMPLIDO].
  2. Declaración explícita: "Propiedad Intelectual © 2026 Augusto. Todos los derechos reservados. Proyecto de portafolio y exhibición comercial; prohibida su copia o redistribución no autorizada." [CUMPLIDO].
  3. Sección de clonado e instalación eliminada y reemplazada por "Estado del Proyecto y Demo Web" (versión jugable disponible próximamente en web) [CUMPLIDO].
  4. Augusto destacado explícitamente como creador, director y arquitecto de sistemas del producto [CUMPLIDO].
  5. `npm run verify` pasa sin errores [CUMPLIDO].

#### T-05: Lógica de Necesidades y Cuidados (Hambre, Higiene, Felicidad) [COMPLETADA]
- **Dependencias:** T-02, T-04
- **Merge:** Commit `9d969cb` en `main` (PR #17).
- **Objetivo:** Implementar el bucle de tiempo para decrecimiento de necesidades y las acciones de cuidado: alimentar con comida, bañar con esponja/jabón y acariciar.
- **Criterios de Aceptación:**
  1. Las barras de necesidades se actualizan según las fórmulas del dominio [CUMPLIDO].
  2. Interactuar con jabón limpia a la mascota; darle comida sacia el hambre y resta el ítem del inventario [CUMPLIDO].
  3. Los cambios persisten a través de `IStorageService` [CUMPLIDO].

---

### Sprint 3: Habitación, Decoración y Economía

#### T-06: [DELICADA] Sistema de Economía y Billetera Dual (Coins y Cash) [COMPLETADA]
- **Dependencias:** T-02
- **Merge:** Commit `4f80a6b` en `main` (PR #20).
- **Objetivo:** Implementar el servicio de billetera que maneja monedas estándar (`coins`) y moneda premium (`cash`), asegurando validación estricta de saldo sin valores negativos.
- **Criterios de Aceptación:**
  1. Métodos para acreditar, debitar y consultar balance con pruebas unitarias exhaustivas [CUMPLIDO].
  2. Prevención de transacciones inválidas o saldo negativo y rechazo de costos negativos [CUMPLIDO].
  3. Integración atómica y no invasiva en `usePetCare` previniendo split-brain en guardado y sincronización [CUMPLIDO].
  4. Soporte para compras compuestas multidivisa con historial de transacciones tipado [CUMPLIDO].

#### T-07: Habitación y Sistema de Muebles / Decoración [COMPLETADA]
- **Dependencias:** T-03, T-04
- **Merge:** Commit `7579016` en `main` (PR #22).
- **Objetivo:** Renderizar la habitación de la mascota con soporte para colocar, mover y guardar la posición de los muebles en el espacio.
- **Criterios de Aceptación:**
  1. Posicionamiento de muebles en coordenadas acotadas de la sala y suelo con funciones puras `roomLogic.ts` [CUMPLIDO].
  2. Guardado y restauración de la disposición de la habitación desde el almacenamiento sincronizado en `usePetCare` [CUMPLIDO].
  3. Renderizado procedural de la habitación en PixiJS (pared, papel tapiz, ventana panorámica, rodapié y parquet) en 800x600 [CUMPLIDO].
  4. Manipulación interactiva (Drag & Drop y selección) con ordenamiento dinámico de profundidad Z-sorting según coordenada Y [CUMPLIDO].
  5. Modo Decorar con baúl de muebles y retorno al inventario [CUMPLIDO].

#### T-08: Tienda de Ítems (Comida, Ropa, Muebles)
- **Dependencias:** T-05, T-06, T-07
- **Objetivo:** Crear la interfaz de tienda donde el usuario puede navegar categorías, ver precios en Coins/Cash y comprar ítems que se agregan a su inventario.
- **Criterios de Aceptación:**
  1. La tienda lista los ítems disponibles con su precio y descripción en catálogo puro `src/domain/shop/` [CUMPLIDO].
  2. Al comprar, se valida saldo, se descuentan monedas/cash y se agrega o acumula el ítem en el inventario del usuario [CUMPLIDO].
  3. Lógica pura e inmutable en `shopLogic.ts` con prevención de fondos insuficientes, cantidades inválidas y desbordamiento numérico [CUMPLIDO].
  4. Componente React accesible `ShopModal.tsx` con filtrado por pestañas ("Comida", "Ropa", "Muebles"), botones con validación de fondos y feedback interactivo [CUMPLIDO].
  5. Integración atómica en `usePetCare` con guardado persistente en `GameStateRepository` [CUMPLIDO].

---

### Sprint 4: Minijuego y Pulido del MVP

#### T-09: Minijuego de Habilidad Clásico (Pelota en el Jardín / Malabares) [COMPLETADA]
- **Dependencias:** T-03, T-06
- **Objetivo:** Implementar el primer minijuego interactivo donde el jugador hace rebotar una pelota con toques/clics para ganar monedas y felicidad para su mascota.
- **Criterios de Aceptación:**
  1. Mecánica de juego fluida tanto con ratón como con pantalla táctil con física de rebotes elásticos y modulación horizontal según punto de impacto [CUMPLIDO].
  2. Contador de toques y combo en tiempo real que recompensa con monedas e incrementa la felicidad de la mascota al finalizar la partida [CUMPLIDO].
  3. Lógica pura e inmutable de cinemática, gravedad y colisiones en `ballGameLogic.ts` con cobertura de pruebas unitarias exhaustiva [CUMPLIDO].
  4. Escenario procedimental 100% vectorial en PixiJS (`BallGameView.ts`) con jardín, cielo, nubes, colinas, valla, césped, pelota con textura deportiva, sombra reactiva, efecto squash & stretch y chispas de golpe [CUMPLIDO].
  5. Componente React accesible `MinigameHUD.tsx` con marcador en vivo, récord, monedas acumuladas y modal de Game Over con botones de reinicio y retorno [CUMPLIDO].
  6. Integración atómica con `usePetCare` (`recordMinigameResult`), acreditación en billetera y persistencia automática en `GameStateRepository` [CUMPLIDO].

#### T-10: Pulido Visual, Audio Wrapper y Validación del MVP [COMPLETADA]
- **Dependencias:** T-05, T-08, T-09
- **Merge:** Commit `dfa60d5` en `main` (PR #28).
- **Objetivo:** Añadir efectos de sonido con wrapper desacoplado, animaciones de feedback visual y verificar el bucle completo de experiencia de usuario.
- **Criterios de Aceptación:**
  1. Audio con opción de silenciar/ajustar volumen persistente en `localStorage` implementado con Web Audio API procedural [CUMPLIDO].
  2. Flujo completo validado con suite E2E: Crear mascota -> Cuidar -> Jugar minijuego -> Ganar monedas -> Comprar ítem -> Decorar habitación -> Recargar página sin perder nada (`src/e2e/gameLoop.test.ts`) [CUMPLIDO].
  3. Integración de efectos de sonido en cuidados, compras y minijuego sin dependencias de ficheros externos [CUMPLIDO].
  4. Botón de alternancia de audio accesible en encabezado de la aplicación [CUMPLIDO].

---

### Sprint 4B: Rediseño Artístico y Game Feel Playfish (Flash Vectorial Chibi)

#### T-ART-01: Mascota Viva Chibi, Sombra Elíptica, Expresión y Desplazamiento por Clic [COMPLETADA]
- **Dependencias:** T-04, T-05
- **Merge:** Commit `4cefa15` en `main` (PR #33).
- **Objetivo:** Rediseñar la mascota al estilo Flash Vectorial Chibi de Playfish: proporciones toyetic, cabeza redondeada, ojos expresivos con pupila móvil que sigue el puntero, animación de parpadeo natural cada 3-5s, respiración con squash & stretch, sombra elíptica difuminada bajo los pies y mecánica de caminar por clic sobre el suelo con ciclo de patitas.
- **Criterios de Aceptación:**
  1. Renderizado de mascota estilizado (trazos limpios, degradados sutiles, proporciones chibi y sombra elíptica oscura en la base) [CUMPLIDO].
  2. Bucle de animación idle vivo: respiración elástica sutil y parpadeo aleatorio/periódico cada 3-5 segundos [CUMPLIDO].
  3. Mirada reactiva: las pupilas se orientan suavemente en la dirección del cursor/toque [CUMPLIDO].
  4. Movimiento sobre el suelo: hacer clic en el suelo de la sala hace que la mascota camine hacia esa coordenada con animación de pasos y voltee la dirección (flip horizontal) según el destino [CUMPLIDO].
  5. `npm run verify` pasa al 100% [CUMPLIDO].

#### T-ART-02: Habitación Diorama 2.5D, Rejilla (Grid Snap) y Sombras de Muebles [COMPLETADA]
- **Dependencias:** T-07, T-ART-01
- **Merge:** Commit `dff98b4` en `main` (PR #35).
- **Objetivo:** Transformar la sala en una perspectiva diorama 2.5D de casa de muñecas cálida sin barras negras laterales invasivas (fondo envolvente centrado), con sistema de rejilla magnética (grid snap) en el suelo y sombras proyectadas de contacto para cada mueble.
- **Criterios de Aceptación:**
  1. Escenario diorama 2.5D cálido ocupando el viewport de forma armónica sin bordes negros cortados [CUMPLIDO].
  2. Rejilla de colocación (grid snap): los muebles se ajustan a celdas discretas del suelo y no pueden flotar en el aire [CUMPLIDO].
  3. Sombras de contacto vectoriales bajo cada mueble colocadas automáticamente [CUMPLIDO].
  4. Separación estricta de capas: muebles de suelo solo en la rejilla inferior; ventanas y cuadros restringidos a la pared [CUMPLIDO].
  5. `npm run verify` pasa al 100% [CUMPLIDO].

#### T-ART-03: Rediseño Jugoso del Minijuego de Pelota (Física, Textura y Sombra) [COMPLETADA]
- **Dependencias:** T-09, T-ART-01
- **Merge:** Commit `1a435d8` en `main` (PR #37).
- **Objetivo:** Rebalancear y embellecer el minijuego de pelota: aumentar la pelota al doble de su tamaño con textura clásica de fútbol/juguete retro, sombra dinámica reactiva en el césped, gravedad y coeficientes de rebote jugosos (juicy physics) para malabares adictivos y divertidos.
- **Criterios de Aceptación:**
  1. Pelota de gran visibilidad (mínimo el doble de tamaño) con arte vectorial icónico tipo juguete/balón clásico [CUMPLIDO].
  2. Física reajustada para permitir malabares placenteros, menos punitivos y con mayor tiempo de reacción [CUMPLIDO].
  3. Efectos visuales de impacto aumentados (squash & stretch acentuado, partículas estelares y sonido sintetizado reactivo) [CUMPLIDO].
  4. La mascota en el césped acompaña activamente el movimiento de la pelota con su mirada y saltitos de celebración [CUMPLIDO].
  5. `npm run verify` pasa al 100% [CUMPLIDO].

---

### Sprint 5: Despliegue y Publicación Web

#### T-11: Despliegue Continuo a GitHub Pages y Publicación de Demo Web [COMPLETADA]
- **Dependencias:** T-10
- **Merge:** Commit `48d05e3` en `main` (PR #30).
- **Objetivo:** Configurar el pipeline automatizado de CI/CD para GitHub Pages y publicar la demo web pública oficial en `https://augustoalr.github.io/pet-society-reborn/`.
- **Criterios de Aceptación:**
  1. Base path dinámico en `vite.config.ts`: `/pet-society-reborn/` en despliegues a Pages / CI y `/` en entorno local [CUMPLIDO].
  2. Workflow `.github/workflows/deploy.yml` configurado con permisos (`pages: write`, `id-token: write`), Node 20, verificación `npm run verify`, build con base path y despliegue con acciones oficiales de GitHub Pages [CUMPLIDO].
  3. Enlace directo a la demo jugable en `README.md` (`https://augustoalr.github.io/pet-society-reborn/`) [CUMPLIDO].
  4. Suite de verificación unificada `npm run verify` pasando al 100% [CUMPLIDO].
