import React, { useState, useEffect, useMemo, useRef } from 'react';
import { translateRouteName } from './data/routeTranslations';
import {
  getBuiltInTenants,
  loadCustomTenants,
  saveCustomTenants,
  getHistoryStorageKey,
  ACTIVE_TENANT_KEY,
} from './data/tenantRegistry';
import { RouteData, RouteEncounter, SavedEncounter, EncounterMethod, GameTenant, StarterChoice } from './types';
import { PokeballSpinner } from './components/PokeballSpinner';
import { EncounterWheel } from './components/EncounterWheel';
import { EncounterResultCard } from './components/EncounterResultCard';
import { QuickRouteBar } from './components/QuickRouteBar';
import { RouteFilters } from './components/RouteFilters';
import { SavedHistoryView } from './components/SavedHistoryView';
import { RouteDatabaseView } from './components/RouteDatabaseView';
import { StoryModeView } from './components/StoryModeView';
import { GameTenantModal } from './components/GameTenantModal';
import { GameTenantSelector } from './components/GameTenantSelector';
import { ManualPokemonPickerModal } from './components/ManualPokemonPickerModal';
import { sfx } from './utils/audio';
import { STARTERS_INFO, isStarterEncounter, starterEncounterUpdates } from './data/trainers/trainerTranslations';
import {
  cn,
  panel,
  panelLg,
  card,
  btn,
  iconBtn,
  pill,
  pillShape,
  text,
  surface,
  layout,
  segmented,
  focusRing,
  bottomNavItem,
  TONES,
} from './utils/ui';
import {
  Sparkles,
  Volume2,
  VolumeX,
  BookmarkCheck,
  Layers,
  Dice5,
  Info,
  Sun,
  Moon,
  SlidersHorizontal,
  ChevronDown,
  Hand,
  BookOpen,
  Heart,
  Skull,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const THEME_KEY = 'pokemon_tracker_theme_v1';
const STARTER_STORAGE_KEY = 'pokemon_starter_choice_v1';

export default function App() {
  // Multi-Tenancy State (Bases de datos de juegos y mods)
  const [customTenants, setCustomTenants] = useState<GameTenant[]>(() => loadCustomTenants());
  const allTenants = useMemo(() => {
    return [...getBuiltInTenants(), ...customTenants];
  }, [customTenants]);

  const [activeTenantId, setActiveTenantId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_TENANT_KEY);
      if (saved) return saved;
    } catch {}
    return 'blessed-shield';
  });

  const activeTenant = useMemo(() => {
    return allTenants.find((t) => t.id === activeTenantId) || allTenants[0];
  }, [allTenants, activeTenantId]);

  const allRoutes = useMemo(() => {
    return activeTenant?.routes || [];
  }, [activeTenant]);

  const [isTenantModalOpen, setIsTenantModalOpen] = useState<boolean>(false);
  const [isManualPickerOpen, setIsManualPickerOpen] = useState<boolean>(false);
  const [selectionMode, setSelectionMode] = useState<'random' | 'manual'>('random');
  const [lastManualSaveId, setLastManualSaveId] = useState<string | null>(null);

  // Active navigation tab (Modo Historia is the primary adventure view)
  const [activeTab, setActiveTab] = useState<'story' | 'roulette' | 'history' | 'database'>('story');

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
  const [selectedRouteId, setSelectedRouteId] = useState<string>(() => allRoutes[0]?.id || 'route-1');
  const [selectedWeather, setSelectedWeather] = useState<string>('All');
  const [selectedMethod, setSelectedMethod] = useState<EncounterMethod | 'All'>('All');
  const [isWeighted, setIsWeighted] = useState<boolean>(true);

  // Secondary filters drawer & progression controls
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showProgression, setShowProgression] = useState<boolean>(false);

  // Sound toggle
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Synchronize route when routes change (e.g. game tenant switched)
  useEffect(() => {
    if (!allRoutes.some((r) => r.id === selectedRouteId)) {
      setSelectedRouteId(allRoutes[0]?.id || '');
    }
  }, [allRoutes, selectedRouteId]);

  // Saved history isolated per tenant
  const [history, setHistory] = useState<SavedEncounter[]>(() => {
    try {
      const storageKey = getHistoryStorageKey(activeTenantId);
      const saved = localStorage.getItem(storageKey);
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

  // Starter choice state synchronized across Story Mode and Bitácora
  const [starterChoice, setStarterChoice] = useState<StarterChoice>(() => {
    try {
      const saved = localStorage.getItem(STARTER_STORAGE_KEY) as StarterChoice;
      if (saved === 'grookey' || saved === 'scorbunny' || saved === 'sobble') {
        return saved;
      }
    } catch {}
    return 'grookey';
  });

  const handleSelectStarter = (st: StarterChoice) => {
    setStarterChoice(st);
    try {
      localStorage.setItem(STARTER_STORAGE_KEY, st);
    } catch {}

    const updates = starterEncounterUpdates(st);
    setHistory((prev) =>
      prev.map((item) => (isStarterEncounter(item) ? { ...item, ...updates } : item))
    );
  };

  // When active tenant changes, reload that tenant's history
  useEffect(() => {
    try {
      const storageKey = getHistoryStorageKey(activeTenantId);
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: SavedEncounter[] = JSON.parse(saved);
        setHistory(
          parsed.map((item) => ({
            ...item,
            routeName: translateRouteName(item.routeName),
          }))
        );
      } else {
        setHistory([]);
      }
    } catch {
      setHistory([]);
    }
  }, [activeTenantId]);

  // Save history updates to LocalStorage under current tenant key
  useEffect(() => {
    try {
      const storageKey = getHistoryStorageKey(activeTenantId);
      localStorage.setItem(storageKey, JSON.stringify(history));
    } catch {
      // Storage full or quota exceeded
    }
  }, [history, activeTenantId]);

  // Tenant management handlers
  const handleSelectTenant = (tenantId: string) => {
    setActiveTenantId(tenantId);
    try {
      localStorage.setItem(ACTIVE_TENANT_KEY, tenantId);
    } catch {}
    setSelectedEncounter(null);
    setActiveCandidate(null);
    setLastManualSaveId(null);
  };

  const handleAddCustomTenant = (newTenant: GameTenant) => {
    const updated = [...customTenants.filter((t) => t.id !== newTenant.id), newTenant];
    setCustomTenants(updated);
    saveCustomTenants(updated);
    handleSelectTenant(newTenant.id);
  };

  const handleDeleteCustomTenant = (tenantId: string) => {
    const updated = customTenants.filter((t) => t.id !== tenantId);
    setCustomTenants(updated);
    saveCustomTenants(updated);
    if (activeTenantId === tenantId) {
      handleSelectTenant('blessed-shield');
    }
  };

  // Current active route object
  const currentRoute = useMemo(() => {
    return allRoutes.find((r) => r.id === selectedRouteId) || allRoutes[0];
  }, [allRoutes, selectedRouteId]);

  // Available encounters given current filters
  const availableEncounters = useMemo(() => {
    if (!currentRoute) return [];
    return currentRoute.encounters.filter((enc) => {
      const matchesWeather = selectedWeather === 'All' || enc.weather === selectedWeather;
      const matchesMethod =
        selectedMethod === 'All' ||
        enc.method === selectedMethod ||
        (enc.methods && enc.methods.includes(selectedMethod as any));
      return matchesWeather && matchesMethod;
    });
  }, [currentRoute, selectedWeather, selectedMethod]);

  // Roulette rolling state
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [activeCandidate, setActiveCandidate] = useState<string | null>(null);
  const [selectedEncounter, setSelectedEncounter] = useState<RouteEncounter | null>(null);
  const spinIntervalRef = useRef<number | null>(null);

  // Reset weather, method, spinning and previous selection when route changes
  useEffect(() => {
    if (spinIntervalRef.current) {
      clearInterval(spinIntervalRef.current);
      spinIntervalRef.current = null;
    }
    setIsSpinning(false);
    setSelectedWeather('All');
    setSelectedMethod('All');
    setSelectedEncounter(null);
    setActiveCandidate(null);
    setLastManualSaveId(null);
  }, [selectedRouteId]);

  // Toggle sound
  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sfx.enabled = nextState;
  };

  // Run the random selection
  const handleRoll = () => {
    if (availableEncounters.length === 0 || isSpinning) return;

    setSelectionMode('random');
    setIsSpinning(true);
    setSelectedEncounter(null);
    setLastManualSaveId(null);

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

  // Choose Pokémon by hand ("a dedo") and persist it as the route encounter
  const handleSelectManualPokemon = (chosen: RouteEncounter) => {
    if (isSpinning || !currentRoute) return;
    setSelectionMode('manual');
    setSelectedEncounter(chosen);
    setActiveCandidate(chosen.pokemon);

    const newSaved: SavedEncounter = {
      id: `enc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      routeId: currentRoute.id,
      routeName: currentRoute.name,
      pokemon: chosen.pokemon,
      cleanName: chosen.cleanName,
      formLabel: chosen.formLabel,
      method: chosen.method || 'Visible',
      weather: chosen.weather || selectedWeather,
      levelRange: chosen.levelRange,
      chance: chosen.chance,
      status: 'Capturado',
      notes: 'Elegido a dedo',
      isShiny: false,
    };
    handleSaveEncounter(newSaved);
    setLastManualSaveId(newSaved.id);

    sfx.playReveal();
    sfx.playCatch();
    confetti({
      particleCount: 60,
      spread: 65,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#ef4444', '#10b981'],
    });

    // Auto-scroll to the updated story card or the roulette result card
    const routeId = currentRoute.id;
    const tab = activeTab;
    setTimeout(() => {
      const targetId =
        tab === 'story' ? `story-route-${routeId}` : 'encounter-result-card';
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 120);
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

  const handleClearHistory = () => {
    setHistory([]);
    try {
      const storageKey = getHistoryStorageKey(activeTenantId);
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore
    }
  };

  const lockeStats = useMemo(() => {
    const alive = history.filter(
      (h) => h.status === 'En Equipo' || h.status === 'Capturado' || h.status === 'En Caja'
    ).length;
    const fainted = history.filter((h) => h.status === 'Debilitado').length;
    const uniqueRoutes = new Set(history.map((h) => h.routeId)).size;
    const totalRoutes = allRoutes.length || 1;
    const percentage = Math.round((uniqueRoutes / totalRoutes) * 1000) / 10;
    return { alive, fainted, percentage };
  }, [history, allRoutes.length]);

  const navBtn = (tab: typeof activeTab, label: string, icon: React.ReactNode) => {
    const active = activeTab === tab;
    return (
      <button
        type="button"
        onClick={() => setActiveTab(tab)}
        title={label}
        className={segmented.item(active)}
      >
        {icon}
        <span className="hidden lg:inline">{label}</span>
      </button>
    );
  };

  return (
    <div className={cn('min-h-screen flex flex-col font-sans antialiased selection:bg-brand-accent selection:text-white transition-colors duration-200', surface.page)}>
      <header className={cn('sticky top-0 z-50 w-full overflow-x-hidden', surface.header)}>
        <div className={cn(layout.container, 'h-14 flex items-center gap-2 sm:gap-3')}>
          <div className="flex items-center gap-2.5 shrink-0 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-brand-accent flex items-center justify-center shrink-0 shadow-sm shadow-brand-accent/30">
              <span className="w-3 h-3 rounded-full border-2 border-white bg-brand-bg block" />
            </div>
            <div className="hidden sm:flex flex-col min-w-0">
              <span className={cn(text.subtitle, 'uppercase leading-tight truncate')}>
                Nuzlocke Tracker
              </span>
              <span className={cn(text.meta, 'font-medium leading-none truncate')}>
                {activeTenant.shortName || activeTenant.name} · {activeTenant.region}
              </span>
            </div>
          </div>

          <div className="hidden lg:flex flex-1 justify-center min-w-0">
            <nav className={segmented.group}>
              {navBtn('story', 'Historia', <BookOpen className={cn('w-3.5 h-3.5', activeTab === 'story' && 'text-brand-accent')} />)}
              {navBtn('roulette', 'Ruleta', <Dice5 className="w-3.5 h-3.5" />)}
              {navBtn('history', 'Bitácora', <BookmarkCheck className="w-3.5 h-3.5" />)}
              {navBtn('database', 'Datos', <Layers className="w-3.5 h-3.5" />)}
            </nav>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            {activeTenant.id === 'blessed-shield' && (
              <div className={cn(segmented.group, 'max-lg:hidden')}>
                {(['grookey', 'scorbunny', 'sobble'] as StarterChoice[]).map((st) => {
                  const isSel = starterChoice === st;
                  const typeClass =
                    st === 'grookey'
                      ? 'bg-pokemon-planta'
                      : st === 'scorbunny'
                        ? 'bg-pokemon-fuego'
                        : 'bg-pokemon-agua';
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleSelectStarter(st)}
                      title={`Inicial: ${STARTERS_INFO[st].name}`}
                      aria-label={`Elegir a ${STARTERS_INFO[st].name} como inicial`}
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-150',
                        focusRing,
                        isSel ? cn(typeClass, 'shadow-xs') : 'hover:bg-brand-card/60'
                      )}
                    >
                      <img
                        src={STARTERS_INFO[st].sprite}
                        alt=""
                        className={cn('w-9 h-9 pointer-events-none object-contain', !isSel && 'opacity-50 grayscale')}
                      />
                    </button>
                  );
                })}
              </div>
            )}

            <div className={cn(segmented.group, 'gap-1.5 px-2 py-1 tabular-nums')}>
              <span className={cn('flex items-center gap-0.5 text-xs font-semibold', TONES.success.ink)} title="Pokémon vivos / en caja">
                <Heart className="w-3 h-3" />
                {lockeStats.alive}
              </span>
              <span className="text-brand-border">·</span>
              <span className={cn('flex items-center gap-0.5 text-xs font-semibold', TONES.danger.ink)} title="Bajas registradas">
                <Skull className="w-3 h-3" />
                {lockeStats.fainted}
              </span>
              <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-brand-txt1" title="Progreso de rutas">
                <span className="text-brand-border">·</span>
                {lockeStats.percentage}%
              </span>
            </div>

            <GameTenantSelector
              activeTenant={activeTenant}
              onClick={() => setIsTenantModalOpen(true)}
            />

            <button
              id="theme-toggle-button"
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={iconBtn('secondary', 'sm')}
              title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              aria-label={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDarkMode ? <Sun className={cn('w-4 h-4', TONES.warning.ink)} /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              id="sound-toggle-button"
              type="button"
              onClick={handleToggleSound}
              className={soundEnabled ? iconBtn('secondary', 'sm') : iconBtn('soft', 'sm', 'danger')}
              title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
              aria-label={soundEnabled ? 'Silenciar' : 'Sonido activado'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

      </header>


      {/* Main Content Area */}
      <main className={cn('flex-1 pt-6 pb-24 lg:py-6 space-y-6', layout.container)}>
        {/* VIEW 0: MODO HISTORIA (UNIFIED CHRONOLOGICAL TIMELINE) */}
        {activeTab === 'story' && (
          <StoryModeView
            activeTenant={activeTenant}
            history={history}
            isWeighted={isWeighted}
            soundEnabled={soundEnabled}
            onSaveEncounter={handleSaveEncounter}
            onUpdateStatus={(id, status) => handleUpdateEncounter(id, { status })}
            onDeleteEncounter={handleDeleteEncounter}
            onOpenManualPicker={(route, weather) => {
              setSelectedRouteId(route.id);
              setSelectedWeather(weather);
              setIsManualPickerOpen(true);
            }}
            onOpenTenantModal={() => setIsTenantModalOpen(true)}
            starterChoice={starterChoice}
            onSelectStarter={handleSelectStarter}
          />
        )}

        {/* VIEW 1: ROULETTE / ENCOUNTER GENERATOR */}
        {activeTab === 'roulette' && (
          <div className={layout.view}>
            {/* 1. Sleek Route Bar: Minimal single-row navigation */}
            <QuickRouteBar
              routes={allRoutes}
              selectedRouteId={selectedRouteId}
              onRouteChange={setSelectedRouteId}
              history={history}
            />

            {/* 2. PRIMARY HERO: The Interactive Pokemon Selection Stage */}
            <div
              id="roulette-interactive-stage"
              className={panelLg('flex flex-col items-center justify-center text-center relative overflow-hidden')}
            >
              <div className="absolute -right-10 -top-10 w-44 h-44 bg-brand-accent/15 rounded-full blur-3xl pointer-events-none" />

              {/* Title & Description (without duplicate route name/level badges) */}
              <div className="relative z-10 space-y-1 mb-4 text-center">
                <h2 className={text.pageTitle}>
                  Elección de Pokémon Aleatorio
                </h2>
                <p className={cn(text.muted, 'max-w-md mx-auto')}>
                  {isWeighted
                    ? 'Probabilidades basadas en el porcentaje oficial de aparición en esta ruta'
                    : 'Modo equitativo: todos los Pokémon disponibles tienen exactamente la misma probabilidad'}
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

              {/* Roll Action Button & Manual Pick ("A Dedo") */}
              <div className="relative z-10 mt-5 w-full max-w-md flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  id="roll-pokemon-button"
                  type="button"
                  onClick={handleRoll}
                  disabled={isSpinning || availableEncounters.length === 0}
                  className={btn('primary', 'lg', 'accent', 'w-full sm:flex-1')}
                >
                  <Sparkles className={cn('w-5 h-5', isSpinning && 'animate-spin')} />
                  <span>
                    {isSpinning
                      ? '¡Girando Ruleta...!'
                      : availableEncounters.length === 0
                      ? 'Sin Pokémon disponibles'
                      : 'Girar Ruleta'}
                  </span>
                </button>

                <button
                  id="manual-pick-pokemon-button"
                  type="button"
                  onClick={() => setIsManualPickerOpen(true)}
                  disabled={isSpinning || currentRoute.encounters.length === 0}
                  title="Elegir manualmente a dedo un Pokémon de esta ruta"
                  className={btn('soft', 'lg', 'warning', 'w-full sm:w-auto')}
                >
                  <Hand className="w-5 h-5" />
                  <span>Elegir a Dedo</span>
                </button>
              </div>

              {/* Filter Carousel Toggle Button - Clear, solid, high-contrast (hover text always visible) */}
              <div className="relative z-10 mt-4 flex items-center justify-center">
                <button
                  id="toggle-filters-stage-button"
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={btn(showFilters ? 'primary' : 'soft', 'md', 'accent')}
                >
                  <SlidersHorizontal className="w-4 h-4 shrink-0" />
                  <span>
                    {showFilters ? 'Ocultar Carrusel de Filtros' : 'Filtros y Condiciones de Ruta'}
                  </span>
                  <span className={pill('neutral', 'xs')}>
                    {availableEncounters.length}
                  </span>
                  <ChevronDown
                    className={cn('w-4 h-4 shrink-0 transition-transform duration-200', showFilters && 'rotate-180')}
                  />
                </button>
              </div>

              {/* Warning if 0 encounters with filters */}
              {availableEncounters.length === 0 && (
                <div
                  className={card({
                    tone: 'warning',
                    padding: 'compact',
                    extra: 'relative z-10 mt-4 flex items-center gap-2 text-xs max-w-md',
                  })}
                >
                  <Info className="w-4 h-4 shrink-0" />
                  <div className="text-left">
                    <span>No hay Pokémon con ese clima o método en {currentRoute?.name}.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedWeather('All');
                        setSelectedMethod('All');
                      }}
                      className={cn(text.link, 'block mt-1')}
                    >
                      Restablecer a &quot;Cualquier Clima y Método&quot;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Filter Carousel: Opens directly below the election stage */}
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
                selectedRouteId={selectedRouteId}
                onRouteChange={setSelectedRouteId}
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
              />
            )}

            {/* 4. Revealed Result Card: Visible immediately after spin or manual pick */}
            {selectedEncounter && (
              <div className="flex justify-center pt-1">
                <EncounterResultCard
                  key={`${currentRoute.id}-${selectedEncounter.pokemon}-${selectedEncounter.method}-${selectedEncounter.weather}-${selectedEncounter.levelRange}-${selectionMode}`}
                  encounter={selectedEncounter}
                  routeName={currentRoute.name}
                  routeId={currentRoute.id}
                  onSave={handleSaveEncounter}
                  onUpdate={handleUpdateEncounter}
                  existingSavedId={lastManualSaveId ?? undefined}
                  isAlreadySaved={Boolean(lastManualSaveId)}
                  selectionMode={selectionMode}
                />
              </div>
            )}

            {/* 5. Recent encounters registered in this specific route */}
            {history.filter((h) => h.routeId === currentRoute.id).length > 0 && (
              <div className={panel('space-y-3')}>
                <div className="flex items-center justify-between">
                  <h3 className={cn(text.label, 'flex items-center gap-1.5')}>
                    <BookmarkCheck className={cn('w-4 h-4', TONES.success.ink)} />
                    Encuentros registrados previamente en {currentRoute.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    className={cn(text.link, 'text-xs')}
                  >
                    Ver bitácora completa ({history.length})
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {history
                    .filter((h) => h.routeId === currentRoute.id)
                    .map((item) => (
                      <div key={item.id} className={pill('neutral', 'md', 'gap-2')}>
                        <span className="text-brand-txt1">
                          {item.nickname ? `${item.nickname} (${item.cleanName})` : item.cleanName}
                        </span>
                        <span className={pillShape('xs', 'bg-brand-card border-brand-border text-brand-txt2')}>
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
            onSaveEncounter={handleSaveEncounter}
            activeTenant={activeTenant}
            onOpenTenantModal={() => setIsTenantModalOpen(true)}
            starterChoice={starterChoice}
            onSelectStarter={handleSelectStarter}
          />
        )}

        {/* VIEW 3: ROUTE ENCOUNTER DATABASE EXPLORER */}
        {activeTab === 'database' && (
          <RouteDatabaseView
            routes={allRoutes}
            history={history}
            activeTenant={activeTenant}
            onOpenTenantModal={() => setIsTenantModalOpen(true)}
            onSelectRouteForRoll={(routeId) => {
              setSelectedRouteId(routeId);
              setActiveTab('roulette');
            }}
          />
        )}
      </main>

      {/* Multi-Tenancy Game Selector & Management Modal */}
      <GameTenantModal
        isOpen={isTenantModalOpen}
        onClose={() => setIsTenantModalOpen(false)}
        tenants={allTenants}
        activeTenantId={activeTenantId}
        onSelectTenant={handleSelectTenant}
        onAddCustomTenant={handleAddCustomTenant}
        onDeleteCustomTenant={handleDeleteCustomTenant}
        history={history}
      />

      {/* Manual Pokemon Picker Modal ("Elegir a dedo") */}
      {currentRoute && (
        <ManualPokemonPickerModal
          isOpen={isManualPickerOpen}
          onClose={() => setIsManualPickerOpen(false)}
          currentRoute={currentRoute}
          availableEncounters={availableEncounters}
          history={history}
          onSelectPokemon={handleSelectManualPokemon}
        />
      )}

      <nav className={surface.bottomNav} aria-label="Navegación principal">
        <button type="button" onClick={() => setActiveTab('story')} className={bottomNavItem(activeTab === 'story')}>
          <BookOpen className="w-5 h-5" />
          Historia
        </button>
        <button type="button" onClick={() => setActiveTab('roulette')} className={bottomNavItem(activeTab === 'roulette')}>
          <Dice5 className="w-5 h-5" />
          Ruleta
        </button>
        <button type="button" onClick={() => setActiveTab('history')} className={bottomNavItem(activeTab === 'history')}>
          <BookmarkCheck className="w-5 h-5" />
          Bitácora
        </button>
        <button type="button" onClick={() => setActiveTab('database')} className={bottomNavItem(activeTab === 'database')}>
          <Layers className="w-5 h-5" />
          Datos
        </button>
      </nav>

      {/* Footer */}
      <footer className={cn('w-full py-6 mt-8 mb-16 lg:mb-0', surface.footer)}>
        <div className={cn(layout.container, 'flex flex-col md:flex-row items-center justify-between gap-4', text.muted)}>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="font-bold text-brand-txt1 uppercase">Nuzlocke Tracker Core</span>
            <span className="text-brand-border">•</span>
            <span>Reglas Hardcore Activas</span>
            <span className="text-brand-border">•</span>
            <span className="text-status-live font-medium">Dupes Clause ON</span>
          </div>
          <span>Desarrollado para {activeTenant.name} · {activeTenant.region}</span>
        </div>
      </footer>
    </div>
  );
}
