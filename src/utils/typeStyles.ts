/** Pokémon type colors from DESIGN.md */

export const TYPE_HEX: Record<string, string> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  fuego: '#EE8130',
  water: '#6390F0',
  agua: '#6390F0',
  grass: '#7AC74C',
  planta: '#7AC74C',
  electric: '#F7D02C',
  electrico: '#F7D02C',
  ice: '#96D9D6',
  hielo: '#96D9D6',
  fighting: '#C22E28',
  lucha: '#C22E28',
  poison: '#A33EA1',
  veneno: '#A33EA1',
  ground: '#E2BF65',
  tierra: '#E2BF65',
  flying: '#A98FF3',
  volador: '#A98FF3',
  psychic: '#F95587',
  psiquico: '#F95587',
  bug: '#A6B91A',
  bicho: '#A6B91A',
  rock: '#B6A136',
  roca: '#B6A136',
  ghost: '#735797',
  fantasma: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  siniestro: '#705746',
  steel: '#B7B7CE',
  acero: '#B7B7CE',
  fairy: '#D685AD',
  hada: '#D685AD',
};

const DARK_TEXT_TYPES = new Set([
  'eléctrico',
  'electrico',
  'electric',
  'hielo',
  'ice',
  'tierra',
  'ground',
  'acero',
  'steel',
]);

const TYPE_BG: Record<string, string> = {
  normal: 'bg-pokemon-normal',
  fire: 'bg-pokemon-fuego',
  fuego: 'bg-pokemon-fuego',
  water: 'bg-pokemon-agua',
  agua: 'bg-pokemon-agua',
  grass: 'bg-pokemon-planta',
  planta: 'bg-pokemon-planta',
  electric: 'bg-pokemon-electrico',
  eléctrico: 'bg-pokemon-electrico',
  electrico: 'bg-pokemon-electrico',
  ice: 'bg-pokemon-hielo',
  hielo: 'bg-pokemon-hielo',
  fighting: 'bg-pokemon-lucha',
  lucha: 'bg-pokemon-lucha',
  poison: 'bg-pokemon-veneno',
  veneno: 'bg-pokemon-veneno',
  ground: 'bg-pokemon-tierra',
  tierra: 'bg-pokemon-tierra',
  flying: 'bg-pokemon-volador',
  volador: 'bg-pokemon-volador',
  psychic: 'bg-pokemon-psiquico',
  psíquico: 'bg-pokemon-psiquico',
  psiquico: 'bg-pokemon-psiquico',
  bug: 'bg-pokemon-bicho',
  bicho: 'bg-pokemon-bicho',
  rock: 'bg-pokemon-roca',
  roca: 'bg-pokemon-roca',
  ghost: 'bg-pokemon-fantasma',
  fantasma: 'bg-pokemon-fantasma',
  dragon: 'bg-pokemon-dragon',
  dragón: 'bg-pokemon-dragon',
  dark: 'bg-pokemon-siniestro',
  siniestro: 'bg-pokemon-siniestro',
  steel: 'bg-pokemon-acero',
  acero: 'bg-pokemon-acero',
  fairy: 'bg-pokemon-hada',
  hada: 'bg-pokemon-hada',
};

export function typeKey(type: string): string {
  return type
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function usesDarkTypeText(type: string): boolean {
  const key = typeKey(type);
  return DARK_TEXT_TYPES.has(key) || DARK_TEXT_TYPES.has(type.toLowerCase());
}

export function getTypeHex(type: string): string {
  const key = typeKey(type);
  return TYPE_HEX[key] || TYPE_HEX[type.toLowerCase()] || TYPE_HEX.normal;
}

export function getTypeFillStyle(type: string): { backgroundColor: string; color: string; borderColor: string } {
  const backgroundColor = getTypeHex(type);
  return {
    backgroundColor,
    color: usesDarkTypeText(type) ? '#111827' : '#FFFFFF',
    borderColor: backgroundColor,
  };
}

export function getTypeBadgeClass(type: string): string {
  const key = typeKey(type);
  const bg = TYPE_BG[key] || TYPE_BG[type.toLowerCase()] || 'bg-pokemon-normal';
  const text = usesDarkTypeText(type) ? 'text-gray-900' : 'text-white';
  return `${bg} ${text}`;
}
