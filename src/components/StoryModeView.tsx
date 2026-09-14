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
import { isStarterGiftRoute } from '../data/trainers/trainerTranslations';
import { StoryRouteCard } from './StoryRouteCard';
import { TrainerBattleCard } from './TrainerBattleCard';
import { TimelineMilestone, TimelineRail } from './TimelineMilestone';
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
import {
  cn,
  panel,
  panelLg,
  card,
  inset,
  btn,
  iconBtn,
  pill,
  pillSolid,
  iconTile,
  text,
  field,
  layout,
  segmented,
  filterChip,
  emptyState,
  TONES,
} from '../utils/ui';

const DEFEATED_STORAGE_KEY = 'pokemon_defeated_trainers_v1';
const STARTER_STORAGE_KEY = 'pokemon_starter_choice_v1';
const COLLAPSED_CHAPTERS_KEY = 'pokemon_collapsed_chapters_v1';
const VIEW_SCOPE_KEY = 'pokemon_story_view_scope_v1';
const COMPACT_MODE_KEY = 'pokemon_story_compact_mode_v1';

/** Maps vertical mouse-wheel movement to eased horizontal scrolling on overflow strips. */
function bindHorizontalWheelScroll(el: HTMLDivElement | null) {
  if (!el) return undefined;

  const easing = 0.16;
  // Windows DPI scaling (e.g. 175%) can leave a 1–2px leftover that clips the first pill.
  const snapThreshold = 3;
  let targetLeft = el.scrollLeft;
  let rafId = 0;

  const maxScrollLeft = () => Math.max(0, el.scrollWidth - el.clientWidth);

  const settle = (left: number) => {
    el.scrollLeft = left;
    targetLeft = left;
    rafId = 0;
  };

  const animate = () => {
    const max = maxScrollLeft();
    const clampedTarget = Math.max(0, Math.min(max, targetLeft));
    targetLeft = clampedTarget;
    const current = el.scrollLeft;
    const distance = clampedTarget - current;

    if (Math.abs(distance) <= snapThreshold) {
      settle(clampedTarget);
      return;
    }

    el.scrollLeft = current + distance * easing;
    // Subpixel rounding can keep scrollLeft unchanged; snap instead of looping forever.
    if (el.scrollLeft === current) {
      settle(clampedTarget);
      return;
    }

    rafId = requestAnimationFrame(animate);
  };

  const onWheel = (event: WheelEvent) => {
    if (el.scrollWidth <= el.clientWidth) return;

    const primarilyVertical = Math.abs(event.deltaY) >= Math.abs(event.deltaX);
    if (!primarilyVertical) return;

    if (!rafId) targetLeft = el.scrollLeft;

    const max = maxScrollLeft();
    const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
    const nextTarget = Math.max(0, Math.min(max, targetLeft + delta));

    const atStart = nextTarget <= 0 && el.scrollLeft <= snapThreshold;
    const atEnd = nextTarget >= max && el.scrollLeft >= max - snapThreshold;
    if (atStart) {
      if (el.scrollLeft !== 0) {
        event.preventDefault();
        settle(0);
      }
      return;
    }
    if (atEnd) {
      if (el.scrollLeft !== max) {
        event.preventDefault();
        settle(max);
      }
      return;
    }

    event.preventDefault();
    targetLeft = nextTarget;
    if (!rafId) rafId = requestAnimationFrame(animate);
  };

  const onScroll = () => {
    if (!rafId) targetLeft = el.scrollLeft;
  };

  el.style.scrollBehavior = 'auto';
  el.addEventListener('wheel', onWheel, { passive: false });
  el.addEventListener('scroll', onScroll, { passive: true });
  return () => {
    el.removeEventListener('wheel', onWheel);
    el.removeEventListener('scroll', onScroll);
    if (rafId) cancelAnimationFrame(rafId);
  };
}

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

  const isNextStarterGift =
    nextActiveItem?.type === 'capture' &&
    !!nextActiveItem.routeData &&
    isStarterGiftRoute(nextActiveItem.routeData.id);

  // If user is actively typing a search query, temporarily view all chapters
  const effectiveViewScope = searchQuery.trim().length > 0 ? 'all' : viewScope;

  return (
    <div className={layout.view}>
      {nextActiveItem ? (
        <section className={panelLg('relative overflow-hidden')}>
          <div className="absolute -right-10 -top-10 w-44 h-44 bg-brand-accent/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className={iconTile('accent', 'w-12 h-12 shrink-0')}>
                <Target className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={pillSolid('accent', 'xs')}>
                    Próximo Hito
                  </span>
                  <span className={cn(text.muted, 'flex items-center gap-1')}>
                    <MapPin className={cn('w-3 h-3', TONES.accent.ink)} />
                    {nextActiveItem.chapter.title.split(':')[0]} · {activeTenant.region}
                  </span>
                </div>
                <h1 className={text.pageTitle}>
                  {nextActiveItem.location}
                  {nextActiveItem.type === 'capture' && (
                    <span className={pill('info', 'sm', 'ml-2 align-middle')}>
                      {isNextStarterGift ? 'Inicial de Lionel' : 'Ruleta disponible'}
                    </span>
                  )}
                </h1>
                <p className={cn(text.muted, 'sm:text-sm mt-0.5')}>
                  {nextActiveItem.subtitle}
                </p>
              </div>
            </div>
            <div className="w-full md:w-auto flex items-center gap-3">
              <button
                type="button"
                onClick={handleJumpToNextActive}
                className={btn('primary', 'lg', 'accent', 'w-full md:w-auto')}
              >
                {isNextStarterGift ? (
                  <Award className="w-4 h-4" />
                ) : nextActiveItem.type === 'capture' ? (
                  <Dice5 className="w-4 h-4" />
                ) : (
                  <Swords className="w-4 h-4" />
                )}
                <span>
                  {isNextStarterGift
                    ? 'Elegir Inicial'
                    : nextActiveItem.type === 'capture'
                      ? 'Girar Ruleta Ahora'
                      : 'Ver Combate'}
                </span>
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className={card({ tone: 'success', extra: 'text-center' })}>
          <div className="text-sm font-bold flex items-center justify-center gap-1.5">
            <Trophy className="w-4 h-4" />
            <span>¡Enhorabuena! Has completado todos los hitos de la aventura</span>
          </div>
        </section>
      )}

      <section className={panel('flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3')}>
        <div className={field.withIcon}>
          <Search className={field.icon} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por ruta, especie, tipo o rival..."
            className={cn(field.input, field.iconInputPad, 'pr-10')}
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} className={iconBtn('ghost', 'sm', 'neutral', 'absolute right-1.5 top-1/2 -translate-y-1/2 text-xs')}>
              ✕
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-nowrap">
          {(
            [
              { id: 'all', label: `Todos (${fullTimeline.length})` },
              { id: 'pending', label: `Pendientes (${progressStats.totalItems - progressStats.completedCount})`, dot: 'bg-status-pending' },
              { id: 'capture', label: `Rutas (${progressStats.totalCaptures})`, icon: 'map' },
              { id: 'battle', label: `Combates (${progressStats.totalBattles})`, icon: 'swords' },
              { id: 'completed', label: `Completados (${progressStats.completedCount})`, dot: 'bg-status-live' },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterType(f.id)}
              className={filterChip(filterType === f.id)}
            >
              {'dot' in f && f.dot ? <span className={cn('w-2 h-2 rounded-full', f.dot)} /> : null}
              {f.id === 'battle' ? <Swords className="w-3 h-3" /> : null}
              {f.id === 'capture' ? <MapPin className="w-3 h-3" /> : null}
              {f.label}
            </button>
          ))}
        </div>
      </section>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className={cn(segmented.group, 'self-start')}>
          <button
            type="button"
            onClick={() => handleSetViewScope('chapter')}
            className={segmented.item(effectiveViewScope === 'chapter')}
          >
            <Compass className="w-3.5 h-3.5" />
            Por Etapas
          </button>
          <button
            type="button"
            onClick={() => handleSetViewScope('all')}
            className={segmented.item(effectiveViewScope === 'all')}
          >
            <Layers className="w-3.5 h-3.5" />
            Toda la Región
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleCompact}
            className={filterChip(isCompact)}
          >
            <LayoutList className="w-3.5 h-3.5" />
            {isCompact ? 'Vista Compacta' : 'Vista Detallada'}
          </button>
          {effectiveViewScope === 'all' && (
            <>
              <button type="button" onClick={handleCollapseAllChapters} className={btn('secondary', 'sm')}>
                Plegar
              </button>
              <button type="button" onClick={handleExpandAllChapters} className={btn('secondary', 'sm')}>
                Desplegar
              </button>
            </>
          )}
        </div>
      </div>

      {/* 4. MAIN CONTENT AREA */}
      {effectiveViewScope === 'chapter' ? (
        /* ================= MODE A: SINGLE CHAPTER FOCUSED VIEW ================= */
        <div className="space-y-4">
          {/* Chapter Selector & Navigation Strip */}
          <section className={panel('space-y-3')}>
            <div
              ref={bindHorizontalWheelScroll}
              className={cn(segmented.group, 'w-full overflow-x-auto pb-1 scrollbar-none overscroll-x-contain')}
            >
              {chaptersList.map((ch) => {
                const isSelected = ch.id === effectiveChapterId;
                return (
                  <button
                    key={`chapter-pill-${ch.id}`}
                    type="button"
                    onClick={() => setSelectedChapterId(ch.id)}
                    className={segmented.item(
                      isSelected,
                      cn('shrink-0 gap-2 text-left', !isSelected && ch.isCompleted && TONES.success.ink)
                    )}
                  >
                    <div
                      className={cn(
                        'w-6 h-6 rounded-lg text-white flex items-center justify-center text-[10px] font-bold',
                        ch.isCompleted ? TONES.success.fill : ch.badgeColor || TONES.neutral.fill
                      )}
                    >
                      {ch.isCompleted ? <Check className="w-3.5 h-3.5" /> : `#${ch.order}`}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold whitespace-nowrap">
                        {ch.badgeName || ch.title.split(':')[0]}
                      </div>
                      <div className={text.meta}>
                        {ch.completedCount}/{ch.totalCount}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Current Chapter Card Header with Prev/Next Controls */}
            <div className="pt-2 border-t border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0',
                    currentChapterData.chapter.badgeColor || TONES.neutral.fill
                  )}
                >
                  #{currentChapterData.chapter.order}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className={text.sectionTitle}>
                      {currentChapterData.chapter.title}
                    </h2>
                    {currentChapterData.chapter.isCompleted ? (
                      <span className={pill('success', 'xs')}>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completada</span>
                      </span>
                    ) : (
                      <span className={pill('info', 'xs')}>
                        {currentChapterData.chapter.completedCount} / {currentChapterData.chapter.totalCount} completados
                      </span>
                    )}
                  </div>
                  <p className={cn(text.muted, 'mt-0.5')}>
                    {currentChapterData.chapter.subtitle}
                  </p>
                </div>
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  disabled={!currentChapterData.prevChapter}
                  onClick={() => {
                    if (currentChapterData.prevChapter) {
                      setSelectedChapterId(currentChapterData.prevChapter.id);
                    }
                  }}
                  className={btn('secondary', 'sm')}
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
                  className={btn('secondary', 'sm')}
                >
                  <span className="hidden sm:inline">Siguiente Etapa</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </section>

          {/* Cards for this chapter (Clean 3 to 6 items only!) */}
          {currentChapterData.items.length === 0 ? (
            <div className={emptyState.wrapper}>
              <Compass className="w-8 h-8 mx-auto text-brand-txt2" />
              <p className={cn(emptyState.hint, 'font-bold')}>
                No hay eventos que coincidan con el filtro actual en esta etapa.
              </p>
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={btn('primary', 'sm')}
              >
                Ver todos los eventos
              </button>
            </div>
          ) : (
            <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className={cn('w-2 h-2 rounded-full', TONES.accent.fill)} />
                <h2 className={text.label}>
                  Línea Temporal · {currentChapterData.chapter.title.split(':')[0]}
                </h2>
              </div>
              <span className={text.muted}>{currentChapterData.items.length} Hitos mostrados</span>
            </div>
            <TimelineRail>
              {currentChapterData.items.map((item) => {
                if (item.type === 'capture' && item.routeData) {
                  const saved = history.find(
                    (h) =>
                      h.routeId === item.routeData!.id ||
                      h.routeName.toLowerCase() === item.routeData!.name.toLowerCase()
                  );
                  const isNext = nextActiveItem?.id === item.id;
                  return (
                    <TimelineMilestone
                      key={item.id}
                      stepNumber={item.stepNumber}
                      isComplete={Boolean(saved)}
                      isNext={isNext}
                    >
                      <StoryRouteCard
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
                        starterChoice={starterChoice}
                        onSelectStarter={handleSelectStarter}
                        compact={isCompact}
                        hideStepBadge
                      />
                    </TimelineMilestone>
                  );
                }

                if (item.type === 'battle' && item.battleData) {
                  const isDefeated = defeatedBattles.has(item.battleData.id);
                  return (
                    <TimelineMilestone
                      key={item.id}
                      stepNumber={item.stepNumber}
                      isBattle
                      isComplete={isDefeated}
                      isNext={nextActiveItem?.id === item.id}
                    >
                      <TrainerBattleCard
                        battle={item.battleData}
                        starterChoice={starterChoice}
                        index={item.battleData.order - 1}
                        isDefeated={isDefeated}
                        onToggleDefeated={handleToggleDefeated}
                        compact={isCompact}
                      />
                    </TimelineMilestone>
                  );
                }

                return null;
              })}
            </TimelineRail>
            </div>
          )}
        </div>
      ) : (
        /* ================= MODE B: FULL REGION TIMELINE ================= */
        <div className="space-y-5">
          {chaptersMap.length === 0 ? (
            <div className={emptyState.wrapper}>
              <Compass className="w-10 h-10 mx-auto text-brand-txt2" />
              <h3 className={emptyState.title}>
                No hay eventos que coincidan
              </h3>
              <p className={emptyState.hint}>
                No se encontraron capturas o combates para el filtro seleccionado.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                }}
                className={btn('primary', 'md')}
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
                    className={card({
                      interactive: true,
                      tone: isFullyCompleted ? 'success' : undefined,
                      extra: 'cursor-pointer select-none flex flex-col sm:flex-row sm:items-center justify-between gap-3',
                    })}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-9 h-9 rounded-xl text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0',
                          chapter.badgeColor || TONES.neutral.fill
                        )}
                      >
                        #{chapter.order}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className={text.cardTitle}>
                            {chapter.title}
                          </h2>
                          {isFullyCompleted ? (
                            <span className={pill('success', 'xs')}>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Completada</span>
                            </span>
                          ) : chapterCompletedCount > 0 ? (
                            <span className={pill('info', 'xs')}>
                              {chapterCompletedCount}/{items.length} completados
                            </span>
                          ) : null}
                        </div>
                        <p className={text.muted}>
                          {chapter.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleChapter(chapter.id);
                        }}
                        className={btn('secondary', 'xs')}
                      >
                        <span>{isCollapsed ? 'Ver Etapa' : 'Plegar'}</span>
                        {isCollapsed ? (
                          <ChevronDown className={cn('w-3.5 h-3.5', TONES.info.ink)} />
                        ) : (
                          <ChevronUp className="w-3.5 h-3.5 text-brand-txt2" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Compact Milestone Strip when Chapter is Collapsed */}
                  {isCollapsed && (
                    <div className={inset('border-dashed flex items-center gap-2 flex-wrap')}>
                      <span className={cn(text.label, 'mr-1')}>
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
                              className={btn(saved ? 'soft' : 'secondary', 'xs', 'success')}
                            >
                              {isStarterGiftRoute(it.routeData.id) ? (
                                <Award className={cn('w-3 h-3', saved ? TONES.success.ink : TONES.warning.ink)} />
                              ) : (
                                <Dice5 className={cn('w-3 h-3', saved ? TONES.success.ink : 'text-brand-txt2')} />
                              )}
                              <span>{it.routeData.name}</span>
                              {saved && (
                                <span className={cn('font-bold', TONES.success.ink)}>
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
                              className={btn('soft', 'xs', isDefeated ? 'success' : 'danger')}
                            >
                              <Swords className="w-3 h-3" />
                              <span>{it.battleData.trainerName}</span>
                              {isDefeated && <CheckCircle2 className="w-3 h-3" />}
                            </button>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}

                  {/* Items in this chapter (when expanded) */}
                  {!isCollapsed && (
                    <TimelineRail>
                      {items.map((item) => {
                        if (item.type === 'capture' && item.routeData) {
                          const saved = history.find(
                            (h) =>
                              h.routeId === item.routeData!.id ||
                              h.routeName.toLowerCase() === item.routeData!.name.toLowerCase()
                          );
                          return (
                            <TimelineMilestone
                              key={item.id}
                              stepNumber={item.stepNumber}
                              isComplete={Boolean(saved)}
                              isNext={nextActiveItem?.id === item.id}
                            >
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
                                starterChoice={starterChoice}
                                onSelectStarter={handleSelectStarter}
                                compact={isCompact}
                                hideStepBadge
                              />
                            </TimelineMilestone>
                          );
                        }

                        if (item.type === 'battle' && item.battleData) {
                          const isDefeated = defeatedBattles.has(item.battleData.id);
                          return (
                            <TimelineMilestone
                              key={item.id}
                              stepNumber={item.stepNumber}
                              isBattle
                              isComplete={isDefeated}
                              isNext={nextActiveItem?.id === item.id}
                            >
                              <TrainerBattleCard
                                battle={item.battleData}
                                starterChoice={starterChoice}
                                index={item.battleData.order - 1}
                                isDefeated={isDefeated}
                                onToggleDefeated={handleToggleDefeated}
                                compact={isCompact}
                              />
                            </TimelineMilestone>
                          );
                        }

                        return null;
                      })}
                    </TimelineRail>
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
