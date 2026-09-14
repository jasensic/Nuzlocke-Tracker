# 🏗️ Arquitectura del Sistema (ARCHITECTURE.md)

Este documento detalla la estructura interna, los flujos de datos, la gestión de estado y los algoritmos fundamentales de **Pokémon Nuzlocke Tracker**.

---

## 1. Diagrama de Alto Nivel

```mermaid
graph TD
    User([Usuario]) --> Header[Barra de Navegación Superior]
    Header --> TenantSelector[Selector de Juego / Mod]
    Header --> TabSelector[Pestañas: Historia | Ruleta | Bitácora | Rutas]
    Header --> DarkMode[Conmutador Modo Oscuro]
    Header --> AudioToggle[Conmutador de Sonido]

    TabSelector --> StoryView[Modo Historia (StoryModeView)]
    TabSelector --> RouletteView[Ruleta de Encuentros (App.tsx)]
    TabSelector --> HistoryView[Bitácora de Run (SavedHistoryView)]
    TabSelector --> DatabaseView[Explorador de Rutas (RouteDatabaseView)]

    StoryView --> TimelineEngine[Generador de Timeline (storyTimeline.ts)]
    TimelineEngine --> RouteEncounters[Rutas & Encuentros]
    TimelineEngine --> TrainerBattles[Combates & Rivales]

    RouletteView --> PokeballAnim[PokeballSpinner & EncounterWheel]
    RouletteView --> ProbEngine[Motor de Ponderación Probabilística]
    RouletteView --> ManualPicker[Selector Manual 'A Dedo']
    RouletteView --> ResultCard[EncounterResultCard]

    ResultCard --> LocalStorage[(LocalStorage Web API)]
    HistoryView --> LocalStorage
    StoryView --> LocalStorage

    AnyComponent[Cualquier Componente] --> PokeDetailCtx[PokeDetailContext]
    PokeDetailCtx --> PokeDetailModal[PokeDetailModal]
    PokeDetailModal --> PokeApiService[pokeApiService.ts]
    PokeApiService --> PokenodeCache[(pokenode Cache 7 días)]
    PokeApiService --> RemotePokeAPI[(PokeAPI v2 Externa)]
```

---

## 2. Gestión de Multi-Tenancy (Bases de Datos de Juegos)

La aplicación soporta múltiples juegos y mods mediante una arquitectura de aislamiento por inquilino (*Tenant*):

```typescript
export interface GameTenant {
  id: string;             // Identificador único (ej. 'blessed-shield', 'radical-red')
  name: string;           // Nombre visible (ej. 'Pokémon Blessed Shield')
  shortName: string;      // Nombre corto para etiquetas
  region: string;         // Galar, Kanto, Sinnoh, Hoenn, etc.
  generation: string;     // Mod Switch, ROM Hack, etc.
  badge: string;          // Etiqueta visual
  badgeColor: string;     // Clase Tailwind para color
  description: string;    // Resumen del juego
  authorOrSource?: string;// Creador del mod o fuente
  isCustom?: boolean;     // true si fue importado por el usuario
  routes: RouteData[];    // Array con las rutas y tablas de encuentros
}
```

### Aislamiento de Almacenamiento
Cada tenant tiene su propio espacio de nombres en `localStorage`:
- Clave de historial: `pokemon_encounters_${tenantId}_v1`
- Excepción de compatibilidad histórica: Si `tenantId === 'blessed-shield'`, se comprueba primero la clave previa `pokemon_route_encounters_v1`.
- Los mods personalizados creados o importados por el usuario se serializan en `pokemon_custom_tenants_v1`.

---

## 3. Algoritmo de Generación de Encuentros (Ruleta)

El sistema soporta dos modos de selección aleatoria:

### A. Modo Ponderado (Probabilidad Real de Juego)
Respeta la tasa oficial (`chance: number`, por ejemplo 10 para 10%).

$$\text{TotalWeight} = \sum_{i=1}^{N} \text{chance}_i$$

1. Se genera un número pseudoaleatorio $R \in [0, \text{TotalWeight})$.
2. Se itera sobre los encuentros disponibles restando sus respectivos pesos:
   - Si $R - \text{chance}_i \le 0$, el Pokémon $i$ es el elegido.
3. Esto garantiza que las especies raras (ej. 1% de aparición en tormenta de nieve) conserven su dificultad real.

### B. Modo Equitativo (Probabilidad Uniforme)
Cada especie candidata tiene una probabilidad idéntica $P = \frac{1}{N}$, independientemente de su rareza en el juego base.

---

## 4. Modo Historia: Cronología Unificada

El archivo `src/data/storyTimeline.ts` implementa la función `buildStoryTimeline()` que entrelaza dinámicamente:
1. **Rutas visitables**: Ordenadas según el recorrido natural de la trama.
2. **Combates de Rival**: Ajustados al punto exacto de la historia donde aparecen.
3. **Líderes de Gimnasio & Eventos de Historia**: Con sus respectivos *level caps* para orientar al jugador.

### Ramificación Dinámica por Inicial
Los rivales Paúl (Hop), Berto (Bede) y Roxy (Marnie) adaptan sus composiciones en función del inicial seleccionado por el jugador:
```typescript
const activeTeam = battle.starterVariants
  ? battle.starterVariants[starterChoice]
  : battle.fixedTeam;
```
El cambio de inicial se propaga reactivamente a través de toda la interfaz sin necesidad de recargar la página.

---

## 5. Integración y Caché de PokeAPI

Para ofrecer inspección detallada de cualquier criatura, movimiento u objeto sin saturar los servidores públicos de PokeAPI, se utiliza la librería `pokenode-ts` configurada con una capa de almacenamiento local:

- **Estrategia de Caché**: `WebStorageCache` persistente en `localStorage` con TTL de 7 días (`1000 * 60 * 60 * 24 * 7` ms).
- **Prefijo**: `pokenode:*`
- **Fallback en memoria**: Si `localStorage` no está disponible o alcanza su cuota, se activa `MemoryCache` con hasta 1000 entradas.
- **Normalización de Nombres**: `getPokemonApiSlug()` convierte nombres con formas regionales (ej. *"Zigzagoon (Galarian)"* $\rightarrow$ `"zigzagoon-galar"`).
- **Traducción Automática**: Movimientos y habilidades incorporan diccionarios estáticos en español (`trainerTranslations.ts`) complementados con las cadenas oficiales en español que devuelve la PokeAPI (`language.name === 'es'`).

---

## 6. Motor de Audio Procedural (Web Audio API)

Ubicado en `src/utils/audio.ts`, el motor no utiliza ningún recurso estático descargable:
- **`playTick()`**: Crea un oscilador de onda cuadrada corta (`triangle` o `sine`) de 15ms de duración a frecuencia decreciente (800 Hz a 400 Hz) con una curva de ganancia exponencial que simula el mecanismo de un engranaje de ruleta retro.
- **`playReveal()`**: Secuencia de 4 tonos arpegiados en do mayor / sol mayor sintetizados mediante modulación de amplitud para simular una fanfarria de 8 bits clásica de Game Boy.
- **Estado Silenciable**: La propiedad booleana `sfx.enabled` cancela de forma inmediata la emisión de nodos de audio si el usuario desactiva el sonido en la cabecera.
