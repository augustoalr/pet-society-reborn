# Registro de Aprendizaje del Proyecto (Modo Profesor)

Este documento registra los aprendizajes técnicos, lecciones de arquitectura y buenas prácticas aprendidas en cada tarea del proyecto Pet Society.

---

## Estructura de cada lección
- **Tarea:** Identificador (ej. T-01) y nombre.
- **Concepto clave:** Qué principio de ingeniería o arquitectura se aplicó.
- **Por qué se hizo así:** Motivo y beneficio a largo plazo.
- **Qué aprendí:** Explicación simple para afianzar conocimientos como desarrollador.

---

### T-00: Inicialización del Proyecto y Arquitectura Base
- **Concepto clave:** Desacoplamiento estructural, CI con check único y preparación del entorno.
- **Por qué se hizo así:** Iniciar un proyecto con reglas claras de aislamiento de capas (SoC) evita tener que refactorizar cuando el juego crezca en complejidad o cuando pasemos de LocalStorage a base de datos en la nube.
- **Qué aprendí:** Antes de escribir una sola línea de lógica visual o de juego, definir las interfaces de datos y los contratos permite que frontend, backend y persistencia evolucionen sin romperse entre sí.
