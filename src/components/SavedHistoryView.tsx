import React, { useState } from 'react';
import { SavedEncounter, GameTenant, StarterChoice } from '../types';
import { parsePokemonName, TYPE_COLORS, getPokemonSprite } from '../utils/pokemonMeta';
import { translateRouteName } from '../data/routeTranslations';
import {
  STARTERS_INFO,
  STARTER_CHOICES,
  buildStarterEncounter,
  isStarterEncounter,
  starterEncounterUpdates,
} from '../data/trainers/trainerTranslations';
import { usePokeDetail } from '../context/PokeDetailContext';
import {
  Trash2,
  Download,
  Search,
  Filter,
  Sparkles,
  Calendar,
  Compass,
  FileSpreadsheet,
  AlertTriangle,
  Edit3,
  Check,
  X,
  Gamepad2,
  Award,
  Leaf,
  Flame,
  Droplets,
  Plus,
  CheckCircle2,
  Skull,
  Heart,
} from 'lucide-react';
import { TypeBadge } from './TypeBadge';
import {
  cn,
  panel,
  card,
  inset,
  btn,
  pill,
  pillSolid,
  statTile,
  iconTile,
  text,
  field,
  surface,
  layout,
  segmented,
  spriteFrame,
  emptyState,
  focusRing,
  pad,
  TONES,
  type Tone,
} from '../utils/ui';

const STARTER_STORAGE_KEY = 'pokemon_starter_choice_v1';

/** Shared look for both inline confirm dialogs ("¿Vaciar?" and "¿Eliminar?"). */
const confirmBox = cn(surface.inset, 'flex items-center gap-1.5 px-2.5 py-1');
const confirmLabel = cn('text-xs font-bold', TONES.danger.ink);

interface SavedHistoryViewProps {
  history: SavedEncounter[];
  onUpdate: (id: string, updates: Partial<SavedEncounter>) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onSaveEncounter?: (encounter: SavedEncounter) => void;
  activeTenant?: GameTenant;
  onOpenTenantModal?: () => void;
  starterChoice?: StarterChoice;
  onSelectStarter?: (starter: StarterChoice) => void;
  onOpenExtraModal?: () => void;
}

