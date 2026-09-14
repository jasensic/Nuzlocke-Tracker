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
  Clock,
  RotateCcw,
  Trash2,
  ChevronDown,
  ChevronUp,
  CloudSun,
  Heart,
  Skull,
  Award,
  Leaf,
  Flame,
  Droplets,
} from 'lucide-react';

interface StoryRouteCardProps {
  route: RouteData;
  stepNumber: number;
  chapterTitle: string;
  savedEncounter?: SavedEncounter;
  isWeighted: boolean;
  soundEnabled: boolean;
  onSaveEncounter: (encounter: SavedEncounter) => void;
  onUpdateStatus: (id: string, status: SavedEncounter['status']) => void;
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

  const [isSpinning, setIsSpinning] = useState(false);
  const [candidateName, setCandidateName] = useState<string>('');
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

  const dominantTypes = useMemo(() => {
    const counts = new Map<string, number>();
    uniqueEncounters.forEach(({ enc }) => {
      parsePokemonName(enc.pokemon).types.forEach((t) => {
        counts.set(t, (counts.get(t) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([t]) => t);
  }, [uniqueEncounters]);

  // Handle spin for this specific route
  const handleSpinRoute = () => {
    if (availableEncounters.length === 0 || isSpinning) return;

    setIsSpinning(true);
    if (soundEnabled) sfx.playTick();

    // Rapid cycling visual effect
    const duration = 1600;
    const interval = 75;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      const randIndex = Math.floor(Math.random() * availableEncounters.length);
      setCandidateName(availableEncounters[randIndex].cleanName);
      if (soundEnabled) sfx.playTick();

      if (elapsed >= duration) {
        clearInterval(timer);

        // Pick final encounter (weighted or unweighted)
        let chosen: RouteEncounter;
        if (isWeighted) {
          const totalWeight = availableEncounters.reduce((acc, curr) => acc + curr.chance, 0);
          let rand = Math.random() * totalWeight;
          chosen = availableEncounters[0];
          for (const item of availableEncounters) {
            rand -= item.chance;
            if (rand <= 0) {
              chosen = item;
              break;
            }
          }
        } else {
          chosen = availableEncounters[Math.floor(Math.random() * availableEncounters.length)];
        }

        setIsSpinning(false);
        setCandidateName('');

        // Save encounter
        const newSaved: SavedEncounter = {
          id: `enc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: Date.now(),
          routeId: route.id,
          routeName: route.name,
          pokemon: chosen.pokemon,
          cleanName: chosen.cleanName,
          formLabel: chosen.formLabel,
          method: chosen.method || 'Visible',
          weather: chosen.weather || selectedWeather,
          levelRange: chosen.levelRange,
          chance: chosen.chance,
          status: 'Capturado',
          isShiny: Math.random() < 0.01, // 1% easter egg
        };

        onSaveEncounter(newSaved);

        if (soundEnabled) {
          sfx.playReveal();
          sfx.playCatch();
        }
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    }, interval);
  };

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

  // COMPACT MODE: Space-saving single/dual-line card
  if (compact) {
    return (
      <article
        id={`story-route-${route.id}`}
        className={cn(
          card({
            tone: isCaught ? 'success' : undefined,
            interactive: true,
            padding: 'compact',
          }),
          'scroll-mt-24'
        )}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {!hideStepBadge && (
                <span className={pill('neutral')}>
                  Hito #{stepNumber}
                </span>
              )}
              <span className={pill(categoryColor)}>
                {chapterTitle.split(':')[0]} · {route.category}
              </span>
              <h3 className={text.sectionTitle}>{route.name}</h3>
              {route.englishName && (
                <span className={text.muted}>({route.englishName})</span>
              )}
              {isCaught ? (
                <span className={pill('success')}>
                  Completado
                </span>
              ) : (
                <span className={pill('warning')}>
                  Pendiente
                </span>
              )}
            </div>
            <div className={cn('flex items-center gap-3 flex-wrap', text.muted)}>
              <span className={pill('info', 'sm')}>
                Nivel Límite: <strong>{route.levelDisplay}</strong>
              </span>
              {isStarterRoute ? (
                <span className={text.meta}>
                  Pokémon inicial entregado por Lionel
                </span>
              ) : (
                <>
                  {dominantTypes.length > 0 && (
                    <>
                      <span>Tipos presentes:</span>
                      <div className="inline-flex items-center gap-1.5">
                        {dominantTypes.map((t) => (
                          <TypeBadge key={t} type={t} />
                        ))}
                      </div>
                    </>
                  )}
                  <span className={text.meta}>
                    · ({uniqueEncounters.slice(0, 3).map((u) => u.enc.cleanName).join(', ')})
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isStarterRoute ? (
              <>
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
                      title={`Recibir a ${meta.name} como inicial`}
                      aria-label={`Elegir a ${meta.name} como inicial`}
                      className={cn(
                        spriteFrame(true, 'w-10 h-10 p-0.5'),
                        isSelected && 'border-brand-accent/60 ring-1 ring-brand-accent/25'
                      )}
                    >
                      <img
                        src={meta.sprite}
                        alt={meta.name}
                        className={cn('w-8 h-8 object-contain', !isSelected && 'opacity-50 grayscale')}
                      />
                    </button>
                  );
                })}
                {isCaught && savedEncounter && (
                  <button
                    type="button"
                    onClick={() => onDeleteEncounter(savedEncounter.id)}
                    className={iconBtn('soft', 'sm', 'danger')}
                    title="Eliminar captura"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            ) : isCaught && savedEncounter ? (
              <>
                <button
                  type="button"
                  onClick={handleSpinRoute}
                  className={iconBtn('secondary')}
                  title="Volver a girar ruleta"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteEncounter(savedEncounter.id)}
                  className={iconBtn('soft', 'sm', 'danger')}
                  title="Eliminar captura"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSpinRoute}
                  disabled={isSpinning || availableEncounters.length === 0}
                  className={btn('primary', 'md')}
                >
                  <Dice5 className={cn('w-3.5 h-3.5', isSpinning && 'animate-spin')} />
                  <span>{isSpinning ? (candidateName || 'Girando...') : 'Girar Ruleta'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenManualPicker(route, selectedWeather)}
                  className={iconBtn('secondary')}
                  title="Elegir manualmente"
                >
                  <Hand className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      id={`story-route-${route.id}`}
      className={cn(
        card({
          tone: isCaught ? 'success' : undefined,
          interactive: true,
          padding: 'none',
        }),
        'scroll-mt-24 overflow-hidden'
      )}
    >
      {/* Route Header */}
      <div
        className={cn(
          pad.card,
          'border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3'
        )}
      >
        <div className="flex items-center gap-3">
          {/* Step Icon Badge */}
          <div
            className={cn(
              'w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 border',
              isCaught
                ? cn(TONES.success.solid, 'border-transparent shadow-xs')
                : 'bg-brand-surface border-brand-border text-brand-txt2'
            )}
          >
            {isCaught ? (
              <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />
            ) : isStarterRoute ? (
              <Award className={cn('w-6 h-6 sm:w-7 sm:h-7', TONES.warning.ink)} />
            ) : (
              <Dice5 className={cn('w-6 h-6 sm:w-7 sm:h-7', TONES.accent.ink)} />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={pillSolid('neutral')}>
                Paso #{stepNumber}
              </span>
              <h3 className={text.sectionTitle}>
                {route.name}
              </h3>
              {route.englishName && route.englishName !== route.name && (
                <span className={text.muted}>({route.englishName})</span>
              )}
              <span className={pill(categoryColor)}>
                {route.category}
              </span>
              {isStarterRoute && (
                <span className={pillSolid('warning')}>
                  <Award className="w-3 h-3" /> Inicial
                </span>
              )}
            </div>

            <div className={cn('flex items-center gap-2 mt-1 flex-wrap', text.muted)}>
              <span className={pill('info', 'sm')}>
                {route.levelDisplay}
              </span>
              {isStarterRoute ? (
                <>
                  <span>•</span>
                  <span>Pokémon inicial entregado por Lionel</span>
                </>
              ) : (
                <>
                  <span>•</span>
                  <span>{availableEncounters.length} encuentros posibles</span>
                  {route.weathers.length > 1 && (
                    <>
                      <span>•</span>
                      <span className={cn('flex items-center gap-1 font-semibold', TONES.warning.ink)}>
                        <CloudSun className="w-3.5 h-3.5" />
                        {route.weathers.length} climas
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {isCaught ? (
            <span className={pillSolid('success', 'md')}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isStarterRoute ? 'Inicial recibido' : 'Capturado'}</span>
            </span>
          ) : isStarterRoute ? (
            <span className={pill('warning', 'md')}>
              <Award className="w-3.5 h-3.5" />
              <span>Elige tu inicial</span>
            </span>
          ) : (
            <span className={pill('neutral', 'md')}>
              <Clock className="w-3.5 h-3.5" />
              <span>Pendiente de Ruleta</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className={cn(pad.card, 'space-y-4')}>
        {/* CASE A: ALREADY CAUGHT */}
        {isCaught && savedEncounter && caughtMeta && caughtSprites && (
          <div
            className={card({
              extra: 'flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4',
            })}
          >
            {/* Pokemon Sprite and Data */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => openDetail('pokemon', caughtMeta.cleanName)}
                className={spriteFrame(true, 'w-16 h-16 sm:w-20 sm:h-20 p-1.5 group')}
                title={`Haz clic para ver estadísticas y detalles de ${caughtMeta.displayName}`}
              >
                <img
                  src={savedEncounter.isShiny ? caughtSprites.shinyShowdown : caughtSprites.showdown}
                  alt={caughtMeta.displayName}
                  onError={(e) => {
                    // Fallback to static sprite
                    (e.target as HTMLImageElement).src = savedEncounter.isShiny
                      ? caughtSprites.shinySprite
                      : caughtSprites.sprite;
                  }}
                  className="max-h-full max-w-full object-contain pixelated group-hover:scale-110 transition-transform"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </button>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => openDetail('pokemon', caughtMeta.cleanName)}
                    className={cn(
                      text.sectionTitle,
                      'cursor-pointer text-left transition-colors hover:text-brand-accent-ink',
                      focusRing
                    )}
                    title={`Ver estadísticas de ${caughtMeta.displayName}`}
                  >
                    {caughtMeta.displayName}
                  </button>
                  {savedEncounter.isShiny && (
                    <span className={pillSolid('warning')}>
                      <Sparkles className="w-3 h-3" /> Shiny
                    </span>
                  )}
                </div>

                <div className={cn('flex items-center gap-2 mt-1 flex-wrap', text.muted)}>
                  <span className="font-semibold text-brand-txt1">
                    {savedEncounter.levelRange || 'Nivel variable'}
                  </span>
                  {isStarterRoute ? (
                    <>
                      <span>•</span>
                      <span>Entregado por el Campeón Lionel</span>
                    </>
                  ) : (
                    <>
                      <span>•</span>
                      <span>Método: {savedEncounter.method}</span>
                      <span>•</span>
                      <span>Clima: {WEATHER_TRANSLATIONS[savedEncounter.weather] || savedEncounter.weather}</span>
                    </>
                  )}
                </div>

                {/* Types */}
                <div className="flex gap-1.5 mt-2">
                  {caughtMeta.types.map((type) => (
                    <TypeBadge key={type} type={type} />
                  ))}
                </div>
              </div>
            </div>

            {/* Status Selector & Re-spin Actions */}
            <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
              <div className={cn(segmented.group, 'flex-wrap')}>
                {(['En Equipo', 'En Caja', 'Debilitado', 'Huido'] as const).map((st) => {
                  const stTone: Tone =
                    st === 'Debilitado'
                      ? 'danger'
                      : st === 'En Equipo'
                      ? 'success'
                      : st === 'En Caja'
                      ? 'info'
                      : 'neutral';
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => onUpdateStatus(savedEncounter.id, st)}
                      className={filterChip(savedEncounter.status === st, stTone)}
                    >
                      {st === 'Debilitado' && <Skull className="w-3 h-3" />}
                      {st === 'En Equipo' && <Heart className="w-3 h-3" />}
                      <span>{st}</span>
                    </button>
                  );
                })}
              </div>

              {isStarterRoute ? (
                <div className={cn(segmented.group, 'flex-wrap')}>
                  {STARTER_CHOICES.map((st) => {
                    const meta = STARTERS_INFO[st];
                    const isSelected = savedEncounter.cleanName.toLowerCase() === meta.species.toLowerCase();
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleChooseStarter(st)}
                        className={segmented.item(isSelected)}
                        title={`Cambiar inicial a ${meta.name}`}
                      >
                        {st === 'grookey' && <Leaf className="w-3.5 h-3.5" />}
                        {st === 'scorbunny' && <Flame className="w-3.5 h-3.5" />}
                        {st === 'sobble' && <Droplets className="w-3.5 h-3.5" />}
                        <span>{meta.name}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSpinRoute}
                  className={btn('secondary')}
                  title="Volver a girar la ruleta en esta ruta"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Repetir</span>
                </button>
              )}

              {/* Delete button */}
              <button
                type="button"
                onClick={() => onDeleteEncounter(savedEncounter.id)}
                className={iconBtn('soft', 'sm', 'danger')}
                title="Eliminar este registro"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* CASE B: NOT CAUGHT YET */}
        {!isCaught && isStarterRoute && (
          <div className="space-y-3">
            <p className={text.muted}>
              Lionel te entrega tu primer Pokémon aquí. Elige tu inicial: los equipos de Paúl se ajustan a tu elección.
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
                      'text-left flex items-center gap-3 select-none cursor-pointer',
                      focusRing
                    )}
                  >
                    <div className={spriteFrame(false, 'w-14 h-14 p-1')}>
                      <img
                        src={starter.showdown}
                        alt={starter.name}
                        className="w-full h-full object-contain pixelated"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = starter.sprite;
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
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
                      <p className={cn(text.meta, 'mt-1 line-clamp-1')}>
                        Paúl usará a <strong>{starter.hopStarterName}</strong> ({starter.hopStarterType})
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!isCaught && !isStarterRoute && (
          <div className="space-y-3">
            {/* Weather bar if multiple weathers */}
            {route.weathers.length > 1 && (
              <div className={inset('flex items-center gap-2 overflow-x-auto scrollbar-none')}>
                <span className={cn(text.label, 'mr-1 flex items-center gap-1 shrink-0')}>
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

            {/* Interactive Action Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* PRIMARY ACTION: Girar Ruleta */}
              <button
                type="button"
                onClick={handleSpinRoute}
                disabled={isSpinning || availableEncounters.length === 0}
                className={btn('primary', 'lg', 'accent', 'w-full sm:flex-1')}
              >
                <Dice5 className={cn('w-4 h-4', isSpinning && 'animate-spin')} />
                <span>
                  {isSpinning
                    ? `Eligiendo... (${candidateName || 'Girando'})`
                    : `Girar Ruleta de ${route.name}`}
                </span>
              </button>

              {/* SECONDARY ACTION: Elegir Manualmente */}
              <button
                type="button"
                onClick={() => onOpenManualPicker(route, selectedWeather)}
                disabled={isSpinning || availableEncounters.length === 0}
                className={btn('secondary', 'md')}
              >
                <Hand className="w-4 h-4" />
                <span>Elegir Manual</span>
              </button>

              {/* TOGGLE: Ver Tabla de Encuentros */}
              <button
                type="button"
                onClick={() => setShowTable(!showTable)}
                className={btn('ghost', 'md', 'neutral')}
              >
                <span>{showTable ? 'Ocultar' : `Ver Pokémon (${uniqueEncounters.length})`}</span>
                {showTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Expandable Encounters Preview Table */}
            {showTable && (
              <div className="pt-2 border-t border-brand-border">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {uniqueEncounters.map(({ enc, totalChance }) => {
                    const meta = parsePokemonName(enc.pokemon);
                    const sprites = getPokemonSprite(enc.pokemon);
                    return (
                      <button
                        key={enc.pokemon}
                        type="button"
                        onClick={() => openDetail('pokemon', meta.cleanName)}
                        title={`Haz clic para ver estadísticas y detalles de ${meta.displayName}`}
                        className={card({
                          interactive: true,
                          padding: 'none',
                          extra: cn('p-2 flex items-center gap-2 text-left cursor-pointer', focusRing),
                        })}
                      >
                        <div className={spriteFrame(false, 'w-8 h-8 p-0.5')}>
                          <img
                            src={sprites.sprite}
                            alt={meta.displayName}
                            className="max-h-full max-w-full object-contain pixelated"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-brand-txt1 truncate">
                            {meta.cleanName}
                          </div>
                          <div className={cn(text.meta, 'font-semibold flex items-center justify-between')}>
                            <span>{enc.levelRange || route.levelDisplay}</span>
                            <span className={cn('font-bold', TONES.info.ink)}>{totalChance}%</span>
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
  );
};
