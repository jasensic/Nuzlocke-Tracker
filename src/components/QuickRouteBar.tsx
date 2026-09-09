import React from 'react';
import { RouteData, SavedEncounter } from '../types';
import { getPokemonSprite } from '../utils/pokemonMeta';
import {
  MapPin,
  Flame,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  CheckCircle2,
  CircleDot,
  Compass,
} from 'lucide-react';

interface QuickRouteBarProps {
  routes: RouteData[];
  selectedRouteId: string;
  onRouteChange: (routeId: string) => void;
  history: SavedEncounter[];
  showFilters: boolean;
  onToggleFilters: () => void;
  showProgression: boolean;
  onToggleProgression: () => void;
}

export const QuickRouteBar: React.FC<QuickRouteBarProps> = ({
  routes,
  selectedRouteId,
  onRouteChange,
  history,
  showFilters,
  onToggleFilters,
  showProgression,
  onToggleProgression,
}) => {
  const currentIndex = routes.findIndex((r) => r.id === selectedRouteId);
  const currentRoute = routes[currentIndex] || routes[0];
  const prevRoute = currentIndex > 0 ? routes[currentIndex - 1] : null;
  const nextRoute = currentIndex < routes.length - 1 ? routes[currentIndex + 1] : null;

  // Map encounters by route
  const encountersByRoute = React.useMemo(() => {
    const map = new Map<string, SavedEncounter[]>();
    for (const h of history) {
      const keyId = h.routeId?.toLowerCase();
      const keyName = h.routeName?.toLowerCase();
      if (keyId) {
        const list = map.get(keyId) || [];
        list.push(h);
        map.set(keyId, list);
      }
      if (keyName && keyName !== keyId) {
        const list = map.get(keyName) || [];
        list.push(h);
        map.set(keyName, list);
      }
    }
    return map;
  }, [history]);

  const currentEncounters = currentRoute
    ? encountersByRoute.get(currentRoute.id.toLowerCase()) ||
      encountersByRoute.get(currentRoute.name.toLowerCase()) ||
      (currentRoute.englishName ? encountersByRoute.get(currentRoute.englishName.toLowerCase()) : undefined) ||
      []
    : [];

  const isCaught = currentEncounters.length > 0;
  const caughtPokemon = isCaught ? currentEncounters[0] : null;

  const totalRoutes = routes.length;
  const completedCount = routes.filter((r) => {
    const encs =
      encountersByRoute.get(r.id.toLowerCase()) ||
      encountersByRoute.get(r.name.toLowerCase()) ||
      (r.englishName ? encountersByRoute.get(r.englishName.toLowerCase()) : undefined) ||
      [];
    return encs.length > 0;
  }).length;

  return (
    <div
      id="quick-route-bar"
      className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3 transition-colors"
    >
      {/* Top row: Route Navigator with Prev / Next arrows */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Route Selector with Prev/Next Controls */}
        <div className="flex items-center gap-2 flex-1">
          {/* Previous Route Button */}
          <button
            id="prev-route-button"
            type="button"
            onClick={() => prevRoute && onRouteChange(prevRoute.id)}
            disabled={!prevRoute}
            title={prevRoute ? `Anterior: ${prevRoute.name} (${prevRoute.levelDisplay})` : 'Primera ruta'}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 flex-shrink-0 ${
              prevRoute
                ? 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 active:scale-95 shadow-xs'
                : 'bg-slate-100/50 dark:bg-slate-800/30 text-slate-300 dark:text-slate-600 border-slate-100 dark:border-slate-800/50 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          {/* Quick Route Dropdown */}
          <div className="relative flex-1 min-w-0">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1 text-red-500">
              <MapPin className="w-4 h-4 flex-shrink-0" />
            </div>
            <select
              id="quick-route-select"
              value={selectedRouteId}
              onChange={(e) => onRouteChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 sm:py-2 text-sm sm:text-base font-extrabold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all truncate cursor-pointer"
            >
              {routes.map((r, i) => {
                const encs =
                  encountersByRoute.get(r.id.toLowerCase()) ||
                  encountersByRoute.get(r.name.toLowerCase()) ||
                  (r.englishName ? encountersByRoute.get(r.englishName.toLowerCase()) : undefined) ||
                  [];
                const hasCaught = encs.length > 0;
                const prefix = hasCaught ? `✓ [Atrapado: ${encs[0].cleanName}]` : `🟢 [Libre]`;
                return (
                  <option key={r.id} value={r.id}>
                    #{i + 1} • {prefix} {r.name} ({r.levelDisplay})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Next Route Button */}
          <button
            id="next-route-button"
            type="button"
            onClick={() => nextRoute && onRouteChange(nextRoute.id)}
            disabled={!nextRoute}
            title={nextRoute ? `Siguiente: ${nextRoute.name} (${nextRoute.levelDisplay})` : 'Última ruta'}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 flex-shrink-0 ${
              nextRoute
                ? 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 active:scale-95 shadow-xs'
                : 'bg-slate-100/50 dark:bg-slate-800/30 text-slate-300 dark:text-slate-600 border-slate-100 dark:border-slate-800/50 cursor-not-allowed'
            }`}
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Action Pills: Filter Toggle & Progression Drawer */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          <button
            id="toggle-progression-button"
            type="button"
            onClick={onToggleProgression}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              showProgression
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Niveles ({currentIndex + 1}/{totalRoutes})</span>
          </button>

          <button
            id="toggle-filters-button"
            type="button"
            onClick={onToggleFilters}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              showFilters
                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtros y Clima</span>
          </button>
        </div>
      </div>

      {/* Info & Status Badge Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-red-500" />
            {currentRoute?.name}
          </span>
          <span className="px-2 py-0.5 rounded-full font-black text-[11px] bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            {currentRoute?.levelDisplay}
          </span>
          <span className="px-2 py-0.5 rounded-full font-semibold text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {currentRoute?.category}
          </span>
        </div>

        {/* Nuzlocke Route Status Tag */}
        <div>
          {isCaught && caughtPokemon ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold text-xs">
              <img
                src={getPokemonSprite(caughtPokemon.pokemon).sprite}
                alt={caughtPokemon.pokemon}
                className="w-4 h-4 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>
                Ya capturado:{' '}
                <strong>
                  {caughtPokemon.nickname ? `${caughtPokemon.nickname} (${caughtPokemon.cleanName})` : caughtPokemon.cleanName}
                </strong>
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 font-bold text-xs">
              <CircleDot className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>🟢 1º Encuentro Disponible para Tirada</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
