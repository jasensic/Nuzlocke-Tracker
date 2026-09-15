import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { PokeDetailRequest, DetailType, DetailNavDirection } from '../context/PokeDetailContext';
import {
  getMoveDetails,
  getAbilityDetails,
  getItemDetails,
  getPokemonDetails,
  MoveDetail,
  AbilityDetail,
  ItemDetail,
  PokemonDetail,
  PokemonEvolution,
} from '../services/pokeApiService';
import { TypeBadge } from './TypeBadge';
import { PokemonLearnMove } from '../services/pokeApiService';
import {
  cn,
  card,
  inset,
  btn,
  iconBtn,
  pill,
  statTile,
  iconTile,
  text,
  layout,
  segmented,
  spriteFrame,
  TONES,
  type Tone,
} from '../utils/ui';
import {
  X,
  Sparkles,
  Zap,
  Shield,
  Crosshair,
  Gauge,
  Swords,
  Info,
  ArrowLeft,
  ArrowRight,
  Scale,
  Ruler,
  AlertCircle,
  Loader2,
  GitBranch,
} from 'lucide-react';

interface PokeDetailModalProps {
  request: PokeDetailRequest;
  previousRequest?: PokeDetailRequest | null;
  navDirection: DetailNavDirection;
  onClose: () => void;
  onBack: () => void;
  canGoBack: boolean;
  onOpenAnother: (type: DetailType, name: string) => void;
}

const DETAIL_KIND_LABEL: Record<DetailType, string> = {
  pokemon: 'Pokémon',
  ability: 'habilidad',
  item: 'objeto',
  move: 'movimiento',
};

