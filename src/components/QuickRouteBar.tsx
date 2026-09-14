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
import { cn, panel, btn, pill, text, field, TONES } from '../utils/ui';

interface QuickRouteBarProps {
  routes: RouteData[];
  selectedRouteId: string;
  onRouteChange: (routeId: string) => void;
  history: SavedEncounter[];
  showFilters?: boolean;
  onToggleFilters?: () => void;
  showProgression?: boolean;
  onToggleProgression?: () => void;
}

export const QuickRouteBar: React.FC<QuickRouteBarProps> = ({
  routes,
  selectedRouteId,
  onRouteChange,
  history,
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

  return (
    <div
      id="quick-route-bar"
      className={panel('space-y-3')}
    >
      {/* 1. Route Navigator Row: Previous, Quick Selector, Next */}
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {/* Previous Route Button */}
        <button
          id="prev-route-button"
          type="button"
          onClick={() => prevRoute && onRouteChange(prevRoute.id)}
          disabled={!prevRoute}
          title={prevRoute ? `Anterior: ${prevRoute.name} (${prevRoute.levelDisplay})` : 'Primera ruta'}
          className={btn('secondary', 'md', 'accent', 'shrink-0')}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Quick Route Dropdown */}
        <div className={cn(field.withIcon, 'min-w-0')}>
          <div className={cn('absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1', TONES.accent.ink)}>
            <MapPin className="w-4 h-4 shrink-0" />
          </div>
          <select
            id="quick-route-select"
            value={selectedRouteId}
            onChange={(e) => onRouteChange(e.target.value)}
            className={cn(field.select, field.iconInputPad, 'truncate')}
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
          className={btn('secondary', 'md', 'accent', 'shrink-0')}
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2. UNIFIED ROUTE INFO: The ONLY place showing all route metadata */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-brand-border">
        {/* Route Details: Name, Level, Category & Index */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className={cn(text.subtitle, 'flex items-center gap-1.5')}>
            <Compass className={cn('w-4 h-4 shrink-0', TONES.accent.ink)} />
            <span>{currentRoute?.name}</span>
          </div>

          <span className={pill('warning', 'sm', 'tabular-nums')}>
            <Flame className="w-3 h-3" />
            {currentRoute?.levelDisplay}
          </span>

          <span className={pill('neutral', 'sm')}>
            {currentRoute?.category}
          </span>

          <span className={cn(text.meta, 'font-bold tabular-nums')}>
            (Ruta {currentIndex + 1} de {routes.length})
          </span>
        </div>

        {/* Nuzlocke Route Status Tag (visible on both mobile and desktop) */}
        <div className="flex items-center">
          {isCaught && caughtPokemon ? (
            <div className={pill('success', 'md')}>
              <img
                src={getPokemonSprite(caughtPokemon.pokemon).sprite}
                alt={caughtPokemon.pokemon}
                className="w-4 h-4 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>
                Ya capturado:{' '}
                <strong>
                  {caughtPokemon.nickname ? `${caughtPokemon.nickname} (${caughtPokemon.cleanName})` : caughtPokemon.cleanName}
                </strong>
              </span>
            </div>
          ) : (
            <div className={pill('info', 'md')}>
              <CircleDot className="w-3.5 h-3.5 shrink-0" />
              <span>🟢 1º Encuentro Disponible</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
