export type EncounterMethod = 'Hidden' | 'Visible' | 'Fishing' | 'Surfing' | 'Otro';

export interface RouteEncounter {
  pokemon: string;
  cleanName: string;
  formLabel?: string;
  chance: number; // e.g., 10 for 10%
  levelRange?: string;
  method: EncounterMethod;
  weather: string;
}

export interface RouteData {
  id: string;
  name: string;
  englishName?: string;
  category: 'Ruta' | 'Área Silvestre' | 'Cueva/Mina' | 'Ciudad/Pueblo';
  minLevel: number;
  maxLevel: number;
  levelDisplay: string;
  weathers: string[];
  methods: EncounterMethod[];
  encounters: RouteEncounter[];
  uniquePokemon: {
    name: string;
    cleanName: string;
    formLabel?: string;
    totalWeight: number;
    methods: EncounterMethod[];
  }[];
}

export interface SavedEncounter {
  id: string;
  timestamp: number;
  routeId: string;
  routeName: string;
  pokemon: string;
  cleanName: string;
  formLabel?: string;
  method: EncounterMethod;
  weather: string;
  levelRange?: string;
  chance: number;
  status: 'Capturado' | 'En Equipo' | 'En Caja' | 'Debilitado' | 'Huido';
  nickname?: string;
  notes?: string;
  isShiny?: boolean;
}

export interface GameTenant {
  id: string;
  name: string;
  shortName: string;
  region: string;
  generation: string;
  badge: string;
  badgeColor: string; // Tailwind color class e.g. 'bg-red-500'
  description: string;
  authorOrSource?: string;
  isCustom?: boolean;
  routes: RouteData[];
}
