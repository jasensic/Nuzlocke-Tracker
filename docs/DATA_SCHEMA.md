# 📊 Esquema de Datos y Modelos (DATA_SCHEMA.md)

Este documento detalla los modelos de datos en TypeScript, las estructuras de los objetos principales y los esquemas JSON admitidos por **Pokémon Nuzlocke Tracker**.

---

## 1. Modelos Principales (`src/types.ts`)

### `EncounterMethod`
Tipo unión que define cómo aparece el Pokémon en la ruta:
```typescript
export type EncounterMethod = 'Hidden' | 'Visible' | 'Fishing' | 'Surfing' | 'Otro';
```
- `'Hidden'`: Hierba alta con exclamación `!` (encuentro aleatorio tradicional).
- `'Visible'`: Pokémon que camina o vuela en el overworld.
- `'Fishing'`: Pesca con caña en masas de agua.
- `'Surfing'`: Desplazamiento sobre agua (Surf o bicicleta acuática).
- `'Otro'`: Regalos, fósiles, intercambios, estáticos.

---

### `RouteEncounter`
Representa una posibilidad individual de aparición dentro de una ruta:
```typescript
export interface RouteEncounter {
  pokemon: string;         // Nombre para mostrar (ej. "Rookidee", "Zigzagoon (Galarian)")
  cleanName: string;       // Nombre base sin formas (ej. "Rookidee", "Zigzagoon")
  formLabel?: string;      // Etiqueta de variante opcional (ej. "Galar", "Alola")
  chance: number;          // Porcentaje de aparición (ej. 10 para 10%)
  levelRange?: string;     // Rango de niveles en texto (ej. "Lv. 2-5")
  method: EncounterMethod; // Método de aparición principal
  methods?: EncounterMethod[]; // Métodos secundarios en caso de combinarse
  weather: string;         // Clima aplicable (ej. "Despejado", "Lluvia", "All")
}
```

---

### `RouteData`
Estructura que engloba toda la información de una zona o ruta:
```typescript
export interface RouteData {
  id: string;               // Identificador único de ruta (ej. "route-1", "motostoke-riverbank")
  name: string;             // Nombre en español para la UI (ej. "Ruta 1", "Ribera de Pistón")
  englishName?: string;     // Nombre original en inglés para cruzar fuentes externas
  category: 'Ruta' | 'Área Silvestre' | 'Cueva/Mina' | 'Ciudad/Pueblo';
  minLevel: number;         // Nivel mínimo de los salvajes en la zona
  maxLevel: number;         // Nivel máximo de los salvajes en la zona
  levelDisplay: string;     // Formato visible de niveles (ej. "Nv. 2-5")
  weathers: string[];       // Lista de climas que pueden ocurrir en la ruta
  methods: EncounterMethod[]; // Métodos de encuentro presentes en la ruta
  encounters: RouteEncounter[]; // Lista exhaustiva de encuentros
  uniquePokemon: {          // Resumen deduplicado de especies presentes
    name: string;
    cleanName: string;
    formLabel?: string;
    totalWeight: number;
    methods: EncounterMethod[];
  }[];
}
```

---

### `SavedEncounter` (Bitácora de Run)
Registro de un Pokémon obtenido o evento ocurrido en una ruta durante la partida:
```typescript
export interface SavedEncounter {
  id: string;              // UUID o identificador temporal único
  timestamp: number;       // Fecha epoch de captura (Date.now())
  routeId: string;         // ID de la ruta de origen
  routeName: string;       // Nombre de la ruta en el momento de guardarse
  pokemon: string;         // Nombre con forma
  cleanName: string;       // Nombre base canónico
  formLabel?: string;      // Variante ("Galar", etc.)
  method: EncounterMethod; // Método en que apareció
  weather: string;         // Clima en el momento del encuentro
  levelRange?: string;     // Rango de niveles
  chance: number;          // Probabilidad que tenía de salir
  status: 'Capturado' | 'En Equipo' | 'En Caja' | 'Debilitado' | 'Huido';
  nickname?: string;       // Mote asignado por el jugador
  notes?: string;          // Notas personalizadas de la run
  isShiny?: boolean;       // Marcador de variante variocolor
}
```

---

### `TrainerBattle` & `TrainerPokemon` (Combates)
Estructura de la guía de combates contra rivales, líderes y jefes:
```typescript
export interface TrainerPokemon {
  name: string;            // Nombre del Pokémon enemigo
  level: number;           // Nivel
  item?: string;           // Objeto equipado (ej. "Life Orb", "Sitrus Berry")
  ability: string;         // Habilidad
  nature: string;          // Naturaleza (ej. "Jolly", "Modest")
  evs?: string;            // Distribución de EVs (ej. "252 Atk / 252 Spe")
  moves: string[];         // Array de hasta 4 movimientos
}

export interface TrainerBattle {
  id: string;              // Identificador único (ej. "hop-postwick-1")
  order: number;           // Orden cronológico
  category?: 'rival' | 'gym_leader' | 'champions_cup' | 'boss';
  trainerName: string;     // Nombre del entrenador (ej. "Paúl (Hop)")
  trainerTitle: string;    // Título (ej. "Rival de Postaw", "Líder de Gimnasio")
  trainerId: string;       // ID base del personaje ("hop", "milo", etc.)
  location: string;        // Ubicación en español
  locationEnglish: string; // Ubicación en inglés
  isDoubleBattle?: boolean;// Si el combate es en formato doble
  minLevel: number;        // Nivel más bajo de su equipo
  maxLevel: number;        // Nivel más alto de su equipo (Level Cap de referencia)
  avatarUrl?: string;      // URL o icono del entrenador
  quote?: string;          // Frase célebre previa al combate
  starterVariants?: Record<StarterChoice, TrainerPokemon[]>; // Equipos según inicial
  fixedTeam?: TrainerPokemon[]; // Equipo fijo cuando no depende del inicial
}
```

---

## 2. Formato JSON de Importación de Mods

La aplicación permite importar mods y juegos personalizados mediante dos formatos válidos en el modal de gestión de tenants:

### Formato A: Objeto Completo `GameTenant`
```json
{
  "id": "mi-romhack-custom",
  "name": "Pokémon Mi ROM Hack",
  "shortName": "Mi Hack",
  "region": "Kanto Alterada",
  "generation": "Gen 3 Hack",
  "badge": "Mod Personalizado",
  "badgeColor": "bg-violet-600",
  "description": "Edición personalizada con encuentros rebalanceados.",
  "authorOrSource": "Tu Nombre",
  "routes": [
    {
      "name": "Ruta 1",
      "category": "Ruta",
      "encounters": [
        { "pokemon": "Pidgey", "chance": 50, "method": "Visible", "weather": "All", "levelRange": "Lv. 2-4" },
        { "pokemon": "Rattata", "chance": 50, "method": "Visible", "weather": "All", "levelRange": "Lv. 2-4" }
      ]
    }
  ]
}
```

### Formato B: Array Simplificado de Rutas
Si el usuario únicamente proporciona una lista de rutas, el normalizador `buildRouteData()` de `tenantHelper.ts` computa automáticamente los niveles mínimos y máximos, los climas soportados, los identificadores y el resumen de criaturas únicas.
