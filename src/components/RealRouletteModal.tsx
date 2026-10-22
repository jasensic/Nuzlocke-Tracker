import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { RouteData, RouteEncounter, SavedEncounter } from '../types';
import { parsePokemonName, getPokemonSprite } from '../utils/pokemonMeta';
import { sfx } from '../utils/audio';
import confetti from 'canvas-confetti';
import { TypeBadge } from './TypeBadge';
import {
  cn,
  card,
  btn,
  iconBtn,
  pillSolid,
  spriteFrame,
} from '../utils/ui';
import {
  Sparkles,
  Dice5,
  X,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Info,
} from 'lucide-react';

interface RealRouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: RouteData;
  weather: string;
  availableEncounters: RouteEncounter[];
  isWeighted: boolean;
  soundEnabled: boolean;
  onConfirmCatch: (encounter: SavedEncounter) => void;
}

// Canonical Pokémon type hex colors for wheel slices
const TYPE_HEX_COLORS: Record<string, string> = {
  Normal: '#A8A77A',
  Fuego: '#EE8130',
  Fire: '#EE8130',
  Agua: '#6390F0',
  Water: '#6390F0',
  Planta: '#7AC74C',
  Grass: '#7AC74C',
  Eléctrico: '#F7D02C',
  Electric: '#F7D02C',
  Hielo: '#96D9D6',
  Ice: '#96D9D6',
  Lucha: '#C22E28',
  Fighting: '#C22E28',
  Veneno: '#A33EA1',
  Poison: '#A33EA1',
  Tierra: '#E2BF65',
  Ground: '#E2BF65',
  Volador: '#A98FF3',
  Flying: '#A98FF3',
  Psíquico: '#F95587',
  Psychic: '#F95587',
  Bicho: '#A6B91A',
  Bug: '#A6B91A',
  Dragón: '#6F35FC',
  Dragon: '#6F35FC',
  Siniestro: '#705746',
  Dark: '#705746',
  Fantasma: '#735797',
  Ghost: '#735797',
  Hada: '#D685AD',
  Fairy: '#D685AD',
  Acero: '#B7B7CE',
  Steel: '#B7B7CE',
  Roca: '#B6A136',
  Rock: '#B6A136',
};

// Fallback wheel palette if types are not mapped
const WHEEL_PALETTE = [
  '#EE8130', '#6390F0', '#7AC74C', '#F7D02C', '#F95587',
  '#A6B91A', '#6F35FC', '#A33EA1', '#E2BF65', '#96D9D6',
  '#C22E28', '#A98FF3', '#735797', '#D685AD', '#B6A136',
  '#A8A77A', '#705746', '#B7B7CE', '#059669', '#0284C7',
];

interface WheelSlice {
  index: number;
  pokemon: string;
  cleanName: string;
  formLabel?: string;
  chance: number;
  percentage: number;
  encounter: RouteEncounter;
  startAngle: number;
  endAngle: number;
  midAngle: number;
  color: string;
  type: string;
}

