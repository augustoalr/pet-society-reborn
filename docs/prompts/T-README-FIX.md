# Prompt Formal: T-README-FIX Adecuación Comercial, Derechos de Autor y Enfoque de Exhibición de README.md

CONVERSACIÓN: NUEVA → "T-README-FIX"

Rol: Coder
Tarea: T-README-FIX: Adecuación Comercial, Derechos de Autor y Enfoque de Exhibición de README.md
Rama: t-readme-fix
PR: T-README-FIX: adecuacion comercial, copyright y enfoque exhibicion en readme

## Contexto del Proyecto
Estás trabajando en Pet Society (Reborn).
Augusto (dueño del producto y arquitecto principal) ha especificado que el `README.md` tiene como objetivo ser una carta de presentación comercial, de exhibición tecnológica y de portafolio para plataformas profesionales (LinkedIn), por lo que NO debe ser un repositorio open source para clonar, ni tener licencias gratuitas permisivas.

Lee AGENTS.md, docs/ARQUITECTURA.md, docs/REGLAS.md y docs/TAREAS.md antes de empezar.
Respeta de forma estricta:
- R-04 (Atomicidad): El proyecto debe compilar y pasar la verificación completa con `npm run verify`.
- R-14 (Pensar en el usuario y jugador): Redacción persuasiva, profesional, enfocada en la exhibición del producto y su excelencia técnica.
- R-16 y R-19 (Modo profesor = SÍ): Tu informe final debe incluir "Qué hice y por qué (para Augusto)".
- R-08: Tu última línea debe ser exactamente: `Manager: revisa el PR #N (T-README-FIX)`.

## Verificado contra
- `README.md`: Contiene insignia `[![License: MIT](...)]` y sección `## 🚀 Inicio Rápido y Desarrollo` con `git clone` y `npm install` que deben ser removidas.
- `package.json`: Contiene `"license": "ISC"` (puedes actualizarlo a `"UNLICENSED"` o mantener privado).

## Instrucciones de la tarea
1. Crea y cambia a la rama `t-readme-fix`.
2. Modifica `README.md` aplicando los siguientes cambios obligatorios:
   - **Insignias y Cabecera:**
     - Elimina completamente la insignia `[![License: MIT](...)]`.
     - Añade una insignia de autoría y propiedad: e.g. `[![Author: Augusto](https://img.shields.io/badge/Author-Augusto-blue?style=flat&logo=linkedin)](https://www.linkedin.com/)` y `[![Status: In_Development](https://img.shields.io/badge/Status-In_Development-orange)](#)`.
   - **Crédito y Autoría de Producto:**
     - Destaca a **Augusto** como creador, director del producto y arquitecto de sistemas del proyecto desde la introducción.
   - **Sustitución de sección de instalación/clonado:**
     - Elimina completamente la sección `## 🚀 Inicio Rápido y Desarrollo` (con los bloques `git clone`, `npm install`, etc.).
     - En su lugar, crea la sección:
       `## 🚀 Estado del Proyecto y Demo Web`
       Explicando que el proyecto se encuentra en fase activa de desarrollo y pre-lanzamiento, que la versión jugable estará disponible próximamente en web para acceso público, e invitando a seguir los avances y conectar profesionalmente con Augusto.
   - **Propiedad Intelectual y Derechos de Autor:**
     - En la sección final de Licencia/Créditos, elimina cualquier mención a licencias de código abierto (MIT / ISC) y coloca textualmente:
       > **Propiedad Intelectual © 2026 Augusto. Todos los derechos reservados.**  
       > *Proyecto de portafolio y exhibición comercial; prohibida su copia, bifurcación o redistribución no autorizada.*  
       > *Inspirado en el clásico Pet Society (Playfish/EA). Pet Society (Reborn) es una reinterpretación de ingeniería independiente orientada a la preservación lúdica y demostración de arquitectura web moderna.*
3. Ejecuta `npm run verify` localmente y asegura que linter, tipos (`tsc --noEmit`), tests y build terminen con éxito (código 0).
4. Commit Conventional Commits: `docs(T-README-FIX): adecuar readme a exhibicion comercial, derechos de autor y demo web`.
5. Abre el PR hacia `main` con el título `T-README-FIX: adecuacion comercial, copyright y enfoque exhibicion en readme`.

## Formato de entrega
Al terminar, entrega tu informe con:
1. Resumen de las modificaciones realizadas en el README.
2. Salida de `npm run verify`.
3. Sección obligatoria:
   ### Qué hice y por qué (para Augusto)
4. Última línea exacta:
   Manager: revisa el PR #N (T-README-FIX)
