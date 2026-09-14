import React, { useState, useMemo } from 'react';
import { RouteData, RouteEncounter, SavedEncounter, EncounterMethod } from '../types';
import { parsePokemonName, getPokemonSprite } from '../utils/pokemonMeta';
import { WEATHER_TRANSLATIONS } from '../data/routeTranslations';
import { usePokeDetail } from '../context/PokeDetailContext';
import { sfx } from '../utils/audio';
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
  MapPin,
  CloudSun,
  Shield,
  Heart,
  Skull,
  HelpCircle,
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
  compact?: boolean;
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
  compact = false,
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

  const isCaught = Boolean(savedEncounter);

  // Metas for saved Pokémon
  const caughtMeta = savedEncounter ? parsePokemonName(savedEncounter.pokemon) : null;
  const caughtSprites = savedEncounter ? getPokemonSprite(savedEncounter.pokemon) : null;

  const categoryColor =
    route.category === 'Ruta'
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
      : route.category === 'Cueva/Mina'
      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
      : route.category === 'Ciudad/Pueblo'
      ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800'
      : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';

  // COMPACT MODE: Space-saving single/dual-line card
  if (compact) {
    return (
      <article
        id={`story-route-${route.id}`}
        className={`rounded-2xl border transition-all scroll-mt-24 p-3 sm:p-3.5 shadow-2xs ${
          isCaught
            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/90 dark:border-emerald-800/70'
            : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Left: Step, Route, Pokemon/Level */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black ${
                isCaught
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {isCaught ? <CheckCircle2 className="w-4 h-4" /> : `#${stepNumber}`}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-black text-sm text-slate-900 dark:text-white truncate">
                  {route.name}
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  ({route.levelDisplay})
                </span>
              </div>

              {isCaught && savedEncounter && caughtMeta && caughtSprites ? (
                <button
                  type="button"
                  onClick={() => openDetail('pokemon', caughtMeta.cleanName)}
                  className="flex items-center gap-2 mt-0.5 text-left cursor-pointer hover:opacity-80 transition-opacity"
                  title={`Haz clic para ver estadísticas y detalles de ${caughtMeta.displayName}`}
                >
                  <img
                    src={caughtSprites.sprite}
                    alt={caughtMeta.displayName}
                    className="w-5 h-5 object-contain pixelated flex-shrink-0"
                  />
                  <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 truncate">
                    {savedEncounter.nickname ? `${savedEncounter.nickname} (${caughtMeta.cleanName})` : caughtMeta.cleanName}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                    {savedEncounter.status}
                  </span>
                </button>
              ) : (
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {availableEncounters.length} Pokémon posibles
                </div>
              )}
            </div>
          </div>

          {/* Right: Quick actions */}
          <div className="flex items-center gap-1.5 self-end sm:self-center flex-shrink-0">
            {isCaught && savedEncounter ? (
              <>
                <button
                  type="button"
                  onClick={handleSpinRoute}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1"
                  title="Volver a girar ruleta"
                >
                  <RotateCcw className="w-3 h-3 text-indigo-500" />
                  <span className="hidden xs:inline">Regirar</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteEncounter(savedEncounter.id)}
                  className="p-1.5 rounded-xl text-xs bg-red-50 dark:bg-red-950/50 hover:bg-red-100 text-red-600 dark:text-red-400"
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
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Dice5 className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
                  <span>{isSpinning ? (candidateName || 'Girando...') : 'Girar Ruleta'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenManualPicker(route, selectedWeather)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                  title="Elegir manualmente"
                >
                  <Hand className="w-3.5 h-3.5 text-indigo-500" />
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
      className={`rounded-3xl border transition-all scroll-mt-24 ${
        isCaught
          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/90 dark:border-emerald-800/80 shadow-xs'
          : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-sm'
      }`}
    >
      {/* Route Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          {/* Step Icon Badge */}
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 ${
              isCaught
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {isCaught ? (
              <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />
            ) : (
              <Dice5 className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                Paso #{stepNumber}
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {route.name}
              </h3>
              {route.englishName && route.englishName !== route.name && (
                <span className="text-xs text-slate-400 font-medium">({route.englishName})</span>
              )}
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${categoryColor}`}>
                {route.category}
              </span>
            </div>

            <div className="flex items-center gap-2.5 mt-1 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/80 dark:border-indigo-800/80">
                {route.levelDisplay}
              </span>
              <span>•</span>
              <span>{availableEncounters.length} encuentros posibles</span>
              {route.weathers.length > 1 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                    <CloudSun className="w-3.5 h-3.5" />
                    {route.weathers.length} climas
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {isCaught ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Capturado</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Pendiente de Ruleta</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* CASE A: ALREADY CAUGHT */}
        {isCaught && savedEncounter && caughtMeta && caughtSprites && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-emerald-200/90 dark:border-emerald-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Pokemon Sprite and Data */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => openDetail('pokemon', caughtMeta.cleanName)}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center p-1.5 flex-shrink-0 shadow-2xs group cursor-pointer hover:border-indigo-500 transition-all"
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
                    className="text-base sm:text-lg font-black text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer text-left transition-colors"
                    title={`Ver estadísticas de ${caughtMeta.displayName}`}
                  >
                    {caughtMeta.displayName}
                  </button>
                  {savedEncounter.isShiny && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-400 text-amber-950 flex items-center gap-0.5">
                      <Sparkles className="w-3 h-3" /> Shiny
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {savedEncounter.levelRange || 'Nivel variable'}
                  </span>
                  <span>•</span>
                  <span>Método: {savedEncounter.method}</span>
                  <span>•</span>
                  <span>Clima: {WEATHER_TRANSLATIONS[savedEncounter.weather] || savedEncounter.weather}</span>
                </div>

                {/* Types */}
                <div className="flex gap-1.5 mt-2">
                  {caughtMeta.types.map((type) => (
                    <span
                      key={type}
                      className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Status Selector & Re-spin Actions */}
            <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
                {(['En Equipo', 'En Caja', 'Debilitado', 'Huido'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => onUpdateStatus(savedEncounter.id, st)}
                    className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                      savedEncounter.status === st
                        ? st === 'Debilitado'
                          ? 'bg-red-600 text-white shadow-2xs'
                          : st === 'En Equipo'
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {st === 'Debilitado' && <Skull className="w-3 h-3" />}
                    {st === 'En Equipo' && <Heart className="w-3 h-3" />}
                    <span>{st}</span>
                  </button>
                ))}
              </div>

              {/* Reroll button */}
              <button
                type="button"
                onClick={handleSpinRoute}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Volver a girar la ruleta en esta ruta"
              >
                <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Repetir</span>
              </button>

              {/* Delete button */}
              <button
                type="button"
                onClick={() => onDeleteEncounter(savedEncounter.id)}
                className="p-2 rounded-xl bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold transition-colors"
                title="Eliminar este registro"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* CASE B: NOT CAUGHT YET */}
        {!isCaught && (
          <div className="space-y-3">
            {/* Weather bar if multiple weathers */}
            {route.weathers.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                  <CloudSun className="w-3.5 h-3.5 text-amber-500" />
                  Clima:
                </span>
                {route.weathers.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setSelectedWeather(w)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
                      selectedWeather === w
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
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
                className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2.5 disabled:opacity-50"
              >
                <Dice5 className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
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
                className="py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-2"
              >
                <Hand className="w-4 h-4 text-indigo-500" />
                <span>Elegir Manual</span>
              </button>

              {/* TOGGLE: Ver Tabla de Encuentros */}
              <button
                type="button"
                onClick={() => setShowTable(!showTable)}
                className="py-3 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <span>{showTable ? 'Ocultar' : `Ver Pokémon (${uniqueEncounters.length})`}</span>
                {showTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Expandable Encounters Preview Table */}
            {showTable && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
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
                        className="bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-slate-700/80 p-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-400 flex items-center gap-2 text-left cursor-pointer transition-all hover:scale-[1.02]"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden p-0.5 flex-shrink-0">
                          <img
                            src={sprites.sprite}
                            alt={meta.displayName}
                            className="max-h-full max-w-full object-contain pixelated"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                            {meta.cleanName}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-between">
                            <span>{enc.levelRange || route.levelDisplay}</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{totalChance}%</span>
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
