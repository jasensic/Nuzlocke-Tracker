import { RAW_CSV_DATA } from './rawEncounterData';
import { RouteData, RouteEncounter, EncounterMethod } from '../types';
import { parsePokemonName } from '../utils/pokemonMeta';
import { translateRouteName } from './routeTranslations';

const WEATHERS = [
  'All Weathers',
  'Normal Weather',
  'Overcast',
  'Raining',
  'Thunderstorm',
  'Intense Sun',
  'Snowing',
  'Snowstorm',
  'Sandstorm',
  'Heavy Fog',
];

export function parseAllRoutes(): RouteData[] {
  const lines = RAW_CSV_DATA.split('\n');
  const routes: RouteData[] = [];

  let currentRoute: RouteData | null = null;
  let currentWeather = 'All Weathers';
  let hiddenLevelRange = '';
  let visibleLevelRange = '';
  let activeMethod1: EncounterMethod = 'Hidden';
  let activeMethod2: EncounterMethod = 'Visible';

  const routeCategory = (spanishName: string, rawName: string): RouteData['category'] => {
    if (spanishName.startsWith('Ruta') || rawName.startsWith('Route')) return 'Ruta';
    if (
      spanishName.includes('Mina') ||
      spanishName.includes('Cueva') ||
      rawName.includes('Mine') ||
      rawName.includes('Cave')
    )
      return 'Cueva/Mina';
    if (
      spanishName.includes('Pueblo') ||
      spanishName.includes('Ciudad') ||
      rawName.includes('Town') ||
      rawName.includes('City')
    )
      return 'Ciudad/Pueblo';
    return 'Área Silvestre';
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // Remove trailing commas to inspect line content
    const cleanTokens = rawLine.split(',').map((t) => t.trim().replace(/^"|"$/g, ''));
    const firstNonEmpty = cleanTokens.find((t) => t.length > 0) || '';

    // Ignore intro headers / notes
    if (
      firstNonEmpty.startsWith('The percentage') ||
      firstNonEmpty.startsWith('Berry tree') ||
      firstNonEmpty.startsWith('A large amount') ||
      firstNonEmpty.startsWith('This document') ||
      firstNonEmpty.startsWith('Likewise if an')
    ) {
      continue;
    }

    // Check if this line defines a Weather
    const matchedWeather = WEATHERS.find((w) => firstNonEmpty.toLowerCase() === w.toLowerCase());
    if (matchedWeather) {
      currentWeather = matchedWeather;
      continue;
    }

    const col0 = cleanTokens[0] || '';
    const col1 = cleanTokens[1] || '';
    const col2 = cleanTokens[2] || '';
    const col3 = cleanTokens[3] || '';

    const col0Lower = col0.toLowerCase();
    const col2Lower = col2.toLowerCase();

    const isCol0Header =
      col0Lower.includes('hidden') ||
      col0Lower.includes('visible') ||
      col0Lower.includes('fishing') ||
      col0Lower.includes('surfing');

    const isCol2Header =
      col2Lower.includes('hidden') ||
      col2Lower.includes('visible') ||
      col2Lower.includes('fishing') ||
      col2Lower.includes('surfing');

    // Update active methods/levels if header columns are present
    const isCurrentSurfing =
      Boolean(currentRoute?.name.toLowerCase().includes('surf')) ||
      Boolean(currentRoute?.englishName?.toLowerCase().includes('surfing'));

    if (isCol0Header) {
      if (col0Lower.includes('fishing')) {
        activeMethod1 = 'Fishing';
      } else if (col0Lower.includes('surfing') || isCurrentSurfing) {
        activeMethod1 = 'Surfing';
      } else if (col0Lower.includes('visible')) {
        activeMethod1 = 'Visible';
      } else {
        activeMethod1 = 'Hidden';
      }

      const lvlMatch = col0.match(/Lv[l.]*\s*([0-9-]+)/i);
      if (lvlMatch) {
        hiddenLevelRange = `Nv. ${lvlMatch[1]}`;
      }
    }

    if (isCol2Header) {
      if (col2Lower.includes('fishing')) {
        activeMethod2 = 'Fishing';
      } else if (col2Lower.includes('surfing') || isCurrentSurfing) {
        activeMethod2 = 'Surfing';
      } else if (col2Lower.includes('hidden')) {
        activeMethod2 = 'Hidden';
      } else {
        activeMethod2 = 'Visible';
      }

      const lvlMatch = col2.match(/Lv[l.]*\s*([0-9-]+)/i);
      if (lvlMatch) {
        visibleLevelRange = `Nv. ${lvlMatch[1]}`;
      }
    }

    // Check if line is a Route title (has non-empty first col, no % chances, not a header)
    const token1IsChance = col1 && col1.includes('%');
    const token3IsChance = col3 && col3.includes('%');

    if (!token1IsChance && !token3IsChance && !isCol0Header && !isCol2Header && firstNonEmpty) {
      const rawEnglishName = firstNonEmpty;
      const spanishName = translateRouteName(rawEnglishName);

      const existing = routes.find(
        (r) =>
          r.name.toLowerCase() === spanishName.toLowerCase() ||
          r.englishName?.toLowerCase() === rawEnglishName.toLowerCase()
      );

      if (existing) {
        currentRoute = existing;
      } else {
        const newRoute: RouteData = {
          id: rawEnglishName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: spanishName,
          englishName: rawEnglishName,
          category: routeCategory(spanishName, rawEnglishName),
          minLevel: 999,
          maxLevel: 999,
          levelDisplay: 'Nv. ?',
          weathers: [],
          methods: [],
          encounters: [],
          uniquePokemon: [],
        };
        routes.push(newRoute);
        currentRoute = newRoute;
      }
      currentWeather = 'All Weathers';
      hiddenLevelRange = '';
      visibleLevelRange = '';
      const isSurfing =
        currentRoute.name.toLowerCase().includes('surf') ||
        (currentRoute.englishName?.toLowerCase().includes('surfing') ?? false);
      activeMethod1 = isSurfing ? 'Surfing' : 'Hidden';
      activeMethod2 = isSurfing ? 'Surfing' : 'Visible';
      continue;
    }

    if (!currentRoute) continue;

    // Pokemon 1 from col0 & col1 (if not a header)
    if (!isCol0Header && col0 && token1IsChance) {
      const poke1 = col0.replace(/^d$/, '').trim();
      const chance = parseFloat(col1.replace('%', '')) || 0;
      if (poke1 && chance > 0) {
        const { cleanName, formLabel } = parsePokemonName(poke1);
        const enc: RouteEncounter = {
          pokemon: poke1,
          cleanName,
          formLabel,
          chance,
          levelRange: hiddenLevelRange || undefined,
          method: activeMethod1,
          weather: currentWeather,
        };
        currentRoute.encounters.push(enc);
        if (!currentRoute.weathers.includes(currentWeather)) {
          currentRoute.weathers.push(currentWeather);
        }
        if (!currentRoute.methods.includes(activeMethod1)) {
          currentRoute.methods.push(activeMethod1);
        }
      }
    }

    // Pokemon 2 from col2 & col3 (if not a header)
    if (!isCol2Header && col2 && token3IsChance) {
      const poke2 = col2.trim();
      const chance = parseFloat(col3.replace('%', '')) || 0;
      if (poke2 && chance > 0) {
        const { cleanName, formLabel } = parsePokemonName(poke2);
        const enc: RouteEncounter = {
          pokemon: poke2,
          cleanName,
          formLabel,
          chance,
          levelRange: visibleLevelRange || undefined,
          method: activeMethod2,
          weather: currentWeather,
        };
        currentRoute.encounters.push(enc);
        if (!currentRoute.weathers.includes(currentWeather)) {
          currentRoute.weathers.push(currentWeather);
        }
        if (!currentRoute.methods.includes(activeMethod2)) {
          currentRoute.methods.push(activeMethod2);
        }
      }
    }
  }

  // Unify duplicate encounters of the same Pokemon in the same route & weather (merging levels, methods and chances)
  for (const r of routes) {
    const unifiedMap = new Map<string, RouteEncounter>();

    for (const enc of r.encounters) {
      const key = `${enc.pokemon}__${enc.weather}`;
      if (!unifiedMap.has(key)) {
        unifiedMap.set(key, {
          ...enc,
          methods: [enc.method],
        });
      } else {
        const existing = unifiedMap.get(key)!;
        existing.chance = Math.round((existing.chance + enc.chance) * 100) / 100;

        // Merge methods
        if (!existing.methods) {
          existing.methods = [existing.method];
        }
        if (!existing.methods.includes(enc.method)) {
          existing.methods.push(enc.method);
        }

        // Merge level ranges
        const levels: number[] = [];
        const existingMatches = existing.levelRange?.match(/\d+/g);
        if (existingMatches) {
          existingMatches.forEach((m) => levels.push(parseInt(m, 10)));
        }
        const encMatches = enc.levelRange?.match(/\d+/g);
        if (encMatches) {
          encMatches.forEach((m) => levels.push(parseInt(m, 10)));
        }

        if (levels.length > 0) {
          const minL = Math.min(...levels);
          const maxL = Math.max(...levels);
          existing.levelRange = minL === maxL ? `Nv. ${minL}` : `Nv. ${minL}-${maxL}`;
        }
      }
    }

    r.encounters = Array.from(unifiedMap.values());
  }

  // Ensure all Galar towns & cities with their special encounters, gifts & trades are present
  const GALAR_TOWNS_AND_CITIES: RouteData[] = [
    {
      id: 'town-of-postwick',
      name: 'Pueblo Yarda',
      englishName: 'Postwick',
      category: 'Ciudad/Pueblo',
      minLevel: 5,
      maxLevel: 5,
      levelDisplay: 'Nv. 5',
      weathers: ['All Weathers'],
      methods: ['Otro'],
      encounters: [
        { pokemon: 'Grookey', cleanName: 'Grookey', chance: 33.3, levelRange: 'Nv. 5', method: 'Otro', weather: 'All Weathers' },
        { pokemon: 'Scorbunny', cleanName: 'Scorbunny', chance: 33.3, levelRange: 'Nv. 5', method: 'Otro', weather: 'All Weathers' },
        { pokemon: 'Sobble', cleanName: 'Sobble', chance: 33.4, levelRange: 'Nv. 5', method: 'Otro', weather: 'All Weathers' },
      ],
      uniquePokemon: [],
    },
    {
      id: 'town-of-wedgehurst',
      name: 'Pueblo Par',
      englishName: 'Wedgehurst',
      category: 'Ciudad/Pueblo',
      minLevel: 10,
      maxLevel: 12,
      levelDisplay: 'Nv. 10-12',
      weathers: ['All Weathers'],
      methods: ['Otro', 'Visible'],
      encounters: [
        { pokemon: 'Slowpoke-1', cleanName: 'Slowpoke', formLabel: 'Galar', chance: 50, levelRange: 'Nv. 12', method: 'Otro', weather: 'All Weathers' },
        { pokemon: 'Rookidee', cleanName: 'Rookidee', chance: 25, levelRange: 'Nv. 10-12', method: 'Visible', weather: 'All Weathers' },
        { pokemon: 'Skwovet', cleanName: 'Skwovet', chance: 25, levelRange: 'Nv. 10-12', method: 'Visible', weather: 'All Weathers' },
      ],
      uniquePokemon: [],
    },
    {
      id: 'town-of-turffield',
      name: 'Pueblo Hoyuelo',
      englishName: 'Turffield',
      category: 'Ciudad/Pueblo',
      minLevel: 15,
      maxLevel: 18,
      levelDisplay: 'Nv. 15-18',
      weathers: ['All Weathers'],
      methods: ['Otro', 'Visible'],
      encounters: [
        { pokemon: 'Meowth', cleanName: 'Meowth', chance: 40, levelRange: 'Nv. 15', method: 'Otro', weather: 'All Weathers' },
        { pokemon: 'Gossifleur', cleanName: 'Gossifleur', chance: 30, levelRange: 'Nv. 15-18', method: 'Visible', weather: 'All Weathers' },
        { pokemon: 'Applin', cleanName: 'Applin', chance: 15, levelRange: 'Nv. 15-17', method: 'Otro', weather: 'All Weathers' },
        { pokemon: 'Woobat', cleanName: 'Woobat', chance: 15, levelRange: 'Nv. 16-18', method: 'Visible', weather: 'All Weathers' },
      ],
      uniquePokemon: [],
    },
    {
      id: 'town-of-stow-on-side',
      name: 'Pueblo Ladera',
      englishName: 'Stow-on-Side',
      category: 'Ciudad/Pueblo',
      minLevel: 30,
      maxLevel: 34,
      levelDisplay: 'Nv. 30-34',
      weathers: ['All Weathers'],
      methods: ['Otro', 'Visible'],
      encounters: [
        { pokemon: 'Toxel', cleanName: 'Toxel', chance: 40, levelRange: 'Nv. 30', method: 'Otro', weather: 'All Weathers' },
        { pokemon: 'Hatenna', cleanName: 'Hatenna', chance: 25, levelRange: 'Nv. 30', method: 'Otro', weather: 'All Weathers' },
        { pokemon: 'Maractus', cleanName: 'Maractus', chance: 20, levelRange: 'Nv. 30-32', method: 'Visible', weather: 'All Weathers' },
        { pokemon: 'Sinistea', cleanName: 'Sinistea', chance: 15, levelRange: 'Nv. 30-34', method: 'Visible', weather: 'All Weathers' },
      ],
      uniquePokemon: [],
    },
    {
      id: 'town-of-ballonlea',
      name: 'Pueblo Plié',
      englishName: 'Ballonlea',
      category: 'Ciudad/Pueblo',
      minLevel: 34,
      maxLevel: 36,
      levelDisplay: 'Nv. 34-36',
      weathers: ['All Weathers'],
      methods: ['Otro', 'Visible'],
      encounters: [
        { pokemon: 'Yamask-1', cleanName: 'Yamask', formLabel: 'Teselia', chance: 40, levelRange: 'Nv. 34', method: 'Otro', weather: 'All Weathers' },
        { pokemon: 'Morelull', cleanName: 'Morelull', chance: 20, levelRange: 'Nv. 34-36', method: 'Visible', weather: 'All Weathers' },
        { pokemon: 'Spritzee', cleanName: 'Spritzee', chance: 20, levelRange: 'Nv. 34-36', method: 'Visible', weather: 'All Weathers' },
        { pokemon: 'Swirlix', cleanName: 'Swirlix', chance: 20, levelRange: 'Nv. 34-36', method: 'Visible', weather: 'All Weathers' },
      ],
      uniquePokemon: [],
    },
    {
      id: 'city-of-hammerlocke',
      name: 'Ciudad Artejo',
      englishName: 'Hammerlocke',
      category: 'Ciudad/Pueblo',
      minLevel: 25,
      maxLevel: 32,
      levelDisplay: 'Nv. 25-32',
      weathers: ['All Weathers'],
      methods: ['Otro', 'Visible'],
      encounters: [
        { pokemon: 'Togepi', cleanName: 'Togepi', chance: 35, levelRange: 'Nv. 25', method: 'Otro', weather: 'All Weathers' },
        { pokemon: 'Applin', cleanName: 'Applin', chance: 25, levelRange: 'Nv. 25', method: 'Otro', weather: 'All Weathers' },
        { pokemon: 'Honedge', cleanName: 'Honedge', chance: 20, levelRange: 'Nv. 28-32', method: 'Visible', weather: 'All Weathers' },
        { pokemon: 'Duraludon', cleanName: 'Duraludon', chance: 20, levelRange: 'Nv. 30-32', method: 'Otro', weather: 'All Weathers' },
      ],
      uniquePokemon: [],
    },
    {
      id: 'town-of-circhester',
      name: 'Pueblo Auriga',
      englishName: 'Circhester',
      category: 'Ciudad/Pueblo',
      minLevel: 36,
      maxLevel: 39,
      levelDisplay: 'Nv. 36-39',
      weathers: ['All Weathers'],
      methods: ['Otro', 'Visible'],
      encounters: [
        { pokemon: 'Throh', cleanName: 'Throh', chance: 30, levelRange: 'Nv. 37', method: 'Otro', weather: 'All Weathers' },
        { pokemon: 'Sawk', cleanName: 'Sawk', chance: 30, levelRange: 'Nv. 37', method: 'Otro', weather: 'All Weathers' },
        { pokemon: 'Vanillite', cleanName: 'Vanillite', chance: 20, levelRange: 'Nv. 36-39', method: 'Visible', weather: 'All Weathers' },
        { pokemon: 'Snorunt', cleanName: 'Snorunt', chance: 20, levelRange: 'Nv. 36-39', method: 'Visible', weather: 'All Weathers' },
      ],
      uniquePokemon: [],
    },
    {
      id: 'town-of-spikemuth',
      name: 'Pueblo Crampón',
      englishName: 'Spikemuth',
      category: 'Ciudad/Pueblo',
      minLevel: 40,
      maxLevel: 45,
      levelDisplay: 'Nv. 40-45',
      weathers: ['All Weathers'],
      methods: ['Otro', 'Visible'],
      encounters: [
        { pokemon: 'Mr. Mime', cleanName: 'Mr. Mime', chance: 35, levelRange: 'Nv. 40', method: 'Otro', weather: 'All Weathers' },
        { pokemon: 'Toxtricity', cleanName: 'Toxtricity', chance: 25, levelRange: 'Nv. 42-45', method: 'Otro', weather: 'All Weathers' },
        { pokemon: 'Scrafty', cleanName: 'Scrafty', chance: 20, levelRange: 'Nv. 40-44', method: 'Visible', weather: 'All Weathers' },
        { pokemon: 'Morpeko', cleanName: 'Morpeko', chance: 20, levelRange: 'Nv. 40-44', method: 'Visible', weather: 'All Weathers' },
      ],
      uniquePokemon: [],
    },
    {
      id: 'city-of-wyndon',
      name: 'Ciudad Puntera',
      englishName: 'Wyndon',
      category: 'Ciudad/Pueblo',
      minLevel: 50,
      maxLevel: 55,
      levelDisplay: 'Nv. 50-55',
      weathers: ['All Weathers'],
      methods: ['Otro', 'Visible'],
      encounters: [
        { pokemon: 'Type: Null', cleanName: 'Type: Null', chance: 35, levelRange: 'Nv. 50', method: 'Otro', weather: 'All Weathers' },
        { pokemon: 'Rotom', cleanName: 'Rotom', chance: 25, levelRange: 'Nv. 50', method: 'Otro', weather: 'All Weathers' },
        { pokemon: 'Duraludon', cleanName: 'Duraludon', chance: 20, levelRange: 'Nv. 50-55', method: 'Visible', weather: 'All Weathers' },
        { pokemon: 'Eevee', cleanName: 'Eevee', chance: 20, levelRange: 'Nv. 50', method: 'Otro', weather: 'All Weathers' },
      ],
      uniquePokemon: [],
    },
  ];

  for (const town of GALAR_TOWNS_AND_CITIES) {
    const existing = routes.find(
      (r) =>
        r.id === town.id ||
        r.name.toLowerCase() === town.name.toLowerCase() ||
        r.englishName?.toLowerCase() === town.englishName?.toLowerCase()
    );
    if (!existing) {
      routes.push(town);
    }
  }

  // Calculate unique Pokemon per route with aggregated weights & level ranges
  for (const r of routes) {
    const pokeMap = new Map<
      string,
      { name: string; cleanName: string; formLabel?: string; totalWeight: number; methods: Set<EncounterMethod> }
    >();

    const allLevels: number[] = [];

    for (const enc of r.encounters) {
      const key = enc.pokemon;
      if (!pokeMap.has(key)) {
        pokeMap.set(key, {
          name: enc.pokemon,
          cleanName: enc.cleanName,
          formLabel: enc.formLabel,
          totalWeight: 0,
          methods: new Set(),
        });
      }
      const item = pokeMap.get(key)!;
      item.totalWeight += enc.chance;
      item.methods.add(enc.method);

      if (enc.levelRange) {
        const matches = enc.levelRange.match(/\d+/g);
        if (matches) {
          for (const m of matches) {
            const parsed = parseInt(m, 10);
            if (!isNaN(parsed)) {
              allLevels.push(parsed);
            }
          }
        }
      }
    }

    if (allLevels.length > 0) {
      r.minLevel = Math.min(...allLevels);
      r.maxLevel = Math.max(...allLevels);
      r.levelDisplay = r.minLevel === r.maxLevel ? `Nv. ${r.minLevel}` : `Nv. ${r.minLevel}-${r.maxLevel}`;
    } else {
      r.minLevel = 999;
      r.maxLevel = 999;
      r.levelDisplay = 'Nv. ?';
    }

    r.uniquePokemon = Array.from(pokeMap.values()).map((p) => ({
      name: p.name,
      cleanName: p.cleanName,
      formLabel: p.formLabel,
      totalWeight: Math.round(p.totalWeight * 10) / 10,
      methods: Array.from(p.methods),
    }));
  }

  // Filter out any routes that ended up with 0 encounters
  const validRoutes = routes.filter((r) => r.encounters.length > 0);

  // Sort routes by lowest Pokémon level to highest Pokémon level (ideal for Nuzlocke progression)
  validRoutes.sort((a, b) => {
    if (a.minLevel !== b.minLevel) {
      return a.minLevel - b.minLevel;
    }
    if (a.maxLevel !== b.maxLevel) {
      return a.maxLevel - b.maxLevel;
    }
    return a.name.localeCompare(b.name);
  });

  return validRoutes;
}

let cachedRoutes: RouteData[] | null = null;
export function getRoutes(): RouteData[] {
  if (!cachedRoutes) {
    cachedRoutes = parseAllRoutes();
  }
  return cachedRoutes;
}
