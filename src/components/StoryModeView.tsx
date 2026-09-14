import React, { useState, useMemo, useEffect } from 'react';
import {
  GameTenant,
  RouteData,
  SavedEncounter,
  StarterChoice,
  TrainerBattle,
} from '../types';
import {
  buildStoryTimeline,
  StoryTimelineItem,
  STORY_CHAPTERS,
  StoryChapter,
} from '../data/storyTimeline';
import { BLESSED_SHIELD_TRAINER_BATTLES } from '../data/trainers/blessedShieldTrainers';
import { STARTERS_INFO } from '../data/trainers/trainerTranslations';
import { StoryRouteCard } from './StoryRouteCard';
import { TrainerBattleCard } from './TrainerBattleCard';
import {
  Compass,
  Search,
  CheckCircle2,
  Clock,
  Swords,
  Dice5,
  Sparkles,
  Flame,
  Leaf,
  Droplets,
  Layers,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Filter,
  Trophy,
  Award,
  Zap,
  RotateCcw,
  Target,
  LayoutList,
  Columns,
  ListFilter,
  Check,
  MapPin,
  ArrowRight,
} from 'lucide-react';

const DEFEATED_STORAGE_KEY = 'pokemon_defeated_trainers_v1';
const STARTER_STORAGE_KEY = 'pokemon_starter_choice_v1';
const COLLAPSED_CHAPTERS_KEY = 'pokemon_collapsed_chapters_v1';
const VIEW_SCOPE_KEY = 'pokemon_story_view_scope_v1';
const COMPACT_MODE_KEY = 'pokemon_story_compact_mode_v1';

interface StoryModeViewProps {
  activeTenant: GameTenant;
  history: SavedEncounter[];
  isWeighted: boolean;
  soundEnabled: boolean;
  onSaveEncounter: (encounter: SavedEncounter) => void;
  onUpdateStatus: (id: string, status: SavedEncounter['status']) => void;
  onDeleteEncounter: (id: string) => void;
  onOpenManualPicker: (route: RouteData, weather: string) => void;
  onOpenTenantModal: () => void;
  starterChoice?: StarterChoice;
  onSelectStarter?: (starter: StarterChoice) => void;
}

