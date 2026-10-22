export interface PokemonMeta {
  displayName: string;
  cleanName: string;
  formLabel?: string;
  types: string[];
  color: string;
  spriteUrl: string;
  artworkUrl: string;
}

// Map known types for standard Pokemon
const TYPE_MAP: Record<string, string[]> = {
  skwovet: ['Normal'],
  blipbug: ['Bug'],
  caterpie: ['Bug'],
  metapod: ['Bug'],
  butterfree: ['Bug', 'Flying'],
  grubbin: ['Bug'],
  charjabug: ['Bug', 'Electric'],
  hoothoot: ['Normal', 'Flying'],
  noctowl: ['Normal', 'Flying'],
  rookidee: ['Flying'],
  corvisquire: ['Flying'],
  corviknight: ['Flying', 'Steel'],
  nickit: ['Dark'],
  thievul: ['Dark'],
  wooloo: ['Normal'],
  dubwool: ['Normal'],
  lillipup: ['Normal'],
  zigzagoon: ['Normal'],
  fletchling: ['Normal', 'Flying'],
  fletchinder: ['Fire', 'Flying'],
  pidove: ['Normal', 'Flying'],
  tranquill: ['Normal', 'Flying'],
  buneary: ['Normal'],
  shinx: ['Electric'],
  luxray: ['Electric'],
  rockruff: ['Rock'],
  lotad: ['Water', 'Grass'],
  lombre: ['Water', 'Grass'],
  ludicolo: ['Water', 'Grass'],
  seedot: ['Grass'],
  purrloin: ['Dark'],
  liepard: ['Dark'],
  chewtle: ['Water'],
  drednaw: ['Water', 'Rock'],
  yamper: ['Electric'],
  boltund: ['Electric'],
  azurill: ['Normal', 'Fairy'],
  marill: ['Water', 'Fairy'],
  azumarill: ['Water', 'Fairy'],
  gossifleur: ['Grass'],
  eldegoss: ['Grass'],
  aggron: ['Steel', 'Rock'],
  vileplume: ['Grass', 'Poison'],
  scolipede: ['Bug', 'Poison'],
  venipede: ['Bug', 'Poison'],
  nidoqueen: ['Poison', 'Ground'],
  nidoking: ['Poison', 'Ground'],
  crobat: ['Poison', 'Flying'],
  gardevoir: ['Psychic', 'Fairy'],
  magikarp: ['Water'],
  gyarados: ['Water', 'Flying'],
  feebas: ['Water'],
  mudbray: ['Ground'],
  mudsdale: ['Ground'],
  sizzlipede: ['Fire', 'Bug'],
  machop: ['Fighting'],
  machoke: ['Fighting'],
  pancham: ['Fighting'],
  klink: ['Steel'],
  klang: ['Steel'],
  klinklang: ['Steel'],
  'nidoran♀': ['Poison'],
  'nidoran♂': ['Poison'],
  dunsparce: ['Normal'],
  rolycoly: ['Rock'],
  carkol: ['Rock', 'Fire'],
  trubbish: ['Poison'],
  electrike: ['Electric'],
  manectric: ['Electric'],
  meowth: ['Normal'],
  milcery: ['Fairy'],
  joltik: ['Bug', 'Electric'],
  galvantula: ['Bug', 'Electric'],
  ferroseed: ['Grass', 'Steel'],
  cutiefly: ['Bug', 'Fairy'],
  ribombee: ['Bug', 'Fairy'],
  budew: ['Grass', 'Poison'],
  roselia: ['Grass', 'Poison'],
  eevee: ['Normal'],
  pikachu: ['Electric'],
  pichu: ['Electric'],
  pumpkaboo: ['Ghost', 'Grass'],
  goldeen: ['Water'],
  espurr: ['Psychic'],
  meowstic: ['Psychic'],
  dedenne: ['Electric', 'Fairy'],
  miltank: ['Normal'],
  whismur: ['Normal'],
  loudred: ['Normal'],
  applin: ['Grass', 'Dragon'],
  swirlix: ['Fairy'],
  spritzee: ['Fairy'],
  exeggcute: ['Grass', 'Psychic'],
  wobbuffet: ['Psychic'],
  'farfetch’d': ['Normal', 'Flying'],
  "farfetch'd": ['Normal', 'Flying'],
  happiny: ['Normal'],
  chansey: ['Normal'],
  blissey: ['Normal'],
  audino: ['Normal'],
  psyduck: ['Water'],
  poliwag: ['Water'],
  tirtouga: ['Water', 'Rock'],
  silicobra: ['Ground'],
  heatmor: ['Fire'],
  duskull: ['Ghost'],
  skorupi: ['Poison', 'Bug'],
  hippopotas: ['Ground'],
  durant: ['Bug', 'Steel'],
  torkoal: ['Fire'],
  hawlucha: ['Fighting', 'Flying'],
  yamask: ['Ground', 'Ghost'],
  trapinch: ['Ground'],
  persian: ['Normal'],
  perrserker: ['Steel'],
  inkay: ['Dark', 'Psychic'],
  klefki: ['Steel', 'Fairy'],
  lurantis: ['Grass'],
  morpeko: ['Electric', 'Dark'],
  rufflet: ['Normal', 'Flying'],
  braviary: ['Normal', 'Flying'],
  vullaby: ['Dark', 'Flying'],
  mandibuzz: ['Dark', 'Flying'],
  solrock: ['Rock', 'Psychic'],
  lunatone: ['Rock', 'Psychic'],
  pawniard: ['Dark', 'Steel'],
  falinks: ['Fighting'],
  togedemaru: ['Electric', 'Steel'],
  turtonator: ['Fire', 'Dragon'],
  drampa: ['Normal', 'Dragon'],
  snom: ['Ice', 'Bug'],
  frosmoth: ['Ice', 'Bug'],
  snorunt: ['Ice'],
  sneasel: ['Dark', 'Ice'],
  delibird: ['Ice', 'Flying'],
  darumaka: ['Fire'],
  darmanitan: ['Fire'],
  'mr. mime': ['Psychic', 'Fairy'],
  cryogonal: ['Ice'],
  beartic: ['Ice'],
  cubchoo: ['Ice'],
  eiscue: ['Ice'],
  pelipper: ['Water', 'Flying'],
  gastrodon: ['Water', 'Ground'],
  sealeo: ['Ice', 'Water'],
  spheal: ['Ice', 'Water'],
  walrein: ['Ice', 'Water'],
  mareanie: ['Poison', 'Water'],
  toxapex: ['Poison', 'Water'],
  cramorant: ['Flying', 'Water'],
  jellicent: ['Water', 'Ghost'],
  frillish: ['Water', 'Ghost'],
  octillery: ['Water'],
  pincurchin: ['Electric'],
  pyukumuku: ['Water'],
  wishiwashi: ['Water'],
  tentacruel: ['Water', 'Poison'],
  tentacool: ['Water', 'Poison'],
  slowpoke: ['Water', 'Psychic'],
  seadra: ['Water'],
  sharpedo: ['Water', 'Dark'],
  carvanha: ['Water', 'Dark'],
  clawitzer: ['Water'],
  grapploct: ['Fighting'],
  clobbopus: ['Fighting'],
  barbaracle: ['Rock', 'Water'],
  binacle: ['Rock', 'Water'],
  dhelmise: ['Ghost', 'Grass'],
  mantyke: ['Water', 'Flying'],
  mantine: ['Water', 'Flying'],
  wailmer: ['Water'],
  wailord: ['Water'],
  lapras: ['Water', 'Ice'],
  bergmite: ['Ice'],
  avalugg: ['Ice'],
  ditto: ['Normal'],
  goomy: ['Dragon'],
  sliggoo: ['Dragon'],
  'jangmo-o': ['Dragon'],
  'kommo-o': ['Dragon', 'Fighting'],
  qwilfish: ['Water', 'Poison'],
  shellder: ['Water'],
  cloyster: ['Water', 'Ice'],
  starmie: ['Water', 'Psychic'],
  staryu: ['Water'],
  lanturn: ['Water', 'Electric'],
  chinchou: ['Water', 'Electric'],
  remoraid: ['Water'],
  relicanth: ['Water', 'Rock'],
  vanilluxe: ['Ice'],
  vanillite: ['Ice'],
  stonjourner: ['Rock'],
  duraludon: ['Steel', 'Dragon'],
  weavile: ['Dark', 'Ice'],
  dratini: ['Dragon'],
  bagon: ['Dragon'],
  shelgon: ['Dragon'],
  axew: ['Dragon'],
  gible: ['Dragon', 'Ground'],
  gabite: ['Dragon', 'Ground'],
  druddigon: ['Dragon'],
  tyrantrum: ['Rock', 'Dragon'],
  tyrunt: ['Rock', 'Dragon'],
  deino: ['Dark', 'Dragon'],
  zweilous: ['Dark', 'Dragon'],
  larvesta: ['Bug', 'Fire'],
  skrelp: ['Poison', 'Water'],
  kangaskhan: ['Normal'],
  tauros: ['Normal'],
  tangela: ['Grass'],
  togepi: ['Fairy'],
  togetic: ['Fairy', 'Flying'],
  togekiss: ['Fairy', 'Flying'],
  elgyem: ['Psychic'],
  noibat: ['Flying', 'Dragon'],
  toxel: ['Electric', 'Poison'],
  cufant: ['Steel'],
  karrablast: ['Bug'],
  croagunk: ['Poison', 'Fighting'],
  scraggy: ['Dark', 'Fighting'],
  sawk: ['Fighting'],
  throh: ['Fighting'],
  shellos: ['Water'],
  wimpod: ['Bug', 'Water'],
  lickitung: ['Normal'],
  bronzor: ['Steel', 'Psychic'],
  electabuzz: ['Electric'],
  elekid: ['Electric'],
  emolga: ['Electric', 'Flying'],
  magneton: ['Electric', 'Steel'],
  magnemite: ['Electric', 'Steel'],
  maractus: ['Grass'],
  litwick: ['Ghost', 'Fire'],
  baltoy: ['Ground', 'Psychic'],
  petilil: ['Grass'],
  cottonee: ['Grass', 'Fairy'],
  swablu: ['Normal', 'Flying'],
  skarmory: ['Steel', 'Flying'],
  beldum: ['Steel', 'Psychic'],
  metang: ['Steel', 'Psychic'],
  stufful: ['Normal', 'Fighting'],
  bewear: ['Normal', 'Fighting'],
  bonsly: ['Rock'],
  sudowoodo: ['Rock'],
  cubone: ['Ground'],
  krokorok: ['Ground', 'Dark'],
  sandygast: ['Ghost', 'Ground'],
  rhyhorn: ['Ground', 'Rock'],
  munna: ['Psychic'],
  musharna: ['Psychic'],
  fomantis: ['Grass'],
  bounsweet: ['Grass'],
  comfey: ['Fairy'],
  stunky: ['Poison', 'Dark'],
  bulbasaur: ['Grass', 'Poison'],
  treecko: ['Grass'],
  rowlet: ['Grass', 'Flying'],
  grookey: ['Grass'],
  squirtle: ['Water'],
  mudkip: ['Water'],
  popplio: ['Water'],
  sobble: ['Water'],
  charmander: ['Fire'],
  torchic: ['Fire'],
  litten: ['Fire'],
  scorbunny: ['Fire'],
  tympole: ['Water'],
  palpitoad: ['Water', 'Ground'],
  snover: ['Grass', 'Ice'],
  abomasnow: ['Grass', 'Ice'],
  sandshrew: ['Ground'],
  sandslash: ['Ground'],
  vulpix: ['Fire'],
  ninetales: ['Fire'],
  golett: ['Ground', 'Ghost'],
  sandile: ['Ground', 'Dark'],
  ralts: ['Psychic', 'Fairy'],
  kirlia: ['Psychic', 'Fairy'],
  abra: ['Psychic'],
  kadabra: ['Psychic'],
  koffing: ['Poison'],
  weezing: ['Poison', 'Fairy'],
  dugtrio: ['Ground'],
  diglett: ['Ground'],
  piloswine: ['Ice', 'Ground'],
  swinub: ['Ice', 'Ground'],
  swoobat: ['Psychic', 'Flying'],
  woobat: ['Psychic', 'Flying'],
  hattrem: ['Psychic'],
  hatenna: ['Psychic'],
  spiritomb: ['Ghost', 'Dark'],
  barraskewda: ['Water'],
  arrokuda: ['Water'],
  combee: ['Bug', 'Flying'],
  cleffa: ['Fairy'],
  clefairy: ['Fairy'],
  igglybuff: ['Normal', 'Fairy'],
  jigglypuff: ['Normal', 'Fairy'],
  'mime jr.': ['Psychic', 'Fairy'],
  tyrogue: ['Fighting'],
  smoochum: ['Ice', 'Psychic'],
  magby: ['Fire'],
  magmar: ['Fire'],
  wynaut: ['Psychic'],
  krabby: ['Water'],
  corphish: ['Water'],
  crawdaunt: ['Water', 'Dark'],
  drilbur: ['Ground'],
  wooper: ['Water', 'Ground'],
  quagsire: ['Water', 'Ground'],
  nincada: ['Bug', 'Ground'],
  ninjask: ['Bug', 'Flying'],
  drifloon: ['Ghost', 'Flying'],
  gastly: ['Ghost', 'Poison'],
  haunter: ['Ghost', 'Poison'],
  onix: ['Rock', 'Ground'],
  dwebble: ['Bug', 'Rock'],
  ribombee2: ['Bug', 'Fairy'],
  scyther: ['Bug', 'Flying'],
  heracross: ['Bug', 'Fighting'],
  pinsir: ['Bug'],
  gurdurr: ['Fighting'],
  timburr: ['Fighting'],
  absol: ['Dark'],
  porygon: ['Normal'],
  foongus: ['Grass', 'Poison'],
  zorua: ['Dark'],
  bouffalant: ['Normal'],
  archen: ['Rock', 'Flying'],
  aerodactyl: ['Rock', 'Flying'],
  sigilyph: ['Psychic', 'Flying'],
  amaura: ['Rock', 'Ice'],
  rotom: ['Electric', 'Ghost'],
  shuckle: ['Bug', 'Rock'],
  carbink: ['Rock', 'Fairy'],
  lileep: ['Rock', 'Grass'],
  anorith: ['Rock', 'Bug'],
  omanyte: ['Rock', 'Water'],
  kabuto: ['Rock', 'Water'],
  sinistea: ['Ghost'],
  phantump: ['Ghost', 'Grass'],
  passimian: ['Fighting'],
  oranguru: ['Normal', 'Psychic'],
  salandit: ['Poison', 'Fire'],
  roggenrola: ['Rock'],
  boldore: ['Rock'],
  morgrem: ['Dark', 'Fairy'],
  shiinotic: ['Grass', 'Fairy'],
  morelull: ['Grass', 'Fairy'],
  drakloak: ['Dragon', 'Ghost'],
  pupitar: ['Rock', 'Ground'],
  aron: ['Steel', 'Rock'],
  zubat: ['Poison', 'Flying'],
};

