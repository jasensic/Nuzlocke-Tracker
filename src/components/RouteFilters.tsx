import React, { useRef } from 'react';
import { RouteData, EncounterMethod, SavedEncounter } from '../types';
import { translateWeather } from '../data/routeTranslations';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  Wind,
  CloudFog,
  Sparkles,
  Filter,
  Dice5,
  CheckCircle2,
  CircleDot,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal,
  Eye,
  Search,
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
  selectedRouteId,
  onRouteChange,
  isOpen,
  onClose,
}) => {
  const weatherScrollRef = useRef<HTMLDivElement>(null);
  const routeScrollRef = useRef<HTMLDivElement>(null);

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

  const getWeatherIcon = (weather: string) => {
    const w = weather.toLowerCase();
    if (w.includes('normal') || w.includes('despejado') || w.includes('sun') || w.includes('sol')) {
      return Sun;
    }
    if (w.includes('overcast') || w.includes('nublado')) {
      return Cloud;
    }
    if (w.includes('rain') || w.includes('lluvia')) {
      return CloudRain;
    }
    if (w.includes('thunder') || w.includes('tormenta eléctrica')) {
      return CloudLightning;
    }
    if (w.includes('snow') || w.includes('nieve') || w.includes('ventisca')) {
      return Snowflake;
    }
    if (w.includes('sand') || w.includes('arena') || w.includes('wind')) {
      return Wind;
    }
    if (w.includes('fog') || w.includes('niebla')) {
      return CloudFog;
    }
    return Sparkles;
  };

  // Weather encounter counts
  const weatherCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      All: currentRoute?.encounters.length || 0,
    };
    for (const w of currentRoute?.weathers || []) {
      counts[w] = currentRoute.encounters.filter((e) => e.weather === w).length;
    }
    return counts;
  }, [currentRoute]);

  // Method encounter counts
  const methodCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      All: currentRoute?.encounters.length || 0,
    };
    for (const m of currentRoute?.methods || []) {
      counts[m] = currentRoute.encounters.filter((e) => e.method === m).length;
    }
    return counts;
  }, [currentRoute]);

  const scrollWeather = (direction: 'left' | 'right') => {
    if (weatherScrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      weatherScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRoutes = (direction: 'left' | 'right') => {
    if (routeScrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      routeScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!isOpen) return null;

  const allWeathersList = ['All', ...(currentRoute?.weathers || [])];
  const allMethodsList: Array<EncounterMethod | 'All'> = ['All', ...(currentRoute?.methods || [])];

  return (
    <div
      id="route-filters-carousel-panel"
      className="w-full bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5 transition-all animate-fadeIn"
    >
      {/* Header with Title and Close Button */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-black">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              Carrusel de Filtros y Condiciones
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Personaliza el clima y tipo de encuentro para la ruleta
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-extrabold text-xs border border-red-200 dark:border-red-900">
            {availableCount} Disponibles
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar filtros"
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. CARRUSEL DE CLIMAS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
          <span className="flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-blue-500" />
            Carrusel de Climas en {currentRoute?.name}:
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollWeather('left')}
              className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Desplazar a la izquierda"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollWeather('right')}
              className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Desplazar a la derecha"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          ref={weatherScrollRef}
          className="flex gap-2.5 overflow-x-auto pb-2 pt-1 scroll-smooth scrollbar-thin"
        >
          {allWeathersList.map((weatherKey) => {
            const isSelected = selectedWeather === weatherKey;
            const WeatherIcon = getWeatherIcon(weatherKey);
            const weatherLabel = weatherKey === 'All' ? 'Todos los Climas' : translateWeather(weatherKey);
            const count = weatherCounts[weatherKey] ?? 0;

            return (
              <button
                key={weatherKey}
                type="button"
                onClick={() => onWeatherChange(weatherKey)}
                className={`flex-shrink-0 min-w-[130px] p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 select-none ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/90 dark:bg-blue-950/60 shadow-xs ring-1 ring-blue-500/20 text-blue-950 dark:text-blue-100'
                    : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <WeatherIcon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded-lg ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </div>
                <div>
                  <div className="font-black text-xs truncate">{weatherLabel}</div>
                  <div className="text-[10px] opacity-70 font-medium">
                    {isSelected ? '✓ Seleccionado' : 'Tocar para activar'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CARRUSEL DE MÉTODOS Y MODO DE PROBABILIDAD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
        {/* Método Carousel / Pills */}
        <div className="lg:col-span-2 space-y-2">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-500" />
            Método de Aparición:
          </label>
          <div className="flex flex-wrap gap-2">
            {allMethodsList.map((methodKey) => {
              const isSelected = selectedMethod === methodKey;
              const count = methodCounts[methodKey] ?? 0;
              const label =
                methodKey === 'All'
                  ? 'Cualquier Método'
                  : methodKey === 'Hidden'
                  ? 'Hierba Oculta (!)'
                  : methodKey === 'Visible'
                  ? 'Sobrehierba'
                  : methodKey === 'Fishing'
                  ? 'Pesca'
                  : methodKey === 'Surfing'
                  ? 'Surf'
                  : methodKey;

              return (
                <button
                  key={methodKey}
                  type="button"
                  onClick={() => onMethodChange(methodKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isSelected
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modo de Probabilidad */}
        <div className="space-y-2">
          <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Dice5 className="w-3.5 h-3.5 text-purple-500" />
            Ponderación de Probabilidad:
          </span>
          <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              id="mode-weighted-button"
              type="button"
              onClick={() => onToggleWeighted(true)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                isWeighted
                  ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs border border-purple-200 dark:border-purple-800'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Usa las probabilidades exactas del juego oficial"
            >
              % Real Oficial
            </button>
            <button
              id="mode-uniform-button"
              type="button"
              onClick={() => onToggleWeighted(false)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                !isWeighted
                  ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs border border-purple-200 dark:border-purple-800'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Misma probabilidad exacta para todos los Pokémon disponibles"
            >
              Equitativo (1/N)
            </button>
          </div>
        </div>
      </div>

      {/* 3. CARRUSEL DE RUTAS POR NIVEL (Progreso Nuzlocke) */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
          <span className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
            Cambio Rápido de Ruta por Nivel (#1 a #{routes.length}):
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollRoutes('left')}
              className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Rutas anteriores"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollRoutes('right')}
              className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Rutas siguientes"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div
          ref={routeScrollRef}
          className="flex gap-2 overflow-x-auto pb-2 pt-1 scroll-smooth scrollbar-thin"
        >
          {routes.map((r, idx) => {
            const encs = getRouteEncounters(r);
            const isRouteCaught = encs.length > 0;
            const isSelected = r.id === selectedRouteId;

            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onRouteChange(r.id)}
                className={`flex-shrink-0 min-w-[130px] p-2.5 rounded-2xl text-left border transition-all flex flex-col gap-1 select-none ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/90 dark:bg-indigo-950/60 shadow-xs ring-1 ring-indigo-500/20'
                    : isRouteCaught
                    ? 'border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                    : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-black text-[10px] text-slate-400">#{idx + 1}</span>
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                      isRouteCaught
                        ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    {r.levelDisplay}
                  </span>
                </div>
                <div className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate">
                  {r.name}
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                  {isRouteCaught ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-0.5 truncate">
                      <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                      {encs[0].cleanName || encs[0].pokemon}
                    </span>
                  ) : (
                    <span className="text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-0.5">
                      <CircleDot className="w-3 h-3 flex-shrink-0" />
                      Disponible
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
