import React from 'react';
import { GameTenant } from '../types';
import { Gamepad2, ChevronDown, Compass } from 'lucide-react';

interface GameTenantSelectorProps {
  activeTenant: GameTenant;
  onClick: () => void;
}

export const GameTenantSelector: React.FC<GameTenantSelectorProps> = ({
  activeTenant,
  onClick,
}) => {
  return (
    <button
      id="game-tenant-selector-button"
      type="button"
      onClick={onClick}
      title="Cambiar edición o mod de Pokémon"
      className="group flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white shadow-2xs hover:border-red-400 dark:hover:border-red-500 transition-all cursor-pointer select-none max-w-full"
    >
      <div className="w-6 h-6 rounded-lg bg-red-600 dark:bg-red-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
        <Gamepad2 className="w-3.5 h-3.5" />
      </div>

      <div className="flex flex-col text-left min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-black tracking-tight truncate max-w-[130px] sm:max-w-[200px]">
            {activeTenant.shortName || activeTenant.name}
          </span>
          <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md text-[10px] font-black bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex-shrink-0">
            <Compass className="w-2.5 h-2.5 text-red-500" />
            {activeTenant.region}
          </span>
        </div>
        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 -mt-0.5 truncate hidden xs:block">
          Cambiar juego / mod
        </span>
      </div>

      <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500 transition-colors flex-shrink-0 ml-0.5" />
    </button>
  );
};
