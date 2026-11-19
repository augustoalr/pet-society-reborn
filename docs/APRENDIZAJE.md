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
