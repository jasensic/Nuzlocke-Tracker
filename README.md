# 🛡️ Pokémon Nuzlocke Tracker & Adventure Companion

> Aplicación web moderna de alta precisión diseñada para partidas **Nuzlocke**, runs temáticas y aventuras competitivas de Pokémon. Cuenta con ruleta de encuentros por ruta con probabilidades oficiales, guía interactiva de combates contra rivales y líderes, bitácora de capturas aislada por juego, soporte multijuego/mods y consulta en tiempo real mediante PokeAPI.

[![React](https://img.shields.io/badge/React-19.0.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![pokenode-ts](https://img.shields.io/badge/pokenode--ts-2.3-EF5350)](https://pokenode-ts.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📑 Tabla de Contenidos

1. [Visión General](#-visión-general)
2. [Características Principales](#-características-principales)
   - [Modo Historia Cronológico](#1-modo-historia-cronológico)
   - [Ruleta de Encuentros](#2-ruleta-de-encuentros-aleatorios)
   - [Selección Manual ("A Dedo")](#3-selección-manual-a-dedo)
   - [Bitácora de Run Aislada](#4-bitácora-de-run-aislada)
   - [Guía de Rivales y Líderes (Blessed Shield)](#5-guía-de-rivales-y-líderes-blessed-shield)
   - [Soporte Multijuego y Mods (Multi-Tenancy)](#6-soporte-multijuego-y-mods-multi-tenancy)
   - [Inspector PokeAPI en Tiempo Real](#7-inspector-pokeapi-en-tiempo-real)
   - [Motor de Audio Procedural (8-Bits)](#8-motor-de-audio-procedural-8-bits)
3. [Juegos Soportados](#-juegos-soportados)
4. [Estructura del Proyecto](#-estructura-del-proyecto)
5. [Tecnologías Utilizadas](#-tecnologías-utilizadas)
6. [Instalación y Puesta en Marcha](#-instalación-y-puesta-en-marcha)
7. [Persistencia de Datos (LocalStorage)](#-persistencia-de-datos-localstorage)
8. [Documentación Adicional](#-documentación-adicional)

---

## 🌟 Visión General

Gestionar un desafío **Nuzlocke** suele requerir hojas de cálculo externas, consultas constantes a wikis de ROM Hacks, dados virtuales y registros manuales propensos a errores.

Esta aplicación unifica todo el ciclo de juego en una única interfaz fluida, interactiva y reactiva:
- Conoce qué ruta sigue en la cronología de la historia.
- Respeta los **Level Caps** antes de cada líder de gimnasio.
- Genera el primer encuentro con porcentajes de aparición oficiales (o equitativos).
- Adapta los equipos de los rivales automáticamente según el Pokémon inicial que hayas elegido (Grookey, Scorbunny o Sobble).
- Permite inspeccionar con un solo clic estadísticas base, tipos, habilidades, movimientos y objetos en español mediante PokeAPI.

---

## 🚀 Características Principales

### 1. 📖 Modo Historia Cronológico
- **Progreso secuencial paso a paso**: Presenta la aventura dividida en capítulos lógicos (desde el *Prólogo en Postaw* hasta la *Copa de Campeones* y el *Postgame*).
- **Límites de Nivel (Level Caps)**: Indicación visual del nivel máximo recomendado para no sobrepasar el desafío antes de cada combate importante.
- **Alternancia entre Rutas y Combates**: Señala cuándo debes registrar tu encuentro de ruta y cuándo te espera un combate clave (Paúl/Hop, Berto/Bede, Roxy/Marnie, Líderes de Gimnasio o Macro Cosmos).
- **Selector de Inicial Sincronizado**: Elige tu inicial (*Grookey*, *Scorbunny* o *Sobble*) y todos los equipos enemigos que ramifican se actualizarán al instante.

### 2. 🎲 Ruleta de Encuentros Aleatorios
- **Probabilidades Oficiales (Modo Ponderado)**: Respeta las tasas reales de aparición de cada zona (por ejemplo, un encuentro al 1% será 10 veces más raro que uno al 10%).
- **Modo Equitativo**: Opción para igualar las probabilidades si se prefiere una run totalmente homogénea.
- **Filtro de Clima y Método**: En el Área Silvestre y rutas con clima dinámico, filtra por despejado, lluvia, tormenta, niebla, sol intenso, etc., así como método de aparición (Hierba oculta `!`, Pokémon visible en overworld, pesca o surf).
- **Pokéball Animada y Ticker**: Animación física de giro y sonido retro estilo 8-bits antes de desvelar el resultado con lluvia de confeti.

### 3. ✋ Selección Manual ("A Dedo")
- Pensado para encuentros especiales donde el jugador no gira la ruleta:
  - Elección deliberada del inicial en pueblo natal.
  - Encuentros estáticos o fósiles.
  - Regalos de NPCs o intercambios.
- Incluye buscador instantáneo, filtrado por método de captura y cálculo de rareza.

### 4. 📋 Bitácora de Run Aislada
- **Registro persistente**: Guarda cada captura con fecha, ruta, nivel, clima, método y probabilidad de aparición.
- **Estados de Nuzlocke**:
  - `En Equipo`: Miembros activos de tu party.
  - `En Caja`: Pokémon de reserva vivos.
  - `Debilitado`: Registro de caídos en combate (**F**), respetando la regla sagrada del Nuzlocke.
  - `Huido`: Rutas perdidas por huida o debilitamiento del salvaje.
  - `Capturado`: Estado base general.
- **Metadatos del Pokémon**: Personaliza el mote (*nickname*), añade notas de la captura y marca variantes **Shiny / Variocolor**.
- **Gestión de Backups**: Exporta e importa la partida completa en formato JSON para no perder el progreso al cambiar de navegador o dispositivo.

### 5. ⚔️ Guía de Rivales y Líderes (Blessed Shield)
- Guía completa de los **34 combates clave** del mod de dificultad *Pokémon Blessed Shield*:
  - **Líderes de Gimnasio**: Milo, Nessa, Kabu, Alistair, Opal/Sally, Melony, Piers, Raihan.
  - **Rivales**: Todos los enfrentamientos contra Paúl (Hop), Berto (Bede) y Roxy (Marnie).
  - **Torneo de Campeones y Postgame**: Lionel (Leon), Macro Cosmos, Rose, Eternatus, Sordward & Shielbert.
- **Detalle de cada Pokémon enemigo**: Nivel, objeto equipado, habilidad, naturaleza, reparto de EVs y los 4 movimientos competitivos.
- **Checklist de Victoria**: Botón para marcar entrenadores derrotados con guardado persistente.

### 6. 🌐 Soporte Multijuego y Mods (Multi-Tenancy)
- Arquitectura desacoplada basada en *Tenants*: cada juego o mod cuenta con su propia base de datos de rutas, encuentros y bitácora independiente.
- **Importador de Mods de Usuario**: Carga cualquier ROM Hack o juego personalizado pegando o subiendo un archivo JSON con la especificación de rutas.
- **Exportador**: Comparte tus configuraciones personalizadas con otros jugadores.

### 7. 🔍 Inspector PokeAPI en Tiempo Real
- Desarrollado sobre la librería oficial `pokenode-ts` con sistema de caché de 7 días en `localStorage` (o memoria).
- Al pulsar sobre cualquier Pokémon, movimiento, habilidad u objeto en cualquier parte de la interfaz, se abre un **Modal de Inspección**:
  - Estadísticas base con barras de progreso a color (PS, Ataque, Defensa, At. Esp, Def. Esp, Velocidad).
  - Tabla de debilidades y resistencias según tipos.
  - Selector de variante normal vs. Shiny (artwork oficial y sprites animados de Pokémon Showdown).
  - Descripción y efectos competitivos traducidos al español.

### 8. 🔊 Motor de Audio Procedural (8-Bits)
- Sin descargas pesadas de archivos `.mp3` ni problemas de licencias.
- Sintetizador procedural nativo con la **Web Audio API** del navegador:
  - Efectos de *tick* durante el giro de la ruleta.
  - Fanfarria de victoria y revelación al obtener un Pokémon.
  - Conmutador para silenciar/activar el sonido en la cabecera.

---

## 🎮 Juegos Soportados

| Juego / Mod | Región | Generación / Plataforma | Rutas / Zonas | Características |
| :--- | :---: | :---: | :---: | :--- |
| **Pokémon Blessed Shield** | Galar | Gen 8 (Switch Mod) | 39 zonas completas | Mod de dificultad de Espada y Escudo. Incluye tabla climática completa del Área Silvestre y guía de combates. |
| **Pokémon Radical Red 4.1** | Kanto | Gen 3 (GBA ROM Hack) | Rutas y cuevas de Kanto | El ROM Hack competitivo por excelencia con Pokémon hasta Gen 9. |
| **Pokémon Renegade Platinum** | Sinnoh | Gen 4 (NDS ROM Hack) | Rutas y cuevas de Sinnoh | El aclamado hack de Drayano con las 493 criaturas de Gen 1-4 disponibles. |
| **Pokémon Esmeralda** | Hoenn | Gen 3 (GBA Oficial) | Rutas terrestres y marítimas | El clásico atemporal de Game Boy Advance en español con encuentros oficiales. |
| **Mods Personalizados** | Custom | Cualquier generación | Definido por el usuario | Soporte para importar cualquier archivo JSON con rutas y probabilidades. |

---

## 📂 Estructura del Proyecto

```text
Nuzlocke-Tracker/
├── .agents/                      # Reglas y directrices para asistentes de IA
│   └── rules/
│       └── project-rules.md
├── docs/                         # Documentación técnica avanzada
│   ├── ARCHITECTURE.md           # Arquitectura del sistema y flujo de datos
│   ├── DATA_SCHEMA.md            # Esquemas TypeScript y formatos JSON de importación
│   └── MOD_CREATION_GUIDE.md     # Guía paso a paso para crear mods de nuevos juegos
├── src/
│   ├── components/               # Componentes modulares de React
│   │   ├── EncounterResultCard.tsx    # Tarjeta de resultado al girar la ruleta
│   │   ├── EncounterWheel.tsx         # Carrusel de candidatos durante el spin
│   │   ├── GameTenantModal.tsx        # Modal de selección e importación de juegos
│   │   ├── GameTenantSelector.tsx     # Botón rápido de cambio de juego
│   │   ├── ManualPokemonPickerModal.tsx # Selector manual "A Dedo"
│   │   ├── PokeDetailModal.tsx        # Modal global de inspección PokeAPI
│   │   ├── PokeballSpinner.tsx        # Pokéball animada SVG
│   │   ├── QuickRouteBar.tsx          # Barra de navegación rápida de rutas
│   │   ├── RouteDatabaseView.tsx      # Vista explorador de base de datos
│   │   ├── RouteFilters.tsx           # Filtros de clima, método y ponderación
│   │   ├── RouteSelector.tsx          # Selector desplegable de rutas
│   │   ├── SavedHistoryView.tsx       # Vista de bitácora y estadísticas de la run
│   │   ├── StoryModeView.tsx          # Vista principal: Modo Historia cronológico
│   │   ├── StoryRouteCard.tsx         # Tarjeta de ruta en la cronología
│   │   ├── TrainerBattleCard.tsx      # Tarjeta de combate con rivales/líderes
│   │   └── TrainerPokemonCard.tsx     # Tarjeta individual de Pokémon enemigo
│   ├── context/
│   │   └── PokeDetailContext.tsx      # Contexto global para invocar el inspector PokeAPI
│   ├── data/
│   │   ├── games/                     # Bases de datos de juegos secundarios
│   │   │   ├── emeraldData.ts         # Datos de Pokémon Esmeralda
│   │   │   ├── radicalRedData.ts      # Datos de Pokémon Radical Red 4.1
│   │   │   └── renegadePlatinumData.ts# Datos de Pokémon Renegade Platinum
│   │   ├── trainers/                  # Guía de combates (Blessed Shield)
│   │   │   ├── blessedShieldBosses.ts
│   │   │   ├── blessedShieldGymLeaders.ts
│   │   │   ├── blessedShieldTrainers.ts
│   │   │   └── trainerTranslations.ts # Diccionarios español/inglés de movimientos/habilidades
│   │   ├── encounterParser.ts         # Parser y constructor de rutas de Galar
│   │   ├── rawEncounterData.ts        # Tablas crudas de encuentros de Blessed Shield
│   │   ├── routeTranslations.ts       # Traducciones inglés/español de rutas
│   │   ├── storyTimeline.ts           # Algoritmo de construcción del timeline de historia
│   │   ├── tenantHelper.ts            # Utilidades de transformación de rutas custom
│   │   └── tenantRegistry.ts          # Registro maestro de juegos y almacenamiento
│   ├── services/
│   │   └── pokeApiService.ts          # Cliente pokenode-ts con WebStorageCache
│   ├── utils/
│   │   ├── audio.ts                   # Sintetizador Web Audio API para SFX 8-bits
│   │   └── pokemonMeta.ts             # Limpieza de nombres, formas regionales y sprites
│   ├── App.tsx                        # Contenedor raíz y barra de navegación superior
│   ├── index.css                      # Tailwind CSS v4 y tema oscuro
│   ├── main.tsx                       # Punto de entrada de React con StrictMode
│   └── types.ts                       # Tipos e interfaces globales del proyecto
├── AGENTS.md                          # Contexto maestro para asistentes de IA
├── bun.lock                           # Lockfile de dependencias
├── index.html                         # Plantilla HTML5 con metadatos OpenGraph
├── metadata.json                      # Metadatos del applet
├── package.json                       # Scripts y dependencias npm
├── tsconfig.json                      # Configuración de TypeScript
└── vite.config.ts                     # Configuración de Vite con plugins React y Tailwind
```

---

## 🛠️ Tecnologías Utilizadas

- **Núcleo**: [React 19](https://react.dev/) + [TypeScript 5.8](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 6](https://vitejs.dev/)
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/) con soporte de modo oscuro nativo mediante clase `.dark`
- **Iconografía**: [Lucide React](https://lucide.dev/)
- **Animaciones & Efectos**: [Motion](https://motion.dev/) + [Canvas-Confetti](https://www.npmjs.com/package/canvas-confetti)
- **API Pokémon**: [pokenode-ts](https://pokenode-ts.vercel.app/) con caché local persistente
- **Audio**: Web Audio API del navegador (sintetizador de osciladores procedurales)

---

## 💻 Instalación y Puesta en Marcha

### Requisitos Previos
- **Node.js** v18 o superior (recomendado v20+) o **Bun** v1.0+.
- Gestor de paquetes `npm`, `pnpm` o `bun`.

### Pasos de Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/jasensic/Nuzlocke-Tracker.git
   cd Nuzlocke-Tracker
   ```

2. **Instalar dependencias:**
   ```bash
   # Con npm:
   npm install

   # O con bun:
   bun install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   # Con npm:
   npm run dev

   # O con bun:
   bun run dev
   ```
   La aplicación estará disponible en `http://localhost:3000`.

4. **Compilar para producción:**
   ```bash
   npm run build
   ```

5. **Comprobar tipos y linters:**
   ```bash
   npm run lint
   ```

---

## 💾 Persistencia de Datos (LocalStorage)

Toda la información de la partida se almacena localmente en el navegador del usuario sin requerir servidores ni bases de datos externas:

| Clave en LocalStorage | Propósito |
| :--- | :--- |
| `pokemon_active_tenant_id_v1` | ID del juego o mod actualmente seleccionado. |
| `pokemon_custom_tenants_v1` | Array de juegos o mods personalizados importados por el usuario. |
| `pokemon_encounters_{tenantId}_v1` | Bitácora de encuentros capturados para el juego `{tenantId}`. |
| `pokemon_defeated_trainers_v1` | IDs de combates de entrenadores y líderes marcados como derrotados. |
| `pokemon_starter_choice_v1` | Elección de inicial del jugador (`grookey`, `scorbunny`, `sobble`). |
| `pokemon_tracker_theme_v1` | Tema visual del usuario (`light` o `dark`). |
| `pokenode:*` | Entradas en caché de PokeAPI (datos de especies, sprites, movimientos y objetos) con caducidad de 7 días. |

---

## 📚 Documentación Adicional

- [Arquitectura del Sistema (`docs/ARCHITECTURE.md`)](./docs/ARCHITECTURE.md)
- [Esquema de Datos y Modelos (`docs/DATA_SCHEMA.md`)](./docs/DATA_SCHEMA.md)
- [Guía de Creación e Importación de Mods (`docs/MOD_CREATION_GUIDE.md`)](./docs/MOD_CREATION_GUIDE.md)
- [Contexto para Agentes de IA (`AGENTS.md`)](./AGENTS.md)

---

## 📄 Licencia y Créditos

- **Desarrollador**: Jasensic / Comunidad Nuzlocke.
- **Datos de Blessed Shield**: Basado en las tablas de encuentros y documentación del mod de dificultad de Pokémon Shield.
- **Datos de Pokémon**: Información y recursos obtenidos a través de [PokeAPI](https://pokeapi.co/) y [Pokémon Showdown](https://pokemonshowdown.com/).
- Pokémon y todas sus marcas registradas son propiedad de **Nintendo**, **Creatures Inc.** y **Game Freak Inc.** Este proyecto es una herramienta para fans sin fines comerciales.
