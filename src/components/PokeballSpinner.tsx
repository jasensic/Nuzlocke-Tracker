import React from 'react';
import { motion } from 'motion/react';

interface PokeballSpinnerProps {
  isSpinning: boolean;
  size?: number;
}

export const PokeballSpinner: React.FC<PokeballSpinnerProps> = ({ isSpinning, size = 120 }) => {
  return (
    <div
      id="pokeball-spinner-container"
      className="relative flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      {/* Outer Glow during spin */}
      {isSpinning && (
        <motion.div
          id="pokeball-glow"
          animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 0.6, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-red-400 blur-xl -z-10"
        />
      )}

      {/* Pokeball Body */}
      <motion.div
        id="pokeball-sphere"
        animate={
          isSpinning
            ? {
                rotate: [0, 720],
                scale: [1, 1.08, 0.95, 1.05, 1],
              }
            : {
                rotate: 0,
                scale: 1,
              }
        }
        transition={
          isSpinning
            ? {
                rotate: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
                scale: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
              }
            : { duration: 0.3 }
        }
        className="relative w-full h-full rounded-full border-4 border-slate-900 shadow-2xl overflow-hidden flex flex-col bg-white"
      >
        {/* Top Half (Red) */}
        <div className="w-full h-1/2 bg-gradient-to-b from-red-500 to-red-600 relative overflow-hidden">
          <div className="absolute top-1 left-2 w-1/2 h-1/2 bg-white/25 rounded-full blur-[2px]" />
        </div>

        {/* Center Divider Bar */}
        <div className="w-full h-2.5 bg-slate-900 relative z-10" />

        {/* Bottom Half (White) */}
        <div className="w-full h-1/2 bg-gradient-to-b from-slate-100 to-slate-200" />

        {/* Center Button Ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center z-20 shadow-md">
          {/* Inner Button */}
          <div
            className={`w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center transition-colors duration-300 ${
              isSpinning ? 'bg-amber-300 shadow-[0_0_12px_#fde047]' : 'bg-white'
            }`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                isSpinning ? 'bg-amber-500 animate-ping' : 'bg-slate-300'
              }`}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
