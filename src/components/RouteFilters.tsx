import React, { useState } from 'react';
import { RouteData, EncounterMethod, SavedEncounter } from '../types';
import { translateWeather } from '../data/routeTranslations';
import {
  Wind,
  Filter,
  Dice5,
  Search,
  CheckCircle2,
  CircleDot,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronUp,
} from 'lucide-react';

interface RouteFiltersProps {
  currentRoute: RouteData;
  routes: RouteData[];
  selectedWeather: string;
  onWeatherChange: (weather: string) => void;
  selectedMethod: EncounterMethod | 'All';
  onMethodChange: (method: EncounterMethod | 'All') => void;
  isWeighted: boolean;
  onToggleWeighted: (weighted: boolean) => void;
  availableCount: number;
  history: SavedEncounter[];
  showProgression: boolean;
  onToggleProgression: () => void;
  selectedRouteId: string;
  onRouteChange: (routeId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const RouteFilters: React.FC<RouteFiltersProps> = ({
  currentRoute,
  routes,
  selectedWeather,
  onWeatherChange,
  selectedMethod,
  onMethodChange,
  isWeighted,
  onToggleWeighted,
  availableCount,
  history,
  showProgression,
  onToggleProgression,
  selectedRouteId,
  onRouteChange,
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | RouteData['category']>('All');
  const [nuzlockeFilter, setNuzlockeFilter] = useState<'all' | 'pending' | 'completed'>('all');

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

  const getRouteEncounters = (r: RouteData): SavedEncounter[] => {
    return (
      encountersByRoute.get(r.id.toLowerCase()) ||
      encountersByRoute.get(r.name.toLowerCase()) ||
      (r.englishName ? encountersByRoute.get(r.englishName.toLowerCase()) : undefined) ||
      []
    );
  };

  const totalRoutesCount = routes.length;
  const completedRoutesCount = routes.filter((r) => getRouteEncounters(r).length > 0).length;
  const pendingRoutesCount = totalRoutesCount - completedRoutesCount;

  // Filtered routes maintaining level order
  const filteredRoutes = routes.filter((r) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      r.name.toLowerCase().includes(term) ||
      (r.englishName && r.englishName.toLowerCase().includes(term)) ||
      r.levelDisplay.toLowerCase().includes(term);
    const matchesCategory = categoryFilter === 'All' || r.category === categoryFilter;
    const isCompleted = getRouteEncounters(r).length > 0;
    const matchesNuzlocke =
      nuzlockeFilter === 'all' ||
      (nuzlockeFilter === 'completed' && isCompleted) ||
      (nuzlockeFilter === 'pending' && !isCompleted);

    return matchesSearch && matchesCategory && matchesNuzlocke;
  });

  return (
    <div
      id="secondary-route-filters-panel"
      className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4 transition-colors"
    >
      {/* Header of Secondary Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-red-500" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Filtros y Condiciones de Ruleta ({currentRoute?.name})
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
            {availableCount} Pokémon válidos
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 font-medium transition-colors"
        >
          <span>Cerrar filtros</span>
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      {/* Main Filter Inputs (Weather, Method, Probability Mode) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Weather Selector */}
        <div>
          <label
            htmlFor="weather-filter-select"
            className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1"
          >
            <Wind className="w-3.5 h-3.5 text-blue-500" />
            Clima en {currentRoute?.name}
          </label>
          <select
            id="weather-filter-select"
            value={selectedWeather}
            onChange={(e) => onWeatherChange(e.target.value)}
            className="w-full py-2 px-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium cursor-pointer"
          >
            <option value="All">Cualquier Clima ({currentRoute?.weathers.length || 0} disponibles)</option>
            {currentRoute?.weathers.map((w) => (
              <option key={w} value={w}>
                {translateWeather(w)}
              </option>
            ))}
          </select>
        </div>

        {/* Method Selector */}
        <div>
          <label
            htmlFor="method-filter-select"
            className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1"
          >
            <Filter className="w-3.5 h-3.5 text-emerald-500" />
            Método de encuentro
          </label>
          <select
            id="method-filter-select"
            value={selectedMethod}
            onChange={(e) => onMethodChange(e.target.value as EncounterMethod | 'All')}
            className="w-full py-2 px-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium cursor-pointer"
          >
            <option value="All">Cualquier Método</option>
            {currentRoute?.methods.map((m) => (
              <option key={m} value={m}>
                {m === 'Hidden'
                  ? 'Hierba Oculta (!)'
                  : m === 'Visible'
                  ? 'Sobrehierba Visible'
                  : m === 'Fishing'
                  ? 'Pesca'
                  : m === 'Surfing'
                  ? 'Surf'
                  : m}
              </option>
            ))}
          </select>
        </div>

        {/* Probability Mode Toggle */}
        <div>
          <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
            <Dice5 className="w-3.5 h-3.5 text-purple-500" />
            Cálculo de Probabilidad
          </span>
          <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              id="mode-weighted-button"
              type="button"
              onClick={() => onToggleWeighted(true)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                isWeighted
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Usa los porcentajes exactos del juego"
            >
              % Real
            </button>
            <button
              id="mode-uniform-button"
              type="button"
              onClick={() => onToggleWeighted(false)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                !isWeighted
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Misma probabilidad para todos los disponibles"
            >
              Equitativo
            </button>
          </div>
        </div>
      </div>

      {/* Progression Drawer Strip (Level ordering) */}
      {showProgression && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
              Progreso de Rutas de Galar por Nivel (#1 a #{totalRoutesCount}):
            </span>
            <span className="text-slate-400 font-normal">Toca una ruta para seleccionarla</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
            {routes.map((r, idx) => {
              const encs = getRouteEncounters(r);
              const isRouteCaught = encs.length > 0;
              const isSelected = r.id === selectedRouteId;

              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onRouteChange(r.id)}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl text-left border transition-all text-xs flex flex-col gap-0.5 ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 shadow-sm ring-2 ring-indigo-500/20'
                      : isRouteCaught
                      ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-bold text-[10px] text-slate-400">#{idx + 1}</span>
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
                        isRouteCaught
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {r.levelDisplay}
                    </span>
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[130px]">{r.name}</div>
                  <div className="flex items-center gap-1 text-[10px] mt-0.5">
                    {isRouteCaught ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-0.5 truncate max-w-[120px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        {encs[0].cleanName || encs[0].pokemon}
                      </span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-0.5">
                        <CircleDot className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        Disponible
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Advanced Route Searching and Nuzlocke Status Filtering */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <span className="text-slate-400 mr-1 text-[11px] font-bold uppercase tracking-wider">Filtrar Rutas:</span>
          <button
            type="button"
            onClick={() => setNuzlockeFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              nuzlockeFilter === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Todas ({totalRoutesCount})
          </button>
          <button
            type="button"
            onClick={() => setNuzlockeFilter('pending')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              nuzlockeFilter === 'pending'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/50 border border-sky-200 dark:border-sky-800'
            }`}
          >
            <CircleDot className="w-3 h-3 text-sky-500" />
            Pendientes ({pendingRoutesCount})
          </button>
          <button
            type="button"
            onClick={() => setNuzlockeFilter('completed')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              nuzlockeFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Ya Capturadas ({completedRoutesCount})
          </button>
        </div>

        {/* Search bar inside filters */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="route-search-filter-input"
            type="text"
            placeholder="Buscar ruta o nivel para cambiar (ej. Ruta 2, Axew, Nv. 10)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 font-medium"
          />
        </div>

        {searchTerm && (
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
            {filteredRoutes.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  onRouteChange(r.id);
                  setSearchTerm('');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  r.id === selectedRouteId
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
              >
                {r.name} ({r.levelDisplay})
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
