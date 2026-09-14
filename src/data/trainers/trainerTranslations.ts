import { StarterChoice } from '../../types';

// ==========================================
// STARTERS INFO & SPRITES
// ==========================================
export interface StarterMeta {
  id: StarterChoice;
  name: string;
  species: string;
  type: string;
  typeColor: string;
  sprite: string;
  showdown: string;
  description: string;
  hopStarterName: string;
  hopStarterType: string;
}

export const STARTERS_INFO: Record<StarterChoice, StarterMeta> = {
  grookey: {
    id: 'grookey',
    name: 'Grookey',
    species: 'Grookey',
    type: 'Planta',
    typeColor: 'bg-emerald-600 text-white',
    sprite: 'https://play.pokemonshowdown.com/sprites/gen5/grookey.png',
    showdown: 'https://play.pokemonshowdown.com/sprites/ani/grookey.gif',
    description: 'Si eliges a Grookey, tu rival Paúl elegirá a Sobble (Agua).',
    hopStarterName: 'Sobble',
    hopStarterType: 'Agua',
  },
  scorbunny: {
    id: 'scorbunny',
    name: 'Scorbunny',
    species: 'Scorbunny',
    type: 'Fuego',
    typeColor: 'bg-orange-600 text-white',
    sprite: 'https://play.pokemonshowdown.com/sprites/gen5/scorbunny.png',
    showdown: 'https://play.pokemonshowdown.com/sprites/ani/scorbunny.gif',
    description: 'Si eliges a Scorbunny, tu rival Paúl elegirá a Grookey (Planta).',
    hopStarterName: 'Grookey',
    hopStarterType: 'Planta',
  },
  sobble: {
    id: 'sobble',
    name: 'Sobble',
    species: 'Sobble',
    type: 'Agua',
    typeColor: 'bg-blue-600 text-white',
    sprite: 'https://play.pokemonshowdown.com/sprites/gen5/sobble.png',
    showdown: 'https://play.pokemonshowdown.com/sprites/ani/sobble.gif',
    description: 'Si eliges a Sobble, tu rival Paúl elegirá a Scorbunny (Fuego).',
    hopStarterName: 'Scorbunny',
    hopStarterType: 'Fuego',
  },
};

// ==========================================
// TRAINERS METADATA & AVATARS
// ==========================================
export interface TrainerMeta {
  id: string;
  name: string;
  spanishName: string;
  title: string;
  avatarUrl: string;
  themeColor: string;
  tagColor: string;
  borderHover: string;
}