export const TYPE_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  Normal: { bg: 'bg-pokemon-normal', text: 'text-white', border: 'border-pokemon-normal', badge: 'bg-pokemon-normal text-white' },
  Fire: { bg: 'bg-pokemon-fuego', text: 'text-white', border: 'border-pokemon-fuego', badge: 'bg-pokemon-fuego text-white' },
  Water: { bg: 'bg-pokemon-agua', text: 'text-white', border: 'border-pokemon-agua', badge: 'bg-pokemon-agua text-white' },
  Grass: { bg: 'bg-pokemon-planta', text: 'text-white', border: 'border-pokemon-planta', badge: 'bg-pokemon-planta text-white' },
  Electric: { bg: 'bg-pokemon-electrico', text: 'text-gray-900', border: 'border-pokemon-electrico', badge: 'bg-pokemon-electrico text-gray-900' },
  Ice: { bg: 'bg-pokemon-hielo', text: 'text-gray-900', border: 'border-pokemon-hielo', badge: 'bg-pokemon-hielo text-gray-900' },
  Fighting: { bg: 'bg-pokemon-lucha', text: 'text-white', border: 'border-pokemon-lucha', badge: 'bg-pokemon-lucha text-white' },
  Poison: { bg: 'bg-pokemon-veneno', text: 'text-white', border: 'border-pokemon-veneno', badge: 'bg-pokemon-veneno text-white' },
  Ground: { bg: 'bg-pokemon-tierra', text: 'text-gray-900', border: 'border-pokemon-tierra', badge: 'bg-pokemon-tierra text-gray-900' },
  Flying: { bg: 'bg-pokemon-volador', text: 'text-white', border: 'border-pokemon-volador', badge: 'bg-pokemon-volador text-white' },
  Psychic: { bg: 'bg-pokemon-psiquico', text: 'text-white', border: 'border-pokemon-psiquico', badge: 'bg-pokemon-psiquico text-white' },
  Bug: { bg: 'bg-pokemon-bicho', text: 'text-white', border: 'border-pokemon-bicho', badge: 'bg-pokemon-bicho text-white' },
  Rock: { bg: 'bg-pokemon-roca', text: 'text-white', border: 'border-pokemon-roca', badge: 'bg-pokemon-roca text-white' },
  Ghost: { bg: 'bg-pokemon-fantasma', text: 'text-white', border: 'border-pokemon-fantasma', badge: 'bg-pokemon-fantasma text-white' },
  Dragon: { bg: 'bg-pokemon-dragon', text: 'text-white', border: 'border-pokemon-dragon', badge: 'bg-pokemon-dragon text-white' },
  Dark: { bg: 'bg-pokemon-siniestro', text: 'text-white', border: 'border-pokemon-siniestro', badge: 'bg-pokemon-siniestro text-white' },
  Steel: { bg: 'bg-pokemon-acero', text: 'text-gray-900', border: 'border-pokemon-acero', badge: 'bg-pokemon-acero text-gray-900' },
  Fairy: { bg: 'bg-pokemon-hada', text: 'text-white', border: 'border-pokemon-hada', badge: 'bg-pokemon-hada text-white' },

  Roca: { bg: 'bg-pokemon-roca', text: 'text-white', border: 'border-pokemon-roca', badge: 'bg-pokemon-roca text-white' },
  Fuego: { bg: 'bg-pokemon-fuego', text: 'text-white', border: 'border-pokemon-fuego', badge: 'bg-pokemon-fuego text-white' },
  Agua: { bg: 'bg-pokemon-agua', text: 'text-white', border: 'border-pokemon-agua', badge: 'bg-pokemon-agua text-white' },
  Planta: { bg: 'bg-pokemon-planta', text: 'text-white', border: 'border-pokemon-planta', badge: 'bg-pokemon-planta text-white' },
  Eléctrico: { bg: 'bg-pokemon-electrico', text: 'text-gray-900', border: 'border-pokemon-electrico', badge: 'bg-pokemon-electrico text-gray-900' },
  Hielo: { bg: 'bg-pokemon-hielo', text: 'text-gray-900', border: 'border-pokemon-hielo', badge: 'bg-pokemon-hielo text-gray-900' },
  Lucha: { bg: 'bg-pokemon-lucha', text: 'text-white', border: 'border-pokemon-lucha', badge: 'bg-pokemon-lucha text-white' },
  Veneno: { bg: 'bg-pokemon-veneno', text: 'text-white', border: 'border-pokemon-veneno', badge: 'bg-pokemon-veneno text-white' },
  Tierra: { bg: 'bg-pokemon-tierra', text: 'text-gray-900', border: 'border-pokemon-tierra', badge: 'bg-pokemon-tierra text-gray-900' },
  Volador: { bg: 'bg-pokemon-volador', text: 'text-white', border: 'border-pokemon-volador', badge: 'bg-pokemon-volador text-white' },
  Psíquico: { bg: 'bg-pokemon-psiquico', text: 'text-white', border: 'border-pokemon-psiquico', badge: 'bg-pokemon-psiquico text-white' },
  Bicho: { bg: 'bg-pokemon-bicho', text: 'text-white', border: 'border-pokemon-bicho', badge: 'bg-pokemon-bicho text-white' },
  Fantasma: { bg: 'bg-pokemon-fantasma', text: 'text-white', border: 'border-pokemon-fantasma', badge: 'bg-pokemon-fantasma text-white' },
  Dragón: { bg: 'bg-pokemon-dragon', text: 'text-white', border: 'border-pokemon-dragon', badge: 'bg-pokemon-dragon text-white' },
  Siniestro: { bg: 'bg-pokemon-siniestro', text: 'text-white', border: 'border-pokemon-siniestro', badge: 'bg-pokemon-siniestro text-white' },
  Acero: { bg: 'bg-pokemon-acero', text: 'text-gray-900', border: 'border-pokemon-acero', badge: 'bg-pokemon-acero text-gray-900' },
  Hada: { bg: 'bg-pokemon-hada', text: 'text-white', border: 'border-pokemon-hada', badge: 'bg-pokemon-hada text-white' },
};

