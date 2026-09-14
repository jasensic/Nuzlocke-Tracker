import { GameTenant, RouteData, TrainerBattle } from '../types';
import { BLESSED_SHIELD_TRAINER_BATTLES } from './trainers/blessedShieldTrainers';

export interface StoryChapter {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  badgeName?: string;
  badgeColor?: string;
  iconType: 'leaf' | 'droplet' | 'flame' | 'ghost' | 'sparkles' | 'snowflake' | 'moon' | 'shield' | 'trophy' | 'crown' | 'compass' | 'zap';
}

export type StoryTimelineType = 'capture' | 'battle';

export interface StoryTimelineItem {
  id: string;
  type: StoryTimelineType;
  stepNumber: number;
  chapter: StoryChapter;
  title: string;
  subtitle: string;
  location: string;
  locationEnglish?: string;
  minLevel: number;
  maxLevel: number;
  routeData?: RouteData;
  battleData?: TrainerBattle;
}

export const STORY_CHAPTERS: Record<string, StoryChapter> = {
  prologue: {
    id: 'prologue',
    order: 1,
    title: 'Prólogo: El Comienzo en Postaw',
    subtitle: 'Tus primeros pasos, el Bosque Onírico y tu primer duelo con Paúl',
    badgeName: 'Inicio de la Aventura',
    badgeColor: 'bg-emerald-600',
    iconType: 'compass',
  },
  wildAreaSouth: {
    id: 'wildAreaSouth',
    order: 2,
    title: 'Área Silvestre Sur y Ciudad Pistón',
    subtitle: 'Exploración de biomas salvajes camino a la ceremonia inaugural',
    badgeName: 'Área Silvestre',
    badgeColor: 'bg-amber-600',
    iconType: 'compass',
  },
  gym1: {
    id: 'gym1',
    order: 3,
    title: 'Medalla Planta: Gimnasio Hoyuelo',
    subtitle: 'Ruta 3, la Mina de Galar, duelo con Berto y el Líder Milo',
    badgeName: 'Medalla Planta',
    badgeColor: 'bg-green-600',
    iconType: 'leaf',
  },
  gym2: {
    id: 'gym2',
    order: 4,
    title: 'Medalla Agua: Gimnasio Plié',
    subtitle: 'Ruta 5, duelo con Paúl en el puente y la Líder Nessa',
    badgeName: 'Medalla Agua',
    badgeColor: 'bg-blue-600',
    iconType: 'droplet',
  },
  gym3: {
    id: 'gym3',
    order: 5,
    title: 'Medalla Fuego: Gimnasio Pistón',
    subtitle: 'Segunda Mina de Galar, rivales Roxy y Berto, y el Líder Kabu',
    badgeName: 'Medalla Fuego',
    badgeColor: 'bg-orange-600',
    iconType: 'flame',
  },
  gym4: {
    id: 'gym4',
    order: 6,
    title: 'Medalla Fantasma: Gimnasio Ladera',
    subtitle: 'Área Silvestre Norte, Ruta 6, duelo con Paúl y el Líder Alistair',
    badgeName: 'Medalla Fantasma',
    badgeColor: 'bg-purple-700',
    iconType: 'ghost',
  },
  gym5: {
    id: 'gym5',
    order: 7,
    title: 'Medalla Hada: Gimnasio Plié',
    subtitle: 'El místico Bosque Lumirinto y la prueba de la Líder Sally (Opal)',
    badgeName: 'Medalla Hada',
    badgeColor: 'bg-pink-600',
    iconType: 'sparkles',
  },
  gym6: {
    id: 'gym6',
    order: 8,
    title: 'Medalla Hielo: Gimnasio Auriga',
    subtitle: 'Rutas 7 y 8 heladas, duelo en Artejo y la Líder Mel (Melony)',
    badgeName: 'Medalla Hielo',
    badgeColor: 'bg-cyan-600',
    iconType: 'snowflake',
  },
  gym7: {
    id: 'gym7',
    order: 9,
    title: 'Medalla Siniestro: Gimnasio Crampón',
    subtitle: 'Ruta 9, duelo con Roxy y el concierto del Líder Nerio (Piers)',
    badgeName: 'Medalla Siniestro',
    badgeColor: 'bg-slate-800',
    iconType: 'moon',
  },
  gym8: {
    id: 'gym8',
    order: 10,
    title: 'Medalla Dragón: Gimnasio Artejo',
    subtitle: 'Zonas altas del Área Silvestre y combate doble con el Líder Roy (Raihan)',
    badgeName: 'Medalla Dragón',
    badgeColor: 'bg-indigo-700',
    iconType: 'shield',
  },
  macroCosmos: {
    id: 'macroCosmos',
    order: 11,
    title: 'Ruta de los Campeones y Macro Cosmos',
    subtitle: 'Ruta 10 nevada, infiltración en Torre Rose y el Presidente Rose',
    badgeName: 'Macro Cosmos',
    badgeColor: 'bg-rose-700',
    iconType: 'zap',
  },
  championsCup: {
    id: 'championsCup',
    order: 12,
    title: 'Copa de Campeones de Wyndon',
    subtitle: 'Semifinales, la interrupción de Berto y la Gran Final con el Campeón Lionel',
    badgeName: 'Campeón de Galar',
    badgeColor: 'bg-yellow-600',
    iconType: 'crown',
  },
  epilogue: {
    id: 'epilogue',
    order: 13,
    title: 'Epílogo: El Duelo de Leyendas',
    subtitle: 'Regreso al corazón del Bosque Onírico y el combate final con Paúl y Zacian/Zamazenta',
    badgeName: 'Duelo Legendario',
    badgeColor: 'bg-violet-700',
    iconType: 'shield',
  },
};