export const TRAINERS_META: Record<string, TrainerMeta> = {
  hop: {
    id: 'hop',
    name: 'Hop',
    spanishName: 'Paúl',
    title: 'Rival Entusiasta',
    avatarUrl: 'https://play.pokemonshowdown.com/sprites/trainers/hop.png',
    themeColor: 'from-amber-500/20 to-orange-500/20',
    tagColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    borderHover: 'hover:border-amber-400 dark:hover:border-amber-500',
  },
  bede: {
    id: 'bede',
    name: 'Bede',
    spanishName: 'Berto',
    title: 'Aspirante Orgulloso / Sucesor Hada',
    avatarUrl: 'https://play.pokemonshowdown.com/sprites/trainers/bede.png',
    themeColor: 'from-pink-500/20 to-purple-500/20',
    tagColor: 'bg-pink-100 text-pink-800 dark:bg-pink-950/70 dark:text-pink-300 border-pink-200 dark:border-pink-800',
    borderHover: 'hover:border-pink-400 dark:hover:border-pink-500',
  },
  marnie: {
    id: 'marnie',
    name: 'Marnie',
    spanishName: 'Roxy',
    title: 'Aspirante de Pueblo Crampón',
    avatarUrl: 'https://play.pokemonshowdown.com/sprites/trainers/marnie.png',
    themeColor: 'from-violet-500/20 to-slate-800/30',
    tagColor: 'bg-violet-100 text-violet-800 dark:bg-violet-950/70 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    borderHover: 'hover:border-violet-400 dark:hover:border-violet-500',
  },
  milo: {
    id: 'milo',
    name: 'Milo',
    spanishName: 'Percy',
    title: 'Líder de Gimnasio Hoyuelo (Planta)',
    avatarUrl: 'https://play.pokemonshowdown.com/sprites/trainers/milo.png',
    themeColor: 'from-emerald-500/20 to-green-500/20',
    tagColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    borderHover: 'hover:border-emerald-400 dark:hover:border-emerald-500',
  },
  nessa: {
    id: 'nessa',
    name: 'Nessa',
    spanishName: 'Cathy',
    title: 'Líder de Gimnasio Plié (Agua)',
    avatarUrl: 'https://play.pokemonshowdown.com/sprites/trainers/nessa.png',
    themeColor: 'from-blue-500/20 to-cyan-500/20',
    tagColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    borderHover: 'hover:border-blue-400 dark:hover:border-blue-500',
  },
  kabu: {
    id: 'kabu',
    name: 'Kabu',
    spanishName: 'Kabu',
    title: 'Líder de Gimnasio Pistón (Fuego)',
    avatarUrl: 'https://play.pokemonshowdown.com/sprites/trainers/kabu.png',
    themeColor: 'from-orange-500/20 to-red-500/20',
    tagColor: 'bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    borderHover: 'hover:border-orange-400 dark:hover:border-orange-500',
  },
  allister: {
    id: 'allister',
    name: 'Allister',
    spanishName: 'Alistair',
    title: 'Líder de Gimnasio Ladera (Fantasma)',
    avatarUrl: 'https://play.pokemonshowdown.com/sprites/trainers/allister.png',
    themeColor: 'from-purple-500/20 to-indigo-500/20',
    tagColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    borderHover: 'hover:border-purple-400 dark:hover:border-purple-500',
  },
  opal: {
    id: 'opal',
    name: 'Opal',
    spanishName: 'Sally',
    title: 'Líder de Gimnasio Plié (Hada)',
    avatarUrl: 'https://play.pokemonshowdown.com/sprites/trainers/opal.png',
    themeColor: 'from-pink-500/20 to-rose-500/20',
    tagColor: 'bg-pink-100 text-pink-800 dark:bg-pink-950/70 dark:text-pink-300 border-pink-200 dark:border-pink-800',
    borderHover: 'hover:border-pink-400 dark:hover:border-pink-500',
  },
  melony: {
    id: 'melony',
    name: 'Melony',
    spanishName: 'Mel',
    title: 'Líder de Gimnasio Auriga (Hielo)',
    avatarUrl: 'https://play.pokemonshowdown.com/sprites/trainers/melony.png',
    themeColor: 'from-sky-500/20 to-cyan-500/20',
    tagColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    borderHover: 'hover:border-sky-400 dark:hover:border-sky-500',
  },
  piers: {
    id: 'piers',
    name: 'Piers',
    spanishName: 'Nerio',
    title: 'Líder de Gimnasio Crampón (Siniestro)',
    avatarUrl: 'https://play.pokemonshowdown.com/sprites/trainers/piers.png',
    themeColor: 'from-slate-700/20 to-zinc-900/30',
    tagColor: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
    borderHover: 'hover:border-slate-400 dark:hover:border-slate-500',
  },
  raihan: {
    id: 'raihan',
    name: 'Raihan',
    spanishName: 'Roy',
    title: 'Líder de Gimnasio Artejo (Dragón / Tormenta)',
    avatarUrl: 'https://play.pokemonshowdown.com/sprites/trainers/raihan.png',
    themeColor: 'from-amber-600/20 to-blue-600/20',
    tagColor: 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-200 border-amber-300 dark:border-amber-700',
    borderHover: 'hover:border-amber-500 dark:hover:border-amber-400',
  },
  leon: {
    id: 'leon',
    name: 'Leon',
    spanishName: 'Lionel',
    title: 'Campeón Invicto de Galar',
    avatarUrl: 'https://play.pokemonshowdown.com/sprites/trainers/leon.png',
    themeColor: 'from-red-600/20 to-amber-500/20',
    tagColor: 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-200 border-amber-400 dark:border-amber-600',
    borderHover: 'hover:border-amber-500 dark:hover:border-amber-400',
  },
  rose: {
    id: 'rose',
    name: 'Chairman Rose',
    spanishName: 'Presidente Rose',
    title: 'Presidente de Macro Cosmos',
    avatarUrl: 'https://play.pokemonshowdown.com/sprites/trainers/rose.png',
    themeColor: 'from-slate-600/20 to-amber-600/20',
    tagColor: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600',
    borderHover: 'hover:border-slate-400 dark:hover:border-slate-500',
  },
  oleana: {
    id: 'oleana',
    name: 'Oleana',
    spanishName: 'Olivia',
    title: 'Secretaria Ejecutiva de Macro Cosmos',
    avatarUrl: 'https://play.pokemonshowdown.com/sprites/trainers/oleana.png',
    themeColor: 'from-rose-600/20 to-purple-600/20',
    tagColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-700',
    borderHover: 'hover:border-rose-400 dark:hover:border-rose-500',
  },
};

export function getTrainerMeta(trainerId: string): TrainerMeta {
  if (TRAINERS_META[trainerId]) {
    return TRAINERS_META[trainerId];
  }
  return {
    id: trainerId,
    name: trainerId.toUpperCase(),
    spanishName: trainerId,
    title: 'Entrenador Especial',
    avatarUrl: `https://play.pokemonshowdown.com/sprites/trainers/${trainerId}.png`,
    themeColor: 'from-indigo-500/20 to-purple-500/20',
    tagColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    borderHover: 'hover:border-indigo-400 dark:hover:border-indigo-500',
  };
}

