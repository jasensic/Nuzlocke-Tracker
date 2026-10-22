import React, { useState, useMemo } from 'react';
import { RouteData, RouteEncounter, SavedEncounter, StarterChoice } from '../types';
import { parsePokemonName, getPokemonSprite } from '../utils/pokemonMeta';
import { WEATHER_TRANSLATIONS } from '../data/routeTranslations';
import {
  STARTER_CHOICES,
  STARTERS_INFO,
  buildStarterEncounter,
  isStarterGiftRoute,
} from '../data/trainers/trainerTranslations';
import { usePokeDetail } from '../context/PokeDetailContext';
import { sfx } from '../utils/audio';
import { TypeBadge } from './TypeBadge';
import { RealRouletteModal } from './RealRouletteModal';
import {
  cn,
  card,
  inset,
  btn,
  iconBtn,
  pill,
  pillSolid,
  text,
  pad,
  filterChip,
  segmented,
  spriteFrame,
  focusRing,
  TONES,
  type Tone,
} from '../utils/ui';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Dice5,
  Hand,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Trash2,
  ChevronDown,
  ChevronUp,
  CloudSun,
  Award,
  Leaf,
  Flame,
  Droplets,
  MapPin,
} from 'lucide-react';

interface StoryRouteCardProps {
  route: RouteData;
  stepNumber: number;
  chapterTitle: string;
  savedEncounter?: SavedEncounter;
  isWeighted: boolean;
  soundEnabled: boolean;
  onSaveEncounter: (encounter: SavedEncounter) => void;
  onUpdateStatus?: (id: string, status: SavedEncounter['status']) => void;
  onDeleteEncounter: (id: string) => void;
  onOpenManualPicker: (route: RouteData, weather: string) => void;
  starterChoice?: StarterChoice;
  onSelectStarter?: (starter: StarterChoice) => void;
  compact?: boolean;
  hideStepBadge?: boolean;
}