export const RealRouletteModal: React.FC<RealRouletteModalProps> = ({
  isOpen,
  onClose,
  route,
  weather,
  availableEncounters,
  isWeighted,
  soundEnabled,
  onConfirmCatch,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winningSlice, setWinningSlice] = useState<WheelSlice | null>(null);
  const [hasLanded, setHasLanded] = useState(false);

  // Group unique encounters to produce clean sectors
  const uniqueSlices = useMemo<WheelSlice[]>(() => {
    if (!availableEncounters || availableEncounters.length === 0) return [];

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

    const items = Array.from(map.values()).sort((a, b) => b.totalChance - a.totalChance);
    const totalWeight = items.reduce((acc, curr) => acc + (isWeighted ? curr.totalChance : 1), 0);

    let currentAngle = 0;
    return items.map((item, idx) => {
      const weight = isWeighted ? item.totalChance : 1;
      const pct = (weight / totalWeight) * 100;
      const angleSpan = (weight / totalWeight) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angleSpan;
      const midAngle = startAngle + angleSpan / 2;
      currentAngle = endAngle;

      const meta = parsePokemonName(item.enc.pokemon);
      const primaryType = meta.types[0] || 'Normal';
      const color = TYPE_HEX_COLORS[primaryType] || WHEEL_PALETTE[idx % WHEEL_PALETTE.length];

      return {
        index: idx,
        pokemon: item.enc.pokemon,
        cleanName: meta.cleanName,
        formLabel: meta.formLabel,
        chance: item.totalChance,
        percentage: Math.round(pct * 10) / 10,
        encounter: item.enc,
        startAngle,
        endAngle,
        midAngle,
        color,
        type: primaryType,
      };
    });
  }, [availableEncounters, isWeighted]);

  const hasTooManyOptions = uniqueSlices.length > 20;

  // Rapid cycling candidate for >20 fallback
  const [activeCycleCandidate, setActiveCycleCandidate] = useState<RouteEncounter | null>(null);
  const cycleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Lock body scroll and prevent background scroll gestures while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSpinning) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSpinning, onClose]);

  // Reset state when opening modal with a new route
  useEffect(() => {
    if (isOpen) {
      setIsSpinning(false);
      setRotation(0);
      setWinningSlice(null);
      setHasLanded(false);
      setActiveCycleCandidate(null);
    }
    return () => {
      if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current);
    };
  }, [isOpen, route.id]);

  // Execute Spin
  const handleStartSpin = useCallback(() => {
    if (isSpinning || uniqueSlices.length === 0) return;

    setIsSpinning(true);
    setHasLanded(false);
    setWinningSlice(null);

    // Pick winning slice based on probabilities
    const totalWeight = uniqueSlices.reduce(
      (acc, s) => acc + (isWeighted ? s.chance : 1),
      0
    );
    let rand = Math.random() * totalWeight;
    let chosen = uniqueSlices[0];
    for (const slice of uniqueSlices) {
      const w = isWeighted ? slice.chance : 1;
      rand -= w;
      if (rand <= 0) {
        chosen = slice;
        break;
      }
    }

    if (soundEnabled) sfx.playTick();

    // CASE A: Standard SVG Wheel (<= 20 options)
    if (!hasTooManyOptions) {
      // Wheel geometry:
      // Pointer is fixed at 12 o'clock (270 degrees in SVG coordinates).
      // We want winningSlice.midAngle + finalRotation % 360 == 270 degrees.
      // So targetAngle = 270 - winningSlice.midAngle.
      const targetAngle = 270 - chosen.midAngle;
      const normalizedTarget = ((targetAngle % 360) + 360) % 360;

      // Add 6 to 8 full revolutions for realistic spin duration
      const fullSpins = 360 * 7;
      // Slight organic jitter within the sector (within 25% of sector width)
      const sectorWidth = chosen.endAngle - chosen.startAngle;
      const jitter = (Math.random() - 0.5) * Math.min(sectorWidth * 0.4, 6);

      const targetRotation = rotation + fullSpins + (normalizedTarget - (rotation % 360)) + jitter;
      setRotation(targetRotation);

      // Acoustic ticker simulation while spinning
      const startTime = performance.now();
      const spinDuration = 3800; // 3.8s matching CSS transition
      let lastTickTime = startTime;

      const tickTimer = setInterval(() => {
        const now = performance.now();
        const elapsed = now - startTime;
        if (elapsed >= spinDuration) {
          clearInterval(tickTimer);
          return;
        }

        // Decelerate ticks according to ease-out curve
        const progress = elapsed / spinDuration;
        const tickInterval = 60 + Math.pow(progress, 2.5) * 400; // starts fast (~60ms), slows to ~460ms
        if (now - lastTickTime >= tickInterval) {
          if (soundEnabled) sfx.playTick();
          lastTickTime = now;
        }
      }, 30);

      // Settle on winner after animation finishes
      setTimeout(() => {
        clearInterval(tickTimer);
        setIsSpinning(false);
        setWinningSlice(chosen);
        setHasLanded(true);

        if (soundEnabled) {
          sfx.playReveal();
          sfx.playCatch();
        }
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
        });
      }, spinDuration + 100);

    } else {
      // CASE B: Fast Ticker for > 20 options
      const spinDuration = 3200;
      const startTime = Date.now();
      const intervalMs = 70;

      cycleIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const randIdx = Math.floor(Math.random() * uniqueSlices.length);
        setActiveCycleCandidate(uniqueSlices[randIdx].encounter);
        if (soundEnabled) sfx.playTick();

        if (elapsed >= spinDuration) {
          if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current);
          setIsSpinning(false);
          setWinningSlice(chosen);
          setActiveCycleCandidate(chosen.encounter);
          setHasLanded(true);

          if (soundEnabled) {
            sfx.playReveal();
            sfx.playCatch();
          }
          confetti({
            particleCount: 75,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }, intervalMs);
    }
  }, [
    isSpinning,
    uniqueSlices,
    isWeighted,
    soundEnabled,
    hasTooManyOptions,
    rotation,
  ]);

  if (!isOpen) return null;

  // Confirm and persist encounter as Capturado or Huido (No capturado)
  const handleConfirmCatch = (status: 'Capturado' | 'Huido' = 'Capturado') => {
    if (!winningSlice) return;

    const chosen = winningSlice.encounter;
    const isShiny = Math.random() < 0.01; // 1% chance Easter egg

    const newSaved: SavedEncounter = {
      id: `enc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      routeId: route.id,
      routeName: route.name,
      pokemon: chosen.pokemon,
      cleanName: winningSlice.cleanName,
      formLabel: winningSlice.formLabel,
      method: chosen.method || 'Visible',
      weather: chosen.weather || weather,
      levelRange: chosen.levelRange || route.levelDisplay,
      chance: winningSlice.chance,
      status,
      notes: status === 'Huido' ? 'No capturado / Se escapó' : undefined,
      isShiny,
    };

    if (soundEnabled) {
      if (status === 'Capturado') {
        sfx.playCatch();
      } else {
        sfx.playTick();
      }
    }

    onConfirmCatch(newSaved);
    onClose();
  };

  // SVG parameters
  const size = 360;
  const center = size / 2;
  const radius = center - 16;
  const innerRadius = 36;

  // Helper to draw wedge arc path
  const makeArcPath = (start: number, end: number) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const r1 = radius;
    const r0 = innerRadius;

    const x1 = center + r1 * Math.cos(toRad(start));
    const y1 = center + r1 * Math.sin(toRad(start));
    const x2 = center + r1 * Math.cos(toRad(end));
    const y2 = center + r1 * Math.sin(toRad(end));

    const x3 = center + r0 * Math.cos(toRad(end));
    const y3 = center + r0 * Math.sin(toRad(end));
    const x4 = center + r0 * Math.cos(toRad(start));
    const y4 = center + r0 * Math.sin(toRad(start));

    const largeArc = end - start > 180 ? 1 : 0;

    return `M ${x4} ${y4} L ${x1} ${y1} A ${r1} ${r1} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${r0} ${r0} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className={cn(
          card({ padding: 'none' }),
          'w-full max-w-lg bg-brand-surface border border-brand-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-brand-border flex items-center justify-between gap-3 bg-brand-bg/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-brand-accent/15 text-brand-accent flex items-center justify-center shrink-0">
              <Dice5 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-brand-txt1 truncate">
                Ruleta de {route.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-brand-txt2">
                <span>{route.levelDisplay}</span>
                <span>•</span>
                <span>{uniqueSlices.length} opciones</span>
                <span>•</span>
                <span className="font-semibold text-brand-accent">
                  {isWeighted ? 'Probabilidades oficiales' : 'Modo equitativo'}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSpinning}
            className={iconBtn('ghost', 'md', 'neutral')}
            title="Cerrar ruleta"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wheel Area */}
        <div
          className="p-4 sm:p-6 flex-1 flex flex-col items-center justify-center overflow-y-auto overscroll-contain select-none"
          onWheel={(e) => e.stopPropagation()}
        >
          {!hasTooManyOptions ? (
            /* ================= REAL CIRCULAR SVG WHEEL ================= */
            <div className="relative flex flex-col items-center justify-center select-none py-2 shrink-0">
              {/* TOP POINTER (12 o'clock indicator needle) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center drop-shadow-lg pointer-events-none">
                <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-amber-400 filter drop-shadow-md" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-200 -mt-1 shadow-xs" />
              </div>

              {/* WHEEL CONTAINER WITH SHADOW & RIM */}
              <div
                className="relative rounded-full p-2 bg-gradient-to-b from-slate-800 to-slate-950 shadow-2xl border-4 border-slate-700/80 w-[270px] h-[270px] sm:w-[320px] sm:h-[320px] shrink-0 overflow-hidden flex items-center justify-center touch-none select-none"
                style={{ contain: 'paint' }}
              >
                {/* ROTATING SVG WHEEL */}
                <svg
                  viewBox={`0 0 ${size} ${size}`}
                  className="w-full h-full rounded-full overflow-hidden transition-transform will-change-transform"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transitionDuration: isSpinning ? '3800ms' : '0ms',
                    transitionTimingFunction: 'cubic-bezier(0.15, 0.9, 0.2, 1.0)',
                  }}
                >
                  {/* WHEEL SLICES */}
                  {uniqueSlices.map((slice) => {
                    const isWinner = hasLanded && winningSlice?.cleanName === slice.cleanName;
                    const path = makeArcPath(slice.startAngle, slice.endAngle);
                    const angleRad = (slice.midAngle * Math.PI) / 180;
                    const labelR = radius * 0.68;
                    const labelX = center + labelR * Math.cos(angleRad);
                    const labelY = center + labelR * Math.sin(angleRad);
                    const textAngle = slice.midAngle > 90 && slice.midAngle < 270
                      ? slice.midAngle + 180
                      : slice.midAngle;

                    return (
                      <g key={slice.pokemon} className="group">
                        <path
                          d={path}
                          fill={slice.color}
                          stroke="#1e293b"
                          strokeWidth="1.5"
                          className={cn(
                            'transition-opacity',
                            hasLanded && !isWinner && 'opacity-40',
                            isWinner && 'filter brightness-125'
                          )}
                        />
                        {/* Slice Label */}
                        <g transform={`translate(${labelX}, ${labelY}) rotate(${textAngle})`}>
                          <text
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill="#ffffff"
                            fontSize={uniqueSlices.length > 14 ? '9' : '11'}
                            fontWeight="800"
                            className="pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] select-none uppercase tracking-tight"
                          >
                            {slice.cleanName.length > 9
                              ? `${slice.cleanName.substring(0, 8)}.`
                              : slice.cleanName}
                          </text>
                        </g>
                      </g>
                    );
                  })}

                  {/* CENTER POKEBALL HUB */}
                  <g>
                    {/* Outer dark ring */}
                    <circle cx={center} cy={center} r={innerRadius + 4} fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
                    {/* Pokeball top half */}
                    <path
                      d={`M ${center - innerRadius} ${center} A ${innerRadius} ${innerRadius} 0 0 1 ${center + innerRadius} ${center} Z`}
                      fill="#ef4444"
                    />
                    {/* Pokeball bottom half */}
                    <path
                      d={`M ${center - innerRadius} ${center} A ${innerRadius} ${innerRadius} 0 0 0 ${center + innerRadius} ${center} Z`}
                      fill="#f8fafc"
                    />
                    {/* Center black stripe */}
                    <rect x={center - innerRadius} y={center - 3} width={innerRadius * 2} height="6" fill="#0f172a" />
                    {/* Button circle */}
                    <circle cx={center} cy={center} r="10" fill="#0f172a" />
                    <circle cx={center} cy={center} r="6" fill="#ffffff" />
                    <circle cx={center} cy={center} r="3" fill="#cbd5e1" />
                  </g>
                </svg>
              </div>
            </div>
          ) : (
            /* ================= FALLBACK CAROUSEL REEL FOR > 20 OPTIONS ================= */
            <div className="w-full flex flex-col items-center justify-center py-6 space-y-4">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-500">
                <Info className="w-4 h-4 shrink-0" />
                <span>
                  Esta ruta tiene <strong>{uniqueSlices.length} opciones</strong> (más de 20 para ruleta circular). Se utiliza el selector rápido ponderado.
                </span>
              </div>

              {/* Ticker Box */}
              <div className="w-full max-w-sm h-36 rounded-2xl bg-brand-bg border-2 border-brand-accent/40 flex flex-col items-center justify-center p-4 relative overflow-hidden shadow-inner">
                {activeCycleCandidate ? (
                  (() => {
                    const meta = parsePokemonName(activeCycleCandidate.pokemon);
                    const sprites = getPokemonSprite(activeCycleCandidate.pokemon);
                    return (
                      <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-100">
                        <img
                          src={sprites.sprite}
                          alt={meta.displayName}
                          className="w-16 h-16 object-contain pixelated drop-shadow-md"
                        />
                        <span className="font-black text-lg text-brand-txt1 mt-1">
                          {meta.cleanName}
                        </span>
                        <div className="flex gap-1 mt-1">
                          {meta.types.map((t) => (
                            <TypeBadge key={t} type={t} />
                          ))}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="flex flex-col items-center text-brand-txt2">
                    <Dice5 className="w-10 h-10 mb-2 opacity-50" />
                    <span className="text-sm font-semibold">Listo para girar</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WINNER REVEAL CARD */}
          {hasLanded && winningSlice && (
            <div className="w-full mt-4 p-4 rounded-xl bg-brand-surface/90 border-2 border-brand-accent/40 animate-in zoom-in-95 fade-in duration-300">
              <div className="flex items-center gap-3">
                {(() => {
                  const sprites = getPokemonSprite(winningSlice.encounter.pokemon);
                  return (
                    <div className={spriteFrame(true, 'w-16 h-16 p-1 bg-white/10 shrink-0')}>
                      <img
                        src={sprites.showdown || sprites.sprite}
                        alt={winningSlice.cleanName}
                        className="max-h-full max-w-full object-contain pixelated"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = sprites.sprite;
                        }}
                      />
                    </div>
                  );
                })()}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={pillSolid('info', 'xs')}>
                      ¡Encuentro de la Ruta!
                    </span>
                    <span className="text-xs text-brand-txt2">
                      {winningSlice.percentage}% prob.
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-brand-txt1 truncate mt-0.5">
                    {winningSlice.cleanName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <TypeBadge type={winningSlice.type} />
                    <span className="text-xs font-semibold text-brand-txt2">
                      {winningSlice.encounter.levelRange || route.levelDisplay}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs text-brand-txt2 border-t border-brand-border/60 pt-2.5">
                ¿Lograste capturarlo o se escapó / debilitó en combate?
              </p>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-brand-border bg-brand-bg/60 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5">
          {hasLanded && winningSlice ? (
            <>
              <button
                type="button"
                onClick={handleStartSpin}
                className={btn('secondary', 'md', 'neutral')}
                title="Volver a girar si deseas reintentar"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reintentar</span>
              </button>

              <div className="flex items-center gap-2 flex-1 justify-end">
                <button
                  type="button"
                  onClick={() => handleConfirmCatch('Huido')}
                  className={btn('soft', 'md', 'danger', 'flex-1 sm:flex-initial')}
                  title="Registrar como encuentro gastado pero no capturado (se escapó o debilitó)"
                >
                  <XCircle className="w-4 h-4" />
                  <span>No Capturado</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmCatch('Capturado')}
                  className={btn('primary', 'md', 'success', 'flex-1 sm:flex-initial')}
                  title="Registrar como captura exitosa"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡Capturado!</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isSpinning}
                className={btn('secondary', 'md')}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleStartSpin}
                disabled={isSpinning || uniqueSlices.length === 0}
                className={btn('primary', 'lg', 'accent', 'flex-1')}
              >
                <Sparkles className={cn('w-5 h-5', isSpinning && 'animate-spin')} />
                <span>{isSpinning ? 'Girando ruleta...' : '¡Girar Ruleta!'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