// ==========================================
// ABILITIES TRANSLATION (English -> Spanish)
// ==========================================
const ABILITY_TRANSLATIONS: Record<string, string> = {
  'Fluffy': 'Peluche',
  'Vital Spirit': 'Espíritu Vital',
  'Gale Wings': 'Alas Vendaval',
  'Sniper': 'Francotirador',
  'Strong Jaw': 'Mandíbula Fuerte',
  'Grassy Surge': 'Herbogénesis',
  'Own Tempo': 'Ritmo Propio',
  'Libero': 'Líbero',
  'Steadfast': 'Impasible',
  'Intimidate': 'Intimidación',
  'Water Absorb': 'Absorbe Agua',
  'Chlorophyll': 'Clorofila',
  'Magic Guard': 'Muro Mágico',
  'Shadow Tag': 'Sombra Trampa',
  'Magic Bounce': 'Espejo Mágico',
  'Genetic Instability': 'Inestabilidad Genética',
  'Infiltrator': 'Allanador',
  'Tough Claws': 'Garra Dura',
  'Healer': 'Alma Cura',
  'Pastel Veil': 'Velo Pastel',
  'Synchronize': 'Sincronía',
  'Soul Heart': 'Corazón Ánima',
  'Moxie': 'Autoestima',
  'Illusion': 'Ilusión',
  'Justified': 'Justiciero',
  'Prankster': 'Bromista',
  'Hunger Switch': 'Mutapetito',
  'Parental Bond': 'Amor Filial',
  'Dancer': 'Pareja de Baile',
  'Drought': 'Sequía',
  'No Guard': 'Indefenso',
  'Levitate': 'Levitación',
  'Gulp Missile': 'Tragamisil',
  'Pixilate': 'Piel Feérica',
  'Sheer Force': 'Potencia Bruta',
  'Sturdy': 'Robustez',
  'Unaware': 'Ignorante',
  'Unburden': 'Liviano',
  'Mold Breaker': 'Rompemoldes',
  'Damp': 'Humedad',
  'Torrent': 'Torrente',
  'Tinted Lens': 'Cromolente',
  'Long Reach': 'Remoto',
  'Shed Skin': 'Mudar',
  'Iron Barbs': 'Punta Acero',
  'Flower Gift': 'Don Floral',
  'Swift Swim': 'Nado Rápido',
  'Ripen': 'Maduración',
  'Cotton Down': 'Pelusa',
  'Drizzle': 'Llovizna',
  'Regenerator': 'Regeneración',
  'Corrosion': 'Corrosión',
  'Flash Fire': 'Absorbe Fuego',
  'Wandering Spirit': 'Alma Errante',
  'Disguise': 'Disfraz',
  'Weak Armor': 'Armadura Frágil',
  'Perish Body': 'Cuerpo Mortal',
  'Cursed Body': 'Cuerpo Maldito',
  'Neutralizing Gas': 'Gas Reactivo',
  'Trace': 'Rastro',
  'Serene Grace': 'Dicha',
  'Sweet Veil': 'Velo Dulce',
  'Ice Scales': 'Escama de Hielo',
  'Gorilla Tactics': 'Monotema',
  'Ice Face': 'Cara de Hielo',
  'Thick Fat': 'Sebo',
  'Contrary': 'Respondón',
  'Aftermath': 'Detonación',
  'Punk Rock': 'Punk Rock',
  'Guts': 'Agallas',
  'Sand Stream': 'Chorro Arena',
  'Sap Sipper': 'Herbívoro',
  'Shell Armor': 'Caparazón',
  'Stalwart': 'Acérrimo',
  'Dry Skin': 'Piel Seca',
  'Mirror Armor': 'Coraza Espejo',
  'Electric Surge': 'Electrogénesis',
  'Gluttony': 'Gula',
  'Queenly Majesty': 'Regia Presencia',
  'Marvel Scale': 'Escama Especial',
  'Overcoat': 'Funda',
  'Clear Body': 'Cuerpo Puro',
  'Steely Spirit': 'Alma Acerada',
  'Heavy Metal': 'Metal Pesado',
  'Stance Change': 'Cambio Táctico',
  'Screen Cleaner': 'Antibarrera',
  'Solar Power': 'Poder Solar',
  'Intrepid Sword': 'Espada Indómita',
};

export function translateAbility(ability: string): string {
  if (!ability) return '';
  const trimmed = ability.trim();
  return ABILITY_TRANSLATIONS[trimmed] || trimmed;
}

// ==========================================
// NATURES TRANSLATION (English -> Spanish)
// ==========================================
const NATURE_TRANSLATIONS: Record<string, { es: string; desc: string }> = {
  'Adamant': { es: 'Firme', desc: '+Atq, -Atq.Esp' },
  'Modest': { es: 'Modesta', desc: '+Atq.Esp, -Atq' },
  'Jolly': { es: 'Alegre', desc: '+Vel, -Atq.Esp' },
  'Timid': { es: 'Miedosa', desc: '+Vel, -Atq' },
  'Impish': { es: 'Agitada', desc: '+Def, -Atq.Esp' },
  'Bold': { es: 'Osada', desc: '+Def, -Atq' },
  'Careful': { es: 'Cauta', desc: '+Def.Esp, -Atq.Esp' },
  'Calm': { es: 'Serena', desc: '+Def.Esp, -Atq' },
  'Relaxed': { es: 'Plácida', desc: '+Def, -Vel' },
  'Sassy': { es: 'Grosera', desc: '+Def.Esp, -Vel' },
  'Brave': { es: 'Audaz', desc: '+Atq, -Vel' },
  'Naive': { es: 'Ingenua', desc: '+Vel, -Def.Esp' },
  'Rash': { es: 'Alocada', desc: '+Atq.Esp, -Def.Esp' },
  'Lonely': { es: 'Huraña', desc: '+Atq, -Def' },
  'Hardy': { es: 'Fuerte', desc: 'Neutra' },
};

export function translateNature(nature: string): { name: string; desc: string } {
  if (!nature) return { name: '', desc: '' };
  const trimmed = nature.trim();
  const found = NATURE_TRANSLATIONS[trimmed];
  if (found) {
    return { name: found.es, desc: found.desc };
  }
  return { name: trimmed, desc: '' };
}

// ==========================================
// ITEMS TRANSLATION & SPRITES
// ==========================================
interface ItemData {
  spanishName: string;
  slug: string;
}

