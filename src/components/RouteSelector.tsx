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
import {
  cn,
  panel,
  card,
  inset,
  btn,
  pill,
  pillSolid,
  iconTile,
  text,
  field,
  layout,
  filterChip,
  segmented,
  spriteFrame,
  TONES,
} from '../utils/ui';

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
      className={panel('space-y-4')}
    >
      {/* Top Header: Route title & Level Range Badge & Nuzlocke Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-border">
        <div className="flex items-center gap-2 flex-wrap">
          <label htmlFor="route-dropdown-select" className={cn(text.sectionTitle, 'flex items-center gap-1.5')}>
            <MapPin className={cn('w-5 h-5', TONES.accent.ink)} />
            Zona / Ruta
          </label>
          <span className={pill('warning', 'sm', 'tabular-nums')}>
            <Flame className="w-3 h-3" />
            {currentRoute?.levelDisplay || 'Nv. ?'}
          </span>
          <span className={pill('neutral', 'sm')}>
            {currentRoute?.category}
          </span>
        </div>

        {/* Nuzlocke Progress Pill */}
        <div className="flex items-center gap-2">
          <div className={pill('neutral', 'md', 'gap-2 tabular-nums')}>
            <ShieldCheck className={cn('w-3.5 h-3.5', TONES.success.ink)} />
            <span>
              Progreso Nuzlocke:{' '}
              <strong className={TONES.success.ink}>{completedRoutesCount}</strong> / {totalRoutesCount} rutas
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowProgressionDrawer(!showProgressionDrawer)}
            className={btn('soft', 'sm', 'info', 'rounded-full')}
          >
            {showProgressionDrawer ? 'Ocultar Lista de Niveles' : 'Ver Orden por Niveles'}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showProgressionDrawer ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Nuzlocke Quick Progression Strip (Collapsible) */}
      {showProgressionDrawer && (
        <div className={inset('space-y-2')}>
          <div className={cn('flex items-center justify-between gap-2', text.labelStrong)}>
            <span className="flex items-center gap-1">
              <ArrowUpDown className={cn('w-3.5 h-3.5', TONES.info.ink)} />
              Rutas ordenadas de menor a mayor nivel (Progreso Nuzlocke):
            </span>
            <span className={text.meta}>Haz clic en una para seleccionarla</span>
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
                  className={card({
                    interactive: true,
                    active: isSelected,
                    tone: isCaught ? 'success' : 'neutral',
                    padding: 'compact',
                    extra: 'shrink-0 text-left text-xs flex flex-col gap-0.5 min-w-[8.5rem]',
                  })}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className={cn(text.meta, 'font-semibold')}>#{idx + 1}</span>
                    <span className={pill(isCaught ? 'success' : 'warning', 'xs')}>
                      {r.levelDisplay}
                    </span>
                  </div>
                  <div className={cn(text.subtitle, 'truncate max-w-[130px]')}>{r.name}</div>
                  <div className={cn('flex items-center gap-1 mt-0.5', text.meta)}>
                    {isCaught ? (
                      <span className={cn('font-semibold flex items-center gap-0.5 truncate max-w-[120px]', TONES.success.ink)}>
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        {encs[0].cleanName || encs[0].pokemon}
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5">
                        <CircleDot className="w-3 h-3 shrink-0" />
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
          className={card({
            tone: 'success',
            extra: 'flex items-start sm:items-center justify-between gap-3',
          })}
        >
          <div className="flex items-center gap-3">
            <div className={spriteFrame(false, 'w-12 h-12 p-1 relative')}>
              <img
                src={getPokemonSprite(latestCaught.pokemon).sprite}
                alt={latestCaught.pokemon}
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = '0.3';
                }}
              />
              <span className={cn('absolute -top-1.5 -right-1.5 rounded-full p-0.5', TONES.success.solid)}>
                <CheckCircle2 className="w-3 h-3" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={pillSolid('success', 'sm')}>
                  ✓ Zona Ya Registrada en Bitácora
                </span>
                <span className={cn(text.muted, 'font-semibold', TONES.success.ink)}>
                  {latestCaught.nickname
                    ? `${latestCaught.nickname} (${latestCaught.pokemon})`
                    : latestCaught.pokemon}
                </span>
              </div>
              <p className={cn(text.muted, 'mt-1')}>
                <strong>Regla Nuzlocke:</strong> Ya tienes un Pokémon capturado en{' '}
                <strong>{currentRoute?.name}</strong>. Estado actual:{' '}
                <span className="font-semibold">{latestCaught.status}</span> ({latestCaught.method}).
              </p>
            </div>
          </div>
          <span className={cn(pill('success', 'md'), 'hidden md:inline-flex')}>
            Primer Encuentro Ya Consumido
          </span>
        </div>
      ) : (
        <div
          id="nuzlocke-route-alert-available"
          className={card({
            tone: 'info',
            extra: 'flex items-center justify-between gap-3',
          })}
        >
          <div className="flex items-center gap-2.5">
            <span className={iconTile('info')}>
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={cn(text.subtitle, TONES.info.ink)}>
                  Zona Disponible para 1er Encuentro (Nuzlocke)
                </span>
              </div>
              <p className={text.muted}>
                Aún no has registrado ningún Pokémon en <strong>{currentRoute?.name}</strong> ({currentRoute?.levelDisplay}).
                ¡Tu próxima tirada aquí será tu encuentro oficial!
              </p>
            </div>
          </div>
          <span className={cn(pill('info', 'md'), 'hidden sm:inline-flex shrink-0')}>
            {availableCount} especies
          </span>
        </div>
      )}

      {/* Filter Tabs & Search Controls */}
      <div className="space-y-2.5">
        {/* Nuzlocke Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={cn(text.label, 'mr-1')}>Filtrar:</span>
          <button
            type="button"
            onClick={() => setNuzlockeFilter('all')}
            className={filterChip(nuzlockeFilter === 'all')}
          >
            Todas ({totalRoutesCount})
          </button>
          <button
            type="button"
            onClick={() => setNuzlockeFilter('pending')}
            className={filterChip(nuzlockeFilter === 'pending', 'info')}
          >
            <CircleDot className="w-3.5 h-3.5" />
            Pendientes ({pendingRoutesCount})
          </button>
          <button
            type="button"
            onClick={() => setNuzlockeFilter('completed')}
            className={filterChip(nuzlockeFilter === 'completed', 'success')}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
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
              className={filterChip(categoryFilter === cat)}
            >
              {cat === 'All' ? 'Todas las Categorías' : cat}
            </button>
          ))}
        </div>

        {/* Search input + Route Select Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <div className={field.withIcon}>
            <Search className={field.icon} />
            <input
              id="route-search-input"
              type="text"
              placeholder="Buscar zona o nivel (ej. Ruta 1, Nv. 3, Axewell)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(field.input, field.iconInputPad)}
            />
          </div>

          <div className="relative">
            <select
              id="route-dropdown-select"
              value={selectedRouteId}
              onChange={(e) => onRouteChange(e.target.value)}
              className={field.select}
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
      <div className={cn('pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3', layout.divider)}>
        {/* Weather Selector */}
        <div>
          <label
            htmlFor="weather-filter-select"
            className={cn(field.label, 'flex items-center gap-1')}
          >
            <Wind className={cn('w-3.5 h-3.5', TONES.info.ink)} />
            Clima en la ruta
          </label>
          <select
            id="weather-filter-select"
            value={selectedWeather}
            onChange={(e) => onWeatherChange(e.target.value)}
            className={field.select}
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
            className={cn(field.label, 'flex items-center gap-1')}
          >
            <Filter className={cn('w-3.5 h-3.5', TONES.success.ink)} />
            Método de encuentro
          </label>
          <select
            id="method-filter-select"
            value={selectedMethod}
            onChange={(e) => onMethodChange(e.target.value as EncounterMethod | 'All')}
            className={field.select}
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
          <span className={cn(field.label, 'flex items-center gap-1')}>
            <Dice5 className={cn('w-3.5 h-3.5', TONES.info.ink)} />
            Modo de Probabilidad
          </span>
          <div className={segmented.group}>
            <button
              id="mode-weighted-button"
              type="button"
              onClick={() => onToggleWeighted(true)}
              className={segmented.item(isWeighted, 'flex-1')}
              title="Usa los porcentajes exactos del juego"
            >
              % Real
            </button>
            <button
              id="mode-uniform-button"
              type="button"
              onClick={() => onToggleWeighted(false)}
              className={segmented.item(!isWeighted, 'flex-1')}
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
