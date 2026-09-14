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
import { TypeBadge } from './TypeBadge';
import {
  cn,
  panel,
  panelLg,
  card,
  btn,
  iconBtn,
  pill,
  text,
  field,
  layout,
  segmented,
  filterChip,
  spriteFrame,
  emptyState,
  focusRing,
  TONES,
} from '../utils/ui';

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
    <div id="trainer-guide-view" className={layout.view}>
      {/* Top Banner / Hero */}
      <div className={panelLg()}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h2 className={cn(text.pageTitle, 'flex items-center gap-2.5')}>
                <Swords className={cn('w-6 h-6', TONES.accent.ink)} />
                Guía de Combates de Entrenadores
              </h2>
              <span className={pill('accent', 'sm')}>
                Mod Blessed Shield
              </span>
            </div>
            <p className="text-xs sm:text-sm text-brand-txt2 max-w-2xl">
              Equipos completos, niveles, objetos con sprites, habilidades y movimientos con colores por tipo en español para preparar tus combates y planificar tu Nuzlocke.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <button
              type="button"
              onClick={onOpenTenantModal}
              className={btn('secondary', 'md')}
            >
              <Gamepad2 className={cn('w-4 h-4', TONES.info.ink)} />
              <span>Juego: {activeTenant.shortName}</span>
            </button>
          </div>
        </div>

        {/* Notice if not on Blessed Shield */}
        {!isBlessedShield && (
          <div
            className={card({
              tone: 'warning',
              padding: 'compact',
              extra: 'mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs',
            })}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className={cn('w-4 h-4 shrink-0', TONES.warning.ink)} />
              <span>
                Actualmente tienes seleccionado <strong>{activeTenant.name}</strong>. Esta guía de entrenadores contiene los datos específicos del mod <strong>Pokémon Blessed Shield</strong>.
              </span>
            </div>
            {onSelectBlessedShieldTenant && (
              <button
                type="button"
                onClick={onSelectBlessedShieldTenant}
                className={btn('solid', 'sm', 'warning', 'shrink-0 self-start sm:self-auto')}
              >
                Cambiar a Blessed Shield
              </button>
            )}
          </div>
        )}
      </div>

      {/* 1. STARTER SELECTION (Mandatory first choice) */}
      <section className={panelLg('space-y-4')}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold', TONES.info.solid)}>
              1
            </span>
            <h3 className={text.sectionTitle}>
              Elige tu Inicial de Galar (Los equipos de tu rival Paúl cambian según tu elección):
            </h3>
          </div>
          <span className={cn(text.meta, 'font-semibold')}>
            Inicial actual: <strong className="text-brand-txt1">{STARTERS_INFO[starterChoice].name}</strong>
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
                className={cn(
                  card({ active: isSelected, interactive: !isSelected }),
                  'text-left flex items-center gap-3 select-none cursor-pointer',
                  focusRing
                )}
              >
                {/* Starter Sprite */}
                <div className={spriteFrame(false, 'w-14 h-14 p-1')}>
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
                    <span className="font-bold text-sm text-brand-txt1">
                      {starter.name}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className={cn('w-4 h-4 shrink-0', TONES.accent.ink)} />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <TypeBadge type={starter.type} />
                    {stKey === 'grookey' && <Leaf className="w-3 h-3 text-pokemon-planta" />}
                    {stKey === 'scorbunny' && <Flame className="w-3 h-3 text-pokemon-fuego" />}
                    {stKey === 'sobble' && <Droplets className="w-3 h-3 text-pokemon-agua" />}
                  </div>
                  <p className={cn(text.meta, 'mt-1 line-clamp-1')}>
                    Paúl usará a <strong>{starter.hopStarterName}</strong> ({starter.hopStarterType})
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. QUICK JUMP CAROUSEL (Combates ordenados por nivel) */}
      <section className={panel('space-y-3')}>
        <div className="flex items-center justify-between text-xs font-bold text-brand-txt1 flex-wrap gap-2">
          <span className="flex items-center gap-1.5">
            <ArrowUpDown className={cn('w-3.5 h-3.5', TONES.info.ink)} />
            Progreso por Niveles ({filteredBattles.length} combates visibles • {sortOrder === 'asc' ? 'Nv. Ascendente' : 'Nv. Descendente'}):
          </span>
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className={cn(text.link, 'text-[11px] flex items-center gap-1')}
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
                className={cn(
                  card({
                    interactive: true,
                    padding: 'none',
                    extra: 'shrink-0 px-3 py-2 flex items-center gap-2 text-left cursor-pointer group',
                  }),
                  focusRing
                )}
              >
                <div className="w-7 h-7 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center overflow-hidden p-0.5">
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
                    <span className="font-bold text-xs text-brand-txt1 group-hover:text-brand-accent-ink transition-colors">
                      {trainerMeta.spanishName}
                    </span>
                    <span className={cn(text.meta, 'font-bold')}>#{b.order}</span>
                  </div>
                  <div className={cn('text-[10px] font-semibold', TONES.info.ink)}>
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
        <div className={cn(segmented.group, 'max-w-full overflow-x-auto scrollbar-none')}>
          <button
            type="button"
            onClick={() => {
              setCategoryFilter('all');
              setTrainerFilter('all');
            }}
            className={segmented.item(categoryFilter === 'all')}
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
            className={segmented.item(categoryFilter === 'gym_leader')}
          >
            <Award className={cn('w-3.5 h-3.5', TONES.warning.ink)} />
            <span>Líderes de Gimnasio (8)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCategoryFilter('rival');
              setTrainerFilter('all');
            }}
            className={segmented.item(categoryFilter === 'rival')}
          >
            <Sparkles className={cn('w-3.5 h-3.5', TONES.info.ink)} />
            <span>Rivales (11)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCategoryFilter('champions_cup');
              setTrainerFilter('all');
            }}
            className={segmented.item(categoryFilter === 'champions_cup')}
          >
            <Trophy className={cn('w-3.5 h-3.5', TONES.warning.ink)} />
            <span>Copa de Campeones (4)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCategoryFilter('boss');
              setTrainerFilter('all');
            }}
            className={segmented.item(categoryFilter === 'boss')}
          >
            <Zap className={cn('w-3.5 h-3.5', TONES.danger.ink)} />
            <span>Jefes de Historia (3)</span>
          </button>
        </div>

        {/* Sub-Filter Trainer Chips (if more than 1 trainer in category) */}
        {availableTrainers.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className={cn(text.label, 'mr-1 shrink-0')}>Filtrar por:</span>
            <button
              type="button"
              onClick={() => setTrainerFilter('all')}
              className={filterChip(trainerFilter === 'all')}
            >
              Todos
            </button>
            {availableTrainers.map((t) => (
              <button
                key={`trainer-chip-${t.id}`}
                type="button"
                onClick={() => setTrainerFilter(trainerFilter === t.id ? 'all' : t.id)}
                className={filterChip(trainerFilter === t.id)}
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
          <div className={field.withIcon}>
            <Search className={field.icon} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por Pokémon, movimiento, habilidad, objeto o gimnasio..."
              className={cn(field.input, field.iconInputPad, 'pr-10')}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className={iconBtn('ghost', 'sm', 'neutral', 'absolute right-1.5 top-1/2 -translate-y-1/2')}
              >
                ✕
              </button>
            )}
          </div>

          {/* Level Order Toggle Button */}
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className={btn('secondary', 'md', 'accent', 'shrink-0')}
            title="Cambiar orden de niveles"
          >
            <ArrowUpDown className={cn('w-3.5 h-3.5', TONES.info.ink)} />
            <span>
              {sortOrder === 'asc' ? 'Nv. Ascendente' : 'Nv. Descendente'}
            </span>
          </button>
        </div>
      </div>

      {/* 4. TRAINER BATTLES LIST */}
      <div className="space-y-4">
        {filteredBattles.length === 0 ? (
          <div className={emptyState.wrapper}>
            <div className={emptyState.bubble}>
              <Swords className="w-6 h-6" />
            </div>
            <h3 className={emptyState.title}>
              No se encontraron combates
            </h3>
            <p className={emptyState.hint}>
              No hay ningún combate que coincida con el criterio de búsqueda "{searchQuery}".
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setTrainerFilter('all');
              }}
              className={btn('primary', 'sm')}
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