const ITEM_DATA: Record<string, ItemData> = {
  'Oran Berry': { spanishName: 'Baya Aranja', slug: 'oran-berry' },
  'Sitrus Berry': { spanishName: 'Baya Zidra', slug: 'sitrus-berry' },
  'Sitrus Bery': { spanishName: 'Baya Zidra', slug: 'sitrus-berry' }, // typo fix from sheet
  'Chesto Berry': { spanishName: 'Baya Atania', slug: 'chesto-berry' },
  'Colbur Berry': { spanishName: 'Baya Dromel', slug: 'colbur-berry' },
  'Chople Berry': { spanishName: 'Baya Pomar', slug: 'chople-berry' },
  'Petaya Berry': { spanishName: 'Baya Yapago', slug: 'petaya-berry' },
  'Yache Berry': { spanishName: 'Baya Kouba', slug: 'yache-berry' },
  'Lum Berry': { spanishName: 'Baya Meloc', slug: 'lum-berry' },
  'Light Clay': { spanishName: 'Refleluz', slug: 'light-clay' },
  'Eviolite': { spanishName: 'Mineral Evolutivo', slug: 'eviolite' },
  'Scope Lens': { spanishName: 'Periscopio', slug: 'scope-lens' },
  'Terrain Extender': { spanishName: 'Cubresuelos', slug: 'terrain-extender' },
  'Choice Specs': { spanishName: 'Gafas Elección', slug: 'choice-specs' },
  'Leftovers': { spanishName: 'Restos', slug: 'leftovers' },
  'Life Orb': { spanishName: 'Vidasfera', slug: 'life-orb' },
  'Focus Sash': { spanishName: 'Banda Focus', slug: 'focus-sash' },
  'Heat Rock': { spanishName: 'Roca Calor', slug: 'heat-rock' },
  'Power Herb': { spanishName: 'Hierba Única', slug: 'power-herb' },
  'Expert Belt': { spanishName: 'Cinta Experto', slug: 'expert-belt' },
  'Room Service': { spanishName: 'Servicio de Habitaciones', slug: 'room-service' },
  'Assault Vest': { spanishName: 'Chaleco Asalto', slug: 'assault-vest' },
  'Rocky Helmet': { spanishName: 'Casco Dentado', slug: 'rocky-helmet' },
  'Heavy-Duty': { spanishName: 'Botas Gruesas', slug: 'heavy-duty-boots' },
  'Heavy-Duty Boots': { spanishName: 'Botas Gruesas', slug: 'heavy-duty-boots' },
  'Black Sludge': { spanishName: 'Lodo Negro', slug: 'black-sludge' },
  'Choice Band': { spanishName: 'Cinta Elección', slug: 'choice-band' },
  'Air Balloon': { spanishName: 'Globo Helio', slug: 'air-balloon' },
  'Aguav Berry': { spanishName: 'Baya Guayaba', slug: 'aguav-berry' },
  'Figy Berry': { spanishName: 'Baya Higog', slug: 'figy-berry' },
};

