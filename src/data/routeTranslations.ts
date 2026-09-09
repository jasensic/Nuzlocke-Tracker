/**
 * Official Spanish localizations for Pokémon Sword and Shield (Galar) locations
 * Source: Official Nintendo / The Pokémon Company Spanish localizations (Wikidex / Game data)
 */

export const ROUTE_NAME_TRANSLATIONS: Record<string, string> = {
  // Bosques y Rutas Principales
  'Slumbering Weald': 'Bosque Onírico',
  'Slumbering Weald (High Level)': 'Bosque Onírico (Zona Profunda)',
  'Route 1': 'Ruta 1',
  'Route 2': 'Ruta 2',
  'Route 2 (Secret Area)': 'Ruta 2 (Zona Secreta)',
  'Route 3': 'Ruta 3',
  'Route 3 (Garbage)': 'Ruta 3 (Cubos de Basura)',
  'Route 4': 'Ruta 4',
  'Route 5': 'Ruta 5',
  'Route 6': 'Ruta 6',
  'Route 7': 'Ruta 7',
  'Route 8': 'Ruta 8',
  'Route 8 (On Steamdrift Way)': 'Ruta 8 (Senda Vaporosa)',
  'Route 9': 'Ruta 9',
  'Route 9 (in Circhester Bay)': 'Ruta 9 (Bahía de Auriga)',
  'Route 9 (in Outer Spikemuth)': 'Ruta 9 (Afueras de Crampón)',
  'Route 10': 'Ruta 10',
  'Route 10 (Near Station)': 'Ruta 10 (Cerca de la Estación)',

  // Ciudades y Minas
  'City of Motostoke': 'Ciudad Pistón',
  'Motostoke Outskirts': 'Afueras de Pistón',
  'Town of Hulbury': 'Pueblo Amura',
  'Galar Mine': 'Mina de Galar',
  'Galar Mine No. 2': 'Segunda Mina de Galar',
  'Glimwood Triangle': 'Bosque Lumirinto',

  // Área Silvestre - Sector Sur
  'Rolling Fields': 'Pradera Radiante',
  'Dappled Grove': 'Arboleda Claroscuro',
  'Watchtower Ruins': 'Antigua Atalaya',
  'East Lake Axewell': 'Lago Axew (este)',
  'West Lake Axewell': 'Lago Axew (oeste)',
  "Axew's Eye": 'Ojo de Axew',
  'South Lake Miloch': 'Lago Milotic (sur)',
  'North Lake Miloch': 'Lago Milotic (norte)',

  // Área Silvestre - Sector Norte
  'Motostoke Riverbank': 'Ribera de Pistón',
  'Bridge Field': 'Valle Entrepuentes',
  'Stony Wilderness': 'Llanura Pétrea',
  'Dusty Bowl': 'Cuenca Polvorienta',
  'Dusty Bowl (Flying)': 'Cuenca Polvorienta (Aves en Vuelo)',
  "Giant's Mirror": 'Espejo del Gigante',
  "Giant's Cap": 'Gorro del Gigante',
  "Giant's Cap (Ground)": 'Gorro del Gigante (Suelo)',
  "Giant's Seat": 'Silla del Gigante',
  'Hammerlocke Hills': 'Cornisa de Artejo',
  'Lake of Outrage': 'Lago del Enfado',
};

export const WEATHER_TRANSLATIONS: Record<string, string> = {
  'All Weathers': 'Todos los Climas',
  'Normal Weather': 'Despejado',
  'Overcast': 'Nublado',
  'Raining': 'Lluvia',
  'Thunderstorm': 'Tormenta Eléctrica',
  'Intense Sun': 'Sol Intenso',
  'Snowing': 'Nieve',
  'Snowstorm': 'Ventisca',
  'Sandstorm': 'Tormenta de Arena',
  'Heavy Fog': 'Niebla Densa',
};

/**
 * Translates an English route name to its official Spanish name.
 */
export function translateRouteName(name: string): string {
  if (!name) return '';
  const trimmed = name.trim();

  // Direct match
  if (ROUTE_NAME_TRANSLATIONS[trimmed]) {
    return ROUTE_NAME_TRANSLATIONS[trimmed];
  }

  // Case-insensitive lookup
  const lower = trimmed.toLowerCase();
  for (const [en, es] of Object.entries(ROUTE_NAME_TRANSLATIONS)) {
    if (en.toLowerCase() === lower) {
      return es;
    }
  }

  // Generic patterns
  if (/^route\s+(\d+)/i.test(trimmed)) {
    return trimmed.replace(/^route\s+(\d+)/i, 'Ruta $1');
  }
  if (/^city\s+of\s+(.+)/i.test(trimmed)) {
    return trimmed.replace(/^city\s+of\s+(.+)/i, 'Ciudad $1');
  }
  if (/^town\s+of\s+(.+)/i.test(trimmed)) {
    return trimmed.replace(/^town\s+of\s+(.+)/i, 'Pueblo $1');
  }

  return trimmed;
}

/**
 * Translates weather condition strings to Spanish
 */
export function translateWeather(weather: string): string {
  if (!weather) return '';
  return WEATHER_TRANSLATIONS[weather] || weather;
}

export const METHOD_TRANSLATIONS: Record<string, string> = {
  'Non-overworld': 'Hierba alta (!)',
  'Overworld': 'Visible en el mapa',
  'Fishing': 'Pesca',
  'Surfing': 'Surf / Agua',
  'Surfing / Water': 'Surf / Agua',
  'Shake Tree': 'Árbol de bayas',
  'Berry Tree': 'Árbol de bayas',
  'Wanderer': 'Pokémon Errante',
  'Flying': 'En vuelo',
  'Curry': 'Campamento (Curry)',
  'Grass': 'Hierba',
  'Cave': 'Cueva',
  'Old Rod': 'Caña vieja',
  'Good Rod': 'Caña buena',
  'Super Rod': 'Supercaña',
  'Rock Smash': 'Golpe roca',
  'Headbutt': 'Golpe cabeza',
  'Gift': 'Regalo',
};

/**
 * Translates encounter method strings to Spanish
 */
export function translateMethod(method: string): string {
  if (!method) return '';
  return METHOD_TRANSLATIONS[method] || method;
}
