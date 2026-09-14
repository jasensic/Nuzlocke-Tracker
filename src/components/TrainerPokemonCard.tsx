import React, { useState, useEffect } from 'react';
import { TrainerPokemon } from '../types';
import { parsePokemonName, getPokemonSprite } from '../utils/pokemonMeta';
import {
  translateAbility,
  translateNature,
  getItemInfo,
  getMoveInfo,
  getMoveTypeAbbreviation,
} from '../data/trainers/trainerTranslations';
import { getTypeFillStyle } from '../utils/typeStyles';
import { usePokeDetail } from '../context/PokeDetailContext';
import { getPokemonDetails, PokemonDetail } from '../services/pokeApiService';
import { Shield, Zap, Sparkles } from 'lucide-react';
import { TypeBadge } from './TypeBadge';
import { cn, card, inset, pill, text, spriteFrame, focusRing, TONES } from '../utils/ui';

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
    <div className={card({ interactive: true, extra: 'flex flex-col justify-between gap-3' })}>
      {/* Top Header: Sprite, Name, Level, Types (Clickable for Pokémon stats) */}
      <div className="flex items-start gap-3">
        {/* Sprite Container (Clickable) */}
        <button
          type="button"
          onClick={() => openDetail('pokemon', pokemon.name)}
          className={spriteFrame(true, 'relative w-14 h-14 sm:w-16 sm:h-16 p-1 group')}
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
              className="font-bold text-sm text-brand-txt1 truncate hover:text-brand-accent-ink transition-colors text-left cursor-pointer flex items-center gap-1"
              title={`Ver estadísticas de ${displayName}`}
            >
              <span>{displayName}</span>
            </button>
            <div className="flex items-center gap-1">
              {apiData?.bst ? (
                <span
                  className={pill('neutral')}
                  title={`Total de estadísticas base (BST): ${apiData.bst}`}
                >
                  BST {apiData.bst}
                </span>
              ) : null}
              <span className={pill('info', 'sm')}>
                Nv. {pokemon.level}
              </span>
            </div>
          </div>

          {/* Pokémon Types (In Spanish) */}
          <div className="flex flex-wrap gap-1 mt-1">
            {displayTypes.map((type) => (
              <TypeBadge key={type} type={type} />
            ))}
          </div>

          {/* Held Item (Clickable) */}
          <div className="mt-1.5 flex items-center gap-1.5">
            {hasItem ? (
              <button
                type="button"
                onClick={() => openDetail('item', pokemon.item as string)}
                className={cn(text.meta, 'flex items-center gap-1.5 truncate text-left hover:text-brand-accent-ink cursor-pointer group transition-colors')}
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
                  <Shield className={cn('w-3.5 h-3.5', TONES.warning.ink)} />
                )}
                <span className="truncate underline decoration-dashed decoration-brand-border">
                  <strong className="font-semibold text-brand-txt1 group-hover:text-brand-accent-ink">
                    {itemInfo.name}
                  </strong>
                </span>
              </button>
            ) : (
              <span className={cn(text.meta, 'flex items-center gap-1')}>
                <Shield className="w-3 h-3 opacity-50" />
                <span>Sin objeto</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Ability, Nature & EVs Box (Ability is Clickable) */}
      <div className={inset('space-y-1.5')}>
        {/* Ability (Clickable for description and battle effect) */}
        <div className="flex items-center justify-between gap-2">
          <span className={text.label}>Habilidad:</span>
          <button
            type="button"
            onClick={() => openDetail('ability', pokemon.ability)}
            className="text-[11px] font-bold text-brand-txt1 flex items-center gap-1 hover:text-brand-accent-ink cursor-pointer transition-colors group"
            title={`Ver detalles y efecto de la habilidad ${abilityEs}`}
          >
            <Zap className={cn('w-3 h-3 group-hover:scale-115 transition-transform', TONES.warning.ink)} />
            <span className="underline decoration-dotted decoration-brand-border">
              {abilityEs}
            </span>
          </button>
        </div>

        {/* Nature */}
        <div className="flex items-center justify-between gap-2">
          <span className={text.label}>Naturaleza:</span>
          <span className="text-[11px] font-semibold text-brand-txt1">
            {natureInfo.name}
            {natureInfo.desc && (
              <span className={cn('text-[10px] font-medium ml-1', TONES.info.ink)}>
                ({natureInfo.desc})
              </span>
            )}
          </span>
        </div>

        {/* EVs */}
        {pokemon.evs && (
          <div className="flex items-center justify-between gap-2">
            <span className={text.label}>EVs:</span>
            <span className={pill('neutral')}>
              {pokemon.evs}
            </span>
          </div>
        )}
      </div>

      {/* Moves: 4 slots with custom Type coloring, Spanish names & Click to View Power/Accuracy/Desc */}
      <div className="space-y-1.5">
        <div className={cn(text.label, 'flex items-center justify-between')}>
          <span className="flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            Movimientos
          </span>
          <span className="text-[9px] lowercase font-normal opacity-80">
            clic para potencia y efecto
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {pokemon.moves.map((move, idx) => {
            const moveInfo = getMoveInfo(move);
            const fill = getTypeFillStyle(moveInfo.type);

            return (
              <button
                key={`${move}-${idx}`}
                type="button"
                onClick={() => openDetail('move', move)}
                className={cn(
                  'px-2 py-1.5 rounded-lg border font-semibold flex items-center justify-between gap-1 text-left cursor-pointer',
                  'transition-all duration-150 hover:brightness-110 active:scale-[0.98]',
                  focusRing
                )}
                style={fill}
                title={`Haz clic para ver potencia, precisión y descripción de ${moveInfo.spanishName}`}
              >
                <span className="truncate text-[11px] leading-tight font-bold">
                  {moveInfo.spanishName}
                </span>
                <span className="text-[9px] font-bold uppercase opacity-90 shrink-0">
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
