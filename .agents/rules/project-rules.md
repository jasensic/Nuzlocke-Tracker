---
description: Coding guidelines, state persistence rules, and architecture conventions for Nuzlocke-Tracker
always_on: true
---

# Directrices de Desarrollo - Nuzlocke Tracker

Este conjunto de reglas se aplica automáticamente a todas las tareas de edición, refactorización y extensión en este repositorio.

## 1. Arquitectura de Estado y Persistencia
- La aplicación es una **Single Page Application (SPA)** completamente client-side sin base de datos en servidor.
- Todo guardado de datos debe realizarse a través de `localStorage` utilizando las claves definidas en `src/data/tenantRegistry.ts` y documentadas en `AGENTS.md`.
- El aislamiento multi-juego (multi-tenancy) es crítico: cada juego o mod (`GameTenant`) tiene su propio histórico de encuentros bajo la clave `pokemon_encounters_{tenantId}_v1`. Nunca mezcles capturas de diferentes juegos.
- Respeta la retrocompatibilidad con la clave legacy `pokemon_route_encounters_v1` para `blessed-shield`.

## 2. Convenciones de Tipado y TypeScript
- No uses `any` salvo en excepciones de deserialización JSON en `tenantRegistry.ts`.
- Todas las interfaces clave residen en `src/types.ts`. Si agregas nuevos campos a `SavedEncounter`, `RouteData` o `TrainerBattle`, asegúrate de que sean opcionales (`?`) para no romper datos serializados antiguos.

## 3. Manejo de PokeAPI y Rendimiento
- Nunca realices llamadas HTTP directas a PokeAPI sin pasar por `src/services/pokeApiService.ts`.
- `pokeApiService.ts` implementa una caché persistente de 7 días (`pokenode:` en `localStorage`) mediante `pokenode-ts`.
- En caso de fallo de red o Pokémon especial/forma no reconocida, devuelve siempre un objeto de rescate (*fallback*) elegante sin romper la interfaz.

## 4. UI y Estilos (Tailwind CSS v4)
- La aplicación es totalmente bimodal (Modo Claro / Modo Oscuro). Todas las vistas, modales y tarjetas deben incluir clases `dark:` legibles y con alto contraste.
- Diseño enfocado en móviles (*mobile-first*): las barras de navegación, botones y filtros deben ser cómodos en pantallas táctiles pequeñas.

## 5. Audio Procedural
- No importes archivos de audio `.mp3`, `.ogg` ni `.wav`.
- Utiliza la instancia `sfx` de `src/utils/audio.ts` (basada en la Web Audio API nativa del navegador).

## 6. Integración del Modo Historia
- El Modo Historia (`StoryModeView.tsx`) es la vista principal por defecto de la aplicación.
- Combina de forma unificada rutas cronológicas con combates de entrenadores, rivales y líderes procedentes de `src/data/storyTimeline.ts`.
- Las variaciones de los rivales según el inicial seleccionado (`starterChoice: 'grookey' | 'scorbunny' | 'sobble'`) deben sincronizarse entre `StoryModeView` y el estado global en `App.tsx`.
