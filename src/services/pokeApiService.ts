import {
  MainClient,
  WebStorageCache,
  MemoryCache,
} from 'pokenode-ts';
import {
  translateAbility,
  getItemInfo,
  getMoveInfo,
} from '../data/trainers/trainerTranslations';
import { parsePokemonName, getPokemonSprite } from '../utils/pokemonMeta';

// ==========================================
// POKENODE-TS OFFICIAL CACHE SETUP
// According to https://pokenode-ts.vercel.app/guides/cache
// ==========================================
const pokenodeCache =
  typeof window !== 'undefined' && window.localStorage
    ? new WebStorageCache({
        storage: window.localStorage,
        ttl: 1000 * 60 * 60 * 24 * 7, // 7 days freshness
        prefix: 'pokenode:',
      })
    : new MemoryCache({
        ttl: 1000 * 60 * 60 * 24,
        maxEntries: 1000,
      });

// MainClient shares transport and cache across all section clients
export const mainClient = new MainClient({
  cache: pokenodeCache,
  revalidate: true,
});

export const pokemonClient = mainClient.pokemon;
export const moveClient = mainClient.move;
export const itemClient = mainClient.item;
export const gameClient = mainClient.game;
export const evolutionClient = mainClient.evolution;

/** Pokédexes that make up Sword/Shield + both DLCs (Blessed Shield). */
const SWSH_POKEDEX_NAMES = ['galar', 'isle-of-armor', 'crown-tundra'] as const;

export interface DexPokemonEntry {
  slug: string;
  name: string;
}

const DEX_DISPLAY_OVERRIDES: Record<string, string> = {
  'nidoran-f': 'Nidoran♀',
  'nidoran-m': 'Nidoran♂',
  'mr-mime': 'Mr. Mime',
  'mime-jr': 'Mime Jr.',
  'mr-rime': 'Mr. Rime',
  'type-null': 'Type: Null',
  'porygon-z': 'Porygon-Z',
  'porygon2': 'Porygon2',
  'jangmo-o': 'Jangmo-o',
  'hakamo-o': 'Hakamo-o',
  'kommo-o': 'Kommo-o',
  'tapu-koko': 'Tapu Koko',
  'tapu-lele': 'Tapu Lele',
  'tapu-bulu': 'Tapu Bulu',
  'tapu-fini': 'Tapu Fini',
  'ho-oh': 'Ho-Oh',
  farfetchd: "Farfetch'd",
  sirfetchd: "Sirfetch'd",
  flabebe: 'Flabébé',
};

/** Regional / alternate forms present in SwSh that Pokédex species entries collapse. */
const SWSH_EXTRA_FORMS = [
  'Zigzagoon-1',
  'Meowth-1',
  'Meowth-2',
  'Persian-1',
  "Farfetch'd-1",
  'Darumaka-1',
  'Darmanitan-2',
  'Mr. Mime-1',
  'Corsola-1',
  'Slowpoke-1',
  'Ponyta-1',
  'Rapidash-1',
  'Weezing-1',
  'Yamask-1',
  'Stunfisk-1',
  'Vulpix-1',
  'Ninetales-1',
  'Sandshrew-1',
  'Sandslash-1',
  'Dugtrio-1',
  'Indeedee-1',
  'Basculin-1',
  'Lycanroc Day',
  'Lycanroc Night',
  'Lycanroc Dusk',
  'Toxtricity-Low-Key',
];

function titleCaseSlug(slug: string): string {
  if (DEX_DISPLAY_OVERRIDES[slug]) return DEX_DISPLAY_OVERRIDES[slug];
  return slug
    .split('-')
    .map((word) => (word.length ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}

function dexEntryFromName(name: string): DexPokemonEntry {
  const meta = parsePokemonName(name);
  const slug = toPokeApiSlug(meta.apiName);
  return { slug: POKEMON_SLUG_OVERRIDES[slug] || slug, name: meta.displayName };
}

let swshDexPromise: Promise<DexPokemonEntry[]> | null = null;

/**
 * Full Sword/Shield available species: Galar + Isle of Armor + Crown Tundra.
 * Generation-viii alone only returns the ~90 new Galar Pokémon and misses
 * every transferred species Blessed Shield actually uses.
 */
export function fetchSwordShieldPokedex(): Promise<DexPokemonEntry[]> {
  if (!swshDexPromise) {
    swshDexPromise = loadSwordShieldPokedex().catch((err) => {
      swshDexPromise = null;
      throw err;
    });
  }
  return swshDexPromise;
}

async function loadSwordShieldPokedex(): Promise<DexPokemonEntry[]> {
  const unique = new Map<string, DexPokemonEntry>();

  const dexes = await Promise.all(
    SWSH_POKEDEX_NAMES.map((dexName) => gameClient.getPokedexByName(dexName))
  );

  for (const dex of dexes) {
    for (const entry of dex.pokemon_entries || []) {
      const slug = entry.pokemon_species?.name;
      if (!slug || unique.has(slug)) continue;
      unique.set(slug, { slug, name: titleCaseSlug(slug) });
    }
  }

  for (const formName of SWSH_EXTRA_FORMS) {
    const extra = dexEntryFromName(formName);
    if (!unique.has(extra.slug)) {
      unique.set(extra.slug, extra);
    }
  }

  return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name, 'en'));
}

// ==========================================
// TYPE DEFINITIONS FOR DETAIL MODAL
// ==========================================

export interface MoveDetail {
  id: number;
  slug: string;
  name: string;
  originalName: string;
  power: number | null;
  accuracy: number | null;
  pp: number;
  priority: number;
  type: string;
  typeSlug: string;
  damageClass: 'physical' | 'special' | 'status';
  damageClassEs: 'Físico' | 'Especial' | 'Estado';
  description: string;
  effect: string;
  target: string;
}

export interface AbilityDetail {
  id: number;
  slug: string;
  name: string;
  originalName: string;
  description: string;
  effect: string;
}

export interface ItemDetail {
  id: number;
  slug: string;
  name: string;
  originalName: string;
  sprite: string;
  category: string;
  description: string;
  effect: string;
}

export interface PokemonStat {
  name: string;
  nameEs: string;
  base: number;
  percent: number;
}

export type LearnMethod = 'level-up' | 'machine' | 'egg' | 'tutor' | 'other';