export const StoryModeView: React.FC<StoryModeViewProps> = ({
  activeTenant,
  history,
  isWeighted,
  soundEnabled,
  onSaveEncounter,
  onUpdateStatus,
  onDeleteEncounter,
  onOpenManualPicker,
  onOpenTenantModal,
  starterChoice: propStarterChoice,
  onSelectStarter: onSelectStarterProp,
}) => {
  // Starter choice state
  const [internalStarterChoice, setInternalStarterChoice] = useState<StarterChoice>(() => {
    try {
      const saved = localStorage.getItem(STARTER_STORAGE_KEY) as StarterChoice;
      if (saved === 'grookey' || saved === 'scorbunny' || saved === 'sobble') {
        return saved;
      }
    } catch {}
    return 'grookey';
  });

  const starterChoice = propStarterChoice || internalStarterChoice;

  const handleSelectStarter = (st: StarterChoice) => {
    if (onSelectStarterProp) {
      onSelectStarterProp(st);
    } else {
      setInternalStarterChoice(st);
    }
    try {
      localStorage.setItem(STARTER_STORAGE_KEY, st);
    } catch {}
  };

  // Defeated trainer battles set
  const [defeatedBattles, setDefeatedBattles] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(DEFEATED_STORAGE_KEY);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {}
    return new Set<string>();
  });

  // Collapsed chapters state (for "Toda la Región" view)
  const [collapsedChapters, setCollapsedChapters] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(COLLAPSED_CHAPTERS_KEY);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {}
    return new Set<string>();
  });

  // View Scope: 'chapter' (focused, clean) vs 'all' (entire region timeline)
  const [viewScope, setViewScope] = useState<'chapter' | 'all'>(() => {
    try {
      const saved = localStorage.getItem(VIEW_SCOPE_KEY);
      if (saved === 'chapter' || saved === 'all') return saved;
    } catch {}
    return 'chapter'; // Defaults to clean, uncluttered chapter mode!
  });

  const handleSetViewScope = (scope: 'chapter' | 'all') => {
    setViewScope(scope);
    try {
      localStorage.setItem(VIEW_SCOPE_KEY, scope);
    } catch {}
  };

  // Compact Mode Toggle: reduces height of cards by ~70%
  const [isCompact, setIsCompact] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COMPACT_MODE_KEY) === 'true';
    } catch {}
    return false;
  });

  const handleToggleCompact = () => {
    setIsCompact((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COMPACT_MODE_KEY, String(next));
      } catch {}
      return next;
    });
  };

  const handleToggleChapter = (chapterId: string) => {
    setCollapsedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      try {
        localStorage.setItem(COLLAPSED_CHAPTERS_KEY, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  const handleCollapseAllChapters = () => {
    const allIds = new Set(Object.values(STORY_CHAPTERS).map((c) => c.id));
    setCollapsedChapters(allIds);
    try {
      localStorage.setItem(COLLAPSED_CHAPTERS_KEY, JSON.stringify(Array.from(allIds)));
    } catch {}
  };

  const handleExpandAllChapters = () => {
    const empty = new Set<string>();
    setCollapsedChapters(empty);
    try {
      localStorage.setItem(COLLAPSED_CHAPTERS_KEY, JSON.stringify([]));
    } catch {}
  };

  const handleToggleDefeated = (battleId: string) => {
    setDefeatedBattles((prev) => {
      const next = new Set(prev);
      if (next.has(battleId)) {
        next.delete(battleId);
      } else {
        next.add(battleId);
      }
      try {
        localStorage.setItem(DEFEATED_STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  // Build the complete timeline for current tenant
  const fullTimeline = useMemo(() => {
    return buildStoryTimeline(activeTenant, BLESSED_SHIELD_TRAINER_BATTLES);
  }, [activeTenant]);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'capture' | 'battle' | 'pending' | 'completed'>('all');

  // History route IDs set for fast check
  const caughtRouteIds = useMemo(() => {
    const set = new Set<string>();
    history.forEach((h) => {
      set.add(h.routeId);
      set.add(h.routeName.toLowerCase());
    });
    return set;
  }, [history]);

  // Next pending milestone in chronological order (First uncompleted route or battle)
  const nextActiveItem = useMemo(() => {
    return fullTimeline.find((item) => {
      if (item.type === 'capture' && item.routeData) {
        return (
          !caughtRouteIds.has(item.routeData.id) &&
          !caughtRouteIds.has(item.routeData.name.toLowerCase())
        );
      }
      if (item.type === 'battle' && item.battleData) {
        return !defeatedBattles.has(item.battleData.id);
      }
      return false;
    });
  }, [fullTimeline, caughtRouteIds, defeatedBattles]);

  // The chapter that currently contains the active pending step
  const defaultActiveChapterId = useMemo(() => {
    if (nextActiveItem) {
      return nextActiveItem.chapter.id;
    }
    return fullTimeline[0]?.chapter.id || 'prologue';
  }, [nextActiveItem, fullTimeline]);

  // Selected Chapter in 'chapter' view mode
  const [selectedChapterId, setSelectedChapterId] = useState<string>('auto');

  // Currently active chapter ID
  const effectiveChapterId = selectedChapterId === 'auto' ? defaultActiveChapterId : selectedChapterId;

  // Ordered list of all chapters with completion statistics
  const chaptersList = useMemo(() => {
    const chaptersOrder = Object.values(STORY_CHAPTERS).sort((a, b) => a.order - b.order);
    return chaptersOrder.map((ch) => {
      const itemsInChapter = fullTimeline.filter((it) => it.chapter.id === ch.id);
      const totalCount = itemsInChapter.length;
      let completedCount = 0;

      itemsInChapter.forEach((it) => {
        if (it.type === 'capture' && it.routeData) {
          if (caughtRouteIds.has(it.routeData.id) || caughtRouteIds.has(it.routeData.name.toLowerCase())) {
            completedCount++;
          }
        } else if (it.type === 'battle' && it.battleData) {
          if (defeatedBattles.has(it.battleData.id)) {
            completedCount++;
          }
        }
      });

      const isCompleted = totalCount > 0 && completedCount === totalCount;
      const isCurrent = ch.id === defaultActiveChapterId;

      return {
        ...ch,
        totalCount,
        completedCount,
        isCompleted,
        isCurrent,
      };
    });
  }, [fullTimeline, caughtRouteIds, defeatedBattles, defaultActiveChapterId]);

  // Overall Adventure Progress calculation
  const progressStats = useMemo(() => {
    const totalItems = fullTimeline.length;
    let completedCount = 0;
    let totalCaptures = 0;
    let completedCaptures = 0;
    let totalBattles = 0;
    let completedBattles = 0;

    fullTimeline.forEach((item) => {
      if (item.type === 'capture') {
        totalCaptures++;
        if (item.routeData && (caughtRouteIds.has(item.routeData.id) || caughtRouteIds.has(item.routeData.name.toLowerCase()))) {
          completedCaptures++;
          completedCount++;
        }
      } else if (item.type === 'battle') {
        totalBattles++;
        if (item.battleData && defeatedBattles.has(item.battleData.id)) {
          completedBattles++;
          completedCount++;
        }
      }
    });

    const percentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

    return {
      totalItems,
      completedCount,
      totalCaptures,
      completedCaptures,
      totalBattles,
      completedBattles,
      percentage,
    };
  }, [fullTimeline, caughtRouteIds, defeatedBattles]);

  // Filter timeline items
  const filteredTimeline = useMemo(() => {
    return fullTimeline.filter((item) => {
      const isRouteCaught =
        item.routeData &&
        (caughtRouteIds.has(item.routeData.id) || caughtRouteIds.has(item.routeData.name.toLowerCase()));
      const isBattleWon = item.battleData && defeatedBattles.has(item.battleData.id);

      // Filter by type
      if (filterType === 'capture' && item.type !== 'capture') return false;
      if (filterType === 'battle' && item.type !== 'battle') return false;
      if (filterType === 'completed') {
        if (item.type === 'capture' && !isRouteCaught) return false;
        if (item.type === 'battle' && !isBattleWon) return false;
      }
      if (filterType === 'pending') {
        if (item.type === 'capture' && isRouteCaught) return false;
        if (item.type === 'battle' && isBattleWon) return false;
      }

      // Filter by Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSubtitle = item.subtitle.toLowerCase().includes(q);
        const matchesLocation =
          item.location.toLowerCase().includes(q) ||
          (item.locationEnglish || '').toLowerCase().includes(q);

        let matchesDetails = false;
        if (item.type === 'capture' && item.routeData) {
          matchesDetails = item.routeData.encounters.some(
            (e) => e.pokemon.toLowerCase().includes(q) || e.cleanName.toLowerCase().includes(q)
          );
        } else if (item.type === 'battle' && item.battleData) {
          const b = item.battleData;
          const team = b.starterVariants
            ? b.starterVariants[starterChoice] || []
            : b.fixedTeam || [];
          matchesDetails =
            b.trainerName.toLowerCase().includes(q) ||
            team.some(
              (p) =>
                p.name.toLowerCase().includes(q) ||
                p.ability.toLowerCase().includes(q) ||
                (p.item || '').toLowerCase().includes(q) ||
                p.moves.some((m) => m.toLowerCase().includes(q))
            );
        }

        return matchesTitle || matchesSubtitle || matchesLocation || matchesDetails;
      }

      return true;
    });
  }, [fullTimeline, filterType, searchQuery, caughtRouteIds, defeatedBattles, starterChoice]);

  // Group timeline by chapters
  const chaptersMap = useMemo(() => {
    const map = new Map<string, { chapter: StoryTimelineItem['chapter']; items: StoryTimelineItem[] }>();
    filteredTimeline.forEach((item) => {
      const chKey = item.chapter.id;
      if (!map.has(chKey)) {
        map.set(chKey, { chapter: item.chapter, items: [] });
      }
      map.get(chKey)!.items.push(item);
    });
    return Array.from(map.values());
  }, [filteredTimeline]);

  // Items for the currently selected chapter in single-chapter view mode
  const currentChapterData = useMemo(() => {
    const chMeta = chaptersList.find((c) => c.id === effectiveChapterId) || chaptersList[0];
    const items = filteredTimeline.filter((item) => item.chapter.id === chMeta.id);
    const currentIndex = chaptersList.findIndex((c) => c.id === chMeta.id);
    const prevChapter = currentIndex > 0 ? chaptersList[currentIndex - 1] : null;
    const nextChapter = currentIndex < chaptersList.length - 1 ? chaptersList[currentIndex + 1] : null;

    return {
      chapter: chMeta,
      items,
      prevChapter,
      nextChapter,
      currentIndex,
    };
  }, [chaptersList, effectiveChapterId, filteredTimeline]);

  // Quick jump to chapter or item
  const handleScrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Jump to next pending milestone
  const handleJumpToNextActive = () => {
    if (!nextActiveItem) return;
    if (viewScope === 'chapter') {
      setSelectedChapterId(nextActiveItem.chapter.id);
    }
    setTimeout(() => {
      const targetId =
        nextActiveItem.type === 'capture'
          ? `story-route-${nextActiveItem.routeData?.id}`
          : `trainer-battle-${nextActiveItem.battleData?.id}`;
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
  };

  // If user is actively typing a search query, temporarily view all chapters
  const effectiveViewScope = searchQuery.trim().length > 0 ? 'all' : viewScope;

  return (
    <div className="space-y-4">
      {/* 1. COMPACT UNIFIED CONTROL HEADER */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        {/* Top Row: Title, Game Tenant & Compact Starter Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-2xs">
                Modo Historia
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {activeTenant.name}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Cronología de la Aventura
            </h1>
          </div>

          {/* Compact Starter Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 self-start md:self-center">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 px-2 hidden sm:inline">
              Inicial:
            </span>
            {(['grookey', 'scorbunny', 'sobble'] as StarterChoice[]).map((st) => {
              const isSel = starterChoice === st;
              const meta = STARTERS_INFO[st];
              const activeClass =
                st === 'grookey'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : st === 'scorbunny'
                  ? 'bg-orange-600 text-white shadow-2xs'
                  : 'bg-blue-600 text-white shadow-2xs';

              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleSelectStarter(st)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSel
                      ? activeClass
                      : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700/70'
                  }`}
                  title={`Inicial: ${meta.name} (Paúl llevará a ${meta.hopStarterName})`}
                >
                  {st === 'grookey' && <Leaf className="w-3.5 h-3.5" />}
                  {st === 'scorbunny' && <Flame className="w-3.5 h-3.5" />}
                  {st === 'sobble' && <Droplets className="w-3.5 h-3.5" />}
                  <span>{meta.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Middle Row: Progress bar & Quick Stats */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-3 font-bold text-slate-700 dark:text-slate-300 flex-wrap">
              <span className="text-indigo-600 dark:text-indigo-400 font-black text-sm">
                {progressStats.percentage}% Completado
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="flex items-center gap-1">
                <Dice5 className="w-3.5 h-3.5 text-emerald-500" />
                {progressStats.completedCaptures} / {progressStats.totalCaptures} Rutas
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="flex items-center gap-1">
                <Swords className="w-3.5 h-3.5 text-red-500" />
                {progressStats.completedBattles} / {progressStats.totalBattles} Combates
              </span>
            </div>

            {/* Jump to active milestone button */}
            {nextActiveItem && (
              <button
                type="button"
                onClick={handleJumpToNextActive}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all self-start sm:self-center"
              >
                <Target className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                <span>Ir al Próximo Desafío</span>
              </button>
            )}
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 via-indigo-500 to-amber-500 h-full transition-all duration-500 ease-out"
              style={{ width: `${progressStats.percentage}%` }}
            />
          </div>
        </div>
      </section>

      {/* 2. SPOTLIGHT: NEXT RECOMMENDED MILESTONE CARD */}
      {nextActiveItem ? (
        <section className="bg-gradient-to-r from-indigo-500/10 via-amber-500/5 to-rose-500/10 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 rounded-3xl p-3.5 sm:p-4 border border-indigo-200 dark:border-indigo-900/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-2xs flex-shrink-0">
              {nextActiveItem.type === 'capture' ? (
                <Dice5 className="w-5 h-5" />
              ) : (
                <Swords className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                  Próximo Hito
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {nextActiveItem.chapter.title.split(':')[0]}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">
                {nextActiveItem.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                {nextActiveItem.type === 'capture'
                  ? `Captura pendiente en ${nextActiveItem.location} (${nextActiveItem.minLevel ? `Nv. ${nextActiveItem.minLevel}-${nextActiveItem.maxLevel}` : 'Nivel variable'})`
                  : `Combate pendiente contra ${nextActiveItem.battleData?.trainerName} en ${nextActiveItem.location}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
            <button
              type="button"
              onClick={handleJumpToNextActive}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-2xs flex items-center gap-1.5 transition-all"
            >
              <span>Ver Hito</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      ) : (
        <section className="bg-emerald-50/60 dark:bg-emerald-950/20 rounded-3xl p-4 border border-emerald-200 dark:border-emerald-800/80 text-center space-y-1">
          <div className="text-emerald-800 dark:text-emerald-300 font-black text-sm flex items-center justify-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>¡Enhorabuena! Has completado todos los hitos y combates de la aventura</span>
          </div>
        </section>
      )}

      {/* 3. TOOLBAR: VIEW MODES, DENSITY TOGGLE, SEARCH & FILTERS */}
      <section className="space-y-3">
        {/* Row A: View Mode Selector (Por Capítulos vs Toda la Región) & Density Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* View Scope Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold self-start">
            <button
              type="button"
              onClick={() => handleSetViewScope('chapter')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                effectiveViewScope === 'chapter'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Por Etapas (Recomendado)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetViewScope('all')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                effectiveViewScope === 'all'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Toda la Región</span>
            </button>
          </div>

          {/* Right: Density Toggle & Expand/Collapse when in 'all' */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Compact vs Detailed view toggle */}
            <button
              type="button"
              onClick={handleToggleCompact}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                isCompact
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
                  : 'bg-white text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
              }`}
              title="Alternar entre modo compacto y detallado para reducir o ampliar la información"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>{isCompact ? 'Vista Compacta Activa' : 'Vista Detallada'}</span>
            </button>

            {effectiveViewScope === 'all' && (
              <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                <button
                  type="button"
                  onClick={handleCollapseAllChapters}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1 shadow-2xs"
                  title="Plegar todas las etapas"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Plegar</span>
                </button>
                <button
                  type="button"
                  onClick={handleExpandAllChapters}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1 shadow-2xs"
                  title="Desplegar todas las etapas"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Desplegar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Row B: Search Input & Filter Chips */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar Pokémon, ruta, líder o rival..."
              className="w-full pl-9.5 pr-8 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold overflow-x-auto gap-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-xl transition-all whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todos ({fullTimeline.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('pending')}
              className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 whitespace-nowrap ${
                filterType === 'pending'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3 h-3 text-amber-500" />
              <span>Pendientes</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterType('capture')}
              className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 whitespace-nowrap ${
                filterType === 'capture'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Dice5 className="w-3 h-3 text-emerald-500" />
              <span>Rutas</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterType('battle')}
              className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 whitespace-nowrap ${
                filterType === 'battle'
                  ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Swords className="w-3 h-3 text-red-500" />
              <span>Combates</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterType('completed')}
              className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 whitespace-nowrap ${
                filterType === 'completed'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-indigo-500" />
              <span>Completados</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. MAIN CONTENT AREA */}
      {effectiveViewScope === 'chapter' ? (
        /* ================= MODE A: SINGLE CHAPTER FOCUSED VIEW ================= */
        <div className="space-y-4">
          {/* Chapter Selector & Navigation Strip */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-3 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
            {/* Quick Carousel of all Chapters */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scroll-smooth">
              {chaptersList.map((ch) => {
                const isSelected = ch.id === effectiveChapterId;
                return (
                  <button
                    key={`chapter-pill-${ch.id}`}
                    type="button"
                    onClick={() => setSelectedChapterId(ch.id)}
                    className={`flex-shrink-0 px-3 py-2 rounded-2xl border transition-all flex items-center gap-2 text-left shadow-2xs cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950 dark:text-white'
                        : ch.isCompleted
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-slate-700 dark:text-slate-300'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg ${
                        ch.isCompleted ? 'bg-emerald-600' : ch.badgeColor || 'bg-slate-700'
                      } text-white flex items-center justify-center text-[10px] font-black`}
                    >
                      {ch.isCompleted ? <Check className="w-3.5 h-3.5" /> : `#${ch.order}`}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold whitespace-nowrap">
                        {ch.badgeName || ch.title.split(':')[0]}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {ch.completedCount}/{ch.totalCount}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Current Chapter Card Header with Prev/Next Controls */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl ${
                    currentChapterData.chapter.badgeColor || 'bg-slate-700'
                  } text-white flex items-center justify-center font-black text-sm shadow-xs flex-shrink-0`}
                >
                  #{currentChapterData.chapter.order}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {currentChapterData.chapter.title}
                    </h2>
                    {currentChapterData.chapter.isCompleted ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completada</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {currentChapterData.chapter.completedCount} / {currentChapterData.chapter.totalCount} completados
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {currentChapterData.chapter.subtitle}
                  </p>
                </div>
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-1.5 self-end sm:self-center flex-shrink-0">
                <button
                  type="button"
                  disabled={!currentChapterData.prevChapter}
                  onClick={() => {
                    if (currentChapterData.prevChapter) {
                      setSelectedChapterId(currentChapterData.prevChapter.id);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none shadow-2xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Etapa Anterior</span>
                </button>

                <button
                  type="button"
                  disabled={!currentChapterData.nextChapter}
                  onClick={() => {
                    if (currentChapterData.nextChapter) {
                      setSelectedChapterId(currentChapterData.nextChapter.id);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none shadow-2xs"
                >
                  <span className="hidden sm:inline">Siguiente Etapa</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </section>

          {/* Cards for this chapter (Clean 3 to 6 items only!) */}
          {currentChapterData.items.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-200 dark:border-slate-800 space-y-2">
              <Compass className="w-8 h-8 mx-auto text-slate-400" />
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                No hay eventos que coincidan con el filtro actual en esta etapa.
              </p>
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500"
              >
                Ver todos los eventos
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {currentChapterData.items.map((item) => {
                if (item.type === 'capture' && item.routeData) {
                  const saved = history.find(
                    (h) =>
                      h.routeId === item.routeData!.id ||
                      h.routeName.toLowerCase() === item.routeData!.name.toLowerCase()
                  );
                  return (
                    <StoryRouteCard
                      key={item.id}
                      route={item.routeData}
                      stepNumber={item.stepNumber}
                      chapterTitle={currentChapterData.chapter.title}
                      savedEncounter={saved}
                      isWeighted={isWeighted}
                      soundEnabled={soundEnabled}
                      onSaveEncounter={onSaveEncounter}
                      onUpdateStatus={onUpdateStatus}
                      onDeleteEncounter={onDeleteEncounter}
                      onOpenManualPicker={onOpenManualPicker}
                      compact={isCompact}
                    />
                  );
                }

                if (item.type === 'battle' && item.battleData) {
                  const isDefeated = defeatedBattles.has(item.battleData.id);
                  return (
                    <TrainerBattleCard
                      key={item.id}
                      battle={item.battleData}
                      starterChoice={starterChoice}
                      index={item.battleData.order - 1}
                      isDefeated={isDefeated}
                      onToggleDefeated={handleToggleDefeated}
                      compact={isCompact}
                    />
                  );
                }

                return null;
              })}
            </div>
          )}
        </div>
      ) : (
        /* ================= MODE B: FULL REGION TIMELINE ================= */
        <div className="space-y-5">
          {chaptersMap.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800 space-y-3">
              <Compass className="w-10 h-10 mx-auto text-slate-400" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                No hay eventos que coincidan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No se encontraron capturas o combates para el filtro seleccionado.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors"
              >
                Restablecer Filtros
              </button>
            </div>
          ) : (
            chaptersMap.map(({ chapter, items }) => {
              const chapterCompletedCount = items.filter((it) => {
                if (it.type === 'capture' && it.routeData) {
                  return (
                    caughtRouteIds.has(it.routeData.id) ||
                    caughtRouteIds.has(it.routeData.name.toLowerCase())
                  );
                }
                if (it.type === 'battle' && it.battleData) {
                  return defeatedBattles.has(it.battleData.id);
                }
                return false;
              }).length;

              const isFullyCompleted = items.length > 0 && chapterCompletedCount === items.length;
              const isCollapsed = collapsedChapters.has(chapter.id) && searchQuery.trim().length === 0;

              return (
                <section
                  key={`chapter-section-${chapter.id}`}
                  id={`chapter-${chapter.id}`}
                  className="space-y-3 scroll-mt-20"
                >
                  {/* Collapsible Chapter Header Banner */}
                  <div
                    onClick={() => handleToggleChapter(chapter.id)}
                    className={`p-3.5 sm:p-4 rounded-3xl border transition-all cursor-pointer select-none flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
                      isFullyCompleted
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300'
                        : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-2xl ${
                          chapter.badgeColor || 'bg-slate-700'
                        } text-white flex items-center justify-center font-black text-xs shadow-xs flex-shrink-0`}
                      >
                        #{chapter.order}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
                            {chapter.title}
                          </h2>
                          {isFullyCompleted ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Completada</span>
                            </span>
                          ) : chapterCompletedCount > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                              {chapterCompletedCount}/{items.length} completados
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {chapter.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleChapter(chapter.id);
                        }}
                        className="px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1"
                      >
                        <span>{isCollapsed ? 'Ver Etapa' : 'Plegar'}</span>
                        {isCollapsed ? (
                          <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
                        ) : (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Compact Milestone Strip when Chapter is Collapsed */}
                  {isCollapsed && (
                    <div className="bg-slate-50/70 dark:bg-slate-900/50 p-2.5 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                        Hitos:
                      </span>
                      {items.map((it) => {
                        if (it.type === 'capture' && it.routeData) {
                          const saved = history.find(
                            (h) =>
                              h.routeId === it.routeData!.id ||
                              h.routeName.toLowerCase() === it.routeData!.name.toLowerCase()
                          );
                          return (
                            <button
                              key={it.id}
                              type="button"
                              onClick={() => handleToggleChapter(chapter.id)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold transition-all border shadow-2xs ${
                                saved
                                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                  : 'bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <Dice5 className={`w-3 h-3 ${saved ? 'text-emerald-600' : 'text-slate-400'}`} />
                              <span>{it.routeData.name}</span>
                              {saved && (
                                <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                                  ({saved.cleanName})
                                </span>
                              )}
                            </button>
                          );
                        }

                        if (it.type === 'battle' && it.battleData) {
                          const isDefeated = defeatedBattles.has(it.battleData.id);
                          return (
                            <button
                              key={it.id}
                              type="button"
                              onClick={() => handleToggleChapter(chapter.id)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold transition-all border shadow-2xs ${
                                isDefeated
                                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                  : 'bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800'
                              }`}
                            >
                              <Swords className={`w-3 h-3 ${isDefeated ? 'text-emerald-600' : 'text-red-500'}`} />
                              <span>{it.battleData.title}</span>
                              {isDefeated && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            </button>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}

                  {/* Items in this chapter (when expanded) */}
                  {!isCollapsed && (
                    <div className="space-y-3 pl-1 sm:pl-3 relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 sm:ml-5">
                      {items.map((item) => {
                        if (item.type === 'capture' && item.routeData) {
                          const saved = history.find(
                            (h) =>
                              h.routeId === item.routeData!.id ||
                              h.routeName.toLowerCase() === item.routeData!.name.toLowerCase()
                          );
                          return (
                            <div key={item.id} className="relative pl-4 sm:pl-6">
                              <div
                                className={`absolute -left-[23px] sm:-left-[31px] top-4 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center ${
                                  saved ? 'bg-emerald-500' : 'bg-red-500'
                                }`}
                              />
                              <StoryRouteCard
                                route={item.routeData}
                                stepNumber={item.stepNumber}
                                chapterTitle={chapter.title}
                                savedEncounter={saved}
                                isWeighted={isWeighted}
                                soundEnabled={soundEnabled}
                                onSaveEncounter={onSaveEncounter}
                                onUpdateStatus={onUpdateStatus}
                                onDeleteEncounter={onDeleteEncounter}
                                onOpenManualPicker={onOpenManualPicker}
                                compact={isCompact}
                              />
                            </div>
                          );
                        }

                        if (item.type === 'battle' && item.battleData) {
                          const isDefeated = defeatedBattles.has(item.battleData.id);
                          return (
                            <div key={item.id} className="relative pl-4 sm:pl-6">
                              <div
                                className={`absolute -left-[23px] sm:-left-[31px] top-4 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center ${
                                  isDefeated ? 'bg-emerald-500' : 'bg-indigo-600'
                                }`}
                              />
                              <TrainerBattleCard
                                battle={item.battleData}
                                starterChoice={starterChoice}
                                index={item.battleData.order - 1}
                                isDefeated={isDefeated}
                                onToggleDefeated={handleToggleDefeated}
                                compact={isCompact}
                              />
                            </div>
                          );
                        }

                        return null;
                      })}
                    </div>
                  )}
                </section>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
