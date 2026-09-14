# Contexto del Proyecto para Gemini / Antigravity

Este proyecto utiliza las directrices y contexto detallados en [AGENTS.md](./AGENTS.md) y [.agents/rules/project-rules.md](./.agents/rules/project-rules.md).

### Resumen Rápido:
- **Proyecto**: Pokémon Nuzlocke Tracker & Adventure Companion (Single Page Application, React 19, Vite, Tailwind CSS v4, TypeScript).
- **Core Features**:
  1. **Modo Historia** (`StoryModeView.tsx`): Timeline cronológico interactivo con rutas, combates contra rivales/líderes y level caps.
  2. **Ruleta de Encuentros** (`App.tsx`): Probabilidades oficiales ponderadas vs. equitativas con ruleta SVG animada y selector manual a dedo.
  3. **Bitácora de Run** (`SavedHistoryView.tsx`): Gestión de capturas con estados Nuzlocke (`En Equipo`, `En Caja`, `Debilitado`, `Huido`, `Capturado`), motes, notas y backup JSON.
  4. **Multi-Tenancy** (`tenantRegistry.ts`): Soporte nativo para *Blessed Shield* (Galar), *Radical Red 4.1* (Kanto), *Renegade Platinum* (Sinnoh), *Pokémon Esmeralda* (Hoenn) y mods custom en JSON.
  5. **Inspector PokeAPI** (`pokeApiService.ts` + `PokeDetailModal.tsx`): Caché de 7 días con `pokenode-ts`, stats base, movimientos y debilidades.
  6. **Audio Procedural** (`audio.ts`): Web Audio API (sin archivos `.mp3` ni `.wav`).

Consulta [README.md](./README.md) y la carpeta [docs/](./docs/) para especificaciones completas.
