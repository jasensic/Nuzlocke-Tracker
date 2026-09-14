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
};

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

  const localSpanish = translateAbility(abilityNameOrSlug);

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
  const baseSlug = toPokeApiSlug(pokemonNameOrSlug);
  const normalized = POKEMON_SLUG_OVERRIDES[baseSlug] || baseSlug;

  try {
    let pokemon;
    try {
      pokemon = await pokemonClient.getPokemonByName(normalized);
    } catch {
      // Fallback: try base slug without regional suffix if standard failed
      if (normalized.includes('-')) {
        const root = normalized.split('-')[0];
        pokemon = await pokemonClient.getPokemonByName(root);
      } else {
        throw new Error('Not found');
      }
    }

    const types = pokemon.types.map((t) => {
      const typeSlug = t.type.name;
      return {
        name: typeSlug,
        slug: typeSlug,
        es: TYPE_TRANSLATIONS[typeSlug] || typeSlug,
      };
    });

    const abilities = pokemon.abilities.map((a) => {
      const abilitySlug = a.ability.name;
      return {
        name: a.ability.name,
        slug: abilitySlug,
        nameEs: translateAbility(abilitySlug),
        isHidden: a.is_hidden,
      };
    });

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
    };
    return result;
  }
}
