import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  X,
  Loader2,
  Sparkles,
  Swords,
  Shield,
  Package,
  CornerDownLeft,
} from 'lucide-react';
import { usePokeDetail, type DetailType } from '../context/PokeDetailContext';
import {
  ensurePokeSearchIndex,
  lookupPokeApiExact,
  parsePokeSearchQuery,
  searchPokeApiIndex,
  type PokeSearchHit,
  type PokeSearchKind,
} from '../services/pokeApiService';
import { cn, field, iconBtn, pill, segmented, text, TONES } from '../utils/ui';
import { getPokemonSprite } from '../utils/pokemonMeta';

const RECENT_KEY = 'pokemon_api_search_recent_v1';
const MAX_RECENT = 8;

type KindFilter = PokeSearchKind | 'all';

const KIND_LABEL: Record<PokeSearchKind, string> = {
  pokemon: 'Pokémon',
  move: 'Movimiento',
  ability: 'Habilidad',
  item: 'Objeto',
};

const KIND_TONE: Record<PokeSearchKind, 'success' | 'danger' | 'info' | 'warning'> = {
  pokemon: 'success',
  move: 'danger',
  ability: 'info',
  item: 'warning',
};

function isApplePlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
}

export function commandPaletteShortcutLabel(): string {
  return isApplePlatform() ? '⌘K' : 'Ctrl+K';
}