export function getItemInfo(item?: string): { name: string; original: string; spriteUrl?: string } {
  if (!item || item.trim() === '' || item.trim().toLowerCase() === 'none') {
    return { name: 'Ninguno', original: 'None' };
  }
  const clean = item.trim();
  const data = ITEM_DATA[clean];
  if (data) {
    return {
      name: data.spanishName,
      original: clean,
      spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${data.slug}.png`,
    };
  }
  const slug = clean.toLowerCase().replace(/\s+/g, '-');
  return {
    name: clean,
    original: clean,
    spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${slug}.png`,
  };
}

// ==========================================
// MOVES: TYPES & SPANISH TRANSLATIONS
// ==========================================
export interface MoveInfo {
  spanishName: string;
  originalName: string;
  type: string;
}

const MOVE_DATABASE: Record<string, { es: string; type: string }> = {
  'Guard Split': { es: 'Isoguardia', type: 'Psychic' },
  'Rock Throw': { es: 'Lanzarrocas', type: 'Rock' },
  'Peck': { es: 'Picotazo', type: 'Flying' },
  'Water Pulse': { es: 'Hidropulso', type: 'Water' },
  'Tackle': { es: 'Placaje', type: 'Normal' },
  'Covet': { es: 'Antojo', type: 'Normal' },
  'Cover': { es: 'Antojo', type: 'Normal' }, // typo fix from sheet
  'Growl': { es: 'Gruñido', type: 'Normal' },
  'Ice Shard': { es: 'Canto Helado', type: 'Ice' },
  'Water Gun': { es: 'Pistola Agua', type: 'Water' },
  'Double Kick': { es: 'Doble Patada', type: 'Fighting' },
  'Defense Curl': { es: 'Rizo Defensa', type: 'Normal' },
  'Endeavor': { es: 'Esfuerzo', type: 'Normal' },
  'Quick Attack': { es: 'Ataque Rápido', type: 'Normal' },
  'Bite': { es: 'Mordisco', type: 'Dark' },
  'Absorb': { es: 'Absorber', type: 'Grass' },
  'Ember': { es: 'Ascuas', type: 'Fire' },
  'Copycat': { es: 'Copión', type: 'Normal' },
  'Bind': { es: 'Atadura', type: 'Normal' },
  'Razor Leaf': { es: 'Hoja Afilada', type: 'Grass' },
  'Fake Out': { es: 'Sorpresa', type: 'Normal' },
  'Branch Poke': { es: 'Rama Afilada', type: 'Grass' },
  'Taunt': { es: 'Mofa', type: 'Dark' },
  'Mist': { es: 'Neblina', type: 'Ice' },
  'Flame Wheel': { es: 'Rueda Fuego', type: 'Fire' },
  'Howl': { es: 'Aullido', type: 'Normal' },
  'Rain Dance': { es: 'Danza Lluvia', type: 'Water' },
  'Haze': { es: 'Niebla', type: 'Ice' },
  'Leech Seed': { es: 'Drenadoras', type: 'Grass' },
  'Stomp': { es: 'Pisotón', type: 'Normal' },
  'Leer': { es: 'Malicioso', type: 'Normal' },
  'Mud Shot': { es: 'Disparo Lodo', type: 'Ground' },
  'Rollout': { es: 'Desenrollar', type: 'Rock' },
  'Fell Stinger': { es: 'Aguijón Letal', type: 'Bug' },
  'Mega Drain': { es: 'Megaagotar', type: 'Grass' },
  'Sunny Day': { es: 'Día Soleado', type: 'Fire' },
  'Stun Spore': { es: 'Paralizador', type: 'Grass' },
  'Psybeam': { es: 'Psicorrayo', type: 'Psychic' },
  'Confusion': { es: 'Confusión', type: 'Psychic' },
  'Magical Leaf': { es: 'Hoja Mágica', type: 'Grass' },
  'Reflect': { es: 'Reflejo', type: 'Psychic' },
  'Yawn': { es: 'Bostezo', type: 'Normal' },
  'Recover': { es: 'Recuperación', type: 'Normal' },
  'Tickle': { es: 'Cosquillas', type: 'Normal' },
  'Nuzzle': { es: 'Moflete Estático', type: 'Electric' },
  'Light Screen': { es: 'Pantalla de Luz', type: 'Psychic' },
  'Torment': { es: 'Tormento', type: 'Dark' },
  'Disarming Voice': { es: 'Voz Cautivadora', type: 'Fairy' },
  'Rest': { es: 'Descanso', type: 'Psychic' },
  'Safeguard': { es: 'Velo Sagrado', type: 'Normal' },
  'Bullet Seed': { es: 'Semilladora', type: 'Grass' },
  'Accelerock': { es: 'Roca Veloz', type: 'Rock' },
  'Aqua Jet': { es: 'Acua Jet', type: 'Water' },
  'Aqua Tail': { es: 'Acua Cola', type: 'Water' },
  'Lash Out': { es: 'Desahogo', type: 'Dark' },
  'Teeter Dance': { es: 'Danza Caos', type: 'Normal' },
  'Sucker Punch': { es: 'Golpe Bajo', type: 'Dark' },
  'Snarl': { es: 'Alarido', type: 'Dark' },
  'Icy Wind': { es: 'Viento Hielo', type: 'Ice' },
  'Sleep Powder': { es: 'Somnífero', type: 'Grass' },
  'Flame Charge': { es: 'Nitrocarga', type: 'Fire' },
  'Headbutt': { es: 'Golpe Cabeza', type: 'Normal' },
  'Fire Spin': { es: 'Giro Fuego', type: 'Fire' },
  'Quick Guard': { es: 'Anticipo', type: 'Fighting' },
  'Bulldoze': { es: 'Terratemblor', type: 'Ground' },
  'Reversal': { es: 'Inversión', type: 'Fighting' },
  'Grassy Terrain': { es: 'Campo de Hierba', type: 'Grass' },
  'Super Fang': { es: 'Superdiente', type: 'Normal' },
  'Fire Fang': { es: 'Colmillo Ígneo', type: 'Fire' },
  'Rock Tomb': { es: 'Tumba Rocas', type: 'Rock' },
  'Grassy Glide': { es: 'Envite Hierba', type: 'Grass' },
  'Knock Off': { es: 'Desarme', type: 'Dark' },
  'Trick': { es: 'Truco', type: 'Psychic' },
  'Wonder Room': { es: 'Zona Extraña', type: 'Psychic' },
  'Signal Beam': { es: 'Doble Rayo', type: 'Bug' },
  'Dazzling Gleam': { es: 'Brillo Mágico', type: 'Fairy' },
  'Psyshock': { es: 'Psicocarga', type: 'Psychic' },
  'Morning Sun': { es: 'Sol Matinal', type: 'Normal' },
  'Thunder Wave': { es: 'Onda Trueno', type: 'Electric' },
  'Air Slash': { es: 'Tajo Aéreo', type: 'Flying' },
  'Payback': { es: 'Vendetta', type: 'Dark' },
  'Zen Headbutt': { es: 'Cabezazo Zen', type: 'Psychic' },
  'Disable': { es: 'Anulación', type: 'Normal' },
  'Roost': { es: 'Respiro', type: 'Flying' },
  'Will-O-Wisp': { es: 'Fuego Fatuo', type: 'Fire' },
  'Poison Jab': { es: 'Puya Nociva', type: 'Poison' },
  'U-turn': { es: 'Ida y Vuelta', type: 'Bug' },
  'Curse': { es: 'Maldición', type: 'Ghost' },
  'Swagger': { es: 'Contoneo', type: 'Normal' },
  'Thunder Punch': { es: 'Puño Trueno', type: 'Electric' },
  'Shadow Claw': { es: 'Garra Umbría', type: 'Ghost' },
  'Brick Break': { es: 'Demolición', type: 'Fighting' },
  'Sludge Bomb': { es: 'Bomba Lodo', type: 'Poison' },
  'Slash': { es: 'Cuchillada', type: 'Normal' },
  'False Surrender': { es: 'Falsa Rendición', type: 'Dark' },
  'Parting Shot': { es: 'Última Palabra', type: 'Dark' },
  'Skitter Smack': { es: 'Golpe Escurridizo', type: 'Bug' },
  'Power-Up Punch': { es: 'Puño Incremento', type: 'Fighting' },
  'Spiky Shield': { es: 'Barrera Espinosa', type: 'Grass' },
  'Scorching Sands': { es: 'Arenas Ardientes', type: 'Ground' },
  'Retaliate': { es: 'Represalia', type: 'Normal' },
  'Dragon Breath': { es: 'Dragoaliento', type: 'Dragon' },
  'Snipe Shot': { es: 'Disparo Certero', type: 'Water' },
  'Dive': { es: 'Buceo', type: 'Water' },
  'Swords Dance': { es: 'Danza Espada', type: 'Normal' },
  'Pyro Ball': { es: 'Balón Ígneo', type: 'Fire' },
  'Fire Punch': { es: 'Puño Fuego', type: 'Fire' },
  'Solar Beam': { es: 'Rayo Solar', type: 'Grass' },
  'Iron Head': { es: 'Cabeza de Hierro', type: 'Steel' },
  'Flamethrower': { es: 'Lanzallamas', type: 'Fire' },
  'Defog': { es: 'Despejar', type: 'Flying' },
  'Burning Jealousy': { es: 'Envidia Ardiente', type: 'Fire' },
  'Shadow Sneak': { es: 'Sombra Vil', type: 'Ghost' },
  'Weather Ball': { es: 'Meteorobola', type: 'Normal' },
  'Pluck': { es: 'Picoteo', type: 'Flying' },
  'Seed Bomb': { es: 'Bomba Germen', type: 'Grass' },
  'Expanding Force': { es: 'Vasta Fuerza', type: 'Psychic' },
  'Trick Room': { es: 'Espacio Raro', type: 'Psychic' },
  'Body Slam': { es: 'Golpe Cuerpo', type: 'Normal' },
  'Destiny Bond': { es: 'Mismo Destino', type: 'Ghost' },
  'Heat Crash': { es: 'Golpe Calor', type: 'Fire' },
  'Psychic': { es: 'Psíquico', type: 'Psychic' },
  'Psycho Cut': { es: 'Psicocorte', type: 'Psychic' },
  'Power Whip': { es: 'Latigazo', type: 'Grass' },
  'Mystical Fire': { es: 'Llama Embrujada', type: 'Fire' },
  'Psychic Terrain': { es: 'Campo Psíquico', type: 'Psychic' },
  'Energy Ball': { es: 'Energibola', type: 'Grass' },
  'Drill Run': { es: 'Taladradora', type: 'Ground' },
  'Heavy Slam': { es: 'Cuerpo Pesado', type: 'Steel' },
  'Throat Chop': { es: 'Golpe Mordaza', type: 'Dark' },
  'High Horsepower': { es: 'Fuerza Equina', type: 'Ground' },
  'Stealth Rock': { es: 'Trampa Rocas', type: 'Rock' },
  'Moonblast': { es: 'Fuerza Lunar', type: 'Fairy' },
  'Flip Turn': { es: 'Viraje', type: 'Water' },
  'Close Combat': { es: 'A Bocajarro', type: 'Fighting' },
  'Focus Energy': { es: 'Foco Energía', type: 'Normal' },
  'Wish': { es: 'Deseo', type: 'Normal' },
  'Earthquake': { es: 'Terremoto', type: 'Ground' },
  'Toxic': { es: 'Tóxico', type: 'Poison' },
  'Teleport': { es: 'Teletransporte', type: 'Psychic' },
  'Focus Blast': { es: 'Onda Certera', type: 'Fighting' },
  'Darkest Lariat': { es: 'Lariat Oscuro', type: 'Dark' },
  'Ice Punch': { es: 'Puño Hielo', type: 'Ice' },
  'Ice Beam': { es: 'Rayo Hielo', type: 'Ice' },
  'Body Press': { es: 'Plancha Corporal', type: 'Fighting' },
  'Calm Mind': { es: 'Paz Mental', type: 'Psychic' },
  'Dragon Pulse': { es: 'Pulso Dragón', type: 'Dragon' },
  'Flare Blitz': { es: 'Envite Ígneo', type: 'Fire' },
  'Flare Bltiz': { es: 'Envite Ígneo', type: 'Fire' }, // typo fix from sheet
  'Scale Shot': { es: 'Disparo Escama', type: 'Dragon' },
  'Dark Pulse': { es: 'Pulso Umbrío', type: 'Dark' },
  'Drain Punch': { es: 'Puño Drenaje', type: 'Fighting' },
  'Scald': { es: 'Escaldar', type: 'Water' },
  'High Jump Kick': { es: 'Patada Salto Alta', type: 'Fighting' },
  'Double-Edge': { es: 'Doble Filo', type: 'Normal' },
  'Spikes': { es: 'Púas', type: 'Ground' },
  'Boomburst': { es: 'Estruendo', type: 'Normal' },
  'Poltergeist': { es: 'Poltergeist', type: 'Ghost' },
  'Brave Bird': { es: 'Pájaro Osado', type: 'Flying' },
  'Cotton Guard': { es: 'Rizo Algodón', type: 'Grass' },
  'Heat Wave': { es: 'Onda Ígnea', type: 'Fire' },
  'Thunder Fang': { es: 'Colmillo Rayo', type: 'Electric' },
  'Extreme Speed': { es: 'Velocidad Extrema', type: 'Normal' },
  'Leaf Blade': { es: 'Hoja Aguda', type: 'Grass' },
  'Wood Hammer': { es: 'Mazazo', type: 'Grass' },
  'Ice Fang': { es: 'Colmillo Hielo', type: 'Ice' },
  'Bulk Up': { es: 'Corpulencia', type: 'Fighting' },
  'Play Rough': { es: 'Carantoña', type: 'Fairy' },
  'Aura Wheel': { es: 'Rueda Aural', type: 'Electric' },
  'Psychic Fangs': { es: 'Psicocolmillo', type: 'Psychic' },
  'Volt Tackle': { es: 'Placaje Eléctrico', type: 'Electric' },
  'Crunch': { es: 'Triturar', type: 'Dark' },
  'Protect': { es: 'Protección', type: 'Normal' },
  'Nasty Plot': { es: 'Maquinación', type: 'Dark' },
  'Spirit Break': { es: 'Choque Anímico', type: 'Fairy' },
  'Stone Edge': { es: 'Roca Afilada', type: 'Rock' },
  'Rock Slide': { es: 'Avalancha', type: 'Rock' },
  'Rock Blast': { es: 'Pedrada', type: 'Rock' },
  'Smack Down': { es: 'Antiaéreo', type: 'Rock' },
  'Power Gem': { es: 'Joya de Luz', type: 'Rock' },
  'Ancient Power': { es: 'Poder Pasado', type: 'Rock' },
  'Head Smash': { es: 'Testarazo', type: 'Rock' },
  'Gyro Ball': { es: 'Giro Bola', type: 'Steel' },
  'Pin Missile': { es: 'Pin Misil', type: 'Bug' },
  'Solar Blade': { es: 'Cuchilla Solar', type: 'Grass' },
  'Growth': { es: 'Desarrollo', type: 'Normal' },
  'Giga Drain': { es: 'Gigadrenado', type: 'Grass' },
  'Apple Acid': { es: 'Ácido Málico', type: 'Grass' },
  'Pollen Puff': { es: 'Bola de Polen', type: 'Bug' },
  'Hurricane': { es: 'Vendaval', type: 'Flying' },
  'Baneful Bunker': { es: 'Búnker', type: 'Poison' },
  'Hydro Pump': { es: 'Hidrobomba', type: 'Water' },
  'Liquidation': { es: 'Hidroariete', type: 'Water' },
  'Jaw Lock': { es: 'Presa Maxilar', type: 'Dark' },
  'Wild Charge': { es: 'Voltio Cruel', type: 'Electric' },
  'Shadow Ball': { es: 'Bola Sombra', type: 'Ghost' },
  'Fire Lash': { es: 'Látigo Ígneo', type: 'Fire' },
  'Leech Life': { es: 'Chupavidas', type: 'Bug' },
  'Coil': { es: 'Enrosque', type: 'Poison' },
  'Shell Smash': { es: 'Rompecoraza', type: 'Normal' },
  'Stored Power': { es: 'Poder Reserva', type: 'Psychic' },
  'Earth Power': { es: 'Tierra Viva', type: 'Ground' },
  'Strength Sap': { es: 'Absorbefuerza', type: 'Grass' },
  'Sludge Wave': { es: 'Onda Tóxica', type: 'Poison' },
  'Strange Steam': { es: 'Vapor Extraño', type: 'Fairy' },
  'Pain Split': { es: 'Divide Dolor', type: 'Normal' },
  'Acid Armor': { es: 'Armadura Ácida', type: 'Poison' },
  'Quiver Dance': { es: 'Danza Aleteo', type: 'Bug' },
  'Bug Buzz': { es: 'Zumbido', type: 'Bug' },
  'Icicle Crash': { es: 'Chuzos', type: 'Ice' },
  'Belly Drum': { es: 'Tambor', type: 'Normal' },
  'Aurora Veil': { es: 'Velo Aurora', type: 'Ice' },
  'Freeze-Dry': { es: 'Liofilización', type: 'Ice' },
  'Thunderbolt': { es: 'Rayo', type: 'Electric' },
  'Dragon Dance': { es: 'Danza Dragón', type: 'Dragon' },
  'Superpower': { es: 'Fuerza Bruta', type: 'Fighting' },
  'Overdrive': { es: 'Amplificador', type: 'Electric' },
  'Volt Switch': { es: 'Voltiocambio', type: 'Electric' },
  'Facade': { es: 'Imagen', type: 'Normal' },
  'Obstruct': { es: 'Obstrucción', type: 'Dark' },
  'Explosion': { es: 'Explosión', type: 'Normal' },
  'Draco Meteor': { es: 'Cometa Draco', type: 'Dragon' },
  'Fire Blast': { es: 'Llamarada', type: 'Fire' },
  'Muddy Water': { es: 'Agua Lodosa', type: 'Water' },
  'Flash Cannon': { es: 'Foco Resplandor', type: 'Steel' },
  'Gunk Shot': { es: 'Lanzamugre', type: 'Poison' },
  'Sleep Talk': { es: 'Sonámbulo', type: 'Normal' },
  'Rising Voltage': { es: 'Voltio Cambiante', type: 'Electric' },
  'Hyper Voice': { es: 'Vozarrón', type: 'Normal' },
  'Triple Axel': { es: 'Triple Axel', type: 'Ice' },
  'Megahorn': { es: 'Megacuerno', type: 'Bug' },
  'Shift Gear': { es: 'Cambio de Marcha', type: 'Steel' },
  'Gear Grind': { es: 'Rueda Doble', type: 'Steel' },
  'Substitute': { es: 'Sustituto', type: 'Normal' },
  "King's Shield": { es: 'Escudo Real', type: 'Steel' },
  'Sacred Sword': { es: 'Espada Santa', type: 'Fighting' },
  'Outrage': { es: 'Enfado', type: 'Dragon' },
  'Iron Defense': { es: 'Defensa Férrea', type: 'Steel' },
  'Behemoth Blade': { es: 'Tajo Supremo', type: 'Steel' },
};

const TYPE_TRANSLATE: Record<string, string> = {
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

export function translateMoveType(type: string): string {
  if (!type) return 'Normal';
  const clean = type.toLowerCase().trim();
  return TYPE_TRANSLATE[clean] || type;
}

export function getMoveTypeAbbreviation(type: string): string {
  const es = translateMoveType(type);
  const map: Record<string, string> = {
    Roca: 'ROC',
    Normal: 'NOR',
    Fuego: 'FUE',
    Agua: 'AGU',
    Planta: 'PLA',
    Eléctrico: 'ELÉ',
    Hielo: 'HIE',
    Lucha: 'LUC',
    Veneno: 'VEN',
    Tierra: 'TIE',
    Volador: 'VOL',
    Psíquico: 'PSÍ',
    Bicho: 'BIC',
    Fantasma: 'FAN',
    Dragón: 'DRA',
    Siniestro: 'SIN',
    Acero: 'ACE',
    Hada: 'HAD',
  };
  return map[es] || es.slice(0, 3).toUpperCase();
}

export function getMoveInfo(move: string): MoveInfo {
  const clean = move.trim();
  const entry = MOVE_DATABASE[clean];
  if (entry) {
    return {
      spanishName: entry.es,
      originalName: clean,
      type: translateMoveType(entry.type),
    };
  }
  return {
    spanishName: clean,
    originalName: clean,
    type: 'Normal',
  };
}

// Map Pokémon Types to Tailwind Styles
export const MOVE_TYPE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Normal: { bg: 'bg-zinc-100 dark:bg-zinc-800/90', text: 'text-zinc-700 dark:text-zinc-300', border: 'border-zinc-300 dark:border-zinc-700' },
  Fire: { bg: 'bg-orange-50 dark:bg-orange-950/60', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-300 dark:border-orange-800' },
  Water: { bg: 'bg-blue-50 dark:bg-blue-950/60', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-800' },
  Grass: { bg: 'bg-emerald-50 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-800' },
  Electric: { bg: 'bg-amber-50 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-800' },
  Ice: { bg: 'bg-cyan-50 dark:bg-cyan-950/60', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-300 dark:border-cyan-800' },
  Fighting: { bg: 'bg-red-50 dark:bg-red-950/60', text: 'text-red-700 dark:text-red-300', border: 'border-red-300 dark:border-red-800' },
  Poison: { bg: 'bg-purple-50 dark:bg-purple-950/60', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-300 dark:border-purple-800' },
  Ground: { bg: 'bg-amber-100/60 dark:bg-amber-950/80', text: 'text-amber-800 dark:text-amber-200', border: 'border-amber-400 dark:border-amber-700' },
  Flying: { bg: 'bg-indigo-50 dark:bg-indigo-950/60', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-300 dark:border-indigo-800' },
  Psychic: { bg: 'bg-pink-50 dark:bg-pink-950/60', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-300 dark:border-pink-800' },
  Bug: { bg: 'bg-lime-50 dark:bg-lime-950/60', text: 'text-lime-700 dark:text-lime-300', border: 'border-lime-300 dark:border-lime-800' },
  Rock: { bg: 'bg-yellow-100/90 dark:bg-yellow-950/70', text: 'text-yellow-900 dark:text-yellow-200', border: 'border-yellow-600/80 dark:border-yellow-500/60' },
  Ghost: { bg: 'bg-violet-50 dark:bg-violet-950/60', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-300 dark:border-violet-800' },
  Dragon: { bg: 'bg-indigo-100/60 dark:bg-indigo-950/80', text: 'text-indigo-800 dark:text-indigo-200', border: 'border-indigo-400 dark:border-indigo-700' },
  Dark: { bg: 'bg-neutral-100 dark:bg-neutral-800/90', text: 'text-neutral-800 dark:text-neutral-200', border: 'border-neutral-400 dark:border-neutral-600' },
  Steel: { bg: 'bg-slate-100 dark:bg-slate-800/80', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-600' },
  Fairy: { bg: 'bg-rose-50 dark:bg-rose-950/60', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-300 dark:border-rose-800' },

  // Spanish aliases
  Roca: { bg: 'bg-yellow-100/90 dark:bg-yellow-950/70', text: 'text-yellow-900 dark:text-yellow-200', border: 'border-yellow-600/80 dark:border-yellow-500/60' },
  Fuego: { bg: 'bg-orange-50 dark:bg-orange-950/60', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-300 dark:border-orange-800' },
  Agua: { bg: 'bg-blue-50 dark:bg-blue-950/60', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-800' },
  Planta: { bg: 'bg-emerald-50 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-800' },
  Eléctrico: { bg: 'bg-amber-50 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-800' },
  Hielo: { bg: 'bg-cyan-50 dark:bg-cyan-950/60', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-300 dark:border-cyan-800' },
  Lucha: { bg: 'bg-red-50 dark:bg-red-950/60', text: 'text-red-700 dark:text-red-300', border: 'border-red-300 dark:border-red-800' },
  Veneno: { bg: 'bg-purple-50 dark:bg-purple-950/60', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-300 dark:border-purple-800' },
  Tierra: { bg: 'bg-amber-100/60 dark:bg-amber-950/80', text: 'text-amber-800 dark:text-amber-200', border: 'border-amber-400 dark:border-amber-700' },
  Volador: { bg: 'bg-indigo-50 dark:bg-indigo-950/60', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-300 dark:border-indigo-800' },
  Psíquico: { bg: 'bg-pink-50 dark:bg-pink-950/60', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-300 dark:border-pink-800' },
  Bicho: { bg: 'bg-lime-50 dark:bg-lime-950/60', text: 'text-lime-700 dark:text-lime-300', border: 'border-lime-300 dark:border-lime-800' },
  Fantasma: { bg: 'bg-violet-50 dark:bg-violet-950/60', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-300 dark:border-violet-800' },
  Dragón: { bg: 'bg-indigo-100/60 dark:bg-indigo-950/80', text: 'text-indigo-800 dark:text-indigo-200', border: 'border-indigo-400 dark:border-indigo-700' },
  Siniestro: { bg: 'bg-neutral-100 dark:bg-neutral-800/90', text: 'text-neutral-800 dark:text-neutral-200', border: 'border-neutral-400 dark:border-neutral-600' },
  Acero: { bg: 'bg-slate-100 dark:bg-slate-800/80', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-600' },
  Hada: { bg: 'bg-rose-50 dark:bg-rose-950/60', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-300 dark:border-rose-800' },
};
