# Reglas del Proyecto Pet Society

Este archivo recoge las directrices operativas que rigen el desarrollo, basadas en el manual de desarrollo y el trabajo en equipo con agentes.

---

### R-01 a R-05: Integridad Estructural y Calidad
- **R-01 (SoC Estricto):** La capa de UI jamás ejecuta lógica de negocio ni persistencia directa. La capa de dominio jamás importa dependencias de UI o APIs del navegador.
- **R-02 (Wrappers Obligatorios):** Cualquier librería externa (PixiJS, Zustand, librerías de sonido, clientes de BD/Storage) debe ser consumida a través de una interfaz o wrapper interno.
- **R-03 (Inmutabilidad por Defecto):** El estado no se muta directamente; se producen nuevas instancias inmutables.
- **R-04 (Atomicidad de Cambios):** Toda tarea entregada debe compilar y pasar la suite de pruebas sin dejar código roto o TODOs bloqueantes.
- **R-05 (Early Return):** Evitar anidamientos innecesarios en condicionales. Validar precondiciones y errores primero.

---

### R-06 a R-10: UI/UX y Sistema de Diseño
- **R-06 (Tokenización):** Cero colores o espaciados hardcodeados en línea. Usar variables semánticas de diseño centralizadas.
- **R-07 (Componentes Aislados):** Cualquier elemento visual con más de 20 líneas o reutilizado debe extraerse a su propio componente.
- **R-08 (Resiliencia Visual):** Toda pantalla debe prever estados de carga, estado vacío (empty state) y error.
- **R-09 (Responsive Universal):** El juego debe visualizarse y operarse de forma óptima tanto con ratón en escritorio como mediante eventos táctiles en navegadores móviles.
- **R-10 (No destructividad):** Principio de "Chesterton's Fence": no eliminar código previo sin entender su justificación original.

---

### R-11 a R-15: Procesos de Equipo y Seguridad
- **R-11 (Verificación en CI):** Todo cambio debe pasar el check único `verify` en GitHub Actions (`npm run verify`).
- **R-12 (Revisor Obligatorio):** Ninguna tarea pasa a completada sin la revisión y aprobación explícita del rol Revisor.
- **R-13 (Tareas Delicadas [DELICADA]):** Las tareas que tocan datos, economía, billetera o autenticación requieren revisión minuciosa de tipos, bordes numéricos y pruebas unitarias exhaustivas.
- **R-14 (Cero Secretos en el Repo):** Ninguna clave de API ni secreto debe subirse al control de versiones. Se usan variables de entorno `.env` ignoradas por git.
- **R-15 (Economía Segura):** Cero cálculos de saldo o transacciones críticas en la vista; siempre se auditan a través de los servicios del dominio.

---

### R-16 a R-19: Modo Profesor y Aprendizaje
- **R-16 (Cierre del Coder):** Cada entrega del Coder debe terminar con la sección obligatoria: *"Qué hice y por qué (para mí)"*, explicando la decisión tomada.
- **R-17 (Cierre del Revisor):** Cada informe del Revisor debe terminar con la sección: *"Qué aprendes de esta revisión"*, destacando una buena práctica o error prevenido.
- **R-18 (Gestión del Manager):** El Manager mantiene el documento `docs/TAREAS.md` actualizado en cada ciclo de sprint.
- **R-19 (Lecciones Centralizadas):** El Manager registra una lección por cada tarea finalizada en [APRENDIZAJE.md](file:///d:/Proyectos/Pet%20Society/docs/APRENDIZAJE.md).