function readRecent(): PokeSearchHit[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PokeSearchHit[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function writeRecent(hit: PokeSearchHit) {
  try {
    const next = [hit, ...readRecent().filter((item) => !(item.kind === hit.kind && item.slug === hit.slug))].slice(
      0,
      MAX_RECENT
    );
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // Storage quota
  }
}

function KindIcon({ kind, className }: { kind: PokeSearchKind; className?: string }) {
  if (kind === 'pokemon') return <Sparkles className={className} />;
  if (kind === 'move') return <Swords className={className} />;
  if (kind === 'ability') return <Shield className={className} />;
  return <Package className={className} />;
}

function spriteCandidates(hit: PokeSearchHit): string[] {
  const extras: string[] = [];
  if (hit.kind === 'pokemon') {
    extras.push(getPokemonSprite(hit.name).sprite);
    extras.push(getPokemonSprite(hit.slug.split('-')[0] || hit.name).sprite);
  }
  if (hit.kind === 'item') {
    extras.push(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${hit.slug}.png`);
  }
  const seen = new Set<string>();
  const chain: string[] = [];
  for (const url of [hit.sprite, ...(hit.spriteFallbacks || []), ...extras]) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    chain.push(url);
  }
  return chain;
}

const ResultThumb: React.FC<{ hit: PokeSearchHit }> = ({ hit }) => {
  const candidates = useMemo(() => spriteCandidates(hit), [hit]);
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    setSourceIndex(0);
  }, [hit.kind, hit.slug, hit.sprite]);

  const src = candidates[sourceIndex];
  if (!src) {
    return <KindIcon kind={hit.kind} className={cn('w-4 h-4', TONES[KIND_TONE[hit.kind]].ink)} />;
  }

  return (
    <img
      src={src}
      alt=""
      className="w-7 h-7 object-contain"
      onError={() => {
        setSourceIndex((current) => {
          if (current + 1 < candidates.length) return current + 1;
          return candidates.length;
        });
      }}
    />
  );
};

interface PokeApiCommandPaletteProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const PokeApiCommandPalette: React.FC<PokeApiCommandPaletteProps> = ({ isOpen, onOpen, onClose }) => {
  const { openDetail } = usePokeDetail();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<KindFilter>('all');
  const [indexReady, setIndexReady] = useState(false);
  const [indexError, setIndexError] = useState<string | null>(null);
  const [isIndexing, setIsIndexing] = useState(false);
  const [liveHits, setLiveHits] = useState<PokeSearchHit[]>([]);
  const [isLiveSearching, setIsLiveSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [recent, setRecent] = useState<PokeSearchHit[]>(() => readRecent());
  const [shortcutLabel] = useState(commandPaletteShortcutLabel);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.isComposing) return;
      const key = event.key.toLowerCase();
      const modifier = isApplePlatform() ? event.metaKey : event.ctrlKey;
      if (!modifier || event.altKey || event.shiftKey) return;
      if (key !== 'k' && key !== 'p') return;
      event.preventDefault();
      if (isOpen) {
        inputRef.current?.focus();
        return;
      }
      onOpen();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setKindFilter('all');
    setActiveIndex(0);
    setLiveHits([]);
    setIndexError(null);
    setRecent(readRecent());
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setIsIndexing(true);
    ensurePokeSearchIndex()
      .then(() => {
        if (cancelled) return;
        setIndexReady(true);
        setIndexError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setIndexError('No se pudo cargar el catálogo de PokéAPI.');
      })
      .finally(() => {
        if (!cancelled) setIsIndexing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const parsed = useMemo(() => parsePokeSearchQuery(query), [query]);
  const effectiveKind: KindFilter = parsed.kind !== 'all' ? parsed.kind : kindFilter;

  const indexHits = useMemo(() => {
    if (!indexReady || !parsed.text) return [];
    return searchPokeApiIndex(query, kindFilter);
  }, [indexReady, parsed.text, query, kindFilter]);

  useEffect(() => {
    if (!isOpen || isIndexing || !parsed.text || indexHits.length > 0) {
      setLiveHits([]);
      setIsLiveSearching(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setIsLiveSearching(true);
      lookupPokeApiExact(query)
        .then((hits) => {
          if (!cancelled) setLiveHits(hits);
        })
        .catch(() => {
          if (!cancelled) setLiveHits([]);
        })
        .finally(() => {
          if (!cancelled) setIsLiveSearching(false);
        });
    }, 280);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isOpen, isIndexing, parsed.text, indexHits.length, query]);

  const results = parsed.text ? (indexHits.length > 0 ? indexHits : liveHits) : recent;
  const showingRecent = !parsed.text && recent.length > 0;

  useEffect(() => {
    setActiveIndex(0);
  }, [query, effectiveKind, results.length]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-search-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, results]);

  const selectHit = useCallback(
    (hit: PokeSearchHit) => {
      writeRecent(hit);
      setRecent(readRecent());
      onClose();
      openDetail(hit.kind as DetailType, hit.slug);
    },
    [onClose, openDetail]
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, Math.max(results.length - 1, 0)));
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        return;
      }
      if (event.key === 'Enter' && results[activeIndex]) {
        event.preventDefault();
        selectHit(results[activeIndex]);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose, results, activeIndex, selectHit]);

  if (!isOpen) return null;

  const placeholder =
    effectiveKind === 'pokemon'
      ? 'Buscar Pokémon…  (@ para filtrar)'
      : effectiveKind === 'move'
        ? 'Buscar movimiento…  (# para filtrar)'
        : effectiveKind === 'ability'
          ? 'Buscar habilidad…  ($ para filtrar)'
          : effectiveKind === 'item'
            ? 'Buscar objeto…  (! para filtrar)'
            : 'Buscar Pokémon, movimiento, habilidad u objeto…';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Buscar en PokéAPI"
      className="fixed inset-0 z-[80] flex items-start justify-center pt-[10vh] px-3 sm:px-4 bg-brand-bg/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-brand-card border border-brand-border rounded-xl overflow-hidden animate-pop-in shadow-lg shadow-black/20"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-3 pt-3 pb-2 border-b border-brand-border bg-brand-surface">
          <div className={field.withIcon}>
            <Search className={field.icon} />
            <input
              ref={inputRef}
              id="pokeapi-command-palette-input"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
              autoComplete="off"
              spellCheck={false}
              className={cn(field.input, field.iconInputPad, 'pr-20 h-11 text-sm')}
              aria-autocomplete="list"
              aria-controls="pokeapi-command-palette-results"
              aria-activedescendant={results[activeIndex] ? `pokeapi-hit-${activeIndex}` : undefined}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className={iconBtn('ghost', 'sm')}
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded-md border border-brand-border bg-brand-bg text-[10px] font-semibold text-brand-txt2">
                Esc
              </kbd>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            <div className={segmented.group}>
              {(
                [
                  ['all', 'Todo'],
                  ['pokemon', 'Pokémon'],
                  ['move', 'Movs'],
                  ['ability', 'Hab.'],
                  ['item', 'Objs'],
                ] as Array<[KindFilter, string]>
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setKindFilter(value)}
                  className={segmented.item(effectiveKind === value)}
                >
                  {label}
                </button>
              ))}
            </div>
            {(isIndexing || isLiveSearching) && (
              <Loader2 className={cn('w-4 h-4 animate-spin shrink-0', TONES.accent.ink)} />
            )}
          </div>
        </div>

        <div
          id="pokeapi-command-palette-results"
          ref={listRef}
          role="listbox"
          className="max-h-[min(420px,52vh)] overflow-y-auto p-1.5"
        >
          {indexError && (
            <p className={cn(text.muted, 'px-3 py-4 text-center')}>{indexError}</p>
          )}

          {!indexError && showingRecent && (
            <p className={cn(text.meta, 'px-3 py-1.5 uppercase tracking-wider')}>Recientes</p>
          )}

          {!indexError && parsed.text && results.length === 0 && !isIndexing && !isLiveSearching && (
            <p className={cn(text.muted, 'px-3 py-8 text-center')}>
              Sin resultados para “{parsed.text}”. Prueba el slug de PokéAPI o un prefijo (@ # $ !).
            </p>
          )}

          {!indexError && !parsed.text && recent.length === 0 && (
            <div className={cn(text.muted, 'px-3 py-6 space-y-2 text-center')}>
              <p>Consulta PokéAPI al estilo de la paleta de VS Code.</p>
              <p className="text-xs">
                Prefijos: <span className="text-brand-txt1">@</span> Pokémon,{' '}
                <span className="text-brand-txt1">#</span> movimiento,{' '}
                <span className="text-brand-txt1">$</span> habilidad,{' '}
                <span className="text-brand-txt1">!</span> objeto
              </p>
            </div>
          )}

          {results.map((hit, index) => {
            const active = index === activeIndex;
            const title = hit.nameEs && hit.nameEs !== hit.name ? hit.nameEs : hit.name;
            const subtitle = hit.nameEs !== hit.name ? hit.name : hit.slug;
            return (
              <button
                key={`${hit.kind}-${hit.slug}`}
                id={`pokeapi-hit-${index}`}
                data-search-index={index}
                type="button"
                role="option"
                aria-selected={active}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectHit(hit)}
                className={cn(
                  'w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left cursor-pointer transition-colors',
                  active ? 'bg-brand-accent/12 border border-brand-accent/30' : 'border border-transparent hover:bg-brand-card-hover'
                )}
              >
                <span className="w-8 h-8 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center overflow-hidden shrink-0">
                  <ResultThumb hit={hit} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-brand-txt1 truncate">{title}</span>
                  <span className={cn(text.meta, 'block truncate')}>{subtitle}</span>
                </span>
                <span className={pill(KIND_TONE[hit.kind], 'xs')}>{KIND_LABEL[hit.kind]}</span>
                {active && <CornerDownLeft className="w-3.5 h-3.5 text-brand-txt2 shrink-0" />}
              </button>
            );
          })}
        </div>

        <div className="px-3 py-2 border-t border-brand-border bg-brand-surface flex items-center justify-between gap-2 text-[11px] text-brand-txt2">
          <span>
            {shortcutLabel} abre · ↑↓ navega · Enter abre ficha
          </span>
          <span className="hidden sm:inline">Datos de PokéAPI</span>
        </div>
      </div>
    </div>
  );
};
