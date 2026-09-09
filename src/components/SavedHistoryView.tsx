import React, { useState } from 'react';
import { SavedEncounter } from '../types';
import { parsePokemonName, TYPE_COLORS, getPokemonSprite } from '../utils/pokemonMeta';
import { translateRouteName } from '../data/routeTranslations';
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
} from 'lucide-react';

interface SavedHistoryViewProps {
  history: SavedEncounter[];
  onUpdate: (id: string, updates: Partial<SavedEncounter>) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export const SavedHistoryView: React.FC<SavedHistoryViewProps> = ({
  history,
  onUpdate,
  onDelete,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [routeFilter, setRouteFilter] = useState<string>('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<SavedEncounter['status']>('Capturado');
  const [editNickname, setEditNickname] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

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

  const statusColors: Record<SavedEncounter['status'], string> = {
    Capturado: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'En Equipo': 'bg-indigo-100 text-indigo-800 border-indigo-300',
    'En Caja': 'bg-blue-100 text-blue-800 border-blue-300',
    Debilitado: 'bg-rose-100 text-rose-800 border-rose-300',
    Huido: 'bg-amber-100 text-amber-800 border-amber-300',
  };

  // Metric stats
  const totalCount = history.length;
  const caughtCount = history.filter((h) => h.status === 'Capturado' || h.status === 'En Equipo' || h.status === 'En Caja').length;
  const shinyCount = history.filter((h) => h.isShiny).length;
  const routesCount = uniqueRoutes.length;

  return (
    <div id="saved-history-view" className="space-y-6">
      {/* Top Header & Stats */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Compass className="w-5 h-5 text-red-500" />
              Bitácora de Encuentros Guardados
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Registro histórico de tus Pokémon elegidos por ruta en esta partida.
            </p>
          </div>

          {/* Action buttons: Export & Clear */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="export-csv-button"
              type="button"
              onClick={exportCSV}
              disabled={history.length === 0}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
              title="Descargar tabla en CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Exportar CSV
            </button>
            <button
              id="export-json-button"
              type="button"
              onClick={exportJSON}
              disabled={history.length === 0}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
              title="Descargar copia de seguridad en JSON"
            >
              <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              JSON
            </button>
            {history.length > 0 && (
              showClearConfirm ? (
                <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 px-2.5 py-1 rounded-xl text-xs">
                  <span className="font-bold text-rose-700 dark:text-rose-300">¿Vaciar?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClearAll();
                      setShowClearConfirm(false);
                    }}
                    className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors"
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2 py-0.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  id="clear-all-history-button"
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Vaciar
                </button>
              )
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Encuentros Totales</span>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-0.5">{totalCount}</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Capturados / Vivos</span>
            <p className="text-2xl font-black text-emerald-800 dark:text-emerald-300 mt-0.5">{caughtCount}</p>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
            <span className="text-xs text-indigo-700 dark:text-indigo-400 font-medium">Rutas Exploradas</span>
            <p className="text-2xl font-black text-indigo-800 dark:text-indigo-300 mt-0.5">{routesCount}</p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40">
            <span className="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Variocolor (Shinies)
            </span>
            <p className="text-2xl font-black text-amber-800 dark:text-amber-300 mt-0.5">{shinyCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 transition-colors">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="history-search-input"
            type="text"
            placeholder="Buscar por Pokémon o mote..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-red-500/20 font-medium"
          />
        </div>

        <div className="flex gap-2">
          {/* Status Filter */}
          <select
            id="history-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
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
            className="py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200/90 dark:border-slate-800 text-center space-y-3 transition-colors">
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No hay encuentros guardados todavía</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Selecciona una ruta en la ruleta, genera tu Pokémon aleatorio y haz clic en &quot;Guardar este Encuentro en el Historial&quot;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHistory.map((item) => {
            const { displayName, types } = parsePokemonName(item.pokemon);
            const { sprite } = getPokemonSprite(item.pokemon);
            const isEditing = editingId === item.id;

            return (
              <div
                key={item.id}
                id={`history-item-${item.id}`}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between"
              >
                {/* Header: Route & Date */}
                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-red-500" />
                    {translateRouteName(item.routeName)}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>

                {/* Content */}
                <div className="py-3 flex items-start gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-750 flex items-center justify-center p-1 relative flex-shrink-0">
                    <img
                      src={sprite}
                      alt={displayName}
                      className="w-14 h-14 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = '0.3';
                      }}
                    />
                    {item.isShiny && (
                      <span className="absolute -top-1 -right-1 p-0.5 bg-amber-400 rounded-full text-amber-950">
                        <Sparkles className="w-3 h-3 fill-amber-950" />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
                        {item.nickname ? `${item.nickname} (${displayName})` : displayName}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                          statusColors[item.status]
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {item.method} • {item.chance}%
                      </span>
                      {item.levelRange && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          {item.levelRange}
                        </span>
                      )}
                    </div>

                    {item.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-800/70 p-2 rounded-xl italic border border-slate-100 dark:border-slate-750">
                        &ldquo;{item.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Inline Editing Form if active */}
                {isEditing && (
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Mote</label>
                        <input
                          type="text"
                          value={editNickname}
                          onChange={(e) => setEditNickname(e.target.value)}
                          className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Estado</label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as SavedEncounter['status'])}
                          className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg"
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
                      <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Notas</label>
                      <input
                        type="text"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg"
                      />
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md font-medium"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(item.id)}
                        className="px-3 py-1 bg-emerald-600 text-white font-semibold rounded-md flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Guardar
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer action buttons */}
                {!isEditing && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(item)}
                      className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Editar
                    </button>
                    {confirmDeleteId === item.id ? (
                      <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 px-2 py-1 rounded-xl">
                        <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300">¿Eliminar?</span>
                        <button
                          type="button"
                          onClick={() => {
                            onDelete(item.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-md transition-colors"
                        >
                          Sí
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-0.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-[11px] rounded-md border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="px-2.5 py-1 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg font-medium flex items-center gap-1 transition-colors"
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
