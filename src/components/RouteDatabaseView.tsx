import React, { useState, useEffect, useMemo } from 'react';
import { RouteData, RouteEncounter, SavedEncounter, GameTenant, EncounterMethod } from '../types';
import { parsePokemonName, getPokemonSprite } from '../utils/pokemonMeta';
import { translateWeather, translateMethod } from '../data/routeTranslations';
import { usePokeDetail } from '../context/PokeDetailContext';
import { TypeBadge } from './TypeBadge';
import { Search, MapPin, Wind, Sparkles, Layers, Gamepad2 } from 'lucide-react';
import {
  cn,
  panel,
  card,
  btn,
  pill,
  text,
  field,
  layout,
  spriteFrame,
  TONES,
} from '../utils/ui';

const ALL_ZONES_ID = '__all__';

interface RouteDatabaseViewProps {
  routes: RouteData[];
  onSelectRouteForRoll: (routeId: string) => void;
  history?: SavedEncounter[];
  activeTenant?: GameTenant;
  onOpenTenantModal?: () => void;
}

interface DatabaseRow {
  key: string;
  pokemon: string;
  cleanName: string;
  chance?: number;
  levelRange?: string;
  methods: EncounterMethod[];
  weather: string;
  routeName: string;
  routeNames?: string[];
}

