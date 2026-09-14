import React, { useState, useEffect } from 'react';
import { TrainerPokemon } from '../types';
import { parsePokemonName, getPokemonSprite, TYPE_COLORS } from '../utils/pokemonMeta';
import {
  translateAbility,
  translateNature,
  getItemInfo,
  getMoveInfo,
  getMoveTypeAbbreviation,
  MOVE_TYPE_STYLES,
} from '../data/trainers/trainerTranslations';
import { usePokeDetail } from '../context/PokeDetailContext';
import { getPokemonDetails, PokemonDetail } from '../services/pokeApiService';
import { Shield, Zap, Sparkles } from 'lucide-react';

interface TrainerPokemonCardProps {
  pokemon: TrainerPokemon;
}

export const TrainerPokemonCard: React.FC<TrainerPokemonCardProps> = ({ pokemon }) => {
  const { openDetail } = usePokeDetail();
  const [spriteError, setSpriteError] = useState(false);
  const [itemError, setItemError] = useState(false);
  const [apiData, setApiData] = useState<PokemonDetail | null>(null);

  const { displayName, types } = parsePokemonName(pokemon.name);
  const { sprite, showdown } = getPokemonSprite(pokemon.name);
  const itemInfo = getItemInfo(pokemon.item);
  const abilityEs = translateAbility(pokemon.ability);
  const natureInfo = translateNature(pokemon.nature);

  // Dynamically load enriched information from PokéAPI via pokenode-ts cache
  useEffect(() => {
    let isMounted = true;
    getPokemonDetails(pokemon.name)
      .then((data) => {
        if (isMounted && data && data.id > 0) {
          setApiData(data);
        }
      })
      .catch(() => {
        // Fallback silently to initial dataset
      });
    return () => {
      isMounted = false;
    };
  }, [pokemon.name]);

  // Preferred types: dynamic from PokéAPI (in Spanish) or local parsed fallback
  const displayTypes = apiData?.types && apiData.types.length > 0
    ? apiData.types.map((t) => t.es)
    : types;

  // Preferred sprite: showdown animated, fallback to static gen5
  const spriteSrc = spriteError
    ? (apiData?.sprites.artwork || sprite)
    : (apiData?.sprites.showdown || showdown);

  const hasItem = pokemon.item && pokemon.item.trim() !== '' && pokemon.item.toLowerCase() !== 'none';

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 p-3.5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-3">
      {/* Top Header: Sprite, Name, Level, Types (Clickable for Pokémon stats) */}
      <div className="flex items-start gap-3">
        {/* Sprite Container (Clickable) */}
        <button
          type="button"
          onClick={() => openDetail('pokemon', pokemon.name)}
          className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center p-1 overflow-hidden group cursor-pointer hover:border-indigo-500 transition-all shadow-2xs"
          title={`Ver estadísticas base y detalles de ${displayName}`}
        >
          <img
            src={spriteSrc}
            alt={displayName}
            onError={() => {
              if (!spriteError) setSpriteError(true);
            }}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain pixelated transition-transform group-hover:scale-110"
          />
        </button>

        {/* Info Column */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => openDetail('pokemon', pokemon.name)}
              className="font-extrabold text-sm text-slate-900 dark:text-white truncate hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer flex items-center gap-1"
              title={`Ver estadísticas de ${displayName}`}
            >
              <span>{displayName}</span>
            </button>
            <div className="flex items-center gap-1">
              {apiData?.bst ? (
                <span
                  className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px]"
                  title={`Total de estadísticas base (BST): ${apiData.bst}`}
                >
                  BST {apiData.bst}
                </span>
              ) : null}
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 font-black text-xs">
                Nv. {pokemon.level}
              </span>
            </div>
          </div>

          {/* Pokémon Types (In Spanish) */}
          <div className="flex flex-wrap gap-1 mt-1">
            {displayTypes.map((type) => {
              const typeStyle = TYPE_COLORS[type] || TYPE_COLORS.Normal;
              return (
                <span
                  key={type}
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-2xs ${typeStyle.badge}`}
                >
                  {type}
                </span>
              );
            })}
          </div>

          {/* Held Item (Clickable) */}
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            {hasItem ? (
              <button
                type="button"
                onClick={() => openDetail('item', pokemon.item)}
                className="flex items-center gap-1.5 truncate text-[11px] text-left hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer group"
                title={`Ver efecto del objeto ${itemInfo.name}`}
              >
                {itemInfo.spriteUrl && !itemError ? (
                  <img
                    src={itemInfo.spriteUrl}
                    alt={itemInfo.name}
                    onError={() => setItemError(true)}
                    className="w-4 h-4 object-contain inline-block group-hover:scale-115 transition-transform"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span className="truncate underline decoration-dashed decoration-slate-300 dark:decoration-slate-600">
                  <strong className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {itemInfo.name}
                  </strong>
                </span>
              </button>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Shield className="w-3 h-3 opacity-50" />
                <span>Sin objeto</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Ability, Nature & EVs Box (Ability is Clickable) */}
      <div className="bg-slate-50/90 dark:bg-slate-900/60 rounded-xl p-2 border border-slate-100 dark:border-slate-800/80 space-y-1 text-[11px]">
        {/* Ability (Clickable for description and battle effect) */}
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span className="text-slate-400 dark:text-slate-500 font-medium">Habilidad:</span>
          <button
            type="button"
            onClick={() => openDetail('ability', pokemon.ability)}
            className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors group"
            title={`Ver detalles y efecto de la habilidad ${abilityEs}`}
          >
            <Zap className="w-3 h-3 text-amber-500 group-hover:scale-115 transition-transform" />
            <span className="underline decoration-dotted decoration-slate-300 dark:decoration-slate-600">
              {abilityEs}
            </span>
          </button>
        </div>

        {/* Nature */}
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span className="text-slate-400 dark:text-slate-500 font-medium">Naturaleza:</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {natureInfo.name}
            {natureInfo.desc && (
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium ml-1">
                ({natureInfo.desc})
              </span>
            )}
          </span>
        </div>

        {/* EVs */}
        {pokemon.evs && (
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <span className="text-slate-400 dark:text-slate-500 font-medium">EVs:</span>
            <span className="font-medium text-slate-700 dark:text-slate-300 text-[10px] bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.2 rounded">
              {pokemon.evs}
            </span>
          </div>
        )}
      </div>

      {/* Moves: 4 slots with custom Type coloring, Spanish names & Click to View Power/Accuracy/Desc */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            Movimientos
          </span>
          <span className="text-[9px] lowercase font-normal opacity-80">
            clic para potencia y efecto
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {pokemon.moves.map((move, idx) => {
            const moveInfo = getMoveInfo(move);
            const style = MOVE_TYPE_STYLES[moveInfo.type] || MOVE_TYPE_STYLES.Normal;

            return (
              <button
                key={`${move}-${idx}`}
                type="button"
                onClick={() => openDetail('move', move)}
                className={`px-2 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-between gap-1 transition-all hover:scale-[1.03] hover:shadow-xs cursor-pointer text-left ${style.bg} ${style.border} ${style.text}`}
                title={`Haz clic para ver potencia, precisión y descripción de ${moveInfo.spanishName}`}
              >
                <span className="truncate text-[11px] leading-tight font-bold">
                  {moveInfo.spanishName}
                </span>
                <span className="text-[9px] font-black uppercase opacity-75 flex-shrink-0">
                  {getMoveTypeAbbreviation(moveInfo.type)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