interface BlueprintItem {
  chapterKey: keyof typeof STORY_CHAPTERS;
  type: StoryTimelineType;
  title: string;
  subtitle: string;
  routeSearch?: string;
  battleId?: string;
  fallbackMinLevel?: number;
  fallbackMaxLevel?: number;
}

const BLESSED_SHIELD_BLUEPRINT: BlueprintItem[] = [
  // --- CAPÍTULO 1: PRÓLOGO ---
  {
    chapterKey: 'prologue',
    type: 'capture',
    title: 'Captura: Pueblo Yarda',
    subtitle: 'Hogar del protagonista donde recibes tu Pokémon inicial de manos de Lionel',
    routeSearch: 'postwick',
  },
  {
    chapterKey: 'prologue',
    type: 'capture',
    title: 'Captura: Bosque Onírico',
    subtitle: 'Encuentro inicial con la densa niebla y tus primeros Pokémon',
    routeSearch: 'slumbering-weald',
  },
  {
    chapterKey: 'prologue',
    type: 'capture',
    title: 'Captura: Ruta 1',
    subtitle: 'Camino campestre que conecta Pueblo Postaw con Pueblo Par',
    routeSearch: 'route-1',
  },
  {
    chapterKey: 'prologue',
    type: 'capture',
    title: 'Captura: Pueblo Par',
    subtitle: 'Laboratorio de la Profesora Magnolia y estación de tren con Slowpoke de Galar',
    routeSearch: 'wedgehurst',
  },
  {
    chapterKey: 'prologue',
    type: 'capture',
    title: 'Captura: Ruta 2',
    subtitle: 'Camino rural hacia la casa de la Profesora Magnolia',
    routeSearch: 'route-2',
  },
  {
    chapterKey: 'prologue',
    type: 'battle',
    title: 'Combate Rival: Hop (Paúl) #1',
    subtitle: 'Primer duelo oficial para demostrar quién empezará más fuerte la aventura',
    battleId: 'hop-route-2',
  },

  // --- CAPÍTULO 2: ÁREA SILVESTRE SUR ---
  {
    chapterKey: 'wildAreaSouth',
    type: 'capture',
    title: 'Captura: Pradera Radiante',
    subtitle: 'Entrada principal al inmenso Área Silvestre sur',
    routeSearch: 'rolling-fields',
  },
  {
    chapterKey: 'wildAreaSouth',
    type: 'capture',
    title: 'Captura: Arboleda Claroscuro',
    subtitle: 'Zona boscosa llena de Pokémon bicho y planta',
    routeSearch: 'dappled-grove',
  },
  {
    chapterKey: 'wildAreaSouth',
    type: 'capture',
    title: 'Captura: Antigua Atalaya',
    subtitle: 'Ruinas místicas frecuentadas por Pokémon fantasma',
    routeSearch: 'watchtower-ruins',
  },
  {
    chapterKey: 'wildAreaSouth',
    type: 'capture',
    title: 'Captura: Lago Axew (este)',
    subtitle: 'Ribera este con variedad de encuentros acuáticos y de orilla',
    routeSearch: 'east-lake-axewell',
  },
  {
    chapterKey: 'wildAreaSouth',
    type: 'capture',
    title: 'Captura: Lago Axew (oeste)',
    subtitle: 'Zona de orilla con acceso a la entrada sur de Motostoke',
    routeSearch: 'west-lake-axewell',
  },
  {
    chapterKey: 'wildAreaSouth',
    type: 'capture',
    title: 'Captura: Lago Milotic (sur)',
    subtitle: 'Aguas cristalinas custodiadas por poderosas especies',
    routeSearch: 'south-lake-miloch',
  },
  {
    chapterKey: 'wildAreaSouth',
    type: 'capture',
    title: 'Captura: Silla del Gigante',
    subtitle: 'Colina rocosa con vistas panorámicas de todo el sur',
    routeSearch: 'giant-s-seat',
  },
  {
    chapterKey: 'wildAreaSouth',
    type: 'capture',
    title: 'Captura: Lago Milotic (norte)',
    subtitle: 'Paso previo a las puertas de la gran metrópoli industrial',
    routeSearch: 'north-lake-miloch',
  },
  {
    chapterKey: 'wildAreaSouth',
    type: 'capture',
    title: 'Captura: Ciudad Pistón',
    subtitle: 'Canales fluviales y dársena acuática de la gran metrópoli de vapor',
    routeSearch: 'city-of-motostoke',
  },
  {
    chapterKey: 'wildAreaSouth',
    type: 'battle',
    title: 'Combate Rival: Hop (Paúl) #2',
    subtitle: 'Paúl te intercepta en la entrada de Ciudad Pistón antes de la ceremonia',
    battleId: 'hop-motostoke',
  },

  // --- CAPÍTULO 3: GIMNASIO HOYUELO (PLANTA) ---
  {
    chapterKey: 'gym1',
    type: 'capture',
    title: 'Captura: Ruta 3',
    subtitle: 'Ruta sinuosa que asciende hacia la primera explotación minera',
    routeSearch: 'route-3',
  },
  {
    chapterKey: 'gym1',
    type: 'capture',
    title: 'Captura: Mina de Galar',
    subtitle: 'Túneles iluminados por cristales multicolores y vagonetas',
    routeSearch: 'galar-mine',
  },
  {
    chapterKey: 'gym1',
    type: 'battle',
    title: 'Combate Rival: Berto (Bede) #1',
    subtitle: 'El orgulloso protegido del Presidente Rose te desafía dentro de la mina',
    battleId: 'bede-galar-mine',
  },
  {
    chapterKey: 'gym1',
    type: 'capture',
    title: 'Captura: Ruta 4',
    subtitle: 'Campos dorados de trigo a las afueras de Pueblo Hoyuelo',
    routeSearch: 'route-4',
  },
  {
    chapterKey: 'gym1',
    type: 'capture',
    title: 'Captura: Pueblo Hoyuelo',
    subtitle: 'Pueblo de los geoglifos milenarios, encuentros e intercambios',
    routeSearch: 'turffield',
  },
  {
    chapterKey: 'gym1',
    type: 'battle',
    title: 'Líder de Gimnasio: Milo (Percy) 🏅',
    subtitle: 'Gimnasio Hoyuelo: Tu primera prueba oficial por la Medalla Planta',
    battleId: 'gym-milo',
  },

  // --- CAPÍTULO 4: GIMNASIO PLIÉ (AGUA) ---
  {
    chapterKey: 'gym2',
    type: 'capture',
    title: 'Captura: Ruta 5',
    subtitle: 'Gran puente transitado que cruza hacia la costa de Pueblo Amura',
    routeSearch: 'route-5',
  },
  {
    chapterKey: 'gym2',
    type: 'battle',
    title: 'Combate Rival: Hop (Paúl) #3',
    subtitle: 'Paúl te reta en mitad del puente de Ruta 5 para medir tu progreso',
    battleId: 'hop-route-5',
  },
  {
    chapterKey: 'gym2',
    type: 'capture',
    title: 'Captura: Pueblo Amura',
    subtitle: 'Pesca en los muelles y faro de la pintoresca ciudad portuaria',
    routeSearch: 'town-of-hulbury',
  },
  {
    chapterKey: 'gym2',
    type: 'battle',
    title: 'Líder de Gimnasio: Nessa (Cathy) 🏅',
    subtitle: 'Gimnasio Plié: Domina las corrientes marinas y consigue la Medalla Agua',
    battleId: 'gym-nessa',
  },

  // --- CAPÍTULO 5: GIMNASIO PISTÓN (FUEGO) ---
  {
    chapterKey: 'gym3',
    type: 'capture',
    title: 'Captura: Segunda Mina de Galar',
    subtitle: 'Caverna subterránea con pozas de agua y túneles húmedos',
    routeSearch: 'galar-mine-no--2',
  },
  {
    chapterKey: 'gym3',
    type: 'battle',
    title: 'Combate Rival: Berto (Bede) #2',
    subtitle: 'Berto reaparece a la salida de la mina buscando estrellas de deseo',
    battleId: 'bede-galar-mine-2',
  },
  {
    chapterKey: 'gym3',
    type: 'capture',
    title: 'Captura: Afueras de Pistón',
    subtitle: 'Orilla exterior que rodea los muros este de Ciudad Pistón',
    routeSearch: 'motostoke-outskirts',
  },
  {
    chapterKey: 'gym3',
    type: 'battle',
    title: 'Combate Rival: Roxy (Marnie) #1',
    subtitle: 'Duelo en el vestíbulo del Hotel Budew Drop Inn frente al Team Yell',
    battleId: 'marnie-budew-inn',
  },
  {
    chapterKey: 'gym3',
    type: 'battle',
    title: 'Líder de Gimnasio: Kabu 🏅',
    subtitle: 'Gimnasio Pistón: El veterano maestro del fuego y la Medalla Fuego',
    battleId: 'gym-kabu',
  },

  // --- CAPÍTULO 6: GIMNASIO LADERA (FANTASMA) ---
  {
    chapterKey: 'gym4',
    type: 'capture',
    title: 'Captura: Ribera de Pistón',
    subtitle: 'Orilla norte con vistas a las vías del tren y aguas del río',
    routeSearch: 'motostoke-riverbank',
  },
  {
    chapterKey: 'gym4',
    type: 'capture',
    title: 'Captura: Valle Entrepuentes',
    subtitle: 'Valle atravesado por dos inmensos acueductos de piedra',
    routeSearch: 'bridge-field',
  },
  {
    chapterKey: 'gym4',
    type: 'capture',
    title: 'Captura: Llanura Pétrea',
    subtitle: 'Extensión pedregosa con ruinas antiguas y clima severo',
    routeSearch: 'stony-wilderness',
  },
  {
    chapterKey: 'gym4',
    type: 'capture',
    title: 'Captura: Cuenca Polvorienta',
    subtitle: 'Depresión árida propensa a intensas tormentas de arena',
    routeSearch: 'dusty-bowl',
  },
  {
    chapterKey: 'gym4',
    type: 'capture',
    title: 'Captura: Espejo del Gigante',
    subtitle: 'Lago interior sereno frente a las murallas de Artejo',
    routeSearch: 'giant-s-mirror',
  },
  {
    chapterKey: 'gym4',
    type: 'capture',
    title: 'Captura: Ruta 6',
    subtitle: 'Paso montañoso escarpado que asciende hacia Pueblo Ladera',
    routeSearch: 'route-6',
  },
  {
    chapterKey: 'gym4',
    type: 'capture',
    title: 'Captura: Pueblo Ladera',
    subtitle: 'Regalo de Toxel en la guardería e intercambios junto al histórico mural',
    routeSearch: 'stow-on-side',
  },
  {
    chapterKey: 'gym4',
    type: 'battle',
    title: 'Combate Rival: Hop (Paúl) #4',
    subtitle: 'Duelo emocional en Pueblo Ladera tras sus dudas sobre su rendimiento',
    battleId: 'hop-stow-on-side',
  },
  {
    chapterKey: 'gym4',
    type: 'battle',
    title: 'Líder de Gimnasio: Allister (Alistair) 🏅',
    subtitle: 'Gimnasio Ladera: Exclusivo de Escudo, combate sombrío por la Medalla Fantasma',
    battleId: 'gym-allister',
  },
  {
    chapterKey: 'gym4',
    type: 'battle',
    title: 'Combate Rival: Berto (Bede) #3',
    subtitle: 'Enfrentamiento en las ruinas del mural histórico de Ladera',
    battleId: 'bede-stow-on-side',
  },

  // --- CAPÍTULO 7: GIMNASIO BALLONLEA (HADA) ---
  {
    chapterKey: 'gym5',
    type: 'capture',
    title: 'Captura: Bosque Lumirinto',
    subtitle: 'Bosque mágico iluminado por setas fluorescentes y criaturas feéricas',
    routeSearch: 'glimwood',
  },
  {
    chapterKey: 'gym5',
    type: 'capture',
    title: 'Captura: Pueblo Plié',
    subtitle: 'Villa mágica de setas bioluminiscentes e intercambio de Yamask de Teselia',
    routeSearch: 'ballonlea',
  },
  {
    chapterKey: 'gym5',
    type: 'battle',
    title: 'Líder de Gimnasio: Opal (Sally) 🏅',
    subtitle: 'Gimnasio Plié: La prueba teatral con preguntas y la codiciada Medalla Hada',
    battleId: 'gym-opal',
  },

  // --- CAPÍTULO 8: GIMNASIO AURIGA (HIELO) ---
  {
    chapterKey: 'gym6',
    type: 'capture',
    title: 'Captura: Ciudad Artejo',
    subtitle: 'Imponente fortaleza medieval, regalo de Togepi e intercambios',
    routeSearch: 'hammerlocke',
  },
  {
    chapterKey: 'gym6',
    type: 'capture',
    title: 'Captura: Ruta 7',
    subtitle: 'Ruta corta que bordea las colinas hacia la tundra gélida',
    routeSearch: 'route-7',
  },
  {
    chapterKey: 'gym6',
    type: 'capture',
    title: 'Captura: Ruta 8 y Senda Vaporosa',
    subtitle: 'Ascenso helado con ruinas antiguas cubiertas de escarcha',
    routeSearch: 'route-8',
  },
  {
    chapterKey: 'gym6',
    type: 'capture',
    title: 'Captura: Pueblo Auriga',
    subtitle: 'Plaza de los baños termales, hotel e intercambios en el pueblo helado',
    routeSearch: 'circhester',
  },
  {
    chapterKey: 'gym6',
    type: 'battle',
    title: 'Combate Rival: Hop (Paúl) #5',
    subtitle: 'Paúl recupera su determinación y te reta en las puertas de Artejo',
    battleId: 'hop-hammerlocke',
  },
  {
    chapterKey: 'gym6',
    type: 'battle',
    title: 'Líder de Gimnasio: Melony (Mel) 🏅',
    subtitle: 'Gimnasio Auriga: Exclusivo de Escudo, hielo implacable por la Medalla Hielo',
    battleId: 'gym-melony',
  },
  {
    chapterKey: 'gym6',
    type: 'battle',
    title: 'Combate Rival: Hop (Paúl) #6',
    subtitle: 'Duelo amistoso junto a los baños termales de Pueblo Auriga',
    battleId: 'hop-circhester',
  },

  // --- CAPÍTULO 9: GIMNASIO CRAMPÓN (SINIESTRO) ---
  {
    chapterKey: 'gym7',
    type: 'capture',
    title: 'Captura: Ruta 9 (Bahía y Afueras)',
    subtitle: 'Frías aguas costeras y el callejón de entrada a Pueblo Crampón',
    routeSearch: 'route-9',
  },
  {
    chapterKey: 'gym7',
    type: 'capture',
    title: 'Captura: Pueblo Crampón',
    subtitle: 'Callejón de luces de neón del Team Yell e intercambio de Mr. Mime de Kanto',
    routeSearch: 'spikemuth',
  },
  {
    chapterKey: 'gym7',
    type: 'battle',
    title: 'Líder de Gimnasio: Piers (Nerio) 🏅',
    subtitle: 'Gimnasio Crampón: Combate puro sin fenómeno Dinamax por la Medalla Siniestro',
    battleId: 'gym-piers',
  },
  {
    chapterKey: 'gym7',
    type: 'battle',
    title: 'Combate Rival: Roxy (Marnie) #2',
    subtitle: 'Roxy te despide de su ciudad natal con un feroz duelo en Ruta 9',
    battleId: 'marnie-route-9',
  },

  // --- CAPÍTULO 10: GIMNASIO ARTEJO (DRAGÓN) ---
  {
    chapterKey: 'gym8',
    type: 'capture',
    title: 'Captura: Gorro del Gigante',
    subtitle: 'Meseta elevada frecuentada por dragones y climas extremos',
    routeSearch: 'giant-s-cap',
  },
  {
    chapterKey: 'gym8',
    type: 'capture',
    title: 'Captura: Cornisa de Artejo',
    subtitle: 'Colinas ventosas que bordean la imponente fortaleza medieval',
    routeSearch: 'hammerlocke-hills',
  },
  {
    chapterKey: 'gym8',
    type: 'capture',
    title: 'Captura: Lago del Enfado',
    subtitle: 'Zona de alto nivel con un círculo de monolitos y Pokémon raros',
    routeSearch: 'lake-of-outrage',
  },
  {
    chapterKey: 'gym8',
    type: 'battle',
    title: 'Líder de Gimnasio: Raihan (Roy) 🏅',
    subtitle: 'Gimnasio Artejo: Combate doble con sinergia de climas por la Medalla Dragón',
    battleId: 'gym-raihan',
  },

  // --- CAPÍTULO 11: RUTA 10 Y MACRO COSMOS ---
  {
    chapterKey: 'macroCosmos',
    type: 'capture',
    title: 'Captura: Ruta 10',
    subtitle: 'Sendero de nieve perpetua que conduce a la majestuosa Ciudad Puntera',
    routeSearch: 'route-10',
  },
  {
    chapterKey: 'macroCosmos',
    type: 'capture',
    title: 'Captura: Ciudad Puntera',
    subtitle: 'Capital moderna de Galar, regalo de Código Cero en la Torre Batalla e intercambios',
    routeSearch: 'wyndon',
  },
  {
    chapterKey: 'macroCosmos',
    type: 'battle',
    title: 'Jefe Macro Cosmos: Olivia (Oleana)',
    subtitle: 'Combate en la cima de la Torre Rose para detener el plan de emergencia',
    battleId: 'boss-oleana',
  },
  {
    chapterKey: 'macroCosmos',
    type: 'battle',
    title: 'Presidente Macro Cosmos: Rose',
    subtitle: 'Duelo crucial en la Planta de Energía para salvar el futuro de Galar',
    battleId: 'boss-rose',
  },

  // --- CAPÍTULO 12: COPA DE CAMPEONES ---
  {
    chapterKey: 'championsCup',
    type: 'battle',
    title: 'Copa de Campeones: Roxy (Marnie) 🏆',
    subtitle: 'Semifinal de la copa en el gran estadio repleto de hinchas',
    battleId: 'cup-marnie',
  },
  {
    chapterKey: 'championsCup',
    type: 'battle',
    title: 'Copa de Campeones: Hop (Paúl) 🏆',
    subtitle: 'La esperada semifinal entre dos amigos que comenzaron juntos en Postaw',
    battleId: 'cup-hop',
  },
  {
    chapterKey: 'championsCup',
    type: 'battle',
    title: 'Copa de Campeones: Berto (Bede) 🏆',
    subtitle: 'Berto irrumpe con su nuevo uniforme de líder de gimnasio tipo Hada',
    battleId: 'cup-bede',
  },
  {
    chapterKey: 'championsCup',
    type: 'battle',
    title: 'Gran Final de Galar: Campeón Lionel (Leon) 👑',
    subtitle: 'El combate definitivo por el trono de Galar frente a su Charizard Gigamax',
    battleId: 'cup-leon',
  },

  // --- CAPÍTULO 13: EPÍLOGO Y DUELO LEGENDARIO ---
  {
    chapterKey: 'epilogue',
    type: 'capture',
    title: 'Captura: Bosque Onírico (Profundidades)',
    subtitle: 'Santuario ancestral donde yacen la Espada y el Escudo oxidados',
    routeSearch: 'slumbering-weald--high-level-',
  },
  {
    chapterKey: 'epilogue',
    type: 'battle',
    title: 'Epílogo Legendario: Hop (Paúl) 🐺',
    subtitle: 'Combate final en el altar del Bosque Onírico con el legendario Zacian/Zamazenta',
    battleId: 'boss-hop-slumbering',
  },
];