export const TYPE_TRANSLATIONS_ES: Record<string, string> = {
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

export function translateType(type: string): string {
  if (!type) return 'Normal';
  const clean = type.toLowerCase().trim();
  return TYPE_TRANSLATIONS_ES[clean] || type;
}

// Identify regional forms or variants
export function parsePokemonName(rawName: string): {
  displayName: string;
  cleanName: string;
  formLabel?: string;
  apiName: string;
  types: string[];
} {
  const trimmed = rawName.trim();
  let cleanName = trimmed;
  let formLabel: string | undefined = undefined;
  let apiName = trimmed.toLowerCase();

  // Helper to normalize apostrophes
  const normalized = trimmed.replace(/’/g, "'");

  // 1. Handle specific suffixes from Romhack format (-1, -2)
  if (normalized === 'Zigzagoon-1') {
    cleanName = 'Zigzagoon';
    formLabel = 'Galar';
    apiName = 'zigzagoon-galar';
  } else if (normalized === 'Meowth-1') {
    cleanName = 'Meowth';
    formLabel = 'Alola';
    apiName = 'meowth-alola';
  } else if (normalized === 'Meowth-2') {
    cleanName = 'Meowth';
    formLabel = 'Galar';
    apiName = 'meowth-galar';
  } else if (normalized === 'Persian-1') {
    cleanName = 'Persian';
    formLabel = 'Alola';
    apiName = 'persian-alola';
  } else if (normalized === "Farfetch'd-1") {
    cleanName = "Farfetch'd";
    formLabel = 'Galar';
    apiName = 'farfetchd-galar';
  } else if (normalized === 'Darumaka-1') {
    cleanName = 'Darumaka';
    formLabel = 'Galar';
    apiName = 'darumaka-galar';
  } else if (normalized === 'Darmanitan-2') {
    cleanName = 'Darmanitan';
    formLabel = 'Galar';
    apiName = 'darmanitan-galar';
  } else if (normalized === 'Mr. Mime-1' || normalized === 'Mr-Mime-1') {
    cleanName = 'Mr. Mime';
    formLabel = 'Galar';
    apiName = 'mr-mime-galar';
  } else if (normalized === 'Corsola-1') {
    cleanName = 'Corsola';
    formLabel = 'Galar';
    apiName = 'corsola-galar';
  } else if (normalized === 'Slowpoke-1') {
    cleanName = 'Slowpoke';
    formLabel = 'Galar';
    apiName = 'slowpoke-galar';
  } else if (normalized === 'Ponyta-1') {
    cleanName = 'Ponyta';
    formLabel = 'Galar';
    apiName = 'ponyta-galar';
  } else if (normalized === 'Rapidash-1' || normalized === 'G-Rapidash') {
    cleanName = 'Rapidash';
    formLabel = 'Galar';
    apiName = 'rapidash-galar';
  } else if (normalized === 'Weezing-1') {
    cleanName = 'Weezing';
    formLabel = 'Galar';
    apiName = 'weezing-galar';
  } else if (normalized === 'Yamask-1') {
    cleanName = 'Yamask';
    formLabel = 'Galar';
    apiName = 'yamask-galar';
  } else if (normalized === 'Stunfisk-1') {
    cleanName = 'Stunfisk';
    formLabel = 'Galar';
    apiName = 'stunfisk-galar';
  } else if (normalized === 'Vulpix-1') {
    cleanName = 'Vulpix';
    formLabel = 'Alola';
    apiName = 'vulpix-alola';
  } else if (normalized === 'Ninetales-1') {
    cleanName = 'Ninetales';
    formLabel = 'Alola';
    apiName = 'ninetales-alola';
  } else if (normalized === 'Sandshrew-1') {
    cleanName = 'Sandshrew';
    formLabel = 'Alola';
    apiName = 'sandshrew-alola';
  } else if (normalized === 'Sandslash-1') {
    cleanName = 'Sandslash';
    formLabel = 'Alola';
    apiName = 'sandslash-alola';
  } else if (normalized === 'Dugtrio-1') {
    cleanName = 'Dugtrio';
    formLabel = 'Alola';
    apiName = 'dugtrio-alola';
  } else if (normalized === 'Shellos-1') {
    cleanName = 'Shellos';
    formLabel = 'Mar Este';
    apiName = 'shellos-east';
  } else if (normalized === 'Gastrodon-1') {
    cleanName = 'Gastrodon';
    formLabel = 'Mar Este';
    apiName = 'gastrodon-east';
  } else if (normalized === 'Basculin-1') {
    cleanName = 'Basculin';
    formLabel = 'Raya Azul';
    apiName = 'basculin-blue-striped';
  } else if (normalized === 'Indeedee-1') {
    cleanName = 'Indeedee';
    formLabel = 'Hembra';
    apiName = 'indeedee-female';
  } else if (normalized === 'Lycanroc Day') {
    cleanName = 'Lycanroc';
    formLabel = 'Forma Diurna';
    apiName = 'lycanroc';
  } else if (normalized === 'Lycanroc Dusk') {
    cleanName = 'Lycanroc';
    formLabel = 'Forma Crepuscular';
    apiName = 'lycanroc-dusk';
  } else if (normalized === 'Lycanroc Night') {
    cleanName = 'Lycanroc';
    formLabel = 'Forma Nocturna';
    apiName = 'lycanroc-midnight';
  } else if (normalized === 'Toxtricity-Low-Key' || normalized === 'Toxtricity-Lowkey') {
    cleanName = 'Toxtricity';
    formLabel = 'Grave';
    apiName = 'toxtricity-low-key';
  } else if (normalized === 'Zygarde-10%' || normalized === 'Zygarde 10%') {
    cleanName = 'Zygarde';
    formLabel = '10%';
    apiName = 'zygarde-10';
  } else if (normalized === 'Rotom-Ghost') {
    cleanName = 'Rotom';
    formLabel = 'Fantasma';
    apiName = 'rotom';
  } else if (normalized === 'Cherrim (Overcast)' || normalized === 'Cherrim-Overcast') {
    cleanName = 'Cherrim';
    formLabel = 'Nuboso';
    apiName = 'cherrim-overcast';
  } else if (normalized === 'Centiskorch-G') {
    cleanName = 'Centiskorch';
    formLabel = 'Gigamax';
    apiName = 'centiskorch-gmax';
  } else if (/-(gmax|dmax)$/i.test(normalized)) {
    const isGmax = /gmax$/i.test(normalized);
    cleanName = normalized.replace(/-(gmax|dmax)$/i, '');
    formLabel = isGmax ? 'Gigamax' : 'Dinamax';
    apiName = isGmax ? `${cleanName.toLowerCase()}-gmax` : cleanName.toLowerCase();
  } else if (normalized.startsWith('Pumpkaboo-')) {
    cleanName = 'Pumpkaboo';
    const formNum = normalized.split('-')[1];
    formLabel = formNum === '1' ? 'Tamaño Pequeño' : formNum === '2' ? 'Tamaño Grande' : 'Tamaño Extragrande';
    apiName = 'pumpkaboo-average';
  }
  // 2. Generalized Galar matching (e.g. Slowbro-Galar, Slowpoke-Galar, Slowking-Galar, Weezing-Galar, Galarian Slowpoke, etc.)
  else if (/(\bgalar\b|galarian)/i.test(normalized)) {
    formLabel = 'Galar';
    cleanName = normalized
      .replace(/^galarian\s+/i, '')
      .replace(/[\s-_]+(galar|galarian)$/i, '')
      .replace(/\s*\((galar|galarian)\)/i, '')
      .trim();
    // Capitalize cleanName
    cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    if (cleanName.toLowerCase() === 'farfetchd') cleanName = "Farfetch'd";
    if (cleanName.toLowerCase() === 'mr-mime' || cleanName.toLowerCase() === 'mr mime') cleanName = 'Mr. Mime';
    const slugBase = cleanName.toLowerCase().replace(/['’.:]/g, '').replace(/\s+/g, '-');
    apiName = `${slugBase}-galar`;
  }
  // 3. Generalized Alola matching (e.g. Vulpix-Alola, Alolan Vulpix, Raichu (Alola), etc.)
  else if (/(\balola\b|alolan)/i.test(normalized)) {
    formLabel = 'Alola';
    cleanName = normalized
      .replace(/^alolan\s+/i, '')
      .replace(/[\s-_]+(alola|alolan)$/i, '')
      .replace(/\s*\((alola|alolan)\)/i, '')
      .trim();
    cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    const slugBase = cleanName.toLowerCase().replace(/['’.:]/g, '').replace(/\s+/g, '-');
    apiName = `${slugBase}-alola`;
  }
  // 4. Generalized Hisui matching
  else if (/(\bhisui\b|hisuian)/i.test(normalized)) {
    formLabel = 'Hisui';
    cleanName = normalized
      .replace(/^hisuian\s+/i, '')
      .replace(/[\s-_]+(hisui|hisuian)$/i, '')
      .replace(/\s*\((hisui|hisuian)\)/i, '')
      .trim();
    cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    const slugBase = cleanName.toLowerCase().replace(/['’.:]/g, '').replace(/\s+/g, '-');
    apiName = `${slugBase}-hisui`;
  }
  // 5. Generalized Paldea matching
  else if (/(\bpaldea\b|paldean)/i.test(normalized)) {
    formLabel = 'Paldea';
    cleanName = normalized
      .replace(/^paldean\s+/i, '')
      .replace(/[\s-_]+(paldea|paldean)$/i, '')
      .replace(/\s*\((paldea|paldean)\)/i, '')
      .trim();
    cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    const slugBase = cleanName.toLowerCase().replace(/['’.:]/g, '').replace(/\s+/g, '-');
    apiName = `${slugBase}-paldea`;
  }

  // Determine types based on form
  let types = TYPE_MAP[cleanName.toLowerCase()] || ['Normal'];
  if (formLabel === 'Galar') {
    if (cleanName === 'Zigzagoon' || cleanName === 'Linoone') types = ['Dark', 'Normal'];
    if (cleanName === 'Meowth') types = ['Steel'];
    if (cleanName === "Farfetch'd" || cleanName === 'Farfetchd') types = ['Fighting'];
    if (cleanName === 'Darumaka' || cleanName === 'Darmanitan') types = ['Ice'];
    if (cleanName === 'Mr. Mime') types = ['Ice', 'Psychic'];
    if (cleanName === 'Corsola') types = ['Ghost'];
    if (cleanName === 'Slowpoke') types = ['Psychic'];
    if (cleanName === 'Slowbro' || cleanName === 'Slowking') types = ['Poison', 'Psychic'];
    if (cleanName === 'Ponyta') types = ['Psychic'];
    if (cleanName === 'Rapidash') types = ['Psychic', 'Fairy'];
    if (cleanName === 'Weezing') types = ['Poison', 'Fairy'];
    if (cleanName === 'Yamask') types = ['Ground', 'Ghost'];
    if (cleanName === 'Stunfisk') types = ['Ground', 'Steel'];
    if (cleanName === 'Articuno') types = ['Psychic', 'Flying'];
    if (cleanName === 'Zapdos') types = ['Fighting', 'Flying'];
    if (cleanName === 'Moltres') types = ['Dark', 'Flying'];
  } else if (formLabel === 'Alola') {
    if (cleanName === 'Meowth' || cleanName === 'Persian') types = ['Dark'];
    if (cleanName === 'Vulpix') types = ['Ice'];
    if (cleanName === 'Ninetales') types = ['Ice', 'Fairy'];
    if (cleanName === 'Sandshrew' || cleanName === 'Sandslash') types = ['Ice', 'Steel'];
    if (cleanName === 'Dugtrio' || cleanName === 'Diglett') types = ['Ground', 'Steel'];
    if (cleanName === 'Raichu') types = ['Electric', 'Psychic'];
    if (cleanName === 'Marowak') types = ['Fire', 'Ghost'];
    if (cleanName === 'Exeggutor') types = ['Grass', 'Dragon'];
    if (cleanName === 'Grimer' || cleanName === 'Muk') types = ['Poison', 'Dark'];
    if (cleanName === 'Geodude' || cleanName === 'Graveler' || cleanName === 'Golem') types = ['Rock', 'Electric'];
  }

  const displayName = formLabel ? `${cleanName} (${formLabel})` : cleanName;
  const spanishTypes = types.map(translateType);

  return {
    displayName,
    cleanName,
    formLabel,
    apiName,
    types: spanishTypes,
  };
}

export function getPokemonSprite(pokemonName: string): {
  sprite: string;
  showdown: string;
  shinySprite: string;
  shinyShowdown: string;
} {
  const { apiName } = parsePokemonName(pokemonName);
  
  // Format for PokeAPI / Pokemon Showdown sprite repository
  let cleanKey = apiName
    .replace(/♀/g, '-f')
    .replace(/♂/g, '-m')
    .replace(/[.’']/g, '')
    .replace(/\s+/g, '-');

  const sprite = `https://play.pokemonshowdown.com/sprites/gen5/${cleanKey}.png`;
  const showdown = `https://play.pokemonshowdown.com/sprites/ani/${cleanKey}.gif`;
  const shinySprite = `https://play.pokemonshowdown.com/sprites/gen5-shiny/${cleanKey}.png`;
  const shinyShowdown = `https://play.pokemonshowdown.com/sprites/ani-shiny/${cleanKey}.gif`;
  
  return { sprite, showdown, shinySprite, shinyShowdown };
}
