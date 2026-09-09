import React, { useState } from 'react';
import { RouteData, RouteEncounter, SavedEncounter } from '../types';
import { parsePokemonName, TYPE_COLORS, getPokemonSprite } from '../utils/pokemonMeta';
import { translateWeather } from '../data/routeTranslations';
import { Search, MapPin, Wind, Sparkles, Filter, Layers, Flame, CheckCircle2 } from 'lucide-react';

interface RouteDatabaseViewProps {
  routes: RouteData[];
  onSelectRouteForRoll: (routeId: string) => void;
  history?: SavedEncounter[];
}

export const RouteDatabaseView: React.FC<RouteDatabaseViewProps> = ({
  routes,
  onSelectRouteForRoll,
  history = [],
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWeather, setSelectedWeather] = useState<string>('All');
  const [selectedMethod, setSelectedMethod] = useState<string>('All');

  const currentRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  // Filter encounters in current route
  const filteredEncounters = (currentRoute?.encounters || []).filter((enc) => {
    const matchesSearch =
      enc.pokemon.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enc.cleanName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWeather = selectedWeather === 'All' || enc.weather === selectedWeather;
    const matchesMethod = selectedMethod === 'All' || enc.method === selectedMethod;
    return matchesSearch && matchesWeather && matchesMethod;
  });

  return (
    <div id="route-database-view" className="space-y-6">
      {/* Route Picker Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Explorador de la Base de Datos de Rutas
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Consulta las tablas completas de encuentros, niveles, métodos y porcentajes de cada zona.
            </p>
          </div>

          {/* Quick roll button */}
          <button
            type="button"
            onClick={() => onSelectRouteForRoll(currentRoute.id)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md shadow-red-500/20 transition-all flex items-center gap-2 w-fit"
          >
            <Sparkles className="w-4 h-4" />
            Girar Ruleta en esta Ruta
          </button>
        </div>

        {/* Route Select Dropdown */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Zona o Ruta</label>
            <select
              value={selectedRouteId}
              onChange={(e) => {
                setSelectedRouteId(e.target.value);
                setSelectedWeather('All');
                setSelectedMethod('All');
              }}
              className="w-full py-2 px-3 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 cursor-pointer"
            >
              {routes.map((r) => {
                const isCaught = history.some(
                  (h) =>
                    h.routeId?.toLowerCase() === r.id.toLowerCase() ||
                    h.routeName?.toLowerCase() === r.name.toLowerCase() ||
                    (r.englishName && h.routeName?.toLowerCase() === r.englishName.toLowerCase())
                );
                return (
                  <option key={r.id} value={r.id}>
                    {isCaught ? '✓ [ATRAPADO] ' : '🟢 '}
                    {r.name} ({r.levelDisplay}) - {r.category}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Filtrar por Clima</label>
            <select
              value={selectedWeather}
              onChange={(e) => setSelectedWeather(e.target.value)}
              className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="All">Todos los climas ({currentRoute?.weathers.length})</option>
              {currentRoute?.weathers.map((w) => (
                <option key={w} value={w}>
                  {translateWeather(w)}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Buscar Pokémon</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Nombre del Pokémon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Encounter Table / Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-500" />
            Tabla de Encuentros de {currentRoute.name}
          </h3>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            {filteredEncounters.length} registros encontrados
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredEncounters.map((enc, idx) => {
            const { displayName, types } = parsePokemonName(enc.pokemon);
            const { sprite } = getPokemonSprite(enc.pokemon);
            const primaryType = types[0] || 'Normal';
            const typeStyle = TYPE_COLORS[primaryType] || TYPE_COLORS['Normal'];

            return (
              <div
                key={`${enc.pokemon}-${enc.method}-${enc.weather}-${idx}`}
                className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/70 dark:bg-slate-850 hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center gap-3 shadow-xs hover:shadow-md"
              >
                <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center p-1 flex-shrink-0 shadow-inner">
                  <img
                    src={sprite}
                    alt={displayName}
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {displayName}
                    </h4>
                    <span className="text-xs font-black text-slate-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800 flex-shrink-0">
                      {enc.chance}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    <span className={`px-2 py-0.2 text-[10px] font-bold rounded-full ${typeStyle.badge}`}>
                      {primaryType}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.2 rounded-md">
                      {enc.method}
                    </span>
                    {enc.levelRange && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        {enc.levelRange}
                      </span>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-400 dark:text-slate-400 mt-1 flex items-center gap-1 truncate">
                    <Wind className="w-3 h-3 text-blue-400 flex-shrink-0" />
                    <span className="truncate">{translateWeather(enc.weather)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
