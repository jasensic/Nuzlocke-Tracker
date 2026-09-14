# Contexto y Directrices para Agentes de IA (AGENTS.md)

Este documento proporciona el contexto arquitectónico, las convenciones de código y las reglas de diseño para cualquier asistente de inteligencia artificial (Antigravity, Gemini, Claude, Copilot) que trabaje en el repositorio **Nuzlocke Pokémon Tracker**.

---

## 1. Misión del Proyecto y Filosofía

El objetivo de este proyecto es ser el **asistente definitivo para Nuzlockes y partidas temáticas de Pokémon**, con foco principal en el mod de dificultad de Nintendo Switch **Pokémon Blessed Shield**, extendido mediante arquitectura **multi-tenant** a ROM hacks como *Radical Red 4.1*, *Renegade Platinum*, juegos oficiales como *Pokémon Esmeralda* y mods personalizados definidos por los usuarios en JSON.

### Principios Fundamentales
1. **Fidelidad Absoluta a los Datos**: Las tablas de encuentros, niveles, climas del Área Silvestre y probabilidades deben coincidir con los volcados de memoria y documentación oficial de los mods.
2. **Zero Backend / 100% Client-Side**: La aplicación corre enteramente en el cliente (SPA con Vite y React). No depende de servidores propios ni bases de datos SQL externas. Toda la persistencia es local (`localStorage`).
3. **Caché Inteligente de PokeAPI**: Para no saturar PokeAPI y mantener una navegación instantánea, usamos `pokenode-ts` con una caché local (`WebStorageCache`) de 7 días.
4. **Sin Dependencias de Archivos de Audio**: Los efectos sonoros (giros de ruleta, fanfarrias, ticks) se sintetizan proceduralmente con la **Web Audio API** del navegador en `src/utils/audio.ts`. Nunca agregues archivos `.mp3` o `.wav` al repositorio.
5. **Bilingüe Español / Inglés**:
   - Nombres de rutas: Visualización prioritaria en español (ej. *Ruta 1*, *Lago Axew del Ojo*), pero manteniendo el identificador o nombre en inglés original para cruzar datos con documentación técnica externa (`routeTranslations.ts`).
   - Nombres de Pokémon: Se mantienen en inglés/internacional (ej. `Grookey`, `Corvisquire`), con soporte para formas regionales (`Galarian Meowth`, `Alolan Vulpix`) procesadas por `src/utils/pokemonMeta.ts`.
   - Movimientos, Habilidades y Objetos: Se muestran en español con su traducción técnica original en inglés para evitar ambigüedades.

---

## 2. Stack Tecnológico

| Capa | Herramienta / Librería | Versión / Notas |
| :--- | :--- | :--- |
| **Framework** | React | `^19.0.1` (uso de hooks modernos, memoización estricta) |
| **Lenguaje** | TypeScript | `~5.8.2` (modo estricto, tipos exhaustivos en `src/types.ts`) |
| **Bundler** | Vite | `^6.2.3` con `@vitejs/plugin-react` |
| **Estilos** | Tailwind CSS v4 | `@tailwindcss/vite` + `@custom-variant dark (&:where(.dark, .dark *));` |
| **Iconos** | Lucide React | `^0.546.0` |
| **Animaciones** | Canvas Confetti | `^1.9.4` para celebraciones de capturas y victorias |
| **API Pokémon** | `pokenode-ts` | `^2.3.1` (clientes `pokemonClient`, `moveClient`, `itemClient`) |
| **Persistencia** | Web Storage API | `localStorage` nativo con aislamiento por tenant |

---

## 3. Mapa de la Estructura de Directorios

