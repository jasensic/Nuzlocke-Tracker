import { GameTenant, RouteData } from '../types';
import { getRoutes } from './encounterParser';
import { RADICAL_RED_ROUTES } from './games/radicalRedData';
import { RENEGADE_PLATINUM_ROUTES } from './games/renegadePlatinumData';
import { EMERALD_ROUTES } from './games/emeraldData';
import { buildRouteData, SimpleRouteInput } from './tenantHelper';

export const ACTIVE_TENANT_KEY = 'pokemon_active_tenant_id_v1';
export const CUSTOM_TENANTS_KEY = 'pokemon_custom_tenants_v1';

export function getBuiltInTenants(): GameTenant[] {
  return [
    {
      id: 'blessed-shield',
      name: 'Pokémon Blessed Shield',
      shortName: 'Blessed Shield',
      region: 'Galar',
      generation: 'Gen 8 Mod',
      badge: 'Mod Sword & Shield',
      badgeColor: 'bg-red-600',
      description: 'Mod de dificultad en inglés para Pokémon Shield con rutas, clima dinámico del Área Silvestre y tabla de encuentros completa.',
      authorOrSource: 'Mod Oficial Switch',
      isCustom: false,
      routes: getRoutes(),
    },
    {
      id: 'radical-red',
      name: 'Pokémon Radical Red 4.1',
      shortName: 'Radical Red',
      region: 'Kanto',
      generation: 'Gen 3 ROM Hack',
      badge: 'ROM Hack Kanto',
      badgeColor: 'bg-rose-700',
      description: 'El aclamado ROM hack competitivo en inglés con Pokémon de 9 generaciones y rutas rebalanceadas.',
      authorOrSource: 'Soupercell',
      isCustom: false,
      routes: RADICAL_RED_ROUTES,
    },
    {
      id: 'renegade-platinum',
      name: 'Pokémon Renegade Platinum',
      shortName: 'Renegade Platinum',
      region: 'Sinnoh',
      generation: 'Gen 4 ROM Hack',
      badge: 'ROM Hack Drayano',
      badgeColor: 'bg-indigo-600',
      description: 'El aclamado mod de Drayano en inglés para Pokémon Platino en NDS con todos los Pokémon de Gen 1 a 4 disponibles.',
      authorOrSource: 'Drayano',
      isCustom: false,
      routes: RENEGADE_PLATINUM_ROUTES,
    },
    {
      id: 'emerald',
      name: 'Pokémon Esmeralda',
      shortName: 'Esmeralda',
      region: 'Hoenn',
      generation: 'Juego Oficial (Gen 3)',
      badge: 'Oficial GBA',
      badgeColor: 'bg-emerald-600',
      description: 'El clásico atemporal oficial de Game Boy Advance en español con sus rutas terrestres, cuevas y rutas marítimas de Hoenn.',
      authorOrSource: 'Game Freak / Oficial',
      isCustom: false,
      routes: EMERALD_ROUTES,
    },
  ];
}

export function loadCustomTenants(): GameTenant[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TENANTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((t: any) => ({
        ...t,
        isCustom: true,
        routes: Array.isArray(t.routes)
          ? t.routes.map((r: any) => ('uniquePokemon' in r ? (r as RouteData) : buildRouteData(r as SimpleRouteInput)))
          : [],
      }));
    }
    return [];
  } catch (err) {
    console.error('Error loading custom tenants from localStorage', err);
    return [];
  }
}

export function saveCustomTenants(tenants: GameTenant[]) {
  try {
    localStorage.setItem(CUSTOM_TENANTS_KEY, JSON.stringify(tenants));
  } catch (err) {
    console.error('Error saving custom tenants to localStorage', err);
  }
}

export function getAllTenants(): GameTenant[] {
  const builtIn = getBuiltInTenants();
  const custom = loadCustomTenants();
  return [...builtIn, ...custom];
}

export function getTenantById(id: string): GameTenant | undefined {
  return getAllTenants().find((t) => t.id === id);
}

export function getHistoryStorageKey(tenantId: string): string {
  if (tenantId === 'blessed-shield') {
    // Check if the legacy storage key has data
    try {
      const legacy = localStorage.getItem('pokemon_route_encounters_v1');
      if (legacy && legacy !== '[]') {
        return 'pokemon_route_encounters_v1';
      }
    } catch {
      // ignore
    }
  }
  return `pokemon_encounters_${tenantId}_v1`;
}

/**
 * Validates and transforms an imported JSON file into a valid GameTenant
 */
export function parseImportedTenantJson(jsonString: string): GameTenant {
  let parsed: any;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err: any) {
    throw new Error(`El archivo no tiene un formato JSON válido: ${err.message}`);
  }

  // Check if it's an array of routes directly
  if (Array.isArray(parsed)) {
    if (parsed.length === 0) {
      throw new Error('El JSON contiene un array de rutas vacío.');
    }
    const routes = parsed.map((r, i) =>
      r.uniquePokemon ? (r as RouteData) : buildRouteData({ ...r, id: r.id || `custom-route-${i + 1}` })
    );

    const id = `custom-mod-${Date.now()}`;
    return {
      id,
      name: 'Mod Personalizado Importado',
      shortName: 'Mod Custom',
      region: 'Personalizada',
      generation: 'Mod de Usuario',
      badge: 'Mod Importado',
      badgeColor: 'bg-violet-600',
      description: `Base de datos importada con ${routes.length} rutas configuradas.`,
      isCustom: true,
      routes,
    };
  }

  // Check if it's a full GameTenant object
  if (!parsed.name || typeof parsed.name !== 'string') {
    throw new Error('El JSON debe contener un campo "name" con el nombre del juego o mod.');
  }

  if (!parsed.routes || !Array.isArray(parsed.routes) || parsed.routes.length === 0) {
    throw new Error('El JSON debe contener un array "routes" con al menos una ruta.');
  }

  const routes = parsed.routes.map((r: any, i: number) =>
    r.uniquePokemon ? (r as RouteData) : buildRouteData({ ...r, id: r.id || `custom-route-${i + 1}` })
  );

  const id = parsed.id && typeof parsed.id === 'string' ? parsed.id : `custom-${Date.now()}`;

  return {
    id,
    name: parsed.name,
    shortName: parsed.shortName || parsed.name.slice(0, 16),
    region: parsed.region || 'Región Personalizada',
    generation: parsed.generation || 'Mod / ROM Hack',
    badge: parsed.badge || 'Mod Custom',
    badgeColor: parsed.badgeColor || 'bg-violet-600',
    description: parsed.description || `Base de datos personalizada con ${routes.length} rutas.`,
    authorOrSource: parsed.authorOrSource || 'Usuario',
    isCustom: true,
    routes,
  };
}
