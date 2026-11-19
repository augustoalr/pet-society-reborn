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

#### T-02: [DELICADA] Capa de Persistencia Agnóstica y Modelos de Dominio
- **Dependencias:** T-01
- **Objetivo:** Definir las interfaces de dominio (`Pet`, `Wallet`, `InventoryItem`, `Room`) y la interfaz `IStorageService` con su implementación inicial `LocalStorageAdapter`.
- **Criterios de Aceptación:**
  1. Modelos de dominio tipados estrictamente en TypeScript con inmutabilidad.
  2. Implementación de `LocalStorageAdapter` con pruebas unitarias que verifiquen guardar, leer y resetear el estado del juego.
  3. Mecanismo de fallback: si no hay datos guardados, inicializa un estado por defecto válido.

---

### Sprint 2: Mecánicas Núcleo de Mascota y Render 2D

#### T-03: Motor Gráfico 2D Base y Lienzo Responsive
- **Dependencias:** T-01
- **Objetivo:** Montar el viewport de PixiJS integrado en React con resolución virtual fija adaptable a pantallas móviles y de escritorio (escalado con preservación de relación de aspecto).
- **Criterios de Aceptación:**
  1. El lienzo de juego mantiene su proporción visual sin deformarse en redimensionamiento de ventana y dispositivos móviles táctiles.
  2. Soporte para eventos de puntero (clic y toque táctil unificados).

#### T-04: Sistema de Renderizado de Mascota por Capas
- **Dependencias:** T-02, T-03
- **Objetivo:** Crear el renderizador de la mascota modular (cuerpo base, color, ojos, orejas, boca y capas de ropa).
- **Criterios de Aceptación:**
  1. La mascota se visualiza correctamente según su configuración en el estado.
  2. Capacidad de alternar colores y equipar/desequipar ropa visualmente en tiempo real.

#### T-05: Lógica de Necesidades y Cuidados (Hambre, Higiene, Felicidad)
- **Dependencias:** T-02, T-04
- **Objetivo:** Implementar el bucle de tiempo para decrecimiento de necesidades y las acciones de cuidado: alimentar con comida, bañar con esponja/jabón y acariciar.
- **Criterios de Aceptación:**
  1. Las barras de necesidades se actualizan según las fórmulas del dominio.
  2. Interactuar con jabón limpia a la mascota; darle comida sacia el hambre y resta el ítem del inventario.
  3. Los cambios persisten a través de `IStorageService`.

---

### Sprint 3: Habitación, Decoración y Economía

#### T-06: [DELICADA] Sistema de Economía y Billetera Dual (Coins y Cash)
- **Dependencias:** T-02
- **Objetivo:** Implementar el servicio de billetera que maneja monedas estándar (`coins`) y moneda premium (`cash`), asegurando validación estricta de saldo sin valores negativos.
- **Criterios de Aceptación:**
  1. Métodos para acreditar, debitar y consultar balance con pruebas unitarias exhaustivas.
  2. Prevención de transacciones inválidas o saldo negativo.

#### T-07: Habitación y Sistema de Muebles / Decoración
- **Dependencias:** T-03, T-04
- **Objetivo:** Renderizar la habitación de la mascota con soporte para colocar, mover y guardar la posición de los muebles en el espacio.
- **Criterios de Aceptación:**
  1. Posicionamiento de muebles en cuadrícula o coordenadas restringidas de sala.
  2. Guardado y restauración de la disposición de la habitación desde el almacenamiento.

#### T-08: Tienda de Ítems (Comida, Ropa, Muebles)
- **Dependencias:** T-05, T-06, T-07
- **Objetivo:** Crear la interfaz de tienda donde el usuario puede navegar categorías, ver precios en Coins/Cash y comprar ítems que se agregan a su inventario.
- **Criterios de Aceptación:**
  1. La tienda lista los ítems disponibles con su precio y descripción.
  2. Al comprar, se valida saldo, se descuentan monedas y se agrega el ítem al inventario del usuario.

---

### Sprint 4: Minijuego y Pulido del MVP

#### T-09: Minijuego de Habilidad Clásico (Pelota en el Jardín / Malabares)
- **Dependencias:** T-03, T-06
- **Objetivo:** Implementar el primer minijuego interactivo donde el jugador hace rebotar una pelota con toques/clics para ganar monedas y felicidad para su mascota.
- **Criterios de Aceptación:**
  1. Mecánica de juego fluida tanto con ratón como con pantalla táctil.
  2. Contador de toques/puntos que recompensa con monedas al finalizar la partida.

#### T-10: Pulido Visual, Audio Wrapper y Validación del MVP
- **Dependencias:** T-05, T-08, T-09
- **Objetivo:** Añadir efectos de sonido con wrapper desacoplado, animaciones de feedback visual y verificar el bucle completo de experiencia de usuario.
- **Criterios de Aceptación:**
  1. Audio con opción de silenciar/ajustar volumen persistente.
  2. Flujo completo validado: Crear mascota -> Cuidar -> Jugar minijuego -> Ganar monedas -> Comprar ítem -> Decorar habitación -> Recargar página sin perder nada.
