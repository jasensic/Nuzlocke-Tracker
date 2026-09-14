import React, { useState } from 'react';
import { TrainerBattle, StarterChoice } from '../types';
import { TrainerPokemonCard } from './TrainerPokemonCard';
import { TRAINERS_META, STARTERS_INFO, getTrainerMeta } from '../data/trainers/trainerTranslations';
import { usePokeDetail } from '../context/PokeDetailContext';
import {
  MapPin,
  Swords,
  ChevronDown,
  ChevronUp,
  User,
  Sparkles,
  Users,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { cn, card, btn, pill, pillSolid, pillShape, text, TONES } from '../utils/ui';
import { getPokemonSprite } from '../utils/pokemonMeta';

interface TrainerBattleCardProps {
  battle: TrainerBattle;
  starterChoice: StarterChoice;
  index: number;
  isDefeated?: boolean;
  onToggleDefeated?: (battleId: string) => void;
  compact?: boolean;
}

export const TrainerBattleCard: React.FC<TrainerBattleCardProps> = ({
  battle,
  starterChoice,
  index,
  isDefeated = false,
  onToggleDefeated,
  compact = false,
}) => {
  const { openDetail } = usePokeDetail();
  // Collapsed by default for maximum rendering performance & cleanliness
  const [isExpanded, setIsExpanded] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const trainerMeta = getTrainerMeta(battle.trainerId);

  // Determine which team to render based on starter or fixed
  const team = battle.starterVariants
    ? battle.starterVariants[starterChoice] || battle.starterVariants.grookey
    : battle.fixedTeam || [];

  const starterMeta = STARTERS_INFO[starterChoice];

  // Story-defining battles keep the accent emphasis until they are defeated
  const isMajorBattle = battle.category === 'boss' || battle.category === 'champions_cup';

  // Avatar frame shares the same tinting rule in both densities
  const avatarTone = isDefeated ? TONES.success.soft : 'bg-brand-surface border-brand-border';

  // COMPACT MODE: Space-saving combat card
  if (compact) {
    return (
      <article
        id={`trainer-battle-${battle.id}`}
        className={card({
          tone: isDefeated ? 'success' : 'neutral',
          active: !isDefeated && isMajorBattle,
          interactive: true,
          padding: 'compact',
          extra: 'scroll-mt-24',
        })}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                'w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 overflow-hidden',
                avatarTone
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
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Swords className={cn('w-4 h-4', TONES.accent.ink)} />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-sm text-brand-txt1 truncate">
                  {trainerMeta.spanishName || trainerMeta.name}
                </span>
                <span className={pillShape('xs', trainerMeta.tagColor)}>
                  {trainerMeta.title}
                </span>
                {isDefeated && (
                  <span className={cn('text-[10px] font-bold', TONES.success.ink)}>
                    ¡Superado!
                  </span>
                )}
              </div>
              <div className={cn(text.meta, 'flex items-center gap-1.5 mt-1 flex-wrap')}>
                <span>{battle.location}</span>
                <span>•</span>
                <span className={pill('info')}>Nv. {battle.minLevel}-{battle.maxLevel}</span>
                <span>•</span>
                <span>{team.length} Pokémon</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {onToggleDefeated && (
              <button
                type="button"
                onClick={() => onToggleDefeated(battle.id)}
                className={btn(isDefeated ? 'solid' : 'secondary', 'xs', 'success')}
              >
                <CheckCircle2 className={cn('w-3.5 h-3.5', !isDefeated && TONES.success.ink)} />
                <span>{isDefeated ? 'Ganado' : 'Victoria'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={btn('secondary', 'xs')}
            >
              <span>{isExpanded ? 'Ocultar' : 'Equipo'}</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Expanded team if user clicks Equipo in compact mode */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-brand-border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {team.map((pokemon, pIndex) => (
                <TrainerPokemonCard
                  key={`${battle.id}-compact-poke-${pIndex}-${pokemon.name}`}
                  pokemon={pokemon}
                />
              ))}
            </div>
          </div>
        )}
      </article>
    );
  }

  return (
    <article
      id={`trainer-battle-${battle.id}`}
      className={card({
        tone: isDefeated ? 'success' : 'neutral',
        active: !isDefeated && isMajorBattle,
        padding: 'none',
        extra: 'overflow-hidden scroll-mt-24',
      })}
    >
      {/* Top Card Header */}
      <div className="p-4 sm:p-5 border-b border-brand-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          {/* Trainer Avatar & Info */}
          <div className="flex items-center gap-3">
            {/* Avatar Container */}
            <div
              className={cn(
                'relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl border p-1 flex items-center justify-center overflow-hidden shadow-xs',
                avatarTone
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
              ) : (
                <User className="w-7 h-7 text-brand-txt2" />
              )}
              {/* Battle Order Badge */}
              <span
                className={pillSolid(
                  isDefeated ? 'success' : 'neutral',
                  'xs',
                  'absolute bottom-0.5 right-0.5 shadow-xs'
                )}
              >
                #{index + 1}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={text.sectionTitle}>
                  {trainerMeta.name} ({trainerMeta.spanishName})
                </h3>
                <span className={pillShape('xs', trainerMeta.tagColor)}>
                  {trainerMeta.title}
                </span>
                {battle.isDoubleBattle && (
                  <span className={pill('info')}>
                    <Users className="w-3 h-3" />
                    Combate Doble
                  </span>
                )}
                {isDefeated && (
                  <span className={pill('success')}>
                    <CheckCircle2 className="w-3 h-3" />
                    ¡Superado!
                  </span>
                )}
              </div>

              {/* Location and Level info */}
              <div className={cn(text.muted, 'flex items-center gap-3 mt-2 flex-wrap')}>
                <span className="flex items-center gap-1 font-semibold text-brand-txt1">
                  <MapPin className={cn('w-3.5 h-3.5', TONES.accent.ink)} />
                  {battle.location}
                  {battle.locationEnglish !== battle.location && (
                    <span className="text-brand-txt2 font-normal">({battle.locationEnglish})</span>
                  )}
                </span>
                <span className="text-brand-border">•</span>
                <span className={pill('info', 'sm')}>
                  Niveles {battle.minLevel} - {battle.maxLevel}
                </span>
                <span className="text-brand-border">•</span>
                <span className="font-medium text-brand-txt2">
                  {team.length} Pokémon
                </span>
              </div>
            </div>
          </div>

          {/* Right Action: Victory / Collapse Toggle */}
          <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
            {onToggleDefeated && (
              <button
                type="button"
                onClick={() => onToggleDefeated(battle.id)}
                className={btn(isDefeated ? 'solid' : 'secondary', 'sm', 'success')}
                title="Marcar o desmarcar combate como completado"
              >
                <CheckCircle2 className={cn('w-3.5 h-3.5', !isDefeated && TONES.success.ink)} />
                <span>{isDefeated ? 'Victoria' : 'Marcar Victoria'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={btn('secondary', 'sm')}
            >
              <span>{isExpanded ? 'Ocultar' : 'Ver Equipo'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Dynamic quote / starter message */}
        {battle.starterVariants && (
          <div
            className={card({
              tone: 'warning',
              padding: 'compact',
              extra: 'mt-3 text-xs flex items-center justify-between gap-2 flex-wrap',
            })}
          >
            <div className="flex items-center gap-2">
              <Sparkles className={cn('w-3.5 h-3.5 shrink-0', TONES.warning.ink)} />
              <span>
                Equipo ajustado para tu inicial: <strong>{starterMeta.name}</strong> ({starterMeta.type}).
                Paúl combate usando a <strong>{starterMeta.hopStarterName}</strong> ({starterMeta.hopStarterType}).
              </span>
            </div>
          </div>
        )}

        {/* Compact Team Preview Strip when Minimized */}
        {!isExpanded && (
          <div className="mt-3 pt-3 border-t border-brand-border flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(text.label, 'mr-1')}>
                Equipo:
              </span>
              {team.map((poke, pIdx) => {
                const { sprite } = getPokemonSprite(poke.name);
                return (
                <button
                  key={`mini-poke-${battle.id}-${pIdx}`}
                  type="button"
                  onClick={() => openDetail('pokemon', poke.name)}
                  title={`Haz clic para ver estadísticas y detalles de ${poke.name}`}
                  className={btn('secondary', 'xs')}
                >
                  <img
                    src={sprite}
                    alt={poke.name}
                    className="w-5 h-5 object-contain pixelated"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <span>{poke.name}</span>
                  <span className={cn('text-xs font-medium tabular-nums', TONES.info.ink)}>
                    Nv.{poke.level}
                  </span>
                </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className={cn(text.link, 'text-xs flex items-center gap-1 ml-auto')}
            >
              <span>Ver Movimientos y Habilidades</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Team Content Grid */}
      {isExpanded && (
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {team.map((pokemon, idx) => (
              <TrainerPokemonCard
                key={`${battle.id}-${pokemon.name}-${idx}`}
                pokemon={pokemon}
              />
            ))}
          </div>
        </div>
      )}
    </article>
  );
};