export const SavedHistoryView: React.FC<SavedHistoryViewProps> = ({
  history,
  onUpdate,
  onDelete,
  onClearAll,
  onSaveEncounter,
  activeTenant,
  onOpenTenantModal,
  starterChoice: propStarterChoice,
  onSelectStarter: propOnSelectStarter,
  onOpenExtraModal,
}) => {
  const { openDetail } = usePokeDetail();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [routeFilter, setRouteFilter] = useState<string>('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<SavedEncounter['status']>('Capturado');
  const [editNickname, setEditNickname] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  // Local starter choice fallback if not passed via props
  const [localStarter, setLocalStarter] = useState<StarterChoice>(() => {
    try {
      const saved = localStorage.getItem(STARTER_STORAGE_KEY) as StarterChoice;
      if (saved === 'grookey' || saved === 'scorbunny' || saved === 'sobble') return saved;
    } catch {}
    return 'grookey';
  });

  const activeStarterChoice = propStarterChoice || localStarter;
  const starterMeta = STARTERS_INFO[activeStarterChoice] || STARTERS_INFO.grookey;

  // Check if starter encounter is present in history
  const starterInHistory = history.find(isStarterEncounter);

  const handleStarterSwitch = (st: StarterChoice) => {
    if (propOnSelectStarter) {
      propOnSelectStarter(st);
    } else {
      setLocalStarter(st);
    }
    try {
      localStorage.setItem(STARTER_STORAGE_KEY, st);
    } catch {}

    // If starter is already registered in history, update its data seamlessly
    if (starterInHistory) {
      onUpdate(starterInHistory.id, starterEncounterUpdates(st));
    }
  };

  const handleRegisterStarterToHistory = () => {
    if (starterInHistory) return;
    if (onSaveEncounter) {
      onSaveEncounter(buildStarterEncounter(activeStarterChoice));
    }
  };

  // Extract unique routes from history
  const uniqueRoutes = Array.from(new Set(history.map((h) => translateRouteName(h.routeName)))).sort();

  // Helpers for dead vs alive status
  const isDead = (status: SavedEncounter['status']) => status === 'Debilitado';
  const isAlive = (status: SavedEncounter['status']) =>
    status === 'Capturado' || status === 'En Equipo' || status === 'En Caja';

  // Filtered list
  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.pokemon.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cleanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.nickname && item.nickname.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesStatus = true;
    if (statusFilter === 'alive') {
      matchesStatus = isAlive(item.status);
    } else if (statusFilter === 'dead') {
      matchesStatus = isDead(item.status);
    } else if (statusFilter === 'Huido') {
      matchesStatus = item.status === 'Huido';
    } else if (statusFilter !== 'All') {
      matchesStatus = item.status === statusFilter;
    }

    const itemRouteName = translateRouteName(item.routeName);
    const matchesRoute = routeFilter === 'All' || itemRouteName === routeFilter || item.routeName === routeFilter;
    return matchesSearch && matchesStatus && matchesRoute;
  });

  const handleStartEdit = (item: SavedEncounter) => {
    setEditingId(item.id);
    setEditStatus(item.status);
    setEditNickname(item.nickname || '');
    setEditNotes(item.notes || '');
  };

  const handleSaveEdit = (id: string) => {
    onUpdate(id, {
      status: editStatus,
      nickname: editNickname.trim() || undefined,
      notes: editNotes.trim() || undefined,
    });
    setEditingId(null);
  };

  // Export to JSON
  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `bitacora_pokemon_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export to CSV
  const exportCSV = () => {
    const headers = ['Fecha', 'Ruta', 'Pokemon', 'Mote', 'Estado', 'Metodo', 'Clima', 'Nivel', 'Probabilidad', 'Shiny', 'Notas'];
    const rows = history.map((h) => [
      new Date(h.timestamp).toLocaleString(),
      `"${translateRouteName(h.routeName)}"`,
      `"${h.pokemon}"`,
      `"${h.nickname || ''}"`,
      `"${h.status}"`,
      `"${h.method}"`,
      `"${h.weather}"`,
      `"${h.levelRange || ''}"`,
      `"${h.chance}%"`,
      h.isShiny ? 'Si' : 'No',
      `"${(h.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `encuentros_pokemon_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const statusColors: Record<SavedEncounter['status'], Tone> = {
    Capturado: 'success',
    'En Equipo': 'success',
    'En Caja': 'info',
    Debilitado: 'danger',
    Huido: 'warning',
  };

  // Metric stats
  const totalCount = history.length;
  const aliveCount = history.filter((h) => isAlive(h.status)).length;
  const deadCount = history.filter((h) => isDead(h.status)).length;
  const escapedCount = history.filter((h) => h.status === 'Huido').length;
  const shinyCount = history.filter((h) => h.isShiny).length;
  const routesCount = uniqueRoutes.length;

  return (
    <div id="saved-history-view" className={layout.view}>
      {/* Top Header & Stats */}
      <div className={panel()}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className={cn(text.pageTitle, 'flex items-center gap-2')}>
                <Compass className="w-5 h-5 text-brand-accent" />
                Bitácora de Encuentros
              </h2>
              {activeTenant && (
                <button
                  type="button"
                  onClick={onOpenTenantModal}
                  className={pill('success', 'sm', cn('cursor-pointer hover:brightness-105 transition-all', focusRing))}
                  title="Cambiar base de datos"
                >
                  <Gamepad2 className="w-3 h-3" />
                  <span>{activeTenant.shortName || activeTenant.name} ({activeTenant.region})</span>
                  <span className="text-[10px] underline ml-0.5">Cambiar</span>
                </button>
              )}
            </div>
            <p className={text.muted}>
              Registro histórico de tus Pokémon elegidos por ruta para {activeTenant?.name || 'esta partida'}.
            </p>
          </div>

          {/* Action buttons: Export & Clear */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="export-csv-button"
              type="button"
              onClick={exportCSV}
              disabled={history.length === 0}
              className={btn('secondary', 'sm')}
              title="Descargar tabla en CSV"
            >
              <FileSpreadsheet className={cn('w-4 h-4', TONES.success.ink)} />
              Exportar CSV
            </button>
            <button
              id="export-json-button"
              type="button"
              onClick={exportJSON}
              disabled={history.length === 0}
              className={btn('secondary', 'sm')}
              title="Descargar copia de seguridad en JSON"
            >
              <Download className={cn('w-4 h-4', TONES.info.ink)} />
              JSON
            </button>
            {history.length > 0 && (
              showClearConfirm ? (
                <div className={confirmBox}>
                  <span className={confirmLabel}>¿Vaciar?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClearAll();
                      setShowClearConfirm(false);
                    }}
                    className={btn('solid', 'xs', 'danger')}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className={btn('secondary', 'xs')}
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  id="clear-all-history-button"
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className={btn('soft', 'sm', 'danger')}
                >
                  <Trash2 className="w-4 h-4" />
                  Vaciar
                </button>
              )
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-brand-border">
          <div className={statTile('neutral')}>
            <span className={text.label}>Encuentros Totales</span>
            <p className={cn(text.stat, 'mt-0.5')}>{totalCount}</p>
          </div>
          <div className={statTile('success')}>
            <span className={cn(text.label, 'flex items-center gap-1')}>
              <Heart className="w-3.5 h-3.5 fill-current text-status-success" /> Vivos
            </span>
            <p className={cn(text.stat, 'mt-0.5 text-emerald-600 dark:text-emerald-400')}>{aliveCount}</p>
          </div>
          <div className={statTile('danger')}>
            <span className={cn(text.label, 'flex items-center gap-1')}>
              <Skull className="w-3.5 h-3.5 text-status-danger" /> Muertos / Bajas
            </span>
            <p className={cn(text.stat, 'mt-0.5 text-rose-600 dark:text-rose-400')}>{deadCount}</p>
          </div>
          <div className={statTile('warning')}>
            <span className={cn(text.label, 'flex items-center gap-1')}>
              <Sparkles className="w-3.5 h-3.5" /> Variocolor (Shinies)
            </span>
            <p className={cn(text.stat, 'mt-0.5')}>{shinyCount}</p>
          </div>
        </div>
      </div>

      {/* CHOSEN STARTER HIGHLIGHT CARD */}
      {(!activeTenant || activeTenant.id === 'blessed-shield') && (
        <div
          id="chosen-starter-card"
          className={cn(
            'bg-brand-card border rounded-2xl shadow-sm transition-colors relative overflow-hidden',
            pad.panelLg,
            TONES.warning.border
          )}
        >
          {/* Ambient decor */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-status-pending/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            {/* Header: Label & Starter Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2.5">
                <span className={iconTile('warning')}>
                  <Award className="w-4 h-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={text.cardTitle}>
                      Pokémon Inicial de la Aventura
                    </h3>
                    <span className={pillSolid('warning')}>
                      ★ Inicial
                    </span>
                  </div>
                  <p className={text.muted}>
                    Pueblo Yarda (Postwick) • Entregado por el Campeón Lionel • Nivel inicial: Nv. 5
                  </p>
                </div>
              </div>

              {/* Starter Switcher Pills */}
              <div className={cn(segmented.group, 'self-start sm:self-auto')}>
                {STARTER_CHOICES.map((st) => {
                  const isSelected = activeStarterChoice === st;
                  const meta = STARTERS_INFO[st];

                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStarterSwitch(st)}
                      className={segmented.item(isSelected)}
                      title={`Elegir a ${meta.name} como inicial`}
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

            {/* Main Starter Details & Registration */}
            {(() => {
              const isStarterDead = starterInHistory ? isDead(starterInHistory.status) : false;
              return (
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* Left: Animated Showdown Sprite & Description */}
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => openDetail('pokemon', starterMeta.species)}
                      className={spriteFrame(true, 'w-16 h-16 sm:w-20 sm:h-20 p-2 relative group')}
                      title={`Ver estadísticas de ${starterMeta.name}`}
                    >
                      <img
                        src={starterMeta.showdown}
                        alt={starterMeta.name}
                        className={cn(
                          'w-14 h-14 sm:w-16 sm:h-16 object-contain group-hover:scale-110 transition-transform',
                          isStarterDead && 'grayscale opacity-60 contrast-125'
                        )}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = starterMeta.sprite;
                        }}
                      />
                      {isStarterDead && (
                        <span className="absolute -top-1 -left-1 p-0.5 rounded-full bg-status-danger text-white shadow-xs" title="Debilitado">
                          <Skull className="w-3 h-3" />
                        </span>
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => openDetail('pokemon', starterMeta.species)}
                          className={cn(
                            text.sectionTitle,
                            'hover:text-brand-accent-ink cursor-pointer text-left transition-colors',
                            isStarterDead && 'line-through text-brand-txt2'
                          )}
                          title={`Ver estadísticas de ${starterMeta.name}`}
                        >
                          {starterInHistory?.nickname
                            ? `${starterInHistory.nickname} (${starterMeta.name})`
                            : starterMeta.name}
                        </button>
                        <TypeBadge type={starterMeta.type} />
                        <span className={cn(text.muted, 'font-semibold')}>
                          Nv. 5
                        </span>
                        {isStarterDead && (
                          <span className={pillSolid('danger', 'xs')}>
                            <Skull className="w-3 h-3" /> Muerto
                          </span>
                        )}
                      </div>
                      <p className={cn(text.muted, 'max-w-lg')}>
                        {starterMeta.description} • Tu rival Paúl combatirá con {starterMeta.hopStarterName} ({starterMeta.hopStarterType}).
                      </p>
                    </div>
                  </div>

                  {/* Right: Registration status & quick 1-click Vivo/Muerto switch */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
                    {starterInHistory ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {/* 1-Click Vivo vs Muerto Switcher */}
                        <div className="flex items-center rounded-lg border border-brand-border bg-brand-surface p-0.5 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => onUpdate(starterInHistory.id, { status: 'Capturado' })}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer',
                              !isStarterDead
                                ? 'bg-status-success text-white shadow-xs font-bold scale-[1.02]'
                                : 'text-brand-txt2 hover:text-brand-txt1 hover:bg-brand-surface2'
                            )}
                            title="Marcar inicial como Vivo"
                          >
                            <Heart className="w-3.5 h-3.5 fill-current text-current" />
                            <span>Vivo</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdate(starterInHistory.id, { status: 'Debilitado' })}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer',
                              isStarterDead
                                ? 'bg-status-danger text-white shadow-xs font-bold scale-[1.02]'
                                : 'text-brand-txt2 hover:text-brand-txt1 hover:bg-brand-surface2'
                            )}
                            title="Marcar inicial como Muerto (Debilitado)"
                          >
                            <Skull className="w-3.5 h-3.5 text-current" />
                            <span>Muerto</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleStartEdit(starterInHistory)}
                          className={btn('secondary', 'md')}
                          title="Editar mote o notas"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Mote</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRegisterStarterToHistory}
                        className={btn('primary', 'md', 'warning')}
                      >
                        <Plus className="w-4 h-4" />
                        <span>Añadir Inicial a la Bitácora</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className={panel('flex flex-col gap-3')}>
        {/* Quick Status Filter Tabs: Vivo vs Muerto */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-brand-txt2 mr-1">Estado:</span>
          <button
            type="button"
            onClick={() => setStatusFilter('All')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border',
              statusFilter === 'All'
                ? 'bg-brand-surface2 border-brand-accent text-brand-txt1 shadow-2xs font-bold'
                : 'bg-brand-surface border-brand-border text-brand-txt2 hover:text-brand-txt1'
            )}
          >
            <span>Todos</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-brand-surface3 text-brand-txt2">{totalCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('alive')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border',
              statusFilter === 'alive'
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-2xs'
                : 'bg-brand-surface border-brand-border text-brand-txt2 hover:text-emerald-600'
            )}
          >
            <Heart className="w-3.5 h-3.5 fill-current text-emerald-500" />
            <span>Vivos</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">{aliveCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('dead')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border',
              statusFilter === 'dead'
                ? 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 font-bold shadow-2xs'
                : 'bg-brand-surface border-brand-border text-brand-txt2 hover:text-rose-600'
            )}
          >
            <Skull className="w-3.5 h-3.5 text-rose-500" />
            <span>Muertos</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold">{deadCount}</span>
          </button>

          {escapedCount > 0 && (
            <button
              type="button"
              onClick={() => setStatusFilter('Huido')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border',
                statusFilter === 'Huido'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 font-bold shadow-2xs'
                  : 'bg-brand-surface border-brand-border text-brand-txt2 hover:text-amber-600'
              )}
            >
              <span>🏃 Huidos</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">{escapedCount}</span>
            </button>
          )}
        </div>

        {/* Search & Route Filter */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-brand-border/60">
          <div className={cn(field.withIcon, 'flex-1')}>
            <Search className={field.icon} />
            <input
              id="history-search-input"
              type="text"
              placeholder="Buscar por Pokémon o mote..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(field.input, field.iconInputPad)}
            />
          </div>

          <div className="sm:w-64">
            <select
              id="history-route-filter"
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              className={field.select}
            >
              <option value="All">Todas las Rutas ({uniqueRoutes.length})</option>
              {uniqueRoutes.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* History Items List */}
      {filteredHistory.length === 0 ? (
        <div className={emptyState.wrapper}>
          <div className={emptyState.bubble}>
            <Compass className="w-7 h-7" />
          </div>
          <h3 className={emptyState.title}>No hay encuentros que coincidan</h3>
          <p className={emptyState.hint}>
            Prueba a cambiar el filtro de estado o los términos de búsqueda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {filteredHistory.map((item) => {
            const { displayName } = parsePokemonName(item.pokemon);
            const { sprite } = getPokemonSprite(item.pokemon);
            const isEditing = editingId === item.id;
            const isPokemonDead = isDead(item.status);
            const isPokemonAlive = isAlive(item.status);
            const isPokemonEscaped = item.status === 'Huido';

            return (
              <div
                key={item.id}
                id={`history-item-${item.id}`}
                className={card({
                  interactive: true,
                  extra: cn(
                    'relative overflow-hidden flex flex-col justify-between transition-all duration-200',
                    isPokemonDead && 'border-status-danger/40 bg-status-danger/5 dark:bg-status-danger/10 shadow-2xs'
                  ),
                })}
              >
                {/* Header: Route, Date & 1-Click Vivo/Muerto Switcher */}
                <div className="flex items-center justify-between gap-2 text-xs pb-3 border-b border-brand-border flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-brand-txt1 min-w-0">
                    <Compass className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                    <span className="truncate">{translateRouteName(item.routeName)}</span>
                    <span className={cn(text.meta, 'hidden sm:inline-flex items-center gap-1 ml-1')}>
                      • {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Direct 1-Click Vivo vs Muerto Switcher */}
                  <div className="flex items-center rounded-lg border border-brand-border bg-brand-surface p-0.5 shadow-2xs shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdate(item.id, { status: 'Capturado' });
                      }}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
                        isPokemonAlive
                          ? 'bg-status-success text-white shadow-xs font-bold scale-[1.02]'
                          : 'text-brand-txt2 hover:text-brand-txt1 hover:bg-brand-surface2'
                      )}
                      title="Marcar como Vivo"
                    >
                      <Heart className="w-3 h-3 fill-current text-current" />
                      <span>Vivo</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdate(item.id, { status: 'Debilitado' });
                      }}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
                        isPokemonDead
                          ? 'bg-status-danger text-white shadow-xs font-bold scale-[1.02]'
                          : 'text-brand-txt2 hover:text-brand-txt1 hover:bg-brand-surface2'
                      )}
                      title="Marcar como Muerto (Debilitado)"
                    >
                      <Skull className="w-3 h-3 text-current" />
                      <span>Muerto</span>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="py-3 flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => openDetail('pokemon', item.cleanName)}
                    className={cn(
                      'w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-brand-surface border border-brand-border',
                      'flex items-center justify-center p-1 relative shrink-0 cursor-pointer group',
                      'transition-all duration-150 hover:border-brand-accent/50 hover:scale-105',
                      focusRing
                    )}
                    title={`Ver detalles de ${displayName}`}
                  >
                    <img
                      src={sprite}
                      alt={displayName}
                      className={cn(
                        'w-12 h-12 sm:w-14 sm:h-14 object-contain group-hover:scale-110 transition-transform',
                        isPokemonDead && 'grayscale opacity-60 contrast-125'
                      )}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = '0.3';
                      }}
                    />
                    {isPokemonDead && (
                      <span className="absolute -top-1 -left-1 p-0.5 rounded-full bg-status-danger text-white shadow-xs" title="Debilitado / Muerto">
                        <Skull className="w-3 h-3" />
                      </span>
                    )}
                    {item.isShiny && (
                      <span className={cn('absolute -top-1 -right-1 p-0.5 rounded-full', TONES.warning.solid)}>
                        <Sparkles className="w-3 h-3 fill-current" />
                      </span>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => openDetail('pokemon', item.cleanName)}
                        className={cn(
                          text.cardTitle,
                          'hover:text-brand-accent-ink truncate cursor-pointer text-left transition-colors',
                          isPokemonDead && 'line-through text-brand-txt2'
                        )}
                        title={`Ver detalles de ${displayName}`}
                      >
                        {item.nickname ? `${item.nickname} (${displayName})` : displayName}
                      </button>
                      {isStarterEncounter(item) && (
                        <span className={pillSolid('warning', 'xs')}>
                          ★ Inicial
                        </span>
                      )}
                      {isPokemonDead && (
                        <span className={pillSolid('danger', 'xs')}>
                          💀 Muerto
                        </span>
                      )}
                      {isPokemonEscaped && (
                        <span className={pillSolid('warning', 'xs')}>
                          🏃 Huido
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {isPokemonDead ? (
                        <span className={pill('danger')}>
                          💀 Muerto en combate
                        </span>
                      ) : isPokemonEscaped ? (
                        <span className={pill('warning')}>
                          🏃 No capturado
                        </span>
                      ) : (
                        <span className={pill('success')}>
                          💚 Vivo
                        </span>
                      )}
                      <span className={pill('neutral', 'sm')}>
                        {item.method} • {item.chance}%
                      </span>
                      {item.levelRange && (
                        <span className={pill('neutral', 'sm')}>
                          {item.levelRange}
                        </span>
                      )}
                    </div>

                    {item.notes && (
                      <p className={cn(text.muted, surface.inset, 'mt-2 p-2.5 italic')}>
                        &ldquo;{item.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Inline Editing Form if active */}
                {isEditing && (
                  <div className={inset('mt-3 space-y-2')}>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={field.label}>Mote</label>
                        <input
                          type="text"
                          value={editNickname}
                          onChange={(e) => setEditNickname(e.target.value)}
                          className={field.inputSm}
                        />
                      </div>
                      <div>
                        <label className={field.label}>Estado</label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as SavedEncounter['status'])}
                          className={field.select}
                        >
                          <option value="Capturado">💚 Vivo (Capturado)</option>
                          <option value="Debilitado">💀 Muerto (Debilitado)</option>
                          <option value="Huido">🏃 Huido (No capturado)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={field.label}>Notas</label>
                      <input
                        type="text"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        className={field.inputSm}
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className={btn('ghost', 'xs', 'neutral')}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(item.id)}
                        className={btn('solid', 'xs', 'success')}
                      >
                        <Check className="w-3.5 h-3.5" /> Guardar
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer action buttons */}
                {!isEditing && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-brand-border text-xs">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(item)}
                      className={btn('ghost', 'xs', 'neutral')}
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Editar Mote
                    </button>
                    {confirmDeleteId === item.id ? (
                      <div className={confirmBox}>
                        <span className={confirmLabel}>¿Eliminar?</span>
                        <button
                          type="button"
                          onClick={() => {
                            onDelete(item.id);
                            setConfirmDeleteId(null);
                          }}
                          className={btn('solid', 'xs', 'danger')}
                        >
                          Sí
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className={btn('secondary', 'xs')}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(item.id)}
                        className={btn('ghost', 'xs', 'danger')}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Eliminar
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
