import { RouteData, RouteEncounter, EncounterMethod } from '../types';
import { parsePokemonName } from '../utils/pokemonMeta';

export interface SimpleRouteInput {
  id: string;
  name: string;
  englishName?: string;
  category?: RouteData['category'];
  encounters: {
    pokemon: string;
    chance: number;
    levelRange?: string;
    method?: EncounterMethod;
    weather?: string;
  }[];
}

export function buildRouteData(input: SimpleRouteInput): RouteData {
  const allWeathers = new Set<string>();
  const allMethods = new Set<EncounterMethod>();
  const allLevels: number[] = [];

  const encounters: RouteEncounter[] = input.encounters.map((enc) => {
    const parsed = parsePokemonName(enc.pokemon);
    const method: EncounterMethod = enc.method || 'Visible';
    const weather = enc.weather || 'Normal Weather';

    allWeathers.add(weather);
    allMethods.add(method);

    if (enc.levelRange) {
      const matches = enc.levelRange.match(/\d+/g);
      if (matches) {
        for (const m of matches) {
          const num = parseInt(m, 10);
          if (!isNaN(num)) allLevels.push(num);
        }
      }
    }

    return {
      pokemon: enc.pokemon,
      cleanName: parsed.cleanName,
      formLabel: parsed.formLabel,
      chance: enc.chance,
      levelRange: enc.levelRange || '',
      method,
      weather,
    };
  });

  const pokeMap = new Map<
    string,
    {
      name: string;
      cleanName: string;
      formLabel?: string;
      totalWeight: number;
      methods: Set<EncounterMethod>;
    }
  >();

  for (const enc of encounters) {
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
  }

  let minLevel = 999;
  let maxLevel = 999;
  let levelDisplay = 'Nv. ?';

  if (allLevels.length > 0) {
    minLevel = Math.min(...allLevels);
    maxLevel = Math.max(...allLevels);
    levelDisplay = minLevel === maxLevel ? `Nv. ${minLevel}` : `Nv. ${minLevel}-${maxLevel}`;
  }

  let defaultCategory: RouteData['category'] = 'Ruta';
  if (input.category) {
    defaultCategory = input.category;
  } else {
    const lower = input.name.toLowerCase();
    if (lower.includes('cueva') || lower.includes('mina') || lower.includes('túnel') || lower.includes('monte')) {
      defaultCategory = 'Cueva/Mina';
    } else if (lower.includes('pueblo') || lower.includes('ciudad')) {
      defaultCategory = 'Ciudad/Pueblo';
    } else if (lower.includes('área') || lower.includes('bosque') || lower.includes('lago')) {
      defaultCategory = 'Área Silvestre';
    }
  }

  return {
    id: input.id,
    name: input.name,
    englishName: input.englishName,
    category: defaultCategory,
    minLevel,
    maxLevel,
    levelDisplay,
    weathers: Array.from(allWeathers),
    methods: Array.from(allMethods),
    encounters,
    uniquePokemon: Array.from(pokeMap.values()).map((p) => ({
      name: p.name,
      cleanName: p.cleanName,
      formLabel: p.formLabel,
      totalWeight: Math.round(p.totalWeight * 10) / 10,
      methods: Array.from(p.methods),
    })),
  };
}
