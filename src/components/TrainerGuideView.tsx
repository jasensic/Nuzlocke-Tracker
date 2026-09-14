import React, { useState, useMemo } from 'react';
import { GameTenant, StarterChoice, TrainerBattle, TrainerCategory } from '../types';
import { BLESSED_SHIELD_TRAINER_BATTLES } from '../data/trainers/blessedShieldTrainers';
import {
  STARTERS_INFO,
  TRAINERS_META,
  translateAbility,
  getItemInfo,
  getMoveInfo,
  getTrainerMeta,
} from '../data/trainers/trainerTranslations';
import { TrainerBattleCard } from './TrainerBattleCard';
import {
  Swords,
  Search,
  ArrowUpDown,
  Filter,
  Flame,
  Leaf,
  Droplets,
  AlertCircle,
  Gamepad2,
  Sparkles,
  ChevronRight,
  Shield,
  CheckCircle2,
  Award,
  Trophy,
  Zap,
} from 'lucide-react';

const STARTER_STORAGE_KEY = 'pokemon_starter_choice_v1';

interface TrainerGuideViewProps {
  activeTenant: GameTenant;
  onOpenTenantModal: () => void;
  onSelectBlessedShieldTenant?: () => void;
}

export const TrainerGuideView: React.FC<TrainerGuideViewProps> = ({
  activeTenant,
  onOpenTenantModal,
  onSelectBlessedShieldTenant,
}) => {
  // Starter choice saved in localStorage
  const [starterChoice, setStarterChoice] = useState<StarterChoice>(() => {
    try {
      const saved = localStorage.getItem(STARTER_STORAGE_KEY) as StarterChoice;
      if (saved === 'grookey' || saved === 'scorbunny' || saved === 'sobble') {
        return saved;
      }
    } catch {}
    return 'grookey';
  });

  const handleSelectStarter = (starter: StarterChoice) => {
    setStarterChoice(starter);
    try {
      localStorage.setItem(STARTER_STORAGE_KEY, starter);
    } catch {}
  };

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Category filter ('all' | 'gym_leader' | 'rival' | 'champions_cup' | 'boss')
  const [categoryFilter, setCategoryFilter] = useState<TrainerCategory>('all');

  // Trainer filter
  const [trainerFilter, setTrainerFilter] = useState<string>('all');

  // Sort direction: ascending by level (default, "de abajo arriba por nivel, igual que las rutas") or descending
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter and sort the battles
  const filteredBattles = useMemo(() => {
    let list = [...BLESSED_SHIELD_TRAINER_BATTLES];

    // Filter by Category
    if (categoryFilter !== 'all') {
      list = list.filter((b) => b.category === categoryFilter);
    }

    // Filter by Trainer
    if (trainerFilter !== 'all') {
      list = list.filter((b) => b.trainerId === trainerFilter);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((b) => {
        const matchesLocation =
          b.location.toLowerCase().includes(q) ||
          b.locationEnglish.toLowerCase().includes(q);
        const matchesTrainer =
          b.trainerName.toLowerCase().includes(q) ||
          b.trainerTitle.toLowerCase().includes(q);

        const currentTeam = b.starterVariants
          ? b.starterVariants[starterChoice] || []
          : b.fixedTeam || [];

        const matchesPokemon = currentTeam.some((p) => {
          const pName = p.name.toLowerCase();
          const abilityEs = translateAbility(p.ability).toLowerCase();
          const abilityEn = p.ability.toLowerCase();
          const item = getItemInfo(p.item);
          const itemEs = item.name.toLowerCase();
          const itemEn = item.original.toLowerCase();
          const movesMatch = p.moves.some((m) => {
            const moveInfo = getMoveInfo(m);
            return (
              moveInfo.spanishName.toLowerCase().includes(q) ||
              moveInfo.originalName.toLowerCase().includes(q) ||
              moveInfo.type.toLowerCase().includes(q)
            );
          });

          return (
            pName.includes(q) ||
            abilityEs.includes(q) ||
            abilityEn.includes(q) ||
            itemEs.includes(q) ||
            itemEn.includes(q) ||
            movesMatch
          );
        });

        return matchesLocation || matchesTrainer || matchesPokemon;
      });
    }

    // Sort by level ascending (de menor a mayor nivel) or descending
    list.sort((a, b) => {
      const avgA = (a.minLevel + a.maxLevel) / 2;
      const avgB = (b.minLevel + b.maxLevel) / 2;
      return sortOrder === 'asc' ? avgA - avgB : avgB - avgA;
    });

    return list;
  }, [categoryFilter, trainerFilter, searchQuery, sortOrder, starterChoice]);

  // Unique trainers in current category for quick sub-filter chips
  const availableTrainers = useMemo(() => {
    const subset =
      categoryFilter === 'all'
        ? BLESSED_SHIELD_TRAINER_BATTLES
        : BLESSED_SHIELD_TRAINER_BATTLES.filter((b) => b.category === categoryFilter);

    const map = new Map<string, { id: string; name: string; count: number }>();
    subset.forEach((b) => {
      const meta = getTrainerMeta(b.trainerId);
      const current = map.get(b.trainerId) || { id: b.trainerId, name: meta.spanishName, count: 0 };
      current.count += 1;
      map.set(b.trainerId, current);
    });

    return Array.from(map.values());
  }, [categoryFilter]);

  const isBlessedShield = activeTenant.id === 'blessed-shield';

  // Quick jump to battle
  const handleScrollToBattle = (id: string) => {
    const el = document.getElementById(`trainer-battle-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div id="trainer-guide-view" className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                <Swords className="w-6 h-6 text-red-500" />
                Guía de Combates de Entrenadores
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/70 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs font-black">
                Mod Blessed Shield
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              Equipos completos, niveles, objetos con sprites, habilidades y movimientos con colores por tipo en español para preparar tus combates y planificar tu Nuzlocke.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <button
              type="button"
              onClick={onOpenTenantModal}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Gamepad2 className="w-4 h-4 text-indigo-500" />
              <span>Juego: {activeTenant.shortName}</span>
            </button>
          </div>
        </div>

        {/* Notice if not on Blessed Shield */}
        {!isBlessedShield && (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span>
                Actualmente tienes seleccionado <strong>{activeTenant.name}</strong>. Esta guía de entrenadores contiene los datos específicos del mod <strong>Pokémon Blessed Shield</strong>.
              </span>
            </div>
            {onSelectBlessedShieldTenant && (
              <button
                type="button"
                onClick={onSelectBlessedShieldTenant}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors text-xs flex-shrink-0 self-start sm:self-auto"
              >
                Cambiar a Blessed Shield
              </button>
            )}
          </div>
        )}
      </div>

      {/* 1. STARTER SELECTION (Mandatory first choice) */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
              1
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              Elige tu Inicial de Galar (Los equipos de tu rival Paúl cambian según tu elección):
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Inicial actual: <strong className="text-slate-800 dark:text-slate-200">{STARTERS_INFO[starterChoice].name}</strong>
          </span>
        </div>

        {/* Starter Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['grookey', 'scorbunny', 'sobble'] as StarterChoice[]).map((stKey) => {
            const starter = STARTERS_INFO[stKey];
            const isSelected = starterChoice === stKey;

            return (
              <button
                key={stKey}
                type="button"
                onClick={() => handleSelectStarter(stKey)}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3.5 select-none ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/90 dark:bg-indigo-950/60 shadow-xs ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {/* Starter Sprite */}
                <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 flex-shrink-0 flex items-center justify-center p-1 overflow-hidden">
                  <img
                    src={starter.showdown}
                    alt={starter.name}
                    className="w-full h-full object-contain pixelated"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-black text-sm text-slate-900 dark:text-white">
                      {starter.name}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${starter.typeColor}`}>
                      {starter.type}
                    </span>
                    {stKey === 'grookey' && <Leaf className="w-3 h-3 text-emerald-500" />}
                    {stKey === 'scorbunny' && <Flame className="w-3 h-3 text-orange-500" />}
                    {stKey === 'sobble' && <Droplets className="w-3 h-3 text-blue-500" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    Paúl usará a <strong>{starter.hopStarterName}</strong> ({starter.hopStarterType})
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. QUICK JUMP CAROUSEL (Combates ordenados por nivel) */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 flex-wrap gap-2">
          <span className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
            Progreso por Niveles ({filteredBattles.length} combates visibles • {sortOrder === 'asc' ? 'Nv. Ascendente' : 'Nv. Descendente'}):
          </span>
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Invertir Orden ({sortOrder === 'asc' ? 'Nv. 11 ➔ Nv. 90' : 'Nv. 90 ➔ Nv. 11'})
          </button>
        </div>

        {/* Carousel pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scroll-smooth scrollbar-thin">
          {filteredBattles.map((b) => {
            const trainerMeta = getTrainerMeta(b.trainerId);
            return (
              <button
                key={`pill-${b.id}`}
                type="button"
                onClick={() => handleScrollToBattle(b.id)}
                className="flex-shrink-0 px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all flex items-center gap-2 shadow-2xs hover:shadow-xs group text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden p-0.5">
                  <img
                    src={trainerMeta.avatarUrl}
                    alt={trainerMeta.spanishName}
                    className="w-full h-full object-contain pixelated"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {trainerMeta.spanishName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">#{b.order}</span>
                  </div>
                  <div className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                    Nv. {b.minLevel}-{b.maxLevel} • {b.location.split(' ')[0]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. CATEGORY TABS & FILTERS */}
      <div className="space-y-3">
        {/* Category Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-x-auto gap-1 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setCategoryFilter('all');
              setTrainerFilter('all');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              categoryFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Todos ({BLESSED_SHIELD_TRAINER_BATTLES.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCategoryFilter('gym_leader');
              setTrainerFilter('all');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              categoryFilter === 'gym_leader'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Líderes de Gimnasio (8)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCategoryFilter('rival');
              setTrainerFilter('all');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              categoryFilter === 'rival'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Rivales (11)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCategoryFilter('champions_cup');
              setTrainerFilter('all');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              categoryFilter === 'champions_cup'
                ? 'bg-white dark:bg-slate-900 text-yellow-600 dark:text-yellow-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
            <span>Copa de Campeones (4)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCategoryFilter('boss');
              setTrainerFilter('all');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              categoryFilter === 'boss'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-rose-500" />
            <span>Jefes de Historia (3)</span>
          </button>
        </div>

        {/* Sub-Filter Trainer Chips (if more than 1 trainer in category) */}
        {availableTrainers.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Filtrar por:</span>
            <button
              type="button"
              onClick={() => setTrainerFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
                trainerFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Todos
            </button>
            {availableTrainers.map((t) => (
              <button
                key={`trainer-chip-${t.id}`}
                type="button"
                onClick={() => setTrainerFilter(trainerFilter === t.id ? 'all' : t.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
                  trainerFilter === t.id
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{t.name}</span>
                <span className="text-[10px] opacity-75 font-normal">({t.count})</span>
              </button>
            ))}
          </div>
        )}

        {/* Search Bar & Order Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por Pokémon, movimiento, habilidad, objeto o gimnasio..."
              className="w-full pl-9.5 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Level Order Toggle Button */}
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 shadow-2xs flex-shrink-0"
            title="Cambiar orden de niveles"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
            <span>
              {sortOrder === 'asc' ? 'Nv. Ascendente' : 'Nv. Descendente'}
            </span>
          </button>
        </div>
      </div>

      {/* 4. TRAINER BATTLES LIST */}
      <div className="space-y-6">
        {filteredBattles.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800 space-y-3">
            <Swords className="w-10 h-10 mx-auto text-slate-400" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              No se encontraron combates
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No hay ningún combate que coincida con el criterio de búsqueda "{searchQuery}".
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setTrainerFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          filteredBattles.map((battle, idx) => (
            <TrainerBattleCard
              key={battle.id}
              battle={battle}
              starterChoice={starterChoice}
              index={idx}
            />
          ))
        )}
      </div>
    </div>
  );
};