export interface PokemonLearnMove {
  slug: string;
  name: string;
  nameEs: string;
  type: string;
  level: number;
  method: LearnMethod;
  methodEs: string;
}

export interface PokemonEvolution {
  slug: string;
  name: string;
  sprite: string;
  fromName: string;
  stage: number;
  requirement: string;
  itemSlug?: string;
}

export interface PokemonDetail {
  id: number;
  slug: string;
  name: string;
  displayName: string;
  types: Array<{ name: string; slug: string; es: string }>;
  sprites: {
    artwork: string;
    showdown: string;
    icon: string;
    shinyArtwork: string;
  };
  heightMeters: number;
  weightKg: number;
  abilities: Array<{ name: string; nameEs: string; isHidden: boolean; slug: string }>;
  stats: PokemonStat[];
  bst: number;
  learnset: PokemonLearnMove[];
  preEvolutions: PokemonEvolution[];
  evolutions: PokemonEvolution[];
}

// Translations mapping
export const TYPE_TRANSLATIONS: Record<string, string> = {
  normal: 'Normal',
  fire: 'Fuego',
  water: 'Agua',
  grass: 'Planta',
  electric: 'Eléctrico',
  ice: 'Hielo',
  fighting: 'Lucha',
  poison: 'Veneno',
  ground: 'Tierra',
  flying: 'Volador',
  psychic: 'Psíquico',
  bug: 'Bicho',
  rock: 'Roca',
  ghost: 'Fantasma',
  dragon: 'Dragón',
  steel: 'Acero',
  dark: 'Siniestro',
  fairy: 'Hada',
};

export const STAT_TRANSLATIONS: Record<string, string> = {
  hp: 'PS',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'Atq. Esp.',
  'special-defense': 'Def. Esp.',
  speed: 'Velocidad',
};

const LEARN_METHOD_ES: Record<LearnMethod, string> = {
  'level-up': 'Nivel',
  machine: 'MT / MO',
  egg: 'Huevo',
  tutor: 'Tutor',
  other: 'Otro',
};

const PREFERRED_VERSION_GROUPS = [
  'sword-shield',
  'the-isle-of-armor',
  'the-crown-tundra',
  'brilliant-diamond-shining-pearl',
  'scarlet-violet',
  'the-teal-mask',
  'the-indigo-disk',
];

