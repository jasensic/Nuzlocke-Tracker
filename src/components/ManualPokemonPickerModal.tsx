import React, { useState, useMemo } from 'react';
import { RouteData, RouteEncounter, SavedEncounter } from '../types';
import { parsePokemonName, TYPE_COLORS, getPokemonSprite } from '../utils/pokemonMeta';
import { translateMethod, translateWeather } from '../data/routeTranslations';
import {
  Hand,
  Search,
  X,
  Sparkles,
  BookmarkCheck,
  Compass,
  Filter,
  Check,
} from 'lucide-react';

interface ManualPokemonPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoute: RouteData;
  availableEncounters: RouteEncounter[];
  history: SavedEncounter[];
  onSelectPokemon: (encounter: RouteEncounter) => void;
}

export const ManualPokemonPickerModal: React.FC<ManualPokemonPickerModalProps> = ({
  isOpen,
  onClose,
  currentRoute,
  availableEncounters,
  history,
  onSelectPokemon,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethodFilter, setSelectedMethodFilter] = useState<string>('all');
  const [showAllRouteEncounters, setShowAllRouteEncounters] = useState<boolean>(false);

  // Encounters pool to pick from
  const pool = showAllRouteEncounters ? currentRoute.encounters : availableEncounters;

  // Extract unique methods for quick filter tabs
  const availableMethods = useMemo(() => {
    const methods = new Set<string>();
    currentRoute.encounters.forEach((e) => methods.add(e.method));
    return Array.from(methods);
  }, [currentRoute]);

  // Registered pokemon clean names in this route
  const registeredInThisRoute = useMemo(() => {
    const set = new Set<string>();
    history
      .filter((h) => h.routeId === currentRoute.id)
      .forEach((h) => set.add(h.cleanName.toLowerCase()));
    return set;
  }, [history, currentRoute.id]);

  // Filtered list based on search and method
  const filteredList = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return pool.filter((enc) => {
      // Method filter
      if (selectedMethodFilter !== 'all' && enc.method !== selectedMethodFilter) {
        return false;
      }

      if (!query) return true;

      const meta = parsePokemonName(enc.pokemon);
      const nameMatch =
        meta.cleanName.toLowerCase().includes(query) ||
        meta.displayName.toLowerCase().includes(query) ||
        enc.pokemon.toLowerCase().includes(query);
      const typeMatch = meta.types.some((t) => t.toLowerCase().includes(query));
      const methodMatch = translateMethod(enc.method).toLowerCase().includes(query);

      return nameMatch || typeMatch || methodMatch;
    });
  }, [pool, searchQuery, selectedMethodFilter]);

  if (!isOpen) return null;

  const handleSelect = (enc: RouteEncounter) => {
    onSelectPokemon(enc);
    onClose();
  };

  return (
    <div
      id="manual-picker-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="manual-picker-modal"
        className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[90vh] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Hand className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Elegir Pokémon a Dedo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Compass className="w-3.5 h-3.5 text-amber-500" />
                <span>{currentRoute.name}</span>
                <span>•</span>
                <span>{filteredList.length} opciones encontradas</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls: Search & Scope */}
        <div className="p-4 sm:px-6 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 space-y-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre (ej: Pikachu, Rookidee) o tipo (Fuego, Agua)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Scope Toggle & Method Chips */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {/* Filter scope buttons */}
            <div className="inline-flex rounded-xl p-1 bg-slate-200/70 dark:bg-slate-800 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setShowAllRouteEncounters(false)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  !showAllRouteEncounters
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Filtros Activos ({availableEncounters.length})
              </button>
              <button
                type="button"
                onClick={() => setShowAllRouteEncounters(true)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  showAllRouteEncounters
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Todos de la Ruta ({currentRoute.encounters.length})
              </button>
            </div>

            {/* Methods filter */}
            {availableMethods.length > 1 && (
              <div className="flex items-center gap-1 overflow-x-auto max-w-full py-0.5">
                <button
                  type="button"
                  onClick={() => setSelectedMethodFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    selectedMethodFilter === 'all'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Todos
                </button>
                {availableMethods.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMethodFilter(m)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                      selectedMethodFilter === m
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {translateMethod(m)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pokemon Cards Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {filteredList.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No se encontraron Pokémon con los filtros actuales
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Prueba a cambiar el texto de búsqueda o activar la opción "Todos de la Ruta".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredList.map((enc, idx) => {
                const meta = parsePokemonName(enc.pokemon);
                const { showdown, sprite } = getPokemonSprite(enc.pokemon);
                const primaryType = meta.types[0] || 'Normal';
                const typeStyle = TYPE_COLORS[primaryType] || TYPE_COLORS['Normal'];
                const isRegistered = registeredInThisRoute.has(meta.cleanName.toLowerCase());

                return (
                  <div
                    key={`${enc.pokemon}-${enc.method}-${enc.chance}-${idx}`}
                    onClick={() => handleSelect(enc)}
                    className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 hover:bg-amber-50/60 dark:hover:bg-slate-700/70 hover:border-amber-400 dark:hover:border-amber-500/80 transition-all cursor-pointer flex flex-col justify-between group shadow-2xs hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      {/* Sprite container */}
                      <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform">
                        <img
                          src={showdown}
                          alt={meta.displayName}
                          className="w-11 h-11 object-contain pixelated"
                          loading="lazy"
                          onError={(e) => {
                            // Fallback to static sprite
                            const target = e.target as HTMLImageElement;
                            if (target.src !== sprite) {
                              target.src = sprite;
                            }
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {meta.displayName}
                          </h4>
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {enc.chance}%
                          </span>
                        </div>

                        {/* Types */}
                        <div className="flex items-center gap-1 mt-1">
                          {meta.types.map((t) => {
                            const tColor = TYPE_COLORS[t] || TYPE_COLORS['Normal'];
                            return (
                              <span
                                key={t}
                                className="px-1.5 py-0.2 rounded text-[9px] font-extrabold text-white uppercase tracking-wider"
                                style={{ backgroundColor: tColor.bg }}
                              >
                                {t}
                              </span>
                            );
                          })}
                        </div>

                        {/* Method & Level */}
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-1.5">
                          <span className="truncate">{translateMethod(enc.method)}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Nv. {enc.levelRange}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer card status & button */}
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                      {isRegistered ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          <BookmarkCheck className="w-3.5 h-3.5" />
                          Ya en bitácora
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          Disponible
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(enc);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-black bg-slate-900 hover:bg-amber-500 dark:bg-slate-700 dark:hover:bg-amber-500 text-white transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>Elegir</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Haz clic en cualquier Pokémon para seleccionarlo directamente como tu encuentro de ruta.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white transition-colors shadow-2xs ml-auto"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
