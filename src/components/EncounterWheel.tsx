import React from 'react';
import { motion } from 'motion/react';
import { parsePokemonName, TYPE_COLORS, getPokemonSprite } from '../utils/pokemonMeta';

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
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/70 dark:bg-slate-850/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-inner w-full max-w-sm transition-colors"
    >
      <div className="relative w-28 h-28 flex items-center justify-center">
        {isSpinning ? (
          <div className="w-20 h-20 rounded-full bg-slate-200/80 dark:bg-slate-700/80 animate-pulse flex items-center justify-center">
            <img
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
        <span
          className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase tracking-wider ${typeStyle.badge}`}
        >
          {formLabel ? `${formLabel} • ` : ''}
          {types.join(' / ')}
        </span>
        <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight mt-1">
          {displayName}
        </h4>
        {isSpinning && (
          <p className="text-xs text-slate-400 dark:text-slate-400 animate-pulse font-medium">Buscando en la hierba...</p>
        )}
      </div>
    </motion.div>
  );
};
