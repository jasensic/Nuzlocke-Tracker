import React, { useState } from 'react';
import { RouteData, EncounterMethod, SavedEncounter } from '../types';
import { getPokemonSprite, parsePokemonName } from '../utils/pokemonMeta';
import { translateWeather } from '../data/routeTranslations';
import {
  Search,
  MapPin,
  Wind,
  Sparkles,
  Filter,
  Dice5,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ChevronDown,
  ShieldCheck,
  CircleDot,
  ArrowUpDown,
} from 'lucide-react';

interface RouteSelectorProps {
  routes: RouteData[];
  selectedRouteId: string;
  onRouteChange: (routeId: string) => void;
  selectedWeather: string;
  onWeatherChange: (weather: string) => void;
  selectedMethod: EncounterMethod | 'All';
  onMethodChange: (method: EncounterMethod | 'All') => void;
  isWeighted: boolean;
  onToggleWeighted: (weighted: boolean) => void;
  availableCount: number;
  history: SavedEncounter[];
}

export const RouteSelector: React.FC<RouteSelectorProps> = ({
  routes,
  selectedRouteId,
  onRouteChange,
  selectedWeather,
  onWeatherChange,
  selectedMethod,
  onMethodChange,
  isWeighted,
  onToggleWeighted,
  availableCount,
  history,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | RouteData['category']>('All');
  const [nuzlockeFilter, setNuzlockeFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showProgressionDrawer, setShowProgressionDrawer] = useState(false);

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

  // Counts for Nuzlocke
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

  const currentRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const currentRouteEncounters = currentRoute ? getRouteEncounters(currentRoute) : [];
  const currentRouteCaught = currentRouteEncounters.length > 0;
  const latestCaught = currentRouteCaught ? currentRouteEncounters[currentRouteEncounters.length - 1] : null;

  return (
    <div
      id="route-selector-container"
      className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4"
    >
      {/* Top Header: Route title & Level Range Badge & Nuzlocke Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          <label htmlFor="route-dropdown-select" className="text-base font-bold text-slate-900 flex items-center gap-1.5">
            <MapPin className="w-5 h-5 text-red-500" />
            Zona / Ruta
          </label>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-600" />
            {currentRoute?.levelDisplay || 'Nv. ?'}
          </span>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {currentRoute?.category}
          </span>
        </div>

        {/* Nuzlocke Progress Pill */}
        <div className="flex items-center gap-2 text-xs">
          <div className="bg-slate-100 text-slate-700 font-semibold px-3 py-1 rounded-full flex items-center gap-2 border border-slate-200/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              Progreso Nuzlocke:{' '}
              <strong className="text-emerald-700">{completedRoutesCount}</strong> / {totalRoutesCount} rutas
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowProgressionDrawer(!showProgressionDrawer)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1"
          >
            {showProgressionDrawer ? 'Ocultar Lista de Niveles' : 'Ver Orden por Niveles'}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showProgressionDrawer ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Nuzlocke Quick Progression Strip (Collapsible) */}
      {showProgressionDrawer && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600" />
              Rutas ordenadas de menor a mayor nivel (Progreso Nuzlocke):
            </span>
            <span className="text-slate-500 font-normal">Haz clic en una para seleccionarla</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
            {routes.map((r, idx) => {
              const encs = getRouteEncounters(r);
              const isCaught = encs.length > 0;
              const isSelected = r.id === selectedRouteId;

              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onRouteChange(r.id)}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl text-left border transition-all text-xs flex flex-col gap-0.5 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/90 shadow-sm ring-2 ring-indigo-500/20'
                      : isCaught
                      ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50'
                      : 'border-slate-200 bg-white hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-bold text-[10px] text-slate-400">#{idx + 1}</span>
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
                        isCaught ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {r.levelDisplay}
                    </span>
                  </div>
                  <div className="font-bold text-slate-800 truncate max-w-[130px]">{r.name}</div>
                  <div className="flex items-center gap-1 text-[10px] mt-0.5">
                    {isCaught ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-0.5 truncate max-w-[120px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
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

      {/* Prominent Nuzlocke Status Alert Banner */}
      {currentRouteCaught && latestCaught ? (
        <div
          id="nuzlocke-route-alert-caught"
          className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/70 border-2 border-emerald-300 text-slate-800 flex items-start sm:items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white border border-emerald-200 flex items-center justify-center p-1 relative flex-shrink-0 shadow-xs">
              <img
                src={getPokemonSprite(latestCaught.pokemon).sprite}
                alt={latestCaught.pokemon}
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = '0.3';
                }}
              />
              <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white rounded-full p-0.5">
                <CheckCircle2 className="w-3 h-3" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                  ✓ Zona Ya Registrada en Bitácora
                </span>
                <span className="text-xs font-semibold text-emerald-800">
                  {latestCaught.nickname
                    ? `${latestCaught.nickname} (${latestCaught.pokemon})`
                    : latestCaught.pokemon}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                <strong>Regla Nuzlocke:</strong> Ya tienes un Pokémon capturado en{' '}
                <strong>{currentRoute?.name}</strong>. Estado actual:{' '}
                <span className="font-semibold text-emerald-900">{latestCaught.status}</span> ({latestCaught.method}).
              </p>
            </div>
          </div>
          <span className="hidden md:inline-flex px-3 py-1 bg-white/80 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 text-center">
            Primer Encuentro Ya Consumido
          </span>
        </div>
      ) : (
        <div
          id="nuzlocke-route-alert-available"
          className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-sky-50 via-indigo-50/40 to-white border border-sky-200 text-slate-800 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700 flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-sky-900">
                  🟢 Zona Disponible para 1er Encuentro (Nuzlocke)
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Aún no has registrado ningún Pokémon en <strong>{currentRoute?.name}</strong> ({currentRoute?.levelDisplay}).
                ¡Tu próxima tirada aquí será tu encuentro oficial!
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-2.5 py-1 bg-white border border-sky-200 rounded-lg text-xs font-bold text-sky-700 flex-shrink-0">
            {availableCount} especies
          </span>
        </div>
      )}

      {/* Filter Tabs & Search Controls */}
      <div className="space-y-2.5">
        {/* Nuzlocke Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <span className="text-slate-400 mr-1 text-[11px] font-bold uppercase tracking-wider">Filtrar:</span>
          <button
            type="button"
            onClick={() => setNuzlockeFilter('all')}
            className={`px-3 py-1 rounded-xl transition-all ${
              nuzlockeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas ({totalRoutesCount})
          </button>
          <button
            type="button"
            onClick={() => setNuzlockeFilter('pending')}
            className={`px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 ${
              nuzlockeFilter === 'pending'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200/60'
            }`}
          >
            <CircleDot className="w-3.5 h-3.5 text-sky-500" />
            Pendientes ({pendingRoutesCount})
          </button>
          <button
            type="button"
            onClick={() => setNuzlockeFilter('completed')}
            className={`px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 ${
              nuzlockeFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Ya Capturadas ({completedRoutesCount})
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 text-xs font-medium">
          {(['All', 'Ruta', 'Área Silvestre', 'Cueva/Mina', 'Ciudad/Pueblo'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                categoryFilter === cat
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'All' ? 'Todas las Categorías' : cat}
            </button>
          ))}
        </div>

        {/* Search input + Route Select Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="route-search-input"
              type="text"
              placeholder="Buscar zona o nivel (ej. Ruta 1, Nv. 3, Axewell)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-medium"
            />
          </div>

          <div className="relative">
            <select
              id="route-dropdown-select"
              value={selectedRouteId}
              onChange={(e) => onRouteChange(e.target.value)}
              className="w-full py-2 px-3 text-sm font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            >
              {filteredRoutes.map((r, index) => {
                const encs = getRouteEncounters(r);
                const isCaught = encs.length > 0;
                const statusPrefix = isCaught ? `✓ [ATRAPADO: ${encs[0].cleanName}]` : `🟢 [LIBRE]`;

                return (
                  <option key={r.id} value={r.id}>
                    {statusPrefix} {r.name} ({r.levelDisplay}) - {r.category}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Weather, Method, and Probability Settings */}
      <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Weather Selector */}
        <div>
          <label
            htmlFor="weather-filter-select"
            className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1"
          >
            <Wind className="w-3.5 h-3.5 text-blue-500" />
            Clima en la ruta
          </label>
          <select
            id="weather-filter-select"
            value={selectedWeather}
            onChange={(e) => onWeatherChange(e.target.value)}
            className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 font-medium"
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
            className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1"
          >
            <Filter className="w-3.5 h-3.5 text-emerald-500" />
            Método de encuentro
          </label>
          <select
            id="method-filter-select"
            value={selectedMethod}
            onChange={(e) => onMethodChange(e.target.value as EncounterMethod | 'All')}
            className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-400 font-medium"
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
          <span className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Dice5 className="w-3.5 h-3.5 text-purple-500" />
            Modo de Probabilidad
          </span>
          <div className="flex rounded-lg p-0.5 bg-slate-100 border border-slate-200 text-xs font-semibold">
            <button
              id="mode-weighted-button"
              type="button"
              onClick={() => onToggleWeighted(true)}
              className={`flex-1 py-1 px-1.5 rounded-md text-center transition-all ${
                isWeighted ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Usa los porcentajes exactos del juego"
            >
              % Real
            </button>
            <button
              id="mode-uniform-button"
              type="button"
              onClick={() => onToggleWeighted(false)}
              className={`flex-1 py-1 px-1.5 rounded-md text-center transition-all ${
                !isWeighted ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Misma probabilidad para todos los disponibles"
            >
              Equitativo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