function slugToEnglishMoveName(slug: string): string {
  return slug
    .split('-')
    .map((word) => (word.length ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}

async function resolveAbilityNameEs(abilitySlug: string): Promise<string> {
  const englishName = slugToEnglishMoveName(abilitySlug);
  const localSpanish = translateAbility(englishName);
  if (localSpanish !== englishName) return localSpanish;

  try {
    const ability = await pokemonClient.getAbilityByName(abilitySlug);
    const esName = ability.names?.find((n) => n.language.name === 'es')?.name;
    if (esName) return esName;

    const enName =
      ability.names?.find((n) => n.language.name === 'en')?.name || englishName;
    const fromEn = translateAbility(enName);
    return fromEn !== enName ? fromEn : enName;
  } catch {
    return englishName;
  }
}

function toLearnMethod(raw: string): LearnMethod {
  if (raw === 'level-up' || raw === 'machine' || raw === 'egg' || raw === 'tutor') {
    return raw;
  }
  return 'other';
}

// Helper to clean slug for PokeAPI
export function toPokeApiSlug(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/['’.:]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Special overrides for Pokémon names to match PokéAPI
const POKEMON_SLUG_OVERRIDES: Record<string, string> = {
  'farfetchd-galar': 'farfetchd-galar',
  'farfetchd': 'farfetchd',
  'sirfetchd': 'sirfetchd',
  'mr-mime': 'mr-mime',
  'mr-mime-galar': 'mr-mime-galar',
  'mr-rime': 'mr-rime',
  'mime-jr': 'mime-jr',
  'type-null': 'type-null',
  'darmanitan-galar': 'darmanitan-galar-standard',
  'darmanitan': 'darmanitan-standard',
  'toxtricity': 'toxtricity-amped',
  'corsola-galar': 'corsola-galar',
  'weezing-galar': 'weezing-galar',
  'yamask-galar': 'yamask-galar',
  'slowpoke-galar': 'slowpoke-galar',
  'slowbro-galar': 'slowbro-galar',
  'slowking-galar': 'slowking-galar',
  'ponyta-galar': 'ponyta-galar',
  'rapidash-galar': 'rapidash-galar',
  'zigzagoon-galar': 'zigzagoon-galar',
  'linoone-galar': 'linoone-galar',
  'meowth-galar': 'meowth-galar',
  'stunfisk-galar': 'stunfisk-galar',
  'articuno-galar': 'articuno-galar',
  'zapdos-galar': 'zapdos-galar',
  'moltres-galar': 'moltres-galar',
  'aegislash': 'aegislash-shield',
  'morpeko': 'morpeko-full-belly',
  'eiscue': 'eiscue-ice',
  'indeedee-f': 'indeedee-female',
  'indeedee-m': 'indeedee-male',
  'meowstic-f': 'meowstic-female',
  'meowstic-m': 'meowstic-male',
  'urshifu': 'urshifu-single-strike',
  'basculin': 'basculin-red-striped',
  'gourgeist': 'gourgeist-average',
  'pumpkaboo': 'pumpkaboo-average',
  'toxtricity-low-key': 'toxtricity-low-key',
  'toxtricity-lowkey': 'toxtricity-low-key',
  'zygarde-10': 'zygarde-10',
  'cherrim-overcast': 'cherrim-overcast',
  'centiskorch-g': 'centiskorch-gmax',
  'machamp-gmax': 'machamp-gmax',
  'gengar-gmax': 'gengar-gmax',
  'alcremie-gmax': 'alcremie-gmax',
  'coalossal-gmax': 'coalossal-gmax',
  'lapras-gmax': 'lapras-gmax',
  'duraludon-gmax': 'duraludon-gmax',
  'centiskorch-gmax': 'centiskorch-gmax',
};

export function getPokemonApiSlug(rawName: string): string {
  const parsed = parsePokemonName(rawName);
  const candidates = [parsed.apiName, rawName, parsed.cleanName];
  for (const candidate of candidates) {
    const slug = toPokeApiSlug(candidate);
    if (!slug) continue;
    if (POKEMON_SLUG_OVERRIDES[slug]) return POKEMON_SLUG_OVERRIDES[slug];
  }
  const fallback = toPokeApiSlug(parsed.apiName || rawName);
  return POKEMON_SLUG_OVERRIDES[fallback] || fallback;
}

const GEN8_VERSION_GROUPS = new Set(['sword-shield', 'the-isle-of-armor', 'the-crown-tundra']);
const POST_GEN8_VERSION_GROUPS = new Set([
  'legends-arceus',
  'scarlet-violet',
  'the-teal-mask',
  'the-indigo-disk',
]);

const EVOLUTION_ITEM_ES: Record<string, string> = {
  'fire-stone': 'Piedra Fuego',
  'water-stone': 'Piedra Agua',
  'thunder-stone': 'Piedra Trueno',
  'leaf-stone': 'Piedra Hoja',
  'moon-stone': 'Piedra Lunar',
  'sun-stone': 'Piedra Solar',
  'shiny-stone': 'Piedra Día',
  'dusk-stone': 'Piedra Noche',
  'dawn-stone': 'Piedra Alba',
  'ice-stone': 'Piedra Hielo',
  'oval-stone': 'Piedra Oval',
  'tart-apple': 'Manzana Ácida',
  'sweet-apple': 'Manzana Dulce',
  'cracked-pot': 'Tetera Agrietada',
  'chipped-pot': 'Tetera Rota',
  'galarica-cuff': 'Brazal Galanuez',
  'galarica-wreath': 'Corona Galanuez',
  'metal-coat': 'Revestimiento Metálico',
  'kings-rock': 'Roca del Rey',
  'dragon-scale': 'Escama Dragón',
  protector: 'Protector',
  electirizer: 'Electrizador',
  magmarizer: 'Magmatizador',
  'reaper-cloth': 'Tela Terrible',
  upgrade: 'Mejora',
  'dubious-disc': 'Disco Extraño',
  'razor-claw': 'Garra Afilada',
  'razor-fang': 'Colmillo Agudo',
  'prism-scale': 'Escama Bella',
  sachet: 'Saquito Fragante',
  'whipped-dream': 'Dulce de Nata',
  'strawberry-sweet': 'Confite Fresa',
  'berry-sweet': 'Confite Fruto',
  'love-sweet': 'Confite Corazón',
  'star-sweet': 'Confite Estrella',
  'clover-sweet': 'Confite Trébol',
  'flower-sweet': 'Confite Flor',
  'ribbon-sweet': 'Confite Lazo',
  'scroll-of-darkness': 'Pergamino Oscuro',
  'scroll-of-waters': 'Pergamino Acuático',
};

interface EvolutionDetailLike {
  trigger?: { name: string } | null;
  item?: { name: string } | null;
  held_item?: { name: string } | null;
  known_move?: { name: string } | null;
  known_move_type?: { name: string } | null;
  location?: { name: string } | null;
  gender?: number | null;
  min_level?: number | null;
  min_happiness?: number | null;
  min_beauty?: number | null;
  min_affection?: number | null;
  needs_overworld_rain?: boolean;
  party_species?: { name: string } | null;
  party_type?: { name: string } | null;
  relative_physical_stats?: number | null;
  time_of_day?: string;
  trade_species?: { name: string } | null;
  turn_upside_down?: boolean;
  version_group?: { name: string } | null;
  is_default?: boolean;
  base_form?: { name: string; url: string } | null;
  evolved_form?: { name: string; url: string } | null;
}

interface ChainLinkLike {
  species: { name: string; url: string };
  evolution_details: EvolutionDetailLike[];
  evolves_to: ChainLinkLike[];
}

function resourceIdFromUrl(url?: string): number | null {
  if (!url) return null;
  const match = url.match(/\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

function formRegion(slug?: string | null): 'galar' | 'alola' | 'hisui' | 'paldea' | null {
  if (!slug) return null;
  if (slug.includes('galar')) return 'galar';
  if (slug.includes('alola')) return 'alola';
  if (slug.includes('hisui')) return 'hisui';
  if (slug.includes('paldea')) return 'paldea';
  return null;
}

function evolutionItemLabel(slug: string): string {
  if (EVOLUTION_ITEM_ES[slug]) return EVOLUTION_ITEM_ES[slug];
  const english = slugToEnglishMoveName(slug);
  const local = getItemInfo(english);
  if (local.name && local.name !== 'Ninguno') return local.name;
  return english;
}

function formatEvolutionRequirement(detail: EvolutionDetailLike): { text: string; itemSlug?: string } {
  const parts: string[] = [];
  const trigger = detail.trigger?.name || '';
  const itemSlug = detail.item?.name || undefined;
  const heldSlug = detail.held_item?.name || undefined;

  if (detail.min_level) parts.push(`Nivel ${detail.min_level}`);

  if (trigger === 'trade') {
    if (heldSlug) parts.push(`Intercambio con ${evolutionItemLabel(heldSlug)} equipado`);
    else if (detail.trade_species?.name) parts.push(`Intercambio por ${titleCaseSlug(detail.trade_species.name)}`);
    else parts.push('Intercambio');
  } else if (trigger === 'use-item' && itemSlug) {
    parts.push(`Usar ${evolutionItemLabel(itemSlug)}`);
  } else if (trigger === 'shed') {
    parts.push('Hueco libre en el equipo y una Poké Ball al evolucionar a Ninjask');
  } else if (trigger === 'three-critical-hits') {
    parts.push('Asestar 3 golpes críticos en un mismo combate');
  } else if (trigger === 'take-damage') {
    parts.push('Recibir al menos 49 PS de daño sin debilitarte y pasar bajo el Arco de la Llanura');
  } else if (trigger === 'tower-of-darkness') {
    parts.push('Torre de las Tinieblas (Pergamino Oscuro)');
  } else if (trigger === 'tower-of-waters') {
    parts.push('Torre de las Aguas (Pergamino Acuático)');
  } else if (trigger === 'spin') {
    parts.push('Girar en el sitio con un Confite equipado');
  }

  if (detail.gender === 1) parts.push('Solo hembras');
  if (detail.gender === 2) parts.push('Solo machos');
  if (heldSlug && trigger !== 'trade') parts.push(`Con ${evolutionItemLabel(heldSlug)} equipado`);
  if (detail.known_move?.name) {
    const moveEn = slugToEnglishMoveName(detail.known_move.name);
    const moveInfo = getMoveInfo(moveEn);
    parts.push(`Conociendo ${moveInfo.spanishName || moveEn}`);
  }
  if (detail.known_move_type?.name) {
    parts.push(`Conociendo un movimiento de tipo ${TYPE_TRANSLATIONS[detail.known_move_type.name] || detail.known_move_type.name}`);
  }
  if (detail.min_happiness) parts.push('Amistad alta');
  if (detail.min_affection) parts.push('Cariño alto');
  if (detail.min_beauty) parts.push('Belleza máxima');
  if (detail.time_of_day === 'day') parts.push('De día');
  if (detail.time_of_day === 'night') parts.push('De noche');
  if (detail.time_of_day === 'dusk') parts.push('Al atardecer');
  if (detail.needs_overworld_rain) parts.push('Con lluvia en el mapa');
  if (detail.turn_upside_down) parts.push('Consola invertida');
  if (detail.relative_physical_stats === 1) parts.push('Ataque > Defensa');
  if (detail.relative_physical_stats === 0) parts.push('Ataque = Defensa');
  if (detail.relative_physical_stats === -1) parts.push('Ataque < Defensa');
  if (detail.party_species?.name) parts.push(`Con ${titleCaseSlug(detail.party_species.name)} en el equipo`);
  if (detail.party_type?.name) {
    parts.push(`Con un Pokémon de tipo ${TYPE_TRANSLATIONS[detail.party_type.name] || detail.party_type.name} en el equipo`);
  }
  if (detail.location?.name) parts.push(`En ${titleCaseSlug(detail.location.name)}`);

  if (trigger === 'level-up' && !detail.min_level) {
    parts.unshift('Subir de nivel');
  }

  const unique = parts.filter((part, index) => parts.indexOf(part) === index);
  return {
    text: unique.length ? unique.join(' · ') : 'Condición especial de 8.ª generación',
    itemSlug: itemSlug || heldSlug,
  };
}

function matchesCurrentForm(_details: EvolutionDetailLike[], currentSlug: string, detail: EvolutionDetailLike): boolean {
  const currentRegion = formRegion(currentSlug);
  const baseRegion = formRegion(detail.base_form?.name);
  const evoRegion = formRegion(detail.evolved_form?.name);

  if (currentRegion) {
    if (baseRegion || evoRegion) {
      return baseRegion === currentRegion || evoRegion === currentRegion;
    }
    return false;
  }

  return !baseRegion && !evoRegion;
}

function pickGen8EvolutionDetails(details: EvolutionDetailLike[], currentSlug: string): EvolutionDetailLike[] {
  const formMatched = details.filter((d) => matchesCurrentForm(details, currentSlug, d));
  const currentRegion = formRegion(currentSlug);
  if (!formMatched.length) {
    if (currentRegion) return [];
    const allRegional = details.every(
      (d) => formRegion(d.base_form?.name) || formRegion(d.evolved_form?.name)
    );
    if (allRegional) return [];
  }
  const pool = formMatched.length ? formMatched : details;
  const allowed = pool.filter((d) => {
    const group = d.version_group?.name;
    if (group && POST_GEN8_VERSION_GROUPS.has(group)) return false;
    return true;
  });

  const gen8 = allowed.filter((d) => d.version_group?.name && GEN8_VERSION_GROUPS.has(d.version_group.name));
  const chosen = gen8.length ? gen8 : allowed.filter((d) => d.is_default !== false);
  const finalDetails = chosen.length ? chosen : allowed;

  const seen = new Set<string>();
  return finalDetails.filter((d) => {
    const key = [
      d.trigger?.name,
      d.item?.name,
      d.held_item?.name,
      d.min_level,
      d.min_happiness,
      d.known_move?.name,
      d.known_move_type?.name,
      d.time_of_day,
      d.gender,
    ].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function evolutionArtworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

function evolutionSpriteUrl(detail: EvolutionDetailLike, speciesUrl: string): string {
  const id =
    resourceIdFromUrl(detail.evolved_form?.url) ||
    resourceIdFromUrl(speciesUrl) ||
    0;
  return evolutionArtworkUrl(id);
}

function previousEvolutionSpriteUrl(detail: EvolutionDetailLike, speciesUrl: string): string {
  const id =
    resourceIdFromUrl(detail.base_form?.url) ||
    resourceIdFromUrl(speciesUrl) ||
    0;
  return evolutionArtworkUrl(id);
}

function findChainNode(node: ChainLinkLike, speciesName: string): ChainLinkLike | null {
  if (node.species.name === speciesName) return node;
  for (const child of node.evolves_to || []) {
    const found = findChainNode(child, speciesName);
    if (found) return found;
  }
  return null;
}

function findParentNode(
  node: ChainLinkLike,
  speciesName: string
): { parent: ChainLinkLike; child: ChainLinkLike } | null {
  for (const child of node.evolves_to || []) {
    if (child.species.name === speciesName) return { parent: node, child };
    const nested = findParentNode(child, speciesName);
    if (nested) return nested;
  }
  return null;
}

function formatEvolutionEntry(details: EvolutionDetailLike[]): { requirement: string; itemSlug?: string } {
  const formatted = details.map((d) => formatEvolutionRequirement(d));
  return {
    requirement: formatted.map((f) => f.text).filter((text, i, all) => all.indexOf(text) === i).join('  · o ·  '),
    itemSlug: formatted.find((f) => f.itemSlug)?.itemSlug,
  };
}

async function getPokemonEvolutionLine(
  speciesName: string,
  pokemonSlug: string
): Promise<{ previous: PokemonEvolution[]; next: PokemonEvolution[] }> {
  const empty = { previous: [] as PokemonEvolution[], next: [] as PokemonEvolution[] };
  try {
    const species = await pokemonClient.getPokemonSpeciesByName(speciesName);
    const chainId = resourceIdFromUrl(species.evolution_chain?.url);
    if (!chainId) return empty;

    const chain = await evolutionClient.getEvolutionChainById(chainId);
    const root = chain.chain as ChainLinkLike;
    const start = findChainNode(root, speciesName);
    if (!start) return empty;

    const dex = await fetchSwordShieldPokedex().catch(() => [] as DexPokemonEntry[]);
    const dexSlugs = new Set(dex.map((entry) => entry.slug));
    const inSwsh = (slug: string, speciesSlug: string) => {
      if (!dexSlugs.size) return true;
      return dexSlugs.has(slug) || dexSlugs.has(speciesSlug);
    };

    const previous: PokemonEvolution[] = [];
    let childSpecies = speciesName;
    let childSlug = pokemonSlug;

    while (true) {
      const found = findParentNode(root, childSpecies);
      if (!found) break;

      let details = pickGen8EvolutionDetails(found.child.evolution_details || [], childSlug);
      if (!details.length) {
        details = pickGen8EvolutionDetails(found.child.evolution_details || [], found.parent.species.name);
      }
      if (!details.length) break;

      const parentSlug = details[0].base_form?.name || found.parent.species.name;
      if (!inSwsh(parentSlug, found.parent.species.name)) break;

      const { requirement, itemSlug } = formatEvolutionEntry(details);
      const displayName = titleCaseSlug(parentSlug);

      previous.push({
        slug: parentSlug,
        name: displayName,
        sprite: previousEvolutionSpriteUrl(details[0], found.parent.species.url),
        fromName: titleCaseSlug(childSlug),
        stage: previous.length + 1,
        requirement,
        itemSlug,
      });

      childSpecies = found.parent.species.name;
      childSlug = parentSlug;
    }

    previous.reverse();

    const next: PokemonEvolution[] = [];

    const walk = (node: ChainLinkLike, currentSlug: string, fromDisplay: string, stage: number) => {
      for (const nextNode of node.evolves_to || []) {
        const details = pickGen8EvolutionDetails(nextNode.evolution_details || [], currentSlug);
        if (!details.length) continue;

        const targetSlug = details[0].evolved_form?.name || nextNode.species.name;
        if (!inSwsh(targetSlug, nextNode.species.name)) continue;

        const { requirement, itemSlug } = formatEvolutionEntry(details);
        const displayName = titleCaseSlug(targetSlug);

        next.push({
          slug: targetSlug,
          name: displayName,
          sprite: evolutionSpriteUrl(details[0], nextNode.species.url),
          fromName: fromDisplay,
          stage,
          requirement,
          itemSlug,
        });

        walk(nextNode, targetSlug, displayName, stage + 1);
      }
    };

    walk(start, pokemonSlug, titleCaseSlug(pokemonSlug), 1);
    return { previous, next };
  } catch {
    return empty;
  }
}

// ==========================================
// 1. FETCH MOVE DETAILS
// ==========================================
export async function getMoveDetails(moveNameOrSlug: string): Promise<MoveDetail> {
  const normalized = toPokeApiSlug(moveNameOrSlug);

  // Local fallback info in case of failure or ROM-hack move
  const localInfo = getMoveInfo(moveNameOrSlug);

  try {
    const move = await moveClient.getMoveByName(normalized);

    const esName = move.names?.find((n) => n.language.name === 'es')?.name || localInfo.spanishName || move.name;
    const enName = move.names?.find((n) => n.language.name === 'en')?.name || localInfo.originalName || move.name;

    // Extract flavor text in Spanish, then English
    const esFlavor = move.flavor_text_entries
      ?.slice()
      .reverse()
      .find((f) => f.language.name === 'es')?.flavor_text;
    const enFlavor = move.flavor_text_entries
      ?.slice()
      .reverse()
      .find((f) => f.language.name === 'en')?.flavor_text;

    const rawDesc = esFlavor || enFlavor || 'Sin descripción disponible.';
    const cleanDesc = rawDesc.replace(/[\n\f\r]+/g, ' ').trim();

    // Effect entries
    const effectEntry = move.effect_entries?.find((e) => e.language.name === 'es' || e.language.name === 'en');
    let effectText = effectEntry?.effect || effectEntry?.short_effect || cleanDesc;
    if (move.effect_chance) {
      effectText = effectText.replace(/\$effect_chance%?/g, `${move.effect_chance}%`);
    }
    effectText = effectText.replace(/[\n\f\r]+/g, ' ').trim();

    const typeSlug = move.type?.name || 'normal';
    const typeEs = TYPE_TRANSLATIONS[typeSlug] || localInfo.type || 'Normal';

    const damageClass = (move.damage_class?.name as 'physical' | 'special' | 'status') || 'physical';
    const damageClassEs =
      damageClass === 'physical' ? 'Físico' : damageClass === 'special' ? 'Especial' : 'Estado';

    const result: MoveDetail = {
      id: move.id,
      slug: normalized,
      name: esName,
      originalName: enName,
      power: move.power ?? null,
      accuracy: move.accuracy ?? null,
      pp: move.pp ?? 10,
      priority: move.priority ?? 0,
      type: typeEs,
      typeSlug,
      damageClass,
      damageClassEs,
      description: cleanDesc,
      effect: effectText,
      target: move.target?.name || 'selected-pokemon',
    };

    return result;
  } catch (err) {
    // If PokéAPI call fails, return reliable local fallback
    const result: MoveDetail = {
      id: 0,
      slug: normalized,
      name: localInfo.spanishName,
      originalName: localInfo.originalName,
      power: null,
      accuracy: null,
      pp: 15,
      priority: 0,
      type: localInfo.type,
      typeSlug: localInfo.type.toLowerCase(),
      damageClass: 'physical',
      damageClassEs: 'Físico',
      description: `Movimiento de tipo ${localInfo.type}.`,
      effect: `Movimiento de combate utilizado en Pokémon Blessed Shield.`,
      target: 'selected-pokemon',
    };
    return result;
  }
}

// ==========================================
// 2. FETCH ABILITY DETAILS
// ==========================================
export async function getAbilityDetails(abilityNameOrSlug: string): Promise<AbilityDetail> {
  const normalized = toPokeApiSlug(abilityNameOrSlug);

  const localSpanish = translateAbility(slugToEnglishMoveName(normalized));

  try {
    const ability = await pokemonClient.getAbilityByName(normalized);

    const esName = ability.names?.find((n) => n.language.name === 'es')?.name || localSpanish || ability.name;
    const enName = ability.names?.find((n) => n.language.name === 'en')?.name || ability.name;

    const esFlavor = ability.flavor_text_entries
      ?.slice()
      .reverse()
      .find((f) => f.language.name === 'es')?.flavor_text;
    const enFlavor = ability.flavor_text_entries
      ?.slice()
      .reverse()
      .find((f) => f.language.name === 'en')?.flavor_text;

    const rawDesc = esFlavor || enFlavor || 'Sin descripción disponible.';
    const cleanDesc = rawDesc.replace(/[\n\f\r]+/g, ' ').trim();

    const effectEntry = ability.effect_entries?.find((e) => e.language.name === 'es' || e.language.name === 'en');
    const effectText = (effectEntry?.effect || effectEntry?.short_effect || cleanDesc)
      .replace(/[\n\f\r]+/g, ' ')
      .trim();

    const result: AbilityDetail = {
      id: ability.id,
      slug: normalized,
      name: esName,
      originalName: enName,
      description: cleanDesc,
      effect: effectText,
    };

    return result;
  } catch (err) {
    const result: AbilityDetail = {
      id: 0,
      slug: normalized,
      name: localSpanish,
      originalName: abilityNameOrSlug,
      description: `Habilidad pasiva en combate.`,
      effect: `Habilidad activada por el Pokémon durante el enfrentamiento.`,
    };
    return result;
  }
}

// ==========================================
// 3. FETCH ITEM DETAILS
// ==========================================
export async function getItemDetails(itemNameOrSlug: string): Promise<ItemDetail> {
  const normalized = toPokeApiSlug(itemNameOrSlug);

  const localInfo = getItemInfo(itemNameOrSlug);

  try {
    const item = await itemClient.getItemByName(normalized);

    const esName = item.names?.find((n) => n.language.name === 'es')?.name || localInfo.name || item.name;
    const enName = item.names?.find((n) => n.language.name === 'en')?.name || localInfo.original || item.name;

    const esFlavor = item.flavor_text_entries
      ?.slice()
      .reverse()
      .find((f) => f.language.name === 'es')?.text;
    const enFlavor = item.flavor_text_entries
      ?.slice()
      .reverse()
      .find((f) => f.language.name === 'en')?.text;

    const rawDesc = esFlavor || enFlavor || '';
    const cleanDesc = rawDesc.replace(/[\n\f\r]+/g, ' ').trim();

    const effectEntry = item.effect_entries?.find((e) => e.language.name === 'es' || e.language.name === 'en');
    const effectText = (effectEntry?.effect || effectEntry?.short_effect || cleanDesc || 'Efecto al llevarlo equipado.')
      .replace(/[\n\f\r]+/g, ' ')
      .trim();

    const sprite =
      item.sprites?.default ||
      localInfo.spriteUrl ||
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${normalized}.png`;

    const result: ItemDetail = {
      id: item.id,
      slug: normalized,
      name: esName,
      originalName: enName,
      sprite,
      category: item.category?.name || 'Objeto equipado',
      description: cleanDesc || effectText,
      effect: effectText,
    };

    return result;
  } catch (err) {
    const sprite =
      localInfo.spriteUrl ||
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${normalized}.png`;

    const result: ItemDetail = {
      id: 0,
      slug: normalized,
      name: localInfo.name,
      originalName: localInfo.original,
      sprite,
      category: 'Objeto equipado',
      description: `Objeto equipado durante el combate.`,
      effect: `Otorga efectos pasivos o activación bajo ciertas condiciones en combate.`,
    };
    return result;
  }
}

// ==========================================
// 4. FETCH POKEMON DETAILS
// ==========================================
export async function getPokemonDetails(pokemonNameOrSlug: string): Promise<PokemonDetail> {
  const parsed = parsePokemonName(pokemonNameOrSlug);
  const baseSlug = toPokeApiSlug(parsed.apiName || pokemonNameOrSlug);
  const normalized = getPokemonApiSlug(pokemonNameOrSlug);

  try {
    let pokemon;
    try {
      pokemon = await pokemonClient.getPokemonByName(normalized);
    } catch {
      const fallbacks = [toPokeApiSlug(parsed.apiName), toPokeApiSlug(parsed.cleanName), baseSlug]
        .map((slug) => POKEMON_SLUG_OVERRIDES[slug] || slug)
        .filter((slug, index, all) => slug && slug !== normalized && all.indexOf(slug) === index);

      let found = null;
      for (const slug of fallbacks) {
        try {
          found = await pokemonClient.getPokemonByName(slug);
          break;
        } catch {
          // Try next candidate
        }
      }
      if (!found) throw new Error('Not found');
      pokemon = found;
    }

    const types = pokemon.types.map((t) => {
      const typeSlug = t.type.name;
      return {
        name: typeSlug,
        slug: typeSlug,
        es: TYPE_TRANSLATIONS[typeSlug] || typeSlug,
      };
    });

    const abilities = await Promise.all(
      pokemon.abilities.map(async (a) => {
        const abilitySlug = a.ability.name;
        return {
          name: abilitySlug,
          slug: abilitySlug,
          nameEs: await resolveAbilityNameEs(abilitySlug),
          isHidden: a.is_hidden,
        };
      })
    );

    let bst = 0;
    const stats: PokemonStat[] = pokemon.stats.map((s) => {
      const base = s.base_stat;
      bst += base;
      return {
        name: s.stat.name,
        nameEs: STAT_TRANSLATIONS[s.stat.name] || s.stat.name,
        base,
        percent: Math.min(100, Math.round((base / 200) * 100)),
      };
    });

    const artwork =
      pokemon.sprites?.other?.['official-artwork']?.front_default ||
      pokemon.sprites?.front_default ||
      `https://play.pokemonshowdown.com/sprites/gen5/${baseSlug}.png`;

    const showdown =
      pokemon.sprites?.other?.showdown?.front_default ||
      `https://play.pokemonshowdown.com/sprites/ani/${baseSlug}.gif`;

    const shinyArtwork =
      pokemon.sprites?.other?.['official-artwork']?.front_shiny ||
      pokemon.sprites?.front_shiny ||
      artwork;

    const learnset: PokemonLearnMove[] = [];
    const seenLearnKeys = new Set<string>();

    for (const entry of pokemon.moves || []) {
      const moveSlug = entry.move?.name;
      if (!moveSlug) continue;

      const details = entry.version_group_details || [];
      let selected = [] as typeof details;
      for (const group of PREFERRED_VERSION_GROUPS) {
        const match = details.filter((d) => d.version_group?.name === group);
        if (match.length) {
          selected = match;
          break;
        }
      }
      if (!selected.length) {
        selected = details;
      }

      for (const detail of selected) {
        const method = toLearnMethod(detail.move_learn_method?.name || 'other');
        const key = `${moveSlug}:${method}:${detail.level_learned_at ?? 0}`;
        if (seenLearnKeys.has(key)) continue;
        seenLearnKeys.add(key);

        const englishName = slugToEnglishMoveName(moveSlug);
        const localInfo = getMoveInfo(englishName);

        learnset.push({
          slug: moveSlug,
          name: localInfo.originalName || englishName,
          nameEs: localInfo.spanishName || englishName,
          type: localInfo.type || 'Normal',
          level: detail.level_learned_at ?? 0,
          method,
          methodEs: LEARN_METHOD_ES[method],
        });
      }
    }

    learnset.sort((a, b) => {
      const methodOrder: LearnMethod[] = ['level-up', 'machine', 'egg', 'tutor', 'other'];
      const methodDiff = methodOrder.indexOf(a.method) - methodOrder.indexOf(b.method);
      if (methodDiff !== 0) return methodDiff;
      if (a.method === 'level-up') return a.level - b.level || a.nameEs.localeCompare(b.nameEs, 'es');
      return a.nameEs.localeCompare(b.nameEs, 'es');
    });

    const { previous: preEvolutions, next: evolutions } = await getPokemonEvolutionLine(
      pokemon.species?.name || pokemon.name,
      pokemon.name
    );

    const result: PokemonDetail = {
      id: pokemon.id,
      slug: normalized,
      name: pokemon.name,
      displayName: pokemonNameOrSlug,
      types,
      sprites: {
        artwork,
        showdown,
        icon: pokemon.sprites?.front_default || artwork,
        shinyArtwork,
      },
      heightMeters: pokemon.height / 10,
      weightKg: pokemon.weight / 10,
      abilities,
      stats,
      bst,
      learnset,
      preEvolutions,
      evolutions,
    };

    return result;
  } catch (err) {
    // Basic fallback
    const result: PokemonDetail = {
      id: 0,
      slug: normalized,
      name: pokemonNameOrSlug,
      displayName: pokemonNameOrSlug,
      types: [{ name: 'normal', slug: 'normal', es: 'Normal' }],
      sprites: {
        artwork: `https://play.pokemonshowdown.com/sprites/gen5/${baseSlug}.png`,
        showdown: `https://play.pokemonshowdown.com/sprites/ani/${baseSlug}.gif`,
        icon: `https://play.pokemonshowdown.com/sprites/gen5/${baseSlug}.png`,
        shinyArtwork: `https://play.pokemonshowdown.com/sprites/gen5/${baseSlug}.png`,
      },
      heightMeters: 1.0,
      weightKg: 20.0,
      abilities: [],
      stats: [],
      bst: 0,
      learnset: [],
      preEvolutions: [],
      evolutions: [],
    };
    return result;
  }
}

// ==========================================
// COMMAND PALETTE / GLOBAL API SEARCH
// ==========================================

export type PokeSearchKind = 'pokemon' | 'move' | 'ability' | 'item';

export interface PokeSearchHit {
  kind: PokeSearchKind;
  slug: string;
  name: string;
  nameEs: string;
  score: number;
  sprite?: string;
  spriteFallbacks?: string[];
}

interface PokeSearchIndexEntry {
  kind: PokeSearchKind;
  slug: string;
  name: string;
  nameEs: string;
  haystack: string;
  sprite?: string;
  spriteFallbacks?: string[];
}

const KIND_PRIORITY: Record<PokeSearchKind, number> = {
  pokemon: 0,
  move: 1,
  ability: 2,
  item: 3,
};

let searchIndexPromise: Promise<PokeSearchIndexEntry[]> | null = null;
let searchIndex: PokeSearchIndexEntry[] | null = null;

function englishFromSlug(slug: string): string {
  return titleCaseSlug(slug);
}

function uniqueUrls(...urls: Array<string | undefined | null>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const url of urls) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push(url);
  }
  return out;
}

function pokeApiPokemonSprite(id: number, variant: 'default' | 'home' | 'artwork' = 'default'): string {
  if (variant === 'home') {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;
  }
  if (variant === 'artwork') {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

function pokemonSpriteChain(url: string, slug: string, name: string): { sprite?: string; spriteFallbacks?: string[] } {
  const id = resourceIdFromUrl(url);
  const showdown = getPokemonSprite(name || slug).sprite;
  const baseShowdown = getPokemonSprite(slug.split('-')[0] || name).sprite;
  const chain = uniqueUrls(
    id ? pokeApiPokemonSprite(id, 'artwork') : undefined,
    id ? pokeApiPokemonSprite(id, 'home') : undefined,
    id ? pokeApiPokemonSprite(id) : undefined,
    showdown,
    baseShowdown
  );
  return { sprite: chain[0], spriteFallbacks: chain.slice(1) };
}

function itemSpriteChain(slug: string): { sprite?: string; spriteFallbacks?: string[] } {
  const chain = uniqueUrls(
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${slug}.png`,
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/icons/${slug}.png`
  );
  return { sprite: chain[0], spriteFallbacks: chain.slice(1) };
}

function toIndexEntry(
  kind: PokeSearchKind,
  slug: string,
  name: string,
  nameEs: string,
  sprite?: string,
  spriteFallbacks?: string[]
): PokeSearchIndexEntry {
  return {
    kind,
    slug,
    name,
    nameEs,
    haystack: foldForSearch(`${name} ${nameEs} ${slug}`),
    sprite,
    spriteFallbacks,
  };
}

async function loadPokeSearchIndex(): Promise<PokeSearchIndexEntry[]> {
  const [pokemonPage, movePage, abilityPage, itemPage] = await Promise.all([
    pokemonClient.listPokemons(0, 2000),
    moveClient.listMoves(0, 1000),
    pokemonClient.listAbilities(0, 500),
    itemClient.listItems(0, 2200),
  ]);

  const entries: PokeSearchIndexEntry[] = [];

  for (const resource of pokemonPage.results) {
    const name = englishFromSlug(resource.name);
    const sprites = pokemonSpriteChain(resource.url, resource.name, name);
    entries.push(
      toIndexEntry('pokemon', resource.name, name, name, sprites.sprite, sprites.spriteFallbacks)
    );
  }

  for (const resource of movePage.results) {
    const name = englishFromSlug(resource.name);
    const nameEs = getMoveInfo(name).spanishName;
    entries.push(toIndexEntry('move', resource.name, name, nameEs));
  }

  for (const resource of abilityPage.results) {
    const name = englishFromSlug(resource.name);
    const nameEs = translateAbility(name);
    entries.push(toIndexEntry('ability', resource.name, name, nameEs));
  }

  for (const resource of itemPage.results) {
    const name = englishFromSlug(resource.name);
    const nameEs = getItemInfo(name).name;
    const sprites = itemSpriteChain(resource.name);
    entries.push(
      toIndexEntry('item', resource.name, name, nameEs, sprites.sprite, sprites.spriteFallbacks)
    );
  }

  return entries;
}

/** Prefetch and cache the PokéAPI name catalogs used by the command palette. */
export function ensurePokeSearchIndex(): Promise<void> {
  if (searchIndex) return Promise.resolve();
  if (!searchIndexPromise) {
    searchIndexPromise = loadPokeSearchIndex()
      .then((entries) => {
        searchIndex = entries;
        return entries;
      })
      .catch((err) => {
        searchIndexPromise = null;
        throw err;
      });
  }
  return searchIndexPromise.then(() => undefined);
}

/** Case-fold and strip diacritics so "puas" matches "Púas". */
function foldForSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function scoreHit(query: string, entry: PokeSearchIndexEntry): number {
  const q = foldForSearch(query);
  const name = foldForSearch(entry.name);
  const nameEs = foldForSearch(entry.nameEs);
  const slug = foldForSearch(entry.slug);
  const haystack = foldForSearch(entry.haystack);

  if (name === q || nameEs === q || slug === q) return 100;
  if (name.startsWith(q) || nameEs.startsWith(q) || slug.startsWith(q)) return 80;
  if (name.includes(q) || nameEs.includes(q) || slug.includes(q) || haystack.includes(q)) {
    return 50;
  }
  return 0;
}

export interface PokeSearchQuery {
  text: string;
  kind: PokeSearchKind | 'all';
}

/** Parse VS Code-style prefixes: @pokemon, #move, $ability, !item. */
export function parsePokeSearchQuery(raw: string): PokeSearchQuery {
  const trimmed = raw.trim();
  if (trimmed.startsWith('@')) return { kind: 'pokemon', text: trimmed.slice(1).trim() };
  if (trimmed.startsWith('#')) return { kind: 'move', text: trimmed.slice(1).trim() };
  if (trimmed.startsWith('$')) return { kind: 'ability', text: trimmed.slice(1).trim() };
  if (trimmed.startsWith('!')) return { kind: 'item', text: trimmed.slice(1).trim() };
  return { kind: 'all', text: trimmed };
}

export function searchPokeApiIndex(
  rawQuery: string,
  kindFilter: PokeSearchKind | 'all' = 'all',
  limit = 40
): PokeSearchHit[] {
  if (!searchIndex) return [];
  const parsed = parsePokeSearchQuery(rawQuery);
  const kind = parsed.kind !== 'all' ? parsed.kind : kindFilter;
  const query = parsed.text;
  if (!query) return [];

  const hits: PokeSearchHit[] = [];
  for (const entry of searchIndex) {
    if (kind !== 'all' && entry.kind !== kind) continue;
    const score = scoreHit(query, entry);
    if (score <= 0) continue;
    hits.push({
      kind: entry.kind,
      slug: entry.slug,
      name: entry.name,
      nameEs: entry.nameEs,
      score,
      sprite: entry.sprite,
      spriteFallbacks: entry.spriteFallbacks,
    });
  }

  hits.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const kindDelta = KIND_PRIORITY[a.kind] - KIND_PRIORITY[b.kind];
    if (kindDelta !== 0) return kindDelta;
    return a.name.localeCompare(b.name, 'en');
  });

  return hits.slice(0, limit);
}

/** Direct lookup when the local catalog has no matches (typos / exact slugs). */
export async function lookupPokeApiExact(rawQuery: string): Promise<PokeSearchHit[]> {
  const parsed = parsePokeSearchQuery(rawQuery);
  const slug = toPokeApiSlug(parsed.text);
  if (!slug || slug.length < 2) return [];

  const attempts: Array<{ kind: PokeSearchKind; run: () => Promise<PokeSearchHit> }> = [];

  if (parsed.kind === 'all' || parsed.kind === 'pokemon') {
    attempts.push({
      kind: 'pokemon',
      run: async () => {
        const pokemon = await pokemonClient.getPokemonByName(slug);
        const name = englishFromSlug(pokemon.name);
        const sprites = pokemonSpriteChain(
          `https://pokeapi.co/api/v2/pokemon/${pokemon.id}/`,
          pokemon.name,
          name
        );
        return {
          kind: 'pokemon',
          slug: pokemon.name,
          name,
          nameEs: name,
          score: 90,
          sprite: sprites.sprite,
          spriteFallbacks: sprites.spriteFallbacks,
        };
      },
    });
  }
  if (parsed.kind === 'all' || parsed.kind === 'move') {
    attempts.push({
      kind: 'move',
      run: async () => {
        const move = await moveClient.getMoveByName(slug);
        const name = englishFromSlug(move.name);
        return {
          kind: 'move',
          slug: move.name,
          name,
          nameEs: getMoveInfo(name).spanishName,
          score: 90,
        };
      },
    });
  }
  if (parsed.kind === 'all' || parsed.kind === 'ability') {
    attempts.push({
      kind: 'ability',
      run: async () => {
        const ability = await pokemonClient.getAbilityByName(slug);
        const name = englishFromSlug(ability.name);
        return {
          kind: 'ability',
          slug: ability.name,
          name,
          nameEs: translateAbility(name),
          score: 90,
        };
      },
    });
  }
  if (parsed.kind === 'all' || parsed.kind === 'item') {
    attempts.push({
      kind: 'item',
      run: async () => {
        const item = await itemClient.getItemByName(slug);
        const name = englishFromSlug(item.name);
        const sprites = itemSpriteChain(item.name);
        return {
          kind: 'item',
          slug: item.name,
          name,
          nameEs: getItemInfo(name).name,
          score: 90,
          sprite: sprites.sprite,
          spriteFallbacks: sprites.spriteFallbacks,
        };
      },
    });
  }

  const settled = await Promise.allSettled(attempts.map((attempt) => attempt.run()));
  return settled.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
}