```text
src/
├── components/             # Componentes de presentación y contenedores de vista
│   ├── StoryModeView.tsx        # VISTA 1: Modo Historia cronológico con capítulos
│   ├── StoryRouteCard.tsx       # Ficha de ruta dentro de la cronología
│   ├── TrainerBattleCard.tsx    # Ficha de combate con rivales/líderes y equipos
│   ├── TrainerPokemonCard.tsx   # Ficha individual de un Pokémon enemigo con moves/item
│   ├── QuickRouteBar.tsx        # Navegación horizontal rápida entre rutas
│   ├── EncounterWheel.tsx       # Ticker visual animado durante el spin de ruleta
│   ├── PokeballSpinner.tsx      # SVG interactivo animado de Pokéball
│   ├── EncounterResultCard.tsx  # Ficha de captura (asigna mote, estado, shiny, etc.)
│   ├── RouteFilters.tsx         # Desplegable de clima, método y ponderación
│   ├── SavedHistoryView.tsx     # VISTA 2: Bitácora de capturas y estadísticas
│   ├── RouteDatabaseView.tsx    # VISTA 3: Base de datos completa de todas las rutas
│   ├── GameTenantModal.tsx      # Selector y gestor de juegos/mods
│   ├── GameTenantSelector.tsx   # Botón compacto de cabecera para cambiar de juego
│   ├── ManualPokemonPickerModal.tsx # Modal para elegir un Pokémon "a dedo"
│   └── PokeDetailModal.tsx      # Modal global de inspección de PokeAPI
├── context/
│   └── PokeDetailContext.tsx    # Proveedor global de inspección de Pokémon/movimientos/items
├── data/
│   ├── games/                   # Definición de rutas y encuentros de otros juegos
│   │   ├── radicalRedData.ts
│   │   ├── renegadePlatinumData.ts
│   │   └── emeraldData.ts
│   ├── trainers/                # Datos de combates de Pokémon Blessed Shield
│   │   ├── blessedShieldTrainers.ts   # Rivales con bifurcaciones por inicial
│   │   ├── blessedShieldGymLeaders.ts # Líderes de gimnasio (Milo a Raihan)
│   │   ├── blessedShieldBosses.ts     # Macro Cosmos, Leon, Eternatus, Postgame
│   │   └── trainerTranslations.ts     # Diccionario de movimientos y habilidades
│   ├── encounterParser.ts       # Procesador de rutas para Blessed Shield
│   ├── rawEncounterData.ts      # Matriz de encuentros cruda de Blessed Shield
│   ├── routeTranslations.ts     # Diccionario de traducción de rutas
│   ├── storyTimeline.ts         # Generador del timeline cronológico unificado
│   ├── tenantHelper.ts          # Normalizador y constructor de RouteData para mods
│   └── tenantRegistry.ts        # Registro y almacenamiento de juegos
├── services/
│   └── pokeApiService.ts        # Cliente pokenode-ts con WebStorageCache
├── utils/
│   ├── audio.ts                 # Sintetizador procedural Web Audio API (8-bits SFX)
│   └── pokemonMeta.ts           # Limpieza de nombres, formas regionales y URLs de sprites
├── types.ts                     # Definiciones de tipos TypeScript centrales
├── App.tsx                      # Componente raíz y navegación principal
├── index.css                    # Configuración de Tailwind CSS v4
└── main.tsx                     # Render con StrictMode y PokeDetailProvider
```

---

## 4. Convenciones de Almacenamiento Local (LocalStorage Keys)

Para garantizar la compatibilidad hacia atrás y evitar que nuevas funcionalidades corrompan datos existentes de los usuarios, respeta siempre el esquema de claves:

1. `pokemon_active_tenant_id_v1`: ID del juego seleccionado (ej. `'blessed-shield'`).
2. `pokemon_custom_tenants_v1`: Array JSON con los mods personalizados añadidos por el usuario.
3. `pokemon_encounters_{tenantId}_v1`: Array de `SavedEncounter` correspondiente a la run de ese juego específico.
   - *Nota de compatibilidad*: Si el tenant es `'blessed-shield'`, la función `getHistoryStorageKey` revisa si existe la clave legacy `'pokemon_route_encounters_v1'` para no perder partidas previas.
4. `pokemon_defeated_trainers_v1`: Array con los IDs de combates ya derrotados en el Modo Historia.
5. `pokemon_starter_choice_v1`: Elección del inicial (`'grookey' | 'scorbunny' | 'sobble'`).
6. `pokemon_tracker_theme_v1`: `'dark'` o `'light'`.
7. `pokenode:*`: Prefijo reservado para la caché interna de `WebStorageCache` de PokeAPI.

---

## 5. Reglas de Modificación de Código para Agentes

Al realizar cambios en este repositorio, cumple estrictamente las siguientes directrices:

### A. Preservación de Comentarios y Funcionalidad
- Mantén siempre los comentarios existentes y las firmas de tipos.
- No elimines campos de las interfaces en `src/types.ts` sin asegurar compatibilidad con datos ya guardados en el `localStorage` de los usuarios.

### B. Gestión de Nombres de Pokémon y Formas
- Usa `cleanPokemonName(rawName)` de `src/utils/pokemonMeta.ts` para extraer el nombre base canónico (ej. `"Meowth (Galarian)"` -> `"Meowth"`).
- Para invocar PokeAPI, usa `getPokemonApiSlug(rawName)` para generar el slug adecuado según los estándares de PokeAPI (ej. `"meowth-galar"`).
- Los sprites se obtienen con:
  - Arte Oficial: `getPokemonArtworkUrl(cleanName)`
  - Sprites Animados Showdown: `getShowdownSpriteUrl(cleanName)`
  - Iconos Gen 8: `getPokemonIconUrl(cleanName)`

### C. Modo Historia y Entrenadores
- En `src/data/storyTimeline.ts`, los combates de entrenadores se integran en orden cronológico con las rutas.
- Los rivales Paúl (Hop), Berto (Bede) y Roxy (Marnie) varían según el inicial del jugador. Toda consulta a sus equipos debe considerar `trainer.starterVariants[starterChoice] || trainer.fixedTeam`.

### D. Audio y SFX
- Para reproducir efectos sonoros, importa `sfx` desde `src/utils/audio.ts`:
  ```typescript
  sfx.playTick();   // Sonido de giro de ruleta
  sfx.playReveal(); // Fanfarria de Pokémon obtenido / victoria
  ```
- No añadas librerías de audio externas ni archivos estáticos de audio.

### E. Integración de Tailwind CSS v4
- El proyecto usa Tailwind CSS v4. No busques `tailwind.config.js` porque no se utiliza en v4. La configuración de variantes oscuras reside en `src/index.css` con `@custom-variant dark (&:where(.dark, .dark *));`.
- Utiliza siempre clases compatibles con dark mode (ej. `bg-white dark:bg-slate-900 text-slate-900 dark:text-white`).
