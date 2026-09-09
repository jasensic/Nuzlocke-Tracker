import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getRoutes } from './data/encounterParser';
import { translateRouteName } from './data/routeTranslations';
import { RouteData, RouteEncounter, SavedEncounter, EncounterMethod } from './types';
import { PokeballSpinner } from './components/PokeballSpinner';
import { EncounterWheel } from './components/EncounterWheel';
import { EncounterResultCard } from './components/EncounterResultCard';
import { QuickRouteBar } from './components/QuickRouteBar';
import { RouteFilters } from './components/RouteFilters';
import { SavedHistoryView } from './components/SavedHistoryView';
import { RouteDatabaseView } from './components/RouteDatabaseView';
import { sfx } from './utils/audio';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Compass,
  BookmarkCheck,
  Layers,
  Dice5,
  Info,
  Sun,
  Moon,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'pokemon_route_encounters_v1';
const THEME_KEY = 'pokemon_tracker_theme_v1';

export default function App() {
  const allRoutes = useMemo(() => getRoutes(), []);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'roulette' | 'history' | 'database'>('roulette');

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
    } catch {
      // Storage error
    }
  }, [isDarkMode]);

  // Selected filters
  const [selectedRouteId, setSelectedRouteId] = useState<string>(allRoutes[0]?.id || 'route-1');
  const [selectedWeather, setSelectedWeather] = useState<string>('All');
  const [selectedMethod, setSelectedMethod] = useState<EncounterMethod | 'All'>('All');
  const [isWeighted, setIsWeighted] = useState<boolean>(true);

  // Secondary filters drawer & progression controls
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showProgression, setShowProgression] = useState<boolean>(false);

  // Sound toggle
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Saved history from LocalStorage with automatic Spanish route name migration
  const [history, setHistory] = useState<SavedEncounter[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed: SavedEncounter[] = JSON.parse(saved);
      return parsed.map((item) => ({
        ...item,
        routeName: translateRouteName(item.routeName),
      }));
    } catch {
      return [];
    }
  });

  // Save history updates to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Storage full or quota exceeded
    }
  }, [history]);

  // Current active route object
  const currentRoute = useMemo(() => {
    return allRoutes.find((r) => r.id === selectedRouteId) || allRoutes[0];
  }, [allRoutes, selectedRouteId]);

  // Reset weather & method if route changes and previous selection is not present
  useEffect(() => {
    setSelectedWeather('All');
    setSelectedMethod('All');
  }, [selectedRouteId]);

  // Available encounters given current filters
  const availableEncounters = useMemo(() => {
    if (!currentRoute) return [];
    return currentRoute.encounters.filter((enc) => {
      const matchesWeather = selectedWeather === 'All' || enc.weather === selectedWeather;
      const matchesMethod = selectedMethod === 'All' || enc.method === selectedMethod;
      return matchesWeather && matchesMethod;
    });
  }, [currentRoute, selectedWeather, selectedMethod]);

  // Roulette rolling state
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [activeCandidate, setActiveCandidate] = useState<string | null>(null);
  const [selectedEncounter, setSelectedEncounter] = useState<RouteEncounter | null>(null);
  const spinIntervalRef = useRef<number | null>(null);

  // Toggle sound
  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sfx.enabled = nextState;
  };

  // Run the random selection
  const handleRoll = () => {
    if (availableEncounters.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setSelectedEncounter(null);

    // Pick candidates for spinning animation
    const candidateNames = Array.from(new Set(availableEncounters.map((e) => e.pokemon)));
    let tickCount = 0;
    const maxTicks = 22; // ~2.2 seconds of roll excitement

    // Sound start
    sfx.playTick();

    // Cycling animation
    spinIntervalRef.current = window.setInterval(() => {
      tickCount++;
      const randomCandidate = candidateNames[Math.floor(Math.random() * candidateNames.length)];
      setActiveCandidate(randomCandidate);
      sfx.playTick();

      if (tickCount >= maxTicks) {
        if (spinIntervalRef.current) {
          clearInterval(spinIntervalRef.current);
          spinIntervalRef.current = null;
        }

        // Determine final winner based on probability mode
        let chosen: RouteEncounter;

        if (isWeighted) {
          // Weighted random roll according to game chances
          const totalWeight = availableEncounters.reduce((acc, curr) => acc + curr.chance, 0);
          let randomThreshold = Math.random() * totalWeight;

          chosen = availableEncounters[0];
          for (const enc of availableEncounters) {
            randomThreshold -= enc.chance;
            if (randomThreshold <= 0) {
              chosen = enc;
              break;
            }
          }
        } else {
          // Uniform random roll
          const randomIndex = Math.floor(Math.random() * availableEncounters.length);
          chosen = availableEncounters[randomIndex];
        }

        setActiveCandidate(chosen.pokemon);
        setSelectedEncounter(chosen);
        setIsSpinning(false);

        // Sound fanfare & confetti
        sfx.playReveal();
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }, 85);
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) {
        clearInterval(spinIntervalRef.current);
      }
    };
  }, []);

  // Save an encounter to history
  const handleSaveEncounter = (saved: SavedEncounter) => {
    setHistory((prev) => [saved, ...prev]);
  };

  // Update a saved encounter
  const handleUpdateEncounter = (id: string, updates: Partial<SavedEncounter>) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  // Delete a saved encounter
  const handleDeleteEncounter = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear all history
  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white transition-colors duration-200">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3.5 flex flex-col gap-2.5">
          {/* Main Top Row: Brand + Controls */}
          <div className="flex items-center justify-between gap-3">
            {/* Brand Logo */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-md shadow-red-500/30 text-white font-bold text-lg select-none flex-shrink-0">
                <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-white bg-slate-900 block" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight truncate">
                  Nuzlocke Pokemon Blessed Shield
                </h1>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden md:block truncate">
                  Ruleta de encuentros oficiales y bitácora de ruta para Galar
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <button
                id="tab-roulette-button"
                type="button"
                onClick={() => setActiveTab('roulette')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'roulette'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Dice5 className="w-3.5 h-3.5 text-red-500" />
                <span>Ruleta</span>
              </button>

              <button
                id="tab-history-button"
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 relative ${
                  activeTab === 'history'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Bitácora</span>
                {history.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-emerald-600 text-white text-[10px] font-extrabold rounded-full">
                    {history.length}
                  </span>
                )}
              </button>

              <button
                id="tab-database-button"
                type="button"
                onClick={() => setActiveTab('database')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'database'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>Base de Datos</span>
              </button>
            </nav>

            {/* Quick Action Controls (Sound & Dark Mode) */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Dark Mode Toggle */}
              <button
                id="theme-toggle-button"
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 sm:px-2.5 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 text-xs font-semibold"
                title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                aria-label={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
                <span className="hidden lg:inline">{isDarkMode ? 'Claro' : 'Oscuro'}</span>
              </button>

              {/* Sound Mute/Unmute */}
              <button
                id="sound-toggle-button"
                type="button"
                onClick={handleToggleSound}
                className={`p-2 rounded-xl border transition-colors ${
                  soundEnabled
                    ? 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                }`}
                title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
                aria-label={soundEnabled ? 'Silenciar' : 'Sonido activado'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Bar (Dedicated full-width row on small devices) */}
          <nav className="flex md:hidden w-full bg-slate-100 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-200/90 dark:border-slate-700/90 text-xs font-bold shadow-xs">
            <button
              id="mobile-tab-roulette-button"
              type="button"
              onClick={() => setActiveTab('roulette')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 min-h-[42px] ${
                activeTab === 'roulette'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <Dice5 className="w-4 h-4 text-red-500" />
              <span>Ruleta</span>
            </button>

            <button
              id="mobile-tab-history-button"
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 min-h-[42px] relative ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <BookmarkCheck className="w-4 h-4 text-emerald-500" />
              <span>Bitácora</span>
              {history.length > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-600 text-white text-[10px] font-extrabold rounded-full">
                  {history.length}
                </span>
              )}
            </button>

            <button
              id="mobile-tab-database-button"
              type="button"
              onClick={() => setActiveTab('database')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 min-h-[42px] ${
                activeTab === 'database'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>Rutas</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-5 sm:space-y-6">
        {/* VIEW 1: ROULETTE / ENCOUNTER GENERATOR */}
        {activeTab === 'roulette' && (
          <div className="space-y-5 sm:space-y-6">
            {/* 1. Sleek Route Bar: Always visible, easy navigation & clear route state */}
            <QuickRouteBar
              routes={allRoutes}
              selectedRouteId={selectedRouteId}
              onRouteChange={setSelectedRouteId}
              history={history}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
              showProgression={showProgression}
              onToggleProgression={() => setShowProgression(!showProgression)}
            />

            {/* 2. Collapsible / Secondary Filters Panel */}
            {showFilters && (
              <RouteFilters
                currentRoute={currentRoute}
                routes={allRoutes}
                selectedWeather={selectedWeather}
                onWeatherChange={setSelectedWeather}
                selectedMethod={selectedMethod}
                onMethodChange={setSelectedMethod}
                isWeighted={isWeighted}
                onToggleWeighted={setIsWeighted}
                availableCount={availableEncounters.length}
                history={history}
                showProgression={showProgression}
                onToggleProgression={() => setShowProgression(!showProgression)}
                selectedRouteId={selectedRouteId}
                onRouteChange={setSelectedRouteId}
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
              />
            )}

            {/* 3. PRIMARY HERO: The Interactive Pokemon Selection Stage */}
            <div
              id="roulette-interactive-stage"
              className="bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-850 rounded-3xl p-6 sm:p-9 border border-slate-200/90 dark:border-slate-800 shadow-md flex flex-col items-center justify-center text-center relative overflow-hidden transition-colors"
            >
              {/* Background ambient decor */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 dark:bg-red-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />

              {/* Title & Route Badge */}
              <div className="relative z-10 space-y-1 mb-5">
                <div className="inline-flex items-center gap-2 flex-wrap justify-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider border border-slate-800 dark:border-slate-700">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    {currentRoute?.name}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-black">
                    {currentRoute?.levelDisplay}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Elección de Pokémon Aleatorio
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  {isWeighted
                    ? 'Probabilidades basadas en el porcentaje oficial de aparición en esta ruta.'
                    : 'Modo equitativo: todos los Pokémon disponibles tienen exactamente la misma probabilidad.'}
                </p>
              </div>

              {/* Interactive Spinning Pokeball */}
              <div className="relative z-10 my-2">
                <PokeballSpinner isSpinning={isSpinning} size={140} />
              </div>

              {/* Real-time cycling reel during spin */}
              {isSpinning && (
                <div className="relative z-10 mt-4 w-full flex justify-center">
                  <EncounterWheel isSpinning={isSpinning} activeCandidate={activeCandidate} />
                </div>
              )}

              {/* Roll Action Button */}
              <div className="relative z-10 mt-5 w-full max-w-sm">
                <button
                  id="roll-pokemon-button"
                  type="button"
                  onClick={handleRoll}
                  disabled={isSpinning || availableEncounters.length === 0}
                  className={`w-full py-4 px-6 rounded-2xl font-black text-base uppercase tracking-wider shadow-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                    isSpinning
                      ? 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-not-allowed'
                      : availableEncounters.length === 0
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 active:scale-[0.98] text-white shadow-red-600/30'
                  }`}
                >
                  <Sparkles className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
                  {isSpinning
                    ? '¡Girando Ruleta...!'
                    : availableEncounters.length === 0
                    ? 'Sin Pokémon con estos filtros'
                    : '¡Elegir Pokémon Aleatorio!'}
                </button>
              </div>

              {/* Secondary quick filter pill if user wants to change filters without scrolling */}
              <div className="relative z-10 mt-3 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 py-1 px-3 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>{showFilters ? 'Ocultar filtros avanzados' : 'Ajustar clima y filtros'}</span>
                  <span className="text-[11px] opacity-70">({availableEncounters.length} disponibles)</span>
                </button>
              </div>

              {/* Warning if 0 encounters with filters */}
              {availableEncounters.length === 0 && (
                <div className="relative z-10 mt-4 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-4 py-2.5 rounded-2xl max-w-md">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <div className="text-left">
                    <span>No hay Pokémon con ese clima o método en {currentRoute?.name}.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedWeather('All');
                        setSelectedMethod('All');
                      }}
                      className="block mt-1 font-bold underline hover:no-underline"
                    >
                      Restablecer a &quot;Cualquier Clima y Método&quot;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Revealed Result Card: Visible immediately after spin */}
            {selectedEncounter && (
              <div className="flex justify-center pt-1">
                <EncounterResultCard
                  encounter={selectedEncounter}
                  routeName={currentRoute.name}
                  routeId={currentRoute.id}
                  onSave={handleSaveEncounter}
                />
              </div>
            )}

            {/* 5. Recent encounters registered in this specific route */}
            {history.filter((h) => h.routeId === currentRoute.id).length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <BookmarkCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Encuentros registrados previamente en {currentRoute.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline"
                  >
                    Ver bitácora completa ({history.length})
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {history
                    .filter((h) => h.routeId === currentRoute.id)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-2"
                      >
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {item.nickname ? `${item.nickname} (${item.cleanName})` : item.cleanName}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                          {item.status}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: SAVED HISTORY BITÁCORA */}
        {activeTab === 'history' && (
          <SavedHistoryView
            history={history}
            onUpdate={handleUpdateEncounter}
            onDelete={handleDeleteEncounter}
            onClearAll={handleClearHistory}
          />
        )}

        {/* VIEW 3: ROUTE ENCOUNTER DATABASE EXPLORER */}
        {activeTab === 'database' && (
          <RouteDatabaseView
            routes={allRoutes}
            history={history}
            onSelectRouteForRoll={(routeId) => {
              setSelectedRouteId(routeId);
              setActiveTab('roulette');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/90 dark:border-slate-800 py-6 text-center text-xs text-slate-400 dark:text-slate-500 transition-colors">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Ruleta Pokémon por Ruta • Datos de encuentros fieles a la base de conocimiento</p>
          <p className="flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400">
            <span>Diseñado para Nuzlockes y partidas temáticas</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