/**
 * Builds the complete unified Story Timeline:
 * - In Blessed Shield: matches the canonical adventure progression weaving captures and battles.
 * - In other game tenants: sequences all available routes chronologically.
 */
export function buildStoryTimeline(
  activeTenant: GameTenant,
  trainerBattles: TrainerBattle[] = BLESSED_SHIELD_TRAINER_BATTLES
): StoryTimelineItem[] {
  const routes = activeTenant.routes || [];

  // Helper to match a route from a search query
  const findRoute = (query: string): RouteData | undefined => {
    const q = query.toLowerCase().replace(/[^a-z0-9]/g, '');
    return routes.find((r) => {
      const idClean = r.id.toLowerCase().replace(/[^a-z0-9]/g, '');
      const nameClean = r.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const enClean = (r.englishName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return idClean.includes(q) || nameClean.includes(q) || enClean.includes(q);
    });
  };

  const battlesMap = new Map<string, TrainerBattle>();
  trainerBattles.forEach((b) => battlesMap.set(b.id, b));

  if (activeTenant.id === 'blessed-shield') {
    const items: StoryTimelineItem[] = [];
    const usedRouteIds = new Set<string>();

    let stepCounter = 1;

    for (const bp of BLESSED_SHIELD_BLUEPRINT) {
      const chapter = STORY_CHAPTERS[bp.chapterKey] || STORY_CHAPTERS.prologue;

      if (bp.type === 'capture' && bp.routeSearch) {
        const route = findRoute(bp.routeSearch);
        if (route) {
          usedRouteIds.add(route.id);
          items.push({
            id: `story-route-${route.id}`,
            type: 'capture',
            stepNumber: stepCounter++,
            chapter,
            title: bp.title,
            subtitle: bp.subtitle,
            location: route.name,
            locationEnglish: route.englishName,
            minLevel: route.minLevel === 999 ? bp.fallbackMinLevel || 5 : route.minLevel,
            maxLevel: route.maxLevel === 999 ? bp.fallbackMaxLevel || 10 : route.maxLevel,
            routeData: route,
          });
        }
      } else if (bp.type === 'battle' && bp.battleId) {
        const battle = battlesMap.get(bp.battleId);
        if (battle) {
          items.push({
            id: `story-battle-${battle.id}`,
            type: 'battle',
            stepNumber: stepCounter++,
            chapter,
            title: bp.title,
            subtitle: bp.subtitle,
            location: battle.location,
            locationEnglish: battle.locationEnglish,
            minLevel: battle.minLevel,
            maxLevel: battle.maxLevel,
            battleData: battle,
          });
        }
      }
    }

    // Append any extra routes that weren't in the canonical list (e.g. specialized Wild Area corners)
    const leftoverRoutes = routes.filter((r) => !usedRouteIds.has(r.id));
    if (leftoverRoutes.length > 0) {
      const extraChapter: StoryChapter = {
        id: 'extraRoutes',
        order: 14,
        title: 'Exploración Extra: Rincones de Galar',
        subtitle: 'Zonas adicionales del Área Silvestre y rutas complementarias',
        badgeName: 'Exploración Libre',
        badgeColor: 'bg-teal-600',
        iconType: 'compass',
      };

      leftoverRoutes.forEach((route) => {
        items.push({
          id: `story-route-${route.id}`,
          type: 'capture',
          stepNumber: stepCounter++,
          chapter: extraChapter,
          title: `Captura: ${route.name}`,
          subtitle: `Encuentros salvajes en ${route.englishName || route.name}`,
          location: route.name,
          locationEnglish: route.englishName,
          minLevel: route.minLevel === 999 ? 15 : route.minLevel,
          maxLevel: route.maxLevel === 999 ? 25 : route.maxLevel,
          routeData: route,
        });
      });
    }

    return items;
  }

  // Fallback for custom or other game tenants (Radical Red, Renegade Platinum, Emerald):
  // Generate chronological route capture items
  return routes.map((route, idx) => {
    const chapterIndex = Math.min(13, Math.floor((idx / Math.max(1, routes.length)) * 13) + 1);
    const chapterKeys = Object.keys(STORY_CHAPTERS);
    const chapterKey = chapterKeys[Math.min(chapterKeys.length - 1, chapterIndex - 1)];
    const chapter = STORY_CHAPTERS[chapterKey] || STORY_CHAPTERS.prologue;

    return {
      id: `story-route-${route.id}`,
      type: 'capture',
      stepNumber: idx + 1,
      chapter,
      title: `Captura: ${route.name}`,
      subtitle: `Tabla de encuentros y ruleta para ${route.englishName || route.name}`,
      location: route.name,
      locationEnglish: route.englishName,
      minLevel: route.minLevel === 999 ? 5 : route.minLevel,
      maxLevel: route.maxLevel === 999 ? 10 : route.maxLevel,
      routeData: route,
    };
  });
}
