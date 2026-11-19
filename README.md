# 🐾 Pet Society (Reborn)

[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PixiJS v8](https://img.shields.io/badge/PixiJS-v8-E72264?logo=pixijs&logoColor=white)](https://pixijs.com/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![CI Status](https://img.shields.io/badge/CI-Passing-brightgreen?logo=github-actions&logoColor=white)](https://github.com/augustoalr/pet-society-reborn/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Reviviendo la magia nostálgica de cuidar, vestir, consentir y decorar el mundo de tu mascota virtual, construida con la potencia y fluidez de la web moderna.

---

## 🌟 Visión del Proyecto

**Pet Society (Reborn)** nace para reimaginar la experiencia dorada de las mascotas virtuales de la era clásica en navegadores. Con una arquitectura web moderna, ligera y de alto rendimiento, el juego combina interactividad táctil, gráficos vectoriales dinámicos y un diseño de sistemas limpio y extensible.

Ya no dependes de plugins obsoletos: tu mascota vive directamente en el navegador, funcionando de manera ágil tanto en ordenadores de sobremesa como en tablets y móviles.

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

## 🚀 Inicio Rápido y Desarrollo

### Requisitos Previos
- **Node.js**: Versión `20.x` o superior recomendada.
- **npm**: Gestor de paquetes oficial de Node.

### Instalación

```bash
git clone https://github.com/augustoalr/pet-society-reborn.git
cd pet-society-reborn
npm install
```

### Comandos Principales

| Comando | Acción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local con Vite (HMR ultra rápido). |
| `npm run verify` | **Pipeline de verificación unificado:** Ejecuta linter, chequeo estricto de tipos de TypeScript (`tsc --noEmit`), suite de tests (`vitest`) y compilación de producción. |
| `npm run build` | Genera los bundles optimizados listos para producción en `/dist`. |
| `npm run preview` | Previsualiza localmente el build de producción generado. |
| `npm run test` | Ejecuta la suite de pruebas unitarias y de integración con Vitest. |
| `npm run lint` | Analiza el código fuente con ESLint. |

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

## 📄 Licencia y Créditos

Este proyecto se distribuye bajo la licencia **MIT** (o ISC según configuración de paquete base). Consulta el archivo de licencia para más detalles.

*Inspirado con cariño en el clásico Pet Society (originalmente desarrollado por Playfish/EA). Pet Society (Reborn) es una recreación y homenaje independiente impulsado por la comunidad con fines educativos y de preservación lúdica.*