const contentVariants = {
  enter: (direction: DetailNavDirection) => ({
    x: direction * 28,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: DetailNavDirection) => ({
    x: direction * -28,
    opacity: 0,
  }),
};

export const PokeDetailModal: React.FC<PokeDetailModalProps> = ({
  request,
  previousRequest,
  navDirection,
  onClose,
  onBack,
  canGoBack,
  onOpenAnother,
}) => {
  const { type, name } = request;
  const reduceMotion = useReducedMotion();

  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [moveData, setMoveData] = useState<MoveDetail | null>(null);
  const [abilityData, setAbilityData] = useState<AbilityDetail | null>(null);
  const [itemData, setItemData] = useState<ItemDetail | null>(null);
  const [pokemonData, setPokemonData] = useState<PokemonDetail | null>(null);
  const [viewType, setViewType] = useState<DetailType>(type);
  const [viewName, setViewName] = useState(name);
  const hasContentRef = useRef(false);

  // Escape closes the whole stack; browser Back walks one step at a time.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Fetch from pokenode-ts. Keep the previous ficha visible until the next one is ready.
  useEffect(() => {
    let isCancelled = false;
    setError(null);
    if (!hasContentRef.current) {
      setIsLoading(true);
    } else {
      setIsFetching(true);
    }

    async function fetchData() {
      try {
        if (type === 'move') {
          const res = await getMoveDetails(name);
          if (isCancelled) return;
          setMoveData(res);
          setAbilityData(null);
          setItemData(null);
          setPokemonData(null);
        } else if (type === 'ability') {
          const res = await getAbilityDetails(name);
          if (isCancelled) return;
          setAbilityData(res);
          setMoveData(null);
          setItemData(null);
          setPokemonData(null);
        } else if (type === 'item') {
          const res = await getItemDetails(name);
          if (isCancelled) return;
          setItemData(res);
          setMoveData(null);
          setAbilityData(null);
          setPokemonData(null);
        } else if (type === 'pokemon') {
          const res = await getPokemonDetails(name);
          if (isCancelled) return;
          setPokemonData(res);
          setMoveData(null);
          setAbilityData(null);
          setItemData(null);
        }
        if (!isCancelled) {
          setViewType(type);
          setViewName(name);
          hasContentRef.current = true;
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err?.message || 'No se pudo cargar la información desde PokéAPI.');
          setViewType(type);
          setViewName(name);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
          setIsFetching(false);
        }
      }
    }

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [type, name]);

  const typeConfig: { title: string; icon: typeof Swords; tone: Tone } =
    viewType === 'move'
      ? { title: 'Detalles del Movimiento', icon: Swords, tone: 'danger' }
      : viewType === 'ability'
      ? { title: 'Detalles de la Habilidad', icon: Zap, tone: 'warning' }
      : viewType === 'item'
      ? { title: 'Detalles del Objeto', icon: Shield, tone: 'info' }
      : { title: 'Detalles del Pokémon', icon: Sparkles, tone: 'success' };

  const motionTransition = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, damping: 28, stiffness: 340, mass: 0.9 };
  const contentTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-brand-bg/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-2xl bg-brand-card border border-brand-border rounded-xl overflow-hidden"
        initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: 10, scale: 0.98 }}
        transition={motionTransition}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {canGoBack ? (
              <button
                type="button"
                onClick={onBack}
                className={iconBtn('ghost', 'md')}
                title={
                  previousRequest
                    ? `Volver a ${previousRequest.name}`
                    : 'Volver atrás'
                }
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className={iconTile(typeConfig.tone)}>
                <typeConfig.icon className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className={text.sectionTitle}>{typeConfig.title}</h3>
              {canGoBack && previousRequest && (
                <p className={cn(text.meta, 'truncate')}>
                  Volver a {DETAIL_KIND_LABEL[previousRequest.type]}:{' '}
                  <strong className="capitalize">{previousRequest.name}</strong>
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={iconBtn('ghost', 'md')}
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className={cn(layout.divider, 'relative overflow-hidden')}>
          {isFetching && (
            <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-brand-surface">
              <motion.div
                className={cn('h-full w-1/3 rounded-full', TONES.info.fill)}
                initial={{ x: '-100%' }}
                animate={{ x: '350%' }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }
                }
              />
            </div>
          )}
          <AnimatePresence mode="wait" initial={false} custom={navDirection}>
            <motion.div
              key={`${viewType}-${viewName}`}
              custom={navDirection}
              variants={reduceMotion ? undefined : contentVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={contentTransition}
              className="p-5 max-h-[80vh] overflow-y-auto space-y-4"
            >
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className={cn('w-8 h-8 animate-spin', TONES.info.ink)} />
              <p className={cn(text.muted, 'font-bold')}>
                Consultando PokéAPI (pokenode-ts)...
              </p>
            </div>
          ) : error ? (
            <div className={card({ tone: 'danger', extra: 'space-y-2' })}>
              <div className="flex items-center gap-2 font-bold text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>Error al consultar la API</span>
              </div>
              <p className="text-xs">{error}</p>
            </div>
          ) : viewType === 'move' && moveData ? (
            /* ================= MOVE VIEW ================= */
            <div className="space-y-4">
              {/* Header Title & Types */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className={text.pageTitle}>
                    {moveData.name}
                  </h3>
                  {moveData.originalName !== moveData.name && (
                    <p className={text.muted}>
                      Nombre en inglés: <strong>{moveData.originalName}</strong>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Type Badge */}
                  <TypeBadge type={moveData.type} />

                  {/* Damage Class Badge */}
                  <span
                    className={pill(
                      moveData.damageClass === 'physical'
                        ? 'warning'
                        : moveData.damageClass === 'special'
                        ? 'info'
                        : 'neutral',
                      'md'
                    )}
                  >
                    {moveData.damageClass === 'physical'
                      ? '💥 Físico'
                      : moveData.damageClass === 'special'
                      ? '✨ Especial'
                      : '🛡️ Estado'}
                  </span>
                </div>
              </div>

              {/* Stat Grid: Potencia, Precisión, PP, Prioridad */}
              <div className="grid grid-cols-4 gap-2 text-center">
                {/* Potencia */}
                <div className={statTile()}>
                  <div className={cn(text.label, 'flex items-center justify-center gap-1')}>
                    <Swords className={cn('w-3 h-3', TONES.danger.ink)} />
                    <span>Potencia</span>
                  </div>
                  <div className={cn(text.stat, 'mt-1')}>
                    {moveData.power !== null ? moveData.power : '—'}
                  </div>
                </div>

                {/* Precisión */}
                <div className={statTile()}>
                  <div className={cn(text.label, 'flex items-center justify-center gap-1')}>
                    <Crosshair className={cn('w-3 h-3', TONES.info.ink)} />
                    <span>Precisión</span>
                  </div>
                  <div className={cn(text.stat, 'mt-1')}>
                    {moveData.accuracy !== null ? `${moveData.accuracy}%` : '—'}
                  </div>
                </div>

                {/* PP */}
                <div className={statTile()}>
                  <div className={cn(text.label, 'flex items-center justify-center gap-1')}>
                    <Gauge className={cn('w-3 h-3', TONES.success.ink)} />
                    <span>PP</span>
                  </div>
                  <div className={cn(text.stat, 'mt-1')}>
                    {moveData.pp}
                  </div>
                </div>

                {/* Prioridad */}
                <div className={statTile()}>
                  <div className={cn(text.label, 'flex items-center justify-center gap-1')}>
                    <Zap className={cn('w-3 h-3', TONES.warning.ink)} />
                    <span>Prioridad</span>
                  </div>
                  <div className={cn(text.stat, 'mt-1')}>
                    {moveData.priority > 0 ? `+${moveData.priority}` : moveData.priority}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className={inset('space-y-1')}>
                <div className={cn(text.label, 'flex items-center gap-1.5')}>
                  <Info className={cn('w-3.5 h-3.5', TONES.info.ink)} />
                  <span>Descripción en combate:</span>
                </div>
                <p className={cn(text.body, 'leading-relaxed')}>
                  {moveData.description}
                </p>
              </div>

              {/* Detailed Effect */}
              {moveData.effect && moveData.effect !== moveData.description && (
                <div className={inset('space-y-1')}>
                  <div className={cn(text.label, 'flex items-center gap-1.5')}>
                    <Sparkles className={cn('w-3.5 h-3.5', TONES.warning.ink)} />
                    <span>Mecánica detallada:</span>
                  </div>
                  <p className={cn(text.muted, 'leading-relaxed')}>
                    {moveData.effect}
                  </p>
                </div>
              )}
            </div>
          ) : viewType === 'ability' && abilityData ? (
            /* ================= ABILITY VIEW ================= */
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className={text.pageTitle}>
                    {abilityData.name}
                  </h3>
                  {abilityData.originalName !== abilityData.name && (
                    <p className={text.muted}>
                      Nombre en inglés: <strong>{abilityData.originalName}</strong>
                    </p>
                  )}
                </div>
                <span className={pill('warning', 'md')}>
                  Habilidad
                </span>
              </div>

              <div className={inset('space-y-1')}>
                <div className={cn(text.label, 'flex items-center gap-1.5')}>
                  <Zap className={cn('w-3.5 h-3.5', TONES.warning.ink)} />
                  <span>Descripción oficial:</span>
                </div>
                <p className={cn(text.body, 'leading-relaxed')}>
                  {abilityData.description}
                </p>
              </div>

              {abilityData.effect && abilityData.effect !== abilityData.description && (
                <div className={inset('space-y-1')}>
                  <div className={cn(text.label, 'flex items-center gap-1.5')}>
                    <Sparkles className={cn('w-3.5 h-3.5', TONES.warning.ink)} />
                    <span>Efecto en combate:</span>
                  </div>
                  <p className={cn(text.muted, 'leading-relaxed')}>
                    {abilityData.effect}
                  </p>
                </div>
              )}
            </div>
          ) : viewType === 'item' && itemData ? (
            /* ================= ITEM VIEW ================= */
            <div className="space-y-4">
              <div className="flex items-center gap-3.5">
                <div className={spriteFrame(false, 'w-14 h-14 p-2')}>
                  <img
                    src={itemData.sprite}
                    alt={itemData.name}
                    className="w-10 h-10 object-contain pixelated"
                    loading="lazy"
                  />
                </div>

                <div>
                  <h3 className={text.pageTitle}>
                    {itemData.name}
                  </h3>
                  {itemData.originalName !== itemData.name && (
                    <p className={text.muted}>
                      En inglés: <strong>{itemData.originalName}</strong>
                    </p>
                  )}
                  <span className={pill('info', 'xs', 'mt-1')}>
                    {itemData.category}
                  </span>
                </div>
              </div>

              <div className={inset('space-y-1')}>
                <div className={cn(text.label, 'flex items-center gap-1.5')}>
                  <Shield className={cn('w-3.5 h-3.5', TONES.info.ink)} />
                  <span>Efecto del objeto:</span>
                </div>
                <p className={cn(text.body, 'leading-relaxed')}>
                  {itemData.description}
                </p>
              </div>

              {itemData.effect && itemData.effect !== itemData.description && (
                <div className={inset('space-y-1')}>
                  <div className={cn(text.label, 'flex items-center gap-1.5')}>
                    <Sparkles className={cn('w-3.5 h-3.5', TONES.warning.ink)} />
                    <span>Mecánica al equipar:</span>
                  </div>
                  <p className={cn(text.muted, 'leading-relaxed')}>
                    {itemData.effect}
                  </p>
                </div>
              )}
            </div>
          ) : viewType === 'pokemon' && pokemonData ? (
            /* ================= POKEMON VIEW ================= */
            <div className="space-y-4">
              {/* Header: Artwork, Name, Types */}
              <div className="flex items-center gap-4">
                <div className={spriteFrame(false, 'relative w-20 h-20 p-1')}>
                  <img
                    src={pokemonData.sprites.artwork}
                    alt={pokemonData.displayName}
                    className="w-full h-full object-contain pixelated"
                    loading="lazy"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(text.muted, 'font-bold')}>
                      #{String(pokemonData.id).padStart(3, '0')}
                    </span>
                    <h3 className={cn(text.pageTitle, 'capitalize truncate')}>
                      {pokemonData.displayName}
                    </h3>
                  </div>

                  {/* Types */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {pokemonData.types.map((t) => (
                      <TypeBadge key={t.name} type={t.es} />
                    ))}
                  </div>

                  {/* Height & Weight */}
                  <div className={cn(text.muted, 'flex items-center gap-3 mt-1.5')}>
                    <span className="flex items-center gap-1">
                      <Ruler className="w-3.5 h-3.5" />
                      {pokemonData.heightMeters} m
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5" />
                      {pokemonData.weightKg} kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Base Stats */}
              <div className={card({ extra: 'space-y-2' })}>
                <div className={cn(text.label, 'flex items-center justify-between')}>
                  <span>Estadísticas Base (BST):</span>
                  <span className={cn('font-bold', TONES.info.ink)}>
                    {pokemonData.bst} Total
                  </span>
                </div>

                <div className="space-y-1.5">
                  {pokemonData.stats.map((s) => (
                    <div key={s.name} className="flex items-center text-xs gap-2">
                      <span className={cn(text.meta, 'w-16 font-bold')}>
                        {s.nameEs}:
                      </span>
                      <span className="w-8 font-bold text-brand-txt1 tabular-nums text-right">
                        {s.base}
                      </span>
                      <div className="flex-1 bg-brand-surface h-2 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-300',
                            s.base >= 110
                              ? TONES.success.fill
                              : s.base >= 80
                              ? TONES.info.fill
                              : s.base >= 50
                              ? TONES.warning.fill
                              : TONES.danger.fill
                          )}
                          style={{ width: `${s.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Abilities */}
              {pokemonData.abilities.length > 0 && (
                <div className="space-y-1.5">
                  <span className={text.label}>
                    Habilidades (Haz clic para ver detalles):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {pokemonData.abilities.map((ab) => (
                      <button
                        key={ab.slug}
                        type="button"
                        onClick={() => onOpenAnother('ability', ab.slug)}
                        className={btn('secondary', 'sm')}
                      >
                        <Zap className={cn('w-3 h-3', TONES.warning.ink)} />
                        <span>{ab.nameEs}</span>
                        {ab.isHidden && (
                          <span className={pill('info', 'xs')}>
                            Oculta
                          </span>
                        )}
                        <ArrowRight className="w-3 h-3 text-brand-txt2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <PokemonEvolutionList
                current={{
                  slug: pokemonData.slug,
                  name: pokemonData.displayName,
                  sprite: pokemonData.sprites.artwork,
                }}
                evolutions={pokemonData.evolutions}
                onOpenPokemon={(slug) => onOpenAnother('pokemon', slug)}
                onOpenItem={(slug) => onOpenAnother('item', slug)}
              />

              {pokemonData.learnset.length > 0 && (
                <PokemonLearnsetList
                  learnset={pokemonData.learnset}
                  onOpenMove={(slug) => onOpenAnother('move', slug)}
                />
              )}
            </div>
          ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Modal Footer */}
        <div className={cn(layout.divider, 'px-5 py-3 bg-brand-surface flex items-center justify-between gap-3')}>
          <span className={text.meta}>
            Datos obtenidos en tiempo real vía <strong>pokenode-ts</strong> (PokéAPI)
          </span>
          <div className="flex items-center gap-2">
            {canGoBack && (
              <button type="button" onClick={onBack} className={btn('secondary', 'md')}>
                <ArrowLeft className="w-4 h-4" />
                Atrás
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className={btn('primary', 'md')}
            >
              Entendido
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

type EvolutionNode = {
  slug: string;
  name: string;
  sprite: string;
};

function groupEvolutionBranches(evolutions: PokemonEvolution[]): PokemonEvolution[][] {
  const roots = evolutions.filter((evo) => evo.stage === 1);
  return roots.map((root) => {
    const branch = [root];
    let fromName = root.name;
    for (const evo of evolutions) {
      if (evo.stage <= 1) continue;
      if (evo.fromName === fromName) {
        branch.push(evo);
        fromName = evo.name;
      }
    }
    return branch;
  });
}

const EvolutionSpriteButton: React.FC<{
  node: EvolutionNode;
  current?: boolean;
  onOpen: (slug: string) => void;
}> = ({ node, current, onOpen }) => (
  <button
    type="button"
    onClick={() => onOpen(node.slug)}
    className="flex w-[4.75rem] shrink-0 flex-col items-center gap-1 text-center"
    title={node.name}
  >
    <div className={spriteFrame(false, current ? 'w-12 h-12 p-1 ring-1 ring-brand-accent/40' : 'w-12 h-12 p-1')}>
      <img src={node.sprite} alt={node.name} className="h-full w-full object-contain" loading="lazy" />
    </div>
    <span className={cn(text.meta, 'w-full truncate font-semibold text-brand-txt1')}>{node.name}</span>
  </button>
);

const EvolutionArrow: React.FC<{
  requirement: string;
  itemSlug?: string;
  onOpenItem: (slug: string) => void;
}> = ({ requirement, itemSlug, onOpenItem }) => (
  <div className="flex min-w-[5.5rem] max-w-[7.5rem] shrink-0 flex-col items-center justify-center gap-0.5 px-1 pt-2">
    <ArrowRight className={cn('h-4 w-4', TONES.success.ink)} />
    <p className={cn(text.meta, 'text-center leading-tight')}>{requirement}</p>
    {itemSlug && (
      <button
        type="button"
        onClick={() => onOpenItem(itemSlug)}
        className={btn('soft', 'xs', 'info')}
        title="Ver objeto"
      >
        Objeto
      </button>
    )}
  </div>
);

const PokemonEvolutionList: React.FC<{
  current: EvolutionNode;
  evolutions: PokemonEvolution[];
  onOpenPokemon: (slug: string) => void;
  onOpenItem: (slug: string) => void;
}> = ({ current, evolutions, onOpenPokemon, onOpenItem }) => {
  const branches = groupEvolutionBranches(evolutions);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className={cn(text.label, 'flex items-center gap-1.5')}>
          <GitBranch className={cn('w-3.5 h-3.5', TONES.success.ink)} />
          Evoluciones (8.ª gen.):
        </span>
        {evolutions.length > 0 && (
          <span className={text.meta}>Clic para ver datos</span>
        )}
      </div>

      {evolutions.length === 0 ? (
        <p className={cn(text.muted, 'px-1')}>
          Este Pokémon no evoluciona más en Espada/Escudo.
        </p>
      ) : (
        <div className={card({ padding: 'none', extra: 'overflow-x-auto p-3' })}>
          <div className="flex min-w-full justify-center">
            <div className="flex min-w-min items-center">
            <EvolutionSpriteButton node={current} current onOpen={onOpenPokemon} />
            {branches.length === 1 ? (
              branches[0].map((evo) => (
                <React.Fragment key={`${evo.slug}-${evo.stage}`}>
                  <EvolutionArrow
                    requirement={evo.requirement}
                    itemSlug={evo.itemSlug}
                    onOpenItem={onOpenItem}
                  />
                  <EvolutionSpriteButton
                    node={{ slug: evo.slug, name: evo.name, sprite: evo.sprite }}
                    onOpen={onOpenPokemon}
                  />
                </React.Fragment>
              ))
            ) : (
              <div className="flex flex-col gap-3">
                {branches.map((branch, branchIndex) => (
                  <div key={branch[0]?.slug || branchIndex} className="flex items-center">
                    {branch.map((evo) => (
                      <React.Fragment key={`${evo.slug}-${evo.stage}`}>
                        <EvolutionArrow
                          requirement={evo.requirement}
                          itemSlug={evo.itemSlug}
                          onOpenItem={onOpenItem}
                        />
                        <EvolutionSpriteButton
                          node={{ slug: evo.slug, name: evo.name, sprite: evo.sprite }}
                          onOpen={onOpenPokemon}
                        />
                      </React.Fragment>
                    ))}
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LEARN_TABS: Array<{ key: PokemonLearnMove['method']; label: string }> = [
  { key: 'level-up', label: 'Por nivel' },
  { key: 'machine', label: 'MT / MO' },
  { key: 'egg', label: 'Huevo' },
  { key: 'tutor', label: 'Tutor' },
];

const PokemonLearnsetList: React.FC<{
  learnset: PokemonLearnMove[];
  onOpenMove: (slug: string) => void;
}> = ({ learnset, onOpenMove }) => {
  const availableTabs = LEARN_TABS.filter((tab) => learnset.some((m) => m.method === tab.key));
  const otherMoves = learnset.filter((m) => m.method === 'other');
  const defaultTab = availableTabs[0]?.key || 'level-up';
  const [activeTab, setActiveTab] = React.useState<PokemonLearnMove['method']>(defaultTab);

  React.useEffect(() => {
    if (!availableTabs.some((tab) => tab.key === activeTab) && defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [activeTab, defaultTab, availableTabs]);

  const visibleMoves = learnset.filter((m) => m.method === activeTab);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className={text.label}>
          Movimientos que aprende ({learnset.length}):
        </span>
        <span className={text.meta}>Clic para potencia y efecto</span>
      </div>

      {availableTabs.length > 0 && (
        <div className={cn(segmented.group, 'flex-wrap')}>
          {availableTabs.map((tab) => {
            const count = learnset.filter((m) => m.method === tab.key).length;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={segmented.item(isActive)}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {visibleMoves.map((move) => (
          <button
            key={`${move.slug}-${move.method}-${move.level}`}
            type="button"
            onClick={() => onOpenMove(move.slug)}
            className={btn('secondary', 'sm', 'accent', 'justify-start text-left')}
          >
            <span className={cn('w-10 shrink-0 text-[10px] font-bold', TONES.info.ink)}>
              {move.method === 'level-up' ? `Nv.${move.level || 1}` : move.methodEs}
            </span>
            <span className="min-w-0 truncate flex-1">{move.nameEs}</span>
            <TypeBadge type={move.type} />
          </button>
        ))}
      </div>

      {otherMoves.length > 0 && activeTab !== 'other' && (
        <p className={text.meta}>{otherMoves.length} movimientos adicionales de otras fuentes.</p>
      )}
    </div>
  );
};
