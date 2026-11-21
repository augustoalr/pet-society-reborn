# 🐾 Pet Society (Reborn)

[![Author: Augusto](https://img.shields.io/badge/Author-Augusto-0A66C2?style=flat&logo=linkedin)](https://www.linkedin.com/)
[![Demo: Playable Online](https://img.shields.io/badge/Demo-Playable_Online-brightgreen?logo=github-pages&logoColor=white)](https://augustoalr.github.io/pet-society-reborn/)
[![Status: MVP Completed](https://img.shields.io/badge/Status-MVP_Completed-success)](#)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PixiJS v8](https://img.shields.io/badge/PixiJS-v8-E72264?logo=pixijs&logoColor=white)](https://pixijs.com/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![CI Status](https://img.shields.io/badge/CI-Passing-brightgreen?logo=github-actions&logoColor=white)](https://github.com/augustoalr/pet-society-reborn/actions)

> Reviviendo la magia nostálgica de cuidar, vestir, consentir y decorar el mundo de tu mascota virtual, construida con la potencia y fluidez de la web moderna.  
> **Concebido, dirigido y diseñado arquitectónicamente por Augusto.**

---

## 🌟 Visión del Proyecto

**Pet Society (Reborn)** es un proyecto conceptual y de ingeniería de software de alto nivel concebido, liderado y arquitecturado por **Augusto** (Creador, Director de Producto y Arquitecto de Sistemas). Nace para reimaginar la experiencia dorada de las mascotas virtuales de la era clásica en navegadores web.

Con una arquitectura web moderna, ligera y de alto rendimiento, el juego combina interactividad táctil, gráficos vectoriales dinámicos y un diseño de sistemas limpio y extensible. Ya no dependes de plugins obsoletos: tu mascota vive directamente en el navegador, funcionando de manera ágil tanto en ordenadores de sobremesa como en tablets y dispositivos móviles.

---

## 🎮 Pilares y Características Clave

| Característica | Descripción |
| :--- | :--- |
| 🎨 **Personalización Infinita** | Sistema procedimental de renderizado por capas: personaliza color de cuerpo, ojos, hocicos, orejas y accesorios combinables en tiempo real sin perder nitidez. |
| 🛁 **Cuidados y Afecto** | Simulación de necesidades en tiempo real: monitorea y cuida los niveles de hambre, higiene, energía y felicidad con mecánicas interactivas y reactivas. |
| 🛋️ **Decoración y Hogar** | Espacio vital personalizable: coloca, mueve y reorganiza muebles, papeles de pared y adornos con libertad dentro de tu habitación. |
| 🪙 **Economía Dual** | Monedas cotidianas (*coins*) para el día a día y moneda especial (*cash*) para objetos prémium, cosméticos de colección y recompensas especiales. |
| 📱 **Responsive Universal** | Resolución virtual fija con escalado adaptativo inteligente (*letterbox* / *pillarbox*). Interfaz nítida y amigable para touch y teclado/ratón. |

---

## 🏛️ Ingeniería y Arquitectura de Software

Pet Society (Reborn) sigue principios rigurosos de **Clean Architecture** y **Separación de Responsabilidades (SoC)** para asegurar máxima mantenibilidad y extensibilidad entre agentes de desarrollo:

- **Dominio Puro (Agnóstico de Framework):** Las reglas del juego, estados de la mascota, sistemas de cálculo de necesidades y lógica económica residen en modelos puros de TypeScript sin acoplamiento a React ni a PixiJS.
- **Inversión de Dependencias (DIP):** Puertos e interfaces desacoplan la persistencia (`PetRepository`, `EconomyRepository`), permitiendo alternar de forma transparente entre `LocalStorage`, memoria volátil y bases de datos cloud (Supabase / Postgres).
- **Capa Gráfica en PixiJS v8:** Renderizado acelerado por hardware para animaciones y mascotas por capas vectoriales, encapsulado dentro de un contenedor React reactivo y seguro ante fugas de memoria o recreaciones innecesarias del Canvas.
- **Inmutabilidad & Tipado Estricto:** Toda transición de estado se maneja como inmutable, garantizando un flujo de datos predecible sin efectos secundarios entre agentes y subsistemas.

📖 Para una visión técnica profunda, consulta [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md).

---

## 🚀 Estado del Proyecto y Demo Web

El MVP del juego ha sido completado con éxito, consolidando sus hitos de diseño de sistemas, renderizado vectorial procedimental, cuidados en tiempo real, decoración, minijuegos y economía.

- 🎮 **Demo Jugable en la Web:** Accede y prueba la experiencia interactiva directamente desde cualquier navegador moderno (escritorio y móvil), sin descargas ni instalaciones:  
  👉 **[Probar Demo Web Jugable](https://augustoalr.github.io/pet-society-reborn/)**
- 🌐 **Despliegue Continuo:** La aplicación se compila y publica automáticamente a GitHub Pages en cada push a la rama `main`.
- 🤝 **Contacto Profesional y Avances:** Te invitamos a seguir los avances del proyecto, explorar oportunidades o conectar profesionalmente con [Augusto en LinkedIn](https://www.linkedin.com/).

---

## 📚 Mapa de Documentación

Toda la evolución y reglas del proyecto se documentan de forma transparente y estructurada:

| Documento | Enfoque y Contenido |
| :--- | :--- |
| [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) | Diagramas de capas, patrones de diseño (Clean Architecture), contratos de repositorios y flujo de datos. |
| [docs/TAREAS.md](docs/TAREAS.md) | Roadmap del proyecto, desglose atómico de sprints y estado de cada tarea (`T-XX`). |
| [docs/REGLAS.md](docs/REGLAS.md) | Directrices técnicas de código limpio, buenas prácticas TypeScript y estándares de frontend. |
| [docs/ESTADO.md](docs/ESTADO.md) | Registro en tiempo real de PRs fusionados, tareas en progreso y estado del repositorio. |
| [docs/APRENDIZAJE.md](docs/APRENDIZAJE.md) | Lecciones aprendidas e histórico de mejoras acumuladas en el desarrollo. |
| [docs/MANAGER.md](docs/MANAGER.md) | Guía de orquestación, gestión de agentes, revisiones de código y flujo de trabajo Git. |

---

## 📄 Propiedad Intelectual y Créditos

> **Propiedad Intelectual © 2026 Augusto. Todos los derechos reservados.**  
> *Proyecto de portafolio y exhibición comercial; prohibida su copia, bifurcación o redistribución no autorizada.*  
> *Inspirado en el clásico Pet Society (Playfish/EA). Pet Society (Reborn) es una reinterpretación de ingeniería independiente orientada a la preservación lúdica y demostración de arquitectura web moderna.*
