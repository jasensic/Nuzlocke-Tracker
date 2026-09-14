import React from 'react';
import { motion } from 'motion/react';
import { parsePokemonName, TYPE_COLORS, getPokemonSprite } from '../utils/pokemonMeta';
import { TypeBadge } from './TypeBadge';
import { cn, card, pill, text } from '../utils/ui';

interface EncounterWheelProps {
  isSpinning: boolean;
  activeCandidate: string | null;
}

export const EncounterWheel: React.FC<EncounterWheelProps> = ({ isSpinning, activeCandidate }) => {
  if (!activeCandidate) return null;

  const { displayName, types, formLabel } = parsePokemonName(activeCandidate);
  const { sprite } = getPokemonSprite(activeCandidate);
  const primaryType = types[0] || 'Normal';
  const typeStyle = TYPE_COLORS[primaryType] || TYPE_COLORS['Normal'];

  return (
    <motion.div
      id="encounter-wheel-preview"
      key={activeCandidate}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={card({
        padding: 'compact',
        extra: 'flex flex-col items-center justify-center w-full max-w-sm',
      })}
    >
      <div className="relative w-28 h-28 flex items-center justify-center">
        {isSpinning ? (
          <div
            className={cn(
              'w-20 h-20 rounded-full bg-brand-surface border-2 animate-pulse flex items-center justify-center',
              typeStyle.border
            )}
          >
            <img
              key={`spin-${activeCandidate}`}
              src={sprite}
              alt={displayName}
              className="w-20 h-20 object-contain filter blur-[1px] brightness-75 scale-110"
              onError={(e) => {
                // Fallback placeholder
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        ) : (
          <img
            key={`idle-${activeCandidate}`}
            src={sprite}
            alt={displayName}
            className="w-24 h-24 object-contain drop-shadow-md animate-bounce"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
      </div>

      <div className="mt-2 text-center">
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {formLabel && <span className={pill('neutral', 'xs')}>{formLabel}</span>}
          {types.map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
        </div>
        <h4 className={cn(text.sectionTitle, 'mt-1')}>
          {displayName}
        </h4>
        {isSpinning && (
          <p className={cn(text.muted, 'font-medium animate-pulse')}>Buscando en la hierba...</p>
        )}
      </div>
    </motion.div>
  );
};