export const StoryRouteCard: React.FC<StoryRouteCardProps> = ({
  route,
  stepNumber,
  chapterTitle,
  savedEncounter,
  isWeighted,
  soundEnabled,
  onSaveEncounter,
  onUpdateStatus,
  onDeleteEncounter,
  onOpenManualPicker,
  starterChoice,
  onSelectStarter,
  compact = false,
  hideStepBadge = false,
}) => {
  const { openDetail } = usePokeDetail();
  const [selectedWeather, setSelectedWeather] = useState<string>(() => {
    return route.weathers[0] || 'All Weathers';
  });

  const [isRouletteModalOpen, setIsRouletteModalOpen] = useState(false);
  const [showTable, setShowTable] = useState(false);

  // Available encounters for this route with current weather
  const availableEncounters = useMemo(() => {
    return route.encounters.filter((enc) => {
      return selectedWeather === 'All Weathers' || enc.weather === selectedWeather;
    });
  }, [route.encounters, selectedWeather]);

  // Unique Pokémon list with aggregated chances
  const uniqueEncounters = useMemo(() => {
    const map = new Map<string, { enc: RouteEncounter; totalChance: number }>();
    availableEncounters.forEach((enc) => {
      const key = enc.pokemon.toLowerCase();
      const current = map.get(key);
      if (current) {
        current.totalChance += enc.chance;
      } else {
        map.set(key, { enc, totalChance: enc.chance });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.totalChance - a.totalChance);
  }, [availableEncounters]);

  const isStarterRoute = isStarterGiftRoute(route.id);
  const activeStarter: StarterChoice =
    starterChoice ||
    (savedEncounter?.cleanName.toLowerCase() === 'scorbunny'
      ? 'scorbunny'
      : savedEncounter?.cleanName.toLowerCase() === 'sobble'
        ? 'sobble'
        : 'grookey');

  const handleChooseStarter = (st: StarterChoice) => {
    onSelectStarter?.(st);
    if (savedEncounter) return;

    onSaveEncounter(buildStarterEncounter(st));
    if (soundEnabled) {
      sfx.playReveal();
      sfx.playCatch();
    }
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  const isCaught = Boolean(savedEncounter);
  const isFailed = savedEncounter?.status === 'Huido' || savedEncounter?.status === 'Debilitado';

  // Metas for saved Pokémon
  const caughtMeta = savedEncounter ? parsePokemonName(savedEncounter.pokemon) : null;
  const caughtSprites = savedEncounter ? getPokemonSprite(savedEncounter.pokemon) : null;

  const categoryColor: Tone =
    route.category === 'Ruta'
      ? 'success'
      : route.category === 'Cueva/Mina'
      ? 'warning'
      : route.category === 'Ciudad/Pueblo'
      ? 'info'
      : 'accent';

  // COMPACT MODE: Space-saving single-line card
  if (compact) {
    return (
      <>
        <article
          id={`story-route-${route.id}`}
          className={cn(
            card({
              tone: isCaught ? (isFailed ? 'danger' : 'success') : undefined,
              interactive: true,
              padding: 'compact',
            }),
            'scroll-mt-24'
          )}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              {!hideStepBadge && (
                <span className={pill('neutral', 'xs')}>#{stepNumber}</span>
              )}
              <h3 className="font-bold text-sm text-brand-txt1">{route.name}</h3>
              <span className={pill('info', 'xs')}>Nv. {route.levelDisplay}</span>
              {isCaught ? (
                isFailed ? (
                  <span className={pillSolid('danger', 'xs')}>
                    <XCircle className="w-3 h-3" /> No Capturado
                  </span>
                ) : (
                  <span className={pillSolid('success', 'xs')}>
                    <CheckCircle2 className="w-3 h-3" /> Capturado
                  </span>
                )
              ) : (
                <span className={pill('neutral', 'xs')}>Pendiente</span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isStarterRoute ? (
                <div className="flex items-center gap-1.5">
                  {STARTER_CHOICES.map((st) => {
                    const meta = STARTERS_INFO[st];
                    const isSelected = isCaught
                      ? savedEncounter?.cleanName.toLowerCase() === meta.species.toLowerCase()
                      : activeStarter === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleChooseStarter(st)}
                        title={`Elegir a ${meta.name}`}
                        className={cn(
                          spriteFrame(true, 'w-8 h-8 p-0.5'),
                          isSelected && 'border-brand-accent/60 ring-1 ring-brand-accent/25'
                        )}
                      >
                        <img
                          src={meta.sprite}
                          alt={meta.name}
                          className={cn('w-6 h-6 object-contain', !isSelected && 'opacity-40 grayscale')}
                        />
                      </button>
                    );
                  })}
                  {isCaught && (
                    <button
                      type="button"
                      onClick={() => onDeleteEncounter(savedEncounter!.id)}
                      className={iconBtn('soft', 'sm', 'danger')}
                      title="Eliminar captura"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : isCaught && savedEncounter ? (
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-bold', isFailed ? 'text-brand-txt2 line-through' : 'text-brand-txt1')}>
                    {savedEncounter.cleanName}
                  </span>
                  {onUpdateStatus && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(savedEncounter.id, isFailed ? 'Capturado' : 'Huido')}
                      className={cn(
                        'text-[11px] px-2 py-0.5 rounded-md font-semibold border flex items-center gap-1 transition-colors',
                        isFailed
                          ? 'border-rose-500/40 bg-rose-500/15 text-rose-400 hover:bg-rose-500/25'
                          : 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                      )}
                      title={isFailed ? 'Cambiar a Capturado' : 'Cambiar a No Capturado'}
                    >
                      {isFailed ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                      <span>{isFailed ? 'No capturado' : 'Capturado'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsRouletteModalOpen(true)}
                    className={iconBtn('secondary', 'sm')}
                    title="Volver a girar ruleta"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteEncounter(savedEncounter.id)}
                    className={iconBtn('soft', 'sm', 'danger')}
                    title="Eliminar registro"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRouletteModalOpen(true)}
                    className={btn('primary', 'sm', 'accent')}
                  >
                    <Dice5 className="w-3.5 h-3.5" />
                    <span>Ruleta</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenManualPicker(route, selectedWeather)}
                    className={btn('secondary', 'sm')}
                  >
                    <Hand className="w-3.5 h-3.5" />
                    <span>A Mano</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </article>

        {/* REAL ROULETTE MODAL */}
        <RealRouletteModal
          isOpen={isRouletteModalOpen}
          onClose={() => setIsRouletteModalOpen(false)}
          route={route}
          weather={selectedWeather}
          availableEncounters={availableEncounters}
          isWeighted={isWeighted}
          soundEnabled={soundEnabled}
          onConfirmCatch={(enc) => {
            onSaveEncounter(enc);
          }}
        />
      </>
    );
  }

  // STANDARD CARD: Clean, focused on Location, Level, Spin Roulette & Manual Pick
  return (
    <>
      <article
        id={`story-route-${route.id}`}
        className={cn(
          card({
            tone: isCaught ? (isFailed ? 'danger' : 'success') : undefined,
            interactive: false,
            padding: 'none',
          }),
          'scroll-mt-24 overflow-hidden shadow-xs hover:shadow-md transition-shadow'
        )}
      >
        {/* Route Header: Localización y Nivel */}
        <div
          className={cn(
            pad.card,
            'border-b border-brand-border flex items-center justify-between gap-3 bg-brand-bg/40'
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Step Icon */}
            <div
              className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border',
                isCaught
                  ? isFailed
                    ? cn(TONES.danger.solid, 'border-transparent shadow-xs')
                    : cn(TONES.success.solid, 'border-transparent shadow-xs')
                  : 'bg-brand-surface border-brand-border text-brand-txt2'
              )}
            >
              {isCaught ? (
                isFailed ? (
                  <XCircle className="w-6 h-6 text-white" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-white" />
                )
              ) : isStarterRoute ? (
                <Award className={cn('w-5 h-5', TONES.warning.ink)} />
              ) : (
                <Dice5 className={cn('w-5 h-5', TONES.accent.ink)} />
              )}
            </div>

            {/* Localización y Nivel */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={pillSolid('neutral', 'xs')}>#{stepNumber}</span>
                <h3 className="text-base sm:text-lg font-black text-brand-txt1 truncate">
                  {route.name}
                </h3>
                <span className={pill(categoryColor, 'xs')}>{route.category}</span>
                <span className={pill('info', 'xs')}>
                  {route.levelDisplay}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-brand-txt2 mt-0.5">
                <span>{chapterTitle.split(':')[0]}</span>
                {route.weathers.length > 1 && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-medium text-amber-500">
                      <CloudSun className="w-3 h-3" />
                      {route.weathers.length} climas
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Status Indicator */}
          <div className="shrink-0">
            {isCaught ? (
              isFailed ? (
                <span className={pillSolid('danger', 'md')}>
                  <XCircle className="w-3.5 h-3.5" />
                  <span>No Capturado</span>
                </span>
              ) : (
                <span className={pillSolid('success', 'md')}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Capturado</span>
                </span>
              )
            ) : (
              <span className={pill('neutral', 'md')}>
                <Clock className="w-3.5 h-3.5" />
                <span>Pendiente</span>
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className={cn(pad.card, 'space-y-4')}>
          {/* CASE A: ALREADY CAUGHT */}
          {isCaught && savedEncounter && caughtMeta && caughtSprites && (
            <div
              className={card({
                extra: 'flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-brand-surface/70',
              })}
            >
              {/* Pokemon Sprite and Basic Info */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => openDetail('pokemon', caughtMeta.cleanName)}
                  className={spriteFrame(true, cn('w-16 h-16 p-1 bg-white/5 shrink-0 group', isFailed && 'opacity-75 grayscale-[40%]'))}
                  title={`Haz clic para ver detalles de ${caughtMeta.displayName}`}
                >
                  <img
                    src={savedEncounter.isShiny ? caughtSprites.shinyShowdown : caughtSprites.showdown}
                    alt={caughtMeta.displayName}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = savedEncounter.isShiny
                        ? caughtSprites.shinySprite
                        : caughtSprites.sprite;
                    }}
                    className="max-h-full max-w-full object-contain pixelated group-hover:scale-110 transition-transform"
                    loading="lazy"
                  />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => openDetail('pokemon', caughtMeta.cleanName)}
                      className={cn(
                        'font-bold text-base hover:text-brand-accent transition-colors text-left',
                        isFailed ? 'text-brand-txt2 line-through' : 'text-brand-txt1'
                      )}
                    >
                      {caughtMeta.displayName}
                    </button>
                    {isFailed ? (
                      <span className={pillSolid('danger', 'xs')}>
                        <XCircle className="w-3 h-3" /> Se escapó
                      </span>
                    ) : (
                      <span className={pillSolid('success', 'xs')}>
                        <CheckCircle2 className="w-3 h-3" /> Capturado
                      </span>
                    )}
                    {savedEncounter.isShiny && (
                      <span className={pillSolid('warning', 'xs')}>
                        <Sparkles className="w-3 h-3" /> Shiny
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold text-brand-txt2">
                      {savedEncounter.levelRange || route.levelDisplay}
                    </span>
                    <div className="flex gap-1">
                      {caughtMeta.types.map((t) => (
                        <TypeBadge key={t} type={t} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: 2-state toggle (Capturado vs No capturado), Re-spin, and Delete */}
              <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                {onUpdateStatus && (
                  <div className="flex items-center p-0.5 rounded-lg bg-brand-bg border border-brand-border text-xs shrink-0">
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(savedEncounter.id, 'Capturado')}
                      className={cn(
                        'px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1.5',
                        !isFailed
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-brand-txt2 hover:text-brand-txt1'
                      )}
                      title="Marcar como capturado con éxito"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Capturado</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(savedEncounter.id, 'Huido')}
                      className={cn(
                        'px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1.5',
                        isFailed
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-brand-txt2 hover:text-brand-txt1'
                      )}
                      title="Marcar como no capturado (se escapó o debilitó)"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>No capturado</span>
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsRouletteModalOpen(true)}
                  className={btn('secondary', 'md')}
                  title="Volver a girar la ruleta para reemplazar este Pokémon"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Volver a Girar</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteEncounter(savedEncounter.id)}
                  className={iconBtn('soft', 'md', 'danger')}
                  title="Eliminar este registro de captura"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* CASE B: STARTER GIFT ROUTE (Postwick) */}
          {!isCaught && isStarterRoute && (
            <div className="space-y-3">
              <p className={text.muted}>
                Lionel te entrega tu Pokémon inicial aquí. Elige cuál tomarás:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {STARTER_CHOICES.map((st) => {
                  const starter = STARTERS_INFO[st];
                  const isSelected = activeStarter === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleChooseStarter(st)}
                      className={cn(
                        card({ active: isSelected, interactive: !isSelected }),
                        'text-left flex items-center gap-3 p-3 select-none cursor-pointer',
                        focusRing
                      )}
                    >
                      <div className={spriteFrame(false, 'w-12 h-12 p-1')}>
                        <img
                          src={starter.showdown}
                          alt={starter.name}
                          className="w-full h-full object-contain pixelated"
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = starter.sprite;
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-sm text-brand-txt1">
                            {starter.name}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className={cn('w-4 h-4 shrink-0', TONES.accent.ink)} />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <TypeBadge type={starter.type} />
                          {st === 'grookey' && <Leaf className="w-3 h-3 text-pokemon-planta" />}
                          {st === 'scorbunny' && <Flame className="w-3 h-3 text-pokemon-fuego" />}
                          {st === 'sobble' && <Droplets className="w-3 h-3 text-pokemon-agua" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* CASE C: UNCAUGHT STANDARD ROUTE */}
          {!isCaught && !isStarterRoute && (
            <div className="space-y-3">
              {/* Weather filter if route has multiple weathers */}
              {route.weathers.length > 1 && (
                <div className={inset('flex items-center gap-2 overflow-x-auto scrollbar-none py-1.5')}>
                  <span className={cn(text.label, 'mr-1 flex items-center gap-1 shrink-0 text-xs')}>
                    <CloudSun className={cn('w-3.5 h-3.5', TONES.warning.ink)} />
                    Clima:
                  </span>
                  {route.weathers.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setSelectedWeather(w)}
                      className={filterChip(selectedWeather === w, 'warning')}
                    >
                      {WEATHER_TRANSLATIONS[w] || w}
                    </button>
                  ))}
                </div>
              )}

              {/* CORE ACTIONS: Girar Ruleta & Elegir a Mano */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* 1. Girar Ruleta de Verdad (Modal) */}
                <button
                  type="button"
                  onClick={() => setIsRouletteModalOpen(true)}
                  disabled={availableEncounters.length === 0}
                  className={btn('primary', 'lg', 'accent', 'w-full sm:flex-1 py-3 text-base shadow-sm hover:shadow-md')}
                >
                  <Dice5 className="w-5 h-5" />
                  <span>Girar Ruleta</span>
                </button>

                {/* 2. Elegir a Mano */}
                <button
                  type="button"
                  onClick={() => onOpenManualPicker(route, selectedWeather)}
                  disabled={availableEncounters.length === 0}
                  className={btn('secondary', 'lg', 'neutral', 'w-full sm:w-auto')}
                  title="Elegir manualmente el Pokémon capturado en esta ruta"
                >
                  <Hand className="w-5 h-5" />
                  <span>Elegir a Mano</span>
                </button>

                {/* 3. Discreto toggle para ver lista de candidatos */}
                <button
                  type="button"
                  onClick={() => setShowTable(!showTable)}
                  className={btn('ghost', 'md', 'neutral')}
                  title="Ver lista de posibles Pokémon"
                >
                  <span className="text-xs">{showTable ? 'Ocultar' : `Ver Pokémon (${uniqueEncounters.length})`}</span>
                  {showTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Collapsible preview of candidates */}
              {showTable && (
                <div className="pt-3 border-t border-brand-border animate-in fade-in duration-200">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {uniqueEncounters.map(({ enc, totalChance }) => {
                      const meta = parsePokemonName(enc.pokemon);
                      const sprites = getPokemonSprite(enc.pokemon);
                      return (
                        <button
                          key={enc.pokemon}
                          type="button"
                          onClick={() => openDetail('pokemon', meta.cleanName)}
                          title={`Ver detalles de ${meta.displayName}`}
                          className={card({
                            interactive: true,
                            padding: 'none',
                            extra: cn('p-2 flex items-center gap-2 text-left cursor-pointer', focusRing),
                          })}
                        >
                          <div className={spriteFrame(false, 'w-8 h-8 p-0.5 shrink-0')}>
                            <img
                              src={sprites.sprite}
                              alt={meta.displayName}
                              className="max-h-full max-w-full object-contain pixelated"
                              loading="lazy"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-brand-txt1 truncate">
                              {meta.cleanName}
                            </div>
                            <div className="text-[11px] font-semibold text-brand-txt2 flex items-center justify-between">
                              <span>{enc.levelRange || route.levelDisplay}</span>
                              <span className="font-bold text-brand-accent">{totalChance}%</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </article>

      {/* REAL ROULETTE MODAL */}
      <RealRouletteModal
        isOpen={isRouletteModalOpen}
        onClose={() => setIsRouletteModalOpen(false)}
        route={route}
        weather={selectedWeather}
        availableEncounters={availableEncounters}
        isWeighted={isWeighted}
        soundEnabled={soundEnabled}
        onConfirmCatch={(enc) => {
          onSaveEncounter(enc);
        }}
      />
    </>
  );
};
