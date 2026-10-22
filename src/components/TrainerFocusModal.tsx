import React, { useState, useEffect, useMemo } from 'react';
import { TrainerBattle, StarterChoice, TrainerPokemon } from '../types';
import { TrainerPokemonCard } from './TrainerPokemonCard';
import { STARTER_CHOICES, STARTERS_INFO, getTrainerMeta } from '../data/trainers/trainerTranslations';
import {
  Search,
  X,
  CheckCircle2,
  Swords,
  MapPin,
  Sparkles,
  ShieldAlert,
  Users,
  Leaf,
  Flame,
  Droplets,
  Layers,
} from 'lucide-react';
import {
  cn,
  btn,
  iconBtn,
  pill,
  pillSolid,
  pillShape,
  field,
  surface,
  TONES,
} from '../utils/ui';

interface TrainerFocusModalProps {
  isOpen: boolean;
  onClose: () => void;
  battle: TrainerBattle;
  starterChoice: StarterChoice;
  isDefeated?: boolean;
  onToggleDefeated?: (battleId: string) => void;
  onSelectStarter?: (starter: StarterChoice) => void;
}

export const TrainerFocusModal: React.FC<TrainerFocusModalProps> = ({
  isOpen,
  onClose,
  battle,
  starterChoice,
  isDefeated = false,
  onToggleDefeated,
  onSelectStarter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  const [activeStarter, setActiveStarter] = useState<StarterChoice>(starterChoice);

  // Sync internal starter choice with prop
  useEffect(() => {
    setActiveStarter(starterChoice);
  }, [starterChoice]);

  // Lock background scroll when focus mode is open & listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const trainerMeta = getTrainerMeta(battle.trainerId);

  // Active team based on selected starter variant
  const team = useMemo<TrainerPokemon[]>(() => {
    if (battle.starterVariants) {
      return battle.starterVariants[activeStarter] || battle.starterVariants.grookey || [];
    }
    return battle.fixedTeam || [];
  }, [battle, activeStarter]);

  // Filter Pokémon according to search query
  const filteredTeam = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return team;

    return team.filter((poke) => {
      const nameMatch = poke.name.toLowerCase().includes(q);
      const abilityMatch = (poke.ability || '').toLowerCase().includes(q);
      const itemMatch = (poke.item || '').toLowerCase().includes(q);
      const natureMatch = (poke.nature || '').toLowerCase().includes(q);
      const moveMatch = (poke.moves || []).some((m) => m.toLowerCase().includes(q));
      return nameMatch || abilityMatch || itemMatch || natureMatch || moveMatch;
    });
  }, [team, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col bg-brand-bg text-brand-txt1 animate-in fade-in duration-200 select-text"
    >
      {/* 1. TOP STICKY BAR: Title, Search, Starter Picker, Defeated toggle & Close */}
      <header className={cn('sticky top-0 z-30 w-full border-b border-brand-border shadow-sm', surface.header)}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Trainer Avatar & Title info */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                'w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center shrink-0 overflow-hidden shadow-xs',
                isDefeated ? TONES.success.soft : 'bg-brand-surface border-brand-border'
              )}
            >
              {trainerMeta.avatarUrl && !avatarError ? (
                <img
                  src={trainerMeta.avatarUrl}
                  alt={trainerMeta.spanishName}
                  onError={() => setAvatarError(true)}
                  className="w-full h-full object-contain pixelated"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : isDefeated ? (
                <CheckCircle2 className="w-5 h-5 text-status-live" />
              ) : (
                <Swords className={cn('w-5 h-5', TONES.accent.ink)} />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={pillSolid('accent', 'xs')}>Modo Focus</span>
                <h1 className="text-base sm:text-lg font-black text-brand-txt1 truncate">
                  {trainerMeta.spanishName ? `${trainerMeta.spanishName} (${trainerMeta.name})` : trainerMeta.name}
                </h1>
                <span className={pillShape('xs', trainerMeta.tagColor)}>
                  {trainerMeta.title}
                </span>
                {battle.isDoubleBattle && (
                  <span className={pill('info', 'xs')}>
                    <Users className="w-3 h-3" /> Doble
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-brand-txt2 mt-0.5 flex-wrap">
                <span className="flex items-center gap-1 font-medium text-brand-txt1">
                  <MapPin className="w-3 h-3 text-brand-accent" />
                  {battle.location}
                </span>
                <span>•</span>
                <span className={pill('info', 'xs')}>
                  Level Cap: Nv. {battle.maxLevel}
                </span>
                <span>•</span>
                <span>{team.length} Pokémon</span>
              </div>
            </div>
          </div>

          {/* Search bar inside the top header */}
          <div className="flex-1 max-w-md min-w-[200px]">
            <div className={field.withIcon}>
              <Search className={field.icon} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar movimientos, habilidades, objetos..."
                autoFocus
                className={cn(field.input, field.iconInputPad, 'py-1.5 text-xs sm:text-sm pr-8')}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={iconBtn('ghost', 'sm', 'neutral', 'absolute right-1.5 top-1/2 -translate-y-1/2')}
                  title="Limpiar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Actions: Starter switch, Mark Defeated, and Exit */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            {/* If rival team branches by starter */}
            {battle.starterVariants && (
              <div className="flex items-center gap-1 bg-brand-surface p-1 rounded-xl border border-brand-border">
                {STARTER_CHOICES.map((st) => {
                  const meta = STARTERS_INFO[st];
                  const isSelected = activeStarter === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setActiveStarter(st);
                        onSelectStarter?.(st);
                      }}
                      title={`Ver equipo para inicial ${meta.name}`}
                      className={cn(
                        'px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all',
                        isSelected
                          ? 'bg-brand-accent text-white shadow-xs'
                          : 'text-brand-txt2 hover:text-brand-txt1 hover:bg-brand-bg'
                      )}
                    >
                      {st === 'grookey' && <Leaf className="w-3 h-3" />}
                      {st === 'scorbunny' && <Flame className="w-3 h-3" />}
                      {st === 'sobble' && <Droplets className="w-3 h-3" />}
                      <span className="hidden sm:inline">{meta.name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Victory toggle */}
            {onToggleDefeated && (
              <button
                type="button"
                onClick={() => onToggleDefeated(battle.id)}
                className={btn(isDefeated ? 'solid' : 'secondary', 'sm', 'success')}
                title="Marcar o desmarcar combate como completado"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">{isDefeated ? 'Ganado' : 'Marcar Victoria'}</span>
              </button>
            )}

            {/* Exit Focus Mode */}
            <button
              type="button"
              onClick={onClose}
              className={btn('primary', 'sm', 'neutral')}
              title="Salir del Modo Focus (Esc)"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. BODY CONTENT: Distraction-free grid */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Battle alert / level cap banner */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-brand-surface border border-brand-border flex-wrap text-xs">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-brand-txt2">
                Combate de historia: Los niveles de tu equipo deben mantenerse por debajo o igual al Level Cap (<strong>Nv. {battle.maxLevel}</strong>).
              </span>
            </div>

            {searchQuery && (
              <div className="flex items-center gap-1.5 font-semibold text-brand-accent">
                <span>Resultados: {filteredTeam.length} de {team.length}</span>
              </div>
            )}
          </div>

          {/* Pokémon Grid */}
          {filteredTeam.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Layers className="w-10 h-10 mx-auto text-brand-txt2 opacity-40" />
              <p className="text-sm font-bold text-brand-txt1">
                No hay Pokémon que coincidan con &quot;{searchQuery}&quot; en este equipo.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className={btn('secondary', 'sm')}
              >
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeam.map((pokemon, idx) => (
                <TrainerPokemonCard
                  key={`focus-${battle.id}-${pokemon.name}-${idx}`}
                  pokemon={pokemon}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
