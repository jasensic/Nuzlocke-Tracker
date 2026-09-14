import React, { useState, useMemo } from 'react';
import { RouteData, RouteEncounter, SavedEncounter } from '../types';
import { parsePokemonName, getPokemonSprite } from '../utils/pokemonMeta';
import { translateMethod } from '../data/routeTranslations';
import {
  Hand,
  Search,
  X,
  BookmarkCheck,
  Compass,
  Check,
} from 'lucide-react';
import { TypeBadge } from './TypeBadge';
import {
  cn,
  card,
  btn,
  iconBtn,
  pill,
  iconTile,
  text,
  field,
  surface,
  layout,
  segmented,
  filterChip,
  spriteFrame,
  emptyState,
  TONES,
} from '../utils/ui';

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
      className={surface.overlay}
      onClick={onClose}
    >
      <div
        id="manual-picker-modal"
        className={cn(surface.modal, 'max-w-3xl max-h-[90vh] flex flex-col')}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-brand-border flex items-center justify-between bg-brand-surface">
          <div className="flex items-center gap-3">
            <span className={iconTile('warning', 'w-10 h-10')}>
              <Hand className="w-5 h-5" />
            </span>
            <div>
              <h3 className={text.sectionTitle}>
                Elegir Pokémon a Dedo
              </h3>
              <p className={cn(text.muted, 'flex items-center gap-1.5 mt-0.5')}>
                <Compass className={cn('w-3.5 h-3.5', TONES.warning.ink)} />
                <span>{currentRoute.name}</span>
                <span>•</span>
                <span>{filteredList.length} opciones encontradas</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={iconBtn('ghost', 'md', 'neutral')}
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls: Search & Scope */}
        <div className="p-4 sm:px-6 bg-brand-surface border-b border-brand-border space-y-3">
          {/* Search Box */}
          <div className={field.withIcon}>
            <Search className={field.icon} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre (ej: Pikachu, Rookidee) o tipo (Fuego, Agua)..."
              className={cn(field.input, field.iconInputPad, searchQuery && 'pr-9')}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-txt2 hover:text-brand-txt1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Scope Toggle & Method Chips */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className={segmented.group}>
              <button
                type="button"
                onClick={() => setShowAllRouteEncounters(false)}
                className={segmented.item(!showAllRouteEncounters)}
              >
                Filtros Activos ({availableEncounters.length})
              </button>
              <button
                type="button"
                onClick={() => setShowAllRouteEncounters(true)}
                className={segmented.item(showAllRouteEncounters)}
              >
                Todos de la Ruta ({currentRoute.encounters.length})
              </button>
            </div>

            {availableMethods.length > 1 && (
              <div className="flex items-center gap-1 overflow-x-auto max-w-full py-0.5">
                <button
                  type="button"
                  onClick={() => setSelectedMethodFilter('all')}
                  className={filterChip(selectedMethodFilter === 'all')}
                >
                  Todos
                </button>
                {availableMethods.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMethodFilter(m)}
                    className={filterChip(selectedMethodFilter === m)}
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
            <div className={emptyState.wrapper}>
              <div className={emptyState.bubble}>
                <Search className="w-6 h-6" />
              </div>
              <p className={emptyState.title}>
                No se encontraron Pokémon con los filtros actuales
              </p>
              <p className={emptyState.hint}>
                Prueba a cambiar el texto de búsqueda o activar la opción "Todos de la Ruta".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredList.map((enc, idx) => {
                const meta = parsePokemonName(enc.pokemon);
                const { showdown, sprite } = getPokemonSprite(enc.pokemon);
                const isRegistered = registeredInThisRoute.has(meta.cleanName.toLowerCase());

                return (
                  <div
                    key={`${enc.pokemon}-${enc.method}-${enc.chance}-${idx}`}
                    onClick={() => handleSelect(enc)}
                    className={card({
                      interactive: true,
                      extra: 'flex flex-col justify-between group cursor-pointer',
                    })}
                  >
                    <div className="flex items-start gap-3">
                      <div className={spriteFrame(true, 'w-14 h-14')}>
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

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className={cn(text.subtitle, 'truncate group-hover:text-brand-accent-ink transition-colors')}>
                            {meta.displayName}
                          </h4>
                          <span className={pill('neutral', 'xs')}>
                            {enc.chance}%
                          </span>
                        </div>

                        <div className="flex items-center gap-1 mt-1">
                          {meta.types.map((t) => (
                            <TypeBadge key={t} type={t} />
                          ))}
                        </div>

                        <div className={cn(text.meta, 'flex items-center gap-1.5 mt-1.5 flex-wrap')}>
                          <span className="truncate">
                            {enc.methods && enc.methods.length > 1
                              ? enc.methods.map(translateMethod).join(' / ')
                              : translateMethod(enc.method)}
                          </span>
                          {enc.levelRange && (
                            <>
                              <span>•</span>
                              <span className="font-semibold text-brand-txt1">
                                {enc.levelRange.startsWith('Nv.') ? enc.levelRange : `Nv. ${enc.levelRange}`}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={cn('mt-3 pt-2 flex items-center justify-between', layout.divider)}>
                      {isRegistered ? (
                        <span className={cn('inline-flex items-center gap-1 text-xs font-semibold', TONES.success.ink)}>
                          <BookmarkCheck className="w-3.5 h-3.5" />
                          Ya en bitácora
                        </span>
                      ) : (
                        <span className={text.meta}>
                          Disponible
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(enc);
                        }}
                        className={btn('primary', 'xs')}
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
        <div className="p-4 sm:p-5 border-t border-brand-border bg-brand-surface flex items-center justify-between">
          <p className={cn(text.muted, 'hidden sm:block')}>
            Haz clic en cualquier Pokémon para seleccionarlo directamente como tu encuentro de ruta.
          </p>
          <button
            type="button"
            onClick={onClose}
            className={btn('primary', 'md', 'accent', 'ml-auto')}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
