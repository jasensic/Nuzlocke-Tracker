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
import {
  cn,
  panel,
  iconBtn,
  pill,
  iconTile,
  text,
  segmented,
  filterChip,
  anim,
  TONES,
} from '../utils/ui';

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
      className={panel(cn('w-full space-y-5', anim.fadeInUp))}
    >
      {/* Header with Title and Close Button */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-brand-border">
        <div className="flex items-center gap-2">
          <div className={iconTile('accent')}>
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className={text.cardTitle}>
              Carrusel de Filtros y Condiciones
            </h3>
            <p className={text.meta}>
              Personaliza el clima y tipo de encuentro para la ruleta
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={pill('accent', 'md', 'shrink-0 tabular-nums')}>
            {availableCount} Disponibles
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar filtros"
            className={iconBtn('ghost', 'sm', 'neutral')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. CARRUSEL DE CLIMAS */}
      <div className="space-y-2">
        <div className={cn('flex items-center justify-between gap-2', text.labelStrong)}>
          <span className="flex items-center gap-1.5">
            <Wind className={cn('w-3.5 h-3.5', TONES.info.ink)} />
            Carrusel de Climas en {currentRoute?.name}:
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollWeather('left')}
              className={iconBtn('soft', 'sm', 'neutral')}
              title="Desplazar a la izquierda"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollWeather('right')}
              className={iconBtn('soft', 'sm', 'neutral')}
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
                className={filterChip(
                  isSelected,
                  'accent',
                  'flex-col shrink-0 min-w-[130px] text-left select-none'
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                      isSelected ? 'bg-brand-card/20' : 'bg-brand-card border border-brand-border'
                    )}
                  >
                    <WeatherIcon className="w-4 h-4" />
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded-md tabular-nums',
                      isSelected ? 'bg-brand-card/20' : 'bg-brand-card border border-brand-border'
                    )}
                  >
                    {count}
                  </span>
                </div>
                <div className="w-full">
                  <div className="font-bold text-xs truncate">{weatherLabel}</div>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2 border-t border-brand-border">
        {/* Método Carousel / Pills */}
        <div className="lg:col-span-2 space-y-2">
          <label className={cn(text.labelStrong, 'flex items-center gap-1.5')}>
            <Filter className={cn('w-3.5 h-3.5', TONES.success.ink)} />
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
                  className={filterChip(isSelected)}
                >
                  <span>{label}</span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-md tabular-nums',
                      isSelected ? 'bg-brand-card/20' : 'bg-brand-card border border-brand-border'
                    )}
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
          <span className={cn(text.labelStrong, 'flex items-center gap-1.5')}>
            <Dice5 className={cn('w-3.5 h-3.5', TONES.info.ink)} />
            Ponderación de Probabilidad:
          </span>
          <div className={cn(segmented.group, 'flex w-full')}>
            <button
              id="mode-weighted-button"
              type="button"
              onClick={() => onToggleWeighted(true)}
              className={segmented.item(isWeighted, 'flex-1')}
              title="Usa las probabilidades exactas del juego oficial"
            >
              % Real Oficial
            </button>
            <button
              id="mode-uniform-button"
              type="button"
              onClick={() => onToggleWeighted(false)}
              className={segmented.item(!isWeighted, 'flex-1')}
              title="Misma probabilidad exacta para todos los Pokémon disponibles"
            >
              Equitativo (1/N)
            </button>
          </div>
        </div>
      </div>

      {/* 3. CARRUSEL DE RUTAS POR NIVEL (Progreso Nuzlocke) */}
      <div className="pt-3 border-t border-brand-border space-y-2">
        <div className={cn('flex items-center justify-between gap-2', text.labelStrong)}>
          <span className="flex items-center gap-1.5">
            <ArrowUpDown className={cn('w-3.5 h-3.5', TONES.info.ink)} />
            Cambio Rápido de Ruta por Nivel (#1 a #{routes.length}):
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollRoutes('left')}
              className={iconBtn('soft', 'sm', 'neutral')}
              title="Rutas anteriores"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollRoutes('right')}
              className={iconBtn('soft', 'sm', 'neutral')}
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
                className={filterChip(
                  isSelected,
                  'accent',
                  'flex-col shrink-0 min-w-[130px] text-left select-none'
                )}
              >
                <div className="flex items-center justify-between gap-1 w-full">
                  <span className="font-bold text-[10px] opacity-60 tabular-nums">#{idx + 1}</span>
                  <span className={pill(isRouteCaught ? 'success' : 'warning', 'xs', 'tabular-nums')}>
                    {r.levelDisplay}
                  </span>
                </div>
                <div className="font-bold text-xs truncate w-full">
                  {r.name}
                </div>
                <div className="flex items-center gap-1 text-[10px] w-full">
                  {isRouteCaught ? (
                    <span className="font-bold flex items-center gap-0.5 truncate">
                      <CheckCircle2 className={cn('w-3 h-3 shrink-0', !isSelected && TONES.success.ink)} />
                      {encs[0].cleanName || encs[0].pokemon}
                    </span>
                  ) : (
                    <span className="font-semibold flex items-center gap-0.5">
                      <CircleDot className={cn('w-3 h-3 shrink-0', !isSelected && TONES.info.ink)} />
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
