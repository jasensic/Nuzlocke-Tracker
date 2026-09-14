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

  // Filtered list
  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.pokemon.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cleanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.nickname && item.nickname.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
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
  const caughtCount = history.filter((h) => h.status === 'Capturado' || h.status === 'En Equipo' || h.status === 'En Caja').length;
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
            <span className={text.label}>Capturados / Vivos</span>
            <p className={cn(text.stat, 'mt-0.5')}>{caughtCount}</p>
          </div>
          <div className={statTile('info')}>
            <span className={text.label}>Rutas Exploradas</span>
            <p className={cn(text.stat, 'mt-0.5')}>{routesCount}</p>
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
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain group-hover:scale-110 transition-transform"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = starterMeta.sprite;
                    }}
                  />
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => openDetail('pokemon', starterMeta.species)}
                      className={cn(text.sectionTitle, 'hover:text-brand-accent-ink cursor-pointer text-left transition-colors')}
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
                  </div>
                  <p className={cn(text.muted, 'max-w-lg')}>
                    {starterMeta.description} • Tu rival Paúl combatirá con {starterMeta.hopStarterName} ({starterMeta.hopStarterType}).
                  </p>
                </div>
              </div>

              {/* Right: Registration status & edit actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
                {starterInHistory ? (
                  <div className={card({ tone: 'success', padding: 'compact', extra: 'flex items-center gap-2' })}>
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <div>
                      <span className="block text-xs font-bold">
                        Registrado en la Bitácora
                      </span>
                      <span className="text-[10px]">
                        Estado: {starterInHistory.status} • Pueblo Yarda
                      </span>
                    </div>
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

                {starterInHistory && (
                  <button
                    type="button"
                    onClick={() => handleStartEdit(starterInHistory)}
                    className={btn('secondary', 'md')}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar Mote / Estado</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className={panel('flex flex-col sm:flex-row gap-3')}>
        <div className={field.withIcon}>
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

        <div className="flex gap-2">
          {/* Status Filter */}
          <select
            id="history-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={field.select}
          >
            <option value="All">Todos los Estados</option>
            <option value="Capturado">Capturados</option>
            <option value="En Equipo">En Equipo</option>
            <option value="En Caja">En Caja</option>
            <option value="Debilitado">Debilitados</option>
            <option value="Huido">Huidos</option>
          </select>

          {/* Route Filter */}
          <select
            id="history-route-filter"
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
            className={field.select}
          >
            <option value="All">Todas las Rutas</option>
            {uniqueRoutes.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* History Items List */}
      {filteredHistory.length === 0 ? (
        <div className={emptyState.wrapper}>
          <div className={emptyState.bubble}>
            <Compass className="w-7 h-7" />
          </div>
          <h3 className={emptyState.title}>No hay encuentros guardados todavía</h3>
          <p className={emptyState.hint}>
            Selecciona una ruta en la ruleta, genera tu Pokémon aleatorio y haz clic en &quot;Guardar este Encuentro en el Historial&quot;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {filteredHistory.map((item) => {
            const { displayName, types } = parsePokemonName(item.pokemon);
            const { sprite } = getPokemonSprite(item.pokemon);
            const isEditing = editingId === item.id;

            return (
              <div
                key={item.id}
                id={`history-item-${item.id}`}
                className={card({
                  interactive: true,
                  extra: 'relative overflow-hidden flex flex-col justify-between',
                })}
              >
                {/* Header: Route & Date */}
                <div className="flex items-center justify-between text-xs pb-3 border-b border-brand-border">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-brand-txt1">
                    <Compass className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                    <span className="truncate">{translateRouteName(item.routeName)}</span>
                  </span>
                  <span className={cn(text.meta, 'flex items-center gap-1 shrink-0')}>
                    <Calendar className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>

                {/* Content */}
                <div className="py-3 flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => openDetail('pokemon', item.cleanName)}
                    className={cn(
                      // The shiny badge overflows the frame, so this one cannot use
                      // `spriteFrame()` (it clips with `overflow-hidden`).
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
                      className="w-12 h-12 sm:w-14 sm:h-14 object-contain group-hover:scale-110 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = '0.3';
                      }}
                    />
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
                        className={cn(text.cardTitle, 'hover:text-brand-accent-ink truncate cursor-pointer text-left transition-colors')}
                        title={`Ver detalles de ${displayName}`}
                      >
                        {item.nickname ? `${item.nickname} (${displayName})` : displayName}
                      </button>
                      {isStarterEncounter(item) && (
                        <span className={pillSolid('warning')}>
                          ★ Inicial
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className={pill(statusColors[item.status])}>
                        {item.status}
                      </span>
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
                          <option value="Capturado">Capturado</option>
                          <option value="En Equipo">En Equipo</option>
                          <option value="En Caja">En Caja</option>
                          <option value="Debilitado">Debilitado</option>
                          <option value="Huido">Huido</option>
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
                      <Edit3 className="w-3.5 h-3.5" /> Editar
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