export const RouteDatabaseView: React.FC<RouteDatabaseViewProps> = ({
  routes,
  onSelectRouteForRoll,
  history = [],
  activeTenant,
  onOpenTenantModal,
}) => {
  const { openDetail } = usePokeDetail();
  const [selectedRouteId, setSelectedRouteId] = useState<string>(ALL_ZONES_ID);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWeather, setSelectedWeather] = useState<string>('All');
  const [selectedMethod, setSelectedMethod] = useState<string>('All');

  const isAllZones = selectedRouteId === ALL_ZONES_ID;
  const currentRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  const weatherOptions = useMemo(() => {
    if (isAllZones) {
      return Array.from(new Set(routes.flatMap((r) => r.weathers)));
    }
    return currentRoute?.weathers || [];
  }, [isAllZones, routes, currentRoute]);

  const methodOptions = useMemo(() => {
    if (isAllZones) {
      return Array.from(new Set(routes.flatMap((r) => r.methods)));
    }
    return currentRoute?.methods || [];
  }, [isAllZones, routes, currentRoute]);

  // Keep selected route valid when switching tenants
  useEffect(() => {
    if (selectedRouteId === ALL_ZONES_ID) return;
    if (!routes.some((r) => r.id === selectedRouteId)) {
      setSelectedRouteId(routes[0]?.id || '');
    }
  }, [routes, selectedRouteId]);

  const filteredEncounters = useMemo((): DatabaseRow[] => {
    const term = searchTerm.trim().toLowerCase();

    const matchesFilters = (enc: RouteEncounter) => {
      const matchesSearch =
        !term ||
        enc.pokemon.toLowerCase().includes(term) ||
        enc.cleanName.toLowerCase().includes(term);
      const matchesWeather = selectedWeather === 'All' || enc.weather === selectedWeather;
      const methods = enc.methods && enc.methods.length > 0 ? enc.methods : [enc.method];
      const matchesMethod =
        selectedMethod === 'All' ||
        enc.method === selectedMethod ||
        methods.includes(selectedMethod as EncounterMethod);
      return matchesSearch && matchesWeather && matchesMethod;
    };

    if (isAllZones) {
      const unique = new Map<string, DatabaseRow>();
      routes.forEach((route) => {
        route.encounters.filter(matchesFilters).forEach((enc) => {
          const key = enc.pokemon.toLowerCase();
          const existing = unique.get(key);
          const methods = enc.methods && enc.methods.length > 0 ? enc.methods : [enc.method];
          if (existing) {
            methods.forEach((m) => {
              if (!existing.methods.includes(m)) existing.methods.push(m);
            });
            if (!existing.routeNames?.includes(route.name)) {
              existing.routeNames = [...(existing.routeNames || [existing.routeName]), route.name];
            }
          } else {
            unique.set(key, {
              key,
              pokemon: enc.pokemon,
              cleanName: enc.cleanName,
              levelRange: enc.levelRange,
              methods: [...methods],
              weather: enc.weather,
              routeName: route.name,
              routeNames: [route.name],
            });
          }
        });
      });
      return Array.from(unique.values()).sort((a, b) => a.cleanName.localeCompare(b.cleanName, 'es'));
    }

    return (currentRoute?.encounters || []).filter(matchesFilters).map((enc, idx) => ({
      key: `${enc.pokemon}-${enc.method}-${enc.weather}-${idx}`,
      pokemon: enc.pokemon,
      cleanName: enc.cleanName,
      chance: enc.chance,
      levelRange: enc.levelRange,
      methods: enc.methods && enc.methods.length > 0 ? enc.methods : [enc.method],
      weather: enc.weather,
      routeName: currentRoute.name,
    }));
  }, [isAllZones, routes, currentRoute, searchTerm, selectedWeather, selectedMethod]);

  return (
    <div id="route-database-view" className={layout.view}>
      {/* Route Picker Banner */}
      <div className={panel()}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className={cn(text.pageTitle, 'flex items-center gap-2')}>
                <Layers className={cn('w-5 h-5', TONES.info.ink)} />
                Explorador de la Base de Datos
              </h2>
              {activeTenant && (
                <button
                  type="button"
                  onClick={onOpenTenantModal}
                  className={btn('soft', 'xs', 'info', 'rounded-full')}
                  title="Cambiar base de datos"
                >
                  <Gamepad2 className="w-3 h-3" />
                  <span>{activeTenant.shortName || activeTenant.name} ({activeTenant.region})</span>
                  <span className="text-[10px] underline ml-0.5">Cambiar</span>
                </button>
              )}
            </div>
            <p className={text.muted}>
              Consulta las tablas completas de encuentros, niveles, métodos y porcentajes para {activeTenant?.name || 'este juego'}. Haz clic en un Pokémon para ver habilidades y movimientos.
            </p>
          </div>

          {/* Quick roll button */}
          <button
            type="button"
            onClick={() => currentRoute && onSelectRouteForRoll(currentRoute.id)}
            disabled={isAllZones || !currentRoute}
            className={btn('primary', 'md', 'accent', 'w-fit')}
          >
            <Sparkles className="w-4 h-4" />
            Girar Ruleta en esta Ruta
          </button>
        </div>

        {/* Route Select Dropdown */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className={field.label}>Zona o Ruta</label>
            <select
              value={selectedRouteId}
              onChange={(e) => {
                setSelectedRouteId(e.target.value);
                setSelectedWeather('All');
                setSelectedMethod('All');
              }}
              className={field.select}
            >
              <option value={ALL_ZONES_ID}>Todas las zonas ({routes.length})</option>
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

          <div>
            <label className={field.label}>Filtrar por Clima</label>
            <select
              value={selectedWeather}
              onChange={(e) => setSelectedWeather(e.target.value)}
              className={field.select}
            >
              <option value="All">Todos los climas ({weatherOptions.length})</option>
              {weatherOptions.map((w) => (
                <option key={w} value={w}>
                  {translateWeather(w)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={field.label}>Filtrar por Método</label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className={field.select}
            >
              <option value="All">Todos los métodos</option>
              {methodOptions.map((m) => (
                <option key={m} value={m}>
                  {translateMethod(m)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={field.label}>Buscar Pokémon</label>
            <div className={field.withIcon}>
              <Search className={field.icon} />
              <input
                type="text"
                placeholder="Nombre del Pokémon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(field.input, field.iconInputPad)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Encounter Table / Grid */}
      <div className={panel()}>
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-brand-border">
          <h3 className={cn(text.sectionTitle, 'flex items-center gap-2')}>
            <MapPin className={cn('w-4 h-4', TONES.accent.ink)} />
            {isAllZones ? 'Todos los Pokémon del juego' : `Tabla de Encuentros de ${currentRoute?.name || ''}`}
          </h3>
          <span className={pill('neutral', 'md', 'shrink-0 tabular-nums')}>
            {filteredEncounters.length} {isAllZones ? 'Pokémon únicos' : 'registros encontrados'}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredEncounters.map((enc) => {
            const { displayName, types } = parsePokemonName(enc.pokemon);
            const { sprite } = getPokemonSprite(enc.pokemon);

            return (
              <button
                key={enc.key}
                type="button"
                onClick={() => openDetail('pokemon', enc.pokemon)}
                title={`Ver estadísticas, habilidades y movimientos de ${displayName}`}
                className={card({
                  interactive: true,
                  extra: 'flex items-center gap-3 text-left cursor-pointer',
                })}
              >
                <div className={spriteFrame(false, 'w-14 h-14 p-1')}>
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
                    <h4 className={cn(text.cardTitle, 'truncate')}>
                      {displayName}
                    </h4>
                    {typeof enc.chance === 'number' && (
                      <span className={pill('warning', 'sm', 'shrink-0 tabular-nums')}>
                        {enc.chance}%
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {types.map((type) => (
                      <TypeBadge key={type} type={type} />
                    ))}
                    {enc.methods.map((m) => (
                      <span key={m} className={pill('neutral', 'xs')}>
                        {translateMethod(m)}
                      </span>
                    ))}
                    {enc.levelRange && (
                      <span className={cn(text.meta, 'font-bold tabular-nums')}>
                        {enc.levelRange}
                      </span>
                    )}
                  </div>

                  <div className={cn(text.meta, 'mt-1.5 flex items-center gap-1.5 truncate')}>
                    <Wind className={cn('w-3.5 h-3.5 shrink-0', TONES.info.ink)} />
                    <span className="truncate">
                      {isAllZones && enc.routeNames
                        ? enc.routeNames.length > 2
                          ? `${enc.routeNames.slice(0, 2).join(', ')} +${enc.routeNames.length - 2}`
                          : enc.routeNames.join(', ')
                        : translateWeather(enc.weather)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
