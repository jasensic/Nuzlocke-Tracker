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

  // COMPACT MODE: Space-saving combat card
  if (compact) {
    return (
      <article
        id={`trainer-battle-${battle.id}`}
        className={`rounded-2xl border transition-all scroll-mt-24 p-3 sm:p-3.5 shadow-2xs ${
          isDefeated
            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/90 dark:border-emerald-800/70'
            : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black overflow-hidden border ${
                isDefeated
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
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
                <Swords className="w-4 h-4 text-red-500" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-black text-sm text-slate-900 dark:text-white truncate">
                  {trainerMeta.spanishName || trainerMeta.name}
                </span>
                <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border ${trainerMeta.tagColor}`}>
                  {trainerMeta.title}
                </span>
                {isDefeated && (
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                    ¡Superado!
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span>{battle.location}</span>
                <span>•</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">Nv. {battle.minLevel}-{battle.maxLevel}</span>
                <span>•</span>
                <span>{team.length} Pokémon</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-center flex-shrink-0">
            {onToggleDefeated && (
              <button
                type="button"
                onClick={() => onToggleDefeated(battle.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  isDefeated
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isDefeated ? 'Ganado' : 'Victoria'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1"
            >
              <span>{isExpanded ? 'Ocultar' : 'Equipo'}</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Expanded team if user clicks Equipo in compact mode */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
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
      className={`rounded-3xl border shadow-sm overflow-hidden transition-all scroll-mt-24 ${
        isDefeated
          ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-300/80 dark:border-emerald-800/80'
          : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800'
      }`}
    >
      {/* Top Card Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-800/40 dark:via-slate-900 dark:to-slate-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          {/* Trainer Avatar & Info */}
          <div className="flex items-center gap-3.5">
            {/* Avatar Container */}
            <div className={`relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-2xl p-1 shadow-xs flex items-center justify-center overflow-hidden border-2 ${
              isDefeated
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-600'
                : 'bg-white dark:bg-slate-800 border-slate-200/90 dark:border-slate-700'
            }`}>
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
                <User className="w-7 h-7 text-slate-400" />
              )}
              {/* Battle Order Badge */}
              <span className={`absolute bottom-0.5 right-0.5 text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs ${
                isDefeated
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              }`}>
                #{index + 1}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {trainerMeta.name} ({trainerMeta.spanishName})
                </h3>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${trainerMeta.tagColor}`}>
                  {trainerMeta.title}
                </span>
                {battle.isDoubleBattle && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Combate Doble
                  </span>
                )}
                {isDefeated && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    ¡Superado!
                  </span>
                )}
              </div>

              {/* Location and Level info */}
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  {battle.location}
                  {battle.locationEnglish !== battle.location && (
                    <span className="text-slate-400 font-normal">({battle.locationEnglish})</span>
                  )}
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/80 dark:border-indigo-800/80">
                  Niveles {battle.minLevel} - {battle.maxLevel}
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="font-medium text-slate-600 dark:text-slate-300">
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                  isDefeated
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
                title="Marcar o desmarcar combate como completado"
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${isDefeated ? 'text-white' : 'text-emerald-500'}`} />
                <span>{isDefeated ? 'Victoria' : 'Marcar Victoria'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <span>{isExpanded ? 'Ocultar' : 'Ver Equipo'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Dynamic quote / starter message */}
        {battle.starterVariants && (
          <div className="mt-3 text-xs bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/60 rounded-xl px-3 py-2 text-amber-900 dark:text-amber-200 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span>
                Equipo ajustado para tu inicial: <strong>{starterMeta.name}</strong> ({starterMeta.type}).
                Paúl combate usando a <strong>{starterMeta.hopStarterName}</strong> ({starterMeta.hopStarterType}).
              </span>
            </div>
          </div>
        )}

        {/* Compact Team Preview Strip when Minimized */}
        {!isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">
                Equipo:
              </span>
              {team.map((poke, pIdx) => (
                <button
                  key={`mini-poke-${battle.id}-${pIdx}`}
                  type="button"
                  onClick={() => openDetail('pokemon', poke.name)}
                  title={`Haz clic para ver estadísticas y detalles de ${poke.spanishName || poke.name}`}
                  className="flex items-center gap-1 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700/80 px-2 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-400 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs cursor-pointer transition-all hover:scale-105"
                >
                  {poke.spriteUrl && (
                    <img
                      src={poke.spriteUrl}
                      alt={poke.name}
                      className="w-5 h-5 object-contain pixelated"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <span>{poke.spanishName || poke.name}</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                    Nv.{poke.level}
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 ml-auto"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
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
