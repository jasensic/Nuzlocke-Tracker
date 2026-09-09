import React, { useState, useRef } from 'react';
import { GameTenant, SavedEncounter } from '../types';
import {
  Gamepad2,
  Check,
  Upload,
  Download,
  Trash2,
  X,
  FileJson,
  Sparkles,
  Info,
  AlertTriangle,
  Plus,
  Compass,
} from 'lucide-react';
import { parseImportedTenantJson } from '../data/tenantRegistry';

interface GameTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenants: GameTenant[];
  activeTenantId: string;
  onSelectTenant: (tenantId: string) => void;
  onAddCustomTenant: (tenant: GameTenant) => void;
  onDeleteCustomTenant: (tenantId: string) => void;
  history: SavedEncounter[];
}

export const GameTenantModal: React.FC<GameTenantModalProps> = ({
  isOpen,
  onClose,
  tenants,
  activeTenantId,
  onSelectTenant,
  onAddCustomTenant,
  onDeleteCustomTenant,
  history,
}) => {
  const [showImportSection, setShowImportSection] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const activeTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0];

  // Handle Export Current Game JSON
  const handleExportCurrent = () => {
    try {
      const exportData = {
        id: activeTenant.id,
        name: activeTenant.name,
        shortName: activeTenant.shortName,
        region: activeTenant.region,
        generation: activeTenant.generation,
        badge: activeTenant.badge,
        description: activeTenant.description,
        routes: activeTenant.routes,
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pokemon-database-${activeTenant.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Error al exportar: ${err.message}`);
    }
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      processJsonImport(content);
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  const processJsonImport = (rawContent: string) => {
    setImportError(null);
    setImportSuccess(null);
    try {
      const newTenant = parseImportedTenantJson(rawContent);
      onAddCustomTenant(newTenant);
      setImportSuccess(
        `¡Mod "${newTenant.name}" importado con éxito! Se cargaron ${newTenant.routes.length} rutas.`
      );
      setJsonText('');
      // Automatically switch to the imported tenant
      onSelectTenant(newTenant.id);
    } catch (err: any) {
      setImportError(err.message || 'Error al procesar el archivo JSON.');
    }
  };

  // Copy sample JSON template
  const handleCopySample = () => {
    const sample = {
      name: 'Mi ROM Hack Personalizado',
      shortName: 'Mi ROM Hack',
      region: 'Kanto / Personalizada',
      generation: 'ROM Hack Custom',
      badge: 'Mod de Usuario',
      description: 'Base de datos para mi run de Nuzlocke',
      routes: [
        {
          id: 'mi-ruta-1',
          name: 'Ruta 1',
          category: 'Ruta',
          encounters: [
            { pokemon: 'Pidgey', chance: 50, levelRange: 'Nv. 2-4', method: 'Visible' },
            { pokemon: 'Rattata', chance: 50, levelRange: 'Nv. 2-4', method: 'Visible' },
          ],
        },
      ],
    };
    navigator.clipboard.writeText(JSON.stringify(sample, null, 2));
    alert('Plantilla JSON de ejemplo copiada al portapapeles.');
  };

  return (
    <div
      id="game-tenant-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="game-tenant-modal"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-500/20">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Selector de Edición & Mods de Pokémon
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cambia entre juegos oficiales y mods de Pokémon, o importa tu propia base de datos de rutas.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Active Game Quick Summary */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-rose-500/10 dark:from-red-950/50 dark:via-slate-800/80 dark:to-rose-950/50 border border-red-200/90 dark:border-red-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                Partida Activa Actualmente
              </span>
              <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                {activeTenant.name}
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300">
                  {activeTenant.region}
                </span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {activeTenant.routes.length} rutas disponibles • {history.length} encuentros registrados
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportCurrent}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 flex items-center gap-1.5 shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Download className="w-4 h-4 text-red-500" />
              <span>Exportar JSON</span>
            </button>
          </div>

          {/* Tenants Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Catálogo de Juegos & Mods Disponibles
              </h4>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                {tenants.length} {tenants.length === 1 ? 'juego' : 'juegos'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {tenants.map((t) => {
                const isCurrent = t.id === activeTenantId;
                return (
                  <div
                    key={t.id}
                    id={`tenant-card-${t.id}`}
                    onClick={() => {
                      if (!isCurrent) {
                        onSelectTenant(t.id);
                        onClose();
                      }
                    }}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between relative group ${
                      isCurrent
                        ? 'bg-red-50/80 dark:bg-red-950/40 border-red-500 dark:border-red-500 shadow-sm ring-1 ring-red-500/30 cursor-default'
                        : 'bg-white dark:bg-slate-800/90 border-slate-200/90 dark:border-slate-700/80 hover:border-red-400 dark:hover:border-red-500 hover:bg-slate-50 dark:hover:bg-slate-700/70 hover:shadow-md cursor-pointer'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-700/80 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600">
                          <Compass className="w-3 h-3 text-red-500" />
                          {t.region}
                        </span>

                        <div className="flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/80">
                            {t.generation}
                          </span>

                          {t.isCustom && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  confirm(
                                    `¿Seguro que deseas eliminar el mod personalizado "${t.name}"?`
                                  )
                                ) {
                                  onDeleteCustomTenant(t.id);
                                }
                              }}
                              className="p-1 rounded-md text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950 transition-colors"
                              title="Eliminar este mod personalizado"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Title & Desc */}
                      <h5 className="font-black text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {t.name}
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>

                      <div className="mt-3 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {t.routes.length} rutas configuradas
                      </div>
                    </div>

                    {/* Activation Button */}
                    <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                      {isCurrent ? (
                        <div className="w-full py-2 px-3 rounded-xl text-xs font-black bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Partida en curso activa</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTenant(t.id);
                            onClose();
                          }}
                          className="w-full py-2.5 px-3 rounded-xl text-xs font-black bg-slate-900 group-hover:bg-red-600 dark:bg-slate-700 dark:group-hover:bg-red-600 dark:border dark:border-slate-600 text-white transition-all shadow-xs active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Gamepad2 className="w-3.5 h-3.5 text-red-400 group-hover:text-white transition-colors" />
                          <span>Cargar Base de Datos</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Import Custom Mod / JSON Database Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Importar Nuevo Mod o ROM Hack (JSON)
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setShowImportSection(!showImportSection)}
                className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
              >
                {showImportSection ? 'Ocultar panel' : 'Abrir importador'}
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              ¿Juegas a otro mod o ROM hack (como Polished Crystal, Blaze Black, Unbound, etc.)? Carga tu archivo JSON de rutas y úsalo con todas las funciones del Nuzlocke.
            </p>

            {showImportSection && (
              <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-700 animate-in fade-in duration-150">
                {/* File picker button */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".json"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold bg-violet-600 hover:bg-violet-700 text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Subir archivo .json
                  </button>

                  <button
                    type="button"
                    onClick={handleCopySample}
                    className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    Copiar Plantilla JSON de Ejemplo
                  </button>
                </div>

                {/* Paste Textarea */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                    O pega el código JSON aquí directamente:
                  </label>
                  <textarea
                    rows={4}
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    placeholder='{"name": "Mi ROM Hack", "region": "Kanto", "routes": [...] }'
                    className="w-full p-3 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>

                {/* Submit button for pasted text */}
                {jsonText.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={() => processJsonImport(jsonText)}
                    className="px-4 py-2 rounded-xl text-xs font-black bg-slate-900 hover:bg-violet-600 dark:bg-slate-700 dark:hover:bg-violet-600 text-white transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Procesar y Guardar Mod
                  </button>
                )}

                {/* Feedback Alerts */}
                {importError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                    <span>{importError}</span>
                  </div>
                )}

                {importSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                    <span>{importSuccess}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white transition-colors shadow-2xs"
          >
            Listo / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
